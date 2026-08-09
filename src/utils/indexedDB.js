// Helper para almacenamiento de alto rendimiento en IndexedDB (Supera la restricción de 5MB de LocalStorage)
const DB_NAME = 'MetricoDataDB';
const DB_VERSION = 1;
const STORE_PACIENTES = 'pacientes_6m';
const STORE_TURNOS = 'turnos_cache';

export function openMetricoDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_PACIENTES)) {
        db.createObjectStore(STORE_PACIENTES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_TURNOS)) {
        db.createObjectStore(STORE_TURNOS, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => {
      console.warn("Error abriendo IndexedDB Metrico", event);
      resolve(null);
    };
  });
}

export async function savePacientesToIDB(pacientes) {
  const db = await openMetricoDB();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_PACIENTES, 'readwrite');
      const store = tx.objectStore(STORE_PACIENTES);
      store.clear();
      pacientes.forEach(p => {
        const id = p.id || p.docId || `${p.tAdmision}_${p.correlativo || p.nombrePaciente}`;
        store.put({ id, ...p });
      });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

export async function loadPacientesFromIDB() {
  const db = await openMetricoDB();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_PACIENTES, 'readonly');
      const store = tx.objectStore(STORE_PACIENTES);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch (e) {
      resolve([]);
    }
  });
}

export async function saveTurnosToIDB(turnos) {
  const db = await openMetricoDB();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_TURNOS, 'readwrite');
      const store = tx.objectStore(STORE_TURNOS);
      store.clear();
      turnos.forEach(t => {
        const id = t.id || t.loteId || `${t.fechaInicio}_${t.turnoNum}`;
        store.put({ id, ...t });
      });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

export async function loadTurnosFromIDB() {
  const db = await openMetricoDB();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_TURNOS, 'readonly');
      const store = tx.objectStore(STORE_TURNOS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch (e) {
      resolve([]);
    }
  });
}
