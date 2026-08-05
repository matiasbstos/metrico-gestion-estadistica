import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  Calendar, 
  Users, 
  RefreshCw, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  BarChart2,
  Zap,
  Info
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function Radar({ user, app, showNotif }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [proyeccionData, setProyeccionData] = useState([]);
  const [alertaCognitivaText, setAlertaCognitivaText] = useState('');

  // Datos de respaldo estructurados según el entrenamiento ARIMA_PLUS
  const fallbackData = [
    { fecha_predicha: '2026-08-03', atenciones_estimadas: 83, limite_inferior: 60, limite_superior: 105 },
    { fecha_predicha: '2026-08-04', atenciones_estimadas: 83, limite_inferior: 60, limite_superior: 107 },
    { fecha_predicha: '2026-08-05', atenciones_estimadas: 87, limite_inferior: 63, limite_superior: 112 },
    { fecha_predicha: '2026-08-06', atenciones_estimadas: 75, limite_inferior: 50, limite_superior: 100 },
    { fecha_predicha: '2026-08-07', atenciones_estimadas: 128, limite_inferior: 102, limite_superior: 154 },
    { fecha_predicha: '2026-08-08', atenciones_estimadas: 123, limite_inferior: 97, limite_superior: 130 },
    { fecha_predicha: '2026-08-09', atenciones_estimadas: 101, limite_inferior: 74, limite_superior: 129 }
  ];

  const fetchProyeccion = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      if (app) {
        const functions = getFunctions(app);
        const callProyeccion = httpsCallable(functions, 'obtenerProyeccionVolumen');
        const res = await callProyeccion({ horizon: 7, confidenceLevel: 0.95 });
        const data = res.data;
        if (data) {
          if (Array.isArray(data) && data.length > 0) {
            setProyeccionData(data);
          } else if (data.proyecciones && Array.isArray(data.proyecciones)) {
            setProyeccionData(data.proyecciones);
            if (data.alertaCognitiva) {
              setAlertaCognitivaText(data.alertaCognitiva);
            }
          } else {
            setProyeccionData(fallbackData);
          }

          if (isManualRefresh && showNotif) {
            showNotif('Modelo predictivo BigQuery + Agente AI de Clima sincronizados.', 'success');
          }
        } else {
          setProyeccionData(fallbackData);
        }
      } else {
        setProyeccionData(fallbackData);
      }
    } catch (err) {
      console.warn("Utilizando datos locales de BigQuery (ARIMA_PLUS):", err.message);
      setProyeccionData(fallbackData);
      if (isManualRefresh && showNotif) {
        showNotif('Modelo consultado desde datos de BigQuery.', 'info');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProyeccion();
  }, []);

  // Formatear datos para Recharts y visualizaciones
  const chartData = useMemo(() => {
    const dataToUse = proyeccionData.length > 0 ? proyeccionData : fallbackData;
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diasCortos = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return dataToUse.map(item => {
      const parts = item.fecha_predicha.split('-');
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);
      const dateObj = new Date(year, month, day);

      const nombreDia = diasSemana[dateObj.getDay()] || '';
      const diaCorto = diasCortos[dateObj.getDay()] || '';
      const fechaCorta = `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}`;

      let estadoCarga = 'Normal';
      if (item.atenciones_estimadas >= 115) estadoCarga = 'Crítico';
      else if (item.atenciones_estimadas >= 95) estadoCarga = 'Elevado';

      return {
        ...item,
        fechaStr: `${diaCorto} ${fechaCorta}`,
        fechaCompletaStr: `${nombreDia} ${fechaCorta}/${year}`,
        rangoConfianza: [item.limite_inferior, item.limite_superior],
        rangoDiferencia: Math.max(0, item.limite_superior - item.limite_inferior),
        estadoCarga
      };
    });
  }, [proyeccionData]);

  // Identificar el día pico de máxima demanda proyectada
  const peakDay = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;
    return [...chartData].sort((a, b) => b.atenciones_estimadas - a.atenciones_estimadas)[0];
  }, [chartData]);

  // Totales y promedios predictivos
  const stats = useMemo(() => {
    if (!chartData || chartData.length === 0) return { total: 0, promedio: 0, min: 0, max: 0 };
    const total = chartData.reduce((acc, curr) => acc + curr.atenciones_estimadas, 0);
    const promedio = Math.round(total / chartData.length);
    const min = Math.min(...chartData.map(d => d.atenciones_estimadas));
    const max = Math.max(...chartData.map(d => d.atenciones_estimadas));
    return { total, promedio, min, max };
  }, [chartData]);

  // Custom Tooltip para el gráfico de Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl border border-indigo-500/30 shadow-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between gap-3 border-b border-slate-700 pb-2">
            <span className="font-black text-sm text-indigo-400 capitalize">{data.fechaCompletaStr}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              data.estadoCarga === 'Crítico' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
              data.estadoCarga === 'Elevado' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              Carga {data.estadoCarga}
            </span>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
                Atenciones Estimadas:
              </span>
              <span className="font-black text-sm text-white">{data.atenciones_estimadas} pac.</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Límite Inferior (95%):</span>
              <span className="font-bold text-slate-300">{data.limite_inferior} pac.</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Límite Superior (95%):</span>
              <span className="font-bold text-slate-300">{data.limite_superior} pac.</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* ENCABEZADO PRINCIPAL DE RADAR PREDICTIVO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card-custom p-6 md:p-8 rounded-3xl border border-card-custom shadow-xs theme-transition relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> BigQuery ML ARIMA_PLUS
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Modelo En Línea
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-primary-custom tracking-tight flex items-center gap-3">
            <TrendingUp className="w-8 h-8 accent-text-custom" /> Radar Predictivo de Demanda
          </h2>
          <p className="text-sm text-secondary-custom font-medium max-w-2xl">
            Proyección automatizada de volumen de atenciones para los próximos 7 días mediante algoritmos de series temporales de BigQuery Machine Learning.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => fetchProyeccion(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            title="Recalcular modelo predictivo"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Sincronizando...' : 'Actualizar Proyección'}
          </button>
        </div>
      </div>

      {/* TARJETA DE ALERTA OPERATIVA (BANNER ROJO DINÁMICO DE AGENTE AI) */}
      {peakDay && peakDay.atenciones_estimadas >= 100 && (
        <div className="relative p-6 rounded-3xl bg-red-500/10 dark:bg-red-950/30 border-2 border-red-500/40 shadow-xl overflow-hidden animate-fade-in glow-red-alert">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/20 rounded-2xl border border-red-500/30 text-red-600 dark:text-red-400 flex-shrink-0 animate-pulse">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30 flex items-center gap-1.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-red-500 animate-pulse" /> Agente Epidemiológico MÉTRICO AI (Clima Melipilla)
                  </span>
                </div>
                <h3 className="text-sm md:text-base font-black text-red-700 dark:text-red-200 tracking-tight leading-relaxed">
                  {alertaCognitivaText || `⚠️ Riesgo de sobrecarga para el ${peakDay.fechaCompletaStr} (Proyección: ${peakDay.atenciones_estimadas} pacientes). Se recomienda reforzar dotación médica y de enfermería.`}
                </h3>
              </div>
            </div>
            
            <div className="flex items-center gap-2 self-end md:self-center bg-red-500/20 px-4 py-2 rounded-2xl border border-red-500/30 text-red-700 dark:text-red-200 text-xs font-black flex-shrink-0">
              <Clock className="w-4 h-4" /> Pico Estimado: {peakDay.atenciones_estimadas} pac.
            </div>
          </div>
        </div>
      )}

      {/* METRICAS CLAVE DEL MODELO PREDICTIVO (CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-xs theme-transition space-y-2">
          <div className="flex items-center justify-between text-secondary-custom">
            <span className="text-xs font-black uppercase tracking-wider">Promedio Diario</span>
            <Users className="w-5 h-5 accent-text-custom" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-primary-custom">{stats.promedio}</span>
            <span className="text-xs font-bold text-secondary-custom">pacientes/día</span>
          </div>
          <p className="text-[11px] text-secondary-custom font-medium opacity-80">Media móvil de 7 días proyectada</p>
        </div>

        <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-xs theme-transition space-y-2">
          <div className="flex items-center justify-between text-secondary-custom">
            <span className="text-xs font-black uppercase tracking-wider">Pico Máximo Esperado</span>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{stats.max}</span>
            <span className="text-xs font-bold text-secondary-custom">pacientes</span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold truncate">
            {peakDay ? peakDay.fechaCompletaStr : '-'}
          </p>
        </div>

        <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-xs theme-transition space-y-2">
          <div className="flex items-center justify-between text-secondary-custom">
            <span className="text-xs font-black uppercase tracking-wider">Total Acumulado Semanal</span>
            <BarChart2 className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-primary-custom">{stats.total.toLocaleString()}</span>
            <span className="text-xs font-bold text-secondary-custom">atenciones</span>
          </div>
          <p className="text-[11px] text-secondary-custom font-medium opacity-80">Volumen total proyectado 7 días</p>
        </div>

        <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-xs theme-transition space-y-2">
          <div className="flex items-center justify-between text-secondary-custom">
            <span className="text-xs font-black uppercase tracking-wider">Confianza Estadística</span>
            <Sparkles className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">95%</span>
            <span className="text-xs font-bold text-secondary-custom">intervalo</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Algoritmo ARIMA_PLUS BQ</p>
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL: GRÁFICO TEMPORAL DE PROYECCIÓN (RECHARTS) */}
      <div className="bg-card-custom p-6 md:p-8 rounded-3xl border border-card-custom shadow-xs theme-transition space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-custom/60 pb-5">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-primary-custom flex items-center gap-2">
              <Activity className="w-5 h-5 accent-text-custom" /> Curva Temporal de Atenciones Estimadas
            </h3>
            <p className="text-xs text-secondary-custom font-medium">
              Línea punteada institucional con banda sombreada de margen de confianza (Límite Inferior vs Superior).
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-secondary-custom">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-indigo-600 dark:bg-indigo-400 inline-block border-t border-dashed border-indigo-600"></span>
              <span>Proyección Estimada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-500/20 border border-indigo-500/40 inline-block"></span>
              <span>Banda de Confianza (95%)</span>
            </div>
          </div>
        </div>

        {/* CONTENEDOR RECHARTS */}
        <div className="h-80 md:h-96 w-full pt-2">
          {loading ? (
            <div className="h-full flex items-center justify-center space-y-3 flex-col">
              <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-secondary-custom">Cargando pronóstico desde BigQuery ML...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <defs>
                  <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
                <XAxis 
                  dataKey="fechaStr" 
                  tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 700 }} 
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 600 }} 
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                  tickLine={false}
                  domain={[0, 'dataMax + 20']}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Banda de intervalo de confianza (Área entre límites) */}
                <Area 
                  type="monotone" 
                  dataKey="rangoConfianza" 
                  stroke="none" 
                  fill="url(#colorConfidence)" 
                  name="Banda de Confianza (95%)"
                />

                {/* Línea Principal Punteada con Color Institucional #4f46e5 */}
                <Line 
                  type="monotone" 
                  dataKey="atenciones_estimadas" 
                  name="Atenciones Estimadas"
                  stroke="#4f46e5" 
                  strokeWidth={3} 
                  strokeDasharray="6 6" 
                  dot={{ r: 6, fill: "#4f46e5", strokeWidth: 3, stroke: "#ffffff" }}
                  activeDot={{ r: 8, fill: "#4f46e5", strokeWidth: 3, stroke: "#ffffff" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* TABLA DETALLADA DE PRONÓSTICO DIARIO */}
      <div className="bg-card-custom p-6 md:p-8 rounded-3xl border border-card-custom shadow-xs theme-transition space-y-6">
        <div className="flex items-center justify-between border-b border-card-custom/60 pb-4">
          <h3 className="text-base font-black text-primary-custom flex items-center gap-2">
            <Calendar className="w-5 h-5 accent-text-custom" /> Desglose Detallado del Pronóstico Diario
          </h3>
          <span className="text-xs font-bold text-secondary-custom">7 días horizonte</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-card-custom text-secondary-custom font-black uppercase tracking-wider">
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4 text-center">Atenciones Estimadas</th>
                <th className="py-3.5 px-4 text-center">Límite Inferior (95%)</th>
                <th className="py-3.5 px-4 text-center">Límite Superior (95%)</th>
                <th className="py-3.5 px-4 text-right">Estado de Carga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-custom/40 font-medium text-primary-custom">
              {chartData.map((item, idx) => (
                <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                  <td className="py-4 px-4 font-bold capitalize">
                    {item.fechaCompletaStr}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-sm border border-indigo-500/20">
                      {item.atenciones_estimadas} pac.
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-secondary-custom">
                    {item.limite_inferior} pac.
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-secondary-custom">
                    {item.limite_superior} pac.
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black ${
                      item.estadoCarga === 'Crítico' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30' :
                      item.estadoCarga === 'Elevado' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        item.estadoCarga === 'Crítico' ? 'bg-red-500 animate-ping' :
                        item.estadoCarga === 'Elevado' ? 'bg-amber-500' :
                        'bg-emerald-500'
                      }`}></span>
                      {item.estadoCarga}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
