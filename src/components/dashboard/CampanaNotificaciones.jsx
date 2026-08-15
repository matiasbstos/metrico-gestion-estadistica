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
    // Marcar como leída
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    setIsOpen(false);

    // Navegar al módulo objetivo
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

      {/* Menú Desplegable Flotante */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card-custom border border-card-custom rounded-2xl shadow-2xl z-[9999] overflow-hidden animate-fade-in backdrop-blur-xl theme-transition">
          {/* Top Bar Header */}
          <div className="p-3.5 border-b border-card-custom/30 flex items-center justify-between bg-black/5 dark:bg-white/5">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-black uppercase text-primary-custom tracking-wide">
                Centro de Notificaciones
              </h4>
              {unreadCount > 0 && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 border border-indigo-500/20">
                  {unreadCount} nuevas
                </span>
              )}
            </div>

            {/* Marcar todas como leídas */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 px-2 py-1 rounded-lg transition cursor-pointer"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Marcar leídas</span>
              </button>
            )}
          </div>

          {/* List of Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-card-custom/20 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-secondary-custom font-semibold text-xs flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-40" />
                <span>No tienes notificaciones pendientes.</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 relative hover:bg-black/5 dark:hover:bg-white/5 ${
                    !n.isRead ? 'bg-indigo-500/5 dark:bg-indigo-500/10' : ''
                  }`}
                >
                  {/* Indicator Dot */}
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5 animate-pulse" />
                  )}

                  {/* Icon */}
                  <div className="shrink-0 mt-0.5">
                    {n.type === 'error' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                    ) : n.type === 'manual' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                    )}
                  </div>

                  {/* Text Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className={`text-xs ${!n.isRead ? 'font-black text-primary-custom' : 'font-bold text-secondary-custom'} truncate`}>
                        {n.title}
                      </h5>
                      <span className="text-[9px] font-mono text-secondary-custom opacity-70 shrink-0">
                        {n.time}
                      </span>
                    </div>

                    <p className="text-[11px] text-secondary-custom font-medium leading-relaxed mt-0.5 line-clamp-2">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-indigo-500 dark:text-indigo-400">
                      <span>Ir al detalle</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Bar */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-card-custom/30 bg-black/5 dark:bg-white/5 flex justify-between items-center px-4">
              <span className="text-[9px] font-bold text-secondary-custom">
                {notifications.length} registros en historial
              </span>
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 px-2 py-1 rounded-lg transition cursor-pointer"
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
