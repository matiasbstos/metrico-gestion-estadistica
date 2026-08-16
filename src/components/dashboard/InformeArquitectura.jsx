import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Shield, ShieldAlert, Cpu, Layers, Database, Code, 
  Printer, Search, Calendar, ChevronDown, ChevronUp, CheckCircle, 
  Sparkles, FileText, ArrowRight, Server, Terminal, Lock
} from 'lucide-react';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';

export const HISTORIAL_ARQUITECTURA_BASE = [
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
  },
  {
    id: 'v3.9.0',
    version_tag: 'v3.9.0',
    fecha_despliegue: '15 de Agosto, 2026',
    proposito_actualizacion: 'Incorporación del Catálogo Histórico Completo de Problemas Resueltos (v1.0.0 a v3.8.5) y Auto-Persistencia en Firestore linkedin_devlog.',
    medios_y_stack: [
      'React 18.3 & Vite Build Engine',
      'DevLogModule Historical Catalog & Firestore Auto-Sync (DEVLOG_POSTS_INITIAL)',
      'Firebase Firestore (Colección linkedin_devlog)'
    ],
    estructura_datos: {
      reglas_negocio: 'Consolida y persiste todos los hitos históricos y soluciones de problemas anteriores en la Bitácora de Desarrollo autorizada con copiado a LinkedIn en 1 clic.',
      firestore_collections: ['linkedin_devlog', 'system_architecture_log'],
      query_optimization: 'Sincronización síncrona de registros históricos iniciales con auto-persistencia en Firestore.'
    },
    modulos_afectados: ['DevLogModule', 'InformeArquitectura', 'Dashboard'],
    detalles_tecnicos: [
      'Catálogo de 10 hitos históricos desde v3.0.0 hasta v3.8.5 pre-poblados y guardados en Firestore.',
      'Soporte completo de filtrado por categoría y búsqueda textual.'
    ]
  },
  {
    id: 'v3.8.5',
    version_tag: 'v3.8.5',
    fecha_despliegue: '15 de Agosto, 2026',
    proposito_actualizacion: 'Implementación del Sistema "Zero-Click DevLog" para la Bitácora de Desarrollo Autónoma con Generador de Posts de LinkedIn y Pipeline de Snapshots 1080p.',
    medios_y_stack: [
      'React 18.3 & Vite Build Engine',
      'DevLogModule Grid Layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)',
      'Puppeteer/Playwright Autonomous Snapshot Pipeline (scripts/take_devlog_snapshot.cjs)',
      'Gemini 1.5 Flash API LinkedIn Post Synthesizer (generarDevlogPostGemini)',
      'Firebase Firestore (Colección linkedin_devlog)'
    ],
    estructura_datos: {
      reglas_negocio: 'Auto-genera publicaciones estructuradas para LinkedIn (1. El Problema. 2. Cómo lo abordamos. 3. Cómo lo solucionamos) con el tono empírico de Matías. Permite previsualización en cuadrícula, descarga de capturas PNG 1080p y copiado a 1 clic.',
      firestore_collections: ['linkedin_devlog', 'audit_logs'],
      query_optimization: 'Fusión síncrona de registros iniciales pre-poblados con subscripción en vivo a Firestore.'
    },
    modulos_afectados: ['DevLogModule', 'Dashboard', 'generateDevlogPost', 'take_devlog_snapshot', 'InformeArquitectura'],
    detalles_tecnicos: [
      'Módulo exclusivo para administración global (isGlobalAdmin).',
      'Soporte para generación de posts bajo demanda con el prompt estricto de Gemini.',
      'Script de fotógrafo autónomo para evidencia visual de alta definición.'
    ]
  },
  {
    id: 'v3.7.5',
    version_tag: 'v3.7.5',
    fecha_despliegue: '15 de Agosto, 2026',
    proposito_actualizacion: 'Alineación Total del Detector Global de Discrepancias (Barra Lateral + Cabecera + Bitácora) e Implementación del Tono Distintivo de Alerta de Incidentes.',
    medios_y_stack: [
      'React 18.3 & Vite Build Engine',
      'Clinical Incident Double-Pulse Audio Synthesizer (F5/C6 -> A5/F6)',
      'Unified Parity Evaluator (integrityIncidencesCount)'
    ],
    estructura_datos: {
      reglas_negocio: 'Elimina falsos positivos en el distintivo de Alerta Integridad de la barra lateral cuando la Bitácora reporta Paridad 100% OK (0 Incidencias). Incorpora un sonido distintivo de notificación de incidentes.',
      firestore_collections: ['audit_logs', 'pacientes_urgencia'],
      query_optimization: 'Evaluación síncrona en el hook de analytics y sincronización en vivo.'
    },
    modulos_afectados: ['Dashboard', 'audioNotifications', 'AuditLog', 'InformeArquitectura'],
    detalles_tecnicos: [
      'Alineada la fórmula integrityIncidencesCount en Dashboard.jsx con la Bitácora de Integridad.',
      'Sintetizado el tono armónico de doble pulso clínico para notificaciones distintivas de incidentes.'
    ]
  },
  {
    id: 'v3.7.0',
    version_tag: 'v3.7.0',
    fecha_despliegue: '15 de Agosto, 2026',
    proposito_actualizacion: 'Incorporación del Sonido Sutil de Alerta Armónica (playIntegrityAlertChime con Web Audio API) al detectar discrepancias o incidencias de integridad.',
    medios_y_stack: [
      'Web Audio API Native Synthesizer (sin archivos mp3 externos)',
      'Dual High-Frequency Sine Wave Tone (880 Hz -> 740 Hz)',
      'Audio Trigger Reactor (useEffect & prevIntegrityCountRef)'
    ],
    estructura_datos: {
      reglas_negocio: 'Emite una señal sonora armónica sutil cuando el detector automático identifica la transición a una Alerta de Integridad (>0 incidencias). Reproduce un chime de éxito armónico al ejecutar conciliaciones.',
      firestore_collections: ['audit_logs', 'pacientes_urgencia'],
      query_optimization: 'Sintetizador Web Audio API de 0 bytes de latencia y 0 consumo de red.'
    },
    modulos_afectados: ['audioNotifications', 'Dashboard', 'AuditLog', 'InformeArquitectura'],
    detalles_tecnicos: [
      'Implementada la función playIntegrityAlertChime() con decaimiento exponencial.',
      'Sincronizada con las conciliaciones y el detector global de paridad.'
    ]
  },
  {
    id: 'v3.6.5',
    version_tag: 'v3.6.5',
    fecha_despliegue: '15 de Agosto, 2026',
    proposito_actualizacion: 'Incorporación del Badge Permanente de Alerta de Integridad en la Barra Superior del Explorador Global con Acceso Directo de 1 Clic a la Bitácora.',
    medios_y_stack: [
      'React 18.3 & Vite Build Engine',
      'IntegrityAlertBadge Glassmorphic Beacon Component',
      'Direct Navigation Router (onNavigateTab)'
    ],
    estructura_datos: {
      reglas_negocio: 'Permite visualizar de forma continua la presencia de alertas de integridad aun cuando el menú lateral se encuentra replegado. Al hacer clic sobre el badge, redirige de inmediato a la Bitácora de Integridad.',
      firestore_collections: ['audit_logs', 'pacientes_urgencia'],
      query_optimization: 'Evaluación reactiva en el componente FiltrosGlobales sin recargas de página.'
    },
    modulos_afectados: ['FiltrosGlobales', 'Dashboard', 'InformeArquitectura'],
    detalles_tecnicos: [
      'Badge flotante de vidrio pulido con luz pulsante de alerta sutil (o badge verde de Integridad 100% OK).',
      'Navegación directa mediante onNavigateTab("auditoria").'
    ]
  },
  {
    id: 'v3.6.0',
    version_tag: 'v3.6.0',
    fecha_despliegue: '15 de Agosto, 2026',
    proposito_actualizacion: 'Implementación del Mecanismo Interactivo de Conciliación & Resolución de Discrepancias en la Bitácora de Integridad y Paridad de Datos SSOT.',
    medios_y_stack: [
      'React 18.3 & Vite Build Engine',
      'Engine de Conciliación Auditada Interactivas (handleReconcileIndicator & handleReconcileAll)',
      'Firebase Firestore (Colección audit_logs & audit_parity_matrix)'
    ],
    estructura_datos: {
      reglas_negocio: 'Permite resolver discrepancias entre BigQuery SSOT y el motor oficial de cliente (como Constataciones Z51.8 y Traslados), dejando registro de auditoría en Firestore y asegurando 0 Incidencias (Estado General 100% OK).',
      firestore_collections: ['audit_logs', 'pacientes_urgencia'],
      query_optimization: 'Validación en vivo con botones de conciliación interactivos por fila y botón general "Reconciliar Todo".'
    },
    modulos_afectados: ['AuditLog', 'Dashboard', 'InformeArquitectura'],
    detalles_tecnicos: [
      'Ajustado el motor de auditoría de paridad para reconocer la clasificación clínica exhaustiva oficial.',
      'Soporte para reconciliación manual auditada con guardado de traza en la colección audit_logs.'
    ]
  },
  {
    id: 'v3.5.5',
    version_tag: 'v3.5.5',
    fecha_despliegue: '15 de Agosto, 2026',
    proposito_actualizacion: 'Garantía de Paridad Absoluta (100%) entre las tarjetas KPI del Resumen Inicial y los Sub-módulos de Análisis Específicos (Constataciones, Traslados y Triaje C3-L).',
    medios_y_stack: [
      'React 18.3 & Vite Build Engine',
      'Unified Analytics Parity Engine (statsKPI & isConstatacionLesion)',
      'Firebase Cloud Functions & Firestore'
    ],
    estructura_datos: {
      reglas_negocio: 'Asegura que el contador de Constataciones de Lesiones, Traslados y Distribución C3(L) en las tarjetas superiores del Resumen coincida exactamente al 100% con las cifras de los sub-módulos de análisis específicos, eliminando discrepancias por consultas estrictas.',
      firestore_collections: ['pacientes_urgencia', 'turnos'],
      query_optimization: 'Fusión reactiva de statsKPI y kpisBigQuery con prioridad en las clasificaciones oficiales locales.'
    },
    modulos_afectados: ['Dashboard', 'useMetricoAnalytics', 'AnalisisConstataciones', 'PanelKPIs'],
    detalles_tecnicos: [
      'Resuelta discrepancia entre la consulta estricta de BigQuery (Z51.8 puro) y el desglosador exhaustivo (Z51.8, Z04, Z65, Z02.7 y unidades policiales).',
      'Integración inmediata en las tarjetas de Periodo Seleccionado y Distribución de Triaje C3 (L).'
    ]
  },
  {
    id: 'v3.5.0',
    version_tag: 'v3.5.0',
    fecha_despliegue: '15 de Agosto, 2026',
    proposito_actualizacion: 'Auto-Detección Inteligente del ÚLTIMO TURNO CLÍNICO COMPLETO al ingresar a la plataforma e Identificación Automática del Equipo de Turno en las sugerencias.',
    medios_y_stack: [
      'React 18.3 & Vite Build Engine',
      'Engine de Auto-Selección del Último Turno Completo',
      'Rotativa Cíclica de Equipos (Equipos 1, 2, 3 y 4)',
      'Firebase Firestore (Colección system_architecture_log & turnos_diarios)'
    ],
    estructura_datos: {
      reglas_negocio: 'Al ingresar o refrescar el sitio, el sistema detecta la última marca de tiempo de admisiones reales en la BD y selecciona automáticamente el último turno clínico 100% completo (Turno Largo 16:00 a 09:00 AM o Finde), evitando tarjetas en cero. Identifica el Equipo de Turno en las sugerencias.',
      firestore_collections: ['system_architecture_log', 'pacientes', 'turnos_diarios', 'pautas_turnos'],
      query_optimization: 'Cálculo dinámico de fecha max + encasillamiento automático de fecha_fin = fecha_inicio + 1d en turnos nocturnos.'
    },
    modulos_afectados: ['Dashboard', 'FiltrosGlobales', 'SugerenciasTurnosBar', 'usePautasTurnos'],
    detalles_tecnicos: [
      'Resolución automática de fecha inicial y final para mostrar siempre datos 100% completos en la primera carga.',
      'Inyección del badge de Equipo de Turno (ej. Turno Largo Semana — Turno 2) en el pop-up de sugerencias.',
      'Corrección del bug de rango corto (ej. 13/08 a 13/08 04:00 PM a 09:00 PM) forzando el salto de fecha a +1d en Turno Largo.'
    ]
  },
  {
    id: 'v3.4.5',
    version_tag: 'v3.4.5',
    fecha_despliegue: '15 de Agosto, 2026',
    proposito_actualizacion: 'Implementación del módulo Documentación Viva y Arquitectura (Living Documentation) con control de acceso ADMIN_GLOBAL, indicador pulsante sutil de encasillamiento, popover glassmorphic y exportación a PDF.',
    medios_y_stack: [
      'React 18.3 & Vite Build Engine',
      'TailwindCSS con Glassmorphic Tokens ("Cristal Pastel")',
      'Lucide React (BookOpen, Info, Sparkles, Printer)',
      'Firebase Firestore (Colección system_architecture_log)',
      'Web Audio API (Chimes armónicos sintéticos)'
    ],
    estructura_datos: {
      reglas_negocio: 'Encasillamiento extendido (+1h) de Turno Largo Semana (16:00 a 09:00 AM) con etiqueta visual 17:00 - 08:00 hrs. Turnos de Fin de Semana (08:00-20:00 y 20:00-08:00) con contabilización estricta. Restitución del Día Completo (00:00-23:59).',
      firestore_collections: ['system_architecture_log', 'pacientes', 'turnos_diarios', 'metrico_notificaciones'],
      query_optimization: 'Filtro en tiempo real por fecha_inicio y hora con paridad 100% entre Resumen, KPIs y subreportes específicos.'
    },
    modulos_afectados: ['Dashboard', 'FiltrosGlobales', 'SugerenciasTurnosBar', 'InformeArquitectura', 'AnalisisTraslados'],
    detalles_tecnicos: [
      'Sugerencias de turnos dinámicas desplegadas solo al interactuar (onClick/onFocus/onChange) en los pickers de fecha/hora.',
      'Pop-up flotante desplegable anclado al contenedor de filtros con desvanecimiento animado.',
      'Popover glassmorphic personalizado para el badge explicativo con indicador de baliza pulsante ("radiante de alarma sutil").',
      'Plantilla CSS de impresión executive (@media print) para generar reportes en PDF formato gerencial.'
    ]
  },
  {
    id: 'v3.4.0',
    version_tag: 'v3.4.0',
    fecha_despliegue: '14 de Agosto, 2026',
    proposito_actualizacion: 'Asistente Inteligente de Sugerencias de Turnos y Encasillamiento Horario Oficial en la barra global de filtros.',
    medios_y_stack: [
      'React 18.3 Custom Hooks',
      'TailwindCSS UI Components',
      'Date/Time Context Engine'
    ],
    estructura_datos: {
      reglas_negocio: 'Detección automática de tipo de día (Hábil vs Fin de Semana/Festivo). Sugerencias de 1 clic para Turno Largo, Turno 1 Finde y Turno 3 Finde.',
      firestore_collections: ['pacientes', 'turnos_diarios'],
      query_optimization: 'Integración simultánea de pacientesFiltrados en todos los módulos específicos.'
    },
    modulos_afectados: ['FiltrosGlobales', 'SugerenciasTurnosBar', 'Dashboard'],
    detalles_tecnicos: [
      'Motor de sugerencias context-aware según día de la semana.',
      'Redirección automática de estado de hora de inicio y hora de fin.',
      'Optimización de rendimiento en reactivación de métricas KPI.'
    ]
  },
  {
    id: 'v3.3.0',
    version_tag: 'v3.3.0',
    fecha_despliegue: '14 de Agosto, 2026',
    proposito_actualizacion: 'Audio-Notificaciones Armónicas Sutiles (Web Audio API) + Centro de Notificaciones en la Campana Superior con Botón "Marcar como Leídas".',
    medios_y_stack: [
      'Web Audio API (OscillatorNode, GainNode, Harmonic Chimes)',
      'LocalStorage Event Bus (window.dispatchEvent)',
      'Lucide React (Bell, CheckCircle2, Volume2)'
    ],
    estructura_datos: {
      reglas_negocio: 'Notificación sonora y visual al completar sincronizaciones o cargas masivas. Alerta roja automática si existen descalces de integridad entre BigQuery y Firestore.',
      firestore_collections: ['metrico_notificaciones', 'system_logs'],
      query_optimization: 'Persistencia local con límite de 30 elementos no leídos.'
    },
    modulos_afectados: ['CampanaNotificaciones', 'GestionDatos', 'audioNotifications.js', 'Dashboard'],
    detalles_tecnicos: [
      'Síntesis analógica de audio armónico a 587Hz (D5) y 880Hz (A5) sin archivos MP3 pesados.',
      'Menu desplegable flotante con badge rojo interactivo.',
      'Redirección automática a Auditoría/Integridad al hacer clic en cualquier notificación.'
    ]
  },
  {
    id: 'v3.2.0',
    version_tag: 'v3.2.0',
    fecha_despliegue: '14 de Agosto, 2026',
    proposito_actualizacion: 'Modal de Verificación de Estado de Red y Sincronización Automática con pop-up toast sutil en la esquina inferior.',
    medios_y_stack: [
      'Firebase Firestore Realtime Listeners',
      'Lucide React (Wifi, RefreshCw)',
      'Tailwind Glassmorphism'
    ],
    estructura_datos: {
      reglas_negocio: 'Reevaluación de datos cada 5 minutos en background. Toast flotante en esquina inferior derecha con fecha y hora exacta.',
      firestore_collections: ['pacientes', 'turnos_diarios'],
      query_optimization: 'Muestreo optimizado mediante cursores de consulta.'
    },
    modulos_afectados: ['PopUpSincronizacion', 'Dashboard', 'useMetricoData'],
    detalles_tecnicos: [
      'Detección de conexión offline/online.',
      'Auto-dismiss de alertas de sincronización a los 6 segundos.'
    ]
  },
  {
    id: 'v3.1.0',
    version_tag: 'v3.1.0',
    fecha_despliegue: '14 de Agosto, 2026',
    proposito_actualizacion: 'Muro de Novedades e Instructivos con Modal interactivo y visualizador de cambios por versión.',
    medios_y_stack: [
      'React Modal Component',
      'Tailwind Gradients & Animations',
      'Lucide React (Megaphone, BookOpen)'
    ],
    estructura_datos: {
      reglas_negocio: 'Publicación de novedades, cambios técnicos e instructivos de uso para usuarios del sistema.',
      firestore_collections: [],
      query_optimization: 'Renderizado estático directo desde registry de updates.'
    },
    modulos_afectados: ['ModalMuroActualizaciones', 'Sidebar', 'Dashboard'],
    detalles_tecnicos: [
      'Badge de versión animado en el menú lateral.',
      'Visualizador paso a paso de novedades e instructivos de uso.'
    ]
  },
  {
    id: 'v3.0.0',
    version_tag: 'v3.0.0',
    fecha_despliegue: '10 de Agosto, 2026',
    proposito_actualizacion: 'Rediseño Global a Identidad "Cristal Pastel" con Modo Oscuro Automático y Módulos de Análisis Específicos.',
    medios_y_stack: [
      'Vite 8 & React 18',
      'TailwindCSS Modern Palette (HSL Tailored)',
      'Recharts 2.12',
      'Firebase Firestore & Functions'
    ],
    estructura_datos: {
      reglas_negocio: 'Arquitectura modularizada para análisis de Demanda, Altas, Fracturas, Enfermería, Constataciones y Traslados.',
      firestore_collections: ['pacientes', 'turnos_diarios', 'users'],
      query_optimization: 'Agregaciones en tiempo real con cache local.'
    },
    modulos_afectados: ['Dashboard', 'PanelKPIs', 'CurvaDemanda', 'AnalisisAltasDetail', 'AnalisisTraslados'],
    detalles_tecnicos: [
      'Sistema completo de diseño glassmorphic con tokens dinámicos.',
      'Sincronización multi-centro (Elsa Romo, Nicodemus, etc.).'
    ]
  }
];

export default function InformeArquitectura({ user, userProfile, isGlobalAdmin, db }) {
  const [logs, setLogs] = useState(HISTORIAL_ARQUITECTURA_BASE);
  const [expandedVersion, setExpandedVersion] = useState('v3.4.5');
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
          // Combinar con base ordenando por fecha / version
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
          El <strong>Informe de Arquitectura y Documentación Viva</strong> está reservado exclusivamente para usuarios con el rol <strong>ADMIN_GLOBAL</strong>.
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

      {/* HEADER DE MÓDULO */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card-custom p-6 rounded-3xl border border-card-custom shadow-sm theme-transition print:border-gray print:p-4 print:shadow-none">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0 print:border print:border-gray">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-primary-custom tracking-tight">Documentación Viva & Arquitectura</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-widest print:hidden">
                ADMIN_GLOBAL ONLY
              </span>
            </div>
            <p className="text-sm text-secondary-custom font-medium mt-0.5">
              Historial evolutivo del sistema, reglas de negocio, estructura de datos y medios integrados.
            </p>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN: BUSCADOR E IMPRESIÓN */}
        <div className="flex items-center gap-3 w-full lg:w-auto print:hidden">
          <div className="relative flex-1 lg:w-64">
            <Search className="w-4 h-4 text-secondary-custom absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Buscar versión, módulo o tecnología..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-input-custom border border-card-custom text-xs font-bold text-primary-custom outline-none focus:border-indigo-500 shadow-xs transition-all"
            />
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* ENCABEZADO GERENCIAL EXCLUSIVO PARA IMPRESIÓN EN PDF */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase text-slate-900">MÉTRICO — INFORME TÉCNICO DE ARQUITECTURA</h1>
            <p className="text-xs text-slate-600 font-semibold">Sistema Estadístico de Gestión SAR & Urgencias — Registro de Versiones</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p><strong>Fecha de Generación:</strong> {new Date().toLocaleDateString('es-CL')}</p>
            <p><strong>Clasificación:</strong> Confidencial / Administración Global</p>
          </div>
        </div>
      </div>

      {/* STATS DE ARQUITECTURA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-4">
        <div className="bg-card-custom p-4 rounded-2xl border border-card-custom shadow-xs theme-transition print:border-gray print:bg-white">
          <div className="flex items-center gap-2 text-xs font-bold text-secondary-custom uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span>Versión Actual</span>
          </div>
          <div className="text-2xl font-black text-primary-custom font-mono">v3.4.5</div>
          <div className="text-[10px] text-emerald-500 font-bold mt-1">✓ Desplegado e integrado</div>
        </div>

        <div className="bg-card-custom p-4 rounded-2xl border border-card-custom shadow-xs theme-transition print:border-gray print:bg-white">
          <div className="flex items-center gap-2 text-xs font-bold text-secondary-custom uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-sky-500" />
            <span>Módulos de Análisis</span>
          </div>
          <div className="text-2xl font-black text-primary-custom">12 Subreportes</div>
          <div className="text-[10px] text-secondary-custom font-medium mt-1">Resumen, Demanda, Traslados...</div>
        </div>

        <div className="bg-card-custom p-4 rounded-2xl border border-card-custom shadow-xs theme-transition print:border-gray print:bg-white">
          <div className="flex items-center gap-2 text-xs font-bold text-secondary-custom uppercase tracking-wider mb-1">
            <Database className="w-4 h-4 text-purple-500" />
            <span>Base de Datos</span>
          </div>
          <div className="text-2xl font-black text-primary-custom">Firebase Firestore</div>
          <div className="text-[10px] text-purple-500 font-bold mt-1">Colección system_architecture_log</div>
        </div>

        <div className="bg-card-custom p-4 rounded-2xl border border-card-custom shadow-xs theme-transition print:border-gray print:bg-white">
          <div className="flex items-center gap-2 text-xs font-bold text-secondary-custom uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Seguridad & Guardias</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">ADMIN_GLOBAL</div>
          <div className="text-[10px] text-secondary-custom font-medium mt-1">Control de Roles Activo</div>
        </div>
      </div>

      {/* LÍNEA DE TIEMPO / HISTORIAL DE VERSIONES (LIVING DOCUMENTATION) */}
      <div className="space-y-4">
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

              {/* DETALLE TÉCNICO COMPLETO (EXPANDIDO) */}
              {(isExpanded || true) && (
                <div className={`p-6 border-t border-card-custom/40 space-y-6 ${!isExpanded ? 'hidden print:block' : ''}`}>
                  
                  {/* SECCIÓN 1: MEDIOS Y STACK TECNOLÓGICO */}
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

                  {/* SECCIÓN 2: ESTRUCTURA DE DATOS Y REGLAS DE NEGOCIO */}
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

                      {item.estructura_datos.query_optimization && (
                        <div className="text-xs font-medium text-secondary-custom">
                          <strong>Optimización de Consultas:</strong> {item.estructura_datos.query_optimization}
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

                  {/* SECCIÓN 4: DETALLES TÉCNICOS ESPECÍFICOS */}
                  {item.detalles_tecnicos && item.detalles_tecnicos.length > 0 && (
                    <div>
                      <h4 className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider mb-2 flex items-center gap-1.5">
                        <Terminal className="w-4 h-4" />
                        Especificaciones Técnicas & Cambios Menores
                      </h4>
                      <ul className="space-y-1.5 pl-2">
                        {item.detalles_tecnicos.map((bullet, i) => (
                          <li key={i} className="text-xs text-secondary-custom font-medium flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
