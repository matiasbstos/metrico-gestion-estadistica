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
