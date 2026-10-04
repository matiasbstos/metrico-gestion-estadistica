"""
data_processor.py
Módulo de Ingesta y Feature Engineering para el Radar Predictivo (Nixtla StatsForecast).

Estándar Nixtla:
  Columnas requeridas: unique_id, ds, y
  Variables exógenas:
    - es_feriado: Dummy binaria (1 si es feriado oficial en Chile vía holidays.CL(), 0 en caso contrario)
    - temp_min_lag48: Temperatura mínima de hace 2 días (48 horas de rezago)
    - precip_lag72: Precipitación acumulada de hace 3 días (72 horas de rezago)
"""

import os
from pathlib import Path
from datetime import datetime, date, timedelta
from typing import Tuple, Optional, Dict, Any, List
import pandas as pd
import numpy as np
import holidays
import httpx

# Coordenadas geográficas oficiales de Melipilla (SAR Elsa Romo)
MELIPILLA_LAT = -33.6853
MELIPILLA_LON = -71.2163
TIMEZONE = "America/Santiago"
DATA_DIR = Path(__file__).resolve().parent / "data"
CSV_PATH = DATA_DIR / "historical_attendance.csv"


def get_chile_holidays(years: List[int] = None) -> holidays.HolidayBase:
    """
    Retorna el calendario de feriados oficiales de Chile usando holidays.CL().
    """
    if years is None:
        years = [2024, 2025, 2026, 2027]
    return holidays.CL(years=years)


def is_chile_holiday(dt: date, cl_holidays: holidays.HolidayBase) -> int:
    """
    Evalúa si una fecha corresponde a feriado oficial en Chile.
    """
    return 1 if dt in cl_holidays else 0


def load_historical_attendance(csv_file: Optional[Path] = None) -> pd.DataFrame:
    """
    Carga los datos históricos de atenciones en el formato estándar de Nixtla:
    unique_id, ds, y.
    """
    target_path = csv_file or CSV_PATH
    if not target_path.exists():
        raise FileNotFoundError(f"No se encontró el archivo histórico en {target_path}")

    df = pd.read_csv(target_path)
    df["ds"] = pd.to_datetime(df["ds"]).dt.strftime("%Y-%m-%d")
    df["ds"] = pd.to_datetime(df["ds"])
    df["unique_id"] = df["unique_id"].astype(str)
    df["y"] = df["y"].astype(float)
    df = df.sort_values("ds").reset_index(drop=True)
    return df


async def fetch_open_meteo_weather(
    start_date: str,
    end_date: str,
    lat: float = MELIPILLA_LAT,
    lon: float = MELIPILLA_LON
) -> pd.DataFrame:
    """
    Consume la API de Open-Meteo para obtener temperatura mínima y precipitación diaria.
    Soporta fechas pasadas y futuras usando el endpoint de forecast y archive.
    """
    start_dt = datetime.strptime(start_date, "%Y-%m-%d").date()
    end_dt = datetime.strptime(end_date, "%Y-%m-%d").date()
    today = date.today()

    # Si el rango está dentro de los últimos 90 días o en el futuro cercano, forecast funciona directamente
    # Open-Meteo forecast soporta past_days y forecast_days
    diff_days_past = max(0, (today - start_dt).days)
    diff_days_future = max(0, (end_dt - today).days + 1)

    # Si necesitamos más de 90 días hacia atrás, usamos la archive API
    weather_records: List[Dict[str, Any]] = []

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            if diff_days_past > 80:
                # 1. Archivo histórico para fechas antiguas
                archive_url = (
                    f"https://archive-api.open-meteo.com/v1/archive?"
                    f"latitude={lat}&longitude={lon}&start_date={start_date}&end_date={min(end_date, today.strftime('%Y-%m-%d'))}&"
                    f"daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone={TIMEZONE.replace('/', '%2F')}"
                )
                res_archive = await client.get(archive_url)
                if res_archive.status_code == 200:
                    d = res_archive.json().get("daily", {})
                    times = d.get("time", [])
                    tmin = d.get("temperature_2m_min", [])
                    tmax = d.get("temperature_2m_max", [])
                    prec = d.get("precipitation_sum", [])
                    for i, t in enumerate(times):
                        weather_records.append({
                            "ds": t,
                            "temp_min": tmin[i] if i < len(tmin) and tmin[i] is not None else 7.0,
                            "temp_max": tmax[i] if i < len(tmax) and tmax[i] is not None else 18.0,
                            "precipitation": prec[i] if i < len(prec) and prec[i] is not None else 0.0,
                        })

            # 2. Forecast API para los últimos días y la proyección futura
            forecast_past = min(diff_days_past, 14)
            forecast_future = max(7, diff_days_future)
            fc_url = (
                f"https://api.open-meteo.com/v1/forecast?"
                f"latitude={lat}&longitude={lon}&past_days={forecast_past}&forecast_days={forecast_future}&"
                f"daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone={TIMEZONE.replace('/', '%2F')}"
            )
            res_fc = await client.get(fc_url)
            if res_fc.status_code == 200:
                d = res_fc.json().get("daily", {})
                times = d.get("time", [])
                tmin = d.get("temperature_2m_min", [])
                tmax = d.get("temperature_2m_max", [])
                prec = d.get("precipitation_sum", [])
                existing_dates = {r["ds"] for r in weather_records}
                for i, t in enumerate(times):
                    if t not in existing_dates:
                        weather_records.append({
                            "ds": t,
                            "temp_min": tmin[i] if i < len(tmin) and tmin[i] is not None else 7.0,
                            "temp_max": tmax[i] if i < len(tmax) and tmax[i] is not None else 18.0,
                            "precipitation": prec[i] if i < len(prec) and prec[i] is not None else 0.0,
                        })

    except Exception as e:
        print(f"[Open-Meteo] Advertencia: Error consultando API meteorológica: {e}. Usando estimador sintético.")

    if not weather_records:
        # Fallback sintético climático de Melipilla si la red externa no responde
        cur = start_dt
        while cur <= end_dt:
            weather_records.append({
                "ds": cur.strftime("%Y-%m-%d"),
                "temp_min": 6.5,
                "temp_max": 18.0,
                "precipitation": 0.0
            })
            cur += timedelta(days=1)

    w_df = pd.DataFrame(weather_records)
    w_df["ds"] = pd.to_datetime(w_df["ds"])
    w_df = w_df.drop_duplicates(subset=["ds"]).sort_values("ds").reset_index(drop=True)
    return w_df


def compute_climate_lags(weather_df: pd.DataFrame) -> pd.DataFrame:
    """
    Calcula variables exógenas desplazadas (lags):
    - temp_min_lag48: temperatura mínima de hace 2 días (48 horas)
    - precip_lag72: lluvia acumulada de hace 3 días (72 horas)
    Simula matemáticamente el periodo de incubación de cuadros respiratorios y sobrecarga.
    """
    df = weather_df.copy().sort_values("ds").reset_index(drop=True)
    # Lag 48h = shift 2 días
    df["temp_min_lag48"] = df["temp_min"].shift(2)
    # Lag 72h = shift 3 días
    df["precip_lag72"] = df["precipitation"].shift(3)

    # Imputar valores iniciales sin datos previos con la mediana local
    median_temp = df["temp_min"].median() if not df["temp_min"].empty else 7.0
    df["temp_min_lag48"] = df["temp_min_lag48"].fillna(median_temp)
    df["precip_lag72"] = df["precip_lag72"].fillna(0.0)
    return df


async def prepare_training_and_future_datasets(
    base_date_str: Optional[str] = None,
    horizon: int = 7,
    unique_id: str = "SAR_General",
    alerta_hospital: bool = False,
    hospital_alert_days: Optional[List[str]] = None
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Construye los DataFrames completos listos para StatsForecast:
    1) train_df: DataFrame histórico con unique_id, ds, y, es_feriado, temp_min_lag48, precip_lag72, alerta_hospital_melipilla.
    2) future_x_df: DataFrame de covariables exógenas para los próximos 'horizon' días.
    3) weather_forecast_df: Datos climáticos crudos de los próximos 'horizon' días.
    """
    raw_df = load_historical_attendance()
    cl_holidays = get_chile_holidays([2024, 2025, 2026, 2027])

    # Determinar fecha base de corte
    if base_date_str:
        base_dt = pd.to_datetime(base_date_str)
        # Filtrar datos hasta base_dt
        train_base = raw_df[raw_df["ds"] <= base_dt].copy()
        if train_base.empty:
            train_base = raw_df.copy()
            base_dt = train_base["ds"].max()
    else:
        train_base = raw_df.copy()
        base_dt = train_base["ds"].max()

    # Rango de fechas para clima: desde 7 días antes del inicio del dataset hasta horizon días post base_dt
    min_date = (train_base["ds"].min() - timedelta(days=7)).strftime("%Y-%m-%d")
    max_date = (base_dt + timedelta(days=horizon + 3)).strftime("%Y-%m-%d")

    # Consultar clima con Open-Meteo
    weather_df = await fetch_open_meteo_weather(min_date, max_date)
    weather_lags = compute_climate_lags(weather_df)

    # Unir exógenas con train_base
    train_df = pd.merge(
        train_base,
        weather_lags[["ds", "temp_min_lag48", "precip_lag72", "temp_min", "temp_max", "precipitation"]],
        on="ds",
        how="left"
    )

    # Imputar si hay huecos climáticos
    train_df["temp_min_lag48"] = train_df["temp_min_lag48"].fillna(7.0)
    train_df["precip_lag72"] = train_df["precip_lag72"].fillna(0.0)

    # Feature Engineering de Feriados Chilenos
    train_df["es_feriado"] = train_df["ds"].dt.date.apply(lambda d: is_chile_holiday(d, cl_holidays))

    # Variable Exógena de Red Hospitalaria: Saturación Hospital San José de Melipilla (0 por defecto en histórico)
    train_df["alerta_hospital_melipilla"] = 0

    # Construir conjunto de fechas futuras
    future_dates = [base_dt + timedelta(days=i) for i in range(1, horizon + 1)]
    future_x_list = []
    weather_forecast_list = []

    for fdt in future_dates:
        f_str = fdt.strftime("%Y-%m-%d")
        f_date = fdt.date()
        feriado_flag = is_chile_holiday(f_date, cl_holidays)

        # Evaluar si aplica alerta de saturación de hospital para esta fecha
        hospital_flag = 1 if (alerta_hospital or (hospital_alert_days and f_str in hospital_alert_days)) else 0

        # Buscar clima correspondiente
        w_match = weather_lags[weather_lags["ds"].dt.strftime("%Y-%m-%d") == f_str]
        if not w_match.empty:
            w_row = w_match.iloc[0]
            t_lag48 = float(w_row["temp_min_lag48"])
            p_lag72 = float(w_row["precip_lag72"])
            t_min = float(w_row["temp_min"])
            t_max = float(w_row["temp_max"])
            prec = float(w_row["precipitation"])
        else:
            t_lag48 = 6.5
            p_lag72 = 0.0
            t_min = 6.5
            t_max = 18.0
            prec = 0.0

        future_x_list.append({
            "unique_id": unique_id,
            "ds": fdt,
            "es_feriado": feriado_flag,
            "temp_min_lag48": t_lag48,
            "precip_lag72": p_lag72,
            "alerta_hospital_melipilla": hospital_flag
        })

        weather_forecast_list.append({
            "fecha": f_str,
            "tempMin": round(t_min, 1),
            "tempMax": round(t_max, 1),
            "precipitacionMm": round(prec, 1),
            "temp_min_lag48": round(t_lag48, 1),
            "precip_lag72": round(p_lag72, 1),
            "es_feriado": feriado_flag,
            "alerta_hospital_melipilla": hospital_flag
        })

    future_x_df = pd.DataFrame(future_x_list)
    weather_forecast_df = pd.DataFrame(weather_forecast_list)

    return train_df, future_x_df, weather_forecast_df
