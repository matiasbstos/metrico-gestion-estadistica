import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { 
  Users, UserPlus, Shield, ShieldAlert, Lock, Unlock, Trash2, Edit3, Check, X, Clock, Eye, Activity,
  BarChart2, GitCompare, Calendar, Award, UserCheck, FileSpreadsheet, Database, ArrowLeftRight
} from 'lucide-react';
import { firebaseConfig, appId } from '../../config/firebase';

const MODULE_LIST = [
  { id: 'resumen', name: 'Inicio / Resumen General', icon: BarChart2, color: 'text-indigo-500' },
  { id: 'comparativo', name: 'Rendimiento Turno', icon: GitCompare, color: 'text-emerald-500' },
  { id: 'calendario', name: 'Histórico Mensual', icon: Calendar, color: 'text-blue-500' },
  { id: 'profesionales', name: 'Rendimiento Clínico', icon: Award, color: 'text-amber-500' },
  { id: 'perfil_paciente', name: 'Perfil del Paciente', icon: Users, color: 'text-purple-500' },
  { id: 'altas', name: 'Altas Administrativas', icon: UserCheck, color: 'text-rose-500' },
  { id: 'fracturas', name: 'Estadísticas de Fractura', icon: Activity, color: 'text-rose-500' },
  { id: 'enfermeria', name: 'Rendimiento Enfermería', icon: Activity, color: 'text-indigo-500' },
  { id: 'constataciones', name: 'Constatación de Lesiones', icon: ShieldAlert, color: 'text-amber-500' },
  { id: 'traslados', name: 'Traslados Hospitalarios', icon: ArrowLeftRight, color: 'text-indigo-500' },
  { id: 'reportes', name: 'Reporte Ejecutivo', icon: FileSpreadsheet, color: 'text-emerald-500' },
  { id: 'data', name: 'Gestión de Datos', icon: Database, color: 'text-teal-500' },
  { id: 'auditoria', name: 'Registro de Auditoría', icon: Shield, color: 'text-indigo-500' }
];

export default function GestionUsuarios({ db, userProfile, isGlobalAdmin }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUserPerms, setEditingUserPerms] = useState(null);

  // Formulario nuevo usuario
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRol, setNewRol] = useState('local');
  const [newPermisos, setNewPermisos] = useState(
    MODULE_LIST.reduce((acc, m) => ({ ...acc, [m.id]: true }), {})
  );
  const [creatingUser, setCreatingUser] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
        centro: 'SAR ELSA ROMO ARAVENA',
        detalles
      });
    } catch (e) {
      console.error('Error recording audit log:', e);
    }
  };

  // Crear Usuario con app secundaria de Firebase Auth
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newEmail || !newPassword) {
      setErrorMessage('Por favor ingrese correo y contraseña.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCreatingUser(true);
    setErrorMessage('');

    try {
      let secondaryApp = getApps().find(app => app.name === 'SecondaryAdminUserApp');
      if (!secondaryApp) {
        secondaryApp = initializeApp(firebaseConfig, 'SecondaryAdminUserApp');
      }
      const secondaryAuth = getAuth(secondaryApp);

      const userCred = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
      const uid = userCred.user.uid;

      const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', uid);
      const newUserData = {
        uid,
        email: newEmail.trim().toLowerCase(),
        nombre: newName.trim() || newEmail.split('@')[0],
        rol: newRol,
        estado: 'activo',
        permisos: newPermisos,
        createdAt: Date.now(),
        ultimoInicioSesion: Date.now(),
        ultimaConsulta: Date.now()
      };

      await setDoc(userDocRef, newUserData);
      await logAuditAction('Carga Usuario', `Creado nuevo usuario "${newEmail}" con rol ${newRol.toUpperCase()}`);

      // Resetear campos y cerrar modal
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      setNewRol('local');
      setShowAddModal(false);
    } catch (err) {
      console.error('Error creando usuario:', err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('El correo electrónico ya está registrado.');
      } else {
        setErrorMessage(err.message || 'Error al crear el usuario.');
      }
    } finally {
      setCreatingUser(false);
    }
  };

  // Cambiar Estado (Bloquear / Desbloquear)
  const handleToggleBlockUser = async (user) => {
    const nuevoEstado = user.estado === 'bloqueado' ? 'activo' : 'bloqueado';
    try {
      const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.id);
      await updateDoc(userRef, { estado: nuevoEstado });
      await logAuditAction(
        nuevoEstado === 'bloqueado' ? 'Edición Usuario' : 'Edición Usuario',
        `Estado de usuario "${user.email}" cambiado a ${nuevoEstado.toUpperCase()}`
      );
    } catch (err) {
      console.error('Error al cambiar estado de usuario:', err);
    }
  };

  // Eliminar Perfil de Firestore
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`¿Está seguro de eliminar el perfil de usuario "${user.email}"?`)) return;
    try {
      const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.id);
      await deleteDoc(userRef);
      await logAuditAction('Eliminación Usuario', `Eliminado perfil de usuario "${user.email}"`);
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
    }
  };

  // Guardar Cambios de Permisos
  const handleSavePermissions = async () => {
    if (!editingUserPerms) return;
    try {
      const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', editingUserPerms.id);
      await updateDoc(userRef, {
        permisos: editingUserPerms.permisos,
        rol: editingUserPerms.rol
      });
      await logAuditAction('Edición Permisos', `Actualizados permisos y rol de usuario "${editingUserPerms.email}"`);
      setEditingUserPerms(null);
    } catch (err) {
      console.error('Error al actualizar permisos:', err);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Sin registros';
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return 'Sin registros';
    return `${d.toLocaleDateString('es-CL')} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="bg-card-custom rounded-2xl shadow-sm border border-card-custom p-6 flex flex-col h-full theme-transition">
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
            onClick={() => setShowAddModal(true)}
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
              <th className="p-4">Rol de Acceso</th>
              <th className="p-4">Estado</th>
              <th className="p-4"><div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-indigo-500"/> Último Inicio Sesión</div></th>
              <th className="p-4"><div className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-indigo-500"/> Última Consulta</div></th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-custom/20">
            {loading ? (
              <tr><td colSpan="6" className="p-12 text-center text-secondary-custom font-semibold">Cargando cuentas de usuario...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="6" className="p-12 text-center text-secondary-custom font-semibold">No hay usuarios registrados en el sistema.</td></tr>
            ) : (
              users.map(u => {
                const isBlocked = u.estado === 'bloqueado';
                const userEmail = String(u.email || u.id || 'Sin correo').trim();
                const isGlobal = u.rol === 'global' || userEmail === 'matias.bustos@cormumel.cl';
                const userNombre = String(u.nombre || (userEmail.includes('@') ? userEmail.split('@')[0] : userEmail)).trim();
                const avatarInitial = (userNombre || userEmail || 'U')[0].toUpperCase();

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
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isGlobal ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'}`}>
                        {isGlobal ? 'Administrador Global' : 'Usuario Local'}
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
                          className={`p-2 rounded-lg transition cursor-pointer ${isBlocked ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500'}`}
                          title={isBlocked ? 'Desbloquear Cuenta' : 'Bloquear Acceso'}
                        >
                          {isBlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>

                        {/* Eliminar Perfil */}
                        {userEmail !== 'matias.bustos@cormumel.cl' && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition cursor-pointer"
                            title="Eliminar Perfil"
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

      {/* MODAL: AGREGAR NUEVO USUARIO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card-custom border border-card-custom rounded-2xl shadow-2xl p-6 max-w-md w-full theme-transition animate-fade-in">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-card-custom/30">
              <h3 className="text-base font-black text-primary-custom uppercase tracking-wide flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-500" />
                Registrar Nuevo Usuario
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-secondary-custom hover:text-primary-custom cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-secondary-custom mb-1">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-input-custom border border-card-custom rounded-xl text-xs font-bold text-primary-custom focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-secondary-custom mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="usuario@cormumel.cl"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-input-custom border border-card-custom rounded-xl text-xs font-bold text-primary-custom focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-secondary-custom mb-1">Contraseña Inicial *</label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-input-custom border border-card-custom rounded-xl text-xs font-bold text-primary-custom focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-secondary-custom mb-1">Rol de Acceso</label>
                <select
                  value={newRol}
                  onChange={e => setNewRol(e.target.value)}
                  className="w-full px-3 py-2 bg-input-custom border border-card-custom rounded-xl text-xs font-bold text-primary-custom focus:outline-none focus:border-indigo-500"
                >
                  <option value="local">Usuario Local (SAR Elsa Romo)</option>
                  <option value="global">Administrador Global</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-card-custom/30">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-black/10 dark:bg-white/10 text-secondary-custom hover:text-primary-custom font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {creatingUser ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MATRIZ DE PERMISOS Y ACCESOS */}
      {editingUserPerms && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card-custom border border-card-custom rounded-2xl shadow-2xl p-6 max-w-xl w-full theme-transition animate-fade-in">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-card-custom/30">
              <div>
                <h3 className="text-base font-black text-primary-custom uppercase tracking-wide flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-500" />
                  Matriz de Permisos: {editingUserPerms.email || editingUserPerms.id || 'Usuario'}
                </h3>
                <p className="text-[10px] text-secondary-custom font-semibold mt-0.5">
                  Seleccione los módulos visibles y las funcionalidades habilitadas para este usuario.
                </p>
              </div>
              <button 
                onClick={() => setEditingUserPerms(null)}
                className="text-secondary-custom hover:text-primary-custom cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selección de Rol */}
            <div className="mb-5 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-card-custom/30 flex items-center justify-between">
              <span className="text-xs font-black text-primary-custom uppercase">Rol de Usuario:</span>
              <select
                value={editingUserPerms.rol || 'local'}
                onChange={e => setEditingUserPerms({ ...editingUserPerms, rol: e.target.value })}
                className="px-3 py-1.5 bg-input-custom border border-card-custom rounded-xl text-xs font-bold text-primary-custom"
              >
                <option value="local">Usuario Local</option>
                <option value="global">Administrador Global</option>
              </select>
            </div>

            {/* Grid de Checkboxes de Módulos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar p-1 mb-6">
              {MODULE_LIST.map(mod => {
                const IconComponent = mod.icon;
                const isChecked = editingUserPerms.permisos[mod.id] !== false;

                return (
                  <label
                    key={mod.id}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${isChecked ? 'bg-indigo-500/10 border-indigo-500/40 text-primary-custom font-bold' : 'bg-black/5 dark:bg-white/5 border-card-custom text-secondary-custom'}`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <IconComponent className={`w-4 h-4 ${mod.color} shrink-0`} />
                      <span className="text-xs font-bold truncate">{mod.name}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        setEditingUserPerms({
                          ...editingUserPerms,
                          permisos: {
                            ...editingUserPerms.permisos,
                            [mod.id]: e.target.checked
                          }
                        });
                      }}
                      className="w-4 h-4 text-indigo-600 rounded border-card-custom focus:ring-indigo-500 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-card-custom/30">
              <button
                onClick={() => setEditingUserPerms(null)}
                className="px-4 py-2 bg-black/10 dark:bg-white/10 text-secondary-custom hover:text-primary-custom font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePermissions}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Guardar Permisos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
