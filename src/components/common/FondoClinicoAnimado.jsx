import React from 'react';
import { Cloud, Database, Activity, Wifi, ShieldCheck, Server } from 'lucide-react';

export default function FondoClinicoAnimado({ variant = 'dark', className = '' }) {
  const isDark = variant === 'dark';

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}>
      {/* Cuadrícula clínica médica de fondo */}
      <div 
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(circle, ${isDark ? '#38bdf8' : '#4f46e5'} 1.2px, transparent 1.2px)`,
          backgroundSize: '36px 36px'
        }}
      />

      {/* Orbes de luz ambiental biomédica con respiración orgánica */}
      <div 
        className="absolute -top-40 -left-40 w-[680px] h-[680px] rounded-full blur-[140px] opacity-60 animate-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(56, 189, 248, 0.15) 60%, transparent 80%)',
          animationDuration: '6s'
        }}
      />
      <div 
        className="absolute -bottom-40 -right-40 w-[720px] h-[720px] rounded-full blur-[150px] opacity-55 animate-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, rgba(99, 102, 241, 0.18) 60%, transparent 80%)',
          animationDuration: '8s',
          animationDelay: '2s'
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] rounded-full blur-[160px] opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(79, 70, 229, 0.35) 0%, transparent 70%)'
        }}
      />

      {/* NODO NUBE CLÍNICA (Lado Izquierdo / Superior) */}
      <div className="absolute top-16 left-8 md:top-24 md:left-20 flex flex-col items-center animate-float-soft opacity-85 z-0">
        <div className="relative flex items-center justify-center">
          {/* Anillos de pulsación electromagnética */}
          <div className="absolute w-28 h-28 rounded-full border border-sky-500/20 animate-ping" style={{ animationDuration: '3.5s' }} />
          <div className="absolute w-36 h-36 rounded-full border border-indigo-500/15 animate-spin-slow" />
          
          {/* Contenedor del Icono Nube */}
          <div className="w-20 h-20 rounded-3xl bg-slate-900/80 border border-sky-500/40 backdrop-blur-xl shadow-[0_0_35px_rgba(56,189,248,0.35)] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 via-indigo-500/10 to-transparent" />
            <Cloud className="w-10 h-10 text-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.8)] relative z-10" />
            <div className="absolute bottom-1.5 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          </div>
        </div>

        {/* Badge descriptivo de Telemetría */}
        <div className="mt-3 px-3 py-1 rounded-full bg-slate-900/90 border border-sky-500/30 text-[10px] font-black text-sky-300 tracking-wider uppercase shadow-lg flex items-center gap-1.5">
          <Wifi className="w-3 h-3 text-sky-400 animate-pulse" />
          <span>Cloud Core • Firebase</span>
        </div>
      </div>

      {/* NODO BASE DE DATOS LOCAL / SERVIDOR (Lado Derecho / Inferior) */}
      <div className="absolute bottom-16 right-8 md:bottom-24 md:right-20 flex flex-col items-center animate-float-soft-delayed opacity-85 z-0">
        <div className="relative flex items-center justify-center">
          {/* Anillos de actividad de lectura/escritura */}
          <div className="absolute w-28 h-28 rounded-full border border-indigo-500/20 animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          <div className="absolute w-36 h-36 rounded-full border border-sky-500/15 animate-spin-slow" style={{ animationDirection: 'reverse' }} />

          {/* Contenedor del Icono Base de Datos */}
          <div className="w-20 h-20 rounded-3xl bg-slate-900/80 border border-indigo-500/40 backdrop-blur-xl shadow-[0_0_35px_rgba(99,102,241,0.35)] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-sky-500/10 to-transparent" />
            <Database className="w-10 h-10 text-indigo-400 drop-shadow-[0_0_12px_rgba(99,102,241,0.8)] relative z-10" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
          </div>
        </div>

        {/* Badge descriptivo de Base de Datos */}
        <div className="mt-3 px-3 py-1 rounded-full bg-slate-900/90 border border-indigo-500/30 text-[10px] font-black text-indigo-300 tracking-wider uppercase shadow-lg flex items-center gap-1.5">
          <Server className="w-3 h-3 text-indigo-400 animate-pulse" />
          <span>SAR Elsa Romo • Local DB</span>
        </div>
      </div>

      {/* CABLES / PIPELINES DE FLUJO VECTORIAL ENTRE NUBE Y BASE DE DATOS */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pipelineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="pipelineGradient2" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.7" />
          </linearGradient>
          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Cable Superior (Descarga de Datos Nube -> Servidor) */}
        <path
          d="M 120 120 C 350 80, 500 200, 850 450 C 950 530, 1100 650, 1150 720"
          fill="none"
          stroke="url(#pipelineGradient1)"
          strokeWidth="2.5"
          strokeDasharray="14 18"
          strokeLinecap="round"
          filter="url(#glowEffect)"
          className="animate-flow-packets opacity-70"
        />

        {/* Cable Inferior (Subida / Sincronización Servidor -> Nube) */}
        <path
          d="M 1150 740 C 950 800, 600 650, 400 400 C 250 250, 150 160, 120 140"
          fill="none"
          stroke="url(#pipelineGradient2)"
          strokeWidth="2"
          strokeDasharray="10 22"
          strokeLinecap="round"
          filter="url(#glowEffect)"
          className="animate-flow-packets opacity-60"
          style={{ animationDirection: 'reverse', animationDuration: '2s' }}
        />
      </svg>

      {/* LÍNEAS DE PULSO CARDIACO ECG CON ALTO CONTRASTE Y PROTAGONISMO */}
      <div className="absolute inset-0 flex items-center justify-center opacity-65 dark:opacity-75 pointer-events-none">
        <svg 
          className="w-full h-56 max-w-7xl"
          viewBox="0 0 1200 140" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="ecgVibrantGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.1" />
              <stop offset="25%" stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="75%" stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.1" />
            </linearGradient>
            <filter id="ecgIntenseGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Trayecto ECG 1 (Línea Neon Brillante Principal) */}
          <path
            d="M0,70 L200,70 L230,70 L240,50 L250,90 L260,15 L275,125 L290,40 L300,75 L310,70 L500,70 L530,70 L540,50 L550,90 L560,15 L575,125 L590,40 L600,75 L610,70 L800,70 L830,70 L840,50 L850,90 L860,15 L875,125 L890,40 L900,75 L910,70 L1100,70 L1130,70 L1140,50 L1150,90 L1160,15 L1175,125 L1190,40 L1200,70"
            stroke="url(#ecgVibrantGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#ecgIntenseGlow)"
            className="animate-ecg-scan"
          />

          {/* Trayecto ECG 2 (Sombra secundaria difusa) */}
          <path
            d="M0,70 L200,70 L230,70 L240,50 L250,90 L260,15 L275,125 L290,40 L300,75 L310,70 L500,70 L530,70 L540,50 L550,90 L560,15 L575,125 L590,40 L600,75 L610,70 L800,70 L830,70 L840,50 L850,90 L860,15 L875,125 L890,40 L900,75 L910,70 L1100,70 L1130,70 L1140,50 L1150,90 L1160,15 L1175,125 L1190,40 L1200,70"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="8 8"
            strokeOpacity="0.4"
          />
        </svg>
      </div>

      {/* Insignia de Cifrado y Seguridad en el Pie */}
      <div className="absolute bottom-6 left-8 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] font-bold text-slate-400 shadow-md">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Canal Clínico Cifrado • Sincronización en Tiempo Real</span>
      </div>
    </div>
  );
}
