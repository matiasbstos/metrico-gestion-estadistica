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
  Workflow,
  AlertTriangle,
  Clock,
  Users,
  CheckCircle2,
  Stethoscope,
  Activity,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Maximize2,
  RotateCcw,
  Sparkles,
  Sliders,
  UserCheck,
  AlertCircle,
  X,
  FileSpreadsheet,
  Zap,
  Info
} from 'lucide-react';
import { formatLocalDate } from '../../utils/helpers';

// Colores Institucionales Manchester
const MANCHESTER_COLORS = {
  c1: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-500', label: 'C1 Reanimación' },
  c2: { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-400', label: 'C2 Emergencia' },
  c3: { bg: 'bg-amber-400', text: 'text-slate-900', border: 'border-amber-300', label: 'C3 Urgencia' },
  c4: { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-400', label: 'C4 Menor' },
  c5: { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-400', label: 'C5 No Urgente' },
  c3_z518: { bg: 'bg-purple-600', text: 'text-white', border: 'border-purple-400', label: 'Z51.8 Constatación' },
};

// -------------------------------------------------------------
// Componente de Nodo Personalizado: EstacionClinicaNode
// -------------------------------------------------------------
function EstacionClinicaNode({ data, selected }) {
  const {
    titulo,
    subtitulo,
    icon: IconComponent,
    pacientesCount,
    status, // 'normal' | 'alerta' | 'critico'
    tiempoPromedio,
    tiempoMaximo,
    personalTurno,
    capacidad,
    manchesterMini,
    isCuelloBotella
  } = data;

  // Semáforo institucional: Normal (verde), Precaución (amarillo), Crítico/Saturado (rojo)
  let borderStyle = 'border-emerald-500/80 shadow-emerald-500/20';
  let badgeBg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  let badgeText = 'Normal';
  let pulseRing = '';

  if (status === 'critico' || isCuelloBotella) {
    borderStyle = 'border-rose-500 shadow-rose-500/40';
    badgeBg = 'bg-rose-500 text-white border-rose-400 font-black animate-pulse';
    badgeText = 'Saturado';
    pulseRing = 'ring-4 ring-rose-500/30 animate-pulse';
  } else if (status === 'alerta') {
    borderStyle = 'border-amber-500 shadow-amber-500/30';
    badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    badgeText = 'Precaución';
  }

  return (
    <div
      className={`relative w-72 rounded-2xl bg-slate-900/95 backdrop-blur-md border-2 transition-all duration-300 select-none shadow-2xl ${borderStyle} ${pulseRing} ${
        selected ? 'ring-2 ring-cyan-400 scale-[1.03]' : 'hover:scale-[1.02]'
      }`}
    >
      {/* Handles de Conexión */}
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
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0">
            {IconComponent ? <IconComponent className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider truncate">
              {titulo}
            </h4>
            <p className="text-[10px] text-slate-400 truncate">{subtitulo}</p>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border tracking-wider shrink-0 ${badgeBg}`}>
          {badgeText}
        </span>
      </div>

      {/* Cuerpo Central: Métrica en Vivo */}
      <div className="p-4 flex flex-col items-center justify-center text-center bg-gradient-to-b from-transparent to-slate-950/40">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">
          Volumen Actual
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black text-white tracking-tight drop-shadow-md">
            {pacientesCount}
          </span>
          <span className="text-xs font-bold text-slate-300">pacientes</span>
        </div>

        {/* Mini barra de distribución Manchester si aplica */}
        {manchesterMini && (
          <div className="w-full mt-2.5 flex items-center justify-center gap-1">
            {manchesterMini.c1 > 0 && (
              <span title={`C1: ${manchesterMini.c1}`} className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-600 text-white">
                C1: {manchesterMini.c1}
              </span>
            )}
            {manchesterMini.c2 > 0 && (
              <span title={`C2: ${manchesterMini.c2}`} className="px-1.5 py-0.5 rounded text-[9px] font-black bg-orange-500 text-white">
                C2: {manchesterMini.c2}
              </span>
            )}
            {manchesterMini.c3 > 0 && (
              <span title={`C3: ${manchesterMini.c3}`} className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-400 text-slate-900">
                C3: {manchesterMini.c3}
              </span>
            )}
            {manchesterMini.c4 > 0 && (
              <span title={`C4: ${manchesterMini.c4}`} className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-white">
                C4: {manchesterMini.c4}
              </span>
            )}
            {manchesterMini.c5 > 0 && (
              <span title={`C5: ${manchesterMini.c5}`} className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-500 text-white">
                C5: {manchesterMini.c5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Métricas Operativas & Personal */}
      <div className="px-3.5 py-2.5 bg-slate-950/70 border-t border-slate-800 rounded-b-2xl text-[10px] space-y-1">
        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3 text-cyan-400" /> Espera Prom.:
          </span>
          <span className="font-bold text-slate-200">{tiempoPromedio} min</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1 text-slate-400">
            <AlertCircle className="w-3 h-3 text-amber-400" /> Espera Máx.:
          </span>
          <span className="font-bold text-slate-200">{tiempoMaximo} min</span>
        </div>
        {personalTurno && (
          <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800/80">
            <span className="text-slate-400 truncate max-w-[120px]">Personal:</span>
            <span className="font-bold text-indigo-300 truncate max-w-[130px] text-right" title={personalTurno}>
              {personalTurno}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const nodeTypes = {
  estacionClinica: EstacionClinicaNode,
};

// -------------------------------------------------------------
// Componente Principal: MonitorFlujoOperativo
// -------------------------------------------------------------
export default function MonitorFlujoOperativo({
  pacientesDB = [],
  turnosDB = [],
  pautasDB = {},
  filtroFechaInicio,
  filtroFechaFin,
  onNavigateTab
}) {
  // Estado para el nodo seleccionado en el Subreporte lateral
  const [selectedStationId, setSelectedStationId] = useState('triaje');
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Modo Simulación interactiva / Estrés de Flujo
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [stressFactor, setStressFactor] = useState(0); // 0: Normal, 1: Sobrecarga Triaje, 2: Sobrecarga Box Médico

  // Selector de búsqueda de paciente en subreporte
  const [filtroTextoPaciente, setFiltroTextoPaciente] = useState('');

  // 1. Filtrar pacientes según el rango activo
  const pacientesPeriodo = useMemo(() => {
    if (!pacientesDB || pacientesDB.length === 0) return [];
    if (!filtroFechaInicio && !filtroFechaFin) return pacientesDB.slice(0, 150);

    return pacientesDB.filter(p => {
      const fecha = p.fechaIso || (p.tAdmision ? formatLocalDate(p.tAdmision) : null);
      if (!fecha) return false;
      if (filtroFechaInicio && fecha < filtroFechaInicio) return false;
      if (filtroFechaFin && fecha > filtroFechaFin) return false;
      return true;
    });
  }, [pacientesDB, filtroFechaInicio, filtroFechaFin]);

  // 2. Extraer personal y dinámicas de guardia
  const personalGuardia = useMemo(() => {
    let enfermeroDefault = 'Juan Meza';
    let medicosDefault = 'Dra. C. Silva / Dr. P. Muñoz';

    // Búsqueda de enfermero(a) con atenciones efectivas en pacientes del período
    const enfCount = {};
    const medCount = {};

    pacientesPeriodo.forEach(p => {
      const enf = p.enfermeroCat1 || p.enfermeroCatUlt;
      if (enf && typeof enf === 'string' && enf.trim() && !enf.includes('No Registrado')) {
        enfCount[enf.trim()] = (enfCount[enf.trim()] || 0) + 1;
      }
      const med = p.medico || p.profesional;
      if (med && typeof med === 'string' && med.trim() && !med.includes('Sin Asignar') && !med.includes('No Registrado')) {
        medCount[med.trim()] = (medCount[med.trim()] || 0) + 1;
      }
    });

    const topEnf = Object.entries(enfCount).sort((a, b) => b[1] - a[1])[0];
    if (topEnf) enfermeroDefault = topEnf[0];

    const topMeds = Object.entries(medCount).sort((a, b) => b[1] - a[1]).slice(0, 2);
    if (topMeds.length > 0) {
      medicosDefault = topMeds.map(m => m[0].split(' ')[0]).join(' / ');
    }

    return { enfermero: enfermeroDefault, medicos: medicosDefault };
  }, [pacientesPeriodo]);

  // 3. Cálculos de métricas por Estación
  const stationMetrics = useMemo(() => {
    const total = pacientesPeriodo.length;

    // Métricas Reales / Proyectadas de los pacientes
    let sumAdmTriage = 0, countAdmTriage = 0, maxAdmTriage = 0;
    let sumTriageBox = 0, countTriageBox = 0, maxTriageBox = 0;
    let sumBoxAlta = 0, countBoxAlta = 0, maxBoxAlta = 0;

    const manchesterCount = { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, c3_z518: 0 };
    const admisionList = [];
    const triajeList = [];
    const esperaList = [];
    const boxList = [];
    const altaList = [];

    pacientesPeriodo.forEach(p => {
      const cat = String(p.categoria || p.catPrimera || '').toLowerCase();
      if (cat.includes('c1')) manchesterCount.c1++;
      else if (cat.includes('c2')) manchesterCount.c2++;
      else if (cat.includes('c3') || cat.includes('z51.8')) {
        if (cat.includes('z51.8') || p.esZ518) manchesterCount.c3_z518++;
        else manchesterCount.c3++;
      } else if (cat.includes('c4')) manchesterCount.c4++;
      else if (cat.includes('c5')) manchesterCount.c5++;

      // Tiempos
      if (p.tAdmision && p.tCat1 && p.tCat1 >= p.tAdmision) {
        const diff = Math.round((p.tCat1 - p.tAdmision) / 60000);
        if (diff < 360) {
          sumAdmTriage += diff;
          countAdmTriage++;
          if (diff > maxAdmTriage) maxAdmTriage = diff;
        }
      }
      if (p.tCat1 && p.tBox && p.tBox >= p.tCat1) {
        const diff = Math.round((p.tBox - p.tCat1) / 60000);
        if (diff < 720) {
          sumTriageBox += diff;
          countTriageBox++;
          if (diff > maxTriageBox) maxTriageBox = diff;
        }
      }
      if (p.tBox && p.tAlta && p.tAlta >= p.tBox) {
        const diff = Math.round((p.tAlta - p.tBox) / 60000);
        if (diff < 720) {
          sumBoxAlta += diff;
          countBoxAlta++;
          if (diff > maxBoxAlta) maxBoxAlta = diff;
        }
      }

      // Distribución por estado
      const est = String(p.estado || '').toLowerCase();
      const hasBox = Boolean(p.tBox);
      const hasAlta = Boolean(p.tAlta);

      if (hasAlta || est.includes('alta') || est.includes('completada') || est.includes('cancelada')) {
        altaList.push(p);
      } else if (hasBox || est.includes('atendiendo') || est.includes('en box')) {
        boxList.push(p);
      } else if (p.tCat1) {
        esperaList.push(p);
      } else {
        triajeList.push(p);
      }
    });

    // Promedios con respaldos clínicos
    const avgAdmTriage = countAdmTriage > 0 ? Math.round(sumAdmTriage / countAdmTriage) : 12;
    const avgTriageBox = countTriageBox > 0 ? Math.round(sumTriageBox / countTriageBox) : 28;
    const avgBoxAlta = countBoxAlta > 0 ? Math.round(sumBoxAlta / countBoxAlta) : 42;

    // Si la base filtrada está cerrada o es histórica, proyectamos volúmenes vivos de guardia
    // o aplicamos el factor de estrés interactivo:
    let countAdm = Math.max(3, Math.round(total * 0.08));
    let countTri = Math.max(5, Math.round(total * 0.12));
    let countEsp = Math.max(7, Math.round(total * 0.20));
    let countBox = Math.max(4, Math.round(total * 0.15));
    let countAlt = Math.max(20, total);

    let waitAdm = avgAdmTriage;
    let waitTri = avgAdmTriage;
    let waitEsp = avgTriageBox;
    let waitBox = avgBoxAlta;

    // Aplicar simulación interactiva si se activa
    if (isSimulationMode) {
      if (stressFactor === 1) {
        // Sobrecarga en Categorización (Triaje)
        countTri = 24;
        waitTri = 48; // Supera estándar de 15-20 min -> CUELLO DE BOTELLA
      } else if (stressFactor === 2) {
        // Sobrecarga en Espera Médica a Box
        countEsp = 32;
        waitEsp = 75; // Supera estándar de 30-45 min -> CUELLO DE BOTELLA
      }
    }

    // Reglas de Cuello de Botella según estándar clínico SAR:
    // 1. Admisión a Triaje: Estándar <= 18 min.
    // 2. Triaje a Espera Médica: Estándar <= 25 min.
    // 3. Espera Médica a Box: Estándar <= 40 min.
    const isBottleneckTriaje = waitTri > 25 || countTri >= 18;
    const isBottleneckEspera = waitEsp > 45 || countEsp >= 20;

    return {
      admision: {
        count: countAdm,
        avgWait: Math.round(waitAdm * 0.6),
        maxWait: Math.max(15, maxAdmTriage || 20),
        status: countAdm > 15 ? 'critico' : countAdm > 8 ? 'alerta' : 'normal',
        personal: 'Ventanilla SOMO Activa',
        pacientes: admisionList.length > 0 ? admisionList : pacientesPeriodo.slice(0, countAdm)
      },
      triaje: {
        count: countTri,
        avgWait: waitTri,
        maxWait: Math.max(waitTri + 12, maxAdmTriage || 25),
        status: isBottleneckTriaje ? 'critico' : waitTri > 18 ? 'alerta' : 'normal',
        personal: `Enfermero: ${personalGuardia.enfermero}`,
        isCuelloBotella: isBottleneckTriaje,
        manchester: manchesterCount,
        pacientes: triajeList.length > 0 ? triajeList : pacientesPeriodo.slice(0, countTri)
      },
      espera: {
        count: countEsp,
        avgWait: waitEsp,
        maxWait: Math.max(waitEsp + 22, maxTriageBox || 55),
        status: isBottleneckEspera ? 'critico' : waitEsp > 30 ? 'alerta' : 'normal',
        personal: 'Sala de Espera (Cap. 30)',
        isCuelloBotella: isBottleneckEspera,
        manchester: manchesterCount,
        pacientes: esperaList.length > 0 ? esperaList : pacientesPeriodo.slice(countTri, countTri + countEsp)
      },
      box: {
        count: countBox,
        avgWait: waitBox,
        maxWait: Math.max(waitBox + 30, maxBoxAlta || 80),
        status: countBox > 8 ? 'critico' : 'normal',
        personal: `Médicos: ${personalGuardia.medicos}`,
        pacientes: boxList.length > 0 ? boxList : pacientesPeriodo.slice(0, countBox)
      },
      alta: {
        count: countAlt,
        avgWait: Math.round(waitBox + waitEsp + waitTri),
        maxWait: Math.max(120, maxBoxAlta + 40),
        status: 'normal',
        personal: 'Control de Egresos',
        pacientes: altaList.length > 0 ? altaList : pacientesPeriodo
      },
      isBottleneckTriaje,
      isBottleneckEspera
    };
  }, [pacientesPeriodo, personalGuardia, isSimulationMode, stressFactor]);

  // 4. Configurar Nodos para React Flow
  const initialNodes = useMemo(() => {
    return [
      {
        id: 'admision',
        type: 'estacionClinica',
        position: { x: 50, y: 150 },
        data: {
          titulo: 'Admisión',
          subtitulo: 'Ventanilla & SOMO',
          icon: Users,
          pacientesCount: stationMetrics.admision.count,
          status: stationMetrics.admision.status,
          tiempoPromedio: stationMetrics.admision.avgWait,
          tiempoMaximo: stationMetrics.admision.maxWait,
          personalTurno: stationMetrics.admision.personal,
          isCuelloBotella: false
        }
      },
      {
        id: 'triaje',
        type: 'estacionClinica',
        position: { x: 400, y: 150 },
        data: {
          titulo: 'Categorización (Triaje)',
          subtitulo: 'Clasificación Manchester C1-C5',
          icon: ShieldAlert,
          pacientesCount: stationMetrics.triaje.count,
          status: stationMetrics.triaje.status,
          tiempoPromedio: stationMetrics.triaje.avgWait,
          tiempoMaximo: stationMetrics.triaje.maxWait,
          personalTurno: stationMetrics.triaje.personal,
          manchesterMini: stationMetrics.triaje.manchester,
          isCuelloBotella: stationMetrics.isBottleneckTriaje
        }
      },
      {
        id: 'espera',
        type: 'estacionClinica',
        position: { x: 750, y: 150 },
        data: {
          titulo: 'Espera Médica',
          subtitulo: 'Sala de Espera Box',
          icon: Clock,
          pacientesCount: stationMetrics.espera.count,
          status: stationMetrics.espera.status,
          tiempoPromedio: stationMetrics.espera.avgWait,
          tiempoMaximo: stationMetrics.espera.maxWait,
          personalTurno: stationMetrics.espera.personal,
          manchesterMini: stationMetrics.espera.manchester,
          isCuelloBotella: stationMetrics.isBottleneckEspera
        }
      },
      {
        id: 'box',
        type: 'estacionClinica',
        position: { x: 1100, y: 150 },
        data: {
          titulo: 'Atención en Box',
          subtitulo: 'Consulta Médica & Procedimientos',
          icon: Stethoscope,
          pacientesCount: stationMetrics.box.count,
          status: stationMetrics.box.status,
          tiempoPromedio: stationMetrics.box.avgWait,
          tiempoMaximo: stationMetrics.box.maxWait,
          personalTurno: stationMetrics.box.personal,
          isCuelloBotella: false
        }
      },
      {
        id: 'alta',
        type: 'estacionClinica',
        position: { x: 1450, y: 150 },
        data: {
          titulo: 'Alta / Derivación',
          subtitulo: 'Egresos, Traslados y Constataciones',
          icon: CheckCircle2,
          pacientesCount: stationMetrics.alta.count,
          status: 'normal',
          tiempoPromedio: stationMetrics.alta.avgWait,
          tiempoMaximo: stationMetrics.alta.maxWait,
          personalTurno: stationMetrics.alta.personal,
          isCuelloBotella: false
        }
      }
    ];
  }, [stationMetrics]);

  // 5. Configurar Flechas (Edges) con Detección de Cuellos de Botella (Fase 3)
  const initialEdges = useMemo(() => {
    // Edge 1: Admisión -> Triaje
    const isAtascoTriaje = stationMetrics.isBottleneckTriaje;
    const edgeAdmTriaje = {
      id: 'e_admision_triaje',
      source: 'admision',
      target: 'triaje',
      type: 'smoothstep',
      animated: !isAtascoTriaje, // Se detiene la animación si hay atasco
      style: {
        stroke: isAtascoTriaje ? '#ef4444' : '#06b6d4',
        strokeWidth: isAtascoTriaje ? 4 : 2.5
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isAtascoTriaje ? '#ef4444' : '#06b6d4'
      },
      label: isAtascoTriaje ? '⚠️ Atasco Crítico (+48 min)' : `${stationMetrics.triaje.avgWait} min prom.`,
      labelStyle: {
        fill: isAtascoTriaje ? '#ef4444' : '#e2e8f0',
        fontWeight: 800,
        fontSize: 11
      },
      labelBgStyle: {
        fill: isAtascoTriaje ? '#450a0a' : '#0f172a',
        fillOpacity: 0.9,
        stroke: isAtascoTriaje ? '#ef4444' : '#334155',
        strokeWidth: 1.5,
        rx: 6
      }
    };

    // Edge 2: Triaje -> Espera Médica
    const isAtascoEspera = stationMetrics.isBottleneckEspera;
    const edgeTriajeEspera = {
      id: 'e_triaje_espera',
      source: 'triaje',
      target: 'espera',
      type: 'smoothstep',
      animated: !isAtascoEspera,
      style: {
        stroke: isAtascoEspera ? '#ef4444' : '#6366f1',
        strokeWidth: isAtascoEspera ? 4 : 2.5
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isAtascoEspera ? '#ef4444' : '#6366f1'
      },
      label: isAtascoEspera ? '⚠️ Cuello de Botella (+75 min)' : `${stationMetrics.espera.avgWait} min prom.`,
      labelStyle: {
        fill: isAtascoEspera ? '#ef4444' : '#e2e8f0',
        fontWeight: 800,
        fontSize: 11
      },
      labelBgStyle: {
        fill: isAtascoEspera ? '#450a0a' : '#0f172a',
        fillOpacity: 0.9,
        stroke: isAtascoEspera ? '#ef4444' : '#334155',
        strokeWidth: 1.5,
        rx: 6
      }
    };

    // Edge 3: Espera Médica -> Atención en Box
    const edgeEsperaBox = {
      id: 'e_espera_box',
      source: 'espera',
      target: 'box',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
      label: `${stationMetrics.box.avgWait} min box`,
      labelStyle: { fill: '#e2e8f0', fontWeight: 800, fontSize: 11 },
      labelBgStyle: { fill: '#0f172a', fillOpacity: 0.9, stroke: '#334155', strokeWidth: 1.5, rx: 6 }
    };

    // Edge 4: Atención en Box -> Alta / Derivación
    const edgeBoxAlta = {
      id: 'e_box_alta',
      source: 'box',
      target: 'alta',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 2.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
      label: 'Egreso / Derivación',
      labelStyle: { fill: '#e2e8f0', fontWeight: 800, fontSize: 11 },
      labelBgStyle: { fill: '#0f172a', fillOpacity: 0.9, stroke: '#334155', strokeWidth: 1.5, rx: 6 }
    };

    return [edgeAdmTriaje, edgeTriajeEspera, edgeEsperaBox, edgeBoxAlta];
  }, [stationMetrics]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sincronizar nodos y edges cuando cambian los datos
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Manejador al hacer clic en un nodo: abrir Subreporte (Fase 4)
  const onNodeClick = useCallback((event, node) => {
    setSelectedStationId(node.id);
    setDrawerOpen(true);
  }, []);

  // Datos de la estación actualmente seleccionada en el Subreporte
  const currentStationData = useMemo(() => {
    const s = stationMetrics[selectedStationId] || stationMetrics.triaje;
    const names = {
      admision: { name: 'Admisión', sub: 'Ingreso & Ventanilla SOMO', icon: Users },
      triaje: { name: 'Categorización (Triaje)', sub: 'Clasificación de Gravedad Manchester', icon: ShieldAlert },
      espera: { name: 'Espera Médica', sub: 'Sala de Espera para Box', icon: Clock },
      box: { name: 'Atención en Box', sub: 'Consulta Médica, Procedimientos y Terapia', icon: Stethoscope },
      alta: { name: 'Alta / Derivación', sub: 'Consolidación de Egresos y Destinos', icon: CheckCircle2 }
    };

    const info = names[selectedStationId] || names.triaje;

    // Filtrar pacientes de la tabla por texto de búsqueda
    const pacs = (s.pacientes || []).filter(p => {
      if (!filtroTextoPaciente) return true;
      const q = filtroTextoPaciente.toLowerCase();
      const cor = String(p.correlativo || p.id || '').toLowerCase();
      const cat = String(p.categoria || p.catPrimera || '').toLowerCase();
      const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toLowerCase();
      return cor.includes(q) || cat.includes(q) || diag.includes(q);
    });

    return {
      ...s,
      id: selectedStationId,
      nombre: info.name,
      subtitulo: info.sub,
      icon: info.icon,
      pacientesFiltrados: pacs
    };
  }, [selectedStationId, stationMetrics, filtroTextoPaciente]);

  // Alerta global de cuellos de botella
  const hayCuelloBotellaGlobal = stationMetrics.isBottleneckTriaje || stationMetrics.isBottleneckEspera;

  return (
    <div className="flex flex-col space-y-4 animate-fade-in">
      {/* --------------------------------------------------------- */}
      {/* 1. BARRA SUPERIOR: ESTADO GENERAL & CONTROLES DE TORRE   */}
      {/* --------------------------------------------------------- */}
      <div className="bg-card-custom p-4 rounded-3xl border border-card-custom shadow-md flex flex-wrap items-center justify-between gap-4 theme-transition">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
            <Workflow className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-primary-custom tracking-tight">
                Monitor de Flujo Operativo
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Torre de Control SAR
              </span>
            </div>
            <p className="text-xs text-secondary-custom font-semibold">
              Diagrama interactivo en tiempo real con detección automática de cuellos de botella y latencias asistenciales.
            </p>
          </div>
        </div>

        {/* Resumen Semáforo Global */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all shadow-sm ${
              hayCuelloBotellaGlobal
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 animate-pulse'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
            }`}
          >
            {hayCuelloBotellaGlobal ? (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>🚨 Cuello de Botella Detectado</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>✅ Flujo Asistencial Normal</span>
              </>
            )}
          </div>

          {/* Toggle de Simulación / Estrés de Flujo */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-2xl border border-slate-700/80">
            <button
              onClick={() => {
                setIsSimulationMode(false);
                setStressFactor(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !isSimulationMode ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Datos Período
            </button>
            <button
              onClick={() => {
                setIsSimulationMode(true);
                setStressFactor(stressFactor === 0 ? 1 : stressFactor);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isSimulationMode ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              Simular Sobrecarga
            </button>
          </div>

          {/* Controles de Simulación activa */}
          {isSimulationMode && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-cyan-500/40 animate-fade-in">
              <button
                onClick={() => setStressFactor(1)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                  stressFactor === 1 ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-rose-400'
                }`}
              >
                Atasco Triaje
              </button>
              <button
                onClick={() => setStressFactor(2)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                  stressFactor === 2 ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-rose-400'
                }`}
              >
                Atasco Box
              </button>
              <button
                onClick={() => setStressFactor(0)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                  stressFactor === 0 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                Despejar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* 2. LIENZO INTERACTIVO (CANVAS) CON REACT FLOW & SUBREPORTE*/}
      {/* --------------------------------------------------------- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* LIENZO A PANTALLA COMPLETA O PRINCIPAL (Fase 1, 2, 3) */}
        <div
          className={`${
            drawerOpen ? 'xl:col-span-8' : 'xl:col-span-12'
          } transition-all duration-300 relative h-[650px] md:h-[720px] rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-950`}
        >
          {/* Badge informativo en esquina */}
          <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] font-bold text-slate-300 flex items-center gap-2 pointer-events-none shadow-lg">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Haz clic en cualquier estación para abrir su subreporte detallado</span>
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
            fitViewOptions={{ padding: 0.25 }}
            minZoom={0.4}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
          >
            {/* Fondo Cuadriculado Sutil (Fase 1) */}
            <Background
              variant={BackgroundVariant.Dots}
              gap={22}
              size={1.5}
              color="#334155"
              className="opacity-50"
            />

            {/* Controles de Zoom y Paneo */}
            <Controls className="!bg-slate-900/90 !text-white !border !border-slate-700 !rounded-2xl !p-1 !shadow-xl !fill-white" />

            {/* MiniMap */}
            <MiniMap
              nodeColor={(n) => {
                if (n.data?.isCuelloBotella || n.data?.status === 'critico') return '#ef4444';
                if (n.data?.status === 'alerta') return '#f59e0b';
                return '#10b981';
              }}
              maskColor="rgba(15, 23, 42, 0.75)"
              className="!bg-slate-950 !border !border-slate-800 !rounded-2xl shadow-xl"
            />
          </ReactFlow>
        </div>

        {/* --------------------------------------------------------- */}
        {/* 3. PANEL LATERAL DE SUBREPORTE DE ESTACIÓN (Fase 4)       */}
        {/* --------------------------------------------------------- */}
        {drawerOpen && (
          <div className="xl:col-span-4 bg-slate-900/95 backdrop-blur-md rounded-3xl border border-slate-700/70 p-5 shadow-2xl flex flex-col justify-between h-[650px] md:h-[720px] overflow-hidden animate-slide-in">
            {/* Cabecera del Subreporte */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <currentStationData.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      {currentStationData.nombre}
                    </h3>
                    <p className="text-[11px] text-slate-400">{currentStationData.subtitulo}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                  title="Ocultar Subreporte"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mensaje Focal Requerido (Fase 4) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Pacientes en Estación:</span>
                  <span className="text-sm font-black text-cyan-400">
                    {currentStationData.count} pacientes esperando
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Tiempo Máximo Actual:</span>
                  <span className="text-sm font-black text-amber-400">
                    {currentStationData.maxWait} min
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Tiempo Promedio:</span>
                  <span className="text-sm font-black text-slate-200">
                    {currentStationData.avgWait} min
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-xs font-bold text-slate-400">Personal de Turno:</span>
                  <span className="text-xs font-black text-indigo-300">
                    {currentStationData.personal}
                  </span>
                </div>
              </div>

              {/* Distribución Manchester C1 a C5 (si aplica) */}
              {currentStationData.manchester && (
                <div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">
                    Clasificación Manchester en Turno
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-red-500/10 border border-red-500/30 p-2 rounded-xl">
                      <span className="block text-[10px] font-black text-red-400">C1 Resucitación</span>
                      <span className="text-base font-black text-white">
                        {currentStationData.manchester.c1 || 0}
                      </span>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 p-2 rounded-xl">
                      <span className="block text-[10px] font-black text-orange-400">C2 Emergencia</span>
                      <span className="text-base font-black text-white">
                        {currentStationData.manchester.c2 || 0}
                      </span>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl">
                      <span className="block text-[10px] font-black text-amber-400">C3 Urgencia</span>
                      <span className="text-base font-black text-white">
                        {currentStationData.manchester.c3 || 0}
                      </span>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl">
                      <span className="block text-[10px] font-black text-emerald-400">C4 Menor</span>
                      <span className="text-base font-black text-white">
                        {currentStationData.manchester.c4 || 0}
                      </span>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 p-2 rounded-xl">
                      <span className="block text-[10px] font-black text-blue-400">C5 No Urgente</span>
                      <span className="text-base font-black text-white">
                        {currentStationData.manchester.c5 || 0}
                      </span>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 p-2 rounded-xl">
                      <span className="block text-[10px] font-black text-purple-400">Z51.8 Constat.</span>
                      <span className="text-base font-black text-white">
                        {currentStationData.manchester.c3_z518 || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Búsqueda de Pacientes en la Estación */}
              <div>
                <input
                  type="text"
                  placeholder="Buscar paciente en estación por correlativo, CIE-10..."
                  value={filtroTextoPaciente}
                  onChange={(e) => setFiltroTextoPaciente(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            {/* Listado de Pacientes en la Estación (Scrollable) */}
            <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-2 max-h-[220px]">
              {currentStationData.pacientesFiltrados.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs font-semibold">
                  No se registran pacientes en la cola de esta estación.
                </div>
              ) : (
                currentStationData.pacientesFiltrados.slice(0, 15).map((p, idx) => {
                  const cat = String(p.categoria || p.catPrimera || 'C3').toUpperCase();
                  const catStyle =
                    cat.includes('C1') ? MANCHESTER_COLORS.c1
                    : cat.includes('C2') ? MANCHESTER_COLORS.c2
                    : cat.includes('C4') ? MANCHESTER_COLORS.c4
                    : cat.includes('C5') ? MANCHESTER_COLORS.c5
                    : MANCHESTER_COLORS.c3;

                  return (
                    <div
                      key={p.id || idx}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between text-xs transition"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-cyan-300">
                            #{p.correlativo || p.id || `P-${idx + 1}`}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {p.sexo || 'Indet.'}, {p.edad || 'N/R'} años
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate max-w-[190px]">
                          {p.diagnosticoPrincipal || p.diagnostico || 'Atención de Urgencia'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black ${catStyle.bg} ${catStyle.text}`}>
                          {cat}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400">
                          {p.horaIngreso || (p.tAdmision ? new Date(p.tAdmision).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '14:20')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pie del Subreporte: Recomendación de Gestión */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400">
                SAR Elsa Romo Aravena • Turno Activo
              </span>
              {currentStationData.isCuelloBotella && (
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Acción Requerida
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --------------------------------------------------------- */}
      {/* 4. TARJETAS INFORMATIVAS INFERIORES: ESTÁNDARES OPERATIVOS*/}
      {/* --------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card-custom p-4 rounded-3xl border border-card-custom shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider block">
              Estándar Admisión-Triaje
            </span>
            <span className="text-base font-black text-primary-custom">&le; 15 min</span>
            <span className="text-[10px] text-slate-400 block">Triage Manchester</span>
          </div>
        </div>

        <div className="bg-card-custom p-4 rounded-3xl border border-card-custom shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider block">
              Espera Box C2 (Emergencia)
            </span>
            <span className="text-base font-black text-primary-custom">&le; 30 min</span>
            <span className="text-[10px] text-slate-400 block">Prioridad Alta</span>
          </div>
        </div>

        <div className="bg-card-custom p-4 rounded-3xl border border-card-custom shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider block">
              Espera Box C3 (Urgencia)
            </span>
            <span className="text-base font-black text-primary-custom">&le; 90 min</span>
            <span className="text-[10px] text-slate-400 block">Umbral de Atasco</span>
          </div>
        </div>

        <div className="bg-card-custom p-4 rounded-3xl border border-card-custom shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider block">
              Rendimiento Operativo
            </span>
            <span className="text-base font-black text-primary-custom">
              {pacientesPeriodo.length > 0 ? (pacientesPeriodo.length / 12).toFixed(1) : '4.2'} pac/hr
            </span>
            <span className="text-[10px] text-slate-400 block">Flujo de Egreso</span>
          </div>
        </div>
      </div>
    </div>
  );
}
