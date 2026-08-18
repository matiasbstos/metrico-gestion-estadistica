import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, AlertTriangle, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';
import { playErrorChime } from '../../utils/audioNotifications';

export default function ModalInactividad({ 
  user, 
  onLogout, 
  inactivityTimeMs = 15 * 60 * 1000, // 15 minutos estrictos por defecto
  warningCountdownSec = 60            // 60 segundos de aviso
}) {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(warningCountdownSec);

  const lastActivityRef = useRef(Date.now());
  const soundPlayedRef = useRef(false);

  // Actualizar timestamp en localStorage (con throttle)
  const updateActivityTimestamp = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current > 3000) {
      lastActivityRef.current = now;
      try {
        localStorage.setItem('metrico_last_activity', now.toString());
      } catch (e) {}
    }
  }, []);

  // Reiniciar actividad manualmente desde el modal ("Mantener Sesión Activa")
  const handleKeepSessionActive = () => {
    const now = Date.now();
    lastActivityRef.current = now;
    soundPlayedRef.current = false;
    try {
      localStorage.setItem('metrico_last_activity', now.toString());
    } catch (e) {}
    setShowWarningModal(false);
  };

  // Verificar la expiración de sesión
  const checkInactivityStatus = useCallback(() => {
    if (!user) return;

    let lastAct = parseInt(localStorage.getItem('metrico_last_activity') || '0', 10);
    if (!lastAct || isNaN(lastAct)) {
      lastAct = Date.now();
      localStorage.setItem('metrico_last_activity', lastAct.toString());
    }

    const elapsed = Date.now() - lastAct;
    const warningThresholdMs = inactivityTimeMs - (warningCountdownSec * 1000);

    if (elapsed >= inactivityTimeMs) {
      setShowWarningModal(false);
      if (onLogout) onLogout('inactividad');
    } else if (elapsed >= warningThresholdMs) {
      const secLeft = Math.max(1, Math.ceil((inactivityTimeMs - elapsed) / 1000));
      setRemainingSeconds(secLeft);
      setShowWarningModal(true);
      if (!soundPlayedRef.current) {
        soundPlayedRef.current = true;
        try { playErrorChime(); } catch (e) {}
      }
    } else {
      setShowWarningModal(false);
      soundPlayedRef.current = false;
    }
  }, [user, inactivityTimeMs, warningCountdownSec, onLogout]);

  // Manejador de eventos de usuario e intervalo de monitoreo
  useEffect(() => {
    if (!user) return;

    // Al montar, verificar si la sesión ya expiró
    checkInactivityStatus();

    const handleUserActivity = () => {
      updateActivityTimestamp();
      if (!showWarningModal) {
        checkInactivityStatus();
      }
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Observadores de foco y cambio de visibilidad (al regresar a la pestaña / despertar PC)
    const handleFocusOrVisibility = () => {
      checkInactivityStatus();
    };

    window.addEventListener('focus', handleFocusOrVisibility);
    document.addEventListener('visibilitychange', handleFocusOrVisibility);

    // Chequeo en intervalo (cada 1 segundo)
    const intervalId = setInterval(() => {
      checkInactivityStatus();
    }, 1000);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleUserActivity));
      window.removeEventListener('focus', handleFocusOrVisibility);
      document.removeEventListener('visibilitychange', handleFocusOrVisibility);
      clearInterval(intervalId);
    };
  }, [user, showWarningModal, updateActivityTimestamp, checkInactivityStatus]);

  // Cerrar sesión manualmente desde el modal
  const handleImmediateLogout = () => {
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
