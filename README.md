# Métrico - Dashboard de Gestión Estadística

## 📢 Muro de Novedades (Registro de Cambios)

Aquí documentamos el progreso y las últimas actualizaciones que se le están haciendo al sistema para mantener a todo el equipo informado.

### ✨ [Actualización] - 26 de Junio 2026 - Pautas de Turnos Inteligentes
- **Nuevo Calendario Interactivo:** Se añadió el módulo "Pauta de Turnos" que permite programar mensualmente la distribución de los equipos.
- **Identidad Visual:** Los turnos ahora cuentan con sus respectivos colores para hacer "match" con las planillas físicas originales (Turno 1: Verde, Turno 2: Amarillo, Turno 3: Azul).
- **Días Festivos:** Añadida la opción para marcar manualmente días de semana como "Festivos", adaptando el formato a dos turnos (08-20h y 20-08h).
- **Autocompletado Automático:** El sistema ahora detecta las fechas y horas al subir reportes o llenar formularios e identifica automáticamente qué equipo estaba trabajando.

### ✨ [Actualización] - Junio 2026 - Dashboards y Cargas Masivas
- **Carga de Datos por Excel:** Implementación de subida de reportes mensuales y procesamiento automático.
- **Módulo Sociodemográfico:** Análisis profundo de la demanda desglosada por nacionalidad, género y rangos etarios.
- **Curvas de Demanda:** Gráficos especializados para evaluar los tiempos de categorización y atención en diferentes horarios.
- **Permisos de Administrador:** Se implementó un control de acceso estricto, ocultando apartados sensibles a usuarios locales y habilitándolos solo para Administradores Globales.

---

## 💻 Sobre el Programa

**Métrico** es una aplicación web avanzada creada para digitalizar, procesar y analizar grandes volúmenes de datos estadísticos relacionados con atenciones médicas y tiempos de espera.

Su propósito principal es brindar una herramienta de inteligencia de negocios (BI) que permita cruzar datos (horarios, equipos, categorías de pacientes) para facilitar la toma de decisiones clínicas y operativas en tiempo real.

### Características Principales:
- Visualización de datos mediante gráficos dinámicos (Recharts).
- Análisis de métricas KPIs clave.
- Control de usuarios y roles mediante la nube.
- Sincronización en tiempo real y alta disponibilidad.

### Tecnologías:
- **Frontend:** React + Vite, Tailwind CSS, Lucide React.
- **Backend & Nube:** Google Firebase (Firestore, Authentication, Hosting).

---

## 🚀 Despliegue Local para Desarrolladores

Si deseas ejecutar este proyecto localmente:

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor local
npm run dev

# 3. Compilar para producción
npm run build
```
