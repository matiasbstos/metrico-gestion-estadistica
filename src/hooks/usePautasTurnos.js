import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

export const usePautasTurnos = () => {
  const [pautasDB, setPautasDB] = useState({});
  const [loadingPautas, setLoadingPautas] = useState(true);

  useEffect(() => {
    if (!db || !appId) return;
    const ref = collection(db, 'artifacts', appId, 'public', 'data', 'pautas_turnos');
    
    const unsub = onSnapshot(ref, (snapshot) => {
      const data = {};
      snapshot.docs.forEach(d => {
        data[d.id] = d.data().turnos || {};
      });
      setPautasDB(data);
      setLoadingPautas(false);
    }, (err) => {
      console.error("Error loading pautas", err);
      setLoadingPautas(false);
    });

    return () => unsub();
  }, []);

  // monthId format: "YYYY-MM"
  const savePautaMes = async (monthId, turnosData) => {
    try {
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
    const monthId = fecha.substring(0, 7); // YYYY-MM
    if (!pautasDB[monthId]) return null;
    
    const dayData = pautasDB[monthId][fecha];
    if (!dayData) return null;

    // Normalizar nombres de horario
    let horarioKey = null;
    if (horario.includes('17:00')) horarioKey = '17:00 - 08:00';
    else if (horario.includes('08:00 - 20:00')) horarioKey = '08:00 - 20:00';
    else if (horario.includes('20:00 - 08:00')) horarioKey = '20:00 - 08:00';

    if (!horarioKey) return null;

    return dayData[horarioKey] || null;
  };

  return { pautasDB, loadingPautas, savePautaMes, getEquipoParaTurno };
};
