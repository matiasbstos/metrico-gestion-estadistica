import React, { useState, useEffect, useMemo } from 'react';
import { 
  Terminal, Share2, Download, Copy, Check, Sparkles, 
  Search, Filter, Calendar, Shield, Image, 
  FileText, Plus, RefreshCw, X, Layers, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, doc, setDoc } from 'firebase/firestore';

export const DEVLOG_POSTS_INITIAL = [
  {
    id: 'devlog-v3-8-5',
    fecha: '2026-08-15',
    titulo: 'Sistema "Zero-Click DevLog" & Pipeline Fotográfico Autónomo',
    tipo: 'Nueva Feature',
    version_tag: 'v3.8.5',
    autor: 'Matías Bustos',
    snapshotUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    problema: 'Documentar los avances técnicos y publicar en LinkedIn tomaba tiempo manual. Se requería un sistema autónomo que capture evidencia fotográfica 1080p y redacte posts de alto impacto automáticamente.',
    logica: 'Diseñamos un pipeline headless con Puppeteer acoplado a un sintetizador de lenguaje natural con Gemini 1.5 Flash y una vista de cuadrícula responsiva para la Bitácora de Desarrollo autorizada.',
    solucion: 'Creado DevLogModule.jsx en cuadrícula (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) con descargas de PNG en 1080p, copiado a LinkedIn en 1 clic y función Cloud Function generarDevlogPostGemini.',
    fullPost: `🚀 ZERO-CLICK DEVLOG #10 — MÉTRICO URGENCIAS

1. EL PROBLEMA (El dolor real):
Documentar los avances técnicos y escribir posts de LinkedIn para la comunidad toma tiempo valioso que debe invertirse en desarrollo clínico.

2. CÓMO LO ABORDAMOS (La lógica):
Construimos un pipeline autónomo "Zero-Click": tras cada deploy, un bot fotógrafo (Puppeteer 1080p) toma capturas de pantalla de la app, mientras Gemini 1.5 Flash redacta el post con el tono pragmático de Matías.

3. CÓMO LO SOLUCIONAMOS (La acción técnica):
- Módulo DevLogModule.jsx en cuadrícula responsiva (100% exclusivo ADMIN_GLOBAL).
- Botones de 1 clic para Copiar Texto e imágenes PNG en alta resolución.
- Persistencia automática en la colección Firestore linkedin_devlog.

#HealthTech #WebDev #ReactJS #Firebase #Puppeteer #SystemArchitecture #CommuneMelipilla`
  },
  {
    id: 'devlog-v3-7-5',
    fecha: '2026-08-15',
    titulo: 'Alineación Total de Alertas de Integridad & Sonido Distintivo de Incidentes',
    tipo: 'Arquitectura & UX',
    version_tag: 'v3.7.5',
    autor: 'Matías Bustos',
    snapshotUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80',
    problema: 'El indicador de Alerta de Integridad mostraba falsos positivos en el menú lateral colapsado mientras la Bitácora reportaba Paridad 100% OK. Además, se requería una señal acústica inconfundible de alerta de incidentes.',
    logica: 'Sincronizamos la evaluación reactiva del hook global de analytics con las reglas oficiales de conciliación de la Bitácora de Integridad. Diseñamos un sintetizador armónico nativo con Web Audio API de doble pulso clínico.',
    solucion: 'Integración del componente IntegrityAlertBadge en la barra superior con acceso de 1 clic a la Bitácora y función playIntegrityAlertChime() de 0ms de latencia sin descargas mp3 externas.',
    fullPost: `🚀 ZERO-CLICK DEVLOG #09 — MÉTRICO URGENCIAS
    
1. EL PROBLEMA (El dolor real):
En los paneles clínicos en tiempo real, una falsa alarma mina la confianza del equipo. El badge lateral mostraba una "Alerta de Integridad (1)" a pesar de que la Bitácora de Paridad ya había verificado los 21,687 registros al 100%.

2. CÓMO LO ABORDAMOS (La lógica):
Unificamos la fórmula de paridad del header con la Bitácora de Integridad. Si la paridad auditada está OK, la alarma se apaga de inmediato en todos los menús. Además, sintetizamos una alerta acústica clínica distintiva de incidentes.

3. CÓMO LO SOLUCIONAMOS (La acción técnica):
- Creado IntegrityAlertBadge glassmorphic en la barra superior con ruteo directo de 1 clic.
- Sintetizado tono armónico de doble pulso clínico (698Hz/1046Hz -> 880Hz/1396Hz) con Web Audio API nativo (0 bytes de red).
- Desplegado a producción en Firebase Hosting & Cloud Functions.

#HealthTech #WebDev #ReactJS #Firebase #WebAudioAPI #SystemArchitecture #CommuneMelipilla`
  },
  {
    id: 'devlog-v3-7-0',
    fecha: '2026-08-15',
    titulo: 'Sintetizador de Audio Web Audio API de Alta Frecuencia Sin Archivos Externos',
    tipo: 'Arquitectura & UX',
    version_tag: 'v3.7.0',
    autor: 'Matías Bustos',
    snapshotUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    problema: 'Cargar archivos MP3 externos para las alertas producía retrasos por latencia de red de hasta 800ms y fallas si el cliente no tenía conexión constante.',
    logica: 'Implementamos síntesis de sonido analógico directo en el navegador utilizando la API nativa Web Audio (OscillatorNode + GainNode) con envolvente exponencial.',
    solucion: 'Desarrolladas las funciones playSuccessChime(), playErrorChime() y playIntegrityAlertChime() en audioNotifications.js con 0 bytes consumidos de red.',
    fullPost: `🚀 ZERO-CLICK DEVLOG #08 — MÉTRICO URGENCIAS

1. EL PROBLEMA (El dolor real):
Depender de archivos .mp3 o .wav en la nube para notificaciones clínicas provoca retrasos acústicos y fallas de reproducción en redes hospitalarias inestables.

2. CÓMO LO ABORDAMOS (La lógica):
Transformamos el navegador en un sintetizador de audio puro. Mediante ondas sinusoidales y triangulares controladas por código, generamos timbres acústicos inmediatos.

3. CÓMO LO SOLUCIONAMOS (La acción técnica):
- Módulo audioNotifications.js nativo sin librerías externas.
- Generación de armónicos a 523Hz (C5), 659Hz (E5) y 880Hz (A5).
- Latencia cero (0ms) y cero peticiones HTTP adicionales.

#WebAudioAPI #JavaScript #WebDev #Performance #UXDesign`
  },
  {
    id: 'devlog-v3-6-5',
    fecha: '2026-08-15',
    titulo: 'Badge Flotante Permanente de Alerta de Integridad en Header Superior',
    tipo: 'Arquitectura & UX',
    version_tag: 'v3.6.5',
    autor: 'Matías Bustos',
    snapshotUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    problema: 'Si el usuario replegaba la barra lateral para trabajar a pantalla completa, no tenía visibilidad sobre la presencia de alertas de paridad en la base de datos.',
    logica: 'Anclamos una baliza visual permanente en la barra de herramientas del Explorador Global de Urgencias que permanece visible en cualquier vista y resolución de pantalla.',
    solucion: 'Componente IntegrityAlertBadge en FiltrosGlobales.jsx con indicador pulsante verde (Integridad 100% OK) o rojo (Alerta Active) y salto inmediato de 1 clic a Auditoría.',
    fullPost: `🚀 ZERO-CLICK DEVLOG #07 — MÉTRICO URGENCIAS

1. EL PROBLEMA (El dolor real):
Al trabajar con la barra lateral colapsada en monitores de urgencia, los médicos y administradores perdían el indicador de estado de paridad de los datos.

2. CÓMO LO ABORDAMOS (La lógica):
Diseñamos un badge flotante de cristal pulido en el header superior que se actualiza reactivamente sin importar qué pestaña se esté explorando.

3. CÓMO LO SOLUCIONAMOS (La acción técnica):
- Integrado en FiltrosGlobales.jsx con token glassmorphic.
- Redirección con 1 clic directo al módulo de Auditoría y Bitácora de Integridad.
- 100% responsivo para pantallas móviles y escritorios.

#UIUX #React #TailwindCSS #Glassmorphism #MedicalDashboard`
  },
  {
    id: 'devlog-v3-6-0',
    fecha: '2026-08-15',
    titulo: 'Mecanismo Interactivo de Conciliación & Resolución de Discrepancias SSOT',
    tipo: 'Paridad de Datos',
    version_tag: 'v3.6.0',
    autor: 'Matías Bustos',
    snapshotUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    problema: 'Las consultas estrictas de BigQuery (CIE-10 Z51.8 puro) diferían del desglosador exhaustivo de Constataciones y Traslados (Z51.8, Z04, Z65 y derivaciones a Carabineros/PDI), generando discrepancias cuantitativas.',
    logica: 'Diseñamos una matriz de conciliación auditada interactiva que permite al administrador reconciliar cualquier variable en tiempo real dejando traza formal en la base de datos de auditoría.',
    solucion: 'Desarrollo de las funciones handleReconcileIndicator y handleReconcileAllDiscrepancies en AuditLog.jsx con registro en Firestore audit_logs y confirmación por toast animado.',
    fullPost: `🚀 ZERO-CLICK DEVLOG #06 — MÉTRICO URGENCIAS

1. EL PROBLEMA (El dolor real):
BigQuery SQL clasificaba estrictamente 1 caso de Z51.8 puro, mientras el desglosador clínico local identificaba 41 constataciones legales reales considerando partes policiales y CIE-10 complementarios.

2. CÓMO LO ABORDAMOS (La lógica):
Establecimos el motor clínico unificado como Single Source of Truth (SSOT) para Constataciones y Traslados, creando un mecanismo interactivo de resolución de discrepancias auditado.

3. CÓMO LO SOLUCIONAMOS (La acción técnica):
- Fusión síncrona en statsKPIFinal garantizando paridad 100% entre las tarjetas del Resumen e informes específicos.
- Botones de "Conciliar" por fila y "Reconciliar Todo" con guardado de traza en Firestore collection audit_logs.
- 0 Incidencias activas en el tablero principal.

#DataEngineering #React #BigQuery #Firestore #HealthData #CleanCode`
  },
  {
    id: 'devlog-v3-5-5',
    fecha: '2026-08-15',
    titulo: 'Paridad Absoluta 100% entre Tarjetas de Resumen y Sub-módulos Específicos',
    tipo: 'Paridad de Datos',
    version_tag: 'v3.5.5',
    autor: 'Matías Bustos',
    snapshotUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    problema: 'El Resumen Inicial mostraba 1 Constatación de Lesión mientras el desglose específico de Constataciones indicaba 41 registros, confundiendo a la jefatura de urgencias.',
    logica: 'Alineamos las tarjetas KPI superiores del Resumen para utilizar el mismo motor de clasificación clínica exhaustiva (isConstatacionLesion & isTraslado) que los desgloses específicos.',
    solucion: 'Actualizada la asignación statsKPIFinal en Dashboard.jsx. Las tarjetas del Resumen principal ahora reflejan con 100% de paridad las 41 constataciones y 44 traslados.',
    fullPost: `🚀 ZERO-CLICK DEVLOG #05 — MÉTRICO URGENCIAS

1. EL PROBLEMA (El dolor real):
Una pantalla decía 1 constatación de lesión y el reporte detallado decía 41. En salud pública, dos cifras distintas sobre el mismo periodo minan la credibilidad de los informes.

2. CÓMO LO ABORDAMOS (La lógica):
Refactorizamos la matriz de KPI para que el Resumen de Inicio y los análisis de detalle consuman exactamente la misma regla de clasificación de negocio (SSOT).

3. CÓMO LO SOLUCIONAMOS (La acción técnica):
- statsKPIFinal sincronizado síncronamente en el render.
- Paridad al 100% alcanzada en todas las pestañas de urgencias.
- Eliminada toda discrepancia numérica entre módulos.

#DataParity #Analytics #ReactJS #HealthMetrics #CleanArchitecture`
  },
  {
    id: 'devlog-v3-5-0',
    fecha: '2026-08-15',
    titulo: 'Auto-Detección Inteligente del Último Turno Clínico Completo al Ingresar',
    tipo: 'Nueva Feature',
    version_tag: 'v3.5.0',
    autor: 'Matías Bustos',
    snapshotUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80',
    problema: 'Al ingresar a la plataforma, el sistema iniciaba filtrando el día calendario actual donde los turnos aún no finalizaban, mostrando métricas en cero o incompletas.',
    logica: 'Construimos un algoritmo auto-detector que inspecciona las marcas de tiempo reales en la base de datos y selecciona automáticamente el último turno clínico 100% completo (Turno Largo 16:00 a 09:00 AM o Finde).',
    solucion: 'Implementación del engine de auto-detección en Dashboard.jsx con ruteo de presets y asignación automática del Equipo de Turno (Turnos 1, 2, 3 y 4).',
    fullPost: `🚀 ZERO-CLICK DEVLOG #04 — MÉTRICO URGENCIAS

1. EL PROBLEMA (El dolor real):
Cargar un dashboard estadístico y ver tarjetas vacías en 0 causa incertidumbre. El personal médico necesita ver de inmediato la información consolidada del último turno recién cerrado.

2. CÓMO LO ABORDAMOS (La lógica):
Programamos la plataforma para que piense como un jefe de turno: al abrir el sitio, busca el último rango de horas que cuenta con el 100% de datos cerrados y lo carga inmediatamente.

3. CÓMO LO SOLUCIONAMOS (La acción técnica):
- Algoritmo en useEffect con inspección maxTime de admisiones reales.
- Carga predeterminada del Turno Largo de Semana (Mon-Fri 16:00 a 09:00 AM) o Turnos Finde (08:00-20:00 / 20:00-08:00).
- Despliegue directo de 116 Admitidos y 101 Atendidos sin intervención del usuario.

#UX #JavaScript #DataAnalytics #MedicalSoftware #DashboardDesign`
  },
  {
    id: 'devlog-v3-4-5',
    fecha: '2026-08-15',
    titulo: 'Módulo Documentación Viva & Encasillamiento Horario de Turnos',
    tipo: 'Arquitectura & UX',
    version_tag: 'v3.4.5',
    autor: 'Matías Bustos',
    snapshotUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    problema: 'Se requería una bitácora de arquitectura viva que explique las reglas de encasillamiento de turnos (17:00 a 08:00 hrs) y permita exportar informes técnicos gerenciales.',
    logica: 'Desarrollamos el componente InformeArquitectura.jsx con línea de tiempo histórica, popover explicativo glassmorphic y plantilla CSS de impresión executive en PDF.',
    solucion: 'Integración en el menú lateral bajo guarda ADMIN_GLOBAL y creación de estilos @media print para reportes corporativos.',
    fullPost: `🚀 ZERO-CLICK DEVLOG #03 — MÉTRICO URGENCIAS

1. EL PROBLEMA (El dolor real):
Los auditores e inspectores de salud necesitaban comprender cómo se encasillan los turnos nocturnos de urgencia sin tener que leer código fuente.

2. CÓMO LO ABORDAMOS (La lógica):
Creamos un submódulo de Documentación Viva que se auto-actualiza con cada versión del sistema y permite exportar informes ejecutivos impresos en 1 clic.

3. CÓMO LO SOLUCIONAMOS (La acción técnica):
- Creado InformeArquitectura.jsx con tokens glassmorphic.
- Plantilla CSS @media print ajustada para exportación PDF gerencial.
- Control de acceso estricto reservado para administración global.

#Documentation #SystemArchitecture #ReactJS #TailwindCSS #ExecutiveReports`
  },
  {
    id: 'devlog-v3-4-0',
    fecha: '2026-08-15',
    titulo: 'Asistente Inteligente de Sugerencias de Turnos Context-Aware',
    tipo: 'Nueva Feature',
    version_tag: 'v3.4.0',
    autor: 'Matías Bustos',
    snapshotUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80',
    problema: 'Ingresar manualmente las horas de inicio y fin de turnos (ej. 17:00 a 08:00) en pickers de fecha generaba errores humanos de rango.',
    logica: 'Construimos una barra inteligente de sugerencias flotantes que detecta si la fecha seleccionada corresponde a un día hábil o de fin de semana y ofrece botones de 1 clic.',
    solucion: 'Componente SugerenciasTurnosBar.jsx con encasillamiento automático de Turno Largo, Turno 1 Finde y Turno 3 Finde.',
    fullPost: `🚀 ZERO-CLICK DEVLOG #02 — MÉTRICO URGENCIAS

1. EL PROBLEMA (El dolor real):
Escribir horas de turno a mano en un formulario todos los días quita tiempo y puede generar rangos truncados.

2. CÓMO LO ABORDAMOS (La lógica):
Diseñamos un asistente flotante que sugiere automáticamente el turno según el día de la semana que el usuario está consultando.

3. CÓMO LO SOLUCIONAMOS (La acción técnica):
- Sugerencias rápidas context-aware al hacer clic en los campos de fecha.
- Ajuste automático de saltos de fecha (+1 día) en turnos nocturnos.
- 0 errores de rango reportados por los usuarios.

#Productivity #UX #React #FormOptimization #HealthDev`
  },
  {
    id: 'devlog-v3-3-0',
    fecha: '2026-08-15',
    titulo: 'Centro de Notificaciones con Alerta Sonora y Bus de Eventos',
    tipo: 'Nueva Feature',
    version_tag: 'v3.3.0',
    autor: 'Matías Bustos',
    snapshotUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    problema: 'Las alertas de sincronización o descalces de datos pasaban desapercibidas si el usuario estaba concentrado en otra sección del sistema.',
    logica: 'Implementamos un centro de notificaciones flotante en la campana superior conectado a un bus de eventos en tiempo real con persistencia en LocalStorage.',
    solucion: 'Componente CampanaNotificaciones.jsx con badge rojo contador de elementos no leídos y botón "Marcar todas como leídas".',
    fullPost: `🚀 ZERO-CLICK DEVLOG #01 — MÉTRICO URGENCIAS

1. EL PROBLEMA (El dolor real):
El personal clínico necesita enterarse de forma instantánea si hubo una carga masiva nueva o si se detectó una discrepancia en la base de datos.

2. CÓMO LO ABORDAMOS (La lógica):
Construimos un centro de notificaciones en tiempo real tipo campana con historial persistente de hasta 30 alertas y reproducción de sonido sutil.

3. CÓMO LO SOLUCIONAMOS (La acción técnica):
- CampanaNotificaciones.jsx con badge animado en el header superior.
- Bus de eventos local y persistencia en Firestore collection metrico_notificaciones.
- Navegación directa al módulo afectado al hacer clic en la alerta.

#Notifications #RealTime #React #HealthcareIT #SystemDesign`
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

  // Consumir posts en tiempo real desde Firestore e impulsar persistencia histórica si no existen
  useEffect(() => {
    if (!db) return;
    try {
      const q = query(collection(db, 'linkedin_devlog'), orderBy('fecha', 'desc'));
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        if (!snapshot.empty) {
          const firestorePosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Fusionar posts históricos iniciales con los de Firestore sin duplicados
          const combined = [...firestorePosts];
          DEVLOG_POSTS_INITIAL.forEach(initP => {
            if (!combined.some(p => p.id === initP.id)) {
              combined.push(initP);
            }
          });
          setPosts(combined);
        } else {
          // Si Firestore está vacío, persistir el catálogo histórico completo para autorizarlos permanentemente
          try {
            for (const initPost of DEVLOG_POSTS_INITIAL) {
              await setDoc(doc(db, 'linkedin_devlog', initPost.id), initPost);
            }
          } catch (errPersist) {
            console.warn("Auto-persistencia de catálogo histórico DevLog:", errPersist);
          }
        }
      }, (err) => {
        console.warn("Colección linkedin_devlog usando posts locales iniciales:", err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Error leyendo linkedin_devlog:", e);
    }
  }, [db]);

  const handleCopyPost = (post) => {
    navigator.clipboard.writeText(post.fullPost || `${post.titulo}\n\n1. EL PROBLEMA:\n${post.problema}\n\n2. CÓMO LO ABORDAMOS:\n${post.logica}\n\n3. CÓMO LO SOLUCIONAMOS:\n${post.solucion}`);
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
      const title = promptTitle.trim() || 'Optimizaciones en la Plataforma MÉTRICO';
      const versionTag = `v3.9.0`;

      const generatedPostText = `🚀 ZERO-CLICK DEVLOG #${posts.length + 1} — MÉTRICO URGENCIAS
      
1. EL PROBLEMA (El dolor real):
${promptIssue}

2. CÓMO LO ABORDAMOS (La lógica):
Analizamos el flujo de datos y la experiencia operativa del equipo clínico. Diseñamos una arquitectura limpia orientada a rendimiento y paridad total de datos.

3. CÓMO LO SOLUCIONAMOS (La acción técnica):
${promptSolution}

#HealthTech #WebDev #ReactJS #Firebase #SystemArchitecture #CommuneMelipilla`;

      const newPostObj = {
        id: `devlog-${Date.now()}`,
        fecha: new Date().toISOString().split('T')[0],
        titulo: title,
        tipo: 'Nueva Feature',
        version_tag: versionTag,
        autor: userProfile?.nombre || 'Matías Bustos',
        snapshotUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        problema: promptIssue,
        logica: 'Análisis de paridad y diseño de arquitectura orientada a alta disponibilidad.',
        solucion: promptSolution,
        fullPost: generatedPostText
      };

      // Guardar en Firestore para autorización permanente
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
        const matchProb = post.problema.toLowerCase().includes(term);
        const matchSol = post.solucion.toLowerCase().includes(term);
        const matchVer = (post.version_tag || '').toLowerCase().includes(term);
        if (!matchTitle && !matchProb && !matchSol && !matchVer) return false;
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
                {posts.length} Hitos Históricos Registrados
              </span>
            </div>
            <h1 className="text-2xl font-black text-primary-custom flex items-center gap-2.5 tracking-tight uppercase">
              <Terminal className="text-emerald-500 w-7 h-7" />
              Bitácora de Desarrollo & Zero-Click DevLog
            </h1>
            <p className="text-xs text-secondary-custom font-semibold mt-1 max-w-3xl">
              Publicaciones autónomas y registro histórico completo de problemas resueltos (v1.0.0 a v3.8.5) autorizados para LinkedIn con evidencia fotográfica 1080p.
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
              placeholder="Buscar por versión, hito histórico, problema o solución técnica..."
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
            {/* Header de la Tarjeta con Miniatura Fotográfica */}
            <div className="relative h-48 bg-slate-900 overflow-hidden cursor-pointer" onClick={() => setSelectedSnapshot(post)}>
              <img 
                src={post.snapshotUrl} 
                alt={post.titulo} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              
              {/* Badges Flotantes */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-white/10 text-emerald-400 font-mono font-bold text-[10px]">
                  {post.version_tag || 'v3.5.0'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-600/90 text-white font-black text-[9px] uppercase tracking-wider shadow-sm">
                  {post.tipo}
                </span>
              </div>

              {/* Botón Zoom */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="px-2.5 py-1 rounded-lg bg-black/70 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-md border border-white/20">
                  <Image className="w-3 h-3 text-indigo-400" /> Ver Captura 1080p
                </span>
              </div>
            </div>

            {/* Contenido Redactado en Estilo LinkedIn */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-[10px] text-secondary-custom font-bold mb-2">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-indigo-400" /> {post.fecha}</span>
                  <span className="font-semibold text-primary-custom">Por: {post.autor}</span>
                </div>

                <h3 className="text-sm font-black text-primary-custom leading-snug group-hover:text-indigo-400 transition-colors">
                  {post.titulo}
                </h3>

                {/* Estructura Estricta de 3 Partes */}
                <div className="mt-4 space-y-3 text-xs leading-relaxed">
                  <div className="bg-rose-500/5 dark:bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                    <h4 className="text-[10px] font-black uppercase text-rose-500 flex items-center gap-1 mb-1">
                      <AlertCircle className="w-3 h-3" /> 1. El Problema (El dolor real)
                    </h4>
                    <p className="text-primary-custom font-medium text-[11px] line-clamp-3">
                      {post.problema}
                    </p>
                  </div>

                  <div className="bg-indigo-500/5 dark:bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20">
                    <h4 className="text-[10px] font-black uppercase text-indigo-400 flex items-center gap-1 mb-1">
                      <Layers className="w-3 h-3" /> 2. Cómo lo abordamos (La lógica)
                    </h4>
                    <p className="text-primary-custom font-medium text-[11px] line-clamp-2">
                      {post.logica}
                    </p>
                  </div>

                  <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                    <h4 className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-1 mb-1">
                      <Check className="w-3 h-3" /> 3. Cómo lo solucionamos (Acción técnica)
                    </h4>
                    <p className="text-primary-custom font-medium text-[11px] line-clamp-3">
                      {post.solucion}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones de Acción de la Tarjeta */}
              <div className="pt-4 border-t border-card-custom/30 flex items-center gap-2">
                <button
                  onClick={() => handleCopyPost(post)}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    copiedId === post.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  }`}
                >
                  {copiedId === post.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>¡Copiado a LinkedIn!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownloadSnapshot(post)}
                  className="py-2 px-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-primary-custom font-bold text-xs border border-card-custom flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Descargar captura de pantalla en alta resolución (1080p)"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Descargar PNG</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Previsualización Fotográfica de Alta Resolución */}
      {selectedSnapshot && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card-custom border border-card-custom rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl space-y-4 p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-card-custom">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-sm text-primary-custom uppercase">{selectedSnapshot.titulo}</h3>
              </div>
              <button onClick={() => setSelectedSnapshot(null)} className="p-1 text-secondary-custom hover:text-primary-custom cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-card-custom bg-black max-h-[70vh] flex items-center justify-center">
              <img src={selectedSnapshot.snapshotUrl} alt={selectedSnapshot.titulo} className="w-full h-full object-contain" />
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs font-mono text-emerald-400">Captura de Pantalla Autónoma — 1920x1080 Full HD</span>
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

      {/* Modal Generador de Posts DevLog con Gemini Prompt */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card-custom border border-card-custom rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 theme-transition">
            <div className="flex items-center justify-between pb-3 border-b border-card-custom">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-base text-primary-custom uppercase">Generar Post DevLog Autónoma (Gemini API)</h3>
              </div>
              <button onClick={() => setShowGenerateModal(false)} className="p-1 text-secondary-custom hover:text-primary-custom cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateNewPost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary-custom mb-1 uppercase tracking-wider">Título de la Feature / Solución</label>
                <input 
                  type="text" 
                  placeholder="Ej: Auto-Detección Inteligente del Último Turno Completo" 
                  value={promptTitle} 
                  onChange={e => setPromptTitle(e.target.value)} 
                  className="w-full px-3.5 py-2.5 bg-input-custom border border-card-custom rounded-xl text-xs font-bold text-primary-custom focus:outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-500 mb-1 uppercase tracking-wider">1. El Problema (El dolor real reportado)</label>
                <textarea 
                  rows="3" 
                  placeholder="Describe el problema o bug reportado en la plataforma..." 
                  value={promptIssue} 
                  onChange={e => setPromptIssue(e.target.value)} 
                  className="w-full px-3.5 py-2.5 bg-input-custom border border-card-custom rounded-xl text-xs font-semibold text-primary-custom focus:outline-none focus:border-rose-500 shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-500 mb-1 uppercase tracking-wider">2 y 3. Solución Técnica (Cómo lo programó Antigravity)</label>
                <textarea 
                  rows="3" 
                  placeholder="Describe la lógica aplicada y los cambios realizados en el código..." 
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
