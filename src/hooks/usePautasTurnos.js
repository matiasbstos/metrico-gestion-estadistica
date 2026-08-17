import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth, appId } from '../config/firebase';

export const usePautasTurnos = () => {
  const [pautasDB, setPautasDB] = useState({});
  const [loadingPautas, setLoadingPautas] = useState(true);

  useEffect(() => {
    if (!db || !appId || !auth) {
      setLoadingPautas(false);
      return;
    }

    let unsubSnapshot = null;

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setLoadingPautas(false);
        if (unsubSnapshot) {
          unsubSnapshot();
          unsubSnapshot = null;
        }
        return;
      }

      try {
        const ref = collection(db, 'artifacts', appId, 'public', 'data', 'pautas_turnos');
        unsubSnapshot = onSnapshot(ref, (snapshot) => {
          const data = {};
          snapshot.docs.forEach(d => {
            data[d.id] = d.data().turnos || {};
          });
          setPautasDB(data);
          setLoadingPautas(false);
        }, (err) => {
          console.warn("Consulta pautas limitada:", err);
          setLoadingPautas(false);
        });
      } catch (err) {
        console.warn("Error iniciando listener pautas:", err);
        setLoadingPautas(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, []);

  // monthId format: "YYYY-MM"
  const savePautaMes = async (monthId, turnosData) => {
    try {
      if (!db || !appId) return false;
      const [year, month] = monthId.split('-');
      const ref = doc(db, 'artifacts', appId, 'public', 'data', 'pautas_turnos', monthId);
      await setDoc(ref, {
        year: Number(year),
        month: Number(month),
        turnos: turnosData,
        updatedAt: Date.now()
      });
      return true;
    } catch (e) {
      console.error("Error saving pauta", e);
      return false;
    }
  };

  const getEquipoParaTurno = (fecha, horario) => {
    if (!fecha || !horario) return null;
    const monthId = fecha.substring(0, 7);
    if (!pautasDB[monthId]) return null;
    const dayData = pautasDB[monthId][fecha];
    if (!dayData) return null;

    if (horario.includes('17:00') || horario.includes('Largo')) {
      return dayData.noche || null;
    }
    if (horario.includes('20:00')) {
      return dayData.noche || null;
    }
    if (horario.includes('08:00')) {
      return dayData.dia || null;
    }
    return dayData.dia || null;
  };

  return { pautasDB, loadingPautas, savePautaMes, getEquipoParaTurno };
};
