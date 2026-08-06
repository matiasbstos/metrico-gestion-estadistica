import React, { useState, useMemo } from 'react';
import { Activity, Clock, Stethoscope, Hospital, Users, Search, Download, Filter, AlertCircle, Award, Calendar, ChevronRight, ChevronDown, ChevronUp, ArrowRightLeft, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import InfoTooltip from '../InfoTooltip';
import { generateFracturasSummary } from '../../utils/summaryGenerator';

const perc = (val, tot) => tot > 0 ? ((val / tot) * 100).toFixed(1) : '0.0';

const AGE_RANGES = ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'];

const parseDestinoCat = (p) => {
  const destRaw = String(p.destinoAlta || p.destino || p.destino_alta || '').trim();
  if (!destRaw) return 'sin_registro';
  
  const norm = destRaw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (norm.includes('hospital') || norm.includes('emergencia') || norm.includes('derivac') || norm.includes('traslado') || norm.includes('fusat') || norm.includes('urgencia')) {
    return 'hospital';
  }
  if (norm.includes('domicilio')) {
    return 'domicilio';
  }
  if (norm.includes('consultorio') || norm.includes('carabineros') || norm.includes('otro') || norm.includes('fallecido')) {
    return 'otro';
  }
  return 'otro';
};

export default function AnalisisFracturas({ pacientesFiltrados, pacientesDB, filtroFechaInicio, filtroFechaFin }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroDestino, setFiltroDestino] = useState('TODOS');
  const [filtroEdad, setFiltroEdad] = useState('TODOS');
  const [filtroSexo, setFiltroSexo] = useState('TODOS');
  const [modoVistaEdad, setModoVistaEdad] = useState('detallado'); // 'detallado' (17 tramos 5 años) | 'clinico' (4 tramos)
  const [mostrarDetalleTop5, setMostrarDetalleTop5] = useState(false);
  const [cardExpandedTop5, setCardExpandedTop5] = useState({});

  const prevYearStart = useMemo(() => {
    if (!filtroFechaInicio) return null;
    const p = filtroFechaInicio.split('-');
    if (p.length !== 3) return null;
    return `${parseInt(p[0]) - 1}-${p[1]}-${p[2]}`;
  }, [filtroFechaInicio]);

  const prevYearEnd = useMemo(() => {
    if (!filtroFechaFin) return null;
    const p = filtroFechaFin.split('-');
    if (p.length !== 3) return null;
    return `${parseInt(p[0]) - 1}-${p[1]}-${p[2]}`;
  }, [filtroFechaFin]);

  const pacientesPrevYear = useMemo(() => {
    if (!prevYearStart || !prevYearEnd || !pacientesDB) return [];
    const startMs = new Date(prevYearStart + 'T00:00:00').getTime();
    const endMs = new Date(prevYearEnd + 'T23:59:59').getTime();
    return pacientesDB.filter(p => p.tAdmision && p.tAdmision >= startMs && p.tAdmision <= endMs);
  }, [pacientesDB, prevYearStart, prevYearEnd]);

  const fracturasPrevYear = useMemo(() => {
    return pacientesPrevYear.filter(p => {
      const diag = (p.diagnosticoPrincipal || p.codigoDiagnostico || '').toLowerCase();
      return diag.includes('fractura') || diag.includes('fx');
    }).length;
  }, [pacientesPrevYear]);

  // Pipeline de filtrado para pacientes con Fractura
  const pacientesFractura = useMemo(() => {
    if (!pacientesFiltrados || pacientesFiltrados.length === 0) return [];
    
    return pacientesFiltrados.filter(p => {
      const diag = String(p.diagnosticoPrincipal || '').trim().toLowerCase();
      const cod = String(p.codigoDiagnostico || '').trim().toLowerCase();
      
      const matchesWord = diag.includes('fractura') || cod.includes('fractura');
      if (!matchesWord) return false;

      // Filtro de Destino
      const catDestino = parseDestinoCat(p);
      if (filtroDestino === 'HOSPITAL' && catDestino !== 'hospital') return false;
      if (filtroDestino === 'DOMICILIO' && catDestino !== 'domicilio') return false;
      if (filtroDestino === 'OTRO' && catDestino !== 'otro') return false;
      if (filtroDestino === 'SIN_REGISTRO' && catDestino !== 'sin_registro') return false;

      // Filtro de Sexo
      const s = String(p.sexo || '').toUpperCase();
      if (filtroSexo === 'F' && !(s.includes('MUJER') || s.includes('FEMENINO') || s === 'F')) return false;
      if (filtroSexo === 'M' && !(s.includes('HOMBRE') || s.includes('MASCULINO') || s === 'M')) return false;

      // Filtro de Edad
      if (filtroEdad !== 'TODOS') {
        if (p.edad === null || p.edad === undefined || p.edad === '' || isNaN(Number(p.edad))) return false;
        const edadNum = Number(p.edad);

        if (AGE_RANGES.includes(filtroEdad)) {
          if (filtroEdad === '80+' && !(edadNum >= 80)) return false;
          if (filtroEdad !== '80+') {
            const [min, max] = filtroEdad.split('-').map(Number);
            if (!(edadNum >= min && edadNum <= max)) return false;
          }
        } else {
          if (filtroEdad === '0-14' && !(edadNum >= 0 && edadNum <= 14)) return false;
          if (filtroEdad === '15-29' && !(edadNum >= 15 && edadNum <= 29)) return false;
          if (filtroEdad === '30-59' && !(edadNum >= 30 && edadNum <= 59)) return false;
          if (filtroEdad === '60+' && !(edadNum >= 60)) return false;
        }
      }

      // Filtro por Búsqueda
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase().trim();
        const dest = String(p.destinoAlta || p.destino || '').toLowerCase();
        const fullStr = `${diag} ${cod} ${dest}`.toLowerCase();
        if (!fullStr.includes(query)) return false;
      }

      return true;
    });
  }, [pacientesFiltrados, filtroDestino, filtroSexo, filtroEdad, searchTerm]);

  // Total acumulado general de pacientes con fractura en el periodo
  const totalFracturasPeriodo = useMemo(() => {
    if (!pacientesFiltrados) return 0;
    return pacientesFiltrados.filter(p => {
      const diag = String(p.diagnosticoPrincipal || '').trim().toLowerCase();
      const cod = String(p.codigoDiagnostico || '').trim().toLowerCase();
      return diag.includes('fractura') || cod.includes('fractura');
    }).length;
  }, [pacientesFiltrados]);

  // Métricas agregadas y estadísticas multidimensionales
  const stats = useMemo(() => {
    let total = pacientesFractura.length;
    let hospitalCount = 0, hospitalMujeres = 0, hospitalHombres = 0;
    let domicilioCount = 0, domicilioMujeres = 0, domicilioHombres = 0;
    let otroDestinoCount = 0, otroMujeres = 0, otroHombres = 0;
    let sinRegistroCount = 0, sinRegistroMujeres = 0, sinRegistroHombres = 0;
    let mujeresCount = 0;
    let hombresCount = 0;

    let sumAdmCatTotal = 0, countAdmCatTotal = 0;
    let sumCatAnaTotal = 0, countCatAnaTotal = 0;
    let sumAnaAltTotal = 0, countAnaAltTotal = 0;
    let sumAdmAltTotal = 0, countAdmAltTotal = 0;

    let p0_14 = 0;
    let p15_29 = 0;
    let p30_59 = 0;
    let p60_plus = 0;

    const porDiagnostico = {};
    const porRangoEtario = Object.fromEntries(AGE_RANGES.map(r => [r, { F: 0, M: 0, total: 0 }]));

    pacientesFractura.forEach(p => {
      const catDest = parseDestinoCat(p);

      const s = String(p.sexo || '').toUpperCase();
      let isF = s.includes('MUJER') || s.includes('FEMENINO') || s === 'F';
      let isM = s.includes('HOMBRE') || s.includes('MASCULINO') || s === 'M';

      if (catDest === 'hospital') {
        hospitalCount++;
        if (isF) hospitalMujeres++;
        if (isM) hospitalHombres++;
      } else if (catDest === 'domicilio') {
        domicilioCount++;
        if (isF) domicilioMujeres++;
        if (isM) domicilioHombres++;
      } else if (catDest === 'sin_registro') {
        sinRegistroCount++;
        if (isF) sinRegistroMujeres++;
        if (isM) sinRegistroHombres++;
      } else {
        otroDestinoCount++;
        if (isF) otroMujeres++;
        if (isM) otroHombres++;
      }
      
      if (isF) mujeresCount++;
      else if (isM) hombresCount++;

      // Determinar tiempo de categorización (promedio entre Cat1 y CatUlt si existen ambos)
      let tCat = null;
      if (typeof p.tCat1 === 'number' && typeof p.tCatUlt === 'number') {
        tCat = (p.tCat1 + p.tCatUlt) / 2;
      } else if (typeof p.tCat1 === 'number') {
        tCat = p.tCat1;
      } else if (typeof p.tCatUlt === 'number') {
        tCat = p.tCatUlt;
      }

      // 1. Admisión -> Categorización (en Horas)
      let dAdmCat = null;
      if (typeof p.tAdmision === 'number' && typeof tCat === 'number' && tCat >= p.tAdmision) {
        dAdmCat = (tCat - p.tAdmision) / 3600000;
        sumAdmCatTotal += dAdmCat;
        countAdmCatTotal++;
      }

      // 2. Categorización -> Anamnesis (en Horas)
      let dCatAna = null;
      if (typeof tCat === 'number' && typeof p.tAnamnesis === 'number' && p.tAnamnesis >= tCat) {
        dCatAna = (p.tAnamnesis - tCat) / 3600000;
        sumCatAnaTotal += dCatAna;
        countCatAnaTotal++;
      }

      // 3. Anamnesis -> Trasladado / Alta (en Horas)
      let dAnaAlt = null;
      if (typeof p.tAnamnesis === 'number' && typeof p.tAlta === 'number' && p.tAlta >= p.tAnamnesis) {
        dAnaAlt = (p.tAlta - p.tAnamnesis) / 3600000;
        sumAnaAltTotal += dAnaAlt;
        countAnaAltTotal++;
      }

      // 4. Estadía Total: Admisión -> Trasladado / Alta (en Horas)
      let dAdmAlt = null;
      if (typeof p.tAdmision === 'number' && typeof p.tAlta === 'number' && p.tAlta >= p.tAdmision) {
        dAdmAlt = (p.tAlta - p.tAdmision) / 3600000;
        sumAdmAltTotal += dAdmAlt;
        countAdmAltTotal++;
      }

      if (p.edad !== null && p.edad !== undefined && p.edad !== '' && !isNaN(Number(p.edad))) {
        const edadNum = Number(p.edad);
        if (edadNum >= 0 && edadNum <= 14) p0_14++;
        else if (edadNum >= 15 && edadNum <= 29) p15_29++;
        else if (edadNum >= 30 && edadNum <= 59) p30_59++;
        else if (edadNum >= 60) p60_plus++;

        let range = '';
        if (edadNum >= 80) range = '80+';
        else {
          const lower = Math.floor(edadNum / 5) * 5;
          range = `${lower}-${lower + 4}`;
        }
        if (porRangoEtario[range]) {
          porRangoEtario[range].total++;
          if (isF) porRangoEtario[range].F++;
          if (isM) porRangoEtario[range].M++;
        }
      }

      // Agrupamiento por Diagnóstico y Código
      const diagClean = String(p.diagnosticoPrincipal || 'Fractura No Especificada').trim();
      const codClean = String(p.codigoDiagnostico || 'S/C').trim();
      const key = `${codClean}||${diagClean}`;

      if (!porDiagnostico[key]) {
        porDiagnostico[key] = {
          codigo: codClean,
          diagnostico: diagClean,
          total: 0,
          hospital: 0,
          domicilio: 0,
          otroDestino: 0,
          sinRegistro: 0,
          sumAdmCat: 0, countAdmCat: 0,
          sumCatAna: 0, countCatAna: 0,
          sumAnaAlt: 0, countAnaAlt: 0,
          sumAdmAlt: 0, countAdmAlt: 0,
          p0_14: 0,
          p15_29: 0,
          p30_59: 0,
          p60_plus: 0,
          mujeres: 0,
          hombres: 0,
          rangoCounts: Object.fromEntries(AGE_RANGES.map(r => [r, 0]))
        };
      }

      const item = porDiagnostico[key];
      item.total++;
      if (catDest === 'hospital') item.hospital++;
      else if (catDest === 'domicilio') item.domicilio++;
      else if (catDest === 'sin_registro') item.sinRegistro++;
      else item.otroDestino++;

      if (dAdmCat !== null) { item.sumAdmCat += dAdmCat; item.countAdmCat++; }
      if (dCatAna !== null) { item.sumCatAna += dCatAna; item.countCatAna++; }
      if (dAnaAlt !== null) { item.sumAnaAlt += dAnaAlt; item.countAnaAlt++; }
      if (dAdmAlt !== null) { item.sumAdmAlt += dAdmAlt; item.countAdmAlt++; }

      if (isF) item.mujeres++;
      if (isM) item.hombres++;

      if (p.edad !== null && p.edad !== undefined && p.edad !== '' && !isNaN(Number(p.edad))) {
        const edadNum = Number(p.edad);
        if (edadNum >= 0 && edadNum <= 14) item.p0_14++;
        else if (edadNum >= 15 && edadNum <= 29) item.p15_29++;
        else if (edadNum >= 30 && edadNum <= 59) item.p30_59++;
        else if (edadNum >= 60) item.p60_plus++;

        let r5 = edadNum >= 80 ? '80+' : `${Math.floor(edadNum / 5) * 5}-${Math.floor(edadNum / 5) * 5 + 4}`;
        if (item.rangoCounts[r5] !== undefined) item.rangoCounts[r5]++;
      }
    });

    const listaDiagnosticos = Object.values(porDiagnostico).map(item => {
      return {
        ...item,
        avgAdmCat: item.countAdmCat > 0 ? (item.sumAdmCat / item.countAdmCat) : null,
        avgCatAna: item.countCatAna > 0 ? (item.sumCatAna / item.countCatAna) : null,
        avgAnaAlt: item.countAnaAlt > 0 ? (item.sumAnaAlt / item.countAnaAlt) : null,
        avgAdmAlt: item.countAdmAlt > 0 ? (item.sumAdmAlt / item.countAdmAlt) : null,
        percMujeres: perc(item.mujeres, item.total),
        percHombres: perc(item.hombres, item.total)
      };
    }).sort((a, b) => b.total - a.total);

    // KPI 1: Diagnóstico más frecuente
    const diagMasFrecuente = listaDiagnosticos.length > 0 ? listaDiagnosticos[0] : null;

    // KPI 2: Grupo Etario de 5 años más afectado
    let rangoMasFrecuente = { rango: 'N/A', total: 0 };
    Object.entries(porRangoEtario).forEach(([rango, data]) => {
      if (data.total > rangoMasFrecuente.total) {
        rangoMasFrecuente = { rango, total: data.total };
      }
    });

    // KPI 3: Grupo clínico más afectado
    const gruposClinicos = [
      { name: 'Pediatría (0-14)', val: p0_14 },
      { name: 'Jóvenes (15-29)', val: p15_29 },
      { name: 'Adultos (30-59)', val: p30_59 },
      { name: 'A. Mayor (60+)', val: p60_plus }
    ].sort((a, b) => b.val - a.val);
    const grupoClinicoMasAfectado = gruposClinicos[0];

    const avgAdmCatGlobal = countAdmCatTotal > 0 ? (sumAdmCatTotal / countAdmCatTotal) : null;
    const avgCatAnaGlobal = countCatAnaTotal > 0 ? (sumCatAnaTotal / countCatAnaTotal) : null;
    const avgAnaAltGlobal = countAnaAltTotal > 0 ? (sumAnaAltTotal / countAnaAltTotal) : null;
    const avgAdmAltGlobal = countAdmAltTotal > 0 ? (sumAdmAltTotal / countAdmAltTotal) : null;

    const totalEvaluados = pacientesFiltrados ? pacientesFiltrados.length : 0;

    return {
      total,
      totalEvaluados,
      percFracturasDelUniverso: perc(total, totalEvaluados),
      
      hospitalCount,
      hospitalMujeres,
      hospitalHombres,
      percHospital: perc(hospitalCount, total),
      percHospitalMujeres: perc(hospitalMujeres, hospitalCount),
      percHospitalHombres: perc(hospitalHombres, hospitalCount),

      domicilioCount,
      domicilioMujeres,
      domicilioHombres,
      percDomicilio: perc(domicilioCount, total),
      percDomicilioMujeres: perc(domicilioMujeres, domicilioCount),
      percDomicilioHombres: perc(domicilioHombres, domicilioCount),

      otroDestinoCount,
      otroMujeres,
      otroHombres,
      percOtroDestino: perc(otroDestinoCount, total),

      sinRegistroCount,
      sinRegistroMujeres,
      sinRegistroHombres,
      percSinRegistro: perc(sinRegistroCount, total),

      mujeresCount,
      hombresCount,
      percMujeresGlobal: perc(mujeresCount, total),
      percHombresGlobal: perc(hombresCount, total),
      
      avgAdmCatGlobal, countAdmCatTotal,
      avgCatAnaGlobal, countCatAnaTotal,
      avgAnaAltGlobal, countAnaAltTotal,
      avgAdmAltGlobal, countAdmAltTotal,

      top5Diagnosticos: listaDiagnosticos.slice(0, 5),

      p0_14,
      p15_29,
      p30_59,
      p60_plus,
      listaDiagnosticos,
      porRangoEtario,
      diagMasFrecuente,
      rangoMasFrecuente,
      grupoClinicoMasAfectado
    };
  }, [pacientesFractura, pacientesFiltrados]);

  const yoyGrowth = useMemo(() => {
    if (!fracturasPrevYear || fracturasPrevYear === 0) return null;
    return ((stats.total - fracturasPrevYear) / fracturasPrevYear) * 100;
  }, [stats.total, fracturasPrevYear]);

  // Datos para gráfico de barras por Edad y Sexo
  const dataGraficoEdad = useMemo(() => {
    return AGE_RANGES.map(range => ({
      rango: range,
      Mujeres: stats.porRangoEtario[range]?.F || 0,
      Hombres: stats.porRangoEtario[range]?.M || 0,
      Total: stats.porRangoEtario[range]?.total || 0
    }));
  }, [stats.porRangoEtario]);

  // Datos para gráfico de Torta (Destino de Alta)
  const dataGraficoDestino = useMemo(() => {
    return [
      { name: 'Hospital / Emergencia / Derivación', value: stats.hospitalCount, color: '#f43f5e' },
      { name: 'Alta Domicilio', value: stats.domicilioCount, color: '#10b981' },
      { name: 'Otros Destinos (Consultorio, etc.)', value: stats.otroDestinoCount, color: '#0ea5e9' },
      { name: 'Sin Registro de Destino', value: stats.sinRegistroCount, color: '#94a3b8' }
    ].filter(d => d.value > 0);
  }, [stats.hospitalCount, stats.domicilioCount, stats.otroDestinoCount, stats.sinRegistroCount]);

  // Exportar a CSV
  const handleExportCSV = () => {
    if (stats.listaDiagnosticos.length === 0) return;

    const ageHeaders = AGE_RANGES.map(r => `Edad_${r.replace('-', '_').replace('+', 'plus')}_Anos`);
    const headers = [
      "Codigo_CIE",
      "Diagnostico_Principal",
      "Total_Casos",
      "Demora_Admision_Categorizacion_Horas",
      "Demora_Categorizacion_Anamnesis_Horas",
      "Demora_Anamnesis_Traslado_Horas",
      "Estadia_Total_Horas",
      "Hospital_Emergencia",
      "Alta_Domicilio",
      "Otro_Destino",
      "Sin_Registro",
      ...ageHeaders,
      "Mujeres_Casos",
      "Mujeres_Porcentaje",
      "Hombres_Casos",
      "Hombres_Porcentaje"
    ];
    const rows = stats.listaDiagnosticos.map(d => [
      `"${d.codigo}"`,
      `"${d.diagnostico.replace(/"/g, '""')}"`,
      d.total,
      d.avgAdmCat !== null ? d.avgAdmCat.toFixed(1) : 'N/A',
      d.avgCatAna !== null ? d.avgCatAna.toFixed(1) : 'N/A',
      d.avgAnaAlt !== null ? d.avgAnaAlt.toFixed(1) : 'N/A',
      d.avgAdmAlt !== null ? d.avgAdmAlt.toFixed(1) : 'N/A',
      d.hospital,
      d.domicilio,
      d.otroDestino,
      d.sinRegistro,
      ...AGE_RANGES.map(r => d.rangoCounts[r] || 0),
      d.mujeres,
      `"${d.percMujeres}%"`,
      d.hombres,
      `"${d.percHombres}%"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_Estadisticas_Fractura_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summaryText = useMemo(() => generateFracturasSummary(pacientesFiltrados), [pacientesFiltrados]);

  return (
    <div className="bg-card-custom rounded-2xl border border-card-custom p-6 mt-6 shadow-sm theme-transition">
      
      {/* CABECERA DE LA SECCIÓN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 pb-4 border-b border-card-custom/60">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 shadow-sm">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-primary-custom">
                Estadísticas de Diagnóstico: Fracturas y Destino de Alta
              </h2>
              <InfoTooltip 
                title="Análisis de Diagnóstico de Fracturas" 
                text="Agrupa todos los registros de urgencia con diagnóstico de Fractura, cruzando su código CIE-10, derivaciones hospitalarias, perfil de tramos etarios completos y género." 
              />
            </div>
            <p className="text-xs text-secondary-custom font-medium mt-0.5">
              Cruce epidemiológico por código CIE, derivación hospitalaria, grupos etarios y género.
            </p>
          </div>
        </div>

        {/* BOTÓN DE EXPORTACIÓN */}
        <button
          onClick={handleExportCSV}
          disabled={stats.listaDiagnosticos.length === 0}
          className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Exportar Datos (CSV)
        </button>
      </div>

      {/* Narrative Summary Box */}
      <div className="bg-card-custom p-5 rounded-2xl border border-card-custom shadow-sm mb-6 flex flex-col theme-transition">
        <h4 className="text-[10px] font-black tracking-wider uppercase text-secondary-custom mb-2.5 flex items-center gap-1.5 border-b border-card-custom/20 pb-2">
          <Info className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          Análisis Epidemiológico y Clínico de Lesiones Óseas
        </h4>
        <p className="text-xs text-primary-custom leading-relaxed font-semibold">
          {summaryText}
        </p>
      </div>

      {/* TARJETAS DE KPIS PRINCIPALES DE FRACTURAS (7 LÁMINAS SUPERIORES COMPLETAS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        
        {/* KPI 1: UNIVERSO EVALUADO Y CASOS FRACTURA */}
        <div className="bg-gradient-to-br from-rose-500/10 via-card-custom to-card-custom p-4 rounded-2xl border border-rose-500/20 relative overflow-hidden group shadow-sm flex flex-col justify-between min-h-[135px]">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-500">Universo & Fracturas</span>
              <Stethoscope className="w-4 h-4 text-rose-500 opacity-80" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-primary-custom">{stats.total}</span>
              <span className="text-xs font-bold text-rose-500">({stats.percFracturasDelUniverso}%)</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-card-custom/50 text-[10px] text-secondary-custom flex justify-between items-center font-medium">
            <span>Universo Evaluado:</span>
            <span className="font-black text-primary-custom">{stats.totalEvaluados} pac.</span>
          </div>
        </div>

        {/* KPI 2: TRASLADOS A HOSPITAL / UEH */}
        <div className="bg-gradient-to-br from-purple-500/10 via-card-custom to-card-custom p-4 rounded-2xl border border-purple-500/20 relative overflow-hidden group shadow-sm flex flex-col justify-between min-h-[135px]">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-500">Traslados Hospital</span>
              <Hospital className="w-4 h-4 text-purple-500 opacity-80" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-purple-600 dark:text-purple-400">{stats.hospitalCount}</span>
              <span className="text-xs font-bold text-purple-500">({stats.percHospital}%)</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-card-custom/50 text-[10px] text-secondary-custom font-medium truncate">
            Derivados a urgencia secundaria
          </div>
        </div>

        {/* KPI 3: ALTAS A DOMICILIO Y OTROS */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-card-custom to-card-custom p-4 rounded-2xl border border-emerald-500/20 relative overflow-hidden group shadow-sm flex flex-col justify-between min-h-[135px]">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-500">Altas Domicilio</span>
              <Award className="w-4 h-4 text-emerald-500 opacity-80" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.domicilioCount}</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">({stats.percDomicilio}%)</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-card-custom/50 text-[10px] text-secondary-custom font-medium truncate">
            Resolución ambulatoria SAPU/SAR
          </div>
        </div>

        {/* KPI 4: FRACTURA MÁS FRECUENTE (RESTAURADA) */}
        <div className="bg-gradient-to-br from-amber-500/10 via-card-custom to-card-custom p-4 rounded-2xl border border-amber-500/20 relative overflow-hidden group shadow-sm flex flex-col justify-between min-h-[135px]">
          <div>
            <div className="flex justify-between items-start mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-500">Fractura Frecuente</span>
              <Activity className="w-4 h-4 text-amber-500 opacity-80" />
            </div>
            {stats.diagMasFrecuente ? (
              <div className="mt-1">
                <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 block truncate" title={stats.diagMasFrecuente.diagnostico}>
                  {stats.diagMasFrecuente.codigo !== 'S/C' ? `${stats.diagMasFrecuente.codigo}: ` : ''}{stats.diagMasFrecuente.diagnostico}
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-black text-primary-custom">{stats.diagMasFrecuente.total}</span>
                  <span className="text-[10px] font-bold text-amber-500">({perc(stats.diagMasFrecuente.total, stats.total)}%)</span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-secondary-custom font-bold">Sin datos</span>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-card-custom/50 text-[10px] text-secondary-custom font-medium truncate">
            Mayor frecuencia CIE-10
          </div>
        </div>

        {/* KPI 5: GRUPO ETARIO MÁS AFECTADO (RESTAURADA) */}
        <div className="bg-gradient-to-br from-indigo-500/10 via-card-custom to-card-custom p-4 rounded-2xl border border-indigo-500/20 relative overflow-hidden group shadow-sm flex flex-col justify-between min-h-[135px]">
          <div>
            <div className="flex justify-between items-start mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-500">Edad Afectada</span>
              <Users className="w-4 h-4 text-indigo-500 opacity-80" />
            </div>
            {stats.rangoMasFrecuente && stats.rangoMasFrecuente.total > 0 ? (
              <div className="mt-1">
                <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 block">
                  Tramo {stats.rangoMasFrecuente.rango} años
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-black text-primary-custom">{stats.rangoMasFrecuente.total}</span>
                  <span className="text-[10px] font-bold text-indigo-500">({perc(stats.rangoMasFrecuente.total, stats.total)}%)</span>
                </div>
              </div>
            ) : (
              <span className="text-xs text-secondary-custom font-bold">Sin datos</span>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-card-custom/50 text-[10px] text-secondary-custom font-medium truncate">
            Pico de casos por edad
          </div>
        </div>

        {/* KPI 6: DESGLOSE DE TIEMPOS DE ATENCIÓN (4 ETAPAS EN HORAS) */}
        <div className="bg-gradient-to-br from-sky-500/10 via-card-custom to-card-custom p-4 rounded-2xl border border-sky-500/20 relative overflow-hidden group shadow-sm flex flex-col justify-between min-h-[135px]">
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span className="text-[11px] font-black uppercase tracking-wider text-sky-500 truncate">
                Flujo Atenciones
              </span>
            </div>
            <InfoTooltip 
              title="Promedios del Flujo de Atención" 
              text="Duraciones promedio en horas (1 decimal): Admisión a Categorización (promedio Cat1/CatUlt), Categorización a Anamnesis, Anamnesis a Traslado/Alta, y Estadía Total." 
            />
          </div>

          <div className="grid grid-cols-4 gap-1 mt-1">
            <div className="bg-black/5 dark:bg-white/5 p-1 rounded-lg text-center border border-card-custom/50" title={`Admisión → Categorización (${stats.countAdmCatTotal} pac.)`}>
              <span className="text-[7px] font-bold uppercase text-sky-500 block truncate">Adm-Cat</span>
              <span className="text-xs font-black text-primary-custom">
                {stats.avgAdmCatGlobal !== null ? stats.avgAdmCatGlobal.toFixed(1) : '-'}
              </span>
              <span className="text-[7px] font-bold text-sky-500 block">hrs</span>
            </div>

            <div className="bg-black/5 dark:bg-white/5 p-1 rounded-lg text-center border border-card-custom/50" title={`Categorización → Anamnesis (${stats.countCatAnaTotal} pac.)`}>
              <span className="text-[7px] font-bold uppercase text-indigo-500 block truncate">Cat-Ana</span>
              <span className="text-xs font-black text-primary-custom">
                {stats.avgCatAnaGlobal !== null ? stats.avgCatAnaGlobal.toFixed(1) : '-'}
              </span>
              <span className="text-[7px] font-bold text-indigo-500 block">hrs</span>
            </div>

            <div className="bg-black/5 dark:bg-white/5 p-1 rounded-lg text-center border border-card-custom/50" title={`Anamnesis → Traslado/Alta (${stats.countAnaAltTotal} pac.)`}>
              <span className="text-[7px] font-bold uppercase text-amber-500 block truncate">Ana-Tras</span>
              <span className="text-xs font-black text-primary-custom">
                {stats.avgAnaAltGlobal !== null ? stats.avgAnaAltGlobal.toFixed(1) : '-'}
              </span>
              <span className="text-[7px] font-bold text-amber-500 block">hrs</span>
            </div>

            <div className="bg-emerald-500/10 p-1 rounded-lg text-center border border-emerald-500/20" title={`Estadía Total (${stats.countAdmAltTotal} pac.)`}>
              <span className="text-[7px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block truncate">Total</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                {stats.avgAdmAltGlobal !== null ? stats.avgAdmAltGlobal.toFixed(1) : '-'}
              </span>
              <span className="text-[7px] font-bold text-emerald-600 dark:text-emerald-400 block">hrs</span>
            </div>
          </div>
        </div>

        {/* KPI 7: COMPARATIVA AÑO ANTERIOR (YoY) */}
        <div className="bg-card-custom p-4 rounded-2xl border border-card-custom shadow-sm flex flex-col justify-between min-h-[135px] theme-transition relative overflow-hidden group">
          <div>
            <div className="flex justify-between items-start mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-secondary-custom">Año Anterior (YoY)</span>
              {yoyGrowth !== null && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${yoyGrowth >= 0 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                  {yoyGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {yoyGrowth >= 0 ? '+' : ''}{yoyGrowth.toFixed(1)}%
                </span>
              )}
            </div>
            <div className="text-3xl font-black text-primary-custom mt-1">
              {prevYearStart ? fracturasPrevYear : '-'}
            </div>
          </div>
          <p className="text-[9px] text-secondary-custom font-semibold mt-auto leading-tight truncate" title={prevYearStart ? `Entre ${prevYearStart.split('-').reverse().join('/')} y ${prevYearEnd.split('-').reverse().join('/')}` : 'Sin rango'}>
            {prevYearStart ? `${prevYearStart.split('-').reverse().join('/')} al ${prevYearEnd.split('-').reverse().join('/')}` : 'Sin rango seleccionado'}
          </p>
        </div>

      </div>

      {/* SECCIÓN COMPARATIVA DE GÉNERO Y DESTINO DE ALTA */}
      {stats.total > 0 && (
        <div className="bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-card-custom mb-6">
          
          {/* HEADER CON TÍTULO E INDICADORES */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2 pb-3 border-b border-card-custom/50">
            <div>
              <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-purple-500" />
                Distribución Global por Género & Destinos de Alta
              </h3>
              <p className="text-[11px] text-secondary-custom mt-0.5 font-medium">
                Participación total por sexo y resolución asistencial (derivaciones a hospital vs altas ambulatorias).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* BLOQUE PROTAGÓNICO 1: PARTICIPACIÓN DE GÉNERO TOTAL (MUJERES VS HOMBRES) */}
            <div className="lg:col-span-7 bg-card-custom p-5 rounded-xl border border-rose-500/30 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-rose-500" />
                    Distribución de Sexo en Fracturas
                  </span>
                  <span className="text-[10px] text-secondary-custom font-bold">Universo Total: {stats.total} casos</span>
                </div>

                {/* KPI DESTACADOS DE MUJERES Y HOMBRES */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-pink-500/10 p-3.5 rounded-xl border border-pink-500/20">
                    <span className="text-[10px] font-bold uppercase text-pink-500 block">Mujeres</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-black text-pink-600 dark:text-pink-400">{stats.mujeresCount}</span>
                      <span className="text-xs font-black text-pink-500">({stats.percMujeresGlobal}%)</span>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 p-3.5 rounded-xl border border-blue-500/20">
                    <span className="text-[10px] font-bold uppercase text-blue-500 block">Hombres</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{stats.hombresCount}</span>
                      <span className="text-xs font-black text-blue-500">({stats.percHombresGlobal}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* GRAN BARRA DE PORCENTAJE DE PARTICIPACIÓN GÉNERO */}
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-pink-500">Mujeres: {stats.mujeresCount} ({stats.percMujeresGlobal}%)</span>
                  <span className="text-blue-500">Hombres: {stats.hombresCount} ({stats.percHombresGlobal}%)</span>
                </div>
                <div className="h-4 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden flex shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-rose-400 h-full transition-all duration-500" 
                    style={{ width: `${stats.percMujeresGlobal}%` }} 
                    title={`Mujeres: ${stats.mujeresCount} casos (${stats.percMujeresGlobal}%)`}
                  />
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-indigo-500 h-full transition-all duration-500" 
                    style={{ width: `${stats.percHombresGlobal}%` }} 
                    title={`Hombres: ${stats.hombresCount} casos (${stats.percHombresGlobal}%)`}
                  />
                </div>
              </div>
            </div>

            {/* BLOQUE PROTAGÓNICO 2: DESTINOS DE ALTA (TOTALIDADES Y PARTICIPACIÓN) */}
            <div className="lg:col-span-5 bg-card-custom p-5 rounded-xl border border-purple-500/30 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-500 flex items-center gap-1.5">
                    <Hospital className="w-4 h-4 text-purple-500" />
                    Destino Asistencial
                  </span>
                  <span className="text-[10px] text-secondary-custom font-bold">Totalidades</span>
                </div>

                <div className="space-y-3">
                  {/* TRASLADADOS A HOSPITAL */}
                  <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black text-primary-custom block uppercase">Trasladados a Hospital / UEH</span>
                      <span className="text-[10px] text-secondary-custom font-semibold">Atención Secundaria de Urgencia</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-purple-600 dark:text-purple-400 block">{stats.hospitalCount}</span>
                      <span className="text-[10px] font-bold text-rose-500">{stats.percHospital}% del total</span>
                    </div>
                  </div>

                  {/* NO TRASLADADOS / DOMICILIO */}
                  <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black text-primary-custom block uppercase">No Trasladados (Domicilio / Otros)</span>
                      <span className="text-[10px] text-secondary-custom font-semibold">Resolución Ambulatoria SAPU/SAR</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block">{stats.total - stats.hospitalCount}</span>
                      <span className="text-[10px] font-bold text-emerald-500">{(100 - Number(stats.percHospital)).toFixed(1)}% del total</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BARRA COMPARATIVA DE DESTINO */}
              <div className="mt-3 pt-2">
                <div className="h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden flex shadow-inner">
                  <div 
                    className="bg-purple-500 h-full transition-all duration-500" 
                    style={{ width: `${stats.percHospital}%` }} 
                    title={`Hospital / UEH: ${stats.hospitalCount} (${stats.percHospital}%)`}
                  />
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500" 
                    style={{ width: `${(100 - Number(stats.percHospital)).toFixed(1)}%` }} 
                    title={`Domicilio / Otros: ${stats.total - stats.hospitalCount} (${(100 - Number(stats.percHospital)).toFixed(1)}%)`}
                  />
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* SECCIÓN DESTACADA: TOP 5 DIAGNÓSTICOS PRINCIPALES DE FRACTURA CON PESTAÑA DESPLEGABLE */}
      {stats.top5Diagnosticos.length > 0 && (
        <div className="bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-card-custom mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Top 5 Diagnósticos Principales de Fractura
              </h3>
              <InfoTooltip 
                title="Top 5 Diagnósticos" 
                text="Los 5 tipos de fractura con mayor cantidad de registros. Haz clic en 'Ver detalle' para desplegar el desglose por sexo y tiempo de estadía total." 
              />
            </div>

            <button
              onClick={() => setMostrarDetalleTop5(!mostrarDetalleTop5)}
              className="flex items-center gap-1.5 bg-card-custom hover:bg-black/5 dark:hover:bg-white/10 text-secondary-custom hover:text-primary-custom border border-card-custom px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-sm"
            >
              <span>{mostrarDetalleTop5 ? 'Ocultar detalles' : 'Desplegar todos los detalles'}</span>
              {mostrarDetalleTop5 ? <ChevronUp className="w-3.5 h-3.5 text-rose-500" /> : <ChevronDown className="w-3.5 h-3.5 text-rose-500" />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {stats.top5Diagnosticos.map((item, idx) => {
              const isCardExpanded = mostrarDetalleTop5 || !!cardExpandedTop5[idx];

              return (
                <div 
                  key={idx} 
                  className="bg-card-custom p-4 rounded-xl border border-card-custom flex flex-col justify-between shadow-sm relative overflow-hidden group transition-all hover:border-rose-500/30"
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                        #{idx + 1}
                      </span>
                      <span className="text-[11px] font-extrabold text-secondary-custom bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                        {item.codigo}
                      </span>
                    </div>

                    {/* NOMBRE DIAGNÓSTICO DESTACADO Y PROTAGÓNICO */}
                    <h4 className="text-xs font-black text-primary-custom leading-snug my-1.5 min-h-[36px] flex items-center" title={item.diagnostico}>
                      {item.diagnostico}
                    </h4>

                    <div className="flex justify-between items-baseline mt-2 pt-2 border-t border-card-custom/50">
                      <span className="text-[10px] text-secondary-custom font-semibold">Total Casos:</span>
                      <span className="text-sm font-black text-rose-500">{item.total} <span className="text-[10px] font-bold text-secondary-custom">({perc(item.total, stats.total)}%)</span></span>
                    </div>
                  </div>

                  {/* BOTÓN DESPLEGABLE DE PESTAÑA DETALLE */}
                  <div className="mt-3 pt-2 border-t border-card-custom/40">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCardExpandedTop5(prev => ({ ...prev, [idx]: !prev[idx] }));
                      }}
                      className="w-full flex items-center justify-between text-[10px] font-bold text-secondary-custom hover:text-rose-500 transition-colors py-1 cursor-pointer"
                    >
                      <span>{isCardExpanded ? 'Ocultar detalle' : 'Ver detalle'}</span>
                      {isCardExpanded ? <ChevronUp className="w-3.5 h-3.5 text-rose-500" /> : <ChevronDown className="w-3.5 h-3.5 text-rose-500" />}
                    </button>

                    {/* CONTENIDO DESPLEGABLE */}
                    {isCardExpanded && (
                      <div className="mt-2 pt-2 border-t border-card-custom/30 space-y-1.5 text-[10px]">
                        <div className="flex justify-between items-center" title={`${item.mujeres} mujeres (${item.percMujeres}%)`}>
                          <span className="text-secondary-custom font-semibold">Mujeres:</span>
                          <span className="font-bold text-pink-500">{item.mujeres} ({item.percMujeres}%)</span>
                        </div>
                        <div className="flex justify-between items-center" title={`${item.hombres} hombres (${item.percHombres}%)`}>
                          <span className="text-secondary-custom font-semibold">Hombres:</span>
                          <span className="font-bold text-blue-500">{item.hombres} ({item.percHombres}%)</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-card-custom/30 pt-1 mt-1">
                          <span className="text-secondary-custom font-semibold">Estadía Total:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {item.avgAdmAlt !== null ? `${item.avgAdmAlt.toFixed(1)} hrs` : '-'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BARRA DE FILTROS LOCALES */}
      <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-card-custom mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
        
        {/* BUSCADOR */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-custom" />
          <input
            type="text"
            placeholder="Buscar por diagnóstico (ej. Fractura de Cúbito) o código CIE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-input-custom text-primary-custom text-xs rounded-xl pl-9 pr-4 py-2.5 border border-card-custom focus:outline-none focus:border-rose-500 transition-all placeholder:text-secondary-custom/60"
          />
        </div>

        {/* FILTROS RÁPIDOS */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          
          {/* Destino */}
          <div className="flex items-center gap-1 bg-card-custom p-1 rounded-xl border border-card-custom text-xs font-bold flex-wrap">
            <span className="text-[10px] text-secondary-custom uppercase px-2">Destino:</span>
            <button
              onClick={() => setFiltroDestino('TODOS')}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${filtroDestino === 'TODOS' ? 'bg-rose-500 text-white shadow-sm' : 'text-secondary-custom hover:text-primary-custom'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroDestino('HOSPITAL')}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${filtroDestino === 'HOSPITAL' ? 'bg-rose-500 text-white shadow-sm' : 'text-secondary-custom hover:text-primary-custom'}`}
            >
              Hospital / UEH
            </button>
            <button
              onClick={() => setFiltroDestino('DOMICILIO')}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${filtroDestino === 'DOMICILIO' ? 'bg-emerald-500 text-white shadow-sm' : 'text-secondary-custom hover:text-primary-custom'}`}
            >
              Domicilio
            </button>
            <button
              onClick={() => setFiltroDestino('OTRO')}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${filtroDestino === 'OTRO' ? 'bg-sky-500 text-white shadow-sm' : 'text-secondary-custom hover:text-primary-custom'}`}
            >
              Otros
            </button>
            <button
              onClick={() => setFiltroDestino('SIN_REGISTRO')}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${filtroDestino === 'SIN_REGISTRO' ? 'bg-slate-500 text-white shadow-sm' : 'text-secondary-custom hover:text-primary-custom'}`}
            >
              Sin Registro
            </button>
          </div>

          {/* Rango Etario */}
          <select
            value={filtroEdad}
            onChange={(e) => setFiltroEdad(e.target.value)}
            className="bg-card-custom text-primary-custom text-xs font-bold rounded-xl px-3 py-2 border border-card-custom focus:outline-none focus:border-rose-500 transition-all cursor-pointer"
          >
            <option value="TODOS">Todos los Tramos Etarios</option>
            <option value="0-14">0 a 14 años (Pediatría)</option>
            <option value="15-29">15 a 29 años (Jóvenes)</option>
            <option value="30-59">30 a 59 años (Adultos)</option>
            <option value="60+">60+ años (Geriatría)</option>
            {AGE_RANGES.map((r, i) => (
              <option key={i} value={r}>Solo tramo {r} años</option>
            ))}
          </select>

          {/* Sexo */}
          <select
            value={filtroSexo}
            onChange={(e) => setFiltroSexo(e.target.value)}
            className="bg-card-custom text-primary-custom text-xs font-bold rounded-xl px-3 py-2 border border-card-custom focus:outline-none focus:border-rose-500 transition-all cursor-pointer"
          >
            <option value="TODOS">Ambos Sexos</option>
            <option value="F">Solo Mujeres</option>
            <option value="M">Solo Hombres</option>
          </select>

        </div>
      </div>

      {/* SECCIÓN INTERACTIVA DE GRUPOS ETARIOS (COMPRIMIDA EN GRID RESPONSIVO) */}
      <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-card-custom mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2.5 gap-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-500" />
              Grupos Etarios (17 Tramos)
            </h3>
            {filtroEdad !== 'TODOS' && (
              <button 
                onClick={() => setFiltroEdad('TODOS')}
                className="text-[10px] font-bold text-rose-500 hover:underline bg-rose-500/10 px-2 py-0.5 rounded-md"
              >
                Limpiar filtro ({filtroEdad})
              </button>
            )}
          </div>
          <span className="text-[10px] text-secondary-custom font-semibold">Haz clic en un tramo para filtrar la vista</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-1.5">
          {AGE_RANGES.map(range => {
            const count = stats.porRangoEtario[range]?.total || 0;
            const percentage = perc(count, stats.total);
            const isSelected = filtroEdad === range;

            return (
              <button
                key={range}
                onClick={() => setFiltroEdad(isSelected ? 'TODOS' : range)}
                title={`${range} años: ${count} pacientes (${percentage}%)`}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all cursor-pointer border ${
                  isSelected 
                    ? 'bg-rose-500 text-white border-rose-600 font-bold shadow-sm ring-2 ring-rose-500/30' 
                    : 'bg-card-custom hover:bg-black/5 dark:hover:bg-white/10 border-card-custom text-secondary-custom'
                }`}
              >
                <span className={`text-[10px] font-bold ${isSelected ? 'text-white/90' : 'text-secondary-custom'}`}>
                  {range}
                </span>
                <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-primary-custom'}`}>
                  {percentage}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VISUALIZACIONES GRÁFICAS */}
      {stats.total > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* GRÁFICO 1: DISTRIBUCIÓN POR TRAMO ETARIO Y SEXO */}
          <div className="lg:col-span-2 bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-card-custom">
            <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-500" />
              Incidencia de Fracturas por Rango Etario y Sexo
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataGraficoEdad} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="rango" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Mujeres" name="Mujeres" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Hombres" name="Hombres" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRÁFICO 2: PROPORCIÓN DESTINO DE ALTA */}
          <div className="bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-card-custom flex flex-col justify-between">
            <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider mb-2 flex items-center gap-2">
              <Hospital className="w-4 h-4 text-rose-500" />
              Destino de Alta (Hospital / Domicilio / Otros)
            </h3>
            <div className="h-52 my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataGraficoDestino}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dataGraficoDestino.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)', borderRadius: '12px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 text-[11px] font-semibold pt-2 border-t border-card-custom/50">
              <div className="flex justify-between items-center text-rose-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Hospital / Emergencia</span>
                <span className="font-bold">{stats.hospitalCount} ({stats.percHospital}%)</span>
              </div>
              <div className="flex justify-between items-center text-emerald-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Alta Domicilio</span>
                <span className="font-bold">{stats.domicilioCount} ({perc(stats.domicilioCount, stats.total)}%)</span>
              </div>
              {stats.otroDestinoCount > 0 && (
                <div className="flex justify-between items-center text-sky-500">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span> Otros Destinos</span>
                  <span className="font-bold">{stats.otroDestinoCount} ({perc(stats.otroDestinoCount, stats.total)}%)</span>
                </div>
              )}
              {stats.sinRegistroCount > 0 && (
                <div className="flex justify-between items-center text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span> Sin Registro</span>
                  <span className="font-bold">{stats.sinRegistroCount} ({perc(stats.sinRegistroCount, stats.total)}%)</span>
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-black/5 dark:bg-white/5 p-12 rounded-2xl text-center border border-card-custom mb-6">
          <AlertCircle className="w-10 h-10 text-secondary-custom/60 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-primary-custom">No se encontraron registros de fractura</h4>
          <p className="text-xs text-secondary-custom mt-1 max-w-md mx-auto">
            Asegúrate de haber seleccionado un rango de fechas válido o de haber cargado archivos que incluyan la columna "DIAGNOSTICO PRINCIPAL" con términos de fractura.
          </p>
        </div>
      )}

      {/* TABLA DE DETALLE Y CRUCE MULTIDIMENSIONAL */}
      <div className="overflow-hidden rounded-2xl border border-card-custom shadow-sm bg-card-custom">
        <div className="p-4 bg-black/5 dark:bg-white/5 border-b border-card-custom flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-rose-500" />
            Desglose de Diagnósticos de Fractura y Cruce de Datos ({stats.listaDiagnosticos.length} tipos)
          </h3>

          {/* TOGGLE VISTA DE EDADES EN TABLA */}
          <div className="flex items-center gap-1 bg-card-custom p-1 rounded-xl border border-card-custom text-xs font-bold">
            <span className="text-[10px] text-secondary-custom uppercase px-2">Ver Edad:</span>
            <button
              onClick={() => setModoVistaEdad('clinico')}
              className={`px-3 py-1 rounded-lg transition-all text-[11px] ${modoVistaEdad === 'clinico' ? 'bg-indigo-600 text-white shadow-sm' : 'text-secondary-custom hover:text-primary-custom'}`}
            >
              Rangos Clínicos (0-14, 15-29, 30-59, 60+)
            </button>
            <button
              onClick={() => setModoVistaEdad('detallado')}
              className={`px-3 py-1 rounded-lg transition-all text-[11px] ${modoVistaEdad === 'detallado' ? 'bg-indigo-600 text-white shadow-sm' : 'text-secondary-custom hover:text-primary-custom'}`}
            >
              Detallado (17 Tramos 5 Años)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 text-[10px] font-bold text-secondary-custom uppercase border-b border-card-custom">
                <th className="p-3 whitespace-nowrap">Código CIE</th>
                <th className="p-3 min-w-[220px]">Diagnóstico Principal</th>
                <th className="p-3 text-center whitespace-nowrap">Total Casos</th>
                <th className="p-3 text-center text-sky-500 whitespace-nowrap" title="Promedio Admisión a Categorización (hrs)">Adm → Cat</th>
                <th className="p-3 text-center text-indigo-500 whitespace-nowrap" title="Promedio Categorización a Anamnesis (hrs)">Cat → Ana</th>
                <th className="p-3 text-center text-amber-500 whitespace-nowrap" title="Promedio Anamnesis a Traslado/Alta (hrs)">Ana → Traslado</th>
                <th className="p-3 text-center text-emerald-500 whitespace-nowrap" title="Estadía Total: Admisión a Traslado/Alta (hrs)">Estadía Total</th>
                <th className="p-3 text-center text-rose-500 whitespace-nowrap">Hospital / UEH</th>
                <th className="p-3 text-center text-emerald-500 whitespace-nowrap">Domicilio</th>
                <th className="p-3 text-center text-sky-500 whitespace-nowrap">Otros</th>
                <th className="p-3 text-center text-slate-400 whitespace-nowrap">Sin Registro</th>

                {/* COLUMNAS DE EDAD SEGÚN MODO DE VISTA */}
                {modoVistaEdad === 'clinico' ? (
                  <>
                    <th className="p-3 text-center text-sky-500 whitespace-nowrap">0-14 Años (Pediatría)</th>
                    <th className="p-3 text-center text-indigo-500 whitespace-nowrap">15-29 Años (Jóvenes)</th>
                    <th className="p-3 text-center text-amber-500 whitespace-nowrap">30-59 Años (Adultos)</th>
                    <th className="p-3 text-center text-purple-500 whitespace-nowrap">60+ Años (Geriatría)</th>
                  </>
                ) : (
                  AGE_RANGES.map(range => (
                    <th key={range} className="p-2.5 text-center text-indigo-500 whitespace-nowrap">{range} AÑOS</th>
                  ))
                )}

                <th className="p-3 text-center text-pink-500 whitespace-nowrap">Mujeres (% / N)</th>
                <th className="p-3 text-center text-blue-500 whitespace-nowrap">Hombres (% / N)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-custom text-xs">
              {stats.listaDiagnosticos.length > 0 ? (
                stats.listaDiagnosticos.map((row, idx) => (
                  <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium text-secondary-custom">
                    <td className="p-3 font-bold text-primary-custom whitespace-nowrap">
                      {row.codigo}
                    </td>
                    <td className="p-3 font-bold text-primary-custom">
                      {row.diagnostico}
                    </td>
                    <td 
                      className="p-3 text-center font-black text-rose-500 text-sm cursor-help whitespace-nowrap"
                      title={`${row.total} casos de fractura (${perc(row.total, stats.total)}% del total)`}
                    >
                      {row.total}
                    </td>

                    {/* 1. Admisión -> Categorización */}
                    <td 
                      className="p-3 text-center font-bold text-sky-600 dark:text-sky-400 bg-sky-500/5 whitespace-nowrap"
                      title={row.countAdmCat > 0 ? `Admisión → Categorización: ${row.avgAdmCat.toFixed(1)} hrs (${row.countAdmCat} de ${row.total} pac.)` : 'Sin registro de categorización'}
                    >
                      {row.avgAdmCat !== null ? `${row.avgAdmCat.toFixed(1)} hrs` : '-'}
                    </td>

                    {/* 2. Categorización -> Anamnesis */}
                    <td 
                      className="p-3 text-center font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 whitespace-nowrap"
                      title={row.countCatAna > 0 ? `Categorización → Anamnesis: ${row.avgCatAna.toFixed(1)} hrs (${row.countCatAna} de ${row.total} pac.)` : 'Sin registro de anamnesis'}
                    >
                      {row.avgCatAna !== null ? `${row.avgCatAna.toFixed(1)} hrs` : '-'}
                    </td>

                    {/* 3. Anamnesis -> Traslado/Alta */}
                    <td 
                      className="p-3 text-center font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 whitespace-nowrap"
                      title={row.countAnaAlt > 0 ? `Anamnesis → Traslado/Alta: ${row.avgAnaAlt.toFixed(1)} hrs (${row.countAnaAlt} de ${row.total} pac.)` : 'Sin registro de alta/traslado'}
                    >
                      {row.avgAnaAlt !== null ? `${row.avgAnaAlt.toFixed(1)} hrs` : '-'}
                    </td>

                    {/* 4. Estadía Total */}
                    <td 
                      className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 whitespace-nowrap"
                      title={row.countAdmAlt > 0 ? `Estadía Total Admisión → Traslado/Alta: ${row.avgAdmAlt.toFixed(1)} hrs (${row.countAdmAlt} de ${row.total} pac.)` : 'Sin registro de estadía total'}
                    >
                      {row.avgAdmAlt !== null ? `${row.avgAdmAlt.toFixed(1)} hrs` : '-'}
                    </td>

                    <td className="p-3 text-center font-bold text-rose-500 bg-rose-500/5">
                      {row.hospital > 0 ? `${row.hospital} (${perc(row.hospital, row.total)}%)` : '-'}
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-500 bg-emerald-500/5">
                      {row.domicilio > 0 ? row.domicilio : '-'}
                    </td>
                    <td className="p-3 text-center font-bold text-sky-500 bg-sky-500/5">
                      {row.otroDestino > 0 ? row.otroDestino : '-'}
                    </td>
                    <td className="p-3 text-center font-bold text-slate-400">
                      {row.sinRegistro > 0 ? row.sinRegistro : '-'}
                    </td>

                    {/* VALORES DE EDAD SEGÚN MODO DE VISTA */}
                    {modoVistaEdad === 'clinico' ? (
                      <>
                        <td className="p-3 text-center font-bold text-sky-500 bg-sky-500/5">
                          {row.p0_14 > 0 ? row.p0_14 : '-'}
                        </td>
                        <td className="p-3 text-center font-bold text-indigo-500 bg-indigo-500/5">
                          {row.p15_29 > 0 ? row.p15_29 : '-'}
                        </td>
                        <td className="p-3 text-center font-bold text-amber-500 bg-amber-500/5">
                          {row.p30_59 > 0 ? row.p30_59 : '-'}
                        </td>
                        <td className="p-3 text-center font-bold text-purple-500 bg-purple-500/5">
                          {row.p60_plus > 0 ? row.p60_plus : '-'}
                        </td>
                      </>
                    ) : (
                      AGE_RANGES.map(range => (
                        <td key={range} className="p-2.5 text-center font-bold text-indigo-500">
                          {row.rangoCounts[range] > 0 ? row.rangoCounts[range] : '-'}
                        </td>
                      ))
                    )}

                    {/* DESGLOSE INTERACTIVO MUJERES */}
                    <td 
                      className="p-3 text-center font-bold text-pink-500 bg-pink-500/5 whitespace-nowrap cursor-help"
                      title={row.mujeres > 0 ? `${row.mujeres} mujeres de ${row.total} casos equivalen al ${row.percMujeres}%` : '0 mujeres de 0 casos (0%)'}
                    >
                      {row.mujeres > 0 ? `${row.mujeres} (${row.percMujeres}%)` : '-'}
                    </td>

                    {/* DESGLOSE INTERACTIVO HOMBRES */}
                    <td 
                      className="p-3 text-center font-bold text-blue-500 bg-blue-500/5 whitespace-nowrap cursor-help"
                      title={row.hombres > 0 ? `${row.hombres} hombres de ${row.total} casos equivalen al ${row.percHombres}%` : '0 hombres de 0 casos (0%)'}
                    >
                      {row.hombres > 0 ? `${row.hombres} (${row.percHombres}%)` : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="30" className="p-8 text-center text-secondary-custom text-xs font-semibold">
                    No se encontraron diagnósticos que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
