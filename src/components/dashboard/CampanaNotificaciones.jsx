import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Trash2, CheckCircle2, AlertTriangle, RefreshCw, ShieldAlert, Sparkles, X, ChevronRight } from 'lucide-react';
import { playSuccessChime, playErrorChime } from '../../utils/audioNotifications';

export default function CampanaNotificaciones({ syncToast, integrityIncidencesCount, lastSyncTime, onNavigateTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('metrico_notificaciones');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'init-1',
        title: 'Sistema de Integridad Activo',
        message: 'Monitoreo continuo de paridad BigQuery SSOT y Firestore en línea.',
        time: lastSyncTime || 'En Vivo',
        isRead: false,
        type: 'info',
        targetTab: 'auditoria'
      }
    ];
  });

  const menuRef = useRef(null);

  // Persistir en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('metrico_notificaciones', JSON.stringify(notifications.slice(0, 30)));
    } catch (e) {}
  }, [notifications]);

  // Agregar notificación cuando llega un syncToast
  useEffect(() => {
    if (!syncToast) return;

    setNotifications(prev => {
      const exists = prev.some(n => n.id === syncToast.id);
      if (exists) return prev;

      const newNotif = {
        id: syncToast.id || `toast-${Date.now()}`,
        title: syncToast.title || 'Sincronización Completada',
        message: syncToast.message || `Datos reevaluados a las ${syncToast.timestamp}`,
        time: syncToast.timestamp || 'Ahora',
        isRead: false,
        type: syncToast.type === 'manual' ? 'manual' : syncToast.type === 'error' ? 'error' : 'auto',
        targetTab: 'auditoria'
      };

      return [newNotif, ...prev];
    });
  }, [syncToast]);

  // Escuchar eventos globales de notificaciones de carga masiva
  useEffect(() => {
    const handleNotifEvent = (e) => {
      if (e && e.detail) {
        setNotifications(prev => {
          const exists = prev.some(n => n.id === e.detail.id);
          if (exists) return prev;
          return [e.detail, ...prev];
        });
      }
    };
    window.addEventListener('metrico_notif_created', handleNotifEvent);
    return () => window.removeEventListener('metrico_notif_created', handleNotifEvent);
  }, []);

  // Alerta si hay descalces de integridad
  useEffect(() => {
    if (integrityIncidencesCount > 0) {
      setNotifications(prev => {
        const hasActiveAlert = prev.some(n => n.id === 'integrity-alert-active');
        if (hasActiveAlert) return prev;

        playErrorChime();

        const alertNotif = {
          id: 'integrity-alert-active',
          title: 'Alerta de Integridad Detectada',
          message: `Se detectaron ${integrityIncidencesCount} descalces entre BigQuery y Firestore. Haz clic para auditar.`,
          time: 'En vivo',
          isRead: false,
          type: 'error',
          targetTab: 'auditoria'
        };

        return [alertNotif, ...prev];
      });
    }
  }, [integrityIncidencesCount]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleItemClick = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    setIsOpen(false);

    if (onNavigateTab && notif.targetTab) {
      onNavigateTab(notif.targetTab);
    }
  };

  const clearAll = () => {
    setNotifications([]);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón Campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl border transition-all cursor-pointer shadow-sm ${
          unreadCount > 0 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20' 
            : 'bg-card-custom border-card-custom text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        title="Centro de Notificaciones"
      >
        <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
        
        {/* Badge contador de no leídas */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white animate-pulse shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Menú Desplegable Flotante Opaco de Alto Constraste */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 text-slate-100 dark:bg-slate-950 dark:text-slate-100 border border-slate-700/80 dark:border-slate-800 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] z-[99999] overflow-hidden animate-fade-in theme-transition">
          {/* Top Bar Header Opaca */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-800/90 dark:bg-slate-900/90">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-black uppercase tracking-wide text-white">
                Centro de Notificaciones
              </h4>
              {unreadCount > 0 && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {unreadCount} nuevas
                </span>
              )}
            </div>

            {/* Marcar todas como leídas */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 px-2 py-1 rounded-lg transition cursor-pointer border border-indigo-500/20"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Marcar leídas</span>
              </button>
            )}
          </div>

          {/* List of Notifications Opaca */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/80 custom-scrollbar bg-slate-900 dark:bg-slate-950">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-semibold text-xs flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-60" />
                <span>No tienes notificaciones pendientes.</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 relative hover:bg-slate-800/80 dark:hover:bg-slate-900/80 ${
                    !n.isRead ? 'bg-slate-800/40 dark:bg-slate-900/40' : 'bg-slate-900 dark:bg-slate-950 opacity-80'
                  }`}
                >
                  {/* Indicator Dot */}
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0 mt-1.5 animate-pulse" />
                  )}

                  {/* Icon */}
                  <div className="shrink-0 mt-0.5">
                    {n.type === 'error' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    ) : n.type === 'manual' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                    )}
                  </div>

                  {/* Text Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className={`text-xs ${!n.isRead ? 'font-black text-white' : 'font-bold text-slate-300'} truncate`}>
                        {n.title}
                      </h5>
                      <span className="text-[9px] font-mono text-slate-400 shrink-0">
                        {n.time}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-medium leading-relaxed mt-0.5 line-clamp-2">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-indigo-400">
                      <span>Ir al detalle</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Bar Opaca */}
          {notifications.length > 0 && (
            <div className="p-2.5 border-t border-slate-800 bg-slate-800/90 dark:bg-slate-900/90 flex justify-between items-center px-4">
              <span className="text-[9px] font-bold text-slate-400">
                {notifications.length} registros en historial
              </span>
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 py-1 rounded-lg transition cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Limpiar</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
