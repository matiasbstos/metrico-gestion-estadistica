import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db, appId } from '../config/firebase';
import { savePacientesToIDB, loadPacientesFromIDB, saveTurnosToIDB, loadTurnosFromIDB } from '../utils/indexedDB';

export const useMetricoData = (filtroFechaInicio, filtroFechaFin) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const [pacientesDB, setPacientesDB] = useState([]);
  const [allPacientesDB, setAllPacientesDB] = useState([]);
  const [turnosDB, setTurnosDB] = useState([]);

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

  // 2. Carga inicial instantánea desde IndexedDB + Sincronización de 6 Meses con Barra de Progreso
  useEffect(() => {
    if (!user || !db) return;

    let isSubscribed = true;

    const runPreload6Months = async () => {
      setSyncStatus('connecting');
      
      // Paso A: Carga previa instantánea desde IndexedDB
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

      // Paso B: Carga progresiva en tiempo real de los últimos 6 meses desde Firestore
      const nowMs = Date.now();
      const sixMonthsAgoMs = nowMs - (180 * 24 * 60 * 60 * 1000); // 180 días

      setSyncProgress({
        active: true,
        pct: 5,
        loadedCount: globalPacientesMapRef.current.size,
        totalCount: 0,
        message: 'Iniciando descarga de los últimos 6 meses de datos asistenciales...',
        isHistorical: false
      });

      const pacientesRef = collection(db, 'artifacts', appId, 'public', 'data', 'pacientes_urgencia');
      const turnosRef = collection(db, 'artifacts', appId, 'public', 'data', 'turnos');

      // Dividir los 6 meses en 6 bloques mensuales para calcular el progreso porcentual exacto
      const monthChunks = [];
      for (let i = 5; i >= 0; i--) {
        const chunkStart = nowMs - ((i + 1) * 30 * 24 * 60 * 60 * 1000);
        const chunkEnd = nowMs - (i * 30 * 24 * 60 * 60 * 1000);
        monthChunks.push({ start: chunkStart, end: chunkEnd, label: `Mes ${6 - i} de 6` });
      }

      let totalFetched = 0;
      for (let idx = 0; idx < monthChunks.length; idx++) {
        if (!isSubscribed) break;
        const chunk = monthChunks[idx];

        const qChunk = query(
          pacientesRef, 
          where('tAdmision', '>=', chunk.start), 
          where('tAdmision', '<=', chunk.end)
        );

        try {
          const snap = await getDocs(qChunk);
          snap.docs.forEach(d => {
            const p = { id: d.id, ...d.data() };
            globalPacientesMapRef.current.set(d.id, p);
          });

          totalFetched += snap.docs.length;
          const currentPct = Math.round(((idx + 1) / monthChunks.length) * 100);

          if (isSubscribed) {
            const updatedList = Array.from(globalPacientesMapRef.current.values()).sort((a, b) => b.tAdmision - a.tAdmision);
            setPacientesDB(updatedList);
            setAllPacientesDB(updatedList);
            setLoading(false);

            setSyncProgress({
              active: true,
              pct: currentPct,
              loadedCount: updatedList.length,
              totalCount: totalFetched,
              message: `Sincronizando registros asistenciales (${currentPct}%)...`,
              isHistorical: false
            });
          }
        } catch (err) {
          console.warn(`Error cargando bloque de 6m (${chunk.label}):`, err);
        }
      }

      // Cargar Turnos
      try {
        const qTurnos = query(turnosRef, where('fechaInicio', '>=', '2025-01-01'));
        const snapTurnos = await getDocs(qTurnos);
        const turnosList = snapTurnos.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
          return new Date(b.fechaInicio || 0) - new Date(a.fechaInicio || 0);
        });
        if (isSubscribed) {
          setTurnosDB(turnosList);
          saveTurnosToIDB(turnosList);
        }
      } catch (err) {
        console.warn("Error cargando turnos:", err);
      }

      if (isSubscribed) {
        const finalList = Array.from(globalPacientesMapRef.current.values()).sort((a, b) => b.tAdmision - a.tAdmision);
        savePacientesToIDB(finalList);

        setSyncProgress({
          active: true,
          pct: 100,
          loadedCount: finalList.length,
          totalCount: finalList.length,
          message: 'Sincronización completada. Datos de los últimos 6 meses en caché.',
          isHistorical: false
        });

        setTimeout(() => {
          if (isSubscribed) {
            setSyncProgress(prev => ({ ...prev, active: false }));
            setSyncStatus('synced');
          }
        }, 2200);
      }
    };

    runPreload6Months();

    return () => {
      isSubscribed = false;
    };
  }, [user, refreshTrigger]);

  // 3. Consulta bajo demanda en tiempo real para fechas solicitadas fuera de los 6 meses
  useEffect(() => {
    if (!user || !db || !filtroFechaInicio || !filtroFechaFin) return;

    let isSubscribed = true;

    const checkAndFetchHistoricalData = async () => {
      const [y1, m1, d1] = filtroFechaInicio.split('-').map(Number);
      const [y2, m2, d2] = filtroFechaFin.split('-').map(Number);
      if (!y1 || !y2) return;

      const reqStartMs = new Date(y1, m1 - 1, d1, 0, 0, 0).getTime();
      const reqEndMs = new Date(y2, m2 - 1, d2, 23, 59, 59).getTime();

      const sixMonthsAgoMs = Date.now() - (180 * 24 * 60 * 60 * 1000);

      // Si la fecha solicitada va más atrás de los 6 meses pre-cargados
      if (reqStartMs < sixMonthsAgoMs) {
        setSyncProgress({
          active: true,
          pct: 25,
          loadedCount: globalPacientesMapRef.current.size,
          totalCount: 0,
          message: `Consultando registros históricos fuera de los 6 meses (${filtroFechaInicio} a ${filtroFechaFin})...`,
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
            setSyncProgress(prev => ({ ...prev, pct: 75, message: `Procesando ${snap.docs.length} registros históricos descargados...` }));
            
            snap.docs.forEach(d => {
              const p = { id: d.id, ...d.data() };
              globalPacientesMapRef.current.set(d.id, p);
            });

            const mergedList = Array.from(globalPacientesMapRef.current.values()).sort((a, b) => b.tAdmision - a.tAdmision);
            setPacientesDB(mergedList);
            setAllPacientesDB(mergedList);

            setSyncProgress({
              active: true,
              pct: 100,
              loadedCount: mergedList.length,
              totalCount: mergedList.length,
              message: 'Carga de datos históricos completada.',
              isHistorical: true
            });

            setTimeout(() => {
              if (isSubscribed) setSyncProgress(prev => ({ ...prev, active: false }));
            }, 1800);
          }
        } catch (err) {
          console.error("Error consultando datos históricos:", err);
          if (isSubscribed) setSyncProgress(prev => ({ ...prev, active: false }));
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
    triggerRefresh: () => setRefreshTrigger(prev => prev + 1)
  };
};
