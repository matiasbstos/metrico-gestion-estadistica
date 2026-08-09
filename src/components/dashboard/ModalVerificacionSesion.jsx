import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, LogOut, CheckCircle, UserCheck, Lock, Building2 } from 'lucide-react';

export default function ModalVerificacionSesion({ user, userProfile, onConfirm, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsOpen(false);
      return;
    }
    // Verificar si la sesión ya fue validada en esta ventana del navegador
    const isVerified = sessionStorage.getItem('metrico_session_verified');
    if (!isVerified || isVerified !== 'true') {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [user]);

  const handleConfirmSession = () => {
    sessionStorage.setItem('metrico_session_verified', 'true');
    setIsOpen(false);
    if (onConfirm) onConfirm();
  };

  const handleRejectSession = () => {
    sessionStorage.removeItem('metrico_session_verified');
    setIsOpen(false);
    if (onLogout) onLogout('manual');
  };

  if (!isOpen || !user) return null;

  const userDisplayName = userProfile?.nombre || user?.displayName || user?.email?.split('@')[0] || 'Usuario Registrado';
  const userEmail = user?.email || 'Sin correo especificado';
  const userRol = userProfile?.rol === 'global' ? 'Administrador Global' : (userProfile?.rol === 'admin_centro' ? 'Administrador de Centro' : 'Gestor Asistencial');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card-custom border border-indigo-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full text-center theme-transition relative overflow-hidden">
        
        {/* Glow de acento superior */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Badge de seguridad institucional */}
        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30 mb-4 animate-bounce">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-500/20 inline-block mb-3">
          SAR ELSA ROMO ARAVENA • MÉTRICO
        </span>

        {/* Titular */}
        <h2 className="text-xl font-black text-primary-custom tracking-tight mb-2">
          Verificación de Identidad de Sesión
        </h2>

        <p className="text-xs font-medium text-secondary-custom leading-relaxed mb-6">
          Se ha detectado una sesión activa en este navegador. Para proteger la confidencialidad de los datos asistenciales del establecimiento, por favor confirma si continúas como usuario activo.
        </p>

        {/* Tarjeta del usuario detectado */}
        <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-4 rounded-2xl mb-6 text-left flex items-center gap-3">
          <div className="w-11 h-11 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center font-black text-lg border border-indigo-500/20 flex-shrink-0">
            {userDisplayName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-black text-primary-custom truncate">{userDisplayName}</h4>
            <p className="text-xs font-semibold text-secondary-custom/80 truncate">{userEmail}</p>
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block mt-1">
              ● {userRol}
            </span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleConfirmSession}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Confirmar e Ingresar a Plataforma
          </button>
          
          <button
            onClick={handleRejectSession}
            className="w-full py-3 px-4 bg-black/5 dark:bg-white/5 hover:bg-rose-500/15 text-secondary-custom hover:text-rose-500 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 border border-card-custom"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión / Cambiar Usuario
          </button>
        </div>

        <p className="text-[10px] font-medium text-secondary-custom/60 mt-5">
          🔒 Conexión cifrada y auditada conforme al protocolo de seguridad asistencial.
        </p>
      </div>
    </div>
  );
}
