"""
forecaster.py
Motor Probabilístico de Pronóstico Asistencial con Nixtla StatsForecast (AutoARIMA / AutoETS).

Modelado:
  - Estacionalidad: season_length = 7 (ciclos semanales diarios)
  - Intervalos de Predicción al 90% (lo-90 y hi-90)
  - Incorporación de covariables exógenas:
      * es_feriado (Feriados oficiales Chile holidays.CL())
      * temp_min_lag48 (Temperatura mínima hace 48 horas)
      * precip_lag72 (Precipitación acumulada hace 72 horas)
  - Desglose asistencial SAR:
      * Turnos Diurno vs Nocturno
      * Triage Manchester C1-C5
      * Horas Médicas Requeridas (3.8 pac/hora)
"""

import math
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from datetime import datetime, date
import holidays

from statsforecast import StatsForecast
from statsforecast.models import AutoARIMA, AutoETS

from data_processor import prepare_training_and_future_datasets, get_chile_holidays


# Cache global en memoria para respuesta instantánea (< 50ms)
_CACHED_FORECAST: Dict[str, Any] = {}
_LAST_BASE_DATE: Optional[str] = None


def generate_hourly_curve(is_weekend_or_holiday: bool, total_pacientes: int) -> List[Dict[str, Any]]:
    """
    Genera la curva horaria de afluencia asistencial intradía (Regla de oro SAR).
    """
    if is_weekend_or_holiday:
        # 24 horas fin de semana / festivo (00:00 a 23:00)
        weights = [
            0.02, 0.02, 0.015, 0.01, 0.01, 0.01, 0.01, 0.015,  # 00:00 a 07:00
            0.04, 0.06, 0.08, 0.095, 0.095, 0.07, 0.05, 0.05,  # 08:00 a 15:00
            0.05, 0.06, 0.08, 0.08, 0.06, 0.05, 0.04, 0.03     # 16:00 a 23:00
        ]
        return [
            {
                "hora": f"{str(h).padStart if hasattr(str(h), 'padStart') else f'{h:02d}'}:00",
                "pacientes": max(1, round(total_pacientes * weights[h])),
                "isPeak": h in (11, 12, 18, 19)
            }
            for h in range(24)
        ]
    else:
        # Turno Largo Semana Hábil (17:00 a 07:00 hrs del día siguiente)
        hours = [17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7]
        weights_by_hour = {
            17: 0.05, 18: 0.10, 19: 0.15, 20: 0.17, 21: 0.15, 22: 0.11, 23: 0.08,
            0: 0.06, 1: 0.04, 2: 0.03, 3: 0.02, 4: 0.01, 5: 0.01, 6: 0.01, 7: 0.01
        }
        return [
            {
                "hora": f"{h:02d}:00",
                "pacientes": max(1, round(total_pacientes * weights_by_hour.get(h, 0.02))),
                "isPeak": h in (19, 20, 21)
            }
            for h in hours
        ]


def build_weather_reasoning(
    temp_min: float,
    precip: float,
    temp_min_lag48: float,
    precip_lag72: float
) -> Dict[str, Any]:
    """
    Construye la explicación cognitiva y multiplicador según las condiciones
    meteorológicas y sus retardos (lags) de incubación.
    """
    tag = "Normal"
    multiplier = 1.0
    reason = "Condiciones meteorológicas estables. Flujo asistencial habitual."

    if precip > 2.0:
        multiplier = 0.85
        tag = f"🌧️ Lluvia {precip:.1f}mm (-15%)"
        reason = f"Día de lluvia ({precip:.1f}mm): Desaceleración transitoria (-15%) por aplazamiento de consultas ambulatorias no graves."
    elif precip_lag72 > 2.0:
        multiplier = 1.28
        if temp_min < 3.0:
            multiplier = 1.38
            tag = f"🧊 Helada Post-Lluvia ({temp_min:.1f}°C) (+38%)"
            reason = f"Rebote Post-Lluvia (72h lag: {precip_lag72:.1f}mm) + Frío intenso ({temp_min:.1f}°C): Fuerte sobrecarga (+38%) por acumulación y cuadros bronquiales obstructivos."
        else:
            tag = "⚠️ Rebote Post-Lluvia (+28%)"
            reason = f"Rebote Post-Lluvia (72h lag: {precip_lag72:.1f}mm): Incremento del +28% por atenciones postergadas y humedad residual."
    elif temp_min < 3.0 or temp_min_lag48 < 3.0:
        multiplier = 1.16
        tag = f"❄️ Frío / Helada ({temp_min:.1f}°C)"
        reason = f"Baja temperatura ({temp_min:.1f}°C, lag 48h: {temp_min_lag48:.1f}°C): Alza del +16% en síntomas respiratorios y descompensación cardiovascular."

    return {
        "tagClima": tag,
        "weatherReason": reason,
        "weatherMultiplier": multiplier
    }


async def run_statsforecast_7days(
    base_date_str: Optional[str] = None,
    preferred_model: str = "AutoARIMA",
    use_cache: bool = True
) -> Dict[str, Any]:
    """
    Entrena el modelo AutoARIMA / AutoETS de StatsForecast con season_length=7,
    genera pronóstico a 7 días con intervalos al 90% (lo-90, hi-90) y
    retorna el JSON enriquecido conforme a la arquitectura MÉTRICO.
    """
    global _CACHED_FORECAST, _LAST_BASE_DATE

    cache_key = f"{base_date_str or 'latest'}_{preferred_model}"
    if use_cache and cache_key in _CACHED_FORECAST:
        return _CACHED_FORECAST[cache_key]

    # 1. Preparar datos con Ingesta y Feature Engineering (Nixtla standard)
    train_df, future_x, weather_fc = await prepare_training_and_future_datasets(
        base_date_str=base_date_str,
        horizon=7
    )

    cl_holidays = get_chile_holidays([2024, 2025, 2026, 2027])

    # 2. Configurar modelos StatsForecast
    # AutoARIMA con estacionalidad semanal (season_length=7) y covariables exógenas
    # AutoETS con estacionalidad semanal (season_length=7)
    models = [
        AutoARIMA(season_length=7),
        AutoETS(season_length=7)
    ]

    sf = StatsForecast(models=models, freq="D", n_jobs=1)

    # Entrenar modelo
    cols_train = ["unique_id", "ds", "y", "es_feriado", "temp_min_lag48", "precip_lag72"]
    sf.fit(train_df[cols_train])

    # 3. Pronosticar a 7 días con Intervalos al 90%
    fcst_df = sf.predict(h=7, level=[90], X_df=future_x)

    # 4. Formatear y Enriquecer Resultados
    proyecciones: List[Dict[str, Any]] = []

    model_col = "AutoARIMA" if preferred_model == "AutoARIMA" and "AutoARIMA" in fcst_df.columns else "AutoETS"
    lo_col = f"{model_col}-lo-90"
    hi_col = f"{model_col}-hi-90"

    total_semana_est = 0
    max_dia_item = None
    rebote_dia_item = None

    for idx, row in fcst_df.iterrows():
        fdt = pd.to_datetime(row["ds"])
        fecha_str = fdt.strftime("%Y-%m-%d")
        day_of_week = fdt.weekday()  # 0=Lunes, 6=Domingo
        is_weekend = day_of_week in (5, 6)  # Sábado o Domingo
        is_official_holiday = fdt.date() in cl_holidays
        is_finde_o_feriado = is_weekend or is_official_holiday

        # Valores base de StatsForecast
        yhat_raw = float(row[model_col])
        lo_90_raw = float(row[lo_col]) if lo_col in fcst_df.columns else yhat_raw * 0.78
        hi_90_raw = float(row[hi_col]) if hi_col in fcst_df.columns else yhat_raw * 1.22

        # Clima del día
        w_match = weather_fc[weather_fc["fecha"] == fecha_str]
        if not w_match.empty:
            w_info = w_match.iloc[0].to_dict()
        else:
            w_info = {"tempMin": 7.0, "tempMax": 18.0, "precipitacionMm": 0.0, "temp_min_lag48": 7.0, "precip_lag72": 0.0}

        # Explicación cognitiva meteorológica
        clim_expl = build_weather_reasoning(
            temp_min=w_info.get("tempMin", 7.0),
            precip=w_info.get("precipitacionMm", 0.0),
            temp_min_lag48=w_info.get("temp_min_lag48", 7.0),
            precip_lag72=w_info.get("precip_lag72", 0.0)
        )

        yhat = max(10, round(yhat_raw))
        lo_90 = max(5, round(lo_90_raw))
        hi_90 = max(yhat + 2, round(hi_90_raw))

        total_semana_est += yhat

        # Desglose Operativo SAR
        if is_finde_o_feriado:
            tipo_jornada = "FINDE_FERIADO"
            tag_jornada = "🎉 Feriado Oficial SAR" if is_official_holiday else "Fin de Semana SAR"
            esquema_turno = "Fin de Semana / Festivo (08:00 a 20:00 y 20:00 a 08:00)"
            atenciones_diurno = round(yhat * 0.72)
            atenciones_nocturno = max(0, yhat - atenciones_diurno)
            lo_diurno = round(lo_90 * 0.72)
            hi_diurno = round(hi_90 * 0.72)
            lo_nocturno = round(lo_90 * 0.28)
            hi_nocturno = round(hi_90 * 0.28)
        else:
            tipo_jornada = "HABIL"
            tag_jornada = "Día Hábil SAR"
            esquema_turno = "Turno Largo Semana (17:00 a 08:00)"
            atenciones_diurno = 0
            atenciones_nocturno = yhat
            lo_diurno = 0
            hi_diurno = 0
            lo_nocturno = lo_90
            hi_nocturno = hi_90

        # Triage Manchester
        c1_c2 = max(1, round(yhat * 0.04))
        c3 = round(yhat * 0.49)
        alta_complejidad = c1_c2 + c3
        c4_c5 = max(0, yhat - alta_complejidad)
        alerta_alta_complejidad = alta_complejidad >= 45

        # Horas Médicas Requeridas (Rendimiento estándar SAR: 3.8 pac/hora)
        horas_medicas = round(yhat / 3.8, 1)
        horas_medicas_min = round(lo_90 / 3.8, 1)
        horas_medicas_max = round(hi_90 / 3.8, 1)

        # Curva horaria intradía
        curva_horaria = generate_hourly_curve(is_finde_o_feriado, yhat)

        item = {
            "fecha_predicha": fecha_str,
            "ds": fecha_str,
            "yhat": yhat,
            "atenciones_estimadas": yhat,
            "limite_inferior": lo_90,
            "limite_superior": hi_90,
            "lo_90": lo_90,
            "hi_90": hi_90,
            "prediction_interval_lower_bound": lo_90,
            "prediction_interval_upper_bound": hi_90,
            "modelo_utilizado": model_col,
            "tipoJornada": tipo_jornada,
            "tagTipoJornada": tag_jornada,
            "isFindeOFeriado": is_finde_o_feriado,
            "esFeriadoOficial": is_official_holiday,
            "esquemaTurno": esquema_turno,
            "atenciones_diurno": atenciones_diurno,
            "atenciones_nocturno": atenciones_nocturno,
            "limite_inferior_diurno": lo_diurno,
            "limite_superior_diurno": hi_diurno,
            "limite_inferior_nocturno": lo_nocturno,
            "limite_superior_nocturno": hi_nocturno,
            "c1_c2_estimados": c1_c2,
            "c3_estimados": c3,
            "alta_complejidad_total": alta_complejidad,
            "c4_c5_estimados": c4_c5,
            "alertaAltaComplejidad": alerta_alta_complejidad,
            "horasMedicasRequeridas": horas_medicas,
            "horasMedicasMin": horas_medicas_min,
            "horasMedicasMax": horas_medicas_max,
            "horas_medicas_necesarias": horas_medicas,
            "horas_medicas_min": horas_medicas_min,
            "horas_medicas_max": horas_medicas_max,
            "curvaHoraria": curva_horaria,
            "tagClima": clim_expl["tagClima"],
            "weatherReason": clim_expl["weatherReason"],
            "weatherMultiplier": clim_expl["weatherMultiplier"],
            "clima": w_info
        }

        proyecciones.append(item)

        if max_dia_item is None or yhat > max_dia_item["atenciones_estimadas"]:
            max_dia_item = item
        if "Rebote" in clim_expl["tagClima"] or "Helada Post" in clim_expl["tagClima"]:
            rebote_dia_item = item

    # Construir Alerta Cognitiva Gerencial
    alerta_cognitiva = (
        f"⚡ Radar Predictivo StatsForecast Nixtla ({model_col} - Estacionalidad Semanal s=7).\n"
    )
    if rebote_dia_item:
        alerta_cognitiva += (
            f"⚠️ Alerta de Sobrecarga por Rezagos Meteorológicos: {rebote_dia_item['fecha_predicha']} "
            f"({rebote_dia_item['atenciones_estimadas']} pacientes esperados [IC90%: {rebote_dia_item['limite_inferior']} - {rebote_dia_item['limite_superior']}]). "
            f"{rebote_dia_item['weatherReason']} Se prevén {rebote_dia_item['alta_complejidad_total']} casos de alta complejidad (C1-C3). "
            f"Dotación sugerida: {rebote_dia_item['horasMedicasRequeridas']} hrs médicas de urgencia."
        )
    elif max_dia_item:
        alerta_cognitiva += (
            f"Peak semanal proyectado para el {max_dia_item['fecha_predicha']} con {max_dia_item['atenciones_estimadas']} pacientes "
            f"[Rango Esperado IC90%: {max_dia_item['limite_inferior']} - {max_dia_item['limite_superior']} pac.] ({max_dia_item['tagTipoJornada']}). "
            f"Alta complejidad estimada: {max_dia_item['alta_complejidad_total']} casos C1-C3. "
            f"Dotación médica sugerida: {max_dia_item['horasMedicasRequeridas']} horas de box."
        )

    response_payload = {
        "motor": "Nixtla StatsForecast (AutoARIMA / AutoETS)",
        "version": "2.0-microservice",
        "modelo_principal": model_col,
        "estacionalidad": 7,
        "horizonte_dias": 7,
        "confidence_level": 0.90,
        "base_date": train_df["ds"].max().strftime("%Y-%m-%d"),
        "total_atenciones_semana": total_semana_est,
        "alertaCognitiva": alerta_cognitiva,
        "proyecciones": proyecciones
    }

    _CACHED_FORECAST[cache_key] = response_payload
    _LAST_BASE_DATE = response_payload["base_date"]
    return response_payload
