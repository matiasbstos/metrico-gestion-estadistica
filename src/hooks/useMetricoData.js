import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db, appId } from '../config/firebase';

export const useMetricoData = () => {
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
    if (!pacientesDB.length) {
      setLoading(true);
      setSyncStatus('connecting');
    }

    const pacientesRef = collection(db, 'artifacts', appId, 'public', 'data', 'pacientes_urgencia');
    const turnosRef = collection(db, 'artifacts', appId, 'public', 'data', 'turnos');

    const unsubPacientes = onSnapshot(pacientesRef, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPacientesDB(data);
      setPacientesLoaded(true);
      if (data.length > 0) {
        try { localStorage.setItem('metrico_cached_pacientes', JSON.stringify(data)); } catch (e) {}
      }
    }, () => { 
      setSyncStatus('error'); 
      setPacientesLoaded(true);
    });

    const unsubTurnos = onSnapshot(turnosRef, (snapshot) => {
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
    }, () => { 
      setSyncStatus('error'); 
      setTurnosLoaded(true);
    });

    const fallbackTimer = setTimeout(() => {
      setPacientesLoaded(true);
      setTurnosLoaded(true);
      setLoading(false);
    }, 5000);

    return () => { unsubPacientes(); unsubTurnos(); clearTimeout(fallbackTimer); };
  }, [user]);

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

