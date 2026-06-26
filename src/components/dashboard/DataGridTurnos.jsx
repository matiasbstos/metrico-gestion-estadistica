import React from 'react';
import { Layers, Edit2, Trash2 } from 'lucide-react';
import { COLORS } from '../../config/constants';

export default function DataGridTurnos({
  turnosPaginados,
  paginaTurnos,
  setPaginaTurnos,
  totalPaginasTurnos,
  setEditModal,
  setDeleteConfirm,
  userProfile
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Layers className="text-blue-500 w-5 h-5"/> Últimos Turnos Cargados</h2>
        <div className="flex gap-2">
          <button onClick={() => setPaginaTurnos(Math.max(1, paginaTurnos - 1))} disabled={paginaTurnos === 1} className="px-3 py-1 bg-slate-100 text-slate-600 rounded disabled:opacity-50 text-xs font-bold transition-opacity">Anterior</button>
          <span className="px-3 py-1 text-xs font-bold text-slate-500 bg-slate-50 rounded border border-slate-100">Pág {paginaTurnos} de {totalPaginasTurnos}</span>
          <button onClick={() => setPaginaTurnos(Math.min(totalPaginasTurnos, paginaTurnos + 1))} disabled={paginaTurnos === totalPaginasTurnos} className="px-3 py-1 bg-slate-100 text-slate-600 rounded disabled:opacity-50 text-xs font-bold transition-opacity">Siguiente</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px] whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-y border-slate-200">
              <th className="p-3">Lote / ID</th>
              <th className="p-3">Tipo de Carga</th>
              <th className="p-3">Fechas</th>
              <th className="p-3">Horario</th>
              <th className="p-3 text-center">Total Pacientes</th>
              <th className="p-3 text-center">Altas Admin</th>
              <th className="p-3 text-center">C1 - C5</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {turnosPaginados.map(t => {
              return (
                <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                  <td className="p-3">
                    <div className="font-bold text-slate-700">{t.loteId}</div>
                    <div className="text-[9px] text-slate-400">{new Date(t.creadoEl).toLocaleString()}</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded font-bold ${t.tipo === 'Masiva' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{t.tipo}</span>
                    {t.equipoTurno && t.equipoTurno !== 'Sin Asignar' && (
                      <span className="block mt-1 text-[10px] font-bold text-indigo-500">{t.equipoTurno}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="text-slate-600">{t.fechaInicio}</div>
                    {t.fechaFin !== t.fechaInicio && <div className="text-slate-400">al {t.fechaFin}</div>}
                  </td>
                  <td className="p-3 font-medium text-slate-600">{t.horario}</td>
                  <td className="p-3 text-center font-black text-blue-600 text-sm">{t.totalPacientes}</td>
                  <td className="p-3 text-center">
                    <div className="font-bold text-rose-500">{t.altasAdmin}</div>
                    {t.totalPacientes > 0 && (
                      <div className={`text-[9px] px-1 py-0.5 rounded inline-block mt-0.5 ${(t.altasAdmin / t.totalPacientes) * 100 > 5 ? 'bg-rose-100 text-rose-700 font-bold' : 'text-slate-400'}`}>
                        {((t.altasAdmin / t.totalPacientes) * 100).toFixed(1)}%
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-1">
                       <span className="text-[10px] bg-red-50 text-red-600 px-1 rounded" title="C1">{t.c1||0}</span>
                       <span className="text-[10px] bg-orange-50 text-orange-600 px-1 rounded" title="C2">{t.c2||0}</span>
                       <span className="text-[10px] bg-yellow-50 text-yellow-600 px-1 rounded" title="C3">{t.c3||0 + (t.c3_z518||0)}</span>
                       <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1 rounded" title="C4">{t.c4||0}</span>
                       <span className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded" title="C5">{t.c5||0}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                       {userProfile?.rol === 'global' ? (
                         <>
                           <button onClick={() => setEditModal(t)} className="p-1.5 bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-600 rounded transition" title="Editar Turno"><Edit2 className="w-3.5 h-3.5"/></button>
                           <button onClick={() => setDeleteConfirm(t)} className="p-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 rounded transition" title="Eliminar Turno"><Trash2 className="w-3.5 h-3.5"/></button>
                         </>
                       ) : (
                         <span className="text-[9px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded border border-slate-100">Solo Lectura</span>
                       )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {turnosPaginados.length === 0 && (
               <tr><td colSpan="8" className="p-6 text-center text-slate-400">No hay turnos cargados en el sistema.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
