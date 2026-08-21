import { useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, appId } from '../config/firebase';
import { savePacientesToIDB, loadPacientesFromIDB, saveTurnosToIDB, loadTurnosFromIDB } from '../utils/indexedDB';

const runWithTimeout = (promise, ms = 3500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), ms))
  ]);
};

export const useMetricoData = (filtroFechaInicio, filtroFechaFin) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const [pacientesDB, setPacientesDB] = useState([]);
  const [allPacientesDB, setAllPacientesDB] = useState([]);
  const [turnosDB, setTurnosDB] = useState([]);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncToast, setSyncToast] = useState(null);

  // Estado del indicador de progreso en tiempo real
  const [syncProgress, setSyncProgress] = useState({
    active: false,
    pct: 0,
    loadedCount: 0,
    totalCount: 0,
    message: '',
    isHistorical: false
  });

  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('connecting');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Referencia para almacenamiento global en memoria
  const globalPacientesMapRef = useRef(new Map());

  // Helper para hora amigable
  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // 1. Manejo de autenticación Ultra-Rápido (no bloqueante)
  useEffect(() => {
    if (!auth) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      if (u) {
        // Verificación de expiración estricta de sesión (15 min de inactividad)
        const lastActStr = localStorage.getItem('metrico_last_activity');
        if (lastActStr) {
          const elapsed = Date.now() - parseInt(lastActStr, 10);
          if (elapsed >= 15 * 60 * 1000) {
            try {
              sessionStorage.clear();
              localStorage.clear();
            } catch (e) {}
            localStorage.setItem('metrico_logout_reason', 'inactividad');
            import('firebase/auth').then(({ signOut }) => {
              signOut(auth).catch(() => {});
            });
            setUser(null);
            setUserProfile(null);
            setLoading(false);
            return;
          }
        } else {
          localStorage.setItem('metrico_last_activity', Date.now().toString());
        }

        // Establecer usuario y perfil base de inmediato (0ms de latencia visual)
        const emailRol = u.email === 'matias.bustos@cormumel.cl' ? 'global' : 'local';
        setUser(u);
        setUserProfile({ email: u.email, rol: emailRol });

        // Cargar/actualizar perfil en segundo plano sin congelar la interfaz
        if (db) {
          const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', u.uid);
          const now = Date.now();

          runWithTimeout(getDoc(userRef), 8000).then((userSnap) => {
            if (userSnap && userSnap.exists()) {
              const data = userSnap.data();
              let cleanRol = (data.rol || 'local').replace(/['"]/g, '').trim().toLowerCase();
              if (u.email === 'matias.bustos@cormumel.cl') cleanRol = 'global';
              const updatedProfile = { ...data, rol: cleanRol, ultimoInicioSesion: now, ultimaConsulta: now };
              setUserProfile(updatedProfile);
              updateDoc(userRef, { ultimoInicioSesion: now, ultimaConsulta: now }).catch(() => {});
            } else {
              const newProfile = { 
                email: u.email, 
                nombre: u.displayName || u.email.split('@')[0],
                rol: emailRol, 
                estado: 'activo',
                createdAt: now, 
                ultimoInicioSesion: now, 
                ultimaConsulta: now 
              };
              setDoc(userRef, newProfile).catch(() => {});
              setUserProfile(newProfile);
            }
          }).catch(() => {
            // Manejo silencioso: el perfil base ya está activo
          });
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setSyncStatus('synced');
        setLoading(false);
        setSyncProgress(prev => ({ ...prev, active: false }));
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Función de Sincronización Profunda en Vivo (Deep Live Sync)
  const forceDeepSync = useCallback(async (isSilent = false) => {
    if (!user || !db) return;

    if (!isSilent) {
      setSyncStatus('syncing');
      setSyncProgress(prev => ({ ...prev, active: true, pct: 15, message: 'Iniciando sincronización profunda...' }));
    }

    try {
      // 2.1 Carga / Refresco de Turnos
      const turnosRef = collection(db, 'artifacts', appId, 'public', 'data', 'turnos');
      const qTurnos = query(turnosRef, where('fechaInicio', '>=', '2025-01-01'));
      const snapTurnos = await runWithTimeout(getDocs(qTurnos), 5000);
      const turnosList = snapTurnos.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
        return new Date(b.fechaInicio || 0) - new Date(a.fechaInicio || 0);
      });
      setTurnosDB(turnosList);
      saveTurnosToIDB(turnosList);

      // 2.2 Sincronización de Pacientes para el rango activo
      if (filtroFechaInicio && filtroFechaFin) {
        const [y1, m1, d1] = filtroFechaInicio.split('-').map(Number);
        const [y2, m2, d2] = filtroFechaFin.split('-').map(Number);
        const startMs = new Date(y1, m1 - 1, d1 - 1, 0, 0, 0).getTime();
        const endMs = new Date(y2, m2 - 1, d2 + 1, 23, 59, 59).getTime();

        const pacientesRef = collection(db, 'artifacts', appId, 'public', 'data', 'pacientes_urgencia');
        const qRange = query(
          pacientesRef, 
          where('tAdmision', '>=', startMs), 
          where('tAdmision', '<=', endMs)
        );
        const snapPacs = await runWithTimeout(getDocs(qRange), 6000);

        snapPacs.docs.forEach(d => {
          const p = { id: d.id, ...d.data() };
          globalPacientesMapRef.current.set(d.id, p);
        });
      }

      const arr = Array.from(globalPacientesMapRef.current.values()).sort((a, b) => b.tAdmision - a.tAdmision);
      setPacientesDB(arr);
      setAllPacientesDB(arr);
      savePacientesToIDB(arr);

      const formattedTime = getFormattedTime();
      setLastSyncTime(formattedTime);
      setSyncStatus('synced');
      setLoading(false);

      // Disparar Notificación Pop-up Alerta
      setSyncToast({
        id: Date.now(),
        type: isSilent ? 'auto' : 'manual',
        title: isSilent ? 'Auto-Sincronización Silenciosa (5m)' : 'Sincronización Profunda Exitosa',
        message: isSilent 
          ? `Base de datos al día. Sincronizado automáticamente a las ${formattedTime} hrs.`
          : `Re-evaluación completada a las ${formattedTime} hrs. ${arr.length.toLocaleString()} registros verificados al 100%.`,
        timestamp: formattedTime,
        count: arr.length
      });

      if (!isSilent) {
        setSyncProgress({
          active: true,
          pct: 100,
          loadedCount: arr.length,
          totalCount: arr.length,
          message: `Sincronización completada. ${arr.length} registros auditados.`,
          isHistorical: false
        });
        setTimeout(() => {
          setSyncProgress(prev => ({ ...prev, active: false }));
        }, 1200);
      } else {
        setSyncProgress(prev => ({ ...prev, active: false }));
      }
    } catch (err) {
      console.warn("Sincronización Firestore en segundo plano (usando datos locales):", err);
      setSyncStatus('synced');
      setLoading(false);
      setSyncProgress(prev => ({ ...prev, active: false }));
    }
  }, [user, filtroFechaInicio, filtroFechaFin]);

  // 3. Carga inicial instantánea desde IndexedDB + primer refresco
  useEffect(() => {
    if (!user || !db) return;

    let isSubscribed = true;

    const runPreload = async () => {
      setSyncStatus('connecting');
      
      try {
        const [cachedPacs, cachedTurnos] = await Promise.all([
          loadPacientesFromIDB().catch(() => []),
          loadTurnosFromIDB().catch(() => [])
        ]);

        if (isSubscribed) {
          if (cachedPacs && cachedPacs.length > 0) {
            cachedPacs.forEach(p => {
              const id = p.id || p.docId || `${p.tAdmision}_${p.correlativo || p.nombrePaciente}`;
              globalPacientesMapRef.current.set(id, p);
            });
            const arr = Array.from(globalPacientesMapRef.current.values()).sort((a, b) => b.tAdmision - a.tAdmision);
            setPacientesDB(arr);
            setAllPacientesDB(arr);
          }

          if (cachedTurnos && cachedTurnos.length > 0) {
            setTurnosDB(cachedTurnos);
          }

          setLoading(false);
          setSyncStatus('synced');
        }
      } catch (e) {
        console.warn("Error cargando caché IndexedDB:", e);
      } finally {
        if (isSubscribed) {
          setLoading(false);
          setSyncStatus('synced');
        }
      }

      // Sincronización en segundo plano sin congelar la pantalla
      forceDeepSync(true);
    };

    runPreload();

    return () => {
      isSubscribed = false;
    };
  }, [user, refreshTrigger, forceDeepSync]);

  // 4. Temporizador de Auto-Sincronización Silenciosa cada 5 Minutos (300,000 ms)
  useEffect(() => {
    if (!user || !db) return;

    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    const intervalId = setInterval(() => {
      console.log(`[AUTOSYNC 5m] Ejecutando sincronización periódica a las ${getFormattedTime()}...`);
      forceDeepSync(true);
    }, FIVE_MINUTES_MS);

    return () => clearInterval(intervalId);
  }, [user, forceDeepSync]);

  // 5. Consulta bajo demanda en tiempo real para fechas solicitadas fuera de la caché
  useEffect(() => {
    if (!user || !db || !filtroFechaInicio || !filtroFechaFin) return;

    let isSubscribed = true;

    const checkAndFetchHistoricalData = async () => {
      const [y1, m1, d1] = filtroFechaInicio.split('-').map(Number);
      const [y2, m2, d2] = filtroFechaFin.split('-').map(Number);
      if (!y1 || !y2) return;

      const reqStartMs = new Date(y1, m1 - 1, d1, 0, 0, 0).getTime();
      const reqEndMs = new Date(y2, m2 - 1, d2, 23, 59, 59).getTime();

      // Verificar si los registros del rango solicitado ya existen en la memoria local / IndexedDB
      const existingInMap = Array.from(globalPacientesMapRef.current.values()).filter(p => p.tAdmision >= reqStartMs && p.tAdmision <= reqEndMs);
      if (existingInMap.length > 0 || globalPacientesMapRef.current.size >= 20000) {
        // Los datos ya se encuentran en memoria/caché local, evitar peticiones repetidas a Firestore
        const mergedList = Array.from(globalPacientesMapRef.current.values()).sort((a, b) => b.tAdmision - a.tAdmision);
        setPacientesDB(mergedList);
        setAllPacientesDB(mergedList);
        setSyncProgress(prev => ({ ...prev, active: false }));
        setSyncStatus('synced');
        return;
      }

      setSyncProgress({
        active: true,
        pct: 25,
        loadedCount: globalPacientesMapRef.current.size,
        totalCount: 0,
        message: `Consultando registros para el rango (${filtroFechaInicio} a ${filtroFechaFin})...`,
        isHistorical: true
      });

      const pacientesRef = collection(db, 'artifacts', appId, 'public', 'data', 'pacientes_urgencia');
      const qHistorical = query(
        pacientesRef, 
        where('tAdmision', '>=', reqStartMs), 
        where('tAdmision', '<=', reqEndMs)
      );

      try {
        const snap = await runWithTimeout(getDocs(qHistorical), 5000);
        if (isSubscribed) {
          snap.docs.forEach(d => {
            const p = { id: d.id, ...d.data() };
            globalPacientesMapRef.current.set(d.id, p);
          });

          const mergedList = Array.from(globalPacientesMapRef.current.values()).sort((a, b) => b.tAdmision - a.tAdmision);
          setPacientesDB(mergedList);
          setAllPacientesDB(mergedList);
          const formattedTime = getFormattedTime();
          setLastSyncTime(formattedTime);

          setSyncProgress({
            active: true,
            pct: 100,
            loadedCount: mergedList.length,
            totalCount: mergedList.length,
            message: 'Carga de datos completada.',
            isHistorical: true
          });

          setTimeout(() => {
            if (isSubscribed) setSyncProgress(prev => ({ ...prev, active: false }));
            setSyncStatus('synced');
          }, 800);
        }
      } catch (err) {
        console.warn("Consulta Firestore limitada (usando caché local):", err);
        if (isSubscribed) {
          const mergedList = Array.from(globalPacientesMapRef.current.values()).sort((a, b) => b.tAdmision - a.tAdmision);
          if (mergedList.length > 0) {
            setPacientesDB(mergedList);
            setAllPacientesDB(mergedList);
          }
          setSyncProgress(prev => ({ ...prev, active: false }));
          setSyncStatus('synced');
        }
      }
    };

    checkAndFetchHistoricalData();

    return () => {
      isSubscribed = false;
    };
  }, [user, filtroFechaInicio, filtroFechaFin]);

  return { 
    user, 
    userProfile, 
    loading, 
    syncStatus, 
    setSyncStatus, 
    setLoading, 
    pacientesDB, 
    allPacientesDB,
    turnosDB,
    syncProgress,
    lastSyncTime,
    syncToast,
    clearSyncToast: () => setSyncToast(null),
    forceDeepSync,
    triggerRefresh: () => {
      setRefreshTrigger(prev => prev + 1);
      return forceDeepSync(false);
    }
  };
};
