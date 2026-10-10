# Protocolo Obligatorio de Despliegue, Consolidación Continua & Validación de Datos en MÉTRICO

## 📌 Reglas de Consistencia y Auditoría de Datos (SSOT Rayen):
1. **Techo y Límite de Correlativos en Archivo Cargado**:
   - **Correlativo Máximo Cargado en Sistema**: `#30.789` (Lote 53, Fecha de corte: `03/10/2026 a las 22:20:20 hrs`).
   - **Correlativo de Control Oficial Rayen**: `#30.789` (con `27.968` pacientes atendidos efectivos, `2.821` altas administrativas y `30.789` admitidos YTD).
   - El total acumulado de admisiones (YTD) procesado en MÉTRICO nunca puede superar el correlativo máximo del archivo entregado (`#30.789`) para dicho corte temporal.
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
   - **Filtro Anti-Fechas Futuras y Continuidad Temporal Dinámica**: Ningún registro, paciente o turno con timestamp o fecha posterior al tiempo real actual dinámico (`Date.now() + 86.400.000 ms` / 24 hrs de tolerancia de sincronización) puede ser auto-seleccionado por el sistema. Las fechas en formato texto chileno (ej. 11 de Mayo `11/05/2026`) deben ser blindadas contra inversiones a formato estadounidense (`05/11` Noviembre), impidiendo que registros anómalos o futuros se posicionen en la cima cronológica. Queda estrictamente prohibido utilizar topes estáticos de mes o día (como septiembre o día 28) que bloqueen la carga natural de nuevos meses o lotes.
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
13. **Norma Oficial de Despacho de Informes por Correo: Protagonismo Separado para Cifras del Turno & Comparativa YoY con Despacho Ágil**:
    - Todo despacho de informe asistencial por correo electrónico debe generarse utilizando estrictamente el motor **React Email** (`@react-email/components` y `@react-email/render`) con diseño inline seguro, fondo oscuro institucional (`#0f172a`), logotipo oficial en pill blanco (`cid:logo_sar`) y compatibilidad garantizada en clientes de escritorio y móviles.
    - **Estructura en Láminas Fidedigna al Previsualizador de Diseño**:
      El cuerpo visual del correo debe reflejar fielmente la estructura definida en el previsualizador institucional de MÉTRICO:
      1) **Lámina 1: Balance Asistencial & Cifras Oficiales de Guardia (Datos del Turno)**: Exactamente 5 tarjetas de guardia con idéntica jerarquía y simetría al 20%: 1. Pacientes Admitidos, 2. Pacientes Atendidos, 3. Altas Administrativas, 4. Traslados a Hospital y 5. Constataciones Z51.8, acompañadas por el banner de cuadratura universal del turno: $\text{Admitidos} = \text{Atendidos } (\text{Altas Médicas} + \text{Traslados}) + \text{Altas Admin} \bullet \text{Constataciones Z51.8}$.
      2) **Lámina 2: Indicadores Maestros Interanuales (Comparativa YoY & YTD)**: 4 tarjetas con las variaciones interanuales y volúmenes YTD: Pacientes Admitidos (+20.4% YoY), Pacientes Atendidos (+19.8% YoY), Altas Administrativas (+26.4% YoY) y Traslados a Hospital (+11.8% YoY), seguidos del sub-bloque de eficiencia (Rendimiento por Hora pac/hr y Estadía Total Promedio).
      3) **Desglose de los 3 Tramos de Espera & Constataciones Z51.8**: Tiempos de Admisión-Triage, Triage-Box y Box-Alta con comparativa, junto al recuadro destacado de Constataciones médico-legales.
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
19. **Protocolo Obligatorio de Rectificación Previa & Verificación Cruzada Multicapa Universal (Regla Global MÉTRICO)**:
    - **Principio de Veracidad y Fidedignidad Inviolable**: Ningún dato, cifra, reporte formal ni correo asistencial puede generarse ni emitirse si sus datos no concilian al 100% con los módulos de auditoría y consolidación oficial de MÉTRICO. La información debe ser un reflejo exacto y corroborado de la realidad clínica registrada.
    - **Ámbitos de Aplicación Estricta y Obligatoria**:
      a) **Módulo de Despacho y Previsualización de Correos (`ModalConfiguracionCorreo.jsx`)**: Cola de turnos, previsualizador interactivo, despacho SMTP y generación en memoria de los 7 reportes PDF adjuntos.
      b) **Generador de Reportes Ejecutivos y cada uno de sus Subreportes (`ReportesModule.jsx`)**: El Reporte General Ejecutivo y el 100% de sus subreportes (*Altas Administrativas*, *Traumatología y Fracturas*, *Gestión de Enfermería y Triaje*, *Constataciones de Lesiones Z51.8*, *Traslados Hospitalarios UEH*, *Vigilancia Respiratoria* y *Radar Predictivo*) portan obligatoriamente el **Sello Institucional de Fidedignidad y Cuadratura Regla 19**, visible tanto en la interfaz interactiva como en las impresiones en Hoja Carta (PDF).
      c) **Módulos de Análisis Asistencial**: Demanda, Triage, Tiempos de Espera, Traslados y Rendimiento de Equipos.
    - **Las 5 Fuentes Canónicas de Rectificación y Verificación Previa**:
      1) **Histórico Mensual Asistencial (`CalendarioHistorico.jsx`)**: Fuente de contraste cronológico que audita día por día y turno por turno (Turno SAR vs Día 24h) el desglose exacto de Admitidos, Atenciones Médicas Efectivas, Altas Administrativas y Triage C1 a C5 mediante `getStrictStats`.
      2) **Centro de Verificación & Auditoría Clínica (`CentroVerificacionAuditoria.jsx`)**: Fuente de contraste analítico donde se valida la Prueba de Control Clínico de Demanda (Ecuación Universal Rayen: $\text{Admitidos} = \text{Completados} + \text{Egreso Admin} + \text{Alta sin Atención}$) y se contrastan los benchmarks históricos certificados.
      3) **Rendimiento de Equipos de Guardia (`AnalisisEquiposTurno.jsx`)**: Fuente de contraste operativo que valida el equipo de guardia (Turnos 1 al 4) a cargo del turno, su volumen ingresado y latencia Manchester.
      4) **Módulos Especializados & Subreportes Oficiales** (`AnalisisDemandaAtencion.jsx`, `AnalisisTraslados.jsx`, `AnalisisConstataciones.jsx`, `AnalisisRespiratorio.jsx`, `AnalisisTraumatologia.jsx`): Fuentes de contraste para los 7 reportes PDF adjuntos (1.162 traslados acumulados, 242 constataciones Z51.8, casos respiratorios IRA y sospechas de fractura).
      5) **Auditoría Pre-Vuelo en Despacho & Generador de Reportes (`ModalConfiguracionCorreo.jsx` y `ReportesModule.jsx`)**: Pasarela final obligatoria que reconcilia y certifica que la suma de atenciones médicas y altas administrativas sea matemáticamente exacta al 100% de los pacientes admitidos antes de exportar, imprimir o despachar.
    - **Sello Institucional Visible Universal**: Tanto en el previsualizador del correo como en cada una de las hojas de reportes ejecutivos en Hoja Carta (PDF), el sistema despliega el sello explícito de verificación cruzada que certifica: $\text{Total Admitidos} = \text{Atenciones Médicas Efectivas} + \text{Altas Administrativas}$, corroborado con el Histórico Mensual y la Auditoría de Demanda Rayen.
20. **Estandarización Terminológica e Institucional Obligatoria ("Triaje con J")**:
    - **Norma Lingüística Inviolable en Toda la Plataforma**: Toda etiqueta, título, encabezado de reporte, asunto o cuerpo de correo electrónico, alerta predictiva del Radar, leyenda de gráficos y documentación visible al personal clínico o directivo DEBE utilizar invariablemente el término en español **"Triaje"** (con 'j') y nunca la voz foránea *"Triage"*.
    - **Ámbitos de Aplicación Estricta**:
      a) **Desglose de Tramos de Espera**: `1. Admisión a Triaje`, `2. Triaje a Box` y `3. Box a Alta`.
      b) **Lámina de Categorización Manchester**: `Distribución Oficial de Triaje (Categorización C1 a C5)`.
      c) **Alertas y Recomendaciones Clínicas**: `reforzar triaje C1-C3`, `triaje inicial`, `Área de Derivaciones y Triaje`.
    - **Protección de Estabilidad de Código**: Las variables de programación, identificadores de bases de datos (`p.triage`, `rawTriage`, etc.) y esquemas de Firestore/BigQuery permanecen intactos como atributos técnicos internos para asegurar total estabilidad sin regresiones.
21. **Persistencia Cloud de Destinatarios, Trazabilidad de Despacho SMTP & Tolerancia Asistencial Ampliada (v6.3.32)**:
    - **Persistencia en Firestore de Destinatarios**: La configuración de destinatarios del informe asistencial (`ModalConfiguracionCorreo.jsx`) se sincroniza bidireccionalmente con Firestore en `artifacts/${appId}/public/data/configuracion_correo/destinatarios`, respaldada por `DEFAULT_DESTINATARIOS` y caché local, garantizando que nunca se vacíe o pierda tras actualizaciones de versión o recargas del navegador.
    - **Trazabilidad e Incidencias Granulares**: Cada despacho registra el resultado individual por destinatario (Entregado, Incidencia con código de error SMTP exacto, Pendiente) e incorpora la tabla cronológica de Bitácora de Trazabilidad e Incidencias de Envíos para auditoría inmediata.
    - **Ventana Asistencial de Día Hábil Ampliada (16:00 hrs)**: En `helpers.js` (`obtenerTurnoDetallado`) y `CentroVerificacionAuditoria.jsx`, los pacientes admitidos en el turno de semana hábil cuya permanencia, observación médica o tratamiento se extienda durante la mañana y tarde del día siguiente se consolidan en el turno largo de semana hasta las `16:00 hrs`, conciliando al 100% con reportes oficiales como la jornada `2026-09-24_SEMANA_LARGO` (83 admitidos = 73 completados + 10 egresos admin, 72 altas médicas, 1 traslado, 2 Z51.8 y 11 centros de procedencia).
22. **Principio Universal y Transversal de Comparabilidad Interanual Homóloga & Cierre Anual SSOT (Regla de Oro Multianual: Año Activo vs Año Previo) (v6.3.40)**:
    - **Regla Universal de Comparación Temporal Homóloga ("Manzanas con Manzanas" / Mes a Mes Acumulado)**:
      * En cualquier año civil activo o en curso ($Y$), donde hayan transcurrido $M$ meses ($1 \le M \le 12$), toda comparación interanual (YoY / YTD) contra el año previo ($Y-1$) DEBE contrastarse única y exclusivamente contra los mismos $M$ meses transcurridos del año previo ($1..M$).
      * **Aplicación Transversal Inviolable**:
        a) *Año Activo 2026 (al corte de Septiembre, $M=9$)*: Se compara estrictamente Ene-Sep 2026 contra Ene-Sep 2025 (**27.150 admitidos**, **24.618 atendidos**, **2.532 altas admin**), arrojando el crecimiento real oficial de **+11.0% YoY** en admisiones (30.130 vs 27.150) y **+11.4% YoY** en atenciones (27.415 vs 24.618).
        b) *Principio de Prorrateo Diario Continuo para Meses en Curso (Erradicación de Saltos Bruscos)*:
           - Cuando el mes en curso ($M$) presenta datos parciales ($1 \le \text{día} < \text{días del mes}$), la cuota del año previo para dicho mes no se suma completa ni se fija en cero; escala de forma continua y estrictamente proporcional a los días transcurridos ($F = \frac{\text{día}}{\text{días del mes}}$).
           - Base Homóloga Total = $\sum_{m=1}^{M-1} \text{Base Mes Cerrado}[m] + (\text{Base Mes Activo}[M] \times F)$.
           - Este mecanismo garantiza que a medida que transcurren los días de cualquier nuevo mes (ej. días 1 a 31 de Octubre, Noviembre, o en 2027), la tasa interanual (YoY) evolucione de manera suave, estable y matemáticamente coherente, erradicando por completo caídas artificiales o saltos bruscos día a día.
        c) *Transición a 2027 y Años Posteriores*: Cuando inicie el año asistencial 2027, la regla operará con idéntica lógica dinámica sin fijaciones estáticas:
           - En *Enero 2027 ($M=1$)*: el sistema comparará Ene 2027 vs Ene 2026.
           - En *Febrero 2027 ($M=2$)*: comparará Ene-Feb 2027 vs Ene-Feb 2026 acumulado.
           - En *Diciembre 2027 ($M=12$)*: comparará los 12 meses de 2027 contra los 12 meses de 2026.
      * **Prohibición Terminante**: Queda estrictamente prohibido comparar un año civil en curso que tiene meses pendientes de transcurrir contra los 12 meses completos del año anterior, lo cual produciría caídas artificiales alarmantes y falsas (ej. -20% o contracciones engañosas).
    - **Principio de Integridad del Cierre Anual Completo (12 Meses SSOT)**:
      * Todo año civil concluido ($Y-1, Y-2, \dots$) consolida en el sistema sus **12 meses completos cerrados**:
        - *Año 2025*: Cuenta con sus 12 archivos mensuales certificados de Rayen (#1 a #37.527), con **37.526 admitidos**, **33.931 atendidos** y **3.595 altas admin**.
        - *Año 2026*: Al cierre del 31 de Diciembre consolidará su total anual de 12 meses, constituyendo la nueva línea base oficial para 2027.
      * Cuando el usuario consulte el año civil completo (preset "Año" o serie histórica de 12 meses), la plataforma DEBE mostrar el 100% de sus 12 meses sin recortes.
    - **Transparencia Visual e Indicio Explicativo en la Interfaz (UI)**:
      * Toda tarjeta o banner de crecimiento interanual en el Dashboard (`PanelKPIs.jsx`), en Demanda y en informes DEBE explicitar el rango exacto de meses evaluado:
        Ejemplo: `Año Ant. (2025 Ene - Sep): 27.150 pac.`
      * El tooltip interactivo debe aclarar de forma transparente:
        `El cálculo interanual compara exclusivamente los meses equivalentes transcurridos (Ene a Sep) entre 2025 y el año en curso para evitar distorsiones. Total anual cerrado de 2025 (12 meses): 37.526 pacientes.`
    - **Dinamismo Algorítmico sin Años ni Meses Hardcodeados**:
      * El motor analítico (`useMetricoAnalytics.js`, `AnalisisDemandaAtencion.jsx`, `PanelKPIs.jsx`) calcula automáticamente los meses transcurridos $M$ a partir de la fecha de corte de los datos activos, garantizando continuidad multianual sin requerir refactorizaciones manuales de código cada fin de año.

23. **Fidelidad Absoluta, Imagen Institucional Externa y Veracidad Rigurosa en Informes Asistenciales por Correo Electrónico (v6.3.47)**:
    - **Principio Fundamental de Imagen Asistencial Externa**: Los correos electrónicos emitidos por MÉTRICO constituyen la cara visible e imagen oficial de la plataforma ante las máximas autoridades de salud (Dirección del SAR, Dirección de Salud Comunal, Jefaturas Clínicas y Médicas). Por ende, cada informe que aterriza en una bandeja de entrada externa debe ser **estrictamente fiel, intachable y matemáticamente exacto**, sin excepciones.
    - **Prohibición Terminante de Cifras Estáticas Residuales o Ficticias**:
      * En el **Top 10 Diagnósticos CIE-10**, queda terminantemente prohibido calcular porcentajes dividiendo por bases arbitrarias o antiguas (como 111 pacientes); el porcentaje de cada patología se calcula única y dinámicamente dividiendo los casos por el total de pacientes admitidos del turno: $\text{pct} = \frac{\text{casos}}{\text{totalAdmitidos}} \times 100$.
      * En los **Indicadores de Rendimiento y Espera**, las comparativas de velocidad o productividad horaria (pac/hr) deben comparar unívocamente contra líneas base institucionales coherentes (`vs 2025`), erradicando cualquier contradicción que muestre un incremento numérico ante un valor superior.
      * En la **Bitácora de Seguridad (Fracturas y Vigilancia Respiratoria)** y en la **Categorización de Triaje (C1 a C5)**, rige una estricta concordancia gramatical: valores unitarios se expresan invariablemente en singular (`1 caso`, `+1 caso`) y valores superiores en plural (`casos`).
    - **Simetría Espejo Inviolable entre Previsualizador y Despacho SMTP**: La previsualización interactiva de `ModalConfiguracionCorreo.jsx` y el cuerpo React Email recibido en Gmail/Outlook deben presentar idéntica estructura y láminas (incluyendo las tarjetas de Bitácora Asistencial de Fracturas y Vigilancia Respiratoria).
    - **Mecanismo de Re-encolado y Re-envío Transparente**: Todo turno asistencial (incluyendo el turno de corte del día 27) puede ser re-encolado o reenviado a voluntad por el usuario mediante botones dedicados en la cola de despacho, asegurando que ante correcciones del sistema cualquier turno ya emitido pueda ser restaurado al estado de "Listo para Despacho" y emitido nuevamente con las cifras auditadas.

24. **Modelado Probabilístico Asistencial con Nixtla StatsForecast, Exógenas de Calendario y Rezagos de Incubación Meteorológica (Radar Predictivo v2.0 - v6.3.51)**:
    - **Arquitectura de Microservicio Desacoplada (`/api-predictiva`)**: El motor de inteligencia predictiva del Radar opera mediante un microservicio independiente en Python montado sobre FastAPI (`http://127.0.0.1:8000`), ejecutando modelos de series temporales de la librería **Nixtla StatsForecast** (`AutoARIMA` y `AutoETS`) con estacionalidad semanal obligatoria (`season_length = 7`).
    - **Feature Engineering y Estándar Nixtla de Ingesta**:
      * Los datos históricos de urgencias SAR se organizan bajo el estándar canónico de Nixtla con columnas: `unique_id` (ej. `"SAR_General"`), `ds` (fecha/hora ISO) y `y` (volumen diario de pacientes).
      * **Feriados Oficiales Chilenos**: Incorporación mandatoria de la librería `holidays.CL()` para construir una variable dummy binaria (`es_feriado`), diferenciando automáticamente días hábiles de fines de semana y festivos en el comportamiento asistencial.
      * **Rezagos Climáticos de Incubación Respiratoria**: Ingesta automatizada de la API de Open-Meteo Melipilla con variables exógenas desplazadas: `temp_min_lag48` (temperatura mínima de hace 48 horas) y `precip_lag72` (lluvia acumulada de hace 72 horas), modelando matemáticamente el rezago clínico en la consulta por infecciones respiratorias agudas (IRA) y descompensación cardiopulmonar.
    - **Intervalos de Predicción al 90% (lo-90 / hi-90) y Dotación Médica Requerida**:
      * Toda proyección a 7 días DEBE calcular forzosamente el intervalo de predicción al 90% de nivel de confianza (`lo_90` y `hi_90`), delimitando el corredor probabilístico asistencial.
      * **Escenarios Optimista y Pesimista de Horas Médicas**: Con base en el estándar oficial SAR (rendimiento de 3.8 pacientes/hora médica), el sistema calcula y exhibe tanto el valor central como los escenarios extremos: $\text{Horas Min} = \frac{\text{lo\_90}}{3.8}$ y $\text{Horas Max} = \frac{\text{hi\_90}}{3.8}$, permitiendo a la jefatura directiva dimensionar contingencias de cobertura de guardia.
    - **Conexión Frontend y Resiliencia sin Fisuras (Graceful Degradation)**:
      * En `Radar.jsx`, la plataforma consume el endpoint `GET /api/forecast/7days?base_date=${baseDateIso}`.
      * Si el microservicio local de Python no estuviera accesible, el frontend conmuta automáticamente e imperceptiblemente a la calibración de `radarPredictivoEngine.js`, garantizando continuidad operativa sin bloquear jamás la pantalla ni disparar fallos en el navegador.
      * Toda leyenda y elemento visual adopta la nomenclatura institucional: *"Corredor Nixtla (IC 90%)"* y *"Rango Esperado IC 90%"*.
    - **Cuadratura y Blindaje de Régimen de Turnos SAR (Fines de Semana vs Días Hábiles en Tablas Predictivas)**:
      * **Erradicación de Desfases UTC en `baseDate`**: La fecha base enviada a los modelos predictivos DEBE formatearse obligatoriamente mediante extracción de fecha local (`getFullYear()`, `getMonth() + 1`, `getDate()`) y fijarse a las `12:00:00`, quedando estrictamente prohibido el uso de `toISOString().split('T')[0]` que bajo el huso horario chileno (UTC-3) adelanta la jornada en +1 día durante las horas nocturnas (ej. 22:30:32).
      * **Vinculación por Fecha Exacta en `chartData`**: Todo emparejamiento de series de pronóstico debe vincularse por coincidencia estricta de fecha (`item.fecha_predicha === formattedFecha`), suprimiéndose el mapeo ciego por índice array (`rawData[idx]`).
      * **SSOT Inviolable de Régimen SAR (Reglas 4, 9, 17)**: Todo día de proyección con `targetDt.getDay() === 0` (Domingo) o `6` (Sábado) DEBE ser catalogado forzosamente como **Fin de Semana SAR** con partición diurna (72%) y nocturna (28%) y curva intradiaria de 24 horas. Todo día hábil (Lunes a Viernes no festivo) DEBE ser catalogado forzosamente como **Día Hábil SAR** con **Turno Largo Semana (17:00 a 08:00)** y 0 atenciones diurnas.

25. **Variable Exógena de Red Hospitalaria UEH Melipilla, Efecto Rebote Ambulatorio C4/C5 y Calibración Retrospectiva Continua (Radar Predictivo v6.3.53)**:
    - **Fundamento Clínico y Dinámica de Red**: Ante eventos de saturación crítica o colapso en la Unidad de Emergencia Hospitalaria (UEH) del Hospital San José de Melipilla (difundidos en redes oficiales como `@hospitaldemelipilla` o comunicados radiales/telefónicos), los usuarios con patologías de menor gravedad (categorías Manchester C4 y C5) que afrontan tiempos de espera excesivos migran masivamente hacia la atención primaria de urgencia, generando un **efecto rebote asistencial** directo hacia el SAR Elsa Romo Aravena.
    - **Modelado Matemático en Nixtla StatsForecast y Fallback Autónomo**:
      * **Multiplicador de Contingencia Hospitalaria**: Cuando la alerta hospitalaria está encendida (`alerta_hospital = true`), el modelo aplica un factor multiplicador de **`+20%`** sobre el volumen diario de atenciones proyectadas (+18 a +28 pacientes por jornada).
      * **Focalización por Triage Manchester**: El **`80%`** del excedente proyectado se asigna automáticamente a las categorías ambulatorias leves/moderadas (**C4 y C5**), y el **`20%`** restante a patologías intermedias (**C3**), manteniendo las categorías críticas (**C1 y C2**) desacopladas de esta variación conductual.
      * **Ajuste Dinámico de Horas Médicas**: El dimensionamiento de dotación médica requerida (a razón de 3.8 pac/hora médica) se incrementa automáticamente en **`+4.5h a +6.5h de cobertura médica`** para garantizar la absorción oportuna en box de atención ambulatoria.
    - **Conmutador de 1 Clic y Visibilidad UI Inmediata**:
      * En la cabecera del Radar Predictivo (`Radar.jsx`), se provee un conmutador segmented de alta visibilidad: `[🟢 Flujo Normal | 🚨 Saturada / Alerta Roja (+20% C4/C5)]`, permitiendo a la jefatura de guardia o al equipo administrativo activar la contingencia en 1 segundo.
      * **Banner Operativo Destacado**: Al activarse la alerta, se renderiza un banner de contingencia que resume la causa de la saturación hospitalaria, el impacto proyectado y las directrices de dotación médica.
    - **Matriz de 7 Fuentes de Información Cruzadas**: El informe técnico detallado causa-efecto se amplía oficialmente a 7 fuentes: 1) BigQuery ML, 2) Clima Open-Meteo Melipilla, 3) Calibración Dinámica Retrospectiva, 4) Calidad del Aire (AQI/PM2.5), 5) Turnos SAR (Largo vs Finde), 6) Feed MINSAL Alerta Sanitaria, y **7) Red Hospitalaria UEH Melipilla (@hospitaldemelipilla)**.
    - **Calibración Retrospectiva Continua y Gobernanza del Error**:
      * El Radar evalúa de forma continua los últimos 7 días con datos reales de `turnosDB` contrastados contra la predicción base, exhibiendo en vivo el **MAPE** (Mean Absolute Percentage Error), **MAE** (Mean Absolute Error en ±pacientes) y el coeficiente de determinación **R²** (Varianza Explicada).
      * El factor de autoajuste retrospectivo (`factorAjuste`) modula de manera autónoma el horizonte predictivo para evitar derivas o sesgos acumulativos.

26. **Resolución de Contexto de Apilamiento CSS (Stacking Context) y Blindaje de Jerarquía Visual de Popovers y Tooltips (Regla de Integridad de Capas v6.3.54)**:
    - **Principio CSS Stacking Context (Specification Appendix E)**: En conformidad con el estándar W3C, los elementos hermanos definidos posteriormente en el árbol DOM que utilicen `position: relative` se pintan siempre por encima de elementos previos con `position: static` o contextos de apilamiento con `z-index: auto`, independientemente del valor de `z-index` de los elementos hijos anidados dentro de ellos.
    - **Jerarquía Descendente Obligatoria en Paneles de Control (`PanelKPIs.jsx`)**:
      * **Bloque Superior (Tarjetas de Tendencia Interanual YoY)**: Debe poseer obligatoriamente `relative z-20` en su contenedor raíz y `relative hover:z-30` en cada una de sus 4 tarjetas individuales (Admitidos, Atendidos, Altas Admin y Traslados Hosp.), permitiendo que la tarjeta activa sobre la que se posa el cursor se eleve dinámicamente sobre sus vecinas.
      * **Bloque Intermedio (Grilla de 9 KPIs del Período Seleccionado)**: Debe declararse formalmente con `relative z-10`, garantizando que cualquier popover o tooltip proyectado hacia abajo desde el bloque superior flote limpiamente por encima de los KPIs inferiores sin ser ocluido ni recortado.
      * **Bloque Inferior (Distribución de Triaje y Tablas)**: Debe declararse con `relative z-0` para mantener la secuencia canónica de profundidad visual.
    - **Blindaje en Componentes Base de Tooltip (`InfoTooltip.jsx` / `TooltipWrapper`)**:
      * Todo tooltip flotante desplegable por hover debe activar dinámicamente elevación en su contenedor wrapper (`show ? 'z-[100]' : ''`) y utilizar `z-[9999]` en su ventana emergente (`div`), asegurando visibilidad total e inmediata ante cualquier interacción.

27. **Erradicación de Fechas de Corte Estáticas, Principio de Continuidad Temporal Dinámica & Preparación Perpetua 2026-2027 (Regla de Integridad Temporal v6.3.56)**:
    - **Principio de Continuidad Temporal Ininterrumpida e Ingesta Perpetua**: El sistema MÉTRICO está diseñado para la ingesta continua, acumulativa y perpetua de planillas Rayen a lo largo del tiempo. Queda terminantemente prohibido incorporar en el código fuente comprobaciones, filtros o variables con fechas fijas o meses de corte rígidos (tales como `m <= 8`, `dia <= 28`, `p.fecha.includes('2026-10')`, `m > 9`, constantes estáticas `OFFICIAL_DATA_CUTOFF_MS = 28/09/2026`, o límites duros de año como `y <= 2026`).
    - **Soporte Pleno de Octubre, Noviembre, Diciembre 2026 y Ejercicios Futuros**: La plataforma debe absorber de forma natural todas las planillas de los meses restantes del año 2026 y la transición cronológica hacia 2027 y años subsiguientes. Toda validación de año asistencial debe emplear rangos dinámicos (`y >= 2024 && y <= currentYear + 1`) y fallbacks reactivos a la fecha actual (`today`), erradicando cualquier retroceso forzado a fechas del pasado.
    - **Gobernanza Dinámica del Límite Temporal**: El límite superior para la validación de registros clínicos debe regirse única y exclusivamente por el tiempo real dinámico (`Date.now() + 24 horas`), previniendo registros futuros anómalos derivados de errores de formato fecha (DD/MM/YYYY vs MM/DD/YYYY) sin impedir jamás que el sistema procese y visualice datos legítimos del presente mes o de meses sucesivos.
28. **Protocolo del Agente Inspector de Integridad Asistencial Pre-Vuelo & Luz Verde Obligatoria (Regla de Despacho v6.3.64)**:
    - **Principio de Luz Verde Obligatoria**: Ningún turno de guardia puede ser colocado en la cola de despacho activa ni emitido vía SMTP si no cuenta con la certificación formal de Luz Verde (score 9/9) emitida por el Agente Inspector Pre-Vuelo (`evaluarLuzVerdeAgenteTurno`).
    - **Los 9 Pilares Asistenciales Auditados**:
      1. *Balance Asistencial de Guardia*: Cuadratura universal estricta: $\text{Admitidos} = \text{Atendidos } (\text{Altas Médicas} + \text{Traslados}) + \text{Altas Administrativas}$.
      2. *Indicadores Maestros Interanuales (YoY & YTD)*: Variaciones interanuales y volúmenes YTD certificados sin valores `NaN`, `null` ni vacíos.
      3. *Desglose de 3 Tramos de Espera & Constataciones Z51.8*: Admisión-Triaje, Triaje-Box y Box-Alta con control médico-legal Z51.8 estructurado.
      4. *Distribución Oficial de Triaje Manchester C1-C5*: Categorías de severidad proporcionales a atenciones médicas efectivas; estrictamente prohibido presentar todas las categorías en 0 si hay pacientes atendidos.
      5. *Productividad de Facultativos de Guardia*: Nómina médica con profesionales tratantes, atenciones y porcentajes de aporte al turno.
      6. *Top 10 Diagnósticos CIE-10*: Mapeo epidemiológico completo con códigos oficiales CIE-10 (mínimo 8-10 códigos con nombres y tendencias; nunca "Sin registro" ni vacíos).
      7. *Centros Base Red APS & Paridad Demográfica 100%*: Centros de salud de la red (Boris Soler, Elgueta, Florencia, etc.) con cuotas normalizadas $\le 100\%$, y demografía por sexo exacta al 100% de admisiones ($\text{Femenino} + \text{Masculino} = \text{Total Admitidos}$).
      8. *Traslados Hospitalarios UEH*: Si $\text{traslados} > 0$, ficha clínica con categoría institucional en mayúsculas (`C1-C5`), sospecha diagnóstica y hospital receptor UEH. Si $\text{traslados} = 0$, resolución primaria SAR documentada.
      9. *Bitácora de Seguridad Asistencial*: Conteo de sospecha de fracturas/traumatología y vigilancia respiratoria aguda con valores numéricos válidos.
    - **Mecanismo de Bloqueo en Cola y Despacho**:
      a) El motor de despacho autónomo (`proximoTurnoPendiente`) filtra de forma excluyente por `t.luzVerde === true`. Los turnos en revisión o con alertas no son despachados automáticamente.
      b) La tabla de turnos presenta la columna del Agente con badges interactivos `🟢 Luz Verde (9/9)` y `🔴 Alerta (X/9)` con modal de inspección detallada.
      c) En el botón "Enviar Ahora", si un turno carece de certificación, el Agente interviene para aplicar la auto-rectificación canónica antes de liberar el correo.

29. **Blindaje de Inicialización, Hoisting Modular y Estabilidad de Auditoría Pre-Vuelo (Regla de Estabilidad v6.3.65)**:
    - **Erradicación de TDZ y Orden Canónico de Hooks (`ModalConfiguracionCorreo.jsx`)**: El cómputo reactivo de indicadores derivados (como el conteo de turnos con Luz Verde o Alerta en la cola filtrada) debe ejecutarse estrictamente tras la inicialización y filtrado final de las colecciones de datos (`colaFiltradaFinal`), previniendo excepciones de inicialización tardía (`ReferenceError`) en producción.
    - **Hoisting Modular Nativo en Funciones del Agente (`helpers.js`)**: Las funciones de auditoría asistencial (`evaluarLuzVerdeAgenteTurno` y `autoRectificarTurnoConAgente`) deben declararse como `function declarations` exportadas, garantizando disponibilidad síncrona inmediata en cualquier punto de importación sin depender del orden secuencial de declaración.

30. **Sincronización SSOT Universal y Paridad Clínica 100% entre Dashboard Inicial, Subreportes y Correos de Guardia (Regla de Oro v6.3.66)**:
    - **Centralización Unívoca en `OFFICIAL_RAYEN_SHIFT_CONTROLS` (`helpers.js`)**: Toda certificación de turno cerrado auditado se exporta exclusivamente desde `helpers.js`. `useMetricoAnalytics.js` y `ModalConfiguracionCorreo.jsx` consultan de forma unificada esta fuente. Cuando el período consultado en el Dashboard o Reportes coincida con un turno oficial certificado (<= 2 días), `statsKPI`, `currentVol`, `currentAltas`, `currentTraslados`, `currentConstataciones`, `currentCats` y `rankingCentros` se reconcilian reactivamente con los datos oficiales de Rayen, erradicando que un corte parcial en memoria discrepe con el informe de correo.
    - **Calibración de Ventana Asistencial SAR de 20 Horas en Día Hábil (`getWindowRange`)**: En franjas de turno largo hábil (17:00 a 08:00), `getWindowRange` expande automáticamente la ventana de admisión a 16:00 y la de egreso a 12:00 PM del día siguiente para capturar la fila previa y las altas médicas extendidas.
    - **Inyección Obligatoria de `allPacientesDB` en Subreportes y Submódulos**: `ReportesModule` y los 6 submódulos clínicos (`AnalisisAltasDetail`, `AnalisisFracturas`, `AnalisisEnfermeria`, `AnalisisConstataciones`, `AnalisisTraslados`, `AnalisisRespiratorio`) reciben obligatoriamente la base consolidada `allPacientesDB` para garantizar integridad en comparativas interanuales.
    - **Predicados Canónicos Universales en `summaryGenerator.js`**: Los resúmenes narrativos y analíticos deben utilizar invariablemente las funciones canónicas `isAltaAdmin(p) || p.estado === 'Cancelada'`, `isFractura(p)`, `isConstatacionLesion(p)` e `isTraslado(p)`.
    - **Ámbito Estricto de Turno en Resúmenes del Correo**: `subReportSummaries` en `ModalConfiguracionCorreo.jsx` se calcula evaluando de forma estricta los pacientes del turno seleccionado (`targetPacs`) y nunca el acumulado anual indiscriminado.

31. **Auto-Detección Estricta del Último Turno Clínico 100% Cerrado, Encasillamiento Asistencial SAR y Blindaje de Formato Chileno con Supervisión del Agente (Regla Canónica SAR v6.3.68)**:
    - **Principio Inviolable de Auto-Selección al Inicio y Recarga**:
      Toda apertura inicial de MÉTRICO (`Dashboard.jsx`), restablecimiento de filtros (`handleClearFilters` / "Borrar Filtros"), y auditoría de despacho DEBE cargar y posicionar por defecto de manera 100% autónoma el **último turno asistencial cerrado al 100%**, sin exigir manipulación manual del usuario.
    - **Ventanas Oficiales de Encasillamiento Horario y Estadía SAR**:
      a) **Días Hábiles (Lunes a Viernes no festivo - Turno Largo Semana)**:
         * *Horario Oficial de Guardia*: `17:00 a 08:00 hrs`.
         * *Ventana Asistencial de Encasillamiento y Estadía*: `16:00 hrs a 12:00 PM (mediodía)` del día siguiente (20 horas de búsqueda continua). Esto captura las admisiones de fila previa de ventanilla a las 16:00 hrs y la permanencia en box, observación médica y altas de los pacientes que ingresaron durante el cambio de guardia a las 08:00 AM.
         * *Criterio de Cierre Formal*: Todo corte de datos en día hábil previo a las 12:00 PM del día siguiente se considera con atenciones y estadías en curso; el sistema selecciona de forma automática el turno cerrado previo.
      b) **Fines de Semana (Sábados y Domingos) & Festivos Oficiales**:
         * La jornada se divide invariablemente en dos turnos clínicos independientes:
           1. *Turno Diurno*: Inicia estrictamente a las `08:00 hrs` y finaliza a las `20:00 hrs` del mismo día (12 horas exactas).
           2. *Turno Nocturno*: Inicia estrictamente a las `20:00 hrs` y finaliza a las `08:00 hrs` del día siguiente (12 horas exactas con cruce de medianoche).
         * Queda terminantemente prohibido consolidar o promediar los dos turnos de fin de semana en un solo día civil de 24 horas.
    - **Blindaje Lingüístico-Temporal en Formato Chileno (`ChileanDatePicker` & `ChileanTimePicker`)**:
      * Queda estrictamente prohibido el renderizado en crudo de inputs de fecha con dependencia del locale regional del navegador o sistema operativo, lo cual generaba que navegadores en-US mostraran `10/08/2026` simulando 10 de Agosto en lugar del 8 de Octubre.
      * Toda entrada o selector de período debe utilizar de forma inmutable la representación institucional: **Día abreviado en español + `DD/MM/AAAA`** (ej. `Vie 09/10/2026` o `Sáb 10/10/2026`) y horas en estándar militar 24 hrs (`16:00 hrs`, `12:00 hrs`), manteniendo accesible por clic el selector de calendario nativo sin alterar el texto formateado.
    - **Supervisión Activa del Agente Inspector Asistencial & Auditoría Pre-Vuelo**:
      * El Agente Inspector (`evaluarLuzVerdeAgenteTurno` / `autoRectificarTurnoConAgente`) valida activamente el encasillamiento horario del turno: turnos largos de semana deben cubrir la ventana de 16:00 a 12:00 PM, y turnos de fin de semana deben ajustarse a 08:00-20:00 o 20:00-08:00.
      * El Agente del Radar Predictivo (`AgenteRadarAdmin.jsx`) y el motor de auditoría deben verificar que ningún turno sea colocado en la cola de despacho ni auto-seleccionado si se encuentra en curso antes del corte formal de guardia.
      * Ante cualquier solicitud de auditoría, prueba de envío o inicio de sesión, el Agente DEBE certificar y validar que las fechas y horas concilien con esta ventana oficial SAR.

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
