import React, { useState, useMemo } from 'react';
import { Users, Search, Clock, Activity, Award, Heart, Shield, Globe, Building2, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import AnalisisSociodemografico from './AnalisisSociodemografico';
import MatrizCruzada from './MatrizCruzada';
import { formatTime } from '../../utils/helpers';

export default function PerfilPaciente({
  pacientesFiltrados = [],
  demografiaStats,
  rankingCentros
}) {
  const [localFilters, setLocalFilters] = useState({
    sexo: 'TODOS',
    prevision: 'TODOS',
    categoria: 'TODOS',
    comuna: 'TODOS'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filtrar pacientes según el perfil seleccionado
  const matchingPatients = useMemo(() => {
    return pacientesFiltrados.filter(p => {
      if (localFilters.sexo !== 'TODOS') {
        const pSexo = String(p.sexo || '').toUpperCase();
        if (localFilters.sexo === 'F' && !pSexo.includes('F')) return false;
        if (localFilters.sexo === 'M' && !pSexo.includes('M')) return false;
      }
      if (localFilters.prevision !== 'TODOS') {
        const pPrev = String(p.prevision || '').toUpperCase();
        if (!pPrev.includes(localFilters.prevision)) return false;
      }
      if (localFilters.categoria !== 'TODOS') {
        if (p.categoria !== localFilters.categoria) return false;
      }
      if (localFilters.comuna !== 'TODOS') {
        const isMeli = String(p.comuna || '').toUpperCase() === 'MELIPILLA';
        if (localFilters.comuna === 'MELIPILLA' && !isMeli) return false;
        if (localFilters.comuna === 'OTRAS' && isMeli) return false;
      }
      return true;
    });
  }, [pacientesFiltrados, localFilters]);

  // Calcular estadísticas para el perfil seleccionado
  const profileStats = useMemo(() => {
    const total = matchingPatients.length;
    if (total === 0) return { total: 0, avgEdad: '-', avgEspera: '-', avgEstadia: '-', topDiags: [] };

    let edadSum = 0, edadCount = 0;
    let esperaSum = 0, esperaCount = 0;
    let estadiaSum = 0, estadiaCount = 0;
    const diagsMap = {};

    matchingPatients.forEach(p => {
      if (p.edad !== null && p.edad !== undefined && p.edad >= 0) {
        edadSum += p.edad;
        edadCount++;
      }
      if (p.tAdmision && p.tCat1 && p.tCat1 >= p.tAdmision) {
        esperaSum += (p.tCat1 - p.tAdmision) / 60000;
        esperaCount++;
      }
      if (p.tAdmision && p.tAlta && p.tAlta >= p.tAdmision) {
        estadiaSum += (p.tAlta - p.tAdmision) / 60000;
        estadiaCount++;
      }
      const diag = p.diagnosticoPrincipal || p.codigoDiagnostico || 'No Registrado';
      diagsMap[diag] = (diagsMap[diag] || 0) + 1;
    });

    const topDiags = Object.entries(diagsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count, pct: ((count / total) * 100).toFixed(1) }));

    return {
      total,
      avgEdad: edadCount > 0 ? Math.round(edadSum / edadCount) + ' años' : '-',
      avgEspera: esperaCount > 0 ? Math.round(esperaSum / esperaCount) + ' min' : '-',
      avgEstadia: estadiaCount > 0 ? Math.round(estadiaSum / estadiaCount) + ' min' : '-',
      topDiags
    };
  }, [matchingPatients]);

  // Paginación
  const totalPages = Math.ceil(matchingPatients.length / itemsPerPage) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return matchingPatients.slice(start, start + itemsPerPage);
  }, [matchingPatients, currentPage, itemsPerPage]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in w-full px-2 md:px-6 pb-8 theme-transition">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card-custom p-6 rounded-3xl shadow-sm border border-card-custom">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-500/10 rounded-2xl text-indigo-500">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-primary-custom">Perfil del Paciente</h2>
            <p className="text-xs text-secondary-custom font-semibold mt-0.5">
              Analiza los aspectos sociodemográficos, previsionales y de origen territorial de los pacientes atendidos en el SAR.
            </p>
          </div>
        </div>
      </div>

      {/* BLOQUE 1: ANÁLISIS SOCIODEMOGRÁFICO Y ORIGEN */}
      {demografiaStats && rankingCentros && (
        <AnalisisSociodemografico 
          demografiaStats={demografiaStats} 
          rankingCentros={rankingCentros} 
        />
      )}

      {/* BLOQUE 2: EXPLORADOR INTERACTIVO DE PERFILES */}
      <div className="bg-card-custom rounded-[2rem] border border-card-custom p-6 md:p-8 shadow-sm flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-black text-primary-custom uppercase tracking-wider flex items-center gap-2">
            <Search className="w-4.5 h-4.5 text-indigo-500" /> Explorador Clínico de Perfiles de Paciente
          </h3>
          <p className="text-xs text-secondary-custom font-semibold mt-1">
            Filtra y cruza diferentes perfiles demográficos para conocer su comportamiento clínico y patologías más frecuentes.
          </p>
        </div>

        {/* Fila de Filtros del Perfil */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-card-custom/50">
          {/* Sexo */}
          <div>
            <label className="text-[10px] font-black text-secondary-custom uppercase tracking-wider block mb-1.5">Género</label>
            <select
              value={localFilters.sexo}
              onChange={(e) => handleFilterChange('sexo', e.target.value)}
              className="w-full text-xs font-bold bg-card-custom border border-card-custom rounded-xl p-2.5 outline-none text-primary-custom"
            >
              <option value="TODOS">Todos los géneros</option>
              <option value="F">Mujeres</option>
              <option value="M">Hombres</option>
            </select>
          </div>

          {/* Previsión */}
          <div>
            <label className="text-[10px] font-black text-secondary-custom uppercase tracking-wider block mb-1.5">Previsión Médica</label>
            <select
              value={localFilters.prevision}
              onChange={(e) => handleFilterChange('prevision', e.target.value)}
              className="w-full text-xs font-bold bg-card-custom border border-card-custom rounded-xl p-2.5 outline-none text-primary-custom"
            >
              <option value="TODOS">Todas las previsiones</option>
              <option value="FONASA">FONASA</option>
              <option value="ISAPRE">ISAPRE</option>
              <option value="PARTICULAR">PARTICULAR</option>
            </select>
          </div>

          {/* Categorización */}
          <div>
            <label className="text-[10px] font-black text-secondary-custom uppercase tracking-wider block mb-1.5">Clasificación Triaje</label>
            <select
              value={localFilters.categoria}
              onChange={(e) => handleFilterChange('categoria', e.target.value)}
              className="w-full text-xs font-bold bg-card-custom border border-card-custom rounded-xl p-2.5 outline-none text-primary-custom"
            >
              <option value="TODOS">Todas las clasificaciones</option>
              <option value="c1">C1 - Emergencia Vital</option>
              <option value="c2">C2 - Alta Complejidad</option>
              <option value="c3">C3 - Mediana Complejidad</option>
              <option value="c4">C4 - Baja Complejidad</option>
              <option value="c5">C5 - No Urgente</option>
            </select>
          </div>

          {/* Comuna */}
          <div>
            <label className="text-[10px] font-black text-secondary-custom uppercase tracking-wider block mb-1.5">Procedencia (Comuna)</label>
            <select
              value={localFilters.comuna}
              onChange={(e) => handleFilterChange('comuna', e.target.value)}
              className="w-full text-xs font-bold bg-card-custom border border-card-custom rounded-xl p-2.5 outline-none text-primary-custom"
            >
              <option value="TODOS">Todas las comunas</option>
              <option value="MELIPILLA">Melipilla</option>
              <option value="OTRAS">Otras Comunas</option>
            </select>
          </div>
        </div>

        {/* Tarjetas de Estadísticas del Perfil */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-card-custom bg-slate-50/50 dark:bg-white/5 p-4 rounded-2xl flex flex-col justify-center">
            <span className="text-[9px] font-black text-secondary-custom uppercase block">Muestra Filtrada</span>
            <p className="text-2xl font-black text-primary-custom leading-tight mt-1">{profileStats.total} <span className="text-xs font-bold text-secondary-custom">pac.</span></p>
            <span className="text-[9px] text-secondary-custom mt-1 font-semibold">Cumplen con el perfil</span>
          </div>

          <div className="border border-card-custom bg-slate-50/50 dark:bg-white/5 p-4 rounded-2xl flex flex-col justify-center">
            <span className="text-[9px] font-black text-secondary-custom uppercase block">Edad Promedio</span>
            <p className="text-2xl font-black text-indigo-500 leading-tight mt-1">{profileStats.avgEdad}</p>
            <span className="text-[9px] text-secondary-custom mt-1 font-semibold">Media del segmento</span>
          </div>

          <div className="border border-card-custom bg-slate-50/50 dark:bg-white/5 p-4 rounded-2xl flex flex-col justify-center">
            <span className="text-[9px] font-black text-secondary-custom uppercase block">Espera Promedio</span>
            <p className="text-2xl font-black text-amber-500 leading-tight mt-1">{profileStats.avgEspera}</p>
            <span className="text-[9px] text-secondary-custom mt-1 font-semibold">Admisión a Triaje</span>
          </div>

          <div className="border border-card-custom bg-slate-50/50 dark:bg-white/5 p-4 rounded-2xl flex flex-col justify-center">
            <span className="text-[9px] font-black text-secondary-custom uppercase block">Estadía Promedio</span>
            <p className="text-2xl font-black text-emerald-500 leading-tight mt-1">{profileStats.avgEstadia}</p>
            <span className="text-[9px] text-secondary-custom mt-1 font-semibold">Ingreso a Alta Box</span>
          </div>
        </div>

        {/* Diagnósticos Principales del Perfil */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-card-custom">
          <h4 className="text-[10px] font-black text-secondary-custom uppercase tracking-widest mb-3">Principales Diagnósticos en este Perfil</h4>
          {profileStats.topDiags.length > 0 ? (
            <div className="space-y-2">
              {profileStats.topDiags.map((diag, index) => (
                <div key={index} className="flex justify-between items-center text-xs font-bold text-secondary-custom bg-card-custom border border-card-custom rounded-xl p-2.5 shadow-sm">
                  <span className="truncate max-w-[85%]">{index + 1}. {diag.name}</span>
                  <span className="font-black text-primary-custom">{diag.pct}% ({diag.count} pac.)</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-secondary-custom italic text-center py-2">Sin diagnósticos registrados para este perfil.</p>
          )}
        </div>

        {/* Tabla de Listado de Pacientes */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-black text-secondary-custom uppercase tracking-widest">Registros Coincidentes</h4>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                disabled={currentPage === 1}
                className="p-1.5 bg-slate-100 dark:bg-white/5 text-secondary-custom hover:text-primary-custom rounded-lg disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-secondary-custom bg-slate-50 dark:bg-slate-950 px-3 py-1 rounded-lg border border-card-custom">
                {currentPage} de {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                disabled={currentPage === totalPages}
                className="p-1.5 bg-slate-100 dark:bg-white/5 text-secondary-custom hover:text-primary-custom rounded-lg disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-card-custom rounded-2xl">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-secondary-custom font-black uppercase tracking-wider border-b border-card-custom">
                  <th className="p-3">Edad / Sexo</th>
                  <th className="p-3">Previsión</th>
                  <th className="p-3 text-center">Clasificación</th>
                  <th className="p-3">Establecimiento Origen</th>
                  <th className="p-3">Diagnóstico Principal</th>
                  <th className="p-3 text-center">T. Espera</th>
                  <th className="p-3 text-center">T. Estadía</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPatients.length > 0 ? (
                  paginatedPatients.map((p, idx) => {
                    const esperaMin = (p.tAdmision && p.tCat1 && p.tCat1 >= p.tAdmision) ? Math.round((p.tCat1 - p.tAdmision) / 60000) : null;
                    const estadiaMin = (p.tAdmision && p.tAlta && p.tAlta >= p.tAdmision) ? Math.round((p.tAlta - p.tAdmision) / 60000) : null;
                    
                    return (
                      <tr key={p.id || idx} className="border-b border-card-custom/50 hover:bg-black/5 dark:hover:bg-white/5 transition font-semibold text-secondary-custom">
                        <td className="p-3">
                          <div className="font-bold text-primary-custom">{p.edad !== null ? p.edad + ' años' : 'Edad N/R'}</div>
                          <div className="text-[9.5px] uppercase tracking-wider mt-0.5">{p.sexo || '-'}</div>
                        </td>
                        <td className="p-3 uppercase text-[10.5px] font-black">{p.prevision || 'N/R'}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-block border ${
                            p.categoria === 'c1' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            p.categoria === 'c2' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                            p.categoria === 'c3' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                            p.categoria === 'c4' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            p.categoria === 'c5' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                            'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {p.categoria || 'S/C'}
                          </span>
                        </td>
                        <td className="p-3 truncate max-w-[150px] uppercase text-[10px]" title={p.establecimiento}>{p.establecimiento || 'No Registrado'}</td>
                        <td className="p-3 truncate max-w-[200px]" title={p.diagnosticoPrincipal}>{p.diagnosticoPrincipal || 'No Registrado'}</td>
                        <td className="p-3 text-center font-black text-amber-500">{esperaMin !== null ? esperaMin + 'm' : '-'}</td>
                        <td className="p-3 text-center font-black text-emerald-500">{estadiaMin !== null ? estadiaMin + 'm' : '-'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-secondary-custom italic bg-slate-50/20 dark:bg-white/5">
                      No hay pacientes registrados con este perfil de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BLOQUE 3: MATRIZ CRUZADA */}
      <MatrizCruzada pacientesFiltrados={pacientesFiltrados} />
    </div>
  );
}
