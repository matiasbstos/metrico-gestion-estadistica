import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { 
  Users, UserPlus, Shield, ShieldAlert, Lock, Unlock, Trash2, Edit3, Check, X, Clock, Eye, Activity,
  BarChart2, GitCompare, Calendar, Award, UserCheck, FileSpreadsheet, Database, ArrowLeftRight, ArrowLeft,
  CheckCircle2, AlertCircle, Printer, Copy, Sparkles, Key, Building2, RefreshCw, KeyRound, MailCheck,
  CalendarClock, ArrowRight
} from 'lucide-react';
import { auth, firebaseConfig, appId } from '../../config/firebase';

const MODULE_LIST = [
  { id: 'resumen', name: 'Inicio / Resumen General', description: 'Acceso al dashboard principal y tarjetas de KPIs globales.', icon: BarChart2, color: 'text-indigo-500' },
  { id: 'comparativo', name: 'Rendimiento Turno', description: 'Comparativa tripartita de turnos y curvas de demanda.', icon: GitCompare, color: 'text-emerald-500' },
  { id: 'calendario', name: 'Histórico Mensual', description: 'Cuadrícula mensual de turnos y mapa de calor de atenciones.', icon: Calendar, color: 'text-blue-500' },
  { id: 'profesionales', name: 'Rendimiento Clínico', description: 'Auditoría de médicos, promedio de atenciones y prescripción.', icon: Award, color: 'text-amber-500' },
  { id: 'perfil_paciente', name: 'Perfil del Paciente', description: 'Análisis sociodemográfico y procedencia por comuna.', icon: Users, color: 'text-purple-500' },
  { id: 'altas', name: 'Altas Administrativas', description: 'Filtro y auditoría de cancelaciones no médicas en triaje.', icon: UserCheck, color: 'text-rose-500' },
  { id: 'fracturas', name: 'Estadísticas de Fractura', description: 'Epidemiología ósea de lesiones CIE-10 (S02 a S92).', icon: Activity, color: 'text-rose-500' },
  { id: 'enfermeria', name: 'Rendimiento Enfermería', description: 'Evaluación de categorización de triaje y enfermeros.', icon: Activity, color: 'text-indigo-500' },
  { id: 'constataciones', name: 'Constatación de Lesiones', description: 'Análisis de atenciones clínico-legales Z51.8 y Z04.', icon: ShieldAlert, color: 'text-amber-500' },
  { id: 'traslados', name: 'Traslados Hospitalarios', description: 'Derivaciones a centros de alta complejidad y Top 10.', icon: ArrowLeftRight, color: 'text-indigo-500' },
  { id: 'reportes', name: 'Reporte Ejecutivo', description: 'Generación de informes ejecutivos e impresiones PDF.', icon: FileSpreadsheet, color: 'text-emerald-500' },
  { id: 'data', name: 'Gestión de Datos', description: 'Carga masiva de Excel, sanitización y re-cálculo.', icon: Database, color: 'text-teal-500' },
  { id: 'auditoria', name: 'Registro de Auditoría', description: 'Historial de modificaciones y acciones del sistema.', icon: Shield, color: 'text-indigo-500' }
];

export default function GestionUsuarios({ db, userProfile, isGlobalAdmin }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Vistas y Modales
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1: Datos, 2: Permisos Granulares
  const [editingUserPerms, setEditingUserPerms] = useState(null);
  const [savingNotif, setSavingNotif] = useState(null); // Notificación central
  const [createdUserVoucher, setCreatedUserVoucher] = useState(null); // Ficha de bienvenida
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Modal personalizado de eliminación/baja con justificación
  const [deletingUser, setDeletingUser] = useState(null);
  const [motivoBaja, setMotivoBaja] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Formulario nuevo usuario
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('Melipilla.2026!');
  const [newName, setNewName] = useState('');
  const [newCentro, setNewCentro] = useState('SAR Elsa Romo Aravena');
  const [newRol, setNewRol] = useState('local');
  const [vigenciaHoras, setVigenciaHoras] = useState(48); // 48 Horas por defecto
  const [newPermisos, setNewPermisos] = useState(
    MODULE_LIST.reduce((acc, m) => ({ ...acc, [m.id]: true }), {})
  );
  const [creatingUser, setCreatingUser] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Generador de clave sugerida basada en el nombre
  const generateSuggestedPassword = (name) => {
    const cleanFirst = name ? name.trim().split(' ')[0] : 'Usuario';
    const capitalized = cleanFirst.charAt(0).toUpperCase() + cleanFirst.slice(1).toLowerCase();
    return `${capitalized}.2026!`;
  };

  const handleNameChange = (val) => {
    setNewName(val);
    if (!newPassword || newPassword.includes('.2026!')) {
      setNewPassword(generateSuggestedPassword(val));
    }
  };

  // Cargar usuarios desde Firestore
  useEffect(() => {
    if (!db) return;
    const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching users:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  // Auditoría Helper
  const logAuditAction = async (accion, detalles) => {
    try {
      const auditRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'audit_logs'));
      await setDoc(auditRef, {
        fecha: new Date().toISOString(),
        accion,
        usuario: userProfile?.email || 'matias.bustos@cormumel.cl',
        centro: userProfile?.centro || 'SAR ELSA ROMO ARAVENA',
        detalles
      });
    } catch (e) {
      console.error('Error recording audit log:', e);
    }
  };

  // Crear Usuario con App Secundaria de Firebase Auth y Asignación de Permisos
  const handleCreateUser = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    let cleanEmail = newEmail.trim().toLowerCase();
    if (cleanEmail && !cleanEmail.includes('@')) {
      cleanEmail = cleanEmail + '@cormumel.cl';
    }

    if (!cleanEmail) {
      setErrorMessage('Por favor ingrese el correo electrónico del usuario.');
      setWizardStep(1);
      return;
    }

    if (!cleanEmail.endsWith('@cormumel.cl') && !cleanEmail.endsWith('@cormumen.cl')) {
      setErrorMessage('El correo electrónico debe pertenecer al dominio institucional @cormumel.cl.');
      setWizardStep(1);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      setWizardStep(1);
      return;
    }

    setCreatingUser(true);

    try {
      let secondaryApp = getApps().find(app => app.name === 'SecondaryAdminUserApp');
      if (!secondaryApp) {
        secondaryApp = initializeApp(firebaseConfig, 'SecondaryAdminUserApp');
      }
      const secondaryAuth = getAuth(secondaryApp);

      const userCred = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, newPassword);
      const uid = userCred.user.uid;
      const now = Date.now();
      const fechaVencimiento = now + vigenciaHoras * 3600 * 1000;

      const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', uid);
      const newUserData = {
        uid,
        email: cleanEmail,
        nombre: newName.trim() || cleanEmail.split('@')[0],
        centro: newCentro,
        rol: newRol,
        estado: 'activo',
        permisos: newPermisos,
        vigenciaHoras,
        fechaVencimientoClave: fechaVencimiento,
        createdAt: now,
        ultimoInicioSesion: now,
        ultimaConsulta: now
      };

      await setDoc(userDocRef, newUserData);
      await logAuditAction(
        'Carga Usuario', 
        `Creado nuevo usuario "${cleanEmail}" para el centro "${newCentro}" con rol ${newRol.toUpperCase()} y clave provisoria válida por ${vigenciaHoras} horas.`
      );

      // Desplegar Ficha Oficial de Bienvenida con vigencia de clave
      setCreatedUserVoucher({
        nombre: newUserData.nombre,
        email: cleanEmail,
        password: newPassword,
        centro: newCentro,
        rol: newRol,
        createdAt: now,
        vigenciaHoras,
        fechaVencimiento
      });

      // Resetear estados del asistente
      setNewEmail('');
      setNewPassword('Melipilla.2026!');
      setNewName('');
      setNewCentro('SAR Elsa Romo Aravena');
      setNewRol('local');
      setVigenciaHoras(48);
      setWizardStep(1);
      setShowAddWizard(false);
    } catch (err) {
      console.error('Error creando usuario:', err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('El correo electrónico ya está registrado en la plataforma.');
      } else {
        setErrorMessage(err.message || 'Error al crear el usuario.');
      }
      setWizardStep(1);
    } finally {
      setCreatingUser(false);
    }
  };

  // Restablecer Contraseña Administrativo (Envía Correo de Recuperación via Firebase Auth)
  const handleAdminResetPassword = async (user) => {
    const targetEmail = String(user.email || user.id || '').trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setSavingNotif({ type: 'error', text: 'El usuario seleccionado no posee un correo electrónico válido registrado.' });
      setTimeout(() => setSavingNotif(null), 3000);
      return;
    }

    setSavingNotif({ type: 'loading', text: `Enviando correo de restablecimiento de contraseña a "${targetEmail}"...` });

    try {
      await sendPasswordResetEmail(auth, targetEmail);
      await logAuditAction(
        'Restablecimiento Clave Admin',
        `Enviado correo de recuperación de contraseña al usuario "${targetEmail}" por el administrador "${userProfile?.email || 'matias.bustos@cormumel.cl'}"`
      );

      setSavingNotif({ 
        type: 'success', 
        text: `¡Se ha enviado el enlace de restablecimiento de contraseña al correo "${targetEmail}" exitosamente!` 
      });

      setTimeout(() => setSavingNotif(null), 3000);
    } catch (err) {
      console.error('Error al enviar correo de restablecimiento:', err);
      setSavingNotif({ 
        type: 'error', 
        text: 'Error al enviar correo de restablecimiento: ' + (err.message || 'Verifique la conexión') 
      });
      setTimeout(() => setSavingNotif(null), 3500);
    }
  };

  // Cambiar Estado (Bloquear / Desbloquear)
  const handleToggleBlockUser = async (user) => {
    const nuevoEstado = user.estado === 'bloqueado' ? 'activo' : 'bloqueado';
    const targetEmail = user.email || user.id;
    try {
      const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.id);
      await updateDoc(userRef, { estado: nuevoEstado });
      await logAuditAction(
        'Edición Usuario',
        `Estado de usuario "${targetEmail}" cambiado a ${nuevoEstado.toUpperCase()}`
      );
    } catch (err) {
      console.error('Error al cambiar estado de usuario:', err);
    }
  };

  // Confirmar y Procesar Eliminación / Baja de Usuario con Justificación de Auditoría
  const handleConfirmDeleteUser = async () => {
    if (!deletingUser) return;
    const motivoLimpio = motivoBaja.trim();
    if (!motivoLimpio || motivoLimpio.length < 5) {
      setSavingNotif({ 
        type: 'error', 
        text: 'Por favor ingrese una justificación válida para dar de baja al usuario (mínimo 5 caracteres).' 
      });
      setTimeout(() => setSavingNotif(null), 3000);
      return;
    }

    const targetEmail = deletingUser.email || deletingUser.id;
    const targetNombre = deletingUser.nombre || targetEmail;
    const targetCentro = deletingUser.centro || 'SAR Elsa Romo Aravena';
    const targetRol = deletingUser.rol || 'local';

    setIsDeleting(true);
    setSavingNotif({ type: 'loading', text: `Procesando baja y eliminación de usuario "${targetEmail}"...` });

    try {
      const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', deletingUser.id);
      await deleteDoc(userRef);

      await logAuditAction(
        'Eliminación Usuario',
        `DADO DE BAJA PERFIL DE USUARIO: "${targetNombre}" (${targetEmail}) | Centro: ${targetCentro} | Rol: ${targetRol.toUpperCase()}. Justificación de baja: "${motivoLimpio}"`
      );

      setSavingNotif({ 
        type: 'success', 
        text: `¡El usuario "${targetEmail}" ha sido dado de baja y registrado en auditoría exitosamente!` 
      });

      setDeletingUser(null);
      setMotivoBaja('');
      setTimeout(() => setSavingNotif(null), 2500);
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      setSavingNotif({ 
        type: 'error', 
        text: 'Error al dar de baja el usuario: ' + (err.message || 'Intente nuevamente') 
      });
      setTimeout(() => setSavingNotif(null), 3500);
    } finally {
      setIsDeleting(false);
    }
  };

  // Guardar Cambios de Permisos y Centro con Notificación Central
  const handleSavePermissions = async () => {
    if (!editingUserPerms) return;
    const targetIdentifier = editingUserPerms.email || editingUserPerms.nombre || editingUserPerms.id;
    
    setSavingNotif({ type: 'loading', text: 'Guardando configuración de permisos y centro en Firebase...' });

    try {
      const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', editingUserPerms.id);
      await updateDoc(userRef, {
        permisos: editingUserPerms.permisos,
        rol: editingUserPerms.rol,
        centro: editingUserPerms.centro || 'SAR Elsa Romo Aravena'
      });

      await logAuditAction(
        'Edición Permisos', 
        `Actualizados permisos, rol (${editingUserPerms.rol.toUpperCase()}) y centro (${editingUserPerms.centro || 'SAR Elsa Romo Aravena'}) de usuario "${targetIdentifier}"`
      );

      setSavingNotif({ type: 'success', text: '¡Permisos y Centro Asignado actualizados con éxito!' });

      setTimeout(() => {
        setSavingNotif(null);
        setEditingUserPerms(null);
      }, 1500);
    } catch (err) {
      console.error('Error al actualizar permisos:', err);
      setSavingNotif({ type: 'error', text: 'Error al guardar permisos: ' + (err.message || 'Intente nuevamente') });
      setTimeout(() => setSavingNotif(null), 3000);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Sin registros';
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return 'Sin registros';
    return `${d.toLocaleDateString('es-CL')} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // VISTA 3: ASISTENTE COMPLETO A PANTALLA COMPLETA PARA REGISTRO DE NUEVO USUARIO
  if (showAddWizard) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full theme-transition relative">
        
        {/* BARRA SUPERIOR DEL ASISTENTE */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowAddWizard(false); setWizardStep(1); }}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" /> Cancelar
            </button>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                Asistente de Registro de Nuevo Usuario
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Paso {wizardStep} de 2: {wizardStep === 1 ? 'Datos Institucionales y Clave Provisoria' : 'Asignación Granular de Módulos y Permisos'}
              </p>
            </div>
          </div>

          {/* BARRA DE PROGRESO DEL PASO */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${wizardStep === 1 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
              1. Datos Básicos
            </span>
            <span className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${wizardStep === 2 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
              2. Permisos y Ficha
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* PASO 1: DATOS Y ASIGNACIÓN INSTITUCIONAL */}
        {wizardStep === 1 && (
          <div className="flex-1 overflow-auto space-y-6 pr-1 custom-scrollbar">
            <div className="bg-indigo-50/60 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
              <h3 className="text-xs font-black text-indigo-950 dark:text-indigo-200 uppercase tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Información del Funcionario e Identificación
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                Ingrese los datos institucionales del funcionario. El correo electrónico debe pertenecer al dominio @cormumel.cl.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-200 mb-1.5">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez González"
                  value={newName}
                  onChange={e => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-200 mb-1.5">Correo Electrónico (@cormumel.cl) *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="juan.perez@cormumel.cl"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm"
                  />
                  <span className="absolute right-3 top-3 text-[11px] font-bold text-indigo-600 opacity-70">@cormumel.cl</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-200">Contraseña Inicial Provisoria *</label>
                  <button
                    type="button"
                    onClick={() => setNewPassword(generateSuggestedPassword(newName))}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Sugerir
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-indigo-600 font-mono focus:outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-200 mb-1.5">
                  <CalendarClock className="w-3.5 h-3.5 text-amber-500 inline mr-1" />
                  Vigencia de la Clave Provisoria *
                </label>
                <select
                  value={vigenciaHoras}
                  onChange={e => setVigenciaHoras(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
                >
                  <option value={24}>24 Horas hábiles</option>
                  <option value={48}>48 Horas hábiles (Recomendado)</option>
                  <option value={72}>72 Horas hábiles</option>
                  <option value={168}>7 Días continuos</option>
                </select>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">
                  La contraseña inicial caducará automáticamente tras {vigenciaHoras} horas si no es modificada.
                </p>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-200 mb-1.5">Recinto / Centro Asignado *</label>
                <select
                  value={newCentro}
                  onChange={e => setNewCentro(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
                >
                  <option value="SAR Elsa Romo Aravena">SAR Elsa Romo Aravena</option>
                  <option value="CESFAM Florencia">CESFAM Florencia</option>
                  <option value="CESFAM Boris Soler">CESFAM Boris Soler</option>
                  <option value="CESFAM Elgueta">CESFAM Elgueta</option>
                  <option value="Todos los Centros (Red Salud Cormumel)">Todos los Centros (Red Salud Cormumel)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-200 mb-1.5">Rol de Acceso Jerárquico *</label>
                <select
                  value={newRol}
                  onChange={e => setNewRol(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
                >
                  <option value="global">Administrador Global General (Acceso Multicentro)</option>
                  <option value="admin_centro">Administrador Global de Centro (Exclusivo de Centro)</option>
                  <option value="local">Usuario Local (Usuario Operativo de Centro)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: SELECCIÓN Y CONFIGURACIÓN DE PERMISOS GRANULARES */}
        {wizardStep === 2 && (
          <div className="flex-1 overflow-auto space-y-6 pr-1 custom-scrollbar">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  Módulos e Indicadores Habilitados para {newName || newEmail} ({MODULE_LIST.length} Módulos)
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                  Seleccione los apartados y vistas que el usuario podrá acceder desde su panel de navegación.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const allTrue = MODULE_LIST.reduce((acc, m) => ({ ...acc, [m.id]: true }), {});
                    setNewPermisos(allTrue);
                  }}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-black rounded-lg transition cursor-pointer"
                >
                  ✓ Marcar Todos
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const allFalse = MODULE_LIST.reduce((acc, m) => ({ ...acc, [m.id]: false }), {});
                    setNewPermisos(allFalse);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  ✕ Desmarcar Todos
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MODULE_LIST.map(mod => {
                const IconComponent = mod.icon;
                const isChecked = newPermisos[mod.id] !== false;

                return (
                  <div
                    key={mod.id}
                    onClick={() => {
                      setNewPermisos({ ...newPermisos, [mod.id]: !isChecked });
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                      isChecked 
                        ? 'bg-white dark:bg-slate-800 border-indigo-500/50 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500/20' 
                        : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-xl mt-0.5 ${isChecked ? 'bg-indigo-500/10 text-indigo-600' : 'bg-slate-200/50 dark:bg-slate-700/50 text-slate-400'}`}>
                        <IconComponent className={`w-5 h-5 ${mod.color}`} />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white block">{mod.name}</span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-normal mt-0.5">{mod.description}</p>
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider mt-2 px-2 py-0.5 rounded-md ${isChecked ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'}`}>
                          {isChecked ? 'Habilitado' : 'Restringido'}
                        </span>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer mt-1 shrink-0"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PIE DE PÁGINA DE ACCIONES DEL ASISTENTE */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
          {wizardStep === 1 ? (
            <>
              <button
                onClick={() => { setShowAddWizard(false); setWizardStep(1); }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  let cleanEmail = newEmail.trim().toLowerCase();
                  if (cleanEmail && !cleanEmail.includes('@')) cleanEmail = cleanEmail + '@cormumel.cl';

                  if (!newName || !cleanEmail || !newPassword) {
                    setErrorMessage('Por favor complete el nombre, correo y contraseña del usuario.');
                    return;
                  }
                  if (!cleanEmail.endsWith('@cormumel.cl') && !cleanEmail.endsWith('@cormumen.cl')) {
                    setErrorMessage('El correo debe pertenecer al dominio institucional @cormumel.cl.');
                    return;
                  }
                  setErrorMessage('');
                  setWizardStep(2);
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-900/20 transition cursor-pointer"
              >
                Siguiente: Asignar Permisos <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setWizardStep(1)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Volver a Datos
              </button>

              <button
                onClick={handleCreateUser}
                disabled={creatingUser}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-900/20 transition cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> {creatingUser ? 'Registrando...' : 'Crear Usuario y Generar Ficha PDF'}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // VISTA 2: CONFIGURACIÓN COMPLETA DE PERMISOS DE USUARIO EXISTENTE (PANEL COMPLETO ANCHO & FONDO BLANCO)
  if (editingUserPerms) {
    const userIdentifier = editingUserPerms.email || editingUserPerms.nombre || editingUserPerms.id;

    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full theme-transition relative">
        
        {/* NOTIFICACIÓN CENTRAL AL GUARDAR */}
        {savingNotif && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center space-y-4 animate-fade-in">
              {savingNotif.type === 'loading' ? (
                <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              ) : savingNotif.type === 'success' ? (
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                  <AlertCircle className="w-8 h-8" />
                </div>
              )}
              
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
                {savingNotif.type === 'loading' ? 'Guardando...' : savingNotif.type === 'success' ? '¡Éxito!' : 'Error'}
              </h3>

              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                {savingNotif.text}
              </p>
            </div>
          </div>
        )}

        {/* BARRA SUPERIOR DE NAVEGACIÓN Y ACCIONES */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditingUserPerms(null)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Volver a la lista de usuarios"
            >
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                Matriz de Permisos y Credenciales
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Usuario en edición: <strong className="text-indigo-600 dark:text-indigo-400 font-black">{userIdentifier}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditingUserPerms(null)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Volver
            </button>
            <button
              onClick={handleSavePermissions}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-900/20 transition cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Guardar Permisos
            </button>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL: ANCHO COMPLETO Y FONDO BLANCO */}
        <div className="flex-1 overflow-auto space-y-6 pr-1 custom-scrollbar">
          
          {/* Fila 1: Configuración de Rol de Usuario y Recinto Asignado */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 block mb-1">Jerarquía y Asignación de Recinto</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Defina el nivel de acceso del funcionario y el centro asistencial que administrará o visualizará en la plataforma.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              {/* Selector de Centro Asignado */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Centro Asignado:
                </label>
                <select
                  value={editingUserPerms.centro || 'SAR Elsa Romo Aravena'}
                  onChange={e => setEditingUserPerms({ ...editingUserPerms, centro: e.target.value })}
                  className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
                >
                  <option value="SAR Elsa Romo Aravena">SAR Elsa Romo Aravena</option>
                  <option value="CESFAM Florencia">CESFAM Florencia</option>
                  <option value="CESFAM Boris Soler">CESFAM Boris Soler</option>
                  <option value="CESFAM Elgueta">CESFAM Elgueta</option>
                  <option value="Todos los Centros (Red Salud Cormumel)">Todos los Centros (Red Salud Cormumel)</option>
                </select>
              </div>

              {/* Selector de Rol Asignado */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" /> Rol Asignado:
                </label>
                <select
                  value={editingUserPerms.rol || 'local'}
                  onChange={e => setEditingUserPerms({ ...editingUserPerms, rol: e.target.value })}
                  className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
                >
                  <option value="global">Administrador Global General (Acceso Multicentro)</option>
                  <option value="admin_centro">Administrador Global de Centro (Exclusivo de Centro)</option>
                  <option value="local">Usuario Local (Usuario Operativo de Centro)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fila 2: Cabecera de Módulos y Botones de Selección Rápida */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                Módulos y Funcionalidades Disponibles ({MODULE_LIST.length} Módulos)
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                Marque los módulos que este usuario tendrá habilitados en su barra lateral.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const allTrue = MODULE_LIST.reduce((acc, m) => ({ ...acc, [m.id]: true }), {});
                  setEditingUserPerms({ ...editingUserPerms, permisos: allTrue });
                }}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-black rounded-lg transition cursor-pointer"
              >
                ✓ Marcar Todos
              </button>
              <button
                type="button"
                onClick={() => {
                  const allFalse = MODULE_LIST.reduce((acc, m) => ({ ...acc, [m.id]: false }), {});
                  setEditingUserPerms({ ...editingUserPerms, permisos: allFalse });
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                ✕ Desmarcar Todos
              </button>
            </div>
          </div>

          {/* Fila 3: Grid Completo a 3 Columnas Amplias */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULE_LIST.map(mod => {
              const IconComponent = mod.icon;
              const isChecked = editingUserPerms.permisos[mod.id] !== false;

              return (
                <div
                  key={mod.id}
                  onClick={() => {
                    setEditingUserPerms({
                      ...editingUserPerms,
                      permisos: {
                        ...editingUserPerms.permisos,
                        [mod.id]: !isChecked
                      }
                    });
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                    isChecked 
                      ? 'bg-white dark:bg-slate-800 border-indigo-500/50 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500/20' 
                      : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-xl mt-0.5 ${isChecked ? 'bg-indigo-500/10 text-indigo-600' : 'bg-slate-200/50 dark:bg-slate-700/50 text-slate-400'}`}>
                      <IconComponent className={`w-5 h-5 ${mod.color}`} />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block">{mod.name}</span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-normal mt-0.5">{mod.description}</p>
                      <span className={`inline-block text-[9px] font-black uppercase tracking-wider mt-2 px-2 py-0.5 rounded-md ${isChecked ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'}`}>
                        {isChecked ? 'Habilitado' : 'Restringido'}
                      </span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer mt-1 shrink-0"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* PIE DE PÁGINA INFERIOR DE ACCIONES */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
          <button
            onClick={() => setEditingUserPerms(null)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a Usuarios
          </button>
          
          <button
            onClick={handleSavePermissions}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-900/20 transition cursor-pointer"
          >
            <Check className="w-4 h-4" /> Guardar Permisos
          </button>
        </div>
      </div>
    );
  }

  // VISTA 1: TABLA PRINCIPAL DE USUARIOS Y ACCIONES ADMINISTRATIVAS
  return (
    <div className="bg-card-custom rounded-2xl shadow-sm border border-card-custom p-6 flex flex-col h-full theme-transition relative">
      
      {/* NOTIFICACIÓN CENTRAL DE PROCESAMIENTO / RESTABLECIMIENTO */}
      {savingNotif && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center space-y-4 animate-fade-in">
            {savingNotif.type === 'loading' ? (
              <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            ) : savingNotif.type === 'success' ? (
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                <AlertCircle className="w-8 h-8" />
              </div>
            )}
            
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
              {savingNotif.type === 'loading' ? 'Procesando...' : savingNotif.type === 'success' ? '¡Operación Exitosa!' : 'Atención'}
            </h3>

            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
              {savingNotif.text}
            </p>
          </div>
        </div>
      )}

      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-card-custom/30">
        <div>
          <h2 className="text-xl font-black text-primary-custom flex items-center gap-2 tracking-wide uppercase">
            <Users className="text-indigo-500 w-6 h-6"/> Configuración y Control de Usuarios
          </h2>
          <p className="text-xs text-secondary-custom font-semibold mt-0.5">
            Administración de cuentas, permisos granulares de navegación y auditoría de accesos.
          </p>
        </div>

        {isGlobalAdmin && (
          <button
            onClick={() => {
              setNewEmail('');
              setNewName('');
              setNewPassword('Melipilla.2026!');
              setNewCentro('SAR Elsa Romo Aravena');
              setNewRol('local');
              setVigenciaHoras(48);
              setWizardStep(1);
              setShowAddWizard(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-900/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Agregar Nuevo Usuario
          </button>
        )}
      </div>

      {/* Tabla de Usuarios */}
      <div className="flex-1 overflow-auto border border-card-custom rounded-2xl bg-card-custom custom-scrollbar">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-black/5 dark:bg-white/5 border-b border-card-custom text-secondary-custom font-black uppercase text-[10px] tracking-wider sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="p-4">Usuario / Correo</th>
              <th className="p-4">Recinto Asignado</th>
              <th className="p-4">Rol de Acceso</th>
              <th className="p-4">Estado</th>
              <th className="p-4"><div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-indigo-500"/> Último Inicio Sesión</div></th>
              <th className="p-4"><div className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-indigo-500"/> Última Consulta</div></th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-custom/20">
            {loading ? (
              <tr><td colSpan="7" className="p-12 text-center text-secondary-custom font-semibold">Cargando cuentas de usuario...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="7" className="p-12 text-center text-secondary-custom font-semibold">No hay usuarios registrados en el sistema.</td></tr>
            ) : (
              users.map(u => {
                const isBlocked = u.estado === 'bloqueado';
                const userEmail = String(u.email || u.id || 'Sin correo').trim();
                const isSuperGlobal = u.rol === 'global' || userEmail === 'matias.bustos@cormumel.cl';
                const isCenterAdmin = u.rol === 'admin_centro';
                const userNombre = String(u.nombre || (userEmail.includes('@') ? userEmail.split('@')[0] : userEmail)).trim();
                const avatarInitial = (userNombre || userEmail || 'U')[0].toUpperCase();
                const userCentro = u.centro || 'SAR Elsa Romo Aravena';

                return (
                  <tr key={u.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${isBlocked ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                          {avatarInitial}
                        </div>
                        <div>
                          <div className="font-black text-primary-custom text-xs">{userNombre}</div>
                          <div className="text-[10px] text-secondary-custom font-semibold">{userEmail}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-primary-custom">
                        <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{userCentro}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isSuperGlobal 
                          ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' 
                          : isCenterAdmin 
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {isSuperGlobal ? 'Admin. Global General' : isCenterAdmin ? 'Admin. Global de Centro' : 'Usuario Local'}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit ${isBlocked ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'}`}>
                        {isBlocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {isBlocked ? 'Bloqueado' : 'Activo'}
                      </span>
                    </td>

                    <td className="p-4 text-secondary-custom font-bold text-[11px]">
                      {formatDate(u.ultimoInicioSesion)}
                    </td>

                    <td className="p-4 text-secondary-custom font-bold text-[11px]">
                      {formatDate(u.ultimaConsulta)}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* Restablecer Contraseña Administrativo */}
                        <button
                          onClick={() => handleAdminResetPassword(u)}
                          className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg transition cursor-pointer"
                          title="Enviar Correo de Restablecimiento de Contraseña"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {/* Editar Permisos */}
                        <button
                          onClick={() => setEditingUserPerms({
                            ...u,
                            permisos: u.permisos || MODULE_LIST.reduce((acc, m) => ({ ...acc, [m.id]: true }), {})
                          })}
                          className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded-lg transition cursor-pointer"
                          title="Asignar Permisos y Accesos"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Bloquear / Desbloquear */}
                        <button
                          onClick={() => handleToggleBlockUser(u)}
                          className={`p-2 rounded-lg transition cursor-pointer ${isBlocked ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500' : 'bg-slate-500/10 hover:bg-slate-500/20 text-slate-500'}`}
                          title={isBlocked ? 'Desbloquear Cuenta' : 'Bloquear Acceso'}
                        >
                          {isBlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>

                        {/* Eliminar / Dar de Baja Perfil con Justificación */}
                        {userEmail !== 'matias.bustos@cormumel.cl' && (
                          <button
                            onClick={() => { setDeletingUser(u); setMotivoBaja(''); }}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition cursor-pointer"
                            title="Dar de Baja Perfil de Usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL PERSONALIZADO: DAR DE BAJA Y ELIMINAR USUARIO CON JUSTIFICACIÓN DE AUDITORÍA */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card-custom border border-card-custom rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full theme-transition animate-fade-in my-auto">
            
            {/* Encabezado del Modal con Identidad MÉTRICO */}
            <div className="flex items-center gap-4 pb-4 mb-4 border-b border-card-custom/30">
              <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-500/20 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-primary-custom uppercase tracking-wide">
                  Confirmar Baja de Usuario
                </h3>
                <p className="text-xs text-secondary-custom font-semibold mt-0.5">
                  Esta acción desactivará y eliminará la cuenta de usuario del sistema.
                </p>
              </div>
            </div>

            {/* Datos del Usuario Objetivo */}
            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-card-custom/30 space-y-2 mb-4 text-xs">
              <div className="flex justify-between">
                <span className="text-secondary-custom font-bold">Usuario / Nombre:</span>
                <span className="font-black text-primary-custom">{deletingUser.nombre || deletingUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-custom font-bold">Correo Institucional:</span>
                <span className="font-black text-indigo-500">{deletingUser.email || deletingUser.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-custom font-bold">Centro Asignado:</span>
                <span className="font-bold text-primary-custom">{deletingUser.centro || 'SAR Elsa Romo Aravena'}</span>
              </div>
            </div>

            {/* Apartado de Escritura: Motivo / Justificación Obligatoria */}
            <div className="space-y-2 mb-6">
              <label className="block text-xs font-black uppercase text-primary-custom flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                Motivo / Justificación de Baja (Requerido para Auditoría) *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describa la causa administrativa de la baja (ej: Desvinculación de la institución, traslado de establecimiento, fin de contrato, solicitud de jefatura...)"
                value={motivoBaja}
                onChange={e => setMotivoBaja(e.target.value)}
                className="w-full p-3 bg-input-custom border border-card-custom rounded-2xl text-xs font-bold text-primary-custom focus:outline-none focus:border-rose-500 shadow-sm"
              />
              <p className="text-[10px] text-secondary-custom font-semibold">
                Esta justificación quedará registrada de forma permanente en el módulo de **Auditoría del Sistema** con su nombre y fecha.
              </p>
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-custom/30">
              <button
                type="button"
                onClick={() => { setDeletingUser(null); setMotivoBaja(''); }}
                className="px-4 py-2.5 bg-black/10 dark:bg-white/10 text-secondary-custom hover:text-primary-custom font-bold text-xs rounded-xl cursor-pointer transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting || !motivoBaja.trim() || motivoBaja.trim().length < 5}
                onClick={handleConfirmDeleteUser}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-900/20 cursor-pointer disabled:opacity-40 transition flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Procesando...' : 'Confirmar Baja y Registrar Auditoría'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* VISTA Y MODAL: FICHA OFICIAL DE BIENVENIDA Y CREDENCIALES IMPRIMIBLE / ENVIABLE */}
      {createdUserVoucher && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto custom-scrollbar">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full theme-transition animate-fade-in my-auto">
            
            {/* SECCIÓN IMPRIMIBLE CON IDENTIDAD OFICIAL MÉTRICO */}
            <div id="ficha-bienvenida-printable" className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-800 space-y-6">
              
              {/* Encabezado Identidad Visual MÉTRICO */}
              <div className="flex justify-between items-center pb-4 border-b-2 border-indigo-600">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md">
                    <Activity className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-indigo-950 uppercase leading-none">MÉTRICO</h1>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-1">Gestión Estadística Asistencial • Red Salud Cormumel</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[10px] font-black rounded-full uppercase tracking-wider block w-fit ml-auto mb-1">
                    ✓ Cuenta Creada Exitosamente
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{formatDate(createdUserVoucher.createdAt)}</span>
                </div>
              </div>

              {/* Saludo y Bienvenida */}
              <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
                <h3 className="text-sm font-black text-indigo-950 uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Ficha Oficial de Alta e Inserción de Usuario
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
                  Estimado(a) <strong className="text-indigo-950">{createdUserVoucher.nombre}</strong>, se ha habilitado tu acceso oficial a la plataforma estadística **MÉTRICO** para la gestión asistencial y analítica operativa.
                </p>
              </div>

              {/* Resumen de Credenciales */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Credenciales de Acceso Asignadas</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-black text-slate-400 uppercase block">Nombre Completo</span>
                    <span className="text-xs font-black text-slate-900 block mt-0.5">{createdUserVoucher.nombre}</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-black text-slate-400 uppercase block">Correo / Usuario Institucional</span>
                    <span className="text-xs font-black text-indigo-600 select-all block mt-0.5">{createdUserVoucher.email}</span>
                  </div>

                  <div className="p-3.5 bg-indigo-500/5 rounded-xl border border-indigo-500/20">
                    <span className="text-[10px] font-black text-indigo-500 uppercase block">Contraseña Inicial Provisoria</span>
                    <span className="text-sm font-black font-mono text-indigo-700 select-all block mt-0.5">{createdUserVoucher.password}</span>
                  </div>

                  <div className="p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <span className="text-[10px] font-black text-amber-700 uppercase block flex items-center gap-1">
                      <CalendarClock className="w-3.5 h-3.5" /> Vigencia Clave Provisoria
                    </span>
                    <span className="text-xs font-black text-amber-800 block mt-0.5">
                      {createdUserVoucher.vigenciaHoras} Horas (Caduca: {formatDate(createdUserVoucher.fechaVencimiento)})
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-black text-slate-400 uppercase block">Recinto / Centro Asignado</span>
                    <span className="text-xs font-black text-slate-900 block mt-0.5">{createdUserVoucher.centro}</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-black text-slate-400 uppercase block">Rol de Acceso Asignado</span>
                    <span className="text-xs font-black text-indigo-700 block mt-0.5">
                      {createdUserVoucher.rol === 'global' 
                        ? 'Administrador Global General (Acceso Multicentro a Toda la Red)' 
                        : createdUserVoucher.rol === 'admin_centro'
                        ? 'Administrador Global de Centro (Gestión Exclusiva del Recinto)'
                        : 'Usuario Local (Acceso Operativo de Centro)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Indicaciones para el Usuario */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-500" />
                  Instrucciones de Primer Acceso e Inserción
                </h4>
                <ol className="text-xs text-slate-600 font-medium space-y-1.5 list-decimal pl-4 leading-relaxed">
                  <li>Ingrese a la plataforma estadística **MÉTRICO** desde el navegador de su equipo corporativo.</li>
                  <li>Inicie sesión utilizando su correo (<strong className="text-slate-900">{createdUserVoucher.email}</strong>) y la clave inicial provista (<strong className="text-indigo-700">{createdUserVoucher.password}</strong>).</li>
                  <li><strong>Vigencia Temporal</strong>: Esta clave provisoria es válida por <strong>{createdUserVoucher.vigenciaHoras} horas</strong>. Al acceder por primera vez, diríjase a la parte inferior del menú lateral izquierdo y seleccione la opción <strong>"Cambiar Clave"</strong> para definir su contraseña personal definitiva.</li>
                </ol>
              </div>
            </div>

            {/* Botones de Acción (Imprimir, Copiar para Correo, Cerrar) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-800 no-print">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir / Descargar Ficha PDF
                </button>

                <button
                  onClick={() => {
                    const textToCopy = `¡Bienvenido(a) a MÉTRICO!\n\nEstimado(a) ${createdUserVoucher.nombre},\nSe ha habilitado tu acceso a la plataforma estadística MÉTRICO.\n\nCREDANCIALES DE ACCESO:\n- Correo: ${createdUserVoucher.email}\n- Contraseña Inicial Provisoria: ${createdUserVoucher.password}\n- Vigencia Clave Provisoria: ${createdUserVoucher.vigenciaHoras} Horas (Caduca el ${formatDate(createdUserVoucher.fechaVencimiento)})\n- Centro Asignado: ${createdUserVoucher.centro}\n- Rol: ${createdUserVoucher.rol === 'global' ? 'Administrador Global General' : createdUserVoucher.rol === 'admin_centro' ? 'Administrador Global de Centro' : 'Usuario Local'}\n\nINDICACIONES DE INGRESO:\n1. Ingrese a la plataforma MÉTRICO.\n2. Inicie sesión con su correo e id provistos.\n3. Al ingresar por primera vez, haga clic en "Cambiar Clave" en el menú inferior izquierdo para personalizar su contraseña definitiva.`;
                    navigator.clipboard.writeText(textToCopy);
                    setCopiedNotification(true);
                    setTimeout(() => setCopiedNotification(false), 2500);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copiedNotification ? '¡Copiado al Portapapeles!' : 'Copiar Texto para Correo'}
                </button>
              </div>

              <button
                onClick={() => setCreatedUserVoucher(null)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cerrar y Volver a Usuarios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
