import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef(null);
  const modalInputRef = useRef(null);
  const containerRef = useRef(null);

  // Atajo de teclado global Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (sidebarCollapsed) {
          setIsModalOpen(true);
          setTimeout(() => modalInputRef.current?.focus(), 50);
        } else {
          setIsOpen(true);
          inputRef.current?.focus();
        }
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed]);

  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        category: 'Métricas Críticas & Específicos',
        keywords: ['alta', 'altas', 'administrativa', 'cancelada', 'cancelaciones', 'desercion', 'deserción', 'fuga'],
        icon: UserCheck,
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        liveKPI: `${totalAltas.toLocaleString()} pac (${altasPct}% del total)`,
        description: 'Pacientes que cancelaron atención tras categorización sin informe médico.',
        action: () => {
          setActiveTab('altas');
          if (setSubTabEspecifico) setSubTabEspecifico('altas');
          setIsOpen(false);
          setIsModalOpen(false);
        }
      },
      {
        id: 'traslados',
        title: 'Traslados Hospitalarios',
        category: 'Derivaciones de Red',
        keywords: ['traslado', 'traslados', 'derivacion', 'derivación', 'hospital', 'san jose', 'ambulancia', 'derivados'],
        icon: ArrowLeftRight,
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
        liveKPI: `${totalTraslados.toLocaleString()} traslados registrados`,
        description: 'Derivaciones de urgencia a centros hospitalarios de mayor complejidad.',
        action: () => {
          setActiveTab('traslados');
          if (setSubTabEspecifico) setSubTabEspecifico('traslados');
          setIsOpen(false);
          setIsModalOpen(false);
        }
      },
      {
        id: 'admitidos',
        title: 'Pacientes Admitidos (Volumen Global)',
        category: 'Volumen Asistencial',
        keywords: ['admitidos', 'admision', 'admisión', 'ingresos', 'volumen', 'total pacientes', 'pacientes'],
        icon: Users,
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        liveKPI: `${totalPacientes.toLocaleString()} admitidos (${pacHora} pac/h)`,
        description: 'Total de admisiones ingresadas en el período seleccionado.',
        action: () => {
          setActiveTab('resumen');
          setIsOpen(false);
          setIsModalOpen(false);
        }
      },
      {
        id: 'atendidos',
        title: 'Pacientes Atendidos Clínicamente',
        category: 'Volumen Asistencial',
        keywords: ['atendidos', 'atencion', 'atención', 'consultas', 'efectivas', 'clinicas'],
        icon: Activity,
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        liveKPI: `${totalAtendidos.toLocaleString()} atendidos`,
        description: 'Atenciones médicas efectivas (excluye altas administrativas).',
        action: () => {
          setActiveTab('resumen');
          setIsOpen(false);
          setIsModalOpen(false);
        }
      },
      {
        id: 'tiempos',
        title: 'Tiempos de Atención & Espera',
        category: 'Flujo Asistencial',
        keywords: ['tiempo', 'tiempos', 'espera', 'estadia', 'estadía', 'box', 'anamnesis', 'triaje espera', 'demora', 'minutos'],
        icon: Clock,
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        liveKPI: `Estadía: ${formatTime(estadiaMin)} | Médico: ${formatTime(esperaMed)} | Box: ${formatTime(tiempoBox)}`,
        description: 'Evolución de tiempos de espera en triaje, llamado a box y permanencia total.',
        action: () => {
          setActiveTab('resumen');
          setIsOpen(false);
          setIsModalOpen(false);
        }
      },
      {
        id: 'triaje',
        title: 'Categorización de Triaje (C1 a C5)',
        category: 'Flujo Clínico',
        keywords: ['c1', 'c2', 'c3', 'c4', 'c5', 'triaje', 'triage', 'categorizacion', 'categorización', 'gravedad', 'urgencia'],
        icon: Sparkles,
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        liveKPI: 'Monitoreo de severidad y distribución horaria',
        description: 'Radar predictivo y distribución de pacientes por índice de gravedad C1-C5.',
        action: () => {
          setActiveTab('radar');
          setIsOpen(false);
          setIsModalOpen(false);
        }
      },
      {
        id: 'fracturas',
        title: 'Estadísticas de Fractura (CIE-10)',
        category: 'Análisis Específicos',
        keywords: ['fractura', 'fracturas', 'hueso', 'cie-10', 's02', 's92', 'trauma', 'traumatismo', 'lesion osea'],
        icon: Activity,
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        liveKPI: 'Epidemiología ósea de lesiones traumáticas',
        description: 'Detección automática de códigos CIE-10 S02 a S92.',
        action: () => {
          setActiveTab('fracturas');
          if (setSubTabEspecifico) setSubTabEspecifico('fracturas');
          setIsOpen(false);
          setIsModalOpen(false);
        }
      },
      {
        id: 'constataciones',
        title: 'Constatación de Lesiones (Z51.8 / Z04)',
        category: 'Análisis Específicos',
        keywords: ['constatacion', 'constatación', 'lesion', 'lesiones', 'z51.8', 'z518', 'z04', 'carabineros', 'clinico legal', 'alcoholemia'],
        icon: ShieldAlert,
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        liveKPI: `${totalConstataciones.toLocaleString()} constataciones registradas`,
        description: 'Atenciones clínico-legales requeridas por policías y tribunales.',
        action: () => {
          setActiveTab('constataciones');
          if (setSubTabEspecifico) setSubTabEspecifico('constataciones');
          setIsOpen(false);
          setIsModalOpen(false);
        }
      },
      {
        id: 'demanda',
        title: 'Curva y Análisis de Demanda Horaria',
        category: 'Comportamiento Operativo',
        keywords: ['demanda', 'curva', 'horas peak', 'horario', 'afluencia', 'admisiones por hora', 'horas'],
        icon: BarChart2,
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
        liveKPI: 'Patrón horario de admisiones y afluencia',
        description: 'Análisis de horas pico y distribución por tramos horarios.',
        action: () => {
          setActiveTab('demanda');
          if (setSubTabEspecifico) setSubTabEspecifico('demanda');
          setIsOpen(false);
          setIsModalOpen(false);
        }
      },
      {
        id: 'profesionales',
        title: 'Rendimiento Clínico & Productividad Médica',
        category: 'Cuerpo Médico',
        keywords: ['medico', 'médico', 'medicos', 'médicos', 'doctor', 'doctores', 'profesional', 'profesionales', 'rendimiento clinico', 'receta', 'recetas', 'productividad'],
        icon: Award,
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        liveKPI: 'Auditoría de atenciones médicas y ranking',
        description: 'Evaluación de médicos, pacientes por hora y prescripción.',
        action: () => {
          setActiveTab('profesionales');
          setIsOpen(false);
          setIsModalOpen(false);
        }
      },
      {
        id: 'enfermeria',
        title: 'Rendimiento Enfermería & Triaje',
        category: 'Equipo Clínico',
        keywords: ['enfermeria', 'enfermería', 'enfermeros', 'enfermeras', 'triage enfermeria', 'categorizadores'],
        icon: Activity,
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
        liveKPI: 'Velocidad de categorización y triaje',
        description: 'Tiempos de triaje y productividad por enfermero(a).',
        action: () => {
          setActiveTab('enfermeria');
          if (setSubTabEspecifico) setSubTabEspecifico('enfermeria');
          setIsOpen(false);
          setIsModalOpen(false);
        }
      },
      {
        id: 'reportes',
        title: 'Reporte Ejecutivo & Exportación PDF',
        category: 'Gestión & Informes',
        keywords: ['reporte', 'reportes', 'informe', 'ejecutivo', 'pdf', 'imprimir', 'descargar', 'balance'],
        icon: FileSpreadsheet,
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        liveKPI: 'Generador de informes directivos y balance de turno',
        description: 'Resumen consolidado listo para exportación formal e impresión.',
        action: () => {
          setActiveTab('reportes');
          setIsOpen(false);
          setIsModalOpen(false);
        }
      },
      {
        id: 'pauta',
        title: 'Pauta & Programación de Turnos',
        category: 'Gestión Operativa',
        keywords: ['pauta', 'pautas', 'programacion', 'programación', 'cuadrante', 'rol de turno', 'equipos', 'personal'],
        icon: Calendar,
        color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
        liveKPI: 'Cuadrante mensual y asignación de equipos',
        description: 'Planificación de turnos de médicos y enfermería.',
        action: () => {
          setActiveTab('pauta');
          setIsOpen(false);
          setIsModalOpen(false);
        }
      },
      {
        id: 'data',
        title: 'Gestión de Datos & Carga Masiva',
        category: 'Administración de Datos',
        keywords: ['data', 'datos', 'carga', 'excel', 'subir', 'importar', 'recalcular', 'purga', 'limpieza'],
        icon: Database,
        color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
        liveKPI: `${(pacientesFiltrados.length + turnosFiltrados.length).toLocaleString()} registros activos`,
        description: 'Carga de archivos Excel, purgado y recálculo masivo.',
        action: () => {
          setActiveTab('data');
          setIsOpen(false);
          setIsModalOpen(false);
        }
      },
      {
        id: 'usuarios',
        title: 'Gestión de Usuarios & Matriz de Permisos',
        category: 'Seguridad & Acceso',
        keywords: ['usuario', 'usuarios', 'cuentas', 'permisos', 'credenciales', 'matriz', 'bloquear', 'claves'],
        icon: Users,
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
        liveKPI: 'Control granular de módulos y credenciales',
        description: 'Administración de cuentas, perfiles y permisos por módulo.',
        action: () => {
          setActiveTab('usuarios');
          setIsOpen(false);
          setIsModalOpen(false);
        }
      },
      {
        id: 'auditoria',
        title: 'Registro de Auditoría & Trazabilidad',
        category: 'Seguridad & Control',
        keywords: ['auditoria', 'auditoría', 'bitacora', 'bitácora', 'logs', 'seguridad', 'trazabilidad', 'acciones'],
        icon: Shield,
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
        liveKPI: 'Historial inmutable de operaciones del sistema',
        description: 'Registro de acciones administrativas, altas y modificaciones.',
        action: () => {
          setActiveTab('auditoria');
          setIsOpen(false);
          setIsModalOpen(false);
        }
      },
      {
        id: 'arquitectura',
        title: 'Informe de Arquitectura & Timeline',
        category: 'Sistema & Desarrollo',
        keywords: ['arquitectura', 'version', 'versión', 'historial', 'timeline', 'tecnico', 'técnico', 'documentacion'],
        icon: BookOpen,
        color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        liveKPI: 'Consolidado maestro y versiones del sistema',
        description: 'Documentación técnica de evolución y catálogo de fórmulas.',
        action: () => {
          setActiveTab('arquitectura');
          setIsOpen(false);
          setIsModalOpen(false);
        }
      },
      {
        id: 'devlog',
        title: 'DevLog & Bitácora de Desarrollo',
        category: 'Sistema & Desarrollo',
        keywords: ['devlog', 'desarrollo', 'debug', 'consola', 'eventos', 'terminal'],
        icon: Terminal,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        liveKPI: 'Consola técnica en tiempo real',
        description: 'Registro de eventos internos y telemetría de depuración.',
        action: () => {
          setActiveTab('devlog');
          setIsOpen(false);
          setIsModalOpen(false);
        }
      }
    ];
  }, [statsKPI, pacientesFiltrados, turnosFiltrados, promediosGlobales, setActiveTab, setSubTabEspecifico]);

  // Filtrado de resultados según la búsqueda
  const filteredResults = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return searchIndex.slice(0, 8); // Sugerencias iniciales

    return searchIndex.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(cleanQuery);
      const matchDesc = item.description.toLowerCase().includes(cleanQuery);
      const matchCat = item.category.toLowerCase().includes(cleanQuery);
      const matchKey = item.keywords.some(k => k.includes(cleanQuery) || cleanQuery.includes(k));
      return matchTitle || matchDesc || matchCat || matchKey;
    });
  }, [query, searchIndex]);

  // Renderizado del contenido de resultados
  const renderResultsList = () => (
    <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-2 space-y-1.5">
      {filteredResults.length === 0 ? (
        <div className="p-6 text-center text-secondary-custom">
          <Hash className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-500" />
          <p className="text-xs font-bold text-primary-custom">No se encontraron resultados</p>
          <p className="text-[10px] text-secondary-custom mt-0.5">Intenta buscando: altas, traslados, tiempos, C3, demanda, médicos...</p>
        </div>
      ) : (
        filteredResults.map(item => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              onClick={item.action}
              className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/15 border border-transparent hover:border-indigo-500/30 cursor-pointer transition-all duration-200 group flex items-center justify-between gap-3"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className={`p-2 rounded-lg shrink-0 border ${item.color} group-hover:scale-105 transition-transform`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-primary-custom group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {item.title}
                    </span>
                    <span className="text-[9px] font-bold text-secondary-custom bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-secondary-custom line-clamp-1 mt-0.5 font-medium">
                    {item.description}
                  </p>
                  {item.liveKPI && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/20 px-2 py-0.5 rounded-md w-fit">
                      <Sparkles className="w-3 h-3 shrink-0" />
                      <span>{item.liveKPI}</span>
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-secondary-custom group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          );
        })
      )}
    </div>
  );

  // CASO 1: BARRA LATERAL CONTRAÍDA (Botón Compacto + Modal Flotante)
  if (sidebarCollapsed) {
    return (
      <div className="w-full flex justify-center my-2">
        <button
          onClick={() => {
            setIsModalOpen(true);
            setTimeout(() => modalInputRef.current?.focus(), 50);
          }}
          title="Buscar en MÉTRICO (Ctrl+K)"
          className="w-10 h-10 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 border border-indigo-500/20 flex items-center justify-center transition-all duration-200 cursor-pointer group shadow-sm active:scale-95"
        >
          <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>

        {/* MODAL / COMMAND PALETTE FLOTANTE AL ESTAR CONTRAÍDO */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <div 
              className="bg-card-custom border border-card-custom rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden theme-transition animate-fade-in"
              onClick={e => e.stopPropagation()}
            >
              {/* Cabecera de búsqueda del Modal */}
              <div className="p-4 border-b border-card-custom/30 flex items-center gap-3 bg-black/5 dark:bg-white/5">
                <Search className="w-5 h-5 text-indigo-500 shrink-0" />
                <input
                  ref={modalInputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar parámetro, métrica o reporte (ej: altas, traslados, tiempos, C3)..."
                  className="w-full bg-transparent text-xs font-bold text-primary-custom focus:outline-none placeholder:text-secondary-custom/60"
                />
                {query && (
                  <button 
                    onClick={() => setQuery('')}
                    className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-md text-secondary-custom cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <span className="text-[10px] font-black text-secondary-custom bg-black/10 dark:bg-white/10 px-2 py-1 rounded-lg shrink-0">
                  ESC para cerrar
                </span>
              </div>

              {/* Lista de Resultados */}
              {renderResultsList()}

              {/* Pie de búsqueda */}
              <div className="p-3 border-t border-card-custom/30 bg-black/5 dark:bg-white/5 text-[10px] text-secondary-custom font-semibold flex items-center justify-between">
                <span>Navega y presiona clic para ingresar al módulo seleccionado</span>
                <span className="font-bold text-indigo-500">MÉTRICO Omnibar</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // CASO 2: BARRA LATERAL EXPANDIDA (Input Integrado con Dropdown Inteligente)
  return (
    <div ref={containerRef} className="px-3 mb-3 relative">
      <div 
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 cursor-text ${
          isOpen 
            ? 'bg-card-custom border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20' 
            : 'bg-black/5 dark:bg-white/5 border-card-custom/60 hover:border-card-custom'
        }`}
      >
        <Search className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Buscar métrica o reporte..."
          className="w-full bg-transparent text-xs font-bold text-primary-custom focus:outline-none placeholder:text-secondary-custom/60"
        />
        {query ? (
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setQuery('');
            }}
            className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded text-secondary-custom cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-black text-secondary-custom/70 bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded border border-card-custom/40">
            Ctrl K
          </kbd>
        )}
      </div>

      {/* DROPDOWN FLOTANTE AL ESCRIBIR EN LA BARRA LATERAL */}
      {isOpen && (
        <div className="absolute left-3 right-3 top-full mt-2 z-50 bg-card-custom border border-card-custom rounded-2xl shadow-2xl overflow-hidden theme-transition animate-fade-in">
          <div className="p-2 border-b border-card-custom/30 bg-black/5 dark:bg-white/5 flex items-center justify-between text-[10px] font-bold text-secondary-custom">
            <span>Resultados e Inspección</span>
            <span className="text-[9px] font-mono opacity-70">ESC</span>
          </div>

          {renderResultsList()}
        </div>
      )}
    </div>
  );
}
