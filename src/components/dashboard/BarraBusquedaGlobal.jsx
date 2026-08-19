import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, X, Command, Activity, Users, FileSpreadsheet, BarChart2, Shield, Calendar, 
  Database, UserCheck, ShieldAlert, ArrowLeftRight, Clock, Award, BookOpen, Terminal,
  ExternalLink, Sparkles, ChevronRight, Hash, Eye
} from 'lucide-react';
import { formatTime } from '../../utils/helpers';

export default function BarraBusquedaGlobal({
  sidebarCollapsed,
  setActiveTab,
  setSubTabEspecifico,
  statsKPI,
  pacientesFiltrados = [],
  turnosFiltrados = [],
  promediosGlobales = null
}) {
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalInputRef = useRef(null);

  // Atajo de teclado global Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsModalOpen(true);
      }
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus al abrir el modal
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        modalInputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isModalOpen]);

  // Índices de búsqueda y cálculo de métricas en tiempo real
  const searchIndex = useMemo(() => {
    const totalPacientes = statsKPI?.admitidos?.current || pacientesFiltrados.length || 0;
    const totalAtendidos = statsKPI?.atendidos?.current || 0;
    const totalAltas = statsKPI?.altasAdmin?.current || pacientesFiltrados.filter(p => p.estado === 'Cancelada').length || 0;
    const altasPct = totalPacientes > 0 ? ((totalAltas / totalPacientes) * 100).toFixed(1) : '0.0';
    const totalTraslados = statsKPI?.traslados?.current || 0;
    const totalConstataciones = statsKPI?.constataciones?.current || 0;
    const pacHora = statsKPI?.pacHora?.current ? Number(statsKPI.pacHora.current).toFixed(1) : '0.0';
    const estadiaMin = statsKPI?.estadia?.current ? Math.round(statsKPI.estadia.current) : 0;
    const esperaMed = promediosGlobales?.avgCatAna ? Math.round(promediosGlobales.avgCatAna) : 0;
    const esperaTriaje = promediosGlobales?.avgAdmCat ? Math.round(promediosGlobales.avgAdmCat) : 0;
    const tiempoBox = promediosGlobales?.avgAnaAlt ? Math.round(promediosGlobales.avgAnaAlt) : 0;

    return [
      {
        id: 'altas',
        title: 'Altas Administrativas',
        category: 'Métricas Críticas',
        keywords: ['alta', 'altas', 'administrativa', 'cancelada', 'cancelaciones', 'desercion', 'deserción', 'fuga'],
        icon: UserCheck,
        color: 'text-rose-600 bg-rose-100 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800',
        liveKPI: `${totalAltas.toLocaleString()} pac (${altasPct}% del total)`,
        description: 'Pacientes que cancelaron atención tras categorización sin informe médico.',
        action: () => {
          setActiveTab('altas');
          if (setSubTabEspecifico) setSubTabEspecifico('altas');
          setIsModalOpen(false);
        }
      },
      {
        id: 'traslados',
        title: 'Traslados Hospitalarios',
        category: 'Derivaciones',
        keywords: ['traslado', 'traslados', 'derivacion', 'derivación', 'hospital', 'san jose', 'ambulancia', 'derivados'],
        icon: ArrowLeftRight,
        color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800',
        liveKPI: `${totalTraslados.toLocaleString()} traslados registrados`,
        description: 'Derivaciones de urgencia a centros hospitalarios de mayor complejidad.',
        action: () => {
          setActiveTab('traslados');
          if (setSubTabEspecifico) setSubTabEspecifico('traslados');
          setIsModalOpen(false);
        }
      },
      {
        id: 'admitidos',
        title: 'Pacientes Admitidos (Volumen Global)',
        category: 'Volumen Asistencial',
        keywords: ['admitidos', 'admision', 'admisión', 'ingresos', 'volumen', 'total pacientes', 'pacientes'],
        icon: Users,
        color: 'text-blue-600 bg-blue-100 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800',
        liveKPI: `${totalPacientes.toLocaleString()} admitidos (${pacHora} pac/h)`,
        description: 'Total de admisiones ingresadas en el período seleccionado.',
        action: () => {
          setActiveTab('resumen');
          setIsModalOpen(false);
        }
      },
      {
        id: 'atendidos',
        title: 'Pacientes Atendidos Clínicamente',
        category: 'Volumen Asistencial',
        keywords: ['atendidos', 'atencion', 'atención', 'consultas', 'efectivas', 'clinicas'],
        icon: Activity,
        color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800',
        liveKPI: `${totalAtendidos.toLocaleString()} atendidos`,
        description: 'Atenciones médicas efectivas (excluye altas administrativas).',
        action: () => {
          setActiveTab('resumen');
          setIsModalOpen(false);
        }
      },
      {
        id: 'tiempos',
        title: 'Tiempos de Atención & Espera',
        category: 'Flujo Asistencial',
        keywords: ['tiempo', 'tiempos', 'espera', 'estadia', 'estadía', 'box', 'anamnesis', 'triaje espera', 'demora', 'minutos'],
        icon: Clock,
        color: 'text-purple-600 bg-purple-100 dark:bg-purple-950/50 border-purple-300 dark:border-purple-800',
        liveKPI: `Estadía: ${formatTime(estadiaMin)} | Médico: ${formatTime(esperaMed)} | Box: ${formatTime(tiempoBox)}`,
        description: 'Evolución de tiempos de espera en triaje, llamado a box y permanencia total.',
        action: () => {
          setActiveTab('resumen');
          setIsModalOpen(false);
        }
      },
      {
        id: 'triaje',
        title: 'Categorización de Triaje (C1 a C5)',
        category: 'Flujo Clínico',
        keywords: ['c1', 'c2', 'c3', 'c4', 'c5', 'triaje', 'triage', 'categorizacion', 'categorización', 'gravedad', 'urgencia'],
        icon: Sparkles,
        color: 'text-amber-600 bg-amber-100 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800',
        liveKPI: 'Monitoreo de severidad y distribución horaria',
        description: 'Radar predictivo y distribución de pacientes por índice de gravedad C1-C5.',
        action: () => {
          setActiveTab('radar');
          setIsModalOpen(false);
        }
      },
      {
        id: 'fracturas',
        title: 'Estadísticas de Fractura (CIE-10)',
        category: 'Análisis Específicos',
        keywords: ['fractura', 'fracturas', 'hueso', 'cie-10', 's02', 's92', 'trauma', 'traumatismo', 'lesion osea'],
        icon: Activity,
        color: 'text-rose-600 bg-rose-100 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800',
        liveKPI: 'Epidemiología ósea de lesiones traumáticas',
        description: 'Detección automática de códigos CIE-10 S02 a S92.',
        action: () => {
          setActiveTab('fracturas');
          if (setSubTabEspecifico) setSubTabEspecifico('fracturas');
          setIsModalOpen(false);
        }
      },
      {
        id: 'constataciones',
        title: 'Constatación de Lesiones (Z51.8 / Z04)',
        category: 'Análisis Específicos',
        keywords: ['constatacion', 'constatación', 'lesion', 'lesiones', 'z51.8', 'z518', 'z04', 'carabineros', 'clinico legal', 'alcoholemia'],
        icon: ShieldAlert,
        color: 'text-amber-600 bg-amber-100 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800',
        liveKPI: `${totalConstataciones.toLocaleString()} constataciones registradas`,
        description: 'Atenciones clínico-legales requeridas por policías y tribunales.',
        action: () => {
          setActiveTab('constataciones');
          if (setSubTabEspecifico) setSubTabEspecifico('constataciones');
          setIsModalOpen(false);
        }
      },
      {
        id: 'demanda',
        title: 'Curva y Análisis de Demanda Horaria',
        category: 'Comportamiento Operativo',
        keywords: ['demanda', 'curva', 'horas peak', 'horario', 'afluencia', 'admisiones por hora', 'horas'],
        icon: BarChart2,
        color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800',
        liveKPI: 'Patrón horario de admisiones y afluencia',
        description: 'Análisis de horas pico y distribución por tramos horarios.',
        action: () => {
          setActiveTab('demanda');
          if (setSubTabEspecifico) setSubTabEspecifico('demanda');
          setIsModalOpen(false);
        }
      },
      {
        id: 'profesionales',
        title: 'Rendimiento Clínico & Productividad Médica',
        category: 'Cuerpo Médico',
        keywords: ['medico', 'médico', 'medicos', 'médicos', 'doctor', 'doctores', 'profesional', 'profesionales', 'rendimiento clinico', 'receta', 'recetas', 'productividad'],
        icon: Award,
        color: 'text-amber-600 bg-amber-100 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800',
        liveKPI: 'Auditoría de atenciones médicas y ranking',
        description: 'Evaluación de médicos, pacientes por hora y prescripción.',
        action: () => {
          setActiveTab('profesionales');
          setIsModalOpen(false);
        }
      },
      {
        id: 'enfermeria',
        title: 'Rendimiento Enfermería & Triaje',
        category: 'Equipo Clínico',
        keywords: ['enfermeria', 'enfermería', 'enfermeros', 'enfermeras', 'triage enfermeria', 'categorizadores'],
        icon: Activity,
        color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800',
        liveKPI: 'Velocidad de categorización y triaje',
        description: 'Tiempos de triaje y productividad por enfermero(a).',
        action: () => {
          setActiveTab('enfermeria');
          if (setSubTabEspecifico) setSubTabEspecifico('enfermeria');
          setIsModalOpen(false);
        }
      },
      {
        id: 'reportes',
        title: 'Reporte Ejecutivo & Exportación PDF',
        category: 'Gestión & Informes',
        keywords: ['reporte', 'reportes', 'informe', 'ejecutivo', 'pdf', 'imprimir', 'descargar', 'balance'],
        icon: FileSpreadsheet,
        color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800',
        liveKPI: 'Generador de informes directivos y balance de turno',
        description: 'Resumen consolidado listo para exportación formal e impresión.',
        action: () => {
          setActiveTab('reportes');
          setIsModalOpen(false);
        }
      },
      {
        id: 'pauta',
        title: 'Pauta & Programación de Turnos',
        category: 'Gestión Operativa',
        keywords: ['pauta', 'pautas', 'programacion', 'programación', 'cuadrante', 'rol de turno', 'equipos', 'personal'],
        icon: Calendar,
        color: 'text-sky-600 bg-sky-100 dark:bg-sky-950/50 border-sky-300 dark:border-sky-800',
        liveKPI: 'Cuadrante mensual y asignación de equipos',
        description: 'Planificación de turnos de médicos y enfermería.',
        action: () => {
          setActiveTab('pauta');
          setIsModalOpen(false);
        }
      },
      {
        id: 'data',
        title: 'Gestión de Datos & Carga Masiva',
        category: 'Administración de Datos',
        keywords: ['data', 'datos', 'carga', 'excel', 'subir', 'importar', 'recalcular', 'purga', 'limpieza'],
        icon: Database,
        color: 'text-teal-600 bg-teal-100 dark:bg-teal-950/50 border-teal-300 dark:border-teal-800',
        liveKPI: `${(pacientesFiltrados.length + turnosFiltrados.length).toLocaleString()} registros activos`,
        description: 'Carga de archivos Excel, purgado y recálculo masivo.',
        action: () => {
          setActiveTab('data');
          setIsModalOpen(false);
        }
      },
      {
        id: 'usuarios',
        title: 'Gestión de Usuarios & Matriz de Permisos',
        category: 'Seguridad & Acceso',
        keywords: ['usuario', 'usuarios', 'cuentas', 'permisos', 'credenciales', 'matriz', 'bloquear', 'claves'],
        icon: Users,
        color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800',
        liveKPI: 'Control granular de módulos y credenciales',
        description: 'Administración de cuentas, perfiles y permisos por módulo.',
        action: () => {
          setActiveTab('usuarios');
          setIsModalOpen(false);
        }
      },
      {
        id: 'auditoria',
        title: 'Registro de Auditoría & Trazabilidad',
        category: 'Seguridad & Control',
        keywords: ['auditoria', 'auditoría', 'bitacora', 'bitácora', 'logs', 'seguridad', 'trazabilidad', 'acciones'],
        icon: Shield,
        color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800',
        liveKPI: 'Historial inmutable de operaciones del sistema',
        description: 'Registro de acciones administrativas, altas y modificaciones.',
        action: () => {
          setActiveTab('auditoria');
          setIsModalOpen(false);
        }
      },
      {
        id: 'arquitectura',
        title: 'Informe de Arquitectura & Timeline',
        category: 'Sistema & Desarrollo',
        keywords: ['arquitectura', 'version', 'versión', 'historial', 'timeline', 'tecnico', 'técnico', 'documentacion'],
        icon: BookOpen,
        color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800',
        liveKPI: 'Consolidado maestro y versiones del sistema',
        description: 'Documentación técnica de evolución y catálogo de fórmulas.',
        action: () => {
          setActiveTab('arquitectura');
          setIsModalOpen(false);
        }
      },
      {
        id: 'devlog',
        title: 'DevLog & Bitácora de Desarrollo',
        category: 'Sistema & Desarrollo',
        keywords: ['devlog', 'desarrollo', 'debug', 'consola', 'eventos', 'terminal'],
        icon: Terminal,
        color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800',
        liveKPI: 'Consola técnica en tiempo real',
        description: 'Registro de eventos internos y telemetría de depuración.',
        action: () => {
          setActiveTab('devlog');
          setIsModalOpen(false);
        }
      }
    ];
  }, [statsKPI, pacientesFiltrados, turnosFiltrados, promediosGlobales, setActiveTab, setSubTabEspecifico]);

  // Filtrado de resultados según la búsqueda
  const filteredResults = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return searchIndex;

    return searchIndex.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(cleanQuery);
      const matchDesc = item.description.toLowerCase().includes(cleanQuery);
      const matchCat = item.category.toLowerCase().includes(cleanQuery);
      const matchKey = item.keywords.some(k => k.includes(cleanQuery) || cleanQuery.includes(k));
      return matchTitle || matchDesc || matchCat || matchKey;
    });
  }, [query, searchIndex]);

  // Elemento Command Palette renderizado vía Portal en document.body
  const modalPortal = isModalOpen && typeof document !== 'undefined' ? createPortal(
    <div 
      className="fixed inset-0 z-[99999] bg-slate-950/65 backdrop-blur-md flex items-start justify-center pt-12 md:pt-20 p-4 animate-fade-in"
      onClick={() => setIsModalOpen(false)}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35)] max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh] transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera Superior con Título y Botón de Cierre */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Buscador Global de Métricas & Parámetros
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Navega instantáneamente a cualquier módulo o reporte
              </p>
            </div>
          </div>

          {/* Botón de Cierre Destacado */}
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-500 hover:text-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 dark:hover:bg-rose-600 transition-all font-bold text-xs cursor-pointer shadow-xs active:scale-95 group"
            title="Cerrar buscador (ESC)"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span>Cerrar</span>
          </button>
        </div>

        {/* Campo de Búsqueda Lindo y Luminoso */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={modalInputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar parámetro, métrica o reporte (ej: altas, traslados, tiempos, C3, médicos)..."
              className="w-full pl-11 pr-24 py-3 bg-slate-50 dark:bg-slate-800/80 border border-indigo-500/30 focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none ring-2 ring-indigo-500/10 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-12 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors"
                title="Limpiar texto"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <span className="absolute right-3 text-[10px] font-black text-slate-400 dark:text-slate-500 bg-slate-200/80 dark:bg-slate-700/80 px-2 py-0.5 rounded-md">
              ESC
            </span>
          </div>
        </div>

        {/* Lista de Resultados con Gran Contraste y Estilo Luminoso */}
        <div className="overflow-y-auto custom-scrollbar p-4 space-y-2.5 flex-1 bg-slate-50/50 dark:bg-slate-900/50">
          {filteredResults.length === 0 ? (
            <div className="py-12 px-6 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <Hash className="w-10 h-10 mx-auto mb-3 text-indigo-500 opacity-60" />
              <p className="text-sm font-black text-slate-900 dark:text-white">No se encontraron resultados para "{query}"</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Prueba con: altas, traslados, tiempos, C3, médicos, demanda, usuarios, auditoría...</p>
            </div>
          ) : (
            filteredResults.map(item => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-indigo-50/90 dark:hover:bg-indigo-950/60 border border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-500/50 dark:hover:border-indigo-400/60 cursor-pointer transition-all duration-200 group flex items-center justify-between gap-3 shadow-xs hover:shadow-md hover:scale-[1.008]"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 border ${item.color} group-hover:scale-110 shadow-xs transition-transform`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {item.title}
                        </span>
                        <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5 font-medium">
                        {item.description}
                      </p>
                      {item.liveKPI && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800/80 px-2.5 py-0.5 rounded-lg w-fit shadow-2xs">
                          <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span>{item.liveKPI}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              );
            })
          )}
        </div>

        {/* Pie de búsqueda con Botón de Cierre y Atajos */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-rose-500 hover:text-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors font-bold text-[11px] cursor-pointer"
            >
              Cerrar Búsqueda
            </button>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Haz clic en cualquier opción para ingresar
            </span>
          </div>
          <span className="font-black text-indigo-600 dark:text-indigo-400 text-[10px] tracking-wide uppercase">
            MÉTRICO Omnibar
          </span>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  // Render en Barra Lateral Contraída (Botón Compacto)
  if (sidebarCollapsed) {
    return (
      <>
        <div className="w-full flex justify-center my-1.5">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            title="Buscar en MÉTRICO (Ctrl+K)"
            className="w-10 h-10 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center justify-center transition-all duration-200 cursor-pointer group shadow-xs active:scale-95"
          >
            <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
        {modalPortal}
      </>
    );
  }

  // Render en Barra Lateral Expandida (Caja de Texto Trigger)
  return (
    <>
      <div className="px-3 mb-2">
        <button 
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:border-indigo-500/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all duration-200 text-left cursor-pointer group shadow-xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 truncate">
              Buscar parámetro...
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 shrink-0">
            Ctrl K
          </kbd>
        </button>
      </div>
      {modalPortal}
    </>
  );
}
