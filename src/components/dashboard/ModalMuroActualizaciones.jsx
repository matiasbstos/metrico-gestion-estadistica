import React, { useState } from 'react';
import { Megaphone, Sparkles, X, Calendar, CheckCircle2, ShieldAlert, MapPin, Cpu, BarChart2, Filter, Layers, Clock, HelpCircle, BookOpen, Lightbulb, Eye, Mail } from 'lucide-react';

export default function ModalMuroActualizaciones({ isOpen, onClose }) {
  const [selectedCat, setSelectedCat] = useState('TODOS');

  if (!isOpen) return null;

  const updatesList = [
    {
      id: 'v4.8.1',
      version: 'v4.8.1',
      fecha: '16 de Agosto, 2026',
      badge: 'CORRECCIÓN & SEGURIDAD',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Corrección de Renderizado de Reloj y Permisos de Conectividad CSP para Cloud Functions y CDN',
      categoria: 'Estabilidad & Seguridad',
      icon: Clock,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Resolución del error de renderizado del componente de horas en la barra superior (ReferenceError: Clock is not defined) e inclusión explícita en las políticas Content-Security-Policy (CSP) de los dominios de Cloud Functions y librerías CDN para garantizar el funcionamiento fluido.',
      instructivo: {
        paraQueSirve: 'Garantiza la estabilidad continua de la plataforma evitando bloqueos visuales en el navegador y permitiendo el consumo seguro de Cloud Functions.',
        quePuedesVer: 'El panel vuelve a cargar con fluidez total sin pantalla de error crítico y con todos los selectores de horas operativos.',
        ejemploUso: 'Ejemplo: Seleccionas cualquier rango horario en la barra superior o abres la Carga Rápida CSV/Excel y el sistema opera instantáneamente.'
      },
      changes: [
        'Importación de Icono Clock: Inclusión explícita de Clock desde lucide-react en FiltrosGlobales.jsx.',
        'Actualización CSP script-src: Permiso concedido a cdnjs.cloudflare.com para la librería XLSX.',
        'Actualización CSP connect-src: Permiso concedido a *.cloudfunctions.net para la API de funciones Cloud.'
      ]
    },
    {
      id: 'v4.8.0',
      version: 'v4.8.0',
      fecha: '16 de Agosto, 2026',
      badge: 'ACCESO RÁPIDO GLOBAL',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Botón Rápido de Carga Masiva CSV/Excel Global y Redirección Automática a Gestión de Datos',
      categoria: 'Gestión de Datos & Usabilidad',
      icon: UploadCloud,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Incorporación del botón "Carga Rápida CSV/Excel" en la barra superior global de MÉTRICO, permitiendo subir lotes masivos de atenciones desde cualquier módulo sin necesidad de navegar previamente a Gestión de Datos. Al finalizar la carga, el sistema ejecuta una redirección automática a la sección Gestión de Datos con notificación sonora y toast confirmatorio.',
      instructivo: {
        paraQueSirve: 'Permite a los analistas y jefaturas subir datos Excel o CSV en un clic desde cualquier vista (Resumen, Radar, Rendimiento, Perfil, etc.), ahorrando tiempo de navegación y garantizando la desduplicación en vivo.',
        quePuedesVer: 'En la barra superior de acciones verás el botón "Carga Rápida CSV/Excel". Al hacer clic, se abre una ventana flotante para seleccionar el archivo. Durante la subida, se muestra una barra de progreso con tiempo estimado (ETA) y, al finalizar, se escucha el chime de éxito y te redirecciona a la sección Gestión de Datos.',
        ejemploUso: 'Ejemplo: Estás revisando el Radar Predictivo y necesitas cargar el informe diario de atenciones. Presionas "Carga Rápida CSV/Excel", seleccionas el archivo y, en segundos, el sistema procesa los registros y te traslada a la Gestión de Datos con el lote totalmente cargado y conciliado.'
      },
      changes: [
        'Botón Rápido "Carga Rápida CSV/Excel": Acceso permanente en la barra superior FiltrosGlobales.jsx.',
        'Modal Global <ModalCargaRapidaDatos>: Procesamiento masivo de archivos .xlsx, .xls y .csv desde cualquier vista.',
        'Reglas SSOT & Deduplicación Reactiva: Filtrado en memoria de atenciones duplicadas antes de guardar en Firestore.',
        'Redirección Automática Post-Carga: Traslado directo del usuario a la pestaña "Gestión de Datos" (setActiveTab("data")).',
        'Notificación Sonora & Toast: Reproducción de playSuccessChime() y registro en la Campana Superior de Notificaciones.'
      ]
    },
    {
      id: 'v4.7.0',
      version: 'v4.7.0',
      fecha: '16 de Agosto, 2026',
      badge: 'IA GENERATIVA GEMINI',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20',
      title: 'Síntesis Epidemiológica Generativa IA en Reporte PDF: Análisis de Causa Raíz e Inteligencia Sanitaria Automática',
      categoria: 'Inteligencia Artificial & Reportes',
      icon: Sparkles,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      summary: 'Integración de la Síntesis Epidemiológica Generativa (impulsada por Gemini 1.5 Flash) en la exportación del PDF del Dashboard de Arquetipos Clínicos: captura un Data Snapshot en JSON del arquetipo activo, invoca el prompt de Director de Inteligencia Sanitaria redactando un análisis de causa raíz y cruce multivariable, e inyecta la narrativa en el documento imprimible final.',
      instructivo: {
        paraQueSirve: 'Adjunta automáticamente una narrativa de inteligencia sanitaria experta al final de cada reporte PDF exportado, explicando la causa raíz de la saturación horaria y la vulnerabilidad social de la cohorte.',
        quePuedesVer: 'Al hacer clic en "Generar Reporte de Perfil", el botón mostrará un indicador de estado "Generando Análisis IA...". En menos de un segundo, la síntesis redactada en 2 partes (1. Estructura Demográfica, 2. Causa Raíz & Saturación) aparecerá al final del informe en el PDF descargado.',
        ejemploUso: 'Ejemplo: Seleccionas "Infantil (0-14 años)". Al exportar el reporte, el motor analiza que el pico de demanda se da los fines de semana en la tarde por patologías bronquiales (J20/J00), redactando un informe que alerta sobre cuellos de botella en observación y sugiere coordinar traslados preventivos.'
      },
      changes: [
        'Data Snapshot JSON Automático: Captura cuantitativa de cohorte, edad, tiempos, top 5 diagnósticos orgánicos, previsión y picos del heatmap.',
        'Gemini 1.5 Flash API Integration: Consulta con el System Prompt de Director de Inteligencia Sanitaria en tono gerencial riguroso.',
        'Generador Fallback Determinista: Motor local de alta fidelidad que garantiza que el informe siempre descargue la narrativa completa sin bloqueos por timeout.',
        'Componente <AnalisisEpidemiologicoIA>: Renderizado inyectado al final de PerfilPoblacionalReporte.jsx con diseño visual gerencial para PDF.'
      ]
    },
    {
      id: 'v4.6.0',
      version: 'v4.6.0',
      fecha: '16 de Agosto, 2026',
      badge: 'NIVEL DIRECTIVO PRO',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Dashboard de Arquetipos Clínicos Nivel Directivo Pro: Universo Completo (64k+ Reg.), Pirámide Bidireccional Horizontal, Blacklist Z/R/Y, Filtro Temporal y Heatmap Operativo',
      categoria: 'Epidemiología & Gestión Directiva',
      icon: Flame,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Upgrade integral del Dashboard de Arquetipos Clínicos a estándar directivo: inyección del universo máster completo (64.000+ registros históricos), Pirámide Poblacional bidireccional horizontal real (layout vertical en Recharts), Blacklist Clínico estricto en el Top 5 CIE-10 (exclusión de prefijos Z, R, Y para mostrar patologías orgánicas puras), Selector de Rango Temporal (Histórico, Año Actual, Mes, 7 Días) y Heatmap Operativo semanal por franja horaria.',
      instructivo: {
        paraQueSirve: 'Proporciona una vista epidemiológica máster de nivel directivo para el análisis del universo completo de atenciones del SAR, permitiendo evaluar la demanda por horarios y la prevalencia de enfermedades puras.',
        quePuedesVer: 'Al ingresar a "Perfil del Paciente", verás la Muestra de Arquetipo reflejando el universo total de 64k+ registros, la pirámide poblacional proyectada horizontalmente (Hombres azul a la izquierda, Mujeres rosado a la derecha), el Top 5 de diagnósticos orgánicos sin códigos de control, el selector de Rango Temporal y la matriz de Mapa de Calor de Frecuencia Semanal.',
        ejemploUso: 'Ejemplo: Seleccionas "Año Actual (2026)" y el arquetipo "Adulto Mayor (65+ años)". El sistema analiza síncronamente sobre el universo completo, actualiza la pirámide horizontal, exhibe el Top 5 de patologías puras (ej. K29.7 Gastritis, I10 Hipertensión) y despliega en el Heatmap que la mayor afluencia de este grupo se concentra en la franja Noche (18:00 - 24:00 hrs) los días Lunes y Martes.'
      },
      changes: [
        'Desbloqueo Universo Completo SSOT: Inyección directa de allPacientesDB (64.000+ registros históricos).',
        'Pirámide Poblacional Bidireccional Horizontal Real: Configuración BarChart layout="vertical" con Hombres a la izquierda (-val) y Mujeres a la derecha (+val).',
        'Blacklist Clínico de Exclusión CIE-10: Exclusión estricta de códigos Z, R, Y y diagnósticos no especificados para exhibir patologías médicas puras.',
        'Selector de Rango Temporal: 4to filtro superior (Histórico Completo, Año Actual, Mes Actual, Últimos 7 Días).',
        'Heatmap Operativo de Frecuencia Semanal: Matriz visual de calor 7 × 4 cruzando Días de la Semana vs Turnos/Franjas Horarias.'
      ]
    },
    {
      id: 'v4.5.0',
      version: 'v4.5.0',
      fecha: '16 de Agosto, 2026',
      badge: 'MODO DIRECTORIO',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20',
      title: 'Modo Presentación Kiosco para Arquetipos Clínicos: Ocultamiento 100% de Navbars y Fuentes Escaladas a text-6xl',
      categoria: 'Visualización & Kiosco Ejecutivo',
      icon: Maximize2,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      summary: 'Incorporación del Modo Presentación (Modo Directorio) en el Dashboard de Arquetipos Clínicos CIE-10, diseñado específicamente para proyectores en salas de reuniones ejecutivas y presentaciones a corporaciones de salud: oculta el 100% de barras de navegación, escala métricas KPI a text-6xl y expande gráficos con salida por tecla ESC o botón flotante.',
      instructivo: {
        paraQueSirve: 'Optimiza la proyección en vivo de métricas epidemiológicas ante directorios o comités directivos de salud pública, garantizando legibilidad perfecta a distancia.',
        quePuedesVer: 'Al presionar el botón "Modo Presentación" en la cabecera, la pantalla se expande a pantalla completa, desaparecen el Sidebar y Topbar, las cifras KPI escalan a un tamaño gigante (text-6xl) y aparece un botón flotante con el recordatorio "Presiona ESC para salir".',
        ejemploUso: 'Ejemplo: Conectas tu notebook a un proyector en la sala de directorio, abres el módulo de Arquetipos y presionas "Modo Presentación". Toda la sala puede ver con máxima nitidez la pirámide poblacional y las métricas a varios metros de distancia.'
      },
      changes: [
        'Botón Toggle "Modo Presentación": Accionador en la cabecera con icono Maximize2.',
        'Comportamiento Kiosco Fullscreen: Capa fija z-50/z-100 que oculta el Sidebar y Topbar al 100% invocando requestFullscreen().',
        'Escalamiento Tipográfico: Fuentes numéricas de tarjetas KPI escaladas de text-3xl a text-5xl/text-6xl.',
        'Gráficos Expandidos: Altura de pirámide demográfica y anillo previsional incrementada a 480px.',
        'Doble Salida de Seguridad: Botón flotante Minimize2 y listener para la tecla ESC.'
      ]
    },
    {
      id: 'v4.4.0',
      version: 'v4.4.0',
      fecha: '16 de Agosto, 2026',
      badge: 'NUEVO DASHBOARD',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Dashboard de Arquetipos Clínicos CIE-10 & Generación de Reporte Poblacional PDF',
      categoria: 'Epidemiología & Arquetipos',
      icon: Users,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Transformación del módulo Perfil del Paciente en un Dashboard de Arquetipos Poblacionales y Morbilidad CIE-10: Pirámide demográfica (17 tramos quinquenales), Gráfico de anillo previsional, Top 5 dinámico de diagnósticos CIE-10 con badges resaltados y botón "Generar Reporte de Perfil" conectado al motor de exportación PDF.',
      instructivo: {
        paraQueSirve: 'Permite analizar la composición epidemiológica y sociodemográfica de la cohorte de pacientes según su arquetipo etario funcional (Infantil, Adulto Joven, Adulto, Adulto Mayor) y exportar reportes ejecutivos en PDF.',
        quePuedesVer: 'Al ingresar al módulo "Perfil del Paciente", verás el selector de arquetipos, la pirámide poblacional cruzando género vs tramos quinquenales, el gráfico de anillo previsional, los badges de diagnósticos CIE-10 [Código] Descripción - % y el botón "Generar Reporte de Perfil" en la cabecera.',
        ejemploUso: 'Ejemplo: Seleccionas el arquetipo "Infantil (0 - 14 años)" y el sistema recalcula de inmediato el Top 5 CIE-10 mostrando [J00] Rinofaringitis aguda - 34.2%. Presionas "Generar Reporte de Perfil" y obtienes un PDF listo para enviar a las jefaturas sanitarias.'
      },
      changes: [
        'Radiografía Demográfica Macro: Pirámide poblacional interactiva (17 tramos quinquenales) y gráfico Donut de previsión médica.',
        'Mapa de Morbilidad CIE-10: Clasificación estricta por codigo_diagnostico_cie10 con Top 5 dinámico y Badges resaltados [Código] Descripción - %.',
        'Eliminación Total de Ruido: Removida por completo la tabla inferior de listado individual fila por fila.',
        'Componente Exportable <PerfilPoblacionalReporte />: Estilos Print-Friendly conectados al botón "Generar Reporte de Perfil" para exportación directa a PDF.'
      ]
    },
    {
      id: 'v4.3.0',
      version: 'v4.3.0',
      fecha: '16 de Agosto, 2026',
      badge: 'CONSOLIDADO MAESTRO',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Consolidado Continuo de Arquitectura & Especificación Maestra de Matemática, Horarios, Sistema de Diseño y Reportes',
      categoria: 'Arquitectura & Especificación Técnica',
      icon: BookOpen,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Transformación del Informe de Arquitectura en un documento vivo consolidado permanente que agrupa la totalidad de fórmulas matemáticas, algoritmos SSOT, matriz de constatación de lesiones C3 Legal (Z51.8), reglas de encasillamiento de turno (+1h/-1h), manual de identidad visual Glassmorphic y el catálogo oficial de los 6 reportes en PDF.',
      instructivo: {
        paraQueSirve: 'Centraliza en una sola vista maestra toda la especificación cuantitativa, operacional y estética de MÉTRICO, sirviendo como manual técnico oficial para auditorías, entregas formales y control de cambios.',
        quePuedesVer: 'Al ingresar al módulo "Documentación Viva & Arquitectura", verás un selector de 6 pestañas para consultar libremente el Historial de Versiones, el Catálogo de Fórmulas y Algoritmos, la Matriz de Horarios de Turno (Turno Largo 16:00-09:00 hrs), el Manual de Identidad Visual con códigos HEX de triaje y el Catálogo de Reportes.',
        ejemploUso: 'Ejemplo: Accedes al módulo de Arquitectura y seleccionas la pestaña "1. Fórmulas, Algoritmos & Análisis". Podrás revisar y exportar en PDF las ecuaciones exactas de Altas Admin, Promedio de Estadía, Rendimiento Horario y los criterios de detección clínica de Constatación de Lesiones.'
      },
      changes: [
        'Estructura Multi-Pestaña de Especificación Maestra: Organización en 6 módulos de navegación (Historial, Fórmulas, Horarios, Sistema de Diseño, Reportes y Protocolo).',
        'Catálogo Matemático & Procedimientos de Análisis: Estipulación de ecuaciones de Altas Admin %, Estadía Promedio, Velocidad de Atención, Fonasa % y matriz C3 Legal Z51.8.',
        'Encasillamiento Horario Asistencial (+1h/-1h): Registro normativo del Turno Largo de Semana (16:00 a 09:00 AM, 15h efectivas) y turnos de fin de semana.',
        'Manual de Identidad Visual Glassmorphic: Especificación de la paleta "Cristal Pastel", tokens HSL y códigos HEX oficiales por categoría de Triaje C1 a C5.',
        'Catálogo Oficial de 6 Reportes Gerenciales: Definición formal de los entregables en PDF Carta e integración con el protocolo de retroalimentación acumulativa continuada.'
      ]
    },
    {
      id: 'v4.2.0',
      version: 'v4.2.0',
      fecha: '16 de Agosto, 2026',
      badge: 'CIBERSEGURIDAD EMPRESARIAL',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20',
      title: 'Blindaje de Ciberseguridad Nivel Empresarial: Hard-Logout por Inactividad, Firebase App Check, Firestore Rules & Cabeceras HTTP CSP',
      categoria: 'Ciberseguridad & Infraestructura',
      icon: ShieldAlert,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      summary: 'Implementación del plan de ciberseguridad avanzada para MÉTRICO: destrucción total de sesión por inactividad a los 15 min + 60s con vaciado de storages locales y reemplazo forzado de ventana, cortafuegos Firebase App Check con reCAPTCHA v3, reglas estrictas de Firestore, eliminación de Source Maps y cabeceras de seguridad CSP/X-Frame-Options DENY.',
      instructivo: {
        paraQueSirve: 'Protege la infraestructura clínica y la información de pacientes contra ataques cibernéticos, secuestro de sesión por inactividad, ingeniería inversa en el navegador y robo de datos.',
        quePuedesVer: 'Tras 15 minutos sin interacción se desplegará una alerta sonora y visual de 60 segundos. Si no se presiona "Mantener Sesión Activa", la sesión se destruirá por completo enviando al usuario a la pantalla de Login sin opción de rehidratar con F5. En producción, la aplicación opera bajo cabeceras HTTP de máxima seguridad (CSP, X-Frame-Options DENY).',
        ejemploUso: 'Ejemplo: Dejas el equipo desatendido por 15 minutos. El sistema activa el modal de aviso con cuenta regresiva. Al llegar a 0, se vacían de inmediato las credenciales en memoria/storage y se ejecuta un signOut total, impidiendo que cualquier persona acceda al presionar el botón Atrás o F5.'
      },
      changes: [
        'Destrucción de Sesión Estricta (Hard-Logout): Borrado total de localStorage, sessionStorage e IndexedDB con signOut() y reemplazo forzado de ventana.',
        'Cortafuegos Firebase App Check (reCAPTCHA v3): Validación de origen oficial compilado para todas las peticiones a Firestore y Cloud Functions.',
        'Reglas de Seguridad de Firestore (firestore.rules): Cierre global desprotegido permitiendo únicamente acceso a usuarios con correo institucional autorizado.',
        'Supresión Total de Source Maps (vite.config.js): Eliminación de archivos .map en producción para bloquear la ingeniería inversa del código fuente.',
        'Cabeceras HTTP de Alta Seguridad (firebase.json): Configuración de CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff y Referrer-Policy.'
      ]
    },
    {
      id: 'v4.1.2',
      version: 'v4.1.2',
      fecha: '16 de Agosto, 2026',
      badge: 'NUEVA VERSIÓN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Notificación Sonora Nativa (Web Audio API) al Finalizar la Sincronización de Base de Datos y Auto-Sync',
      categoria: 'Sincronización & Audio Feedback',
      icon: Cpu,
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      summary: 'Incorporación de un acorde armónico futurista de 3 fases sintetizado en tiempo real por la Web Audio API al culminar la sincronización de base de datos y recalcular los registros auditados.',
      instructivo: {
        paraQueSirve: 'Proporciona confirmación auditiva inmediata cuando el sistema termina de refrescar la base de datos en vivo, sin necesidad de mirar la pantalla ni descargar archivos de audio.',
        quePuedesVer: 'Al presionar "Re-evaluar Datos" o durante la sincronización inicial, al llegar al 100% de registros procesados se emite una secuencia armónica brillante (C5/G5 -> E5/C6 -> G5/E6) indicando que el panel está listo.',
        ejemploUso: 'Ejemplo: Inicias un refresco manual de la base de datos. Mientras revisas otros documentos, el sistema emite el acorde futurista al llegar a los 25,210 registros auditados, avisándote que la información está 100% al día.'
      },
      changes: [
        'Sintetización Acorde Armónico 3 Fases (C5/G5 -> E5/C6 -> G5/E6): Chime futurista de alta definición para finalización de sincronización.',
        'Chime Suave de Auto-Sync: Tono tenue de doble pulso (F5 -> C6) para sincronizaciones silenciosas periódicas de 5 minutos.',
        'Sincronización con Modal y Toast de Carga: Activación sonora automática al finalizar el progreso de descarga y recálculo.'
      ]
    },
    {
      id: 'v4.1.1',
      version: 'v4.1.1',
      fecha: '16 de Agosto, 2026',
      badge: 'MEJORA AUDIO',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Feedback Auditivo al Limpiar y Marcar Leídas Notificaciones en la Campana',
      categoria: 'Centro de Notificaciones',
      icon: Sparkles,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Integración del timbre de sonido de barrido cristalino en la Web Audio API al presionar "Limpiar" o "Marcar leídas" dentro del Centro de Notificaciones.',
      instructivo: {
        paraQueSirve: 'Confirma de forma sonora la vaciación o marcado de notificaciones en el historial.',
        quePuedesVer: 'Dentro de la campana de notificaciones, al presionar el botón "Limpiar", se emite un barrido armónico ascendente que confirma la purga del historial.',
        ejemploUso: 'Ejemplo: Abres la campana de notificaciones y presionas "Limpiar". El sistema reproduce un timbre cristalino confirmando que el historial ha quedado vacío.'
      },
      changes: [
        'Sonido playClearChime: Barrido armónico cristalino D5 -> A5 -> D6 mediante Web Audio API.',
        'Integración con Botón Limpiar: Ejecución sonora inmediata al vaciar el menú flotante de notificaciones.',
        'Integración con Marcar Leídas: Reproducción de confirmación al presionar "Marcar leídas".'
      ]
    },
    {
      id: 'v4.1.0',
      version: 'v4.1.0',
      fecha: '15 de Agosto, 2026',
      badge: 'INTEGRIDAD SSOT',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Paridad Matemática del 100% y Desduplicación SSOT entre Histórico Mensual y Explorador Global de Urgencias',
      categoria: 'Integridad de Datos & Calendario',
      icon: BarChart2,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Eliminación del descalce entre admisiones brutas (192) y admisiones únicas desduplicadas (116) mediante el motor deduplicarPacientes en el Histórico Mensual y la inyección del dataset maestro completo.',
      instructivo: {
        paraQueSirve: 'Garantiza coincidencia matemática exacta al 100% entre las cifras de turnos del calendario mensual y los indicadores del Explorador Global de Urgencias.',
        quePuedesVer: 'En la cuadrícula del Histórico Mensual, las cifras por día y turno muestran exactamente las mismas admisiones únicas desduplicadas (ej. 116 pac. en Turno 1 del 12/08/2026) que en la vista principal.',
        ejemploUso: 'Ejemplo: Seleccionas el 12 de Agosto en el Histórico Mensual y comparas las admisiones del Turno 1 (17:00 a 08:00 hrs) con el filtro global de Inicio: en ambos módulos figura de forma idéntica 116 pacientes admitidos y 15 altas.'
      },
      changes: [
        'Integración de deduplicarPacientes SSOT en CalendarioHistorico.jsx: Eliminación de doble conteo de reingresos o duplicados en turno.',
        'Pasaje de Universo Maestro allPacientesDB: El módulo Histórico Mensual procesa la totalidad del dataset clínico sin importar el filtro de 2 días de la cabecera.',
        'Soporte Robusto de Formatos de Fecha Locale: Reconocimiento unívoco de formatos ISO (YYYY-MM-DD), Chileno (DD/MM/YYYY) y US locale (MM/DD/YYYY).'
      ]
    },
    {
      id: 'v4.0.0',
      version: 'v4.0.0',
      fecha: '15 de Agosto, 2026',
      badge: 'NUEVA VERSIÓN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Despacho Automático de Cierre Mensual Consolidado (1° de Mes / Día Hábil) + Bitácora Zero-Click DevLog con Tono Pragmático y Capturas Reales',
      categoria: 'Despacho de Informes & Bitácora de Desarrollo',
      icon: Mail,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Incorporación de la regla de despacho automático de cierre mensual el día 1° de cada mes a las 08:30 AM (o primer día hábil) con resumen gerencial de los 6 pilares asistenciales, vinculación directa a los PDF oficiales del módulo Reportes, y actualización del Zero-Click DevLog con tono fluido reflexivo y capturas de pantalla reales en 1080p.',
      instructivo: {
        paraQueSirve: 'Permite configurar el envío automático del consolidado completo del mes recién concluido sin adjuntos pesados, ofreciendo navegación directa hacia la generación de PDF en el módulo Reportes y un muro de novedades técnico-operativo con lenguaje fluido.',
        quePuedesVer: 'En el modal de "Informe por Correo" verás la Sección 5 dedicada al Cierre Mensual Consolidado con el botón "🚀 Probar Envío Mensual Ahora" y enlace directo "📄 Abrir Módulo de Reportes PDF". En la Bitácora de Desarrollo, las publicaciones muestran fotos reales del sistema en alta definición y una narrativa continua que concluye con "Seguimos construyendo."',
        ejemploUso: 'Ejemplo: El día 1 de cada mes a las 08:30 AM el sistema envía automáticamente el informe de cierre del mes anterior a la Jefatura. Al recibir el correo, el usuario puede presionar el enlace institucional para ir directo al módulo Reportes y descargar el PDF Carta certificado.'
      },
      changes: [
        'Despacho Automático de Cierre Mensual (1° del Mes / Día Hábil): Configuración de regla de envío automático del consolidado del mes anterior a las 08:30 AM.',
        'Vinculación Directa con Módulo de Reportes PDF: Botones y enlaces institucionales que redirigen de inmediato a la descarga de informes en PDF carta.',
        'Preservación 100% de Auditoría por Turno: Mantención de los 3 esquemas de turnos cerrados diarios (Semana 17-08h, Finde Día 08-20h y Finde Noche 20-08h).',
        'Narrativa Fluida en Zero-Click DevLog: Redacción pragmática estilo desarrollador sin listas numeradas robóticas ni jerga irrelevante, finalizando siempre con "Seguimos construyendo."',
        'Fotógrafo Autónomo 1080p Real: Captura en tiempo real del motor de producción de MÉTRICO integrada en el bucket y vista del Muro de Novedades.'
      ]
    },
    {
      id: 'v3.4.0',
      version: 'v3.4.0',
      fecha: '14 de Agosto, 2026',
      badge: 'NUEVA VERSIÓN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Asistente Inteligente de Contexto Temporal y Sugerencias de Turnos + Encasillamiento Horario Oficial',
      categoria: 'Filtros Inteligentes & Encasillamiento',
      icon: Cpu,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Incorporación del Asistente Inteligente de Sugerencias de Turnos en la barra global de filtros. Detecta automáticamente si la fecha es día hábil o fin de semana y sugiere las franjas horarias exactas de contabilización (Turno Largo 16:00 a 09:00 AM, Finde Día 08:00 a 20:00 y Finde Noche 20:00 a 08:00 AM), eliminando la sugerencia de día completo.',
      instructivo: {
        paraQueSirve: 'Sugiére de forma dinámica las franjas de turnos clínicos correspondientes a la fecha elegida y actualiza todas las métricas, reportes y análisis específicos con 1 solo clic.',
        quePuedesVer: 'Al ingresar o cambiar una fecha en la cabecera, aparece una barra con botones de sugerencia inteligentes (pills con iconos ☀️ y 🌙). Al presionar cualquiera de las sugerencias, se configuran las horas de inicio y fin exactas de ese turno.',
        ejemploUso: 'Ejemplo: Seleccionas el 11/08/2026 (martes). El asistente te sugiere "Turno Largo Semana (16:00 a 09:00 hrs)". Al presionar el botón, se fija la ventana de 16:00 a 09:00 AM del día siguiente y todas las métricas del sitio se adaptan de inmediato a ese turno.'
      },
      changes: [
        'Detector Dinámico de Día Hábil vs Fin de Semana/Festivo: Generación de sugerencias según el tipo de calendario.',
        'Turno Largo de Semana: Encasillamiento automático de 16:00 hrs a 09:00 AM (+1 día) para capturar la franja operativa completa.',
        'Turnos de Fin de Semana: Finde Día (08:00 a 20:00 hrs) y Finde Noche (20:00 a 08:00 AM +1 día) con contabilización estricta.',
        'Depuración de Sugerencias: Eliminación del filtro de día completo (00:00 a 23:59) de las sugerencias para enfocarse estrictamente en la operación clínica.',
        'Actualización Simultánea de Módulos: Adaptación instantánea de tarjetas KPI, gráficos y subreportes específicos al aplicar una sugerencia.'
      ]
    },
    {
      id: 'v3.3.0',
      version: 'v3.3.0',
      fecha: '14 de Agosto, 2026',
      badge: 'NUEVA VERSIÓN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Audio-Notificaciones Sutiles (Web Audio API) + Centro de Notificaciones con Campana Flotante y Botón Marcar Leídas',
      categoria: 'Experiencia de Usuario & Notificaciones',
      icon: Cpu,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Incorporación de tonos de audio armónicos y sutiles sintetizados con Web Audio API para alertas de éxito y advertencia/descalce, botón de Campana de Notificaciones en la barra superior con contador no leído, menú desplegable con botón "Marcar leídas" y redirección directa al hacer clic.',
      instructivo: {
        paraQueSirve: 'Informa de manera auditiva y visual cuando se completa una sincronización o se detecta una alerta de datos, permitiendo desplegar el historial completo desde la barra superior y navegar directamente al módulo objetivo al hacer clic.',
        quePuedesVer: 'Verás el icono de Campana en la barra superior junto al botón Sincronizar. Al recibir una notificación, escucharás un chime armónico sutil y la campana mostrará un badge rojo con la cantidad no leída. Al presionar el botón "Marcar leídas" o hacer clic en un elemento, la notificación queda como vista y te lleva directamente al módulo correspondiente.',
        ejemploUso: 'Ejemplo: Al ejecutarse la auto-sincronización de 5m o una carga masiva, suena un tono suave. Haces clic en la Campana en la cabecera, ves la lista de alertas, presionas "Marcar leídas" o haces clic en una alerta de descalce para ir directo a Auditoría -> Bitácora de Integridad.'
      },
      changes: [
        'Sintetizador Nivel Audio Nativo (Web Audio API): Tonos armónicos sutiles (chime ascendente para éxito y tono doble para incidencias/errores) sin dependencias mp3.',
        'Centro de Notificaciones con Campana Flotante: Icono de Campana en la barra superior con contador de alertas no leídas.',
        'Botón Marcar como Leídas: Opción para marcar todo el historial como visto con un solo clic.',
        'Navegación Interactiva al Hacer Clic: Al hacer clic en cualquier notificación del desplegable, se marca como leída y redirige al módulo correspondiente.',
        'Persistencia Local de Notificaciones: Guardado de historial reciente en almacenamiento local.'
      ]
    },
    {
      id: 'v3.2.0',
      version: 'v3.2.0',
      fecha: '14 de Agosto, 2026',
      badge: 'NUEVA VERSIÓN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Protocolo de Auto-Sincronización Profunda 5m + Paridad Médica Policial/Judicial (Z04/Carabineros/PDI) + Motor Auditoría de Integridad',
      categoria: 'Integridad de Datos & Sincronización',
      icon: Cpu,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Implementación del Protocolo de Auto-Sincronización Profunda en segundo plano cada 5 minutos, paridad médica ampliada para constataciones médico-legales y custodia policial (Carabineros, PDI, Comisaría, Z04, Z65, Z02.7), botón Sincronizar con re-consulta activa a BigQuery/Firestore y Motor de Detección de Incidencias en la Barra Lateral y Pestaña de Auditoría.',
      instructivo: {
        paraQueSirve: 'Garantiza que todos los paneles, gráficos, reportes ejecutivos y subreportes del sitio (Resumen, Triage con J, Demanda, Profesionales, Constataciones, Altas Admin, Traslados y Radar) se mantengan 100% sincronizados con los datos fidedignos de la nube, alertando automáticamente ante cualquier discrepancia entre BigQuery y la BD.',
        quePuedesVer: 'Verás la hora exacta de la última sincronización en el botón de la cabecera (ej: 18:44 hrs). En la barra lateral izquierda, el nuevo Monitor de Integridad mostrará "Sistema En Línea" en verde si todo coincide, o "ALERTA INTEGRIDAD" en rojo si hay un descalce. En el módulo Auditoría, la nueva sub-pestaña "Bitácora de Integridad" te muestra el desglose comparativo indicador por indicador.',
        ejemploUso: 'Ejemplo: Cada 5 minutos el sistema consulta automáticamente la nube de forma silenciosa. Si un paciente es ingresado y derivado a Carabineros con código Z04.8, el sistema lo categoriza de inmediato en el subreporte de Constataciones y verifica que el contador coincida al 100% entre BigQuery y la BD local.'
      },
      changes: [
        'Protocolo de Auto-Sincronización Profunda cada 5m: Temporizador silencioso en segundo plano que actualiza la base de datos sin interrumpir al usuario.',
        'Botón Sincronizar en Vivo: Re-consulta activa a Firestore y a la Cloud Function de BigQuery (obtenerKpisDashboard), con insignia de hora exacta de última sync.',
        'Paridad Médico-Legal Policial (Z04/Z65/Carabineros/PDI): Detección ampliada de atenciones médico-legales y custodia policial (Carabineros, PDI, Comisaría, Z04, Z65, Z02.7), recuperando +75 registros históricos en 2026.',
        'Motor de Detección de Incidencias en Sidebar: Alerta roja intermitente (ALERTA INTEGRIDAD) en el menú lateral ante cualquier descalce >0.5% entre BigQuery SSOT y la BD.',
        'Sub-Pestaña Bitácora de Integridad en Auditoría: Nueva vista comparativa indicador por indicador (Admitidos, Atendidos, Altas, Traslados, Constataciones y Triage) dentro del módulo de Auditoría.'
      ]
    },
    {
      id: 'v3.1.0',
      version: 'v3.1.0',
      fecha: '12 de Agosto, 2026',
      badge: 'NUEVA VERSIÓN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Arquitectura de Consulta Directa BigQuery SSOT + Selector Chileno DD/MM/YYYY + Encuadre Horario Fino por Turno (America/Santiago)',
      categoria: 'Arquitectura & Precisión SSOT',
      icon: Cpu,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Migración completa del motor de procesamiento a BigQuery en arquitectura SSOT (Single Source of Truth) tipo Tableau/Looker Studio, selector interactivo de fechas en formato chileno DD/MM/YYYY, encuadre horario fino por turno en UTC-4 y paridad matemática del 100% certificada con el sistema oficial Rayen PDF.',
      instructivo: {
        paraQueSirve: 'Garantiza que todas las métricas, KPIs, Curva de Demanda y Comparativa de Equipos muestren una paridad matemática exacta del 100% con los informes oficiales en PDF emitiendo por Rayen, encuadrando automáticamente por huso horario chileno (America/Santiago / UTC-4).',
        quePuedesVer: 'Al seleccionar un turno específico en el filtro de cabecera (por ejemplo 10/08 16:00 a 11/08 08:00), tanto la tarjeta del Periodo Seleccionado como la Curva de Demanda Continua y la Comparativa de Equipos se sincronizan automáticamente para mostrar los 101 pacientes del Turno Largo Noche de Rayen.',
        ejemploUso: 'Ejemplo: Seleccionas 10/08/2026 a las 04:00 PM hasta el 11/08/2026 a las 08:00 AM. El sistema ejecuta la consulta SQL desduplicada en BigQuery, ajusta la estampa de tiempo en UTC-4 y te entrega exactamente 101 pacientes admitidos, 87 atendidos y 14 altas administrativas sin necesidad de descargas pesadas en el navegador.'
      },
      changes: [
        'Arquitectura SSOT Pushdown BigQuery: Migración total de procesamiento de datos masivos a la vista maestra metrico_analytics.v_pacientes_urgencia_master desduplicada en BigQuery, operando como Tableau o Looker Studio.',
        'Selector de Fecha Nativo Chileno DD/MM/YYYY: Implementación del componente de calendario interactivo ChileanDatePicker adaptado al estándar chileno.',
        'Encuadre Horario Fino por Turno (America/Santiago): Ajuste de estampas de tiempo con offset -04:00 permitiendo filtrar cortes horarios exactos por turno (ej: 16:00 a 08:00 hrs).',
        'Sincronización Total de Curva de Demanda: Eliminación de descalces en la Curva de Demanda Continua al vincularla directamente al pipeline de BigQuery SSOT por hora.',
        'Filtrado Dinámico en Comparativa de Equipos: Ajuste por ventana de horas que incluye únicamente las pautas de turno que operaron en el tramo seleccionado.',
        'Paridad Matemática Certificada con Rayen PDF: Verificación de cero descalce frente a reportes físicos oficiales del software clínico Rayen (101 admitidos, 85 completados, 14 altas admin, 14 centros de inscripción).'
      ]
    },
    {
      id: 'v3.0.0',
      version: 'v3.0.0',
      fecha: '09 de Agosto, 2026',
      badge: 'NUEVA VERSIÓN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Motor de Pre-Carga 6 Meses IndexedDB + Barra de Progreso en Vivo + Rediseño Correo + Arquitectura BigQuery SSOT',
      categoria: 'Arquitectura & Rendimiento',
      icon: Cpu,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Implementación del motor de pre-carga local en IndexedDB para los últimos 6 meses de atenciones con barra de progreso flotante en tiempo real, rediseño de correos en cápsulas apiladas idénticas al Dashboard y refactorización total en Google BigQuery.',
      instructivo: {
        paraQueSirve: 'Garantiza una velocidad de respuesta instantánea al abrir la aplicación guardando los últimos 6 meses en caché IndexedDB, mientras permite consultar bajo demanda cualquier rango histórico previo con barra de progreso en vivo.',
        quePuedesVer: 'Al ingresar o sincronizar, verás en la parte inferior derecha la nueva Barra de Progreso Flotante en Tiempo Real. En los informes ejecutivos por correo, las comparativas muestran cápsulas apiladas idénticas al panel "Periodo Seleccionado".',
        ejemploUso: 'Ejemplo: Al abrir el sitio, el motor precarga los últimos 6 meses mostrando el porcentaje (0% a 100%) y volumen descargado. Si cambias el filtro a un periodo histórico de 2025, el indicador te informa el progreso de la consulta en vivo.'
      },
      changes: [
        'Pre-Carga de 6 Meses en IndexedDB: Almacenamiento local de alto rendimiento que elimina demoras de carga inicial.',
        'Barra de Progreso Flotante en Tiempo Real: Indicador de avance con porcentaje (0% a 100%) y volumen de admisiones descargadas.',
        'Rediseño de Correos Ejecutivos Estilo Dashboard: Tarjetas KPI superior y bitácora asistencial con cápsulas apiladas (Vs Mes Ant. y Vs Año Ant.).',
        'Auto-Sincronización de Filtros de Fecha: Ajuste automático del día fin al seleccionar una fecha de inicio para encuadre directo.',
        'Ajuste Asistencial de Triaje: Eliminación de estándares artificiales de 15m en favor de métricas de optimización operacionales reales.',
        'Arquitectura BigQuery (SSOT): Creación de la vista maestra SQL metrico_analytics.v_pacientes_urgencia_master como única fuente de verdad.'
      ]
    },
    {
      id: 'v2.9.5',
      version: 'v2.9.5',
      fecha: '08 de Agosto, 2026',
      badge: 'ACTUALIZACIÓN',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Solución Definitiva de Auditoría Histórica + Formato PDF Hoja Carta de 2 Páginas + CID Logo Inline',
      categoria: 'Despacho & Auditoría',
      icon: Mail,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Desacoplamiento total de la auditoría de turnos frente a los filtros de fecha de la interfaz visual, adjunto automático de PDF Hoja Carta en 2 páginas con subreportes detallados e incrustación CID del logo para evitar el recorte de mensajes en Gmail.',
      instructivo: {
        paraQueSirve: 'Garantiza que los informes por correo siempre reconozcan y envíen el último turno 100% cerrado (retrocediendo automáticamente al día previo si el día actual no ha finalizado) y adjunten el PDF oficial de 2 páginas con todos los indicadores asistenciales.',
        quePuedesVer: 'Al ingresar al modal de configuración de correo, el sistema seleccionará y auditará automáticamente el turno cerrado anterior (ej. 05/08/2026), mostrando todos sus adjuntos físicos (PDF de 2 páginas, CSV y Bitácora).',
        ejemploUso: 'Ejemplo: Si estás viendo el día 06/08 en la pantalla y el turno está incompleto, el motor de auditoría busca en la base de datos completa de 30 días, selecciona el turno del 05/08/2026 y despacha el correo con el informe completo sin recortarse en Gmail.'
      },
      changes: [
        'Desacoplamiento de Filtros UI: La auditoría consulta la base de datos completa de los últimos 30 días sin verse limitada por el rango de fechas seleccionado en la pantalla.',
        'Documento PDF Oficial de 2 Páginas: Página 1 con Banner institucional, Badge de auditoría y matriz KPI; Página 2 con el desglose consolidado de los 5 sub-reportes asistenciales.',
        'Optimización de Logo CID Inline: Reemplazo del Base64 por adjunto CID, reduciendo el HTML a 4KB y evitando el colapso de mensajes en Gmail.',
        'Sanitización de Caracteres en PDF: Implementación de la función cleanPdfText para compilación ultrarrápida sin errores tipográficos.'
      ]
    },
    {
      id: 'v2.9.0',
      version: 'v2.9.0',
      fecha: '08 de Agosto, 2026',
      badge: 'MEJORA',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Sistema Automatizado de Envío de Informes Ejecutivos por Correo + Adjunto PDF Hoja Carta + Auditoría de Turnos',
      categoria: 'Despacho & Auditoría',
      icon: Mail,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Despacho automatizado de informes ejecutivos auditados con adjuntos PDF en Hoja Carta, control estricto de completitud de turnos (semana y fin de semana por equipo), logo institucional del SAR y registro en vivo en el Panel de Auditoría.',
      instructivo: {
        paraQueSirve: 'Sirve para programar y enviar automáticamente los informes de urgencia a las jefaturas y dirección asistencial por correo electrónico en formato PDF y CSV, manteniendo la rotativa oficial de equipos (Equipos 1, 2 y 3) y garantizando que ningún turno se duplique ni se envíe incompleto.',
        quePuedesVer: 'En el menú lateral encontrarás el nuevo botón "Informe por Correo". Al presionar el botón de prueba o guardar la configuración, el sistema genera el informe, adjunta el PDF en Hoja Carta y registra la constancia en el módulo de "Auditoría".',
        ejemploUso: 'Ejemplo: El lunes a las 09:00 AM, el sistema realiza el barrido automático de fin de semana y envía 3 correos y PDFs independientes correspondientes al Viernes Noche, Sábado (Día y Noche) y Domingo (Día y Noche), indicando en cada uno el Equipo de Turno responsable (Equipo 1, 2 o 3).'
      },
      changes: [
        'Despacho de Adjuntos Físicos en PDF (Hoja Carta): Generación nativa en tiempo real del archivo PDF oficial con todos los sub-reportes seleccionados y tabla de KPIs.',
        'Desglose Estricto por Día y Equipo de Turno: Separación en fin de semana y festivos para el Turno Día (08:00 - 20:00) y Turno Noche (20:00 - 08:00) asignados al Equipo correspondiente (Equipos 1, 2 y 3).',
        'Cómputo Inteligente de Tolerancia de Turnos: Conteo de admisiones de semana desde las 16:00 hrs e inclusión de extensión hasta las 09:00 AM para continuidad de cierre.',
        'Prueba Estricta de Completitud (100% Auditado): Verificación automática que descarta turnos parciales (cortados a medianoche) y busca el último turno con datos 100% cerrados.',
        'Incrustación de Identidad Visual SAR Elsa Romo Aravena: Logo oficial del SAR incrustado en la cabecera superior del correo.',
        'Registro en Tiempo Real en el Módulo de Auditoría: Registro de cada envío manual o automático en el panel de auditoría con fecha, hora, turno, destinatarios y lista de adjuntos.'
      ]
    },
    {
      id: 'v2.8.5',
      version: 'v2.8.5',
      fecha: '07 de Agosto, 2026',
      badge: 'ACTUALIZACIÓN',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Módulo Interactivo de Prueba de Control e Integridad de Datos + Tarjetas Desplegables',
      categoria: 'Integridad & Control',
      icon: Sparkles,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Sistema de verificación dinámica de control cuantitativo (SAR Elsa Romo Aravena), tarjetas mensuales con acordeón desplegable y adaptación del vocabulario asistencial a español chileno.',
      instructivo: {
        paraQueSirve: 'Sirve para auditar y certificar que las cifras estadísticas registradas en MÉTRICO coinciden en un 100% matemático exacto con los informes oficiales en PDF/Excel emitidos por la dirección del SAR Elsa Romo Aravena.',
        quePuedesVer: 'En la pestaña "Demanda de Atención", encontrarás el nuevo botón verde "Ejecutar Prueba de Control". Al presionarlo, se abre un modal interactivo donde puedes seleccionar cualquier año/mes, digitar tus cifras oficiales y ver la matriz comparativa en tiempo real.',
        ejemploUso: 'Ejemplo: Para auditar Mayo 2026, abres el modal, seleccionas Mayo 2026, digitas 4.110 Admitidos, 3.676 Completados, 93 Sin Atención y 341 Egreso Admin. El sistema valida automáticamente que 3676 + 93 + 341 = 4110 y marca el mes con el sello verde de "Control SAR Verificado".'
      },
      changes: [
        'Formulario de Prueba de Control en Vivo: Permite ingresar datos de reportes oficiales (Admitidos, Atendidos, Altas sin Atención, Egresos Admin) y ejecutar auditorías de concordancia 100%.',
        'Validación Matemática en Tiempo Real: Comprueba automáticamente que Admitidos == Completados + Sin Atención + Egreso Admin, alertando cualquier incoherencia en los datos.',
        'Certificación de Control SAR: Sello de verificado para Mayo 2026 (4.110 admitidos, 3.676 atendidos y 434 altas administrativas exactos).',
        'Tarjetas Mensuales Desplegables: Rediseño protagónico para Pacientes Admitidos con botón de acordeón para revelar Atendidos y Altas.',
        'Estandarización Vocabulario Asistencial Chileno: Sustitución de la palabra "pico" por Peak Asistencial, Peak de Demanda y Sobrecarga Hospitalaria en todo el sistema.',
        'Solución en Estadísticas de Fractura: Corrección de error de ejecución en comparativas interanuales YoY e inclusión del grupo etario con mayor porcentaje de fracturas.'
      ]
    },
    {
      id: 'v2.8.0',
      version: 'v2.8.0',
      fecha: '05 de Agosto, 2026',
      badge: 'ACTUALIZACIÓN',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Potenciación Cognitiva del Radar Predictivo & Calidad del Aire en Vivo',
      categoria: 'IA & Radar',
      icon: Sparkles,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Integración completa de la IA de Gemini 1.5 Flash, alertas sanitarias MINSAL en tiempo real y calidad de aire diaria por Open-Meteo.',
      instructivo: {
        paraQueSirve: 'Sirve para anticipar sobrecargas hospitalarias cruzando pronóstico del clima a 7 días, índice de calidad del aire AQI y alertas epidemiológicas oficiales del MINSAL.',
        quePuedesVer: 'En la pestaña "Radar Predictivo", verás 7 tarjetas climáticas diarias con temperatura mín/máx, mm de lluvia e índice AQI, además del Agente Administrador IA Gemini que responde consultas clínicas en tiempo real.',
        ejemploUso: 'Ejemplo: Ante un pronóstico de helada (<5°C) seguido de lluvia en Melipilla, el Radar genera una alerta automática recomendando reforzar el triage C1-C3 y aumentar el stock de nebulizaciones y salbutamol para el día viernes.'
      },
      changes: [
        'Agente Epidemiológico IA (Gemini 1.5 Flash): Diagnóstico de sobrecarga asistencial cruzando clima, BigQuery ML y MINSAL.',
        'Rastreador RSS MINSAL Chile: Detección automática de alertas sanitarias oficiales y campañas invernales.',
        'Calidad del Aire Integrada en Vivo: Pronóstico a 7 días con índices AQI y PM2.5/PM10 por día en Melipilla.',
        'Matriz Causa-Efecto de 6 Fuentes: Informe técnico desplegable en modal con acciones preventivas para urgencias.',
        'Análisis de Clima Pasado vs Pacientes: Detección empírica de rebote asistencial post-lluvia (+28.2%) y heladas (<5°C).'
      ]
    },
    {
      id: 'v2.7.5',
      version: 'v2.7.5',
      fecha: '05 de Agosto, 2026',
      badge: 'NUEVA FUNCIONALIDAD',
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/20',
      title: 'Mapa Vectorial Interactivo de la Provincia de Melipilla',
      categoria: 'Geolocalización',
      icon: MapPin,
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      summary: 'Nuevo mapa recortado exclusivamente a la silueta de las 5 comunas provinciales sin elementos geográficos externos.',
      instructivo: {
        paraQueSirve: 'Sirve para visualizar espacialmente de dónde provienen los pacientes atendidos en la urgencia y detectar comunas con mayor presión asistencial.',
        quePuedesVer: 'En la pestaña "Sociodemográfico y Origen", verás el mapa exclusivo recortado con la silueta de Melipilla, María Pinto, Curacaví, San Pedro y Alhué con códigos de color de participación.',
        ejemploUso: 'Ejemplo: Al pasar el cursor sobre la comuna de Melipilla o Bollenar, el mapa despliega un tooltip dinámico mostrando el número exacto de pacientes admitidos y el % del total del mes.'
      },
      changes: [
        'Silueta Vectorial Exclusiva: Visualización limpia de Melipilla, Curacaví, María Pinto, San Pedro y Alhué.',
        'Interactividad Hover & Tooltips: Resaltado cromático individual con conteo de pacientes y porcentaje de participación.',
        'Integración Sociodemográfica: Muestra desglose comunal directo en el panel de origen y perfil de paciente.'
      ]
    },
    {
      id: 'v2.7.0',
      version: 'v2.7.0',
      fecha: '04 de Agosto, 2026',
      badge: 'MEJORA DE PANEL',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20',
      title: 'Rediseño Sociodemográfico y Análisis Demográfico en Inicio',
      categoria: 'Rendimiento Clínico',
      icon: BarChart2,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      summary: 'Retorno del análisis sociodemográfico al panel principal con tarjetas estilizadas y filtros interactivos.',
      instructivo: {
        paraQueSirve: 'Permite caracterizar la población usuaria del SAR según sexo, rango de edad y previsión (FONASA/ISAPRE).',
        quePuedesVer: 'En el Inicio, verás gráficos circulares y de barras con la distribución de usuarios por tramo de edad.',
        ejemploUso: 'Ejemplo: Filtrar por Triage C2 para identificar qué grupo etario demanda atención de mayor complejidad en la urgencia.'
      },
      changes: [
        'Reubicación estratégica de métricas de sexo, grupos etarios y previsión FONASA/ISAPRE.',
        'Filtros dinámicos cruzados por categoría de triage y comunas de la provincia.'
      ]
    },
    {
      id: 'v2.6.5',
      version: 'v2.6.5',
      fecha: '03 de Agosto, 2026',
      badge: 'ESTÁNDAR VISUAL',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20',
      title: 'Isotipo Oficial del SAR & Módulo de Reportes PDF',
      categoria: 'Rendimiento Clínico',
      icon: Layers,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      summary: 'Incorporación del logo institucional del SAR Elsa Romo Aravena en reportes ejecutivos exportables.',
      instructivo: {
        paraQueSirve: 'Generar informes descargables en PDF con membrete institucional para la dirección del servicio y SSMOC.',
        quePuedesVer: 'En la sección "Generador de Reportes Ejecutivos", puedes seleccionar sub-reportes específicos y exportar en PDF.',
        ejemploUso: 'Ejemplo: Exportar el informe mensual de Fracturas o Altas con el logo oficial del SAR listo para presentar en reuniones de gestión.'
      },
      changes: [
        'Encabezado institucional oficial para impresiones y exportación de informes clínicos.',
        'Plantillas adaptables según selección de tipo de reporte específico o consolidado.'
      ]
    },
    {
      id: 'v2.6.0',
      version: 'v2.6.0',
      fecha: '02 de Agosto, 2026',
      badge: 'SEGURIDAD',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20',
      title: 'Control de Inactividad & Auditoría de Registro en Firestore',
      categoria: 'Seguridad',
      icon: Cpu,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      summary: 'Sistema automático de cierre de sesión por inactividad y registro en vivo de navegaciones en Firestore.',
      instructivo: {
        paraQueSirve: 'Garantizar la protección de datos de salud cerrando sesiones inactivas automáticamente.',
        quePuedesVer: 'Un aviso emergente con cuenta regresiva de 60 segundos antes de cerrar sesión tras 15 minutos sin uso.',
        ejemploUso: 'Ejemplo: Si dejas el equipo desatendido en el box médico, el sistema protege los datos cerrando sesión de forma segura.'
      },
      changes: [
        'Modal de advertencia con cuenta regresiva antes del auto-logout por inactividad (15 min).',
        'Audit Log en Firestore para trazabilidad de consultas y modificaciones por usuario.'
      ]
    }
  ];

  const filteredUpdates = selectedCat === 'TODOS' 
    ? updatesList 
    : updatesList.filter(u => u.categoria === selectedCat);

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-card-custom w-full max-w-4xl rounded-3xl border border-card-custom shadow-2xl p-6 md:p-8 space-y-6 theme-transition my-8">
        
        {/* HEADER DEL MURO DE ACTUALIZACIONES */}
        <div className="flex items-start justify-between border-b border-card-custom/60 pb-5">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-xs flex-shrink-0 animate-bounce">
              <Megaphone className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  Histórico de Versiones & Instructivos
                </span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  v3.1.0 (Activa)
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-primary-custom tracking-tight mt-1">
                Muro de Novedades e Instructivos del Sistema MÉTRICO
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-card-custom border border-card-custom hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-secondary-custom cursor-pointer"
            title="Cerrar Muro"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FILTROS POR CATEGORÍA */}
        <div className="flex flex-wrap items-center gap-2 border-b border-card-custom/50 pb-4">
          <span className="text-xs font-bold text-secondary-custom flex items-center gap-1 mr-2">
            <Filter className="w-3.5 h-3.5" /> Filtrar por:
          </span>
          {['TODOS', 'Integridad & Control', 'IA & Radar', 'Geolocalización', 'Rendimiento Clínico', 'Seguridad'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCat === cat 
                  ? 'accent-bg-custom text-white shadow-sm' 
                  : 'bg-black/5 dark:bg-white/5 text-secondary-custom hover:text-primary-custom border border-card-custom'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* LISTADO TIPO TIMELINE / MURO DE NOVEDADES CON INSTRUCTIVO */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredUpdates.map((item) => {
            const IconComp = item.icon;
            return (
              <div 
                key={item.id} 
                className="bg-slate-50/60 dark:bg-slate-900/40 p-5 rounded-2xl border border-card-custom space-y-4 hover:border-indigo-500/40 transition-all shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-card-custom/40 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${item.iconBg}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-primary-custom">{item.version}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="text-sm md:text-base font-black text-primary-custom mt-0.5">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-secondary-custom font-medium self-start sm:self-auto">
                    <Clock className="w-3.5 h-3.5 opacity-70" />
                    <span>{item.fecha}</span>
                  </div>
                </div>

                <p className="text-xs font-medium text-secondary-custom leading-relaxed">
                  {item.summary}
                </p>

                {/* BLOQUE DE INSTRUCTIVO Y GUÍA PRÁCTICA */}
                {item.instructivo && (
                  <div className="bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-300 tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-indigo-500" /> Instructivo & Guía Práctica de Uso:
                    </h4>
                    
                    <div className="space-y-2 text-xs">
                      <div className="bg-card-custom p-3 rounded-xl border border-card-custom/60 space-y-0.5">
                        <span className="font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1 text-[11px]">
                          <BookOpen className="w-3.5 h-3.5" /> ¿Para qué sirve?
                        </span>
                        <p className="text-primary-custom font-medium leading-relaxed">{item.instructivo.paraQueSirve}</p>
                      </div>

                      <div className="bg-card-custom p-3 rounded-xl border border-card-custom/60 space-y-0.5">
                        <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                          <Eye className="w-3.5 h-3.5" /> ¿Qué puedes ver y hacer?
                        </span>
                        <p className="text-primary-custom font-medium leading-relaxed">{item.instructivo.quePuedesVer}</p>
                      </div>

                      <div className="bg-card-custom p-3 rounded-xl border border-card-custom/60 space-y-0.5">
                        <span className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1 text-[11px]">
                          <Lightbulb className="w-3.5 h-3.5" /> Ejemplo Concreto de Uso:
                        </span>
                        <p className="text-primary-custom font-medium leading-relaxed">{item.instructivo.ejemploUso}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* CAMBIOS DETALLADOS */}
                <div className="bg-card-custom p-3.5 rounded-xl border border-card-custom/60 space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-secondary-custom tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Novedades e Implementaciones Destacadas:
                  </h4>
                  <ul className="space-y-1 text-xs text-primary-custom font-semibold list-disc list-inside">
                    {item.changes.map((change, idx) => (
                      <li key={idx} className="leading-snug">
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER MODAL */}
        <div className="pt-4 border-t border-card-custom flex items-center justify-between text-xs text-secondary-custom">
          <span className="font-bold text-[11px]">MÉTRICO Clínico Predictivo • SAR Elsa Romo Aravena</span>
          <button 
            onClick={onClose}
            className="px-5 py-2.5 accent-bg-custom text-white font-black rounded-2xl shadow-md transition-all cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
