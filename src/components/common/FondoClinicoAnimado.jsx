import React from 'react';

export default function FondoClinicoAnimado({ variant = 'dark', className = '' }) {
  const isDark = variant === 'dark';

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}>
      {/* Cuadrícula clínica médica de fondo */}
      <div 
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle, ${isDark ? '#38bdf8' : '#4f46e5'} 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Orbes de luz ambiental biomédica con respiración orgánica */}
      <div 
        className="absolute -top-32 -left-32 w-[580px] h-[580px] rounded-full blur-[120px] opacity-40 animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(56, 189, 248, 0.1) 60%, transparent 80%)',
          animationDuration: '6s'
        }}
      />
      <div 
        className="absolute -bottom-32 -right-32 w-[620px] h-[620px] rounded-full blur-[130px] opacity-35 animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, rgba(99, 102, 241, 0.12) 60%, transparent 80%)',
          animationDuration: '8s',
          animationDelay: '2s'
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full blur-[140px] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(79, 70, 229, 0.25) 0%, transparent 70%)'
        }}
      />

      {/* Líneas de Pulso Cardiaco ECG Animadas */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 dark:opacity-35">
        <svg 
          className="w-full h-48 max-w-6xl"
          viewBox="0 0 1200 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="ecgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.05" />
              <stop offset="30%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.05" />
            </linearGradient>
            <filter id="ecgGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Trayecto ECG 1 (Línea Base Brillante) */}
          <path
            d="M0,60 L200,60 L230,60 L240,45 L250,75 L260,20 L275,100 L290,50 L300,65 L310,60 L500,60 L530,60 L540,45 L550,75 L560,20 L575,100 L590,50 L600,65 L610,60 L800,60 L830,60 L840,45 L850,75 L860,20 L875,100 L890,50 L900,65 L910,60 L1100,60 L1130,60 L1140,45 L1150,75 L1160,20 L1175,100 L1190,50 L1200,60"
            stroke="url(#ecgGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#ecgGlow)"
            className="animate-ecg-scan"
          />

          {/* Trayecto ECG 2 (Sombra difusa) */}
          <path
            d="M0,60 L200,60 L230,60 L240,45 L250,75 L260,20 L275,100 L290,50 L300,65 L310,60 L500,60 L530,60 L540,45 L550,75 L560,20 L575,100 L590,50 L600,65 L610,60 L800,60 L830,60 L840,45 L850,75 L860,20 L875,100 L890,50 L900,65 L910,60 L1100,60 L1130,60 L1140,45 L1150,75 L1160,20 L1175,100 L1190,50 L1200,60"
            stroke="#38bdf8"
            strokeWidth="1"
            strokeDasharray="6 6"
            strokeOpacity="0.3"
          />
        </svg>
      </div>

      {/* Partículas de telemetría flotantes */}
      <div className="absolute top-1/4 left-1/5 w-1.5 h-1.5 rounded-full bg-sky-400 opacity-40 animate-ping" style={{ animationDuration: '4s' }} />
      <div className="absolute top-3/4 left-1/3 w-1.5 h-1.5 rounded-full bg-indigo-400 opacity-40 animate-ping" style={{ animationDuration: '5s', animationDelay: '1s' }} />
      <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-30 animate-ping" style={{ animationDuration: '6s', animationDelay: '2s' }} />
    </div>
  );
}
