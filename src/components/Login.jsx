import React, { useState } from 'react';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { Activity, Lock, Mail, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(err);
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        
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

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm border border-red-100">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {message && (
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg flex items-center gap-2 mb-4 text-sm border border-emerald-100">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <p>{message}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Correo Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-3 text-sm outline-none focus:border-sky-500 transition-colors"
                  placeholder="tu@correo.cl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
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
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-lg transition shadow-md flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : isRegistering ? 'Registrarse' : 'Ingresar'}
              {!loading && <ArrowRight className="w-4 h-4" />}
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
