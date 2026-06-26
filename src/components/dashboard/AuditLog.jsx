import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Shield, Search, Clock, User, Activity } from 'lucide-react';

export default function AuditLog({ db, appId, centroActivo }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!db || !appId) return;
    
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'audit_logs'),
      orderBy('fecha', 'desc'),
      limit(100)
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
    const term = searchTerm.toLowerCase();
    return (
      (log.accion && log.accion.toLowerCase().includes(term)) ||
      (log.centro && log.centro.toLowerCase().includes(term)) ||
      (log.usuario && log.usuario.toLowerCase().includes(term)) ||
      (log.detalles && log.detalles.toLowerCase().includes(term))
    );
  });

  const getActionColor = (action) => {
    if (!action) return 'bg-slate-100 text-slate-600';
    if (action.includes('Carga')) return 'bg-emerald-100 text-emerald-700';
    if (action.includes('Edición')) return 'bg-blue-100 text-blue-700';
    if (action.includes('Eliminación')) return 'bg-rose-100 text-rose-700';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-indigo-600 w-6 h-6"/> Registro de Auditoría
          </h2>
          <p className="text-sm text-slate-500 mt-1">Historial de acciones y modificaciones del sistema.</p>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar registros..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto border border-slate-200 rounded-lg bg-slate-50">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold sticky top-0 z-10">
            <tr>
              <th className="p-4"><div className="flex items-center gap-2"><Clock className="w-4 h-4"/> Fecha y Hora</div></th>
              <th className="p-4"><div className="flex items-center gap-2"><Activity className="w-4 h-4"/> Acción</div></th>
              <th className="p-4"><div className="flex items-center gap-2"><User className="w-4 h-4"/> Usuario / Centro</div></th>
              <th className="p-4 w-full">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-8 text-center text-slate-400">Cargando registros...</td></tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-slate-400">No se encontraron registros.</td></tr>
            ) : (
              filteredLogs.map(log => {
                const dateObj = new Date(log.fecha);
                const dateStr = dateObj.toLocaleDateString();
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-white transition bg-slate-50/50">
                    <td className="p-4 text-slate-600">
                      <span className="font-bold">{dateStr}</span> <span className="text-xs">{timeStr}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getActionColor(log.accion)}`}>
                        {log.accion}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-700">{log.usuario}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wide">{log.centro}</div>
                    </td>
                    <td className="p-4 text-slate-600 whitespace-normal text-xs">{log.detalles}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
