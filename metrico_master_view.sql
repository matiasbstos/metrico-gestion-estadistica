-- ====================================================================================
-- PROYECTO: MÉTRICO Clínico Predictivo - SAR Elsa Romo Aravena
-- SCRIPT SQL: VISTA MAESTRA Y ÚNICA FUENTE DE VERDAD (SINGLE SOURCE OF TRUTH)
-- TABLA ORIGEN: metrico_analytics.pacientes_urgencia_raw_latest
-- VISTA MAESTRA: metrico_analytics.v_pacientes_urgencia_master
-- FECHA DE CREACIÓN: 2026-08-09
-- AUTOR: Equipo de Arquitectura de Datos MÉTRICO & Google DeepMind
-- ====================================================================================
-- PROPÓSITO:
-- Trasladar el 100% de la lógica de negocio, sanitización, desduplicación, banderas
-- clínicas, clasificación epidemiológica y cálculo de KPIs operacionales desde el 
-- frontend (React) hacia Google BigQuery.
-- ====================================================================================

CREATE OR REPLACE VIEW `metrico_analytics.v_pacientes_urgencia_master` AS

WITH 
-- ====================================================================================
-- CTE 1: RAW_EXTRACTED
-- Extracción completa de atributos JSON, sanitización de textos y conversión de tipos
-- ====================================================================================
raw_extracted AS (
  SELECT
    -- Identificadores Primarios
    COALESCE(
      JSON_EXTRACT_SCALAR(data_json, '$.id'),
      JSON_EXTRACT_SCALAR(data_json, '$.docId'),
      CONCAT(JSON_EXTRACT_SCALAR(data_json, '$.tAdmision'), '_', JSON_EXTRACT_SCALAR(data_json, '$.correlativo'))
    ) AS id_paciente,

    -- Correlativo Limpio de Atención
    TRIM(REGEXP_REPLACE(CAST(JSON_EXTRACT_SCALAR(data_json, '$.correlativo') AS STRING), r'\.0$', '')) AS correlativo_raw,

    -- Marcas de Tiempo Nativas (Casteadas desde Milisegundos Unix o Cadenas ISO)
    SAFE.TIMESTAMP_MILLIS(CAST(JSON_EXTRACT_SCALAR(data_json, '$.tAdmision') AS INT64)) AS t_admision,
    SAFE.TIMESTAMP_MILLIS(CAST(JSON_EXTRACT_SCALAR(data_json, '$.tAlta') AS INT64)) AS t_alta,
    SAFE.TIMESTAMP_MILLIS(CAST(JSON_EXTRACT_SCALAR(data_json, '$.tCat1') AS INT64)) AS t_cat1,
    SAFE.TIMESTAMP_MILLIS(CAST(JSON_EXTRACT_SCALAR(data_json, '$.tCatUlt') AS INT64)) AS t_cat_ult,
    SAFE.TIMESTAMP_MILLIS(CAST(JSON_EXTRACT_SCALAR(data_json, '$.tAnamnesis') AS INT64)) AS t_anamnesis,

    -- Datos Demográficos & Filiación
    SAFE_CAST(JSON_EXTRACT_SCALAR(data_json, '$.edad') AS INT64) AS edad,
    UPPER(TRIM(COALESCE(JSON_EXTRACT_SCALAR(data_json, '$.sexo'), 'SIN ESPECIFICAR'))) AS sexo,
    UPPER(TRIM(COALESCE(JSON_EXTRACT_SCALAR(data_json, '$.comuna'), 'MELIPILLA'))) AS comuna,
    UPPER(TRIM(COALESCE(JSON_EXTRACT_SCALAR(data_json, '$.prevision'), 'FONASA'))) AS prevision,

    -- Atributos Clínicos & Diagnósticos
    UPPER(TRIM(COALESCE(JSON_EXTRACT_SCALAR(data_json, '$.categoria'), 'C5'))) AS categoria_triage,
    UPPER(TRIM(COALESCE(JSON_EXTRACT_SCALAR(data_json, '$.codigoDiagnostico'), ''))) AS codigo_diagnostico_cie10,
    UPPER(TRIM(COALESCE(JSON_EXTRACT_SCALAR(data_json, '$.diagnosticoPrincipal'), JSON_EXTRACT_SCALAR(data_json, '$.diagnostico'), 'SIN REGISTRO DIAGNÓSTICO'))) AS diagnostico_principal,
    
    -- Atributos Operativos & Egresos
    UPPER(TRIM(COALESCE(JSON_EXTRACT_SCALAR(data_json, '$.destinoAlta'), JSON_EXTRACT_SCALAR(data_json, '$.destino'), 'DOMICILIO'))) AS destino_alta,
    UPPER(TRIM(COALESCE(JSON_EXTRACT_SCALAR(data_json, '$.estado'), 'Finalizada'))) AS estado_atencion,
    UPPER(TRIM(COALESCE(JSON_EXTRACT_SCALAR(data_json, '$.observacion'), JSON_EXTRACT_SCALAR(data_json, '$.obs'), ''))) AS observacion,

    -- Personal de Salud Asignado
    TRIM(COALESCE(JSON_EXTRACT_SCALAR(data_json, '$.medico'), JSON_EXTRACT_SCALAR(data_json, '$.profesional'), '')) AS medico_tratante,
    TRIM(COALESCE(JSON_EXTRACT_SCALAR(data_json, '$.enf1'), JSON_EXTRACT_SCALAR(data_json, '$.enfermero'), '')) AS enfermero_categorizador,

    -- Metadatos de Lote y Carga
    JSON_EXTRACT_SCALAR(data_json, '$.loteId') AS lote_id,
    JSON_EXTRACT_SCALAR(data_json, '$.cargaId') AS carga_id

  FROM `metrico_analytics.pacientes_urgencia_raw_latest`
  WHERE JSON_EXTRACT_SCALAR(data_json, '$.tAdmision') IS NOT NULL
),

-- ====================================================================================
-- CTE 2: SHIFT_CALCULATED
-- Replicación exacta de la función obtenerTurnoDetallado para encuadre horario
-- ====================================================================================
shift_calculated AS (
  SELECT
    r.*,
    
    -- Extraer componentes locales de fecha y hora
    EXTRACT(DATE FROM r.t_admision AT TIME ZONE 'America/Santiago') AS fecha_calendario,
    EXTRACT(HOUR FROM r.t_admision AT TIME ZONE 'America/Santiago') AS hora_admision,
    EXTRACT(DAYOFWEEK FROM r.t_admision AT TIME ZONE 'America/Santiago') AS dia_semana_num, -- 1=Domingo, 7=Sábado

    -- Determinar Fecha Oficial de Turno Asistencial:
    -- Si la atención ocurrió entre las 00:00 y las 07:59 hrs, pertenece al Turno Largo/Noche del día anterior.
    CASE 
      WHEN EXTRACT(HOUR FROM r.t_admision AT TIME ZONE 'America/Santiago') < 8 
        THEN DATE_SUB(EXTRACT(DATE FROM r.t_admision AT TIME ZONE 'America/Santiago'), INTERVAL 1 DAY)
      ELSE EXTRACT(DATE FROM r.t_admision AT TIME ZONE 'America/Santiago')
    END AS fecha_turno,

    -- Determinar Número de Turno Asistencial:
    -- Turno 1 (Día): 08:00 a 16:59 hrs | Turno 2 (Noche/Largo): 17:00 a 07:59 hrs del día siguiente
    CASE 
      WHEN EXTRACT(HOUR FROM r.t_admision AT TIME ZONE 'America/Santiago') >= 8 
       AND EXTRACT(HOUR FROM r.t_admision AT TIME ZONE 'America/Santiago') < 17 
        THEN 1 -- Turno Día
      ELSE 2   -- Turno Noche / Largo
    END AS turno_num,

    -- Clasificación de Rotativa Asistencial
    CASE
      WHEN EXTRACT(DAYOFWEEK FROM r.t_admision AT TIME ZONE 'America/Santiago') IN (1, 7) THEN
        CASE 
          WHEN EXTRACT(HOUR FROM r.t_admision AT TIME ZONE 'America/Santiago') >= 8 
           AND EXTRACT(HOUR FROM r.t_admision AT TIME ZONE 'America/Santiago') < 20 THEN 'Turno Día Fin de Semana (08:00 a 20:00 hrs)'
          ELSE 'Turno Noche Fin de Semana (20:00 a 08:00 hrs)'
        END
      ELSE 'Turno Largo Semana (17:00 a 08:00 hrs)'
    END AS rotativa_nombre,

    -- Flag Fin de Semana / Festivo
    (EXTRACT(DAYOFWEEK FROM r.t_admision AT TIME ZONE 'America/Santiago') IN (1, 7)) AS es_fin_de_semana

  FROM raw_extracted r
),

-- ====================================================================================
-- CTE 3: DEDUPLICATED
-- Motor de Desduplicación Inteligente particionando por correlativo y turno calculado
-- ====================================================================================
deduplicated AS (
  SELECT
    s.*,
    ROW_NUMBER() OVER (
      PARTITION BY s.correlativo_raw, s.fecha_turno, s.turno_num 
      ORDER BY s.t_admision DESC, s.id_paciente DESC
    ) AS row_num
  FROM shift_calculated s
),

-- ====================================================================================
-- CTE 4: MASTER_ENRICHED
-- Filtrado de duplicados y construcción de todas las banderas clínicas y KPIs de tiempo
-- ====================================================================================
master_enriched AS (
  SELECT
    d.id_paciente,
    d.correlativo_raw AS correlativo,
    d.t_admision,
    d.t_alta,
    d.t_cat1,
    d.t_cat_ult,
    d.t_anamnesis,
    d.fecha_calendario,
    d.fecha_turno,
    d.turno_num,
    d.rotativa_nombre,
    d.es_fin_de_semana,
    d.hora_admision,
    d.edad,
    d.sexo,
    d.comuna,
    d.prevision,
    d.categoria_triage,
    d.codigo_diagnostico_cie10,
    d.diagnostico_principal,
    d.destino_alta,
    d.estado_atencion,
    d.observacion,
    d.medico_tratante,
    d.enfermero_categorizador,
    d.lote_id,
    d.carga_id,

    -- ================================================================================
    -- BANDERAS EPIDEMIOLÓGICAS Y CLÍNICAS (CLASIFICACIÓN BOOLEANA)
    -- ================================================================================
    
    -- Flag Fractura Ósea / Traumatología (S02-S92, T02, T08, T10, T12 o Texto explicito)
    (
      REGEXP_CONTAINS(d.codigo_diagnostico_cie10, r'^(S02|S12|S22|S32|S42|S52|S62|S72|S82|S92|T02|T08|T10|T12)')
      OR REGEXP_CONTAINS(d.diagnostico_principal, r'(FRACTURA|\bFX\b|TRAUMATISM)')
    ) AS flag_fractura,

    -- Flag Constatación de Lesiones (Z51.8 o c3_z518)
    (
      d.codigo_diagnostico_cie10 IN ('Z51.8', 'Z518')
      OR d.categoria_triage = 'C3_Z518'
      OR REGEXP_CONTAINS(d.diagnostico_principal, r'(CONSTATAC|LESION)')
    ) AS flag_constatacion_z518,

    -- Rango Etario Oficial de 17 Tramos Quinquenales
    CASE
      WHEN d.edad IS NULL THEN 'Sin Especificar'
      WHEN d.edad BETWEEN 0 AND 4 THEN '0-4'
      WHEN d.edad BETWEEN 5 AND 9 THEN '5-9'
      WHEN d.edad BETWEEN 10 AND 14 THEN '10-14'
      WHEN d.edad BETWEEN 15 AND 19 THEN '15-19'
      WHEN d.edad BETWEEN 20 AND 24 THEN '20-24'
      WHEN d.edad BETWEEN 25 AND 29 THEN '25-29'
      WHEN d.edad BETWEEN 30 AND 34 THEN '30-34'
      WHEN d.edad BETWEEN 35 AND 39 THEN '35-39'
      WHEN d.edad BETWEEN 40 AND 44 THEN '40-44'
      WHEN d.edad BETWEEN 45 AND 49 THEN '45-49'
      WHEN d.edad BETWEEN 50 AND 54 THEN '50-54'
      WHEN d.edad BETWEEN 55 AND 59 THEN '55-59'
      WHEN d.edad BETWEEN 60 AND 64 THEN '60-64'
      WHEN d.edad BETWEEN 65 AND 69 THEN '65-69'
      WHEN d.edad BETWEEN 70 AND 74 THEN '70-74'
      WHEN d.edad BETWEEN 75 AND 79 THEN '75-79'
      ELSE '80+'
    END AS rango_etario_17_tramos,

    -- Tramo Etario Funcional Resumido
    CASE
      WHEN d.edad IS NULL THEN 'Sin Especificar'
      WHEN d.edad <= 14 THEN 'Pediátrico (0-14)'
      WHEN d.edad BETWEEN 15 AND 29 THEN 'Adulto Joven (15-29)'
      WHEN d.edad BETWEEN 30 AND 59 THEN 'Adulto (30-59)'
      ELSE 'Adulto Mayor (60+)'
    END AS tramo_etario_funcional,

    -- ================================================================================
    -- BANDERAS OPERATIVAS (FILTROS DE INTERFAZ Y REGLAS ASISTENCIALES)
    -- ================================================================================

    -- Flag Traslado Hospitalario Estricto (Excluye altas rutinarias a Consultorio/CESFAM/Domicilio)
    (
      (
        REGEXP_CONTAINS(d.destino_alta, r'(HOSP|URGENC|EMERGENC|UEH|SAMU)')
        OR REGEXP_CONTAINS(d.observacion, r'(HOSP|URGENC|EMERGENC|UEH|SAMU|TRASLADO A)')
        OR d.categoria_triage = 'C1'
      )
      AND NOT (
        REGEXP_CONTAINS(d.destino_alta, r'(CONSULTORIO|CESFAM|DOMICILIO)')
        AND NOT REGEXP_CONTAINS(d.destino_alta, r'(HOSP|URGENC|EMERGENC|UEH)')
      )
    ) AS flag_traslado_hospitalario,

    -- Flag Médico Válido
    (
      d.medico_tratante IS NOT NULL
      AND d.medico_tratante != ''
      AND UPPER(TRIM(d.medico_tratante)) NOT IN (
        'NO REGISTRADO', 'NO REGISTRADA', 'SIN ESPECIFICAR', 'SIN REGISTRO', 
        'NO ASIGNADO', 'S/R', 'NO ESPECIFICADO', 'SIN MEDICO', 'SIN MÉDICO', 
        'S/M', '-', 'N/A', 'UNDEFINED', 'NULL'
      )
    ) AS flag_medico_valido,

    -- Flag Alta Administrativa / Retiro Voluntario sin Atención
    (
      d.estado_atencion = 'CANCELADA'
      OR d.destino_alta IN ('ALTA ADMINISTRATIVA', 'RETIRO SIN ATENCIÓN', 'RETIRO')
      OR (
        d.estado_atencion != 'FINALIZADA'
        AND NOT (
          d.medico_tratante IS NOT NULL
          AND d.medico_tratante != ''
          AND UPPER(TRIM(d.medico_tratante)) NOT IN (
            'NO REGISTRADO', 'NO REGISTRADA', 'SIN ESPECIFICAR', 'SIN REGISTRO', 
            'NO ASIGNADO', 'S/R', 'NO ESPECIFICADO', 'SIN MEDICO', 'SIN MÉDICO', 
            'S/M', '-', 'N/A', 'UNDEFINED', 'NULL'
          )
        )
      )
    ) AS flag_alta_administrativa,

    -- Flag Atención Médica Efectiva (Pacientes Atendidos por Profesional)
    NOT (
      d.estado_atencion = 'CANCELADA'
      OR d.destino_alta IN ('ALTA ADMINISTRATIVA', 'RETIRO SIN ATENCIÓN', 'RETIRO')
      OR (
        d.estado_atencion != 'FINALIZADA'
        AND NOT (
          d.medico_tratante IS NOT NULL
          AND d.medico_tratante != ''
          AND UPPER(TRIM(d.medico_tratante)) NOT IN (
            'NO REGISTRADO', 'NO REGISTRADA', 'SIN ESPECIFICAR', 'SIN REGISTRO', 
            'NO ASIGNADO', 'S/R', 'NO ESPECIFICADO', 'SIN MEDICO', 'SIN MÉDICO', 
            'S/M', '-', 'N/A', 'UNDEFINED', 'NULL'
          )
        )
      )
    ) AS flag_atencion_medica_efectiva,

    -- ================================================================================
    -- CÁLCULO DE KPIS DE TIEMPOS ASISTENCIALES (SANIDAD DE DATOS Y EXCLUSIÓN DE ANOMALÍAS)
    -- ================================================================================

    -- Tiempo a Primera Categorización / Triaje (Minutos) - Excluye anomalías > 300 min
    CASE
      WHEN d.t_cat1 IS NOT NULL AND d.t_cat1 >= d.t_admision THEN
        CASE 
          WHEN TIMESTAMP_DIFF(d.t_cat1, d.t_admision, MINUTE) BETWEEN 0 AND 300 
            THEN TIMESTAMP_DIFF(d.t_cat1, d.t_admision, MINUTE)
          ELSE NULL 
        END
      ELSE NULL
    END AS tiempo_triaje_min,

    -- Tiempo de Re-evaluación en Sala de Espera (Minutos) - Excluye anomalías > 300 min
    CASE
      WHEN d.t_cat_ult IS NOT NULL AND d.t_cat1 IS NOT NULL AND d.t_cat_ult >= d.t_cat1 THEN
        CASE 
          WHEN TIMESTAMP_DIFF(d.t_cat_ult, d.t_cat1, MINUTE) BETWEEN 0 AND 300 
            THEN TIMESTAMP_DIFF(d.t_cat_ult, d.t_cat1, MINUTE)
          ELSE NULL 
        END
      ELSE NULL
    END AS tiempo_reevaluacion_min,

    -- Estadía Total Asistencial (Minutos) - Excluye anomalías > 1440 min (24 hrs)
    CASE
      WHEN d.t_alta IS NOT NULL AND d.t_alta >= d.t_admision THEN
        CASE 
          WHEN TIMESTAMP_DIFF(d.t_alta, d.t_admision, MINUTE) BETWEEN 0 AND 1440 
            THEN TIMESTAMP_DIFF(d.t_alta, d.t_admision, MINUTE)
          ELSE NULL 
        END
      ELSE NULL
    END AS estadia_total_min,

    -- Estadía Total Asistencial (Horas Decimales)
    CASE
      WHEN d.t_alta IS NOT NULL AND d.t_alta >= d.t_admision THEN
        CASE 
          WHEN TIMESTAMP_DIFF(d.t_alta, d.t_admision, MINUTE) BETWEEN 0 AND 1440 
            THEN ROUND(TIMESTAMP_DIFF(d.t_alta, d.t_admision, MINUTE) / 60.0, 2)
          ELSE NULL 
        END
      ELSE NULL
    END AS estadia_total_hrs

  FROM deduplicated d
  WHERE d.row_num = 1 -- Retener solo el registro desduplicado válido
)

-- Selección Final de la Vista Maestra
SELECT * FROM master_enriched;
