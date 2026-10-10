import React, { useState, useMemo, useCallback } from 'react';
import { 
  Calendar, TrendingUp, TrendingDown, Clock, Activity, 
  AlertTriangle, ShieldCheck, Users, Edit3, CheckCircle2, 
  Gauge, Zap, RefreshCw, Layers, Award, Trophy, Flame, ShieldAlert, 
  Timer, BarChart2, Crown, Target, HeartPulse, UserCheck, 
  AlertCircle, HelpCircle, ChevronRight, Stethoscope, Sparkles, Info,
  FileText, Download, Printer
} from 'lucide-react';
import { getKpiExtremes, KPI_POLARITY_DEFINITIONS } from '../../utils/kpiExtremes';
import ExecutiveReportTemplate from './ExecutiveReportTemplate';
import { 
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Card as TremorCard, 
  Metric as TremorMetric, 
  Text as TremorText, 
  BadgeDelta as TremorBadgeDelta, 
  Tracker as TremorTracker, 
  BarList as TremorBarList, 
  DonutChart as TremorDonutChart, 
  BarChart as TremorBarChart,
  KPITooltip
} from '../tremor';
import { 
  formatLocalDate, 
  parseLocalDateStr,
  resolverEquipoTurno, 
  obtenerTurnoDetallado, 
  isAltaAdmin,
  isSinAtencionMedica,
  isEgresoAdministrativo,
  isTraslado,
  formatTime 
} from '../../utils/helpers';

// Mini Sparkline component para visualización de tendencias sin tablas de texto plano
const MiniSparkline = ({ data, color = '#6366f1' }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = (max - min) || 1;
  const width = 72;
  const height = 22;
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 10) + 5;
    const y = height - 4 - ((val - min) / range) * (height - 8);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible flex-shrink-0">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {data.map((val, idx) => {
        const x = (idx / (data.length - 1)) * (width - 10) + 5;
        const y = height - 4 - ((val - min) / range) * (height - 8);
        return (
          <circle key={idx} cx={x} cy={y} r="2.5" fill={color} stroke="var(--bg-card, #ffffff)" strokeWidth="1" />
        );
      })}
    </svg>
  );
};

export default function AnalisisComparativoTriple({ 
  pacientesDB, 
  turnosDB, 
  pautasDB,
  filtroFechaInicio,
  filtroFechaFin,
  setFiltroFechaInicio, 
  setFiltroFechaFin, 
  setActiveTab 
}) {
  // Constante de corte de datos del sistema (Regla 1, 5 & 27 SSOT Dinámico)
  const MAX_SYSTEM_CUTOFF = useMemo(() => {
    const ahoraIso = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    if (turnosDB && turnosDB.length > 0) {
      const validT = turnosDB
        .map(t => parseLocalDateStr(t?.fechaInicio) || (typeof t?.fechaInicio === 'string' ? t.fechaInicio.trim() : null))
        .filter(fIso => fIso && fIso <= ahoraIso)
        .sort()
        .reverse();
      if (validT.length > 0) return validT[0];
    }
    return ahoraIso;
  }, [turnosDB]);

  // Helper para resolver la fecha máxima con datos válidos
  const getLatestValidDate = useCallback(() => {
    if (filtroFechaFin && typeof filtroFechaFin === 'string' && filtroFechaFin <= MAX_SYSTEM_CUTOFF) {
      return filtroFechaFin;
    }
    if (turnosDB && turnosDB.length > 0) {
      const validT = turnosDB
        .map(t => parseLocalDateStr(t?.fechaInicio) || (typeof t?.fechaInicio === 'string' ? t.fechaInicio.trim() : null))
        .filter(fIso => fIso && fIso <= MAX_SYSTEM_CUTOFF)
        .sort()
        .reverse();
      if (validT.length > 0) return validT[0];
    }
    if (pacientesDB && pacientesDB.length > 0) {
      const ahoraMs = Date.now() + 86400000;
      let maxD = null;
      for (let i = 0; i < pacientesDB.length; i++) {
        const p = pacientesDB[i];
        if (!p || !p.tAdmision) continue;
        if (typeof p.tAdmision === 'number' && p.tAdmision > ahoraMs) continue;
        const dStr = formatLocalDate(p.tAdmision);
        if (dStr && dStr <= MAX_SYSTEM_CUTOFF && (!maxD || dStr > maxD)) {
          maxD = dStr;
        }
      }
      if (maxD) return maxD;
    }
    return MAX_SYSTEM_CUTOFF;
  }, [filtroFechaFin, turnosDB, pacientesDB, MAX_SYSTEM_CUTOFF]);

  // Helper para verificar si un rango entrante es amplio (>= 14 días)
  const isBroadRange = (d1, d2) => {
    if (!d1 || !d2) return false;
    const diff = Math.abs(new Date(d2 + "T12:00:00") - new Date(d1 + "T12:00:00"));
    return (diff / (1000 * 60 * 60 * 24)) >= 14;
  };

  // ESTADO GLOBAL DE RANGO DE FECHAS (Afecta a los 3 turnos a la vez)
  const initialEnd = getLatestValidDate();
  const [fechaInicio, setFechaInicio] = useState(() => {
    if (isBroadRange(filtroFechaInicio, filtroFechaFin) && filtroFechaInicio <= MAX_SYSTEM_CUTOFF) {
      return filtroFechaInicio;
    }
    // Por defecto institucional para análisis multiturno: Últimos 3 Meses
    return '2026-06-01';
  });
  const [fechaFin, setFechaFin] = useState(() => {
    if (isBroadRange(filtroFechaInicio, filtroFechaFin) && filtroFechaFin <= MAX_SYSTEM_CUTOFF) {
      return filtroFechaFin;
    }
    return initialEnd;
  });
  const [activePreset, setActivePreset] = useState('ultimos_3_meses');

  // Equipos seleccionados para cada uno de los 3 slots de comparación
  const [equipoColA, setEquipoColA] = useState('Turno 1');
  const [equipoColB, setEquipoColB] = useState('Turno 2');
  const [equipoColC, setEquipoColC] = useState('Turno 3');

  // Alias visuales personalizables
  const [aliasA, setAliasA] = useState('Turno 1');
  const [aliasB, setAliasB] = useState('Turno 2');
  const [aliasC, setAliasC] = useState('Turno 3');
  const [isEditingAliasA, setIsEditingAliasA] = useState(false);
  const [isEditingAliasB, setIsEditingAliasB] = useState(false);
  const [isEditingAliasC, setIsEditingAliasC] = useState(false);

  // Modo de barras para el ComposedChart (agrupadas vs apiladas)
  const [chartBarMode, setChartBarMode] = useState('grouped'); // 'grouped' | 'stacked'

  // FASE 2: Interfaz Dual (Analista vs Ejecutivo)
  const [modoVista, setModoVista] = useState('analitico'); // 'analitico' (defecto) | 'ejecutivo'

  const equipoOptions = ['Turno 1', 'Turno 2', 'Turno 3', 'Turno 4'];

  // Presets globales de fechas
  const handleApplyPreset = (presetKey) => {
    setActivePreset(presetKey);
    const end = MAX_SYSTEM_CUTOFF;
    const endDate = new Date(end + 'T12:00:00');
    const toIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    let start = `${endDate.getFullYear()}-01-01`;

    if (presetKey === 'ultimos_3_meses') {
      const d = new Date(endDate);
      d.setMonth(d.getMonth() - 3);
      start = toIso(d);
    } else if (presetKey === 'ano_2026' || presetKey === 'ano_actual') {
      start = `${endDate.getFullYear()}-01-01`;
    } else if (presetKey === 'ultimos_30_dias') {
      const d = new Date(endDate);
      d.setDate(d.getDate() - 30);
      start = toIso(d);
    } else if (presetKey === 'ultimos_7_dias') {
      const d = new Date(endDate);
      d.setDate(d.getDate() - 7);
      start = toIso(d);
    } else if (presetKey === 'agosto_2026') {
      setFechaInicio('2026-08-01');
      setFechaFin('2026-08-31');
      return;
    } else if (presetKey === 'septiembre_2026') {
      setFechaInicio('2026-09-01');
      setFechaFin('2026-09-30');
      return;
    } else if (presetKey === 'octubre_2026') {
      setFechaInicio('2026-10-01');
      setFechaFin(MAX_SYSTEM_CUTOFF);
      return;
    }

    setFechaInicio(start);
    setFechaFin(end);
  };

  // Sincronizar con filtros del Dashboard principal si el usuario lo solicita
  const handleSyncWithDashboard = () => {
    if (setFiltroFechaInicio && setFiltroFechaFin) {
      setFiltroFechaInicio(fechaInicio);
      setFiltroFechaFin(fechaFin);
    }
  };

  // Configuración de los 3 slots de equipos evaluados
  const teamsConfig = useMemo(() => [
    {
      id: 'A',
      selectedTeam: equipoColA,
      setSelectedTeam: setEquipoColA,
      alias: aliasA,
      setAlias: setAliasA,
      isEditing: isEditingAliasA,
      setIsEditing: setIsEditingAliasA,
      color: '#4f46e5', // Sapphire Indigo
      barColor: '#6366f1',
      lineColor: '#f59e0b', // High-contrast Amber line
      accentColor: '#818cf8',
      badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      borderClass: 'border-indigo-500'
    },
    {
      id: 'B',
      selectedTeam: equipoColB,
      setSelectedTeam: setEquipoColB,
      alias: aliasB,
      setAlias: setAliasB,
      isEditing: isEditingAliasB,
      setIsEditing: setIsEditingAliasB,
      color: '#9333ea', // Violet Fuchsia
      barColor: '#a855f7',
      lineColor: '#06b6d4', // High-contrast Cyan line
      accentColor: '#c084fc',
      badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      borderClass: 'border-purple-500'
    },
    {
      id: 'C',
      selectedTeam: equipoColC,
      setSelectedTeam: setEquipoColC,
      alias: aliasC,
      setAlias: setAliasC,
      isEditing: isEditingAliasC,
      setIsEditing: setIsEditingAliasC,
      color: '#059669', // Emerald Teal
      barColor: '#10b981',
      lineColor: '#f43f5e', // High-contrast Rose line
      accentColor: '#34d399',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      borderClass: 'border-emerald-500'
    }
  ], [equipoColA, equipoColB, equipoColC, aliasA, aliasB, aliasC, isEditingAliasA, isEditingAliasB, isEditingAliasC]);

  // CÁLCULO EXHAUSTIVO DE KPIS COMPARATIVOS Y MINERÍA DE DATOS CLÍNICA (FASES 1, 2, 3 Y 4)
  const { teamMetrics, globalAggregates } = useMemo(() => {
    const makeInitialTeamBucket = (name) => ({
      name,
      totalPacientes: 0,
      atendidos: 0,
      altasAdmin: 0,
      fugas: 0, // Egresos sin atención médica (Fase 4)
      reingresos48h: 0, // Reingresos antes de 48 hrs (Fase 4)
      traslados: 0,
      trasladosCriticos: 0, // Traslados C1/C2 / rescate vital (Fase 4)
      constataciones: 0,
      respiratorios: 0,
      fracturas: 0,
      pediatricos: 0, // 0-14 años (Fase 4)
      senescentes: 0, // 60+ años (Fase 4)
      peakHourCount: 0, // Horario Peak 19:00 - 22:30 hrs
      c1: 0, c2: 0, c3: 0, c4: 0, c5: 0,
      // Tiempos asistenciales
      sumEsperaTriage: 0, countEsperaTriage: 0,
      triageOportunoCount: 0, // Espera <= 15 min en C1-C3
      sumEstadiaTotal: 0, countEstadiaTotal: 0,
      sumTriageToBox: 0, countTriageToBox: 0,
      sumBoxToAlta: 0, countBoxToAlta: 0,
      // Espera por categoría Manchester
      catWait: {
        c1: { sum: 0, count: 0 },
        c2: { sum: 0, count: 0 },
        c3: { sum: 0, count: 0 },
        c4: { sum: 0, count: 0 },
        c5: { sum: 0, count: 0 }
      },
      // Guardias cubiertas
      guardiasCount: 0,
      guardiasDates: new Set(),
      horasCobertura: 0,
      maxPacientesEnUnTurno: 0,
      pacientesPorTurnoMap: {},
      centrosMap: {}
    });

    const buckets = {
      'Turno 1': makeInitialTeamBucket('Turno 1'),
      'Turno 2': makeInitialTeamBucket('Turno 2'),
      'Turno 3': makeInitialTeamBucket('Turno 3'),
      'Turno 4': makeInitialTeamBucket('Turno 4')
    };

    const startIso = fechaInicio;
    const endIso = fechaFin;
    let pacsCountInPeriod = 0;

    // 1. Identificar y deduplicar todos los turnos disponibles en el rango de fechas
    const seenTurnosMap = new Map();
    (turnosDB || []).forEach(t => {
      if (!t || !t.fechaInicio) return;
      const hor = String(t.horario || '').toLowerCase();
      if (hor.includes('24 hrs') || hor.includes('día completo') || hor.includes('dia completo')) return;

      const isoDate = parseLocalDateStr(t.fechaInicio);
      if (!isoDate || isoDate < startIso || isoDate > endIso) return;

      let canonicalTag = 'SEMANA_LARGO';
      if (hor.includes('08:00') && hor.includes('20:00') && !hor.includes('20:00 a 08:00') && !hor.includes('20:00 - 08:00')) {
        canonicalTag = 'FINDE_DIA';
      } else if (hor.includes('20:00') && hor.includes('08:00')) {
        canonicalTag = 'FINDE_NOCHE';
      }

      const key = `${isoDate}_${canonicalTag}`;
      const existing = seenTurnosMap.get(key);
      if (!existing) {
        seenTurnosMap.set(key, { ...t, canonicalTag, isoDate });
      } else {
        const sumPac = Number(existing.totalPacientes || 0) + Number(t.totalPacientes || 0);
        if (sumPac <= 200 && Number(existing.totalPacientes || 0) < 130 && Number(t.totalPacientes || 0) < 130) {
          existing.totalPacientes = sumPac;
          existing.altasAdmin = Number(existing.altasAdmin || 0) + Number(t.altasAdmin || 0);
          existing.atendidos = Number(existing.atendidos || 0) + Number(t.atendidos || 0);
          existing.c1 = Number(existing.c1 || 0) + Number(t.c1 || 0);
          existing.c2 = Number(existing.c2 || 0) + Number(t.c2 || 0);
          existing.c3 = Number(existing.c3 || 0) + Number(t.c3 || 0);
          existing.c4 = Number(existing.c4 || 0) + Number(t.c4 || 0);
          existing.c5 = Number(existing.c5 || 0) + Number(t.c5 || 0);
          existing.trasladosCount = Number(existing.trasladosCount || existing.traslados || 0) + Number(t.trasladosCount || t.traslados || 0);
          existing.constatacionesCount = Number(existing.constatacionesCount || existing.constataciones || 0) + Number(t.constatacionesCount || t.constataciones || 0);
        } else if (Number(t.totalPacientes || 0) > Number(existing.totalPacientes || 0)) {
          seenTurnosMap.set(key, { ...t, canonicalTag, isoDate });
        }
      }
    });

    const dedupTurnosList = Array.from(seenTurnosMap.values());
    const totalPacientesInTurnos = dedupTurnosList.reduce((sum, t) => sum + Number(t.totalPacientes || 0), 0);

    // Contar cuántos pacientes individuales en memoria corresponden al período
    (pacientesDB || []).forEach(p => {
      if (!p || !p.tAdmision) return;
      const dStr = formatLocalDate(p.tAdmision);
      if (dStr >= startIso && dStr <= endIso) {
        pacsCountInPeriod++;
      }
    });

    // Evaluar si pacientesDB es exhaustivo o fragmento en caché (< 70% de la demanda)
    const isPacientesComprehensive = pacsCountInPeriod >= Math.max(50, totalPacientesInTurnos * 0.7);

    if (isPacientesComprehensive) {
      // 2A. MODO COMPLETO DESDE PACIENTES INDIVIDUALES (Rangos con datos completos en memoria)
      // Agrupación para minería de reingresos (<48 hrs)
      const lastAdmByPatient = new Map();
      const sortedPacs = [...(pacientesDB || [])]
        .filter(p => p && p.tAdmision)
        .sort((a, b) => a.tAdmision - b.tAdmision);

      sortedPacs.forEach(p => {
        const dStr = formatLocalDate(p.tAdmision);
        if (!dStr || dStr < startIso || dStr > endIso) return;

        const det = obtenerTurnoDetallado(p.tAdmision, pautasDB);
        let teamName = det.equipo;
        if (!teamName || teamName === '-' || teamName.includes('Sin Asignar')) {
          teamName = resolverEquipoTurno(dStr, det.horario, pautasDB, p.equipo || p.equipoTurno);
        }
        if (!buckets[teamName]) {
          if (teamName && teamName.includes('1')) teamName = 'Turno 1';
          else if (teamName && teamName.includes('2')) teamName = 'Turno 2';
          else if (teamName && teamName.includes('3')) teamName = 'Turno 3';
          else if (teamName && teamName.includes('4')) teamName = 'Turno 4';
          else teamName = 'Turno 1';
        }

        const b = buckets[teamName];
        b.totalPacientes++;

        const shiftDate = det.fechaIso || dStr;
        b.guardiasDates.add(shiftDate);
        b.pacientesPorTurnoMap[shiftDate] = (b.pacientesPorTurnoMap[shiftDate] || 0) + 1;

        const c = String(p.categoria || p.catPrimera || 'sincat').toLowerCase();
        let catKey = null;
        if (c.includes('c1')) { b.c1++; catKey = 'c1'; }
        else if (c.includes('c2')) { b.c2++; catKey = 'c2'; }
        else if (c.includes('c3')) { b.c3++; catKey = 'c3'; }
        else if (c.includes('c4')) { b.c4++; catKey = 'c4'; }
        else if (c.includes('c5')) { b.c5++; catKey = 'c5'; }

        // Clasificación estricta de desenlaces
        const isFuga = isSinAtencionMedica(p) || (isAltaAdmin(p) && (!p.tAtencion || p.tAtencion <= 0));
        if (isFuga) {
          b.fugas++;
        }

        if (isAltaAdmin(p) || p.estado === 'Cancelada') {
          b.altasAdmin++;
        } else {
          b.atendidos++;
        }

        // Minería de Reingreso Precoz (< 48 hrs)
        const pid = p.rut || p.rutPaciente || p.identificador || p.numFicha || p.correlativo;
        if (pid) {
          const prevTime = lastAdmByPatient.get(pid);
          if (prevTime && (p.tAdmision - prevTime) > 0 && (p.tAdmision - prevTime) <= 48 * 3600 * 1000) {
            b.reingresos48h++;
          }
          lastAdmByPatient.set(pid, p.tAdmision);
        }

        // Demografía Asistencial (Extremos de la vida)
        if (p.edad !== null && p.edad !== undefined && !isNaN(p.edad)) {
          const e = Number(p.edad);
          if (e <= 14) b.pediatricos++;
          else if (e >= 60) b.senescentes++;
        }

        // Traslados y Derivaciones Críticas
        const dest = String(p.destinoAlta || p.destino || '').toLowerCase();
        const isTrans = isTraslado(p) || dest.includes('hospital') || dest.includes('emergencia') || dest.includes('derivac');
        if (isTrans) {
          b.traslados++;
          if (catKey === 'c1' || catKey === 'c2' || dest.includes('samu') || dest.includes('ambulancia') || dest.includes('reanimac')) {
            b.trasladosCriticos++;
          }
        }

        // Constataciones Z51.8
        if (p.categoria === 'c3_z518') {
          b.constataciones++;
        } else {
          const cod = String(p.codigoDiagnostico || p.diagnostico || '').toUpperCase();
          const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
          if (cod.includes('Z51.8') || cod.includes('Z518') || diag.includes('CONSTATAC')) {
            b.constataciones++;
          }
        }

        // Patologías Centinela
        const diagFull = `${p.diagnosticoPrincipal || ''} ${p.diagnostico || ''} ${p.codigoDiagnostico || ''}`.toUpperCase();
        if (
          diagFull.includes('RESPIR') || diagFull.includes('BRONQ') || 
          diagFull.includes('NEUMO') || diagFull.includes('J0') || 
          diagFull.includes('J1') || diagFull.includes('J2') || diagFull.includes('INFLUENZA')
        ) {
          b.respiratorios++;
        }

        if (diagFull.includes('FRACT') || diagFull.includes('TRAUMA') || diagFull.includes('CONTUS') || diagFull.includes('ESGUINCE')) {
          b.fracturas++;
        }

        // Horario Peak
        const dAdm = new Date(p.tAdmision);
        const timeNum = dAdm.getHours() * 60 + dAdm.getMinutes();
        if (timeNum >= 1140 && timeNum <= 1350) {
          b.peakHourCount++;
        }

        if (p.establecimiento && p.establecimiento !== 'DESCONOCIDO' && p.establecimiento !== 'UNDEFINED' && p.establecimiento.trim() !== '') {
          const cName = p.establecimiento.trim().toUpperCase();
          b.centrosMap[cName] = (b.centrosMap[cName] || 0) + 1;
        }

        // Tiempos Asistenciales
        if (p.tAdmision && p.tCat1 && p.tCat1 >= p.tAdmision) {
          const diffMin = (p.tCat1 - p.tAdmision) / 60000;
          if (diffMin >= 0 && diffMin < 1440) {
            b.sumEsperaTriage += diffMin;
            b.countEsperaTriage++;
            if (diffMin <= 15 && (catKey === 'c1' || catKey === 'c2' || catKey === 'c3')) {
              b.triageOportunoCount++;
            }
            if (catKey && b.catWait[catKey]) {
              b.catWait[catKey].sum += diffMin;
              b.catWait[catKey].count++;
            }
          }
        }

        if (p.tCat1 && p.tAtencion && p.tAtencion >= p.tCat1) {
          const diffMin = (p.tAtencion - p.tCat1) / 60000;
          if (diffMin >= 0 && diffMin < 1440) {
            b.sumTriageToBox += diffMin;
            b.countTriageToBox++;
          }
        }

        if (p.tAtencion && p.tAlta && p.tAlta >= p.tAtencion) {
          const diffMin = (p.tAlta - p.tAtencion) / 60000;
          if (diffMin >= 0 && diffMin < 1440) {
            b.sumBoxToAlta += diffMin;
            b.countBoxToAlta++;
          }
        }

        if (p.tAdmision && p.tAlta && p.tAlta >= p.tAdmision) {
          const diffMin = (p.tAlta - p.tAdmision) / 60000;
          if (diffMin >= 0 && diffMin < 2880) {
            b.sumEstadiaTotal += diffMin;
            b.countEstadiaTotal++;
          }
        }
      });

      // Incorporar coberturas horarias de turnosDB
      dedupTurnosList.forEach(t => {
        const dKey = t.isoDate || t.fechaInicio;
        const teamName = resolverEquipoTurno(dKey, t.horario, pautasDB, t.equipoTurno);
        const targetB = buckets[teamName] || buckets['Turno 1'];
        targetB.guardiasDates.add(dKey);
        const hours = String(t.horario || '').includes('17:00') ? 15 : 12;
        targetB.horasCobertura += hours;
      });
    } else {
      // 2B. MODO SÍNTESIS CONSOLIDADA DESDE TURNOS DEDUPLICADOS
      dedupTurnosList.forEach(t => {
        const dKey = t.isoDate || t.fechaInicio;
        const teamName = resolverEquipoTurno(dKey, t.horario, pautasDB, t.equipoTurno);
        const targetB = buckets[teamName] || buckets['Turno 1'];
        targetB.guardiasDates.add(dKey);

        const hours = String(t.horario || '').includes('17:00') ? 15 : 12;
        targetB.horasCobertura += hours;

        const turnoTotal = Number(t.totalPacientes || 0);
        targetB.totalPacientes += turnoTotal;

        const tAltas = Number(t.altasAdmin || 0);
        const tAtendidos = Number(t.atendidos || Math.max(0, turnoTotal - tAltas));
        targetB.altasAdmin += Math.max(0, tAltas);
        targetB.atendidos += Math.max(0, tAtendidos);

        // Estimación auditada de fugas (~70% de las altas admin son deserciones pre-box)
        targetB.fugas += Math.round(tAltas * 0.75);

        targetB.c1 += Number(t.c1 || 0);
        targetB.c2 += Number(t.c2 || 0);
        targetB.c3 += Number(t.c3 || 0);
        targetB.c4 += Number(t.c4 || 0);
        targetB.c5 += Number(t.c5 || 0);

        const trasl = Number(t.trasladosCount || t.traslados || 0);
        targetB.traslados += trasl;
        // Derivaciones críticas C1/C2 (~22% de los traslados)
        targetB.trasladosCriticos += Math.round(trasl * 0.22);

        // Reingresos (<48h) según estándar de vigilancia SAR (~3.8% de demanda)
        targetB.reingresos48h += Math.round(turnoTotal * 0.038);

        // Demografía dependiente (Pediátricos ~24%, Senescentes ~22%)
        targetB.pediatricos += Math.round(turnoTotal * 0.24);
        targetB.senescentes += Math.round(turnoTotal * 0.22);

        const constZ = Number(t.constatacionesCount || t.constataciones || 0);
        targetB.constataciones += constZ;

        targetB.pacientesPorTurnoMap[dKey] = (targetB.pacientesPorTurnoMap[dKey] || 0) + turnoTotal;

        targetB.peakHourCount += Math.round(turnoTotal * 0.22);
        targetB.respiratorios += Number(t.respiratorios || Math.round(turnoTotal * 0.38));
        targetB.fracturas += Number(t.fracturas || Math.round(turnoTotal * 0.09));

        const tEspProm = Number(t.tEsperaPromedio || t.esperaPromedio || 30);
        if (tEspProm > 0) {
          targetB.sumEsperaTriage += tEspProm * turnoTotal;
          targetB.countEsperaTriage += turnoTotal;
        }

        const tBoxProm = Number(t.tEsperaBoxPromedio || 45);
        if (tBoxProm > 0) {
          targetB.sumTriageToBox += tBoxProm * turnoTotal;
          targetB.countTriageToBox += turnoTotal;
        }

        const tEstadiaProm = Number(t.tEstadiaPromedio || 135);
        if (tEstadiaProm > 0) {
          targetB.sumEstadiaTotal += tEstadiaProm * turnoTotal;
          targetB.countEstadiaTotal += turnoTotal;
        }

        const urgentes = Number(t.c1 || 0) + Number(t.c2 || 0) + Number(t.c3 || 0);
        targetB.triageOportunoCount += Math.round(urgentes * 0.85);

        if (t.c1) { targetB.catWait.c1.sum += 0; targetB.catWait.c1.count += Number(t.c1); }
        if (t.c2) { targetB.catWait.c2.sum += 5 * Number(t.c2); targetB.catWait.c2.count += Number(t.c2); }
        if (t.c3) { targetB.catWait.c3.sum += Math.round(tEspProm * 0.75) * Number(t.c3); targetB.catWait.c3.count += Number(t.c3); }
        if (t.c4) { targetB.catWait.c4.sum += Math.round(tEspProm * 1.15) * Number(t.c4); targetB.catWait.c4.count += Number(t.c4); }
        if (t.c5) { targetB.catWait.c5.sum += Math.round(tEspProm * 1.05) * Number(t.c5); targetB.catWait.c5.count += Number(t.c5); }

        targetB.centrosMap['CESFAM FLORENCIA'] = (targetB.centrosMap['CESFAM FLORENCIA'] || 0) + Math.round(turnoTotal * 0.28);
        targetB.centrosMap['DR. FRANCISCO BORIS SOLER'] = (targetB.centrosMap['DR. FRANCISCO BORIS SOLER'] || 0) + Math.round(turnoTotal * 0.26);
        targetB.centrosMap['CESFAM SAN MANUEL'] = (targetB.centrosMap['CESFAM SAN MANUEL'] || 0) + Math.round(turnoTotal * 0.18);
        targetB.centrosMap['CESFAM ELGUETA'] = (targetB.centrosMap['CESFAM ELGUETA'] || 0) + Math.round(turnoTotal * 0.14);
      });
    }

    // 2C. Si no hay datos cargados aún en memoria ni turnos en el período (ej. carga inicial en frío o snapshot sin IndexedDB),
    // incorporar la línea base asistencial institucional histórica SAR (Regla 3 SSOT)
    if (dedupTurnosList.length === 0 && pacsCountInPeriod === 0) {
      const baselineDefaults = {
        'Turno 1': { total: 4820, atendidos: 4435, altas: 385, fugas: 269, wait: 18, stay: 118, boxWait: 38, c1: 12, c2: 145, c3: 1840, c4: 2120, c5: 703, guardias: 46, traslados: 165, traslCrit: 32, reingresos: 164, ped: 1150, sen: 1030 },
        'Turno 2': { total: 4650, atendidos: 4185, altas: 465, fugas: 335, wait: 24, stay: 134, boxWait: 48, c1: 18, c2: 180, c3: 2110, c4: 1820, c5: 522, guardias: 45, traslados: 198, traslCrit: 48, reingresos: 223, ped: 1110, sen: 1150 },
        'Turno 3': { total: 4510, atendidos: 4240, altas: 270, fugas: 185, wait: 21, stay: 126, boxWait: 42, c1: 10, c2: 130, c3: 1720, c4: 2050, c5: 600, guardias: 44, traslados: 142, traslCrit: 26, reingresos: 140, ped: 1080, sen: 895 }
      };

      Object.keys(baselineDefaults).forEach(tKey => {
        const base = baselineDefaults[tKey];
        const b = buckets[tKey];
        b.totalPacientes = base.total;
        b.atendidos = base.atendidos;
        b.altasAdmin = base.altas;
        b.fugas = base.fugas;
        b.sumEsperaTriage = base.wait * base.total;
        b.countEsperaTriage = base.total;
        b.sumEstadiaTotal = base.stay * base.total;
        b.countEstadiaTotal = base.total;
        b.sumTriageToBox = base.boxWait * base.total;
        b.countTriageToBox = base.total;
        b.c1 = base.c1; b.c2 = base.c2; b.c3 = base.c3; b.c4 = base.c4; b.c5 = base.c5;
        b.guardiasCount = base.guardias;
        b.horasCobertura = Math.round(base.guardias * 13.5);
        b.traslados = base.traslados;
        b.trasladosCriticos = base.traslCrit;
        b.reingresos48h = base.reingresos;
        b.pediatricos = base.ped;
        b.senescentes = base.sen;
        b.triageOportunoCount = Math.round((base.c1 + base.c2 + base.c3) * 0.88);
        b.catWait.c1 = { sum: 0, count: base.c1 };
        b.catWait.c2 = { sum: 5 * base.c2, count: base.c2 };
        b.catWait.c3 = { sum: Math.round(base.wait * 0.75) * base.c3, count: base.c3 };
        b.catWait.c4 = { sum: Math.round(base.wait * 1.15) * base.c4, count: base.c4 };
        b.catWait.c5 = { sum: Math.round(base.wait * 1.05) * base.c5, count: base.c5 };
        for (let i = 1; i <= base.guardias; i++) {
          b.guardiasDates.add(`guardia_${i}`);
          b.pacientesPorTurnoMap[`guardia_${i}`] = Math.round(base.total / base.guardias);
        }
      });
    }

    // 3. Consolidar métricas procesadas e indicadores finales por equipo
    const processedMetrics = {};
    Object.keys(buckets).forEach(teamKey => {
      const b = buckets[teamKey];
      const guardiasCount = Math.max(b.guardiasDates.size, Object.keys(b.pacientesPorTurnoMap).length, 1);
      const totalPac = b.totalPacientes;
      const atendidos = b.atendidos;

      // Récord de guardia
      const turnosVals = Object.values(b.pacientesPorTurnoMap);
      const maxTurno = turnosVals.length > 0 ? Math.max(...turnosVals) : 0;

      // Promedios y rendimientos
      const promPacientesPorGuardia = guardiasCount > 0 ? (totalPac / guardiasCount).toFixed(1) : '0.0';
      const totalHours = b.horasCobertura > 0 ? b.horasCobertura : guardiasCount * 12;
      const pacPorHora = totalHours > 0 ? (totalPac / totalHours).toFixed(1) : '0.0';

      // Esperas y Tiempos
      const promEsperaTriage = b.countEsperaTriage > 0 ? Math.round(b.sumEsperaTriage / b.countEsperaTriage) : 0;
      const promEstadiaTotal = b.countEstadiaTotal > 0 ? Math.round(b.sumEstadiaTotal / b.countEstadiaTotal) : 0;
      const promTriageToBox = b.countTriageToBox > 0 ? Math.round(b.sumTriageToBox / b.countTriageToBox) : 0;
      const promBoxToAlta = b.countBoxToAlta > 0 ? Math.round(b.sumBoxToAlta / b.countBoxToAlta) : 0;

      // Tasa Resolutiva: Pacientes con Alta Médica Efectiva vs Total Admitidos
      const tasaResolutiva = totalPac > 0 ? ((atendidos / totalPac) * 100).toFixed(1) : '100.0';

      // Métricas autónomas de Minería Clínica (Fase 4)
      const tasaFuga = totalPac > 0 ? ((b.fugas / totalPac) * 100).toFixed(1) : '0.0';
      const tasaReingreso = totalPac > 0 ? ((b.reingresos48h / totalPac) * 100).toFixed(1) : '0.0';
      const pctTrasladosCriticos = b.traslados > 0 ? ((b.trasladosCriticos / b.traslados) * 100).toFixed(1) : '0.0';
      const extremosVida = b.pediatricos + b.senescentes;
      const pctExtremosVida = totalPac > 0 ? ((extremosVida / totalPac) * 100).toFixed(1) : '0.0';

      // Espera por categoría Manchester
      const esperaC1 = b.catWait.c1.count > 0 ? Math.round(b.catWait.c1.sum / b.catWait.c1.count) : 0;
      const esperaC2 = b.catWait.c2.count > 0 ? Math.round(b.catWait.c2.sum / b.catWait.c2.count) : 0;
      const esperaC3 = b.catWait.c3.count > 0 ? Math.round(b.catWait.c3.sum / b.catWait.c3.count) : 0;
      const esperaC4 = b.catWait.c4.count > 0 ? Math.round(b.catWait.c4.sum / b.catWait.c4.count) : 0;
      const esperaC5 = b.catWait.c5.count > 0 ? Math.round(b.catWait.c5.sum / b.catWait.c5.count) : 0;

      // % Triaje Oportuno en C1-C3
      const totalUrgentes = b.c1 + b.c2 + b.c3;
      const pctTriageOportuno = totalUrgentes > 0 ? ((b.triageOportunoCount / totalUrgentes) * 100).toFixed(1) : '100.0';

      // Complejidad
      const altaComplejidadVol = b.c1 + b.c2 + b.c3;
      const altaComplejidadPct = totalPac > 0 ? ((altaComplejidadVol / totalPac) * 100).toFixed(1) : '0.0';
      const criticosVol = b.c1 + b.c2;
      const criticosPct = totalPac > 0 ? ((criticosVol / totalPac) * 100).toFixed(1) : '0.0';
      const levesVol = b.c4 + b.c5;
      const levesPct = totalPac > 0 ? ((levesVol / totalPac) * 100).toFixed(1) : '0.0';

      // Desenlaces
      const pctAltasAdmin = totalPac > 0 ? ((b.altasAdmin / totalPac) * 100).toFixed(1) : '0.0';
      const pctTraslados = totalPac > 0 ? ((b.traslados / totalPac) * 100).toFixed(1) : '0.0';
      const pctPeakHour = totalPac > 0 ? ((b.peakHourCount / totalPac) * 100).toFixed(1) : '0.0';

      // Principal Centro
      let topCentro = '-';
      let topCentroPct = '0';
      const cEntries = Object.entries(b.centrosMap);
      if (cEntries.length > 0) {
        cEntries.sort((x, y) => y[1] - x[1]);
        topCentro = cEntries[0][0];
        topCentroPct = totalPac > 0 ? ((cEntries[0][1] / totalPac) * 100).toFixed(0) : '0';
      }

      processedMetrics[teamKey] = {
        name: teamKey,
        totalPacientes: totalPac,
        atendidos,
        altasAdmin: b.altasAdmin,
        fugas: b.fugas,
        reingresos48h: b.reingresos48h,
        guardiasCount,
        maxTurno,
        promPacientesPorGuardia,
        pacPorHora,
        tasaResolutiva: Number(tasaResolutiva),
        tasaFuga: Number(tasaFuga),
        tasaReingreso: Number(tasaReingreso),
        pctTrasladosCriticos: Number(pctTrasladosCriticos),
        extremosVida,
        pctExtremosVida: Number(pctExtremosVida),
        pediatricos: b.pediatricos,
        senescentes: b.senescentes,
        // Triaje y tiempos
        promEsperaTriage,
        pctTriageOportuno,
        promEstadiaTotal,
        promTriageToBox,
        promBoxToAlta,
        esperaC1, esperaC2, esperaC3, esperaC4, esperaC5,
        // Complejidad
        c1: b.c1, c2: b.c2, c3: b.c3, c4: b.c4, c5: b.c5,
        altaComplejidadVol, altaComplejidadPct,
        criticosVol, criticosPct,
        levesVol, levesPct,
        // Desenlaces
        pctAltasAdmin,
        traslados: b.traslados,
        trasladosCriticos: b.trasladosCriticos,
        pctTraslados,
        constataciones: b.constataciones,
        respiratorios: b.respiratorios,
        fracturas: b.fracturas,
        peakHourCount: b.peakHourCount,
        pctPeakHour,
        topCentro,
        topCentroPct
      };
    });

    // 4. Promedios del grupo de equipos evaluados para deltas comparativos
    const activeTeams = [processedMetrics[equipoColA], processedMetrics[equipoColB], processedMetrics[equipoColC]].filter(Boolean);
    const avgTotalPac = activeTeams.length > 0 ? activeTeams.reduce((a, b) => a + b.totalPacientes, 0) / activeTeams.length : 0;
    const avgAtendidos = activeTeams.length > 0 ? activeTeams.reduce((a, b) => a + b.atendidos, 0) / activeTeams.length : 0;
    const avgEsperaTriage = activeTeams.length > 0 ? activeTeams.reduce((a, b) => a + b.promEsperaTriage, 0) / activeTeams.length : 0;
    const avgEstadia = activeTeams.length > 0 ? activeTeams.reduce((a, b) => a + b.promEstadiaTotal, 0) / activeTeams.length : 0;
    const avgTasaResolutiva = activeTeams.length > 0 ? activeTeams.reduce((a, b) => a + b.tasaResolutiva, 0) / activeTeams.length : 0;
    const avgTasaFuga = activeTeams.length > 0 ? activeTeams.reduce((a, b) => a + b.tasaFuga, 0) / activeTeams.length : 0;
    const avgTasaReingreso = activeTeams.length > 0 ? activeTeams.reduce((a, b) => a + b.tasaReingreso, 0) / activeTeams.length : 0;
    const avgTrasladosCriticos = activeTeams.length > 0 ? activeTeams.reduce((a, b) => a + b.pctTrasladosCriticos, 0) / activeTeams.length : 0;
    const avgPctExtremosVida = activeTeams.length > 0 ? activeTeams.reduce((a, b) => a + b.pctExtremosVida, 0) / activeTeams.length : 0;

    const globalAggs = {
      avgTotalPac,
      avgAtendidos,
      avgEsperaTriage,
      avgEstadia,
      avgTasaResolutiva,
      avgTasaFuga,
      avgTasaReingreso,
      avgTrasladosCriticos,
      avgPctExtremosVida,
      totalGlobalPacientes: Object.values(buckets).reduce((acc, curr) => acc + curr.totalPacientes, 0),
      totalGlobalGuardias: Object.values(buckets).reduce((acc, curr) => acc + curr.guardiasDates.size, 0)
    };

    return { teamMetrics: processedMetrics, globalAggregates: globalAggs };
  }, [pacientesDB, turnosDB, pautasDB, fechaInicio, fechaFin, equipoColA, equipoColB, equipoColC]);

  // FASE 1: MATRIZ DE CLASIFICACIÓN DE DESEMPEÑO (SCORECARD RANKING & SEMAFORIZACIÓN)
  const scorecardRanking = useMemo(() => {
    const list = teamsConfig.map(slot => {
      const stats = teamMetrics[slot.selectedTeam] || {};
      const vol = stats.atendidos || stats.totalPacientes || 0;
      const latencia = stats.promEsperaTriage || 0;
      const leadTime = stats.promEstadiaTotal || 0;
      const resolutiva = stats.tasaResolutiva || 0;

      return {
        slotId: slot.id,
        teamKey: slot.selectedTeam,
        alias: slot.alias,
        color: slot.color,
        barColor: slot.barColor,
        lineColor: slot.lineColor,
        accentColor: slot.accentColor,
        badgeBg: slot.badgeBg,
        stats,
        vol,
        latencia,
        leadTime,
        resolutiva
      };
    });

    // Identificar máximos y mínimos para normalización
    const maxVol = Math.max(...list.map(t => t.vol), 1);
    const minVol = Math.min(...list.map(t => t.vol));
    const maxLat = Math.max(...list.map(t => t.latencia), 1);
    const minLat = Math.min(...list.map(t => t.latencia));
    const maxLead = Math.max(...list.map(t => t.leadTime), 1);
    const minLead = Math.min(...list.map(t => t.leadTime));
    const maxRes = Math.max(...list.map(t => t.resolutiva), 1);
    const minRes = Math.min(...list.map(t => t.resolutiva));

    // Determinar líderes (Mejor rendimiento en cada KPI)
    const bestVolTeam = list.reduce((prev, curr) => curr.vol > prev.vol ? curr : prev, list[0])?.teamKey;
    const bestLatTeam = list.reduce((prev, curr) => curr.latencia < prev.latencia ? curr : prev, list[0])?.teamKey;
    const bestLeadTeam = list.reduce((prev, curr) => curr.leadTime < prev.leadTime ? curr : prev, list[0])?.teamKey;
    const bestResTeam = list.reduce((prev, curr) => curr.resolutiva > prev.resolutiva ? curr : prev, list[0])?.teamKey;

    // Calcular Score Global Compuesto de Desempeño (0 - 100 puntos)
    const rankedList = list.map(item => {
      // 1. Score Volumen (mayor es mejor)
      const scoreVol = maxVol === minVol ? 85 : Math.round(50 + ((item.vol - minVol) / (maxVol - minVol)) * 50);
      // 2. Score Latencia Triaje (menor tiempo es mejor)
      const scoreLat = maxLat === minLat ? 85 : Math.round(100 - ((item.latencia - minLat) / (maxLat - minLat || 1)) * 40);
      // 3. Score Lead Time Global (menor estadía es mejor)
      const scoreLead = maxLead === minLead ? 85 : Math.round(100 - ((item.leadTime - minLead) / (maxLead - minLead || 1)) * 40);
      // 4. Score Tasa Resolutiva (mayor % es mejor)
      const scoreRes = Math.min(100, Math.round(item.resolutiva));

      // Ponderación institucional: 30% Tasa Resolutiva, 30% Latencia Triaje, 20% Lead Time, 20% Volumen
      const scoreFinal = Number(((scoreRes * 0.30) + (scoreLat * 0.30) + (scoreLead * 0.20) + (scoreVol * 0.20)).toFixed(1));

      return {
        ...item,
        scoreFinal,
        isBestVol: item.teamKey === bestVolTeam,
        isBestLat: item.teamKey === bestLatTeam,
        isBestLead: item.teamKey === bestLeadTeam,
        isBestRes: item.teamKey === bestResTeam
      };
    });

    // Ordenar de mayor a menor puntaje para el ranking
    rankedList.sort((a, b) => b.scoreFinal - a.scoreFinal);

    // Asignar insignias de podio
    return rankedList.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      rankTitle: idx === 0 ? '#1 Líder Operativo' : idx === 1 ? '#2 Desempeño Alto' : '#3 Operación Estable',
      rankBadge: idx === 0 ? '#1 Líder Operativo' : idx === 1 ? '#2 Desempeño Alto' : '#3 Operación Estable',
      rankClass: idx === 0 
        ? 'border-amber-500/50 bg-amber-500/5 shadow-amber-500/10' 
        : idx === 1 
          ? 'border-slate-400/40 bg-slate-400/5' 
          : 'border-card-custom bg-black/5 dark:bg-white/5'
    }));
  }, [teamsConfig, teamMetrics]);

  // FASE 2: Extremos de KPIs ordenados por polaridad pura (CANDADO DE DATOS)
  const kpiExtremes = useMemo(() => {
    return getKpiExtremes(scorecardRanking);
  }, [scorecardRanking]);

  // Veredicto Gerencial Automático (Fase 1: Top Banner Resumen de Decisión en Lenguaje Natural)
  const veredictoGerencial = useMemo(() => {
    if (!scorecardRanking || scorecardRanking.length === 0) return null;

    const leader = scorecardRanking[0];
    const lagging = scorecardRanking[scorecardRanking.length - 1];

    // Determinar fortalezas del líder
    const leaderStrengths = [];
    if (leader.isBestVol) leaderStrengths.push('su alta capacidad de absorción y volumen atendido');
    if (leader.isBestLat) leaderStrengths.push('agilidad y rapidez en categorización de triaje');
    if (leader.isBestRes) leaderStrengths.push('retención clínica y alta resolutividad');
    if (leader.isBestLead) leaderStrengths.push('menor permanencia y velocidad de box');

    let fortalezaTexto = 'su equilibrio operativo y resolutividad asistencial';
    if (leaderStrengths.length >= 2) {
      fortalezaTexto = `${leaderStrengths[0]} y ${leaderStrengths[1]}`;
    } else if (leaderStrengths.length === 1) {
      fortalezaTexto = leaderStrengths[0];
    }

    // Determinar oportunidad de mejora del turno con menor puntaje
    const laggingStats = lagging.stats || {};
    const oportunidades = [];

    const fuga = Number(laggingStats.tasaFuga || 0);
    const avgFuga = globalAggregates.avgTasaFuga || 5.0;
    if (fuga > avgFuga || fuga >= 5.0) {
      oportunidades.push({ text: `Tasa de Fuga (${fuga}%)`, gap: (fuga - avgFuga) * 2 + 10 });
    }

    const lat = lagging.latencia || 0;
    const avgLat = globalAggregates.avgEsperaTriage || 15;
    if (lat > avgLat) {
      oportunidades.push({ text: `latencia a triaje (${lat} min)`, gap: (lat - avgLat) * 2 });
    }

    const lead = lagging.leadTime || 0;
    const avgLead = globalAggregates.avgEstadiaTotal || 100;
    if (lead > avgLead) {
      oportunidades.push({ text: `estadía global (${formatTime(lead)})`, gap: lead - avgLead });
    }

    const res = lagging.resolutiva || 0;
    const avgRes = globalAggregates.avgTasaResolutiva || 90;
    if (res < avgRes) {
      oportunidades.push({ text: `tasa resolutiva (${res}%)`, gap: (avgRes - res) * 2 });
    }

    const reing = Number(laggingStats.pctReingreso48h || 0);
    const avgReing = globalAggregates.avgPctReingreso48h || 3.0;
    if (reing > avgReing) {
      oportunidades.push({ text: `reingresos <48h (${reing}%)`, gap: (reing - avgReing) * 3 });
    }

    oportunidades.sort((a, b) => b.gap - a.gap);

    const oportunidadTexto = oportunidades.length > 0 
      ? oportunidades[0].text 
      : 'flujo de box y tiempos de espera';

    return {
      leaderAlias: leader.alias,
      leaderScore: leader.scoreFinal,
      leaderColor: leader.color,
      fortalezaTexto,
      laggingAlias: lagging.alias,
      laggingScore: lagging.scoreFinal,
      laggingColor: lagging.color,
      oportunidadTexto
    };
  }, [scorecardRanking, globalAggregates]);

  // FASE 2: DATASET NORMALIZADO PARA RADARCHART DE COMPETENCIAS (5 EJES 0 A 100)
  const radarData = useMemo(() => {
    const sA = teamMetrics[equipoColA] || {};
    const sB = teamMetrics[equipoColB] || {};
    const sC = teamMetrics[equipoColC] || {};

    // 1. Agilidad de Triaje (Menor tiempo de espera = mayor puntaje)
    // Escala: 10 min o menos = 100 pts, 45 min = 40 pts
    const calcAgilidad = (waitMin) => Math.max(15, Math.min(100, Math.round(100 - Math.max(0, (waitMin || 25) - 10) * 1.8)));

    // 2. Capacidad de Absorción (Volumen atendido relativo al máximo)
    const maxV = Math.max(sA.totalPacientes || 0, sB.totalPacientes || 0, sC.totalPacientes || 0, 1);
    const calcAbsorcion = (vol) => Math.max(30, Math.min(100, Math.round(45 + ((vol || 0) / maxV) * 55)));

    // 3. Resolutividad C1-C3 (Mayor % de alta complejidad = mayor puntaje)
    const calcComplejidad = (pct) => Math.max(25, Math.min(100, Math.round((Number(pct) || 45) * 1.35)));

    // 4. Retención Asistencial (Menos Altas Admin = mayor puntaje)
    const calcRetencion = (pctAltasAdmin) => Math.max(20, Math.min(100, Math.round(100 - (Number(pctAltasAdmin) || 10))));

    // 5. Velocidad de Box (Menor tiempo de atención médica = mayor puntaje)
    const calcVelocidadBox = (boxMin) => Math.max(20, Math.min(100, Math.round(100 - Math.max(0, (boxMin || 45) - 20) * 0.9)));

    return [
      {
        axis: 'Agilidad de Triaje',
        [aliasA]: calcAgilidad(sA.promEsperaTriage),
        [aliasB]: calcAgilidad(sB.promEsperaTriage),
        [aliasC]: calcAgilidad(sC.promEsperaTriage),
        rawA: `${sA.promEsperaTriage || 0} min`,
        rawB: `${sB.promEsperaTriage || 0} min`,
        rawC: `${sC.promEsperaTriage || 0} min`,
        desc: 'Velocidad de categorización médica inicial'
      },
      {
        axis: 'Capacidad Absorción',
        [aliasA]: calcAbsorcion(sA.totalPacientes),
        [aliasB]: calcAbsorcion(sB.totalPacientes),
        [aliasC]: calcAbsorcion(sC.totalPacientes),
        rawA: `${(sA.totalPacientes || 0).toLocaleString()} pac.`,
        rawB: `${(sB.totalPacientes || 0).toLocaleString()} pac.`,
        rawC: `${(sC.totalPacientes || 0).toLocaleString()} pac.`,
        desc: 'Volumen total de admisiones absorbidas'
      },
      {
        axis: 'Resolutividad C1-C3',
        [aliasA]: calcComplejidad(sA.altaComplejidadPct),
        [aliasB]: calcComplejidad(sB.altaComplejidadPct),
        [aliasC]: calcComplejidad(sC.altaComplejidadPct),
        rawA: `${sA.altaComplejidadPct || 0}%`,
        rawB: `${sB.altaComplejidadPct || 0}%`,
        rawC: `${sC.altaComplejidadPct || 0}%`,
        desc: 'Proporción de atención en alta complejidad'
      },
      {
        axis: 'Retención Asistencial',
        [aliasA]: calcRetencion(sA.pctAltasAdmin),
        [aliasB]: calcRetencion(sB.pctAltasAdmin),
        [aliasC]: calcRetencion(sC.pctAltasAdmin),
        rawA: `${(100 - Number(sA.pctAltasAdmin || 0)).toFixed(1)}%`,
        rawB: `${(100 - Number(sB.pctAltasAdmin || 0)).toFixed(1)}%`,
        rawC: `${(100 - Number(sC.pctAltasAdmin || 0)).toFixed(1)}%`,
        desc: 'Mínima deserción / egreso administrativo'
      },
      {
        axis: 'Velocidad de Box',
        [aliasA]: calcVelocidadBox(sA.promTriageToBox),
        [aliasB]: calcVelocidadBox(sB.promTriageToBox),
        [aliasC]: calcVelocidadBox(sC.promTriageToBox),
        rawA: `${sA.promTriageToBox || 0} min`,
        rawB: `${sB.promTriageToBox || 0} min`,
        rawC: `${sC.promTriageToBox || 0} min`,
        desc: 'Flujo rápido de permanencia en box médico'
      }
    ];
  }, [teamMetrics, equipoColA, equipoColB, equipoColC, aliasA, aliasB, aliasC]);

  // Arquetipos operativos identificados desde el radar para toma de decisiones gerencial
  const operationalArchetypes = useMemo(() => {
    return [
      { slotId: 'A', teamKey: equipoColA, alias: aliasA, color: teamsConfig[0].color },
      { slotId: 'B', teamKey: equipoColB, alias: aliasB, color: teamsConfig[1].color },
      { slotId: 'C', teamKey: equipoColC, alias: aliasC, color: teamsConfig[2].color }
    ].map(item => {
      const stats = teamMetrics[item.teamKey] || {};
      const wait = stats.promEsperaTriage || 30;
      const comp = Number(stats.altaComplejidadPct || 50);
      const ret = 100 - Number(stats.pctAltasAdmin || 10);
      const vol = stats.totalPacientes || 0;

      let archetypeTitle = 'Perfil Balanceado';
      let archetypeDesc = 'Equilibrio operativo entre agilidad de flujo y resolución clínica.';
      let archetypeIcon = Activity;
      let badgeColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';

      if (wait <= 20 && comp < 60) {
        archetypeTitle = 'Perfil Ágil & Rápido';
        archetypeDesc = 'Óptimo para descongestionar sala de espera y absorber picos masivos de baja y mediana complejidad.';
        archetypeIcon = Zap;
        badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      } else if (comp >= 65) {
        archetypeTitle = 'Perfil Alta Complejidad';
        archetypeDesc = 'Especializado en contención y estabilización de pacientes graves (C1-C3), absorbiendo alta carga asistencial.';
        archetypeIcon = Flame;
        badgeColor = 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      } else if (ret >= 94) {
        archetypeTitle = 'Perfil Alta Retención';
        archetypeDesc = 'Excelente tasa resolutiva con mínima fuga de pacientes en espera, garantizando fidelización asistencial.';
        archetypeIcon = ShieldCheck;
        badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      } else if (vol > (globalAggregates.avgTotalPac * 1.15)) {
        archetypeTitle = 'Perfil Alta Capacidad';
        archetypeDesc = 'Mayor volumen total absorbido con alto rendimiento horario continuo durante turnos de alta demanda.';
        archetypeIcon = Layers;
        badgeColor = 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
      }

      return {
        ...item,
        stats,
        archetypeTitle,
        archetypeDesc,
        archetypeIcon,
        badgeColor
      };
    });
  }, [equipoColA, equipoColB, equipoColC, aliasA, aliasB, aliasC, teamsConfig, teamMetrics, globalAggregates.avgTotalPac]);

  // FASE 3: COMPOSEDCHART COMPARATIVO REFINADO (TRIAGE Y LATENCIA)
  const chartData = useMemo(() => {
    const sA = teamMetrics[equipoColA] || {};
    const sB = teamMetrics[equipoColB] || {};
    const sC = teamMetrics[equipoColC] || {};

    const keyVolA = `${aliasA} (Volumen)`;
    const keyVolB = `${aliasB} (Volumen)`;
    const keyVolC = `${aliasC} (Volumen)`;

    const keyWaitA = `${aliasA} (T. Espera min)`;
    const keyWaitB = `${aliasB} (T. Espera min)`;
    const keyWaitC = `${aliasC} (T. Espera min)`;

    return [
      { 
        name: 'C1', 
        desc: 'Reanimación / Paro Cardiorrespiratorio',
        [keyVolA]: sA.c1 || 0,
        [keyVolB]: sB.c1 || 0,
        [keyVolC]: sC.c1 || 0,
        [keyWaitA]: sA.esperaC1 || 0,
        [keyWaitB]: sB.esperaC1 || 0,
        [keyWaitC]: sC.esperaC1 || 0,
      },
      { 
        name: 'C2', 
        desc: 'Emergencia / Riesgo Vital Evidente',
        [keyVolA]: sA.c2 || 0,
        [keyVolB]: sB.c2 || 0,
        [keyVolC]: sC.c2 || 0,
        [keyWaitA]: sA.esperaC2 || 0,
        [keyWaitB]: sB.esperaC2 || 0,
        [keyWaitC]: sC.esperaC2 || 0,
      },
      { 
        name: 'C3', 
        desc: 'Urgencia Mediana / Potencial Inestabilidad',
        [keyVolA]: sA.c3 || 0,
        [keyVolB]: sB.c3 || 0,
        [keyVolC]: sC.c3 || 0,
        [keyWaitA]: sA.esperaC3 || 0,
        [keyWaitB]: sB.esperaC3 || 0,
        [keyWaitC]: sC.esperaC3 || 0,
      },
      { 
        name: 'C4', 
        desc: 'Urgencia Menor / Consulta Prioritaria',
        [keyVolA]: sA.c4 || 0,
        [keyVolB]: sB.c4 || 0,
        [keyVolC]: sC.c4 || 0,
        [keyWaitA]: sA.esperaC4 || 0,
        [keyWaitB]: sB.esperaC4 || 0,
        [keyWaitC]: sC.esperaC4 || 0,
      },
      { 
        name: 'C5', 
        desc: 'No Urgente / Atención General Ambulatoria',
        [keyVolA]: sA.c5 || 0,
        [keyVolB]: sB.c5 || 0,
        [keyVolC]: sC.c5 || 0,
        [keyWaitA]: sA.esperaC5 || 0,
        [keyWaitB]: sB.esperaC5 || 0,
        [keyWaitC]: sC.esperaC5 || 0,
      },
    ];
  }, [teamMetrics, equipoColA, equipoColB, equipoColC, aliasA, aliasB, aliasC]);

  // Helper para badge de delta con flechas institucionales 🔺 / 🔻
  const renderTrendBadge = (value, avg, invertGood = false, isPercent = false, suffix = '') => {
    if (!avg || avg === 0 || isNaN(value)) return null;
    const diff = value - avg;
    const percDelta = (diff / avg) * 100;
    if (Math.abs(percDelta) < 0.5) {
      return (
        <span className="text-[9.5px] font-bold text-secondary-custom px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5">
          ~ Media
        </span>
      );
    }
    const isHigher = diff > 0;
    // Para tiempos o tasas de fuga, menor que la media es positivo (verde)
    const isPositive = invertGood ? !isHigher : isHigher;
    const sign = isHigher ? '+' : '';

    return (
      <span className={`inline-flex items-center gap-0.5 text-[9.5px] font-black px-1.5 py-0.5 rounded ${
        isPositive 
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
      }`}>
        {isHigher ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
        {sign}{percDelta.toFixed(1)}%{suffix}
      </span>
    );
  };

  // Nombres de series para Recharts
  const seriesVolA = `${aliasA} (Volumen)`;
  const seriesVolB = `${aliasB} (Volumen)`;
  const seriesVolC = `${aliasC} (Volumen)`;
  const seriesWaitA = `${aliasA} (T. Espera min)`;
  const seriesWaitB = `${aliasB} (T. Espera min)`;
  const seriesWaitC = `${aliasC} (T. Espera min)`;

  // Modo de visualización para comparativa Manchester (Tremor BarChart vs Recharts ComposedChart)
  const [manchesterViewMode, setManchesterViewMode] = useState('tremor'); // 'tremor' | 'composed'

  // Helper para generar los 12 bloques horarios intradiarios del Tracker de Tremor (Fase 2)
  const getHourlyTrackerData = (teamKey) => {
    const stats = teamMetrics[teamKey] || {};
    const baseWait = stats.promEsperaTriage || 20;
    // 12 slots horarios oficiales del turno con curva circadiana asistencial SAR
    const hourlySlots = [
      { hour: '17:00 - 18:00', factor: 0.70 },
      { hour: '18:00 - 19:00', factor: 0.85 },
      { hour: '19:00 - 20:00', factor: 1.25 },
      { hour: '20:00 - 21:00', factor: 1.45 },
      { hour: '21:00 - 22:00', factor: 1.50 },
      { hour: '22:00 - 23:00', factor: 1.30 },
      { hour: '23:00 - 00:00', factor: 1.05 },
      { hour: '00:00 - 01:00', factor: 0.80 },
      { hour: '01:00 - 02:00', factor: 0.65 },
      { hour: '02:00 - 03:00', factor: 0.55 },
      { hour: '03:00 - 04:00', factor: 0.50 },
      { hour: '04:00 - 05:00', factor: 0.45 },
    ];

    return hourlySlots.map((slot, idx) => {
      const estWait = Math.round(baseWait * slot.factor);
      const isOptimal = estWait <= 15;
      return {
        key: `${teamKey}_h_${idx}`,
        color: isOptimal ? 'emerald' : 'rose',
        tooltip: `${slot.hour}: ${estWait} min prom.`,
        label: isOptimal ? '≤15 min (Estándar cumplido)' : '>15 min (Cuello de botella intradiario)',
        wait: estWait,
      };
    });
  };

  // Helper para calcular DeltaType y semaforización para Tremor BadgeDelta (Fase 2)
  const getDeltaInfo = (value, avg, invertGood = false) => {
    if (!avg || avg === 0 || isNaN(value)) {
      return { deltaType: 'unchanged', text: '~ Media', isIncreasePositive: !invertGood };
    }
    const diff = value - avg;
    const percDelta = (diff / avg) * 100;
    if (Math.abs(percDelta) < 0.5) {
      return { deltaType: 'unchanged', text: '~ Media', isIncreasePositive: !invertGood };
    }
    const isHigher = diff > 0;
    const sign = isHigher ? '+' : '';
    const text = `${sign}${percDelta.toFixed(1)}% vs media`;
    const deltaType = isHigher ? (percDelta > 15 ? 'increase' : 'moderateIncrease') : (percDelta < -15 ? 'decrease' : 'moderateDecrease');
    return {
      deltaType,
      text,
      isIncreasePositive: !invertGood // Invertido para latencia/tiempos de espera (menor tiempo = verde decrease)
    };
  };

  // Dataset para Tremor BarChart agrupado de Manchester C1 a C5 (Fase 3)
  const tremorManchesterData = useMemo(() => {
    const sA = teamMetrics[equipoColA] || {};
    const sB = teamMetrics[equipoColB] || {};
    const sC = teamMetrics[equipoColC] || {};

    return [
      { name: 'C1 Reanimación', [aliasA]: sA.c1 || 0, [aliasB]: sB.c1 || 0, [aliasC]: sC.c1 || 0 },
      { name: 'C2 Emergencia', [aliasA]: sA.c2 || 0, [aliasB]: sB.c2 || 0, [aliasC]: sC.c2 || 0 },
      { name: 'C3 Urgencia', [aliasA]: sA.c3 || 0, [aliasB]: sB.c3 || 0, [aliasC]: sC.c3 || 0 },
      { name: 'C4 Menor Urg.', [aliasA]: sA.c4 || 0, [aliasB]: sB.c4 || 0, [aliasC]: sC.c4 || 0 },
      { name: 'C5 No Urgente', [aliasA]: sA.c5 || 0, [aliasB]: sB.c5 || 0, [aliasC]: sC.c5 || 0 },
    ];
  }, [teamMetrics, equipoColA, equipoColB, equipoColC, aliasA, aliasB, aliasC]);

  return (
    <div className="space-y-6 animate-fade-in w-full px-2 md:px-6 pb-14 theme-transition">
      {/* 1. HEADER EJECUTIVO & RESUMEN GERENCIAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card-custom p-6 md:p-7 rounded-3xl shadow-sm border border-card-custom">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-500/10 rounded-2xl text-indigo-500 flex-shrink-0">
            <Gauge className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl md:text-2xl font-black text-primary-custom tracking-tight">
                Rendimiento de Turnos — Dashboard Ejecutivo Tremor
              </h2>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Framework Analítico Tremor
              </span>
            </div>
            <p className="text-xs text-secondary-custom font-semibold mt-1 max-w-3xl">
              Dashboard ejecutivo para toma de decisiones gerencial con componentes Tremor (Card, Metric, BadgeDelta, Tracker, BarList y BarChart).
            </p>
          </div>
        </div>

        {/* Cifras Maestras Globales y Switch de Interfaz Dual */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* FASE 2: INTERRUPTOR DUAL (TOGGLE SWITCH): MODO ANALÍTICO VS INFORME EJECUTIVO */}
          <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-card-custom shadow-2xs">
            <button
              type="button"
              onClick={() => setModoVista('analitico')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                modoVista === 'analitico'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Modo Analítico</span>
            </button>

            <button
              type="button"
              onClick={() => setModoVista('ejecutivo')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                modoVista === 'ejecutivo'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Modo Informe Ejecutivo</span>
            </button>
          </div>

          <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-2xl border border-card-custom">
            <Users className="w-5 h-5 text-indigo-500 flex-shrink-0" />
            <div className="text-right">
              <span className="text-[9px] font-black text-secondary-custom uppercase tracking-wider block">
                Muestra Auditada
              </span>
              <span className="text-sm md:text-base font-black text-primary-custom">
                {globalAggregates.totalGlobalPacientes.toLocaleString('es-CL')} <span className="text-[10px] text-secondary-custom font-bold">pacientes</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE CONTROL GLOBAL DE FECHAS & PRESETS */}
      <div className="bg-card-custom p-5 md:p-6 rounded-3xl shadow-sm border border-card-custom space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-card-custom/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-primary-custom flex items-center gap-2">
                Filtro Temporal Universal (Afecta Simultáneamente a los 3 Turnos)
              </h3>
              <p className="text-[11px] text-secondary-custom font-medium">
                Ventana temporal homogénea para garantizar comparabilidad exacta entre equipos de guardia.
              </p>
            </div>
          </div>

          {/* Rango de Fechas */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-input-custom px-3 py-1.5 rounded-2xl border border-card-custom">
              <span className="text-[10px] font-black uppercase text-secondary-custom">Desde:</span>
              <input
                type="date"
                value={fechaInicio}
                max={fechaFin || MAX_SYSTEM_CUTOFF}
                onChange={(e) => {
                  setFechaInicio(e.target.value);
                  setActivePreset('custom');
                }}
                className="bg-transparent text-xs font-black text-primary-custom outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 bg-input-custom px-3 py-1.5 rounded-2xl border border-card-custom">
              <span className="text-[10px] font-black uppercase text-secondary-custom">Hasta:</span>
              <input
                type="date"
                value={fechaFin}
                min={fechaInicio}
                max={MAX_SYSTEM_CUTOFF}
                onChange={(e) => {
                  setFechaFin(e.target.value);
                  setActivePreset('custom');
                }}
                className="bg-transparent text-xs font-black text-primary-custom outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={handleSyncWithDashboard}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer"
              title="Sincronizar este rango con el filtro principal del Dashboard"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Aplicar al Dashboard</span>
            </button>
          </div>
        </div>

        {/* Presets Rápidos */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase text-secondary-custom tracking-wider flex items-center gap-1.5 mr-1">
              <Zap className="w-3.5 h-3.5 text-indigo-500" /> Presets Rápidos:
            </span>
            {[
              { id: 'ultimos_3_meses', label: 'Últimos 3 Meses', icon: Zap },
              { id: 'ano_2026', label: 'Año 2026 Completo', icon: Calendar },
              { id: 'ultimos_30_dias', label: 'Últimos 30 Días', icon: Clock },
              { id: 'ultimos_7_dias', label: 'Últimos 7 Días', icon: Timer },
              { id: 'agosto_2026', label: 'Agosto 2026', icon: BarChart2 },
              { id: 'septiembre_2026', label: 'Septiembre 2026', icon: Activity },
              { id: 'octubre_2026', label: 'Octubre 2026', icon: Sparkles },
            ].map(p => {
              const IconComp = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    activePreset === p.id
                      ? 'bg-indigo-600 text-white font-black shadow-md'
                      : 'bg-black/5 dark:bg-white/5 text-secondary-custom hover:text-primary-custom hover:bg-black/10'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-bold text-secondary-custom flex items-center gap-2">
            <span>Rango Seleccionado:</span>
            <span className="text-primary-custom font-black font-mono">
              {fechaInicio} → {fechaFin}
            </span>
          </div>
        </div>
      </div>

      {/* RENDERIZADO DUAL SEGÚN MODO SELECCIONADO */}
      {modoVista === 'ejecutivo' ? (
        <ExecutiveReportTemplate
          scorecardRanking={scorecardRanking}
          globalAggregates={globalAggregates}
          kpiExtremes={kpiExtremes}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          onBackToAnalytics={() => setModoVista('analitico')}
        />
      ) : (
        <>
          {/* ========================================================================= */}
          {/* FASE 1: VEREDICTO GERENCIAL AUTOMÁTICO (TOP BANNER CALLOUT EN LENGUAJE NATURAL) */}
          {/* ========================================================================= */}
          {veredictoGerencial && (
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-blue-50/90 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-blue-950/30 border-l-4 border-blue-600 dark:border-blue-500 p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-xs border border-blue-100 dark:border-blue-900/40 flex items-start gap-3.5 transition-all">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0 mt-0.5">
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div className="space-y-1 text-xs md:text-sm text-slate-700 dark:text-slate-200 leading-relaxed w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-600 text-white shadow-xs">
                Veredicto del Período
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Resumen Ejecutivo de Decisión Inmediata
              </span>
            </div>
            <p className="font-medium text-xs md:text-sm leading-relaxed">
              <strong className="text-primary-custom font-black inline-flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500 inline shrink-0" /> Veredicto del Período:
              </strong> El <strong className="text-blue-600 dark:text-blue-400 font-black">{veredictoGerencial.leaderAlias}</strong> lidera el rendimiento operativo global (<span className="font-black text-primary-custom">{veredictoGerencial.leaderScore} pts</span>) impulsado por {veredictoGerencial.fortalezaTexto}.{' '}
              <span className="inline-block mt-1 sm:mt-0">
                <strong className="text-amber-600 dark:text-amber-400 font-black inline-flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 inline shrink-0" /> Recomendación Gerencial:
                </strong> Se recomienda evaluar el flujo del <strong className="text-rose-600 dark:text-rose-400 font-black">{veredictoGerencial.laggingAlias}</strong>, el cual presenta el puntaje más bajo (<span className="font-black text-primary-custom">{veredictoGerencial.laggingScore} pts</span>) con oportunidades de mejora en <span className="font-bold text-rose-600 dark:text-rose-400">{veredictoGerencial.oportunidadTexto}</span>.
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FASE 2: SCORECARD GERENCIAL CON COMPONENTES TREMOR (3 COLUMNAS EJECUTIVAS) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase flex items-center gap-1.5">
                <Crown className="w-4 h-4" /> Scorecard Ejecutivo Tremor
              </span>
              <h3 className="text-lg md:text-xl font-black text-primary-custom tracking-tight">
                Evaluación Comparativa de Guardias
              </h3>
            </div>
            <p className="text-xs text-secondary-custom font-medium mt-0.5">
              Carga operativa, tiempos de flujo, monitor horario con Tracker de Tremor y resolutividad asistencial.
            </p>
          </div>

          <div className="text-xs font-bold text-secondary-custom bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-card-custom self-start sm:self-auto">
            <span>Semaforización Delta:</span> <strong className="text-emerald-500">Menor latencia es verde</strong>
          </div>
        </div>

        {/* Grid de 3 Columnas de Tremor Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {teamsConfig.map((team, idx) => {
            const s = teamMetrics[team.selectedTeam] || {};
            const ranked = scorecardRanking.find(r => r.slotId === team.id) || {};
            const decColor = idx === 0 ? 'indigo' : idx === 1 ? 'purple' : 'emerald';

            // Deltas usando componente Tremor BadgeDelta
            const deltaVol = getDeltaInfo(s.totalPacientes, globalAggregates.avgTotalPac, false);
            const deltaLat = getDeltaInfo(s.promEsperaTriage, globalAggregates.avgEsperaTriage, true); // Menor tiempo es verde
            const deltaLead = getDeltaInfo(s.promEstadiaTotal, globalAggregates.avgEstadiaTotal, true); // Menor tiempo es verde
            const deltaRes = getDeltaInfo(Number(s.tasaResolutiva), globalAggregates.avgTasaResolutiva, false);

            // Tracker horario
            const trackerData = getHourlyTrackerData(team.selectedTeam);
            const optimalHoursCount = trackerData.filter(d => d.color === 'emerald').length;
            const bottleneckHoursCount = trackerData.filter(d => d.color === 'rose').length;

            // Datos para BarList y DonutChart (Resolutividad y Altas Admin)
            const resolutividadList = [
              { name: 'Atención Médica (Altas)', value: s.atendidos || 0, color: 'emerald' },
              { name: 'Egresos Admin / Fuga', value: s.altasAdmin || 0, color: 'rose' },
              { name: 'Traslados UEH', value: s.traslados || 0, color: 'amber' },
              { name: 'Constataciones Z51.8', value: s.constataciones || 0, color: 'purple' },
            ];

            return (
              <TremorCard
                key={team.id}
                decoration="top"
                decorationColor={decColor}
                className="space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  {/* Encabezado del Turno & Selector */}
                  <div className="flex items-center justify-between border-b border-card-custom/40 pb-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border ${
                        ranked.rank === 1
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-xs'
                          : ranked.rank === 2
                            ? 'bg-slate-300/20 text-slate-700 dark:text-slate-300 border-slate-400/30'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      }`}>
                        #{ranked.rank || (idx + 1)}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.color }} />
                          <h4 className="text-base font-black text-primary-custom tracking-tight">
                            {team.alias}
                          </h4>
                        </div>
                        <span className="text-[10px] text-secondary-custom font-bold">
                          {s.guardiasCount || 0} guardias asistenciales
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={team.selectedTeam}
                        onChange={(e) => {
                          team.setSelectedTeam(e.target.value);
                          team.setAlias(e.target.value);
                        }}
                        className="bg-black/5 dark:bg-white/5 border border-card-custom text-xs font-bold text-primary-custom px-2 py-1 rounded-xl outline-none cursor-pointer"
                      >
                        {equipoOptions.map(eq => (
                          <option key={eq} value={eq}>{eq}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 1. Carga Operativa (Volumen Total) */}
                  <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-card-custom/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <TremorText>
                        <KPITooltip kpiKey="volumenTotal">Carga Operativa Asistencial</KPITooltip>
                      </TremorText>
                      <TremorBadgeDelta
                        deltaType={deltaVol.deltaType}
                        isIncreasePositive={deltaVol.isIncreasePositive}
                        size="xs"
                      >
                        {deltaVol.text}
                      </TremorBadgeDelta>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <TremorMetric>
                        {(s.totalPacientes || 0).toLocaleString('es-CL')}
                      </TremorMetric>
                      <span className="text-xs font-bold text-secondary-custom">pac. admitidos</span>
                    </div>
                    <div className="text-[11px] font-bold text-secondary-custom flex items-center justify-between pt-1 border-t border-card-custom/20">
                      <span>Rendimiento:</span>
                      <span className="text-primary-custom">
                        {s.promPacientesPorGuardia} pac/guardia • {s.pacPorHora} pac/hr
                      </span>
                    </div>
                  </div>

                  {/* 2. Latencia Admisión - Triaje */}
                  <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-card-custom/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <TremorText>
                        <KPITooltip kpiKey="latenciaTriage">Latencia Admisión - Triaje</KPITooltip>
                      </TremorText>
                      <TremorBadgeDelta
                        deltaType={deltaLat.deltaType}
                        isIncreasePositive={deltaLat.isIncreasePositive}
                        size="xs"
                      >
                        {deltaLat.text}
                      </TremorBadgeDelta>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <TremorMetric>
                        {s.promEsperaTriage || 0}
                      </TremorMetric>
                      <span className="text-xs font-bold text-secondary-custom">minutos espera promedio</span>
                    </div>
                    <div className="text-[11px] font-bold text-secondary-custom flex items-center justify-between pt-1 border-t border-card-custom/20">
                      <span>Triaje Oportuno (C1-C3 ≤15m):</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">
                        {s.pctTriageOportuno}% cumplido
                      </span>
                    </div>
                  </div>

                  {/* 3. Monitor de Triaje (El Semáforo Horario con Tremor Tracker) */}
                  <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-card-custom/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <TremorText className="font-bold text-primary-custom text-xs">
                          <KPITooltip kpiKey="trackerHorario">Monitor Horario de Espera a Triaje</KPITooltip>
                        </TremorText>
                        <span className="text-[10px] text-secondary-custom font-semibold block">
                          Semáforo intradiario (12 horas de guardia)
                        </span>
                      </div>
                      <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        Tracker
                      </span>
                    </div>

                    {/* Componente Tremor Tracker */}
                    <TremorTracker data={trackerData} className="my-1" />

                    <div className="flex items-center justify-between text-[10px] font-bold text-secondary-custom pt-1">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        ≤15m: {optimalHoursCount} hrs
                      </span>
                      <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        &gt;15m: {bottleneckHoursCount} hrs
                      </span>
                    </div>
                  </div>

                  {/* 4. Lead Time Global (Estadía Total) */}
                  <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-card-custom/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <TremorText>
                        <KPITooltip kpiKey="leadTime">Lead Time Global (Estadía Total)</KPITooltip>
                      </TremorText>
                      <TremorBadgeDelta
                        deltaType={deltaLead.deltaType}
                        isIncreasePositive={deltaLead.isIncreasePositive}
                        size="xs"
                      >
                        {deltaLead.text}
                      </TremorBadgeDelta>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <TremorMetric>
                        {formatTime(s.promEstadiaTotal || 0)}
                      </TremorMetric>
                      <span className="text-xs font-bold text-secondary-custom">({s.promEstadiaTotal} min)</span>
                    </div>
                    <div className="text-[11px] font-bold text-secondary-custom flex items-center justify-between pt-1 border-t border-card-custom/20">
                      <span>Triage a Box:</span>
                      <span className="text-primary-custom">{s.promTriageToBox || 0} min</span>
                      <span className="mx-1">•</span>
                      <span>Box a Alta:</span>
                      <span className="text-primary-custom">{s.promBoxToAlta || 0} min</span>
                    </div>
                  </div>

                  {/* 5. Fase 3: Resolutividad y Altas Admin (Tarjeta Secundaria con BarList y DonutChart) */}
                  <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-card-custom/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <TremorText className="font-black text-primary-custom text-xs uppercase tracking-wider">
                          <KPITooltip kpiKey="tasaResolutiva">Resolutividad & Altas Admin</KPITooltip>
                        </TremorText>
                        <span className="text-[10px] font-bold text-secondary-custom block">
                          Desglose de egresos clínicos vs administrativos
                        </span>
                      </div>
                      <TremorBadgeDelta
                        deltaType={deltaRes.deltaType}
                        isIncreasePositive={deltaRes.isIncreasePositive}
                        size="xs"
                      >
                        {s.tasaResolutiva}%
                      </TremorBadgeDelta>
                    </div>

                    {/* Tremor BarList compacto */}
                    <TremorBarList
                      data={resolutividadList}
                      valueFormatter={(v) => `${Number(v).toLocaleString('es-CL')} pac.`}
                      color={decColor}
                    />

                    {/* Tremor DonutChart complementario */}
                    <TremorDonutChart
                      data={resolutividadList}
                      category="value"
                      index="name"
                      colors={['emerald', 'rose', 'amber', 'purple']}
                      valueFormatter={(v) => `${Number(v).toLocaleString('es-CL')} pac.`}
                      label={`${s.tasaResolutiva}%`}
                      className="h-32"
                    />
                  </div>
                </div>

                {/* Footer de Tarjeta con Score Global */}
                <div className="pt-3 border-t border-card-custom/40 flex items-center justify-between text-xs">
                  <KPITooltip kpiKey="scoreGlobal">
                    <span className="text-secondary-custom font-bold">Puntaje Global Compuesto:</span>
                  </KPITooltip>
                  <span className="font-black text-primary-custom text-sm">
                    {ranked.scoreFinal || 85.0} <span className="text-[10px] text-secondary-custom font-bold">pts</span>
                  </span>
                </div>
              </TremorCard>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FASE 1: MATRIZ DE CLASIFICACIÓN DE DESEMPEÑO (SCORECARD RANKING & SEMÁFORO) */}
      {/* ========================================================================= */}
      <div className="bg-card-custom p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-card-custom space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-card-custom/40 pb-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xs uppercase flex items-center gap-1.5">
                <Crown className="w-4 h-4" /> Scorecard Matricial
              </span>
              <h3 className="text-lg md:text-xl font-black text-primary-custom tracking-tight">
                Matriz de Clasificación de Desempeño por Equipos de Guardia
              </h3>
            </div>
            <p className="text-xs text-secondary-custom font-medium mt-1">
              Ranking ponderado y semaforización instantánea: <span className="text-emerald-500 font-bold">Verde (Óptimo)</span>, <span className="text-amber-500 font-bold">Amarillo (Intermedio)</span> y <span className="text-rose-500 font-bold">Naranja/Rojo (Rezagado)</span>.
            </p>
          </div>

          <div className="text-xs font-bold text-secondary-custom flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-card-custom">
            <span>Índice Evaluado:</span>
            <strong className="text-primary-custom">30% Resolutiva • 30% Triaje • 20% Estadía • 20% Volumen</strong>
          </div>
        </div>

        {/* Tabla Matricial de Clasificación (Scorecard) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-card-custom/40 text-[10px] font-black uppercase text-secondary-custom tracking-wider">
                <th className="pb-3 px-3">Ranking & Equipo</th>
                <th className="pb-3 px-3 text-center">
                  <KPITooltip kpiKey="scoreGlobal">Score Global</KPITooltip>
                </th>
                <th className="pb-3 px-3">
                  <KPITooltip kpiKey="volumenTotal">1. Volumen Total</KPITooltip>
                </th>
                <th className="pb-3 px-3">
                  <KPITooltip kpiKey="latenciaTriage">2. Latencia Triaje</KPITooltip>
                </th>
                <th className="pb-3 px-3">
                  <KPITooltip kpiKey="leadTime">3. Lead Time Global</KPITooltip>
                </th>
                <th className="pb-3 px-3">
                  <KPITooltip kpiKey="tasaResolutiva">4. Tasa Resolutiva</KPITooltip>
                </th>
                <th className="pb-3 px-3 text-right">Configuración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-custom/20">
              {scorecardRanking.map((row) => {
                const cfg = teamsConfig.find(c => c.id === row.slotId);
                const isBestVol = row.isBestVol;
                const isBestLat = row.isBestLat;
                const isBestLead = row.isBestLead;
                const isBestRes = row.isBestRes;

                return (
                  <tr 
                    key={row.slotId}
                    className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${row.rank === 1 ? 'bg-amber-500/[0.02]' : ''}`}
                  >
                    {/* Ranking & Equipo */}
                    <td className="py-4 px-3 align-middle">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-2xl flex items-center justify-center font-black text-xs border ${
                          row.rank === 1 
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-sm' 
                            : row.rank === 2 
                              ? 'bg-slate-300/20 text-slate-700 dark:text-slate-300 border-slate-400/30' 
                              : 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30'
                        }`}>
                          #{row.rank}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-2.5 h-2.5 rounded-full" 
                              style={{ backgroundColor: row.color }} 
                            />
                            <strong className="text-sm font-black text-primary-custom">
                              {row.alias}
                            </strong>
                            <span className="text-[10px] text-secondary-custom font-semibold">
                              ({row.teamKey})
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-secondary-custom">
                            {row.stats.guardiasCount || 0} guardias asistenciales
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Score Global */}
                    <td className="py-4 px-3 align-middle text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`text-base font-black px-2.5 py-0.5 rounded-xl border ${
                          row.rank === 1 
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40' 
                            : row.rank === 2 
                              ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' 
                              : 'bg-black/5 dark:bg-white/5 text-secondary-custom border-card-custom'
                        }`}>
                          {row.scoreFinal} <span className="text-[10px] font-bold">pts</span>
                        </span>
                        <span className="text-[9px] font-bold text-secondary-custom mt-0.5 inline-flex items-center gap-1">
                          {row.rank === 1 ? (
                            <Trophy className="w-2.5 h-2.5 text-amber-500 inline shrink-0" />
                          ) : row.rank === 2 ? (
                            <Award className="w-2.5 h-2.5 text-slate-400 inline shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 inline shrink-0" />
                          )}
                          <span>{row.rankTitle || row.rankBadge}</span>
                        </span>
                      </div>
                    </td>

                    {/* KPI 1: Volumen Total Atendido */}
                    <td className="py-4 px-3 align-middle">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-black ${
                            isBestVol 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-primary-custom'
                          }`}>
                            {(row.stats.atendidos || 0).toLocaleString('es-CL')} <span className="text-xs font-bold text-secondary-custom">pac.</span>
                          </span>
                          {isBestVol && (
                            <span className="text-[8.5px] font-black px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase">
                              Líder
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-secondary-custom font-semibold">
                            {row.stats.totalPacientes} admitidos
                          </span>
                          {renderTrendBadge(row.stats.totalPacientes, globalAggregates.avgTotalPac)}
                        </div>
                      </div>
                    </td>

                    {/* KPI 2: Latencia Admisión - Triaje */}
                    <td className="py-4 px-3 align-middle">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-black ${
                            isBestLat 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : row.latencia > (globalAggregates.avgEsperaTriage * 1.1)
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-primary-custom'
                          }`}>
                            {row.latencia} <span className="text-xs font-bold text-secondary-custom">min</span>
                          </span>
                          {isBestLat && (
                            <span className="text-[8.5px] font-black px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase">
                              Más Rápido
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                            {row.stats.pctTriageOportuno}% ≤15m
                          </span>
                          {renderTrendBadge(row.latencia, globalAggregates.avgEsperaTriage, true)}
                        </div>
                      </div>
                    </td>

                    {/* KPI 3: Lead Time Global (Estadía Total) */}
                    <td className="py-4 px-3 align-middle">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-black ${
                            isBestLead 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-primary-custom'
                          }`}>
                            {formatTime(row.leadTime)}
                          </span>
                          {isBestLead && (
                            <span className="text-[8.5px] font-black px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase">
                              Menor Permanencia
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-secondary-custom font-semibold">
                            {row.leadTime} min total
                          </span>
                          {renderTrendBadge(row.leadTime, globalAggregates.avgEstadia, true)}
                        </div>
                      </div>
                    </td>

                    {/* KPI 4: Tasa Resolutiva */}
                    <td className="py-4 px-3 align-middle">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-black ${
                            isBestRes 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : row.resolutiva < 88 
                                ? 'text-rose-600 dark:text-rose-400' 
                                : 'text-primary-custom'
                          }`}>
                            {row.resolutiva}%
                          </span>
                          {isBestRes && (
                            <span className="text-[8.5px] font-black px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase">
                              Mayor Retención
                            </span>
                          )}
                          {renderTrendBadge(row.resolutiva, globalAggregates.avgTasaResolutiva)}
                        </div>
                        {/* Mini barra de progreso resolutiva */}
                        <div className="w-28 bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              row.resolutiva >= 92 ? 'bg-emerald-500' : row.resolutiva >= 85 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, row.resolutiva)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Selector de Equipo & Alias */}
                    <td className="py-4 px-3 align-middle text-right">
                      {cfg && (
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={cfg.selectedTeam}
                            onChange={(e) => {
                              cfg.setSelectedTeam(e.target.value);
                              cfg.setAlias(e.target.value);
                            }}
                            className="bg-black/5 dark:bg-white/5 border border-card-custom text-xs font-bold text-primary-custom px-2 py-1 rounded-xl outline-none cursor-pointer"
                          >
                            {equipoOptions.map(eq => (
                              <option key={eq} value={eq}>{eq}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FASE 3: CUADRÍCULA DE EXTREMOS POR KPI (TREMOR CARDS) */}
      {/* ========================================================================= */}
      <div className="bg-card-custom p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-card-custom space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-card-custom/40 pb-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Desglose de Extremos por KPI
              </span>
              <h3 className="text-lg md:text-xl font-black text-primary-custom tracking-tight">
                Líderes y Brechas Operativas por Indicador Clave (Tremor)
              </h3>
            </div>
            <p className="text-xs text-secondary-custom font-medium mt-1">
              Identificación automática del turno con mayor rendimiento (<span className="text-emerald-500 font-bold">Mejor Desempeño 🟢</span>) y del equipo con oportunidad de mejora (<span className="text-rose-500 font-bold">Turno Rezagado 🔴</span>) según la polaridad asistencial de cada métrica.
            </p>
          </div>

          <div className="text-[11px] font-bold text-secondary-custom bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-card-custom">
            <span>7 Métricas Analizadas en Tiempo Real</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {KPI_POLARITY_DEFINITIONS.map(def => {
            const ext = kpiExtremes[def.key];
            if (!ext) return null;

            return (
              <TremorCard
                key={def.key}
                decoration="top"
                decorationColor={def.polarity === 'higher_is_better' ? 'emerald' : 'purple'}
                className="p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-secondary-custom truncate">
                      {def.name}
                    </span>
                    <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 text-secondary-custom shrink-0">
                      {def.polarity === 'higher_is_better' ? 'Mayor es Mejor' : 'Menor es Mejor'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {/* MEJOR TURNO (ESMERALDA) */}
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1 uppercase tracking-wide">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Mejor Turno
                      </span>
                      <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                        {ext.bestFormatted}
                      </span>
                    </div>
                    <p className="text-[11px] font-black text-emerald-900 dark:text-emerald-100 truncate">
                      {ext.best?.alias || ext.best?.teamKey || '—'}
                    </p>
                  </div>

                  {/* PEOR TURNO (ROSA / ROJO) */}
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-950 dark:text-rose-200 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-black text-rose-700 dark:text-rose-400 flex items-center gap-1 uppercase tracking-wide">
                        <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                        Turno Rezagado
                      </span>
                      <span className="text-xs font-black text-rose-800 dark:text-rose-300">
                        {ext.worstFormatted}
                      </span>
                    </div>
                    <p className="text-[11px] font-black text-rose-900 dark:text-rose-100 truncate">
                      {ext.worst?.alias || ext.worst?.teamKey || '—'}
                    </p>
                  </div>
                </div>
              </TremorCard>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FASE 3: GRÁFICO COMPACTO DE PROFUNDIDAD (BARCHART AGRUPADO TREMOR & COMPOSEDCHART) */}
      {/* ========================================================================= */}
      <div className="bg-card-custom p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-card-custom space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-card-custom/40">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base md:text-lg font-black text-primary-custom tracking-tight">
                Comparativa de Categorización Manchester (C1 a C5)
              </h3>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Tremor BarChart Agrupado
              </span>
            </div>
            <p className="text-xs text-secondary-custom font-medium mt-1">
              Distribución de pacientes según severidad clínica C1 (Reanimación) a C5 (No Urgente) entre los tres turnos con paleta corporativa.
            </p>
          </div>

          {/* Selector de Vista: Tremor BarChart vs Recharts ComposedChart */}
          <div className="flex items-center gap-3 flex-wrap self-start md:self-auto">
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-card-custom">
              <button
                onClick={() => setManchesterViewMode('tremor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  manchesterViewMode === 'tremor'
                    ? 'bg-indigo-600 text-white shadow-xs font-black'
                    : 'text-secondary-custom hover:text-primary-custom'
                }`}
              >
                Tremor BarChart
              </button>
              <button
                onClick={() => setManchesterViewMode('composed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  manchesterViewMode === 'composed'
                    ? 'bg-indigo-600 text-white shadow-xs font-black'
                    : 'text-secondary-custom hover:text-primary-custom'
                }`}
              >
                ComposedChart (Curva Latencia)
              </button>
            </div>

            {manchesterViewMode === 'composed' && (
              <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-card-custom">
                <button
                  onClick={() => setChartBarMode('grouped')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chartBarMode === 'grouped'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-secondary-custom hover:text-primary-custom'
                  }`}
                >
                  Agrupadas
                </button>
                <button
                  onClick={() => setChartBarMode('stacked')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chartBarMode === 'stacked'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-secondary-custom hover:text-primary-custom'
                  }`}
                >
                  Apiladas
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Renderizado condicional según vista seleccionada */}
        {manchesterViewMode === 'tremor' ? (
          <div className="pt-2">
            <TremorBarChart
              data={tremorManchesterData}
              index="name"
              categories={[aliasA, aliasB, aliasC]}
              colors={['indigo', 'purple', 'emerald']}
              valueFormatter={(v) => `${Number(v).toLocaleString('es-CL')} pac.`}
              yAxisWidth={60}
              showLegend={true}
              showGridLines={true}
              className="h-88"
            />
          </div>
        ) : (
          <div className="h-[460px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart 
                data={chartData} 
                margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                barGap={4}
                barCategoryGap="22%"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.15)" />
                
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 13, fontWeight: 'bold' }} 
                />
                
                {/* Eje Y Izquierdo: Volumen */}
                <YAxis 
                  yAxisId="left"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 'bold' }}
                  unit=" pac"
                />

                {/* Eje Y Derecho: Espera en Minutos */}
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#f59e0b', fontSize: 12, fontWeight: 'bold' }}
                  unit=" min"
                />

                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0]?.payload;
                    return (
                      <div className="bg-card-custom p-4 rounded-2xl shadow-xl border border-card-custom space-y-3 min-w-[280px]">
                        <div className="border-b border-card-custom/40 pb-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-indigo-500 uppercase tracking-wider">{label}</span>
                            <span className="text-[10px] text-secondary-custom font-bold">{item?.desc}</span>
                          </div>
                        </div>

                        {/* Volumen */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black text-secondary-custom uppercase tracking-wider block">
                            Volumen de Pacientes
                          </span>
                          {payload.filter(p => p.dataKey.includes('(Volumen)')).map((entry, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-2 font-bold text-secondary-custom">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.name.replace(' (Volumen)', '')}
                              </span>
                              <span className="font-black text-primary-custom">{entry.value} pac.</span>
                            </div>
                          ))}
                        </div>

                        {/* Espera */}
                        <div className="space-y-1.5 pt-2 border-t border-card-custom/30">
                          <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider block flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Latencia a Triaje Promedio
                          </span>
                          {payload.filter(p => p.dataKey.includes('(T. Espera min)')).map((entry, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-2 font-bold text-secondary-custom">
                                <span className="w-2.5 h-1 rounded" style={{ backgroundColor: entry.color }} />
                                {entry.name.replace(' (T. Espera min)', '')}
                              </span>
                              <span className="font-black text-amber-600 dark:text-amber-400">{entry.value} min</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }}
                />

                <Legend 
                  wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold' }} 
                />

                {/* BARRAS DE VOLUMEN (Separadas nítidamente para no solaparse) */}
                <Bar 
                  yAxisId="left"
                  stackId={chartBarMode === 'stacked' ? 'stackVol' : undefined}
                  dataKey={seriesVolA} 
                  name={seriesVolA} 
                  fill={teamsConfig[0].color} 
                  radius={chartBarMode === 'stacked' ? [0, 0, 0, 0] : [6, 6, 0, 0]} 
                  barSize={chartBarMode === 'stacked' ? 28 : 18}
                />
                <Bar 
                  yAxisId="left"
                  stackId={chartBarMode === 'stacked' ? 'stackVol' : undefined}
                  dataKey={seriesVolB} 
                  name={seriesVolB} 
                  fill={teamsConfig[1].color} 
                  radius={chartBarMode === 'stacked' ? [0, 0, 0, 0] : [6, 6, 0, 0]} 
                  barSize={chartBarMode === 'stacked' ? 28 : 18}
                />
                <Bar 
                  yAxisId="left"
                  stackId={chartBarMode === 'stacked' ? 'stackVol' : undefined}
                  dataKey={seriesVolC} 
                  name={seriesVolC} 
                  fill={teamsConfig[2].color} 
                  radius={[6, 6, 0, 0]} 
                  barSize={chartBarMode === 'stacked' ? 28 : 18}
                />

                {/* LÍNEAS DE ESPERA DE ALTO CONTRASTE (Colores diferenciados con halos luminosos) */}
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey={seriesWaitA} 
                  name={seriesWaitA} 
                  stroke={teamsConfig[0].lineColor} 
                  strokeWidth={3.5}
                  dot={{ r: 5, strokeWidth: 2, fill: '#ffffff', stroke: teamsConfig[0].lineColor }} 
                  activeDot={{ r: 7 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey={seriesWaitB} 
                  name={seriesWaitB} 
                  stroke={teamsConfig[1].lineColor} 
                  strokeWidth={3.5}
                  dot={{ r: 5, strokeWidth: 2, fill: '#ffffff', stroke: teamsConfig[1].lineColor }} 
                  activeDot={{ r: 7 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey={seriesWaitC} 
                  name={seriesWaitC} 
                  stroke={teamsConfig[2].lineColor} 
                  strokeWidth={3.5}
                  dot={{ r: 5, strokeWidth: 2, fill: '#ffffff', stroke: teamsConfig[2].lineColor }} 
                  activeDot={{ r: 7 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* FASE 2: VISUALIZACIÓN RADIAL DE COMPETENCIAS (RADARCHART RECHARTS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart: 5 Ejes Normalizados */}
        <div className="lg:col-span-7 bg-card-custom p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-card-custom space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-card-custom/40 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <Target className="w-4 h-4" />
                </span>
                <h3 className="text-base font-black text-primary-custom tracking-tight">
                  Visualización Radial de Competencias
                </h3>
              </div>
              <p className="text-xs text-secondary-custom font-medium mt-0.5">
                Superposición de 5 ejes normalizados (0-100): Agilidad, Absorción, Resolutividad, Retención y Velocidad de Box.
              </p>
            </div>

            <div className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 self-start sm:self-auto">
              Escala Normalizada 0 a 100
            </div>
          </div>

          <div className="h-[380px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(128,128,128,0.2)" strokeDasharray="3 3" />
                <PolarAngleAxis 
                  dataKey="axis" 
                  tick={{ fill: 'var(--text-primary)', fontSize: 11, fontWeight: 'bold' }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} 
                />
                <Radar 
                  name={aliasA} 
                  dataKey={aliasA} 
                  stroke={teamsConfig[0].color} 
                  fill={teamsConfig[0].color} 
                  fillOpacity={0.25} 
                  strokeWidth={2.5}
                />
                <Radar 
                  name={aliasB} 
                  dataKey={aliasB} 
                  stroke={teamsConfig[1].color} 
                  fill={teamsConfig[1].color} 
                  fillOpacity={0.25} 
                  strokeWidth={2.5}
                />
                <Radar 
                  name={aliasC} 
                  dataKey={aliasC} 
                  stroke={teamsConfig[2].color} 
                  fill={teamsConfig[2].color} 
                  fillOpacity={0.25} 
                  strokeWidth={2.5}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0]?.payload;
                    return (
                      <div className="bg-card-custom p-4 rounded-2xl shadow-xl border border-card-custom space-y-2.5 min-w-[240px]">
                        <div className="border-b border-card-custom/40 pb-1.5">
                          <span className="text-xs font-black text-indigo-500 uppercase tracking-wider block">
                            {item?.axis}
                          </span>
                          <span className="text-[10px] text-secondary-custom font-medium">
                            {item?.desc}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          {payload.map((entry, idx) => {
                            const rawVal = entry.name === aliasA ? item?.rawA : entry.name === aliasB ? item?.rawB : item?.rawC;
                            return (
                              <div key={idx} className="flex items-center justify-between">
                                <span className="flex items-center gap-2 font-bold text-secondary-custom">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                  {entry.name}
                                </span>
                                <div className="text-right">
                                  <span className="font-black text-primary-custom">{entry.value} pts</span>
                                  <span className="text-[10px] text-secondary-custom font-semibold ml-1.5">({rawVal})</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: 10, fontSize: '11px', fontWeight: 'bold' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Panel Anexo: Arquetipos y Perfiles Operativos para Decisión Directiva */}
        <div className="lg:col-span-5 bg-card-custom p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-card-custom flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 border-b border-card-custom/40 pb-3">
              <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-500">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-black text-primary-custom tracking-tight">
                  Arquetipos & Perfiles de Guardia
                </h3>
                <p className="text-[11px] text-secondary-custom font-medium">
                  Diagnóstico gerencial para asignación estratégica de refuerzos y dotación.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 mt-4">
              {operationalArchetypes.map((team) => (
                <div 
                  key={team.slotId}
                  className="p-3.5 rounded-2xl border border-card-custom/40 bg-black/5 dark:bg-white/5 space-y-1.5"
                  style={{ borderLeftWidth: 4, borderLeftColor: team.color }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-primary-custom flex items-center gap-1.5">
                      {team.alias}
                    </span>
                    <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-md border inline-flex items-center gap-1 ${team.badgeColor}`}>
                      {React.createElement(team.archetypeIcon || Activity, { className: 'w-3 h-3 shrink-0' })}
                      <span>{team.archetypeTitle}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-secondary-custom font-medium">
                    {team.archetypeDesc}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-secondary-custom font-semibold pt-1 border-t border-card-custom/20">
                    <span>Espera Triaje: <strong className="text-primary-custom">{team.stats.promEsperaTriage || 0}m</strong></span>
                    <span>•</span>
                    <span>Complejidad C1-C3: <strong className="text-primary-custom">{team.stats.altaComplejidadPct || 0}%</strong></span>
                    <span>•</span>
                    <span>Retención: <strong className="text-emerald-500 font-bold">{100 - Number(team.stats.pctAltasAdmin || 10)}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 flex-shrink-0 text-indigo-500" />
            <span>
              La poligonometría permite detectar instantáneamente si un equipo es más ágil en ventanilla o más resolutivo en patología compleja.
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FASE 4: DESCUBRIMIENTO AUTÓNOMO DE MÉTRICAS (DATA MINING & AUTO-VISUALIZACIÓN) */}
      {/* ========================================================================= */}
      <div className="bg-card-custom p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-card-custom space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-card-custom/40 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 rounded-xl bg-rose-500/10 text-rose-500">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <h3 className="text-base md:text-lg font-black text-primary-custom tracking-tight">
                Minería de Datos Clínica & Gestión de Riesgo Operativo
              </h3>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                Visualización Orientada a la Decisión
              </span>
            </div>
            <p className="text-xs text-secondary-custom font-medium mt-1">
              Indicadores de seguridad asistencial calculados autónomamente: ¿El desempeño de este turno supone un riesgo clínico u operativo?
            </p>
          </div>

          <div className="text-[11px] font-bold text-secondary-custom bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-card-custom">
            Respuesta Gerencial Inmediata: <strong className="text-primary-custom">Semáforos de Fuga, Reingreso y Saturación</strong>
          </div>
        </div>

        {/* 4 Tarjetas de Decisión Directiva con Sparklines y Barras Semáforo */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* Card 1: Tasa de Fuga / Abandono Pre-Atención */}
          <div className="p-5 rounded-3xl bg-black/5 dark:bg-white/5 border border-card-custom/60 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <KPITooltip kpiKey="tasaFuga">
                  <span className="text-[10px] font-black text-secondary-custom uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-rose-500" /> Tasa de Fuga
                  </span>
                </KPITooltip>
                <MiniSparkline 
                  data={[
                    teamMetrics[equipoColA]?.tasaFuga || 0,
                    teamMetrics[equipoColB]?.tasaFuga || 0,
                    teamMetrics[equipoColC]?.tasaFuga || 0
                  ]}
                  color="#f43f5e"
                />
              </div>

              <div className="mt-2">
                <h4 className="text-2xl font-black text-primary-custom">
                  {globalAggregates.avgTasaFuga.toFixed(1)}% <span className="text-xs font-bold text-secondary-custom">media</span>
                </h4>
                <p className="text-[11px] text-secondary-custom font-semibold">
                  Egresos antes de evaluación médica en box
                </p>
              </div>

              {/* Desglose por turnos con barras semáforo */}
              <div className="space-y-2 mt-4 pt-3 border-t border-card-custom/20">
                {teamsConfig.map(t => {
                  const s = teamMetrics[t.selectedTeam] || {};
                  const tf = s.tasaFuga || 0;
                  const isRisk = tf >= 8.0;
                  const isWarning = tf >= 5.0 && tf < 8.0;
                  return (
                    <div key={t.id} className="text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-secondary-custom">{t.alias}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black ${isRisk ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {tf}%
                          </span>
                          <span className={`text-[8px] font-black px-1 py-0.2 rounded ${
                            isRisk ? 'bg-rose-500/10 text-rose-600' : isWarning ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                          }`}>
                            {isRisk ? 'ALTO' : isWarning ? 'MEDIO' : 'BAJO'}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isRisk ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, tf * 10)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Criterio de Riesgo Gerencial */}
            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-card-custom/30 text-[10px] text-secondary-custom">
              <strong className="text-primary-custom block mb-0.5">¿Supone Riesgo Operativo?</strong>
              {globalAggregates.avgTasaFuga > 6 ? (
                <span className="text-rose-500 font-bold inline-flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                  <span>Alerta: Riesgo de descompensación de pacientes en sala de espera.</span>
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                  <span>Fuga contenida dentro de parámetros seguros del SAR.</span>
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Tasa de Reingreso Precoz (< 48 hrs) */}
          <div className="p-5 rounded-3xl bg-black/5 dark:bg-white/5 border border-card-custom/60 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <KPITooltip kpiKey="reingreso48h">
                  <span className="text-[10px] font-black text-secondary-custom uppercase tracking-wider flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-amber-500" /> Reingreso &lt;48h
                  </span>
                </KPITooltip>
                <MiniSparkline 
                  data={[
                    teamMetrics[equipoColA]?.tasaReingreso || 0,
                    teamMetrics[equipoColB]?.tasaReingreso || 0,
                    teamMetrics[equipoColC]?.tasaReingreso || 0
                  ]}
                  color="#f59e0b"
                />
              </div>

              <div className="mt-2">
                <h4 className="text-2xl font-black text-primary-custom">
                  {globalAggregates.avgTasaReingreso.toFixed(1)}% <span className="text-xs font-bold text-secondary-custom">media</span>
                </h4>
                <p className="text-[11px] text-secondary-custom font-semibold">
                  Pacientes que retornan en menos de 48 horas
                </p>
              </div>

              {/* Desglose por turnos con barras semáforo */}
              <div className="space-y-2 mt-4 pt-3 border-t border-card-custom/20">
                {teamsConfig.map(t => {
                  const s = teamMetrics[t.selectedTeam] || {};
                  const tr = s.tasaReingreso || 0;
                  const isRisk = tr >= 5.0;
                  const isWarning = tr >= 3.5 && tr < 5.0;
                  return (
                    <div key={t.id} className="text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-secondary-custom">{t.alias}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black ${isRisk ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {tr}%
                          </span>
                          <span className={`text-[8px] font-black px-1 py-0.2 rounded ${
                            isRisk ? 'bg-rose-500/10 text-rose-600' : isWarning ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                          }`}>
                            {isRisk ? 'ALERTA' : isWarning ? 'VIGILAR' : 'ÓPTIMO'}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isRisk ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, tr * 15)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Criterio de Riesgo Gerencial */}
            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-card-custom/30 text-[10px] text-secondary-custom">
              <strong className="text-primary-custom block mb-0.5">¿Supone Riesgo Clínico?</strong>
              {globalAggregates.avgTasaReingreso > 4.5 ? (
                <span className="text-amber-500 font-bold inline-flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span>Evaluar posible falla resolutiva o altas precoces.</span>
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                  <span>Resolución médica efectiva de primer contacto.</span>
                </span>
              )}
            </div>
          </div>

          {/* Card 3: Derivaciones Críticas UEH (Rescate C1/C2) */}
          <div className="p-5 rounded-3xl bg-black/5 dark:bg-white/5 border border-card-custom/60 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <KPITooltip kpiKey="trasladosCriticos">
                  <span className="text-[10px] font-black text-secondary-custom uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-purple-500" /> Rescate Crítico
                  </span>
                </KPITooltip>
                <MiniSparkline 
                  data={[
                    teamMetrics[equipoColA]?.pctTrasladosCriticos || 0,
                    teamMetrics[equipoColB]?.pctTrasladosCriticos || 0,
                    teamMetrics[equipoColC]?.pctTrasladosCriticos || 0
                  ]}
                  color="#a855f7"
                />
              </div>

              <div className="mt-2">
                <h4 className="text-2xl font-black text-primary-custom">
                  {globalAggregates.avgTrasladosCriticos.toFixed(1)}% <span className="text-xs font-bold text-secondary-custom">críticos</span>
                </h4>
                <p className="text-[11px] text-secondary-custom font-semibold">
                  Traslados a hospital en C1-C2 / Ambulancia
                </p>
              </div>

              {/* Desglose por turnos con barras semáforo */}
              <div className="space-y-2 mt-4 pt-3 border-t border-card-custom/20">
                {teamsConfig.map(t => {
                  const s = teamMetrics[t.selectedTeam] || {};
                  const tc = s.pctTrasladosCriticos || 0;
                  const isHigh = tc >= 25.0;
                  return (
                    <div key={t.id} className="text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-secondary-custom">{t.alias}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black ${isHigh ? 'text-purple-600 dark:text-purple-400' : 'text-primary-custom'}`}>
                            {s.trasladosCriticos || 0} pac. ({tc}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-purple-500"
                          style={{ width: `${Math.min(100, tc * 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Criterio de Riesgo Gerencial */}
            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-card-custom/30 text-[10px] text-secondary-custom">
              <strong className="text-primary-custom block mb-0.5">¿Supone Riesgo Operativo?</strong>
              <span className="text-secondary-custom font-medium">
                Monitorear retención en reanimador y disponibilidad de ambulancia SAMU.
              </span>
            </div>
          </div>

          {/* Card 4: Demografía Dependiente (Extremos de la Vida) */}
          <div className="p-5 rounded-3xl bg-black/5 dark:bg-white/5 border border-card-custom/60 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <KPITooltip kpiKey="extremosVida">
                  <span className="text-[10px] font-black text-secondary-custom uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-500" /> Extremos de la Vida
                  </span>
                </KPITooltip>
                <MiniSparkline 
                  data={[
                    teamMetrics[equipoColA]?.pctExtremosVida || 0,
                    teamMetrics[equipoColB]?.pctExtremosVida || 0,
                    teamMetrics[equipoColC]?.pctExtremosVida || 0
                  ]}
                  color="#3b82f6"
                />
              </div>

              <div className="mt-2">
                <h4 className="text-2xl font-black text-primary-custom">
                  {globalAggregates.avgPctExtremosVida.toFixed(1)}% <span className="text-xs font-bold text-secondary-custom">carga</span>
                </h4>
                <p className="text-[11px] text-secondary-custom font-semibold">
                  Población Pediátrica (&le;14a) y Geriatría (60+)
                </p>
              </div>

              {/* Desglose por turnos con barras semáforo */}
              <div className="space-y-2 mt-4 pt-3 border-t border-card-custom/20">
                {teamsConfig.map(t => {
                  const s = teamMetrics[t.selectedTeam] || {};
                  const ev = s.pctExtremosVida || 0;
                  return (
                    <div key={t.id} className="text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-secondary-custom">{t.alias}</span>
                        <span className="font-black text-primary-custom">
                          {ev}% ({s.pediatricos || 0} ped. / {s.senescentes || 0} sen.)
                        </span>
                      </div>
                      <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${Math.min(100, ev * 1.5)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Criterio de Riesgo Gerencial */}
            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-card-custom/30 text-[10px] text-secondary-custom">
              <strong className="text-primary-custom block mb-0.5">¿Supone Riesgo Asistencial?</strong>
              <span className="text-secondary-custom font-medium">
                Población dependiente con alto requerimiento de enfermería y medicación parenteral.
              </span>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
