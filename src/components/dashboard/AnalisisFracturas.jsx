import React, { useState, useMemo } from 'react';
import { Activity, Stethoscope, Hospital, Users, Search, Download, Filter, AlertCircle, Award, Calendar, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import InfoTooltip from '../InfoTooltip';

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

export default function AnalisisFracturas({ pacientesFiltrados }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroDestino, setFiltroDestino] = useState('TODOS');
  const [filtroEdad, setFiltroEdad] = useState('TODOS');
  const [filtroSexo, setFiltroSexo] = useState('TODOS');
  const [modoVistaEdad, setModoVistaEdad] = useState('detallado'); // 'detallado' (17 tramos 5 años de la imagen 1) | 'clinico' (4 tramos)

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
    let hospitalCount = 0;
    let domicilioCount = 0;
    let otroDestinoCount = 0;
    let sinRegistroCount = 0;
    let mujeresCount = 0;
    let hombresCount = 0;

    let p0_14 = 0;
    let p15_29 = 0;
    let p30_59 = 0;
    let p60_plus = 0;

    const porDiagnostico = {};
    const porRangoEtario = Object.fromEntries(AGE_RANGES.map(r => [r, { F: 0, M: 0, total: 0 }]));

    pacientesFractura.forEach(p => {
      const catDest = parseDestinoCat(p);
      if (catDest === 'hospital') hospitalCount++;
      else if (catDest === 'domicilio') domicilioCount++;
      else if (catDest === 'sin_registro') sinRegistroCount++;
      else otroDestinoCount++;

      const s = String(p.sexo || '').toUpperCase();
      let isF = s.includes('MUJER') || s.includes('FEMENINO') || s === 'F';
      let isM = s.includes('HOMBRE') || s.includes('MASCULINO') || s === 'M';
      
      if (isF) mujeresCount++;
      else if (isM) hombresCount++;

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

    const listaDiagnosticos = Object.values(porDiagnostico).sort((a, b) => b.total - a.total);

    // KPI 1: Diagnóstico más frecuente
    const diagMasFrecuente = listaDiagnosticos.length > 0 ? listaDiagnosticos[0] : null;

    // KPI 2: Grupo Etario de 5 años más afectado (de los 17 tramos etarios de la Imagen 1)
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

    return {
      total,
      hospitalCount,
      domicilioCount,
      otroDestinoCount,
      sinRegistroCount,
      percHospital: perc(hospitalCount, total),
      mujeresCount,
      hombresCount,
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
  }, [pacientesFractura]);

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
    const headers = ["Codigo_CIE", "Diagnostico_Principal", "Total_Casos", "Hospital_Emergencia", "Alta_Domicilio", "Otro_Destino", "Sin_Registro", ...ageHeaders, "Mujeres", "Hombres"];
    const rows = stats.listaDiagnosticos.map(d => [
      `"${d.codigo}"`,
      `"${d.diagnostico.replace(/"/g, '""')}"`,
      d.total,
      d.hospital,
      d.domicilio,
      d.otroDestino,
      d.sinRegistro,
      ...AGE_RANGES.map(r => d.rangoCounts[r] || 0),
      d.mujeres,
      d.hombres
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

      {/* TARJETAS DE KPIS PRINCIPALES DE FRACTURAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* KPI 1: TOTAL FRACTURAS */}
        <div className="bg-gradient-to-br from-rose-500/10 via-card-custom to-card-custom p-4 rounded-2xl border border-rose-500/20 relative overflow-hidden group shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Total Casos Fractura</span>
            <Stethoscope className="w-4 h-4 text-rose-500 opacity-80" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-primary-custom">{stats.total}</span>
            <span className="text-xs text-secondary-custom font-semibold">casos</span>
          </div>
          <p className="text-[10px] text-secondary-custom mt-2 opacity-80">
            {totalFracturasPeriodo > 0 ? `${perc(stats.total, totalFracturasPeriodo)}% del total en selección` : 'Sin registros en el rango'}
          </p>
        </div>

        {/* KPI 2: DIAGNÓSTICO MÁS FRECUENTE */}
        <div className="bg-gradient-to-br from-amber-500/10 via-card-custom to-card-custom p-4 rounded-2xl border border-amber-500/20 relative overflow-hidden group shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">Fractura más Frecuente</span>
            <Award className="w-4 h-4 text-amber-500 opacity-80" />
          </div>
          <div className="mt-1">
            {stats.diagMasFrecuente ? (
              <>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 block truncate" title={stats.diagMasFrecuente.diagnostico}>
                  {stats.diagMasFrecuente.codigo !== 'S/C' ? `${stats.diagMasFrecuente.codigo}: ` : ''}{stats.diagMasFrecuente.diagnostico}
                </span>
                <span className="text-xl font-black text-primary-custom">{stats.diagMasFrecuente.total} <span className="text-xs font-bold text-secondary-custom">casos ({perc(stats.diagMasFrecuente.total, stats.total)}%)</span></span>
              </>
            ) : (
              <span className="text-xs text-secondary-custom font-bold">Sin datos</span>
            )}
          </div>
          <p className="text-[10px] text-secondary-custom mt-1 opacity-80">
            Mayor volumen por código CIE-10
          </p>
        </div>

        {/* KPI 3: GRUPO ETARIO MÁS AFECTADO */}
        <div className="bg-gradient-to-br from-sky-500/10 via-card-custom to-card-custom p-4 rounded-2xl border border-sky-500/20 relative overflow-hidden group shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-500">Grupo Etario más Afectado</span>
            <Users className="w-4 h-4 text-sky-500 opacity-80" />
          </div>
          <div className="mt-1">
            {stats.rangoMasFrecuente && stats.rangoMasFrecuente.total > 0 ? (
              <>
                <span className="text-xs font-black text-sky-600 dark:text-sky-400 block">
                  Tramo {stats.rangoMasFrecuente.rango} Años
                </span>
                <span className="text-xl font-black text-primary-custom">
                  {stats.rangoMasFrecuente.total} <span className="text-xs font-bold text-secondary-custom">casos ({perc(stats.rangoMasFrecuente.total, stats.total)}%)</span>
                </span>
              </>
            ) : (
              <span className="text-xs text-secondary-custom font-bold">Sin datos</span>
            )}
          </div>
          <p className="text-[10px] text-secondary-custom mt-1 opacity-80">
            Tramo quinquenal de mayor incidencia (17 tramos)
          </p>
        </div>

        {/* KPI 4: DERIVACIÓN A HOSPITAL / UEH */}
        <div className="bg-gradient-to-br from-purple-500/10 via-card-custom to-card-custom p-4 rounded-2xl border border-purple-500/20 relative overflow-hidden group shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-500">Derivación Hospital / UEH</span>
            <Hospital className="w-4 h-4 text-purple-500 opacity-80" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-rose-500">{stats.hospitalCount}</span>
            <span className="text-xs font-bold text-rose-500">({stats.percHospital}%)</span>
          </div>
          <p className="text-[10px] text-secondary-custom mt-2 opacity-80">
            Traslados urgentes a atención secundaria
          </p>
        </div>

      </div>

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

      {/* SECCIÓN INTERACTIVA DE GRUPOS ETARIOS COMPLETOS (PILLS ESTILO IMAGEN 1) */}
      <div className="bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-card-custom mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-500" />
            Distribución por Grupos Etarios Completos (5 en 5 Años)
          </h3>
          <span className="text-[10px] text-secondary-custom font-semibold">Haz clic en cualquier tramo para filtrar la vista</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2">
          {AGE_RANGES.map(range => {
            const count = stats.porRangoEtario[range]?.total || 0;
            const percentage = perc(count, stats.total);
            const isSelected = filtroEdad === range;

            return (
              <button
                key={range}
                onClick={() => setFiltroEdad(isSelected ? 'TODOS' : range)}
                className={`p-2.5 rounded-xl border flex flex-col justify-between items-center transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-rose-500 text-white border-rose-600 shadow-md scale-105' 
                    : 'bg-card-custom hover:bg-black/5 dark:hover:bg-white/10 border-card-custom text-primary-custom'
                }`}
              >
                <span className={`text-[11px] font-bold ${isSelected ? 'text-white' : 'text-secondary-custom'}`}>{range} yrs</span>
                <span className={`text-sm font-black mt-1 ${isSelected ? 'text-white' : 'text-primary-custom'}`}>{percentage}%</span>
                <span className={`text-[9px] font-medium ${isSelected ? 'text-white/80' : 'text-secondary-custom/70'}`}>{count} pac.</span>
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

                <th className="p-3 text-center text-pink-500 whitespace-nowrap">Mujeres</th>
                <th className="p-3 text-center text-blue-500 whitespace-nowrap">Hombres</th>
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
                    <td className="p-3 text-center font-black text-rose-500 text-sm">
                      {row.total}
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

                    <td className="p-3 text-center font-bold text-pink-500 bg-pink-500/5">
                      {row.mujeres > 0 ? row.mujeres : '-'}
                    </td>
                    <td className="p-3 text-center font-bold text-blue-500 bg-blue-500/5">
                      {row.hombres > 0 ? row.hombres : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="15" className="p-8 text-center text-secondary-custom text-xs font-semibold">
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
