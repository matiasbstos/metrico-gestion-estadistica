# Métrico - Dashboard de Gestión Estadística

## 📢 Muro de Novedades (Registro de Cambios)

Aquí documentamos el progreso y las últimas actualizaciones que se le están haciendo al sistema para mantener a todo el equipo informado.

### ✨ [Actualización v2.9.5] - 08 de Agosto 2026 - Auditoría Histórica Sin Restricción de Filtros + PDF 2 Páginas Hoja Carta + Logo CID Inline
- **Desacoplamiento de Filtros UI:** La auditoría consulta la base de datos completa de los últimos 30 días sin verse limitada por el rango de fechas seleccionado en la pantalla.
- **Documento PDF Oficial de 2 Páginas:** Página 1 con Banner institucional, Badge de auditoría y matriz KPI; Página 2 con el desglose consolidado de los 5 sub-reportes asistenciales.
- **Optimización de Logo CID Inline:** Reemplazo del Base64 por adjunto CID, reduciendo el HTML a 4KB y evitando el colapso de mensajes en Gmail.
- **Sanitización de Caracteres en PDF:** Implementación de la función `cleanPdfText` para compilación ultrarrápida sin errores tipográficos.

### ✨ [Actualización v2.9.0] - 08 de Agosto 2026 - Despacho Automático de Correos, Adjunto PDF Hoja Carta & Auditoría de Turnos
- **Despacho de Adjuntos Físicos en PDF (Hoja Carta):** Generación nativa en tiempo real del archivo PDF oficial con todos los sub-reportes seleccionados y tabla de KPIs.
- **Desglose Estricto por Día y Equipo de Turno:** Separación en fin de semana y festivos para el Turno Día (08:00 - 20:00) y Turno Noche (20:00 - 08:00) asignados al Equipo correspondiente (Equipos 1, 2 y 3).
- **Cómputo Inteligente de Tolerancia de Turnos:** Conteo de admisiones de semana desde las 16:00 hrs e inclusión de extensión hasta las 09:00 AM para continuidad de cierre.
- **Prueba Estricta de Completitud (100% Auditado):** Verificación automática que descarta turnos parciales (cortados a medianoche) y busca el último turno con datos 100% cerrados.
- **Incrustación de Identidad Visual SAR Elsa Romo Aravena:** Logo oficial del SAR incrustado en la cabecera superior del correo.
- **Registro en Tiempo Real en el Módulo de Auditoría:** Registro de cada envío manual o automático en el panel de auditoría con fecha, hora, turno, destinatarios y lista de adjuntos.

### ✨ [Actualización v2.8.5] - 07 de Agosto 2026 - Módulo Interactivo de Prueba de Control e Integridad de Datos + Tarjetas Desplegables
- **Agente Epidemiológico IA (Gemini 1.5 Flash):** Diagnóstico de sobrecarga asistencial cruzando clima, BigQuery ML y MINSAL.
- **Rastreador RSS MINSAL Chile:** Detección automática de alertas sanitarias oficiales y campañas invernales.
- **Calidad del Aire Integrada en Vivo:** Pronóstico a 7 días con índices AQI y PM2.5/PM10 por día en Melipilla.
- **Matriz Causa-Efecto de 6 Fuentes:** Informe técnico desplegable en modal con acciones preventivas para urgencias.
- **Análisis de Clima Pasado vs Pacientes:** Detección empírica de rebote asistencial post-lluvia (+28.2%) y heladas (<5°C).

### ✨ [Actualización v2.7.5] - 05 de Agosto 2026 - Mapa Vectorial Interactivo de la Provincia de Melipilla
- **Silueta Vectorial Exclusiva:** Visualización limpia de Melipilla, Curacaví, María Pinto, San Pedro y Alhué.
- **Interactividad Hover & Tooltips:** Resaltado cromático individual con conteo de pacientes y porcentaje de participación.
- **Integración Sociodemográfica:** Muestra desglose comunal directo en el panel de origen y perfil de paciente.

### ✨ [Actualización v2.7.0] - 04 de Agosto 2026 - Rediseño Sociodemográfico y Análisis Demográfico en Inicio
- **Reubicación Estratégica:** Retorno del análisis sociodemográfico al panel principal con tarjetas estilizadas y filtros interactivos.
- **Filtros Dinámicos Cruzados:** Filtros por categoría de triage y comunas de la provincia sobre métricas de sexo, grupos etarios y previsión.

### ✨ [Actualización v2.6.5] - 03 de Agosto 2026 - Isotipo Oficial del SAR & Módulo de Reportes PDF
- **Encabezado Institucional Oficial:** Incorporación del logo oficial del SAR Elsa Romo Aravena para impresiones y exportación de informes clínicos.
- **Plantillas Adaptables:** Plantillas ejecutivas exportables según selección de tipo de reporte específico o consolidado.

### ✨ [Actualización v2.6.0] - 02 de Agosto 2026 - Control de Inactividad & Auditoría de Registro en Firestore
- **Cierre de Sesión Automático:** Modal de advertencia con cuenta regresiva antes del auto-logout por inactividad (15 min).
- **Audit Log en Firestore:** Registro en vivo para trazabilidad de consultas y modificaciones por usuario.

### ✨ [Actualización] - 27 de Julio 2026 - Unificación de Constatación de Lesiones (Z51.8), Módulo Específico e Interacciones Demográficas
- **Unificación de Cifra Real de Constatación de Lesiones (Z51.8):** Sincronización del cálculo dinámico entre el Explorador de Inicio (tarjetas de período y YTD) y los reportes de enfermería/triaje en los **273 casos reales** de la base de pacientes.
- **Nuevo Módulo de Análisis Específico de Constataciones de Lesiones:** Apartado dedicado dentro de *Análisis Específicos* que desglosa cuantitativamente la demanda por Constatación de Lesiones (Z51.8).
- **Matrices Cruzadas e Interacciones Demográficas:** Visualización combinada de Rango Etario vs. Sexo (con minigráficos integrados) y Comuna de Residencia vs. Sexo con filtros locales por género y comuna.
- **Optimizaciones del Pipeline de Datos:** Resolución de la consulta YTD acumulada anual de `useMetricoAnalytics` y conexión directa del sub-módulo al pipeline en tiempo real `pacientesFiltrados`.

### ✨ [Actualización] - 22 de Julio 2026 - KPIs de Enfermería Completos, Diferenciación C3 Avanzada y Ventana de Detalle interactiva
- **KPIs de Enfermería en Reporte Imprimible:** Incorporación de tiempos promedio de respuesta ("T. 1ª Cat" y "T. 2ª Cat") y filas de totales/promedios globales en el pie de la tabla de desempeño para consolidar métricas de todo el establecimiento.
- **Gráficos Comparativos de Doble Eje:** Visualización de barras degradadas de respuesta por enfermero (Top 10) para control de tiempos.
- **Ventana Emergente de Detalle Clínico C3:** Al hacer clic en cualquiera de los Top 10 diagnósticos C3 generales en la tabla, se despliega una bitácora detallada con los pacientes (admisión, diagnóstico, código, enfermero categorizador y turno asociado) en un modal flotante.
- **Identificación Dinámica de Constatación de Lesiones:** Exclusión exhaustiva de constatación de lesiones (basada en códigos Z51.8, Z04, Z04.5 y descriptores textuales como "CIRCUNSTANCIAS LEGALES", "AGRESION", "POLICIAL", etc.) para mantener limpios los reportes clínicos.
- **Detección Flexible y Regla de Adyacencia en Cargas (Excel):** Optimización del importador de datos de Iris ("Informe de tiempos de espera") para emparejar cabeceras dinámicas de profesionales de enfermería por subcadena corta, con fallback automático a la columna adyacente (+1) para el instrumento profesional.

### ✨ [Actualización] - 19 de Julio 2026 - Cuadratura de Turnos Rayen, Sincronización sin Purgar y Criterios Horarios Integrados
- **Cuadratura Horaria Oficial Rayen (16:00 a 08:00 / 09:00):** Ajuste de la regla de holguras para turnos de semana largo (16:00 a 09:00 Lunes a Jueves, y **corte exacto a las 08:00 AM del Sábado para el turno del Viernes** por empalme con fin de semana). Logro de cuadratura perfecta al 100% comparado contra planillas oficiales de Rayen (admitidos, atendidos y altas admin).
- **Tarjetas de Turno Desglosadas en 3 Columnas:** Rediseño completo de las tarjetas de detalle diario para presentar de forma directa y limpia las tres métricas clave: **Admitidos**, **Atendidos** (admitidos menos altas) y **Altas Administrativas** (con porcentaje).
- **Herramienta de Sincronización y Recálculo Automático (sin purgar):** Incorporación del botón "Sincronizar y Recalcular Turnos" en la pestaña de Limpieza de Base de Datos para reconstruir los contadores de la colección `turnos` en Firestore al vuelo sin requerir re-subir los archivos Excel.
- **Alternador de Visualización Reordenado en el Calendario:** Interruptor en el Histórico Mensual ordenado con **"Turno"** en primer lugar (por defecto) y **"Tramo 24 Horas"** en segundo lugar (que calcula dinámicamente el periodo civil completo de 00:00:00 a 23:59:59 del día consultado).
- **Control de Cuadratura por Tramo Horario Personalizado:** Módulo auditor desplegable en el resumen del día para evaluar cualquier franja horaria a medida (incluyendo cruces de medianoche).

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
- 📊 **Panel de KPIs Estadísticos**: Indicadores clave de rendimiento en tiempo real, como promedios de espera, profesionales activos y distribución de turnos.
- 👥 **Análisis de Profesionales y Turnos**: Módulos dedicados al seguimiento del desempeño del personal clínico, rankings de profesionales y cobertura por turnos.
- 📉 **Curva de Demanda**: Gráficos interactivos de demanda temporal para anticipar cargas de trabajo y flujos de pacientes.
- 🗂️ **Gestión e Importación Masiva**: Carga robusta de datos desde archivos Excel para inicializar, actualizar y cruzar registros en segundos.
- 🩺 **Análisis Sociodemográfico**: Desglose visual de métricas de pacientes según edad, género y otras variables sociodemográficas relevantes.
- 🛡️ **Análisis Específico de Constataciones de Lesiones (Z51.8)**: Módulo dedicado para desgloses cuantitativos absolutos e interacciones demográficas entre sexo, edad y comuna de residencia.
- 🔐 **Seguridad y Roles**: Control de acceso a módulos específicos y persistencia en tiempo real soportada por Firebase.

### Tecnologías:
- **Frontend:** React + Vite, Tailwind CSS, Lucide React.
- **Backend & Nube:** Google Firebase (Firestore, Authentication, Hosting).

---

## ✍️ Créditos y Propósito
Este sistema ha sido desarrollado a medida para optimizar la cadena de suministro logístico-clínico, priorizando la velocidad de operación, la integridad y seguridad de los datos sensibles, y ofreciendo una experiencia de usuario interactiva y sumamente moderna. Un recurso diseñado para salvar tiempo administrativo y evitar fugas de información.

## 📄 Propiedad y Derechos de Uso
⚠️ **Aviso Importante**: Este repositorio y todo su código fuente son de propiedad exclusiva y uso restringido (Código Cerrado / Proprietary).

El código expuesto aquí tiene como único propósito mostrar el avance y el trabajo en desarrollo del proyecto. NO está permitido su copia, distribución, modificación, ni uso comercial o personal sin la autorización expresa de los autores. Todos los derechos reservados.
