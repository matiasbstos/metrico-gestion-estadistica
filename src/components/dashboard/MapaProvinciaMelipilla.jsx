import React, { useState, useMemo } from 'react';
import { MapPin, Compass } from 'lucide-react';

export default function MapaProvinciaMelipilla({ demografiaStats, onComunaSelect, comunaSeleccionada }) {
  const [hoveredComuna, setHoveredComuna] = useState(null);

  // Normalizador de nombres de comunas
  const normalizeComuna = (raw = '') => {
    const c = String(raw).toUpperCase().normalize("NFD").replace(/[\u0300-\u06ff]/g, "").trim();
    if (c.includes('MELIPILLA')) return 'MELIPILLA';
    if (c.includes('CURACAVI')) return 'CURACAVÍ';
    if (c.includes('MARIA') || c.includes('PINTO')) return 'MARÍA PINTO';
    if (c.includes('PEDRO')) return 'SAN PEDRO';
    if (c.includes('ALHUE')) return 'ALHUÉ';
    return 'OTRAS';
  };

  // Cálculo de estadísticas por comuna de la Provincia de Melipilla
  const comunasData = useMemo(() => {
    const rawComunas = demografiaStats?.comunas || {};
    const total = demografiaStats?.total || 1;

    const map = {
      'CURACAVÍ': {
        id: 'CURACAVÍ',
        name: 'Curacaví',
        zone: 'Norte Provincial',
        count: 0,
        pct: 0,
        fill: '#a855f7',
        hoverFill: '#9333ea',
        border: 'border-purple-500/30',
        badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20',
        text: 'text-purple-600 dark:text-purple-400'
      },
      'MARÍA PINTO': {
        id: 'MARÍA PINTO',
        name: 'María Pinto',
        zone: 'Centro-Norte',
        count: 0,
        pct: 0,
        fill: '#ec4899',
        hoverFill: '#db2777',
        border: 'border-pink-500/30',
        badgeBg: 'bg-pink-500/10 text-pink-600 dark:text-pink-300 border-pink-500/20',
        text: 'text-pink-600 dark:text-pink-400'
      },
      'MELIPILLA': {
        id: 'MELIPILLA',
        name: 'Melipilla (Capital)',
        zone: 'Valle Central',
        count: 0,
        pct: 0,
        fill: '#38bdf8',
        hoverFill: '#0284c7',
        border: 'border-sky-500/30',
        badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/20',
        text: 'text-sky-600 dark:text-sky-400'
      },
      'SAN PEDRO': {
        id: 'SAN PEDRO',
        name: 'San Pedro',
        zone: 'Suroeste Provincial',
        count: 0,
        pct: 0,
        fill: '#22c55e',
        hoverFill: '#16a34a',
        border: 'border-emerald-500/30',
        badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-400'
      },
      'ALHUÉ': {
        id: 'ALHUÉ',
        name: 'Alhué',
        zone: 'Sureste Provincial',
        count: 0,
        pct: 0,
        fill: '#eab308',
        hoverFill: '#ca8a04',
        border: 'border-amber-500/30',
        badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20',
        text: 'text-amber-600 dark:text-amber-400'
      },
      'OTRAS': {
        id: 'OTRAS',
        name: 'Otras Comunas (Fuera Prov.)',
        zone: 'Región / País',
        count: 0,
        pct: 0,
        fill: '#64748b',
        hoverFill: '#475569',
        border: 'border-slate-500/30',
        badgeBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20',
        text: 'text-slate-600 dark:text-slate-400'
      }
    };

    Object.entries(rawComunas).forEach(([rawName, count]) => {
      const norm = normalizeComuna(rawName);
      if (map[norm]) {
        map[norm].count += count;
      } else {
        map['OTRAS'].count += count;
      }
    });

    Object.keys(map).forEach(key => {
      map[key].pct = Math.round((map[key].count / total) * 1000) / 10;
    });

    return map;
  }, [demografiaStats]);

  const activeComunaObj = hoveredComuna ? comunasData[hoveredComuna] : null;

  return (
    <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-xs space-y-6 theme-transition my-6">
      {/* HEADER DEL MAPA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-custom/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black text-primary-custom tracking-tight flex items-center gap-2">
              Mapa Interactivo de Origen • Provincia de Melipilla
            </h3>
            <p className="text-xs text-secondary-custom font-medium">
              Distribución territorial exclusiva de atenciones en las 5 comunas provinciales.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> 5 Comunas Provinciales
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* COLUMNA MAPA VECTORIAL INTERACTIVO (SVG EXCLUSIVO DE LA PROVINCIA) */}
        <div className="lg:col-span-7 relative flex items-center justify-center p-4 bg-slate-900/5 dark:bg-slate-950/40 rounded-3xl border border-card-custom/80 overflow-hidden">
          
          {/* Tooltip Flotante */}
          {activeComunaObj && (
            <div className="absolute top-4 left-4 z-20 bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl border border-indigo-500/30 shadow-2xl space-y-1 text-xs animate-fade-in pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeComunaObj.fill }}></span>
                <span className="font-black text-sm text-indigo-300">{activeComunaObj.name}</span>
              </div>
              <p className="text-[11px] text-slate-300 font-bold">
                Pacientes: <span className="text-white font-black">{activeComunaObj.count}</span> ({activeComunaObj.pct}%)
              </p>
              <p className="text-[10px] text-slate-400 font-medium">Zona: {activeComunaObj.zone}</p>
            </div>
          )}

          {/* SVG MAPA VECTORIAL DE LAS 5 COMUNAS */}
          <svg
            viewBox="0 0 600 650"
            className="w-full max-w-[480px] h-auto drop-shadow-2xl select-none transition-all duration-300"
          >
            {/* 1. CURACAVÍ (NORTE VIOLETA) */}
            <g
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredComuna('CURACAVÍ')}
              onMouseLeave={() => setHoveredComuna(null)}
              onClick={() => onComunaSelect && onComunaSelect('CURACAVÍ')}
            >
              <path
                d="M 310,40 C 360,25 430,40 460,75 C 490,110 500,165 470,205 C 440,230 380,240 340,240 C 300,230 270,185 270,140 C 275,100 290,65 310,40 Z"
                fill={hoveredComuna === 'CURACAVÍ' ? '#9333ea' : '#a855f7'}
                fillOpacity={hoveredComuna === 'CURACAVÍ' ? '0.95' : '0.85'}
                stroke="#6b21a8"
                strokeWidth={hoveredComuna === 'CURACAVÍ' ? '3.5' : '2'}
                className="transition-all duration-200 hover:drop-shadow-lg"
              />
              <text x="375" y="130" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle" className="pointer-events-none drop-shadow-md">
                CURACAVÍ
              </text>
              <text x="375" y="150" fill="#f3e8ff" fontSize="11" fontWeight="800" textAnchor="middle" className="pointer-events-none">
                {comunasData['CURACAVÍ']?.pct}%
              </text>
            </g>

            {/* 2. MARÍA PINTO (CENTRO-NORTE ROSA) */}
            <g
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredComuna('MARÍA PINTO')}
              onMouseLeave={() => setHoveredComuna(null)}
              onClick={() => onComunaSelect && onComunaSelect('MARÍA PINTO')}
            >
              <path
                d="M 270,215 C 320,225 390,230 435,225 C 465,255 450,285 415,295 C 370,305 310,310 260,300 C 235,285 235,245 270,215 Z"
                fill={hoveredComuna === 'MARÍA PINTO' ? '#db2777' : '#ec4899'}
                fillOpacity={hoveredComuna === 'MARÍA PINTO' ? '0.95' : '0.85'}
                stroke="#9d174d"
                strokeWidth={hoveredComuna === 'MARÍA PINTO' ? '3.5' : '2'}
                className="transition-all duration-200 hover:drop-shadow-lg"
              />
              <text x="345" y="260" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle" className="pointer-events-none drop-shadow-md">
                MARÍA PINTO
              </text>
              <text x="345" y="278" fill="#fce7f3" fontSize="11" fontWeight="800" textAnchor="middle" className="pointer-events-none">
                {comunasData['MARÍA PINTO']?.pct}%
              </text>
            </g>

            {/* 3. MELIPILLA (CENTRO CELESTE - CAPITAL) */}
            <g
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredComuna('MELIPILLA')}
              onMouseLeave={() => setHoveredComuna(null)}
              onClick={() => onComunaSelect && onComunaSelect('MELIPILLA')}
            >
              <path
                d="M 260,300 C 310,310 380,305 415,295 C 465,310 495,350 475,405 C 445,450 395,475 350,470 C 305,465 255,445 220,410 C 205,370 220,330 260,300 Z"
                fill={hoveredComuna === 'MELIPILLA' ? '#0284c7' : '#38bdf8'}
                fillOpacity={hoveredComuna === 'MELIPILLA' ? '0.95' : '0.85'}
                stroke="#075985"
                strokeWidth={hoveredComuna === 'MELIPILLA' ? '4' : '2.5'}
                className="transition-all duration-200 hover:drop-shadow-lg"
              />
              <text x="345" y="375" fill="#ffffff" fontSize="16" fontWeight="900" textAnchor="middle" className="pointer-events-none drop-shadow-md">
                MELIPILLA
              </text>
              <text x="345" y="398" fill="#e0f2fe" fontSize="13" fontWeight="900" textAnchor="middle" className="pointer-events-none">
                {comunasData['MELIPILLA']?.pct}% ({comunasData['MELIPILLA']?.count} pac.)
              </text>
            </g>

            {/* 4. SAN PEDRO (SUROESTE VERDE MENTA) */}
            <g
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredComuna('SAN PEDRO')}
              onMouseLeave={() => setHoveredComuna(null)}
              onClick={() => onComunaSelect && onComunaSelect('SAN PEDRO')}
            >
              <path
                d="M 110,365 C 165,345 210,355 220,410 C 255,445 295,475 315,520 C 275,565 195,570 125,545 C 65,515 45,445 110,365 Z"
                fill={hoveredComuna === 'SAN PEDRO' ? '#16a34a' : '#22c55e'}
                fillOpacity={hoveredComuna === 'SAN PEDRO' ? '0.95' : '0.85'}
                stroke="#14532d"
                strokeWidth={hoveredComuna === 'SAN PEDRO' ? '3.5' : '2'}
                className="transition-all duration-200 hover:drop-shadow-lg"
              />
              <text x="170" y="460" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle" className="pointer-events-none drop-shadow-md">
                SAN PEDRO
              </text>
              <text x="170" y="480" fill="#dcfce7" fontSize="11" fontWeight="800" textAnchor="middle" className="pointer-events-none">
                {comunasData['SAN PEDRO']?.pct}%
              </text>
            </g>

            {/* 5. ALHUÉ (SURESTE DORADO / BEIGE) */}
            <g
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setHoveredComuna('ALHUÉ')}
              onMouseLeave={() => setHoveredComuna(null)}
              onClick={() => onComunaSelect && onComunaSelect('ALHUÉ')}
            >
              <path
                d="M 350,470 C 395,475 445,450 475,405 C 525,435 565,490 545,550 C 515,595 415,605 345,575 C 315,550 315,520 350,470 Z"
                fill={hoveredComuna === 'ALHUÉ' ? '#ca8a04' : '#eab308'}
                fillOpacity={hoveredComuna === 'ALHUÉ' ? '0.95' : '0.85'}
                stroke="#713f12"
                strokeWidth={hoveredComuna === 'ALHUÉ' ? '3.5' : '2'}
                className="transition-all duration-200 hover:drop-shadow-lg"
              />
              <text x="445" y="520" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle" className="pointer-events-none drop-shadow-md">
                ALHUÉ
              </text>
              <text x="445" y="540" fill="#fef9c3" fontSize="11" fontWeight="800" textAnchor="middle" className="pointer-events-none">
                {comunasData['ALHUÉ']?.pct}%
              </text>
            </g>
          </svg>
        </div>

        {/* COLUMNA DERECHA: DESGLOSE Y TARJETAS INTERACTIVAS */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-secondary-custom tracking-wider">
              Participación Comunal
            </h4>
            <span className="text-[10px] text-secondary-custom font-bold">Total: {demografiaStats?.total || 0} pac.</span>
          </div>

          <div className="space-y-2.5">
            {Object.values(comunasData).map((com) => {
              const isSelected = hoveredComuna === com.id;
              return (
                <div
                  key={com.id}
                  onMouseEnter={() => setHoveredComuna(com.id)}
                  onMouseLeave={() => setHoveredComuna(null)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected 
                      ? `${com.border} bg-slate-100 dark:bg-slate-800/90 shadow-md scale-[1.01]` 
                      : 'border-card-custom bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-xs" 
                      style={{ backgroundColor: com.fill }}
                    ></span>
                    <div>
                      <h5 className="text-xs font-black text-primary-custom">{com.name}</h5>
                      <span className="text-[10px] text-secondary-custom font-medium">{com.zone}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="text-xs font-black text-primary-custom">{com.count} pac.</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${com.badgeBg}`}>
                        {com.pct}%
                      </span>
                    </div>
                    {/* BARRA DE PROGRESO */}
                    <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden ml-auto">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, com.pct)}%`, backgroundColor: com.fill }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
