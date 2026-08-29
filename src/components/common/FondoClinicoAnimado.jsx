import React, { useState, useEffect } from 'react';
import { 
  Cloud, Database, Activity, Wifi, ShieldCheck, Server, 
  Cpu, Radio, CheckCircle2, Sparkles, X, Info, Layers, Lock
} from 'lucide-react';

export default function FondoClinicoAnimado({ 
  variant = 'dark', 
  className = '',
  centroActivo = 'SAR Elsa Romo Aravena',
  userEmail = '',
  onSelectCentro = null
}) {
  const isDark = variant === 'dark';
  const detectedUser = userEmail ? userEmail.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';

  const [activeNodeModal, setActiveNodeModal] = useState(null); // 'cloud' | 'database' | 'gateway' | null
  const [pulseCentro, setPulseCentro] = useState(false);

  // Efecto de pulso y resplandor al cambiar de centro
  useEffect(() => {
    setPulseCentro(true);
    const timer = setTimeout(() => setPulseCentro(false), 1600);
    return () => clearTimeout(timer);
  }, [centroActivo]);

  const NODOS_INFO = {
    cloud: {
      titulo: 'Servidor Central en la Nube',
      subtitulo: 'Almacenamiento seguro y sincronización continua de datos',
      icono: Cloud,
      iconoColor: 'text-sky-400',
      iconoBg: 'from-sky-500/25 via-indigo-500/15',
      borde: 'border-sky-500/50',
      glow: 'shadow-[0_0_40px_rgba(56,189,248,0.4)]',
      descripcion: 'Es el repositorio central protegido donde se guardan todas las atenciones, turnos y estadísticas de la red asistencial. Garantiza que la información nunca se pierda y esté disponible de forma instantánea desde cualquier dispositivo autorizado.',
      caracteristicas: [
        'Sincronización en tiempo real sin recargar la página',
        'Cifrado de grado médico SSL/TLS de extremo a extremo',
        'Disponibilidad continua 24/7 para turnos diurnos y nocturnos'
      ],
      estado: 'Conexión Activa y Segura',
      latencia: '22 ms'
    },
    database: {
      titulo: centroActivo || 'SAR Elsa Romo Aravena',
      subtitulo: 'Base de datos clínica local del establecimiento',
      icono: Database,
      iconoColor: 'text-indigo-400',
      iconoBg: 'from-indigo-500/25 via-sky-500/15',
      borde: 'border-indigo-500/50',
      glow: 'shadow-[0_0_40px_rgba(99,102,241,0.4)]',
      descripcion: `Corresponde al repositorio de pacientes y turnos exclusivo de ${centroActivo || 'este establecimiento'}. Cada vez que seleccionas un centro, el sistema carga de inmediato los registros, categorizaciones Manchester (C1 a C5) y altas correspondientes a esta sede.`,
      caracteristicas: [
        'Segmentación estricta por establecimiento de salud',
        'Deduplicación automática de fichas clínicas duplicadas',
        detectedUser ? `Usuario en sesión: ${detectedUser}` : 'Autenticación con permisos asignados por rol'
      ],
      estado: 'Base de Datos Local Conectada',
      latencia: '14 ms'
    },
    gateway: {
      titulo: 'Motor Estadístico & Triage',
      subtitulo: 'Cálculo de tiempos, categorización y modelos predictivos',
      icono: Cpu,
      iconoColor: 'text-emerald-400',
      iconoBg: 'from-emerald-500/25 via-teal-500/15',
      borde: 'border-emerald-500/40',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]',
      descripcion: 'Es el procesador inteligente que analiza las atenciones en segundos. Transforma los datos brutos de las admisiones en gráficos interactivos, alertas de sobrecarga asistencial, curvas de demanda y proyecciones de triaje con inteligencia artificial.',
      caracteristicas: [
        'Cálculo automático de tiempos de espera y permanencia',
        'Validación de las 10 reglas de calidad e integridad asistencial',
        'Radar predictivo de afluencia de pacientes con Gemini AI'
      ],
      estado: 'Procesador Activo en Tiempo Real',
      latencia: '9 ms'
    }
  };

  return (
    <div className={`fixed inset-0 overflow-hidden select-none z-0 ${className}`}>
      {/* Cuadrícula clínica médica de fondo con gradiente radial asimétrico */}
      <div 
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08] pointer-events-none"
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

      {/* NODO 1: SERVIDOR CENTRAL EN LA NUBE */}
      <div 
        onClick={() => setActiveNodeModal('cloud')}
        title="Clic para ver detalles del Servidor en la Nube"
        className="absolute top-[12%] left-[6%] md:left-[13%] flex flex-col items-start animate-float-soft opacity-95 z-10 cursor-pointer group pointer-events-auto transition-transform hover:scale-105"
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute w-32 h-32 rounded-full border border-sky-500/25 animate-ping" style={{ animationDuration: '3.8s' }} />
          <div className="absolute w-40 h-40 rounded-full border border-indigo-500/20 border-dashed animate-spin-slow" />
          
          <div className="w-20 h-20 rounded-3xl bg-slate-900/90 border border-sky-500/50 backdrop-blur-xl shadow-[0_0_40px_rgba(56,189,248,0.4)] group-hover:shadow-[0_0_50px_rgba(56,189,248,0.7)] flex items-center justify-center relative overflow-hidden transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/25 via-indigo-500/15 to-transparent" />
            <Cloud className="w-10 h-10 text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.85)] relative z-10 group-hover:scale-110 transition-transform" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          </div>
        </div>

        <div className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-sky-500/40 text-[10px] font-black text-sky-300 tracking-wider uppercase shadow-xl flex flex-col items-start gap-0.5 backdrop-blur-md group-hover:border-sky-400 transition-all">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-sky-400 animate-pulse" />
            <span className="text-white font-extrabold">Servidor Central en la Nube</span>
          </div>
          <span className="text-[9px] text-sky-300/80 font-semibold lowercase tracking-normal flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            sincronización continua activa
          </span>
        </div>
      </div>

      {/* NODO 2: BASE DE DATOS LOCAL DEL CENTRO ASISTENCIAL (CON PULSO REACTIVO) */}
      <div 
        onClick={() => setActiveNodeModal('database')}
        title="Clic para ver detalles del Centro Asistencial"
        className={`absolute top-[28%] right-[6%] md:right-[12%] flex flex-col items-end animate-float-soft-delayed opacity-95 z-10 cursor-pointer group pointer-events-auto transition-transform hover:scale-105 ${
          pulseCentro ? 'scale-110' : ''
        }`}
      >
        <div className="relative flex items-center justify-center">
          <div 
            className={`absolute w-32 h-32 rounded-full border transition-all ${
              pulseCentro ? 'border-emerald-400/80 animate-ping' : 'border-indigo-500/25 animate-ping'
            }`} 
            style={{ animationDuration: pulseCentro ? '1s' : '4.2s' }} 
          />
          <div className="absolute w-40 h-40 rounded-full border border-sky-500/20 border-dashed animate-spin-slow" style={{ animationDirection: 'reverse' }} />

          <div className={`w-20 h-20 rounded-3xl bg-slate-900/90 border backdrop-blur-xl transition-all duration-500 flex items-center justify-center relative overflow-hidden ${
            pulseCentro 
              ? 'border-emerald-400 shadow-[0_0_60px_rgba(52,211,153,0.8)] scale-105' 
              : 'border-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_50px_rgba(99,102,241,0.7)]'
          }`}>
            <div className={`absolute inset-0 bg-gradient-to-br transition-all ${
              pulseCentro ? 'from-emerald-500/35 via-teal-500/25' : 'from-indigo-500/25 via-sky-500/15'
            } to-transparent`} />
            <Database className={`w-10 h-10 drop-shadow-[0_0_15px_rgba(99,102,241,0.85)] relative z-10 transition-all ${
              pulseCentro ? 'text-emerald-300 scale-110' : 'text-indigo-400 group-hover:scale-110'
            }`} />
            <div className={`absolute bottom-2 left-2 w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_#38bdf8] ${
              pulseCentro ? 'bg-emerald-400' : 'bg-sky-400'
            }`} />
          </div>
        </div>

        <div className={`mt-3 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border text-[10px] font-black tracking-wider uppercase shadow-xl flex flex-col items-end gap-0.5 backdrop-blur-md transition-all duration-300 ${
          pulseCentro ? 'border-emerald-400 ring-2 ring-emerald-400/40 text-emerald-300' : 'border-indigo-500/40 text-indigo-300 group-hover:border-indigo-400'
        }`}>
          <div className="flex items-center gap-1.5">
            <Server className={`w-3.5 h-3.5 animate-pulse shrink-0 ${pulseCentro ? 'text-emerald-400' : 'text-indigo-400'}`} />
            <span className="text-white font-black">{centroActivo || 'SAR Elsa Romo Aravena'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-slate-400 font-semibold lowercase tracking-normal">
              base local de urgencia
            </span>
            {detectedUser && (
              <span className="text-[9px] text-sky-400 font-bold tracking-normal">
                • 👤 {detectedUser}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* NODO 3: MOTOR ESTADÍSTICO & TRIAGE */}
      <div 
        onClick={() => setActiveNodeModal('gateway')}
        title="Clic para ver detalles del Motor Estadístico"
        className="absolute bottom-[10%] left-[8%] md:left-[18%] hidden sm:flex flex-col items-start animate-float-soft opacity-90 z-10 cursor-pointer group pointer-events-auto transition-transform hover:scale-105"
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full border border-emerald-500/20 animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }} />
          
          <div className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-emerald-500/40 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] flex items-center justify-center relative overflow-hidden transition-all">
            <Cpu className="w-7 h-7 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.7)] relative z-10 group-hover:scale-110 transition-transform" />
            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>

        <div className="mt-2 px-3 py-1 rounded-xl bg-slate-900/90 border border-emerald-500/35 text-[9px] font-black text-emerald-300 tracking-wider uppercase shadow-xl flex flex-col items-start gap-0.5 backdrop-blur-md group-hover:border-emerald-400 transition-all">
          <div className="flex items-center gap-1.5">
            <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
            <span className="text-white font-extrabold">Motor Estadístico & Triage</span>
          </div>
          <span className="text-[8px] text-emerald-300/80 font-medium lowercase tracking-normal">
            cálculo de tiempos e IA en línea
          </span>
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
          d="M 84 34 C 70 65, 45 88, 22 82"
          fill="none"
          stroke="url(#pipelineAsym2)"
          strokeWidth="0.3"
          strokeDasharray="2 3"
          strokeLinecap="round"
          filter="url(#asymGlow)"
          className="animate-flow-packets opacity-75"
        />
      </svg>

      {/* ========================================================================= */}
      {/* MODAL INTERACTIVO DE DIAGNÓSTICO Y EXPLICACIÓN DE COMPONENTES */}
      {/* ========================================================================= */}
      {activeNodeModal && NODOS_INFO[activeNodeModal] && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in pointer-events-auto"
          onClick={() => setActiveNodeModal(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-md w-full p-6 text-left relative overflow-hidden animate-scale-up space-y-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${NODOS_INFO[activeNodeModal].iconoBg} border ${NODOS_INFO[activeNodeModal].borde} ${NODOS_INFO[activeNodeModal].iconoColor}`}>
                  {React.createElement(NODOS_INFO[activeNodeModal].icono, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">
                    {NODOS_INFO[activeNodeModal].titulo}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {NODOS_INFO[activeNodeModal].subtitulo}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveNodeModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Explicación en Lenguaje Sencillo */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs">
                <Info className="w-4 h-4" />
                <span>¿Qué hace este componente en el sistema?</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {NODOS_INFO[activeNodeModal].descripcion}
              </p>
            </div>

            {/* Lista de Características Fáciles de Entender */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Funcionalidades Principales
              </span>
              <div className="space-y-1.5">
                {NODOS_INFO[activeNodeModal].caracteristicas.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Estado Operativo y Métricas */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-bold text-emerald-400">{NODOS_INFO[activeNodeModal].estado}</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                Latencia: <strong className="text-white">{NODOS_INFO[activeNodeModal].latencia}</strong>
              </span>
            </div>

            {/* Botón de Cierre */}
            <button 
              onClick={() => setActiveNodeModal(null)}
              className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer text-center"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Indicador de Seguridad en Esquina Inferior Derecha */}
      <div className="absolute bottom-4 right-4 hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/80 border border-white/10 text-[10px] font-bold text-slate-400 backdrop-blur-md pointer-events-auto">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Canal Asistencial Cifrado • Sincronización en Tiempo Real</span>
      </div>
    </div>
  );
}
