import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, AlertTriangle, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';

export default function ModalInactividad({ 
  user, 
  onLogout, 
  inactivityTimeMs = 14 * 60 * 1000, // 14 minutos por defecto
  warningCountdownSec = 60            // 60 segundos de aviso
}) {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(warningCountdownSec);

  const inactivityTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Función para reiniciar el temporizador de inactividad
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    setShowWarningModal(false);

    // Iniciar temporizador de 14 minutos
    inactivityTimerRef.current = setTimeout(() => {
      setShowWarningModal(true);
      setRemainingSeconds(warningCountdownSec);
    }, inactivityTimeMs);
  }, [inactivityTimeMs, warningCountdownSec]);

  // Manejador de eventos de usuario (solo actua si el modal no esta visible)
  useEffect(() => {
    if (!user) return;

    const handleUserActivity = () => {
      // Si la advertencia aún no ha saltado, reiniciar temporizador
      if (!showWarningModal) {
        const now = Date.now();
        // Throttle de 2 segundos para evitar reiniciar excesivamente en mousemove
        if (now - lastActivityRef.current > 2000) {
          resetInactivityTimer();
        }
      }
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, handleUserActivity));

    // Inicializar el temporizador al montar
    resetInactivityTimer();

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleUserActivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [user, showWarningModal, resetInactivityTimer]);

  // Manejador de la cuenta regresiva una vez desplegado el modal
  useEffect(() => {
    if (showWarningModal) {
      countdownIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            setShowWarningModal(false);
            if (onLogout) onLogout('inactividad');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [showWarningModal, onLogout]);

  // Confirmar extensión de sesión
  const handleKeepSessionActive = () => {
    resetInactivityTimer();
  };

  // Cerrar sesión manualmente desde el modal
  const handleImmediateLogout = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setShowWarningModal(false);
    if (onLogout) onLogout('manual');
  };

  if (!showWarningModal || !user) return null;

  // Cálculo del porcentaje de progreso del círculo/barra
  const progressPercent = (remainingSeconds / warningCountdownSec) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card-custom border border-amber-500/30 rounded-2xl shadow-2xl p-6 max-w-md w-full text-center theme-transition relative overflow-hidden">
        
        {/* Barra superior de progreso */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/10 dark:bg-white/10">
          <div 
            className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Icono de advertencia pulsante */}
        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 mb-4 animate-pulse">
          <Clock className="w-8 h-8" />
        </div>

        {/* Titular */}
        <h2 className="text-xl font-black text-primary-custom tracking-wide uppercase mb-1 flex items-center justify-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          Sesión por Expirar
        </h2>

        <p className="text-xs font-semibold text-secondary-custom leading-relaxed mb-6">
          Se ha detectado inactividad prolongada en la plataforma. Tu sesión se cerrará automáticamente por razones de seguridad.
        </p>

        {/* Temporizador Central Destacado */}
        <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-card-custom/40 mb-6 flex flex-col items-center justify-center">
          <span className="text-[10px] font-black text-secondary-custom uppercase tracking-wider mb-1">Tiempo Restante:</span>
          <div className="text-4xl font-black text-amber-500 font-mono tracking-tight flex items-baseline gap-1">
            <span>{remainingSeconds}</span>
            <span className="text-sm font-bold text-secondary-custom">seg</span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleKeepSessionActive}
            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-900/20 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Mantener Sesión Activa
          </button>
          
          <button
            onClick={handleImmediateLogout}
            className="py-3 px-4 bg-black/10 dark:bg-white/10 hover:bg-rose-500/20 text-secondary-custom hover:text-rose-500 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 border border-card-custom"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
