import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db, appId } from '../config/firebase';

export const useMetricoData = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('connecting');
  const [pacientesDB, setPacientesDB] = useState([]);
  const [turnosDB, setTurnosDB] = useState([]);

  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Auth initialization is now handled by the Login component.
    // We just listen to changes.

    if (auth) {
      const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
        setUser(u);
        if (u) {
          // Asignación de rol inmediata y optimista según correo
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
          setSyncStatus('synced');
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
    setLoading(true);

    const pacientesRef = collection(db, 'artifacts', appId, 'public', 'data', 'pacientes_urgencia');
    const turnosRef = collection(db, 'artifacts', appId, 'public', 'data', 'turnos');

    const unsubPacientes = onSnapshot(pacientesRef, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPacientesDB(data);
      setLoading(false);
      setSyncStatus('synced');
    }, () => { setSyncStatus('error'); });

    const unsubTurnos = onSnapshot(turnosRef, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTurnosDB(data.sort((a, b) => {
        const dateA = a.fechaInicio ? new Date(a.fechaInicio) : new Date(0);
        const dateB = b.fechaInicio ? new Date(b.fechaInicio) : new Date(0);
        return dateB - dateA;
      }));
      setLoading(false);
    }, () => { setSyncStatus('error'); setLoading(false); });

    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => { unsubPacientes(); unsubTurnos(); clearTimeout(fallbackTimer); };
  }, [user]);

  // Retornamos también los setters de loading y syncStatus porque 
  // las funciones de borrado y carga masiva los seguirán necesitando.
  return { user, userProfile, loading, syncStatus, setSyncStatus, setLoading, pacientesDB, turnosDB };
};
