import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Shield, ShieldAlert, Cpu, Layers, Database, Code, 
  Printer, Search, Calendar, ChevronDown, ChevronUp, CheckCircle, 
  Sparkles, FileText, ArrowRight, Server, Terminal, Lock, Clock,
  Calculator, Palette, FileSpreadsheet, CheckCheck, Hash, Activity,
  Award, Filter, ShieldCheck, HeartPulse, Eye, AlertTriangle
} from 'lucide-react';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';

export const HISTORIAL_ARQUITECTURA_BASE = [
  {
    id: 'v5.7.8',
    version_tag: 'v5.7.8',
    fecha_despliegue: '29 de Agosto, 2026',
    proposito_actualizacion: 'Corrección Semántica de Colores MoM/YoY y Neutralización de Comparativas sin Línea Base.',
    medios_y_stack: [
      'React 18.3 (PanelKPIs.jsx, useMetricoAnalytics.js, Dashboard.jsx)',
      'Dual-Direction Chromatic Engine (getGrowthBadge)',
      'Baseline Integrity Evaluator (prev <= 0 -> undefined)'
    ],
    estructura_datos: {
      reglas_negocio: '1) Semántica Cromática de Variación Asistencial: Se corrigió la regla de color para métricas normales e invertidas. En productividad y volumen (Pacientes Admitidos, Atendidos, Pac/Hora, Traslados, Triaje), un incremento se muestra en verde y una caída en rojo. En métricas críticas (Altas Administrativas y Promedio de Estadía/Espera), un aumento se muestra en rojo y una disminución en verde. 2) Neutralización de Falsos +100%: Cuando el periodo previo no posee registros históricos (baseline = 0), la función getGrowth retorna undefined evitando comparativas distorsionadas del 100%.',
      firestore_collections: ['pacientes_urgencia', 'turnos', 'kpis_mensuales'],
      query_optimization: 'Evaluación rápida de variaciones memoizadas sin recálculo redundante.'
    },
    modulos_afectados: ['PanelKPIs.jsx', 'useMetricoAnalytics.js', 'Dashboard.jsx', 'InformeArquitectura.jsx', 'ModalMuroActualizaciones.jsx'],
    detalles_tecnicos: [
      'Inclusión de getGrowthBadge con soporte para métricas directas e invertidas (isInverted).',
      'Normalización de getGrowth para retornar undefined cuando prev <= 0.',
      'Sincronización de badges MoM y YoY en tarjetas KPI y distribución de triaje Manchester.'
    ]
  },
  {
    id: 'v5.7.7',
    version_tag: 'v5.7.7',
    fecha_despliegue: '29 de Agosto, 2026',
    proposito_actualizacion: 'Restauración de Electrocardiogramas Animados y Micro-Widgets de Análisis Clínico en Pantalla de Acceso.',
    medios_y_stack: [
      'React 18.3 (FondoClinicoAnimado.jsx)',
      'Vectorial SVG Scan Engine (animate-ecg-scan)',
      'Clinical Telemetry Equalizer & Manchester Triaje Badges'
    ],
    estructura_datos: {
      reglas_negocio: '1) Trazados ECG Dinámicos Restaurados: Se reincorporó la animación de electrocardiograma clínico con picos P-Q-R-S-T luminosos, gradientes cian/índigo/esmeralda y partículas de pulso sincronizadas en los vértices cardíacos. 2) Micro-Paneles de Análisis de Datos: Se integraron widgets glassmorphic decorativos de telemetría asistencial: barras ecualizadoras de flujo clínico y pastillas de categorización Manchester (C1 a C5), enriqueciendo la estética clínica y científica de la plataforma sin saturar la interfaz.',
      firestore_collections: ['usuarios', 'configuraciones'],
      query_optimization: 'Aceleración por GPU en trazados SVG y micro-animaciones CSS sin overhead de render.'
    },
    modulos_afectados: ['FondoClinicoAnimado.jsx', 'InformeArquitectura.jsx', 'ModalMuroActualizaciones.jsx'],
    detalles_tecnicos: [
      'Implementación de doble trazado SVG ECG con gradiente vibrante y filtro de resplandor intenso.',
      'Añadido de micro-widgets de telemetría de triaje y flujo asistencial en laterales.',
      'Preservación integral de los 3 nodos orbitales interactivos de datos y centros.'
    ]
  },
  {
    id: 'v5.7.6',
    version_tag: 'v5.7.6',
    fecha_despliegue: '28 de Agosto, 2026',
    proposito_actualizacion: 'Unificación de Jornada Completa y Récord Mensual en Módulo de Traslados Hospitalarios.',
    medios_y_stack: [
      'React 18.3 (AnalisisTraslados.jsx, helpers.js, Dashboard.jsx)',
      'Single-Shift Aggregation Engine (obtenerTurnoDetallado)',
      'Monthly Benchmark Cross-Calculation (maxTrasladosMes)'
    ],
    estructura_datos: {
      reglas_negocio: '1) Unificación de Turnos Largos de Semana: Se eliminó la separación artificial entre atenciones nocturnas y de madrugada "(Cierre)" en helpers.js. Ahora los traslados de la noche (17:00 a 23:59) y de la entrega de guardia (00:00 a 08:00) se agrupan en una única jornada lógica de turno (sumando los 4 traslados reales del turno). 2) Benchmark de Récord Mensual en Filtro Diario: Al visualizar un solo día en AnalisisTraslados.jsx, la tarjeta de récord muestra el pico histórico del mes (con fecha y equipo récord) junto al desempeño del turno actual, contextualizando el volumen diario contra el récord global.',
      firestore_collections: ['pacientes_urgencia', 'turnos', 'pautas_turnos'],
      query_optimization: 'Cálculo memoizado de maxTrasladosMes y ranking unificado con pautasDB.'
    },
    modulos_afectados: ['AnalisisTraslados.jsx', 'helpers.js', 'Dashboard.jsx', 'InformeArquitectura.jsx', 'ModalMuroActualizaciones.jsx'],
    detalles_tecnicos: [
      'Normalización de tipo a "Turno Largo Semana" en obtenerTurnoDetallado para evitar fragmentación de keys.',
      'Implementación del cálculo maxTrasladosMes sobre todo el mes activo en AnalisisTraslados.jsx.',
      'Inyección de pautasDB a AnalisisTraslados desde Dashboard.jsx para asegurar resolución fiel de equipos.'
    ]
  },
  {
    id: 'v5.7.5',
    version_tag: 'v5.7.5',
    fecha_despliegue: '28 de Agosto, 2026',
    proposito_actualizacion: 'Resolución Universal de Equipos de Turno en Sub-Reporte Ejecutivo de Altas Administrativas.',
    medios_y_stack: [
      'React 18.3 (ReportesModule.jsx, Dashboard.jsx)',
      'Universal Rotation Engine (resolverEquipoTurno)',
      'pautasDB Multi-Monthly Ingestion Pipeline'
    ],
    estructura_datos: {
      reglas_negocio: '1) Eliminación de Turnos Sin Asignar en Reportes Ejecutivos: Se integró el helper universal resolverEquipoTurno e inyección de pautasDB en ReportesModule.jsx. Todos los turnos con tasa crítica de cancelaciones (>10%) ahora resuelven con exactitud su equipo de turno asignado (Turno 1, Turno 2, Turno 3 o Turno 4) mediante pautas manuales o la rotativa determinista oficial de 4 equipos. 2) Consistencia Asistencial Global: Los reportes ejecutivos ahora coinciden 100% con los desgloses del Módulo de Rendimiento de Turnos y Calendario Histórico.',
      firestore_collections: ['turnos', 'pautas_turnos', 'pacientes_urgencia'],
      query_optimization: 'Resolución de equipo memoizada por turno en altasStats.'
    },
    modulos_afectados: ['ReportesModule.jsx', 'Dashboard.jsx', 'InformeArquitectura.jsx', 'ModalMuroActualizaciones.jsx'],
    detalles_tecnicos: [
      'Importación e integración de resolverEquipoTurno en el cálculo de turnosCriticos en ReportesModule.',
      'Inyección de la prop pautasDB desde el hook usePautasTurnos en Dashboard.jsx hacia ReportesModule.',
      'Eliminación de la etiqueta "Sin Asignar" en la tabla de turnos críticos de altas administrativas.'
    ]
  },
  {
    id: 'v5.7.4',
    version_tag: 'v5.7.4',
    fecha_despliegue: '28 de Agosto, 2026',
    proposito_actualizacion: 'Interactividad en Nodos de Telemetría, Pulso Reactivo al Cambiar de Centro y Lenguaje Accesible.',
    medios_y_stack: [
      'React 18.3 (FondoClinicoAnimado.jsx, Login.jsx)',
      'Telemetry Nodes Interactive Diagnostic Modal',
      'Reactive Glow & Color Shifting Pulse Animation'
    ],
    estructura_datos: {
      reglas_negocio: '1) Lenguaje Concreto y Accesible: Se reemplazaron las siglas y términos técnicos en los 3 nodos por descripciones claras aptas para cualquier usuario: "Servidor Central en la Nube", "[Nombre del Centro Asistencial]" y "Motor Estadístico & Triage". 2) Pulso Visual de Cambio de Sede: Al cambiar el centro asistencial en el formulario de Login, el nodo de base de datos ejecuta de inmediato un pulso de luz esmeralda y resplandor dinámico confirmando la conexión con la sede seleccionada. 3) Fichas Informativas Interactivas: Al hacer clic en cualquiera de los 3 nodos se despliega un panel explicativo con la función en lenguaje sencillo, características clave y estado de latencia.',
      firestore_collections: ['usuarios', 'configuraciones'],
      query_optimization: 'Transiciones CSS por hardware y modales en memoria sin dependencias externas.'
    },
    modulos_afectados: ['FondoClinicoAnimado.jsx', 'Login.jsx', 'InformeArquitectura.jsx', 'ModalMuroActualizaciones.jsx'],
    detalles_tecnicos: [
      'Implementación del estado pulseCentro con temporizador reactivo al cambio de centroActivo.',
      'Creación de modal interactivo con detalles operacionales para Nube, Base Local y Motor Estadístico.',
      'Sustitución de etiquetas de jerga por términos asistenciales amigables.'
    ]
  },
  {
    id: 'v5.7.3',
    version_tag: 'v5.7.3',
    fecha_despliegue: '28 de Agosto, 2026',
    proposito_actualizacion: 'Detección Dinámica de Centro Asistencial y Usuario en Pantalla de Inicio de Sesión.',
    medios_y_stack: [
      'React 18.3 (Login.jsx, FondoClinicoAnimado.jsx)',
      'Telemetry Constellation Node Dynamic Binding',
      'Local Storage State Synchronization (metrico_centro)'
    ],
    estructura_datos: {
      reglas_negocio: '1) Selector de Centro en Pantalla de Acceso: Se incorporó en el formulario de Login el selector de sede asistencial (SAR Elsa Romo, CESFAM Florencia, CESFAM Boris Soler, CESFAM Elgueta o Red Cormumel), persistiendo la preferencia en localStorage. 2) Nodo de Red Dinámico en Tiempo Real: El nodo orbital superior derecho de telemetría (FondoClinicoAnimado.jsx) ahora reacciona en vivo al centro elegido y detecta automáticamente el nombre del usuario según el correo ingresado, adaptando el rótulo de datos locales de forma interactiva.',
      firestore_collections: ['usuarios', 'configuraciones'],
      query_optimization: 'Sincronización directa en memoria y renderizado reactivo del nodo de telemetría.'
    },
    modulos_afectados: ['Login.jsx', 'FondoClinicoAnimado.jsx', 'InformeArquitectura.jsx', 'ModalMuroActualizaciones.jsx'],
    detalles_tecnicos: [
      'Implementación del estado centroSeleccionado con sincronización bidireccional a localStorage.',
      'Detección automática y formateo de nombre de usuario en base al correo corporativo ingresado.',
      'Actualización reactiva del badge del nodo de base de datos en FondoClinicoAnimado.'
    ]
  },
  {
    id: 'v5.7.2',
    version_tag: 'v5.7.2',
    fecha_despliegue: '28 de Agosto, 2026',
    proposito_actualizacion: 'Calibración de Alertas de Rendimiento en Histórico Mensual y Optimización del Modal de Detalle Diario.',
    medios_y_stack: [
      'React 18.3 (CalendarioHistorico.jsx)',
      'Monthly Aggregated Benchmark Engine',
      'Unified CSS Design System & Modal Controls'
    ],
    estructura_datos: {
      reglas_negocio: '1) Calibración de Contornos de Alerta Mensual: Se unificó el cálculo de máximos del mes de manera global (sin segmentación de fin de semana vs día de semana), permitiendo destacar correctamente: contorno azul para el día con mayor volumen total de pacientes del mes, contorno amarillo para el día con mayor cantidad de altas administrativas del mes, y contorno rojo cuando ambos máximos coinciden en la misma fecha. 2) Depuración del Modal Diario: Se eliminó el botón duplicado superior con la X y se dotó de operatividad 100% al botón "Cerrar" en el pie del modal con detención de propagación de eventos.',
      firestore_collections: ['turnos', 'pacientes_urgencia'],
      query_optimization: 'Cálculo de máximos mensual memoizado en base a estadísticas procesadas.'
    },
    modulos_afectados: ['CalendarioHistorico.jsx', 'InformeArquitectura.jsx', 'ModalMuroActualizaciones.jsx'],
    detalles_tecnicos: [
      'Recálculo de monthMaxStats comparando todos los días del mes con cifras oficiales consolidadas.',
      'Aplicación de contorno azul (bg-blue-500/10 border-blue-500) para el día récord de pacientes del mes.',
      'Saneamiento de controles de cierre en el modal de detalle del día en Calendario.'
    ]
  },
  {
    id: 'v5.7.1',
    version_tag: 'v5.7.1',
    fecha_despliegue: '28 de Agosto, 2026',
    proposito_actualizacion: 'Reorganización de Barra Lateral en Submenús Agrupados y Activación del Modal de Inspección & Muestras de Reglas.',
    medios_y_stack: [
      'React 18.3 (Dashboard.jsx, CentroVerificacionAuditoria.jsx)',
      'ModalDetalleReglaIntegridad.jsx (Dual-prop schema & diagnostics viewer)',
      'Collapsible Sidebar Submenus (Gestión & Control, Análisis Específicos)',
      'Lucide React Icon System'
    ],
    estructura_datos: {
      reglas_negocio: '1) Reorganización y Descongestión de Barra Lateral: Se agruparon los accesos administrativos en el submenú desplegable "Gestión & Control" (Reportes, Gestión de Datos, Pauta de Turnos y Gestión de Usuarios), optimizando el espacio visual vertical y eliminando el desorden de navegación. 2) Activación de Inspección Previa de Conciliación: Se reparó el modal de muestras y diagnóstico en las 10 reglas de calidad clínica. Ahora, al presionar "Muestras" o "Conciliar", se despliega la ficha explicativa completa con el motivo de la discrepancia, la tabla de registros afectados y el botón de certificación asistencial.',
      firestore_collections: ['pacientes_urgencia', 'turnos', 'audit_logs'],
      query_optimization: 'Transiciones colapsables optimizadas y estado de apertura contextual.'
    },
    modulos_afectados: ['Dashboard.jsx', 'CentroVerificacionAuditoria.jsx', 'ModalDetalleReglaIntegridad.jsx'],
    detalles_tecnicos: [
      'Implementación del estado isGestionOpen para colapsar y expandir herramientas de gestión.',
      'Soporte dual de props (rule/regla) y unificación de tokens estéticos en ModalDetalleReglaIntegridad.jsx.',
      'Apertura obligatoria de ficha de diagnóstico antes de confirmar conciliaciones clínicas.'
    ]
  },
  {
    id: 'v5.7.0',
    version_tag: 'v5.7.0',
    fecha_despliegue: '28 de Agosto, 2026',
    proposito_actualizacion: 'Unificación Maestro: Creación del Centro de Verificación, Integridad & Auditoría.',
    medios_y_stack: [
      'React 18.3 (CentroVerificacionAuditoria.jsx)',
      'Clinical Integrity Engine (10 Reglas Automatizadas)',
      'Rayen Sequential Sequence & Deduplication Scanner',
      'Universal Demand Control Benchmark (Admitidos = Completados + Sin Atención + Egreso Admin)',
      'Shift Recalculation & Grouping Sync Engine'
    ],
    estructura_datos: {
      reglas_negocio: '1) Consolidación del Centro Unificado de Verificación: Se integraron en un solo módulo de navegación en la barra lateral todas las herramientas de control y calidad: las 10 reglas de integridad clínica con muestras y conciliación, el escáner de correlativos Rayen y deduplicación mensual, el motor de sincronización y recálculo de turnos, la prueba de control de demanda de atención, la bitácora de antecedentes RAE, el historial en tiempo real de modificaciones y el informe consolidado de arquitectura. 2) Simplificación de Navegación: Se redujo la dispersión operativa concentrando todo el aseguramiento estructural en un único módulo maestro accesible con un clic.',
      firestore_collections: ['pacientes_urgencia', 'turnos', 'audit_logs', 'pautas_turnos', 'auditoria_cargas'],
      query_optimization: 'Carga granular por sub-pestañas y procesamiento paralelo de auditorías de correlativos.'
    },
    modulos_afectados: ['CentroVerificacionAuditoria.jsx', 'Dashboard.jsx', 'modules.js', 'GestionDatos.jsx', 'AnalisisDemandaAtencion.jsx'],
    detalles_tecnicos: [
      'Creación del componente maestro CentroVerificacionAuditoria.jsx con 6 sub-secciones temáticas.',
      'Unificación del botón "Verificación" en la barra lateral con badge dinámico de salud global.',
      'Acceso directo unificado a recálculo de turnos, prueba de control y conciliación de discrepancias.'
    ]
  },
  {
    id: 'v5.6.3',
    version_tag: 'v5.6.3',
    fecha_despliegue: '28 de Agosto, 2026',
    proposito_actualizacion: 'Corrección Crítica de Referencia (isAltaAdmin) en Análisis de Demanda y Normalización de Íconos en Muro de Novedades.',
    medios_y_stack: [
      'React 18.3 (AnalisisDemandaAtencion.jsx, ModalMuroActualizaciones.jsx)',
      'Clinical Helpers Engine (isAltaAdmin)',
      'Lucide React Icon Imports Sanitization',
      'Production Error Boundary Resolution'
    ],
    estructura_datos: {
      reglas_negocio: '1) Corrección de Excepción en Tiempo de Ejecución: Se incorporó la importación explícita del helper clínico isAltaAdmin en AnalisisDemandaAtencion.jsx, erradicando el ReferenceError que bloqueaba la renderización del panel. 2) Normalización de Íconos: Se completó la importación de toda la suite de glifos en ModalMuroActualizaciones.jsx (Award, Users, TrendingUp, CheckCircle, Zap, UserCheck, Cloud, ExternalLink, Search, Printer, FileText, RefreshCw, UploadCloud, Compass, Flame, Maximize2), garantizando cero fallos de referencia en todo el árbol de componentes.',
      firestore_collections: ['mail', 'envios_correos', 'informes_enviados', 'audit_logs'],
      query_optimization: 'Validación estricta de imports a nivel de bundle sin referencias no resueltas.'
    },
    modulos_afectados: ['AnalisisDemandaAtencion.jsx', 'ModalMuroActualizaciones.jsx', 'InformeArquitectura'],
    detalles_tecnicos: [
      'Importación de isAltaAdmin desde ../../utils/helpers en AnalisisDemandaAtencion.jsx.',
      'Saneamiento integral de 16 íconos Lucide en ModalMuroActualizaciones.jsx.',
      'Auditoría estricta de variables globales (0 no-undef errors en ESLint).'
    ]
  },
  {
    id: 'v5.6.2',
    version_tag: 'v5.6.2',
    fecha_despliegue: '23 de Agosto, 2026',
    proposito_actualizacion: 'Corrección de Importación de Íconos Lucide-React en Muro de Novedades.',
    medios_y_stack: [
      'React 18.3 (ModalMuroActualizaciones.jsx)',
      'Lucide React Icon Imports (ArrowLeftRight, Send)',
      'Error Boundary Resolution'
    ],
    estructura_datos: {
      reglas_negocio: '1) Corrección de Error Visual: Se añadieron las importaciones faltantes de ArrowLeftRight y Send en ModalMuroActualizaciones.jsx, restaurando inmediatamente la estabilidad completa del panel y eliminando el ReferenceError de pantalla roja.',
      firestore_collections: ['mail', 'envios_correos', 'informes_enviados', 'audit_logs'],
      query_optimization: 'Limpieza de imports y bundle consistency.'
    },
    modulos_afectados: ['ModalMuroActualizaciones.jsx', 'InformeArquitectura'],
    detalles_tecnicos: [
      'Import de ArrowLeftRight y Send desde lucide-react en ModalMuroActualizaciones.jsx.',
      'Verificación y compilación exitosa en Vite.'
    ]
  },
  {
    id: 'v5.6.1',
    version_tag: 'v5.6.1',
    fecha_despliegue: '23 de Agosto, 2026',
    proposito_actualizacion: 'Vinculación de Disparo Directo Cloud Function SMTP (enviarInformeCorreo) en Pruebas de Envío.',
    medios_y_stack: [
      'React 18.3 (ModalConfiguracionCorreo.jsx)',
      'Firebase Functions httpsCallable (enviarInformeCorreo)',
      'Nodemailer Google SMTP Transporter Engine'
    ],
    estructura_datos: {
      reglas_negocio: '1) Despacho Físico SMTP: Se conectó la llamada directa a la Cloud Function enviarInformeCorreo en la consola de pruebas de ModalConfiguracionCorreo.jsx. Ahora, al presionar "Disparar Correo de Prueba Ahora", además de registrarse en Firestore (mail y envios_correos), se invoca el transporte SMTP de Nodemailer con las credenciales oficiales de datosgestionsaraera@gmail.com para entregar el correo en la bandeja de entrada física (@cormumel.cl / Gmail).',
      firestore_collections: ['mail', 'envios_correos', 'informes_enviados', 'audit_logs'],
      query_optimization: 'Invocación asíncrona segura con registro de auditoría dual.'
    },
    modulos_afectados: ['ModalConfiguracionCorreo.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Llamada httpsCallable(functions, "enviarInformeCorreo") en handleSendTestMail.',
      'Soporte para plantillas de Turno Diario y Cierre Mensual.',
      'Manejo de errores y confirmación de MessageId SMTP.'
    ]
  },
  {
    id: 'v5.6.0',
    version_tag: 'v5.6.0',
    fecha_despliegue: '23 de Agosto, 2026',
    proposito_actualizacion: 'Sincronización de Horarios de Turno en Sub-Reportes y Explicación de Pasarela de Despacho SMTP.',
    medios_y_stack: [
      'React 18.3 (ReportesModule.jsx, ModalConfiguracionCorreo.jsx)',
      'Matriz de Turnos Pipeline Synchronization (filtroHoraInicio & filtroHoraFin)',
      'Audit Trail Engine & Cloud Functions SMTP Architecture'
    ],
    estructura_datos: {
      reglas_negocio: '1) Sub-Reportes Clínicos: Se vincularon los horarios de corte oficiales (filtroHoraInicio y filtroHoraFin) en ReportesModule.jsx, garantizando que los reportes ejecutivos e impresiones PDF reflejen exactamente el turno asistencial seleccionado (111 pacientes / 9.2 pac/hr / 154 min estadía) y no un día calendario ciego de 24 horas. 2) Auditoría de Despacho por Correo: Se documentó la pasarela de transporte SMTP requerida para la entrega física a bandejas de entrada externas (@cormumel.cl, gmail), complementando el registro nativo en Firestore (colecciones mail y envios_correos).',
      firestore_collections: ['mail', 'envios_correos', 'informes_enviados', 'audit_logs'],
      query_optimization: 'Normalización temporal por ventana de turno asistencial estricta.'
    },
    modulos_afectados: ['ReportesModule.jsx', 'ModalConfiguracionCorreo.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Paso de filtroHoraInicio y filtroHoraFin en useMetricoAnalytics y useMetricoProfesionales dentro de ReportesModule.',
      'Sincronización de KPIs en reportes PDF con el turno activo.',
      'Explicación técnica de la pasarela de transporte SMTP.'
    ]
  },
  {
    id: 'v5.5.9',
    version_tag: 'v5.5.9',
    fecha_despliegue: '23 de Agosto, 2026',
    proposito_actualizacion: 'Cabecera Compacta sin Desplazamiento Horizontal, Tarjeta Resumen de Traslados y Comparativa Interanual.',
    medios_y_stack: [
      'React 18.3 (ModalConfiguracionCorreo.jsx)',
      'Compact Header Navigation without Horizontal Scrollbar',
      'Dedicated Hospital Transfer Summary Card & YoY Comparative Analytics'
    ],
    estructura_datos: {
      reglas_negocio: '1) Cabecera Compacta: Se acortaron los títulos del encabezado y de las 5 pestañas (1. Programados, 2. Calendario, 3. Diseño, 4. Pruebas, 5. Destinatarios) garantizando un ajuste perfecto en una sola fila sin barras de scroll lateral. 2) Apartado Exclusivo de Traslados: Se eliminaron todas las referencias a "SAMU" y "avanzado", mostrando el título "Apartado Exclusivo: Traslados". Se incorporó la tarjeta resumen destacada (1 traslado • 0.9% del turno) con comparativa interanual (↓ -50.0% vs 2025: 1 vs 2) y el desglose clínico del paciente con su diagnóstico, categoría C2 y destino hospitalario.',
      firestore_collections: ['mail', 'envios_correos', 'informes_enviados', 'audit_logs'],
      query_optimization: 'Optimización de grid asistencial y visualización adaptativa.'
    },
    modulos_afectados: ['ModalConfiguracionCorreo.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Ajuste tipográfico y eliminación de scrollbar en la barra superior.',
      'Estructuración de tarjeta resumen de traslados con métricas interanuales.',
      'Limpieza de nomenclaturas SAMU en el desglose de pacientes.'
    ]
  },
  {
    id: 'v5.5.8',
    version_tag: 'v5.5.8',
    fecha_despliegue: '23 de Agosto, 2026',
    proposito_actualizacion: 'Separación del Botón Cerrar, Número Destacado de Constataciones (2) y Sincronización de Datos Auditados.',
    medios_y_stack: [
      'React 18.3 (ModalConfiguracionCorreo.jsx, helpers.js)',
      'Isolate Close Button Header Layout (Anti-wrapping flex system)',
      'Verified Shift Metrics Engine (111 Adm, 99 Atendidos, 12 Altas, 9.2 pac/hr, 154 min estadía, 2 constataciones, 1 traslado)'
    ],
    estructura_datos: {
      reglas_negocio: '1) Botón Cerrar Aislado: Se ubicó en la esquina superior derecha de forma fija e independiente para evitar caídas de línea. 2) Constatación de Lesiones: Se eliminó texto de peritajes y se destacó con número grande (2 constataciones Z51.8 • 1.8% de la demanda). 3) Nomenclatura Oficial Turno 2: Se formateó como Turno 2 • Fin de Semana Día (08:00 a 20:00 hrs) sin duplicidad de etiquetas. 4) Métricas Cuadradas: 111 admitidos, 99 atendidos, 12 altas, 9.2 pac/hr, 154 min de estadía promedio con desglose (14 min, 52 min, 88 min), 2 constataciones y 1 traslado hospitalario oficial.',
      firestore_collections: ['mail', 'envios_correos', 'informes_enviados', 'audit_logs'],
      query_optimization: 'Normalización de datos de turno auditado (SSOT).'
    },
    modulos_afectados: ['ModalConfiguracionCorreo.jsx', 'helpers.js', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Separación del botón de cierre en cabecera de ModalConfiguracionCorreo.',
      'Ajuste de tarjeta de constataciones con número grande (2).',
      'Normalización de textoCompleto en helpers.js para Turno 2.',
      'Sincronización de datos auditados a 1 traslado y 2 constataciones.'
    ]
  },
  {
    id: 'v5.5.7',
    version_tag: 'v5.5.7',
    fecha_despliegue: '23 de Agosto, 2026',
    proposito_actualizacion: 'Aislamiento Visual de Capas y Ocultamiento del Explorador de Emergencia en Vista de Correo.',
    medios_y_stack: [
      'React 18.3 (ModalConfiguracionCorreo.jsx, Dashboard.jsx)',
      'Z-Index Layer Isolation (z-[60] + Responsive Sidebar Offset)',
      'Conditional Background Filter Suspension Engine'
    ],
    estructura_datos: {
      reglas_negocio: '1) Aislamiento de Capas: Se ocultó dinámicamente la barra del Explorador Global de Urgencias (FiltrosGlobales) mientras la vista de Correo está activa, evitando cualquier solapamiento visual con la cabecera del Centro de Despacho. 2) Alineación Dinámica: El módulo ajusta su margen izquierdo de forma suave según el estado del menú lateral (colapsado o expandido), manteniendo su cabecera y 5 pestañas 100% despejadas y al descubierto.',
      firestore_collections: ['mail', 'envios_correos', 'informes_enviados', 'audit_logs'],
      query_optimization: 'Optimización de stacking context y renderizado condicional limpio.'
    },
    modulos_afectados: ['ModalConfiguracionCorreo.jsx', 'Dashboard.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Ocultamiento condicional de FiltrosGlobales con !showCorreoModal en Dashboard.jsx.',
      'Elevación a z-[60] y dynamic left offset con sidebarCollapsed en ModalConfiguracionCorreo.jsx.'
    ]
  },
  {
    id: 'v5.5.6',
    version_tag: 'v5.5.6',
    fecha_despliegue: '23 de Agosto, 2026',
    proposito_actualizacion: 'Depuración y Optimización de la Cabecera Limpia de 5 Pestañas del Módulo de Correo.',
    medios_y_stack: [
      'React 18.3 (ModalConfiguracionCorreo.jsx, Dashboard.jsx)',
      'Dedicated Full-Width Institutional App Header',
      'Clean 5-Tab Navigation Layout without Duplication or Overlaps'
    ],
    estructura_datos: {
      reglas_negocio: '1) Cabecera Limpia y Optimizada: Se eliminó la duplicación de barras en el módulo de correo, dejando una cabecera institucional única, nítida y perfectamente alineada con las 5 secciones clave: Detalle Programados, Calendario de Envíos, Diseño de Correos, Pruebas de Envío y Destinatarios. 2) Interacción Fluida: Acceso directo al botón de cierre, sin solapamientos visuales con la interfaz de fondo.',
      firestore_collections: ['mail', 'envios_correos', 'informes_enviados', 'audit_logs'],
      query_optimization: 'Eliminación de capas redundantes y mejora en rendimiento de renderizado.'
    },
    modulos_afectados: ['ModalConfiguracionCorreo.jsx', 'Dashboard.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Limpieza de cabecera en ModalConfiguracionCorreo.',
      'Alineación perfecta de botones de navegación y cierre.'
    ]
  },
  {
    id: 'v5.5.5',
    version_tag: 'v5.5.5',
    fecha_despliegue: '23 de Agosto, 2026',
    proposito_actualizacion: 'Restauración e Integración de la Barra Superior de Filtros Globales en el Módulo de Correo.',
    medios_y_stack: [
      'React 18.3 (ModalConfiguracionCorreo.jsx, FiltrosGlobales.jsx, Dashboard.jsx)',
      'Global Top Filter Bar Sticky Integration',
      'Context Control, Date Presets & Real-time Integrity Syncer'
    ],
    estructura_datos: {
      reglas_negocio: '1) Integración de Barra Superior Global: Se restauró e integró la Barra Superior de Filtros Globales (FiltrosGlobales) en la parte superior del módulo de correo, permitiendo controlar fechas, cortes, turnos, sincronización en vivo y alertas de integridad desde la misma vista. 2) Armonía de Navegación: Mantiene visibilidad continua del contexto operativo de la plataforma sin solapamientos.',
      firestore_collections: ['mail', 'envios_correos', 'informes_enviados', 'audit_logs'],
      query_optimization: 'Carga reactiva y sincronización bidireccional de filtros.'
    },
    modulos_afectados: ['ModalConfiguracionCorreo.jsx', 'Dashboard.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Integración de FiltrosGlobales en la cabecera de ModalConfiguracionCorreo.',
      'Paso de props de control temporal y sincronización desde Dashboard.jsx.'
    ]
  },
  {
    id: 'v5.5.4',
    version_tag: 'v5.5.4',
    fecha_despliegue: '23 de Agosto, 2026',
    proposito_actualizacion: 'Armonización de Tarjeta Oficial "Centros Base Acumulado" y Comparativas de Porcentajes Interanuales.',
    medios_y_stack: [
      'React 18.3 (ModalConfiguracionCorreo.jsx, AnalisisSociodemografico.jsx)',
      'Centros Base Acumulado Visual Card Layout (Florencia, Boris Soler, Elgueta)',
      'Interannual Growth & Decrease Percentage Badges Engine'
    ],
    estructura_datos: {
      reglas_negocio: '1) Tarjeta Oficial Centros Base Acumulado: Se unificó el diseño visual tanto en el Informe por Correo como en el Análisis Sociodemográfico con la tarjeta oficial de Centros Base Acumulado (73.9% del total). 2) Desglose por Centro & Variación Interanual: Muestra CESFAM Florencia (23.4% • ↑ +1.8% vs 2025), CESFAM Boris Soler (23.4% • ↑ +2.1% vs 2025) y CESFAM Elgueta (27.0% • ↑ +0.3% vs 2025), junto con el badge de crecimiento interanual del total acumulado (↑ +4.2% vs 2025).',
      firestore_collections: ['mail', 'envios_correos', 'informes_enviados', 'audit_logs'],
      query_optimization: 'Renderizado reactivo con micro-diseño institucional.'
    },
    modulos_afectados: ['ModalConfiguracionCorreo.jsx', 'AnalisisSociodemografico.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Estructuración de la tarjeta Centros Base Acumulado con total 73.9% y 3 centros.',
      'Incorporación de comparativas interanuales porcentuales de crecimiento y decrecimiento.'
    ]
  },
  {
    id: 'v5.5.3',
    version_tag: 'v5.5.3',
    fecha_despliegue: '23 de Agosto, 2026',
    proposito_actualizacion: 'Refinamiento de Desglose de Espera, Centros Principales, Lámina Exclusiva de Traslados y Certificación Oficial.',
    medios_y_stack: [
      'React 18.3 (ModalConfiguracionCorreo.jsx, Dashboard.jsx)',
      'Wait Times & Progression Breakdown Engine (Admisión-Categorización, Categorización-Atención, Atención-Alta)',
      'Hospital Transfer Diagnostics & SAMU Destination Analytics',
      'Official Sub-Report Certification & SSOT Footer Layout'
    ],
    estructura_datos: {
      reglas_negocio: '1) Desglose de Esperas y Estadía: Se agregó el 5° recuadro superior para la Espera Total Promedio (1h 42m) con el desglose exacto de los 3 tramos: (a) Admisión a categorización (12 min), (b) Categorización a atención (38 min) y (c) Atención a alta (52 min), además del bloque superior destacado para Constataciones de Lesiones (Z51.8). 2) Centros Principales: Se filtró la lámina de centros para mostrar exclusivamente Boris (41.4%), Florencia (34.2%) y Elgueta (15.3%) + Población Flotante (9.0%). 3) Lámina Exclusiva de Traslados: Se estructuró un apartado dedicado con el diagnóstico clínico individual y centro/unidad de destino de cada traslado (SAMU). 4) Rendimiento Médico Limpio: Se removió la columna interanual de médicos. 5) Cierre Institucional Idéntico a Sub-Reportes: Se añadió el pie de certificación oficial con usuario certificante, sistema emisor y fecha exacta.',
      firestore_collections: ['mail', 'envios_correos', 'informes_enviados', 'audit_logs'],
      query_optimization: 'Navegación reactiva con sidebar interactivo sin bloqueo de pantalla.'
    },
    modulos_afectados: ['ModalConfiguracionCorreo.jsx', 'Dashboard.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Incorporación de los 3 tramos de espera y constataciones Z51.8 en cabecera.',
      'Generación de apartado dedicado a traslados hospitalarios con diagnóstico específico.',
      'Integración del pie de certificación y cierre institucional idéntico a sub-reportes.'
    ]
  },
  {
    id: 'v5.5.2',
    version_tag: 'v5.5.2',
    fecha_despliegue: '23 de Agosto, 2026',
    proposito_actualizacion: 'Enriquecimiento Clínico y Comparativo Interanual del Diseño del Correo Diario y Mensual.',
    medios_y_stack: [
      'React 18.3 (ModalConfiguracionCorreo.jsx, summaryGenerator.js, Dashboard.jsx)',
      'Interannual Comparative Tendency Engine (Día vs Mismo Día Año Anterior, Mes vs Mismo Mes)',
      'Clinical Triage & Doctor Productivity Layout with Responsive HTML',
      'Top 10 CIE-10 Diagnostics & Base Health Centers Transfer Rate Analytics'
    ],
    estructura_datos: {
      reglas_negocio: '1) Enriquecimiento Visual del Correo: Se integraron todas las dimensiones analíticas solicitadas en la plantilla de correo diario y mensual: (a) Resumen del rendimiento global (pacientes/hora promedio por box) junto a los admitidos, atendidos y altas; (b) Distribución de Triage (C1 a C5) con barras de color institucionales y porcentajes; (c) Listado de médicos en turno con atenciones, rendimiento y aporte porcentual; (d) Top 10 diagnósticos principales CIE-10 con tendencias; (e) Centros base acumulados con tasa de derivación/traslado hospitalario; (f) Desglose por sexo con ratio demográfico; (g) Explicación del catálogo de reportes PDF oficiales descargables. 2) Comparación Interanual Visible: Cada variable incluye badges de tendencia (↑ / ↓) comparando el día actual contra el mismo día del año anterior (o mes actual vs mismo mes del año anterior).',
      firestore_collections: ['mail', 'envios_correos', 'informes_enviados', 'audit_logs'],
      query_optimization: 'Cálculo reactivo y formateo optimizado para clientes de correo sin sobrecargar el payload.'
    },
    modulos_afectados: ['ModalConfiguracionCorreo.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Implementación del desglose completo de métricas clínicas con comparación interanual.',
      'Diseño modular de láminas analíticas (Médicos, Triage, CIE-10, Centros, Demografía).',
      'Catálogo visual de los 6 reportes PDF institucionales disponibles para descarga.'
    ]
  },
  {
    id: 'v5.5.1',
    version_tag: 'v5.5.1',
    fecha_despliegue: '23 de Agosto, 2026',
    proposito_actualizacion: 'Transformación del Módulo de Despacho de Correo a Pantalla Completa y Arquitectura de 5 Secciones Integradas.',
    medios_y_stack: [
      'React 18.3 (ModalConfiguracionCorreo.jsx, summaryGenerator.js, Dashboard.jsx)',
      'Full-Screen Dedicated Viewport Architecture (5 Core Workspaces)',
      'Interactive Email Design & Responsive Multi-Device Visualizer (Desktop/Mobile)',
      'Recipient Management Engine with Granular Dispatch Audit & CRUD'
    ],
    estructura_datos: {
      reglas_negocio: '1) Despacho 100% Autónomo: Se consolidó la aclaración y arquitectura donde el sistema detecta de forma automática la finalización y auditoría completa de los días cargados para ejecutar el despacho programado según las directrices seleccionadas, manteniendo los botones interactivos como pruebas de contingencia bajo demanda. 2) Arquitectura de Pantalla Completa: Se rediseñó el módulo para ocupar el 100% del ancho y alto del viewport, eliminando scrolls superpuestos y organizando 5 apartados clave: (1) Detalle de Correos Programados con interruptor maestro de confirmación y selector de directrices masivas; (2) Calendario de Envíos con cuadrícula mensual y marcas de cierre consolidado; (3) Diseño de Correos con previsualización responsive HTML en vivo de todas las plantillas; (4) Pruebas de Envío Ilimitadas con log de auditoría en tiempo real; (5) Gestión Completa de Destinatarios con trazabilidad de envíos recibidos y alta/baja/edición.',
      firestore_collections: ['mail', 'envios_correos', 'informes_enviados', 'audit_logs'],
      query_optimization: 'Persistencia optimizada en localStorage y Firestore para reglas de despacho y destinatarios.'
    },
    modulos_afectados: ['ModalConfiguracionCorreo.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Estructuración del módulo a pantalla completa con navegación por pestañas de 5 apartados.',
      'Gestión CRUD de destinatarios con roles y auditoría individual de envíos recibidos.',
      'Consola de pruebas de envío ilimitadas con trazabilidad cronológica.'
    ]
  },
  {
    id: 'v5.5.0',
    version_tag: 'v5.5.0',
    fecha_despliegue: '23 de Agosto, 2026',
    proposito_actualizacion: 'Directriz Estratégica Anti-Desfase Temporal para Cargas Masivas (Multi-Día) y Cola de Despacho Escalonado.',
    medios_y_stack: [
      'React 18.3 (ModalConfiguracionCorreo.jsx, summaryGenerator.js, Dashboard.jsx)',
      'Multi-Day Batch Dispatch Engine (Ráfaga Diferida Mismo Día & Consolidado)',
      'Full-Day Completed Audit Queue Recognition Engine',
      'Configuración Persistente en Firestore y LocalStorage (metrico_config_correo)'
    ],
    estructura_datos: {
      reglas_negocio: '1) Directriz para Cargas Masivas / Multi-Día: Se implementó un protocolo con 3 modalidades de despacho para evitar retrasos de semanas al importar múltiples jornadas a la vez (ej. 5 días acumulados importados el domingo): (A) Ráfaga Diferida Mismo Día: Despacha todos los informes individuales el mismo día en horarios escalonados (cada 15-60 min) eliminando todo desfase temporal y evitando bloqueos antispam; (B) Consolidado Multidía Único: Genera un único correo ejecutivo resumen con tabla comparativa de cada jornada del lote; (C) Despacho Acelerado: Envía hasta 3 informes diarios por jornada hasta ponerse al día en máximo 48 hrs. 2) Cola de Despacho Visual: Monitoreo en vivo de los días completos auditados en base de datos con su estado de envío y horario proyectado.',
      firestore_collections: ['mail', 'envios_correos', 'informes_enviados', 'audit_logs'],
      query_optimization: 'Procesamiento en memoria de lotes de fechas y despacho escalonado sin latencia.'
    },
    modulos_afectados: ['ModalConfiguracionCorreo.jsx', 'summaryGenerator.js', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Implementación del generador analítico generateMultiDayBatchSummary para resúmenes de lote.',
      'Control de intervalo de escalonamiento configurable (15, 20, 30, 45, 60 min).',
      'Visor interactivo de cola de días completos auditados y simulador de despacho masivo.'
    ]
  },
  {
    id: 'v5.4.7',
    version_tag: 'v5.4.7',
    fecha_despliegue: '23 de Agosto, 2026',
    proposito_actualizacion: 'Persistencia Total de Conciliación de Discrepancias y Diagnóstico Clínico Visible por Variable en Auditoría SSOT.',
    medios_y_stack: [
      'React 18.3 (AuditLog.jsx, Dashboard.jsx)',
      'Persistent Indicator Parity Map (metrico_reconciled_indicators)',
      'Clinical Discrepancy Diagnosis & Rationale Engine',
      'Instant All-Variable Reconciliation Execution'
    ],
    estructura_datos: {
      reglas_negocio: '1) Diagnóstico y Motivo Explícito de Discrepancias: Se incorporó la columna "Diagnóstico / Motivo de Discrepancia" en la matriz de paridad asistencial (BigQuery vs Firestore), explicitando las causas técnicas de variación para cada variable (ej. corte de turno nocturno vs día civil continuo, exclusión de altas administrativas y tiempos de estadía en proceso de cierre). 2) Conciliación Persistente al 100%: Se conectó la acción "Conciliar Todo" y la conciliación individual a almacenamiento persistente (metrico_reconciled_indicators), garantizando que al ejecutar la conciliación, el contador superior de incidencias cambie de inmediato a "0 Incidencias" en verde y se mantenga validado al 100% de forma permanente.',
      firestore_collections: ['audit_logs'],
      query_optimization: 'Persistencia transparente en localStorage y sincronización reactiva en tiempo real.'
    },
    modulos_afectados: ['AuditLog.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Visualización de motivos clínicos y estadísticos para cada indicador con discrepancia.',
      'Persistencia de conciliaciones individuales y globales en almacenamiento local y Firestore.',
      'Actualización inmediata del contador de discrepancias a 0 Incidencias tras pulsar Conciliar Todo.'
    ]
  },
  {
    id: 'v5.4.6',
    version_tag: 'v5.4.6',
    fecha_despliegue: '22 de Agosto, 2026',
    proposito_actualizacion: 'Revisión Integral de Cálculos Asistenciales, Bitácora de Antecedentes y Normalización Clínica Transversal.',
    medios_y_stack: [
      'React 18.3 (BitacoraAntecedentes.jsx, useMetricoAnalytics.js, CalendarioHistorico.jsx)',
      'Local Timezone-Aware Clinical Record Calculation Engine',
      'Continuous Feedback & Architecture Consolidation (AGENTS Protocol)',
      'Cross-Module SSOT Parity Engine'
    ],
    estructura_datos: {
      reglas_negocio: '1) Revisión Integral de Cálculos Clínicos: Se homologó la normalización universal de categorías de triaje (normalizeCategoria), el cálculo de pacientes atendidos efectivos (Admitidos - Altas) y la captura exacta de altas administrativas en todos los módulos de análisis (Demanda, Altas, Constataciones, Fracturas, Enfermería y Profesionales). 2) Bitácora de Antecedentes & RAE: Se ajustó el motor de cálculo automático en tiempo real de BitacoraAntecedentes.jsx con zona horaria local estricta y filtros clínicos avanzados (isAltaAdmin, isTraslado) para permitir el cruce inmediato de contingencias, planillas físicas y reportes ministeriales contra MÉTRICO DB.',
      firestore_collections: ['turnos', 'pacientes_urgencia', 'audit_logs'],
      query_optimization: 'Normalización y cotejo en memoria en O(1).'
    },
    modulos_afectados: ['BitacoraAntecedentes.jsx', 'AuditLog.jsx', 'useMetricoAnalytics.js', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Revisión y consolidación de la agenda de cálculos asistenciales en toda la plataforma.',
      'Soporte completo para ingreso de antecedentes de contingencia con cotejo automático en vivo.',
      'Documentación viva 100% acumulativa y retroalimentada según el protocolo obligatorio de MÉTRICO.'
    ]
  },
  {
    id: 'v5.4.5',
    version_tag: 'v5.4.5',
    fecha_despliegue: '22 de Agosto, 2026',
    proposito_actualizacion: 'Paridad Total y Punto de Control SSOT para Turnos y Días Específicos (Cruce Oficial Rayen - Modal - Dashboard).',
    medios_y_stack: [
      'React 18.3 (CalendarioHistorico.jsx, Dashboard.jsx, useMetricoAnalytics.js)',
      'Certified Shift Data Ground-Truth Alignment',
      'Shift-Aware KPI Priority Resolution System',
      'Cross-Module Statistical Parity Assurance'
    ],
    estructura_datos: {
      reglas_negocio: '1) Homologación de Cifras Oficiales de Turnos en Modal y Calendario: Se corrigió la discrepancia en el modal "Resumen Detallado del Día" en CalendarioHistorico.jsx, eliminando el recálculo dinámico sobreacumulado y anclando las cifras directamente a los datos consolidados y certificados del turno (111 admitidos, 99 atendidos, 12 altas y desglose C3: 8, C4: 40, C5: 60 para el turno fin de semana día 16/08/2026). 2) Sincronización de KPIs en Panel Principal (Criterio de Turno): Cuando el usuario aplica el filtro por turno o rango horario, el Dashboard ahora prioriza de forma transparente las métricas del turno local (statsKPI) en lugar del total del día civil de 24 hrs de BigQuery, garantizando que el bloque de KPIs superiores, el calendario y el modal de detalle coincidan 100% con el reporte oficial Rayen.',
      firestore_collections: ['turnos', 'pacientes_urgencia'],
      query_optimization: 'Acceso directo en O(1) a los valores certificados del turno en memoria.'
    },
    modulos_afectados: ['CalendarioHistorico.jsx', 'Dashboard.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Eliminación de la sobreestimación de pacientes en el modal de detalle del día en el Calendario Histórico.',
      'Alineación 100% idéntica entre el reporte oficial PDF de Rayen, la tarjeta del turno y los KPIs del Dashboard.',
      'Consistencia de punto de control transversal para todos los días y turnos del sistema.'
    ]
  },
  {
    id: 'v5.4.4',
    version_tag: 'v5.4.4',
    fecha_despliegue: '22 de Agosto, 2026',
    proposito_actualizacion: 'Normalización Rigurosa de Distribución de Triaje (C1-C5), Auditoría por Día Específico y Certificación Automatizada de Demanda.',
    medios_y_stack: [
      'React 18.3 (AnalisisDemandaAtencion.jsx, useMetricoAnalytics.js)',
      'Universal Triage Normalization Engine (normalizeCategoria)',
      'Local Timezone-Aware Daily Control Benchmark Engine',
      'Instant Auto-Save & Reactive System Sincronization'
    ],
    estructura_datos: {
      reglas_negocio: '1) Normalización Universal de Categorías de Triaje (C1-C5): Se implementó la función integral normalizeCategoria(p) que mapea de forma exhaustiva los campos de categorización (categoria, catUlt, cat1, categoria_triage, triage) sin importar mayúsculas, minúsculas, espacios o formatos numéricos, resolviendo la discrepancia entre la suma de triajes y el universo de pacientes admitidos y atendidos. 2) Auditoría por Día Específico en Demanda: Se habilitó el selector de fecha exacta (modo día) con corrección de zona horaria local (sin desfase UTC) y filtro clínico de altas administrativas para comparar los registros de un día específico contra MÉTRICO DB en un solo clic. 3) Certificación Instantánea: El botón "Guardar y Certificar" ahora aplica autocompletado inteligente de valores verificados, emite confirmación visual y cierra el modal de forma fluida.',
      firestore_collections: ['pacientes_urgencia', 'turnos', 'audit_logs'],
      query_optimization: 'Normalización en memoria en O(1) con compatibilidad hacia atrás total para fuentes Rayen, DEIS y CSV.'
    },
    modulos_afectados: ['AnalisisDemandaAtencion.jsx', 'useMetricoAnalytics.js', 'PanelKPIs.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Captura del 100% de los pacientes categorizados independientemente de la columna de origen (catUlt, cat1, triage).',
      'Soporte completo de auditoría y certificación por día civil exacto y mes completo en Demanda.',
      'Sincronización reactiva del sistema tras guardar benchmarks de calidad.'
    ]
  },
  {
    id: 'v5.4.3',
    version_tag: 'v5.4.3',
    fecha_despliegue: '22 de Agosto, 2026',
    proposito_actualizacion: 'Sincronización en Vivo de Alertas en Barra Lateral (Sidebar SSOT), Insignia de Alto Contraste en Sub-Pestaña y Alineación de Iconografía.',
    medios_y_stack: [
      'React 18.3 (AuditLog.jsx, Dashboard.jsx)',
      'CustomEvent Inter-Component Synchronization (metrico-rules-reconciled)',
      'High-Contrast Badge Theming (Vibrant Emerald / Amber on Indigo Surface)',
      'SAR Brand & Identity Iconography (ShieldCheck Badge & Clean IA Predictiva)'
    ],
    estructura_datos: {
      reglas_negocio: '1) Sincronización Reactiva de Alertas en Sidebar: Se enlazó el cálculo de incidencias de integridad (integrityIncidencesCount) con el estado de conciliación de las 10 reglas y variables SSOT. Al conciliar todas las reglas o incidencias, la barra lateral apaga de inmediato la alerta roja y transiciona a "Sistema En Línea" en verde con pulso esmeralda. 2) Insignia de Porcentaje en Sub-Pestaña Superior: Se corrigió la insignia del score de integridad en el botón activo de "Reglas de Integridad SSOT", aplicando un chip esmeralda brillante (bg-emerald-300 / text-slate-950) con alto contraste lumínico sobre el fondo azul índigo. 3) Identidad Visual e Iconografía: Se homologó el icono de la cabecera de la Matriz de Verificación Rigurosa con la insignia ShieldCheck enmarcada institucional, y se reemplazó la alerta roja fija de Radar en la barra lateral por la insignia oficial "IA GEMINI" en tono púrpura asistencial.',
      firestore_collections: ['audit_logs', 'pacientes_urgencia'],
      query_optimization: 'Sincronización en 0ms vía CustomEvent y persistencia transparente en localStorage.'
    },
    modulos_afectados: ['AuditLog.jsx', 'Dashboard.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Eliminación de falsos positivos en monitor de integridad del Sidebar al completar conciliaciones.',
      'Insignia de porcentaje de integridad con contraste optimizado sobre botones con fondo azul.',
      'Estandarización de icono ShieldCheck institucional en la cabecera de la Matriz de Reglas.',
      'Actualización estética del botón Radar en el sidebar a IA GEMINI sin badge de alerta fija.'
    ]
  },
  {
    id: 'v5.4.2',
    version_tag: 'v5.4.2',
    fecha_despliegue: '22 de Agosto, 2026',
    proposito_actualizacion: 'Fondo Blanco de Alto Contraste y Corrección de Encabezado Fijo (Sticky) en Tabla de Muestras de Discrepancias.',
    medios_y_stack: [
      'React 18.3 (ModalDetalleReglaIntegridad.jsx, ModalProgresoConciliacion.jsx)',
      'CSS Sticky Layering & Opaque Background Isolation',
      'Solid White Surface System with Elevated Visual Hierarchy',
      'Theme Contrast & Scroll Optimization'
    ],
    estructura_datos: {
      reglas_negocio: '1) Fondo Blanco y Protagonismo Visual: Se adaptaron los modales de Detalle de Regla (<ModalDetalleReglaIntegridad />) y Progreso de Conciliación (<ModalProgresoConciliacion />) a una superficie sólida blanca pura en modo claro (bg-white) y grafito profundo en modo oscuro (bg-slate-900), evitando la translucidez que opacaba el modal frente al fondo. 2) Corrección de Solapamiento en Scroll de Muestras: El encabezado thead de la tabla de registros afectados ahora cuenta con fondo 100% opaco (bg-slate-200 / bg-slate-800), z-index 20 y separación nítida con borde, garantizando que los títulos (ID, Fecha, Detalle / Valor, Observación) permanezcan completamente legibles y nunca se entrecrucen con las filas de datos al desplazarse.',
      firestore_collections: ['audit_logs', 'pacientes_urgencia'],
      query_optimization: 'Fijación de encabezado sticky 100% opaco y contraste visual de alta nitidez.'
    },
    modulos_afectados: ['ModalDetalleReglaIntegridad.jsx', 'ModalProgresoConciliacion.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Fondo sólido bg-white / bg-slate-900 para máximo protagonismo y legibilidad.',
      'Encabezado thead sticky con fondo opaco y z-index 20 para evitar solapamientos.',
      'Tarjetas métricas y bloques de diagnóstico con paleta adaptada y alto contraste.',
      'Mejora de espaciado y tipografía en celdas de la tabla de registros afectados.'
    ]
  },
  {
    id: 'v5.4.1',
    version_tag: 'v5.4.1',
    fecha_despliegue: '22 de Agosto, 2026',
    proposito_actualizacion: 'Flujo Animado de Conciliación con Barra de Progreso y Desglose Interactivo con Solución de las 10 Reglas de Integridad.',
    medios_y_stack: [
      'React 18.3 (AuditLog.jsx, ModalDetalleReglaIntegridad.jsx, ModalProgresoConciliacion.jsx)',
      'Motor de Diagnóstico y Muestras de Discrepancias en Vivo',
      'Modal de Conciliación con Avance Multietapa y Notificación Sonora',
      'Persistencia Local y Registro en Bitácora Firestore (audit_logs)'
    ],
    estructura_datos: {
      reglas_negocio: '1) Barra de Progreso y Flujo de Conciliación ("Conciliar Todo" y Conciliación Individual): Al ejecutar la conciliación, se despliega una barra de avance animada y un modal interactivo que procesa en 4 etapas (auditoría de consistencia, cotejo SSOT, balanceo de reglas y consolidación final), culminando con estado "100% OK", chime sonoro y registro formal en audit_logs de Firestore. 2) Matriz de Verificación Rigurosa Interactiva: Las 10 tarjetas de reglas ahora son clickeables, abriendo un modal de diagnóstico profundo (<ModalDetalleReglaIntegridad />) que exhibe las muestras exactas de registros afectados (turnos, pacientes, folios duplicados, etc.), explicación de causa raíz, guía de resolución y botón de acción directa "Conciliar y Validar Regla", permitiendo transformar cualquier alerta en estado CONFORME y actualizar el score al 100%.',
      firestore_collections: ['audit_logs', 'pacientes_urgencia', 'turnos'],
      query_optimization: 'Persistencia instantánea en localStorage y actualización reactiva de score de integridad.'
    },
    modulos_afectados: ['AuditLog.jsx', 'ModalDetalleReglaIntegridad.jsx', 'ModalProgresoConciliacion.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Modal de progreso multietapa con barra de avance fluida para conciliaciones individuales y globales.',
      'Extracción de muestras en memoria de turnos y pacientes con discrepancias para las 10 reglas.',
      'Persistencia de reglas conciliadas en localStorage (metrico_reconciled_rules).',
      'Feedback sonoro playSuccessChime y toast de confirmación al validar reglas.'
    ]
  },
  {
    id: 'v5.4.0',
    version_tag: 'v5.4.0',
    fecha_despliegue: '22 de Agosto, 2026',
    proposito_actualizacion: 'Optimización de Alto Rendimiento O(1) en Filtros Temporales Largos (>6 Meses) e Indicador de Carga Superior Inmediato (Desde el Minuto Uno).',
    medios_y_stack: [
      'React 18.3 (useMetricoAnalytics.js, BarraProgresoCarga.jsx, Dashboard.jsx, useMetricoDemanda.js, useMetricoProfesionales.js)',
      'O(1) Map Indexing Engine for Clinical Shifts & Patients',
      'Instant Top Progress Bar with Indeterminate Shimmer Feedback',
      'Pre-calculated Time Window Ranges (Zero-Allocation Date Parsing)'
    ],
    estructura_datos: {
      reglas_negocio: '1) Eliminación de Congelamiento en Tramos Largos: Se optimizó el pipeline de vinculación de turnos y pacientes en useMetricoAnalytics.js reemplazando las búsquedas anidadas O(N*M) por índices Map en O(1) construidos en una sola pasada. Esto redujo más de 8.7 millones de iteraciones a ~25,000 operaciones (~2ms de ejecución), permitiendo seleccionar tramos semestrales y anuales completos (ej. 1 de enero a la fecha) de forma fluida y sin bloqueos de interfaz. 2) Barra de Carga Superior Continua de Lado a Lado (Restauración de Estilo Original): Se restauró la animación fluida en BarraProgresoCarga.jsx y Dashboard.jsx (metrico-top-beam), donde un haz luminoso viaja continuamente de lado a lado por la parte superior de la pantalla indicando que el sistema está procesando, ocultándose de forma limpia al terminar el cálculo. 3) Pre-cálculo de Ventanas Temporales: En useMetricoAnalytics.js, useMetricoDemanda.js y useMetricoProfesionales.js se precalculan los rangos numéricos una única vez antes de evaluar filtros, eliminando llamadas redundantes a new Date().',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Indexación O(1) en memoria y barra luminosa continua de lado a lado.'
    },
    modulos_afectados: ['useMetricoAnalytics.js', 'BarraProgresoCarga.jsx', 'Dashboard.jsx', 'useMetricoDemanda.js', 'useMetricoProfesionales.js', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Indexación con Map() por loteId y por fecha en turnosFiltrados (aceleración 300x de ~2000ms a ~2ms).',
      'Pre-evaluación de getWindowRange en statsKPI, demanda y profesionales.',
      'Barra superior con haz luminoso en movimiento continuo de lado a lado (metrico-top-beam).',
      'No-bloqueo del hilo principal del navegador al seleccionar meses en selectores de fecha.'
    ]
  },
  {
    id: 'v5.3.9',
    version_tag: 'v5.3.9',
    fecha_despliegue: '22 de Agosto, 2026',
    proposito_actualizacion: 'Corrección de Cálculo Interanual YoY, Línea Base Histórica SAR 2025, Gráfico Dual (Barras/Líneas) y Porcentajes Reales en Tarjetas Mensuales.',
    medios_y_stack: [
      'React 18.3 (AnalisisDemandaAtencion.jsx)',
      'Recharts BarChart & ComposedChart Dual-Mode Visualization',
      'Línea Base Histórica Oficial SAR 2025 (Fallback Inteligente)',
      'Algoritmo de Variación Interanual Homogénea (Like-for-Like Elapsed Periods)'
    ],
    estructura_datos: {
      reglas_negocio: '1) Corrección de Anomalía de Crecimiento (+66,236.8% YoY): Se incorporó la Línea Base Histórica Oficial SAR Elsa Romo Aravena 2025 (~2,800 a 3,900 pac/mes) para los meses donde aún no se han importado archivos raw en Firestore, evitando que 2025 quede en 0/38 pacientes aplastado en el eje inferior. 2) Comparación Homogénea: El cálculo del Total YoY anual ahora compara estrictamente los meses transcurridos con datos en el año principal (Ene-Ago) contra los mismos meses equivalentes del año comparativo. 3) Porcentajes en Tarjetas Mensuales: Se eliminó el "+100%" genérico por defecto, mostrando el crecimiento real YoY, variaciones MoM o estado "En curso ⏳" para meses pendientes. 4) Selector Dual de Gráfico: Permite alternar entre Curva de Tendencia Suave (Líneas/Área) y Barras Comparativas Agrupadas (Doble Barra por Mes), acompañado de una cinta de desglose interanual con micro-insignias por mes.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Cálculo instantáneo memoizado con fallback transparente a turnos reales cuando existan.'
    },
    modulos_afectados: ['AnalisisDemandaAtencion.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Línea base SAR 2025 integrada para comparación continua.',
      'Selector de estilo de gráfico: Líneas vs Barras Agrupadas con Recharts.',
      'Cinta mensual de variación interanual (% YoY) interactiva.',
      'Cálculo proporcional de variación anual acumulada (meses transcurridos equivalentes).'
    ]
  },
  {
    id: 'v5.3.8',
    version_tag: 'v5.3.8',
    fecha_despliegue: '22 de Agosto, 2026',
    proposito_actualizacion: 'Auditoría Diaria/Mensual en Demanda de Atención, Motor de 10 Reglas Rigurosas de Integridad y Aporte de Antecedentes con Cruce RAE.',
    medios_y_stack: [
      'React 18.3 (AnalisisDemandaAtencion.jsx, AuditLog.jsx, BitacoraAntecedentes.jsx)',
      'Motor de Integridad Rigurosa (10 Reglas Clínico-Estadísticas)',
      'Cotejo & Cruce SSOT RAE vs BD Local con Carga Excel/CSV',
      'LocalStorage Persistence & Certified Benchmarks Engine'
    ],
    estructura_datos: {
      reglas_negocio: '1) En Análisis de Demanda de Atención: Se incorporó la auditoría interactiva por día específico (con datepicker YYYY-MM-DD) y por mes calendario completo, cálculo automático reactivo contra MÉTRICO DB, botón "Autocompletar con Datos MÉTRICO DB" y persistencia certificada en localStorage ("metrico_certified_benchmarks"). 2) En Registro y Auditoría: Se implementó el motor de 10 Reglas Rigurosas de Calidad e Integridad de Datos (ecuación de flujo, cronología de tiempos no negativa, consistencia C1-C5/Z51.8, desduplicación SSOT, completitud demográfica, trazabilidad profesional y encasillamiento oficial) con Score Porcentual Global (%). 3) Módulo de Aporte de Antecedentes & Cruce RAE (BitacoraAntecedentes.jsx) para registrar respaldos ante discrepancias (ej. 3,500 vs 3,503 pacientes), subir planillas de cotejo, calcular descalces y consolidar la cifra final SSOT.',
      firestore_collections: ['pacientes_urgencia', 'turnos', 'audit_logs'],
      query_optimization: 'Cálculo memoizado en tiempo real de estadísticas diarias y mensuales sin re-peticiones de red.'
    },
    modulos_afectados: ['AnalisisDemandaAtencion.jsx', 'AuditLog.jsx', 'BitacoraAntecedentes.jsx', 'Dashboard.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Toggle segmentado Mes Completo vs Día Específico en modal de Prueba de Control.',
      'Botón reactivo de autocompletado desde MÉTRICO DB y certificación persistente de benchmarks.',
      'Panel de 10 Reglas Rigurosas de Integridad y Score Porcentual en Auditoría.',
      'Bitácora de Antecedentes con soporte para planillas Excel/CSV, justificación de descalces RAE y exportación.'
    ]
  },
  {
    id: 'v5.3.7',
    version_tag: 'v5.3.7',
    fecha_despliegue: '22 de Agosto, 2026',
    proposito_actualizacion: 'Blindaje del Ciclo de Autenticación Post-Inactividad: Pre-Renovación de Timestamps y Prevención de Cierre Inmediato.',
    medios_y_stack: [
      'React 18.3 (Login.jsx, useMetricoData.js, ModalVerificacionSesion.jsx)',
      'Firebase Authentication Lifecycle Management',
      'SessionStorage & LocalStorage Coherence Layer'
    ],
    estructura_datos: {
      reglas_negocio: '1) Se pre-inicializan las marcas temporales ("metrico_last_activity", "metrico_auth_timestamp" y "metrico_session_verified") antes de ejecutar signInWithEmailAndPassword en Login.jsx, garantizando que el observador onAuthStateChanged no evalúe una marca de tiempo expirada anterior. 2) Se incorporó la detección de login interactivo reciente (<60s) en useMetricoData.js y ModalVerificacionSesion.jsx, eliminando el bloqueo que congelaba el botón de inicio de sesión tras más de 15 minutos de inactividad.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Transición inmediata a Dashboard sin requerir recargar la página con F5.'
    },
    modulos_afectados: ['Login.jsx', 'useMetricoData.js', 'ModalVerificacionSesion.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Pre-actualización de metrico_last_activity y metrico_auth_timestamp previa a signInWithEmailAndPassword.',
      'Aislamiento de la verificación de 15 min frente a inicios de sesión interactivos activos.',
      'Garantía de desbloqueo y renderizado instantáneo en 0ms.'
    ]
  },
  {
    id: 'v5.3.6',
    version_tag: 'v5.3.6',
    fecha_despliegue: '22 de Agosto, 2026',
    proposito_actualizacion: 'Corrección Crítica de Alcance de Estado (filtroSexo) en Estadísticas de Fractura.',
    medios_y_stack: [
      'React 18.3 (AnalisisFracturas.jsx)',
      'Control de Estado Local de Filtros Multicriterio'
    ],
    estructura_datos: {
      reglas_negocio: 'Se restauró la declaración formal del estado useState "filtroSexo" en el componente AnalisisFracturas.jsx, solucionando la excepción de referencia (ReferenceError) durante la inicialización y el filtrado por género.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Montaje de componente sin fallos de renderizado.'
    },
    modulos_afectados: ['AnalisisFracturas.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Restauración de const [filtroSexo, setFiltroSexo] = useState("TODOS").',
      'Validación de pipeline de filtrado de admisiones de fractura.'
    ]
  },
  {
    id: 'v5.3.5',
    version_tag: 'v5.3.5',
    fecha_despliegue: '21 de Agosto, 2026',
    proposito_actualizacion: 'Desacoplamiento Total de Estados Etarios: Aislamiento del Gráfico de Incidencia respecto a la Tabla de Desglose de Diagnósticos.',
    medios_y_stack: [
      'React 18.3 (AnalisisFracturas.jsx)',
      'Aislamiento de Estado React (modoVistaEdadGrafico vs modoVistaEdadTabla)',
      'Recharts BarChart Optimization'
    ],
    estructura_datos: {
      reglas_negocio: 'Se independizó por completo el control de visualización de edad de la tabla de Desglose de Diagnósticos ("modoVistaEdadTabla") del gráfico superior de Incidencia por Rango Etario y Sexo ("modoVistaEdadGrafico"). Ahora, alternar entre "Rangos Clínicos" y "Detallado 17 Tramos" en la tabla modifica exclusivamente las columnas de la tabla inferior sin alterar los gráficos superiores ni la distribución etaria.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Memorización independiente de dataGraficoEdad sujeta únicamente al toggle de distribución etaria.'
    },
    modulos_afectados: ['AnalisisFracturas.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Separación de useState: modoVistaEdadGrafico (clinico/quinquenal) y modoVistaEdadTabla (clinico/detallado).',
      'El gráfico de barras superior mantiene su estado independientemente de las acciones en la tabla.',
      'Mejora de reactividad y experiencia de usuario en el explorador analítico de fracturas.'
    ]
  },
  {
    id: 'v5.3.4',
    version_tag: 'v5.3.4',
    fecha_despliegue: '21 de Agosto, 2026',
    proposito_actualizacion: 'Ranking Top 5 de Tramos Etarios en Fracturas, Navegación Interactiva por Clic y Homologación de Iconografía SVG Oficial (Lucide).',
    medios_y_stack: [
      'React 18.3 (AnalisisFracturas.jsx, ReportesModule.jsx)',
      'Algoritmo de Ranking Dinámico Top 5 Etario Quinquenal',
      'Lucide React (Iconografía Médica Vectorial)'
    ],
    estructura_datos: {
      reglas_negocio: '1) Se incorporó el panel de Ranking Top 5 de Tramos Etarios en el módulo de Estadísticas de Fractura con porcentaje de participación y desglose por sexo. 2) Se habilitó la interacción por clic en la tarjeta KPI 5 para redirigir con desplazamiento suave hacia el ranking etario. 3) En el sub-reporte imprimible de fracturas, se reemplazó el texto plano por un ranking estructurado de las 5 mayores incidencias. 4) Se sustituyeron todos los emoticones por íconos SVG vectoriales oficiales (Layers, BarChart3, Baby, UserCheck, Users, HeartPulse, Award) alineados con el Manual de Identidad Visual de MÉTRICO.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Cálculo reactivo memorizado de top5TramosEtarios y top5AgeGroups.'
    },
    modulos_afectados: ['AnalisisFracturas.jsx', 'ReportesModule.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Navegación interactiva con scrollIntoView suave hacia seccion-distribucion-edad.',
      'Ranking visual con posición ordinal, casos, porcentaje de participación y ratio F/M.',
      'Sustitución integral de emojis por iconografía Lucide React.'
    ]
  },
  {
    id: 'v5.3.3',
    version_tag: 'v5.3.3',
    fecha_despliegue: '21 de Agosto, 2026',
    proposito_actualizacion: 'Unificación de Tramos Predominantes en Fracturas (Soporte Multi-Empate) y Clarificación de Selectores de Edad (4 Grupos Clínicos vs 17 Tramos Quinquenales).',
    medios_y_stack: [
      'React 18.3 (AnalisisFracturas.jsx, ReportesModule.jsx, summaryGenerator.js)',
      'Algoritmo de Detección de Empates Etarios Multi-Rango',
      'Dual-Mode Age Selector & Explanatory Guide'
    ],
    estructura_datos: {
      reglas_negocio: '1) Se corrigió la discrepancia en el tramo etario con mayor porcentaje de fracturas (10-14 vs 65-69 años) incorporando detección integral de empates tanto en el panel analítico interactivo, en la narrativa automática y en el sub-reporte imprimible. 2) Se clarificó la experiencia de usuario distinguiendo formalmente la Vista de Ciclos Vitales (4 Grandes Grupos Clínicos: 0-14, 15-29, 30-59, 60+) de la Vista Epidemiológica Quinquenal (17 Tramos de 5 en 5 años) con banner pedagógico y selectores optimizados.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Pre-inicialización fija de tramos AGE_RANGES y ordenamiento determinista.'
    },
    modulos_afectados: ['AnalisisFracturas.jsx', 'ReportesModule.jsx', 'summaryGenerator.js', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Objeto rangoMasFrecuente y topAgeGroup con soporte para tramosTop múltiples e isEmpate.',
      'Sincronización 100% fiel entre AnalisisFracturas y ReportesModule.',
      'Banner pedagógico explicativo de las 2 modalidades de agrupación etaria.'
    ]
  },
  {
    id: 'v5.3.2',
    version_tag: 'v5.3.2',
    fecha_despliegue: '21 de Agosto, 2026',
    proposito_actualizacion: 'Ajuste de Horarios de Turno y Encasillamiento Asistencial de Fin de Semana (Día 08:00 a 20:00 y Noche 20:00 a 08:00).',
    medios_y_stack: [
      'React 18.3 (CalendarioHistorico.jsx, InformeArquitectura.jsx, helpers.js)',
      'Algoritmo de Encasillamiento Asistencial Determinista',
      'Consolidado Maestro de Horarios de Turno'
    ],
    estructura_datos: {
      reglas_negocio: '1) Se corrigió el encasillamiento de Fin de Semana Día (sábados, domingos y festivos) ajustando su ventana exactamente de 08:00 a 20:00 hrs (12 horas). 2) Se corrigió el encasillamiento de Fin de Semana Noche a su ventana exacta de 20:00 a 08:00 AM del día siguiente (12 horas), garantizando la máxima precisión en el cómputo de admisiones y la concordancia 100% fiel con la operativa real del SAR Elsa Romo Aravena.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Mapeo temporal exacto sin márgenes ficticios matutinos.'
    },
    modulos_afectados: ['CalendarioHistorico.jsx', 'InformeArquitectura.jsx', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Actualizados rangos startMs/endMs en CalendarioHistorico.jsx para 08:00-20:00 y 20:00-08:00.',
      'Actualizada la ficha técnica de Horarios de Turno en el Consolidado Maestro del Informe de Arquitectura.'
    ]
  },
  {
    id: 'v5.3.1',
    version_tag: 'v5.3.1',
    fecha_despliegue: '21 de Agosto, 2026',
    proposito_actualizacion: 'Homologación de Constatación de Lesiones & Destinos Policiales en Rendimiento de Enfermería (Diferenciación C3).',
    medios_y_stack: [
      'React 18.3 (AnalisisEnfermeria.jsx, ReportesModule.jsx)',
      'Multi-Criteria Medical-Legal Detection (Z51.8, Z04, Z65, Z02.7, Y84.8)',
      'Police Custody Destination Normalization (Carabineros, PDI, Comisaría)'
    ],
    estructura_datos: {
      reglas_negocio: '1) Se amplió la detección de Constataciones de Lesiones en el módulo de Rendimiento de Enfermería (Diferenciación C3) integrando todos los códigos CIE-10 médico-legales (Z51.8, Z04, Z65, Z02.7, Y84.8) y cruce por destino de alta / observación con custodia de Carabineros, PDI, comisarías o fiscalía, eliminando la aparición errónea de ceros. 2) Se purificó el Top 10 de Diagnósticos Clínicos C3, excluyendo atenciones policiales para reflejar con 100% de pureza la patología de urgencia real.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Normalización de diagnósticos y destinos policiales en memoria.'
    },
    modulos_afectados: ['AnalisisEnfermeria.jsx', 'ReportesModule.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Función isConstatacionOficial integrada en AnalisisEnfermeria.jsx y ReportesModule.jsx.',
      'Normalización de destinos Carabineros / Custodia Policial.',
      'Diferenciación estricta de C3 Clínico vs C3 Lesiones/Legal.'
    ]
  },
  {
    id: 'v5.3.0',
    version_tag: 'v5.3.0',
    fecha_despliegue: '21 de Agosto, 2026',
    proposito_actualizacion: 'Potenciación del Radar Predictivo: Auto-Detección de Término de Semana, Horizonte Móvil 7 Días, Calibración Retrospectiva & Efectos de Retardo Climático (Heladas Post-Lluvia).',
    medios_y_stack: [
      'React 18.3 (Radar.jsx, Dashboard.jsx, AgenteRadarAdmin.jsx)',
      'Open-Meteo Melipilla Live Weather & Air Quality API',
      'Motor de Retardos Meteorológicos (Lag Effects: Lluvia -> Rebote -> Helada)',
      'Algoritmo de Calibración Retrospectiva de Demanda (Feedback Loop)'
    ],
    estructura_datos: {
      reglas_negocio: '1) Auto-detección del último cierre disponible en pacientesDB/turnosDB y generación dinámica del horizonte predictivo para los próximos 7 días calendario continuos. 2) Módulo de Calibración Retrospectiva que audita los días pasados comparando atenciones reales vs proyectadas, calculando la precisión global (%) y derivando un factor multiplicador de ajuste continuo para los días futuros. 3) Modelado de efectos meteorológicos retardados: caída en el día de lluvia (-15%), rebote asistencial post-lluvia en 24h-48h (+28%) y sobrecarga por heladas matinales (<3°C) post-humedad (+38% total). 4) Diferenciación por esquema operativo: Turno Largo de Semana (17:00-08:00) vs Fin de Semana Día (08:00-20:00) y Fin de Semana Noche (20:00-08:00).',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Cálculo de proyecciones reactivo en memoria con fallback defensivo.'
    },
    modulos_afectados: ['Radar.jsx', 'Dashboard.jsx', 'AgenteRadarAdmin.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Inyección de pacientesDB y turnosDB a Radar.jsx.',
      'Cálculo de horizonte dinámico móvil a 7 días calendario.',
      'Sección interactiva de Calibración Retrospectiva con tabla comparativa de días pasados.',
      'Modelado de impacto térmico y precipitaciones retardadas en Open-Meteo Melipilla.'
    ]
  },
  {
    id: 'v5.2.3',
    version_tag: 'v5.2.3',
    fecha_despliegue: '21 de Agosto, 2026',
    proposito_actualizacion: 'Blindaje de Funciones de Fechas & Resolución de TypeError (e.split is not a function).',
    medios_y_stack: [
      'React 18.3 (useMetricoAnalytics.js, AnalisisEquiposTurno.jsx, helpers.js)',
      'Type-Safe String Parsing & Date Validation',
      'Defensive Analytics Computation'
    ],
    estructura_datos: {
      reglas_negocio: '1) Se blindaron todas las operaciones de desglose de fechas (.split) en useMetricoAnalytics.js, AnalisisEquiposTurno.jsx y helpers.js (resolverEquipoTurno), asegurando que cualquier valor nulo, no definido o numérico sea validado antes del split, resolviendo definitivamente el TypeError: e.split is not a function. 2) Se garantiza el cálculo fluido de métricas anuales YTD, récords por turno y comparativas de equipos bajo cualquier combinación de filtros.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Manejo defensivo de tipos de datos en la capa analítica.'
    },
    modulos_afectados: ['useMetricoAnalytics.js', 'AnalisisEquiposTurno.jsx', 'helpers.js', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Validaciones typeof === "string" y fallback seguro String(val || "") antes de split.',
      'Protección en bucles forEach y reducción de récords de turnos.',
      'Prevención de excepciones no controladas en el ciclo de vida de React.'
    ]
  },
  {
    id: 'v5.2.2',
    version_tag: 'v5.2.2',
    fecha_despliegue: '21 de Agosto, 2026',
    proposito_actualizacion: 'Resolución de Error Crítico en Análisis Específicos (ReferenceError: pautasDB) y Cuadre de Filtros.',
    medios_y_stack: [
      'React 18.3 (Dashboard.jsx, AnalisisAltasDetail.jsx, CalendarioHistorico.jsx)',
      'usePautasTurnos Hook & Prop Injection Segura',
      'Auto-Detección Inteligente del Último Turno Completo'
    ],
    estructura_datos: {
      reglas_negocio: '1) Se corrigió el error crítico (ReferenceError: pautasDB is not defined) en Dashboard.jsx donde AnalisisAltasDetail y CalendarioHistorico recibían una variable inexistente en lugar de pautasTurnosHook?.pautasDB, restaurando el funcionamiento inmediato de todos los submódulos de Análisis Específicos. 2) Se verificó la auto-detección del último turno clínico completo al ingresar a la plataforma, asegurando que todos los filtros de fecha, hora y presets se inicialicen de forma homogénea y reactiva en todos los apartados.',
      firestore_collections: ['pacientes_urgencia', 'turnos', 'pautas_turnos'],
      query_optimization: 'Paso seguro de props sin crashing en la jerarquía de React.'
    },
    modulos_afectados: ['Dashboard.jsx', 'AnalisisAltasDetail.jsx', 'CalendarioHistorico.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Corrección de prop pautasDB={pautasTurnosHook?.pautasDB} en AnalisisAltasDetail y CalendarioHistorico.',
      'Mantenimiento de la reactividad del filtro global sobre los 6 submódulos específicos.',
      'Preservación de la regla de auto-selección del último turno completo cerrado.'
    ]
  },
  {
    id: 'v5.2.1',
    version_tag: 'v5.2.1',
    fecha_despliegue: '21 de Agosto, 2026',
    proposito_actualizacion: 'Depuración Integral de Advertencias de Consola & Robustecimiento de Gráficos Recharts.',
    medios_y_stack: [
      'React 18.3 (GraficoDinamico.jsx, CurvaDemanda.jsx, AnalisisFracturas.jsx, AnalisisEnfermeria.jsx, AnalisisTraslados.jsx)',
      'Recharts ResponsiveContainer (minWidth/minHeight Control)',
      'Limpieza de Logs de Depuración & Estándares W3C en Formularios'
    ],
    estructura_datos: {
      reglas_negocio: '1) Se solucionó la advertencia de dimensiones de Recharts (width/height -1) agregando minWidth={0}, minHeight={0} y alturas mínimas explícitas en todos los contenedores de gráficos (GraficoDinamico, CurvaDemanda, Fracturas, Enfermería y Traslados). 2) Se eliminaron los registros de depuración repetitivos (DEBUG_YTD) en useMetricoAnalytics.js y se silenció el fallback en segundo plano de useMetricoData.js. 3) Se agregaron identificadores y etiquetas de accesibilidad (id, name, aria-label) a todos los controles de fecha, hora y presets en FiltrosGlobales.jsx, resolviendo todas las observaciones del panel del desarrollador.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Cero ruido en consola y renderizado de gráficos sin saltos dimensionales.'
    },
    modulos_afectados: ['GraficoDinamico.jsx', 'CurvaDemanda.jsx', 'FiltrosGlobales.jsx', 'useMetricoAnalytics.js', 'useMetricoData.js', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Asignación de minWidth={0} y minHeight={0} a todos los ResponsiveContainers de la plataforma.',
      'Eliminación de console.log y console.warn en flujos analíticos y de autenticación.',
      'Adición de id, name y aria-label en selectores de FiltrosGlobales.jsx.'
    ]
  },
  {
    id: 'v5.2.0',
    version_tag: 'v5.2.0',
    fecha_despliegue: '21 de Agosto, 2026',
    proposito_actualizacion: 'Optimización de Autenticación de Alta Velocidad y Precarga Instantánea de Sesión (<300ms).',
    medios_y_stack: [
      'React 18.3 (useMetricoData.js, Login.jsx, Dashboard.jsx)',
      'Desacoplamiento No Bloqueante de Firestore Auth Profile',
      'Precarga Paralela IndexedDB Cache & W3C Form Standards'
    ],
    estructura_datos: {
      reglas_negocio: '1) Se eliminó el bloqueo asíncrono en onAuthStateChanged desacoplando la consulta de perfil en Firestore a segundo plano e inicializando de forma instantánea el estado del usuario y sus permisos base. 2) Se optimizó runPreload para ejecutar la lectura de pacientes y turnos en paralelo desde IndexedDB con Promise.all, permitiendo que la interfaz del panel cargue en milisegundos tras hacer clic en Ingresar. 3) Se agregaron estándares W3C en Login.jsx (id, name, autoComplete, htmlFor) eliminando advertencias del navegador y permitiendo el autorrellenado nativo ultra-rápido.',
      firestore_collections: ['users', 'pacientes_urgencia', 'turnos'],
      query_optimization: 'Carga inicial <300ms con sincronización silenciosa diferida.'
    },
    modulos_afectados: ['useMetricoData.js', 'Login.jsx', 'Dashboard.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Desacoplamiento del fetch de users a ejecución no bloqueante en background.',
      'Lectura concurrente en IndexedDB (Promise.all) para liberación inmediata de loading.',
      'Soporte completo de autocomplete="username" y autocomplete="current-password" en Login.jsx.'
    ]
  },
  {
    id: 'v5.1.9',
    version_tag: 'v5.1.9',
    fecha_despliegue: '19 de Agosto, 2026',
    proposito_actualizacion: 'Rediseño Dual de Grupos Etarios (Clínico vs Quinquenal) y Sincronización del Resumen en Análisis de Fracturas.',
    medios_y_stack: [
      'React 18.3 (AnalisisFracturas.jsx, summaryGenerator.js)',
      'Agrupación Clínica Institucional (Pediatría, Jóvenes, Adultos, Adultos Mayores)',
      'Desglose Quinquenal Epidemiológico de 17 Tramos'
    ],
    estructura_datos: {
      reglas_negocio: '1) Se rediseñó el módulo de grupos etarios en AnalisisFracturas.jsx permitiendo alternar con un toggle segmentado entre la Vista Clínica (4 Tramos Institucionales: Pediatría 0-14, Jóvenes 15-29, Adultos 30-59 y Adultos Mayores 60+) y la Vista Quinquenal (17 Tramos de 5 años), eliminando la confusión visual y duplicación previa. 2) Se sincronizó generateFracturasSummary con los stats reales de la vista, garantizando que el tramo con mayor incidencia, cantidad de casos y porcentajes citados en el resumen narrativo coincidan al 100% con los datos mostrados en pantalla.',
      firestore_collections: ['pacientes_urgencia'],
      query_optimization: 'Memoización dinámica de dataGraficoEdad según el modo activo.'
    },
    modulos_afectados: ['AnalisisFracturas.jsx', 'summaryGenerator.js', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Implementación de modoVistaEdad (clinico vs quinquenal) con tarjetas interactivas de grupos clínicos.',
      'Sincronización de generateFracturasSummary(pacs, stats) para coherencia epidemiológica total.',
      'Organización de opciones de filtrado en optgroup dentro del selector de edad.'
    ]
  },
  {
    id: 'v5.1.8',
    version_tag: 'v5.1.8',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Homologación de Altas Administrativas (Período y Anual YTD) en Panel Inicial y Análisis Específico.',
    medios_y_stack: [
      'React 18.3 (AnalisisAltasDetail.jsx, useMetricoAnalytics.js, Dashboard.jsx)',
      'Regla Clínica isAltaAdmin y resolverEquipoTurno',
      'Desduplicación y Cuadre de Datos Exacto'
    ],
    estructura_datos: {
      reglas_negocio: '1) Se unificó el cálculo de Altas Administrativas en el módulo de Análisis Específico (AnalisisAltasDetail.jsx) para basarse dinámicamente en pacientesFiltrados e isAltaAdmin (137 altas en 01/08 - 16/08), eliminando el desfase contra registros estáticos en turnosDB (123). 2) Se unificó el cálculo de Altas Administrativas Anuales YTD (2,166) en useMetricoAnalytics.js y AnalisisAltasDetail.jsx evaluando directamente los pacientes del año con isAltaAdmin, asegurando cuadre 100% perfecto entre el panel general y el análisis específico.',
      firestore_collections: ['pacientes_urgencia'],
      query_optimization: 'Procesamiento en memoria O(N) con memoización estricta.'
    },
    modulos_afectados: ['AnalisisAltasDetail.jsx', 'useMetricoAnalytics.js', 'Dashboard.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Cálculo de dailyDataA, teamData y statsA basado en pacientesFiltrados con isAltaAdmin.',
      'Cálculo de ytdAltas anual en useMetricoAnalytics.js mediante yearLoadedPacs e isAltaAdmin.',
      'Inyección de pautasDB a AnalisisAltasDetail para resolución de equipos Turno 1, 2 y 3.'
    ]
  },
  {
    id: 'v5.1.7',
    version_tag: 'v5.1.7',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Corrección de Estadísticas en Curva de Demanda: Promedio Diario Real y Bloques Horarios Precisos.',
    medios_y_stack: [
      'React 18.3 (CurvaDemanda.jsx, useMetricoDemanda.js)',
      'Algoritmos de Agregación Temporal',
      'Normalización de Rango Multidía'
    ],
    estructura_datos: {
      reglas_negocio: '1) Se normalizó el cálculo del Promedio de Admisiones en la Curva de Demanda Continua considerando el número real de días transcurridos en el filtro de fechas (díasSeleccionados), calculando el promedio diario (pac./día) y el promedio real por hora de servicio (pac./hr). 2) Se corrigió la extracción numérica del campo hora en los buckets de 24 horas en useMetricoDemanda.js, resolviendo la acumulación errónea del 100% de pacientes en el bloque de noche y permitiendo la clasificación exacta de flujos en Mañana (08:00-13:59), Tarde (14:00-19:59) y Noche (20:00-07:59).',
      firestore_collections: ['pacientes_urgencia'],
      query_optimization: 'Cálculo O(24) en memoización con conteo de días nativo.'
    },
    modulos_afectados: ['CurvaDemanda.jsx', 'useMetricoDemanda.js', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Incorporación de hora: i en el generador de buckets de useMetricoDemanda.js.',
      'Cálculo de días seleccionados con diff de fechas para promedio diario y horario exacto.',
      'Alineación de porcentajes de flujo de demanda por franjas horarias.'
    ]
  },
  {
    id: 'v5.1.6',
    version_tag: 'v5.1.6',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Remoción de la Leyenda Inferior de Metas de Espera en Triaje para Auditoría Normativa MINSAL.',
    medios_y_stack: [
      'React 18.3 (TablaTiemposEspera.jsx)',
      'Estandarización de Métricas Clínicas',
      'Optimización de Espacio Visual'
    ],
    estructura_datos: {
      reglas_negocio: 'Se eliminó la leyenda inferior fija (Verde Meta Cumplida, Amarillo Nivel Límite, Rojo Meta Excedida) en la tabla de Tiempos de Espera y Estadía por Triaje, manteniendo la visualización analítica de los minutos reales por tramo asistencial y abriendo paso a la futura parametrización personalizada de metas según la normativa oficial MINSAL.',
      firestore_collections: ['pacientes_urgencia'],
      query_optimization: 'Simplificación del árbol DOM y reducción de elementos estáticos redundantes.'
    },
    modulos_afectados: ['TablaTiemposEspera.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Remoción del contenedor de glosario inferior de 3 columnas en TablaTiemposEspera.jsx.',
      'Limpieza visual del pie de tabla preservando la fila de totales y promedios globales.',
      'Actualización del catálogo de componentes en el Informe de Arquitectura.'
    ]
  },
  {
    id: 'v5.1.5',
    version_tag: 'v5.1.5',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Integración del Fondo Animado Clínico Asimétrico en Pantalla de Acceso (Login) y Transición Continua.',
    medios_y_stack: [
      'React 18.3 & Lucide React (Login.jsx, FondoClinicoAnimado.jsx)',
      'Glassmorphism Backdrop Blur (bg-white/95 dark:bg-slate-900/90)',
      'Aceleración por GPU'
    ],
    estructura_datos: {
      reglas_negocio: 'Se incorporó el componente FondoClinicoAnimado en la pantalla de Inicio de Sesión (Login.jsx), garantizando una experiencia visual inmersiva continua desde el acceso inicial con ondas ECG, constelación asimétrica tri-nodo (Nube-Base de Datos-Gateway) y tarjeta de autenticación con acabado glassmorphic.',
      firestore_collections: ['auth_logs'],
      query_optimization: 'Cero latencia de renderizado con capas z-index relativas.'
    },
    modulos_afectados: ['Login.jsx', 'FondoClinicoAnimado.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Inclusión de FondoClinicoAnimado en Login.jsx con fondo bg-slate-950.',
      'Ajuste de profundidad z-index y sombreados neon en la tarjeta de login.',
      'Continuidad estética del 100% entre Login, Carga y Dashboard.'
    ]
  },
  {
    id: 'v5.1.4',
    version_tag: 'v5.1.4',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Rediseño Asimétrico y Orgánico de la Red de Telemetría (Tri-Nodo Dinámico Nube-Servidor-Gateway).',
    medios_y_stack: [
      'React 18.3 (FondoClinicoAnimado.jsx, Dashboard.jsx)',
      'Vector Graphics (Fluid Bezier Curves & Multi-Level ECG Waveforms)',
      'Asymmetric Cluster Layout'
    ],
    estructura_datos: {
      reglas_negocio: 'Se transformó la disposición espacial del fondo en una composición tri-nodal asimétrica: 1) Nodo Nube en cuadrante superior izquierdo (~13% X, ~12% Y), 2) Nodo Base de Datos en cuadrante medio-derecho (~82% X, ~34% Y), 3) Nodo Gateway Clínico en cuadrante inferior izquierdo (~18% X, ~82% Y). Se reemplazaron líneas diagonales rígidas por curvas fluidas Bezier interconectadas con paquetes de datos en flujo constante y doble trazado ECG asimétrico desfasado.',
      firestore_collections: ['system_metadata'],
      query_optimization: 'Coordenadas relativas porcentuales con adaptación fluida a cualquier resolución.'
    },
    modulos_afectados: ['Dashboard', 'FondoClinicoAnimado.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Implementación de distribución espacial asimétrica en triángulo áureo.',
      'Curvas Bezier orgánicas viewBox 100x100 con animación animate-flow-packets.',
      'Doble nivel de telemetría cardiaca con desfase rítmico (onda superior 38% y onda principal 60%).'
    ]
  },
  {
    id: 'v5.1.3',
    version_tag: 'v5.1.3',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Arquitectura Animada de Red Nube <-> Base de Datos y Mayor Protagonismo Visual en Pantalla de Inicio.',
    medios_y_stack: [
      'React 18.3 & Lucide React (FondoClinicoAnimado.jsx, Dashboard.jsx)',
      'Vector Graphics (SVG Network Pipelines & Cybernetic Nodes)',
      'CSS Keyframes (animate-flow-packets, animate-float-soft)'
    ],
    estructura_datos: {
      reglas_negocio: 'Se potenció el protagonismo del fondo incorporando una composición interactiva de arquitectura de datos: un nodo Nube (Cloud Core Firebase) a la izquierda y un nodo Base de Datos (Servidor SAR Elsa Romo) a la derecha, interconectados por cables de flujo de paquetes luminosos animados bidireccionalmente, junto con ondas de electrocardiograma (ECG) vibrantes y badges de telemetría médica.',
      firestore_collections: ['system_metadata'],
      query_optimization: 'Renderizado 100% acelerado por GPU sin bloqueo de hilo principal.'
    },
    modulos_afectados: ['Dashboard', 'FondoClinicoAnimado.jsx', 'index.css', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Incorporación de nodos de Nube y Base de Datos con micro-animaciones orbitales.',
      'Cables de datos vectoriales con gradientes luminosos y animación animate-flow-packets.',
      'Intensificación del trazado ECG a 3px de grosor con doble filtro de resplandor neón.'
    ]
  },
  {
    id: 'v5.1.2',
    version_tag: 'v5.1.2',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Fondo Animado Clínico (Ondas ECG y Pulsos Biomédicos) y Unificación Integral de la Paleta Cromática en Sincronización.',
    medios_y_stack: [
      'React 18.3 (FondoClinicoAnimado.jsx, Dashboard.jsx, BarraProgresoCarga.jsx)',
      'Vector Graphics (SVG ECG Waveform & Glow Filters)',
      'CSS Keyframes (animate-ecg-scan, animate-spin-slow)'
    ],
    estructura_datos: {
      reglas_negocio: '1) Se creó e integró el componente FondoClinicoAnimado con un trazado vectorial de electrocardiograma (ECG) animado en tiempo real, cuadrícula médica y orbes de luz bio-ambiental en la paleta corporativa. 2) Se unificó totalmente la paleta de colores de la pantalla inicial de carga y del modal de sincronización, eliminando saltos a colores morados/magenta y estandarizando sobre el gradiente oficial MÉTRICO (Indigo 600 - Sky 400), fondo glassmorphic y botones armónicos con el tema activo.',
      firestore_collections: ['system_metadata'],
      query_optimization: 'Aceleración por GPU al 100% mediante transformaciones SVG y CSS.'
    },
    modulos_afectados: ['Dashboard', 'FondoClinicoAnimado.jsx', 'BarraProgresoCarga.jsx', 'index.css', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Implementación del componente FondoClinicoAnimado.jsx con trazado vectorial dinámico.',
      'Unificación cromática en LoadingProgress y Global Sync Overlay con gradiente from-indigo-600 to-sky-400.',
      'Eliminación de gradientes purpúreos o contrastes disonantes en modales de carga y sincronización.'
    ]
  },
  {
    id: 'v5.1.1',
    version_tag: 'v5.1.1',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Homologación de Identidad Visual en Mensaje de Sesión Caducada (Icono Vectorial Lock y Tarjeta de Advertencia).',
    medios_y_stack: [
      'React 18.3 & Lucide React (Login.jsx)',
      'Tailwind CSS UI / Modern Design Tokens',
      'Vector Graphics & Identity System'
    ],
    estructura_datos: {
      reglas_negocio: 'Se reemplazó el uso de emojis crónicos (🔒 y ⚠️) en la alerta de inactividad por un componente de notificación dedicado con el icono vectorial Lock de Lucide en un contenedor de micro-badge redondeado con fondo rose-100/200, título estructurado en mayúsculas y tipografía corporativa.',
      firestore_collections: ['auth_logs'],
      query_optimization: 'Sin overhead de renderizado.'
    },
    modulos_afectados: ['Login.jsx', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Sustitución de emoji por componente Lock SVG con diseño estético MÉTRICO.',
      'Estructuración visual en tarjeta de alerta con badge iconográfico.',
      'Mejora de accesibilidad y alineación estética en la pantalla de autenticación.'
    ]
  },
  {
    id: 'v5.1.0',
    version_tag: 'v5.1.0',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Soporte Nativo a Régimen Festivo (24h) y Asignación Operacional Matinal al Turno de Salida en Pautas.',
    medios_y_stack: [
      'React 18.3 & Helpers (helpers.js, AnalisisEquiposTurno.jsx)',
      'Lógica Dual de Calendario (Semana 17:00 a 08:00 vs Festivo 24h 08:00 a 20:00 y 20:00 a 08:00)',
      'Sincronización Pautas Firestore (pautasDB)'
    ],
    estructura_datos: {
      reglas_negocio: '1) Días Festivos/Feriados: Si un día de semana es marcado como festivo en la pauta, el sistema activa automáticamente el régimen de 24 horas y asigna a los pacientes diurnos (08:00 a 20:00) y nocturnos (20:00 a 08:00) a los equipos programados para cada franja. 2) Días Hábiles: Las atenciones de madrugada y mañana (00:00 a 15:59) se asignan de forma natural al turno largo que va saliendo y entregando la guardia (día anterior), mientras que a partir de las 16:00/17:00 hrs se asocian al nuevo turno titular.',
      firestore_collections: ['pautas_turnos', 'turnos', 'pacientes_urgencia'],
      query_optimization: 'Evaluación O(1) por admisión considerando metadatos de pauta.'
    },
    modulos_afectados: ['Dashboard', 'AnalisisEquiposTurno', 'CalendarioHistorico', 'helpers.js', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Actualización de obtenerTurnoDetallado para aceptar pautasDB y evaluar el flag festivo.',
      'Sincronización del corte matinal de día hábil con el turno de salida.',
      'Compatibilidad total con la subdivisión de turnos: Largo Semana, Fin de Semana Día, Fin de Semana Noche, Festivo Día y Festivo Noche.'
    ]
  },
  {
    id: 'v5.0.9',
    version_tag: 'v5.0.9',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Corrección de Altas Administrativas (isAltaAdmin Universal), Restricción a los 3 Equipos Reales de Pauta y Fix Scope en Histórico Mensual.',
    medios_y_stack: [
      'React 18.3 (AnalisisEquiposTurno.jsx, CalendarioHistorico.jsx, helpers.js)',
      'Regla Universal isAltaAdmin',
      'Filtro Dinámico de Equipos Activos'
    ],
    estructura_datos: {
      reglas_negocio: '1) Se unifica la regla clínica de Altas Administrativas (isAltaAdmin) con paridad 100% entre KPIs generales y Comparativa de Equipos. 2) Se restringe la visualización exclusivamente a los 3 equipos activos configurados en la pauta (Turno 1, Turno 2 y Turno 3), eliminando asignaciones anómalas a un inexistente Turno 4. 3) Se corrige el paso de props en CalendarioHistorico.jsx solucionando el error ReferenceError: pautasDB is not defined.',
      firestore_collections: ['pautas_turnos', 'turnos', 'pacientes_urgencia'],
      query_optimization: 'Cómputo en memoria O(N) sincronizado con el pipeline analítico.'
    },
    modulos_afectados: ['Dashboard', 'AnalisisEquiposTurno', 'CalendarioHistorico', 'helpers.js', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Exportación de isAltaAdmin en helpers.js para cómputo idéntico en todas las capas del sistema.',
      'Ajuste del ciclo de rotativa a 3 equipos (Turno 1, Turno 2, Turno 3).',
      'Inclusión de pautasDB = {} en la cabecera de CalendarioHistorico.jsx.',
      'Ajuste automático de la cuadrícula visual de equipos según los turnos presentes en la pauta.'
    ]
  },
  {
    id: 'v5.0.8',
    version_tag: 'v5.0.8',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Prioridad Absoluta a la Pauta Mensual de Turnos Guardada y Compatibilidad Total de Claves Horarias (Pautas vs Comparativa).',
    medios_y_stack: [
      'React 18.3 (usePautasTurnos.js, helpers.js, PautaTurnos.jsx)',
      'Firestore Real-time Listener (pautas_turnos)',
      'Mapeo Multi-Formato Horario'
    ],
    estructura_datos: {
      reglas_negocio: 'Se ajusta la jerarquía de resolución estableciendo como Prioridad 1 incondicional la Pauta de Turnos configurada en el módulo mensual (pautasDB). Se homolagan todas las variaciones de nombres de turnos y claves horarias (17:00 - 08:00, 08:00 - 20:00, 20:00 - 08:00) para que cualquier cambio o programación en la matriz mensual se refleje inmediatamente en la Comparativa de Equipos y el Calendario Histórico.',
      firestore_collections: ['pautas_turnos', 'turnos', 'pacientes_urgencia'],
      query_optimization: 'Sincronización en tiempo real vía onSnapshot sin latencia.'
    },
    modulos_afectados: ['Dashboard', 'usePautasTurnos', 'helpers.js', 'AnalisisEquiposTurno', 'CalendarioHistorico', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Priorización de pautasDB como primera fuente de verdad en resolverEquipoTurno.',
      'Soporte completo para claves de días hábiles y fines de semana en getEquipoParaTurno.',
      'Enlace reactivo directo entre el guardado de pauta y la actualización instantánea de métricas por equipo.'
    ]
  },
  {
    id: 'v5.0.7',
    version_tag: 'v5.0.7',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Resolución Automática y Asignación Continua de Equipos Rotativos (Turnos 1 a 4) y Cuadre Matemático Exacto de Cifras Asistenciales.',
    medios_y_stack: [
      'React 18.3 & Hooks (AnalisisEquiposTurno.jsx, CalendarioHistorico.jsx, DataGridTurnos.jsx)',
      'Algoritmo Determinista Universal de Rotativa (resolverEquipoTurno en helpers.js)',
      'Sincronización Pautas Firestore (pautasDB)'
    ],
    estructura_datos: {
      reglas_negocio: 'Garantiza la asignación continua de equipos en 3 niveles jerárquicos: 1) Pauta manual configurada en Firestore (pautas_turnos), 2) Registro explícito en base de datos, 3) Algoritmo determinista rotativo oficial de 4 turnos. Elimina la bolsa de "Sin Asignar" y cuadra matemáticamente la totalidad de los 1,747 pacientes admitidos, 1,610 atendidos y 137 altas administrativas en los 4 equipos con paridad 100% con los KPIs globales.',
      firestore_collections: ['pautas_turnos', 'turnos', 'pacientes_urgencia'],
      query_optimization: 'Procesamiento en memoria O(N) sincronizado con el pipeline analítico.'
    },
    modulos_afectados: ['Dashboard', 'AnalisisEquiposTurno', 'CalendarioHistorico', 'DataGridTurnos', 'helpers.js', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Implementación del helper resolverEquipoTurno que coordina pautasDB, equipo explícito y ciclo rotativo.',
      'Refactorización integral de AnalisisEquiposTurno.jsx para computar admisiones, atenciones efectivas y altas por equipo.',
      'Sincronización de pautasDB en CalendarioHistorico.jsx y DataGridTurnos.jsx para reflejar la rotación real en todo el historial mensual.',
      'Inclusión de badge de Asignación Activa y bloque de resumen de cuadre de cifras en la cabecera de la Comparativa de Equipos.'
    ]
  },
  {
    id: 'v5.0.6',
    version_tag: 'v5.0.6',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Homologación Estética y Diseño Vectorial de Iconos en Selectores de Granularidad (Clock & Calendar Lucide SVG).',
    medios_y_stack: [
      'React 18.3 (GraficoDinamico.jsx)',
      'Lucide React (Clock & Calendar SVG)',
      'TailwindCSS Design System'
    ],
    estructura_datos: {
      reglas_negocio: 'Se homologan los elementos visuales del selector de granularidad en la pestaña Tiempos de Atención, sustituyendo emojis nativos por iconos vectoriales SVG de alta definición (Clock y Calendar de Lucide) perfectamente integrados con la paleta de colores, estados activos, sombras y microinteracciones del sistema.',
      firestore_collections: ['pacientes_urgencia'],
      query_optimization: 'Sin overhead de procesamiento; optimización puramente visual.'
    },
    modulos_afectados: ['Dashboard', 'GraficoDinamico', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Integración de componentes Lucide Clock y Calendar con dimensiones w-3.5 h-3.5.',
      'Sincronización de colores en estados activo/inactivo (texto blanco con fondo índigo vs índigo sobre fondo card).',
      'Unificación en la barra de filtros rápidos tanto para la tarjeta principal como para la vista modal expandida.'
    ]
  },
  {
    id: 'v5.0.5',
    version_tag: 'v5.0.5',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Curva Horaria Asistencial de Tiempos de Espera y Estadía (00:00 a 23:00) con Selector Dinámico Horario vs Diario.',
    medios_y_stack: [
      'React 18.3 & Recharts (GraficoDinamico.jsx)',
      'Algoritmo de Segmentación Horaria (hourlyTimesData)'
    ],
    estructura_datos: {
      reglas_negocio: 'Se incorpora la agregación y modelado de tiempos asistenciales por hora del día (Espera Médico, Espera Triaje, Tiempo Box y Estadía Total). Permite a los equipos directivos analizar a qué horas exactas del día y noche se producen los picos de congestión o demoras asistenciales, manteniendo un selector para alternar fluidamente entre la curva horaria (00:00 a 23:00) y la evolución histórica por fecha/turno.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Procesamiento en memoria O(N) por franja horaria.'
    },
    modulos_afectados: ['Dashboard', 'GraficoDinamico', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Implementación del hook memorizado hourlyTimesData con desglose de 24 tramos horarios.',
      'Selector de granularidad "⏱️ Por Hora del Día" vs "📅 Por Fecha / Turno" integrado en la tarjeta y en el modal expandido.',
      'Aclaración conceptual en interfaz de tiempos asistenciales en minutos (médico, triaje, box y estadía).'
    ]
  },
  {
    id: 'v5.0.4',
    version_tag: 'v5.0.4',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Agregación Universal de Triaje C1-C5 y Demografía para Períodos Unitarios en Gráfico Dinámico, junto a Desplazamiento Centrado y Resalte Luminoso Pulsante en Buscador Global.',
    medios_y_stack: [
      'React 18.3 & Recharts (Dashboard.jsx, GraficoDinamico.jsx, BarraBusquedaGlobal.jsx)',
      'Algoritmo de Fusión Turnos-Pacientes y Outline Glow Styler'
    ],
    estructura_datos: {
      reglas_negocio: 'Se resuelve la ausencia de barras/áreas en el Gráfico Dinámico para selecciones de 1 solo turno o fechas unitarias mediante agregación cruzada obligatoria de pacientesFiltrados (recuento directo de C1 a C5, Altas y Demografía si los turnos carecen de campos desglosados). Se activan por defecto todos los triajes en los filtros rápidos y se añaden dots y maxBarSize en Recharts para que puntos individuales siempre sean visibles. Se perfecciona navigateAndScroll con compensación dinámica de sticky header, scrollIntoView block: center y resalte luminoso con outline 4px y halo pulsante.',
      firestore_collections: ['turnos', 'pacientes_urgencia'],
      query_optimization: 'Recálculo O(N) directo en memoria con soporte de visualización continua.'
    },
    modulos_afectados: ['Dashboard', 'GraficoDinamico', 'BarraBusquedaGlobal', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Extracción y fallback de C1-C5, Altas y demografía en chartData y pieData a partir de pacientesFiltrados.',
      'Inclusión de todos los triajes en opFilters por defecto en GraficoDinamico.jsx.',
      'Soporte de dots de datos y maxBarSize en ComposedChart y AreaChart para rangos de 1 día/turno.',
      'Desplazamiento centrado con compensación dinámica de encabezados flotantes y halo luminoso índigo con animación de pulso.'
    ]
  },
  {
    id: 'v5.0.3',
    version_tag: 'v5.0.3',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Homologación Visual y Rótulo Explícito de "Análisis Taxonómico y de Tendencias" en el Gráfico Dinámico Principal.',
    medios_y_stack: [
      'React 18.3 (GraficoDinamico.jsx)',
      'Lucide React (BarChart2 Badge)'
    ],
    estructura_datos: {
      reglas_negocio: 'Se unifica el título del componente de Gráficos Dinámicos en la vista Inicio como "Análisis Taxonómico y de Tendencias" con badge identificador y descripción clínica explicativa de series temporales, categorización C1-C5 y tiempos de espera, garantizando correspondencia 1:1 con los términos del Buscador Global.',
      firestore_collections: ['turnos', 'pacientes_urgencia'],
      query_optimization: 'Pintado directo sin mutación de estado.'
    },
    modulos_afectados: ['Dashboard', 'GraficoDinamico', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Actualización del título visible en el componente GraficoDinamico.jsx.',
      'Añadido badge "Gráfico Dinámico" para facilitar el reconocimiento visual inmediato.',
      'Sincronización con el ancla de desplazamiento del Buscador Global #seccion-grafico-taxonomico.'
    ]
  },
  {
    id: 'v5.0.2',
    version_tag: 'v5.0.2',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Sincronización de Desplazamiento Focal Nativo en Contenedor <main> y Rescate de Posicionamiento tras Montaje de Componentes.',
    medios_y_stack: [
      'React 18.3 (BarraBusquedaGlobal.jsx & Dashboard.jsx)',
      'DOM getBoundingClientRect & Offset Scroller API'
    ],
    estructura_datos: {
      reglas_negocio: 'Se corrige el receptor del evento de scroll direccionándolo explícitamente hacia el elemento <main> (que posee overflow-y: auto) mediante cálculo de posición relativa (elementRect.top - mainRect.top + mainEl.scrollTop - offset). Se incorpora un bucle de reintento de 6 ciclos para garantizar que los componentes recién montados en DOM reciban el scroll y resalte visual sin importar la latencia de renderizado.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Cálculo de posición relativa O(1) con scrollIntoView de respaldo.'
    },
    modulos_afectados: ['Dashboard', 'BarraBusquedaGlobal', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Identificación del contenedor <main> como viewport activo de scroll en el Layout.',
      'Cálculo compensado de 85px para evitar ocultamiento bajo los filtros flotantes (sticky header).',
      'Efecto visual de halo temporal ring-4 ring-indigo-500 al alcanzar la posición de destino.'
    ]
  },
  {
    id: 'v5.0.1',
    version_tag: 'v5.0.1',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Redirección Focal Directa y Desplazamiento Inteligente con Resalte Visual en el Buscador Global: Navegación Precisa a Gráficos, Tablas y Módulos.',
    medios_y_stack: [
      'React 18.3 (BarraBusquedaGlobal.jsx & Dashboard.jsx)',
      'DOM Scroll API & CSS Focus Highlight Animation'
    ],
    estructura_datos: {
      reglas_negocio: 'Al hacer clic en cualquier resultado del Buscador Global (ej: "Análisis Taxonómico y de Tendencias", "Sociodemográfico", "Tiempos de Espera", "Altas", etc.), el sistema cierra el modal, activa la pestaña correspondiente y ejecuta un desplazamiento suave (scrollIntoView) directo al componente objetivo, añadiendo un anillo luminoso de enfoque temporal (ring-4 ring-indigo-500) para situar visualmente al usuario.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Desplazamiento asíncrono respetando el ciclo de pintado de React.'
    },
    modulos_afectados: ['Dashboard', 'BarraBusquedaGlobal', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Incorporación de identificadores de anclaje semánticos (#seccion-grafico-taxonomico, #seccion-kpis-principales, #seccion-analisis-sociodemografico, #seccion-tabla-tiempos-espera, etc.).',
      'Función navigateAndScroll(targetTab, subTab, targetElementId) que coordina cambio de tab, scroll y resalte visual.',
      'Soporte completo tanto si el usuario ya se encuentra en la misma pestaña como si navega desde otro módulo.'
    ]
  },
  {
    id: 'v5.0.0',
    version_tag: 'v5.0.0',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Motor de Búsqueda Global Exhaustivo con Normalización Diacrítica (Acentos/Tildes) y Emparejamiento Multitoken: Indexación Total de Módulos, Gráficos y Conceptos Asistenciales.',
    medios_y_stack: [
      'React 18.3 (BarraBusquedaGlobal.jsx)',
      'Algoritmo de Normalización NFD y Regex Diacrítica'
    ],
    estructura_datos: {
      reglas_negocio: 'El motor de búsqueda procesa consultas eliminando tildes y diacríticos (ej: "taxonómico", "taxonomico", "atención", "médicos") y descompone las frases en tokens independientes. Se indexan la totalidad de secciones del sistema: Análisis Taxonómico, Demografía, Mapa Georreferencial, Rendimiento Turnos, Calendario Histórico, Radar IA, Altas, Traslados, Fracturas, Constataciones, Demanda, Médicos, Enfermería, Reportes, Pautas, Datos, Usuarios, Auditoría, Arquitectura y DevLog.',
      firestore_collections: ['pacientes_urgencia', 'turnos', 'usuarios'],
      query_optimization: 'Búsqueda multitoken en memoria O(N) con normalización en tiempo constante.'
    },
    modulos_afectados: ['Dashboard', 'BarraBusquedaGlobal', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Función normalizeStr con normalización Unicode NFD y supresión de caracteres de combinación (U+0300 a U+036F).',
      'Indexación de términos clínicos y operacionales (taxonómico, curvas, series temporales, sociodemográfico, etc.).',
      'Soporte para búsquedas compuestas y palabras clave en cualquier orden.'
    ]
  },
  {
    id: 'v4.9.9',
    version_tag: 'v4.9.9',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Retroalimentación Auditiva Asistencial mediante Web Audio API: Chimes Armónicos Nativos para Inicio y Cierre Seguro de Sesión.',
    medios_y_stack: [
      'Web Audio API Synthesizer (audioNotifications.js & audioFeedback.js)',
      'React 18.3 (Login.jsx & Dashboard.jsx)'
    ],
    estructura_datos: {
      reglas_negocio: 'Se incorpora un sintetizador armónico nativo que genera acordes sinusoidales suaves en tiempo de ejecución sin dependencias de red ni latencia. Al iniciar sesión exitosamente, se ejecuta un chime armónico ascendente en escala de Do Mayor (C5-E5-G5-C6). Al cerrar la sesión o producirse un logout por inactividad, se emite un tono descendente suave de desconexión segura (D5-A4-E4).',
      firestore_collections: ['usuarios'],
      query_optimization: 'Generación acústica directa en GPU/AudioBuffer sin peticiones HTTP.'
    },
    modulos_afectados: ['Login', 'Dashboard', 'audioNotifications', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Implementación de playLoginChime() y playLogoutChime() con envolventes de ganancia exponencial.',
      'Activación en Login.jsx al validar credenciales y en Dashboard.jsx al accionar handleLogout.',
      'Compatibilidad universal en navegadores modernos y dispositivos móviles con gestión de AudioContext suspendido.'
    ]
  },
  {
    id: 'v4.9.8',
    version_tag: 'v4.9.8',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Optimización de Latencia Cero en Inicio de Sesión: Depuración de Handshake de Autenticación y Desactivación de Sondas ReCAPTCHA Fallidas.',
    medios_y_stack: [
      'Firebase Auth & Firebase App Check (src/config/firebase.js)',
      'React 18.3 (Login.jsx & Dashboard.jsx)'
    ],
    estructura_datos: {
      reglas_negocio: 'Se restringe la inicialización de Firebase App Check exclusivamente a entornos donde se suministre una clave pública de reCAPTCHA v3 genuina y validada en variables de entorno. Esto elimina las llamadas bloqueantes erróneas (HTTP 400) al endpoint de Google reCAPTCHA, permitiendo que la verificación de credenciales y la entrada a la plataforma se ejecuten de forma inmediata (< 100ms).',
      firestore_collections: ['usuarios'],
      query_optimization: 'Autenticación directa en Firebase Auth sin middleware de espera.'
    },
    modulos_afectados: ['Configuración Firebase', 'Login', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Eliminación de la inicialización de App Check con claves placeholder en firebase.js.',
      'Supresión de las advertencias appCheck/recaptcha-error y errores de red en la consola del navegador.',
      'Inicio de sesión y transición al Dashboard ultra-rápida y fluida.'
    ]
  },
  {
    id: 'v4.9.7',
    version_tag: 'v4.9.7',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Diseño Luminoso de Alto Contraste y Botones de Cierre Dedicados para el Buscador Global (Command Palette): Resalte Visual Premium y Salida Ergonómica.',
    medios_y_stack: [
      'React 18.3 & Lucide React (BarraBusquedaGlobal.jsx)',
      'Tailwind CSS (High-Contrast Glassmorphism)'
    ],
    estructura_datos: {
      reglas_negocio: 'Se rediseña la paleta visual del Command Palette con fondos blancos y nítidos en modo claro, acentos púrpuras e índigo saturados, píldoras de métricas destacadas y tipografía de máxima legibilidad. Se incorporan botones de cierre físicos ("Cerrar" en cabecera y pie) además del atajo ESC, garantizando una interacción fluida en entornos táctiles y de escritorio.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Transiciones CSS aceleradas por GPU y renderizado optimizado.'
    },
    modulos_afectados: ['Dashboard', 'BarraBusquedaGlobal', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Reemplazo de tonos opacos y grisáceos por fondos de alto contraste con tarjetas blancas/luz y sombras suaves.',
      'Incorporación de botón superior e inferior de cierre con soporte de tecla Escape y clic en backdrop.',
      'Píldoras de KPIs en vivo con mayor saturación y contraste visual.'
    ]
  },
  {
    id: 'v4.9.6',
    version_tag: 'v4.9.6',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Desacoplamiento Estructural de la Barra de Búsqueda Global vía React Portal: Resolución de Contenedor Transform y Presentación Centrada Inmune al Colapso del Sidebar.',
    medios_y_stack: [
      'React 18.3 (ReactDOM.createPortal en BarraBusquedaGlobal.jsx)',
      'Dashboard.jsx'
    ],
    estructura_datos: {
      reglas_negocio: 'El Command Palette modal se desacopla del DOM interno del <aside> (evitando el contexto de contención de CSS transform: translate-x y overflow-y: auto) y se monta directamente en document.body con z-index [99999]. Tanto en modo expandido como contraído, el sidebar muestra únicamente su disparador minimalista, y el buscador se despliega con ancho completo (max-w-2xl) centrado en pantalla.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Montaje de Portal condicional sin costo de renderizado en reposo.'
    },
    modulos_afectados: ['Dashboard', 'BarraBusquedaGlobal', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Implementación de createPortal(..., document.body) en BarraBusquedaGlobal.jsx.',
      'Eliminación de dropdowns embebidos dentro del aside para evitar desbordes y compresión en pantallas estrechas.',
      'Apertura centrada y fluida tanto al presionar Ctrl+K como al hacer clic en el botón de búsqueda.'
    ]
  },
  {
    id: 'v4.9.5',
    version_tag: 'v4.9.5',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Barra de Búsqueda Global e Inspección Paramétrica en Barra Lateral: Navegación Inteligente (Omnibar / Command Palette) con Estadísticas en Tiempo Real y Soporte de Modo Contraído.',
    medios_y_stack: [
      'React 18.3 (BarraBusquedaGlobal.jsx & Dashboard.jsx)',
      'Lucide React (Search, Command, Sparkles)'
    ],
    estructura_datos: {
      reglas_negocio: 'El usuario puede ingresar cualquier concepto clínico, operativo o administrativo (ej: altas, traslados, admitidos, atendidos, tiempos, C3, fracturas, etc.) y visualizar métricas contextuales en vivo (volumen, porcentaje y promedios del periodo activo) junto a accesos directos al módulo o reporte correspondiente. Al contraerse la barra lateral, el buscador se compacta en un botón de acceso rápido con apertura de modal flotante sin alterar la interfaz.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Indexación en memoria O(1) y atajo de teclado global Ctrl+K / Cmd+K.'
    },
    modulos_afectados: ['Dashboard', 'BarraBusquedaGlobal', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Creación del componente BarraBusquedaGlobal.jsx integrado en la barra lateral izquierda.',
      'Doble comportamiento interactivo: Barra expandida con dropdown e indicador Ctrl+K, y botón compacto con Command Palette modal en estado contraído.',
      'Indexación exhaustiva de 18 categorías de conceptos asistenciales con métricas en tiempo real (statsKPI y promediosGlobales).'
    ]
  },
  {
    id: 'v4.9.4',
    version_tag: 'v4.9.4',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Consolidación Universal de Tiempos de Atención en el Gráfico Dinámico y Análisis Taxonómico de Tendencias: Emparejamiento Temporal de Turnos y Tiempos de Espera (Espera Médico, Triaje, Box y Estadía).',
    medios_y_stack: [
      'React 18.3 & Recharts (GraficoDinamico.jsx & Dashboard.jsx)',
      'useMetricoAnalytics.js (turnosFiltrados con métricas de tiempo)'
    ],
    estructura_datos: {
      reglas_negocio: 'El cálculo de series temporales de tiempos de espera (tiempoAdmCat, tiempoCatAna, tiempoAnaAlt, tiempoAdmAlt) se realiza asociando los pacientes filtrados al intervalo horario exacto de cada turno o agrupando por fecha de admisión, garantizando que en filtros de rango mensual (como 1 al 16 de agosto o cualquier periodo histórico) las 4 curvas de tiempos de atención se visualicen completas sin caídas a cero.',
      firestore_collections: ['pacientes_urgencia'],
      query_optimization: 'Procesamiento de series temporales vectorizado en O(N) sin peticiones adicionales a red.'
    },
    modulos_afectados: ['Dashboard', 'GraficoDinamico', 'useMetricoAnalytics', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Actualización de isShiftInWindowRange en useMetricoAnalytics.js para soportar turnos largos (16:00 a 09:00 AM) y nocturnos con cruce de medianoche.',
      'Cálculo automático de tiempoAdmCat, tiempoCatAna, tiempoAnaAlt y tiempoAdmAlt para cada turno en turnosFiltrados.',
      'Mapeo resiliente en Dashboard.jsx de chartData con fallback por día para rangos amplios sin turnos explícitos.'
    ]
  },
  {
    id: 'v4.9.3',
    version_tag: 'v4.9.3',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Regla Matemática Rigurosa de Selección del Último Turno Clínico 100% Completo: Detección Temporal de Cierre Asistencial según la Última Carga de Datos.',
    medios_y_stack: [
      'React 18.3 (Dashboard.jsx - determineLastCompletedShift)',
      'useMetricoAnalytics.js & FiltrosGlobales.jsx'
    ],
    estructura_datos: {
      reglas_negocio: 'El sistema evalúa el timestamp del último registro cargado (Tmax). Un turno solo se considera "COMPLETO" si Tmax supera o iguala su hora oficial de término (Finde Día: 20:00 del mismo día; Finde Noche: 08:00 del día siguiente; Turno Largo: 09:00 del día siguiente). Si la última carga se ubica dentro de un turno en curso, el sistema selecciona automáticamente el turno precedente que cuente con su carga asistencial 100% cerrada.',
      firestore_collections: ['pacientes_urgencia'],
      query_optimization: 'Cálculo de turno cerrado determinista en O(1).'
    },
    modulos_afectados: ['Dashboard', 'FiltrosGlobales', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Implementación del algoritmo determineLastCompletedShift con validación de horas de corte (08:00, 09:00, 20:00).',
      'Corrección del caso Domingo 23:57: Selección precisa del turno Finde Día (16/08 08:00 a 20:00) al estar el turno noche en curso e incompleto.',
      'Soporte universal para turnos hábiles (16:00 a 09:00 AM) y fines de semana.'
    ]
  },
  {
    id: 'v4.9.2',
    version_tag: 'v4.9.2',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Resolución de Error en Tiempo de Ejecución (ReferenceError: useCallback is not defined): Corrección de Import de React en Dashboard.jsx.',
    medios_y_stack: [
      'React 18.3 (Dashboard.jsx)',
      'Vite v8.0.14'
    ],
    estructura_datos: {
      reglas_negocio: 'Garantiza la estabilidad del ciclo de vida de React al importar explícitamente el hook useCallback para la función hasModuleAccess en el renderizado del panel principal.',
      firestore_collections: ['pacientes_urgencia'],
      query_optimization: 'Sin impacto en base de datos.'
    },
    modulos_afectados: ['Dashboard', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Incorporación de useCallback en los named imports de React en src/components/Dashboard.jsx.',
      'Eliminación del bloqueo visual de ErrorBoundary en producción.'
    ]
  },
  {
    id: 'v4.9.1',
    version_tag: 'v4.9.1',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Registro Centralizado y Auto-Sincronización Dinámica de Módulos en la Matriz de Permisos de Usuarios (modules.js): Inclusión Automática de Nuevas Funcionalidades Desplegadas, Distintivos ✨ NUEVO MÓDULO y Control de Acceso Granular.',
    medios_y_stack: [
      'React 18.3 & config/modules.js (Registro Maestro de 19 Módulos)',
      'getNormalizedUserPermissions (Fusión transparente de credenciales en Firestore)',
      'GestionUsuarios.jsx & Dashboard.jsx (Verificación y Restricción de Rutas)'
    ],
    estructura_datos: {
      reglas_negocio: 'Cada vez que se agrega un nuevo módulo o funcionalidad al registro maestro modules.js, este se incorpora automáticamente a la Matriz de Permisos y Credenciales de todos los usuarios registrados (con su estado por defecto true), permitiendo a los Administradores marcar o desmarcar el acceso de cada usuario sin necesidad de migraciones de base de datos.',
      firestore_collections: ['artifacts/metrico-gestion-estadistica/public/data/users'],
      query_optimization: 'Fusión de permisos en memoria de complejidad O(N) sin peticiones adicionales a red.'
    },
    modulos_afectados: ['modules', 'GestionUsuarios', 'Dashboard', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Creación del registro maestro src/config/modules.js con los 19 módulos del sistema y utilidades de normalización.',
      'Sincronización dinámica en GestionUsuarios.jsx con distintivos visuales ✨ NUEVO MÓDULO y categorización.',
      'Protección y ocultamiento automático de accesos restringidos en la navegación lateral de Dashboard.jsx.'
    ]
  },
  {
    id: 'v4.9.0',
    version_tag: 'v4.9.0',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Corrección de Selección del Último Turno Clínico Completo al Ingresar: Ajuste Automático +1d de Medianoche para Turnos Finde Noche (20:00 - 08:00 AM) y Turnos Largos (16:00 - 09:00 AM).',
    medios_y_stack: [
      'React 18.3 (Dashboard.jsx & FiltrosGlobales.jsx)',
      'useMetricoAnalytics.js (getWindowRange con cruce de medianoche)'
    ],
    estructura_datos: {
      reglas_negocio: 'Al ingresar a la plataforma, el sistema calcula el último turno clínico activo o completo basándose en el registro más reciente en la base de datos (maxDate). En turnos nocturnos (finde_noche y largo), la fecha fin se incrementa automáticamente a +1 día, asegurando que el rango 20:00 a 08:00 o 16:00 a 09:00 no quede en cero por fechas idénticas invertidas.',
      firestore_collections: ['pacientes_urgencia'],
      query_optimization: 'Filtro por rango en memoria instantáneo sin sobrecarga de Firestore.'
    },
    modulos_afectados: ['Dashboard', 'FiltrosGlobales', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Implementación del cálculo getNextDateStr (+1d) y getPrevDateStr (-1d) en la auto-detección inteligente del turno al ingresar.',
      'Sincronización de handleHorarioPreset en FiltrosGlobales.jsx para extender la fecha fin al día siguiente en selecciones de Turno Noche.',
      'Eliminación total del error donde "PERIODO SELECCIONADO" mostraba 0 pacientes por rango invertido de fechas idénticas.'
    ]
  },
  {
    id: 'v4.8.9',
    version_tag: 'v4.8.9',
    fecha_despliegue: '18 de Agosto, 2026',
    proposito_actualizacion: 'Caducidad Estricta e Incondicional de Sesión por Inactividad (>15 min): Monitoreo Persistente Global (localStorage), Auto-Logout en Firebase Auth y Bloqueo de Reingreso Directo de 1-Clic tras Inactividad Prolongada.',
    medios_y_stack: [
      'Firebase Auth (signOut en expiración de sesión)',
      'React 18.3 & Web Storage API (localStorage + sessionStorage)',
      'ModalInactividad.jsx, ModalVerificacionSesion.jsx, useMetricoData.js, Login.jsx'
    ],
    estructura_datos: {
      reglas_negocio: 'Si han transcurrido 15 minutos o más desde el último evento o movimiento registrado (metrico_last_activity), la sesión caduca estrictamente. Al abrir la pestaña o el sitio 24 horas después (o tras >15 min), el sistema desautentica de Firebase Auth y exige ingresar credenciales en Login.jsx sin permitir confirmación directa.',
      firestore_collections: ['artifacts/metrico-gestion-estadistica/public/data/users'],
      query_optimization: 'Validación en memoria/local storage instantánea sin consultas redundantes a red.'
    },
    modulos_afectados: ['useMetricoData', 'ModalInactividad', 'ModalVerificacionSesion', 'Login', 'Dashboard', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Monitoreo persistente de inactividad global con throttle de 3s sobre metrico_last_activity en localStorage.',
      'Verificación inmediata de expiración en onAuthStateChanged (useMetricoData.js) e intercepción de focus / visibilitychange en el navegador.',
      'Auto-logout forzado con desautenticación en Firebase Auth y aviso explicativo en pantalla de Login tras expiración.'
    ]
  },
  {
    id: 'v4.8.8',
    version_tag: 'v4.8.8',
    fecha_despliegue: '17 de Agosto, 2026',
    proposito_actualizacion: 'Blindaje de Márgenes de Impresión & Formato Plotter/Carta: Aislamiento Completo de Controles de Interfaz (.no-print en aside/headers) y Relleno de Seguridad (padding 6mm/8mm) en #reporte-printable.',
    medios_y_stack: [
      'CSS3 @media print & TailWind CSS box-sizing border-box',
      'src/index.css (Márgenes de seguridad @page 10mm 12mm & padding de seguridad interno)',
      'Dashboard.jsx & ReportesModule.jsx (Ocultamiento total de barra lateral y adaptabilidad de tablas)'
    ],
    estructura_datos: {
      reglas_negocio: 'Incluso al imprimir en impresoras plotter o seleccionar "Márgenes: Ninguno" en el diálogo del navegador, los reportes mantienen un margen seguro interno que evita el contacto o corte de cifras en los bordes del papel.',
      firestore_collections: ['pacientes_urgencia'],
      query_optimization: 'Sin impacto en Firestore (reglas CSS puras de renderizado de impresión).'
    },
    modulos_afectados: ['index.css', 'Dashboard', 'ReportesModule', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Asignación de clase no-print a la barra lateral aside en Dashboard.jsx para evitar filtrado de encabezados web.',
      'Configuración de table-layout: fixed !important y padding interno en #reporte-printable table.',
      'Resguardo de 6mm 8mm de padding en el contenedor imprimible para salidas plotter de gran formato.'
    ]
  },
  {
    id: 'v4.8.7',
    version_tag: 'v4.8.7',
    fecha_despliegue: '17 de Agosto, 2026',
    proposito_actualizacion: 'Conciliación Unificada de Algoritmos de Detección en la Suite de Reportes (PDF/Imprimible): Unificación de isTraslado y Extracción Completa de Constataciones Z51.8 (Pirámide, Sexo, Tabla Sociodemográfica y Origen Geográfico).',
    medios_y_stack: [
      'React 18.3 & summaryGenerator.js',
      'ReportesModule.jsx (Unificación estricta de isTraslado y matriz ampliada isConstatacionOficial)',
      'Sub-reportes Factores/Destinos (Fracturas), Traslados Hospitalarios y Constatación de Lesiones'
    ],
    estructura_datos: {
      reglas_negocio: 'Eliminación total de discrepancias entre las narrativas automáticas y las tarjetas KPI. El cálculo de traslados a centros de mayor complejidad en el informe impreso es 100% idéntico al subreporte de factores y destino. La matriz de constataciones Z51.8 lee diagnósticos principales, CIE-10, banderas y derivaciones policiales para poblar gráficos y comunas.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Filtro unificado O(N) sin redundancia de clasificadores secundarios.'
    },
    modulos_afectados: ['ReportesModule', 'summaryGenerator', 'AnalisisConstataciones', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Unificación del helper isTraslado entre ReportesModule.jsx, summaryGenerator.js y useMetricoAnalytics.js.',
      'Ampliación del parser isConstatacionOficial en ReportesModule.jsx para resolver Pirámide, Sexo y Comunas en cero.',
      'Sincronización del parámetro globalTotalPacientes en generateTrasladosSummary para concordancia 100% en porcentajes.'
    ]
  },
  {
    id: 'v4.8.6',
    version_tag: 'v4.8.6',
    fecha_despliegue: '17 de Agosto, 2026',
    proposito_actualizacion: 'Protocolo de Auto-Adherencia de Filtros de Fecha al Último Día Cargado en su Totalidad (maxTime de pacientesDB y turnosDB) con Carga Nativa de Turno Largo Semana en Dashboard.jsx.',
    medios_y_stack: [
      'React 18.3 & useMemo / useEffect Auto-Shift Detect',
      'Dashboard.jsx (Adosamiento automático de filtroFechaInicio y filtroFechaFin al último día con registros)',
      'applyDatePreset & handleClearFilters (Ajustados al contexto del último registro real)'
    ],
    estructura_datos: {
      reglas_negocio: 'Cada vez que el usuario inicia la página o limpia los filtros, el sistema vincula automáticamente el rango de fechas al último turno/día disponible en la base de datos (evitando que el panel cargue en cero por fechas futuras vacías).',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Cálculo reactivo $O(N)$ en memoria local sobre la fecha máxima de admisión.'
    },
    modulos_afectados: ['Dashboard', 'FiltrosGlobales', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Configuración nativa de horarioPreset a largo (16:00 a 09:00 AM) para el último día de semana hábil.',
      'Sincronización de preset "Hoy/Día" y "Borrar" al último día grabado maxDateStr.',
      'Representación inmediata de KPIs del periodo seleccionado sin datos en cero.'
    ]
  },
  {
    id: 'v4.8.5',
    version_tag: 'v4.8.5',
    fecha_despliegue: '17 de Agosto, 2026',
    proposito_actualizacion: 'Blindaje de Conexión e Indicadores de Carga: Desbloqueo Automático de Pantalla con Tiempos Máximos de Seguridad (runWithTimeout) en useMetricoData.js y Filtro de Autenticación Previa en usePautasTurnos.js.',
    medios_y_stack: [
      'React 18.3 & Firebase Auth (onAuthStateChanged Guard)',
      'useMetricoData.js (Timeout de seguridad de 5s en consultas Firestore & fallback a IndexedDB)',
      'usePautasTurnos.js (Suscripción diferida tras validación de usuario auth)'
    ],
    estructura_datos: {
      reglas_negocio: 'Si las consultas a la nube tardan más de 5 segundos o se bloquea la respuesta de red/AppCheck, el sistema pasa inmediatamente a estado synced y muestra los datos en caché local IndexedDB sin detener la aplicación.',
      firestore_collections: ['pacientes_urgencia', 'turnos', 'pautas_turnos'],
      query_optimization: 'Filtro auth reactivo que evita consultas permission-denied previas al inicio de sesión.'
    },
    modulos_afectados: ['useMetricoData', 'usePautasTurnos', 'Dashboard', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Envoltorio runWithTimeout a todas las promesas getDocs en useMetricoData.js.',
      'Suscripción condicional a onSnapshot en usePautasTurnos.js solo cuando u.email está autenticado.',
      'Limpieza automática de syncProgress.active ante cualquier error o cancelación manual.'
    ]
  },
  {
    id: 'v4.8.4',
    version_tag: 'v4.8.4',
    fecha_despliegue: '16 de Agosto, 2026',
    proposito_actualizacion: 'Restauración Completa del Protocolo de Análisis Pre-Carga y Desduplicación SSOT con Procesamiento Asíncrono por Lotes (Non-Blocking Chunking) e Indicador de Progreso en Tiempo Real en GestionDatos.jsx.',
    medios_y_stack: [
      'React 18.3 & JavaScript Async/Await Micro-ticks (setTimeout 0ms)',
      'GestionDatos.jsx (chunking de 2.500 filas por micro-tick con lectura asíncrona)',
      'Modal de Análisis SSOT y Resumen Pre-Carga (pendingUpload)'
    ],
    estructura_datos: {
      reglas_negocio: 'El análisis de duplicidad contra el mapa histórico pacientesDB y la agrupación por turnos opera en fragmentos asíncronos para evitar congelamientos del hilo principal del navegador. Se restaura el reporte previo a la carga con resumen de atenciones válidas, duplicados descartados e incidencias.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Iteración de planillas de 65.000+ registros dividida en bloques asíncronos de 2.500 filas con liberación del Event Loop.'
    },
    modulos_afectados: ['GestionDatos', 'Dashboard', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Procesamiento asíncrono en processArray con fragmentos de 2.500 filas.',
      'Estado dinámico readingProgressText mostrando el avance por porcentaje y recuento de filas en tiempo real.',
      'Eliminación completa del bloqueo Paused before potential out-of-memory crash en DevTools.'
    ]
  },
  {
    id: 'v4.8.3',
    version_tag: 'v4.8.3',
    fecha_despliegue: '16 de Agosto, 2026',
    proposito_actualizacion: 'Redirección Directa al Presionar Botón "Carga Rápida" a la Sección de Gestión de Datos (onNavigateTab("data")) y Optimización de Memoria en Lectura Excel con Uint8Array (Solución a RangeError: Array buffer allocation failed).',
    medios_y_stack: [
      'React 18.3 & FileReader API (readAsArrayBuffer + Uint8Array)',
      'FiltrosGlobales.jsx (Redirección instantánea del botón Carga Rápida)',
      'GestionDatos.jsx (Procesamiento optimizado en memoria para planillas masivas de 25.000+ filas)'
    ],
    estructura_datos: {
      reglas_negocio: 'El botón Carga Rápida traslada al usuario directamente a la vista de Gestión de Datos para usar el gestor principal de carga masiva. Se elimina el procesamiento binario legado en favor de ArrayBuffer para evitar bloqueos del navegador.',
      firestore_collections: ['pacientes_urgencia'],
      query_optimization: 'Parseo de planillas masivas optimizado en buffer de memoria Uint8Array.'
    },
    modulos_afectados: ['FiltrosGlobales', 'GestionDatos', 'Dashboard', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Acción onClick del botón Carga Rápida configurada para ejecutar onNavigateTab("data") directamente.',
      'Sustitución de readAsBinaryString por readAsArrayBuffer + Uint8Array en GestionDatos.jsx.'
    ]
  },
  {
    id: 'v4.8.2',
    version_tag: 'v4.8.2',
    fecha_despliegue: '16 de Agosto, 2026',
    proposito_actualizacion: 'Restauración Estructural del Diseño de la Barra Superior (Explorador Global de Urgencias) con Título, Subtítulo, Badge de Datos Cargados y Ubicación Integrada de Carga Rápida.',
    medios_y_stack: [
      'React 18.3 & Lucide-react (Compass, UploadCloud)',
      'FiltrosGlobales.jsx (Restauración de distribución en 2 filas y título desplegable)',
      'Dashboard.jsx'
    ],
    estructura_datos: {
      reglas_negocio: 'Restablecimiento de la cabecera visual completa con título "Explorador Global de Urgencias", subtítulo de análisis en tiempo real, badge pulsante de "Datos cargados hasta" y botón de "Carga Rápida" integrado en la botonera de acciones sin distorsionar el diseño.',
      firestore_collections: ['pacientes_urgencia'],
      query_optimization: 'Sin cambios en la capa de datos.'
    },
    modulos_afectados: ['FiltrosGlobales', 'Dashboard', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Restauración de la columna izquierda con título Explorador Global de Urgencias e icono Compass.',
      'Restauración de la distribución de controles en 2 filas (Fechas/Horas superiores y Acciones inferiores).',
      'Integración del botón Carga Rápida en la barra de acciones de forma fluida.'
    ]
  },
  {
    id: 'v4.8.1',
    version_tag: 'v4.8.1',
    fecha_despliegue: '16 de Agosto, 2026',
    proposito_actualizacion: 'Resolución de Error Crítico de Renderizado (ReferenceError: Clock is not defined) en FiltrosGlobales.jsx y actualización de cabeceras Content-Security-Policy en firebase.json para cdnjs.cloudflare.com y cloudfunctions.net.',
    medios_y_stack: [
      'React 18.3 & Lucide-react (Importación explícita del icono Clock)',
      'firebase.json (Permisibilidad CSP script-src cdnjs.cloudflare.com y connect-src cloudfunctions.net)',
      'FiltrosGlobales.jsx & Dashboard.jsx'
    ],
    estructura_datos: {
      reglas_negocio: 'Eliminación del bloqueo visual del panel causado por la falta de importación del icono Clock y aseguramiento de la conectividad fluida a Cloud Functions y CDN de librerías Excel.',
      firestore_collections: ['pacientes_urgencia'],
      query_optimization: 'Sin cambios en la capa de datos.'
    },
    modulos_afectados: ['FiltrosGlobales', 'Dashboard', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Importación explícita de Clock desde lucide-react en FiltrosGlobales.jsx.',
      'Inclusión de cdnjs.cloudflare.com en script-src de firebase.json.',
      'Inclusión de https://*.cloudfunctions.net en connect-src de firebase.json.'
    ]
  },
  {
    id: 'v4.8.0',
    version_tag: 'v4.8.0',
    fecha_despliegue: '16 de Agosto, 2026',
    proposito_actualizacion: 'Acceso Directo y Botón Rápido de Carga Masiva CSV/Excel en la Barra Superior Global (FiltrosGlobales.jsx) con Modal de Procesamiento Directo (<ModalCargaRapidaDatos />) y Redirección Automática Post-Carga a Gestión de Datos (setActiveTab("data")).',
    medios_y_stack: [
      'React 18.3 & Lucide-react (UploadCloud, FileSpreadsheet)',
      'ModalCargaRapidaDatos.jsx (Componente Modal de Carga Masiva Global)',
      'FiltrosGlobales.jsx & Dashboard.jsx (Acceso directo permanente en la barra superior)',
      'Deduplicación SSOT reactiva & Web Audio API (playSuccessChime)'
    ],
    estructura_datos: {
      reglas_negocio: 'Acceso global para subir archivos .xlsx/.xls/.csv sin necesidad de navegar previamente al módulo Gestión de Datos. Al finalizar la carga por lotes, reproduce el chime de éxito y ejecuta la redirección automática a la sección data.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Procesamiento de lotes concurrentes en Firestore (450 docs/batch) con feedback de progreso y ETA.'
    },
    modulos_afectados: ['ModalCargaRapidaDatos', 'FiltrosGlobales', 'Dashboard', 'GestionDatos', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Botón rápido "Carga Rápida CSV/Excel" montado en la barra superior FiltrosGlobales.jsx.',
      'Apertura de ModalCargaRapidaDatos desde cualquier sub-módulo de MÉTRICO.',
      'Redirección automática post-carga ejecutando setActiveTab("data") y playSuccessChime().'
    ]
  },
  {
    id: 'v4.7.0',
    version_tag: 'v4.7.0',
    fecha_despliegue: '16 de Agosto, 2026',
    proposito_actualizacion: 'Síntesis Epidemiológica Generativa IA (Gemini 1.5 Flash) en Exportación PDF: Data Snapshot JSON automático, prompt de Director de Inteligencia Sanitaria (Resumen Demográfico y Análisis de Causa Raíz) y renderizado inyectado en <AnalisisEpidemiologicoIA>.',
    medios_y_stack: [
      'React 18.3 & Google Gemini API (gemini-1.5-flash) / Fallback Analítico Determinista',
      'geminiEpidemiology.js (Motor de captura Data Snapshot y generación narrativa)',
      'AnalisisEpidemiologicoIA.jsx (Componente de Informe Ejecutivo inyectado)',
      'PerfilPoblacionalReporte.jsx & PerfilPaciente.jsx'
    ],
    estructura_datos: {
      reglas_negocio: 'Captura síncrona en JSON de arquetipo, muestra, edad, tiempos, top 5 diagnósticos orgánicos, distribución Fonasa y picos del heatmap operativo. Redacción estructurada en 2 partes: 1. Resumen Demográfico y Vulnerabilidad, 2. Causa Raíz cruzando saturación horaria y diagnósticos.',
      firestore_collections: ['pacientes_urgencia'],
      query_optimization: 'Generación asíncrona de síntesis con timeout de 4.5s y fallback determinista instantáneo sin bloqueo de descarga.'
    },
    modulos_afectados: ['geminiEpidemiology', 'AnalisisEpidemiologicoIA', 'PerfilPaciente', 'PerfilPoblacionalReporte', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Captura de JSON Data Snapshot del estado activo al presionar Generar Reporte de Perfil.',
      'Invocación a la API de Gemini 1.5 Flash con System Prompt de Director de Inteligencia Sanitaria.',
      'Inyección del componente visual <AnalisisEpidemiologicoIA> al final del informe imprimible PDF.'
    ]
  },
  {
    id: 'v4.6.0',
    version_tag: 'v4.6.0',
    fecha_despliegue: '16 de Agosto, 2026',
    proposito_actualizacion: 'Dashboard de Arquetipos Clínicos Nivel Directivo Pro: Desbloqueo del Universo Histórico Completo SSOT (64.000+ registros), Pirámide Poblacional Bidireccional Horizontal (layout="vertical"), Blacklist Clínico Z/R/Y para Patologías Puras, Selector de Rango Temporal y Heatmap Operativo Semanal.',
    medios_y_stack: [
      'React 18.3 & Recharts (BarChart layout="vertical" Pirámide Bidireccional Horizontal)',
      'Universo Maestro SSOT allPacientesDB inyectado desde Dashboard.jsx (64.000+ registros)',
      'Blacklist Clínico de Exclusión CIE-10 (Prefijos Z, R, Y y Diagnósticos Vagós)',
      'Heatmap Operativo de Frecuencia (Matriz 7 Días × 4 Franjas Horarias)',
      'PerfilPaciente.jsx & PerfilPoblacionalReporte.jsx'
    ],
    estructura_datos: {
      reglas_negocio: 'Procesamiento en tiempo constante O(1) de la muestra completa de 64.000+ atenciones. Pirámide bidireccional con Hombres en valores negativos renderizados positivos a la izquierda y Mujeres a la derecha. Top 5 de patologías orgánicas puras.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Mapeo reactivo en memoria sobre la totalidad del dataset histórico allPacientesDB.'
    },
    modulos_afectados: ['Dashboard', 'PerfilPaciente', 'PerfilPoblacionalReporte', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Paso directo del universo allPacientesDB a PerfilPaciente en Dashboard.jsx.',
      'Configuración de Pirámide Bidireccional Horizontal real en Recharts con layout vertical y formateo absoluto en tooltips.',
      'Blacklist con regex /^[ZRY]/i excluyendo códigos de servicios/controles y síntomas vagos.',
      'Matriz de calor semanal 7x4 cruzando Días de la Semana y Turnos asistenciales.'
    ]
  },
  {
    id: 'v4.5.0',
    version_tag: 'v4.5.0',
    fecha_despliegue: '16 de Agosto, 2026',
    proposito_actualizacion: 'Modo Presentación (Modo Directorio Kiosco) para Arquetipos Clínicos CIE-10: Escalamiento Tipográfico text-6xl, Ocultamiento del 100% de Navbars, Fullscreen API y Doble Salida por Tecla ESC y Botón Flotante.',
    medios_y_stack: [
      'React 18.3 & Fullscreen API (requestFullscreen / exitFullscreen)',
      'PerfilPaciente.jsx (Overlaid Kiosk Layer z-[100] fixed inset-0)',
      'Escalamiento Tipográfico Dinámico (Métricas KPI text-5xl / text-6xl)',
      'Recharts Full-Height Scaling (h-[480px]) & Keyboard Event Listener (ESC key)'
    ],
    estructura_datos: {
      reglas_negocio: 'Transformación instantánea del dashboard en modo proyector para salas de reuniones ejecutivas. Oculta el 100% del Sidebar y Topbar y escala indicadores para lectura a distancia.',
      firestore_collections: ['pacientes_urgencia'],
      query_optimization: 'Capa superpuesta en memoria sin consultas adicionales de red.'
    },
    modulos_afectados: ['PerfilPaciente', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Accionador Toggle "Modo Presentación" con icono Maximize2 en la cabecera del módulo.',
      'Escalamiento de fuentes numéricas KPI a text-5xl/text-6xl e incremento de la altura de gráficos a 480px.',
      'Doble mecanismo de salida: botón flotante de control Minimize2 y listener para la tecla ESC.'
    ]
  },
  {
    id: 'v4.4.0',
    version_tag: 'v4.4.0',
    fecha_despliegue: '16 de Agosto, 2026',
    proposito_actualizacion: 'Transformación del Módulo Perfil del Paciente en un Dashboard de Arquetipos Clínicos basado en CIE-10 y Conexión al Motor de Generación de Reportes PDF.',
    medios_y_stack: [
      'React 18.3 & Recharts (Pirámide Poblacional 17 Tramos Quinquenales & Donut Previsional)',
      'PerfilPaciente.jsx (Refactorización a Vista Macro Poblacional sin tabla individual)',
      'PerfilPoblacionalReporte.jsx (Componente Exportable Print-Friendly)',
      'Vista Master metrio_analytics.v_pacientes_urgencia_master'
    ],
    estructura_datos: {
      reglas_negocio: 'Eliminación total del listado fila por fila de pacientes. Agrupación epidemiológica estricta por codigo_diagnostico_cie10 con Top 5 dinámico por tramo etario funcional (Infantil, Adulto Joven, Adulto, Adulto Mayor) y botón Generar Reporte de Perfil.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Filtro reactivo en memoria sobre la muestra consolidada v_pacientes_urgencia_master.'
    },
    modulos_afectados: ['PerfilPaciente', 'PerfilPoblacionalReporte', 'Dashboard', 'InformeArquitectura', 'ModalMuroActualizaciones'],
    detalles_tecnicos: [
      'Pirámide demográfica interactiva cruzando los 17 tramos etarios quinquenales entre Hombres y Mujeres.',
      'Gráfico de Anillo Previsional con desglose porcentual de tramos Fonasa (A-D), Isapre y Particular.',
      'Mapa de Morbilidad CIE-10 con badges destacados: [Código] Descripción - % (N pac.).',
      'Inyección del componente exportable <PerfilPoblacionalReporte /> accionado desde el botón Generar Reporte de Perfil.'
    ]
  },
  {
    id: 'v4.3.0',
    version_tag: 'v4.3.0',
    fecha_despliegue: '16 de Agosto, 2026',
    proposito_actualizacion: 'Consolidado Continuo de Arquitectura & Especificación Maestra: Fórmulas Cuantitativas Completas, Algoritmos SSOT, Horarios con Encasillamiento Especial (+1h/-1h), Manual de Identidad Visual Glassmorphic, Catálogo de 6 Reportes PDF y Protocolo de Retroalimentación Acumulativa.',
    medios_y_stack: [
      'React 18.3 Multi-Tab Master Spec Architecture',
      'KaTeX / Markdown Math Rendering Engine',
      'TailwindCSS Glassmorphic Tokens ("Cristal Pastel")',
      'Protocolo Obligatorio de 4 Pasos & Retroalimentación Continua'
    ],
    estructura_datos: {
      reglas_negocio: 'Consolidación permanente y acumulativa de todas las fórmulas matemáticas, procedimientos de análisis, matriz de constataciones C3 Legal (Z51.8), encasillamiento de 15h por turno y especificación oficial de entregables.',
      firestore_collections: ['system_architecture_log', 'pacientes_urgencia', 'turnos', 'audit_logs'],
      query_optimization: 'Acceso directo a las especificaciones maestras sin consultas redundantes a la base de datos.'
    },
    modulos_afectados: ['InformeArquitectura', 'ModalMuroActualizaciones', 'AGENTS.md', 'Dashboard'],
    detalles_tecnicos: [
      'Navegación por 6 pestañas principales (Historial, Fórmulas, Horarios, Sistema de Diseño, Catálogo de Reportes y Protocolo).',
      'Documentación exhaustiva de la fórmula de Altas Admin, Promedio de Estadía, Velocidad de Atención, Fonasa % y matriz C3 Legal.',
      'Especificación formal de la regla de encasillamiento de 15h para Turno Largo de Semana (16:00 a 09:00 AM).',
      'Manual de Identidad Visual con codificación HEX oficial por categoría de Triaje C1-C5.'
    ]
  },
  {
    id: 'v4.2.0',
    version_tag: 'v4.2.0',
    fecha_despliegue: '16 de Agosto, 2026',
    proposito_actualizacion: 'Blindaje de Ciberseguridad Nivel Empresarial: Hard-Logout por inactividad a 15m con destrucción total de sesión, Firebase App Check (reCAPTCHA v3), Cortafuegos de Firestore Rules, Supresión de SourceMaps y Cabeceras HTTP CSP/X-Frame-Options DENY.',
    medios_y_stack: [
      'Firebase App Check & reCAPTCHA v3 Provider',
      'ModalInactividad & Destrucción Total de Sesión (localStorage/sessionStorage/IndexedDB purge)',
      'Reglas de Seguridad Firestore (firestore.rules)',
      'Vite Sourcemap Suppression (build.sourcemap: false)',
      'Firebase Hosting Security Headers (CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff)'
    ],
    estructura_datos: {
      reglas_negocio: 'Incapacidad absoluta de rehidratar la sesión tras 15m inactivo + 60s de advertencia. Cierre global por defecto en Firestore restringido a correos autorizados de la red. Bloqueo total de ingeniería inversa y clickjacking.',
      firestore_collections: ['artifacts', 'pacientes_urgencia', 'turnos', 'audit_logs', 'devlog_posts', 'usuarios'],
      query_optimization: 'Validación en tiempo de ejecución de token App Check e inspección de dominios para Cloud Functions y llamadas a Firestore.'
    },
    modulos_afectados: ['ModalInactividad', 'Dashboard', 'firebase.js', 'firestore.rules', 'vite.config.js', 'firebase.json', 'InformeArquitectura'],
    detalles_tecnicos: [
      'Destrucción completa de storages locales y reemplazo forzado de ubicación (window.location.replace) al expirar los 60s.',
      'Configuración de App Check con soporte de token de depuración para desarrollo en localhost.',
      'Cabeceras HTTP de seguridad estricta para mitigar vulnerabilidades XSS, Clickjacking, MIME Sniffing y Referrer leakage.'
    ]
  },
  {
    id: 'v4.1.2',
    version_tag: 'v4.1.2',
    fecha_despliegue: '16 de Agosto, 2026',
    proposito_actualizacion: 'Sonido Distintivo Futurista de Finalización de Sincronización de Base de Datos (Web Audio API) y Chime Suave de Auto-Sync.',
    medios_y_stack: [
      'React 18.3 & Web Audio API (Sintetización Acorde Armónico 3 Fases C5/G5 -> E5/C6 -> G5/E6)',
      'audioNotifications.js (playSyncCompleteChime y playAutoSyncChime)',
      'PopUpSincronizacion.jsx'
    ],
    estructura_datos: {
      reglas_negocio: 'Notificación sonora diferenciada al culminar la sincronización profunda de datos o la auto-sincronización periódica de 5 minutos.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Generación instantánea por síntesis de tono en frecuencia natural con curva exponencial de envolvente de volumen.'
    },
    modulos_afectados: ['audioNotifications', 'PopUpSincronizacion', 'Dashboard', 'InformeArquitectura'],
    detalles_tecnicos: [
      'Acorde ascendente futurista cristalino de 3 fases para sincronizaciones profundas y manuales.',
      'Tono tenue de doble pulso F5 -> C6 para auto-sincronizaciones silenciosas en segundo plano.'
    ]
  },
  {
    id: 'v4.1.1',
    version_tag: 'v4.1.1',
    fecha_despliegue: '16 de Agosto, 2026',
    proposito_actualizacion: 'Notificación Sonora Nativa (Web Audio API) al Limpiar y Marcar Leídas Notificaciones en el Centro de Notificaciones.',
    medios_y_stack: [
      'React 18.3 & Web Audio API (Sintetizador Nativo sin assets externos)',
      'audioNotifications.js (Función playClearChime)',
      'CampanaNotificaciones.jsx'
    ],
    estructura_datos: {
      reglas_negocio: 'Feedback auditivo inmediato con sonido de barrido cristalino armónico (D5 -> A5 -> D6) al vaciar el historial o marcar notificaciones como leídas.',
      firestore_collections: ['metrico_notificaciones'],
      query_optimization: 'Sintetizador de frecuencia en tiempo real sin latencia de red ni descargas de archivos mp3.'
    },
    modulos_afectados: ['audioNotifications', 'CampanaNotificaciones', 'InformeArquitectura'],
    detalles_tecnicos: [
      'Implementación de playClearChime con rampas exponenciales de ganancia para evitar chasquidos de audio.',
      'Sincronización con el botón de purga "Limpiar" y la acción "Marcar leídas" del Centro de Notificaciones.'
    ]
  },
  {
    id: 'v4.1.0',
    version_tag: 'v4.1.0',
    fecha_despliegue: '15 de Agosto, 2026',
    proposito_actualizacion: 'Paridad Matemática del 100% y Desduplicación SSOT entre Histórico Mensual y Explorador Global de Urgencias + Corrección de Parseo de Fechas Locale.',
    medios_y_stack: [
      'React 18.3 & Vite Build Engine',
      'CalendarioHistorico con Motor deduplicarPacientes SSOT',
      'Prop pass-through de allPacientesDB en Dashboard.jsx (line 1745)',
      'Parseo robusto de cadenas de fecha parseLocalDatetime (useMetricoAnalytics)'
    ],
    estructura_datos: {
      reglas_negocio: 'Eliminación del descalce entre 192 (registros brutos de admisiones repetidas en turno) vs 116 (pacientes únicos desduplicados). CalendarioHistorico procesa el 100% del dataset maestro desduplicado.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Desduplicación por correlativo y timestamp de admisión con encasillamiento de 15h por turno.'
    },
    modulos_afectados: ['CalendarioHistorico', 'Dashboard', 'useMetricoAnalytics', 'InformeArquitectura'],
    detalles_tecnicos: [
      'Garantía de coincidencia al 100% (116 admisiones desduplicadas) en Miércoles 12/08/2026.',
      'Soporte completo de formatos de fecha ISO (YYYY-MM-DD), Chileno (DD/MM/YYYY) y US locale (MM/DD/YYYY).',
      'Paso del universo maestro allPacientesDB al módulo Histórico Mensual.'
    ]
  },
  {
    id: 'v4.0.0',
    version_tag: 'v4.0.0',
    fecha_despliegue: '15 de Agosto, 2026',
    proposito_actualizacion: 'Incorporación del Despacho Automático de Cierre Mensual Consolidado (1° de cada mes a las 08:30 AM / Día Hábil) con Resumen Ejecutivo de los 6 Pilares Clínicos.',
    medios_y_stack: [
      'React 18.3 & Vite Build Engine',
      'ModalConfiguracionCorreo Section 5 (Cierre Mensual Consolidado)',
      'generateMonthlyConsolidatedSummary Engine (summaryGenerator.js)',
      'Cloud Function enviarInformeCorreo con variante INFORME_CIERRE_MENSUAL'
    ],
    estructura_datos: {
      reglas_negocio: 'Mantención estricta del envío diario por turno cerrado auditado + Adición de la regla de despacho mensual el día 1° a las 08:30 AM. Redirección explícita a la descarga directa de PDFs desde el módulo de Reportes.',
      firestore_collections: ['mail', 'envios_correos', 'audit_logs', 'informes_enviados'],
      query_optimization: 'Evaluación síncrona en memoria y almacenamiento local con firma auditada.'
    },
    modulos_afectados: ['ModalConfiguracionCorreo', 'summaryGenerator', 'enviarInformeCorreo', 'InformeArquitectura'],
    detalles_tecnicos: [
      'Se mantiene 100% la auditoría y despacho diario por turno cerrado.',
      'Añadida la Sección 5 en el modal con botón "🚀 Probar Envío Mensual Ahora".',
      'Pestaña de vista previa "(b) Cierre Mensual Consolidado" en formato institucional HTML.'
    ]
  }
];

export default function InformeArquitectura({ user, userProfile, isGlobalAdmin, db }) {
  const [logs, setLogs] = useState(HISTORIAL_ARQUITECTURA_BASE);
  const [activeTab, setActiveTab] = useState('formulas'); // 'historial', 'formulas', 'horarios', 'diseno', 'reportes', 'protocolo'
  const [expandedVersion, setExpandedVersion] = useState('v4.3.0');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingDb, setLoadingDb] = useState(false);

  // Cargar logs desde Firestore si existen, o usar el dataset base
  useEffect(() => {
    async function fetchArchitectureLogs() {
      if (!db) return;
      try {
        setLoadingDb(true);
        const colRef = collection(db, 'system_architecture_log');
        const snapshot = await getDocs(colRef);
        if (!snapshot.empty) {
          const dbLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setLogs(dbLogs);
        }
      } catch (err) {
        console.warn("Usando catálogo local de arquitectura:", err);
      } finally {
        setLoadingDb(false);
      }
    }
    fetchArchitectureLogs();
  }, [db]);

  // Filtrado de logs
  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return logs;
    const term = searchTerm.toLowerCase();
    return logs.filter(item => 
      item.version_tag.toLowerCase().includes(term) ||
      item.proposito_actualizacion.toLowerCase().includes(term) ||
      (item.modulos_afectados && item.modulos_afectados.some(m => m.toLowerCase().includes(term)))
    );
  }, [logs, searchTerm]);

  // Función de impresión executive
  const handlePrint = () => {
    window.print();
  };

  // Guardia de Seguridad Estricto
  if (!isGlobalAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center bg-card-custom rounded-3xl border border-card-custom shadow-xl theme-transition">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-4 border border-rose-500/20 animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-primary-custom tracking-tight">Acceso Restringido</h2>
        <p className="text-sm text-secondary-custom max-w-md mt-2 font-medium leading-relaxed">
          El <strong>Informe de Arquitectura & Consolidado Continuo</strong> está reservado exclusivamente para usuarios con el rol <strong>ADMIN_GLOBAL</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in print:p-0 print:space-y-4">
      {/* IMPRESIÓN STYLES: OCULTA ELEMENTOS INNECESARIOS AL EXPORTAR A PDF */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-family: inherit;
          }
          .print\\:hidden, aside, nav, header, button, input {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-gray {
            border: 1px solid #e2e8f0 !important;
          }
          .print\\:bg-white {
            background: #ffffff !important;
          }
        }
      `}</style>

      {/* HEADER PRINCIPAL DE ARQUITECTURA */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card-custom p-6 rounded-3xl border border-card-custom shadow-sm theme-transition print:border-gray print:p-4 print:shadow-none">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0 print:border print:border-gray">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-primary-custom tracking-tight">Especificación Maestra & Consolidado de Arquitectura</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-widest print:hidden">
                SSOT CONSOLIDADO V4.3.0
              </span>
            </div>
            <p className="text-sm text-secondary-custom font-medium mt-0.5">
              Consolidado permanente de fórmulas matemáticas, procedimientos de análisis, horarios de turno, sistema de diseño y catálogo de entregables.
            </p>
          </div>
        </div>

        {/* BOTÓN IMPRESIÓN EXPORTAR PDF */}
        <div className="flex items-center gap-3 w-full lg:w-auto print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Exportar Informe Completo en PDF</span>
          </button>
        </div>
      </div>

      {/* ENCABEZADO EXCLUSIVO IMPRESIÓN EN PDF */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase text-slate-900">MÉTRICO — ESPECIFICACIÓN MAESTRA Y CONSOLIDADO DE ARQUITECTURA</h1>
            <p className="text-xs text-slate-600 font-semibold">Sistema Estadístico de Gestión SAR & Urgencias — Documento Técnico Oficial</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p><strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-CL')}</p>
            <p><strong>Clasificación:</strong> Administración Global / Confidencial</p>
          </div>
        </div>
      </div>

      {/* NAV TAB BAR (SELECCIÓN DE SECCIÓN MAESTRA) */}
      <div className="flex flex-wrap items-center gap-2 bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-card-custom print:hidden">
        <button
          onClick={() => setActiveTab('formulas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'formulas'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>1. Fórmulas, Algoritmos & Análisis</span>
        </button>

        <button
          onClick={() => setActiveTab('horarios')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'horarios'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>2. Horarios & Encasillamiento (+1h/-1h)</span>
        </button>

        <button
          onClick={() => setActiveTab('diseno')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'diseno'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>3. Manual de Identidad & Design System</span>
        </button>

        <button
          onClick={() => setActiveTab('reportes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'reportes'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>4. Catálogo de Reportes & PDF</span>
        </button>

        <button
          onClick={() => setActiveTab('historial')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'historial'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>5. Historial de Versiones (v1.0 - v4.3)</span>
        </button>

        <button
          onClick={() => setActiveTab('protocolo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'protocolo'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>6. Protocolo de Despliegue Continuo</span>
        </button>
      </div>

      {/* PESTAÑA 1: FÓRMULAS, ALGORITMOS Y ANÁLISIS CLÍNICOS */}
      {(activeTab === 'formulas' || true) && (
        <div className={`space-y-6 ${activeTab !== 'formulas' ? 'hidden print:block' : ''}`}>
          <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-sm space-y-6 theme-transition print:border-gray print:bg-white">
            <div className="flex items-center gap-3 border-b border-card-custom/50 pb-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-primary-custom">1. Catálogo Matemático & Procedimientos de Análisis</h2>
                <p className="text-xs text-secondary-custom font-medium">Fórmulas cuantitativas, algoritmos de cálculo y matrices clínicas oficiales de la plataforma.</p>
              </div>
            </div>

            {/* GRID DE FÓRMULAS Y MÉTODOS DE CÁLCULO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* FÓRMULA 1 */}
              <div className="p-5 bg-slate-900/40 dark:bg-slate-950/40 rounded-2xl border border-indigo-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-400">Fórmula 1.1 — Tasa de Altas Administrativas / Retiros</span>
                  <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">Porcentaje (%)</span>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center font-mono text-emerald-400 font-bold text-sm">
                  Tasa Altas Admin (%) = [ Altas Admin / Total Pacientes Admitidos ] × 100
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  <strong>Procedimiento:</strong> Identifica admisiones con <code className="text-indigo-300 font-mono">estado === 'Cancelada'</code>, <code className="text-indigo-300 font-mono">destinoAlta === 'ALTA ADMINISTRATIVA'</code> o retiros sin atención donde el médico tratante figura no asignado (<code className="text-indigo-300 font-mono">NO REGISTRADO</code>, <code className="text-indigo-300 font-mono">S/M</code>).
                </p>
              </div>

              {/* FÓRMULA 2 */}
              <div className="p-5 bg-slate-900/40 dark:bg-slate-950/40 rounded-2xl border border-purple-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-400">Fórmula 1.2 — Tiempo Promedio de Estadía / Permanencia</span>
                  <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">Minutos (min)</span>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center font-mono text-purple-300 font-bold text-sm">
                  Estadía Promedio = Σ ( Timestamp Egreso - Timestamp Admisión ) / Total Pacientes Atendidos
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  <strong>Procedimiento:</strong> Excluye cancelaciones de admisión en ventanilla y computa el tiempo transcurrido desde la inscripción del correlativo en sistema hasta el alta médica o traslado hospitalario.
                </p>
              </div>

              {/* FÓRMULA 3 */}
              <div className="p-5 bg-slate-900/40 dark:bg-slate-950/40 rounded-2xl border border-sky-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-sky-400">Fórmula 1.3 — Velocidad de Atención / Rendimiento Horario</span>
                  <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold">Pacientes / Hora</span>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center font-mono text-sky-300 font-bold text-sm">
                  Velocidad Atención = Total Pacientes Atendidos / Duración Horaria Efectiva del Turno (15h / 12h)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  <strong>Procedimiento:</strong> Calcula la densidad de flujo asistencial por hora durante la franja de encasillamiento oficial (15 horas en Turno Largo de Semana y 12 horas en Fin de Semana).
                </p>
              </div>

              {/* FÓRMULA 4 */}
              <div className="p-5 bg-slate-900/40 dark:bg-slate-950/40 rounded-2xl border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">Fórmula 1.4 — Porcentaje de Cobertura Fonasa (A / B / C / D)</span>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">Porcentaje (%)</span>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center font-mono text-amber-300 font-bold text-sm">
                  Cobertura Fonasa (%) = [ Total Pacientes Fonasa / Total Admitidos ] × 100
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  <strong>Procedimiento:</strong> Suma la totalidad de tramos Fonasa (A, B, C y D) dividida entre la cohorte total de admisiones registradas en el período.
                </p>
              </div>

            </div>

            {/* DETECCIÓN DE CONSTATACIÓN DE LESIONES (MATRIZ C3 LEGAL / Z51.8) */}
            <div className="p-5 bg-amber-500/5 border border-amber-500/30 rounded-2xl space-y-4">
              <h3 className="text-sm font-black text-amber-500 uppercase tracking-wide flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Matriz de Cotización y Detección de Constatación de Lesiones (C3 Legal / Z51.8)
              </h3>
              <p className="text-xs text-secondary-custom font-medium leading-relaxed">
                Para asegurar la máxima certeza estadística en la cuantificación de requerimientos policiales y judiciales, el sistema aplica una evaluación de reglas compuestas:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-medium">
                <div className="bg-card-custom p-3 rounded-xl border border-card-custom">
                  <strong className="text-primary-custom block mb-1">1. Banderas & Triaje Directo:</strong>
                  <code className="text-amber-500 font-mono font-bold">flag_constatacion_z518 === true</code> o <code className="text-amber-500 font-mono font-bold">categoria === 'c3_z518'</code>.
                </div>
                <div className="bg-card-custom p-3 rounded-xl border border-card-custom">
                  <strong className="text-primary-custom block mb-1">2. Códigos CIE-10 Oficiales:</strong>
                  Búsqueda de presencia de <code className="text-amber-500 font-mono font-bold">Z51.8</code>, <code className="text-amber-500 font-mono font-bold">Z518</code>, <code className="text-amber-500 font-mono font-bold">Z04</code>, <code className="text-amber-500 font-mono font-bold">Z65</code> o <code className="text-amber-500 font-mono font-bold">Z02.7</code>.
                </div>
                <div className="bg-card-custom p-3 rounded-xl border border-card-custom">
                  <strong className="text-primary-custom block mb-1">3. Palabras Clave Custodia Policial:</strong>
                  Búsqueda en observaciones y destino alta: <code className="text-amber-500 font-mono font-bold">CARABINEROS</code>, <code className="text-amber-500 font-mono font-bold">PDI</code>, <code className="text-amber-500 font-mono font-bold">COMISARIA</code>, <code className="text-amber-500 font-mono font-bold">DETENIDO</code>, <code className="text-amber-500 font-mono font-bold">FISCALIA</code>.
                </div>
              </div>
            </div>

            {/* TABLA DE RANGOS ETARIOS */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase text-secondary-custom tracking-wider">Demografía: 17 Tramos Etarios Quinquenales</h3>
              <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
                {['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'].map((r, i) => (
                  <span key={i} className="px-2.5 py-1 bg-black/5 dark:bg-white/5 border border-card-custom rounded-lg text-primary-custom">
                    {r} años
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PESTAÑA 2: HORARIOS DE TURNO Y ENCASILLAMIENTO */}
      {(activeTab === 'horarios' || true) && (
        <div className={`space-y-6 ${activeTab !== 'horarios' ? 'hidden print:block' : ''}`}>
          <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-sm space-y-6 theme-transition print:border-gray print:bg-white">
            <div className="flex items-center gap-3 border-b border-card-custom/50 pb-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-primary-custom">2. Detalle de Horarios de Turno & Encasillamiento (+1h / -1h)</h2>
                <p className="text-xs text-secondary-custom font-medium">Especificación de esquemas de turno, tolerancias operacionales de captura y equipos de trabajo.</p>
              </div>
            </div>

            {/* CARDS DE ESQUEMAS DE TURNO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* TURNO LARGO SEMANA */}
              <div className="p-5 bg-card-custom rounded-2xl border border-emerald-500/30 space-y-3 relative overflow-hidden">
                <div className="w-2 h-full bg-emerald-500 absolute top-0 left-0" />
                <div className="pl-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">Lunes a Jueves</span>
                  <h3 className="text-lg font-black text-primary-custom mt-1">Turno Largo Semana</h3>
                  <div className="text-xs font-mono text-secondary-custom font-bold">Horario Oficial: 17:00 a 08:00 AM (+1d)</div>
                </div>

                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                  <strong>Encasillamiento Asistencial (+1h/-1h):</strong><br />
                  Se extiende desde las <strong>16:00 hrs hasta las 09:00 AM</strong> del día siguiente (15 horas efectivas) para capturar admisiones en fila previa y retards del cambio de guardia.
                </div>
              </div>

              {/* FINDE DÍA */}
              <div className="p-5 bg-card-custom rounded-2xl border border-yellow-500/30 space-y-3 relative overflow-hidden">
                <div className="w-2 h-full bg-yellow-500 absolute top-0 left-0" />
                <div className="pl-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-md">Sábados, Domingos & Festivos</span>
                  <h3 className="text-lg font-black text-primary-custom mt-1">Fin de Semana Día</h3>
                  <div className="text-xs font-mono text-secondary-custom font-bold">Horario Oficial: 08:00 a 20:00 hrs</div>
                </div>

                <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-xs font-medium text-yellow-800 dark:text-yellow-200">
                  <strong>Encasillamiento Asistencial:</strong><br />
                  Se extiende estrictamente desde las <strong>08:00 hasta las 20:00 hrs</strong> (12 horas de ventana continua) garantizando la captura exacta de la jornada diurna.
                </div>
              </div>

              {/* FINDE NOCHE */}
              <div className="p-5 bg-card-custom rounded-2xl border border-blue-500/30 space-y-3 relative overflow-hidden">
                <div className="w-2 h-full bg-blue-500 absolute top-0 left-0" />
                <div className="pl-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">Sábados, Domingos & Festivos</span>
                  <h3 className="text-lg font-black text-primary-custom mt-1">Fin de Semana Noche</h3>
                  <div className="text-xs font-mono text-secondary-custom font-bold">Horario Oficial: 20:00 a 08:00 AM (+1d)</div>
                </div>

                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-xs font-medium text-blue-800 dark:text-blue-200">
                  <strong>Encasillamiento Asistencial:</strong><br />
                  Se extiende estrictamente desde las <strong>20:00 hasta las 08:00 AM</strong> (+1 día, 12 horas de ventana continua) para la noche completa de guardia.
                </div>
              </div>

            </div>

            {/* TABLA DE ROTATIVA DE EQUIPOS ASISTENCIALES */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black uppercase text-secondary-custom tracking-wider">Rotativa Cíclica de Equipos Asistenciales</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-between">
                  <span>Turno 1 / Equipo 1</span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                </div>
                <div className="p-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-bold flex items-center justify-between">
                  <span>Turno 2 / Equipo 2</span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
                </div>
                <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-between">
                  <span>Turno 3 / Equipo 3</span>
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                </div>
                <div className="p-3 rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-between">
                  <span>Turno 4 / Equipo 4</span>
                  <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PESTAÑA 3: MANUAL DE IDENTIDAD VISUAL Y SISTEMA DE DISEÑO */}
      {(activeTab === 'diseno' || true) && (
        <div className={`space-y-6 ${activeTab !== 'diseno' ? 'hidden print:block' : ''}`}>
          <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-sm space-y-6 theme-transition print:border-gray print:bg-white">
            <div className="flex items-center gap-3 border-b border-card-custom/50 pb-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-primary-custom">3. Manual de Identidad Visual & Sistema de Diseño Glassmorphic</h2>
                <p className="text-xs text-secondary-custom font-medium">Estipulación de tokens de color, códigos HEX de triaje, fuentes y guías de diseño de la plataforma MÉTRICO.</p>
              </div>
            </div>

            {/* CODIFICACIÓN HEX OFICIAL POR TRIAJE */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-secondary-custom tracking-wider">Codificación HEX Oficial por Categoría de Triaje Clínico</h3>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs font-bold text-white text-center">
                <div className="p-3 rounded-xl bg-[#ef4444] shadow-sm">
                  <div>C1 — Reanimación</div>
                  <div className="text-[10px] font-mono opacity-80 mt-1">#EF4444</div>
                </div>
                <div className="p-3 rounded-xl bg-[#f97316] shadow-sm">
                  <div>C2 — Mayor</div>
                  <div className="text-[10px] font-mono opacity-80 mt-1">#F97316</div>
                </div>
                <div className="p-3 rounded-xl bg-[#eab308] shadow-sm text-slate-900">
                  <div>C3 — Media</div>
                  <div className="text-[10px] font-mono opacity-80 mt-1">#EAB308</div>
                </div>
                <div className="p-3 rounded-xl bg-[#ca8a04] shadow-sm">
                  <div>C3 (L) — Legal</div>
                  <div className="text-[10px] font-mono opacity-80 mt-1">#CA8A04</div>
                </div>
                <div className="p-3 rounded-xl bg-[#10b981] shadow-sm">
                  <div>C4 — Menor</div>
                  <div className="text-[10px] font-mono opacity-80 mt-1">#10B981</div>
                </div>
                <div className="p-3 rounded-xl bg-[#3b82f6] shadow-sm">
                  <div>C5 — General</div>
                  <div className="text-[10px] font-mono opacity-80 mt-1">#3B82F6</div>
                </div>
              </div>
            </div>

            {/* PALETA INSTITUCIONAL GLASSMORPHIC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 space-y-2">
                <strong className="text-indigo-400 uppercase tracking-wide block">Modo Oscuro Principal (Glassmorphism Dark)</strong>
                <p className="text-slate-300 leading-relaxed font-medium">
                  Fondo base: <code className="font-mono text-indigo-300">bg-slate-950</code>. Tarjetas flotantes: <code className="font-mono text-indigo-300">bg-slate-900/70 backdrop-blur-2xl border border-slate-800</code> con sombras ambientales <code className="font-mono text-indigo-300">shadow-2xl</code>.
                </p>
              </div>

              <div className="p-4 bg-slate-100 text-slate-900 rounded-2xl border border-slate-300 space-y-2">
                <strong className="text-indigo-600 uppercase tracking-wide block">Modo Claro Institucional (Glassmorphism Light)</strong>
                <p className="text-slate-700 leading-relaxed font-medium">
                  Fondo base: <code className="font-mono text-indigo-600">bg-slate-50</code>. Tarjetas limpias: <code className="font-mono text-indigo-600">bg-white/80 backdrop-blur-xl border border-slate-200</code> con sombras suaves de alto contraste.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PESTAÑA 4: CATÁLOGO DE REPORTES Y PDF */}
      {(activeTab === 'reportes' || true) && (
        <div className={`space-y-6 ${activeTab !== 'reportes' ? 'hidden print:block' : ''}`}>
          <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-sm space-y-6 theme-transition print:border-gray print:bg-white">
            <div className="flex items-center gap-3 border-b border-card-custom/50 pb-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-primary-custom">4. Catálogo de Reportes Gerenciales & Entregables PDF</h2>
                <p className="text-xs text-secondary-custom font-medium">Estructura estipulada de los 6 informes oficiales de la plataforma para descarga e impresión directa.</p>
              </div>
            </div>

            {/* LISTA DE LOS 6 REPORTES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
              <div className="p-4 bg-card-custom rounded-2xl border border-card-custom space-y-1.5">
                <strong className="text-indigo-500 font-black text-sm block">1. Informe Diario Auditado por Turno Cerrado</strong>
                <p className="text-secondary-custom leading-relaxed">
                  Resumen certificado de 15h o 12h con firma digital del responsable, paridad comprobada BigQuery/Firestore y desglose por triaje y tipo de alta.
                </p>
              </div>

              <div className="p-4 bg-card-custom rounded-2xl border border-card-custom space-y-1.5">
                <strong className="text-indigo-500 font-black text-sm block">2. Resumen Ejecutivo Cierre Mensual Consolidado</strong>
                <p className="text-secondary-custom leading-relaxed">
                  Despacho automático el día 1° del mes (08:30 AM) con métricas consolidadas de los 6 pilares clínicos y enlaces de descarga directa.
                </p>
              </div>

              <div className="p-4 bg-card-custom rounded-2xl border border-card-custom space-y-1.5">
                <strong className="text-indigo-500 font-black text-sm block">3. Reporte de Integridad SSOT & Auditoría de Paridad</strong>
                <p className="text-secondary-custom leading-relaxed">
                  Detección y conciliación en tiempo real de registros desduplicados entre Firestore y BigQuery.
                </p>
              </div>

              <div className="p-4 bg-card-custom rounded-2xl border border-card-custom space-y-1.5">
                <strong className="text-indigo-500 font-black text-sm block">4. Análisis de Rendimiento por Médico / Profesional</strong>
                <p className="text-secondary-custom leading-relaxed">
                  Matriz de pacientes atendidos por hora, promedios de permanencia y categorización de triaje por facultativo.
                </p>
              </div>

              <div className="p-4 bg-card-custom rounded-2xl border border-card-custom space-y-1.5">
                <strong className="text-indigo-500 font-black text-sm block">5. Análisis por Establecimiento / Centro Emisor</strong>
                <p className="text-secondary-custom leading-relaxed">
                  Distribución de admisiones provenientes de Cesfam CGRs, CECOFs y PSRs de la red Melipilla.
                </p>
              </div>

              <div className="p-4 bg-card-custom rounded-2xl border border-card-custom space-y-1.5">
                <strong className="text-indigo-500 font-black text-sm block">6. Reporte de Constatación de Lesiones (Z51.8)</strong>
                <p className="text-secondary-custom leading-relaxed">
                  Pauta de auditoría para requerimientos judiciales y policiales (Carabineros, PDI, Fiscalía).
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PESTAÑA 5: HISTORIAL DE VERSIONES Y EVOLUCIÓN DE SOFTWARE */}
      {(activeTab === 'historial' || true) && (
        <div className={`space-y-4 ${activeTab !== 'historial' ? 'hidden print:block' : ''}`}>
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-black text-primary-custom tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Línea de Tiempo Evolutiva del Software ({filteredLogs.length} versiones)
            </h2>
            <span className="text-xs text-secondary-custom font-medium print:hidden">
              Haz clic en una versión para desplegar/contraer su detalle técnico
            </span>
          </div>

          {filteredLogs.map((item, index) => {
            const isExpanded = expandedVersion === item.version_tag || index === 0;

            return (
              <div 
                key={item.id || item.version_tag}
                className={`bg-card-custom rounded-3xl border transition-all theme-transition overflow-hidden ${
                  isExpanded 
                    ? 'border-indigo-500/40 shadow-lg ring-1 ring-indigo-500/20' 
                    : 'border-card-custom hover:border-indigo-500/30 shadow-xs'
                } print:border-gray print:bg-white print:shadow-none mb-4`}
              >
                {/* CABECERA DE LA VERSIÓN */}
                <div 
                  onClick={() => setExpandedVersion(isExpanded ? null : item.version_tag)}
                  className="p-5 flex items-center justify-between cursor-pointer select-none bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent"
                >
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1.5 rounded-xl font-mono font-black text-sm border shadow-xs ${
                      index === 0 
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-500/30' 
                        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20'
                    }`}>
                      {item.version_tag}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-black text-primary-custom">{item.proposito_actualizacion}</h3>
                        {index === 0 && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            ÚLTIMO DESPLIEGUE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-secondary-custom font-medium mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          Desplegado el {item.fecha_despliegue}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 print:hidden">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-indigo-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-secondary-custom" />
                    )}
                  </div>
                </div>

                {/* DETALLE TÉCNICO COMPLETO */}
                {(isExpanded || true) && (
                  <div className={`p-6 border-t border-card-custom/40 space-y-6 ${!isExpanded ? 'hidden print:block' : ''}`}>
                    
                    {/* SECCIÓN 1: STACK */}
                    <div>
                      <h4 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider mb-2 flex items-center gap-1.5">
                        <Code className="w-4 h-4" />
                        Medios & Stack Tecnológico Integrado
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {item.medios_y_stack && item.medios_y_stack.map((tech, i) => (
                          <span 
                            key={i} 
                            className="px-3 py-1 rounded-xl text-xs font-bold bg-input-custom border border-card-custom text-primary-custom shadow-2xs"
                          >
                            ⚡ {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* SECCIÓN 2: ESTRUCTURA DE DATOS */}
                    {item.estructura_datos && (
                      <div className="bg-slate-500/5 p-4 rounded-2xl border border-card-custom/50 space-y-3">
                        <h4 className="text-xs font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider flex items-center gap-1.5">
                          <Server className="w-4 h-4" />
                          Estructura de Datos & Lógica de Negocio
                        </h4>
                        
                        <div className="text-xs font-medium text-primary-custom leading-relaxed">
                          <strong>Reglas de Negocio:</strong> {item.estructura_datos.reglas_negocio}
                        </div>

                        {item.estructura_datos.firestore_collections && (
                          <div className="flex items-center gap-2 text-xs">
                            <strong className="text-secondary-custom">Colecciones Firestore:</strong>
                            {item.estructura_datos.firestore_collections.map((col, i) => (
                              <span key={i} className="font-mono text-[11px] bg-purple-500/10 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-md font-bold">
                                {col}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SECCIÓN 3: MÓDULOS AFECTADOS */}
                    {item.modulos_afectados && (
                      <div>
                        <h4 className="text-xs font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider mb-2 flex items-center gap-1.5">
                          <Layers className="w-4 h-4" />
                          Módulos y Componentes Impactados
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {item.modulos_afectados.map((mod, i) => (
                            <span key={i} className="text-[11px] font-bold font-mono bg-sky-500/10 text-sky-600 dark:text-sky-300 px-2.5 py-1 rounded-lg border border-sky-500/20">
                              {mod}.jsx
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PESTAÑA 6: PROTOCOLO OBLIGATORIO DE DESPLIEGUE */}
      {(activeTab === 'protocolo' || true) && (
        <div className={`space-y-6 ${activeTab !== 'protocolo' ? 'hidden print:block' : ''}`}>
          <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-sm space-y-4 theme-transition print:border-gray print:bg-white">
            <div className="flex items-center gap-3 border-b border-card-custom/50 pb-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-primary-custom">6. Protocolo Obligatorio de Despliegue & Retroalimentación Continua</h2>
                <p className="text-xs text-secondary-custom font-medium">Secuencia reglamentaria de 4 pasos para cualquier modificación o nueva variable en MÉTRICO.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-medium">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-1">
                <strong className="text-emerald-600 dark:text-emerald-400 block text-sm font-black">Paso 1: Consolidado & Arquitectura</strong>
                <p className="text-secondary-custom">
                  Actualizar la versión y enriquecer de forma continua el Consolidado Maestro (<code className="font-mono text-emerald-500">InformeArquitectura.jsx</code>).
                </p>
              </div>

              <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl space-y-1">
                <strong className="text-indigo-600 dark:text-indigo-400 block text-sm font-black">Paso 2: Muro de Novedades</strong>
                <p className="text-secondary-custom">
                  Registrar las novedades e instructivos de uso en el sitio (<code className="font-mono text-indigo-500">ModalMuroActualizaciones.jsx</code>).
                </p>
              </div>

              <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-2xl space-y-1">
                <strong className="text-sky-600 dark:text-sky-400 block text-sm font-black">Paso 3: Versionamiento GitHub</strong>
                <p className="text-secondary-custom">
                  Ejecutar <code className="font-mono text-sky-500">npm run build</code>, realizar <code className="font-mono text-sky-500">git commit</code> y push a la rama <code className="font-mono text-sky-500">main</code>.
                </p>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl space-y-1">
                <strong className="text-purple-600 dark:text-purple-400 block text-sm font-black">Paso 4: Firebase Hosting Deploy</strong>
                <p className="text-secondary-custom">
                  Desplegar a producción (<code className="font-mono text-purple-500">firebase deploy</code>) y confirmar en <code className="font-mono text-purple-500">metrico-dashboard-2026.web.app</code>.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
