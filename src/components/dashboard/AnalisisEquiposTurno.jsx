import React, { useMemo } from 'react';
import { Users, UserX, Clock, Activity, BarChart2 } from 'lucide-react';
import InfoTooltip from '../InfoTooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AnalisisEquiposTurno({ turnosFiltrados, pacientesFiltrados }) {
  const dataEquipos = useMemo(() => {
    const equipos = {
      'Turno 1': { name: 'Turno 1', lotes: new Set(), totalPacientes: 0, altasAdmin: 0, totalHoras: 0, sumEspera: 0, countEspera: 0, sumTotal: 0, countTotal: 0, fill: '#10b981' }, // Verde
      'Turno 2': { name: 'Turno 2', lotes: new Set(), totalPacientes: 0, altasAdmin: 0, totalHoras: 0, sumEspera: 0, countEspera: 0, sumTotal: 0, countTotal: 0, fill: '#facc15' }, // Amarillo
      'Turno 3': { name: 'Turno 3', lotes: new Set(), totalPacientes: 0, altasAdmin: 0, totalHoras: 0, sumEspera: 0, countEspera: 0, sumTotal: 0, countTotal: 0, fill: '#3b82f6' }, // Azul
      'Turno 4': { name: 'Turno 4', lotes: new Set(), totalPacientes: 0, altasAdmin: 0, totalHoras: 0, sumEspera: 0, countEspera: 0, sumTotal: 0, countTotal: 0, fill: '#f97316' }, // Naranja
      'Sin Asignar': { name: 'Sin Asignar', lotes: new Set(), totalPacientes: 0, altasAdmin: 0, totalHoras: 0, sumEspera: 0, countEspera: 0, sumTotal: 0, countTotal: 0, fill: '#94a3b8' } // Gris
    };

    turnosFiltrados.forEach(t => {
      const eq = t.equipoTurno;
      if (equipos[eq]) {
        equipos[eq].lotes.add(t.loteId);
        equipos[eq].totalPacientes += Number(t.totalPacientes || 0);
        equipos[eq].altasAdmin += Number(t.altasAdmin || 0);
        equipos[eq].totalHoras += String(t.horario||'').includes('17:00') ? 15 : 12;
      }
    });

    pacientesFiltrados.forEach(p => {
      let matchedEq = null;
      for (const eq in equipos) {
        if (equipos[eq].lotes.has(p.loteId)) {
          matchedEq = eq;
          break;
        }
      }
      if (matchedEq) {
        if (p.tAdmision && p.tCat1) {
          const diffMin = (p.tCat1 - p.tAdmision) / 60000;
          if (diffMin >= 0 && diffMin < 1440) { 
            equipos[matchedEq].sumEspera += diffMin;
            equipos[matchedEq].countEspera++;
          }
        }
        if (p.tAdmision && p.tAlta) {
          const diffMin = (p.tAlta - p.tAdmision) / 60000;
          if (diffMin >= 0 && diffMin < 2880) { 
            equipos[matchedEq].sumTotal += diffMin;
            equipos[matchedEq].countTotal++;
          }
        }
      }
    });

    return Object.values(equipos).map(e => {
      const pctAltas = e.totalPacientes > 0 ? Number(((e.altasAdmin / e.totalPacientes) * 100).toFixed(1)) : 0;
      const promEspera = e.countEspera > 0 ? Math.round(e.sumEspera / e.countEspera) : 0;
      const promTotal = e.countTotal > 0 ? Math.round(e.sumTotal / e.countTotal) : 0;
      const pacHora = e.totalHoras > 0 ? e.totalPacientes / e.totalHoras : 0;

      return {
        ...e, pctAltas, promEspera, promTotal, pacHora
      };
    });
  }, [turnosFiltrados, pacientesFiltrados]);

  const highlights = useMemo(() => {
    if (!dataEquipos || dataEquipos.length === 0) return {};
    const validEq = dataEquipos.filter(e => e.totalPacientes > 0);
    if (validEq.length === 0) return {};

    const maxPacientes = [...validEq].sort((a,b) => b.totalPacientes - a.totalPacientes)[0];
    const maxAltas = [...validEq].sort((a,b) => b.pctAltas - a.pctAltas)[0];
    const maxEspera = [...validEq].filter(e => e.promEspera > 0).sort((a,b) => b.promEspera - a.promEspera)[0];
    const minTotal = [...validEq].filter(e => e.promTotal > 0).sort((a,b) => a.promTotal - b.promTotal)[0];

    return {
      totalPacientes: maxPacientes ? { name: maxPacientes.name, text: 'Mayor Volumen', icon: '🏆', color: 'text-blue-600', bg: 'bg-blue-50' } : null,
      pctAltas: maxAltas ? { name: maxAltas.name, text: 'Mayor % Altas', icon: '⚡', color: 'text-sky-600', bg: 'bg-sky-50' } : null,
      promEspera: maxEspera ? { name: maxEspera.name, text: 'Mayor T. Espera', icon: '⚠️', color: 'text-amber-600', bg: 'bg-amber-50' } : null,
      promTotal: minTotal ? { name: minTotal.name, text: 'Menor Estadía', icon: '⭐', color: 'text-emerald-600', bg: 'bg-emerald-50' } : null,
    };
  }, [dataEquipos]);

  const CustomTooltip = ({ active, payload, label, suffix = '' }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100 text-xs">
          <p className="font-bold text-slate-700 mb-1">{label}</p>
          <p className="text-slate-600">
            <span className="font-bold" style={{color: payload[0].payload.fill}}>{payload[0].value}</span> {suffix}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderMiniChart = (dataKey, title, icon, suffix = '') => {
    const highlight = highlights[dataKey];
    return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col items-center relative">
      <div className="flex items-center gap-2 mb-4 w-full">
        {icon}
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{title}</span>
      </div>
      {highlight && (
        <div className={`absolute top-3 right-3 ${highlight.bg} ${highlight.color} px-2 py-1 rounded text-[9px] font-black tracking-wide flex items-center gap-1`} title={highlight.text}>
          <span>{highlight.icon}</span> {highlight.name}
        </div>
      )}
      <div className="w-full h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dataEquipos} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
            <RechartsTooltip content={<CustomTooltip suffix={suffix} />} cursor={{fill: '#f8fafc'}} />
            <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
              {dataEquipos.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )};

  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-6 shadow-inner">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <BarChart2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800">Comparativa de Equipos (Turnos)</h2>
          <p className="text-xs text-slate-500">Rendimiento entre Turno 1, Turno 2 y Turno 3</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderMiniChart('totalPacientes', 'Cantidad de Pacientes', <Users className="w-4 h-4 text-blue-500"/>, 'pacientes')}
        {renderMiniChart('pctAltas', '% Altas Administrativas', <UserX className="w-4 h-4 text-rose-500"/>, '%')}
        {renderMiniChart('promEspera', 'T. Espera (Triaje)', <Clock className="w-4 h-4 text-amber-500"/>, 'min')}
        {renderMiniChart('promTotal', 'T. Total (Estadía)', <Activity className="w-4 h-4 text-emerald-500"/>, 'min')}
      </div>
    </div>
  );
}
