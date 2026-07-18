# Métrico - Dashboard de Gestión Estadística

## 📢 Muro de Novedades (Registro de Cambios)

Aquí documentamos el progreso y las últimas actualizaciones que se le están haciendo al sistema para mantener a todo el equipo informado.

### ✨ [Actualización] - 18 de Julio 2026 - Desduplicación Inteligente, Barra de Progreso y Módulo de Rendimiento Clínico
- **Desduplicación por Llave Compuesta (CORRELATIVO + ID):** Implementación de limpieza de registros duplicados y repetidos de forma cruzada contra la base de datos de Firestore para asegurar la consistencia de los totales anuales de atenciones.
- **Barra de Progreso y Contador en Tiempo Real:** Nueva pantalla superpuesta translúcida sobre el modal de subida que indica dinámicamente el progreso porcentual y el conteo exacto de registros cargados en la nube.
- **Modal de Éxito Centrado con Rango de Fechas:** Ventana interactiva y centralizada que detalla las estadísticas exactas de importación (válidos vs duplicados) y el periodo de fechas detectado en el archivo Excel (Fecha Desde/Hasta).
- **Timeouts y Desbloqueo de UI:** Prevención de congelamientos de botones ante excedente de cuota diaria en el plan gratuito de Firebase (`Quota exceeded`) o fallos de red mediante límites de tiempo de espera y alertas amigables dentro del mismo modal.
- **Módulo de Rendimiento Clínico (Gestión de Médicos):** Implementamos una nueva sección (icono `Award`) que permite consultar expedientes de médicos (guardias, horas cubiertas de 12h/15h, atenciones, promedio pac/hora y diagnósticos recurrentes) y auditar la nómina completa de pacientes de cualquier turno con descarga directa a CSV.
- **Glosario de Tiempos de Espera:** Incorporamos un panel explicativo detallado con los umbrales de colores y tooltips interactivos para análisis operativo.
- **Alerta e Irradiación en Altas:** Animación de brillo rojo pulsante y insignia `ALERTA ALTAS >5%` en tarjetas de periodo y anual en el Inicio y Altas Administrativas.
- **Acción de Borrar Filtros:** Botón rápido para restablecer el contexto de fecha y horario al mes actual.

### ✨ [Actualización] - 16 de Julio 2026 - Control de Turnos Completo, Récords YTD Diferenciados y Optimización Operativa
- **Lógica de Conteo Consistente y Turnos Modificados:** El sistema aplica los cortes de turnos y asocia correctamente las atenciones nocturnas y de madrugada.
- **Carga y Recálculo Dinámico:** La gráfica de *Comparación de Equipos* se recalcula al vuelo cuando filtras rangos horarios personalizados.
- **Indicador de Últimos Datos:** La etiqueta en el explorador te muestra la fecha más reciente de carga.
- **Calendario Mensual Interactivo:**
  - Al hacer clic en un día se abre un modal premium con el desglose exacto de atenciones, altas, triajes y ratios.
  - Los récords se diferencian de forma autónoma entre **Semana** y **Fin de Semana/Festivo**.
  - Las alertas se reflejan mediante contornos y fondos iluminados con opacidades (Azul para atenciones, Amarillo para altas, Rojo para doble máximo).
- **Sección de Récords YTD:** Ubicada debajo del panel Global Anual en la pestaña de Inicio, desglosa simétricamente los récords diarios hábiles y de fin de semana para pacientes y altas.
- **Pantalla de Carga Fluida:** Muestra un progreso porcentual y una barra degradada animada durante la sincronización inicial de los datos locales de IndexedDB y Firestore.
- **Resolución del Rol de Administrador Global:** Se eliminaron las condiciones de carrera en recargas y el inicio de sesión como `matias.bustos@cormumel.cl` siempre inicia inmediatamente como **Administrador Global**.

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

## ✍️ Créditos y Propósito
Este sistema ha sido desarrollado a medida para optimizar la cadena de suministro logístico-clínico, priorizando la velocidad de operación, la integridad y seguridad de los datos sensibles, y ofreciendo una experiencia de usuario interactiva y sumamente moderna. Un recurso diseñado para salvar tiempo administrativo y evitar fugas de información.

## 📄 Propiedad y Derechos de Uso
⚠️ **Aviso Importante**: Este repositorio y todo su código fuente son de propiedad exclusiva y uso restringido (Código Cerrado / Proprietary).

El código expuesto aquí tiene como único propósito mostrar el avance y el trabajo en desarrollo del proyecto. NO está permitido su copia, distribución, modificación, ni uso comercial o personal sin la autorización expresa de los autores. Todos los derechos reservados.
