import React, { useState } from 'react';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { Activity, Lock, Mail, AlertTriangle, CheckCircle, ArrowRight, Building2 } from 'lucide-react';
import { playLoginChime } from '../utils/audioNotifications';
import FondoClinicoAnimado from './common/FondoClinicoAnimado';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [centroSeleccionado, setCentroSeleccionado] = useState(
    () => localStorage.getItem('metrico_centro') || 'SAR Elsa Romo Aravena'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  const handleCentroChange = (val) => {
    setCentroSeleccionado(val);
    try {
      localStorage.setItem('metrico_centro', val);
    } catch (e) {}
  };

  React.useEffect(() => {
    try {
      const logoutReason = localStorage.getItem('metrico_logout_reason');
      if (logoutReason === 'inactividad') {
        setSessionExpired(true);
        localStorage.removeItem('metrico_logout_reason');
      }
    } catch (e) {}
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    setSessionExpired(false);

    const nowStr = Date.now().toString();
    // Pre-inicializar marcas de tiempo para que onAuthStateChanged no evalue inactividad previa
    try {
      localStorage.removeItem('metrico_logout_reason');
      localStorage.setItem('metrico_last_activity', nowStr);
      sessionStorage.setItem('metrico_session_verified', 'true');
      sessionStorage.setItem('metrico_auth_timestamp', nowStr);
    } catch (e) {}

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      playLoginChime();
      try {
        localStorage.setItem('metrico_last_activity', Date.now().toString());
        sessionStorage.setItem('metrico_session_verified', 'true');
        sessionStorage.setItem('metrico_auth_timestamp', Date.now().toString());
      } catch (e) {}
    } catch (err) {
      console.error(err);
      try {
        sessionStorage.removeItem('metrico_auth_timestamp');
      } catch (e) {}
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Credenciales incorrectas. Verifica tu correo o contraseña.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError('Ocurrió un error en la autenticación. Intenta nuevamente.');
      }
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Ingresa tu correo primero para poder enviar el enlace de recuperación.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Te hemos enviado un correo con las instrucciones para restablecer tu contraseña.');
    } catch (err) {
      console.error(err);
      setError('No pudimos enviar el correo de recuperación. Verifica la dirección ingresada.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-800 relative overflow-hidden">
      {/* Fondo Clínico Animado con Ondas ECG, Nube, Base de Datos Dinámica y Telemetría */}
      <FondoClinicoAnimado 
        variant="dark" 
        centroActivo={centroSeleccionado}
        userEmail={email}
        onSelectCentro={handleCentroChange}
      />

      <div className="max-w-md w-full bg-white/95 dark:bg-slate-900/90 rounded-3xl shadow-[0_0_50px_rgba(79,70,229,0.2)] overflow-hidden border border-slate-100 dark:border-slate-800 relative z-10 backdrop-blur-2xl">
        
        <div className="bg-slate-50 p-8 flex flex-col items-center border-b border-slate-100">
          <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">MÉTRICO</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Plataforma Clínico Predictiva</p>
        </div>

        <div className="p-8">
          <h2 className="text-lg font-bold text-slate-700 mb-6 text-center">
            {isRegistering ? 'Crear una cuenta nueva' : 'Iniciar Sesión'}
          </h2>

          {/* Notificación de Sesión Caducada con Estilo Ilustrado Vectorial del Sitio */}
          {sessionExpired && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-start gap-3 mb-5 shadow-sm animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 border border-rose-200">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 text-left">
                <h4 className="text-xs font-black uppercase tracking-wider text-rose-700">Sesión Caducada por Inactividad</h4>
                <p className="text-xs font-medium text-rose-600/90 leading-relaxed">
                  Tu sesión ha caducado por inactividad (&gt;15 minutos). Por favor ingresa tus credenciales nuevamente.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 text-rose-600 p-3.5 rounded-xl flex items-center gap-2.5 mb-4 text-xs font-bold border border-rose-100">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <p>{error}</p>
            </div>
          )}

          {message && (
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm border border-emerald-100">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <p>{message}</p>
            </div>
          )}

          <form id="form-login-metrico" onSubmit={handleAuth} className="space-y-4">
            <div>
              <label htmlFor="login-centro" className="block text-xs font-bold text-slate-500 mb-1">Centro Asistencial de Atención</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <select
                  id="login-centro"
                  value={centroSeleccionado}
                  onChange={(e) => handleCentroChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 transition-colors cursor-pointer"
                >
                  <option value="SAR Elsa Romo Aravena">SAR Elsa Romo Aravena</option>
                  <option value="CESFAM Florencia">CESFAM Florencia</option>
                  <option value="CESFAM Boris Soler">CESFAM Boris Soler</option>
                  <option value="CESFAM Elgueta">CESFAM Elgueta</option>
                  <option value="Todos los Centros (Red Salud Cormumel)">Todos los Centros (Red Salud Cormumel)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-slate-500 mb-1">Correo Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  id="login-email"
                  name="email"
                  type="email" 
                  autoComplete="username"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-3 text-sm outline-none focus:border-sky-500 transition-colors"
                  placeholder="tu@correo.cl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-bold text-slate-500 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  id="login-password"
                  name="password"
                  type="password" 
                  autoComplete="current-password"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-3 text-sm outline-none focus:border-sky-500 transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-lg transition shadow-md flex justify-center items-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span className="text-xs font-bold">{isRegistering ? 'Creando cuenta...' : 'Iniciando sesión...'}</span>
                </>
              ) : (
                <>
                  <span>{isRegistering ? 'Registrarse' : 'Ingresar'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-center">
            {!isRegistering && (
              <button onClick={handleResetPassword} disabled={loading} className="text-xs font-bold text-sky-600 hover:text-sky-700 transition">
                ¿Olvidaste tu contraseña?
              </button>
            )}
            
            <p className="text-xs text-slate-500 font-medium">
              {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta?'}
              <button 
                onClick={() => { setIsRegistering(!isRegistering); setError(''); setMessage(''); }} 
                className="ml-1 font-bold text-slate-700 hover:text-sky-600 transition"
              >
                {isRegistering ? 'Inicia sesión' : 'Regístrate aquí'}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
