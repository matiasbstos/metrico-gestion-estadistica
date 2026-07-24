import React, { useState, useMemo } from 'react';
import { 
  Users, Clock, Activity, ShieldCheck, Search, Filter, Download, 
  Stethoscope, ChevronRight, AlertCircle, ArrowUpRight, CheckCircle2, RefreshCw, Hospital, UserCheck, X
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, CartesianGrid, AreaChart, Area 
} from 'recharts';

const perc = (val, tot) => tot > 0 ? ((val / tot) * 100).toFixed(1) : '0.0';

export default function AnalisisEnfermeria({ pacientesFiltrados, pacientesDB, turnosDB }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('TODOS');
  const [filtroEnfermero, setFiltroEnfermero] = useState('TODOS');
  const [selectedDiagDetail, setSelectedDiagDetail] = useState(null);

  // Normalizar paciente para lectura segura de campos de triaje y enfermería
  const pacientesProcesados = useMemo(() => {
    const list = pacientesFiltrados || pacientesDB || [];
    return list.map(p => {
      let cat1 = String(p.catPrimera || p.categoria || 'sincat').toLowerCase();
      let catUlt = String(p.catUltima || p.categoria || 'sincat').toLowerCase();
      const enf1 = p.enfermeroCat1 ? String(p.enfermeroCat1).trim() : 'No Registrado';
      const enfUlt = p.enfermeroCatUlt ? String(p.enfermeroCatUlt).trim() : 'No Registrado';
      
      const cod = (p.codigoDiagnostico || '').toUpperCase();
      const diag = (p.diagnosticoPrincipal || '').toUpperCase();
      const isLesion = cod.includes('Z51.8') || cod.includes('Z518') || 
                       cod.includes('Z04') || 
                       diag.includes('CONSTATAC') || 
                       diag.includes('LESIÓN') || diag.includes('LESION') ||
                       diag.includes('CIRCUNSTANCIAS LEGALES') ||
                       diag.includes('POLICIAL') ||
                       diag.includes('AGRESIÓN') || diag.includes('AGRESION');

      if (isLesion) {
        if (cat1 === 'c3') cat1 = 'c3_z518';
        if (catUlt === 'c3') catUlt = 'c3_z518';
      }

      const tAdm = p.tAdmision || null;
      const tC1 = p.tCat1 || p.tCatUlt || null;
      const tCU = p.tCatUlt || null;
      const tAlt = p.tAlta || null;

      // Cálculo de minutos
      const minAdmToCat1 = (tAdm && tC1 && tC1 >= tAdm) ? Math.round((tC1 - tAdm) / 60000) : null;
      const minCat1ToCatU = (tC1 && tCU && tCU > tC1) ? Math.round((tCU - tC1) / 60000) : null;
      const minEstadiaTotal = (tAdm && tAlt && tAlt >= tAdm) ? Math.round((tAlt - tAdm) / 60000) : null;

      const destRaw = String(p.destinoAlta || p.destino || '').trim();
      const destNorm = destRaw.toLowerCase();
      let catDestino = 'Otro / Domicilio';
      if (destNorm.includes('hospital') || destNorm.includes('emergencia') || destNorm.includes('derivac')) {
        catDestino = 'Hospital / UEH';
      } else if (destNorm.includes('domicilio')) {
        catDestino = 'Alta Domicilio';
      } else if (!destRaw) {
        catDestino = 'Sin Registro';
      }

      return {
        ...p,
        cat1Clean: cat1,
        catUltClean: catUlt,
        enf1,
        enfUlt,
        minAdmToCat1,
        minCat1ToCatU,
        minEstadiaTotal,
        catDestino
      };
    });
  }, [pacientesFiltrados, pacientesDB]);

  // Lista única de enfermeros/profesionales
  const listaEnfermeros = useMemo(() => {
    const setEnf = new Set();
    pacientesProcesados.forEach(p => {
      if (p.enf1 && p.enf1 !== 'No Registrado') setEnf.add(p.enf1);
      if (p.enfUlt && p.enfUlt !== 'No Registrado') setEnf.add(p.enfUlt);
    });
    return Array.from(setEnf).sort();
  }, [pacientesProcesados]);

  // Filtrado dinámico
  const pacientesFiltradosVista = useMemo(() => {
    return pacientesProcesados.filter(p => {
      if (filtroCategoria !== 'TODOS') {
        if (p.cat1Clean !== filtroCategoria.toLowerCase() && p.catUltClean !== filtroCategoria.toLowerCase()) return false;
      }
      if (filtroEnfermero !== 'TODOS') {
        if (p.enf1 !== filtroEnfermero && p.enfUlt !== filtroEnfermero) return false;
      }
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase().trim();
        const searchStr = `${p.enf1} ${p.enfUlt} ${p.diagnosticoPrincipal || ''} ${p.codigoDiagnostico || ''} ${p.catDestino}`.toLowerCase();
        if (!searchStr.includes(q)) return false;
      }
      return true;
    });
  }, [pacientesProcesados, filtroCategoria, filtroEnfermero, searchTerm]);

  // Métricas KPI globales
  const kpis = useMemo(() => {
    let total = pacientesFiltradosVista.length;
    let sumMinCat1 = 0, countMinCat1 = 0;
    let sumMinReCat = 0, countMinReCat = 0;
    let sumMinEstadia = 0, countMinEstadia = 0;
    let reCatCount = 0;

    let c1Count = 0, c2Count = 0, c3Count = 0, c4Count = 0, c5Count = 0;
    let hospitalDestCount = 0;

    pacientesFiltradosVista.forEach(p => {
      if (p.minAdmToCat1 !== null && p.minAdmToCat1 <= 300) {
        sumMinCat1 += p.minAdmToCat1;
        countMinCat1++;
      }
      if (p.minCat1ToCatU !== null && p.minCat1ToCatU <= 600) {
        sumMinReCat += p.minCat1ToCatU;
        countMinReCat++;
        reCatCount++;
      }
      if (p.minEstadiaTotal !== null && p.minEstadiaTotal <= 1440) {
        sumMinEstadia += p.minEstadiaTotal;
        countMinEstadia++;
      }

      if (p.cat1Clean === 'c1') c1Count++;
      else if (p.cat1Clean === 'c2') c2Count++;
      else if (p.cat1Clean === 'c3' || p.cat1Clean === 'c3_z518') c3Count++;
      else if (p.cat1Clean === 'c4') c4Count++;
      else if (p.cat1Clean === 'c5') c5Count++;

      if (p.catDestino === 'Hospital / UEH') hospitalDestCount++;
    });

    return {
      total,
      avgMinCat1: countMinCat1 ? Math.round(sumMinCat1 / countMinCat1) : 0,
      avgMinReCat: countMinReCat ? Math.round(sumMinReCat / countMinReCat) : 0,
      avgMinEstadia: countMinEstadia ? Math.round(sumMinEstadia / countMinEstadia) : 0,
      reCatCount,
      percReCat: perc(reCatCount, total),
      c1Count, c2Count, c3Count, c4Count, c5Count,
      hospitalDestCount,
      percHospital: perc(hospitalDestCount, total)
    };
  }, [pacientesFiltradosVista]);

  // Métricas agregadas por Profesional de Enfermería
  const statsPorProfesional = useMemo(() => {
    const mapEnf = {};

    pacientesFiltradosVista.forEach(p => {
      const enf = p.enf1 !== 'No Registrado' ? p.enf1 : p.enfUlt;
      if (!mapEnf[enf]) {
        mapEnf[enf] = {
          nombre: enf,
          totalTriados: 0,
          c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, sincat: 0,
          sumMinCat1: 0, countMinCat1: 0,
          sumMinReCat: 0, countMinReCat: 0,
          hospitalDest: 0, domicilioDest: 0
        };
      }

      const item = mapEnf[enf];
      item.totalTriados++;

      if (p.cat1Clean === 'c1') item.c1++;
      else if (p.cat1Clean === 'c2') item.c2++;
      else if (p.cat1Clean === 'c3' || p.cat1Clean === 'c3_z518') item.c3++;
      else if (p.cat1Clean === 'c4') item.c4++;
      else if (p.cat1Clean === 'c5') item.c5++;
      else item.sincat++;

      if (p.minAdmToCat1 !== null && p.minAdmToCat1 <= 300) {
        item.sumMinCat1 += p.minAdmToCat1;
        item.countMinCat1++;
      }
      if (p.minCat1ToCatU !== null && p.minCat1ToCatU <= 600) {
        item.sumMinReCat += p.minCat1ToCatU;
        item.countMinReCat++;
      }

      if (p.catDestino === 'Hospital / UEH') item.hospitalDest++;
      else if (p.catDestino === 'Alta Domicilio') item.domicilioDest++;
    });

    return Object.values(mapEnf)
      .map(item => ({
        ...item,
        avgMinCat1: item.countMinCat1 ? Math.round(item.sumMinCat1 / item.countMinCat1) : 0,
        avgMinReCat: item.countMinReCat ? Math.round(item.sumMinReCat / item.countMinReCat) : 0,
        percHospital: perc(item.hospitalDest, item.totalTriados)
      }))
      .sort((a, b) => b.totalTriados - a.totalTriados);
  }, [pacientesFiltradosVista]);

  // Pacientes filtrados para el detalle del diagnóstico general C3 seleccionado
  const pacientesDelDiag = useMemo(() => {
    if (!selectedDiagDetail) return [];
    return pacientesFiltradosVista.filter(p => {
      const cat = p.cat1Clean;
      const isC3 = cat === 'c3';
      const matchesName = (p.diagnosticoPrincipal || '').toUpperCase().trim() === selectedDiagDetail.name;
      const matchesCode = (p.codigoDiagnostico || '').toUpperCase().trim() === selectedDiagDetail.code;
      return isC3 && (matchesName || matchesCode);
    });
  }, [pacientesFiltradosVista, selectedDiagDetail]);

  // Datos para gráfico de barras por Categoriación por Profesional
  const chartCategoriasEnfermero = useMemo(() => {
    return statsPorProfesional.slice(0, 10).map(e => ({
      nombre: e.nombre.length > 18 ? e.nombre.substring(0, 16) + '...' : e.nombre,
      C1: e.c1,
      C2: e.c2,
      C3: e.c3,
      C4: e.c4,
      C5: e.c5
    }));
  }, [statsPorProfesional]);

  // Datos para gráfico de tiempos promedio por profesional
  const chartTiemposEnfermero = useMemo(() => {
    return statsPorProfesional
      .slice(0, 10)
      .map(e => ({
        nombre: e.nombre.length > 18 ? e.nombre.substring(0, 16) + '...' : e.nombre,
        'Admisión a 1ª Cat (min)': e.avgMinCat1,
        'Intervalo Re-Cat (min)': e.avgMinReCat
      }));
  }, [statsPorProfesional]);

  // Filtrado de casos críticos C1 y C2 para el desglose detallado
  const casosCriticos = useMemo(() => {
    return pacientesFiltradosVista.filter(p => p.cat1Clean === 'c1' || p.cat1Clean === 'c2' || p.catUltClean === 'c1' || p.catUltClean === 'c2');
  }, [pacientesFiltradosVista]);

  // Diferenciación de categoría C3 (Constatación de lesiones vs Otros diagnósticos)
  const c3Stats = useMemo(() => {
    const c3LesionesPacs = pacientesFiltradosVista.filter(p => p.cat1Clean === 'c3_z518' || p.catUltClean === 'c3_z518');
    const c3ClinicoPacs = pacientesFiltradosVista.filter(p => p.cat1Clean === 'c3' || p.catUltClean === 'c3');
    const totalC3 = c3LesionesPacs.length + c3ClinicoPacs.length;

    const diagCounts = {};
    c3ClinicoPacs.forEach(p => {
      const diag = (p.diagnosticoPrincipal || p.codigoDiagnostico || 'SIN DIAGNÓSTICO ESPECIFICADO').toUpperCase().trim();
      const code = (p.codigoDiagnostico || 'S/C').toUpperCase().trim();
      const key = `${code}|${diag}`;
      diagCounts[key] = (diagCounts[key] || 0) + 1;
    });

    const top10Diag = Object.entries(diagCounts)
      .map(([key, count]) => {
        const [code, name] = key.split('|');
        return {
          code,
          name,
          count,
          percentage: c3ClinicoPacs.length > 0 ? ((count / c3ClinicoPacs.length) * 100).toFixed(1) : '0.0'
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalC3,
      lesionesCount: c3LesionesPacs.length,
      lesionesPerc: totalC3 > 0 ? ((c3LesionesPacs.length / totalC3) * 100).toFixed(1) : '0.0',
      clinicoCount: c3ClinicoPacs.length,
      clinicoPerc: totalC3 > 0 ? ((c3ClinicoPacs.length / totalC3) * 100).toFixed(1) : '0.0',
      top10Diag
    };
  }, [pacientesFiltradosVista]);

  // Totales globales para el pie de la tabla de enfermeros
  const totalesEnfermeria = useMemo(() => {
    let totalTriados = 0;
    let c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0;
    statsPorProfesional.forEach(row => {
      totalTriados += row.totalTriados;
      c1 += row.c1;
      c2 += row.c2;
      c3 += row.c3;
      c4 += row.c4;
      c5 += row.c5;
    });
    return {
      totalTriados,
      c1, c2, c3, c4, c5,
      avgMinCat1: kpis.avgMinCat1,
      avgMinReCat: kpis.avgMinReCat
    };
  }, [statsPorProfesional, kpis]);

  // Exportar reporte a CSV
  const handleExportCSV = () => {
    if (statsPorProfesional.length === 0) return;

    const headers = ["Profesional", "Total_Pacientes", "C1", "C2", "C3", "C4", "C5", "Min_Adm_a_1Cat", "Min_ReCat", "Destino_Hospital_Pct"];
    const rows = statsPorProfesional.map(e => [
      `"${e.nombre.replace(/"/g, '""')}"`,
      e.totalTriados,
      e.c1, e.c2, e.c3, e.c4, e.c5,
      e.avgMinCat1,
      e.avgMinReCat,
      `${e.percHospital}%`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rendimiento_Enfermeria_Triaje_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* CABECERA Y CONTEXTO DEL MÓDULO */}
      <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 theme-transition">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-2xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-primary-custom tracking-tight">Rendimiento de Enfermería y Triaje</h2>
              <p className="text-xs text-secondary-custom font-semibold mt-0.5">
                Evaluación operativa de 1ª y 2ª categorización (C1-C5), tiempos de respuesta a triaje y flujo de atención.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-card-custom hover:bg-black/10 dark:hover:bg-white/10 text-primary-custom text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-500" /> Exportar CSV
          </button>
        </div>
      </div>

      {/* TARJETAS KPI DE DESEMPEÑO DE ENFERMERÍA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Tiempo a 1ª Categorización */}
        <div className="bg-card-custom p-5 rounded-2xl border border-card-custom shadow-sm relative overflow-hidden theme-transition">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-secondary-custom uppercase tracking-wider">Admisión ➔ 1ª Categorización</span>
            <div className="p-2 bg-sky-500/10 text-sky-500 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-primary-custom">{kpis.avgMinCat1} <span className="text-xs text-secondary-custom font-bold">min</span></span>
            <p className="text-[10px] text-secondary-custom mt-1 font-semibold">Tiempo promedio de respuesta inicial a triaje</p>
          </div>
        </div>

        {/* KPI 2: Tiempo de Re-categorización */}
        <div className="bg-card-custom p-5 rounded-2xl border border-card-custom shadow-sm relative overflow-hidden theme-transition">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-secondary-custom uppercase tracking-wider">1ª ➔ 2ª Categorización</span>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-amber-500">{kpis.avgMinReCat} <span className="text-xs text-secondary-custom font-bold">min</span></span>
            <p className="text-[10px] text-secondary-custom mt-1 font-semibold">{kpis.reCatCount} pacientes re-evaluados ({kpis.percReCat}%)</p>
          </div>
        </div>

        {/* KPI 3: Estadía Total de Pacientes Triados */}
        <div className="bg-card-custom p-5 rounded-2xl border border-card-custom shadow-sm relative overflow-hidden theme-transition">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-secondary-custom uppercase tracking-wider">Estadía Total Promedio</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-emerald-500">{kpis.avgMinEstadia} <span className="text-xs text-secondary-custom font-bold">min</span></span>
            <p className="text-[10px] text-secondary-custom mt-1 font-semibold">Llegada a alta de pacientes categorizados</p>
          </div>
        </div>

        {/* KPI 4: % Derivación Hospitalaria desde Triaje */}
        <div className="bg-card-custom p-5 rounded-2xl border border-card-custom shadow-sm relative overflow-hidden theme-transition">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-secondary-custom uppercase tracking-wider">Derivación Hospitalaria</span>
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
              <Hospital className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-rose-500">{kpis.hospitalDestCount} <span className="text-xs text-secondary-custom font-bold">({kpis.percHospital}%)</span></span>
            <p className="text-[10px] text-secondary-custom mt-1 font-semibold">Pacientes derivados a UEH / Hospital</p>
          </div>
        </div>

      </div>

      {/* FILTROS Y CONTROLES LOCALES */}
      <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-card-custom flex flex-col md:flex-row gap-3 justify-between items-center">
        
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-custom" />
          <input
            type="text"
            placeholder="Buscar profesional de enfermería, diagnóstico o categoría..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-input-custom text-primary-custom text-xs rounded-xl pl-9 pr-4 py-2.5 border border-card-custom focus:outline-none focus:border-rose-500 transition-all placeholder:text-secondary-custom/60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          {/* Selector de Profesional */}
          <select
            value={filtroEnfermero}
            onChange={e => setFiltroEnfermero(e.target.value)}
            className="bg-card-custom text-primary-custom text-xs font-bold rounded-xl px-3 py-2 border border-card-custom focus:outline-none focus:border-rose-500 transition-all cursor-pointer"
          >
            <option value="TODOS">Todos los Enfermeros ({listaEnfermeros.length})</option>
            {listaEnfermeros.map((enf, idx) => (
              <option key={idx} value={enf}>{enf}</option>
            ))}
          </select>

          {/* Selector de Categoría */}
          <select
            value={filtroCategoria}
            onChange={e => setFiltroCategoria(e.target.value)}
            className="bg-card-custom text-primary-custom text-xs font-bold rounded-xl px-3 py-2 border border-card-custom focus:outline-none focus:border-rose-500 transition-all cursor-pointer"
          >
            <option value="TODOS">Todas las Categorías (C1-C5)</option>
            <option value="C1">C1 - Resuscitación</option>
            <option value="C2">C2 - Emergencia</option>
            <option value="C3">C3 - Urgencia</option>
            <option value="C4">C4 - No Urgente</option>
            <option value="C5">C5 - General</option>
          </select>

        </div>
      </div>

      {/* GRÁFICOS DE DESEMPEÑO POR PROFESIONAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico 1: Distribución C1-C5 por Enfermero */}
        <div className="lg:col-span-2 bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-card-custom">
          <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-500" />
            Categorizaciones Realizadas por Profesional (Top 10 Enfermeros)
          </h3>
          <div className="h-64">
            {chartCategoriasEnfermero.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartCategoriasEnfermero} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="nombre" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)', borderRadius: '12px', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                  <Bar dataKey="C1" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="C2" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="C3" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="C4" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="C5" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-bold text-secondary-custom">
                No hay datos suficientes para mostrar el gráfico.
              </div>
            )}
          </div>
        </div>

        {/* Gráfico 2: Tiempos Promedio de Respuesta */}
        <div className="bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-card-custom flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Tiempos de Respuesta de Triaje
            </h3>
            <p className="text-[11px] text-secondary-custom font-semibold mb-4 leading-relaxed">
              Métricas de velocidad en minutos desde que el paciente se registra en admisión hasta que recibe su primera categorización.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-card-custom p-4 rounded-xl border border-card-custom shadow-sm">
              <span className="text-[10px] font-bold text-secondary-custom uppercase">Admisión a 1ª Categorización</span>
              <div className="flex justify-between items-baseline mt-1">
                <span className="text-2xl font-black text-sky-500">{kpis.avgMinCat1} min</span>
                <span className="text-[10px] text-emerald-500 font-bold">Respuesta Inicial</span>
              </div>
            </div>

            <div className="bg-card-custom p-4 rounded-xl border border-card-custom shadow-sm">
              <span className="text-[10px] font-bold text-secondary-custom uppercase">Intervalo 1ª a 2ª Categorización</span>
              <div className="flex justify-between items-baseline mt-1">
                <span className="text-2xl font-black text-amber-500">{kpis.avgMinReCat} min</span>
                <span className="text-[10px] text-amber-500 font-bold">Re-evaluación</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Gráfico de Tiempos por Enfermero */}
      <div className="bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-card-custom mt-6">
        <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-500" />
          Tiempos Promedio de Categorización y Re-evaluación por Enfermero (Top 10 Funcionarios)
        </h3>
        <div className="h-72">
          {chartTiemposEnfermero.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartTiemposEnfermero} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="nombre" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)', borderRadius: '12px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                <Bar dataKey="Admisión a 1ª Cat (min)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Intervalo Re-Cat (min)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs font-bold text-secondary-custom">
              No hay datos suficientes para mostrar el gráfico.
            </div>
          )}
        </div>
      </div>

      {/* TABLA DETALLADA DE RENDIMIENTO POR ENFERMERO/A */}
      <div className="overflow-hidden rounded-2xl border border-card-custom shadow-sm bg-card-custom">
        <div className="p-4 bg-black/5 dark:bg-white/5 border-b border-card-custom flex justify-between items-center">
          <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-rose-500" />
            Tabla de Desempeño por Profesional de Enfermería ({statsPorProfesional.length} profesionales)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 text-[10px] font-bold text-secondary-custom uppercase border-b border-card-custom">
                <th className="p-3">Profesional / Enfermero(a)</th>
                <th className="p-3 text-center">Total Triados</th>
                <th className="p-3 text-center text-red-500">C1</th>
                <th className="p-3 text-center text-orange-500">C2</th>
                <th className="p-3 text-center text-amber-500">C3</th>
                <th className="p-3 text-center text-emerald-500">C4</th>
                <th className="p-3 text-center text-blue-500">C5</th>
                <th className="p-3 text-center text-sky-500">T. 1ª Cat (min)</th>
                <th className="p-3 text-center text-amber-500">T. 2ª Cat (min)</th>
                <th className="p-3 text-center text-rose-500">% Hosp / Deriv</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-custom text-xs">
              {statsPorProfesional.length > 0 ? (
                statsPorProfesional.map((row, idx) => (
                  <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium text-secondary-custom">
                    <td className="p-3 font-bold text-primary-custom">
                      {row.nombre}
                    </td>
                    <td className="p-3 text-center font-black text-rose-500 text-sm">
                      {row.totalTriados}
                    </td>
                    <td className="p-3 text-center font-bold text-red-500 bg-red-500/5">
                      {row.c1 > 0 ? row.c1 : '-'}
                    </td>
                    <td className="p-3 text-center font-bold text-orange-500 bg-orange-500/5">
                      {row.c2 > 0 ? row.c2 : '-'}
                    </td>
                    <td className="p-3 text-center font-bold text-amber-500 bg-amber-500/5">
                      {row.c3 > 0 ? row.c3 : '-'}
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-500 bg-emerald-500/5">
                      {row.c4 > 0 ? row.c4 : '-'}
                    </td>
                    <td className="p-3 text-center font-bold text-blue-500 bg-blue-500/5">
                      {row.c5 > 0 ? row.c5 : '-'}
                    </td>
                    <td className="p-3 text-center font-bold text-sky-500">
                      {row.avgMinCat1 > 0 ? `${row.avgMinCat1} min` : '-'}
                    </td>
                    <td className="p-3 text-center font-bold text-amber-500">
                      {row.avgMinReCat > 0 ? `${row.avgMinReCat} min` : '-'}
                    </td>
                    <td className="p-3 text-center font-bold text-rose-500">
                      {row.percHospital}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-secondary-custom text-xs font-semibold">
                    No se encontraron registros de enfermería para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
            {statsPorProfesional.length > 0 && (
              <tfoot className="border-t-2 border-card-custom font-black bg-black/5 dark:bg-white/5 text-primary-custom text-xs">
                <tr>
                  <td className="p-3 font-bold">TOTAL / PROMEDIO GLOBAL</td>
                  <td className="p-3 text-center text-rose-500 text-sm">{totalesEnfermeria.totalTriados}</td>
                  <td className="p-3 text-center text-red-500 bg-red-500/5">{totalesEnfermeria.c1 > 0 ? totalesEnfermeria.c1 : '-'}</td>
                  <td className="p-3 text-center text-orange-500 bg-orange-500/5">{totalesEnfermeria.c2 > 0 ? totalesEnfermeria.c2 : '-'}</td>
                  <td className="p-3 text-center text-amber-500 bg-amber-500/5">{totalesEnfermeria.c3 > 0 ? totalesEnfermeria.c3 : '-'}</td>
                  <td className="p-3 text-center text-emerald-500 bg-emerald-500/5">{totalesEnfermeria.c4 > 0 ? totalesEnfermeria.c4 : '-'}</td>
                  <td className="p-3 text-center text-blue-500 bg-blue-500/5">{totalesEnfermeria.c5 > 0 ? totalesEnfermeria.c5 : '-'}</td>
                  <td className="p-3 text-center text-sky-500">{totalesEnfermeria.avgMinCat1 > 0 ? `${totalesEnfermeria.avgMinCat1} min` : '-'}</td>
                  <td className="p-3 text-center text-amber-500">{totalesEnfermeria.avgMinReCat > 0 ? `${totalesEnfermeria.avgMinReCat} min` : '-'}</td>
                  <td className="p-3 text-center text-rose-500">{kpis.percHospital}%</td>
                </tr>
              </tfoot>
            )}
          </table>
      </div>
    </div>

      {/* SECCIÓN DE DIFERENCIACIÓN C3: LESIONES VS CLÍNICO (PEDIDO POR EL USUARIO) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Panel Izquierdo: Resumen y Porcentajes */}
        <div className="bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-card-custom flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              Diferenciación de Categoría C3
            </h3>
            <p className="text-[11px] text-secondary-custom font-semibold mb-4 leading-relaxed">
              Análisis comparativo entre los casos de <strong>Constatación de Lesiones (Código Z51.8)</strong> y otros diagnósticos clínicos de urgencia.
            </p>
          </div>

          <div className="space-y-4 mt-auto">
            <div className="bg-card-custom p-4 rounded-xl border border-card-custom shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-secondary-custom uppercase">Total Evaluados C3</span>
                <p className="text-2xl font-black text-primary-custom mt-0.5">{c3Stats.totalC3}</p>
              </div>
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                <Stethoscope className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-card-custom p-4 rounded-xl border border-card-custom shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase">Constatación de Lesiones (Z51.8)</span>
                <p className="text-xl font-black text-amber-600 mt-0.5">
                  {c3Stats.lesionesCount} <span className="text-xs font-bold text-secondary-custom ml-1">({c3Stats.lesionesPerc}%)</span>
                </p>
              </div>
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-card-custom p-4 rounded-xl border border-card-custom shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-sky-600 uppercase">Diagnóstico Clínico General</span>
                <p className="text-xl font-black text-sky-500 mt-0.5">
                  {c3Stats.clinicoCount} <span className="text-xs font-bold text-secondary-custom ml-1">({c3Stats.clinicoPerc}%)</span>
                </p>
              </div>
              <div className="p-2.5 bg-sky-500/10 text-sky-500 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Top 10 Diagnósticos C3 Clínico */}
        <div className="lg:col-span-2 bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-card-custom">
          <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-500" />
            Top 10 Diagnósticos Clínicos C3 (Excluye Constatación de Lesiones)
          </h3>
          <div className="overflow-x-auto max-h-[260px] overflow-y-auto border border-card-custom bg-card-custom rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-black/5 dark:bg-white/5 text-[9px] font-bold text-secondary-custom uppercase border-b border-card-custom sticky top-0 bg-card-custom">
                  <th className="p-2.5 w-24">Código</th>
                  <th className="p-2.5">Diagnóstico Clínico</th>
                  <th className="p-2.5 text-center w-24">Nº Casos</th>
                  <th className="p-2.5 text-center w-24">% Del Clínico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-custom">
                {c3Stats.top10Diag.length > 0 ? (
                  c3Stats.top10Diag.map((item, idx) => (
                    <tr 
                      key={idx} 
                      onClick={() => setSelectedDiagDetail({ code: item.code, name: item.name })}
                      className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-secondary-custom cursor-pointer"
                      title="Haz clic para ver el detalle de pacientes"
                    >
                      <td className="p-2.5 font-bold text-rose-500">{item.code}</td>
                      <td className="p-2.5 text-primary-custom truncate max-w-xs" title={item.name}>{item.name}</td>
                      <td className="p-2.5 text-center font-bold text-primary-custom">{item.count}</td>
                      <td className="p-2.5 text-center font-black text-sky-500">{item.percentage}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-secondary-custom">No hay registros clínicos de C3 en este periodo.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* TABLA DE CASOS CRÍTICOS C1 Y C2 (PEDIDO POR EL USUARIO) */}
      <div className="overflow-hidden rounded-2xl border border-card-custom shadow-sm bg-card-custom mt-6">
        <div className="p-4 bg-black/5 dark:bg-white/5 border-b border-card-custom flex justify-between items-center">
          <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
            Registro Detallado de Atenciones Críticas (Categoría C1 y C2)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 text-[10px] font-bold text-secondary-custom uppercase border-b border-card-custom">
                <th className="p-3">Fecha y Hora</th>
                <th className="p-3 text-center">Turno Asociado</th>
                <th className="p-3 text-center">ID / Correlativo (IP)</th>
                <th className="p-3 text-center">Categoría</th>
                <th className="p-3">Diagnóstico Médico</th>
                <th className="p-3 text-center">Código Diagnóstico</th>
                <th className="p-3">Enfermero(a) que Categorizó</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-custom text-xs">
              {casosCriticos.length > 0 ? (
                casosCriticos.map((p, idx) => {
                  const d = p.tAdmision ? new Date(p.tAdmision) : null;
                  const dateStr = d ? d.toLocaleDateString('es-CL') : '-';
                  const timeStr = d ? d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '-';
                  
                  // Calcular turno asociado
                  let turnoStr = '-';
                  if (d) {
                    const hours = d.getHours();
                    const dayOfWeek = d.getDay();
                    const isWknd = (dayOfWeek === 0 || dayOfWeek === 6);
                    
                    let logicalDate = new Date(p.tAdmision);
                    let label = '';
                    
                    if (isWknd) {
                      if (hours < 8) {
                        logicalDate.setDate(logicalDate.getDate() - 1);
                        label = 'Finde Noche';
                      } else if (hours >= 8 && hours < 20) {
                        label = 'Finde Día';
                      } else {
                        label = 'Finde Noche';
                      }
                    } else {
                      if (hours < 16) {
                        logicalDate.setDate(logicalDate.getDate() - 1);
                        label = 'Largo';
                      } else {
                        label = 'Largo';
                      }
                    }
                    const y = logicalDate.getFullYear();
                    const m = String(logicalDate.getMonth() + 1).padStart(2, '0');
                    const day = String(logicalDate.getDate()).padStart(2, '0');
                    turnoStr = `${day}/${m}/${y} (${label})`;
                  }
                  
                  return (
                    <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium text-secondary-custom">
                      <td className="p-3 font-semibold text-primary-custom">{dateStr} {timeStr}</td>
                      <td className="p-3 text-center font-bold text-slate-600 dark:text-slate-400">{turnoStr}</td>
                      <td className="p-3 text-center font-bold text-slate-600 dark:text-slate-400">
                        {p.correlativo || p.idPaciente || '-'}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          p.cat1Clean === 'c1' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                        }`}>
                          {p.cat1Clean.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-300 max-w-xs truncate" title={p.diagnosticoPrincipal}>
                        {p.diagnosticoPrincipal || '-'}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-500">{p.codigoDiagnostico || '-'}</td>
                      <td className="p-3 font-semibold text-primary-custom">{p.enf1 !== 'No Registrado' ? p.enf1 : '-'}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-secondary-custom text-xs font-semibold">
                    No se registraron atenciones críticas (C1/C2) para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETALLE DE DIAGNÓSTICO CLÍNICO C3 EN MODAL FLOTANTE (PEDIDO POR EL USUARIO) */}
      {selectedDiagDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-card-custom border border-card-custom rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[85vh] overflow-hidden theme-transition animate-fade-in relative">
            {/* Header */}
            <div className="p-5 border-b border-card-custom flex justify-between items-center bg-black/5 dark:bg-white/5">
              <div>
                <h3 className="text-sm font-black text-primary-custom uppercase tracking-wider">
                  Detalle de Pacientes C3: {selectedDiagDetail.code} - {selectedDiagDetail.name}
                </h3>
                <p className="text-[11px] text-secondary-custom font-semibold">
                  Se muestran todos los registros del periodo con este diagnóstico clínico ({pacientesDelDiag.length} atenciones).
                </p>
              </div>
              <button 
                onClick={() => setSelectedDiagDetail(null)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-secondary-custom rounded-xl transition-all"
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
                    <th className="p-3 text-center">ID / Correlativo (IP)</th>
                    <th className="p-3 text-center">Categoría</th>
                    <th className="p-3">Diagnóstico Médico</th>
                    <th className="p-3 text-center">Código Diagnóstico</th>
                    <th className="p-3">Enfermero(a) que Categorizó</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-custom text-xs">
                  {pacientesDelDiag.length > 0 ? (
                    pacientesDelDiag.map((p, idx) => {
                      const d = p.tAdmision ? new Date(p.tAdmision) : null;
                      const dateStr = d ? d.toLocaleDateString('es-CL') : '-';
                      const timeStr = d ? d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '-';
                      
                      // Calcular turno asociado
                      let turnoStr = '-';
                      if (d) {
                        const hours = d.getHours();
                        const dayOfWeek = d.getDay();
                        const isWknd = (dayOfWeek === 0 || dayOfWeek === 6);
                        
                        let logicalDate = new Date(p.tAdmision);
                        let label = '';
                        
                        if (isWknd) {
                          if (hours < 8) {
                            logicalDate.setDate(logicalDate.getDate() - 1);
                            label = 'Finde Noche';
                          } else if (hours >= 8 && hours < 20) {
                            label = 'Finde Día';
                          } else {
                            label = 'Finde Noche';
                          }
                        } else {
                          if (hours < 16) {
                            logicalDate.setDate(logicalDate.getDate() - 1);
                            label = 'Largo';
                          } else {
                            label = 'Largo';
                          }
                        }
                        const y = logicalDate.getFullYear();
                        const m = String(logicalDate.getMonth() + 1).padStart(2, '0');
                        const day = String(logicalDate.getDate()).padStart(2, '0');
                        turnoStr = `${day}/${m}/${y} (${label})`;
                      }
                      
                      return (
                        <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium text-secondary-custom">
                          <td className="p-3 font-semibold text-primary-custom">{dateStr} {timeStr}</td>
                          <td className="p-3 text-center font-bold text-slate-600 dark:text-slate-400">{turnoStr}</td>
                          <td className="p-3 text-center font-bold text-slate-600 dark:text-slate-400">
                            {p.correlativo || p.idPaciente || '-'}
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                              C3
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-700 dark:text-slate-300 max-w-xs truncate" title={p.diagnosticoPrincipal}>
                            {p.diagnosticoPrincipal || '-'}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-500">{p.codigoDiagnostico || '-'}</td>
                          <td className="p-3 font-semibold text-primary-custom">{p.enf1 !== 'No Registrado' ? p.enf1 : '-'}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-secondary-custom font-semibold">
                        No se encontraron registros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-card-custom flex justify-end bg-black/5 dark:bg-white/5">
              <button
                onClick={() => setSelectedDiagDetail(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-primary-custom text-xs font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
