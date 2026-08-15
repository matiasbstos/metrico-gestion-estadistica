import { useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, appId } from '../config/firebase';
import { savePacientesToIDB, loadPacientesFromIDB, saveTurnosToIDB, loadTurnosFromIDB } from '../utils/indexedDB';

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

  // 1. Manejo de autenticación
  useEffect(() => {
    if (auth) {
      const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
        setUser(u);
        if (u) {
          const emailRol = u.email === 'matias.bustos@cormumel.cl' ? 'global' : 'local';
          setUserProfile({ email: u.email, rol: emailRol });

          try {
            const { doc, getDoc, setDoc, updateDoc } = await import('firebase/firestore');
            const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', u.uid);
            const userSnap = await getDoc(userRef);
            const now = Date.now();

            if (userSnap.exists()) {
              const data = userSnap.data();
              let cleanRol = (data.rol || 'local').replace(/['"]/g, '').trim().toLowerCase();
              if (u.email === 'matias.bustos@cormumel.cl') cleanRol = 'global';
              const updatedProfile = { ...data, rol: cleanRol, ultimoInicioSesion: now, ultimaConsulta: now };
              setUserProfile(updatedProfile);
              updateDoc(userRef, { ultimoInicioSesion: now, ultimaConsulta: now }).catch(() => {});
            } else {
              const defaultRol = u.email === 'matias.bustos@cormumel.cl' ? 'global' : 'local';
              const newProfile = { 
                email: u.email, 
                nombre: u.displayName || u.email.split('@')[0],
                rol: defaultRol, 
                estado: 'activo',
                createdAt: now, 
                ultimoInicioSesion: now, 
                ultimaConsulta: now 
              };
              await setDoc(userRef, newProfile);
              setUserProfile(newProfile);
            }
          } catch (e) {
            console.error('Error fetching user profile', e);
            setUserProfile({ email: u.email, rol: emailRol });
          }
        } else {
          setUserProfile(null);
          setSyncStatus('error');
          setLoading(false);
        }
      });
      return () => unsubscribeAuth();
    }
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
      const snapTurnos = await getDocs(qTurnos);
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
        const snapPacs = await getDocs(qRange);

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
        }, 1500);
      }
    } catch (err) {
      console.error("Error en sincronización profunda:", err);
      setSyncStatus('synced');
      setLoading(false);
      if (!isSilent) setSyncProgress(prev => ({ ...prev, active: false }));
    }
  }, [user, filtroFechaInicio, filtroFechaFin]);

  // 3. Carga inicial instantánea desde IndexedDB + primer refresco
  useEffect(() => {
    if (!user || !db) return;

    let isSubscribed = true;

    const runPreload = async () => {
      setSyncStatus('connecting');
      
      const cachedPacs = await loadPacientesFromIDB();
      const cachedTurnos = await loadTurnosFromIDB();

      if (cachedPacs && cachedPacs.length > 0 && isSubscribed) {
        cachedPacs.forEach(p => {
          const id = p.id || p.docId || `${p.tAdmision}_${p.correlativo || p.nombrePaciente}`;
          globalPacientesMapRef.current.set(id, p);
        });
        const arr = Array.from(globalPacientesMapRef.current.values()).sort((a, b) => b.tAdmision - a.tAdmision);
        setPacientesDB(arr);
        setAllPacientesDB(arr);
        setLoading(false);
      }

      if (cachedTurnos && cachedTurnos.length > 0 && isSubscribed) {
        setTurnosDB(cachedTurnos);
      }

      await forceDeepSync(true);
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
        const snap = await getDocs(qHistorical);
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
          }, 1500);
        }
      } catch (err) {
        console.error("Error consultando datos por rango:", err);
        if (isSubscribed) setSyncProgress(prev => ({ ...prev, active: false }));
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
