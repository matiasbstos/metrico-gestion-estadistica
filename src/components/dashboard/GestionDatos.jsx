import React, { useState, useEffect, useRef } from 'react';
import { Database, UploadCloud, FileSpreadsheet, CheckCircle, Save, X, Calendar, AlertTriangle, Loader2, BookOpen, ArrowRight, Zap, Trash2, Search, Eye, RefreshCw } from 'lucide-react';
import { collection, doc, writeBatch, serverTimestamp, onSnapshot, getDocs } from 'firebase/firestore';
import { formatLocalDate } from '../../utils/helpers';

const runWithTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))
  ]);
};

export default function GestionDatos({ 
  user, db, appId, loading,
  setLoading, setSyncStatus, showNotif, 
  setActiveTab, setFiltroFechaInicio, setFiltroFechaFin, centroActivo,
  pautasTurnosHook, pacientesDB, turnosDB
}) {
  const [pendingUpload, setPendingUpload] = useState(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadRecordCount, setUploadRecordCount] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [purgeResult, setPurgeResult] = useState(null);
  const [purgeError, setPurgeError] = useState(null);
  const [manualSuccessResult, setManualSuccessResult] = useState(null);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [uploadEta, setUploadEta] = useState(null);
  const [currentPurgeBatchIndex, setCurrentPurgeBatchIndex] = useState(0);
  const [totalPurgeBatches, setTotalPurgeBatches] = useState(0);
  const [activeGestionTab, setActiveGestionTab] = useState('carga');
  const [limpiezaModo, setLimpiezaModo] = useState('mes');
  const [limpiezaMes, setLimpiezaMes] = useState(new Date().toISOString().substring(0, 7));
  const [limpiezaDia, setLimpiezaDia] = useState(new Date().toISOString().substring(0, 10));
  const [auditoriaCargas, setAuditoriaCargas] = useState([]);
  const [selectedCarga, setSelectedCarga] = useState(null);
  const cancelUploadRef = useRef(false);

  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalcProgress, setRecalcProgress] = useState(0);
  const [recalcStatus, setRecalcStatus] = useState('');

  // Estados para Auditoría y Puntos de Control
  const [auditYear, setAuditYear] = useState(2026);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  const [auditStatus, setAuditStatus] = useState('');
  const [auditResults, setAuditResults] = useState(null);
  const [selectedAuditMonth, setSelectedAuditMonth] = useState(null);
  const [fixingMonthIdx, setFixingMonthIdx] = useState(null);

  // Estados para Auditoría y Puntos de Control
  const [rayenControl, setRayenControl] = useState(23882);
  const [ultimoPaciente, setUltimoPaciente] = useState(null);
  const [recalcSummaryModal, setRecalcSummaryModal] = useState(null);

  useEffect(() => {
    if (!db || !appId) return;
    const ref = collection(db, 'artifacts', appId, 'public', 'data', 'auditoria_cargas');
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => (b.fechaCarga || 0) - (a.fechaCarga || 0));
      setAuditoriaCargas(data);
    });
    return () => unsub();
  }, [db, appId]);

  // Cargar el último paciente del año seleccionado al montar o cambiar el año
  useEffect(() => {
    if (!db || !appId || !auditYear) return;

    const cargarUltimoPacienteRapido = async () => {
      try {
        const { query, where, limit, orderBy, getDocs } = await import('firebase/firestore');
        const pacsRef = collection(db, 'artifacts', appId, 'public', 'data', 'pacientes_urgencia');
        
        const startMs = new Date(auditYear, 0, 1, 0, 0, 0).getTime();
        const endMs = new Date(auditYear, 11, 31, 23, 59, 59).getTime();
        
        const q = query(
          pacsRef, 
          where('tAdmision', '>=', startMs), 
          where('tAdmision', '<=', endMs),
          orderBy('tAdmision', 'desc'),
          limit(5)
        );
        
        const snap = await getDocs(q);
        let latestP = null;
        let maxCorrVal = 0;

        snap.forEach(doc => {
          const data = doc.data();
          const rawCorr = data.correlativo ? String(data.correlativo).trim() : '';
          const clean = rawCorr.replace(/,/g, '').split('.')[0];
          const numCorr = parseInt(clean, 10);
          
          if (!isNaN(numCorr) && numCorr > maxCorrVal) {
            maxCorrVal = numCorr;
            latestP = { id: doc.id, ...data };
          }
        });

        if (!latestP && snap.size > 0) {
          snap.forEach(doc => {
            if (!latestP) {
              latestP = { id: doc.id, ...doc.data() };
            }
          });
        }

        setUltimoPaciente(latestP);
      } catch (err) {
        console.error("Error al cargar último paciente rápido:", err);
      }
    };

    cargarUltimoPacienteRapido();
  }, [db, appId, auditYear]);

  const [manualForm, setManualForm] = useState({
    fechaInicio: '', fechaFin: '', horario: '17:00 - 08:00 (Semana Largo)', equipoTurno: 'Sin Asignar',
    c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, altasAdmin: 0, totalPacientes: 0
  });

  const registrosALimpiar = React.useMemo(() => {
    let turnosTarget = [];
    let pacientesTarget = [];

    if (!turnosDB || !pacientesDB) return { turnos: [], pacientes: [] };

    if (limpiezaModo === 'mes') {
      const year = limpiezaMes.split('-')[0];
      const month = limpiezaMes.split('-')[1];
      turnosTarget = turnosDB.filter(t => t.fechaInicio && t.fechaInicio.startsWith(`${year}-${month}`));
      pacientesTarget = pacientesDB.filter(p => {
        if (!p.tAdmision) return false;
        const pDate = formatLocalDate(p.tAdmision);
        return pDate.startsWith(`${year}-${month}`);
      });
    } else if (limpiezaModo === 'dia') {
      turnosTarget = turnosDB.filter(t => t.fechaInicio === limpiezaDia);
      pacientesTarget = pacientesDB.filter(p => {
        if (!p.tAdmision) return false;
        const pDate = formatLocalDate(p.tAdmision);
        return pDate === limpiezaDia;
      });
    } else if (limpiezaModo === 'carga') {
      if (!selectedCarga) return { turnos: [], pacientes: [] };
      
      if (selectedCarga.cargaId) {
        turnosTarget = turnosDB.filter(t => t.cargaId === selectedCarga.cargaId);
        pacientesTarget = pacientesDB.filter(p => p.cargaId === selectedCarga.cargaId);
      } else {
        const cleanPrefix = String(selectedCarga.archivo || 'LOTE')
          .replace(/\.[^/.]+$/, "")
          .replace(/\s+/g, '_')
          .toUpperCase();
        
        turnosTarget = turnosDB.filter(t => t.loteId && t.loteId.startsWith(cleanPrefix));
        pacientesTarget = pacientesDB.filter(p => p.loteId && p.loteId.startsWith(cleanPrefix));
      }
    }

    return { turnos: turnosTarget, pacientes: pacientesTarget };
  }, [limpiezaModo, limpiezaMes, limpiezaDia, selectedCarga, turnosDB, pacientesDB]);

  const [isDeduplicating, setIsDeduplicating] = useState(false);
  const [dedupProgress, setDedupProgress] = useState(0);

  const depurarDuplicados = async () => {
    if (!pacientesDB || pacientesDB.length === 0) {
      showNotif("No hay registros cargados para depurar.", "info");
      return;
    }

    setIsUploading(true); setSyncStatus('syncing');
    setIsDeduplicating(true);
    setDedupProgress(0);

    try {
      const seenHashes = new Set();
      const duplicatesToDelete = [];

      const norm = (v) => String(v || '').trim().toUpperCase();

      pacientesDB.forEach(p => {
        if (!p.id) return;

        const sexNorm = norm(p.sexo);
        const edadNorm = p.edad ?? '';
        const corrNorm = norm(p.correlativo);
        const idNorm = norm(p.idPaciente);
        const diagNorm = norm(p.diagnosticoPrincipal);

        let isDup = false;

        const hashCorrId = (corrNorm && idNorm) ? `${corrNorm}_${idNorm}` : null;
        const hashTimeOld = (p.tAdmision) ? `${p.tAdmision}_${edadNorm}_${sexNorm}` : null;
        const hashTimeCorr = (p.tAdmision && corrNorm) ? `${p.tAdmision}_${corrNorm}` : null;
        const hashTimeId = (p.tAdmision && idNorm) ? `${p.tAdmision}_${idNorm}` : null;
        const hashTimeDiag = (p.tAdmision && diagNorm) ? `${p.tAdmision}_${edadNorm}_${sexNorm}_${diagNorm}` : null;

        if (hashCorrId && seenHashes.has(hashCorrId)) isDup = true;
        else if (hashTimeCorr && seenHashes.has(hashTimeCorr)) isDup = true;
        else if (hashTimeId && seenHashes.has(hashTimeId)) isDup = true;
        else if (hashTimeDiag && seenHashes.has(hashTimeDiag)) isDup = true;
        else if (hashTimeOld && seenHashes.has(hashTimeOld)) isDup = true;

        if (isDup) {
          duplicatesToDelete.push(p.id);
        } else {
          if (hashCorrId) seenHashes.add(hashCorrId);
          if (hashTimeCorr) seenHashes.add(hashTimeCorr);
          if (hashTimeId) seenHashes.add(hashTimeId);
          if (hashTimeDiag) seenHashes.add(hashTimeDiag);
          if (hashTimeOld) seenHashes.add(hashTimeOld);
        }
      });

      if (duplicatesToDelete.length === 0) {
        showNotif("¡Excelente! No se encontraron registros duplicados en la base de datos.", "success");
        setIsDeduplicating(false);
        setIsUploading(false); setSyncStatus('synced');
        return;
      }

      const batchSize = 400;
      const totalBatches = Math.ceil(duplicatesToDelete.length / batchSize);

      for (let i = 0; i < totalBatches; i++) {
        const chunk = duplicatesToDelete.slice(i * batchSize, (i + 1) * batchSize);
        const batch = writeBatch(db);
        chunk.forEach(docId => {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'pacientes_urgencia', docId);
          batch.delete(docRef);
        });
        await batch.commit();
        setDedupProgress(Math.round(((i + 1) / totalBatches) * 100));
      }

      showNotif(`¡Depuración completada! Se eliminaron ${duplicatesToDelete.length} registros duplicados.`, "success");
    } catch (err) {
      console.error("Error en depuración:", err);
      showNotif(`Error al depurar duplicados: ${err.message}`, "error");
    } finally {
      setIsDeduplicating(false);
      setIsUploading(false); setSyncStatus('synced');
    }
  };

  const purgarDatos = async () => {
    if (limpiezaModo !== 'carga' && registrosALimpiar.turnos.length === 0 && registrosALimpiar.pacientes.length === 0) return;
    if (limpiezaModo === 'carga' && !selectedCarga) return;
    
    setIsUploading(true); setSyncStatus('syncing');
    try {
      const batchList = [];
      let currentBatch = writeBatch(db);
      let opCounter = 0;

      const addDeleteOp = (ref) => {
        currentBatch.delete(ref);
        opCounter++;
        if (opCounter >= 490) {
          batchList.push(currentBatch);
          currentBatch = writeBatch(db);
          opCounter = 0;
        }
      };

      registrosALimpiar.turnos.forEach(t => {
        addDeleteOp(doc(db, 'artifacts', appId, 'public', 'data', 'turnos', t.id));
      });

      registrosALimpiar.pacientes.forEach(p => {
        addDeleteOp(doc(db, 'artifacts', appId, 'public', 'data', 'pacientes_urgencia', p.id));
      });

      if (limpiezaModo === 'carga' && selectedCarga) {
        addDeleteOp(doc(db, 'artifacts', appId, 'public', 'data', 'auditoria_cargas', selectedCarga.id));
      }

      if (opCounter > 0) batchList.push(currentBatch);

      const auditLog = {
        fecha: Date.now(),
        accion: 'Purgado',
        detalles: limpiezaModo === 'carga' && selectedCarga
          ? `Purgado de carga masiva (Archivo: ${selectedCarga.archivo}): ${registrosALimpiar.turnos.length} turnos, ${registrosALimpiar.pacientes.length} pacientes.`
          : `Purgado masivo (${limpiezaModo}: ${limpiezaModo==='mes'?limpiezaMes:limpiezaDia}): ${registrosALimpiar.turnos.length} turnos, ${registrosALimpiar.pacientes.length} pacientes.`,
        centro: centroActivo || 'Desconocido',
        usuario: user?.email || 'Anónimo'
      };
      
      const lastBatch = writeBatch(db);
      lastBatch.set(doc(collection(db, 'artifacts', appId, 'public', 'data', 'audit_logs')), auditLog);
      batchList.push(lastBatch);
      // Ejecutar los commits secuencialmente para evitar saturar el pool de conexiones del navegador
      setTotalPurgeBatches(batchList.length);
      for (let i = 0; i < batchList.length; i++) {
        setCurrentPurgeBatchIndex(i + 1);
        await runWithTimeout(batchList[i].commit(), 25000);
      }
      setPurgeResult({
        modo: limpiezaModo,
        mes: limpiezaMes,
        dia: limpiezaDia,
        archivo: selectedCarga?.archivo,
        pacientesCount: registrosALimpiar.pacientes.length,
        turnosCount: registrosALimpiar.turnos.length
      });
      setSelectedCarga(null);
    } catch(e) {
      console.error(e);
      let errMsg = "Error al purgar los datos.";
      if (String(e.message).includes("Timeout")) {
        errMsg = "Tiempo de espera agotado. Verifica tu conexión o cuota de base de datos de Firebase.";
      } else {
        errMsg = "Se ha excedido el límite de operaciones o la cuota gratuita diaria de la base de datos de Firebase.";
      }
      setPurgeError(errMsg);
    }
    setIsUploading(false); setSyncStatus('synced');
  };

  const handleManualFormChange = (field, value) => {
    setManualForm(prev => {
      const updated = { ...prev, [field]: value };
      
      if (pautasTurnosHook && (field === 'fechaInicio' || field === 'horario')) {
        const equipo = pautasTurnosHook.getEquipoParaTurno(updated.fechaInicio, updated.horario);
        if (equipo) updated.equipoTurno = equipo;
      }
      
      return updated;
    });
  };

  const extractCategoria = (val) => {
    if (!val) return 'sincat';
    const s = String(val).toUpperCase();
    const match = s.match(/\b(C\s*[1-5]|CATEGOR[IÍ]A\s*[1-5])\b/);
    if (match) {
        const num = match[0].match(/[1-5]/)[0];
        return `c${num}`;
    }
    return 'sincat';
  };

  const normalizeStr = (str) => {
    if (!str) return '';
    return String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
  };

  const parseDateStr = (dString, tString) => {
    if (!dString) return null;
    try {
      let day, month, year;
      if (dString.includes('-')) { const p = dString.split('-'); year = p[0]; month = p[1]; day = p[2].split(' ')[0]; }
      else if (dString.includes('/')) { const p = dString.split('/'); day = p[0]; month = p[1]; year = p[2].split(' ')[0]; }
      else if (!isNaN(dString) && dString > 10000) {
          const excelDate = new Date((dString - 25569) * 86400 * 1000);
          return excelDate.getTime();
      } else return null;

      let hour = 0, min = 0, sec = 0;
      let extractedTimeStr = '';
      if (dString.includes(' ') || dString.includes('T')) extractedTimeStr = dString.split(/[ T]/)[1];
      else if (tString !== '') extractedTimeStr = tString.split(/[ T]/).pop(); 

      if (extractedTimeStr) {
          if (extractedTimeStr.includes(':')) {
              const tParts = extractedTimeStr.split(':');
              hour = parseInt(tParts[0] || 0); min = parseInt(tParts[1] || 0); sec = parseInt(tParts[2] || 0);
          } else if (!isNaN(extractedTimeStr)) {
              const totalSeconds = Math.round(parseFloat(extractedTimeStr) * 86400);
              hour = Math.floor(totalSeconds / 3600); min = Math.floor((totalSeconds % 3600) / 60); sec = totalSeconds % 60;
          }
      }
      if (!year || isNaN(year) || isNaN(hour)) return null;
      let fullYear = Number(year); if (fullYear < 100) fullYear += 2000;
      
      const res = new Date(fullYear, Number(month) - 1, Number(day), Number(hour), Number(min), Number(sec)).getTime();
      return isNaN(res) ? null : res;
    } catch (e) { return null; }
  };

  const isWeekendOrHoliday = (dateObj) => {
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return true;
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const monthId = `${y}-${m}`;
    
    if (pautasTurnosHook && pautasTurnosHook.pautasDB && pautasTurnosHook.pautasDB[monthId]) {
      const dayData = pautasTurnosHook.pautasDB[monthId][dateStr];
      if (dayData && dayData.festivo) return true;
    }
    return false;
  };

  const getShiftBoundaries = (tAdmMs) => {
    const d = new Date(tAdmMs);
    const hours = d.getHours();
    
    const today = new Date(tAdmMs);
    const yesterday = new Date(tAdmMs);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isTodayWknd = isWeekendOrHoliday(today);
    const isYestWknd = isWeekendOrHoliday(yesterday);
    
    let logicalDate;
    let horario;

    if (isTodayWknd) {
      if (hours < 8) {
        logicalDate = yesterday;
        horario = isYestWknd ? '20:00 - 08:00 (Fin de semana Noche)' : '17:00 - 08:00 (Semana Largo)';
      } 
      else if (hours >= 8 && hours < 20) {
        logicalDate = today;
        horario = '08:00 - 20:00 (Fin de semana Día)';
      } 
      else {
        logicalDate = today;
        horario = '20:00 - 08:00 (Fin de semana Noche)';
      }
    } 
    else {
      if (hours < 16) {
        logicalDate = yesterday;
        horario = isYestWknd ? '20:00 - 08:00 (Fin de semana Noche)' : '17:00 - 08:00 (Semana Largo)';
      } 
      else {
        logicalDate = today;
        horario = '17:00 - 08:00 (Semana Largo)';
      }
    }

    const y = logicalDate.getFullYear();
    const m = String(logicalDate.getMonth() + 1).padStart(2, '0');
    const day = String(logicalDate.getDate()).padStart(2, '0');
    return { fechaInicio: `${y}-${m}-${day}`, horario };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    setIsReadingFile(true);

    setTimeout(() => {
      const processArray = (rows) => {
        if (rows.length < 2) {
          setIsReadingFile(false);
          return showNotif("El archivo parece vacío o muy corto.", "error");
        }

        let headerRowIdx = -1; let headers = [];
        for (let i = 0; i < Math.min(rows.length, 10); i++) { 
            const rowStrs = rows[i].map(c => normalizeStr(String(c || '')));
            if (rowStrs.some(c => c.includes('FECHA ADM') || c.includes('CORRELATIVO') || c.includes('ESTADO'))) {
                headerRowIdx = i; headers = rowStrs; break;
            }
        }
        if (headerRowIdx === -1) { headerRowIdx = 0; headers = rows[0].map(c => normalizeStr(String(c || ''))); }

        const getIdx = (kws) => {
          for (const kw of kws) { const idx = headers.findIndex(h => h.includes(normalizeStr(kw))); if (idx !== -1) return idx; }
          return -1;
        };

        let incidenciasDetectadas = [];

        let iFAdm = getIdx(['FECHA ADMISION', 'FECHA ADM']); let iHAdm = getIdx(['HORA ADMISION', 'HORA ADM']);
        if (iFAdm === -1 || iHAdm === -1) incidenciasDetectadas.push("No se encontró la columna exacta de Fecha u Hora de Admisión. Se intentará usar columnas por defecto.");
        
        let iFCat1 = getIdx(['FECHA 1', 'FECHA PRIMERA', 'FECHA TRIAGE', 'FECHA 1° CATEGORIZACION']); let iHCat1 = getIdx(['HORA 1', 'HORA PRIMERA', 'HORA TRIAGE', 'HORA 1° CATEGORIZACION']);
        let iFCatU = getIdx(['FECHA ULTIMA CATEGORIZACION', 'FECHA ULT', 'FECHA UTL']); let iHCatU = getIdx(['HORA ULTIMA CATEGORIZACION', 'HORA ULT', 'HORA UTL']);
        let iFAna = getIdx(['FECHA ANAMNESIS', 'FECHA ANA', 'FECHA ATE', 'FECHA MED']); let iHAna = getIdx(['HORA ANAMNESIS', 'HORA ANA', 'HORA ATE', 'HORA MED']);
        let iFAlt = getIdx(['FECHA ALTA', 'FECHA ALT']); let iHAlt = getIdx(['HORA ALTA', 'HORA ALT']);
        let iCatPri = getIdx(['PRIMERA CATEGORIZACION', 'PRIMERA CAT', 'CATEGORIA 1']); let iCatUlt = getIdx(['ULTIMA CATEGORIZACION', 'ULTIMA CAT', 'CATEGORIA ULT']);
        let iEst = getIdx(['ESTADO', 'STATUS']);
        let iCodDiag = getIdx(['CÓDIGO DE DIAGNÓSTICO', 'CODIGO DE DIAGNOSTICO', 'CODIGO DIAGNOSTICO', 'COD DIAG', 'CODIGO DIAG', 'CÓDIGO DIAGNÓSTICO', 'CIE10', 'CODIGO CIE10', 'COD CIE10']);
        let iDiagPrin = getIdx(['DIAGNOSTICO PRINCIPAL', 'DIAGNÓSTICO PRINCIPAL', 'DIAGNOSTICO', 'DIAGNOSTICO INGRESO', 'DIAGNOSTICO EGRESO', 'DIAG PRINCIPAL']);
        let iDestinoAlta = getIdx(['DESTINO DE ALTA', 'DESTINO ALTA', 'DESTINO', 'TIPO DE ALTA', 'DESTINO EGRESO', 'DESTINO ALTA MEDICA', 'MOTIVO DE ALTA', 'MOTIVO ALTA', 'DESTINO FINAL', 'MOTIVO EGRESO', 'DESTINO/MOTIVO']);
        let iMed = getIdx(['NOMBRE PROFESIONAL REGISTRA ANAMNESIS', 'NOMBRE PROFESIONAL', 'MEDICO', 'PROFESIONAL', 'DOCTOR']);
        let iCorrelativo = getIdx(['CORRELATIVO', 'Nº', 'NUMERO', 'N°', 'NRO', '#', 'NUMERO DE ATENCION']);
        let iId = getIdx(['ID', 'RUN', 'RUT', 'IDENTIFICADOR', 'DOCUMENTO']);
        
        let iEnfCat1 = getIdx(['REGISTRA LA PRIMERA', 'REGISTRA PRIMERA', 'REGISTRA PRIM', 'PROFESIONAL 1°', 'PROFESIONAL 1A']);
        let iEnfCat1Inst = getIdx([
          'INSTRUMENTO DEL PROFESIONAL QUE REGISTRA LA PRIMERA',
          'INSTRUMENTO PROFESIONAL QUE REGISTRA LA PRIMERA',
          'INSTRUMENTO PROFESIONAL QUE REGISTRA PRIEMRA',
          'INSTRUMETO PROFESIONAL QUE REGISTRA PRIEMRA',
          'INSTRUMETO PROFESIONAL QUE REGISTRA PRIMERA',
          'INSTRUMENTO QUE REGISTRA LA PRIMERA',
          'INSTRUMENTO QUE REGISTRA PRIMERA',
          'INSTRUMENTO REGISTRA PRIM',
          'INSTRUMENTO 1°',
          'INSTRUMENTO 1A',
          'INSTRUMENTO PRIM'
        ]);
        if (iEnfCat1Inst === -1 && iEnfCat1 !== -1) {
          const nextHeader = headers[iEnfCat1 + 1] || '';
          if (nextHeader.includes('INSTRUMENTO') || nextHeader.includes('INSTRUMETO')) {
            iEnfCat1Inst = iEnfCat1 + 1;
          }
        }
        
        let iEnfCatUlt = getIdx(['REGISTRA LA ULTIMA', 'REGISTRA ULTIMA', 'REGISTRA ULT', 'PROFESIONAL ULT']);
        let iEnfCatUltInst = getIdx([
          'INSTRUMENTO DEL PROFESIONAL QUE REGISTRA LA ULTIMA',
          'INSTRUMENTO PROFESIONAL QUE REGISTRA LA ULTIMA',
          'INSTRUMETO PROFESIONAL QUE REGISTRA ULTIMA',
          'INSTRUMENTO QUE REGISTRA LA ULTIMA',
          'INSTRUMENTO QUE REGISTRA ULTIMA',
          'INSTRUMENTO REGISTRA ULT',
          'INSTRUMENTO ULT'
        ]);
        if (iEnfCatUltInst === -1 && iEnfCatUlt !== -1) {
          const nextHeader = headers[iEnfCatUlt + 1] || '';
          if (nextHeader.includes('INSTRUMENTO') || nextHeader.includes('INSTRUMETO')) {
            iEnfCatUltInst = iEnfCatUlt + 1;
          }
        }
        
        let iMedAna = getIdx(['REGISTRA LA ANAMNESIS', 'REGISTRA ANAMNESIS', 'REGISTRA ANA', 'PROFESIONAL ANAMNESIS', 'ANAMNESIS']);
        let iMedAnaInst = getIdx([
          'INSTRUMENTO QUE REGISTRA LA ANAMNESIS',
          'INSTRUMENTO QUE REGISTRA ANAMNESIS',
          'INSTRUMETO PROFESIONAL REGISTRA ANAMNESIS',
          'INSTRUMENTO ANAMNESIS',
          'INSTRUMENTO ANA'
        ]);
        if (iMedAnaInst === -1 && iMedAna !== -1) {
          const nextHeader = headers[iMedAna + 1] || '';
          if (nextHeader.includes('INSTRUMENTO') || nextHeader.includes('INSTRUMETO')) {
            iMedAnaInst = iMedAna + 1;
          }
        }
        
        let iEdad = getIdx(['EDAD']);
        let iSexo = getIdx(['SEXO']);
        if (iEdad === -1) incidenciasDetectadas.push("Falta columna EDAD. No se podrá analizar demografía de edades.");
        if (iSexo === -1) incidenciasDetectadas.push("Falta columna SEXO. No se podrá analizar demografía por género.");
        
        let iPrev = getIdx(['PREVISION', 'PREVISIÓN']);
        let iComu = getIdx(['COMUNA']);
        let iRegi = getIdx(['REGIÓN', 'REGION']);
        let iNaci = getIdx(['NACIONALIDAD', 'ORIGEN', 'PAIS', 'PAÍS']);
        let iCentro = getIdx(['ESTABLECIMIENTO', 'CENTRO']);

        // Validaciones analíticas del resto de columnas requeridas
        if (iFCat1 === -1 && iFCatU === -1) incidenciasDetectadas.push("Falta columna de Categorización (Fecha/Hora). No se podrán medir tiempos de espera al triage.");
        if (iFAna === -1) incidenciasDetectadas.push("Falta columna de Anamnesis (Fecha/Hora). No se podrán calcular tiempos de espera a atención médica.");
        if (iFAlt === -1 || iHAlt === -1) incidenciasDetectadas.push("Falta columna de Alta (Fecha/Hora). No se podrá calcular el tiempo de estadía total.");
        if (iCatPri === -1 && iCatUlt === -1) incidenciasDetectadas.push("Falta columna de Categorización (C1-C5). Se intentará deducir del texto de los registros, pero puede haber imprecisiones.");
        if (iEst === -1) incidenciasDetectadas.push("Falta columna de Estado de Atención. No se podrán calcular altas administrativas.");
        if (iCodDiag === -1) incidenciasDetectadas.push("Falta columna de Código de Diagnóstico (CIE-10). Afectará al análisis de constataciones y fracturas.");
        if (iDiagPrin === -1) incidenciasDetectadas.push("Falta columna de Diagnóstico Principal. No se podrá realizar el Top 5 de diagnósticos asociados.");
        if (iDestinoAlta === -1) incidenciasDetectadas.push("Falta columna de Destino de Alta. El módulo de Traslados Hospitalarios no recibirá datos.");
        if (iEnfCat1 === -1 && iEnfCatUlt === -1 && iMed === -1) incidenciasDetectadas.push("Falta columna de Identificación de Profesional/Enfermero. No se podrá analizar la carga del personal.");
        if (iCorrelativo === -1 && iId === -1) incidenciasDetectadas.push("Falta columna de Identificador/Correlativo. Dificultará la detección de registros duplicados.");
        if (iComu === -1) incidenciasDetectadas.push("Falta columna de Comuna. No se podrá visualizar la distribución por comunas.");
        if (iNaci === -1) incidenciasDetectadas.push("Falta columna de Nacionalidad. El análisis sociodemográfico por nacionalidad no estará disponible.");

        if(iFAdm === -1) iFAdm = 1; if(iHAdm === -1) iHAdm = 2;

        const normVal = (v) => String(v || '').trim().toUpperCase();

        const existingMap = new Map();
        if (pacientesDB) {
          pacientesDB.forEach(p => {
            if (!p.id) return;
            const sexNorm = normVal(p.sexo);
            const edadNorm = p.edad ?? '';
            const corrNorm = normVal(p.correlativo);
            const idNorm = normVal(p.idPaciente);

            if (corrNorm && idNorm) existingMap.set(`${corrNorm}_${idNorm}`, p);
            if (p.tAdmision) {
              existingMap.set(`${p.tAdmision}_${edadNorm}_${sexNorm}`, p);
              if (corrNorm) existingMap.set(`${p.tAdmision}_${corrNorm}`, p);
              if (idNorm) existingMap.set(`${p.tAdmision}_${idNorm}`, p);
            }
          });
        }

        let parsedRecords = [];
        let recordsToUpdate = [];
        let duplicados = 0;
        let actualizados = 0;
        let fileMinTime = Infinity;
        let fileMaxTime = -Infinity;
        const fileTurnosKeys = new Set();

        for (let i = headerRowIdx + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 5) continue;

          const safeGet = (idx) => (idx !== -1 && row[idx] !== undefined && row[idx] !== null) ? String(row[idx]).trim() : '';
          
          const tAdm = parseDateStr(safeGet(iFAdm), safeGet(iHAdm));
          if (!tAdm) continue; 

          if (tAdm < fileMinTime) fileMinTime = tAdm;
          if (tAdm > fileMaxTime) fileMaxTime = tAdm;
          
          const shift = getShiftBoundaries(tAdm);
          if (shift) {
            fileTurnosKeys.add(`${shift.fechaInicio}|${shift.horario}`);
          }

          const edadRaw = safeGet(iEdad);
          const edad = edadRaw && !isNaN(parseInt(edadRaw)) ? parseInt(edadRaw) : null;
          const sexoStr = safeGet(iSexo);

          const correlativoVal = iCorrelativo !== -1 ? safeGet(iCorrelativo) : '';
          const idPacienteVal = iId !== -1 ? safeGet(iId) : '';
          
          const sexNormNew = normVal(sexoStr);
          const corrNormNew = normVal(correlativoVal);
          const idNormNew = normVal(idPacienteVal);

          const hashCorrId = (corrNormNew && idNormNew) ? `${corrNormNew}_${idNormNew}` : '';
          const hashTimeOld = `${tAdm}_${edad ?? ''}_${sexNormNew}`;
          const hashTimeCorr = (tAdm && corrNormNew) ? `${tAdm}_${corrNormNew}` : '';
          const hashTimeId = (tAdm && idNormNew) ? `${tAdm}_${idNormNew}` : '';

          const existingPatient = (hashCorrId && existingMap.get(hashCorrId)) ||
                                  existingMap.get(hashTimeOld) ||
                                  (hashTimeCorr && existingMap.get(hashTimeCorr)) ||
                                  (hashTimeId && existingMap.get(hashTimeId));

          const rowStrLower = row.map(c => String(c || '').toLowerCase()).join(' ');

          let estado = safeGet(iEst);
          if (estado.toLowerCase().includes('cancelad') || rowStrLower.includes('cancelad')) {
            estado = 'Cancelada';
          } else if (estado.toLowerCase().includes('complet') || rowStrLower.includes('complet')) {
            estado = 'Completa';
          }

          let categoria = 'sincat';
          if (iCatUlt !== -1) categoria = extractCategoria(safeGet(iCatUlt));
          if (categoria === 'sincat' && iCatPri !== -1) categoria = extractCategoria(safeGet(iCatPri));
          if (categoria === 'sincat') categoria = extractCategoria(rowStrLower);
          
          let codDiag = safeGet(iCodDiag);
          let diagPrin = safeGet(iDiagPrin);
          let destAlta = safeGet(iDestinoAlta);
          
          if (categoria === 'c3' && (codDiag.toUpperCase().includes('Z51.8') || diagPrin.toUpperCase().includes('Z51.8'))) {
            categoria = 'c3_z518';
          }

          let enfermeroCat1 = '';
          let enfermeroCat1Inst = '';
          let enfermeroCatUlt = '';
          let enfermeroCatUltInst = '';
          let medicoAnamnesis = '';
          let medicoAnamnesisInst = '';

          if (iEnfCat1 !== -1) {
            const name1 = safeGet(iEnfCat1);
            const inst1 = safeGet(iEnfCat1Inst);
            enfermeroCat1Inst = inst1;
            if (inst1.toLowerCase().includes('enfermer') || !inst1) {
              enfermeroCat1 = name1;
            }
          }

          if (iEnfCatUlt !== -1) {
            const nameUlt = safeGet(iEnfCatUlt);
            const instUlt = safeGet(iEnfCatUltInst);
            enfermeroCatUltInst = instUlt;
            if (instUlt.toLowerCase().includes('enfermer') || !instUlt) {
              enfermeroCatUlt = nameUlt;
            }
          }

          if (iMedAna !== -1) {
            const nameAna = safeGet(iMedAna);
            const instAna = safeGet(iMedAnaInst);
            medicoAnamnesisInst = instAna;
            if (instAna.toLowerCase().includes('medico') || instAna.toLowerCase().includes('médico') || !instAna) {
              medicoAnamnesis = nameAna;
            }
          }

          let medicoVal = medicoAnamnesis || safeGet(iMed) || 'No Registrado';

          if (existingPatient) {
            let needsUpdate = false;
            const updateData = {};

            if (destAlta && (!existingPatient.destinoAlta || existingPatient.destinoAlta !== destAlta)) {
              updateData.destinoAlta = destAlta;
              updateData.destino = destAlta;
              needsUpdate = true;
            }
            if (codDiag && (!existingPatient.codigoDiagnostico || existingPatient.codigoDiagnostico !== codDiag)) {
              updateData.codigoDiagnostico = codDiag;
              needsUpdate = true;
            }
            if (diagPrin && (!existingPatient.diagnosticoPrincipal || existingPatient.diagnosticoPrincipal !== diagPrin)) {
              updateData.diagnosticoPrincipal = diagPrin;
              needsUpdate = true;
            }
            if (enfermeroCat1 && (!existingPatient.enfermeroCat1 || existingPatient.enfermeroCat1 !== enfermeroCat1)) {
              updateData.enfermeroCat1 = enfermeroCat1;
              updateData.enfermeroCat1Inst = enfermeroCat1Inst;
              needsUpdate = true;
            }
            if (enfermeroCatUlt && (!existingPatient.enfermeroCatUlt || existingPatient.enfermeroCatUlt !== enfermeroCatUlt)) {
              updateData.enfermeroCatUlt = enfermeroCatUlt;
              updateData.enfermeroCatUltInst = enfermeroCatUltInst;
              needsUpdate = true;
            }
            if (medicoAnamnesis && (!existingPatient.medicoAnamnesis || existingPatient.medicoAnamnesis !== medicoAnamnesis)) {
              updateData.medicoAnamnesis = medicoAnamnesis;
              updateData.medicoAnamnesisInst = medicoAnamnesisInst;
              updateData.medico = medicoAnamnesis;
              needsUpdate = true;
            }

            if (needsUpdate) {
              recordsToUpdate.push({ id: existingPatient.id, data: updateData });
              actualizados++;
            } else {
              duplicados++;
            }
            continue;
          }

          parsedRecords.push({
            tAdmision: tAdm,
            tCat1: parseDateStr(safeGet(iFCat1), safeGet(iHCat1)),
            tCatUlt: parseDateStr(safeGet(iFCatU), safeGet(iHCatU)),
            tAnamnesis: parseDateStr(safeGet(iFAna), safeGet(iHAna)),
            tAlta: parseDateStr(safeGet(iFAlt), safeGet(iHAlt)),
            estado: estado, categoria: categoria, medico: medicoVal,
            enfermeroCat1: enfermeroCat1,
            enfermeroCat1Inst: enfermeroCat1Inst,
            enfermeroCatUlt: enfermeroCatUlt,
            enfermeroCatUltInst: enfermeroCatUltInst,
            medicoAnamnesis: medicoAnamnesis,
            medicoAnamnesisInst: medicoAnamnesisInst,
            codigoDiagnostico: codDiag, diagnosticoPrincipal: diagPrin, destinoAlta: destAlta, destino: destAlta,
            edad, sexo: sexoStr, prevision: safeGet(iPrev),
            comuna: safeGet(iComu), region: safeGet(iRegi), nacionalidad: safeGet(iNaci), establecimiento: safeGet(iCentro),
            correlativo: correlativoVal,
            idPaciente: idPacienteVal
          });
        }

        let outOfBounds = 0;
        const turnosMap = {};

        const isTraslado = (p) => {
            const d = String(p.destinoAlta || p.destino || '').toLowerCase();
            return d.includes('hospital') || d.includes('emergencia') || d.includes('derivac');
        };

        const isConstatacion = (p) => {
            if (p.categoria === 'c3_z518') return true;
            const cod = String(p.codigoDiagnostico || p.diagnostico || '').toUpperCase();
            const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
            return cod.includes('Z51.8') || cod.includes('Z518') || diag.includes('CONSTATAC');
        };

        parsedRecords.forEach(p => {
            const shift = getShiftBoundaries(p.tAdmision);
            if (!shift) {
                outOfBounds++;
                return;
            }
            const key = `${shift.fechaInicio}|${shift.horario}`;
            if (!turnosMap[key]) {
                let equipo = 'Sin Asignar';
                if (pautasTurnosHook) {
                    const eq = pautasTurnosHook.getEquipoParaTurno(shift.fechaInicio, shift.horario);
                    if (eq) equipo = eq;
                }
                turnosMap[key] = {
                    fechaInicio: shift.fechaInicio,
                    fechaFin: shift.fechaInicio,
                    horario: shift.horario,
                    equipoTurno: equipo,
                    registros: [],
                    totalPacientes: 0,
                    altasAdmin: 0,
                    trasladosCount: 0,
                    constatacionesCount: 0,
                    c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0, sincat: 0
                };
            }
            
            const tObj = turnosMap[key];
            tObj.registros.push(p);
            tObj.totalPacientes++;
            if (p.estado === 'Cancelada') tObj.altasAdmin++;
            if (tObj[p.categoria] !== undefined) tObj[p.categoria]++;
            if (isTraslado(p)) tObj.trasladosCount++;
            if (isConstatacion(p)) tObj.constatacionesCount++;
        });

        const turnosGenerados = Object.values(turnosMap);

        if (turnosGenerados.length === 0 && recordsToUpdate.length === 0) {
          setIsReadingFile(false);
          if (duplicados > 0) return showNotif(`Se omitieron ${duplicados} registros duplicados y no quedaron pacientes nuevos ni datos para actualizar.`, "warning");
          return showNotif("No se detectaron pacientes válidos dentro de los horarios de atención.", "error");
        }

        const dateToYYYYMMDD = (ts) => {
          if (ts === Infinity || ts === -Infinity) return '';
          const d = new Date(ts);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        const fileMinDate = dateToYYYYMMDD(fileMinTime);
        const fileMaxDate = dateToYYYYMMDD(fileMaxTime);

        setPendingUpload({
          fileName,
          turnos: turnosGenerados,
          recordsToUpdate,
          totalActualizados: actualizados,
          totalDuplicados: duplicados,
          totalOutOfBounds: outOfBounds,
          incidencias: incidenciasDetectadas,
          totalPacientes: turnosGenerados.reduce((acc, t) => acc + t.totalPacientes, 0),
          filasOriginales: rows.length - (headerRowIdx + 1),
          fileMinDate,
          fileMaxDate,
          fileTurnosCount: fileTurnosKeys.size
        });
        
        setIsReadingFile(false);
      };

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        if (!window.XLSX) {
          setIsReadingFile(false);
          return showNotif("Cargando librerías Excel... reintenta en 1s", "error");
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
          const wb = window.XLSX.read(evt.target.result, { type: 'binary' });
          const rows = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, dateNF: 'dd/mm/yyyy' });
          processArray(rows);
        };
        reader.readAsBinaryString(file);
      } else {
        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target.result; const lines = text.split('\n').filter(l => l.trim() !== '');
            if(lines.length === 0) { setIsReadingFile(false); return showNotif("Archivo vacío", "error"); }
            const delimiter = lines[0].includes(';') ? ';' : ',';
            const rows = lines.map(l => l.split(delimiter).map(c => c.replace(/"/g, '').trim()));
            processArray(rows);
        };
        reader.readAsText(file);
      }
    }, 100);
    e.target.value = null; 
  };

  const confirmMassUpload = async () => {
    if (!pendingUpload || !user || !db) return;
    setIsUploading(true); setSyncStatus('syncing');
    setUploadError(null);
    const startTime = Date.now();
    setUploadEta(null);

    try {
      const batchList = [];
      let currentBatch = writeBatch(db);
      let opCounter = 0;
      let successCount = 0;
      let minDate = pendingUpload.fileMinDate || '9999-99-99';
      let maxDate = pendingUpload.fileMaxDate || '0000-00-00';

      const cargaId = `CARGA-${Date.now()}`;

      for (const turno of pendingUpload.turnos) {
        const cleanFileName = (pendingUpload.fileName || 'LOTE').replace(/\s+/g, '_').toUpperCase();
        const loteId = `${cleanFileName}-${turno.fechaInicio}-${Date.now()}`;
        const horasTurno = String(turno.horario).includes("17:00") ? 15 : 12;
        const ratio = turno.totalPacientes / horasTurno;

        if (turno.fechaInicio < minDate) minDate = turno.fechaInicio;
        if (turno.fechaInicio > maxDate) maxDate = turno.fechaInicio;

        const turnoDoc = {
          loteId, tipo: 'Masiva', fechaInicio: turno.fechaInicio, fechaFin: turno.fechaInicio,
          horario: turno.horario, equipoTurno: turno.equipoTurno, totalPacientes: Number(turno.totalPacientes),
          altasAdmin: Number(turno.altasAdmin), pacientesPorHora: ratio,
          c1: turno.c1 || 0, c2: turno.c2 || 0, c3: turno.c3 || 0, 
          c3_z518: turno.c3_z518 || 0, c4: turno.c4 || 0, c5: turno.c5 || 0, 
          creadoEl: Date.now(),
          cargaId
        };

        const turnoRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'turnos'));
        currentBatch.set(turnoRef, turnoDoc);
        opCounter++;
        
        const pacRef = collection(db, 'artifacts', appId, 'public', 'data', 'pacientes_urgencia');
        
        for (const p of turno.registros) {
          if (p.tAdmision) { 
            if (opCounter >= 490) {
              batchList.push(currentBatch);
              currentBatch = writeBatch(db);
              opCounter = 0;
            }
            const newPacDoc = doc(pacRef);
            currentBatch.set(newPacDoc, { ...p, loteId, cargaId });
            opCounter++;
            successCount++;
          }
        }
      }

      if (pendingUpload.recordsToUpdate && pendingUpload.recordsToUpdate.length > 0) {
        for (const item of pendingUpload.recordsToUpdate) {
          if (opCounter >= 490) {
            batchList.push(currentBatch);
            currentBatch = writeBatch(db);
            opCounter = 0;
          }
          const pacDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'pacientes_urgencia', item.id);
          currentBatch.update(pacDocRef, item.data);
          opCounter++;
        }
      }
      
      if (opCounter > 0) batchList.push(currentBatch);
      
      const formatToDMY = (dateStr) => {
        if (!dateStr || dateStr.length < 10) return '';
        const p = dateStr.split('-');
        if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
        return dateStr;
      };

      const minDateFormatted = formatToDMY(minDate);
      const maxDateFormatted = formatToDMY(maxDate);

      const auditLog = {
        fecha: Date.now(),
        accion: 'Carga Masiva',
        detalles: `Carga exitosa del archivo ${pendingUpload.fileName} (Periodo: ${minDateFormatted} al ${maxDateFormatted}). Se procesaron ${successCount} atenciones válidas y se descartaron ${pendingUpload.totalDuplicados} registros duplicados de origen (Filas originales leídas: ${pendingUpload.filasOriginales}).`,
        centro: centroActivo || 'Desconocido',
        usuario: user?.email || 'Anónimo'
      };

      const auditoriaCargasDoc = {
        fechaCarga: Date.now(),
        usuario: user?.email || 'Sistema',
        archivo: pendingUpload.fileName || 'Lote Excel',
        periodo: {
          desde: minDateFormatted,
          hasta: maxDateFormatted
        },
        estadisticas: {
          filasOriginales: pendingUpload.filasOriginales || 0,
          atencionesValidas: successCount,
          duplicadosDescartados: pendingUpload.totalDuplicados || 0
        },
        estado: 'Completado Exitosamente',
        cargaId
      };
      
      const lastBatch = writeBatch(db);
      lastBatch.set(doc(collection(db, 'artifacts', appId, 'public', 'data', 'audit_logs')), auditLog);
      
      const auditoriaRef = doc(db, 'artifacts', appId, 'public', 'data', 'auditoria_cargas', cargaId);
      lastBatch.set(auditoriaRef, auditoriaCargasDoc);
      batchList.push(lastBatch);

      setUploadProgress(0);
      setUploadRecordCount(0);
      setTotalBatches(batchList.length);
      cancelUploadRef.current = false;

      for (let i = 0; i < batchList.length; i++) {
        if (cancelUploadRef.current) {
          throw new Error("CANCELLED_BY_USER");
        }
        setCurrentBatchIndex(i + 1);
        await runWithTimeout(batchList[i].commit(), 30000);
        const batchProgress = i + 1;
        const pct = (batchProgress / batchList.length) * 100;
        setUploadProgress(pct);

        // Calcular ETA
        const elapsedTime = Date.now() - startTime;
        const avgTimePerBatch = elapsedTime / batchProgress;
        const remainingBatches = batchList.length - batchProgress;
        const remainingTimeMs = avgTimePerBatch * remainingBatches;
        const remainingSeconds = Math.round(remainingTimeMs / 1000);
        setUploadEta(remainingSeconds);
        
        const isLastBatch = batchProgress === batchList.length;
        const count = isLastBatch 
          ? pendingUpload.totalPacientes 
          : Math.min(
              pendingUpload.totalPacientes,
              Math.round((batchProgress / (batchList.length - 1)) * pendingUpload.totalPacientes)
            );
        setUploadRecordCount(count);
      }
      
      setUploadResult({
        fileName: pendingUpload.fileName,
        successCount: successCount,
        totalDuplicados: pendingUpload.totalDuplicados,
        filasOriginales: pendingUpload.filasOriginales,
        turnosCount: pendingUpload.fileTurnosCount || pendingUpload.turnos.length,
        minDate,
        maxDate,
        minDateFormatted,
        maxDateFormatted
      });
      setUploadSuccess(true);

    } catch (err) { 
      console.error(err);
      if (err.message === "CANCELLED_BY_USER") {
        setUploadError("Operación cancelada por el usuario. Es posible que algunos lotes iniciales ya se hayan guardado en la nube. Se recomienda purgar este periodo si deseas repetir el proceso.");
      } else {
        let errMsg = "Error al guardar lote en la nube.";
        if (String(err.message).includes("Timeout")) {
          errMsg = "Error de conexión: tiempo de espera agotado. Esto suele ocurrir cuando se agota la cuota gratuita diaria de Firebase.";
        } else {
          errMsg = "Error al guardar el lote. Se ha excedido la cuota de base de datos de Firebase.";
        }
        setUploadError(errMsg);
        showNotif(errMsg, "error");
      }
    }
    setIsUploading(false); setSyncStatus('synced');
    cancelUploadRef.current = false;
  };

  const handleSuccessClose = () => {
    if (uploadResult) {
      if (uploadResult.minDate !== '9999-99-99') {
        setFiltroFechaInicio(uploadResult.minDate);
        setFiltroFechaFin(uploadResult.maxDate);
      }
    }
    setUploadSuccess(false);
    setPendingUpload(null);
    setUploadResult(null);
    setActiveTab('resumen');
  };

  const recalcularTurnosDesdePacientes = async () => {
    setIsRecalculating(true);
    setSyncStatus('syncing');
    setRecalcProgress(0);
    setRecalcStatus('Descargando registros desde el servidor en bloques trimestrales...');

    try {
      const { query, where } = await import('firebase/firestore');
      const pacsRef = collection(db, 'artifacts', appId, 'public', 'data', 'pacientes_urgencia');
      
      const quarterRanges = [
        { start: new Date(2024, 9, 1, 0, 0, 0).getTime(), end: new Date(2024, 11, 31, 23, 59, 59).getTime() },
        { start: new Date(2025, 0, 1, 0, 0, 0).getTime(), end: new Date(2025, 2, 31, 23, 59, 59).getTime() },
        { start: new Date(2025, 3, 1, 0, 0, 0).getTime(), end: new Date(2025, 5, 30, 23, 59, 59).getTime() },
        { start: new Date(2025, 6, 1, 0, 0, 0).getTime(), end: new Date(2025, 8, 30, 23, 59, 59).getTime() },
        { start: new Date(2025, 9, 1, 0, 0, 0).getTime(), end: new Date(2025, 11, 31, 23, 59, 59).getTime() },
        { start: new Date(2026, 0, 1, 0, 0, 0).getTime(), end: new Date(2026, 2, 31, 23, 59, 59).getTime() },
        { start: new Date(2026, 3, 1, 0, 0, 0).getTime(), end: new Date(2026, 5, 30, 23, 59, 59).getTime() },
        { start: new Date(2026, 6, 1, 0, 0, 0).getTime(), end: new Date(2026, 8, 30, 23, 59, 59).getTime() },
        { start: new Date(2026, 9, 1, 0, 0, 0).getTime(), end: new Date(2026, 11, 31, 23, 59, 59).getTime() }
      ];

      const todosPacientes = [];
      const promises = quarterRanges.map(async (r) => {
        const q = query(pacsRef, where('tAdmision', '>=', r.start), where('tAdmision', '<=', r.end));
        const snap = await getDocs(q);
        const docs = [];
        snap.forEach(d => {
          docs.push({ id: d.id, ...d.data() });
        });
        return docs;
      });

      const results = await Promise.all(promises);
      results.forEach(docs => {
        todosPacientes.push(...docs);
      });

      if (todosPacientes.length === 0) {
        setIsRecalculating(false);
        setSyncStatus('synced');
        return showNotif("No hay pacientes en la base de datos para realizar la sincronización.", "warning");
      }

      setRecalcStatus('Descargando todos los turnos existentes...');
      const turnosRef = collection(db, 'artifacts', appId, 'public', 'data', 'turnos');
      const turnosSnap = await getDocs(turnosRef);
      const todosTurnos = turnosSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      setRecalcStatus('Agrupando pacientes por jornadas y horarios...');

      const isTraslado = (p) => {
        const d = String(p.destinoAlta || p.destino || '').toLowerCase();
        return d.includes('hospital') || d.includes('emergencia') || d.includes('derivac');
      };

      const isConstatacion = (p) => {
        if (p.categoria === 'c3_z518') return true;
        const cod = String(p.codigoDiagnostico || p.diagnostico || '').toUpperCase();
        const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
        return cod.includes('Z51.8') || cod.includes('Z518') || diag.includes('CONSTATAC');
      };

      const turnosMap = {};
      todosPacientes.forEach(p => {
        const shift = getShiftBoundaries(p.tAdmision);
        if (!shift) return;

        const key = `${shift.fechaInicio}|${shift.horario}`;
        if (!turnosMap[key]) {
          let equipo = 'Sin Asignar';
          if (pautasTurnosHook) {
            const eq = pautasTurnosHook.getEquipoParaTurno(shift.fechaInicio, shift.horario);
            if (eq) equipo = eq;
          }
          turnosMap[key] = {
            fechaInicio: shift.fechaInicio,
            fechaFin: shift.fechaInicio,
            horario: shift.horario,
            equipoTurno: equipo,
            totalPacientes: 0,
            altasAdmin: 0,
            trasladosCount: 0,
            constatacionesCount: 0,
            c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0, sincat: 0
          };
        }

        const tObj = turnosMap[key];
        tObj.totalPacientes++;
        if (p.estado === 'Cancelada') tObj.altasAdmin++;
        if (tObj[p.categoria] !== undefined) tObj[p.categoria]++;
        if (isTraslado(p)) tObj.trasladosCount++;
        if (isConstatacion(p)) tObj.constatacionesCount++;
      });

      const nuevosTurnos = Object.values(turnosMap);
      setRecalcStatus(`Preparando actualización de ${nuevosTurnos.length} jornadas...`);

      const batchList = [];
      let currentBatch = writeBatch(db);
      let opCounter = 0;

      const addOp = (actionFn) => {
        actionFn(currentBatch);
        opCounter++;
        if (opCounter >= 450) {
          batchList.push(currentBatch);
          currentBatch = writeBatch(db);
          opCounter = 0;
        }
      };

      // Eliminar turnos viejos
      todosTurnos.forEach(t => {
        addOp((b) => b.delete(doc(db, 'artifacts', appId, 'public', 'data', 'turnos', t.id)));
      });

      // Crear turnos nuevos
      const cleanFileName = "SINCRONIZACION";
      nuevosTurnos.forEach(t => {
        const loteId = `${cleanFileName}-${t.fechaInicio}-${Date.now()}`;
        const horasTurno = String(t.horario).includes("17:00") ? 15 : 12;
        const ratio = t.totalPacientes / horasTurno;

        const turnoDoc = {
          loteId,
          tipo: 'Masiva',
          fechaInicio: t.fechaInicio,
          fechaFin: t.fechaInicio,
          horario: t.horario,
          equipoTurno: t.equipoTurno,
          totalPacientes: Number(t.totalPacientes),
          altasAdmin: Number(t.altasAdmin),
          pacientesPorHora: ratio,
          c1: t.c1 || 0,
          c2: t.c2 || 0,
          c3: t.c3 || 0,
          c3_z518: t.c3_z518 || 0,
          c4: t.c4 || 0,
          c5: t.c5 || 0,
          creadoEl: Date.now()
        };

        const newShiftRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'turnos'));
        addOp((b) => b.set(newShiftRef, turnoDoc));
      });

      if (opCounter > 0) {
        batchList.push(currentBatch);
      }

      // Guardar log de auditoría
      const auditLog = {
        fecha: Date.now(),
        accion: 'Sincronización',
        detalles: `Sincronización y recálculo de turnos realizado. Reconstruidos ${nuevosTurnos.length} turnos en base a ${pacientesDB.length} registros de pacientes.`,
        centro: centroActivo || 'Desconocido',
        usuario: user?.email || 'Anónimo'
      };
      
      const auditBatch = writeBatch(db);
      auditBatch.set(doc(collection(db, 'artifacts', appId, 'public', 'data', 'audit_logs')), auditLog);
      batchList.push(auditBatch);

      // Comprometer secuencialmente
      for (let i = 0; i < batchList.length; i++) {
        setRecalcStatus(`Guardando lote ${i + 1} de ${batchList.length} en la nube...`);
        await runWithTimeout(batchList[i].commit(), 30000);
        setRecalcProgress(((i + 1) / batchList.length) * 100);
      }

      // Calcular totales para el modal resumen (usando el año seleccionado auditYear)
      const pacsEsteAnio = todosPacientes.filter(p => {
        if (!p.tAdmision) return false;
        return new Date(p.tAdmision).getFullYear() === auditYear;
      });
      const turnosEsteAnio = nuevosTurnos.filter(t => {
        if (!t.fechaInicio) return false;
        return new Date(t.fechaInicio).getFullYear() === auditYear;
      });

      const totalPacientesBD = pacsEsteAnio.length;
      const totalPacientesTurnos = turnosEsteAnio.reduce((acc, t) => acc + (t.totalPacientes || 0), 0);

      setRecalcSummaryModal({
        año: auditYear,
        totalBD: totalPacientesBD,
        totalTurnos: totalPacientesTurnos,
        descalce: totalPacientesBD - totalPacientesTurnos
      });

      showNotif("Sincronización y recálculo de turnos completado con éxito.", "success");
    } catch (e) {
      console.error(e);
      showNotif("Error al sincronizar y recalcular turnos: " + e.message, "error");
    }

    setIsRecalculating(false);
    setSyncStatus('synced');
  };

  // Funciones de Auditoría y Puntos de Control
  const ejecutarAuditoriaAnual = async () => {
    setIsAuditing(true);
    setAuditStatus('Iniciando auditoría, conectando con la base de datos...');
    setAuditProgress(10);
    setAuditResults(null);

    try {
      const { query, where, getDocs } = await import('firebase/firestore');
      const pacsRef = collection(db, 'artifacts', appId, 'public', 'data', 'pacientes_urgencia');
      
      const startMs = new Date(auditYear, 0, 1, 0, 0, 0).getTime();
      const endMs = new Date(auditYear, 11, 31, 23, 59, 59).getTime();

      setAuditStatus(`Descargando registros de pacientes para el año ${auditYear}...`);
      setAuditProgress(35);

      const q = query(pacsRef, where('tAdmision', '>=', startMs), where('tAdmision', '<=', endMs));
      const snap = await getDocs(q);
      
      setAuditProgress(70);
      setAuditStatus('Procesando datos y analizando correlativos...');

      const patients = [];
      snap.forEach(doc => {
        patients.push({ id: doc.id, ...doc.data() });
      });

      const monthlyBuckets = Array.from({ length: 12 }, (_, i) => ({
        monthIdx: i,
        monthName: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][i],
        patients: []
      }));

      patients.forEach(p => {
        if (!p.tAdmision) return;
        const d = new Date(p.tAdmision);
        const m = d.getMonth();
        if (m >= 0 && m < 12) {
          monthlyBuckets[m].patients.push(p);
        }
      });

      const results = monthlyBuckets.map(bucket => {
        const pList = bucket.patients;
        const cargados = pList.length;

        if (cargados === 0) {
          return {
            monthIdx: bucket.monthIdx,
            monthName: bucket.monthName,
            minCorr: '-',
            maxCorr: '-',
            esperados: 0,
            cargados: 0,
            duplicadosCount: 0,
            duplicadosIds: [],
            duplicadosDetalles: [],
            gaps: [],
            discrepancia: 0,
            estado: 'cuadrado'
          };
        }

        const correlativosSet = new Set();
        const correlativosMap = new Map();
        const duplicadosIds = [];
        const seenKeys = new Set();
        const duplicatesList = [];

        pList.forEach(p => {
          const rawCorr = p.correlativo ? String(p.correlativo).trim() : '';
          const cleanCorr = rawCorr.replace(/,/g, '').split('.')[0];
          const numCorr = parseInt(cleanCorr, 10);

          if (!isNaN(numCorr)) {
            correlativosSet.add(numCorr);
            if (!correlativosMap.has(numCorr)) {
              correlativosMap.set(numCorr, []);
            }
            correlativosMap.get(numCorr).push(p);
          }

          const dupKey = `${cleanCorr}_${p.idPaciente || ''}_${p.tAdmision || ''}`;
          if (seenKeys.has(dupKey)) {
            duplicadosIds.push(p.id);
          } else {
            seenKeys.add(dupKey);
          }
        });

        correlativosMap.forEach((list, corr) => {
          if (list.length > 1) {
            duplicatesList.push({
              correlativo: corr,
              count: list.length,
              patients: list.map(item => ({
                id: item.id,
                tAdmision: item.tAdmision,
                idPaciente: item.idPaciente,
                categoria: item.categoria,
                diagnosticoPrincipal: item.diagnosticoPrincipal,
                estado: item.estado
              }))
            });
          }
        });

        const uniqueNumeric = Array.from(correlativosSet).sort((a, b) => a - b);
        const minCorr = uniqueNumeric.length > 0 ? uniqueNumeric[0] : null;
        const maxCorr = uniqueNumeric.length > 0 ? uniqueNumeric[uniqueNumeric.length - 1] : null;
        const esperados = (maxCorr !== null && minCorr !== null) ? (maxCorr - minCorr + 1) : 0;

        const gaps = [];
        if (minCorr !== null && maxCorr !== null) {
          for (let i = minCorr; i <= maxCorr; i++) {
            if (!correlativosSet.has(i)) {
              gaps.push(i);
            }
          }
        }

        const discrepancia = cargados - esperados;
        let estado = 'cuadrado';
        if (duplicadosIds.length > 0) {
          estado = 'duplicados';
        } else if (gaps.length > 0) {
          estado = 'incompleto';
        } else if (discrepancia !== 0) {
          estado = 'descuadrado';
        }

        return {
          monthIdx: bucket.monthIdx,
          monthName: bucket.monthName,
          minCorr: minCorr !== null ? minCorr.toLocaleString('es-CL') : '-',
          maxCorr: maxCorr !== null ? maxCorr.toLocaleString('es-CL') : '-',
          esperados,
          cargados,
          duplicadosCount: duplicadosIds.length,
          duplicadosIds,
          duplicadosDetalles: duplicatesList,
          gaps,
          discrepancia,
          estado
        };
      });

      setAuditResults(results);

      // Encontrar el último paciente por correlativo numérico más alto
      let latestP = null;
      let maxCorrVal = 0;
      patients.forEach(p => {
        if (!p.tAdmision) return;
        const rawCorr = p.correlativo ? String(p.correlativo).trim() : '';
        const clean = rawCorr.replace(/,/g, '').split('.')[0];
        const numCorr = parseInt(clean, 10);
        
        if (!isNaN(numCorr) && numCorr > maxCorrVal) {
          maxCorrVal = numCorr;
          latestP = p;
        }
      });
      setUltimoPaciente(latestP);

      setAuditProgress(100);
      showNotif(`Auditoría del año ${auditYear} completada con éxito.`, 'success');
    } catch (e) {
      console.error(e);
      showNotif(`Error en la auditoría: ${e.message}`, 'error');
    } finally {
      setIsAuditing(false);
    }
  };

  const corregirDuplicadosMes = async (monthResult) => {
    if (!monthResult || monthResult.duplicadosCount === 0) return;

    setFixingMonthIdx(monthResult.monthIdx);
    setSyncStatus('syncing');

    try {
      const docIds = monthResult.duplicadosIds;
      const batchSize = 400;
      const totalBatches = Math.ceil(docIds.length / batchSize);

      for (let i = 0; i < totalBatches; i++) {
        const chunk = docIds.slice(i * batchSize, (i + 1) * batchSize);
        const batch = writeBatch(db);
        chunk.forEach(docId => {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'pacientes_urgencia', docId);
          batch.delete(docRef);
        });
        await batch.commit();
      }

      showNotif(`¡Deduplicación del mes ${monthResult.monthName} completada! Se eliminaron ${docIds.length} registros duplicados.`, 'success');
      
      setAuditStatus(`Recalculando jornadas después de corregir duplicados...`);
      await recalcularTurnosDesdePacientes();
      await ejecutarAuditoriaAnual();
    } catch (err) {
      console.error(err);
      showNotif(`Error al corregir duplicados: ${err.message}`, 'error');
    } finally {
      setFixingMonthIdx(null);
      setSyncStatus('synced');
    }
  };

  const corregirDuplicadosAñoCompleto = async () => {
    if (!auditResults) return;
    const allDupIds = auditResults.reduce((acc, m) => acc.concat(m.duplicadosIds), []);
    if (allDupIds.length === 0) {
      return showNotif("No hay registros duplicados en ningún mes para corregir.", "info");
    }

    setIsUploading(true);
    setSyncStatus('syncing');
    setAuditStatus('Eliminando registros duplicados de todo el año...');

    try {
      const batchSize = 400;
      const totalBatches = Math.ceil(allDupIds.length / batchSize);

      for (let i = 0; i < totalBatches; i++) {
        const chunk = allDupIds.slice(i * batchSize, (i + 1) * batchSize);
        const batch = writeBatch(db);
        chunk.forEach(docId => {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'pacientes_urgencia', docId);
          batch.delete(docRef);
        });
        await batch.commit();
        setUploadProgress(Math.round(((i + 1) / totalBatches) * 100));
      }

      showNotif(`¡Deduplicación anual completada! Se eliminaron ${allDupIds.length} registros duplicados.`, 'success');
      
      setAuditStatus('Recalculando turnos para todo el año...');
      await recalcularTurnosDesdePacientes();
      await ejecutarAuditoriaAnual();
    } catch (err) {
      console.error(err);
      showNotif(`Error al corregir duplicados anuales: ${err.message}`, 'error');
    } finally {
      setIsUploading(false);
      setSyncStatus('synced');
    }
  };

  const handleManualSuccessClose = () => {
    if (manualSuccessResult) {
      if (manualSuccessResult.fechaInicio) {
        setFiltroFechaInicio(manualSuccessResult.fechaInicio);
        setFiltroFechaFin(manualSuccessResult.fechaInicio);
      }
    }
    setManualSuccessResult(null);
    setManualForm({ fechaInicio: '', fechaFin: '', horario: '17:00 - 08:00 (Semana Largo)', equipoTurno: 'Sin Asignar', totalPacientes: 0, altasAdmin: 0, c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });
    setActiveTab('resumen');
  };

  const handleManualSave = async () => {
    if (!manualForm.fechaInicio || !manualForm.fechaFin) {
      return showNotif("Debes especificar las fechas del turno.", "warning");
    }
    setIsUploading(true); setSyncStatus('syncing');

    const loteId = `MANUAL-${Date.now()}`;
    const horasTurno = String(manualForm.horario).includes("17:00") ? 15 : 12;
    const ratio = Number(manualForm.totalPacientes) / horasTurno;

    const turnoDoc = {
      loteId, tipo: 'Manual', fechaInicio: manualForm.fechaInicio, fechaFin: manualForm.fechaFin,
      horario: manualForm.horario, equipoTurno: manualForm.equipoTurno, totalPacientes: Number(manualForm.totalPacientes),
      altasAdmin: Number(manualForm.altasAdmin), pacientesPorHora: ratio,
      c1: Number(manualForm.c1), c2: Number(manualForm.c2), c3: Number(manualForm.c3), 
      c4: Number(manualForm.c4), c5: Number(manualForm.c5), 
      creadoEl: Date.now()
    };

    try {
      const batch = writeBatch(db);
      const turnoRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'turnos'));
      batch.set(turnoRef, turnoDoc);

      const auditLog = {
        fecha: Date.now(),
        accion: 'Carga Manual',
        detalles: `Turno manual creado (${manualForm.totalPacientes} pacientes).`,
        centro: centroActivo || 'Desconocido',
        usuario: user?.email || 'Anónimo'
      };
      batch.set(doc(collection(db, 'artifacts', appId, 'public', 'data', 'audit_logs')), auditLog);

      await batch.commit();

      setManualSuccessResult({
        totalPacientes: Number(manualForm.totalPacientes),
        altasAdmin: Number(manualForm.altasAdmin),
        fechaInicio: manualForm.fechaInicio,
        horario: manualForm.horario
      });
    } catch (e) {
      showNotif("Error al guardar el turno manual.", "error");
    }
    setIsUploading(false); setSyncStatus('synced');
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-700 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Database className="w-8 h-8 text-blue-500" />
        <div>
          <h1 className="text-2xl font-black text-slate-800">Gestión de Datos</h1>
          <p className="text-sm text-slate-500">Carga masiva de Excel o ingreso manual de turnos</p>
        </div>
      </div>

      <div className="flex border-b border-slate-200 mb-6">
        <button 
          onClick={() => setActiveGestionTab('carga')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeGestionTab === 'carga' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          Carga de Datos
        </button>
        <button 
          onClick={() => setActiveGestionTab('limpieza')}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeGestionTab === 'limpieza' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          Limpieza y Control de Datos
        </button>
      </div>

      {activeGestionTab === 'carga' && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Database className="text-blue-500 w-5 h-5"/>
            <h2 className="text-lg font-bold text-slate-800">Carga Masiva (Excel)</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">Sube el reporte del sistema. Detectaremos fechas, pacientes, categorías y demografía automáticamente.</p>
          
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 hover:border-blue-400 hover:bg-blue-50 transition-colors relative">
            <FileSpreadsheet className="w-12 h-12 text-slate-400 mb-4" />
            <p className="font-bold text-slate-700 mb-1">Arrastra tu archivo o haz clic aquí</p>
            <p className="text-xs text-slate-400 mb-6">Soporta .XLSX, .XLS y .CSV</p>
            
            <label className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition cursor-pointer shadow-md">
              Seleccionar Archivo
              <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <UploadCloud className="text-emerald-500 w-5 h-5"/>
            <h2 className="text-lg font-bold text-slate-800">Carga de Turno Manual</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">Ingresa las variables del turno manualmente (sin archivo).</p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Fecha Inicio</label>
                <div className="relative">
                  <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500" value={manualForm.fechaInicio} onChange={e => handleManualFormChange('fechaInicio', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Fecha Fin</label>
                <div className="relative">
                  <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500" value={manualForm.fechaFin} onChange={e => handleManualFormChange('fechaFin', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Horario del Turno</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500" value={manualForm.horario} onChange={e => handleManualFormChange('horario', e.target.value)}>
                  <option value="17:00 - 08:00 (Semana Largo)">17:00 - 08:00 (Semana Largo)</option>
                  <option value="08:00 - 20:00 (Fin de semana Día)">08:00 - 20:00 (Fin de semana Día)</option>
                  <option value="20:00 - 08:00 (Fin de semana Noche)">20:00 - 08:00 (Fin de semana Noche)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Equipo de Turno</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500" value={manualForm.equipoTurno} onChange={e => handleManualFormChange('equipoTurno', e.target.value)}>
                  <option value="Turno 1">Turno 1</option>
                  <option value="Turno 2">Turno 2</option>
                  <option value="Turno 3">Turno 3</option>
                  <option value="Turno 4">Turno 4</option>
                  <option value="Sin Asignar">Sin Asignar</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-2">
              {[1,2,3,4,5].map(c => (
                <div key={c}>
                  <label className={`block text-xs font-bold mb-1 text-center ${c===1?'text-red-500':c===2?'text-orange-500':c===3?'text-yellow-500':c===4?'text-emerald-500':'text-blue-500'}`}>C{c}</label>
                  <input type="number" min="0" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-center text-sm outline-none focus:border-emerald-500" value={manualForm[`c${c}`]} onChange={e => setManualForm({...manualForm, [`c${c}`]: e.target.value})} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-red-500 mb-1 text-center">Altas Administrativas</label>
                <input type="number" min="0" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center text-sm outline-none focus:border-emerald-500" value={manualForm.altasAdmin} onChange={e => setManualForm({...manualForm, altasAdmin: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 text-center">Total Pacientes Turno</label>
                <input type="number" min="0" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center text-sm outline-none focus:border-emerald-500 font-bold" value={manualForm.totalPacientes} onChange={e => setManualForm({...manualForm, totalPacientes: e.target.value})} />
              </div>
            </div>

            <button onClick={handleManualSave} disabled={isUploading || uploadSuccess} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3 rounded-lg transition-colors mt-4 shadow-md flex items-center justify-center gap-2">
              {isUploading ? (
                <><svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Guardando...</>
              ) : uploadSuccess ? (
                <><CheckCircle className="w-5 h-5"/> ¡Carga Exitosa!</>
              ) : "Guardar Turno Manual"}
            </button>
          </div>
        </div>
      </div>
      )}

      {activeGestionTab === 'limpieza' && (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <Database className="text-rose-500 w-5 h-5"/>
          <h2 className="text-lg font-bold text-slate-800">Limpieza y Depuración</h2>
        </div>
        <p className="text-sm text-slate-500 mb-6">Esta herramienta elimina permanentemente los pacientes y turnos de un periodo específico. Útil para corregir cargas masivas erróneas o duplicadas.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div>
            <div className="flex gap-4 border-b border-slate-200 pb-4 flex-wrap">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input type="radio" checked={limpiezaModo === 'mes'} onChange={() => { setLimpiezaModo('mes'); setSelectedCarga(null); }} />
                Por Mes
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input type="radio" checked={limpiezaModo === 'dia'} onChange={() => { setLimpiezaModo('dia'); setSelectedCarga(null); }} />
                Por Día
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input type="radio" checked={limpiezaModo === 'carga'} onChange={() => { setLimpiezaModo('carga'); setSelectedCarga(null); }} />
                Por Archivo Cargado
              </label>
            </div>

            <div className="mt-4">
              {limpiezaModo === 'mes' ? (
                <div className="flex gap-2">
                  <select 
                    value={limpiezaMes.split('-')[1]} 
                    onChange={e => {
                      const yr = limpiezaMes.split('-')[0];
                      setLimpiezaMes(`${yr}-${e.target.value}`);
                    }} 
                    className="flex-1 bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-bold text-slate-700 outline-none focus:border-rose-500"
                  >
                    <option value="01">Enero</option>
                    <option value="02">Febrero</option>
                    <option value="03">Marzo</option>
                    <option value="04">Abril</option>
                    <option value="05">Mayo</option>
                    <option value="06">Junio</option>
                    <option value="07">Julio</option>
                    <option value="08">Agosto</option>
                    <option value="09">Septiembre</option>
                    <option value="10">Octubre</option>
                    <option value="11">Noviembre</option>
                    <option value="12">Diciembre</option>
                  </select>
                  
                  <select 
                    value={limpiezaMes.split('-')[0]} 
                    onChange={e => {
                      const mn = limpiezaMes.split('-')[1];
                      setLimpiezaMes(`${e.target.value}-${mn}`);
                    }} 
                    className="w-28 bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-bold text-slate-700 outline-none focus:border-rose-500"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              ) : limpiezaModo === 'dia' ? (
                <input type="date" value={limpiezaDia} onChange={e => setLimpiezaDia(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-bold text-slate-700 outline-none focus:border-rose-500" />
              ) : (
                <div className="space-y-3">
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[220px] overflow-y-auto bg-white">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100 text-[9px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2">Archivo / Periodo</th>
                          <th className="px-3 py-2 text-center">Atenciones</th>
                          <th className="px-3 py-2 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60">
                        {auditoriaCargas.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="text-center py-6 text-[11px] text-slate-400 font-semibold">No se encontraron registros de cargas masivas.</td>
                          </tr>
                        ) : (
                          auditoriaCargas.map((c) => (
                            <tr key={c.id} className={`transition-colors ${selectedCarga?.id === c.id ? 'bg-rose-500/10' : 'hover:bg-slate-50'}`}>
                              <td className="px-3 py-2">
                                <span className="font-bold block text-slate-700 truncate max-w-[190px]" title={c.archivo}>{c.archivo}</span>
                                <span className="text-[9px] text-slate-400 font-medium block">Periodo: {c.periodo?.desde} al {c.periodo?.hasta}</span>
                              </td>
                              <td className="px-3 py-2 text-center font-bold text-rose-500 text-sm">
                                {c.estadisticas?.atencionesValidas}
                              </td>
                              <td className="px-3 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => setSelectedCarga(c)}
                                  className={`px-2 py-1 rounded text-[10px] font-bold transition ${selectedCarga?.id === c.id ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                                >
                                  {selectedCarga?.id === c.id ? 'Seleccionado' : 'Seleccionar'}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col justify-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 text-center">Registros a Eliminar</h3>
            <div className="flex justify-around text-center">
              <div>
                <span className="block text-3xl font-black text-rose-600">{registrosALimpiar.pacientes.length}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Pacientes</span>
              </div>
              <div>
                <span className="block text-3xl font-black text-slate-700">{registrosALimpiar.turnos.length}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Turnos</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setShowPurgeConfirm(true)} 
          disabled={isUploading || (limpiezaModo === 'carga' ? !selectedCarga : (registrosALimpiar.turnos.length === 0 && registrosALimpiar.pacientes.length === 0))}
          className="mt-6 w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          {isUploading ? <Loader2 className="animate-spin w-5 h-5" /> : <X className="w-5 h-5" />}
          {isUploading ? `Eliminando lote ${currentPurgeBatchIndex} de ${totalPurgeBatches}...` : (limpiezaModo === 'carga' && registrosALimpiar.pacientes.length === 0 ? 'Eliminar Registro de Carga' : `Purgar ${registrosALimpiar.pacientes.length} Pacientes`)}
        </button>

        {/* SECCIÓN ADICIONAL: REGENERACIÓN Y RECÁLCULO DE JORNADAS */}
        <div className="border-t border-slate-200/60 dark:border-white/5 my-6"></div>
        
        <div className="flex items-center gap-2 mb-2">
          <Zap className="text-indigo-500 w-5 h-5"/>
          <h2 className="text-lg font-bold text-slate-800">Sincronización y Recálculo de Turnos</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4 text-left">
          Esta herramienta regenera y actualiza la lista de turnos y sus contadores (categorías, total de pacientes y altas administrativas) en base a los pacientes guardados en la colección de urgencia. Útil si has realizado cambios en las reglas horarias y deseas refrescar las estadísticas sin tener que purgar y volver a cargar los archivos Excel.
        </p>
        
        <button 
          onClick={recalcularTurnosDesdePacientes}
          disabled={isRecalculating || !pacientesDB || pacientesDB.length === 0}
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          {isRecalculating ? "Recalculando..." : "Sincronizar y Recalcular Turnos"}
        </button>

        {isRecalculating && (
          <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-left animate-fade-in">
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 block mb-1">PROGRESO DE SINCRONIZACIÓN</span>
            <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden mb-2">
              <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${recalcProgress}%` }}></div>
            </div>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">{recalcStatus}</span>
          </div>
        )}

        {/* PUNTOS DE CONTROL (AUDITORÍA DE CORRELATIVOS Y DEDUPLICACIÓN) */}
        <div className="border-t border-slate-200/60 dark:border-white/5 my-6"></div>
        
        <div className="flex items-center justify-between flex-wrap gap-4 mb-2 text-left">
          <div className="flex items-center gap-2">
            <Trash2 className="text-rose-500 w-5 h-5"/>
            <h2 className="text-lg font-bold text-slate-800">Puntos de Control (Auditoría de Correlativos y Deduplicación)</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">Año de Auditoría:</span>
            <select 
              value={auditYear} 
              onChange={e => setAuditYear(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-rose-500"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
            </select>
            
            <button 
              onClick={ejecutarAuditoriaAnual}
              disabled={isAuditing || isUploading}
              className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer font-bold"
            >
              {isAuditing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              {isAuditing ? 'Auditando...' : 'Iniciar Auditoría'}
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-4 text-left leading-relaxed">
          Compara la numeración correlativa del sistema Rayen contra los pacientes importados en la base de datos de Métrico. Un correlativo secuencial perfecto indica una carga íntegra y sin duplicados. Use esta auditoría para encontrar huecos (gaps) o registros repetidos por mes.
        </p>
        
        {/* Tarjeta de Último Paciente Registrado (Cruce de Control) */}
        {ultimoPaciente && (
          <div className="bg-gradient-to-r from-emerald-500/5 to-blue-500/5 border border-emerald-500/10 p-5 rounded-2xl text-left space-y-4 mb-6">
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-emerald-500 w-5 h-5 animate-pulse" />
                <div>
                  <h3 className="text-sm font-black text-slate-800">Cruce de Control: Último Paciente Registrado ({auditYear})</h3>
                  <p className="text-[11px] text-slate-400 font-semibold">Corte oficial de la última carga en base al correlativo Rayen</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Correlativo Rayen Actual:</span>
                <input 
                  type="number"
                  value={rayenControl}
                  onChange={e => setRayenControl(Number(e.target.value))}
                  className="w-24 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs font-black text-slate-700 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-600">
              <div className="bg-white/40 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold uppercase mb-1">RUT / ID Paciente</span>
                <span className="text-slate-800 text-sm font-extrabold">{ultimoPaciente.idPaciente || '-'}</span>
              </div>
              <div className="bg-white/40 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold uppercase mb-1">Fecha de Admisión</span>
                <span className="text-slate-800 text-sm font-extrabold">{new Date(ultimoPaciente.tAdmision).toLocaleString('es-CL')}</span>
              </div>
              <div className="bg-white/40 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold uppercase mb-1">Correlativo Máximo</span>
                <span className="text-emerald-600 text-sm font-black">#{ultimoPaciente.correlativo}</span>
              </div>
              <div className="bg-white/40 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold uppercase mb-1">Categoría / Edad</span>
                <span className="text-slate-800 text-sm font-extrabold">
                  {ultimoPaciente.categoria ? String(ultimoPaciente.categoria).toUpperCase() : '-'} | {ultimoPaciente.edad ? `${ultimoPaciente.edad} años` : '-'}
                </span>
              </div>
            </div>
            
            {(() => {
              const maxCorrVal = parseInt(String(ultimoPaciente.correlativo).replace(/,/g,''), 10);
              const diff = rayenControl - maxCorrVal;
              
              return (
                <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-[11px] font-bold text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="text-xs">📊</span>
                    <span>Diferencia con Rayen:</span>
                    {diff > 0 ? (
                      <span className="text-amber-600 font-extrabold">Pendientes por cargar: {diff.toLocaleString('es-CL')} pacientes</span>
                    ) : diff < 0 ? (
                      <span className="text-rose-600 font-extrabold">Exceso de registros: {Math.abs(diff).toLocaleString('es-CL')} pacientes</span>
                    ) : (
                      <span className="text-emerald-600 font-extrabold">✅ Cruce perfecto (Carga al día)</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    El último registro corresponde a la admisión del <strong>{new Date(ultimoPaciente.tAdmision).toLocaleString('es-CL')}</strong>. 
                    Comparado con el control de Rayen (#{rayenControl.toLocaleString('es-CL')}), {diff > 0 ? `faltan importar ${diff} registros para estar al día.` : diff < 0 ? `hay un excedente de ${Math.abs(diff)} registros en la base de datos.` : 'todas las admisiones están completamente cuadradas.'}
                  </p>
                </div>
              );
            })()}
          </div>
        )}

        {isAuditing && (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 mb-4">
            <span className="text-xs font-black text-rose-600 block mb-1 uppercase tracking-wider text-left">EJECUTANDO ESCANEO DE CORRELATIVOS</span>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-rose-600 h-full transition-all duration-300" style={{ width: `${auditProgress}%` }}></div>
            </div>
            <span className="text-[11px] font-bold text-slate-600 block text-left">{auditStatus}</span>
          </div>
        )}

        {auditResults ? (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl flex-wrap gap-3">
              <div className="text-xs font-semibold text-slate-600 text-left">
                Resumen de Auditoría {auditYear}:{' '}
                <span className="font-bold text-slate-800">
                  {auditResults.reduce((acc, m) => acc + m.cargados, 0).toLocaleString('es-CL')} pacientes cargados
                </span>{' '}
                en total. Se encontraron{' '}
                <span className="font-bold text-rose-500">
                  {auditResults.reduce((acc, m) => acc + m.duplicadosCount, 0)} duplicados
                </span>{' '}
                y{' '}
                <span className="font-bold text-indigo-500">
                  {auditResults.reduce((acc, m) => acc + m.gaps.length, 0)} correlativos faltantes
                </span>.
              </div>
              
              {auditResults.reduce((acc, m) => acc + m.duplicadosCount, 0) > 0 && (
                <button
                  onClick={corregirDuplicadosAñoCompleto}
                  disabled={isUploading}
                  className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 disabled:from-slate-300 disabled:to-slate-400 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Corregir Todos los Duplicados ({auditResults.reduce((acc, m) => acc + m.duplicadosCount, 0)})
                </button>
              )}
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Mes</th>
                      <th className="px-4 py-3 text-center">Rango Rayen (Min - Max)</th>
                      <th className="px-4 py-3 text-center">Esperados (Rayen)</th>
                      <th className="px-4 py-3 text-center">Cargados (Sistema)</th>
                      <th className="px-4 py-3 text-center">Diferencia</th>
                      <th className="px-4 py-3 text-center">Duplicados</th>
                      <th className="px-4 py-3 text-center">Faltantes (Gaps)</th>
                      <th className="px-4 py-3 text-center">Estado</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {auditResults.map((m) => {
                      const hasDups = m.duplicadosCount > 0;
                      const hasGaps = m.gaps.length > 0;
                      const isFixing = fixingMonthIdx === m.monthIdx;

                      return (
                        <tr key={m.monthIdx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-700">{m.monthName}</td>
                          <td className="px-4 py-3 text-center font-medium text-slate-600">{m.minCorr} - {m.maxCorr}</td>
                          <td className="px-4 py-3 text-center font-bold text-slate-600">{m.esperados > 0 ? m.esperados.toLocaleString('es-CL') : '-'}</td>
                          <td className="px-4 py-3 text-center font-bold text-slate-700">{m.cargados > 0 ? m.cargados.toLocaleString('es-CL') : '-'}</td>
                          <td className={`px-4 py-3 text-center font-black ${m.discrepancia > 0 ? 'text-rose-500' : m.discrepancia < 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {m.discrepancia > 0 ? `+${m.discrepancia}` : m.discrepancia < 0 ? m.discrepancia : '0'}
                          </td>
                          <td className={`px-4 py-3 text-center font-bold ${hasDups ? 'text-rose-500' : 'text-slate-400'}`}>
                            {m.duplicadosCount}
                          </td>
                          <td className={`px-4 py-3 text-center font-bold ${hasGaps ? 'text-indigo-500' : 'text-slate-400'}`}>
                            {m.gaps.length}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {m.cargados === 0 ? (
                              <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase">Sin Cargas</span>
                            ) : m.estado === 'cuadrado' && m.discrepancia === 0 ? (
                              <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2.5 py-1 rounded-full uppercase">✅ Cuadrado</span>
                            ) : (
                              <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase ${m.estado === 'duplicados' ? 'bg-rose-100 text-rose-700' : m.estado === 'incompleto' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                                {m.estado === 'duplicados' ? '⚠️ Duplicados' : m.estado === 'incompleto' ? '🔍 Huecos' : '❌ Descuadrado'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1.5 font-bold">
                              {m.cargados > 0 && (
                                <button
                                  onClick={() => setSelectedAuditMonth(m)}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded transition cursor-pointer"
                                  title="Ver Detalles Diagnóstico"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {hasDups && (
                                <button
                                  onClick={() => corregirDuplicadosMes(m)}
                                  disabled={isFixing || isUploading}
                                  className="bg-rose-500 hover:bg-rose-600 disabled:bg-slate-200 text-white px-2.5 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer font-bold"
                                  title="Depurar duplicados del mes y actualizar turnos"
                                >
                                  {isFixing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                  Corregir
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          !isAuditing && (
            <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700">No se ha realizado la auditoría de correlativos</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Selecciona el año y haz clic en "Iniciar Auditoría" para comenzar a escanear.</p>
            </div>
          )
        )}
      </div>
      )}

      {/* MANUAL DE PROCEDIMIENTO Y PREPARACIÓN DE ARCHIVOS Excel */}
      <div className="bg-card-custom border border-card-custom rounded-2xl p-6 shadow-sm mt-8 theme-transition">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-primary-custom">Manual de Preparación de Archivos (Subida Masiva)</h3>
            <p className="text-xs text-secondary-custom font-semibold">Instrucciones obligatorias paso a paso para la depuración y carga exitosa del reporte diario (Daily)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Paso 1 */}
          <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-black bg-indigo-500 text-white shadow-sm">1</span>
                <h4 className="text-xs font-black uppercase text-primary-custom tracking-wider">Descarga desde Iris</h4>
              </div>
              <p className="text-[11px] text-secondary-custom font-medium leading-relaxed">
                Ingresa al sistema institucional <strong>Iris</strong>, dirígete al apartado <strong>"Informe de tiempos de espera"</strong> y exporta la base de datos de atenciones diarias en formato de hoja de cálculo (.xlsx o .xls).
              </p>
            </div>
            <span className="text-[9px] font-bold text-secondary-custom opacity-60 mt-4 block">Fuente: Sistema Iris Ministerial</span>
          </div>

          {/* Paso 2 */}
          <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-black bg-indigo-500 text-white shadow-sm">2</span>
                <h4 className="text-xs font-black uppercase text-primary-custom tracking-wider">Columnas a Conservar</h4>
              </div>
              <p className="text-[11px] text-secondary-custom font-medium leading-relaxed mb-2">
                Abre el archivo y <strong>elimina todas las demás columnas</strong>, conservando únicamente las siguientes 29 columnas obligatorias:
              </p>
              <div className="max-h-48 overflow-y-auto border border-card-custom bg-black/5 dark:bg-black/25 rounded-lg p-2.5 space-y-1">
                <ul className="list-decimal pl-4 text-[9px] text-secondary-custom font-semibold space-y-0.5">
                  <li><code className="text-primary-custom font-black">ID</code></li>
                  <li><code className="text-primary-custom font-black">Edad en años</code></li>
                  <li><code className="text-primary-custom font-black">Sexo</code></li>
                  <li><code className="text-primary-custom font-black">Previsión</code></li>
                  <li><code className="text-primary-custom font-black">Comuna de residencia</code></li>
                  <li><code className="text-primary-custom font-black">Región de residencia</code></li>
                  <li><code className="text-primary-custom font-black">Nacionalidad</code></li>
                  <li><code className="text-primary-custom font-black">Establecimiento inscrito</code></li>
                  <li><code className="text-primary-custom font-black">Correlativo</code></li>
                  <li><code className="text-primary-custom font-black">Fecha de admisión</code></li>
                  <li><code className="text-primary-custom font-black">Hora de admisión</code></li>
                  <li><code className="text-primary-custom font-black">Fecha de la primera categorización</code></li>
                  <li><code className="text-primary-custom font-black">Hora de la primera categorización</code></li>
                  <li><code className="text-primary-custom font-black">Fecha de la última categorización</code></li>
                  <li><code className="text-primary-custom font-black">Hora de la última categorización</code></li>
                  <li><code className="text-primary-custom font-black">Fecha de alta</code></li>
                  <li><code className="text-primary-custom font-black">Hora de alta</code></li>
                  <li><code className="text-primary-custom font-black">Primera categorización</code></li>
                  <li><code className="text-primary-custom font-black">Nombre del profesional que registra la primera categorización</code></li>
                  <li><code className="text-primary-custom font-black">Instrumento del profesional que registra la primera categorización</code></li>
                  <li><code className="text-primary-custom font-black">Última categorización</code></li>
                  <li><code className="text-primary-custom font-black">Nombre del profesional que registra la última categorización</code></li>
                  <li><code className="text-primary-custom font-black">Instrumento del profesional que registra la última categorización</code></li>
                  <li><code className="text-primary-custom font-black">Código de diagnóstico</code></li>
                  <li><code className="text-primary-custom font-black">Diagnóstico principal</code></li>
                  <li><code className="text-primary-custom font-black">Nombre del profesional que registra la anamnesis</code></li>
                  <li><code className="text-primary-custom font-black">Instrumento del profesional que registra la anamnesis</code></li>
                  <li><code className="text-primary-custom font-black">Destino de alta</code></li>
                  <li><code className="text-primary-custom font-black">Estado</code></li>
                </ul>
              </div>
            </div>
            <span className="text-[9px] font-bold text-secondary-custom opacity-60 mt-4 block">Estructura Requerida de Planilla</span>
          </div>

          {/* Paso 3 */}
          <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-black bg-indigo-500 text-white shadow-sm">3</span>
                <h4 className="text-xs font-black uppercase text-primary-custom tracking-wider">Depuración y Carga</h4>
              </div>
              <p className="text-[11px] text-secondary-custom font-medium leading-relaxed">
                Una vez depurado el archivo con las 29 columnas, arrástralo al área de subida. Métrico utilizará los correlativos y las marcas de tiempo para desduplicar automáticamente y procesar el log en la nube.
              </p>
            </div>
            <span className="text-[9px] font-bold text-secondary-custom opacity-60 mt-4 block">Validación y Consistencia</span>
          </div>
        </div>
      </div>

      {isReadingFile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100]">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm border border-slate-100">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">Procesando Archivo</h3>
            <p className="text-sm text-slate-500 text-center">Analizando registros, identificando turnos y limpiando duplicados históricos...</p>
          </div>
        </div>
      )}

      {/* MODAL ARCHIVO PROCESADO */}
      {pendingUpload && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-bounce-in border border-slate-100 relative">
            
            {/* OVERLAY DE PROGRESO DE CARGA */}
            {isUploading && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-[60] rounded-2xl">
                <div className="w-full max-w-md text-center space-y-6 animate-fade-in">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                  <div className="space-y-1.5">
                    <h4 className="text-lg font-black text-white">Guardando Lote en la Nube</h4>
                    <p className="text-xs font-semibold text-slate-300">
                      Procesando lote {currentBatchIndex} de {totalBatches}
                    </p>
                    <p className="text-xs font-bold text-sky-400">
                      Cargando {uploadRecordCount.toLocaleString('es-ES')} de {pendingUpload.totalPacientes.toLocaleString('es-ES')} pacientes...
                    </p>
                  </div>
                  
                  {/* Contenedor Barra de Progreso */}
                  <div className="space-y-2">
                    <div className="w-full bg-white/10 h-4 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300 ease-out" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Progreso: {Math.round(uploadProgress)}%</span>
                      <span>
                        {uploadEta === null 
                          ? "Calculando tiempo..." 
                          : uploadEta <= 0 
                            ? "Casi terminado..." 
                            : uploadEta > 60 
                              ? `Tiempo restante: ~${Math.floor(uploadEta / 60)}m ${uploadEta % 60}s` 
                              : `Tiempo restante: ~${uploadEta}s`
                        }
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => { cancelUploadRef.current = true; }}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-black rounded-xl transition duration-200 mt-4 shadow-lg shadow-rose-900/30 cursor-pointer"
                  >
                    Cancelar Subida
                  </button>
                </div>
              </div>
            )}
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                <h3 className="text-xl font-bold text-slate-800">Archivo Procesado Exitosamente</h3>
              </div>
              <p className="text-sm text-slate-500 mb-6">El sistema fragmentó inteligentemente los datos en los turnos correspondientes.</p>

              {pendingUpload.incidencias && pendingUpload.incidencias.length > 0 && (
                <div className="mb-6 bg-orange-50 border border-orange-200 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-orange-600 font-bold mb-2">
                    <AlertTriangle className="w-5 h-5" /> Incidencias Detectadas
                  </div>
                  <ul className="list-disc pl-5 text-sm text-orange-800 space-y-1">
                    {pendingUpload.incidencias.map((inc, i) => <li key={i}>{inc}</li>)}
                  </ul>
                  <p className="text-xs text-orange-600 mt-3 font-medium">Puedes cancelar para corregir, o ignorar y guardar de todas formas.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col">
                  <span className="text-xs font-bold text-slate-500 uppercase">Pacientes Nuevos</span>
                  <span className="text-3xl font-black text-blue-600">{pendingUpload.totalPacientes}</span>
                  <span className="text-xs font-bold text-slate-400 mt-1">En {pendingUpload.turnos.length} turnos</span>
                </div>
                {pendingUpload.totalActualizados > 0 ? (
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col">
                    <span className="text-xs font-bold text-emerald-600 uppercase">Fichas Enriquecidas</span>
                    <span className="text-3xl font-black text-emerald-600">{pendingUpload.totalActualizados}</span>
                    <span className="text-xs font-bold text-emerald-500 mt-1">Diagnóstico y Destino agregados</span>
                  </div>
                ) : (
                  <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex flex-col">
                    <span className="text-xs font-bold text-rose-500 uppercase">Duplicados Omitidos</span>
                    <span className="text-3xl font-black text-rose-600">{pendingUpload.totalDuplicados}</span>
                    <span className="text-xs font-bold text-rose-400 mt-1">Sin información nueva</span>
                  </div>
                )}
              </div>

              {pendingUpload.totalOutOfBounds > 0 && (
                <p className="text-xs text-slate-500 mb-4 bg-slate-100 p-3 rounded-lg">Se omitieron {pendingUpload.totalOutOfBounds} registros por caer fuera de los horarios formales de atención (Ej. 10:00 AM un día de semana).</p>
              )}

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">TURNOS GENERADOS AUTOMÁTICAMENTE</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {pendingUpload.turnos.map((t, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                      <div>
                        <p className="font-bold text-slate-700">{t.fechaInicio}</p>
                        <p className="text-xs text-slate-500">{t.horario.split('(')[0].trim()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-600">{t.equipoTurno}</p>
                        <p className="text-xs text-slate-400">{t.totalPacientes} pacientes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {uploadError && (
              <div className="m-6 mb-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 rounded-xl flex items-start gap-2.5 text-red-800 dark:text-red-300 text-xs font-semibold animate-fade-in text-left">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <span className="font-bold block text-sm mb-0.5">Fallo al Guardar en Firebase</span>
                  {uploadError}
                </div>
              </div>
            )}
            
            <div className="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-200">
              <button onClick={() => setPendingUpload(null)} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-200 transition">Cancelar</button>
              <button onClick={confirmMassUpload} disabled={isUploading || uploadSuccess} className="px-6 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 shadow-md transition flex items-center gap-2">
                {isUploading ? (
                  <><Loader2 className="animate-spin h-4 w-4" /> Guardando lote {currentBatchIndex} de {totalBatches}...</>
                ) : uploadSuccess ? (
                  <><CheckCircle className="w-4 h-4"/> ¡Éxito!</>
                ) : "Confirmar Subida"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ÉXITO DE CARGA CENTRADO */}
      {uploadSuccess && uploadResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full p-6 text-center space-y-6 animate-bounce-in font-sans text-slate-800">
            
            {/* Círculo Animado de Éxito */}
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-800">¡Carga de Datos Exitosa!</h3>
              <p className="text-xs text-slate-500 font-semibold">El archivo &quot;{uploadResult.fileName}&quot; fue importado y consolidado con éxito.</p>
            </div>

            {/* Grid de Estadísticas de Auditoría */}
            <div className="grid grid-cols-2 gap-3 mt-4 text-left">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Atenciones Válidas</span>
                <span className="text-3xl font-black text-blue-600 mt-2">{uploadResult.successCount}</span>
                <span className="text-[9px] font-semibold text-slate-400 mt-1">Guardados en la nube</span>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duplicados Omitidos</span>
                <span className="text-3xl font-black text-rose-600 mt-2">{uploadResult.totalDuplicados}</span>
                <span className="text-[9px] font-semibold text-slate-400 mt-1">Registros repetidos</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between col-span-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rango de Fechas Cargado</span>
                  <span className="text-xs font-black text-slate-800">{uploadResult.minDateFormatted} al {uploadResult.maxDateFormatted}</span>
                </div>
                <div className="text-[9px] text-slate-500 font-medium mt-1">
                  Distribuidos en <span className="font-bold text-indigo-600">{uploadResult.turnosCount} turnos</span> operacionales de urgencia ({uploadResult.filasOriginales} filas analizadas).
                </div>
              </div>
            </div>

            <button 
              onClick={handleSuccessClose}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Ir al Resumen General <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}



      {/* MODAL DE DETALLE DE DIAGNÓSTICO DE AUDITORÍA */}
      {selectedAuditMonth && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in text-primary-custom">
          <div className="bg-card-custom border border-card-custom rounded-3xl shadow-2xl max-w-2xl w-full p-6 flex flex-col max-h-[85vh] theme-transition animate-bounce-in text-left">
            <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-black text-primary-custom">Diagnóstico de Control: {selectedAuditMonth.monthName} {auditYear}</h3>
                <p className="text-xs text-secondary-custom font-semibold">Auditoría detallada de la secuencia de correlativos de Rayen</p>
              </div>
              <button 
                onClick={() => setSelectedAuditMonth(null)}
                className="text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5 p-1.5 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-6">
              {/* Sección 1: Duplicados */}
              <div>
                <h4 className="text-xs font-black text-rose-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Correlativos Duplicados ({selectedAuditMonth.duplicadosDetalles.length})
                </h4>
                {selectedAuditMonth.duplicadosDetalles.length === 0 ? (
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl font-bold text-center flex items-center justify-center gap-1.5 shadow-sm">
                    <span>✅</span> No se encontraron correlativos duplicados en este mes.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto border border-slate-200/60 dark:border-white/10 rounded-xl p-2.5">
                    {selectedAuditMonth.duplicadosDetalles.map((d, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-white/5 border border-card-custom p-3 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between font-bold text-primary-custom">
                          <span>Correlativo: <span className="text-rose-600">#{d.correlativo}</span></span>
                          <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Repetido {d.count} veces</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-[10px] text-left border-collapse">
                            <thead>
                              <tr className="text-secondary-custom opacity-70 border-b border-slate-200 dark:border-white/10">
                                <th className="pb-1">RUT / ID Paciente</th>
                                <th className="pb-1">Fecha Admisión</th>
                                <th className="pb-1 text-center font-bold">Cat.</th>
                                <th className="pb-1">Diagnóstico</th>
                                <th className="pb-1 text-right">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150 dark:divide-white/5 text-secondary-custom">
                              {d.patients.map((p, idx) => (
                                <tr key={idx}>
                                  <td className="py-1 font-semibold">{p.idPaciente || '-'}</td>
                                  <td className="py-1">{new Date(p.tAdmision).toLocaleString('es-CL')}</td>
                                  <td className="py-1 text-center font-bold">{String(p.categoria).toUpperCase()}</td>
                                  <td className="py-1 truncate max-w-[150px]" title={p.diagnosticoPrincipal}>{p.diagnosticoPrincipal || '-'}</td>
                                  <td className="py-1 text-right font-medium text-primary-custom">{p.estado}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sección 2: Huecos / Gaps */}
              <div>
                <h4 className="text-xs font-black text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Search className="w-4 h-4" />
                  Correlativos Faltantes / Huecos ({selectedAuditMonth.gaps.length})
                </h4>
                {selectedAuditMonth.gaps.length === 0 ? (
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl font-bold text-center flex items-center justify-center gap-1.5 shadow-sm">
                    <span>✅</span> La secuencia numérica de Rayen es perfecta. No faltan correlativos.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-secondary-custom font-medium">
                      Los siguientes números de correlativo faltan entre el mínimo (#{selectedAuditMonth.minCorr}) y el máximo (#{selectedAuditMonth.maxCorr}) del mes:
                    </p>
                    <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl max-h-[150px] overflow-y-auto">
                      {selectedAuditMonth.gaps.map((g, idx) => (
                        <span key={idx} className="bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded">
                          #{g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200/60 dark:border-white/10 pt-3 flex justify-between items-center">
              <span className="text-[10px] font-semibold text-secondary-custom opacity-70">
                Rango Rayen: {selectedAuditMonth.minCorr} - {selectedAuditMonth.maxCorr}
              </span>
              <button 
                onClick={() => setSelectedAuditMonth(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
              >
                Cerrar Diagnóstico
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RESULTADO DE SINCRONIZACIÓN Y RECÁLCULO */}
      {recalcSummaryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in text-left">
          <div className="bg-card-custom border border-card-custom rounded-3xl shadow-2xl max-w-lg w-full p-6 text-center space-y-6 animate-bounce-in theme-transition">
            
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-primary-custom">¡Sincronización y Recálculo Exitoso!</h3>
              <p className="text-xs text-secondary-custom font-semibold">Se han recalculado todas las estadísticas de turnos para el año {recalcSummaryModal.año}.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-left">
              <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider">Pacientes BD</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                  {recalcSummaryModal.totalBD.toLocaleString('es-CL')}
                </span>
                <span className="text-[9px] font-semibold text-secondary-custom opacity-75 mt-1">Registros únicos en BD</span>
              </div>

              <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider">Acumulado Turnos</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                  {recalcSummaryModal.totalTurnos.toLocaleString('es-CL')}
                </span>
                <span className="text-[9px] font-semibold text-secondary-custom opacity-75 mt-1">Sumatoria de Turnos (Inicio)</span>
              </div>

              <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider">Diferencia (Descalce)</span>
                <span className="text-2xl font-black text-rose-500 mt-2">
                  {recalcSummaryModal.descalce.toLocaleString('es-CL')}
                </span>
                <span className="text-[9px] font-semibold text-secondary-custom opacity-75 mt-1">Brecha por cruce de turnos</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-white/5 border border-card-custom rounded-2xl text-[11px] text-secondary-custom font-semibold leading-relaxed text-left space-y-2">
              <div className="flex items-center gap-1.5 text-primary-custom font-bold">
                <span className="text-xs">💡</span>
                <span>Nota sobre la diferencia:</span>
              </div>
              <p>
                Esta brecha de {recalcSummaryModal.descalce} {recalcSummaryModal.descalce === 1 ? 'paciente' : 'pacientes'} es normal y esperable en las estadísticas por turnos del SAR. Se produce porque los turnos nocturnos o de fin de semana cruzan la medianoche y los límites mensuales (por ejemplo, pacientes admitidos el 1 de agosto antes de las 08:00 AM que corresponden al turno nocturno del 31 de julio).
              </p>
              <p>
                Esto garantiza que todas las fichas están cargadas correctamente y cuadradas al 100% en la base de datos de pacientes.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setRecalcSummaryModal(null)}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-3 px-6 rounded-xl transition shadow-sm cursor-pointer"
              >
                Entendido y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ÉXITO DE PURGA CENTRADO */}
      {purgeResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-card-custom border border-card-custom rounded-3xl shadow-2xl max-w-md w-full p-6 text-center space-y-6 animate-bounce-in theme-transition">
            
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-primary-custom">¡Depuración Completada!</h3>
              <p className="text-xs text-secondary-custom font-semibold">El periodo seleccionado fue eliminado de la base de datos de forma permanente.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-left">
              <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider">Pacientes Eliminados</span>
                <span className="text-3xl font-black text-rose-500 mt-2">{purgeResult.pacientesCount}</span>
                <span className="text-[9px] font-semibold text-secondary-custom opacity-75 mt-1">Registros borrados</span>
              </div>
              
              <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider">Turnos Eliminados</span>
                <span className="text-3xl font-black text-slate-700 dark:text-slate-300 mt-2">{purgeResult.turnosCount}</span>
                <span className="text-[9px] font-semibold text-secondary-custom opacity-75 mt-1">Turnos borrados</span>
              </div>

              <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-4 rounded-2xl flex flex-col justify-between col-span-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider">Periodo / Archivo Purgado</span>
                  <span className="text-xs font-black text-primary-custom truncate max-w-[200px]" title={purgeResult.modo === 'carga' ? purgeResult.archivo : (purgeResult.modo === 'mes' ? purgeResult.mes : purgeResult.dia)}>
                    {purgeResult.modo === 'carga' ? purgeResult.archivo : (purgeResult.modo === 'mes' ? purgeResult.mes : purgeResult.dia)}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setPurgeResult(null)}
              className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              Cerrar y Volver
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE ERROR DE PURGA CENTRADO */}
      {purgeError && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-card-custom border border-card-custom rounded-3xl shadow-2xl max-w-md w-full p-6 text-center space-y-6 animate-bounce-in theme-transition">
            
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-red-600 dark:text-red-400">Error en la Operación</h3>
              <p className="text-xs text-secondary-custom font-semibold">No se pudieron eliminar los registros seleccionados.</p>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl text-left text-xs text-red-800 dark:text-red-300 font-medium leading-relaxed">
              {purgeError}
            </div>

            <button 
              onClick={() => setPurgeError(null)}
              className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-black py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE ÉXITO DE CARGA MANUAL CENTRADO */}
      {manualSuccessResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-card-custom border border-card-custom rounded-3xl shadow-2xl max-w-md w-full p-6 text-center space-y-6 animate-bounce-in theme-transition">
            
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-primary-custom">¡Turno Guardado con Éxito!</h3>
              <p className="text-xs text-secondary-custom font-semibold">El registro manual ha sido creado correctamente en la nube.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-left">
              <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider">Total Pacientes</span>
                <span className="text-3xl font-black text-blue-500 mt-2">{manualSuccessResult.totalPacientes}</span>
              </div>
              
              <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider">Altas Admin</span>
                <span className="text-3xl font-black text-rose-500 mt-2">{manualSuccessResult.altasAdmin}</span>
              </div>

              <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-4 rounded-2xl flex flex-col justify-between col-span-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider">Fecha y Horario</span>
                  <span className="text-xs font-black text-primary-custom">
                    {manualSuccessResult.fechaInicio} ({manualSuccessResult.horario.split('(')[0].trim()})
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleManualSuccessClose}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              Ir al Resumen General <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {/* MODAL DE CONFIRMACIÓN DE PURGA PERSONALIZADO */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-card-custom border border-red-500/35 dark:border-red-500/25 rounded-3xl shadow-2xl max-w-md w-full p-6 text-center space-y-6 animate-bounce-in theme-transition">
            
            {/* Círculo de Alerta */}
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-red-600 dark:text-red-400">¿Estás absolutamente seguro?</h3>
              <p className="text-xs text-secondary-custom font-semibold">
                Esta acción es irreversible y eliminará permanentemente todos los registros del periodo seleccionado.
              </p>
            </div>

            {/* Resumen de eliminación */}
            <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-4 rounded-2xl text-left space-y-3 text-xs font-semibold text-secondary-custom">
              <div className="flex justify-between">
                <span>Periodo / Archivo a purgar:</span>
                <span className="text-primary-custom font-black truncate max-w-[200px]" title={limpiezaModo === 'carga' ? selectedCarga?.archivo : (limpiezaModo === 'mes' ? limpiezaMes : limpiezaDia)}>
                  {limpiezaModo === 'carga' ? selectedCarga?.archivo : (limpiezaModo === 'mes' ? limpiezaMes : limpiezaDia)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pacientes a eliminar:</span>
                <span className="text-rose-500 font-black">{registrosALimpiar.pacientes.length} registros</span>
              </div>
              <div className="flex justify-between">
                <span>Turnos a eliminar:</span>
                <span className="text-slate-700 dark:text-slate-300 font-black">{registrosALimpiar.turnos.length} turnos</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowPurgeConfirm(false)}
                className="flex-1 bg-black/5 dark:bg-white/5 border border-card-custom hover:bg-black/10 dark:hover:bg-white/10 text-secondary-custom font-black py-3.5 rounded-2xl transition-all shadow-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  setShowPurgeConfirm(false);
                  purgarDatos();
                }}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black py-3.5 rounded-2xl transition-all shadow-md"
              >
                Sí, Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
