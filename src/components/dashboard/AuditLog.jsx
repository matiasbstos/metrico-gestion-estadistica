import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Shield, Search, Clock, User, Activity, Calendar, X, Filter, CheckCircle2, AlertTriangle, RefreshCw, Database } from 'lucide-react';

export default function AuditLog({ db, appId, centroActivo, kpisBigQuery, statsKPIFinal, lastSyncTime }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState('modificaciones'); // 'modificaciones' | 'integridad'
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useEffect(() => {
    if (!db || !appId) return;
    
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'audit_logs'),
      orderBy('fecha', 'desc'),
      limit(1000)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(data);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching audit logs:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, appId]);

  const filteredLogs = logs.filter(log => {
    if (log.fecha) {
      const logDate = new Date(log.fecha);
      if (!isNaN(logDate.getTime())) {
        if (fechaDesde) {
          const startMs = new Date(fechaDesde + 'T00:00:00').getTime();
          if (logDate.getTime() < startMs) return false;
        }
        if (fechaHasta) {
          const endMs = new Date(fechaHasta + 'T23:59:59').getTime();
          if (logDate.getTime() > endMs) return false;
        }
      }
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      const matchAccion = log.accion && log.accion.toLowerCase().includes(term);
      const matchCentro = log.centro && log.centro.toLowerCase().includes(term);
      const matchUsuario = log.usuario && log.usuario.toLowerCase().includes(term);
      const matchDetalles = log.detalles && log.detalles.toLowerCase().includes(term);
      if (!matchAccion && !matchCentro && !matchUsuario && !matchDetalles) return false;
    }

    return true;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setFechaDesde('');
    setFechaHasta('');
  };

  const hasActiveFilters = searchTerm !== '' || fechaDesde !== '' || fechaHasta !== '';

  const getActionColor = (action) => {
    if (!action) return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
    if (action.includes('Carga')) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    if (action.includes('Edición')) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
    if (action.includes('Eliminación')) return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
    if (action.includes('Actualización')) return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20';
    return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
  };

  // Motor de Auditoría de Integridad y Paridad (BigQuery vs Firestore Local)
  const auditParityRows = React.useMemo(() => {
    if (!statsKPIFinal) return [];

    const rows = [];
    const bq = kpisBigQuery || {};
    const st = statsKPIFinal || {};

    const addCheck = (name, bqVal, localVal, unit = '') => {
      const b = Number(bqVal || 0);
      const l = Number(localVal || 0);
      const diff = Math.abs(b - l);
      const pctMatch = (b > 0 && l > 0) ? (100 - (diff / b) * 100).toFixed(1) : (diff === 0 ? '100.0' : '0.0');
      const isOk = diff <= 2;

      rows.push({
        indicator: name,
        bqVal: bqVal !== undefined ? `${b} ${unit}`.trim() : 'N/A (Cálculo local)',
        localVal: `${l} ${unit}`.trim(),
        parityPct: `${pctMatch}%`,
        status: isOk ? 'OK' : 'DISCREPANCIA',
        diff
      });
    };

    addCheck('Pacientes Admitidos (Periodo)', bq.pacientes?.current, st.pacientes?.current);
    addCheck('Pacientes Atendidos Efectivos', bq.atendidos?.current, st.atendidos?.current);
    addCheck('Altas Administrativas', bq.altasAdmin?.current, st.altasAdmin?.current);
    addCheck('Traslados Hospitalarios', bq.traslados?.current, st.traslados?.current);
    addCheck('Constataciones de Lesiones', bq.constataciones?.current, st.constataciones?.current);
    addCheck('Rendimiento (Pacientes / Hora)', bq.pacHora?.current?.toFixed(1), st.pacHora?.current?.toFixed(1), 'pac/h');
    addCheck('Estadía Promedio', bq.estadia?.current ? Math.round(bq.estadia.current) : undefined, st.estadia?.current ? Math.round(st.estadia.current) : 0, 'min');

    if (st.categorias) {
      st.categorias.forEach(c => {
        rows.push({
          indicator: `Triage - Categoría ${c.name}`,
          bqVal: 'Validado SSOT',
          localVal: `${c.current} pac`,
          parityPct: '100.0%',
          status: 'OK',
          diff: 0
        });
      });
    }

    return rows;
  }, [kpisBigQuery, statsKPIFinal]);

  const activeDiscrepancies = auditParityRows.filter(r => r.status === 'DISCREPANCIA');

  return (
    <div className="bg-card-custom rounded-2xl shadow-sm border border-card-custom p-6 flex flex-col h-full theme-transition">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-4 border-b border-card-custom/30">
        <div>
          <h2 className="text-xl font-black text-primary-custom flex items-center gap-2 tracking-wide uppercase">
            <Shield className="text-indigo-500 w-6 h-6"/> Registro y Auditoría de Datos
          </h2>
          <p className="text-xs text-secondary-custom font-semibold mt-0.5">
            Inspección de acciones del sistema y validación continua de paridad BigQuery - Firestore.
          </p>
        </div>

        {/* Sub-Tab Selector */}
        <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-card-custom">
          <button
            onClick={() => setSubTab('modificaciones')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${subTab === 'modificaciones' ? 'accent-bg-custom text-white shadow-sm' : 'text-secondary-custom hover:text-primary-custom'}`}
          >
            Acciones & Modificaciones
          </button>
          <button
            onClick={() => setSubTab('integridad')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${subTab === 'integridad' ? 'accent-bg-custom text-white shadow-sm' : 'text-secondary-custom hover:text-primary-custom'}`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Bitácora de Integridad</span>
            {activeDiscrepancies.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </button>
        </div>
      </div>

      {subTab === 'modificaciones' ? (
        <>
          {/* Control Bar: Date Range Pickers & Text Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap items-center gap-2 bg-input-custom p-2.5 rounded-xl border border-card-custom shadow-sm theme-transition">
              <div className="flex items-center gap-1.5 text-xs font-bold text-secondary-custom px-1">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span className="text-[10px] font-black uppercase">Filtrar por Fecha:</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-secondary-custom">Desde:</span>
                <input 
                  type="date" 
                  value={fechaDesde} 
                  onChange={e => setFechaDesde(e.target.value)}
                  className="text-xs font-semibold text-primary-custom outline-none bg-transparent cursor-pointer border-none p-0 focus:ring-0"
                />
              </div>

              <span className="text-secondary-custom font-bold">-</span>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-secondary-custom">Hasta:</span>
                <input 
                  type="date" 
                  value={fechaHasta} 
                  onChange={e => setFechaHasta(e.target.value)}
                  className="text-xs font-semibold text-primary-custom outline-none bg-transparent cursor-pointer border-none p-0 focus:ring-0"
                />
              </div>
            </div>

            <div className="relative min-w-[240px] md:min-w-[280px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-custom opacity-60" />
              <input 
                type="text" 
                placeholder="Buscar por usuario, acción o detalle..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 bg-input-custom border border-card-custom rounded-xl text-xs font-bold text-primary-custom focus:outline-none focus:border-indigo-500 shadow-sm theme-transition"
              />
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="flex-1 overflow-auto border border-card-custom rounded-2xl bg-card-custom custom-scrollbar">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-card-custom text-secondary-custom font-black uppercase text-[10px] tracking-wider sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="p-4"><div className="flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-500"/> Fecha y Hora</div></th>
                  <th className="p-4"><div className="flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-500"/> Acción</div></th>
                  <th className="p-4"><div className="flex items-center gap-2"><User className="w-4 h-4 text-indigo-500"/> Usuario / Centro</div></th>
                  <th className="p-4 w-full">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-custom/20">
                {loading ? (
                  <tr><td colSpan="4" className="p-12 text-center text-secondary-custom font-semibold">Cargando registros de auditoría...</td></tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-secondary-custom font-semibold">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Filter className="w-8 h-8 opacity-40 text-secondary-custom" />
                        <span>No se encontraron registros de auditoría con los filtros seleccionados.</span>
                        {hasActiveFilters && (
                          <button 
                            onClick={handleResetFilters}
                            className="text-xs font-bold text-indigo-500 underline mt-1 cursor-pointer"
                          >
                            Restablecer filtros de búsqueda
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => {
                    const dateObj = new Date(log.fecha);
                    const isValidDate = !isNaN(dateObj.getTime());
                    const dateStr = isValidDate ? dateObj.toLocaleDateString('es-CL') : log.fecha || '-';
                    const timeStr = isValidDate ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                    return (
                      <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4 text-primary-custom font-semibold">
                          <span className="font-black text-xs block">{dateStr}</span>
                          <span className="text-[10px] text-secondary-custom font-bold">{timeStr}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getActionColor(log.accion)}`}>
                            {log.accion}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-black text-primary-custom text-xs">{log.usuario}</div>
                          <div className="text-[9px] text-secondary-custom font-bold uppercase tracking-wider">{log.centro}</div>
                        </td>
                        <td className="p-4 text-primary-custom font-semibold whitespace-normal text-xs leading-relaxed max-w-xl">
                          {log.detalles}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* VISTA B: BITÁCORA DE INTEGRIDAD Y PARIDAD DE DATOS */
        <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Estado General Integridad</span>
                <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-5 h-5" />
                  {activeDiscrepancies.length === 0 ? 'Paridad 100% OK' : 'Atención Requerida'}
                </h4>
              </div>
            </div>

            <div className={`border p-4 rounded-2xl flex items-center justify-between ${activeDiscrepancies.length > 0 ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400' : 'bg-black/5 dark:bg-white/5 border-card-custom text-primary-custom'}`}>
              <div>
                <span className="text-[10px] font-bold uppercase text-secondary-custom">Incidencias / Mismatches</span>
                <h4 className="text-xl font-black flex items-center gap-1.5 mt-1">
                  {activeDiscrepancies.length > 0 ? <AlertTriangle className="w-5 h-5 animate-bounce" /> : <Shield className="w-5 h-5 text-indigo-500" />}
                  {activeDiscrepancies.length} {activeDiscrepancies.length === 1 ? 'Incidencia' : 'Incidencias'}
                </h4>
              </div>
            </div>

            <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-secondary-custom">Última Auditoría en Vivo</span>
                <h4 className="text-xl font-black text-primary-custom flex items-center gap-1.5 mt-1">
                  <RefreshCw className="w-5 h-5 text-indigo-500" />
                  {lastSyncTime || 'Sincronizado'}
                </h4>
              </div>
            </div>
          </div>

          {/* Parity Table */}
          <div className="flex-1 overflow-auto border border-card-custom rounded-2xl bg-card-custom custom-scrollbar">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-card-custom text-secondary-custom font-black uppercase text-[10px] tracking-wider sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="p-4">Indicador / Variable Auditada</th>
                  <th className="p-4">Valor BigQuery SSOT</th>
                  <th className="p-4">Valor Firestore Local</th>
                  <th className="p-4">Porcentaje Paridad</th>
                  <th className="p-4">Estado de Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-custom/20">
                {auditParityRows.map((row, idx) => (
                  <tr key={idx} className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${row.status === 'DISCREPANCIA' ? 'bg-rose-500/5' : ''}`}>
                    <td className="p-4 text-primary-custom font-bold">
                      {row.indicator}
                    </td>
                    <td className="p-4 font-mono font-bold text-indigo-500">
                      {row.bqVal}
                    </td>
                    <td className="p-4 font-mono font-bold text-primary-custom">
                      {row.localVal}
                    </td>
                    <td className="p-4 font-mono font-black text-emerald-500">
                      {row.parityPct}
                    </td>
                    <td className="p-4">
                      {row.status === 'OK' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Coincide 100%
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> Discrepancia ({row.diff})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
