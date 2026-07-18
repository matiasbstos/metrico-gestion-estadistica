import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalisisComparativoTriple({ pacientesDB, turnosDB }) {
  const subtractDays = (dateStr, days) => {
    const d = new Date(dateStr + "T12:00:00"); 
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const today = new Date().toISOString().split('T')[0];
  const [fechaA, setFechaA] = useState(today);
  const [fechaB, setFechaB] = useState(subtractDays(today, 7));
  const [fechaC, setFechaC] = useState(subtractDays(today, 364));

  const datesToCompare = [
    { label: 'Periodo 1', date: fechaA, setter: setFechaA, short: 'Fecha 1', color: '#3b82f6' },
    { label: 'Periodo 2', date: fechaB, setter: setFechaB, short: 'Fecha 2', color: '#8b5cf6' },
    { label: 'Periodo 3', date: fechaC, setter: setFechaC, short: 'Fecha 3', color: '#10b981' }
  ];

  const metrics = useMemo(() => {
    const getStatsForDate = (date) => {
      const turnosDelDia = turnosDB.filter(t => t.fechaInicio === date || (t.fechaInicio <= date && t.fechaFin >= date));
      
      const pacs = pacientesDB.filter(p => {
        if (!p.tAdmision) return false;
        const pDate = new Date(p.tAdmision).toISOString().split('T')[0];
        return pDate === date;
      });

      let total = 0, c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0;
      
      if (turnosDelDia.length > 0) {
        turnosDelDia.forEach(t => {
          total += Number(t.totalPacientes || 0);
          c1 += Number(t.c1 || 0);
          c2 += Number(t.c2 || 0);
          c3 += Number(t.c3 || 0) + Number(t.c3_z518 || 0);
          c4 += Number(t.c4 || 0);
          c5 += Number(t.c5 || 0);
        });
      } else {
        total = pacs.length;
        pacs.forEach(p => {
          const c = String(p.categoria).toLowerCase();
          if (c.includes('c1')) c1++;
          else if (c.includes('c2')) c2++;
          else if (c.includes('c3')) c3++;
          else if (c.includes('c4')) c4++;
          else if (c.includes('c5')) c5++;
        });
      }

      return { total, c1, c2, c3, c4, c5 };
    };

    const res = {};
    datesToCompare.forEach(d => {
      res[d.date] = getStatsForDate(d.date);
    });
    return res;
  }, [fechaA, fechaB, fechaC, turnosDB, pacientesDB]);

  const chartData = [
    { name: 'C1', [datesToCompare[2].short]: metrics[fechaC].c1, [datesToCompare[1].short]: metrics[fechaB].c1, [datesToCompare[0].short]: metrics[fechaA].c1 },
    { name: 'C2', [datesToCompare[2].short]: metrics[fechaC].c2, [datesToCompare[1].short]: metrics[fechaB].c2, [datesToCompare[0].short]: metrics[fechaA].c2 },
    { name: 'C3', [datesToCompare[2].short]: metrics[fechaC].c3, [datesToCompare[1].short]: metrics[fechaB].c3, [datesToCompare[0].short]: metrics[fechaA].c3 },
    { name: 'C4', [datesToCompare[2].short]: metrics[fechaC].c4, [datesToCompare[1].short]: metrics[fechaB].c4, [datesToCompare[0].short]: metrics[fechaA].c4 },
    { name: 'C5', [datesToCompare[2].short]: metrics[fechaC].c5, [datesToCompare[1].short]: metrics[fechaB].c5, [datesToCompare[0].short]: metrics[fechaA].c5 },
  ];

  const getTrendIcon = (current, previous) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-rose-500" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-emerald-500" />;
    return <Minus className="w-4 h-4 text-secondary-custom opacity-70" />;
  };

  const getPercentChange = (current, previous) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const diff = current - previous;
    const perc = (diff / previous) * 100;
    return `${perc > 0 ? '+' : ''}${perc.toFixed(1)}%`;
  };

  // Custom tooltips acting as mini-dashboards with delta calculation
  const CustomComparativoTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const getVal = (dateShortName) => {
        const item = payload.find(p => p.name === dateShortName);
        return item ? item.value : 0;
      };

      const val1 = getVal('Fecha 1');
      const val2 = getVal('Fecha 2');
      const val3 = getVal('Fecha 3');

      return (
        <div className="bg-card-custom border border-card-custom p-4 rounded-2xl shadow-xl min-w-[210px] space-y-2.5 text-xs font-bold theme-transition">
          <p className="text-sm font-black text-primary-custom border-b border-card-custom pb-1.5 uppercase tracking-wider">
            Categoría {label}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-blue-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>
                Fecha 1:
              </span>
              <span className="text-sm font-black">{val1}</span>
            </div>

            <div className="flex justify-between items-center text-purple-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></span>
                Fecha 2:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black">{val2}</span>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm ${val1 > val2 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : val1 < val2 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-black/5 text-secondary-custom'}`}>
                  {val2 > 0 ? getPercentChange(val1, val2) : '0%'}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-emerald-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                Fecha 3:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black">{val3}</span>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm ${val1 > val3 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : val1 < val3 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-black/5 text-secondary-custom'}`}>
                  {val3 > 0 ? getPercentChange(val1, val3) : '0%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto theme-transition">
      <div className="flex items-center justify-between bg-card-custom p-4 rounded-2xl shadow-sm border border-card-custom">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl">
            <Calendar className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-primary-custom">Análisis Comparativo Triple</h2>
            <p className="text-xs font-bold text-secondary-custom opacity-85">Selecciona tres fechas independientes para cruzar su rendimiento</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {datesToCompare.map((d, i) => {
          const stats = metrics[d.date];
          const prevStats = i === 0 ? metrics[datesToCompare[1].date] : i === 1 ? metrics[datesToCompare[2].date] : null;
          
          return (
            <div key={d.date} className="bg-card-custom rounded-3xl shadow-sm border-t-4 p-6 relative overflow-hidden border border-card-custom" style={{ borderTopColor: d.color }}>
              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-10" style={{ backgroundColor: d.color }}></div>
              <h3 className="text-sm font-bold text-secondary-custom uppercase tracking-wider mb-2">{d.label}</h3>
              <input 
                type="date" 
                value={d.date} 
                onChange={(e) => d.setter(e.target.value)}
                className="w-full border-2 rounded-xl p-2 text-sm font-black text-primary-custom outline-none focus:border-indigo-500 mb-6 bg-input-custom transition-all cursor-pointer"
                style={{ borderColor: `${d.color}40` }}
              />
              
              <div className="flex items-end gap-3 mb-6">
                <div>
                  <p className="text-[10px] font-bold text-secondary-custom uppercase">Volumen Total</p>
                  <p className="text-4xl font-black text-primary-custom">{stats.total}</p>
                </div>
                {prevStats && (
                  <div className={`flex items-center gap-1 text-xs font-bold mb-1 ${stats.total < prevStats.total ? 'text-rose-500' : stats.total > prevStats.total ? 'text-emerald-500' : 'text-secondary-custom'}`}>
                    {getTrendIcon(stats.total, prevStats.total)}
                    {getPercentChange(stats.total, prevStats.total)}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {[
                  { key: 'c1', color: 'bg-red-500' },
                  { key: 'c2', color: 'bg-orange-500' },
                  { key: 'c3', color: 'bg-yellow-500' },
                  { key: 'c4', color: 'bg-emerald-500' },
                  { key: 'c5', color: 'bg-blue-500' }
                ].map(cat => (
                  <div key={cat.key} className="flex items-center justify-between border-b border-card-custom/30 pb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>
                      <span className="text-xs font-bold text-secondary-custom uppercase">{cat.key}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-primary-custom">{stats[cat.key]}</span>
                      {prevStats && (
                        <span className={`text-[10px] font-bold w-12 text-right ${stats[cat.key] < prevStats[cat.key] ? 'text-rose-400' : stats[cat.key] > prevStats[cat.key] ? 'text-emerald-400' : 'text-secondary-custom opacity-55'}`}>
                          {getPercentChange(stats[cat.key], prevStats[cat.key])}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-card-custom p-6 rounded-3xl shadow-sm border border-card-custom">
        <h3 className="text-sm font-black text-primary-custom uppercase tracking-wider mb-6">Comparativa por Categoría de Triaje</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 'bold' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                content={<CustomComparativoTooltip />}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
              <Bar dataKey={datesToCompare[2].short} name="Periodo 3" fill={datesToCompare[2].color} radius={[4, 4, 0, 0]} />
              <Bar dataKey={datesToCompare[1].short} name="Periodo 2" fill={datesToCompare[1].color} radius={[4, 4, 0, 0]} />
              <Bar dataKey={datesToCompare[0].short} name="Periodo 1" fill={datesToCompare[0].color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
