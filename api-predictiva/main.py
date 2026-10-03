"""
main.py
Microservicio Predictivo de Demanda Asistencial en FastAPI.
Desarrollado para MÉTRICO (SAR Elsa Romo - Melipilla).

Motor: Nixtla StatsForecast (AutoARIMA / AutoETS) con covariables exógenas:
  - Feriados chilenos (holidays.CL())
  - Rezagos climáticos Open-Meteo (temp_min_lag48, precip_lag72)
  - Intervalos de predicción al 90% (lo-90, hi-90)
"""

import os
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from forecaster import run_statsforecast_7days

app = FastAPI(
    title="MÉTRICO - Microservicio Predictivo StatsForecast (Nixtla)",
    description=(
        "API REST para el Radar Predictivo de Demanda Asistencial de Urgencias SAR. "
        "Modela la estacionalidad semanal (s=7), feriados chilenos e incubación climática "
        "con intervalos de predicción probabilísticos al 90%."
    ),
    version="2.0.0"
)

# Habilitar CORS para permitir consultas desde React (Vite dev en localhost:5173 o hosting)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ForecastCustomRequest(BaseModel):
    base_date: Optional[str] = None
    model: Optional[str] = "AutoARIMA"
    confidence_level: Optional[float] = 0.90
    history: Optional[List[Dict[str, Any]]] = None


@app.get("/")
def read_root():
    return {
        "sistema": "MÉTRICO Urgencias SAR",
        "servicio": "Microservicio Radar Predictivo Nixtla StatsForecast",
        "version": "2.0.0",
        "estado": "operativo",
        "endpoints": {
            "prediccion_7_dias": "/api/forecast/7days",
            "health_check": "/health",
            "documentacion": "/docs"
        }
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "motor": "StatsForecast (AutoARIMA/AutoETS)",
        "framework": "FastAPI",
        "exogenas": ["holidays.CL()", "temp_min_lag48", "precip_lag72"]
    }


@app.get("/api/forecast/7days")
async def get_forecast_7days(
    base_date: Optional[str] = Query(None, description="Fecha base de corte YYYY-MM-DD. Si se omite, usa la fecha más reciente."),
    model: Optional[str] = Query("AutoARIMA", description="Modelo a evaluar: AutoARIMA o AutoETS"),
    refresh: Optional[bool] = Query(False, description="Forzar re-entrenamiento y bypass de caché")
):
    """
    Endpoint principal para el Radar de React.
    Devuelve la predicción a 7 días con la estimación central (yhat) y los límites
    superior e inferior al 90% de confianza (lo-90 y hi-90) conforme al estándar Nixtla.
    """
    try:
        resultado = await run_statsforecast_7days(
            base_date_str=base_date,
            preferred_model=model,
            use_cache=not refresh
        )
        return resultado
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error en la ejecución del pronóstico StatsForecast: {str(e)}"
        )


@app.post("/api/forecast/7days")
async def post_forecast_7days(
    payload: ForecastCustomRequest = Body(...)
):
    """
    Endpoint POST para soporte avanzado de parámetros o datos dinámicos.
    """
    try:
        resultado = await run_statsforecast_7days(
            base_date_str=payload.base_date,
            preferred_model=payload.model or "AutoARIMA",
            use_cache=True
        )
        return resultado
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error procesando pronóstico personalizado: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    # Puerto 8000 por defecto para microservicios de analítica en desarrollo local
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
