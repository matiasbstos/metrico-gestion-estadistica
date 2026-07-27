import React, { useMemo, useState } from 'react';
import { 
  ShieldAlert, Users, Calendar, MapPin, Activity, Clock, FileSpreadsheet, Filter, CheckCircle2 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell 
} from 'recharts';
import InfoTooltip from '../InfoTooltip';

export default function AnalisisConstataciones({ pacientesFiltrados, pacientesDB, turnosDB, filtroFechaInicio, filtroFechaFin }) {
  const [filtroSexo, setFiltroSexo] = useState('TODOS');
  const [filtroComuna, setFiltroComuna] = useState('TODOS');

  // 1. Obtener la lista base de pacientes del período
  const targetPacientes = useMemo(() => {
    if (pacientesFiltrados && pacientesFiltrados.length > 0) {
      return pacientesFiltrados;
    }
    const lotesVisibles = new Set(turnosDB.filter(t => {
      if (filtroFechaInicio && t.fechaInicio < filtroFechaInicio) return false;
      if (filtroFechaFin && t.fechaFin > filtroFechaFin) return false;
      return true;
    }).map(t => t.loteId));

    return pacientesDB.filter(p => lotesVisibles.has(p.loteId));
  }, [pacientesFiltrados, pacientesDB, turnosDB, filtroFechaInicio, filtroFechaFin]);

  // Helper oficial para Constataciones Z51.8 (Z51.8 + Z518)
  const isConstatacionOficial = (p) => {
    if (!p) return false;
    if (p.categoria === 'c3_z518') return true;
    const cod = String(p.codigoDiagnostico || p.diagnostico || '').toUpperCase();
    const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
    return cod.includes('Z51.8') || cod.includes('Z518') || diag.includes('CONSTATAC');
  };

  // 2. Extraer los pacientes con Constataciones Z51.8 Oficiales (241 pac)
  const pacientesLesiones = useMemo(() => {
    return targetPacientes.filter(p => {
      if (!isConstatacionOficial(p)) return false;

      // Filtros locales
      if (filtroSexo !== 'TODOS') {
        const s = String(p.sexo || '').toUpperCase();
        if (filtroSexo === 'M' && !(s.includes('HOMBRE') || s.includes('MASCULINO') || s === 'M')) return false;
        if (filtroSexo === 'F' && !(s.includes('MUJER') || s.includes('FEMENINO') || s === 'F')) return false;
      }

      if (filtroComuna !== 'TODOS') {
        const com = String(p.comuna || '').toUpperCase();
        if (!com.includes(filtroComuna)) return false;
      }

      return true;
    });
  }, [targetPacientes, filtroSexo, filtroComuna]);

  // Desglose lateral numérico por sub-variables asociadas (Z51.8 y Z04)
  const desgloseSubVariables = useMemo(() => {
    let lesionesDirectas = 0;
    let circunstanciasLegales = 0;
    let agresiones = 0;
    let mencionesPoliciales = 0;

    targetPacientes.forEach(p => {
      const cod = String(p.codigoDiagnostico || p.diagnostico || '').toUpperCase();
      const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
      
      const isZ51orZ04 = cod.includes('Z51') || cod.includes('Z04') || isConstatacionOficial(p);
      if (isZ51orZ04) {
        if (cod.includes('Z51') || diag.includes('LESIÓ') || diag.includes('LESION') || diag.includes('CONSTATAC')) lesionesDirectas++;
        if (diag.includes('CIRCUNSTANCIAS LEGALES') || diag.includes('LEGAL')) circunstanciasLegales++;
        if (diag.includes('AGRESIÓ') || diag.includes('AGRESION')) agresiones++;
        if (diag.includes('POLICIAL') || diag.includes('CARABINERO') || diag.includes('PDI') || cod.includes('Z04')) mencionesPoliciales++;
      }
    });

    return {
      lesionesDirectas,
      circunstanciasLegales,
      agresiones,
      mencionesPoliciales
    };
  }, [targetPacientes]);

  // Conteo de conciliación de códigos CIE-10 (Z51.8, Z518, Z04 y Glosas)
  const desgloseCodigosCIE10 = useMemo(() => {
    let z518ConPunto = 0;
    let z518SinPunto = 0;
    let z04ExamenesLegales = 0;
    let glosasSinCodigo = 0;

    targetPacientes.forEach(p => {
      const cod = String(p.codigoDiagnostico || p.diagnostico || '').toUpperCase().trim();
      const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase().trim();
      
      const isZ518ConPunto = cod.includes('Z51.8');
      const isZ518SinPunto = !isZ518ConPunto && (cod.includes('Z518') || cod === 'Z518');
      const isZ04 = cod.includes('Z04');
      const isGlosaTextual = (diag.includes('CONSTATAC') || diag.includes('LESIÓN') || diag.includes('LESION')) && !isZ518ConPunto && !isZ518SinPunto && !isZ04;

      if (isZ518ConPunto) z518ConPunto++;
      else if (isZ518SinPunto) z518SinPunto++;
      else if (isZ04) z04ExamenesLegales++;
      else if (isGlosaTextual) glosasSinCodigo++;
    });

    return {
      z518ConPunto,
      z518SinPunto,
      totalZ518: z518ConPunto + z518SinPunto,
      z04ExamenesLegales,
      glosasSinCodigo,
      totalExtendido: z518ConPunto + z518SinPunto + z04ExamenesLegales + glosasSinCodigo
    };
  }, [targetPacientes]);

  // Total pacientes evaluados C3 en el periodo (para calcular la tasa)
  const totalEvaluadosC3 = useMemo(() => {
    return targetPacientes.filter(p => {
      const cat = String(p.categoria || '').toLowerCase();
      return cat === 'c3' || cat === 'c3_z518' || isConstatacionOficial(p);
    }).length;
  }, [targetPacientes]);

  // Comunas únicas disponibles para el selector
  const comunasDisponibles = useMemo(() => {
    const setC = new Set();
    targetPacientes.forEach(p => {
      if (p.comuna) {
        setC.add(String(p.comuna).toUpperCase().trim());
      }
    });
    return Array.from(setC).sort();
  }, [targetPacientes]);

  // 3. Métricas y KPIs Generales (Cantidades Absolutas)
  const statsGenerales = useMemo(() => {
    const total = pacientesLesiones.length;
    let hombres = 0, mujeres = 0, otrosSexo = 0;
    const porComuna = {};
    const porRangoEdad = { '0-14': 0, '15-29': 0, '30-59': 0, '60+': 0, 'Desconocido': 0 };

    pacientesLesiones.forEach(p => {
      // Sexo
      const s = String(p.sexo || '').toUpperCase();
      if (s.includes('MUJER') || s.includes('FEMENINO') || s === 'F') mujeres++;
      else if (s.includes('HOMBRE') || s.includes('MASCULINO') || s === 'M') hombres++;
      else otrosSexo++;

      // Comuna
      const com = String(p.comuna || 'DESCONOCIDA').toUpperCase().trim();
      porComuna[com] = (porComuna[com] || 0) + 1;

      // Edad
      if (p.edad === null || p.edad === undefined || isNaN(p.edad)) {
        porRangoEdad['Desconocido']++;
      } else if (p.edad <= 14) {
        porRangoEdad['0-14']++;
      } else if (p.edad <= 29) {
        porRangoEdad['15-29']++;
      } else if (p.edad <= 59) {
        porRangoEdad['30-59']++;
      } else {
        porRangoEdad['60+']++;
      }
    });

    const topComunaArr = Object.entries(porComuna).sort((a,b) => b[1] - a[1])[0];
    const topComuna = topComunaArr ? topComunaArr[0] : 'N/A';
    const topComunaCount = topComunaArr ? topComunaArr[1] : 0;

    const pctC3 = totalEvaluadosC3 > 0 ? ((total / totalEvaluadosC3) * 100).toFixed(1) : '0';

    return {
      total,
      hombres,
      mujeres,
      otrosSexo,
      porComuna,
      porRangoEdad,
      topComuna,
      topComunaCount,
      pctC3
    };
  }, [pacientesLesiones, totalEvaluadosC3]);

  // 4. Matriz Cruzada 1: Sexo vs. Rango Etario (Cantidades)
  const matrizEdadSexo = useMemo(() => {
    const rangos = ['0-14', '15-29', '30-59', '60+'];
    const data = rangos.map(r => ({
      rango: r,
      Mujeres: 0,
      Hombres: 0,
      Otros: 0,
      Total: 0
    }));

    pacientesLesiones.forEach(p => {
      let keyR = '30-59';
      if (p.edad !== null && !isNaN(p.edad)) {
        if (p.edad <= 14) keyR = '0-14';
        else if (p.edad <= 29) keyR = '15-29';
        else if (p.edad <= 59) keyR = '30-59';
        else keyR = '60+';
      }

      const item = data.find(d => d.rango === keyR);
      if (item) {
        const s = String(p.sexo || '').toUpperCase();
        if (s.includes('MUJER') || s.includes('FEMENINO') || s === 'F') item.Mujeres++;
        else if (s.includes('HOMBRE') || s.includes('MASCULINO') || s === 'M') item.Hombres++;
        else item.Otros++;
        item.Total++;
      }
    });

    return data;
  }, [pacientesLesiones]);

  // 5. Matriz Cruzada 2: Comuna vs. Sexo (Top Comunas)
  const matrizComunaSexo = useMemo(() => {
    const comunasMap = {};
    pacientesLesiones.forEach(p => {
      const com = String(p.comuna || 'DESCONOCIDA').toUpperCase().trim();
      if (!comunasMap[com]) comunasMap[com] = { comuna: com, Mujeres: 0, Hombres: 0, Otros: 0, Total: 0 };
      
      const s = String(p.sexo || '').toUpperCase();
      if (s.includes('MUJER') || s.includes('FEMENINO') || s === 'F') comunasMap[com].Mujeres++;
      else if (s.includes('HOMBRE') || s.includes('MASCULINO') || s === 'M') comunasMap[com].Hombres++;
      else comunasMap[com].Otros++;
      comunasMap[com].Total++;
    });

    return Object.values(comunasMap).sort((a,b) => b.Total - a.Total);
  }, [pacientesLesiones]);

  return (
    <div className="w-full space-y-6 animate-fade-in">
      
      {/* CABECERA DE MÓDULO */}
      <div className="bg-gradient-to-r from-amber-600 to-yellow-600 p-6 rounded-2xl text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
            <ShieldAlert className="w-8 h-8 text-yellow-100" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Análisis de Constataciones de Lesiones (Z51.8)</h2>
            <p className="text-xs text-amber-100 mt-1 font-medium">
              Desglose cuantitativo e interacciones entre sexo, grupos etarios y comuna de residencia.
            </p>
          </div>
        </div>

        {/* FILTROS RÁPIDOS LOCALES */}
        <div className="flex flex-wrap items-center gap-3 bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-200" />
            <span className="text-xs font-bold text-amber-100">Filtros:</span>
          </div>

          <select 
            value={filtroSexo} 
            onChange={e => setFiltroSexo(e.target.value)}
            className="bg-white/90 text-slate-800 text-xs font-bold p-1.5 rounded-lg outline-none cursor-pointer"
          >
            <option value="TODOS">Todos los Sexos</option>
            <option value="H">Hombres</option>
            <option value="F">Mujeres</option>
          </select>

          <select 
            value={filtroComuna} 
            onChange={e => setFiltroComuna(e.target.value)}
            className="bg-white/90 text-slate-800 text-xs font-bold p-1.5 rounded-lg outline-none cursor-pointer max-w-[150px] truncate"
          >
            <option value="TODOS">Todas las Comunas</option>
            {comunasDisponibles.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {(filtroSexo !== 'TODOS' || filtroComuna !== 'TODOS') && (
            <button 
              onClick={() => { setFiltroSexo('TODOS'); setFiltroComuna('TODOS'); }}
              className="text-[11px] font-bold text-amber-200 hover:text-white underline ml-1"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* TARJETAS KPI DE CANTIDADES ABSOLUTAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Constataciones</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100">Z51.8</span>
          </div>
          <div className="my-1">
            <span className="text-3xl font-black text-slate-800">{statsGenerales.total}</span>
            <span className="text-xs font-bold text-slate-400 ml-1.5">pacientes</span>
          </div>
          <span className="text-[10px] font-medium text-slate-500">
            Representa el <strong className="text-amber-600 font-bold">{statsGenerales.pctC3}%</strong> del total evaluados C3.
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Distribución por Sexo</span>
          <div className="flex justify-between items-baseline my-1">
            <div>
              <span className="text-2xl font-black text-blue-600">{statsGenerales.hombres}</span>
              <span className="text-[11px] font-bold text-slate-400 ml-1">H</span>
            </div>
            <div className="text-slate-300">|</div>
            <div>
              <span className="text-2xl font-black text-pink-500">{statsGenerales.mujeres}</span>
              <span className="text-[11px] font-bold text-slate-400 ml-1">M</span>
            </div>
          </div>
          <span className="text-[10px] font-medium text-slate-500">
            {statsGenerales.hombres >= statsGenerales.mujeres ? 'Mayoría de varones atendidos' : 'Mayoría de mujeres atendidas'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grupo Etario Principal</span>
          <div className="my-1">
            <span className="text-2xl font-black text-amber-600">
              {Object.entries(statsGenerales.porRangoEdad).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'N/A'}
            </span>
            <span className="text-xs font-bold text-slate-500 ml-2">
              ({Object.entries(statsGenerales.porRangoEdad).sort((a,b)=>b[1]-a[1])[0]?.[1] || 0} pac)
            </span>
          </div>
          <span className="text-[10px] font-medium text-slate-500">
            Rango de mayor concentración
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comuna con Mayor Frecuencia</span>
          <div className="my-1 truncate">
            <span className="text-xl font-black text-indigo-600 uppercase">{statsGenerales.topComuna}</span>
            <p className="text-xs font-bold text-slate-500">{statsGenerales.topComunaCount} casos registrados</p>
          </div>
          <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-indigo-400" /> Principal origen territorial
          </span>
        </div>

      </div>

      {/* SECCIÓN DE DESGLOSE LATERAL DE VARIABLES ADICIONALES (Z51.8 y Z04) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-black tracking-wide uppercase text-slate-800">
              Desglose de Variables Clínico-Legales Asociadas (Códigos CIE-10 Z51.8 y Z04)
            </h3>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Encasillamiento Cuantitativo por Descriptores
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">(a) Lesiones Directas</span>
            <div className="text-2xl font-black text-amber-900 mt-1">
              {desgloseSubVariables.lesionesDirectas} <span className="text-xs font-bold text-amber-700">pac.</span>
            </div>
            <p className="text-[10px] text-amber-700 font-medium mt-1">Constatación de lesiones física general.</p>
          </div>

          <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">(b) Circunstancias Legales</span>
            <div className="text-2xl font-black text-indigo-900 mt-1">
              {desgloseSubVariables.circunstanciasLegales} <span className="text-xs font-bold text-indigo-700">pac.</span>
            </div>
            <p className="text-[10px] text-indigo-700 font-medium mt-1">Consultas motivadas por requerimientos legales.</p>
          </div>

          <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">(c) Agresión / Violencia</span>
            <div className="text-2xl font-black text-rose-900 mt-1">
              {desgloseSubVariables.agresiones} <span className="text-xs font-bold text-rose-700">pac.</span>
            </div>
            <p className="text-[10px] text-rose-700 font-medium mt-1">Registros de lesiones por terceros/agresión.</p>
          </div>

          <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">(d) Mención Policial / Judicial</span>
            <div className="text-2xl font-black text-sky-900 mt-1">
              {desgloseSubVariables.mencionesPoliciales} <span className="text-xs font-bold text-sky-700">pac.</span>
            </div>
            <p className="text-[10px] text-sky-700 font-medium mt-1">Intervención o presencia policial referenciada.</p>
          </div>
        </div>
      </div>

      {/* CUADRO EXPLICATIVO DE CONCILIACIÓN DE CÓDIGOS CIE-10 (Z51.8 vs Z518 vs Z04) */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-black tracking-wide uppercase text-slate-800">
              Conciliación y Origen de Cifras por Codificación Clínico-Estadística
            </h3>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            Transparencia Metodológica Métrico
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 uppercase">1. Z51.8 Oficial Pura</span>
              <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{statsGenerales.total} pac.</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Comprende a los pacientes categorizados bajo código directo <strong>Z51.8</strong> ({desgloseCodigosCIE10.z518ConPunto} pac. con punto + {desgloseCodigosCIE10.z518SinPunto} pac. registro Z518) o diagnóstico explícito de constatación. Es la <strong>cifra oficial estándar de Métrico</strong>.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 uppercase">2. Exámenes Legales / Z04</span>
              <span className="text-xs font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">{desgloseCodigosCIE10.z04ExamenesLegales} pac.</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Atenciones registradas bajo código <strong>Z04 / Z04.1 - Z04.8</strong> (Examen y observación por agresión, hecho de tránsito u orden de autoridad). Se analizan como grupo complementario.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 uppercase">3. Acumulado Anual (YTD)</span>
              <span className="text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">310 pac.</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              La cifra de <strong>310</strong> reflejada en la tarjeta YTD de Inicio corresponde a la <strong>suma histórica consolidada por turnos en la base de datos de todo el año a la fecha</strong> (01/01 al 23/07/2026).
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE MATRICES CRUZADAS E INTERACCIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TABLA 1: INTERACCIÓN RANGO ETARIO VS SEXO */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" /> Matriz Cruzada: Grupo Etario vs. Sexo
                <InfoTooltip text="Muestra la cantidad exacta de constataciones de lesiones desglosadas por rango etario y sexo." />
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold text-xs border-b border-slate-200">
                    <th className="p-3">Rango de Edad</th>
                    <th className="p-3 text-center text-pink-600">Mujeres</th>
                    <th className="p-3 text-center text-blue-600">Hombres</th>
                    <th className="p-3 text-center text-amber-600 font-black">Total Pac.</th>
                    <th className="p-3 text-right">% Relativo</th>
                  </tr>
                </thead>
                <tbody>
                  {matrizEdadSexo.map(row => {
                    const pct = statsGenerales.total > 0 ? ((row.Total / statsGenerales.total) * 100).toFixed(1) : '0';
                    return (
                      <tr key={row.rango} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 font-bold text-slate-700">{row.rango} años</td>
                        <td className="p-3 text-center font-bold text-pink-500">{row.Mujeres}</td>
                        <td className="p-3 text-center font-bold text-blue-600">{row.Hombres}</td>
                        <td className="p-3 text-center font-black text-slate-800 bg-amber-50/50">{row.Total}</td>
                        <td className="p-3 text-right font-bold text-slate-500">{pct}%</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-100 font-black text-slate-800 text-xs">
                    <td className="p-3">TOTAL GLOBAL</td>
                    <td className="p-3 text-center text-pink-600">{statsGenerales.mujeres}</td>
                    <td className="p-3 text-center text-blue-600">{statsGenerales.hombres}</td>
                    <td className="p-3 text-center text-amber-700 bg-amber-100">{statsGenerales.total}</td>
                    <td className="p-3 text-right">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* MINIGRÁFICO BARRAS PARA EDAD Y SEXO */}
          <div className="h-48 mt-6 pt-4 border-t border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={matrizEdadSexo} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="rango" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Mujeres" fill="#ec4899" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Hombres" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TABLA 2: INTERACCIÓN COMUNA VS SEXO */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-500" /> Matriz Cruzada: Comuna de Residencia vs. Sexo
                <InfoTooltip text="Desglose de constataciones por lugar de residencia del paciente." />
              </h3>
            </div>

            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 shadow-sm">
                  <tr className="text-slate-600 font-bold text-xs border-b border-slate-200">
                    <th className="p-3">Comuna</th>
                    <th className="p-3 text-center text-pink-600">Mujeres</th>
                    <th className="p-3 text-center text-blue-600">Hombres</th>
                    <th className="p-3 text-center text-slate-800 font-black">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {matrizComunaSexo.map(row => (
                    <tr key={row.comuna} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        {row.comuna}
                      </td>
                      <td className="p-3 text-center font-bold text-pink-500">{row.Mujeres}</td>
                      <td className="p-3 text-center font-bold text-blue-600">{row.Hombres}</td>
                      <td className="p-3 text-center font-black text-indigo-600 bg-indigo-50/40">{row.Total}</td>
                    </tr>
                  ))}
                  {matrizComunaSexo.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-slate-400">No hay registros para este filtro.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
            <span>Comunas registradas: <strong>{matrizComunaSexo.length}</strong></span>
            <span className="font-bold text-amber-600">Todas las cantidades representan casos absolutos.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
