import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db, appId } from '../config/firebase';

export const useMetricoData = (filtroFechaInicio, filtroFechaFin) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Inicialización instantánea con caché local
  const [pacientesDB, setPacientesDB] = useState(() => {
    try {
      const cached = localStorage.getItem('metrico_cached_pacientes');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [turnosDB, setTurnosDB] = useState(() => {
    try {
      const cached = localStorage.getItem('metrico_cached_turnos');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const hasCache = pacientesDB.length > 0;
  const [loading, setLoading] = useState(!hasCache);
  const [syncStatus, setSyncStatus] = useState(hasCache ? 'synced' : 'connecting');

  const [pacientesLoaded, setPacientesLoaded] = useState(hasCache);
  const [turnosLoaded, setTurnosLoaded] = useState(hasCache);

  useEffect(() => {
    if (auth) {
      const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
        setUser(u);
        if (u) {
          const emailRol = u.email === 'matias.bustos@cormumel.cl' ? 'global' : 'local';
          setUserProfile({ email: u.email, rol: emailRol });

          try {
            const { doc, getDoc, setDoc } = await import('firebase/firestore');
            const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', u.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const data = userSnap.data();
              const rawRol = data.rol || 'local';
              let cleanRol = rawRol.replace(/['"]/g, '').trim().toLowerCase();
              if (u.email === 'matias.bustos@cormumel.cl') {
                cleanRol = 'global';
              }
              setUserProfile({ ...data, rol: cleanRol });
            } else {
              const defaultRol = u.email === 'matias.bustos@cormumel.cl' ? 'global' : 'local';
              const newProfile = { email: u.email, rol: defaultRol, createdAt: Date.now() };
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

  useEffect(() => {
    if (!user || !db) return; 

    // Helper para determinar los rangos de consulta optimizados
    const getQueryRanges = (startStr, endStr) => {
      let startYear = new Date().getFullYear();
      let startMonth = 0;
      let startDay = 1;
      let endYear = new Date().getFullYear();
      let endMonth = 11;
      let endDay = 31;

      try {
        if (startStr && typeof startStr === 'string' && startStr.includes('-')) {
          const parts = startStr.split('-');
          if (parts.length === 3) {
            startYear = parseInt(parts[0]) || startYear;
            startMonth = (parseInt(parts[1]) - 1) || 0;
            startDay = parseInt(parts[2]) || 1;
          }
        }
        if (endStr && typeof endStr === 'string' && endStr.includes('-')) {
          const parts = endStr.split('-');
          if (parts.length === 3) {
            endYear = parseInt(parts[0]) || endYear;
            endMonth = (parseInt(parts[1]) - 1) || 11;
            endDay = parseInt(parts[2]) || 31;
          }
        }
      } catch (e) {}

      const startMs = new Date(startYear, startMonth, startDay, 0, 0, 0).getTime();
      const endMs = new Date(endYear, endMonth, endDay, 23, 59, 59).getTime();

      // YoY (Periodo Mismo Mes Año Anterior)
      const prevYearStartMs = new Date(startYear - 1, startMonth, startDay, 0, 0, 0).getTime();
      const prevYearEndMs = new Date(endYear - 1, endMonth, endDay, 23, 59, 59).getTime();

      // MoM (Periodo Mismo Intervalo Mes Anterior)
      const durationMs = endMs - startMs;
      const prevMonthEndMs = startMs - 1;
      const prevMonthStartMs = prevMonthEndMs - durationMs;

      return {
        current: { start: startMs, end: endMs },
        prevYear: { start: prevYearStartMs, end: prevYearEndMs },
        prevMonth: { start: prevMonthStartMs, end: prevMonthEndMs },
        minYear: startYear - 1
      };
    };

    const ranges = getQueryRanges(filtroFechaInicio, filtroFechaFin);

    setLoading(true);
    setSyncStatus('connecting');
    setPacientesLoaded(false);
    setTurnosLoaded(false);

    const pacientesRef = collection(db, 'artifacts', appId, 'public', 'data', 'pacientes_urgencia');
    const turnosRef = collection(db, 'artifacts', appId, 'public', 'data', 'turnos');

    const qCurrent = query(pacientesRef, where('tAdmision', '>=', ranges.current.start), where('tAdmision', '<=', ranges.current.end));
    const qPrevYear = query(pacientesRef, where('tAdmision', '>=', ranges.prevYear.start), where('tAdmision', '<=', ranges.prevYear.end));
    const qPrevMonth = query(pacientesRef, where('tAdmision', '>=', ranges.prevMonth.start), where('tAdmision', '<=', ranges.prevMonth.end));
    const qTurnos = query(turnosRef, where('fechaInicio', '>=', `${ranges.minYear}-01-01`));

    let currentDocs = [];
    let prevYearDocs = [];
    let prevMonthDocs = [];

    const mergeAndSetPacientes = () => {
      const combined = [...currentDocs, ...prevYearDocs, ...prevMonthDocs];
      const unique = Array.from(new Map(combined.map(p => [p.id, p])).values());
      setPacientesDB(unique);
      setPacientesLoaded(true);
      if (unique.length > 0) {
        try { localStorage.setItem('metrico_cached_pacientes', JSON.stringify(unique)); } catch (e) {}
      }
    };

    const unsubCurrent = onSnapshot(qCurrent, (snapshot) => {
      currentDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      mergeAndSetPacientes();
    }, (err) => {
      console.error("Error cargando pacientes actuales:", err);
      setPacientesLoaded(true);
    });

    const unsubPrevYear = onSnapshot(qPrevYear, (snapshot) => {
      prevYearDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      mergeAndSetPacientes();
    }, (err) => {
      console.error("Error cargando pacientes YoY:", err);
      setPacientesLoaded(true);
    });

    const unsubPrevMonth = onSnapshot(qPrevMonth, (snapshot) => {
      prevMonthDocs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      mergeAndSetPacientes();
    }, (err) => {
      console.error("Error cargando pacientes MoM:", err);
      setPacientesLoaded(true);
    });

    const unsubTurnos = onSnapshot(qTurnos, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const sorted = data.sort((a, b) => {
        const dateA = a.fechaInicio ? new Date(a.fechaInicio) : new Date(0);
        const dateB = b.fechaInicio ? new Date(b.fechaInicio) : new Date(0);
        return dateB - dateA;
      });
      setTurnosDB(sorted);
      setTurnosLoaded(true);
      if (sorted.length > 0) {
        try { localStorage.setItem('metrico_cached_turnos', JSON.stringify(sorted)); } catch (e) {}
      }
    }, (err) => {
      console.error("Error cargando turnos:", err);
      setSyncStatus('error'); 
      setTurnosLoaded(true);
    });

    const fallbackTimer = setTimeout(() => {
      setPacientesLoaded(true);
      setTurnosLoaded(true);
      setLoading(false);
    }, 5000);

    return () => { 
      unsubCurrent();
      unsubPrevYear();
      unsubPrevMonth();
      unsubTurnos(); 
      clearTimeout(fallbackTimer); 
    };
  }, [user, filtroFechaInicio, filtroFechaFin]);

  useEffect(() => {
    if (pacientesLoaded && turnosLoaded) {
      setLoading(false);
      setSyncStatus('synced');
    }
  }, [pacientesLoaded, turnosLoaded]);

  return { 
    user, 
    userProfile, 
    loading: (pacientesDB.length === 0 && loading), 
    syncStatus, 
    setSyncStatus, 
    setLoading, 
    pacientesDB, 
    turnosDB,
    pacientesLoaded,
    turnosLoaded
  };
};

