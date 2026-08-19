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
                  Se extiende desde las <strong>07:00 hasta las 20:00 hrs</strong> (13 horas de ventana) garantizando la captura completa de las admisiones matutinas.
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
                  Se extiende desde las <strong>19:00 hasta las 08:00 AM</strong> (+1 día, 13 horas de ventana) para la noche completa de guardia.
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
