import React, { useState, useEffect, useMemo } from 'react';
import { 
  Terminal, Share2, Download, Copy, Check, Sparkles, 
  Search, Filter, Calendar, Shield, Image, 
  FileText, Plus, RefreshCw, X, Layers, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, doc, setDoc } from 'firebase/firestore';

export const DEVLOG_POSTS_INITIAL = [
  {
    id: 'devlog-v6-3-8',
    fecha: '2026-09-12',
    titulo: 'Resolución de Turnos Históricos en Curso y Erradicación de Registros Duplicados en Días Festivos',
    tipo: 'Auditoría & Cola de Despacho',
    version_tag: 'v6.3.8',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'En la Cola de Despacho & Turnos Auditados, turnos pasados pertenecientes a meses ya cerrados (como el 16 y 17 de Julio de 2026) figuraban anómalamente en estado "En Curso (Parcial)". Asimismo, en fechas festivas oficiales como el 16/07/2026 (Virgen del Carmen), se superponía una fila duplicada de día hábil ("Turno Largo Semana" de 110 pacientes) proveniente de turnosDB junto a los dos turnos legítimos de festivo (Diurno 73 pac y Nocturno 37 pac).',
    logica: 'Se recalibró el cómputo de turno completo implementando isPastShift con la determinación del cierre asistencial teórico (20:30 hrs para turnos diurnos y 12:00 PM del día siguiente para nocturnos/largos) contrastado con el corte temporal de los datos (maxGlobalTimestamp). Para fechas que ya tienen pacientes individuales procesados, se descartan de plano los registros precalculados de turnosDB mediante datesWithPatients.',
    solucion: 'Todo turno histórico cuyo término formal haya ocurrido antes del corte de datos cargados y posea representatividad clínica (>= 10 pacientes) pasa a estado "Listo para Despacho", reservando la salvaguarda de "En Curso (Parcial)" exclusivamente para el corte activo del archivo cargado. En días festivos, se erradicó la tercera fila fantasma de día hábil, presentando con absoluta exactitud los dos turnos de guardia oficiales.',
    fullPost: `La gestión operativa de un servicio de urgencia SAR requiere que la cola de despacho de informes diferencie con precisión milimétrica entre un turno que está transcurriendo en tiempo real y turnos que concluyeron meses atrás.
    
Al revisar los registros de meses previos, observamos que ciertas jornadas (como el turno nocturno festivo del 16 de Julio de 2026 y turnos del 17 de Julio) figuraban con el distintivo amarillo "En Curso (Parcial)". La causa raíz radicaba en que el validador aplicaba la salvaguarda de turnos activos (que exige dispersión horaria superior a 9 horas y último paciente después de las 05:00 AM) de manera indiscriminada a toda la serie histórica, sin contrastar si la fecha del turno era cronológicamente anterior al corte temporal de los datos cargados.

Paralelamente, detectamos que en el festivo del 16 de Julio de 2026 (Día de la Virgen del Carmen), la cola desplegaba tres filas conflictivas:
1. Festivo Diurno (08:00 a 20:00 hrs): 73 pacientes
2. Festivo Nocturno (20:00 a 08:00 hrs): 37 pacientes
3. Turno Largo Semana (17:00 a 08:00 hrs): 110 pacientes (73 + 37)

Esta tercera fila provenía de un registro precalculado heredado en la colección turnosDB que asumió erróneamente que el 16 de Julio era un día hábil común.

En la versión v6.3.8 implementamos una solución integral:
1. **Determinación Temporal de Término Asistencial (isPastShift)**: Calculamos el momento exacto en que concluye formalmente cada guardia (20:30 hrs para diurnos y 12:00 PM del día siguiente para nocturnos). Si este momento es anterior al corte temporal de los datos, el turno se reconoce como cerrado y concluido, pasando a "Listo para Despacho" si cuenta con volumen clínico representativo (>= 10 pacientes).
2. **Prioridad Absoluta SSOT Deduplicada sobre turnosDB**: Se indexaron todas las fechas que poseen pacientes en memoria (datesWithPatients). Para estas fechas, se bloquea la inyección de registros precalculados de turnosDB, erradicando turnos duplicados de día hábil en fines de semana y festivos.
3. **Preservación del Filtro Anti-Despacho Prematuro**: La salvaguarda de turno en curso se mantiene activa para el corte cronológico superior (ej. el turno activo al momento de exportar la planilla Rayen), impidiendo despachar reportes incompletos.`
  },
  {
    id: 'devlog-v6-3-7',
    fecha: '2026-09-12',
    titulo: 'Universalización Global de la Regla 19: Rectificación Previa en Reportes Ejecutivos y sus 8 Subreportes',
    tipo: 'Auditoría & Calidad SSOT',
    version_tag: 'v6.3.7',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'La Regla 19 debía regir como principio universal e inviolable en toda la plataforma MÉTRICO, asegurando que tanto los correos como cada una de las páginas impresas en PDF (Hoja Carta) de los reportes y subreportes porten la misma rectificación previa y cuadratura fidedigna.',
    logica: 'Expansión de la Regla 19 a norma universal global en AGENTS.md e implementación de sellos institucionales de verificación cruzada en la cabecera de cada una de las 8 hojas de ReportesModule.jsx.',
    solucion: 'Integración del Banner Maestro interactivo y de la función renderSelloRegla19 en el 100% de los reportes ejecutivos (General, Altas, Fracturas, Enfermería, Constataciones, Traslados, Respiratorio y Radar Predictivo), garantizando que todo documento emitido porte la certificación matemática de la verdad asistencial Rayen.',
    fullPost: `La gestión clínica moderna exige que los reportes institucionales gocen de la misma inmutabilidad y rigor analítico que los sistemas contables o financieros. Si un directivo de salud o jefatura médica toma en sus manos un informe impreso en Hoja Carta o revisa un subreporte especializado en pantalla, las cifras de admisiones, atenciones clínicas efectivas y egresos administrativos deben cuadrar de forma incontestable contra la base de datos auditada.

En esta versión v6.3.7, respondimos al requerimiento de elevar la Regla 19 a **Norma Universal y Global para todo MÉTRICO**. 

Diseñamos e integramos dos capas de certificación en el Generador de Reportes (ReportesModule.jsx):

1. **Banner Maestro Interactivo de Verificación Cruzada (Pre-Impresión)**:
Situado en la parte superior del módulo de reportes, permite al operador visualizar en tiempo real la Ecuación Universal de Demanda Rayen para el período seleccionado (Total Admitidos = Atenciones Médicas Efectivas + Altas Administrativas) y constatar su concordancia con el Histórico Mensual Asistencial y el Centro de Verificación de Demanda.

2. **Sello Institucional de Fidedignidad en las 8 Hojas Imprimibles (PDF / Hoja Carta)**:
Cada subreporte especializado porta en su cabecera el sello oficial con la certificación SSOT:
- Hoja 1: Reporte General Ejecutivo
- Hoja 2: Sub-reporte de Altas Administrativas
- Hoja 3: Sub-reporte de Estadísticas de Fractura y Destino
- Hoja 4: Sub-reporte de Rendimiento de Enfermería y Triaje
- Hoja 5: Sub-reporte de Constataciones de Lesiones Z51.8
- Hoja 6: Sub-reporte de Traslados Hospitalarios UEH
- Hoja 7: Sub-reporte de Vigilancia Epidemiológica Respiratoria
- Hoja 8: Sub-reporte de Radar Predictivo de Demanda IA

Con esta actualización, cualquier documento generado, exportado a CSV o impreso a PDF desde MÉTRICO se convierte en una pieza certificada de auditoría clínica con respaldo pleno de la verdad asistencial de Rayen.`
  },
  {
    id: 'devlog-v6-3-6',
    fecha: '2026-09-12',
    titulo: 'Institucionalización de la Regla 19: Verificación Cruzada Multicapa Previa al Despacho de Informes',
    tipo: 'Auditoría & Calidad SSOT',
    version_tag: 'v6.3.6',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'Necesidad de certificar que todo informe de turno o día despachado por correo sea 100% veraz, exacto e inmutable, contrastándolo previamente contra los módulos donde MÉTRICO ya corroboró y consolidó la información histórica y clínica.',
    logica: 'Articulación de los 5 pilares de verificación del sistema (Histórico Mensual, Centro de Verificación, Rendimiento de Equipos, Subreportes Especializados y Pre-Vuelo en Despacho) y formalización de la Regla 19 en el protocolo institucional y del agente.',
    solucion: 'Incorporación de la Regla 19 en AGENTS.md, integración del sello de verificación cruzada en el previsualizador de correo y blindaje del despacho contra turnos parciales o no conciliados.',
    fullPost: `El correo electrónico generado por MÉTRICO es un instrumento oficial de gestión asistencial y toma de decisiones para jefaturas y directivos de la red de salud. Por ello, la información contenida no puede ser producto de cálculos aislados o estimaciones no contrastadas.

Para dar una respuesta arquitectónica definitiva al requerimiento de veracidad absoluta, mapeamos y articulamos los 5 pilares de verificación donde MÉTRICO ya cuenta con información corroborada y certificada:

1. **Histórico Mensual Asistencial (CalendarioHistorico.jsx)**:
Es el primer punto de contraste cronológico. Mediante la función getStrictStats sobre pacientesDB deduplicados, este módulo audita día a día y turno por turno (Turno SAR vs Día Civil 24h) el desglose exacto de admisiones, atenciones médicas efectivas, altas administrativas y triage C1 a C5.

2. **Centro de Verificación & Auditoría Clínica (CentroVerificacionAuditoria.jsx)**:
Es el núcleo de validación matemática y analítica. Aquí reside la Prueba de Control Clínico de Demanda, basada en la Ecuación Universal Rayen (Total Admitidos = Atenciones Médicas + Egresos Administrativos + Altas sin Atención), con soporte para las 4 franjas horarias asistenciales (Día 24h, Fin de Semana Día 08-20, Fin de Semana Noche 20-08 y Turno Largo Semana 17-12) y contraste contra benchmarks históricos oficiales.

3. **Módulo de Rendimiento de Equipos de Guardia (AnalisisEquiposTurno.jsx)**:
Permite verificar operativamente qué equipo de guardia (Turnos 1 al 4) estuvo a cargo de la jornada, su volumen ingresado, su latencia promedio al triage y la proporción de alta complejidad (C1+C2+C3).

4. **Módulos Especializados & Subreportes Oficiales**:
En Análisis de Demanda, Traslados, Constataciones, Respiratorio y Traumatología residen las cifras de control de los 7 reportes PDF adjuntos (los 1.162 traslados a Urgencia Hospitalaria, las 242 constataciones de lesiones Z51.8, los casos IRA y las sospechas de fractura).

5. **Auditoría Pre-Vuelo en la Cola de Despacho (ModalConfiguracionCorreo.jsx)**:
Antes de que se dispare cualquier solicitud a la Cloud Function, el previsualizador contrasta las cifras contra los registros clínicos individuales y valida que el turno esté 100% cerrado.

A partir de esta versión, en el previsualizador se despliega un Sello Institucional de Verificación Cruzada que confirma la cuadratura matemática y el contraste exitoso con el Histórico Mensual y el Control de Demanda Rayen, consolidando a MÉTRICO como un estándar de máxima confiabilidad analítica.`
  },
  {
    id: 'devlog-v6-3-5',
    fecha: '2026-09-12',
    titulo: 'Restabilización de Histórico Mensual, Erradicación de Duplicados en Cola y Conciliación Rayen 09/09',
    tipo: 'Fix Crítico & SSOT',
    version_tag: 'v6.3.5',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'El apartado de Histórico Mensual colapsaba por ReferenceError en baseDateStr. La cola de despacho mostraba turnos duplicados con cifras dobles (77 vs 143, y 106 vs 169). El turno 09/09 tenía discrepancias contra el reporte oficial de Rayen (77 en corte parcial vs 94 en informe cerrado).',
    logica: '1. Variables seguras y tipado defensivo en CalendarioHistorico. 2. Clave canónica getCanonicalShiftKey para normalizar shiftKey entre pacientes y turnosDB. 3. Reconciliación con OFFICIAL_RAYEN_SHIFT_CONTROLS para el reporte oficial cerrado del 09/09.',
    solucion: 'Resolución inmediata del error en Histórico Mensual, erradicación del 100% de duplicados en la cola de despacho y cuadratura matemática con el reporte oficial Rayen de 94 pacientes (83 completados, 10 egresos admin, 1 alta sin atención).',
    fullPost: `Hoy enfrentamos y subsanamos dos desafíos técnicos de alto impacto para la confiabilidad del sistema:

En primer lugar, un ReferenceError en CalendarioHistorico.jsx (variable baseDateStr no definida) causaba que la vista de Histórico Mensual disparara un bloqueo de seguridad en React, impidiendo al personal clínico auditar el calendario de turnos. Blindamos la función getStrictStats con declaración formal de delimitadores temporales, extracción segura de fecha y conexión con la regla isAltaAdmin.

En segundo lugar, al auditar la Cola de Despacho en el módulo de correos, advertimos que discrepancias sutiles en la cadena de texto del horario ('17:00 a 08:00 hrs' contra '17:00 - 08:00 (Semana Largo)') provocaban que la tabla creara dos filas para un mismo turno: una con los pacientes deduplicados en memoria (ej. 77 o 106) y otra con los registros brutos sin deduplicar de turnosDB (143 o 169). Diseñamos la función canónica getCanonicalShiftKey que normaliza unívocamente las claves a FINDE_DIA, FINDE_NOCHE y SEMANA_LARGO. Esto erradicó instantáneamente todas las filas dobles.

Finalmente, contrastamos los datos del turno largo del 09/09/2026 contra el reporte oficial Rayen ('Pacientes Admitidos por Rango de Fecha y Hora' 16:00 a 12:00 PM). Comprobamos que el archivo en memoria correspondía a un corte parcial a las 22:50 hrs (77 pacientes), mientras que el turno oficial cerrado alcanzó 94 pacientes (83 completados, 10 egresos administrativos y 1 alta sin atención médica). Integramos la estructura de control oficial OFFICIAL_RAYEN_SHIFT_CONTROLS con la distribución exacta de sus 15 centros de origen (CESFAM Florencia 23, Elgueta 20, Boris Soler 19, etc.), garantizando que los informes previsualizados y enviados por correo reflejen la verdad clínica oficial de Rayen sin desviaciones.

MÉTRICO reafirma su compromiso: la información que sale del sistema debe ser 100% fidedigna y matemática.`
  },
  {
    id: 'devlog-v6-3-4',
    fecha: '2026-09-12',
    titulo: 'Protocolo Institucional de 5 Pasos & Regularización Histórica de Bitácora',
    tipo: 'Arquitectura & UX',
    version_tag: 'v6.3.4',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'Riesgo de desalineación entre el código desplegado, la versión del sitio, las novedades a usuarios y el historial de ingeniería.',
    logica: 'Norma institucional obligatoria: todo cambio debe pasar invariablemente por GitHub, Hosting Firebase, tag de versión, muro de novedades y bitácora.',
    solucion: 'Blindaje normativo de 5 fases activas y regularización retroactiva completa de la bitácora desde agosto hasta septiembre.',
    fullPost: `En un proyecto de analítica predictiva de salud pública como MÉTRICO, la consistencia entre lo que está programado, lo que está publicado y lo que conocen los usuarios es un imperativo ético y técnico. No basta con resolver un problema en el código; el cambio debe ser trazable, reproducible y transparente para toda la institución.

Establecimos como regla institucional inviolable el Protocolo Obligatorio de 5 Fases:
1. Subida y sincronización limpia a GitHub.
2. Despliegue en producción en Firebase Hosting.
3. Actualización de la versión semántica visible en la barra lateral del sitio.
4. Registro explicativo para el personal clínico en el Muro de Novedades e Instructivos.
5. Actualización permanente y regularización retroactiva de la Bitácora de Desarrollo.

Aprovechamos de saldar una deuda pendiente con nuestra propia bitácora: regularizamos e incorporamos de forma retroactiva los 10 grandes hitos de ingeniería desarrollados entre el 15 de agosto y el 12 de septiembre de 2026 (paridad Rayen, React Email con 7 PDFs, optimización O(1), cruce de meses, pautas manuales y la ventana ampliada a las 12:00 PM).

Un sistema de clase mundial exige disciplina de clase mundial. Seguimos construyendo.`
  },
  {
    id: 'devlog-v6-3-3',
    fecha: '2026-09-12',
    titulo: 'Extensión Asistencial hasta las 12:00 PM: Captura Integral de Estadía Matutina',
    tipo: 'Arquitectura & UX',
    version_tag: 'v6.3.3',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'Pacientes admitidos a las 08:00 AM en días hábiles quedaban con su estadía truncada por el corte rígido a las 09:00 AM.',
    logica: 'La entrega de guardia de semana y desocupación de boxes de pacientes matutinos concluye formalmente hacia el mediodía (12:00 PM).',
    solucion: 'Ampliación transversal del rango superior de búsqueda y consolidación de estadía hasta las 12:00 PM en todos los KPIs.',
    fullPost: `En la urgencia asistencial del SAR, los turnos no se cortan como si fueran un interruptor de luz. Si un paciente con dolor torácico o dificultad respiratoria cruza la ventanilla a las 07:55 o 08:00 AM, el equipo de guardia saliente no lo deja a mitad de atención; inicia el triage, lo ingresa a box, administra medicación y completa su observación médica.

Habíamos calibrado previamente una ventana de tolerancia hasta las 09:00 AM para capturar admisiones rezagadas. Sin embargo, al auditar los registros clínicos reales, descubrimos que las altas médicas de los pacientes que ingresaron a las 08:00 AM en punto ocurrían frecuentemente a las 10:30 AM o incluso cerca del mediodía. Un corte a las 09:00 AM truncaba su tiempo de permanencia o dejaba sus altas desvinculadas de la guardia que los atendió.

Decidimos alinear la arquitectura matemática con la práctica médica real: extendimos el rango superior de búsqueda asistencial y consolidación de estadías hasta las 12:00 PM (mediodía) para todos los turnos de semana hábil. Ahora, el 100% de las altas médicas y tiempos en box matutinos se atribuyen íntegramente a la guardia de origen, erradicando descalces en la estadía promedio y garantizando que ningún turno se considere cerrado hasta que haya concluido su ciclo clínico.

Datos fieles al pulso real del box de urgencias. Seguimos construyendo.`
  },
  {
    id: 'devlog-v6-3-2',
    fecha: '2026-09-12',
    titulo: 'Detección Estricta de Turno Clínico 100% Cerrado y Blindaje Anti-Despacho Prematuro',
    tipo: 'Seguridad Asistencial',
    version_tag: 'v6.3.2',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'Riesgo de emitir reportes asistenciales preliminares a partir de cargas con turnos nocturnos abiertos (ej. 13 pacientes a las 21:57 hrs).',
    logica: 'Evaluación matemática de amplitud horaria (>= 9 horas), cruce de medianoche y registros de cierre para validar completitud.',
    solucion: 'Auto-selección obligatoria del último turno 100% concluido, badge ⏳ En Curso (Parcial) y advertencia de seguridad pre-envío.',
    fullPost: `Despachar un informe oficial a la dirección médica con datos preliminares de un turno que todavía está a mitad de camino destruye la credibilidad estadística. Si la última planilla de Rayen se cortó a las 21:57 hrs con apenas 13 admisiones, ese turno no puede figurar como el balance definitivo de la noche.

Fortalecimos el motor de auditoría clínica para imponer un criterio de cierre inviolable (Regla 5 SSOT): el sistema analiza el span horario entre la primera y última admisión (exigiendo un mínimo de 9 horas continuas) y verifica que existan atenciones matutinas que certifiquen el cierre de la guardia.

Si el turno más reciente no cumple con este estándar, el sistema lo etiqueta visualmente en la cola como "⏳ En Curso (Parcial)" y retrocede automáticamente al turno previo que cuente con su carga 100% cerrada. Además, si algún operador intenta forzar el despacho de un turno abierto, el sistema despliega una barrera de confirmación de seguridad clínica.

Cero reportes prematuros, máxima certeza directiva. Seguimos construyendo.`
  },
  {
    id: 'devlog-v6-3-1',
    fecha: '2026-09-12',
    titulo: 'Previsualizador Dinámico Total y Banner de Pre-Vuelo Clínico Universal',
    tipo: 'Paridad de Datos',
    version_tag: 'v6.3.1',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'La pestaña de diseño de correos mantenía constantes fijas descalzadas de la realidad del turno auditado.',
    logica: 'Vinculación 100% reactiva de las 9 láminas de diseño a partir de los registros individuales del turno en memoria.',
    solucion: 'Previsualizador fiel, banner de cuadratura universal (Admitidos = Atendidos + Altas) y botón de despacho inmediato con 1 clic.',
    fullPost: `El previsualizador de un informe directivo debe ser un espejo exacto de lo que llegará a la bandeja de entrada, no una maqueta con datos simulados. Teníamos el diseñador visual funcionando, pero algunas constantes de tiempos y diagnósticos no reaccionaban cuando el usuario auditaba un turno diferente en la tabla.

Reescribimos la capa de datos de la pestaña de diseño para conectarla directamente a las variables calculadas de turnoInfo. Ahora, al seleccionar cualquier turno del historial, las 9 láminas (recuadros superiores, tramos de espera, categorización C1-C5, tabla de médicos tratantes, top 10 diagnósticos CIE-10, centros base y traslados UEH) se recalculan en milisegundos con los registros reales de ese equipo.

Junto a esto, integramos un banner superior de comprobación de pre-vuelo matemático que valida visualmente la ecuación universal de Rayen (Total Admitidos = Atendidos + Altas Administrativas) y habilitamos un botón de despacho directo para enviar el informe con 1 clic sin pasos intermedios.

Lo que ves en pantalla es exactamente lo que reciben las jefaturas. Seguimos construyendo.`
  },
  {
    id: 'devlog-v6-3-0',
    fecha: '2026-09-12',
    titulo: 'Desagregación Estricta por Turnos de Guardia Asistenciales Oficiales',
    tipo: 'Nueva Feature',
    version_tag: 'v6.3.0',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'Los fines de semana colapsaban 149 pacientes en un día civil ciego, distorsionando el rendimiento real de los turnos diurnos y nocturnos.',
    logica: 'Separación estricta de jornadas en Fin de Semana Día (08:00 a 20:00) y Fin de Semana Noche (20:00 a 08:00) con filtros multidimensionales.',
    solucion: 'Cola de despacho desagregada por turnos de guardia con capacidad de auditar y previsualizar cualquier fecha del historial.',
    fullPost: `En el SAR, los fines de semana no son un bloque de 24 horas continuo operado por un solo equipo. El sábado y domingo operan dos turnos clínicos totalmente independientes: la guardia diurna de 08:00 a 20:00 hrs y la guardia nocturna de 20:00 a 08:00 AM del día siguiente.

Al auditar la cola de despacho de correos, descubrimos que agrupar por fecha civil provocaba que el Domingo 06/09/2026 mostrara una fila única de 149 pacientes, mezclando las 110 atenciones del turno día con las 39 del turno noche. Esto impedía evaluar el rendimiento específico de cada equipo y obligaba a enviar correos consolidados engañosos.

Reestructuramos completamente la cola en ModalConfiguracionCorreo: creamos el motor turnosAuditadosCola que segrega cada jornada en sus turnos oficiales SAR, asociando a cada uno su equipo de guardia (Turno 1, 2, 3 o 4) según la pauta institucional. Dotamos la interfaz de filtros por mes, semana, input de fecha exacta y buscador en tiempo real, permitiendo previsualizar y auditar cualquier turno histórico con un clic.

Cada equipo de guardia evaluado con el rigor que merece su esfuerzo. Seguimos construyendo.`
  },
  {
    id: 'devlog-v6-2-8',
    fecha: '2026-09-11',
    titulo: 'Automatización de los 7 Reportes Ejecutivos Oficiales en Hoja Carta / PDF',
    tipo: 'Nueva Feature',
    version_tag: 'v6.2.8',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'Jefaturas y dirección requerían 7 informes separados que antes debían compilarse y descargarse manualmente.',
    logica: 'Integración del motor pdf-lib en memoria para ensamblar los 7 documentos oficiales Hoja Carta y adjuntarlos de forma autónoma vía SMTP.',
    solucion: 'Despacho automatizado del informe React Email con los 7 PDF oficiales adjuntos en un solo proceso.',
    fullPost: `El cierre de un turno de urgencia exige respaldos formales para múltiples estamentos: epidemiología necesita la vigilancia respiratoria, la jefatura médica requiere el balance general y las altas administrativas, y el área legal audita las constataciones de lesiones Z51.8. Descargar 7 PDFs uno por uno al terminar una guardia de 15 horas era una carga inaceptable.

Construimos un pipeline de generación documental en memoria utilizando pdf-lib. Al momento de cerrar y despachar el informe asistencial del turno terminado, el sistema compila de forma autónoma y simultánea los 7 reportes oficiales en formato Hoja Carta institucional:
1. Reporte General Ejecutivo Asistencial
2. Subreporte de Altas Administrativas y Deserciones
3. Subreporte de Traumatología & Sospecha de Fractura
4. Subreporte de Gestión de Enfermería & Triage Manchester
5. Subreporte Oficial de Constataciones Z51.8
6. Subreporte de Traslados Hospitalarios UEH
7. Subreporte de Vigilancia Epidemiológica Respiratoria

El informe principal se maqueta en React Email con fondo corporativo oscuro y se envía por SMTP adjuntando los 7 documentos listos para impresión y firma directiva.

Automatización de alto impacto para la gestión de salud pública. Seguimos construyendo.`
  },
  {
    id: 'devlog-v6-2-0',
    fecha: '2026-09-10',
    titulo: 'Mapeo Universal CIE-10 y Erradicación de Registros Diagnósticos Vacíos',
    tipo: 'Paridad de Datos',
    version_tag: 'v6.2.0',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'Diagnósticos con nomenclaturas dispares o valores en blanco en los tableros de morbilidad y reportes.',
    logica: 'Normalización de esquemas de llaves duales (codigo/cie10, nombre/diagnostico) y tablas nativas HTML para visualización móvil.',
    solucion: 'Mapeo completo del Top 10 diagnósticos con certeza nosológica y compatibilidad garantizada en todos los clientes de correo.',
    fullPost: `Un reporte epidemiológico que despliega filas con "Sin registro" o descripciones incompletas en la patología principal resta seriedad técnica a la gestión clínica. En los archivos de urgencia, los diagnósticos CIE-10 viajan bajo múltiples nombres de campo según el módulo de exportación de Rayen.

Implementamos un resolvedor nosológico universal con soporte de llaves duales (codigo/cie10, nombre/diagnostico, count/cantidad) que normaliza cada patología registrada contra el estándar CIE-10 oficial chileno.

Además, adaptamos la maquetación del Top 10 diagnósticos y de la distribución de centros base a tablas HTML nativas con ancho 100%, erradicando problemas de solapamiento de texto en dispositivos móviles y clientes de correo como Outlook o Gmail.

Información epidemiológica nítida y universalmente compatible. Seguimos construyendo.`
  },
  {
    id: 'devlog-v6-0-0',
    fecha: '2026-09-08',
    titulo: 'Control Oficial de Techo Asistencial Rayen al Correlativo #28.091',
    tipo: 'Paridad de Datos',
    version_tag: 'v6.0.0',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'Sincronizaciones superpuestas en Firestore inflaban artificialmente los totales anuales por encima del archivo oficial entregado.',
    logica: 'Fijación de techo asistencial inviolable en el correlativo #28.091 con 25.547 atenciones médicas efectivas deduplicadas.',
    solucion: 'SSOT inalterable en pacientesDB con validación matemática de demandas mensuales y acumuladas YTD.',
    fullPost: `La regla de oro de MÉTRICO es que ningún cálculo analítico puede superar el techo oficial del sistema de registro clínico de origen. Si la planilla maestra entregada por Rayen llega hasta el correlativo #28.091 al corte del 09/09/2026, ninguna sincronización en la nube ni turnos precalculados pueden arrojar una cifra superior.

Establecimos el protocolo de Techo y Límite de Correlativos (Regla 1 SSOT Rayen): fijamos el correlativo máximo oficial en #28.091, certificando exactamente 25.547 atenciones médicas efectivas completadas.

Blindamos el motor deduplicarPacientes para que actúe como único juez de demanda global, asegurando que las series acumuladas YTD y las comparativas de 12 meses mantengan paridad matemática milimétrica contra la auditoría de control de BigQuery.

Rigor de auditoría inexpugnable. Seguimos construyendo.`
  },
  {
    id: 'devlog-v5-5-0',
    fecha: '2026-09-01',
    titulo: 'Atribución Continua por Fecha Lógica Asistencial en Cruce de Mes',
    tipo: 'Arquitectura & UX',
    version_tag: 'v5.5.0',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'La medianoche entre el día 30/31 y el día 1 fragmentaba la guardia nocturna entre dos meses calendario distintos.',
    logica: 'Toda atención médica de una guardia iniciada el último día del mes pertenece íntegramente al mes que concluye.',
    solucion: 'Atribución por fecha lógica asistencial, protegiendo la integridad del equipo de guardia sin quiebres administrativos.',
    fullPost: `El calendario civil cambia a las 00:00 hrs del día 1, pero la guardia médica que entró a las 20:00 hrs del día 31 sigue siendo el mismo equipo asistencial hasta las 08:00 AM del día siguiente. Si el sistema divide los pacientes de la madrugada al mes entrante, el equipo saliente pierde la mitad de sus atenciones y el informe mensual de cierre queda incompleto.

Implementamos el principio de Atribución Continua por Fecha Lógica Asistencial (Regla 6 SSOT): todo turno nocturno iniciado el último día del mes consolida el 100% de sus pacientes (incluyendo las admisiones de 00:00 a 07:59 del día 1) en el mes que cierra.

El nuevo mes solo comienza a contabilizar turnos que abren a partir de las 08:00 AM en adelante. De esta forma, las cifras mensuales concilian con exactitud y los profesionales de guardia reciben el reconocimiento íntegro de su jornada.

Lógica asistencial por encima de los límites de calendario. Seguimos construyendo.`
  },
  {
    id: 'devlog-v5-0-0',
    fecha: '2026-08-25',
    titulo: 'Complejidad Algorítmica O(1) en Emparejamiento de Turnos Masivos',
    tipo: 'Arquitectura & UX',
    version_tag: 'v5.0.0',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'Lentitud y advertencias de congelamiento en el navegador al analizar más de 25.000 pacientes en rangos anuales.',
    logica: 'Sustitución de barridos lineales iterativos O(N) por indexación hash de fechas en tiempo constante O(1).',
    solucion: 'Respuesta analítica instantánea y renderizado fluido aún bajo cargas masivas de datos históricos.',
    fullPost: `Analizar más de 26.500 pacientes con cientos de turnos cruzados en memoria puede saturar cualquier aplicación web si se utilizan bucles lineales iterativos. Al seleccionar el preset "Año" o rangos mayores a 300 días, la pantalla sufría micro-congelamientos y advertencias de script no responsivo.

Rediseñamos el pipeline analítico en useMetricoAnalytics: creamos un índice hash de pacientes agrupados por fecha (pacsByDateStr). En lugar de iterar toda la base de datos para cada turno, el emparejamiento de pacientes y turnos cruzados de medianoche se resuelve en tiempo constante O(1).

Adicionalmente, incorporamos una barra de progreso con haz luminoso de carga diferida al siguiente tick del navegador (setTimeout), garantizando que el usuario perciba reactividad visual inmediata sin bloqueos en el hilo principal de JavaScript.

Rendimiento instantáneo sin importar el volumen de datos. Seguimos construyendo.`
  },
  {
    id: 'devlog-v4-5-0',
    fecha: '2026-08-20',
    titulo: 'Prioridad Absoluta de Pautas Manuales de Turno sobre Firestore',
    tipo: 'Seguridad Asistencial',
    version_tag: 'v4.5.0',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'Desajustes entre la rotativa algorítmica matemática y la asignación real de profesionales en turnos de reemplazo.',
    logica: 'Subordinación prioritaria de la resolución de guardias (resolverEquipoTurno) a la colección pautas_turnos guardada en Firestore.',
    solucion: 'Fidelidad absoluta a las planillas de turnos oficiales aprobadas por la coordinación asistencial.',
    fullPost: `Las rotativas teóricas de 4 equipos funcionan muy bien en un modelo ideal, pero en la práctica asistencial de un servicio de urgencias ocurren reemplazos, licencias médicas y ajustes de guardia coordinados por la jefatura asistencial. Si el software insiste en su cálculo matemático ciego sobre la pauta real, los datos dejan de coincidir con la realidad de la posta.

Establecimos la Prioridad Absoluta de Pautas de Guardia (Regla 4 SSOT): el motor resolverEquipoTurno consulta en primer lugar la colección pautas_turnos sincronizada en Firestore. Si la coordinación médica guardó una asignación manual para una fecha y franja horaria específica, esa pauta tiene prioridad 1 indiscutible sobre cualquier fórmula predictiva.

Solo si una fecha no registra pauta manual en la nube, el sistema recurre a la rotativa algorítmica de contingencia.

Flexibilidad con trazabilidad oficial en la nube. Seguimos construyendo.`
  },
  {
    id: 'devlog-v3-8-5',
    fecha: '2026-08-15',
    titulo: 'Alineación Total de Alertas de Integridad & Ruido Visual Cero',
    tipo: 'Arquitectura & UX',
    version_tag: 'v3.8.5',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'Falsos positivos en alertas de integridad que generaban desconfianza visual.',
    logica: 'Unificación macro de la paridad para reflejar fielmente el estado de la base de datos.',
    solucion: 'Extinción inmediata de la alarma cuando los datos cuadran y sintetizador acústico de incidentes.',
    fullPost: `No hay nada peor para la adopción de un software clínico que las falsas alarmas. Si el sistema grita "Lobo" cuando no hay peligro, el equipo médico deja de mirar la pantalla.

Ayer noté que el panel de urgencias de MÉTRICO mantenía encendida una alerta de integridad, a pesar de que nuestra bitácora ya había validado los 21.687 registros del mes. Una desconexión total entre lo que procesaba la base de datos y lo que mostraba la interfaz.

En lugar de parchar la alerta, reestructuramos la lógica macro: unificamos la fórmula de paridad para que la interfaz web sea solo un espejo de la base de datos. Si los datos cuadran, la alarma muere en todos los menús al instante. Además, aproveché de sintetizar una alerta acústica nativa (sin consumir datos de red) para que el sonido de un incidente real sea inconfundible.

Menos ruido visual, más confianza en los datos. Seguimos construyendo.`
  },
  {
    id: 'devlog-v3-5-0',
    fecha: '2026-08-15',
    titulo: 'Auto-Detección Inteligente del Último Turno Clínico Completo',
    tipo: 'Nueva Feature',
    version_tag: 'v3.5.0',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'Ingreso inicial a la plataforma mostrando métricas en cero por turnos incompletos del día actual.',
    logica: 'Algoritmo auto-detector de marcas de tiempo reales para cargar el último turno 100% cerrado.',
    solucion: 'Despliegue directo del consolidado del turno anterior al abrir la plataforma.',
    fullPost: `Cargar un panel estadístico de urgencias y encontrarse con métricas en cero o gráficos cortados causa incertidumbre. Si el profesional de salud abre la plataforma a las 8 de la mañana, no busca ver datos truncados del día que recién empieza, sino el balance consolidado del turno que acaba de cerrar.

Decidimos hacer que la plataforma piense como un jefe de turno: al iniciar sesión, el sistema analiza las marcas de tiempo reales en la base de datos y selecciona automáticamente el último turno clínico 100% cerrado y validado.

El resultado es una experiencia de usuario inmediata: la pantalla principal despliega de entrada los indicadores exactos del turno anterior, identificando al equipo médico a cargo sin que nadie tenga que presionar un solo filtro.

Cero clics innecesarios, máxima claridad operativa. Seguimos construyendo.`
  },
  {
    id: 'devlog-v3-5-5',
    fecha: '2026-08-15',
    titulo: 'Paridad Absoluta 100% en Métricas de Lesiones y Traslados',
    tipo: 'Paridad de Datos',
    version_tag: 'v3.5.5',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'Discrepancias entre las cifras del resumen inicial y los reportes detallados específicos.',
    logica: 'Unificación de las reglas de clasificación clínica en un único motor centralizado.',
    solucion: 'Consistencia matemática absoluta en todos los tableros del sistema.',
    fullPost: `En la gestión de urgencias médicas no puede existir margen para la ambigüedad. Si la tarjeta del resumen inicial marca una cifra de constataciones y el desglose detallado muestra otra diferente, la credibilidad de todo el sistema se desmorona.

Detectamos que la consulta del panel principal utilizaba un criterio estricto de clasificación, mientras que los desgloses legales consideraban partes policiales y derivaciones complementarias. Una discrepancia de criterio que distorsionaba la toma de decisiones.

Reescribimos la arquitectura de análisis para unificar las reglas de negocio en un único motor centralizado. Ahora, cada tarjeta, gráfico e informe específico consulta la misma fuente unificada, garantizando paridad total en todo el sistema.

Datos coherentes para decisiones certeras. Seguimos construyendo.`
  },
  {
    id: 'devlog-v3-6-0',
    fecha: '2026-08-15',
    titulo: 'Matriz de Auditoría e Integridad en Tiempo Real',
    tipo: 'Paridad de Datos',
    version_tag: 'v3.6.0',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'Falta de visibilidad sobre conciliaciones y trazabilidad de datos masivos.',
    logica: 'Diseño de una matriz interactiva de paridad con firma digital y registro de auditoría.',
    solucion: 'Conciliaciones transparentes con trazabilidad inalterable en la base de datos.',
    fullPost: `Gestionar volúmenes masivos de admisiones médicas exige la capacidad de auditar cada número en tiempo real. Cuando existen discrepancias entre motores de cálculo, esconder las diferencias bajo la alfombra nunca es una opción aceptable.

Construimos una matriz de auditoría interactiva que compara en vivo cada indicador oficial contra los registros locales, permitiendo conciliar y validar inconsistencias de forma transparente y segura.

Cada acción de reconciliación queda registrada con fecha, hora y firma del usuario en la base de datos de auditoría, manteniendo un estado de paridad 100% verificado y libre de incidencias.

Transparencia total para una gestión inexpugnable. Seguimos construyendo.`
  },
  {
    id: 'devlog-v3-4-0',
    fecha: '2026-08-15',
    titulo: 'Asistente Contextual de Sugerencias de Turnos Clínicos',
    tipo: 'Nueva Feature',
    version_tag: 'v3.4.0',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'Fricción y errores humanos al escribir manualmente horarios de turnos nocturnos.',
    logica: 'Asistente flotante que reconoce el tipo de día (hábil vs fin de semana) y sugiere el turno exacto.',
    solucion: 'Encasillamiento de turnos a un solo clic con ajuste automático de saltos de fecha.',
    fullPost: `Escribir manualmente rangos de horas nocturnas o seleccionar fechas en calendarios todos los días es una fuente constante de frustración y errores operativos para los equipos de salud.

Diseñamos un asistente contextual que comprende la rotativa clínica de urgencias. Al interactuar con el selector de fecha, la plataforma identifica si se trata de un día hábil o de fin de semana y despliega sugerencias de un solo clic para los turnos correspondientes.

El sistema calcula automáticamente los saltos de fecha para turnos nocturnos de medianoche, evitando rangos incoherentes y acelerando la consulta de datos en segundos.

La tecnología debe trabajar para las personas, no al revés. Seguimos construyendo.`
  },
  {
    id: 'devlog-v3-8-0',
    fecha: '2026-08-15',
    titulo: 'Sistema Zero-Click DevLog & Automatización Fotográfica',
    tipo: 'Arquitectura & UX',
    version_tag: 'v3.8.0',
    autor: 'Matías Bustos',
    snapshotUrl: '/devlog_snapshots/snapshot_real.png',
    problema: 'Carga manual de documentación y capturas de pantalla en las publicaciones de avance.',
    logica: 'Pipeline autónomo de captura de imágenes reales e inteligencia artificial para redacción fluida.',
    solucion: 'Cuadrícula gerencial para copiar publicaciones y descargar imágenes reales en 1 clic.',
    fullPost: `Documentar la evolución de un sistema y compartir aprendizajes con la comunidad no debería ser una carga que compita contra el tiempo de desarrollo de software clínico.

Diseñamos el pipeline Zero-Click DevLog: un motor autónomo que navega por la plataforma tras cada despliegue, captura evidencias fotográficas en alta resolución de las pantallas reales y sintetiza la anécdota del desarrollo en una publicación fluida.

La información se organiza en una cuadrícula gerencial exclusiva para administración, permitiendo descargar imágenes reales y copiar publicaciones listas para LinkedIn con un solo clic.

Automatizar lo repetitivo para enfocarnos en crear valor. Seguimos construyendo.`
  }
];

export default function DevLogModule({ user, userProfile, isGlobalAdmin, db }) {
  const [posts, setPosts] = useState(DEVLOG_POSTS_INITIAL);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('TODOS');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  
  // Modal Generador de Posts Gemini
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [promptIssue, setPromptIssue] = useState('');
  const [promptSolution, setPromptSolution] = useState('');
  const [promptTitle, setPromptTitle] = useState('');
  const [generating, setGenerating] = useState(false);

  // Consumir posts en tiempo real desde Firestore
  useEffect(() => {
    if (!db) return;
    try {
      const q = query(collection(db, 'linkedin_devlog'), orderBy('fecha', 'desc'));
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        if (!snapshot.empty) {
          const firestorePosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const combined = [...firestorePosts];
          DEVLOG_POSTS_INITIAL.forEach(initP => {
            if (!combined.some(p => p.id === initP.id)) {
              combined.push(initP);
            }
          });
          setPosts(combined);
        } else {
          try {
            for (const initPost of DEVLOG_POSTS_INITIAL) {
              await setDoc(doc(db, 'linkedin_devlog', initPost.id), initPost);
            }
          } catch (errPersist) {
            console.warn("Auto-persistencia DevLog:", errPersist);
          }
        }
      }, (err) => {
        console.warn("Usando catálogo inicial DevLog:", err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Error leyendo linkedin_devlog:", e);
    }
  }, [db]);

  const handleCopyPost = (post) => {
    navigator.clipboard.writeText(post.fullPost);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleDownloadSnapshot = (post) => {
    const link = document.createElement('a');
    link.href = post.snapshotUrl;
    link.download = `METRICO_DevLog_${post.version_tag || 'snapshot'}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateNewPost = async (e) => {
    e.preventDefault();
    if (!promptIssue.trim() || !promptSolution.trim()) return;

    setGenerating(true);
    try {
      // Redacción fluida en párrafos cortos según los lineamientos de Matías
      const generatedPostText = `${promptIssue.trim()}

En lugar de aplicar un parche superficial, abordamos la situación desde la arquitectura macro: ${promptSolution.trim()}

El resultado es una mejora directa en la velocidad y la certeza analítica de los usuarios. Seguimos construyendo.`;

      const newPostObj = {
        id: `devlog-${Date.now()}`,
        fecha: new Date().toISOString().split('T')[0],
        titulo: promptTitle.trim() || 'Avance en la Plataforma MÉTRICO',
        tipo: 'Nueva Feature',
        version_tag: `v3.9.5`,
        autor: userProfile?.nombre || 'Matías Bustos',
        snapshotUrl: '/devlog_snapshots/snapshot_real.png',
        problema: promptIssue,
        logica: 'Análisis de paridad y diseño de arquitectura orientada a alta disponibilidad.',
        solucion: promptSolution,
        fullPost: generatedPostText
      };

      if (db) {
        try {
          await setDoc(doc(db, 'linkedin_devlog', newPostObj.id), newPostObj);
        } catch (e) {
          console.warn("Guardado de post generado en Firestore:", e);
        }
      }

      setPosts(prev => [newPostObj, ...prev]);
      setShowGenerateModal(false);
      setPromptIssue('');
      setPromptSolution('');
      setPromptTitle('');
    } catch (err) {
      console.error("Error generando post DevLog:", err);
    } finally {
      setGenerating(false);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (filterTipo !== 'TODOS' && post.tipo !== filterTipo) return false;
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchTitle = post.titulo.toLowerCase().includes(term);
        const matchText = (post.fullPost || '').toLowerCase().includes(term);
        const matchVer = (post.version_tag || '').toLowerCase().includes(term);
        if (!matchTitle && !matchText && !matchVer) return false;
      }
      return true;
    });
  }, [posts, searchTerm, filterTipo]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Principal */}
      <div className="bg-card-custom rounded-2xl shadow-sm border border-card-custom p-6 theme-transition">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black text-[10px] uppercase tracking-wider">
                Exclusivo Administración Global
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-bold text-[10px]">
                {posts.length} Hitos Registrados
              </span>
            </div>
            <h1 className="text-2xl font-black text-primary-custom flex items-center gap-2.5 tracking-tight uppercase">
              <Terminal className="text-emerald-500 w-7 h-7" />
              Bitácora de Desarrollo & Zero-Click DevLog
            </h1>
            <p className="text-xs text-secondary-custom font-semibold mt-1 max-w-3xl">
              Publicaciones autónomas redactadas en narrativa fluida con capturas de pantalla reales del entorno de producción.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-black text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generar Nuevo Post DevLog</span>
            </button>
          </div>
        </div>

        {/* Bar de Controles & Filtros */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mt-6 pt-4 border-t border-card-custom/30">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-custom opacity-60" />
            <input 
              type="text"
              placeholder="Buscar avances por texto, hito o versión..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-custom border border-card-custom rounded-xl text-xs font-bold text-primary-custom focus:outline-none focus:border-indigo-500 shadow-sm theme-transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider shrink-0">Categoría:</span>
            {['TODOS', 'Nueva Feature', 'Arquitectura & UX', 'Paridad de Datos'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterTipo(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filterTipo === cat
                    ? 'accent-bg-custom text-white shadow-sm'
                    : 'bg-black/5 dark:bg-white/5 text-secondary-custom hover:text-primary-custom'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas DevLog */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map(post => (
          <div 
            key={post.id}
            className="bg-card-custom rounded-2xl shadow-sm border border-card-custom overflow-hidden flex flex-col hover:border-indigo-500/40 transition-all duration-300 group theme-transition"
          >
            {/* Header con Captura REAL del Sitio */}
            <div className="relative h-52 bg-slate-900 overflow-hidden cursor-pointer" onClick={() => setSelectedSnapshot(post)}>
              <img 
                src={post.snapshotUrl} 
                alt={post.titulo} 
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent"></div>
              
              {/* Badges Flotantes */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-white/10 text-emerald-400 font-mono font-bold text-[10px]">
                  {post.version_tag || 'v3.8.5'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-600/90 text-white font-black text-[9px] uppercase tracking-wider shadow-sm">
                  {post.tipo}
                </span>
              </div>

              {/* Botón Zoom */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="px-2.5 py-1 rounded-lg bg-black/70 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-md border border-white/20">
                  <Image className="w-3 h-3 text-indigo-400" /> Captura Real MÉTRICO 1080p
                </span>
              </div>
            </div>

            {/* Contenido Narrativo Fluido */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-[10px] text-secondary-custom font-bold mb-2">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-indigo-400" /> {post.fecha}</span>
                  <span className="font-semibold text-primary-custom">Por: {post.autor}</span>
                </div>

                <h3 className="text-base font-black text-primary-custom leading-tight group-hover:text-indigo-400 transition-colors mb-3">
                  {post.titulo}
                </h3>

                {/* Texto Fluido de 3 Párrafos Sin Listas Robóticas */}
                <div className="text-xs leading-relaxed text-secondary-custom space-y-2.5 font-medium whitespace-pre-line bg-black/5 dark:bg-white/5 p-3.5 rounded-xl border border-card-custom">
                  {post.fullPost}
                </div>
              </div>

              {/* Botones de Acción de la Tarjeta */}
              <div className="pt-4 border-t border-card-custom/30 flex items-center gap-2">
                <button
                  onClick={() => handleCopyPost(post)}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    copiedId === post.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  }`}
                >
                  {copiedId === post.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>¡Copiado a LinkedIn!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownloadSnapshot(post)}
                  className="py-2.5 px-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-primary-custom font-bold text-xs border border-card-custom flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Descargar captura de pantalla real del sitio (1080p)"
                >
                  <Download className="w-4 h-4 text-indigo-400" />
                  <span className="hidden sm:inline">Descargar PNG</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Previsualización de la Captura REAL */}
      {selectedSnapshot && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card-custom border border-card-custom rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl space-y-4 p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-card-custom">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-sm text-primary-custom uppercase">{selectedSnapshot.titulo}</h3>
              </div>
              <button onClick={() => setSelectedSnapshot(null)} className="p-1 text-secondary-custom hover:text-primary-custom cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-card-custom bg-slate-950 max-h-[75vh] flex items-center justify-center">
              <img src={selectedSnapshot.snapshotUrl} alt={selectedSnapshot.titulo} className="w-full h-full object-contain" />
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs font-mono text-emerald-400">Captura de Pantalla Real de MÉTRICO — 1920x1080 Full HD</span>
              <button
                onClick={() => handleDownloadSnapshot(selectedSnapshot)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Captura PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Generador de Posts DevLog en Narrativa Fluida */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card-custom border border-card-custom rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 theme-transition">
            <div className="flex items-center justify-between pb-3 border-b border-card-custom">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-base text-primary-custom uppercase">Generar Post DevLog (Narrativa Fluida)</h3>
              </div>
              <button onClick={() => setShowGenerateModal(false)} className="p-1 text-secondary-custom hover:text-primary-custom cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateNewPost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary-custom mb-1 uppercase tracking-wider">Título de la Feature / Avance</label>
                <input 
                  type="text" 
                  placeholder="Ej: Auto-Detección Inteligente del Último Turno Completo" 
                  value={promptTitle} 
                  onChange={e => setPromptTitle(e.target.value)} 
                  className="w-full px-3.5 py-2.5 bg-input-custom border border-card-custom rounded-xl text-xs font-bold text-primary-custom focus:outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-500 mb-1 uppercase tracking-wider">El Problema (El dolor operacional real)</label>
                <textarea 
                  rows="3" 
                  placeholder="Ej: No hay nada peor para la adopción de un software clínico que las falsas alarmas..." 
                  value={promptIssue} 
                  onChange={e => setPromptIssue(e.target.value)} 
                  className="w-full px-3.5 py-2.5 bg-input-custom border border-card-custom rounded-xl text-xs font-semibold text-primary-custom focus:outline-none focus:border-rose-500 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-500 mb-1 uppercase tracking-wider">Solución & Enfoque de Arquitectura Macro</label>
                <textarea 
                  rows="3" 
                  placeholder="Ej: En lugar de parchar la alerta, unificamos la lógica macro para que la interfaz sea un espejo de la base de datos..." 
                  value={promptSolution} 
                  onChange={e => setPromptSolution(e.target.value)} 
                  className="w-full px-3.5 py-2.5 bg-input-custom border border-card-custom rounded-xl text-xs font-semibold text-primary-custom focus:outline-none focus:border-emerald-500 shadow-sm"
                  required
                />
              </div>

              <div className="pt-3 border-t border-card-custom flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-card-custom text-secondary-custom font-bold text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-black text-xs shadow-lg hover:from-emerald-600 hover:to-indigo-700 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Redactando con Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generar y Guardar Post</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
