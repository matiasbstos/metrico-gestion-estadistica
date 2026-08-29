import React from 'react';
import { Cloud, Database, Activity, Wifi, ShieldCheck, Server, Cpu, Radio } from 'lucide-react';

export default function FondoClinicoAnimado({ 
  variant = 'dark', 
  className = '',
  centroActivo = 'SAR Elsa Romo Aravena',
  userEmail = ''
}) {
  const isDark = variant === 'dark';
  const detectedUser = userEmail ? userEmail.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}>
      {/* Cuadrícula clínica médica de fondo con gradiente radial asimétrico */}
      <div 
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(circle, ${isDark ? '#38bdf8' : '#4f46e5'} 1.2px, transparent 1.2px)`,
          backgroundSize: '36px 36px'
        }}
      />

      {/* Orbes de luz ambiental biomédica asimétricos con respiración orgánica */}
      <div 
        className="absolute -top-32 left-[8%] w-[650px] h-[650px] rounded-full blur-[140px] opacity-65 animate-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(56, 189, 248, 0.15) 60%, transparent 80%)',
          animationDuration: '6.5s'
        }}
      />
      <div 
        className="absolute top-[28%] right-[5%] w-[700px] h-[700px] rounded-full blur-[150px] opacity-55 animate-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, rgba(99, 102, 241, 0.18) 60%, transparent 80%)',
          animationDuration: '8.5s',
          animationDelay: '1.5s'
        }}
      />
      <div 
        className="absolute -bottom-28 left-[22%] w-[550px] h-[550px] rounded-full blur-[130px] opacity-40 animate-pulse pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(14, 165, 233, 0.1) 60%, transparent 80%)',
          animationDuration: '7s',
          animationDelay: '3s'
        }}
      />

      {/* ========================================================================= */}
      {/* CONSTELACIÓN ASIMÉTRICA DE NODOS DE RED Y TELEMETRÍA (Triangulación Dinámica) */}
      {/* ========================================================================= */}

      {/* NODO 1: NUBE CLÍNICA PRINCIPAL (Posición: Superior Izquierda Asimétrica ~14% X, ~15% Y) */}
      <div className="absolute top-[12%] left-[6%] md:left-[13%] flex flex-col items-start animate-float-soft opacity-90 z-0">
        <div className="relative flex items-center justify-center">
          {/* Anillos de difusión electromagnética */}
          <div className="absolute w-32 h-32 rounded-full border border-sky-500/25 animate-ping" style={{ animationDuration: '3.8s' }} />
          <div className="absolute w-40 h-40 rounded-full border border-indigo-500/20 border-dashed animate-spin-slow" />
          
          {/* Tarjeta Glassmorphic Nodo Nube */}
          <div className="w-20 h-20 rounded-3xl bg-slate-900/85 border border-sky-500/50 backdrop-blur-xl shadow-[0_0_40px_rgba(56,189,248,0.4)] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/25 via-indigo-500/15 to-transparent" />
            <Cloud className="w-10 h-10 text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.85)] relative z-10" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          </div>
        </div>

        {/* Badge descriptivo de Telemetría */}
        <div className="mt-3 px-3 py-1 rounded-xl bg-slate-900/90 border border-sky-500/35 text-[10px] font-black text-sky-300 tracking-wider uppercase shadow-lg flex items-center gap-1.5 backdrop-blur-md">
          <Wifi className="w-3 h-3 text-sky-400 animate-pulse" />
          <span>Cloud Core • Firebase Stream</span>
        </div>
      </div>

      {/* NODO 2: BASE DE DATOS / SERVIDOR LOCAL DINÁMICO (Posición: Media Derecha Asimétrica ~82% X, ~34% Y) */}
      <div className="absolute top-[28%] right-[6%] md:right-[12%] flex flex-col items-end animate-float-soft-delayed opacity-90 z-0">
        <div className="relative flex items-center justify-center">
          {/* Anillos de actividad de lectura/escritura */}
          <div className="absolute w-32 h-32 rounded-full border border-indigo-500/25 animate-ping" style={{ animationDuration: '4.2s', animationDelay: '1.2s' }} />
          <div className="absolute w-40 h-40 rounded-full border border-sky-500/20 border-dashed animate-spin-slow" style={{ animationDirection: 'reverse' }} />

          {/* Tarjeta Glassmorphic Nodo Base de Datos */}
          <div className="w-20 h-20 rounded-3xl bg-slate-900/85 border border-indigo-500/50 backdrop-blur-xl shadow-[0_0_40px_rgba(99,102,241,0.4)] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/25 via-sky-500/15 to-transparent" />
            <Database className="w-10 h-10 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.85)] relative z-10" />
            <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
          </div>
        </div>

        {/* Badge descriptivo de Base de Datos y Centro Asistencial Dinámico */}
        <div className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-indigo-500/40 text-[10px] font-black text-indigo-300 tracking-wider uppercase shadow-lg flex flex-col items-end gap-0.5 backdrop-blur-md transition-all duration-300">
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-indigo-400 animate-pulse shrink-0" />
            <span className="text-white font-black">{centroActivo || 'SAR Elsa Romo Aravena'} • Local Data</span>
          </div>
          {detectedUser && (
            <span className="text-[9px] text-sky-300/90 font-medium tracking-normal">
              👤 Usuario: {detectedUser}
            </span>
          )}
        </div>
      </div>

      {/* NODO 3: GATEWAY DE TELEMETRÍA CLÍNICA (Posición: Inferior Izquierda Asimétrica ~22% X, ~78% Y) */}
      <div className="absolute bottom-[10%] left-[8%] md:left-[18%] hidden sm:flex flex-col items-start animate-float-soft opacity-80 z-0">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full border border-emerald-500/20 animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }} />
          
          <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-emerald-500/40 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center relative overflow-hidden">
            <Cpu className="w-7 h-7 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.7)] relative z-10" />
            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>

        <div className="mt-2 px-2.5 py-0.5 rounded-lg bg-slate-900/90 border border-emerald-500/30 text-[9px] font-black text-emerald-300 tracking-wider uppercase shadow-md flex items-center gap-1.5">
          <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
          <span>Gateway Clínico • En Línea</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RED VECTORIAL CURVA ASIMÉTRICA CON FLUJO DE PAQUETES (Bezier Pathways) */}
      {/* ========================================================================= */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pipelineAsym1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#6366f1" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="pipelineAsym2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.75" />
          </linearGradient>
          <filter id="asymGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Cable 1: Curva Orgánica Superior Asimétrica (Nube -> Base de Datos) */}
        <path
          d="M 16 18 C 38 6, 62 14, 84 34"
          fill="none"
          stroke="url(#pipelineAsym1)"
          strokeWidth="0.3"
          strokeDasharray="2 3"
          strokeLinecap="round"
          filter="url(#asymGlow)"
          className="animate-flow-packets opacity-75"
        />

        {/* Cable 2: Curva Asimétrica Diagonal Envolvente (Base de Datos -> Gateway Inferior) */}
        <path
          d="M 84 36 C 78 65, 48 88, 22 80"
          fill="none"
          stroke="url(#pipelineAsym2)"
          strokeWidth="0.25"
          strokeDasharray="1.5 3.5"
          strokeLinecap="round"
          filter="url(#asymGlow)"
          className="animate-flow-packets opacity-65"
          style={{ animationDirection: 'reverse', animationDuration: '2.2s' }}
        />

        {/* Cable 3: Curva Asimétrica Ascendente (Gateway Inferior -> Nube) */}
        <path
          d="M 22 78 C 10 60, 8 35, 16 20"
          fill="none"
          stroke="url(#pipelineAsym1)"
          strokeWidth="0.22"
          strokeDasharray="1 3"
          strokeLinecap="round"
          filter="url(#asymGlow)"
          className="animate-flow-packets opacity-50"
          style={{ animationDuration: '3s' }}
        />
      </svg>

      {/* ========================================================================= */}
      {/* LÍNEAS DE PULSO CARDIACO ECG ASIMÉTRICAS (Doble Nivel de Telemetría) */}
      {/* ========================================================================= */}
      
      {/* ECG Nivel 1: Onda Superior Sutil y Desfasada (42% de altura) */}
      <div className="absolute top-[38%] inset-x-0 opacity-40 dark:opacity-50 pointer-events-none">
        <svg 
          className="w-full h-28"
          viewBox="0 0 1200 80" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 L150,40 L165,30 L175,50 L185,15 L195,65 L205,35 L215,40 L450,40 L465,30 L475,50 L485,15 L495,65 L505,35 L515,40 L750,40 L765,30 L775,50 L785,15 L795,65 L805,35 L815,40 L1050,40 L1065,30 L1075,50 L1085,15 L1095,65 L1105,35 L1200,40"
            stroke="#6366f1"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            strokeOpacity="0.6"
          />
        </svg>
      </div>

      {/* ECG Nivel 2: Onda Principal de Alto Contraste Asimétrica (62% de altura) */}
      <div className="absolute top-[60%] inset-x-0 opacity-70 dark:opacity-80 pointer-events-none">
        <svg 
          className="w-full h-44"
          viewBox="0 0 1200 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="ecgVibrantGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.05" />
              <stop offset="20%" stopColor="#6366f1" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="80%" stopColor="#6366f1" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.05" />
            </linearGradient>
            <filter id="ecgIntenseGlow2" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Trayecto ECG Principal Neon */}
          <path
            d="M0,60 L200,60 L230,60 L240,40 L250,80 L260,10 L275,110 L290,30 L300,65 L310,60 L500,60 L530,60 L540,40 L550,80 L560,10 L575,110 L590,30 L600,65 L610,60 L800,60 L830,60 L840,40 L850,80 L860,10 L875,110 L890,30 L900,65 L910,60 L1100,60 L1130,60 L1140,40 L1150,80 L1160,10 L1175,110 L1190,30 L1200,60"
            stroke="url(#ecgVibrantGradient2)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#ecgIntenseGlow2)"
            className="animate-ecg-scan"
          />
        </svg>
      </div>

      {/* Insignia de Cifrado Asimétrica en Esquina Inferior */}
      <div className="absolute bottom-6 right-8 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] font-bold text-slate-400 shadow-md">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Canal Clínico Cifrado • Sincronización en Tiempo Real</span>
      </div>
    </div>
  );
}
