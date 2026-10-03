import asyncio
import json
from forecaster import run_statsforecast_7days

async def main():
    print("Iniciando prueba de StatsForecast...")
    res = await run_statsforecast_7days("2026-09-20")
    print("Motor:", res["motor"])
    print("Modelo Principal:", res["modelo_principal"])
    print("Base Date:", res["base_date"])
    print("Total Semana:", res["total_atenciones_semana"])
    print("Proyecciones Generadas:", len(res["proyecciones"]))
    print("-" * 80)
    for p in res["proyecciones"]:
        print(f"Fecha: {p['fecha_predicha']} ({p['tagTipoJornada']}) -> yhat={p['yhat']} pac. [Rango IC90%: {p['limite_inferior']} - {p['limite_superior']}] | Alta Compl C1-C3: {p['alta_complejidad_total']} | Horas Med: {p['horasMedicasRequeridas']} | Clima: {p['tagClima']}")
    print("-" * 80)
    print("Alerta Cognitiva:")
    print(res["alertaCognitiva"])

if __name__ == "__main__":
    asyncio.run(main())
