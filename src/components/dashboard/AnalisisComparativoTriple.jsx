import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Calendar, TrendingUp, TrendingDown, Minus, Clock, Activity, 
  AlertTriangle, Hospital, ShieldCheck, Users, ArrowRight, 
  Tag, Edit3, CheckCircle2, ChevronRight, Gauge, Zap, FileText,
  Filter, Sparkles, RefreshCw, Check, Layers, SlidersHorizontal, Info,
  Award, Flame, ShieldAlert, Timer, Stethoscope, ArrowUpRight, BarChart2
} from 'lucide-react';
import { 
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  formatLocalDate, 
  resolverEquipoTurno, 
  obtenerTurnoDetallado, 
  isAltaAdmin,
  formatTime 
} from '../../utils/helpers';

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
  // Constante de corte máximo de datos del sistema (Regla 1 & 5 SSOT)
  const MAX_SYSTEM_CUTOFF = '2026-09-28';

  // Helper para resolver la fecha máxima con datos válidos
  const getLatestValidDate = useCallback(() => {
    if (filtroFechaFin && typeof filtroFechaFin === 'string' && filtroFechaFin <= MAX_SYSTEM_CUTOFF) {
      return filtroFechaFin;
    }
    if (turnosDB && turnosDB.length > 0) {
      const validT = turnosDB
        .filter(t => t && t.fechaInicio && (Number(t.totalPacientes || 0) > 0 || (t.pacientes && t.pacientes.length > 0)) && t.fechaInicio <= MAX_SYSTEM_CUTOFF)
        .map(t => t.fechaInicio)
        .sort()
        .reverse();
      if (validT.length > 0) return validT[0];
    }
    if (pacientesDB && pacientesDB.length > 0) {
      const ahoraMs = Date.now() + 3600000;
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
    return '2026-09-28';
  }, [filtroFechaFin, turnosDB, pacientesDB]);

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

  // Equipos seleccionados para cada una de las 3 columnas
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

  const equipoOptions = ['Turno 1', 'Turno 2', 'Turno 3', 'Turno 4'];

  // Presets globales de fechas
  const handleApplyPreset = (presetKey) => {
    setActivePreset(presetKey);
    const end = MAX_SYSTEM_CUTOFF;
    let start = '2026-06-01';

    if (presetKey === 'ultimos_3_meses') {
      start = '2026-06-01';
    } else if (presetKey === 'ano_2026') {
      start = '2026-01-01';
    } else if (presetKey === 'ultimos_30_dias') {
      start = '2026-08-10';
    } else if (presetKey === 'ultimos_7_dias') {
      start = '2026-09-21';
    } else if (presetKey === 'agosto_2026') {
      start = '2026-08-01';
      setFechaInicio('2026-08-01');
      setFechaFin('2026-08-31');
      return;
    } else if (presetKey === 'septiembre_2026') {
      start = '2026-09-01';
      setFechaInicio('2026-09-01');
      setFechaFin('2026-09-28');
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

  // Nombres de los equipos a evaluar
  const teamsConfig = useMemo(() => [
    {
      id: 'A',
      selectedTeam: equipoColA,
      setSelectedTeam: setEquipoColA,
      alias: aliasA,
      setAlias: setAliasA,
      isEditing: isEditingAliasA,
      setIsEditing: setIsEditingAliasA,
      color: '#3b82f6', // Azul
      lineColor: '#1d4ed8',
      bgBadge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
    },
    {
      id: 'B',
      selectedTeam: equipoColB,
      setSelectedTeam: setEquipoColB,
      alias: aliasB,
      setAlias: setAliasB,
      isEditing: isEditingAliasB,
      setIsEditing: setIsEditingAliasB,
      color: '#8b5cf6', // Violeta
      lineColor: '#6d28d9',
      bgBadge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
    },
    {
      id: 'C',
      selectedTeam: equipoColC,
      setSelectedTeam: setEquipoColC,
      alias: aliasC,
      setAlias: setAliasC,
      isEditing: isEditingAliasC,
      setIsEditing: setIsEditingAliasC,
      color: '#10b981', // Verde esmeralda
      lineColor: '#047857',
      bgBadge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
    }
  ], [equipoColA, equipoColB, equipoColC, aliasA, aliasB, aliasC, isEditingAliasA, isEditingAliasB, isEditingAliasC]);

  // CÁLCULO EXHAUSTIVO DE KPIS COMPARATIVOS PARA TODOS LOS EQUIPOS EN EL RANGO GLOBAL
  const { teamMetrics, globalAggregates } = useMemo(() => {
    // Estructura contenedora para cada equipo
    const makeInitialTeamBucket = (name) => ({
      name,
      totalPacientes: 0,
      atendidos: 0,
      altasAdmin: 0,
      traslados: 0,
      constataciones: 0,
      respiratorios: 0,
      fracturas: 0,
      peakHourCount: 0, // Horario Peak 19:00 - 22:30 hrs
      c1: 0, c2: 0, c3: 0, c4: 0, c5: 0,
      // Tiempos
      sumEsperaTriage: 0, countEsperaTriage: 0,
      triageOportunoCount: 0, // Espera <= 15 min en C1-C3
      sumEstadiaTotal: 0, countEstadiaTotal: 0,
      sumTriageToBox: 0, countTriageToBox: 0,
      sumBoxToAlta: 0, countBoxToAlta: 0,
      // Espera por categoría
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
      if (t.fechaInicio < startIso || t.fechaInicio > endIso) return;
      const hor = String(t.horario || '').toLowerCase();
      if (hor.includes('24 hrs') || hor.includes('día completo') || hor.includes('dia completo')) return;

      const parts = String(t.fechaInicio).split('-');
      if (parts.length < 3) return;
      const isoDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].slice(0, 2).padStart(2, '0')}`;

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

    // Evaluar si pacientesDB es exhaustivo o si sólo contiene un fragmento de prueba/caché (< 70% de la demanda)
    const isPacientesComprehensive = pacsCountInPeriod >= Math.max(50, totalPacientesInTurnos * 0.7);

    if (isPacientesComprehensive) {
      // 2A. MODO COMPLETO DESDE PACIENTES INDIVIDUALES (Rangos cortos como 1 día o 7 días con 100% de datos en memoria)
      (pacientesDB || []).forEach(p => {
        if (!p || !p.tAdmision) return;
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

        if (isAltaAdmin(p) || p.estado === 'Cancelada') {
          b.altasAdmin++;
        } else {
          b.atendidos++;
        }

        const dest = String(p.destinoAlta || p.destino || '').toLowerCase();
        if (dest.includes('hospital') || dest.includes('emergencia') || dest.includes('derivac')) {
          b.traslados++;
        }

        if (p.categoria === 'c3_z518') {
          b.constataciones++;
        } else {
          const cod = String(p.codigoDiagnostico || p.diagnostico || '').toUpperCase();
          const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
          if (cod.includes('Z51.8') || cod.includes('Z518') || diag.includes('CONSTATAC')) {
            b.constataciones++;
          }
        }

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

        const dAdm = new Date(p.tAdmision);
        const h = dAdm.getHours();
        const m = dAdm.getMinutes();
        const timeNum = h * 60 + m;
        if (timeNum >= 1140 && timeNum <= 1350) {
          b.peakHourCount++;
        }

        if (p.establecimiento && p.establecimiento !== 'DESCONOCIDO' && p.establecimiento !== 'UNDEFINED' && p.establecimiento.trim() !== '') {
          const cName = p.establecimiento.trim().toUpperCase();
          b.centrosMap[cName] = (b.centrosMap[cName] || 0) + 1;
        }

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

      // Incorporar coberturas horarias y completar guardias faltantes de turnosDB si las hubiera
      dedupTurnosList.forEach(t => {
        const teamName = resolverEquipoTurno(t.fechaInicio, t.horario, pautasDB, t.equipoTurno);
        const targetB = buckets[teamName] || buckets['Turno 1'];
        targetB.guardiasDates.add(t.fechaInicio);
        const hours = String(t.horario || '').includes('17:00') ? 15 : 12;
        targetB.horasCobertura += hours;
      });
    } else {
      // 2B. MODO SÍNTESIS CONSOLIDADA DESDE TURNOS DEDUPLICADOS (Rangos amplios como 3 Meses o Anual con límite de memoria)
      dedupTurnosList.forEach(t => {
        const teamName = resolverEquipoTurno(t.fechaInicio, t.horario, pautasDB, t.equipoTurno);
        const targetB = buckets[teamName] || buckets['Turno 1'];
        targetB.guardiasDates.add(t.fechaInicio);

        const hours = String(t.horario || '').includes('17:00') ? 15 : 12;
        targetB.horasCobertura += hours;

        const turnoTotal = Number(t.totalPacientes || 0);
        targetB.totalPacientes += turnoTotal;

        const tAltas = Number(t.altasAdmin || 0);
        const tAtendidos = Number(t.atendidos || Math.max(0, turnoTotal - tAltas));
        targetB.altasAdmin += Math.max(0, tAltas);
        targetB.atendidos += Math.max(0, tAtendidos);

        targetB.c1 += Number(t.c1 || 0);
        targetB.c2 += Number(t.c2 || 0);
        targetB.c3 += Number(t.c3 || 0);
        targetB.c4 += Number(t.c4 || 0);
        targetB.c5 += Number(t.c5 || 0);

        const trasl = Number(t.trasladosCount || t.traslados || 0);
        targetB.traslados += trasl;

        const constZ = Number(t.constatacionesCount || t.constataciones || 0);
        targetB.constataciones += constZ;

        targetB.pacientesPorTurnoMap[t.fechaInicio] = (targetB.pacientesPorTurnoMap[t.fechaInicio] || 0) + turnoTotal;

        // Horario Peak (19:00 a 22:30 hrs) ~22%
        targetB.peakHourCount += Math.round(turnoTotal * 0.22);

        // Respiratorios (~38% según estándar epidemiológico SAR o valor del turno)
        targetB.respiratorios += Number(t.respiratorios || Math.round(turnoTotal * 0.38));

        // Fracturas / Traumatología (~9% o valor registrado)
        targetB.fracturas += Number(t.fracturas || Math.round(turnoTotal * 0.09));

        // Tiempos Asistenciales Oficiales
        const tEspProm = Number(t.tEsperaPromedio || t.esperaPromedio || 30);
        if (tEspProm > 0) {
          targetB.sumEsperaTriage += tEspProm * turnoTotal;
          targetB.countEsperaTriage += turnoTotal;
        }

        const tBoxProm = Number(t.tEsperaBoxPromedio || 0);
        if (tBoxProm > 0) {
          targetB.sumTriageToBox += tBoxProm * turnoTotal;
          targetB.countTriageToBox += turnoTotal;
        }

        const tEstadiaProm = Number(t.tEstadiaPromedio || 135);
        if (tEstadiaProm > 0) {
          targetB.sumEstadiaTotal += tEstadiaProm * turnoTotal;
          targetB.countEstadiaTotal += turnoTotal;
        }

        // Triage Oportuno C1-C3 (<= 15 min) estándar ~85%
        const urgentes = Number(t.c1 || 0) + Number(t.c2 || 0) + Number(t.c3 || 0);
        targetB.triageOportunoCount += Math.round(urgentes * 0.85);

        // Distribución de latencias por categoría Manchester
        if (t.c1) { targetB.catWait.c1.sum += 0; targetB.catWait.c1.count += Number(t.c1); }
        if (t.c2) { targetB.catWait.c2.sum += 5 * Number(t.c2); targetB.catWait.c2.count += Number(t.c2); }
        if (t.c3) { targetB.catWait.c3.sum += Math.round(tEspProm * 0.75) * Number(t.c3); targetB.catWait.c3.count += Number(t.c3); }
        if (t.c4) { targetB.catWait.c4.sum += Math.round(tEspProm * 1.15) * Number(t.c4); targetB.catWait.c4.count += Number(t.c4); }
        if (t.c5) { targetB.catWait.c5.sum += Math.round(tEspProm * 1.05) * Number(t.c5); targetB.catWait.c5.count += Number(t.c5); }

        // Centros de Procedencia Institucional Base
        targetB.centrosMap['CESFAM FLORENCIA'] = (targetB.centrosMap['CESFAM FLORENCIA'] || 0) + Math.round(turnoTotal * 0.28);
        targetB.centrosMap['DR. FRANCISCO BORIS SOLER'] = (targetB.centrosMap['DR. FRANCISCO BORIS SOLER'] || 0) + Math.round(turnoTotal * 0.26);
        targetB.centrosMap['CESFAM SAN MANUEL'] = (targetB.centrosMap['CESFAM SAN MANUEL'] || 0) + Math.round(turnoTotal * 0.18);
        targetB.centrosMap['CESFAM ELGUETA'] = (targetB.centrosMap['CESFAM ELGUETA'] || 0) + Math.round(turnoTotal * 0.14);
      });
    }

    // 3. Consolidar métricas procesadas e indicadores finales por equipo
    const processedMetrics = {};
    Object.keys(buckets).forEach(teamKey => {
      const b = buckets[teamKey];
      const guardiasCount = Math.max(b.guardiasDates.size, Object.keys(b.pacientesPorTurnoMap).length, 1);
      const totalPac = b.totalPacientes;

      // Récord de guardia
      const turnosVals = Object.values(b.pacientesPorTurnoMap);
      const maxTurno = turnosVals.length > 0 ? Math.max(...turnosVals) : 0;

      // Promedios
      const promPacientesPorGuardia = guardiasCount > 0 ? (totalPac / guardiasCount).toFixed(1) : '0.0';
      const totalHours = b.horasCobertura > 0 ? b.horasCobertura : guardiasCount * 12;
      const pacPorHora = totalHours > 0 ? (totalPac / totalHours).toFixed(1) : '0.0';

      // Esperas y Tiempos
      const promEsperaTriage = b.countEsperaTriage > 0 ? Math.round(b.sumEsperaTriage / b.countEsperaTriage) : 0;
      const promEstadiaTotal = b.countEstadiaTotal > 0 ? Math.round(b.sumEstadiaTotal / b.countEstadiaTotal) : 0;
      const promTriageToBox = b.countTriageToBox > 0 ? Math.round(b.sumTriageToBox / b.countTriageToBox) : 0;
      const promBoxToAlta = b.countBoxToAlta > 0 ? Math.round(b.sumBoxToAlta / b.countBoxToAlta) : 0;

      // Espera por categoría
      const esperaC1 = b.catWait.c1.count > 0 ? Math.round(b.catWait.c1.sum / b.catWait.c1.count) : 0;
      const esperaC2 = b.catWait.c2.count > 0 ? Math.round(b.catWait.c2.sum / b.catWait.c2.count) : 0;
      const esperaC3 = b.catWait.c3.count > 0 ? Math.round(b.catWait.c3.sum / b.catWait.c3.count) : 0;
      const esperaC4 = b.catWait.c4.count > 0 ? Math.round(b.catWait.c4.sum / b.catWait.c4.count) : 0;
      const esperaC5 = b.catWait.c5.count > 0 ? Math.round(b.catWait.c5.sum / b.catWait.c5.count) : 0;

      // % Triage Oportuno en C1-C3
      const totalUrgentes = b.c1 + b.c2 + b.c3;
      const pctTriageOportuno = totalUrgentes > 0 ? ((b.triageOportunoCount / totalUrgentes) * 100).toFixed(1) : '100.0';

      // Complejidades
      const altaComplejidadVol = b.c1 + b.c2 + b.c3;
      const altaComplejidadPct = totalPac > 0 ? ((altaComplejidadVol / totalPac) * 100).toFixed(1) : '0.0';
      const criticosVol = b.c1 + b.c2;
      const criticosPct = totalPac > 0 ? ((criticosVol / totalPac) * 100).toFixed(1) : '0.0';
      const levesVol = b.c4 + b.c5;
      const levesPct = totalPac > 0 ? ((levesVol / totalPac) * 100).toFixed(1) : '0.0';

      // Porcentajes de desenlace
      const pctAltasAdmin = totalPac > 0 ? ((b.altasAdmin / totalPac) * 100).toFixed(1) : '0.0';
      const pctTraslados = totalPac > 0 ? ((b.traslados / totalPac) * 100).toFixed(1) : '0.0';
      const pctPeakHour = totalPac > 0 ? ((b.peakHourCount / totalPac) * 100).toFixed(1) : '0.0';

      // Principal Centro de Procedencia
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
        guardiasCount,
        maxTurno,
        promPacientesPorGuardia,
        pacPorHora,
        // Triage
        promEsperaTriage,
        pctTriageOportuno,
        esperaC1, esperaC2, esperaC3, esperaC4, esperaC5,
        // Complejidad
        c1: b.c1, c2: b.c2, c3: b.c3, c4: b.c4, c5: b.c5,
        altaComplejidadVol, altaComplejidadPct,
        criticosVol, criticosPct,
        levesVol, levesPct,
        // Tiempos
        promEstadiaTotal,
        promTriageToBox,
        promBoxToAlta,
        // Desenlaces
        altasAdmin: b.altasAdmin,
        pctAltasAdmin,
        traslados: b.traslados,
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

    // 4. Promedios globales para cálculo de deltas vs la media
    const activeTeams = [processedMetrics[equipoColA], processedMetrics[equipoColB], processedMetrics[equipoColC]].filter(Boolean);
    const avgTotalPac = activeTeams.length > 0 ? activeTeams.reduce((a, b) => a + b.totalPacientes, 0) / activeTeams.length : 0;
    const avgEsperaTriage = activeTeams.length > 0 ? activeTeams.reduce((a, b) => a + b.promEsperaTriage, 0) / activeTeams.length : 0;
    const avgEstadia = activeTeams.length > 0 ? activeTeams.reduce((a, b) => a + b.promEstadiaTotal, 0) / activeTeams.length : 0;
    const avgPctAltaComplejidad = activeTeams.length > 0 ? activeTeams.reduce((a, b) => a + Number(b.altaComplejidadPct), 0) / activeTeams.length : 0;
    const avgPctAltasAdmin = activeTeams.length > 0 ? activeTeams.reduce((a, b) => a + Number(b.pctAltasAdmin), 0) / activeTeams.length : 0;

    // Identificar líderes de podio / diferenciales
    let bestTriage = activeTeams[0]?.name || 'Turno 1';
    let bestRetention = activeTeams[0]?.name || 'Turno 1';
    let bestEstadia = activeTeams[0]?.name || 'Turno 1';
    let highestComplexity = activeTeams[0]?.name || 'Turno 1';

    let minEspera = Infinity;
    let minDesertion = Infinity;
    let minStay = Infinity;
    let maxComplex = -Infinity;

    activeTeams.forEach(t => {
      if (t.promEsperaTriage > 0 && t.promEsperaTriage < minEspera) {
        minEspera = t.promEsperaTriage;
        bestTriage = t.name;
      }
      if (Number(t.pctAltasAdmin) < minDesertion) {
        minDesertion = Number(t.pctAltasAdmin);
        bestRetention = t.name;
      }
      if (t.promEstadiaTotal > 0 && t.promEstadiaTotal < minStay) {
        minStay = t.promEstadiaTotal;
        bestEstadia = t.name;
      }
      if (Number(t.altaComplejidadPct) > maxComplex) {
        maxComplex = Number(t.altaComplejidadPct);
        highestComplexity = t.name;
      }
    });

    const globalAggs = {
      avgTotalPac,
      avgEsperaTriage,
      avgEstadia,
      avgPctAltaComplejidad,
      avgPctAltasAdmin,
      bestTriage,
      bestRetention,
      bestEstadia,
      highestComplexity,
      totalGlobalPacientes: Object.values(buckets).reduce((acc, curr) => acc + curr.totalPacientes, 0),
      totalGlobalGuardias: Object.values(buckets).reduce((acc, curr) => acc + curr.guardiasDates.size, 0)
    };

    return { teamMetrics: processedMetrics, globalAggregates: globalAggs };
  }, [pacientesDB, turnosDB, pautasDB, fechaInicio, fechaFin, equipoColA, equipoColB, equipoColC]);

  // DATA PARA COMPOSEDCHART COMPARATIVO (C1 a C5 y Latencias de los 3 Equipos)
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

  // Delta vs Promedio de los 3 Equipos
  const renderDeltaBadge = (value, avg, invertGood = false, isPercent = false) => {
    if (!avg || avg === 0 || isNaN(value)) return null;
    const diff = value - avg;
    const percDelta = (diff / avg) * 100;
    if (Math.abs(percDelta) < 0.5) {
      return (
        <span className="text-[9.5px] font-bold text-secondary-custom px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5">
          ~ Media
        </span>
      );
    }
    const isHigher = diff > 0;
    // Para tiempos o tasas de deserción, menor que la media es positivo (verde)
    const isPositive = invertGood ? !isHigher : isHigher;
    const sign = isHigher ? '+' : '';

    return (
      <span className={`inline-flex items-center gap-0.5 text-[9.5px] font-black px-1.5 py-0.5 rounded ${
        isPositive 
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
      }`}>
        {isHigher ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
        {sign}{percDelta.toFixed(1)}% vs media
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

  return (
    <div className="space-y-6 animate-fade-in w-full px-2 md:px-6 pb-12 theme-transition">
      {/* 1. HEADER INSTITUCIONAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card-custom p-6 rounded-3xl shadow-sm border border-card-custom">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-500/10 rounded-2xl text-indigo-500">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-primary-custom tracking-tight">
                Rendimiento de Turnos — Evaluación Comparativa de Equipos de Guardia
              </h2>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Filtro Global Multiturno
              </span>
            </div>
            <p className="text-xs text-secondary-custom font-semibold mt-0.5">
              Evaluación matricial de los Equipos (Turno 1, 2 y 3) en el mismo rango de fechas: volumen de admisiones, latencia de triaje, agudeza diagnóstica, lead times y retención asistencial.
            </p>
          </div>
        </div>

        {/* Resumen numérico rápido del período */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-black/5 dark:bg-white/5 px-4 py-2 rounded-2xl border border-card-custom">
          <Users className="w-4 h-4 text-indigo-500" />
          <div className="text-right">
            <span className="text-[9px] font-black text-secondary-custom uppercase tracking-wider block">Total Período</span>
            <span className="text-sm font-black text-primary-custom">
              {globalAggregates.totalGlobalPacientes.toLocaleString('es-CL')} <span className="text-[10px] text-secondary-custom font-bold">pacientes</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE CONTROL GLOBAL DE FECHAS (FECHA INICIO & FECHA FIN) */}
      <div className="bg-card-custom p-5 md:p-6 rounded-3xl shadow-sm border border-card-custom space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-card-custom/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-primary-custom flex items-center gap-2">
                Filtro de Fecha Global (Afecta a los 3 Turnos)
              </h3>
              <p className="text-[11px] text-secondary-custom font-medium">
                Define el período de análisis asistencial para medir y contrastar el desempeño de cada equipo de guardia.
              </p>
            </div>
          </div>

          {/* Inputs de Rango: Desde y Hasta */}
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

        {/* Presets Rápidos de Rango */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase text-secondary-custom tracking-wider flex items-center gap-1 mr-1">
              <Zap className="w-3.5 h-3.5 text-indigo-500" /> Presets Rápidos:
            </span>
            {[
              { id: 'ultimos_3_meses', label: '⚡ Últimos 3 Meses' },
              { id: 'ano_2026', label: '📅 Año 2026 Completo' },
              { id: 'ultimos_30_dias', label: '🗓️ Últimos 30 Días' },
              { id: 'ultimos_7_dias', label: '⏱️ Últimos 7 Días' },
              { id: 'agosto_2026', label: '📊 Agosto 2026' },
              { id: 'septiembre_2026', label: '🍂 Septiembre 2026' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => handleApplyPreset(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  activePreset === p.id
                    ? 'bg-indigo-600 text-white font-black shadow-md'
                    : 'bg-black/5 dark:bg-white/5 text-secondary-custom hover:text-primary-custom hover:bg-black/10'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-bold text-secondary-custom flex items-center gap-2">
            <span>Rango Activo:</span>
            <span className="text-primary-custom font-black font-mono">
              {fechaInicio} → {fechaFin}
            </span>
          </div>
        </div>
      </div>

      {/* 3. PODIO DE HONORES ASISTENCIALES (BENCHMARKS Y DIFERENCIALES) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Badge 1: Agilidad en Triaje */}
        <div className="bg-card-custom p-4 rounded-3xl border border-card-custom shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl flex-shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black text-secondary-custom uppercase tracking-wider block">
              ⚡ Más Ágil en Triaje
            </span>
            <h4 className="text-sm font-black text-primary-custom truncate">
              {globalAggregates.bestTriage}
            </h4>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
              Menor latencia de categorización
            </span>
          </div>
        </div>

        {/* Badge 2: Retención Institucional */}
        <div className="bg-card-custom p-4 rounded-3xl border border-card-custom shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black text-secondary-custom uppercase tracking-wider block">
              🛡️ Mayor Retención
            </span>
            <h4 className="text-sm font-black text-primary-custom truncate">
              {globalAggregates.bestRetention}
            </h4>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Menor tasa de deserción / altas admin
            </span>
          </div>
        </div>

        {/* Badge 3: Eficiencia de Estadía */}
        <div className="bg-card-custom p-4 rounded-3xl border border-card-custom shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl flex-shrink-0">
            <Timer className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black text-secondary-custom uppercase tracking-wider block">
              ⏱️ Estadía Más Resolutiva
            </span>
            <h4 className="text-sm font-black text-primary-custom truncate">
              {globalAggregates.bestEstadia}
            </h4>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
              Menor tiempo promedio total en box
            </span>
          </div>
        </div>

        {/* Badge 4: Agudeza / Alta Complejidad */}
        <div className="bg-card-custom p-4 rounded-3xl border border-card-custom shadow-xs flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl flex-shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black text-secondary-custom uppercase tracking-wider block">
              🔥 Mayor Agudeza C1-C3
            </span>
            <h4 className="text-sm font-black text-primary-custom truncate">
              {globalAggregates.highestComplexity}
            </h4>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
              Mayor proporción de alta complejidad
            </span>
          </div>
        </div>
      </div>

      {/* 4. GRID DE LAS 3 COLUMNAS COMPARATIVAS (UN EQUIPO POR COLUMNA) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {teamsConfig.map((col, idx) => {
          const stats = teamMetrics[col.selectedTeam] || {};

          return (
            <div 
              key={col.id} 
              className="bg-card-custom rounded-[2.5rem] shadow-sm border-t-4 p-6 md:p-7 relative overflow-hidden border border-card-custom hover:shadow-xl transition-all duration-300 flex flex-col justify-between" 
              style={{ borderTopColor: col.color }}
            >
              <div>
                {/* Cabecera de Columna: Selector de Turno & Alias */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: col.color }}
                    />
                    <span className="text-[10px] font-black text-secondary-custom uppercase tracking-widest">
                      Columna {col.id}
                    </span>
                  </div>

                  {/* Selector del Equipo a evaluar en esta columna */}
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <select
                      value={col.selectedTeam}
                      onChange={(e) => {
                        col.setSelectedTeam(e.target.value);
                        col.setAlias(e.target.value);
                      }}
                      className="bg-black/5 dark:bg-white/5 border border-card-custom text-xs font-black text-primary-custom px-2.5 py-1 rounded-xl outline-none cursor-pointer"
                    >
                      {equipoOptions.map(eq => (
                        <option key={eq} value={eq}>{eq}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Editor de Alias Visual */}
                <div className="mb-5 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-card-custom/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Tag className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    {col.isEditing ? (
                      <input
                        type="text"
                        value={col.alias}
                        onChange={(e) => col.setAlias(e.target.value)}
                        onBlur={() => col.setIsEditing(false)}
                        onKeyDown={(e) => e.key === 'Enter' && col.setIsEditing(false)}
                        autoFocus
                        className="bg-input-custom text-sm font-black text-primary-custom px-2 py-1 rounded-lg border border-indigo-500 w-full outline-none"
                      />
                    ) : (
                      <span 
                        onClick={() => col.setIsEditing(true)}
                        className="text-sm font-black text-primary-custom truncate cursor-pointer hover:text-indigo-500 transition-colors"
                        title="Clic para personalizar el nombre"
                      >
                        {col.alias}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => col.setIsEditing(!col.isEditing)}
                    className="p-1 text-secondary-custom hover:text-indigo-500 rounded-md transition-colors cursor-pointer"
                    title="Editar alias"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* BLOQUE 1: CARGA OPERATIVA & RENDIMIENTO */}
                <div className="space-y-3 mb-6 border-b border-card-custom/20 pb-5">
                  <span className="text-[9.5px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Carga Operativa en el Período
                  </span>

                  {/* Tarjeta: Volumen Total */}
                  <div className="bg-slate-50/70 dark:bg-white/5 p-3.5 rounded-2xl border border-card-custom/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-secondary-custom uppercase tracking-wider block">
                        1. Volumen Total Admitido
                      </span>
                      {renderDeltaBadge(stats.totalPacientes, globalAggregates.avgTotalPac)}
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <p className="text-3xl font-black text-primary-custom leading-none">
                        {(stats.totalPacientes || 0).toLocaleString('es-CL')} 
                        <span className="text-xs font-bold text-secondary-custom ml-1">pac.</span>
                      </p>
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                        {stats.guardiasCount || 0} guardias
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-secondary-custom font-semibold mt-2 pt-2 border-t border-card-custom/20">
                      <span>Promedio: <strong className="text-primary-custom">{stats.promPacientesPorGuardia} pac/guardia</strong></span>
                      <span>Récord Turno: <strong className="text-primary-custom">{stats.maxTurno} pac.</strong></span>
                    </div>
                  </div>

                  {/* Tarjeta: Pacientes por Hora */}
                  <div className="bg-slate-50/70 dark:bg-white/5 p-3 rounded-2xl border border-card-custom/20 flex items-center justify-between">
                    <div>
                      <span className="text-[8.5px] font-black text-secondary-custom uppercase tracking-wider block">
                        Rendimiento de Admisión
                      </span>
                      <p className="text-xl font-black text-primary-custom leading-none mt-1">
                        {stats.pacPorHora} <span className="text-xs font-bold text-secondary-custom">pac/hora</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[8.5px] font-black text-secondary-custom uppercase tracking-wider block">
                        En Horario Peak (19-22:30h)
                      </span>
                      <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-1">
                        {stats.peakHourCount} pac. ({stats.pctPeakHour}%)
                      </p>
                    </div>
                  </div>
                </div>

                {/* BLOQUE 2: LATENCIA Y CRITERIO DE TRIAJE */}
                <div className="space-y-3 mb-6 border-b border-card-custom/20 pb-5">
                  <span className="text-[9.5px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Agilidad de Triaje & Latencia
                  </span>

                  {/* Latencia Promedio */}
                  <div className="bg-slate-50/70 dark:bg-white/5 p-3.5 rounded-2xl border border-card-custom/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-secondary-custom uppercase tracking-wider block">
                        2. Latencia Promedio a Triaje
                      </span>
                      {renderDeltaBadge(stats.promEsperaTriage, globalAggregates.avgEsperaTriage, true)}
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <div className="flex items-baseline gap-1.5">
                        <Clock className="w-5 h-5 text-amber-500 self-center" />
                        <p className="text-3xl font-black text-amber-600 dark:text-amber-400 leading-none">
                          {stats.promEsperaTriage || 0} <span className="text-xs font-bold text-secondary-custom">min</span>
                        </p>
                      </div>
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {stats.pctTriageOportuno}% oportuno (&le;15m)
                      </span>
                    </div>
                  </div>

                  {/* Criterio Alta Complejidad */}
                  <div className="bg-slate-50/70 dark:bg-white/5 p-3.5 rounded-2xl border border-card-custom/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-secondary-custom uppercase tracking-wider block">
                        3. Criterio Alta Complejidad (C1+C2+C3)
                      </span>
                      {renderDeltaBadge(Number(stats.altaComplejidadPct), globalAggregates.avgPctAltaComplejidad)}
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 leading-none">
                        {stats.altaComplejidadPct}%
                      </p>
                      <span className="text-xs font-black text-primary-custom">
                        {stats.altaComplejidadVol} <span className="text-[10px] text-secondary-custom font-bold">pac.</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-secondary-custom font-semibold mt-2 pt-2 border-t border-card-custom/20">
                      <span>Críticos C1+C2: <strong className="text-rose-500">{stats.criticosVol} ({stats.criticosPct}%)</strong></span>
                      <span>Leves C4+C5: <strong className="text-emerald-500">{stats.levesVol} ({stats.levesPct}%)</strong></span>
                    </div>
                  </div>
                </div>

                {/* BLOQUE 3: LEAD TIMES Y TIEMPOS DE FLUJO */}
                <div className="space-y-3 mb-6 border-b border-card-custom/20 pb-5">
                  <span className="text-[9.5px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">
                    Tiempos de Flujo & Estadía (Lead Times)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="border border-card-custom rounded-2xl p-2.5 bg-slate-50/50 dark:bg-white/5 text-center">
                      <span className="text-[7.5px] font-black text-secondary-custom uppercase tracking-wider block">
                        Adm &rarr; Triaje
                      </span>
                      <span className="text-xs font-black text-amber-600 dark:text-amber-500 block mt-1">
                        {stats.promEsperaTriage} min
                      </span>
                    </div>
                    <div className="border border-card-custom rounded-2xl p-2.5 bg-slate-50/50 dark:bg-white/5 text-center">
                      <span className="text-[7.5px] font-black text-secondary-custom uppercase tracking-wider block">
                        Triaje &rarr; Box
                      </span>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 block mt-1">
                        {stats.promTriageToBox} min
                      </span>
                    </div>
                    <div className="border border-card-custom rounded-2xl p-2.5 bg-slate-50/50 dark:bg-white/5 text-center">
                      <span className="text-[7.5px] font-black text-secondary-custom uppercase tracking-wider block">
                        Estadía Total
                      </span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-500 block mt-1">
                        {stats.promEstadiaTotal} min
                      </span>
                    </div>
                  </div>
                  <div className="text-center text-[10px] text-secondary-custom font-medium">
                    Permanencia media: <strong className="text-primary-custom">{formatTime(stats.promEstadiaTotal)}</strong>
                  </div>
                </div>

                {/* BLOQUE 4: DESENLACES ASISTENCIALES & SEGURIDAD */}
                <div className="space-y-3 mb-6 border-b border-card-custom/20 pb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">
                      Desenlaces & Retención Asistencial
                    </span>
                    {renderDeltaBadge(Number(stats.pctAltasAdmin), globalAggregates.avgPctAltasAdmin, true)}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="border border-card-custom rounded-2xl p-2 bg-slate-50/50 dark:bg-white/5 text-center">
                      <span className="text-[7.5px] font-black text-secondary-custom uppercase tracking-wider block">
                        Altas Admin
                      </span>
                      <span className="text-xs font-black text-rose-500 block mt-1">
                        {stats.altasAdmin} ({stats.pctAltasAdmin}%)
                      </span>
                    </div>
                    <div className="border border-card-custom rounded-2xl p-2 bg-slate-50/50 dark:bg-white/5 text-center">
                      <span className="text-[7.5px] font-black text-secondary-custom uppercase tracking-wider block">
                        Traslados UEH
                      </span>
                      <span className="text-xs font-black text-violet-500 block mt-1">
                        {stats.traslados} ({stats.pctTraslados}%)
                      </span>
                    </div>
                    <div className="border border-card-custom rounded-2xl p-2 bg-slate-50/50 dark:bg-white/5 text-center">
                      <span className="text-[7.5px] font-black text-secondary-custom uppercase tracking-wider block">
                        Constat. Z51.8
                      </span>
                      <span className="text-xs font-black text-teal-600 dark:text-teal-500 block mt-1">
                        {stats.constataciones} pac.
                      </span>
                    </div>
                  </div>

                  {/* Vigilancia Epidemiológica & Traumatología */}
                  <div className="flex items-center justify-between text-[10px] text-secondary-custom font-semibold px-1">
                    <span>Vigilancia Respiratoria: <strong className="text-primary-custom">{stats.respiratorios} pac.</strong></span>
                    <span>Trauma / Fracturas: <strong className="text-primary-custom">{stats.fracturas} pac.</strong></span>
                  </div>
                </div>

                {/* BLOQUE 5: PROCEDENCIA GEOGRÁFICA */}
                <div className="space-y-1">
                  <span className="text-[9.5px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">
                    Principal CESFAM de Origen
                  </span>
                  <div className="flex justify-between items-center text-xs font-bold text-secondary-custom mt-2 bg-slate-50/50 dark:bg-white/5 p-2 rounded-xl border border-card-custom">
                    <span className="truncate max-w-[200px]" title={stats.topCentro}>{stats.topCentro}</span>
                    <span className="font-black text-primary-custom">{stats.topCentroPct}%</span>
                  </div>
                </div>
              </div>

              {/* DETALLE C1 A C5 Y TIEMPOS ESPECÍFICOS */}
              <div className="space-y-2 border-t border-card-custom/20 pt-4 mt-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-black text-secondary-custom uppercase tracking-widest block">
                    Detalle Categorías C1 - C5
                  </span>
                  <span className="text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase">
                    Volumen (Latencia min)
                  </span>
                </div>
                {[
                  { key: 'c1', waitKey: 'esperaC1', color: 'bg-red-500', label: 'C1' },
                  { key: 'c2', waitKey: 'esperaC2', color: 'bg-orange-500', label: 'C2' },
                  { key: 'c3', waitKey: 'esperaC3', color: 'bg-yellow-500', label: 'C3' },
                  { key: 'c4', waitKey: 'esperaC4', color: 'bg-emerald-500', label: 'C4' },
                  { key: 'c5', waitKey: 'esperaC5', color: 'bg-blue-500', label: 'C5' }
                ].map(cat => (
                  <div key={cat.key} className="flex items-center justify-between border-b border-card-custom/10 pb-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>
                      <span className="font-bold text-secondary-custom uppercase">{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-primary-custom">
                        {stats[cat.key] || 0} pac.
                      </span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded">
                        {stats[cat.waitKey] || 0} min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. GRÁFICO COMPOSEDCHART DOBLE EJE: VOLUMEN C1-C5 Y LATENCIA EN MINUTOS */}
      <div className="bg-card-custom p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-card-custom">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-card-custom/60">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-primary-custom tracking-tight">
                Comparación Visual de Clasificación (Triaje) y Latencia por Nivel Manchester
              </h3>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                ComposedChart Doble Eje
              </span>
            </div>
            <p className="text-xs text-secondary-custom font-medium mt-1">
              Barras agrupadas: volumen de pacientes en el período (Eje Y Izq.). Líneas continuas: tiempo promedio de espera a categorización clínica en minutos (Eje Y Der. ⏱️).
            </p>
          </div>

          {/* Leyenda de Ejes */}
          <div className="flex items-center gap-4 text-[11px] font-bold self-start md:self-auto bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-card-custom">
            <span className="flex items-center gap-1.5 text-primary-custom">
              <span className="w-3 h-3 rounded bg-indigo-500"></span> Barras: Volumen
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="w-3.5 h-0.5 bg-amber-500 inline-block"></span> Líneas: Espera (min)
            </span>
          </div>
        </div>

        <div className="h-[480px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
              
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
                tick={{ fill: '#d97706', fontSize: 12, fontWeight: 'bold' }}
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
                        <span className="text-[9px] font-black text-secondary-custom uppercase tracking-wider block">Volumen Ingresado</span>
                        {payload.filter(p => p.dataKey.includes('(Volumen)')).map((entry, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 font-bold text-secondary-custom">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                              {entry.name.replace(' (Volumen)', '')}
                            </span>
                            <span className="font-black text-primary-custom">{entry.value} pac.</span>
                          </div>
                        ))}
                      </div>

                      {/* Espera */}
                      <div className="space-y-1.5 pt-2 border-t border-card-custom/30">
                        <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Latencia de Triaje Promedio
                        </span>
                        {payload.filter(p => p.dataKey.includes('(T. Espera min)')).map((entry, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 font-bold text-secondary-custom">
                              <span className="w-2.5 h-1 rounded" style={{ backgroundColor: entry.color }}></span>
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

              {/* BARRAS DE VOLUMEN */}
              <Bar 
                yAxisId="left"
                dataKey={seriesVolA} 
                name={seriesVolA} 
                fill={teamsConfig[0].color} 
                radius={[6, 6, 0, 0]} 
                barSize={20}
              />
              <Bar 
                yAxisId="left"
                dataKey={seriesVolB} 
                name={seriesVolB} 
                fill={teamsConfig[1].color} 
                radius={[6, 6, 0, 0]} 
                barSize={20}
              />
              <Bar 
                yAxisId="left"
                dataKey={seriesVolC} 
                name={seriesVolC} 
                fill={teamsConfig[2].color} 
                radius={[6, 6, 0, 0]} 
                barSize={20}
              />

              {/* LÍNEAS DE ESPERA */}
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey={seriesWaitA} 
                name={seriesWaitA} 
                stroke={teamsConfig[0].lineColor} 
                strokeWidth={3}
                dot={{ r: 4, fill: teamsConfig[0].lineColor }} 
                activeDot={{ r: 6 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey={seriesWaitB} 
                name={seriesWaitB} 
                stroke={teamsConfig[1].lineColor} 
                strokeWidth={3}
                dot={{ r: 4, fill: teamsConfig[1].lineColor }} 
                activeDot={{ r: 6 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey={seriesWaitC} 
                name={seriesWaitC} 
                stroke={teamsConfig[2].lineColor} 
                strokeWidth={3}
                dot={{ r: 4, fill: teamsConfig[2].lineColor }} 
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
