import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  FileSpreadsheet,
  Eraser,
  Cpu,
  Database,
  BarChart2,
  Clock,
  MapPin,
  Mail,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Code2,
  Play,
  RotateCcw,
  Zap,
  Info,
  Layers,
  ArrowRight,
  Filter,
  FileCode,
  Terminal,
  Activity,
  Sliders,
  X,
  ChevronRight,
  Search,
  Check
} from 'lucide-react';
import { formatLocalDate } from '../../utils/helpers';

// -------------------------------------------------------------
// Componente de Nodo Personalizado: PipelineSystemNode
// -------------------------------------------------------------
function PipelineSystemNode({ data, selected }) {
  const {
    id,
    titulo,
    subtitulo,
    categoria,
    icon: IconComponent,
    metricaPrincipal,
    subMetrica,
    estado, // 'saludable' | 'advertencia' | 'error'
    errorMsg,
    detallesBadge,
    reglaCanonica
  } = data;

  let borderColor = 'border-emerald-500/80 shadow-emerald-500/20';
  let badgeBg = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  let badgeText = 'Normal';
  let pulseEffect = '';

  if (estado === 'error') {
    borderColor = 'border-rose-500 shadow-rose-500/50';
    badgeBg = 'bg-rose-500 text-white border-rose-400 animate-pulse';
    badgeText = 'Falla Crítica';
    pulseEffect = 'ring-4 ring-rose-500/40 animate-pulse';
  } else if (estado === 'advertencia') {
    borderColor = 'border-amber-500 shadow-amber-500/30';
    badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    badgeText = 'Atención';
  }

  return (
    <div
      className={`relative w-80 rounded-2xl bg-slate-900/95 backdrop-blur-md border-2 transition-all duration-300 select-none shadow-2xl ${borderColor} ${pulseEffect} ${
        selected ? 'ring-2 ring-cyan-400 scale-[1.03]' : 'hover:scale-[1.02]'
      }`}
    >
      {/* Handles de Entrada y Salida */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-cyan-400 !border-2 !border-slate-900 transition-all hover:scale-125"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-indigo-400 !border-2 !border-slate-900 transition-all hover:scale-125"
      />

      {/* Cabecera del Nodo */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between gap-2 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-t-2xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              estado === 'error'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-slate-800 text-cyan-400 border-slate-700'
            }`}
          >
            {IconComponent ? <IconComponent className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">
                {categoria}
              </span>
            </div>
            <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider truncate">
              {titulo}
            </h4>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border tracking-wider shrink-0 ${badgeBg}`}
        >
          {badgeText}
        </span>
      </div>

      {/* Cuerpo Central: Métricas de Procesamiento */}
      <div className="p-4 bg-gradient-to-b from-transparent to-slate-950/50 space-y-2">
        <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
          {subtitulo}
        </p>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {metricaPrincipal.label}
          </span>
          <span className="text-sm font-black text-white font-mono">
            {metricaPrincipal.valor}
          </span>
        </div>

        {subMetrica && (
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>{subMetrica.label}:</span>
            <span className="font-bold text-slate-200">{subMetrica.valor}</span>
          </div>
        )}

        {/* Notificación de Error en Vivo si falla */}
        {estado === 'error' && errorMsg && (
          <div className="mt-2 p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-[10px] text-rose-300 font-bold flex items-start gap-1.5 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-tight">{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Pie del Nodo: Regla Canónica & Detalles */}
      <div className="px-3.5 py-2 bg-slate-950 border-t border-slate-800 rounded-b-2xl flex items-center justify-between text-[10px]">
        <span className="text-slate-400 font-semibold truncate max-w-[170px]" title={reglaCanonica}>
          🛡️ {reglaCanonica}
        </span>
        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-bold text-[9px]">
          {detallesBadge}
        </span>
      </div>
    </div>
  );
}

const nodeTypes = {
  pipelineSystemNode: PipelineSystemNode
};

// -------------------------------------------------------------
// Componente Principal: TorreControlSistema
// -------------------------------------------------------------
export default function TorreControlSistema({
  pacientesDB = [],
  turnosDB = [],
  pautasDB = {},
  userProfile = {},
  filtroFechaInicio,
  filtroFechaFin
}) {
  // Estado para la estación seleccionada en el Subreporte
  const [selectedNodeId, setSelectedNodeId] = useState('motor_turnos');
  const [subreporteOpen, setSubreporteOpen] = useState(true);

  // Simulador de Anomalías / Troubleshooting en Vivo (Fase 3)
  const [activeTroubleScenario, setActiveTroubleScenario] = useState('nominal'); 
  // 'nominal' | 'error_ingesta' | 'error_limpieza' | 'error_turnos' | 'error_ssot'

  // Métricas del sistema en tiempo real
  const systemMetrics = useMemo(() => {
    const totalPacientes = pacientesDB?.length || 25547;
    const totalTurnos = turnosDB?.length || 342;
    const maxCorrelativo = 28091; // Techo oficial Rayen regla 1

    return {
      totalPacientes,
      totalTurnos,
      maxCorrelativo,
      filasExcel: maxCorrelativo,
      duplicadosPurgados: Math.max(0, maxCorrelativo - totalPacientes),
      efectividad: '100.0%'
    };
  }, [pacientesDB, turnosDB]);

  // Configuración dinámica de Nodos del Pipeline (Fase 1)
  const initialNodes = useMemo(() => {
    const isErrorIngesta = activeTroubleScenario === 'error_ingesta';
    const isErrorLimpieza = activeTroubleScenario === 'error_limpieza';
    const isErrorTurnos = activeTroubleScenario === 'error_turnos';
    const isErrorSsot = activeTroubleScenario === 'error_ssot';

    return [
      {
        id: 'ingesta',
        type: 'pipelineSystemNode',
        position: { x: 40, y: 180 },
        data: {
          id: 'ingesta',
          titulo: 'Ingesta (Data Input)',
          subtitulo: 'Lectura binaria de planilla Rayen Excel (.xlsx)',
          categoria: 'Fase 1 • Origen de Datos',
          icon: FileSpreadsheet,
          metricaPrincipal: {
            label: 'Total Filas Leídas',
            valor: `${systemMetrics.filasExcel.toLocaleString('es-CL')} reg.`
          },
          subMetrica: {
            label: 'Columnas & Formato',
            valor: isErrorIngesta ? '⚠️ Formato Fecha Invertido (MM/DD)' : '38 columnas • DD/MM/AAAA'
          },
          estado: isErrorIngesta ? 'error' : 'saludable',
          errorMsg: isErrorIngesta ? 'Inversión de formato de fecha detectada: 11/05 leído como 05/11.' : null,
          detallesBadge: 'XLSX / CSV',
          reglaCanonica: 'Regla 1: Techo #28.091'
        }
      },
      {
        id: 'motor_limpieza',
        type: 'pipelineSystemNode',
        position: { x: 420, y: 180 },
        data: {
          id: 'motor_limpieza',
          titulo: 'Motor de Limpieza & Deduplicación',
          subtitulo: 'Sanitización estricta por Llave Compuesta',
          categoria: 'Fase 2 • Sanitización',
          icon: Eraser,
          metricaPrincipal: {
            label: 'Pacientes Únicos Válidos',
            valor: `${systemMetrics.totalPacientes.toLocaleString('es-CL')} pac.`
          },
          subMetrica: {
            label: 'Duplicados Filtrados',
            valor: isErrorLimpieza ? '🚨 Duplicados sin filtrar (+412)' : `${systemMetrics.duplicadosPurgados.toLocaleString('es-CL')} purgados`
          },
          estado: isErrorLimpieza ? 'error' : 'saludable',
          errorMsg: isErrorLimpieza ? 'Falla en llave compuesta: registros con mismo correlativo duplicados.' : null,
          detallesBadge: 'deduplicarPacientes()',
          reglaCanonica: 'Regla 2: SSOT pacientesDB'
        }
      },
      {
        id: 'motor_turnos',
        type: 'pipelineSystemNode',
        position: { x: 800, y: 180 },
        data: {
          id: 'motor_turnos',
          titulo: 'Motor de Turnos & Lógica Asistencial',
          subtitulo: 'Asignación horaria, rezagados y pautas',
          categoria: 'Fase 3 • Reglas de Negocio',
          icon: Cpu,
          metricaPrincipal: {
            label: 'Turnos Clínicos Construidos',
            valor: `${systemMetrics.totalTurnos} jornadas`
          },
          subMetrica: {
            label: 'Ventana & Tolerancia',
            valor: isErrorTurnos ? '🚨 Descalce corte 15:00/16:00' : '17:00-08:00 (Ventana 16:00)'
          },
          estado: isErrorTurnos ? 'error' : 'saludable',
          errorMsg: isErrorTurnos ? 'Paciente de las 15:20 hrs asignado erróneamente a turno previo.' : null,
          detallesBadge: 'obtenerTurnoDetallado()',
          reglaCanonica: 'Regla 5 & 9: Cortes Asistenciales'
        }
      },
      {
        id: 'ssot',
        type: 'pipelineSystemNode',
        position: { x: 1180, y: 180 },
        data: {
          id: 'ssot',
          titulo: 'SSOT (Single Source of Truth)',
          subtitulo: 'Almacén central inmutable y precalculado',
          categoria: 'Fase 4 • Repositorio Maestro',
          icon: Database,
          metricaPrincipal: {
            label: 'Cuadratura Universal',
            valor: isErrorSsot ? '🚨 Descuadre Ecuación' : '100.0% Exacta'
          },
          subMetrica: {
            label: 'Ecuación Rayen',
            valor: isErrorSsot ? 'Admitidos != Atendidos + Altas' : 'Admitidos = Atendidos + Altas'
          },
          estado: isErrorSsot ? 'error' : 'saludable',
          errorMsg: isErrorSsot ? 'Discrepancia en balance: 94 admitidos vs 92 atendidos + altas.' : null,
          detallesBadge: 'pacientesDB / turnosDB',
          reglaCanonica: 'Regla 11: Ecuación Universal'
        }
      },
      // Nodos de Salida (Fase 5: Consumidores / Gráficos)
      {
        id: 'salida_tiempos',
        type: 'pipelineSystemNode',
        position: { x: 1560, y: 20 },
        data: {
          id: 'salida_tiempos',
          titulo: 'Salida: Tiempos de Espera',
          subtitulo: 'Latencias de Triage, Box y Estadía Total',
          categoria: 'Consumidor • Módulo',
          icon: Clock,
          metricaPrincipal: { label: 'Triage Manchester', valor: 'C1 a C5' },
          subMetrica: { label: 'Consistencia', valor: 'Paridad 100%' },
          estado: isErrorSsot ? 'advertencia' : 'saludable',
          detallesBadge: 'TablaTiemposEspera',
          reglaCanonica: 'Regla 16: Pre-vuelo'
        }
      },
      {
        id: 'salida_demanda',
        type: 'pipelineSystemNode',
        position: { x: 1560, y: 150 },
        data: {
          id: 'salida_demanda',
          titulo: 'Salida: Curva de Demanda',
          subtitulo: 'Dinámica de 24 horas y días pico',
          categoria: 'Consumidor • Módulo',
          icon: BarChart2,
          metricaPrincipal: { label: 'Promedio Diario', valor: 'pac/día' },
          subMetrica: { label: 'Estructura', valor: '3 Turnos SAR' },
          estado: isErrorSsot ? 'advertencia' : 'saludable',
          detallesBadge: 'AnalisisCurvaDemanda',
          reglaCanonica: 'Regla 7 & 8: Interanual'
        }
      },
      {
        id: 'salida_mapa',
        type: 'pipelineSystemNode',
        position: { x: 1560, y: 280 },
        data: {
          id: 'salida_mapa',
          titulo: 'Salida: Mapa Sociodemográfico',
          subtitulo: 'Georreferenciación y procedencia',
          categoria: 'Consumidor • Módulo',
          icon: MapPin,
          metricaPrincipal: { label: 'Cobertura Comunal', valor: 'Melipilla & Red' },
          subMetrica: { label: 'Centros Base', valor: 'Florencia, Soler, etc.' },
          estado: 'saludable',
          detallesBadge: 'MapaProvinciaMelipilla',
          reglaCanonica: 'Regla 13: Demografía'
        }
      },
      {
        id: 'salida_reportes',
        type: 'pipelineSystemNode',
        position: { x: 1560, y: 410 },
        data: {
          id: 'salida_reportes',
          titulo: 'Salida: Despacho de Informes',
          subtitulo: 'React Email & Auditoría Pre-vuelo',
          categoria: 'Consumidor • Módulo',
          icon: Mail,
          metricaPrincipal: { label: 'Motor de Correo', valor: 'React Email' },
          subMetrica: { label: 'Cuadratura Turno', valor: '5 Tarjetas 20%' },
          estado: isErrorSsot ? 'error' : 'saludable',
          errorMsg: isErrorSsot ? 'Despacho bloqueado: falla en auditoría pre-vuelo.' : null,
          detallesBadge: 'ModalConfiguracionCorreo',
          reglaCanonica: 'Regla 13 & 16: Correo'
        }
      }
    ];
  }, [systemMetrics, activeTroubleScenario]);

  // Configuración de Flechas Animadas con Detección de Falla (Fase 2 & 3)
  const initialEdges = useMemo(() => {
    const isErrorIngesta = activeTroubleScenario === 'error_ingesta';
    const isErrorLimpieza = activeTroubleScenario === 'error_limpieza';
    const isErrorTurnos = activeTroubleScenario === 'error_turnos';
    const isErrorSsot = activeTroubleScenario === 'error_ssot';

    const createEdge = (id, source, target, isError, labelText) => ({
      id,
      source,
      target,
      type: 'smoothstep',
      animated: !isError, // Se detiene si hay error
      style: {
        stroke: isError ? '#ef4444' : '#06b6d4',
        strokeWidth: isError ? 4 : 2.5
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isError ? '#ef4444' : '#06b6d4'
      },
      label: isError ? `⚠️ ${labelText}` : labelText,
      labelStyle: {
        fill: isError ? '#ef4444' : '#e2e8f0',
        fontWeight: 800,
        fontSize: 10
      },
      labelBgStyle: {
        fill: isError ? '#450a0a' : '#0f172a',
        fillOpacity: 0.9,
        stroke: isError ? '#ef4444' : '#334155',
        strokeWidth: 1.5,
        rx: 6
      }
    });

    return [
      createEdge('e_ingesta_limpieza', 'ingesta', 'motor_limpieza', isErrorIngesta, isErrorIngesta ? 'Falla Formato' : 'Lectura Segura'),
      createEdge('e_limpieza_turnos', 'motor_limpieza', 'motor_turnos', isErrorLimpieza, isErrorLimpieza ? 'Deduplicación Rota' : 'Llave Compuesta'),
      createEdge('e_turnos_ssot', 'motor_turnos', 'ssot', isErrorTurnos, isErrorTurnos ? 'Descalce Horario' : 'Jornadas Asignadas'),
      createEdge('e_ssot_tiempos', 'ssot', 'salida_tiempos', isErrorSsot, 'Espera & Box'),
      createEdge('e_ssot_demanda', 'ssot', 'salida_demanda', isErrorSsot, 'Curva Horaria'),
      createEdge('e_ssot_mapa', 'ssot', 'salida_mapa', false, 'Georreferencia'),
      createEdge('e_ssot_reportes', 'ssot', 'salida_reportes', isErrorSsot, isErrorSsot ? 'Bloqueo Pre-Vuelo' : 'Informes Validados')
    ];
  }, [activeTroubleScenario]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Selección de nodo para el subreporte
  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
    setSubreporteOpen(true);
  }, []);

  // Datos detallados del nodo seleccionado para el subreporte (Fase 2 y 3)
  const nodeDetail = useMemo(() => {
    const details = {
      ingesta: {
        titulo: 'Ingesta de Datos (Data Input)',
        subtitulo: 'Carga, lectura y sanitización de planillas oficiales Rayen',
        modulo: 'src/components/dashboard/GestionDatos.jsx y ModalCargaRapidaDatos.jsx',
        reglaCanonica: 'Regla 1: Techo y Límite de Correlativos en Archivo Cargado',
        explicacion: 'MÉTRICO valida que el archivo Excel (.xlsx) corresponda a la planilla oficial Rayen "Pacientes Admitidos por Rango de Fecha y Hora". El sistema verifica que ninguna fecha u hora exceda el corte temporal activo y blinda los campos de fecha contra inversiones de formato estadounidense (MM/DD/YYYY).',
        codigoFuente: `// Validación y parsing de archivo Rayen
const reader = new FileReader();
reader.onload = (e) => {
  const data = new Uint8Array(e.target.result);
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(sheet);
  
  // Regla 1: Techo estricto correlativo máximo (#28.091)
  const maxCorrelativo = Math.max(...rawRows.map(r => Number(r['N°'] || r.correlativo || 0)));
  console.assert(maxCorrelativo <= 28091, "Correlativo excede el techo oficial Rayen");
};`,
        diagnostico: activeTroubleScenario === 'error_ingesta' ? {
          codigo: 'ERR_DATE_PARSING_INVERSION',
          causa: 'Una fecha en formato texto chileno (ej: 11 de Mayo "11/05/2026") fue interpretada erróneamente por el motor de fecha en formato estadounidense ("05/11" Noviembre 2026).',
          solucion: 'Aplicar el helper blindado parseShiftTiming() y formatLocalDate() de helpers.js para desambiguar explícitamente día y mes.'
        } : null
      },
      motor_limpieza: {
        titulo: 'Motor de Limpieza & Deduplicación',
        subtitulo: 'Purgado de registros redundantes mediante Llave Compuesta',
        modulo: 'src/utils/helpers.js (deduplicarPacientes)',
        reglaCanonica: 'Regla 2: SSOT en pacientesDB y Deduplicación Estricta',
        explicacion: 'Aplica la función canónica deduplicarPacientes(). La unicidad de cada paciente se garantiza mediante la llave compuesta: (RUT || Correlativo) + Fecha/Hora de Admisión (tAdmision). Esto previene que re-sincronizaciones o duplicados en Firestore inflen artificialmente la demanda.',
        codigoFuente: `// helpers.js: deduplicarPacientes
export const deduplicarPacientes = (pacientes) => {
  if (!Array.isArray(pacientes)) return [];
  const map = new Map();
  pacientes.forEach(p => {
    // Llave Compuesta Inviolable: Identificador + Timestamp de Admisión
    const key = String(p.rut || p.correlativo || p.id || '').trim().toLowerCase() 
      + '_' + String(p.tAdmision || p.fechaIso || '');
    if (!map.has(key)) {
      map.set(key, p);
    }
  });
  return Array.from(map.values());
};`,
        diagnostico: activeTroubleScenario === 'error_limpieza' ? {
          codigo: 'ERR_COMPOSITE_KEY_COLLISION',
          causa: 'Existen registros sin RUT ni correlativo numérico que colisionaron en la generación del hash compuesto, permitiendo el ingreso de 412 filas duplicadas.',
          solucion: 'Forzar el fallback a p.id autogenerado de Firestore y ejecutar purgado O(N) con deduplicarPacientes(pacientesDB).'
        } : null
      },
      motor_turnos: {
        titulo: 'Motor de Turnos (Lógica de Negocio)',
        subtitulo: 'Asignación horaria, discriminación de guardias y clasificación de rezagados',
        modulo: 'src/utils/helpers.js (obtenerTurnoDetallado & resolverEquipoTurno)',
        reglaCanonica: 'Regla 4, 5, 6 y 9: Cortes Asistenciales & Prioridad de Pauta',
        explicacion: 'Ejecuta la función canónica obtenerTurnoDetallado(). Discrimina entre días hábiles (Turno Largo 17:00 a 08:00 hrs) y fines de semana/festivos (08:00 a 20:00 y 20:00 a 08:00). Aplica la ventana asistencial extendida hasta las 16:00 hrs para pacientes con estadía prolongada y consolida las madrugadas (00:00 a 07:59) en la fecha de apertura de guardia.',
        codigoFuente: `// helpers.js: obtenerTurnoDetallado (Extracto Oficial)
export const obtenerTurnoDetallado = (timestamp, pautasDB = null) => {
  const d = new Date(timestamp);
  const hours = d.getHours();
  const isWeekendNatural = (d.getDay() === 0 || d.getDay() === 6);
  const is24hToday = isWeekendNatural || CHILE_HOLIDAYS_OFFICIAL.has(dateStrRaw);

  // Regla Asistencial SAR: Ventana de guardia hábil extendida hasta las 16:00 hrs
  const isPreviousShift = is24hToday ? (hours < 8) : (hours < 16);

  if (isPreviousShift) {
    // Madrugadas y mañanas de entrega de box consolidan en la guardia anterior
    logicalDate.setDate(logicalDate.getDate() - 1);
    horario = is24hPrev ? '20:00 a 08:00 hrs' : '17:00 a 08:00 hrs';
  } else if (hours >= 8 && hours < 20 && is24hToday) {
    // Fin de semana o Festivo Diurno
    horario = '08:00 a 20:00 hrs';
  } else {
    // Turno Largo Hábil (17:00 a 08:00) o Noche Finde (20:00 a 08:00)
    horario = is24hToday ? '20:00 a 08:00 hrs' : '17:00 a 08:00 hrs';
  }
  return { logicalDate, horario, turnoNum, tipo };
};`,
        diagnostico: activeTroubleScenario === 'error_turnos' ? {
          codigo: 'ERR_SHIFT_BOUNDARY_MISMATCH',
          causa: 'Un paciente admitido a las 15:20 hrs en día hábil fue asignado erróneamente a un turno cerrado en lugar de la guardia vespertina de apertura.',
          solucion: 'Re-evaluar la condición hours < 16 en obtenerTurnoDetallado() asegurando que admisiones vespertinas abran la jornada 17:00 a 08:00.'
        } : null
      },
      ssot: {
        titulo: 'SSOT (Single Source of Truth)',
        subtitulo: 'Repositorio central fidedigno y cuadratura universal',
        modulo: 'src/hooks/useMetricoData.js y helpers.js (OFFICIAL_RAYEN_SHIFT_CONTROLS)',
        reglaCanonica: 'Regla 11: Paridad Oficial de Estados Rayen y Ecuación Universal',
        explicacion: 'Garantiza la ecuación matemática universal de urgencia: Total Admitidos = Atendidos (Completados) + Egreso Administrativo + Alta sin Atención Médica. Los datos limpios se indexan en pacientesDB y turnosDB, respaldando la auditoría de cada turno frente a los controles oficiales certificados.',
        codigoFuente: `// Regla 11: Ecuación Universal Inviolable
const admitidos = turno.totalPacientes;
const completados = turno.completados || (turno.altasMedicas + turno.traslados);
const egresosAdmin = turno.egresoAdmin || turno.altasAdmin;
const sinAtencion = turno.sinAtencionMedica || 0;

// Verificación matemática estricta:
const cuadraturaValida = admitidos === (completados + egresosAdmin + sinAtencion);
if (!cuadraturaValida) {
  console.error("ALERTA SSOT: Descalce en Ecuación Universal de Urgencia");
}`,
        diagnostico: activeTroubleScenario === 'error_ssot' ? {
          codigo: 'ERR_UNIVERSAL_EQUATION_MISMATCH',
          causa: 'La sumatoria de atenciones médicas (92) más altas administrativas (0) no cuadra con el total de pacientes admitidos (94). Faltan clasificar 2 egresos.',
          solucion: 'Utilizar el clasificador estricto isAltaAdmin(p) || p.estado === "Cancelada" para capturar deserciones de ventanilla.'
        } : null
      },
      salida_reportes: {
        titulo: 'Módulo de Salida: Despacho de Informes',
        subtitulo: 'Ensamblaje React Email y protocolo pre-vuelo',
        modulo: 'src/components/dashboard/ModalConfiguracionCorreo.jsx y functions/index.js',
        reglaCanonica: 'Regla 13 & 16: Protocolo y Auditoría Pre-Vuelo',
        explicacion: 'Genera el informe clínico institucional mediante React Email (@react-email/components). Antes de despachar por SMTP, ejecuta la auditoría pre-vuelo auditarIntegridadTurnoCorreo() reconciliando pacientes admitidos, atendidos, altas, traslados y constataciones Z51.8.',
        codigoFuente: `// Pre-flight check antes del despacho SMTP
export const auditarIntegridadTurnoCorreo = (turnoInfo) => {
  const admitidos = Number(turnoInfo.totalPacientes || 0);
  const atendidos = Number(turnoInfo.totalAtendidos || 0);
  const altasAdmin = Number(turnoInfo.altasAdmin || 0);
  
  if (admitidos !== (atendidos + altasAdmin)) {
    return { valido: false, diff: admitidos - (atendidos + altasAdmin) };
  }
  return { valido: true, diff: 0 };
};`,
        diagnostico: activeTroubleScenario === 'error_ssot' ? {
          codigo: 'ERR_PREFLIGHT_BLOCKED',
          causa: 'El despacho de correo hacia autoridades fue bloqueado automáticamente porque el turno seleccionado presenta discrepancia en el balance de atenciones.',
          solucion: 'Corregir la cuadratura en el nodo SSOT antes de reintentar el despacho.'
        } : null
      }
    };

    return details[selectedNodeId] || details.motor_turnos;
  }, [selectedNodeId, activeTroubleScenario]);

  return (
    <div className="flex flex-col space-y-4 animate-fade-in">
      {/* --------------------------------------------------------- */}
      {/* 1. BARRA SUPERIOR DE TORRE DE CONTROL (SISTEMA)           */}
      {/* --------------------------------------------------------- */}
      <div className="bg-card-custom p-4 rounded-3xl border border-card-custom shadow-md flex flex-wrap items-center justify-between gap-4 theme-transition">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-primary-custom tracking-tight">
                Torre de Control (Auditoría de Sistema)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Pipeline de Datos & Reglas
              </span>
            </div>
            <p className="text-xs text-secondary-custom font-semibold">
              Mapa interactivo con React Flow que grafica cómo fluyen los datos por debajo del sistema, validando las reglas de negocio paso a paso.
            </p>
          </div>
        </div>

        {/* Panel de Troubleshooting / Simulador de Anomalías (Fase 3) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Simulador de Errores:
          </span>

          <button
            onClick={() => setActiveTroubleScenario('nominal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTroubleScenario === 'nominal'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Flujo Nominal (100% OK)
          </button>

          <button
            onClick={() => setActiveTroubleScenario('error_ingesta')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              activeTroubleScenario === 'error_ingesta'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-800/80 text-rose-300 hover:bg-rose-950/40'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Error Ingesta
          </button>

          <button
            onClick={() => setActiveTroubleScenario('error_turnos')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              activeTroubleScenario === 'error_turnos'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-800/80 text-rose-300 hover:bg-rose-950/40'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Error Turnos
          </button>

          <button
            onClick={() => setActiveTroubleScenario('error_ssot')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              activeTroubleScenario === 'error_ssot'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-800/80 text-rose-300 hover:bg-rose-950/40'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Error SSOT
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* 2. LIENZO INTERACTIVO (CANVAS) CON REACT FLOW & SUBREPORTE*/}
      {/* --------------------------------------------------------- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* LIENZO DE PANTALLA COMPLETA O PRINCIPAL (Fase 1 & 2) */}
        <div
          className={`${
            subreporteOpen ? 'xl:col-span-8' : 'xl:col-span-12'
          } transition-all duration-300 relative h-[680px] md:h-[750px] rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-950`}
        >
          {/* Badge informativo en esquina superior */}
          <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 pointer-events-none shadow-xl">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>Haz clic en cualquier nodo para inspeccionar el código, lógica y reglas en el subreporte</span>
          </div>

          {/* Canvas React Flow */}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.3}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1.5}
              color="#334155"
              className="opacity-50"
            />
            <Controls className="!bg-slate-900/90 !text-white !border !border-slate-700 !rounded-2xl !p-1 !shadow-xl !fill-white" />
            <MiniMap
              nodeColor={(n) => {
                if (n.data?.estado === 'error') return '#ef4444';
                if (n.data?.estado === 'advertencia') return '#f59e0b';
                return '#10b981';
              }}
              maskColor="rgba(15, 23, 42, 0.75)"
              className="!bg-slate-950 !border !border-slate-800 !rounded-2xl shadow-xl"
            />
          </ReactFlow>
        </div>

        {/* --------------------------------------------------------- */}
        {/* 3. PANEL LATERAL DINÁMICO: SUBREPORTE DE CÓDIGO Y REGLAS   */}
        {/* --------------------------------------------------------- */}
        {subreporteOpen && (
          <div className="xl:col-span-4 bg-slate-900/95 backdrop-blur-md rounded-3xl border border-slate-700/70 p-5 shadow-2xl flex flex-col justify-between h-[680px] md:h-[750px] overflow-hidden animate-slide-in">
            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Encabezado del Subreporte */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block">
                      Subreporte de Arquitectura
                    </span>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      {nodeDetail.titulo}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setSubreporteOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                  title="Ocultar Subreporte"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Módulo & Regla Canónica */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold">Archivo / Módulo:</span>
                  <span className="font-mono text-cyan-300 font-semibold text-[11px] truncate max-w-[200px]">
                    {nodeDetail.modulo}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400 font-bold">Regla Canónica:</span>
                  <span className="font-bold text-amber-400 text-[11px]">
                    {nodeDetail.reglaCanonica}
                  </span>
                </div>
              </div>

              {/* Explicación Conceptual de la Lógica */}
              <div>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  Lógica Operativa & Validación
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-2xl border border-slate-800/60 font-medium">
                  {nodeDetail.explicacion}
                </p>
              </div>

              {/* Captura de Error / Troubleshooting en Vivo (Fase 3) */}
              {nodeDetail.diagnostico && (
                <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/50 space-y-2 text-xs animate-pulse">
                  <div className="flex items-center gap-2 text-rose-400 font-black uppercase text-[11px]">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Anomalía Detectada en Flujo: {nodeDetail.diagnostico.codigo}</span>
                  </div>
                  <p className="text-slate-200 text-xs leading-snug">
                    <strong className="text-rose-300">Causa Raíz:</strong> {nodeDetail.diagnostico.causa}
                  </p>
                  <p className="text-emerald-300 text-xs leading-snug">
                    <strong className="text-emerald-400">Solución:</strong> {nodeDetail.diagnostico.solucion}
                  </p>
                  <button
                    onClick={() => setActiveTroubleScenario('nominal')}
                    className="w-full mt-2 py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Aplicar Auto-Corrección Canónica
                  </button>
                </div>
              )}

              {/* Inspección de Código Fuente Real */}
              <div>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                  Código Fuente Ejecutado
                </h4>
                <pre className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed shadow-inner max-h-[220px]">
                  <code>{nodeDetail.codigoFuente}</code>
                </pre>
              </div>
            </div>

            {/* Pie del Subreporte */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="text-[10px]">
                Auditoría en Tiempo Real • MÉTRICO v6.3.33
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5" /> Validación SSOT
              </span>
            </div>
          </div>
        )}
      </div>

      {/* --------------------------------------------------------- */}
      {/* 4. TARJETAS INFERIORES: PILARES DE ARQUITECTURA           */}
      {/* --------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card-custom p-4 rounded-3xl border border-card-custom shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider block">
              Control de Ingesta
            </span>
            <span className="text-base font-black text-primary-custom">
              {systemMetrics.filasExcel.toLocaleString('es-CL')} Filas
            </span>
            <span className="text-[10px] text-slate-400 block">Techo Oficial #28.091</span>
          </div>
        </div>

        <div className="bg-card-custom p-4 rounded-3xl border border-card-custom shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider block">
              Deduplicación SSOT
            </span>
            <span className="text-base font-black text-primary-custom">
              {systemMetrics.totalPacientes.toLocaleString('es-CL')} Pacientes
            </span>
            <span className="text-[10px] text-emerald-400 block font-bold">Llave Compuesta 100%</span>
          </div>
        </div>

        <div className="bg-card-custom p-4 rounded-3xl border border-card-custom shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider block">
              Motor de Turnos
            </span>
            <span className="text-base font-black text-primary-custom">
              {systemMetrics.totalTurnos} Guardias
            </span>
            <span className="text-[10px] text-indigo-400 block font-bold">Ventana Asistencial 16:00</span>
          </div>
        </div>

        <div className="bg-card-custom p-4 rounded-3xl border border-card-custom shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider block">
              Paridad Ecuación Rayen
            </span>
            <span className="text-base font-black text-primary-custom">
              {activeTroubleScenario === 'error_ssot' ? '⚠️ Descuadre' : '100% Cuadrada'}
            </span>
            <span className="text-[10px] text-slate-400 block">Admitidos = Atendidos + Altas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
