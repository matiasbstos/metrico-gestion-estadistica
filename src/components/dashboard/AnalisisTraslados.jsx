import React, { useMemo, useState } from 'react';
import { 
  Users, Calendar, MapPin, Activity, Clock, FileSpreadsheet, Filter, CheckCircle2, Info, ArrowLeftRight, HelpCircle, TrendingUp, TrendingDown, GitCompare, X, ArrowUpRight, Award
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell,
  ComposedChart, Line, AreaChart, Area
} from 'recharts';
import * as XLSX from 'xlsx';
import { obtenerTurnoDetallado, deduplicarPacientes } from '../../utils/helpers';
import { generateTrasladosSummary } from '../../utils/summaryGenerator';

export default function AnalisisTraslados({ 
  pacientesFiltrados, 
  pacientesDB, 
  turnosDB, 
  pautasDB,
  filtroFechaInicio, 
  filtroFechaFin,
  modoComparativo,
  filtroFechaInicioB,
  filtroFechaFinB,
  kpisBigQuery
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDetailPatients, setSelectedDetailPatients] = useState(null);
  const [detailModalTitle, setDetailModalTitle] = useState('');

  // 1. Estados de fecha locales para que el usuario pueda interactuar directamente sobre el grafico
  const [localFechaInicio, setLocalFechaInicio] = useState(filtroFechaInicio || '2026-01-01');
  const [localFechaFin, setLocalFechaFin] = useState(filtroFechaFin || '2026-07-31');
  const [localModoComparativo, setLocalModoComparativo] = useState(modoComparativo || false);
  const [localFechaInicioB, setLocalFechaInicioB] = useState(filtroFechaInicioB || '2025-01-01');
  const [localFechaFinB, setLocalFechaFinB] = useState(filtroFechaFinB || '2025-07-31');

  // Sincronizar estados locales con los cambios de props globales
  React.useEffect(() => {
    if (filtroFechaInicio) setLocalFechaInicio(filtroFechaInicio);
  }, [filtroFechaInicio]);

  React.useEffect(() => {
    if (filtroFechaFin) setLocalFechaFin(filtroFechaFin);
  }, [filtroFechaFin]);

  React.useEffect(() => {
    if (modoComparativo !== undefined) setLocalModoComparativo(modoComparativo);
  }, [modoComparativo]);

  React.useEffect(() => {
    if (filtroFechaInicioB) setLocalFechaInicioB(filtroFechaInicioB);
  }, [filtroFechaInicioB]);

  React.useEffect(() => {
    if (filtroFechaFinB) setLocalFechaFinB(filtroFechaFinB);
  }, [filtroFechaFinB]);

  // Obtener la lista base de pacientes según el período local seleccionado (Priorizando pacientesFiltrados)
  const targetPacientes = useMemo(() => {
    if (pacientesFiltrados && pacientesFiltrados.length > 0) {
      return pacientesFiltrados;
    }
    if (!pacientesDB || !localFechaInicio || !localFechaFin) return [];
    const startMs = new Date(localFechaInicio + 'T00:00:00').getTime();
    const endMs = new Date(localFechaFin + 'T23:59:59').getTime();
    return pacientesDB.filter(p => p.tAdmision && p.tAdmision >= startMs && p.tAdmision <= endMs);
  }, [pacientesFiltrados, pacientesDB, localFechaInicio, localFechaFin]);

  // Regla Oficial Estricta: Traslado a Hospital / Servicio de Urgencia / Urgencias
  const isTraslado = (p) => {
    if (!p) return false;
    const dest = String(p.destinoAlta || p.destino || p.lugarDerivacion || p.motivoAlta || p.tipoAlta || '').toLowerCase();
    const cat = String(p.categoria || p.triage || '').toLowerCase();
    const obs = String(p.observacion || p.obs || '').toLowerCase();

    const isConsultorioOAmb = dest.includes('consultorio') || dest.includes('cesfam') || dest.includes('domicilio');
    const hasHospitalOUrgencia = dest.includes('hosp') || dest.includes('urgenc') || dest.includes('emergenc') || dest.includes('ueh');

    if (isConsultorioOAmb && !hasHospitalOUrgencia) {
      return false;
    }

    return (
      hasHospitalOUrgencia ||
      dest.includes('samu') ||
      obs.includes('hosp') ||
      obs.includes('urgenc') ||
      obs.includes('traslado a') ||
      cat === 'c1'
    );
  };

  // 2. Filtrar y deduplicar pacientes de traslado (por Correlativo + Franja Horaria)
  const pacientesTraslados = useMemo(() => {
    const raw = targetPacientes.filter(isTraslado);
    return deduplicarPacientes(raw);
  }, [targetPacientes]);

  // 3. Filtrar dinámicamente por término de búsqueda (opcional para el listado)
  const pacientesTrasladosFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return pacientesTraslados;
    const q = searchTerm.toLowerCase().trim();
    return pacientesTraslados.filter(p => {
      const diag = String(p.diagnosticoPrincipal || '').toLowerCase();
      const cod = String(p.codigoDiagnostico || '').toLowerCase();
      const com = String(p.comuna || '').toLowerCase();
      const nac = String(p.nacionalidad || '').toLowerCase();
      const sexo = String(p.sexo || '').toLowerCase();
      return diag.includes(q) || cod.includes(q) || com.includes(q) || nac.includes(q) || sexo.includes(q);
    });
  }, [pacientesTraslados, searchTerm]);

  // Helpers de fecha robustos
  const formatDate = (timestamp) => {
    const d = new Date(timestamp);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const generateDateRangeList = (startMs, endMs) => {
    const list = [];
    const curr = new Date(startMs);
    const end = new Date(endMs);
    let limit = 0;
    while (curr <= end && limit < 1000) {
      const day = String(curr.getDate()).padStart(2, '0');
      const month = String(curr.getMonth() + 1).padStart(2, '0');
      const year = curr.getFullYear();
      list.push(`${day}/${month}/${year}`);
      curr.setDate(curr.getDate() + 1);
      limit++;
    }
    return list;
  };

  // Datos diarios de traslados para Periodo A (combinando pacientesDB + turnosDB)
  const dailyDataA = useMemo(() => {
    if (!localFechaInicio || !localFechaFin) return [];
    const startMs = new Date(localFechaInicio + 'T00:00:00').getTime();
    const endMs = new Date(localFechaFin + 'T23:59:59').getTime();

    const dateList = generateDateRangeList(startMs, endMs);
    const counts = {};
    dateList.forEach(d => { counts[d] = 0; });

    // Sumar de pacientes individuales
    (pacientesTraslados || []).forEach(p => {
      if (!p.tAdmision || p.tAdmision < startMs || p.tAdmision > endMs) return;
      const key = formatDate(p.tAdmision);
      if (counts[key] !== undefined) {
        counts[key]++;
      }
    });

    // Respaldar/Sumar con turnosDB si el desglose paciente por paciente no está completo
    (turnosDB || []).forEach(t => {
      if (!t.fechaInicio || t.fechaInicio < localFechaInicio || t.fechaInicio > localFechaFin) return;
      const parts = t.fechaInicio.split('-');
      if (parts.length === 3) {
        const key = `${parts[2]}/${parts[1]}/${parts[0]}`;
        const c1Count = Number(t.c1 || 0);
        const c2Count = Number(t.c2 || 0);
        const countEmerg = c1Count > 0 ? c1Count : (c2Count > 0 ? Math.ceil(c2Count * 0.15) : 0);
        if (counts[key] !== undefined && counts[key] < countEmerg) {
          counts[key] = countEmerg;
        }
      }
    });

    return dateList.map(date => ({
      date,
      count: counts[date] || 0
    }));
  }, [pacientesTraslados, turnosDB, localFechaInicio, localFechaFin]);

  // Datos diarios de traslados para Periodo B (con desduplicacion inteligente)
  const dailyDataB = useMemo(() => {
    if (!localModoComparativo || !pacientesDB || !localFechaInicioB || !localFechaFinB) return [];
    const startMs = new Date(localFechaInicioB + 'T00:00:00').getTime();
    const endMs = new Date(localFechaFinB + 'T23:59:59').getTime();

    const dateList = generateDateRangeList(startMs, endMs);
    const counts = {};
    dateList.forEach(d => { counts[d] = 0; });

    const rawB = pacientesDB.filter(p => p.tAdmision && p.tAdmision >= startMs && p.tAdmision <= endMs && isTraslado(p));
    const dedupB = deduplicarPacientes(rawB);

    dedupB.forEach(p => {
      const key = formatDate(p.tAdmision);
      if (counts[key] !== undefined) {
        counts[key]++;
      }
    });

    return dateList.map(date => ({
      date,
      count: counts[date] || 0
    }));
  }, [localModoComparativo, pacientesDB, localFechaInicioB, localFechaFinB]);

  // Datos de comparación diaria para Recharts (Periodo A vs B)
  const compareDailyData = useMemo(() => {
    if (!localModoComparativo) return [];
    const maxLen = Math.max(dailyDataA.length, dailyDataB.length);
    const list = [];
    for (let i = 0; i < maxLen; i++) {
      list.push({
        dayIndex: `Día ${i + 1}`,
        'Periodo A (Filtro)': dailyDataA[i] ? dailyDataA[i].count : 0,
        'Periodo B (Comparación)': dailyDataB[i] ? dailyDataB[i].count : 0
      });
    }
    return list;
  }, [localModoComparativo, dailyDataA, dailyDataB]);

  // KPIs principales
  const kpis = useMemo(() => {
    const totalTraslados = pacientesTraslados.length;
    const totalPacientesPeriodo = targetPacientes.length;
    const pctTraslados = totalPacientesPeriodo > 0 ? ((totalTraslados / totalPacientesPeriodo) * 100).toFixed(1) : '0.0';

    return {
      totalTraslados,
      totalPacientesPeriodo,
      pctTraslados
    };
  }, [pacientesTraslados, targetPacientes]);

  // 4. Comparación con el año anterior (mismo periodo)
  const prevYearStart = useMemo(() => {
    if (!localFechaInicio) return null;
    const d = new Date(localFechaInicio + 'T00:00:00');
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split('T')[0];
  }, [localFechaInicio]);

  const prevYearEnd = useMemo(() => {
    if (!localFechaFin) return null;
    const d = new Date(localFechaFin + 'T23:59:59');
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split('T')[0];
  }, [localFechaFin]);

  const pacientesPrevYear = useMemo(() => {
    if (!prevYearStart || !prevYearEnd || !pacientesDB) return [];
    const startMs = new Date(prevYearStart + 'T00:00:00').getTime();
    const endMs = new Date(prevYearEnd + 'T23:59:59').getTime();
    return pacientesDB.filter(p => p.tAdmision && p.tAdmision >= startMs && p.tAdmision <= endMs);
  }, [pacientesDB, prevYearStart, prevYearEnd]);

  const trasladosPrevYear = useMemo(() => {
    if (kpisBigQuery && kpisBigQuery.prevYearValues) {
      return kpisBigQuery.prevYearValues.traslados || 0;
    }
    const rawPrev = pacientesPrevYear.filter(isTraslado);
    return deduplicarPacientes(rawPrev).length;
  }, [pacientesPrevYear, kpisBigQuery]);

  const growthYOY = useMemo(() => {
    if (kpisBigQuery && kpisBigQuery.prevYearValues) {
      return kpisBigQuery.traslados.growthYear || 0;
    }
    if (trasladosPrevYear === 0) return null;
    const current = pacientesTraslados.length;
    return ((current - trasladosPrevYear) / trasladosPrevYear) * 100;
  }, [pacientesTraslados, trasladosPrevYear, kpisBigQuery]);

  // KPIs Adicionales de Frecuencia
  const maxTrasladosDay = useMemo(() => {
    let maxDay = { date: '-', count: 0 };
    dailyDataA.forEach(d => {
      if (d.count > maxDay.count) {
        maxDay = { date: d.date, count: d.count };
      }
    });
    return maxDay;
  }, [dailyDataA]);

  // Cálculo de Récord del Mes Activo para contextualizar benchmarks (incluso viendo 1 solo día)
  const maxTrasladosMes = useMemo(() => {
    if (!pacientesDB || pacientesDB.length === 0) return { count: 0, det: null, pacientes: [], mesNombre: 'Mes' };

    const activeMonth = (localFechaInicio || '2026-08').substring(0, 7);
    const pacsMes = pacientesDB.filter(p => {
      if (!p.tAdmision) return false;
      const d = new Date(p.tAdmision);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return mStr === activeMonth && isTraslado(p);
    });

    const deduplicatedMes = deduplicarPacientes(pacsMes);
    const shiftMap = {};
    const details = {};
    const patientMap = {};

    deduplicatedMes.forEach(p => {
      const det = obtenerTurnoDetallado(p.tAdmision, pautasDB);
      const key = `${det.fechaTurno} - ${det.equipo} • ${det.tipo} (${det.horario})`;
      shiftMap[key] = (shiftMap[key] || 0) + 1;
      details[key] = det;
      if (!patientMap[key]) patientMap[key] = [];
      patientMap[key].push(p);
    });

    let maxKey = null;
    let maxCount = 0;
    Object.entries(shiftMap).forEach(([key, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxKey = key;
      }
    });

    const monthNames = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const mNum = parseInt(activeMonth.split('-')[1] || '8', 10);

    return {
      count: maxCount,
      det: maxKey ? details[maxKey] : null,
      pacientes: maxKey ? patientMap[maxKey] : [],
      mesNombre: monthNames[mNum] || activeMonth,
      totalTrasladosMes: deduplicatedMes.length
    };
  }, [pacientesDB, localFechaInicio, pautasDB]);

  // Turno Récord dentro del Período Seleccionado (con jornada completa unificada)
  const maxTrasladosTurno = useMemo(() => {
    const counts = {};
    const details = {};
    const patientMap = {};

    pacientesTraslados.forEach(p => {
      if (!p.tAdmision) return;
      const det = obtenerTurnoDetallado(p.tAdmision, pautasDB);
      const key = `${det.fechaTurno} - ${det.equipo} • ${det.tipo} (${det.horario})`;
      counts[key] = (counts[key] || 0) + 1;
      details[key] = det;
      if (!patientMap[key]) patientMap[key] = [];
      patientMap[key].push(p);
    });

    let maxKey = null;
    let maxCount = 0;
    Object.entries(counts).forEach(([key, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxKey = key;
      }
    });

    return {
      count: maxCount,
      det: maxKey ? details[maxKey] : null,
      pacientes: maxKey ? patientMap[maxKey] : []
    };
  }, [pacientesTraslados, pautasDB]);

  // Ranking Top 10 de Días y Turnos con mayor cantidad de traslados (Datos Reales de Pacientes)
  const top10TurnosTraslados = useMemo(() => {
    const map = {};

    pacientesTraslados.forEach(p => {
      if (!p.tAdmision) return;
      const det = obtenerTurnoDetallado(p.tAdmision, pautasDB);
      const key = `${det.fechaTurno} - ${det.equipo} • ${det.tipo} (${det.horario})`;
      if (!map[key]) {
        map[key] = { key, count: 0, det, pacientes: [] };
      }
      map[key].count += 1;
      map[key].pacientes.push(p);
    });

    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [pacientesTraslados, pautasDB]);

  const promedioDiarioTraslados = useMemo(() => {
    if (dailyDataA.length === 0) return 0;
    const total = dailyDataA.reduce((acc, d) => acc + d.count, 0);
    return (total / dailyDataA.length).toFixed(1);
  }, [dailyDataA]);

  const topDestino = useMemo(() => {
    const counts = {};
    pacientesTraslados.forEach(p => {
      const dest = p.destinoAlta || p.destino || 'Sin Especificar';
      counts[dest] = (counts[dest] || 0) + 1;
    });
    let top = { name: '-', count: 0, pct: 0 };
    Object.entries(counts).forEach(([name, count]) => {
      if (count > top.count) {
        top = { name, count, pct: pacientesTraslados.length > 0 ? ((count / pacientesTraslados.length) * 100).toFixed(1) : 0 };
      }
    });
    return top;
  }, [pacientesTraslados]);

  // 1. Top 5 Diagnósticos asociados a traslados
  const topDiagnosticos = useMemo(() => {
    const counts = {};
    pacientesTraslados.forEach(p => {
      const diag = (p.diagnosticoPrincipal || 'SIN DIAGNÓSTICO ESPECIFICADO').toUpperCase().trim();
      const code = (p.codigoDiagnostico || 'S/C').toUpperCase().trim();
      const key = `${code}|${diag}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([key, count]) => {
        const [code, name] = key.split('|');
        return {
          code,
          name,
          count,
          percentage: kpis.totalTraslados > 0 ? ((count / kpis.totalTraslados) * 100).toFixed(1) : '0.0',
          percentageGlobal: kpis.totalPacientesPeriodo > 0 ? ((count / kpis.totalPacientesPeriodo) * 100).toFixed(2) : '0.00'
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [pacientesTraslados, kpis.totalTraslados, kpis.totalPacientesPeriodo]);

  // 2a. Distribución por Sexo
  const sexoData = useMemo(() => {
    let hombres = 0, mujeres = 0, otros = 0;
    pacientesTraslados.forEach(p => {
      const s = String(p.sexo || '').toUpperCase();
      if (s.includes('MUJER') || s.includes('FEMENINO') || s === 'F') mujeres++;
      else if (s.includes('HOMBRE') || s.includes('MASCULINO') || s === 'M') hombres++;
      else otros++;
    });

    const data = [];
    if (hombres > 0) data.push({ name: 'Hombres', value: hombres, color: '#3b82f6' });
    if (mujeres > 0) data.push({ name: 'Mujeres', value: mujeres, color: '#ec4899' });
    if (otros > 0) data.push({ name: 'Otros / Sin Registro', value: otros, color: '#94a3b8' });
    return data;
  }, [pacientesTraslados]);

  // 2b. Grupo Etario (0 a 4, 5 a 9, etc.)
  const edadData = useMemo(() => {
    const ranges = [
      '0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', 
      '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'
    ];
    const counts = {};
    ranges.forEach(r => { counts[r] = 0; });
    counts['Desconocido'] = 0;

    pacientesTraslados.forEach(p => {
      const age = p.edad;
      if (age === null || age === undefined || isNaN(age)) {
        counts['Desconocido']++;
        return;
      }
      if (age >= 80) {
        counts['80+']++;
        return;
      }
      let placed = false;
      for (let i = 0; i < 16; i++) {
        const start = i * 5;
        const end = start + 4;
        if (age >= start && age <= end) {
          counts[`${start}-${end}`]++;
          placed = true;
          break;
        }
      }
      if (!placed) counts['Desconocido']++;
    });

    return Object.entries(counts).map(([range, count]) => ({
      range,
      Cantidad: count
    }));
  }, [pacientesTraslados]);

  const topRangosEtarios = useMemo(() => {
    return [...edadData]
      .filter(item => item.range !== 'Desconocido' && item.Cantidad > 0)
      .sort((a, b) => b.Cantidad - a.Cantidad)
      .slice(0, 3);
  }, [edadData]);

  // 2c. Nacionalidades
  const nacionalidadesData = useMemo(() => {
    const counts = {};
    pacientesTraslados.forEach(p => {
      const nac = String(p.nacionalidad || 'Sin Registro').toUpperCase().trim();
      counts[nac] = (counts[nac] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: kpis.totalTraslados > 0 ? ((count / kpis.totalTraslados) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.count - a.count);
  }, [pacientesTraslados, kpis.totalTraslados]);

  // 2d. Comunas principales
  const comunasData = useMemo(() => {
    const counts = {};
    pacientesTraslados.forEach(p => {
      const com = String(p.comuna || 'Sin Registro').toUpperCase().trim();
      counts[com] = (counts[com] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: kpis.totalTraslados > 0 ? ((count / kpis.totalTraslados) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Mostrar top 5 comunas
  }, [pacientesTraslados, kpis.totalTraslados]);

  const generateExcelReport = () => {
    if (!pacientesTraslados || pacientesTraslados.length === 0) {
      alert("No hay registros de traslados en el período seleccionado para exportar.");
      return;
    }

    const centroActivo = localStorage.getItem('metrico_centro') || 'SAR Elsa Romo Aravena';

    const resumenData = [
      ["REPORTE ESTADÍSTICO - TRASLADOS HOSPITALARIOS"],
      [],
      ["Centro Activo:", centroActivo],
      ["Período Principal:", `${localFechaInicio} al ${localFechaFin}`],
      ["Total Traslados:", kpis.totalTraslados],
      ["% Representatividad de Volumen:", `${kpis.pctTraslados}%`],
      ["Promedio de Traslados Diario:", promedioDiarioTraslados],
      ["Centro Destino Principal:", topDestino.name],
      ["Turno Récord de Traslados:", maxTrasladosTurno.det 
        ? `Turno ${maxTrasladosTurno.det.turnoNum} (${maxTrasladosTurno.det.tipo}) con ${maxTrasladosTurno.count} pac.` 
        : "Sin registros"],
      [],
      ["Generado el:", new Date().toLocaleString("es-CL")]
    ];

    const detalleHeaders = [
      "Fecha y Hora",
      "Turno Asociado",
      "ID / Correlativo",
      "Destino de Alta",
      "Diagnóstico Médico",
      "Código CIE",
      "Profesional / Categorizador"
    ];

    const detalleRows = pacientesTraslados.map(p => {
      const d = p.tAdmision ? new Date(p.tAdmision) : null;
      const dateStr = d ? d.toLocaleDateString('es-CL') : '-';
      const timeStr = d ? d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '-';
      const turnoInfo = obtenerTurnoDetallado(p.tAdmision);
      return [
        `${dateStr} ${timeStr}`,
        turnoInfo.textoCompleto,
        p.correlativo || p.idPaciente || '-',
        p.destinoAlta || p.destino || '-',
        p.diagnosticoPrincipal || '-',
        p.codigoDiagnostico || '-',
        p.enf1 && p.enf1 !== 'No Registrado' ? p.enf1 : p.medico || '-'
      ];
    });

    const wb = XLSX.utils.book_new();
    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen General");

    const wsDetalle = XLSX.utils.aoa_to_sheet([detalleHeaders, ...detalleRows]);
    XLSX.utils.book_append_sheet(wb, wsDetalle, "Detalle de Pacientes");

    XLSX.writeFile(wb, `Reporte_Traslados_${localFechaInicio}_al_${localFechaFin}.xlsx`);
  };

  const prevYearPacs = useMemo(() => {
    if (!pacientesDB || !localFechaInicio || !localFechaFin) return [];
    const pStart = localFechaInicio.split('-');
    const pEnd = localFechaFin.split('-');
    if (pStart.length !== 3 || pEnd.length !== 3) return [];
    const prevStartStr = `${parseInt(pStart[0]) - 1}-${pStart[1]}-${pStart[2]}`;
    const prevEndStr = `${parseInt(pEnd[0]) - 1}-${pEnd[1]}-${pEnd[2]}`;
    const startMs = new Date(prevStartStr + 'T00:00:00').getTime();
    const endMs = new Date(prevEndStr + 'T23:59:59').getTime();
    return pacientesDB.filter(p => p.tAdmision && p.tAdmision >= startMs && p.tAdmision <= endMs);
  }, [pacientesDB, localFechaInicio, localFechaFin]);

  const summaryText = useMemo(() => 
    generateTrasladosSummary(pacientesTraslados, pacientesPrevYear, targetPacientes.length), 
    [pacientesTraslados, pacientesPrevYear, targetPacientes]
  );

  return (
    <div className="space-y-6">
      {/* SECCIÓN 1: Cabecera del Módulo */}
      <div className="bg-card-custom p-6 rounded-2xl border border-card-custom shadow-sm theme-transition flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        {/* Animated Background Ambulance Image */}
        <div className="absolute right-2 md:right-12 top-1/2 -translate-y-1/2 w-48 h-32 pointer-events-none select-none animate-float-ambulance opacity-15 dark:opacity-20 flex items-center justify-end">
          <img 
            src="/IMG/ambulance_bg.png" 
            alt="Ambulancia" 
            className="h-full object-contain" 
          />
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3.5 bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 text-indigo-500 rounded-2xl shadow-inner">
            <ArrowLeftRight className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-primary-custom tracking-wide uppercase">Módulo de Traslados Hospitalarios</h2>
            <p className="text-xs text-secondary-custom font-semibold mt-0.5">
              Análisis exclusivo de derivaciones a centros de urgencia externa y hospitalización.
            </p>
          </div>
        </div>

        <button
          onClick={generateExcelReport}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-900/20 transition cursor-pointer relative z-10"
        >
          <FileSpreadsheet className="w-4 h-4 text-white" />
          Generar Reporte Excel
        </button>
      </div>

      {/* Narrative Summary Box */}
      <div className="bg-card-custom p-5 rounded-2xl border border-card-custom shadow-sm flex flex-col theme-transition">
        <h4 className="text-[10px] font-black tracking-wider uppercase text-secondary-custom mb-2.5 flex items-center gap-1.5 border-b border-card-custom/20 pb-2">
          <Info className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          Análisis Crítico y Gestión de Traslados Hospitalarios
        </h4>
        <p className="text-xs text-primary-custom leading-relaxed font-semibold">
          {summaryText}
        </p>
      </div>

      {/* TARJETAS DE KPIs SUPERIORES (6 TARJETAS CON MÁXIMO PROTAGONISMO E INTERACTIVAS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Tarjeta 1: Total Traslados */}
        <div 
          onClick={() => {
            setSelectedDetailPatients(pacientesTraslados);
            setDetailModalTitle(`Desglose de Todos los Traslados (${pacientesTraslados.length} pac.)`);
          }}
          className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 p-4 rounded-2xl border border-indigo-500/20 shadow-sm flex flex-col justify-between min-h-[140px] theme-transition relative overflow-hidden cursor-pointer hover:border-indigo-500 hover:-translate-y-0.5 hover:shadow-lg group"
        >
          <ArrowUpRight className="absolute top-3 right-3 w-4 h-4 text-indigo-500/40 group-hover:text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
          <div>
            <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">TOTAL TRASLADOS</span>
            <div className="text-3xl font-black text-indigo-500 mt-2 mb-1">{kpis.totalTraslados} <span className="text-xs font-bold text-secondary-custom">pac.</span></div>
          </div>
          <div className="mt-auto">
            {growthYOY !== null ? (
              <div className="flex items-center gap-1 text-[10px] font-bold">
                {growthYOY > 0 ? (
                  <span className="text-rose-500">+{growthYOY.toFixed(1)}%</span>
                ) : growthYOY < 0 ? (
                  <span className="text-emerald-500">{growthYOY.toFixed(1)}%</span>
                ) : (
                  <span className="text-secondary-custom">0.0%</span>
                )}
                <span className="text-secondary-custom opacity-70">vs {prevYearStart ? prevYearStart.substring(0, 4) : 'año ant.'}</span>
              </div>
            ) : (
              <span className="text-[8px] font-bold text-secondary-custom/70">Sin comparación YoY</span>
            )}
          </div>
        </div>

        {/* Tarjeta 2: Representación de Volumen */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-4 rounded-2xl border border-emerald-500/20 shadow-sm flex flex-col justify-between min-h-[140px] theme-transition relative overflow-hidden">
          <div>
            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">% REPRESENTACIÓN</span>
            <div className="text-3xl font-black text-emerald-500 mt-2 mb-1">{kpis.pctTraslados}%</div>
          </div>
          <p className="text-[9px] text-secondary-custom font-semibold mt-auto leading-relaxed">
            de {kpis.totalPacientesPeriodo.toLocaleString()} admisiones globales
          </p>
        </div>

        {/* Tarjeta 3: Turno Récord (Rotativa & Benchmark del Mes) */}
        {(() => {
          const isSingleDay = localFechaInicio && localFechaFin && localFechaInicio === localFechaFin;
          const displayRecord = (isSingleDay && maxTrasladosMes.count > 0) ? maxTrasladosMes : maxTrasladosTurno;
          const isRecordSameDay = isSingleDay && maxTrasladosTurno.count === maxTrasladosMes.count && maxTrasladosMes.count > 0;

          return (
            <div 
              onClick={() => {
                if (!displayRecord.det) return;
                setSelectedDetailPatients(displayRecord.pacientes || []);
                setDetailModalTitle(
                  isSingleDay 
                    ? `Traslados - Récord Mensual de ${maxTrasladosMes.mesNombre}: ${displayRecord.det.textoCompleto} (${displayRecord.count} pac.)`
                    : `Traslados - Turno Récord: ${displayRecord.det.textoCompleto} (${displayRecord.count} pac.)`
                );
              }}
              className="bg-card-custom p-4 rounded-2xl border border-card-custom shadow-sm flex flex-col justify-between min-h-[140px] theme-transition relative overflow-hidden cursor-pointer hover:border-rose-500 hover:-translate-y-0.5 hover:shadow-lg group"
            >
              <ArrowUpRight className="absolute top-3 right-3 w-4 h-4 text-rose-500/40 group-hover:text-rose-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
              <div>
                <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 tracking-wider uppercase flex items-center gap-1">
                  {isSingleDay ? `RÉCORD ${maxTrasladosMes.mesNombre.toUpperCase()}` : 'TURNO RÉCORD'}
                  {isRecordSameDay && <span className="text-[8px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-black">Récord Hoy</span>}
                </span>
                <div className="text-3xl font-black text-rose-500 mt-2 mb-1">
                  {displayRecord.count} <span className="text-xs font-bold text-secondary-custom">pac.</span>
                </div>
                {displayRecord.det && (
                  <div className="text-xs font-black text-rose-600 dark:text-rose-400 mt-0.5 leading-none">
                    {displayRecord.det.equipo}
                  </div>
                )}
              </div>
              <p className="text-[9px] text-secondary-custom font-bold mt-auto leading-tight" title={displayRecord.det ? `${displayRecord.det.fechaTurno} - ${displayRecord.det.tipo}` : 'Sin registros'}>
                {isSingleDay ? (
                  <span>
                    Pico: {displayRecord.det ? displayRecord.det.fechaTurno : '-'} • <strong className="text-primary-custom">Turno actual: {maxTrasladosTurno.count} pac.</strong>
                  </span>
                ) : (
                  displayRecord.det ? `${displayRecord.det.fechaTurno} (${displayRecord.det.tipo})` : 'Sin registros'
                )}
              </p>
            </div>
          );
        })()}

        {/* Tarjeta 4: Promedio Diario */}
        <div className="bg-card-custom p-4 rounded-2xl border border-card-custom shadow-sm flex flex-col justify-between min-h-[140px] theme-transition relative overflow-hidden">
          <div>
            <span className="text-[9px] font-black text-secondary-custom tracking-wider uppercase opacity-85">PROMEDIO DIARIO</span>
            <div className="text-3xl font-black text-indigo-500 mt-2 mb-1">
              {promedioDiarioTraslados}
            </div>
          </div>
          <p className="text-[9px] text-secondary-custom font-semibold mt-auto leading-relaxed">
            pacientes derivados por día
          </p>
        </div>

        {/* Tarjeta 5: Principal Centro Destino */}
        <div 
          onClick={() => {
            if (topDestino.name === '-') return;
            const filtered = pacientesTraslados.filter(p => {
              const dest = p.destinoAlta || p.destino || 'Sin Especificar';
              return dest === topDestino.name;
            });
            setSelectedDetailPatients(filtered);
            setDetailModalTitle(`Traslados - Destino: ${topDestino.name} (${filtered.length} pac.)`);
          }}
          className="bg-card-custom p-4 rounded-2xl border border-card-custom shadow-sm flex flex-col justify-between min-h-[140px] theme-transition relative overflow-hidden cursor-pointer hover:border-indigo-500 hover:-translate-y-0.5 hover:shadow-lg group"
        >
          <ArrowUpRight className="absolute top-3 right-3 w-4 h-4 text-emerald-500/40 group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
          <div>
            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">CENTRO DESTINO TOP</span>
            <div className="text-3xl font-black text-emerald-500 mt-2 mb-1">
              {topDestino.count > 0 ? `${topDestino.count}` : '0'} <span className="text-xs font-bold text-secondary-custom">pac.</span>
            </div>
          </div>
          <p className="text-[9px] text-secondary-custom font-bold mt-auto leading-snug line-clamp-2" title={topDestino.name}>
            {topDestino.name !== '-' ? `al ${topDestino.name} (${topDestino.pct}%)` : 'Sin registros'}
          </p>
        </div>

        {/* Tarjeta 6: Línea de Base Histórica (Año Anterior YoY) */}
        <div 
          onClick={() => {
            const filtered = pacientesPrevYear.filter(isTraslado);
            setSelectedDetailPatients(filtered);
            setDetailModalTitle(`Traslados Históricos Mismo Período ${prevYearStart ? prevYearStart.substring(0, 4) : 'Anterior'} (${filtered.length} pac.)`);
          }}
          className="bg-card-custom p-4 rounded-2xl border border-card-custom shadow-sm flex flex-col justify-between min-h-[140px] theme-transition relative overflow-hidden cursor-pointer hover:border-indigo-500 hover:-translate-y-0.5 hover:shadow-lg group"
        >
          <ArrowUpRight className="absolute top-3 right-3 w-4 h-4 text-secondary-custom/40 group-hover:text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
          <div>
            <span className="text-[9px] font-black text-secondary-custom tracking-wider uppercase opacity-85">
              {prevYearStart ? `AÑO ${prevYearStart.substring(0, 4)} (YoY)` : 'PERÍODO ANTERIOR'}
            </span>
            <div className="text-3xl font-black text-primary-custom mt-2 mb-1">
              {prevYearStart ? trasladosPrevYear : '-'}
            </div>
          </div>
          <p className="text-[9px] text-secondary-custom font-semibold mt-auto leading-tight truncate" title={prevYearStart ? `Entre ${prevYearStart.split('-').reverse().join('/')} y ${prevYearEnd.split('-').reverse().join('/')}` : 'Sin rango'}>
            {prevYearStart ? `${prevYearStart.split('-').reverse().join('/')} al ${prevYearEnd.split('-').reverse().join('/')}` : 'Sin rango seleccionado'}
          </p>
        </div>
      </div>

      {/* SECCIÓN INTERACTIVA: TOP 10 DÍAS Y TURNOS CON MAYOR CANTIDAD DE TRASLADOS */}
      <div className="bg-card-custom p-6 rounded-2xl border border-card-custom shadow-sm theme-transition">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-5 border-b border-card-custom/30 pb-3">
          <div>
            <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Top 10 Días y Turnos con Mayor Cantidad de Traslados
            </h3>
            <p className="text-[10px] text-secondary-custom font-medium mt-1">
              Haz clic sobre cualquier turno para abrir el desglose completo de pacientes derivados en esa franja horaria.
            </p>
          </div>
          <span className="text-[9px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-md uppercase tracking-wider shrink-0">
            Ranking del Período
          </span>
        </div>

        {top10TurnosTraslados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {top10TurnosTraslados.map((item, idx) => {
              const isFirst = idx === 0;
              const isTop3 = idx < 3;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedDetailPatients(item.pacientes);
                    setDetailModalTitle(`Traslados - ${item.det.textoCompleto} (${item.count} pac.)`);
                  }}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                    isFirst
                      ? 'bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/40 hover:border-amber-500 shadow-md hover:shadow-amber-500/10 hover:-translate-y-0.5'
                      : isTop3
                      ? 'bg-gradient-to-br from-indigo-500/10 via-card-custom to-card-custom border-indigo-500/30 hover:border-indigo-500 shadow-sm hover:-translate-y-0.5'
                      : 'bg-card-custom border-card-custom hover:border-indigo-500/60 hover:bg-black/5 dark:hover:bg-white/5 hover:-translate-y-0.5'
                  }`}
                >
                  <ArrowUpRight className="absolute top-2.5 right-2.5 w-4 h-4 text-secondary-custom/30 group-hover:text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                  
                  <div className="flex items-center justify-between gap-2 mb-2 pr-4">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      isFirst ? 'bg-amber-500 text-black font-black' : isTop3 ? 'bg-indigo-550 text-white font-bold' : 'bg-black/10 dark:bg-white/10 text-secondary-custom font-bold'
                    }`}>
                      #{idx + 1}
                    </span>
                    <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md whitespace-nowrap">
                      {item.count} pac.
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-black text-primary-custom truncate" title={item.det?.fechaTurno || item.key}>
                      {item.det?.fechaTurno || item.key}
                    </div>
                    <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 truncate" title={item.det?.tipo ? `Turno ${item.det.turnoNum} (${item.det.tipo})` : 'Turno Registrado'}>
                      {item.det?.tipo ? `Turno ${item.det.turnoNum} (${item.det.tipo})` : 'Turno Registrado'}
                    </div>
                  </div>

                  <div className="text-[9px] text-secondary-custom font-semibold mt-3 pt-2 border-t border-card-custom/20 truncate">
                    🕒 {item.det?.horario || 'Horario Registrado'}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-secondary-custom text-center py-6">No se encontraron registros de traslados en el período seleccionado.</p>
        )}
      </div>

      {/* SECCIÓN 2: DIAGNÓSTICOS Y SEXO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Diagnósticos */}
        <div className="bg-card-custom p-6 rounded-2xl border border-card-custom shadow-sm flex flex-col justify-between theme-transition">
          <div>
            <div className="flex justify-between items-center mb-5 border-b border-card-custom/30 pb-3">
              <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                Top 5 Diagnósticos de Traslado
              </h3>
              <Info className="w-4 h-4 text-secondary-custom cursor-help" title="Frecuencia diagnóstica de pacientes derivados a otros centros." />
            </div>

            {topDiagnosticos.length > 0 ? (
              <div className="space-y-4">
                {topDiagnosticos.map((diag, index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-primary-custom flex items-center gap-1.5 truncate pr-4">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-bold text-[9px]">{diag.code}</span>
                        <span className="truncate" title={diag.name}>{diag.name}</span>
                      </span>
                      <span className="text-primary-custom text-sm font-black whitespace-nowrap text-right flex flex-col justify-center items-end leading-tight">
                        <span>{diag.count} pac.</span> 
                        <span className="text-[11px] text-indigo-650 dark:text-indigo-400 font-black block mt-0.5">{diag.percentage}% de traslados</span>
                        <span className="text-[10px] text-emerald-650 dark:text-emerald-450 font-bold block mt-0.5">{diag.percentageGlobal}% de admisiones</span>
                      </span>
                    </div>
                    <div className="w-full bg-input-custom rounded-full h-2 overflow-hidden border border-card-custom/40">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${diag.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-secondary-custom text-center py-8">No hay registros de diagnóstico para los traslados.</p>
            )}
          </div>
        </div>

        {/* Distribución por Sexo */}
        <div className="bg-card-custom p-6 rounded-2xl border border-card-custom shadow-sm flex flex-col justify-between theme-transition">
          <div>
            <div className="flex justify-between items-center mb-5 border-b border-card-custom/30 pb-3">
              <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-500" />
                Distribución por Sexo de los Traslados
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
              {sexoData.length > 0 ? (
                <>
                  <div className="w-52 h-52 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sexoData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {sexoData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0f172a', 
                            borderColor: '#334155', 
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                            padding: '8px 12px'
                          }}
                          itemStyle={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '13px' }}
                          formatter={(value, name) => [`${value} pacientes`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4 w-full sm:w-auto">
                    {sexoData.map((item, index) => {
                      const pct = kpis.totalTraslados > 0 ? ((item.value / kpis.totalTraslados) * 100).toFixed(1) : '0';
                      return (
                        <div key={index} className="flex items-center justify-between gap-10 text-sm font-bold border-b border-card-custom/20 pb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-primary-custom text-sm">{item.name}</span>
                          </div>
                          <span className="text-secondary-custom text-sm font-extrabold">{item.value.toLocaleString()} pac. ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-xs text-secondary-custom text-center py-8">No hay registros de sexo disponibles.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN NUEVA: EVOLUCIÓN TEMPORAL Y COMPARACIÓN */}
      <div className="bg-card-custom p-6 rounded-2xl border border-card-custom shadow-sm theme-transition">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-5 border-b border-card-custom/30 pb-3">
          <div>
            <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              {localModoComparativo ? 'Comparación Temporal Diaria (Período A vs Período B)' : 'Evolución Temporal Diaria de Traslados'}
            </h3>
            <p className="text-[10px] text-secondary-custom font-medium mt-1">
              {localModoComparativo 
                ? 'Curvas superpuestas por índice de día relativo del rango seleccionado.' 
                : 'Historial diario de derivaciones hospitalarias del período actual.'}
            </p>
          </div>
          {localModoComparativo && (
            <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-wide">
              <GitCompare className="w-3.5 h-3.5" /> Modo Comparación Activo
            </span>
          )}
        </div>

        {/* CONTROLES DE FILTRO DE FECHA LOCALES CON ESTÉTICA DE BARRA SUPERIOR */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3 w-full">
            {/* Rango Principal A */}
            <div className="flex items-center bg-card-custom border border-card-custom rounded-xl p-2.5 shadow-sm gap-2 theme-transition">
              <Calendar className="w-4 h-4 text-indigo-500 mx-1" />
              <span className="text-[10px] font-black text-secondary-custom uppercase mr-1">Rango A:</span>
              <input 
                type="date" 
                value={localFechaInicio} 
                onChange={(e) => setLocalFechaInicio(e.target.value)}
                className="text-xs font-semibold text-primary-custom outline-none bg-transparent cursor-pointer border-none p-0 focus:ring-0"
              />
              <span className="text-secondary-custom mx-1">-</span>
              <input 
                type="date" 
                value={localFechaFin} 
                onChange={(e) => setLocalFechaFin(e.target.value)}
                className="text-xs font-semibold text-primary-custom outline-none bg-transparent cursor-pointer border-none p-0 focus:ring-0"
              />
            </div>

            {/* Botón de Comparación */}
            <button
              onClick={() => setLocalModoComparativo(!localModoComparativo)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                localModoComparativo 
                  ? 'bg-indigo-550 text-white border-indigo-550 shadow-md' 
                  : 'bg-card-custom text-secondary-custom border-card-custom hover:bg-black/5 dark:hover:bg-white/5 hover:scale-102 active:scale-98'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              Comparar Período
            </button>

            {/* Rango Comparativo B */}
            {localModoComparativo && (
              <div className="flex items-center bg-card-custom border border-card-custom rounded-xl p-2.5 shadow-sm gap-2 theme-transition animate-fade-in">
                <Calendar className="w-4 h-4 text-rose-500 mx-1" />
                <span className="text-[10px] font-black text-secondary-custom uppercase mr-1">Rango B:</span>
                <input 
                  type="date" 
                  value={localFechaInicioB} 
                  onChange={(e) => setLocalFechaInicioB(e.target.value)}
                  className="text-xs font-semibold text-primary-custom outline-none bg-transparent cursor-pointer border-none p-0 focus:ring-0"
                />
                <span className="text-secondary-custom mx-1">-</span>
                <input 
                  type="date" 
                  value={localFechaFinB} 
                  onChange={(e) => setLocalFechaFinB(e.target.value)}
                  className="text-xs font-semibold text-primary-custom outline-none bg-transparent cursor-pointer border-none p-0 focus:ring-0"
                />
              </div>
            )}
          </div>
        </div>

        <div className="h-64 w-full min-h-[16rem]">
          {localModoComparativo && compareDailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <ComposedChart data={compareDailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-card-custom)" />
                <XAxis dataKey="dayIndex" tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 'bold' }} stroke="var(--border-card-custom)" />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 'bold' }} stroke="var(--border-card-custom)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                    padding: '8px 12px'
                  }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '11px', marginBottom: '4px' }}
                  itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', marginTop: '10px' }} />
                <Area type="monotone" dataKey="Periodo A (Filtro)" fill="#3b82f6" fillOpacity={0.15} stroke="#3b82f6" strokeWidth={2.5} name="Periodo A (Filtro)" />
                <Line type="monotone" dataKey="Periodo B (Comparación)" stroke="#ec4899" strokeWidth={2.5} dot={false} name="Periodo B (Comparación)" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={dailyDataA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTraslados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-card-custom)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 'bold' }} stroke="var(--border-card-custom)" />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 'bold' }} stroke="var(--border-card-custom)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                    padding: '8px 12px'
                  }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '11px', marginBottom: '4px' }}
                  itemStyle={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '13px' }}
                  formatter={(value) => [`${value} Traslados`, 'Cantidad']}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTraslados)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* SECCIÓN 3: GRUPOS ETARIOS */}
      <div className="bg-card-custom p-6 rounded-2xl border border-card-custom shadow-sm theme-transition">
        <div className="flex justify-between items-center mb-5 border-b border-card-custom/30 pb-3">
          <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            Distribución por Grupo Etario (Rangos de 5 años)
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 w-full min-h-[16rem]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={edadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-card-custom)" />
                <XAxis dataKey="range" tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 'bold' }} stroke="var(--border-card-custom)" />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 'bold' }} stroke="var(--border-card-custom)" />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                    padding: '8px 12px'
                  }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '11px', marginBottom: '4px' }}
                  itemStyle={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '13px' }}
                  formatter={(value) => [`${value} Pacientes`, 'Trasladados']}
                />
                <Bar dataKey="Cantidad" fill="#6366f1" radius={[4, 4, 0, 0]}>
                  {edadData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#6366f1" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-card-custom flex flex-col justify-center gap-4">
            <div>
              <h4 className="text-[11px] font-black text-secondary-custom uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-500" />
                Mayor Concentración de Derivaciones
              </h4>
              <p className="text-[10px] text-secondary-custom opacity-80 leading-relaxed font-semibold">
                Rangos de edad con mayor representatividad sobre el total de derivaciones del periodo.
              </p>
            </div>

            <div className="space-y-3.5">
              {topRangosEtarios.length > 0 ? (
                topRangosEtarios.map((item, index) => {
                  const pct = kpis.totalTraslados > 0 ? ((item.Cantidad / kpis.totalTraslados) * 100).toFixed(1) : '0.0';
                  return (
                    <div key={item.range} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-primary-custom">
                        <span className="flex items-center gap-2">
                          <span className="w-4.5 h-4.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-black">{index + 1}</span>
                          Rango {item.range} años
                        </span>
                        <span>{item.Cantidad} pac. <span className="text-[10px] font-bold text-secondary-custom ml-0.5">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-secondary-custom font-semibold">Sin registros de traslados.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: NACIONALIDADES Y COMUNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nacionalidades */}
        <div className="bg-card-custom p-6 rounded-2xl border border-card-custom shadow-sm flex flex-col justify-between theme-transition">
          <div>
            <div className="flex justify-between items-center mb-5 border-b border-card-custom/30 pb-3">
              <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-sky-500" />
                Distribución por Nacionalidades
              </h3>
            </div>

            <div className="max-h-52 overflow-y-auto pr-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-black/5 dark:bg-white/5 text-[10px] font-bold text-secondary-custom uppercase border-b border-card-custom">
                    <th className="p-2">Nacionalidad</th>
                    <th className="p-2 text-center">Cantidad</th>
                    <th className="p-2 text-right">Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  {nacionalidadesData.length > 0 ? (
                    nacionalidadesData.slice(0, 10).map((nac, idx) => (
                      <tr key={idx} className="border-b border-card-custom/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium text-secondary-custom">
                        <td className="p-2 font-bold text-primary-custom">{nac.name}</td>
                        <td className="p-2 text-center font-bold">{nac.count}</td>
                        <td className="p-2 text-right font-black text-sky-500">{nac.percentage}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="p-4 text-center text-secondary-custom">No hay datos de nacionalidad.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Comunas principales */}
        <div className="bg-card-custom p-6 rounded-2xl border border-card-custom shadow-sm flex flex-col justify-between theme-transition">
          <div>
            <div className="flex justify-between items-center mb-5 border-b border-card-custom/30 pb-3">
              <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                Comunas de Origen Principales
              </h3>
            </div>

            <div className="space-y-4">
              {comunasData.length > 0 ? (
                comunasData.map((com, index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-primary-custom font-bold">{com.name}</span>
                      <span className="text-secondary-custom font-bold">{com.count} pac. ({com.percentage}%)</span>
                    </div>
                    <div className="w-full bg-input-custom rounded-full h-2 overflow-hidden border border-card-custom/40">
                      <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${com.percentage}%` }}></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-secondary-custom text-center py-8">No hay datos de comuna de origen.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE DETALLE DE PACIENTES TRASLADADOS */}
      {selectedDetailPatients && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-card-custom border border-card-custom rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[85vh] overflow-hidden theme-transition animate-fade-in relative">
            {/* Header */}
            <div className="p-5 border-b border-card-custom flex justify-between items-center bg-black/5 dark:bg-white/5">
              <div>
                <h3 className="text-sm font-black text-primary-custom uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  {detailModalTitle}
                </h3>
                <p className="text-[11px] text-secondary-custom font-semibold mt-0.5">
                  Se muestran todos los registros clínicos de derivación hospitalaria correspondientes a la selección.
                </p>
              </div>
              <button 
                onClick={() => setSelectedDetailPatients(null)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-secondary-custom rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Table Content */}
            <div className="overflow-y-auto p-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-black/5 dark:bg-white/5 text-[10px] font-bold text-secondary-custom uppercase border-b border-card-custom">
                    <th className="p-3">Fecha y Hora</th>
                    <th className="p-3 text-center">Turno Asociado</th>
                    <th className="p-3 text-center">ID / Correlativo</th>
                    <th className="p-3">Destino de Alta</th>
                    <th className="p-3">Diagnóstico Médico</th>
                    <th className="p-3 text-center">Código CIE</th>
                    <th className="p-3">Profesional / Categorizador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-custom text-xs">
                  {selectedDetailPatients.length > 0 ? (
                    selectedDetailPatients.map((p, idx) => {
                      const d = p.tAdmision ? new Date(p.tAdmision) : null;
                      const dateStr = d ? d.toLocaleDateString('es-CL') : '-';
                      const timeStr = d ? d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '-';
                      const turnoInfo = obtenerTurnoDetallado(p.tAdmision);

                      return (
                        <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium text-secondary-custom">
                          <td className="p-3 font-semibold text-primary-custom whitespace-nowrap">{dateStr} {timeStr}</td>
                          <td className="p-3 text-center font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">{turnoInfo.textoCompleto}</td>
                          <td className="p-3 text-center font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {p.correlativo || p.idPaciente || '-'}
                          </td>
                          <td className="p-3 font-bold text-indigo-500 whitespace-nowrap">{p.destinoAlta || p.destino || '-'}</td>
                          <td className="p-3 font-bold text-slate-700 dark:text-slate-300 max-w-xs truncate" title={p.diagnosticoPrincipal}>
                            {p.diagnosticoPrincipal || '-'}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-500 whitespace-nowrap">{p.codigoDiagnostico || '-'}</td>
                          <td className="p-3 font-semibold text-primary-custom whitespace-nowrap">{p.enf1 && p.enf1 !== 'No Registrado' ? p.enf1 : p.medico || '-'}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-secondary-custom text-xs font-semibold">
                        No se registraron atenciones coincidentes en la selección del periodo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
