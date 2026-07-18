import React, { useMemo } from 'react';
import { UserCheck, Calendar, Clock, AlertTriangle, TrendingUp, TrendingDown, GitCompare, Landmark } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, Legend, ComposedChart, Line
} from 'recharts';

export default function AnalisisAltasDetail({ 
  turnosDB, 
  filtroFechaInicio, 
  filtroFechaFin,
  statsKPI,
  modoComparativo,
  filtroFechaInicioB,
  filtroFechaFinB
}) {
  
  // 1. Filtrar turnos según el rango seleccionado (Periodo A)
  const turnosFiltradosA = useMemo(() => {
    if (!turnosDB) return [];
    return turnosDB.filter(t => t.fechaInicio >= filtroFechaInicio && t.fechaInicio <= filtroFechaFin);
  }, [turnosDB, filtroFechaInicio, filtroFechaFin]);

  // 2. Filtrar turnos según el rango comparativo (Periodo B)
  const turnosFiltradosB = useMemo(() => {
    if (!turnosDB || !modoComparativo || !filtroFechaInicioB || !filtroFechaFinB) return [];
    return turnosDB.filter(t => t.fechaInicio >= filtroFechaInicioB && t.fechaInicio <= filtroFechaFinB);
  }, [turnosDB, modoComparativo, filtroFechaInicioB, filtroFechaFinB]);

  // 3. Agrupación y Estadísticas por Día (Periodo A)
  const dailyDataA = useMemo(() => {
    const grouped = {};
    turnosFiltradosA.forEach(t => {
      const date = t.fechaInicio;
      if (!grouped[date]) {
        grouped[date] = { date, altasAdmin: 0, totalPacientes: 0 };
      }
      grouped[date].altasAdmin += Number(t.altasAdmin || 0);
      grouped[date].totalPacientes += Number(t.totalPacientes || 0);
    });
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [turnosFiltradosA]);

  // 4. Agrupación y Estadísticas por Día (Periodo B)
  const dailyDataB = useMemo(() => {
    const grouped = {};
    turnosFiltradosB.forEach(t => {
      const date = t.fechaInicio;
      if (!grouped[date]) {
        grouped[date] = { date, altasAdmin: 0, totalPacientes: 0 };
      }
      grouped[date].altasAdmin += Number(t.altasAdmin || 0);
      grouped[date].totalPacientes += Number(t.totalPacientes || 0);
    });
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [turnosFiltradosB]);

  // 5. Totales y KPIs principales de Periodo A y Periodo B
  const statsA = useMemo(() => {
    let totalAltas = 0;
    let totalPacientes = 0;
    let maxAltasDay = { date: '-', count: 0 };
    
    dailyDataA.forEach(d => {
      totalAltas += d.altasAdmin;
      totalPacientes += d.totalPacientes;
      if (d.altasAdmin > maxAltasDay.count) {
        maxAltasDay = { date: d.date, count: d.altasAdmin };
      }
    });

    const pct = totalPacientes > 0 ? (totalAltas / totalPacientes) * 100 : 0;
    const dias = dailyDataA.length || 1;
    const promedioDiario = totalAltas / dias;

    const teamsCount = { 'Turno 1': 0, 'Turno 2': 0, 'Turno 3': 0, 'Turno 4': 0, 'Sin Asignar': 0 };
    turnosFiltradosA.forEach(t => {
      const eq = t.equipoTurno || 'Sin Asignar';
      if (teamsCount[eq] !== undefined) teamsCount[eq] += Number(t.altasAdmin || 0);
    });

    let topTeam = { name: '-', count: 0 };
    Object.entries(teamsCount).forEach(([name, count]) => {
      if (count > topTeam.count) topTeam = { name, count };
    });

    return { totalAltas, totalPacientes, pct, promedioDiario, maxAltasDay, topTeam };
  }, [turnosFiltradosA, dailyDataA]);

  const statsB = useMemo(() => {
    if (!modoComparativo) return { totalAltas: 0, totalPacientes: 0, pct: 0 };
    let totalAltas = 0;
    let totalPacientes = 0;
    
    dailyDataB.forEach(d => {
      totalAltas += d.altasAdmin;
      totalPacientes += d.totalPacientes;
    });

    const pct = totalPacientes > 0 ? (totalAltas / totalPacientes) * 100 : 0;
    return { totalAltas, totalPacientes, pct };
  }, [modoComparativo, dailyDataB]);

  // 6. Crecimiento dinámico vs Periodo Anterior Equivalente (Semana anterior)
  const growthWeek = useMemo(() => {
    if (!turnosDB || !filtroFechaInicio || !filtroFechaFin) return 0;
    const startA = new Date(filtroFechaInicio + 'T00:00:00');
    const endA = new Date(filtroFechaFin + 'T23:59:59');
    const durationDays = Math.ceil((endA - startA) / (1000 * 60 * 60 * 24)) || 1;
    
    const startBDate = new Date(startA);
    startBDate.setDate(startBDate.getDate() - durationDays);
    const endBDate = new Date(startA);
    endBDate.setDate(endBDate.getDate() - 1);
    
    const startBStr = startBDate.toISOString().split('T')[0];
    const endBStr = endBDate.toISOString().split('T')[0];
    
    const turnosA = turnosDB.filter(t => t.fechaInicio >= filtroFechaInicio && t.fechaInicio <= filtroFechaFin);
    const turnosB = turnosDB.filter(t => t.fechaInicio >= startBStr && t.fechaInicio <= endBStr);
    
    const altasA = turnosA.reduce((acc, t) => acc + Number(t.altasAdmin || 0), 0);
    const altasB = turnosB.reduce((acc, t) => acc + Number(t.altasAdmin || 0), 0);
    
    if (altasB === 0) return altasA > 0 ? 100 : 0;
    return ((altasA - altasB) / altasB) * 100;
  }, [turnosDB, filtroFechaInicio, filtroFechaFin]);

  // 7. Comparativa de crecimiento A vs B
  const compareGrowth = useMemo(() => {
    if (!modoComparativo) return 0;
    if (statsB.totalAltas === 0) return statsA.totalAltas > 0 ? 100 : 0;
    return ((statsA.totalAltas - statsB.totalAltas) / statsB.totalAltas) * 100;
  }, [modoComparativo, statsA.totalAltas, statsB.totalAltas]);

  // 8. Comparativa por Turno/Equipo (Cantidad Absoluta y Porcentaje)
  const teamData = useMemo(() => {
    const teams = {
      'Turno 1': { name: 'Turno 1', altasAdmin: 0, totalPacientes: 0, fill: '#10b981' },
      'Turno 2': { name: 'Turno 2', altasAdmin: 0, totalPacientes: 0, fill: '#facc15' },
      'Turno 3': { name: 'Turno 3', altasAdmin: 0, totalPacientes: 0, fill: '#3b82f6' },
      'Turno 4': { name: 'Turno 4', altasAdmin: 0, totalPacientes: 0, fill: '#f97316' },
      'Sin Asignar': { name: 'Sin Asignar', altasAdmin: 0, totalPacientes: 0, fill: '#94a3b8' }
    };

    turnosFiltradosA.forEach(t => {
      const eq = t.equipoTurno || 'Sin Asignar';
      if (teams[eq]) {
        teams[eq].altasAdmin += Number(t.altasAdmin || 0);
        teams[eq].totalPacientes += Number(t.totalPacientes || 0);
      }
    });

    return Object.values(teams).map(t => ({
      ...t,
      porcentaje: t.totalPacientes > 0 ? Number(((t.altasAdmin / t.totalPacientes) * 100).toFixed(1)) : 0
    }));
  }, [turnosFiltradosA]);

  // 9. Listado de Turnos ordenados de mayor a menor altas administrativas
  const sortedShifts = useMemo(() => {
    return [...turnosFiltradosA]
      .sort((a, b) => Number(b.altasAdmin || 0) - Number(a.altasAdmin || 0));
  }, [turnosFiltradosA]);

  // 10. Datos de comparación diaria para Recharts (Periodo A vs B)
  const compareDailyData = useMemo(() => {
    if (!modoComparativo) return [];
    // Mapear por índice de día relativo del rango
    const maxLen = Math.max(dailyDataA.length, dailyDataB.length);
    const list = [];
    for(let i=0; i<maxLen; i++) {
      list.push({
        dayIndex: `Día ${i + 1}`,
        'Periodo A (Filtro)': dailyDataA[i] ? dailyDataA[i].altasAdmin : 0,
        'Periodo B (Comparación)': dailyDataB[i] ? dailyDataB[i].altasAdmin : 0
      });
    }
    return list;
  }, [modoComparativo, dailyDataA, dailyDataB]);

  const TEAM_TEXT_COLORS = {
    'Turno 1': 'text-emerald-500',
    'Turno 2': 'text-yellow-600 dark:text-yellow-400',
    'Turno 3': 'text-blue-500',
    'Turno 4': 'text-orange-500',
    'Sin Asignar': 'text-slate-400'
  };

  const isAlertActive = statsA.pct > 5;
  
  // Total Anual YTD Estadísticas
  const totalAnualAltas = statsKPI?.anual?.altasAdmin?.current || 0;
  const totalAnualPacientes = statsKPI?.anual?.pacientes?.current || 0;
  const pctAnualAltas = totalAnualPacientes > 0 ? (totalAnualAltas / totalAnualPacientes) * 100 : 0;
  const isAlertAnual = pctAnualAltas > 5;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto theme-transition">
      
      {/* Encabezado con banner de Alerta */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 theme-transition ${isAlertActive ? 'bg-red-500/10 border-red-500 shadow-md' : 'bg-card-custom border-card-custom'}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isAlertActive ? 'bg-red-500/20 text-red-500' : 'bg-rose-500/10 text-rose-500'}`}>
            <UserCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-primary-custom flex items-center gap-2">
              Auditoría de Altas Administrativas
              {isAlertActive && (
                <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full animate-bounce">
                  Límite Excedido (&gt;5%)
                </span>
              )}
            </h2>
            <p className="text-xs font-bold text-secondary-custom opacity-85">Análisis detallado de egresos no médicos por turno, equipo y variaciones de periodos</p>
          </div>
        </div>
        {isAlertActive && (
          <div className="flex items-center gap-2 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm animate-pulse">
            <AlertTriangle className="w-4 h-4 text-white" />
            <span>Alerta: Altas Administrativas ({statsA.pct.toFixed(1)}%) superan el 5% del volumen general.</span>
          </div>
        )}
      </div>

      {/* Grid de KPIs - Indicador de Selección y Total Anual (YTD) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Selección Actual */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between min-h-[135px] shadow-sm theme-transition bg-card-custom hover:z-30 hover:shadow-lg ${isAlertActive ? 'border-red-500 bg-red-500/10 animate-pulse text-red-500' : 'border-card-custom'}`}>
          <span className="text-[10px] font-black tracking-wider uppercase opacity-90">Altas Admin (Periodo Activo)</span>
          <div className="flex justify-between items-end mt-2">
            <span className="text-4xl font-black text-primary-custom">
              {statsA.totalAltas}
              <span className={`text-xs font-black ml-2 px-2 py-0.5 rounded-lg ${isAlertActive ? 'bg-red-500 text-white' : 'bg-rose-500/10 text-rose-500'}`}>
                {statsA.pct.toFixed(1)}%
              </span>
            </span>
          </div>
          <span className="text-[9px] text-secondary-custom opacity-70 mt-2 font-medium">Filtro: {filtroFechaInicio} / {filtroFechaFin}</span>
        </div>

        {/* KPI 2: Total Anual YTD */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between min-h-[135px] shadow-sm theme-transition bg-card-custom hover:z-30 hover:shadow-lg ${isAlertAnual ? 'border-red-500 bg-red-500/10 animate-pulse text-red-500' : 'border-card-custom'}`}>
          <span className="text-[10px] font-black tracking-wider uppercase opacity-90">Altas Admin (Global Anual YTD)</span>
          <div className="flex justify-between items-end mt-2">
            <span className="text-4xl font-black text-primary-custom">
              {totalAnualAltas}
              <span className={`text-xs font-black ml-2 px-2 py-0.5 rounded-lg ${isAlertAnual ? 'bg-red-500 text-white' : 'bg-rose-500/10 text-rose-500'}`}>
                {pctAnualAltas.toFixed(1)}%
              </span>
            </span>
          </div>
          <span className="text-[9px] text-secondary-custom opacity-70 mt-2 font-medium">Total acumulado del año actual</span>
        </div>

        {/* KPI 3: Desviaciones y Comparaciones Históricas */}
        <div className="bg-card-custom p-5 rounded-2xl border border-card-custom flex flex-col justify-between min-h-[135px] shadow-sm theme-transition hover:z-30 hover:shadow-lg">
          <span className="text-[10px] font-bold text-secondary-custom tracking-wider uppercase opacity-85">Comparativas de Periodos</span>
          <div className="flex flex-col gap-1.5 mt-2">
            {/* Vs Semana Anterior */}
            <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
              <span className="text-[9px] font-bold text-secondary-custom">Vs Periodo Ant.</span>
              <span className={`text-[10px] font-black flex items-center gap-1 ${growthWeek > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {growthWeek > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {growthWeek > 0 ? '+' : ''}{growthWeek.toFixed(1)}%
              </span>
            </div>
            {/* Vs Mes Anterior */}
            {statsKPI?.altasAdmin?.growthMonth !== undefined && (
              <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                <span className="text-[9px] font-bold text-secondary-custom">Vs Mes Ant.</span>
                <span className={`text-[10px] font-black flex items-center gap-1 ${statsKPI.altasAdmin.growthMonth > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {statsKPI.altasAdmin.growthMonth > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {statsKPI.altasAdmin.growthMonth > 0 ? '+' : ''}{statsKPI.altasAdmin.growthMonth.toFixed(1)}%
                </span>
              </div>
            )}
            {/* Vs Año Anterior */}
            {statsKPI?.altasAdmin?.growthYear !== undefined && (
              <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                <span className="text-[9px] font-bold text-secondary-custom">Vs Año Ant.</span>
                <span className={`text-[10px] font-black flex items-center gap-1 ${statsKPI.altasAdmin.growthYear > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {statsKPI.altasAdmin.growthYear > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {statsKPI.altasAdmin.growthYear > 0 ? '+' : ''}{statsKPI.altasAdmin.growthYear.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* KPI 4: Comparación Directa Periodo B (Si aplica) */}
        {modoComparativo ? (
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl flex flex-col justify-between min-h-[135px] shadow-sm theme-transition hover:z-30 hover:shadow-lg">
            <span className="text-[10px] font-black tracking-wider uppercase text-indigo-500 dark:text-indigo-400">Variación A vs B</span>
            <div className="flex justify-between items-end mt-2">
              <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                {compareGrowth > 0 ? '+' : ''}{compareGrowth.toFixed(1)}%
                <span className="text-xs font-bold ml-2 text-secondary-custom opacity-70">
                  {statsB.totalAltas} altas en B
                </span>
              </span>
            </div>
            <span className="text-[9px] text-secondary-custom opacity-70 mt-2 font-medium">B: {filtroFechaInicioB} / {filtroFechaFinB}</span>
          </div>
        ) : (
          <div className="bg-card-custom p-5 rounded-2xl border border-card-custom flex flex-col justify-between min-h-[135px] shadow-sm theme-transition hover:z-30 hover:shadow-lg">
            <span className="text-[10px] font-bold text-secondary-custom tracking-wider uppercase opacity-85">Récord Diario de Altas</span>
            <div className="flex justify-between items-end mt-2">
              <span className="text-3xl font-black text-primary-custom">
                {statsA.maxAltasDay.count}
                <span className="text-xs font-black text-rose-500 ml-2 bg-rose-500/10 px-2 py-0.5 rounded-lg">
                  {statsA.maxAltasDay.date}
                </span>
              </span>
            </div>
            <span className="text-[9px] text-secondary-custom opacity-70 mt-2 font-medium">Pico máximo en un solo día</span>
          </div>
        )}

      </div>

      {/* Sección de Comparación Gráfica (Periodo A vs Periodo B) */}
      {modoComparativo && compareDailyData.length > 0 && (
        <div className="bg-card-custom p-6 rounded-2xl border border-card-custom shadow-sm flex flex-col theme-transition">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GitCompare className="w-5 h-5 text-indigo-500" />
              <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider">Comparación Temporal (Periodo A vs Periodo B)</h3>
            </div>
            <p className="text-[10px] text-secondary-custom font-medium mb-4">Evolución paralela diaria de altas administrativas para detectar variaciones estacionales</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={compareDailyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="dayIndex" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)', borderRadius: '12px', border: '1px solid' }}
                  labelClassName="font-black text-primary-custom text-xs"
                />
                <Legend wrapperStyle={{fontSize: '11px', fontWeight: 'bold'}} />
                <Bar dataKey="Periodo A (Filtro)" fill="#3b82f6" name="Periodo A (Filtro)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Periodo B (Comparación)" fill="#818cf8" name="Periodo B (Comparación)" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Sección de Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Evolución Temporal Diaria */}
        <div className="bg-card-custom p-6 rounded-2xl border border-card-custom shadow-sm flex flex-col theme-transition">
          <div>
            <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider mb-1">Evolución de Altas Administrativas</h3>
            <p className="text-[10px] text-secondary-custom font-medium mb-4">Comportamiento diario de las altas para detectar variaciones y picos en el periodo principal</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyDataA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAltasAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)', borderRadius: '12px', border: '1px solid' }}
                  labelClassName="font-black text-primary-custom text-xs"
                />
                <Area type="monotone" dataKey="altasAdmin" name="Altas Admin" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorAltasAdmin)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Comparativa por Equipo */}
        <div className="bg-card-custom p-6 rounded-2xl border border-card-custom shadow-sm flex flex-col theme-transition">
          <div>
            <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider mb-1">Comparativa Acumulada por Equipo</h3>
            <p className="text-[10px] text-secondary-custom font-medium mb-4">Mide la cantidad absoluta de altas administrativas procesadas por cada equipo de turno</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-secondary)' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)', borderRadius: '12px', border: '1px solid' }}
                  formatter={(value, name, props) => [`${value} altas (${props.payload.porcentaje}%)`, 'Altas Administrativas']}
                />
                <Bar dataKey="altasAdmin" name="Altas Admin" radius={[4, 4, 0, 0]} barSize={35}>
                  {teamData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Tabla de Desglose de Turnos */}
      <div className="bg-card-custom rounded-2xl border border-card-custom p-6 shadow-sm overflow-hidden theme-transition">
        <div className="mb-4">
          <h3 className="text-xs font-bold text-primary-custom uppercase tracking-wider mb-1">Historial Detallado de Turnos</h3>
          <p className="text-[10px] text-secondary-custom font-medium">Turnos ordenados de mayor a menor según la cantidad absoluta de altas administrativas procesadas</p>
        </div>
        
        {sortedShifts.length === 0 ? (
          <div className="p-8 text-center text-secondary-custom opacity-60 text-xs">Sin registros de turnos en el periodo seleccionado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-secondary-custom font-bold uppercase text-[10px] tracking-wider border-b border-card-custom">
                  <th className="p-3 pb-2 text-center">Rango</th>
                  <th className="p-3 pb-2">Fecha del Turno</th>
                  <th className="p-3 pb-2">Jornada / Horario</th>
                  <th className="p-3 pb-2">Equipo</th>
                  <th className="p-3 pb-2 text-center">Altas Admin</th>
                  <th className="p-3 pb-2 text-center">Total Pacientes</th>
                  <th className="p-3 pb-2 text-right">% Altas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-custom/50">
                {sortedShifts.slice(0, 15).map((turno, index) => {
                  const tPct = turno.totalPacientes > 0 ? (turno.altasAdmin / turno.totalPacientes) * 100 : 0;
                  const isShiftAlert = tPct > 5;
                  
                  return (
                    <tr key={turno.id || index} className="hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs font-bold">
                      <td className="p-3 text-center">
                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-black mx-auto ${index < 3 ? 'bg-rose-500 text-white' : 'bg-black/5 dark:bg-white/5 text-secondary-custom'}`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className="p-3 text-primary-custom">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-secondary-custom opacity-70" />
                          {turno.fechaInicio}
                        </div>
                      </td>
                      <td className="p-3 text-secondary-custom font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-secondary-custom opacity-70" />
                          {turno.horario}
                        </div>
                      </td>
                      <td className={`p-3 uppercase ${TEAM_TEXT_COLORS[turno.equipoTurno || 'Sin Asignar']}`}>
                        {turno.equipoTurno || 'Sin Asignar'}
                      </td>
                      <td className={`p-3 text-center font-black text-sm ${isShiftAlert ? 'text-red-500 animate-pulse' : 'text-primary-custom'}`}>
                        {turno.altasAdmin}
                      </td>
                      <td className="p-3 text-center text-secondary-custom font-medium">
                        {turno.totalPacientes}
                      </td>
                      <td className={`p-3 text-right text-sm font-black ${isShiftAlert ? 'text-red-500' : 'text-primary-custom'}`}>
                        {tPct.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {sortedShifts.length > 15 && (
              <p className="text-[10px] text-secondary-custom text-center mt-3 font-medium opacity-80">
                Mostrando los 15 turnos con mayor cantidad de altas. Hay {sortedShifts.length - 15} turnos adicionales en este periodo.
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
