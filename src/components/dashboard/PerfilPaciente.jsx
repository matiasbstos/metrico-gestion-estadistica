import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Clock, Activity, Award, Heart, Shield, Globe, 
  Building2, ChevronLeft, ChevronRight, HelpCircle, Printer, FileText,
  PieChart as PieChartIcon, BarChart2, Stethoscope, Filter, Sparkles, AlertCircle,
  Maximize2, Minimize2, Tv, Presentation, X
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, 
  PieChart, Pie, Cell, CartesianGrid 
} from 'recharts';
import PerfilPoblacionalReporte from './PerfilPoblacionalReporte';

// 17 Tramos Etarios Quinquenales Oficiales
const TRAMOS_QUINQUENALES = [
  '0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', 
  '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'
];

// Colores para Gráfico de Anillo Previsional
const PREVISION_COLORS = {
  'FONASA A': '#10b981',
  'FONASA B': '#059669',
  'FONASA C': '#047857',
  'FONASA D': '#065f46',
  'ISAPRE': '#3b82f6',
  'PARTICULAR': '#f59e0b',
  'DIPRECA/CAPREDENA': '#8b5cf6',
  'OTRAS / SIN PREVISIÓN': '#64748b'
};

export default function PerfilPaciente({
  pacientesFiltrados = [],
  demografiaStats,
  rankingCentros
}) {
  // Filtros del Arquetipo Poblacional
  const [tramoFuncional, setTramoFuncional] = useState('TODOS');
  const [sexoFilter, setSexoFilter] = useState('TODOS');
  const [previsionFilter, setPrevisionFilter] = useState('TODOS');

  // Estado del Modo Presentación (Modo Directorio Kiosco)
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  // Activar Modo Presentación con Fullscreen API
  const enterPresentationMode = () => {
    setIsPresentationMode(true);
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}
  };

  // Salir de Modo Presentación
  const exitPresentationMode = () => {
    setIsPresentationMode(false);
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
  };

  // Listener para la tecla ESC (Escape)
  useEffect(() => {
    const handleKeyDown = (evt) => {
      if (evt.key === 'Escape' && isPresentationMode) {
        exitPresentationMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode]);

  // Función para clasificar edad en tramo etario funcional
  const getTramoFuncional = (edad) => {
    if (edad === null || edad === undefined || isNaN(edad)) return 'DESCONOCIDO';
    if (edad <= 14) return 'INFANTIL';
    if (edad <= 29) return 'ADULTO_JOVEN';
    if (edad <= 64) return 'ADULTO';
    return 'ADULTO_MAYOR';
  };

  // Función para clasificar edad en los 17 tramos quinquenales
  const getTramoQuinquenal = (edad) => {
    if (edad === null || edad === undefined || isNaN(edad)) return null;
    if (edad >= 80) return '80+';
    const floor = Math.floor(edad / 5) * 5;
    return `${floor}-${floor + 4}`;
  };

  // Filtrado de pacientes según Arquetipo Activo
  const matchingPatients = useMemo(() => {
    return pacientesFiltrados.filter(p => {
      // Filtro por Tramo Etario Funcional
      if (tramoFuncional !== 'TODOS') {
        const tf = getTramoFuncional(p.edad);
        if (tf !== tramoFuncional) return false;
      }

      // Filtro por Sexo
      if (sexoFilter !== 'TODOS') {
        const pSexo = String(p.sexo || '').toUpperCase();
        if (sexoFilter === 'F' && !pSexo.includes('F')) return false;
        if (sexoFilter === 'M' && !pSexo.includes('M')) return false;
      }

      // Filtro por Previsión
      if (previsionFilter !== 'TODOS') {
        const pPrev = String(p.prevision || '').toUpperCase();
        if (previsionFilter === 'FONASA' && !pPrev.includes('FONASA')) return false;
        if (previsionFilter === 'ISAPRE' && !pPrev.includes('ISAPRE')) return false;
        if (previsionFilter === 'PARTICULAR' && !pPrev.includes('PARTICULAR')) return false;
      }

      return true;
    });
  }, [pacientesFiltrados, tramoFuncional, sexoFilter, previsionFilter]);

  // CÁLCULO DE MÉTRICAS E INDICADORES MACRO DEL ARQUETIPO
  const profileStats = useMemo(() => {
    const total = matchingPatients.length;
    if (total === 0) {
      return { total: 0, avgEdad: '-', avgEspera: '-', avgEstadia: '-', topCie10: [] };
    }

    let edadSum = 0, edadCount = 0;
    let esperaSum = 0, esperaCount = 0;
    let estadiaSum = 0, estadiaCount = 0;
    const cie10Map = {};

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

      // Extraer Código y Nombre CIE-10
      const code = String(p.codigo_diagnostico_cie10 || p.codigoDiagnostico || p.cie10 || 'Z00').toUpperCase().trim();
      const desc = String(p.diagnostico_cie10 || p.diagnosticoPrincipal || p.diagnostico || 'Diagnóstico No Especificado').trim();
      
      const key = `${code}___${desc}`;
      cie10Map[key] = (cie10Map[key] || 0) + 1;
    });

    // Top 5 Dinámico CIE-10 con badges
    const topCie10 = Object.entries(cie10Map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, count]) => {
        const [code, name] = key.split('___');
        return {
          code: code || 'N/A',
          name: name || 'Diagnóstico Sin Especificar',
          count,
          pct: ((count / total) * 100).toFixed(1)
        };
      });

    return {
      total,
      avgEdad: edadCount > 0 ? Math.round(edadSum / edadCount) + ' años' : '-',
      avgEspera: esperaCount > 0 ? Math.round(esperaSum / esperaCount) + ' min' : '-',
      avgEstadia: estadiaCount > 0 ? Math.round(estadiaSum / estadiaCount) + ' min' : '-',
      topCie10
    };
  }, [matchingPatients]);

  // CONSTRUCCIÓN DE LA PIRÁMIDE POBLACIONAL (BarChart Sexo vs 17 Tramos Quinquenales)
  const piramideData = useMemo(() => {
    const map = {};
    TRAMOS_QUINQUENALES.forEach(t => {
      map[t] = { tramo: t, Hombres: 0, Mujeres: 0, Total: 0 };
    });

    matchingPatients.forEach(p => {
      const t = getTramoQuinquenal(p.edad);
      if (t && map[t]) {
        const pSexo = String(p.sexo || '').toUpperCase();
        if (pSexo.includes('F')) {
          map[t].Mujeres += 1;
        } else {
          map[t].Hombres += 1;
        }
        map[t].Total += 1;
      }
    });

    return Object.values(map);
  }, [matchingPatients]);

  // CONSTRUCCIÓN DEL GRÁFICO DE ANILLO DE PREVISIÓN
  const previsionData = useMemo(() => {
    const map = {};
    matchingPatients.forEach(p => {
      const raw = String(p.prevision || 'OTRAS').toUpperCase().trim();
      let norm = 'OTRAS / SIN PREVISIÓN';
      if (raw.includes('FONASA A')) norm = 'FONASA A';
      else if (raw.includes('FONASA B')) norm = 'FONASA B';
      else if (raw.includes('FONASA C')) norm = 'FONASA C';
      else if (raw.includes('FONASA D')) norm = 'FONASA D';
      else if (raw.includes('FONASA')) norm = 'FONASA A';
      else if (raw.includes('ISAPRE')) norm = 'ISAPRE';
      else if (raw.includes('PARTICULAR')) norm = 'PARTICULAR';
      else if (raw.includes('DIPRECA') || raw.includes('CAPREDENA')) norm = 'DIPRECA/CAPREDENA';

      map[norm] = (map[norm] || 0) + 1;
    });

    const total = matchingPatients.length || 1;
    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
        pct: ((value / total) * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value);
  }, [matchingPatients]);

  // Disparar Impresión / Generación PDF de Perfil
  const handleGenerateReport = () => {
    window.print();
  };

  // Etiquetas formateadas para el reporte
  const selectedTramoLabel = {
    'TODOS': 'Todos los Tramos Etarios (0 - 80+ años)',
    'INFANTIL': 'Infantil (0 - 14 años)',
    'ADULTO_JOVEN': 'Adulto Joven (15 - 29 años)',
    'ADULTO': 'Adulto (30 - 64 años)',
    'ADULTO_MAYOR': 'Adulto Mayor (65+ años)'
  }[tramoFuncional];

  const selectedSexoLabel = {
    'TODOS': 'Todos los Géneros',
    'F': 'Femenino (Mujeres)',
    'M': 'Masculino (Hombres)'
  }[sexoFilter];

  const selectedPrevisionLabel = {
    'TODOS': 'Todas las Previsiones',
    'FONASA': 'FONASA (Tramos A, B, C y D)',
    'ISAPRE': 'ISAPRE',
    'PARTICULAR': 'PARTICULAR'
  }[previsionFilter];

  return (
    <div className={`theme-transition ${
      isPresentationMode 
        ? 'fixed inset-0 z-[100] overflow-y-auto bg-app-custom p-6 md:p-10 space-y-8 animate-fade-in' 
        : 'space-y-6 animate-fade-in w-full px-2 md:px-6 pb-8'
    }`}>
      
      {/* BOTÓN FLOTANTE DE SALIDA DEL MODO PRESENTACIÓN & AVISO ESC */}
      {isPresentationMode && (
        <div className="fixed top-6 right-6 z-[110] flex items-center gap-3 print:hidden">
          <span className="px-3.5 py-2 bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-md text-white text-xs font-mono font-bold rounded-2xl border border-white/20 shadow-xl flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-[10px]">ESC</kbd> para salir
          </span>
          <button
            onClick={exitPresentationMode}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs rounded-2xl shadow-2xl transition-all cursor-pointer"
          >
            <Minimize2 className="w-4.5 h-4.5" />
            <span>Salir de Modo Presentación</span>
          </button>
        </div>
      )}

      {/* COMPONENTE EXPORTABLE OCULTO PARA IMPRESIÓN PDF */}
      <PerfilPoblacionalReporte 
        selectedTramoLabel={selectedTramoLabel}
        selectedSexoLabel={selectedSexoLabel}
        selectedPrevisionLabel={selectedPrevisionLabel}
        totalPacientes={profileStats.total}
        avgEdad={profileStats.avgEdad}
        avgEspera={profileStats.avgEspera}
        avgEstadia={profileStats.avgEstadia}
        topCie10={profileStats.topCie10}
        piramideData={piramideData}
        previsionData={previsionData}
      />

      {/* CABECERA PRINCIPAL CON BOTÓN DE MODO PRESENTACIÓN Y PDF */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card-custom p-6 md:p-8 rounded-3xl shadow-sm border border-card-custom print:hidden">
        <div className="flex items-center gap-4">
          <div className="p-3.5 md:p-4 bg-indigo-500/10 rounded-2xl text-indigo-500 border border-indigo-500/20">
            <Users className={isPresentationMode ? "w-8 h-8" : "w-6 h-6"} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-black text-primary-custom tracking-tight ${isPresentationMode ? 'text-3xl md:text-4xl' : 'text-xl'}`}>
                Dashboard de Arquetipos Clínicos CIE-10
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">
                {isPresentationMode ? 'MODO DIRECTORIO EJECUTIVO' : 'VISTAMASTER ANALYTICS'}
              </span>
            </div>
            <p className={`text-secondary-custom font-semibold mt-1 ${isPresentationMode ? 'text-sm md:text-base' : 'text-xs'}`}>
              Radiografía demográfica poblacional, pirámide quinquenal y mapa epidemiológico basado en CIE-10.
            </p>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN: GENERAR REPORTE PDF & MODO PRESENTACIÓN */}
        <div className="flex flex-wrap items-center gap-3 print:hidden shrink-0">
          {!isPresentationMode ? (
            <button
              onClick={enterPresentationMode}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-lg shadow-purple-500/20 transition-all cursor-pointer active:scale-95 border border-purple-400/30"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Modo Presentación</span>
            </button>
          ) : (
            <button
              onClick={exitPresentationMode}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-lg shadow-rose-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Salir del Modo Kiosco</span>
            </button>
          )}

          <button
            onClick={handleGenerateReport}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black text-xs shadow-lg shadow-indigo-500/20 transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Generar Reporte de Perfil</span>
          </button>
        </div>
      </div>

      {/* BARRA DE SELECCIÓN DE ARQUETIPOS Y FILTROS MACRO */}
      <div className={`bg-card-custom rounded-3xl border border-card-custom p-5 md:p-6 shadow-sm space-y-4 print:hidden ${isPresentationMode ? 'ring-2 ring-indigo-500/30 shadow-xl' : ''}`}>
        <div className="flex items-center gap-2 text-xs font-black uppercase text-indigo-500 tracking-wider">
          <Filter className="w-4 h-4" />
          <span>Selector de Arquetipos Poblacionales</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {/* Selector de Tramo Etario Funcional */}
          <div>
            <label className={`font-black text-secondary-custom uppercase tracking-wider block mb-1.5 ${isPresentationMode ? 'text-xs' : 'text-[10px]'}`}>
              Tramo Etario Funcional
            </label>
            <select
              value={tramoFuncional}
              onChange={(e) => setTramoFuncional(e.target.value)}
              className={`w-full font-bold bg-input-custom border border-card-custom rounded-xl p-3 outline-none text-primary-custom focus:border-indigo-500 shadow-xs ${isPresentationMode ? 'text-sm font-black' : 'text-xs'}`}
            >
              <option value="TODOS">Todos los Tramos (0 - 80+ años)</option>
              <option value="INFANTIL">Infantil (0 - 14 años)</option>
              <option value="ADULTO_JOVEN">Adulto Joven (15 - 29 años)</option>
              <option value="ADULTO">Adulto (30 - 64 años)</option>
              <option value="ADULTO_MAYOR">Adulto Mayor (65+ años)</option>
            </select>
          </div>

          {/* Selector de Género */}
          <div>
            <label className={`font-black text-secondary-custom uppercase tracking-wider block mb-1.5 ${isPresentationMode ? 'text-xs' : 'text-[10px]'}`}>
              Género / Sexo
            </label>
            <select
              value={sexoFilter}
              onChange={(e) => setSexoFilter(e.target.value)}
              className={`w-full font-bold bg-input-custom border border-card-custom rounded-xl p-3 outline-none text-primary-custom focus:border-indigo-500 shadow-xs ${isPresentationMode ? 'text-sm font-black' : 'text-xs'}`}
            >
              <option value="TODOS">Todos los Géneros</option>
              <option value="F">Femenino (Mujeres)</option>
              <option value="M">Masculino (Hombres)</option>
            </select>
          </div>

          {/* Selector de Previsión */}
          <div>
            <label className={`font-black text-secondary-custom uppercase tracking-wider block mb-1.5 ${isPresentationMode ? 'text-xs' : 'text-[10px]'}`}>
              Previsión Médica
            </label>
            <select
              value={previsionFilter}
              onChange={(e) => setPrevisionFilter(e.target.value)}
              className={`w-full font-bold bg-input-custom border border-card-custom rounded-xl p-3 outline-none text-primary-custom focus:border-indigo-500 shadow-xs ${isPresentationMode ? 'text-sm font-black' : 'text-xs'}`}
            >
              <option value="TODOS">Todas las Previsiones</option>
              <option value="FONASA">FONASA (Tramos A, B, C, D)</option>
              <option value="ISAPRE">ISAPRE</option>
              <option value="PARTICULAR">PARTICULAR</option>
            </select>
          </div>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS KPI MACRO DEL ARQUETIPO (CON ESCALAMIENTO TIPOGRÁFICO TEXT-5XL / TEXT-6XL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 print:hidden">
        <div className={`bg-card-custom border border-card-custom rounded-3xl shadow-xs flex flex-col justify-center theme-transition ${isPresentationMode ? 'p-6 md:p-8 border-indigo-500/30 ring-1 ring-indigo-500/20' : 'p-5'}`}>
          <span className={`font-black text-secondary-custom uppercase tracking-wider block ${isPresentationMode ? 'text-xs' : 'text-[10px]'}`}>Muestra de Arquetipo</span>
          <p className={`font-black text-primary-custom leading-none mt-2 font-mono ${isPresentationMode ? 'text-5xl lg:text-6xl' : 'text-3xl'}`}>
            {profileStats.total} <span className={isPresentationMode ? "text-base font-bold text-secondary-custom font-sans" : "text-xs font-bold text-secondary-custom font-sans"}>pac.</span>
          </p>
          <span className={`text-emerald-500 font-bold mt-2 ${isPresentationMode ? 'text-xs' : 'text-[10px]'}`}>✓ Muestra representativa activa</span>
        </div>

        <div className={`bg-card-custom border border-card-custom rounded-3xl shadow-xs flex flex-col justify-center theme-transition ${isPresentationMode ? 'p-6 md:p-8 border-indigo-500/30 ring-1 ring-indigo-500/20' : 'p-5'}`}>
          <span className={`font-black text-secondary-custom uppercase tracking-wider block ${isPresentationMode ? 'text-xs' : 'text-[10px]'}`}>Edad Promedio</span>
          <p className={`font-black text-indigo-500 leading-none mt-2 font-mono ${isPresentationMode ? 'text-5xl lg:text-6xl' : 'text-3xl'}`}>
            {profileStats.avgEdad}
          </p>
          <span className={`text-secondary-custom font-medium mt-2 ${isPresentationMode ? 'text-xs' : 'text-[10px]'}`}>Cohorte {selectedTramoLabel.split(' ')[0]}</span>
        </div>

        <div className={`bg-card-custom border border-card-custom rounded-3xl shadow-xs flex flex-col justify-center theme-transition ${isPresentationMode ? 'p-6 md:p-8 border-amber-500/30 ring-1 ring-amber-500/20' : 'p-5'}`}>
          <span className={`font-black text-secondary-custom uppercase tracking-wider block ${isPresentationMode ? 'text-xs' : 'text-[10px]'}`}>Espera Promedio</span>
          <p className={`font-black text-amber-500 leading-none mt-2 font-mono ${isPresentationMode ? 'text-5xl lg:text-6xl' : 'text-3xl'}`}>
            {profileStats.avgEspera}
          </p>
          <span className={`text-secondary-custom font-medium mt-2 ${isPresentationMode ? 'text-xs' : 'text-[10px]'}`}>Admisión a Triaje Box</span>
        </div>

        <div className={`bg-card-custom border border-card-custom rounded-3xl shadow-xs flex flex-col justify-center theme-transition ${isPresentationMode ? 'p-6 md:p-8 border-emerald-500/30 ring-1 ring-emerald-500/20' : 'p-5'}`}>
          <span className={`font-black text-secondary-custom uppercase tracking-wider block ${isPresentationMode ? 'text-xs' : 'text-[10px]'}`}>Estadía Promedio</span>
          <p className={`font-black text-emerald-500 leading-none mt-2 font-mono ${isPresentationMode ? 'text-5xl lg:text-6xl' : 'text-3xl'}`}>
            {profileStats.avgEstadia}
          </p>
          <span className={`text-secondary-custom font-medium mt-2 ${isPresentationMode ? 'text-xs' : 'text-[10px]'}`}>Permanencia Asistencial</span>
        </div>
      </div>

      {/* BLOQUE 1: RADIOGRAFÍA DEMOGRÁFICA (PIRÁMIDE POBLACIONAL + ANILLO PREVISIONAL CON ALTURA EXPANDIDA) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        
        {/* PIRÁMIDE POBLACIONAL (BarChart Sexo vs 17 Tramos) */}
        <div className="lg:col-span-2 bg-card-custom p-6 md:p-8 rounded-3xl border border-card-custom shadow-xs space-y-4 theme-transition">
          <div className="flex items-center justify-between border-b border-card-custom/50 pb-3">
            <div>
              <h3 className={`font-black text-primary-custom uppercase tracking-wider flex items-center gap-2 ${isPresentationMode ? 'text-base md:text-lg' : 'text-sm'}`}>
                <BarChart2 className="w-5 h-5 text-indigo-500" /> Pirámide Demográfica Poblacional (17 Tramos Quinquenales)
              </h3>
              <p className={`text-secondary-custom font-medium mt-0.5 ${isPresentationMode ? 'text-xs md:text-sm' : 'text-xs'}`}>
                Distribución cruzada de volumen por género en los rangos etarios quinquenales desde 0-4 hasta 80+ años.
              </p>
            </div>
          </div>

          <div className={`w-full pt-2 ${isPresentationMode ? 'h-[420px] md:h-[480px]' : 'h-72'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={piramideData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="tramo" tick={{ fontSize: isPresentationMode ? 12 : 10, fill: 'currentColor' }} interval={0} angle={-35} textAnchor="end" />
                <YAxis tick={{ fontSize: isPresentationMode ? 12 : 10, fill: 'currentColor' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', fontSize: isPresentationMode ? '13px' : '11px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: isPresentationMode ? '13px' : '11px', paddingTop: '10px' }} />
                <Bar dataKey="Hombres" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Hombres (M)" />
                <Bar dataKey="Mujeres" fill="#ec4899" radius={[4, 4, 0, 0]} name="Mujeres (F)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO DE ANILLO DE PREVISIÓN */}
        <div className="bg-card-custom p-6 md:p-8 rounded-3xl border border-card-custom shadow-xs space-y-4 theme-transition">
          <div className="border-b border-card-custom/50 pb-3">
            <h3 className={`font-black text-primary-custom uppercase tracking-wider flex items-center gap-2 ${isPresentationMode ? 'text-base md:text-lg' : 'text-sm'}`}>
              <PieChartIcon className="w-5 h-5 text-emerald-500" /> Distribución de Previsión Médica
            </h3>
            <p className={`text-secondary-custom font-medium mt-0.5 ${isPresentationMode ? 'text-xs md:text-sm' : 'text-xs'}`}>
              Porcentaje de pacientes según tramo previsional Fonasa o seguro privado.
            </p>
          </div>

          <div className={`w-full flex items-center justify-center ${isPresentationMode ? 'h-[280px]' : 'h-56'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={previsionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isPresentationMode ? 65 : 50}
                  outerRadius={isPresentationMode ? 105 : 80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {previsionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PREVISION_COLORS[entry.name] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', fontSize: isPresentationMode ? '13px' : '11px', color: '#fff' }}
                  formatter={(val, name, item) => [`${val} pac. (${item.payload.pct}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leyenda Compacta */}
          <div className="space-y-2 pt-2 border-t border-card-custom/50 max-h-48 overflow-y-auto">
            {previsionData.map((item, idx) => (
              <div key={idx} className={`flex justify-between items-center font-bold text-secondary-custom ${isPresentationMode ? 'text-sm' : 'text-xs'}`}>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: PREVISION_COLORS[item.name] || '#64748b' }} />
                  {item.name}
                </span>
                <span className="font-mono text-primary-custom font-black">{item.pct}% ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* BLOQUE 2: MAPA DE MORBILIDAD CIE-10 (TOP 5 DINÁMICO SEGÚN TRAMO ETARIO FUNCIONAL) */}
      <div className="bg-card-custom p-6 md:p-8 rounded-[2rem] border border-card-custom shadow-xs space-y-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-card-custom/50 pb-4">
          <div>
            <h3 className={`font-black text-primary-custom uppercase tracking-wider flex items-center gap-2 ${isPresentationMode ? 'text-lg md:text-xl' : 'text-base'}`}>
              <Stethoscope className="w-6 h-6 text-indigo-500" /> Mapa de Morbilidad Epidemiológica CIE-10
            </h3>
            <p className={`text-secondary-custom font-medium mt-1 ${isPresentationMode ? 'text-sm md:text-base' : 'text-xs'}`}>
              Top 5 dinámico de patologías clasificadas según el arquetipo etario activo: <strong className="text-indigo-500 font-bold">{selectedTramoLabel}</strong>.
            </p>
          </div>

          <span className={`bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-black rounded-xl border border-indigo-500/20 shrink-0 ${isPresentationMode ? 'px-4 py-2 text-sm' : 'px-3 py-1 text-xs'}`}>
            {profileStats.topCie10.length} Diagnósticos Destacados
          </span>
        </div>

        {/* LISTADO DE BADGES RESALTADOS TOP 5 CIE-10 */}
        <div className="space-y-3 md:space-y-4">
          {profileStats.topCie10.length > 0 ? (
            profileStats.topCie10.map((diag, index) => (
              <div 
                key={index}
                className={`bg-slate-50/50 dark:bg-slate-950/60 border border-card-custom rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-500/40 transition-all shadow-2xs ${
                  isPresentationMode ? 'p-5 md:p-6 border-2' : 'p-4'
                }`}
              >
                {/* Badge con Código CIE-10 y Diagnóstico */}
                <div className="flex items-center gap-4">
                  <div className={`rounded-2xl bg-indigo-600 text-white font-mono font-black flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0 ${
                    isPresentationMode ? 'w-10 h-10 text-base' : 'w-8 h-8 text-xs'
                  }`}>
                    #{index + 1}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3">
                      <span className={`bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-mono font-black rounded-lg border border-indigo-500/30 ${
                        isPresentationMode ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs'
                      }`}>
                        [{diag.code}]
                      </span>
                      <h4 className={`font-black text-primary-custom tracking-tight ${isPresentationMode ? 'text-lg md:text-xl' : 'text-sm'}`}>
                        {diag.name}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Porcentaje y Barra de Progreso */}
                <div className={`flex items-center gap-4 ${isPresentationMode ? 'sm:w-80' : 'sm:w-64'}`}>
                  <div className={`flex-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden ${isPresentationMode ? 'h-3.5' : 'h-2.5'}`}>
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${diag.pct}%` }}
                    />
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`font-black text-indigo-500 font-mono block ${isPresentationMode ? 'text-xl md:text-2xl' : 'text-sm'}`}>
                      {diag.pct}%
                    </span>
                    <span className={`text-secondary-custom font-semibold block ${isPresentationMode ? 'text-xs' : 'text-[10px]'}`}>
                      ({diag.count} pac.)
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-card-custom">
              <AlertCircle className="w-8 h-8 text-secondary-custom mx-auto mb-2 opacity-50" />
              <p className="text-xs text-secondary-custom italic font-medium">No existen diagnósticos registrados para los filtros del arquetipo seleccionado.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
