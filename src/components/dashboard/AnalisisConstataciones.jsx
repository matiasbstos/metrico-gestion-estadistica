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

  // Helper para verificar código estricto Z51.8 / c3_z518 (186 casos base)
  const isStrictZ518 = (p) => {
    if (!p) return false;
    if (p.categoria === 'c3_z518') return true;
    const cod = String(p.codigoDiagnostico || p.diagnostico || '').toUpperCase();
    const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
    return cod.includes('Z51.8') || cod.includes('Z518');
  };

  // Helper para verificar casos extendidos (Z04, Agresiones, Policial, Legales)
  const isExtendedCase = (p) => {
    if (!p) return false;
    const cod = String(p.codigoDiagnostico || p.diagnostico || '').toUpperCase();
    const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
    return cod.includes('Z04') ||
           diag.includes('CONSTATAC') || diag.includes('LESIÓN') || diag.includes('LESION') ||
           diag.includes('CIRCUNSTANCIAS LEGALES') || diag.includes('POLICIAL') ||
           diag.includes('AGRESIÓN') || diag.includes('AGRESION');
  };

  // Helper para clasificar coincidencia por destino policial / carabineros
  const isMatchDestinoPolicial = (p) => {
    const d = String(p.destinoAlta || p.destino || '').toUpperCase();
    return d.includes('COMISAR') || d.includes('CARABINER') || d.includes('PDI') || 
           d.includes('POLIC') || d.includes('CUSTODIA') || d.includes('JUZGADO') || d.includes('TRIBUNAL');
  };

  // 2. Extraer los pacientes con Z51.8 Estricto (Oficial 186)
  const pacientesLesiones = useMemo(() => {
    return targetPacientes.filter(p => {
      if (!isStrictZ518(p)) return false;

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

  // Auditoría complementaria de casos secundarios (Z04 / Legales = 87 adicionales)
  const auditoriaCasosSecundarios = useMemo(() => {
    const secundario = targetPacientes.filter(p => isExtendedCase(p) && !isStrictZ518(p));
    let matchPolicialCount = 0;
    let altaMedicaCount = 0;

    secundario.forEach(p => {
      if (isMatchDestinoPolicial(p)) matchPolicialCount++;
      else altaMedicaCount++;
    });

    return {
      totalSecundarios: secundario.length,
      matchPolicialCount,
      altaMedicaCount,
      secundarioList: secundario
    };
  }, [targetPacientes]);

  // Total pacientes evaluados C3 en el periodo (para calcular la tasa)
  const totalEvaluadosC3 = useMemo(() => {
    return targetPacientes.filter(p => {
      const cat = String(p.categoria || '').toLowerCase();
      return cat === 'c3' || cat === 'c3_z518' || isStrictZ518(p);
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

      {/* SECCIÓN DE AUDITORÍA Y MATCH POR DESTINO POLICIAL */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-black tracking-wide uppercase text-slate-800">
              Auditoría por Destino y Casos Complementarios (Z04 / Agresiones / Legales)
            </h3>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Regla de Match por Destino Policial
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Oficial Z51.8 Estricto
            </span>
            <div className="text-2xl font-black text-emerald-800 mt-1">
              {statsGenerales.total} <span className="text-xs font-bold text-emerald-600">pacientes</span>
            </div>
            <p className="text-[10px] text-emerald-700 font-medium mt-1">
              Cifra oficial Z51.8 reflejada en Inicio y Subreportes (186 pac).
            </p>
          </div>

          <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
              Match Policial / Carabineros (Z04 / Legales)
            </span>
            <div className="text-2xl font-black text-sky-800 mt-1">
              {auditoriaCasosSecundarios.matchPolicialCount} <span className="text-xs font-bold text-sky-600">pacientes</span>
            </div>
            <p className="text-[10px] text-sky-700 font-medium mt-1">
              Destino verificado con Comisaría, Carabineros o Custodia.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Alta Médica Domiciliaria / Consulta
            </span>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {auditoriaCasosSecundarios.altaMedicaCount} <span className="text-xs font-bold text-slate-500">pacientes</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-1">
              Diagnósticos con destino Alta Domicilio o Servicio Urgencia.
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
