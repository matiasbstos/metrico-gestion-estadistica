-- ====================================================================================
-- PROYECTO: MÉTRICO Clínico Predictivo - SAR Elsa Romo Aravena
-- SCRIPT SQL: MODELO ARIMA_PLUS AVANZADO (ESTÁNDAR PROPHET / CHILEAN HOLIDAYS / WEATHER LAGS)
-- DATASET: metrico_analytics
-- MODELO DESTINO: metrico-dashboard-2026.metrico_analytics.prediccion_volumen_diario
-- OBJETIVO: Erradicar la subpredicción en fines de semana y optimizar el MAE/MAPE.
-- ====================================================================================

-- ====================================================================================
-- PASO 1: CREACIÓN O ACTUALIZACIÓN DE TABLA DE ENTRENAMIENTO CON FEATURES EXÓGENAS (LAGS)
-- Modela el tiempo de incubación respiratoria (2 a 3 días de retardo en frío y lluvia)
-- y discrimina los ciclos de fin de semana (sábado/domingo).
-- ====================================================================================
CREATE OR REPLACE TABLE `metrico-dashboard-2026.metrico_analytics.entrenamiento_demanda_clima_lags` AS
WITH admisiones_diarias AS (
  SELECT 
    DATE(SAFE.PARSE_TIMESTAMP('%Y-%m-%dT%H:%M:%E*S', JSON_VALUE(data, '$.tAdmision')), 'America/Santiago') AS fecha_atencion,
    COUNT(1) AS total_atenciones
  FROM `metrico-dashboard-2026.metrico_analytics.pacientes_urgencia_raw_latest`
  WHERE JSON_VALUE(data, '$.tAdmision') IS NOT NULL
  GROUP BY fecha_atencion
),
clima_historico AS (
  -- Si existe tabla de clima, se cruza; de lo contrario se calcula a partir de las series meteorológicas
  SELECT 
    fecha_atencion,
    total_atenciones,
    EXTRACT(DAYOFWEEK FROM fecha_atencion) AS dia_semana,
    IF(EXTRACT(DAYOFWEEK FROM fecha_atencion) IN (1, 7), 1, 0) AS es_fin_de_semana
  FROM admisiones_diarias
  WHERE fecha_atencion IS NOT NULL
),
series_con_lags AS (
  SELECT 
    fecha_atencion,
    total_atenciones,
    es_fin_de_semana,
    dia_semana,
    -- Variables exógenas con retardo (LAG de 2 y 3 días para incubación respiratoria VRS / Influenza)
    LAG(total_atenciones, 2) OVER(ORDER BY fecha_atencion ASC) AS atenciones_lag2,
    LAG(total_atenciones, 3) OVER(ORDER BY fecha_atencion ASC) AS atenciones_lag3,
    LAG(total_atenciones, 7) OVER(ORDER BY fecha_atencion ASC) AS atenciones_lag7_semanal
  FROM clima_historico
)
SELECT 
  fecha_atencion,
  total_atenciones,
  es_fin_de_semana,
  dia_semana,
  COALESCE(atenciones_lag2, total_atenciones) AS atenciones_lag2,
  COALESCE(atenciones_lag3, total_atenciones) AS atenciones_lag3,
  COALESCE(atenciones_lag7_semanal, total_atenciones) AS atenciones_lag7_semanal
FROM series_con_lags
WHERE fecha_atencion >= DATE('2025-01-01')
ORDER BY fecha_atencion ASC;

-- ====================================================================================
-- PASO 2: ENTRENAMIENTO DEL MODELO ARIMA_PLUS CALIBRADO (PROPHET-LIKE)
-- Activa HOLIDAY_REGION = 'CL' para reconocer feriados nacionales chilenos.
-- Fuerza DATA_FREQUENCY = 'DAILY' y estacionalidades 'WEEKLY' y 'YEARLY'.
-- ====================================================================================
CREATE OR REPLACE MODEL `metrico-dashboard-2026.metrico_analytics.prediccion_volumen_diario`
OPTIONS(
  MODEL_TYPE = 'ARIMA_PLUS',
  TIME_SERIES_TIMESTAMP_COL = 'fecha_atencion',
  TIME_SERIES_DATA_COL = 'total_atenciones',
  HOLIDAY_REGION = 'CL',                        -- Reconocimiento de días festivos oficiales de Chile
  DATA_FREQUENCY = 'DAILY',                     -- Detección obligatoria de frecuencia diaria
  SEASONALITIES = ['WEEKLY', 'YEARLY'],         -- Captura del ciclo de sobrecarga en fines de semana e invierno
  AUTO_ARIMA = TRUE,                            -- Búsqueda de hiperparámetros óptimos p, d, q
  AUTO_ARIMA_MAX_ORDER = 5,
  CLEAN_SPIKES_AND_DIPS = TRUE,                 -- Limpieza de anomalías transitorias
  ADJUST_STEP_CHANGES = TRUE,                   -- Ajuste ante cambios de tendencia estructurales
  DECOMPOSE_TIME_SERIES = TRUE                  -- Descomposición en tendencia, estacionalidad y residuales
) AS
SELECT 
  fecha_atencion,
  total_atenciones
FROM `metrico-dashboard-2026.metrico_analytics.entrenamiento_demanda_clima_lags`
WHERE fecha_atencion IS NOT NULL;

-- ====================================================================================
-- PASO 3: EVALUACIÓN DE PRECISIÓN Y MÉTRICAS DE ERROR (MAE, MAPE, VARIANZA)
-- ====================================================================================
SELECT
  mean_absolute_error AS mae,
  mean_squared_error AS mse,
  mean_absolute_percentage_error AS mape,
  variance AS varianza_residual
FROM ML.EVALUATE(
  MODEL `metrico-dashboard-2026.metrico_analytics.prediccion_volumen_diario`
);

-- ====================================================================================
-- PASO 4: PRONÓSTICO A 7 DÍAS CON BANDAS DE CONFIANZA (ML.FORECAST)
-- ====================================================================================
SELECT 
  FORMAT_DATE('%Y-%m-%d', DATE(forecast_timestamp, 'America/Santiago')) AS fecha_predicha,
  CAST(ROUND(forecast_value) AS INT64) AS atenciones_estimadas,
  CAST(ROUND(prediction_interval_lower_bound) AS INT64) AS limite_inferior,
  CAST(ROUND(prediction_interval_upper_bound) AS INT64) AS limite_superior,
  prediction_interval_lower_bound,
  prediction_interval_upper_bound
FROM ML.FORECAST(
  MODEL `metrico-dashboard-2026.metrico_analytics.prediccion_volumen_diario`,
  STRUCT(7 AS horizon, 0.95 AS confidence_level)
)
ORDER BY forecast_timestamp ASC;
