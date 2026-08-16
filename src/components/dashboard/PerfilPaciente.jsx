import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Clock, Activity, Award, Heart, Shield, Globe, 
  Building2, ChevronLeft, ChevronRight, HelpCircle, Printer, FileText,
  PieChart as PieChartIcon, BarChart2, Stethoscope, Filter, Sparkles, AlertCircle
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
    <div className="space-y-6 animate-fade-in w-full px-2 md:px-6 pb-8 theme-transition">
      
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

      {/* CABECERA PRINCIPAL CON BOTÓN DE GENERAR REPORTE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card-custom p-6 rounded-3xl shadow-sm border border-card-custom print:hidden">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-500/10 rounded-2xl text-indigo-500 border border-indigo-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-primary-custom tracking-tight">Dashboard de Arquetipos Clínicos CIE-10</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">
                VISTAMASTER ANALYTICS
              </span>
            </div>
            <p className="text-xs text-secondary-custom font-semibold mt-0.5">
              Radiografía demográfica poblacional, pirámide quinquenal y mapa epidemiológico basado en CIE-10.
            </p>
          </div>
        </div>

        {/* BOTÓN CONEXIÓN AL MOTOR DE REPORTES PDF */}
        <button
          onClick={handleGenerateReport}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black text-xs shadow-lg shadow-indigo-500/20 transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Generar Reporte de Perfil</span>
        </button>
      </div>

      {/* BARRA DE SELECCIÓN DE ARQUETIPOS Y FILTROS MACRO */}
      <div className="bg-card-custom rounded-3xl border border-card-custom p-5 shadow-sm space-y-4 print:hidden">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-indigo-500 tracking-wider">
          <Filter className="w-4 h-4" />
          <span>Selector de Arquetipos Poblacionales</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Selector de Tramo Etario Funcional */}
          <div>
            <label className="text-[10px] font-black text-secondary-custom uppercase tracking-wider block mb-1">
              Tramo Etario Funcional
            </label>
            <select
              value={tramoFuncional}
              onChange={(e) => setTramoFuncional(e.target.value)}
              className="w-full text-xs font-bold bg-input-custom border border-card-custom rounded-xl p-2.5 outline-none text-primary-custom focus:border-indigo-500 shadow-xs"
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
            <label className="text-[10px] font-black text-secondary-custom uppercase tracking-wider block mb-1">
              Género / Sexo
            </label>
            <select
              value={sexoFilter}
              onChange={(e) => setSexoFilter(e.target.value)}
              className="w-full text-xs font-bold bg-input-custom border border-card-custom rounded-xl p-2.5 outline-none text-primary-custom focus:border-indigo-500 shadow-xs"
            >
              <option value="TODOS">Todos los Géneros</option>
              <option value="F">Femenino (Mujeres)</option>
              <option value="M">Masculino (Hombres)</option>
            </select>
          </div>

          {/* Selector de Previsión */}
          <div>
            <label className="text-[10px] font-black text-secondary-custom uppercase tracking-wider block mb-1">
              Previsión Médica
            </label>
            <select
              value={previsionFilter}
              onChange={(e) => setPrevisionFilter(e.target.value)}
              className="w-full text-xs font-bold bg-input-custom border border-card-custom rounded-xl p-2.5 outline-none text-primary-custom focus:border-indigo-500 shadow-xs"
            >
              <option value="TODOS">Todas las Previsiones</option>
              <option value="FONASA">FONASA (Tramos A, B, C, D)</option>
              <option value="ISAPRE">ISAPRE</option>
              <option value="PARTICULAR">PARTICULAR</option>
            </select>
          </div>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS KPI MACRO DEL ARQUETIPO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
        <div className="bg-card-custom border border-card-custom p-5 rounded-3xl shadow-xs flex flex-col justify-center theme-transition">
          <span className="text-[10px] font-black text-secondary-custom uppercase tracking-wider block">Muestra de Arquetipo</span>
          <p className="text-3xl font-black text-primary-custom leading-tight mt-1">{profileStats.total} <span className="text-xs font-bold text-secondary-custom">pac.</span></p>
          <span className="text-[10px] text-emerald-500 font-bold mt-1">✓ Muestra representativa activa</span>
        </div>

        <div className="bg-card-custom border border-card-custom p-5 rounded-3xl shadow-xs flex flex-col justify-center theme-transition">
          <span className="text-[10px] font-black text-secondary-custom uppercase tracking-wider block">Edad Promedio</span>
          <p className="text-3xl font-black text-indigo-500 leading-tight mt-1">{profileStats.avgEdad}</p>
          <span className="text-[10px] text-secondary-custom font-medium mt-1">Cohorte {selectedTramoLabel.split(' ')[0]}</span>
        </div>

        <div className="bg-card-custom border border-card-custom p-5 rounded-3xl shadow-xs flex flex-col justify-center theme-transition">
          <span className="text-[10px] font-black text-secondary-custom uppercase tracking-wider block">Espera Promedio</span>
          <p className="text-3xl font-black text-amber-500 leading-tight mt-1">{profileStats.avgEspera}</p>
          <span className="text-[10px] text-secondary-custom font-medium mt-1">Admisión a Triaje Box</span>
        </div>

        <div className="bg-card-custom border border-card-custom p-5 rounded-3xl shadow-xs flex flex-col justify-center theme-transition">
          <span className="text-[10px] font-black text-secondary-custom uppercase tracking-wider block">Estadía Promedio</span>
          <p className="text-3xl font-black text-emerald-500 leading-tight mt-1">{profileStats.avgEstadia}</p>
          <span className="text-[10px] text-secondary-custom font-medium mt-1">Permanencia Asistencial</span>
        </div>
      </div>

      {/* BLOQUE 1: RADIOGRAFÍA DEMOGRÁFICA (PIRÁMIDE POBLACIONAL + ANILLO PREVISIONAL) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        
        {/* PIRÁMIDE POBLACIONAL (BarChart Hombres vs Mujeres en 17 tramos) */}
        <div className="lg:col-span-2 bg-card-custom p-6 rounded-3xl border border-card-custom shadow-xs space-y-4 theme-transition">
          <div className="flex items-center justify-between border-b border-card-custom/50 pb-3">
            <div>
              <h3 className="text-sm font-black text-primary-custom uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4.5 h-4.5 text-indigo-500" /> Pirámide Demográfica Poblacional (17 Tramos Quinquenales)
              </h3>
              <p className="text-xs text-secondary-custom font-medium mt-0.5">
                Distribución cruzada de volumen por género en los rangos etarios quinquenales desde 0-4 hasta 80+ años.
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={piramideData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="tramo" tick={{ fontSize: 10, fill: 'currentColor' }} interval={0} angle={-35} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: 'currentColor' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', fontSize: '11px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Hombres" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Hombres (M)" />
                <Bar dataKey="Mujeres" fill="#ec4899" radius={[4, 4, 0, 0]} name="Mujeres (F)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO DE ANILLO DE PREVISIÓN */}
        <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-xs space-y-4 theme-transition">
          <div className="border-b border-card-custom/50 pb-3">
            <h3 className="text-sm font-black text-primary-custom uppercase tracking-wider flex items-center gap-2">
              <PieChartIcon className="w-4.5 h-4.5 text-emerald-500" /> Distribución de Previsión Médica
            </h3>
            <p className="text-xs text-secondary-custom font-medium mt-0.5">
              Porcentaje de pacientes según tramo previsional Fonasa o seguro privado.
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={previsionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {previsionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PREVISION_COLORS[entry.name] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', fontSize: '11px', color: '#fff' }}
                  formatter={(val, name, item) => [`${val} pac. (${item.payload.pct}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leyenda Compacta */}
          <div className="space-y-1.5 pt-2 border-t border-card-custom/50 max-h-36 overflow-y-auto">
            {previsionData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs font-bold text-secondary-custom">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: PREVISION_COLORS[item.name] || '#64748b' }} />
                  {item.name}
                </span>
                <span className="font-mono text-primary-custom">{item.pct}% ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* BLOQUE 2: MAPA DE MORBILIDAD CIE-10 (TOP 5 DINÁMICO SEGÚN TRAMO ETARIO FUNCIONAL) */}
      <div className="bg-card-custom p-6 md:p-8 rounded-[2rem] border border-card-custom shadow-xs space-y-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-card-custom/50 pb-4">
          <div>
            <h3 className="text-base font-black text-primary-custom uppercase tracking-wider flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-indigo-500" /> Mapa de Morbilidad Epidemiológica CIE-10
            </h3>
            <p className="text-xs text-secondary-custom font-medium mt-1">
              Top 5 dinámico de patologías clasificadas según el arquetipo etario activo: <strong className="text-indigo-500 font-bold">{selectedTramoLabel}</strong>.
            </p>
          </div>

          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs rounded-xl border border-indigo-500/20 shrink-0">
            {profileStats.topCie10.length} Diagnósticos Destacados
          </span>
        </div>

        {/* LISTADO DE BADGES RESALTADOS TOP 5 CIE-10 */}
        <div className="space-y-3">
          {profileStats.topCie10.length > 0 ? (
            profileStats.topCie10.map((diag, index) => (
              <div 
                key={index}
                className="p-4 bg-slate-50/50 dark:bg-slate-950/60 border border-card-custom rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-500/40 transition-all shadow-2xs"
              >
                {/* Badge con Código CIE-10 y Diagnóstico */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-mono font-black text-xs flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                    #{index + 1}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-mono font-black text-xs rounded-lg border border-indigo-500/30">
                        [{diag.code}]
                      </span>
                      <h4 className="text-sm font-black text-primary-custom tracking-tight">{diag.name}</h4>
                    </div>
                  </div>
                </div>

                {/* Porcentaje y Barra de Progreso */}
                <div className="flex items-center gap-4 sm:w-64">
                  <div className="flex-1 bg-black/10 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${diag.pct}%` }}
                    />
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-indigo-500 font-mono">{diag.pct}%</span>
                    <span className="text-[10px] text-secondary-custom font-semibold block">({diag.count} pac.)</span>
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
