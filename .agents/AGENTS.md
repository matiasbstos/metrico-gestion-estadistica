# Protocolo Obligatorio de Despliegue, Consolidación Continua & Validación de Datos en MÉTRICO

## 📌 Reglas de Consistencia y Auditoría de Datos (SSOT Rayen):
1. **Techo y Límite de Correlativos en Archivo Cargado**:
   - **Correlativo Máximo Cargado en Sistema**: `#28.091` (Fecha de corte: `09/09/2026 a las 21:57 hrs`).
   - **Correlativo de Control Oficial Rayen**: `#28.091` (con `25.547` pacientes atendidos efectivos).
   - El total acumulado de admisiones (YTD) procesado en MÉTRICO nunca puede superar el correlativo máximo del archivo entregado (`#28.091`) para dicho corte temporal.
2. **SSOT en `pacientesDB` y Deduplicación Estricta**: La demanda mensual y global debe priorizar siempre el conteo desduplicado directo de `pacientesDB` (`deduplicarPacientes`) para evitar que turnos precalculados o sincronizaciones superpuestas en Firestore inflen artificialmente los totales.
3. **Integridad de Líneas Base Históricas (2025)**: Las series comparativas de 12 meses deben mantener la continuidad de la línea base histórica SAR si la base de datos local contiene meses incompletos o fragmentos de prueba (< 2.000 pacientes por mes).
4. **Prioridad Absoluta de Pauta Manual de Turnos (`pautas_turnos`)**:
   - Toda resolución de equipos asistenciales (`resolverEquipoTurno` y `usePautasTurnos`) debe subordinarse con prioridad 1 a la pauta guardada por el usuario en Firestore (`pautas_turnos`).
   - Las franjas de fin de semana (`08:00 - 20:00` y `20:00 - 08:00`) deben discriminarse con exactitud antes que cualquier búsqueda genérica de texto, impidiendo que la presencia del término `'fin de semana'` sea confundida con el turno hábil de semana (`17:00 - 08:00`).
5. **Auto-Detección Estricta del Último Turno Clínico 100% Completo y Cerrado**:
   - La selección inicial por defecto del período al abrir la plataforma (`Dashboard.jsx`) y en la auditoría de despacho de correos (`ModalConfiguracionCorreo.jsx` y `auditarUltimoTurnoCompleto`) debe apuntar siempre al **último turno asistencial cerrado al 100%** con datos de pacientes completos.
   - **Fines de Semana y Festivos**: Corte formal a las 20:00 hrs para turnos diurnos y a las 08:00 hrs del día siguiente para turnos nocturnos.
   - **Días Hábiles (Turno Largo de Semana)**: Debido a que los pacientes que ingresan a las 08:00 AM en punto (o durante el cambio de guardia) permanecen en box, observación médica y tratamiento, sobrepasando las 09:00 AM, la **ventana asistencial y rango superior de búsqueda de estadía se extiende obligatoriamente hasta las 12:00 PM (mediodía)** del día siguiente. Todo corte de datos de día hábil previo a las 12:00 PM se considera con atenciones y estadías en curso, seleccionando el sistema el turno cerrado anterior.
   - Turnos nocturnos en curso o con fragmentos parciales de datos (ej. corte a las 21:57 hrs con 13 pacientes) nunca deben ser auto-seleccionados como turno completo por defecto; el sistema seleccionará el turno previo ya concluido (ej. Sábado Diurno 08:00 a 20:00 con 97 pacientes).
   - **Filtro Anti-Fechas Futuras y Desambiguación de Formato de Fecha**: Ningún registro, paciente o turno con timestamp o fecha posterior al tiempo real actual o al mes de corte activo (Septiembre 2026) puede ser auto-seleccionado por el sistema. Las fechas en formato texto chileno (ej. 11 de Mayo `11/05/2026`) deben ser blindadas contra inversiones a formato estadounidense (`05/11` Noviembre), impidiendo que registros anómalos o futuros se posicionen en la cima cronológica.
6. **Atribución Continua por Fecha Lógica Asistencial en Cruce de Mes (Cierre Mensual 30/31)**:
   - Todo turno asistencial nocturno que inicie en el último día del mes (ej. día 30 o 31 a las 17:00 o 20:00 hrs) y concluya en la mañana del día 1 del mes siguiente (08:00 hrs) consolida el 100% de sus pacientes (incluyendo las admisiones de madrugada 00:00 a 07:59 del día 1) en el turno y mes que cerró (día 30/31).
   - En el Histórico Mensual y en todos los reportes, el día 1 del nuevo mes sólo contabiliza los turnos que abren a partir de las 08:00 hrs (diurnos) o 17:00/20:00 hrs (nocturnos) del día 1, garantizando integridad sin fragmentar el equipo de guardia.
7. **Tratamiento de Meses Activos / En Curso en Demanda Interanual y Gráficos**:
   - Todo mes civil en curso que aún no haya concluido o presente datos parciales (definido por el umbral asistencial SAR de `< 2.000 pacientes` para el mes calendario actual o posterior) **nunca debe calcular contracciones interanuales engañosas** (ej. `-75.9%` por comparar fragmentos de días contra un mes cerrado completo de 30 días).
   - En las tarjetas mensuales de demanda se debe mostrar obligatoriamente el distintivo institucional: `En curso (X pac.) ⏳ Activo`.
   - En el gráfico comparativo de 12 meses (Recharts), los meses en curso o futuros deben pasar valor `null` para el año en curso, impidiendo caídas artificiales a cero y manteniendo la continuidad visual sin quiebres.
8. **Conciliación Universal SSOT de Crecimiento Interanual (YoY) y Sintonía de Tarjetas de Período**:
   - Toda cifra o badge de crecimiento interanual acumulado (YoY) en el módulo de Demanda (`AnalisisDemandaAtencion.jsx`), en `PanelKPIs.jsx`, en `ReportesModule.jsx` o en informes ejecutivos DEBE subordinarse estrictamente al objeto SSOT canónico `statsKPI.anual` (proveniente de `useMetricoAnalytics` / `statsKPIFinal`).
   - **Armonización de Vistas Anuales (Preset "Año" o rangos >= 300 días)**:
     a) Las 9 tarjetas inferiores del bloque "Período Seleccionado" adoptan obligatoriamente el porcentaje `Vs Año Ant.` idéntico al banner ejecutivo (`+19.7%` en admisiones, `+19.1%` en atendidos, `+25.6%` en altas, `+11.8%` en traslados, `+13.1%` en constataciones, `+19.7%` en rendimiento pac/hora y `+4.8%` en estadía), erradicando contracciones artificiales como `-57.9%`.
     b) En rangos anuales se suprime estrictamente la etiqueta `Vs Mes Ant.`, eliminando comparativas inconsistentes de un año civil completo contra un único mes previo.
     c) En la vista anual, las tarjetas de Traslados y Constataciones adoptan de forma unívoca los totales consolidados oficiales de guardia (`1.162 pac.` y `242 pac.` respectivamente).
   - El cálculo de meses transcurridos (`elapsedMonthsCount`) y de la línea base comparativa (`totAdmitidosCompareElapsed`) nunca debe acumular cuotas mensuales completas del año anterior para meses abiertos o incompletos (< 2.000 pac), asegurando que el porcentaje YTD sea idéntico y consistente en el 100% de los paneles.
   - Todo porcentaje interanual positivo debe formatearse explícitamente con el signo más (`+X.X% YoY`).
9. **Desglose y Auditoría por Franjas Horarias Asistenciales en Control de Demanda**:
   - En la Prueba de Control Clínico de Demanda (Ecuación Universal: `Admitidos = Atendidos + Sin Atención + Egreso Admin.`) y en cualquier módulo de auditoría de turnos, la selección "Día" debe soportar de forma obligatoria el filtrado por franjas horarias asistenciales oficiales:
     a) **Día Completo (24 hrs)**: `00:00 a 23:59 hrs` del día civil.
     b) **Turno Diurno**: `08:00 a 20:00 hrs` (12 horas).
     c) **Turno Noche Fin de Semana / Festivo**: `20:00 a 08:00 hrs` del día siguiente (12 horas con cruce de medianoche).
     d) **Turno Largo Semana Hábil**: `17:00 a 08:00 hrs` del día siguiente (con ventana ampliada de búsqueda asistencial y estadía de `16:00 hrs` a `12:00 PM` para capturar la permanencia y altas de pacientes admitidos a las 08:00 AM).
10. **Garantía de Alto Contraste, Visibilidad y Accesibilidad UI**:
    - Queda estrictamente prohibido el renderizado de botones activos, pestañas o subpestañas con estilos transparentes, fondos blancos sobre fondos claros o texto ilegible (blanco sobre blanco).
    - Todo selector o elemento de navegación activo debe utilizar estilos sólidos contrastantes institucionales (como `.bg-primary-custom`, o `bg-indigo-600 text-white font-black shadow-md`), asegurando visibilidad óptima tanto en modo Claro como en modo Oscuro.
11. **Paridad Oficial de Estados Rayen y Desambiguación de Egresos Administrativos vs. Altas sin Atención Médica**:
    - La Ecuación Universal y los controles de demanda deben reflejar de forma estricta y desglosada la terminología oficial de la planilla Rayen (*"Pacientes Admitidos por Rango de Fecha y Hora"*):
      $$\text{Total Pacientes Admitidos} = \text{Completado (Atención Médica)} + \text{Egreso Administrativo} + \text{Alta sin Atención Médica}$$
    - **Reglas de Clasificación Unívoca**:
      a) **Alta sin Atención Médica (`isSinAtencionMedica`)**: Todo paciente cuyo estado o destino indique expresamente retiro, fuga, abandono o alta sin atención médica.
      b) **Egreso Administrativo (`isEgresoAdministrativo`)**: Todo paciente cuyo estado o destino corresponda a cancelación de ventanilla, anulación administrativa, duplicado o trámite administrativo, que no sea un retiro voluntario. Nunca deben sumarse indiscriminadamente a los retiros sin atención.
      c) **Completado (Atención Médica Efectiva)**: Todo paciente con atención completada, finalizada o comenzada/en curso. Queda estrictamente prohibido degradar un paciente con estado `Completa`, `Completado`, `Comenzada`, `Atendida` o en curso a alta administrativa simplemente porque el nombre del médico figure no registrado nominalmente. Todo paciente que ingresó a box y no registra cancelación administrativa ni retiro voluntario es considerado atención clínica efectiva.
    - **Orden y Nomenclatura en la Interfaz (UI)**: Toda tarjeta, input o matriz de auditoría debe presentar los 4 campos en el orden idéntico a Rayen: 1. Total Pacientes (Admitidos), 2. Completados (Atención Médica), 3. Egreso Administrativo, 4. Alta sin Atención Médica, evitando cualquier confusión al ingresar o corroborar datos.
12. **Evaluación de Rendimiento de Equipos de Guardia (Flujo de Admisión y Triage)**:
    - El módulo de Rendimiento de Turnos y los análisis comparativos de guardia deben enfocar su evaluación exclusivamente en el desempeño operativo de los Equipos de Guardia (Turnos 1, 2, 3 y 4) en el flujo de admisión y categorización clínica (Triage), suprimiendo métricas de médicos activos o atenciones por médico para evitar sesgos diagnósticos individuales.
    - Los 3 KPIs canónicos de equipo son obligatorios: 1) Volumen Total Ingresado, 2) Latencia Promedio a Triage (con delta invertido de rapidez) y 3) Criterio de Alta Complejidad % (C1+C2+C3).
    - La correlación de sobrecarga se evalúa mediante ComposedChart con doble eje Y (Volumen en Eje Y Izquierdo e/y Latencia en minutos por categoría en Eje Y Derecho).
13. **Norma Oficial de Despacho de Informes por Correo: 4 Pilares Maestros de Demanda y Despacho Ágil sin PDFs Adjuntos**:
    - Todo despacho de informe asistencial por correo electrónico debe generarse utilizando estrictamente el motor **React Email** (`@react-email/components` y `@react-email/render`) con diseño inline seguro, fondo oscuro institucional (`#0f172a`), logotipo oficial en pill blanco (`cid:logo_sar`) y compatibilidad garantizada en clientes de escritorio y móviles.
    - **Grilla de Demanda y Estructura en 8 Láminas Fidedigna al Previsualizador de Diseño**:
      El cuerpo visual del correo debe reflejar fielmente la estructura de láminas definida en el previsualizador institucional de MÉTRICO:
      1) **4 Pilares Maestros de Demanda con Igual Jerarquía**: Pacientes Admitidos (+20.4% YoY, YTD 28.257 pac), Pacientes Atendidos (+19.8% YoY, YTD 25.696 pac), Altas Administrativas (+26.4% YoY, YTD 2.561 altas) y Traslados a Hospital (+11.8% YoY, YTD 1.162 pac), seguidos del sub-bloque de eficiencia (Rendimiento por Hora pac/hr y Estadía Total Promedio).
      2) **Desglose de los 3 Tramos de Espera & Constataciones Z51.8**: Tiempos de Admisión-Triage, Triage-Box y Box-Alta con comparativa, junto al recuadro destacado de Constataciones médico-legales.
      3) **Distribución Oficial de Triage C1 a C5**: Proporciones con barras de color institucionales y variaciones YoY.
      4) **Rendimiento Clínico por Profesional Médico en Turno**: Tabla con médicos tratantes, atenciones, pac/hr y % de aporte al turno.
      5) **Top 10 Diagnósticos CIE-10**: Mapeo completo con código CIE-10, diagnóstico patológico, casos, % y tendencia, con soporte de llaves duales (`codigo/cie10`, `nombre/diagnostico`, `count/cantidad`, `pct/porcentaje`) erradicando valores en blanco o "Sin registro".
      6) **Centros de Origen & Demografía**: Centros base acumulado (CESFAM Florencia, Boris Soler, Elgueta, etc.) con llaves duales (`centro/nombre/name`), distribución por sexo, ratio demográfico y grupos etarios.
      7) **Apartado Exclusivo: Traslados Hospitalarios UEH**: Derivaciones con comparativa YoY y ficha clínica de sospecha diagnóstica y hospital receptor.
      8) **Bitácora de Seguridad**: Fracturas & traumatología y vigilancia respiratoria.
    - **Despacho Ligero sin Adjuntos de los 7 PDFs**:
      Por directriz operativa oficial, el correo de guardia no incluye los 7 reportes PDF adjuntos para evitar saturar las bandejas de entrada institucionales y optimizar la entrega SMTP, enviando directamente en el mensaje los 4 pilares con su comparativa YoY e incluyendo como adjuntos livianos la bitácora asistencial en TXT y el consolidado CSV. Los 7 subreportes oficiales permanecen disponibles para consulta y descarga bajo demanda en el módulo de Reportes.
14. **Feedback Visual de Carga Inmediata y Erradicación de Congelamiento en Rangos Amplios**:
    - **Indicador Visual Inmediato Universal**: Ante cualquier cambio de filtro temporal (presets "Año", "Mes", "Semana", "Día", o fechas y horas manuales) en la pantalla principal o en cualquier subreporte (Traslados, Demanda, Fracturas, Respiratorio, etc.), el sistema DEBE activar inmediatamente el estado de carga (`isFiltering = true` / `BarraProgresoCarga`), difiriendo los cálculos analíticos pesados al siguiente tick del navegador (`setTimeout(..., 16)`). Queda prohibido bloquear el hilo principal de JavaScript antes de que el usuario vea el haz luminoso de actividad.
    - **Complejidad Algorítmica Máxima O(1) en Agrupación de Turnos y Pacientes**: En `useMetricoAnalytics` y en cualquier módulo de análisis masivo, la vinculación entre turnos y pacientes nunca debe utilizar filtros lineales $O(N)$ repetitivos para cientos de turnos. Los turnos nocturnos o cruzados deben resolverse en $O(1)$ concatenando los índices hash por fecha (`pacsByDateStr`), previniendo alertas de *"Page Unresponsive"* y garantizando fluidez instantánea aún con más de 26.500 pacientes cargados.
    - **Protección de Red en Rangos Extensos**: Las consultas o sincronizaciones profundas sobre rangos mayores a 60 días no deben disparar descargas masivas de documentos si la base ya se encuentra inicializada en memoria, preservando la cuota y la reactividad de la interfaz.
15. **Auditoría y Deduplicación SSOT en Cola de Despacho de Informes (`ModalConfiguracionCorreo.jsx`)**:
    - Todo conteo diario o acumulado en la cola de jornadas auditadas (`diasCompletosAuditados`) y en los envíos de correo debe alimentarse única y exclusivamente de `deduplicarPacientes(pacientesDB)` y la normalización de fechas `formatLocalDate(p.tAdmision)`.
    - Queda estrictamente prohibido combinar cachés sin deduplicar (`metrico_cached_pacientes`) o recurrir a deduplicaciones débiles por ID de documento de Firestore (`p.id`), impidiendo que cargas masivas superpuestas inflen artificialmente las atenciones diarias.
    - **Techo Oficial de Demanda Asistencial SAR**: En toda la serie histórica auditada (2025–2026), el récord absoluto asistencial es de **192 pacientes en fin de semana** (31/05/2026) y de **151 pacientes en día hábil** (29/06/2026). Ningún día civil puede superar los 200 pacientes atendidos en condiciones normales de operación del SAR.
16. **Protocolo y Auditoría Pre-Vuelo Obligatoria para Despacho de Informes por Correo**:
    - **Paridad Matemática Universal de Rayen**: Todo informe asistencial despachado por correo electrónico (sea diario por turno, cierre mensual o prueba de envío) DEBE validar y cumplir estrictamente la ecuación universal:
      $$\text{Total Pacientes Admitidos} = \text{Atenciones Médicas Efectivas (Completadas)} + \text{Altas Administrativas (Egresos y Deserciones)}$$
    - **Clasificación Estricta mediante `isAltaAdmin(p)`**: Las altas administrativas deben calcularse invariablemente con el predicado institucional `isAltaAdmin(p) || p.estado === 'Cancelada'`. Queda terminantemente prohibido evaluar únicamente `p.estado === 'Cancelada'`, lo cual ocultaría los egresos administrativos y deserciones voluntarias de ventanilla.
    - **Conciliación Unívoca de Métricas Asistenciales**:
      a) **Traslados Hospitalarios**: El contador de traslados en la tarjeta superior y en el Apartado Exclusivo debe provenir unívocamente del conteo efectivo de pacientes derivados (`trasladosCount`). Si un paciente de traslado es presentado en la ficha (#1), su categoría debe formatearse obligatoriamente en mayúsculas institucionales (`Categoría C1-C5`).
      b) **Médicos en Turno**: La sumatoria de atenciones por médico en la tabla de rendimiento más los trámites administrativos sin asignación médica (`No Registrado`) DEBE coincidir con el 100% de los pacientes admitidos del turno.
      c) **Triage Manchester**: La sumatoria de pacientes en C1, C2, C3, C4, C5 más ingresos directos sin categorización debe coincidir con el total de admitidos.
      d) **Tiempos Asistenciales**: La suma de los 3 tramos (Admisión-Triage + Triage-Box + Box-Alta) debe guardar consistencia matemática con la estadía total promedio.
      e) **Diagnósticos y Centros**: Toda lista o tabla en el cuerpo del correo debe maquetarse exclusivamente mediante tablas HTML nativas (`<table width="100%">`), con nombres a la izquierda y porcentajes a la derecha, garantizando compatibilidad absoluta en clientes de correo (Gmail, Outlook, móvil) sin colapso de texto por limitaciones de flexbox.
    - **Auditoría Pre-Vuelo Automática (Pre-Flight Check)**:
      Tanto en el frontend (`ModalConfiguracionCorreo.jsx` vía `auditarIntegridadTurnoCorreo`) como en el backend Cloud Function (`enviarInformeCorreo` en `functions/index.js`), el sistema debe ejecutar una rutina de validación de integridad previa al despacho. Si detecta cualquier discrepancia entre admitidos, atendidos y altas, el sistema reconcilia automáticamente las variables con base en los registros clínicos individuales antes de ensamblar el HTML y despachar el correo.
    - **Obligación del Agente ante Consultas o Pruebas de Despacho**:
      Ante cualquier solicitud de verificación, auditoría o prueba de envío de correos, el agente DEBE realizar un cruce explícito de datos (Shadow Testing / SSOT check) contrastando cada cifra del informe (admitidos, atendidos, altas, triage, médicos, tiempos y derivaciones) contra la base de datos o BigQuery, reportando la conciliación punto a punto al usuario antes de dar por cerrada la tarea.
17. **Desagregación Estricta por Turnos Asistenciales Oficiales en la Cola de Despacho (`ModalConfiguracionCorreo.jsx`)**:
    - **Estructura Operativa Obligatoria de Turnos SAR**:
      a) **Fines de Semana (Sábado y Domingo) & Festivos Oficiales**: La jornada civil se divide invariablemente en **dos turnos clínicos independientes**:
         1. *Fin de Semana Día* / *Festivo Diurno*: `08:00 a 20:00 hrs` (12 horas). Despacho programado a las 20:30 hrs.
         2. *Fin de Semana Noche* / *Festivo Nocturno*: `20:00 a 08:00 hrs` del día siguiente (12 horas con cruce de medianoche). Despacho programado a las 08:30 hrs del día siguiente.
         Queda terminantemente prohibido consolidar o colapsar las atenciones de ambos turnos en una única fila de día civil (ej. agrupar 110 pac. diurnos y 39 pac. nocturnos en 149 pac. el Domingo 06/09/2026).
       b) **Días Hábiles (Lunes a Viernes no festivo)**: Se opera con **un único turno asistencial**:
          * *Turno Largo Semana*: franja oficial de admisión `17:00 a 08:00 hrs`, aplicando internamente la ventana de tolerancia asistencial y rango de estadía SAR de `16:00 hrs` a `12:00 PM` del día siguiente para capturar admisiones en fila previa, entrega de guardia y el 100% de las altas y estadías de pacientes ingresados a las 08:00 AM.
    - **Filtros Multidimensionales Requeridos en la Cola de Despacho**:
      La interfaz de la cola debe proporcionar 5 controles interactivos simultáneos:
      1) *Filtro por Mes*: Selector dinámico con todos los meses disponibles en la serie temporal.
      2) *Filtro por Semana*: Selector por semanas del mes (Semana 1: 1-7, Semana 2: 8-14, Semana 3: 15-21, Semana 4: 22-28, Semana 5: 29-31, o Últimos 7 días).
      3) *Selector / Digitación de Fecha Exacta*: Campo nativo `<input type="date">` que permite elegir o digitar directamente cualquier fecha civil o asistencial.
      4) *Búsqueda de Texto Reactiva*: Búsqueda instantánea por fecha, equipo (`Turno 1-4`), tipo o franja horaria.
      5) *Toggle de Modalidad*: Botón conmutador entre *Vista por Turnos Asistenciales (Oficial SAR)* y *Consolidado por Día Civil (24h)*.
18. **Unificación Canónica de Claves de Turno en Cola de Despacho & Controles Oficiales Rayen**:
    - Toda agrupación o mapeo de turnos en la cola de despacho (`ModalConfiguracionCorreo.jsx` y módulos de auditoría) DEBE normalizar unívocamente la clave del turno mediante `getCanonicalShiftKey(fechaIso, horarioStr, tipoStr)` con sus tres variantes oficiales (`FINDE_DIA`, `FINDE_NOCHE`, `SEMANA_LARGO`). Queda estrictamente prohibido permitir que diferencias cosméticas de texto (ej. `'17:00 a 08:00 hrs'` vs `'17:00 - 08:00 (Semana Largo)'`) generen filas duplicadas para un mismo turno.
    - **Prioridad Absoluta SSOT Deduplicada sobre Turnos Precalculados**: Cuando existen pacientes en memoria (`combinedPacientes`), las métricas del turno derivan de los registros clínicos deduplicados. Los registros brutos o no deduplicados de `turnosDB` nunca deben sobreescribir ni duplicar una jornada existente.
    - **Certificación de Turnos Cerrados Oficiales Rayen**: Todo turno cerrado cuyos datos oficiales hayan sido auditados mediante reporte formal Rayen (*'Pacientes Admitidos por Rango de Fecha y Hora'*, ej. Turno 09/09/2026 con 94 admitidos: 83 completados, 10 egresos admin, 1 alta sin atención) debe quedar respaldado en la matriz de control oficial (`OFFICIAL_RAYEN_SHIFT_CONTROLS`), garantizando que la cola de despacho y los correos emitidos concilien al 100% con la verdad asistencial de Rayen.

---

## 🚀 Protocolo Institucional y Obligatorio de Despliegue, Novedades & Bitácora de Desarrollo:
Esta norma es **inviolable, permanente y activa en todas las sesiones** (independientemente de si el usuario inicia un nuevo chat o lo continúa, o si el entorno se reinicia o cierra). Ante **cualquier nuevo elemento, modificación, corrección o actualización del sitio**, el proceso obligatorio a ejecutar es estrictamente el siguiente:

1. **Subir la versión a GitHub**:
   - Validar y compilar la aplicación sin fallos (`npm run build`).
   - Sincronizar en Git con mensaje semántico (`git add`, `git commit` y `git push origin main`).

2. **Hacer el despliegue en Firebase Hosting**:
   - Ejecutar el comando oficial (`npx --yes firebase-tools deploy --only hosting`).
   - Verificar y confirmar su disponibilidad pública en `https://metrico-dashboard-2026.web.app`.

3. **Actualizar la versión en la que va a quedar**:
   - Incrementar la versión oficial semántica (ej. `v6.3.4`).
   - Sincronizar `CURRENT_APP_VERSION` en `src/components/Dashboard.jsx`, en el historial de arquitectura (`src/components/dashboard/InformeArquitectura.jsx`) y verificar que la insignia oficial visible en la barra lateral bajo *"MÉTRICO Clínico Predictivo"* refleje el nuevo tag.

4. **Registrarlo dentro del Apartado de Novedades del Sitio**:
   - Incorporar la tarjeta informativa en el Muro de Novedades e Instructivos (`src/components/dashboard/ModalMuroActualizaciones.jsx`), detallando de forma comprensible para el personal clínico: propósito, para qué sirve, qué puedes ver, ejemplo práctico de uso y lista de cambios técnicos.

5. **Rellenar y Mantener al Día la Bitácora de Desarrollo (`DevLogModule.jsx`)**:
   - Toda actualización o hito significativo debe quedar registrado en `DEVLOG_POSTS_INITIAL` de `src/components/dashboard/DevLogModule.jsx` con su fecha real, título profesional, versión, problema técnico detectado, lógica aplicada, solución implementada y relato reflexivo `fullPost` de ingeniería.
   - **Regla de Regularización Retroactiva**: Si en algún momento una versión o actualización no fue registrada oportunamente en la bitácora, el agente o desarrollador DEBE incorporarla de forma retroactiva con base en la fecha e hito que corresponda, garantizando que el historial nunca quede congelado u obsoleto.

### ⚖️ Norma de Parámetros y Reglas del Sitio y del Agente:
Si cualquier modificación o nueva función genera algún cambio o un nuevo parámetro dentro de las reglas del sitio:
- **En el Sitio**: Se debe dejar estipulado obligatoriamente en las secciones correspondientes del Consolidado Maestro de `src/components/dashboard/InformeArquitectura.jsx` (**Fórmulas y Análisis**, **Horarios de Turno**, **Manual de Identidad Visual** o **Catálogo de Reportes**), manteniendo la documentación viva 100% acumulativa.
- **En el Agente**: Se debe dejar estipulado obligatoriamente en este archivo de reglas (`.agents/AGENTS.md`) para que opere como norma activa, inviolable y vinculante para todos los agentes y sesiones futuras.
