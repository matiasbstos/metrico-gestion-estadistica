# Microservicio Predictivo de Demanda Asistencial (MÉTRICO)

Microservicio en Python (FastAPI) que implementa la librería **StatsForecast (Nixtla)** para el pronóstico probabilístico de atenciones en el Servicio de Atención Primaria de Urgencia de Alta Resolutividad (SAR Elsa Romo - Melipilla).

## 🚀 Arquitectura y Componentes
1. **Modelos Estadísticos Nixtla**: `AutoARIMA` y `AutoETS` con estacionalidad semanal (`season_length = 7`).
2. **Intervalos de Predicción al 90%**: Calcula los límites inferior (`lo-90`) y superior (`hi-90`) para modelar escenarios optimistas y pesimistas de dotación médica.
3. **Feriados Chilenos**: Variable binaria `es_feriado` integrada con la librería oficial `holidays.CL()`.
4. **Rezagos Meteorológicos (Open-Meteo)**:
   - `temp_min_lag48`: Temperatura mínima de hace 2 días (48 horas).
   - `precip_lag72`: Lluvia de hace 3 días (72 horas) para modelar la incubación de cuadros respiratorios y el rebote post-lluvia asistencial.

## 🛠️ Instalación y Ejecución

```bash
cd api-predictiva
# Activar entorno virtual
.\venv\Scripts\activate

# Iniciar servidor FastAPI
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

## 📡 Endpoints Disponibles
- **GET `/api/forecast/7days`**: Retorna el pronóstico a 7 días con `yhat`, `limite_inferior` (`lo-90`), `limite_superior` (`hi-90`), desglose por turnos SAR y triaje Manchester.
  - Parámetros opcionales: `base_date` (YYYY-MM-DD), `model` (`AutoARIMA` | `AutoETS`), `refresh` (true | false).
- **GET `/health`**: Estado de salud del servicio y dependencias.
- **GET `/docs`**: Documentación interactiva Swagger UI.
