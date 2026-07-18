import React, { useState } from 'react';
import { Database, UploadCloud, FileSpreadsheet, CheckCircle, Save, X, Calendar, AlertTriangle, Loader2, BookOpen } from 'lucide-react';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';

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
  const [activeGestionTab, setActiveGestionTab] = useState('carga');
  const [limpiezaModo, setLimpiezaModo] = useState('mes');
  const [limpiezaMes, setLimpiezaMes] = useState(new Date().toISOString().substring(0, 7));
  const [limpiezaDia, setLimpiezaDia] = useState(new Date().toISOString().substring(0, 10));
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
        const pDate = new Date(p.tAdmision).toISOString().split('T')[0];
        return pDate.startsWith(`${year}-${month}`);
      });
    } else {
      turnosTarget = turnosDB.filter(t => t.fechaInicio === limpiezaDia);
      pacientesTarget = pacientesDB.filter(p => {
        if (!p.tAdmision) return false;
        const pDate = new Date(p.tAdmision).toISOString().split('T')[0];
        return pDate === limpiezaDia;
      });
    }

    return { turnos: turnosTarget, pacientes: pacientesTarget };
  }, [limpiezaModo, limpiezaMes, limpiezaDia, turnosDB, pacientesDB]);

  const purgarDatos = async () => {
    if (registrosALimpiar.turnos.length === 0 && registrosALimpiar.pacientes.length === 0) return;
    if (!window.confirm("ATENCIÓN: Se eliminarán todos los datos seleccionados de forma permanente. ¿Estás absolutamente seguro de continuar?")) return;
    
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

      if (opCounter > 0) batchList.push(currentBatch);

      const auditLog = {
        fecha: Date.now(),
        accion: 'Purgado',
        detalles: `Purgado masivo (${limpiezaModo}: ${limpiezaModo==='mes'?limpiezaMes:limpiezaDia}): ${registrosALimpiar.turnos.length} turnos, ${registrosALimpiar.pacientes.length} pacientes.`,
        centro: centroActivo || 'Desconocido',
        usuario: user?.email || 'Anónimo'
      };
      
      const lastBatch = writeBatch(db);
      lastBatch.set(doc(collection(db, 'artifacts', appId, 'public', 'data', 'audit_logs')), auditLog);
      batchList.push(lastBatch);

      await Promise.all(batchList.map(b => b.commit()));
      showNotif(`Datos eliminados correctamente (${registrosALimpiar.pacientes.length} pacientes borrados).`, "success");
    } catch(e) {
      showNotif("Error al purgar los datos", "error");
    }
    setIsUploading(false); setSyncStatus('synced');
  };

  const handleManualFormChange = (field, value) => {
    setManualForm(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-completar equipo
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

    // Regla 1: Fin de semana o Festivo (Continuo)
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
    // Regla 2: Día de semana
    else {
      if (hours < 15) {
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
        let iCodDiag = getIdx(['CÓDIGO DE DIAGNÓSTICO', 'CODIGO DE DIAGNOSTICO', 'CODIGO DIAGNOSTICO', 'COD DIAG']);
        let iDiagPrin = getIdx(['DIAGNOSTICO PRINCIPAL', 'DIAGNÓSTICO PRINCIPAL', 'DIAGNOSTICO']);
        let iMed = getIdx(['NOMBRE PROFESIONAL REGISTRA ANAMNESIS', 'NOMBRE PROFESIONAL', 'MEDICO', 'PROFESIONAL', 'DOCTOR']);
        
        let iEdad = getIdx(['EDAD']);
        let iSexo = getIdx(['SEXO']);
        if (iEdad === -1) incidenciasDetectadas.push("Falta columna EDAD. No se podrá analizar demografía de edades.");
        if (iSexo === -1) incidenciasDetectadas.push("Falta columna SEXO. No se podrá analizar demografía por género.");
        
        let iPrev = getIdx(['PREVISION', 'PREVISIÓN']);
        let iComu = getIdx(['COMUNA']);
        let iRegi = getIdx(['REGIÓN', 'REGION']);
        let iNaci = getIdx(['NACIONALIDAD', 'ORIGEN', 'PAIS', 'PAÍS']);
        let iCentro = getIdx(['ESTABLECIMIENTO', 'CENTRO']);

        if(iFAdm === -1) iFAdm = 1; if(iHAdm === -1) iHAdm = 2;

        const existingHashes = new Set();
        if (pacientesDB) {
          pacientesDB.forEach(p => {
            if (p.tAdmision) existingHashes.add(`${p.tAdmision}-${p.edad}-${p.sexo}`);
          });
        }

        let parsedRecords = [];
        let duplicados = 0;

        for (let i = headerRowIdx + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 5) continue;

          const safeGet = (idx) => (idx !== -1 && row[idx] !== undefined && row[idx] !== null) ? String(row[idx]).trim() : '';
          
          const tAdm = parseDateStr(safeGet(iFAdm), safeGet(iHAdm));
          if (!tAdm) continue; 

          const edadRaw = safeGet(iEdad);
          const edad = edadRaw && !isNaN(parseInt(edadRaw)) ? parseInt(edadRaw) : null;
          const sexoStr = safeGet(iSexo);

          const hash = `${tAdm}-${edad}-${sexoStr}`;
          if (existingHashes.has(hash)) {
            duplicados++;
            continue;
          }

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
          
          if (categoria === 'c3' && (codDiag.toUpperCase().includes('Z51.8') || diagPrin.toUpperCase().includes('Z51.8'))) {
            categoria = 'c3_z518';
          }

          let medico = safeGet(iMed) || 'No Registrado';

          parsedRecords.push({
            tAdmision: tAdm,
            tCat1: parseDateStr(safeGet(iFCat1), safeGet(iHCat1)),
            tCatUlt: parseDateStr(safeGet(iFCatU), safeGet(iHCatU)),
            tAnamnesis: parseDateStr(safeGet(iFAna), safeGet(iHAna)),
            tAlta: parseDateStr(safeGet(iFAlt), safeGet(iHAlt)),
            estado: estado, categoria: categoria, medico: medico,
            codigoDiagnostico: codDiag, diagnosticoPrincipal: diagPrin,
            edad, sexo: sexoStr, prevision: safeGet(iPrev),
            comuna: safeGet(iComu), region: safeGet(iRegi), nacionalidad: safeGet(iNaci), establecimiento: safeGet(iCentro)
          });
        }

        let outOfBounds = 0;
        const turnosMap = {};

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
                    c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0, sincat: 0
                };
            }
            
            const tObj = turnosMap[key];
            tObj.registros.push(p);
            tObj.totalPacientes++;
            if (p.estado === 'Cancelada') tObj.altasAdmin++;
            if (tObj[p.categoria] !== undefined) tObj[p.categoria]++;
        });

        const turnosGenerados = Object.values(turnosMap);

        if (turnosGenerados.length === 0) {
          setIsReadingFile(false);
          if (duplicados > 0) return showNotif(`Se omitieron ${duplicados} registros duplicados y no quedaron pacientes nuevos para subir.`, "warning");
          return showNotif("No se detectaron pacientes válidos dentro de los horarios de atención.", "error");
        }

        setPendingUpload({
          fileName,
          turnos: turnosGenerados,
          totalDuplicados: duplicados,
          totalOutOfBounds: outOfBounds,
          incidencias: incidenciasDetectadas,
          totalPacientes: turnosGenerados.reduce((acc, t) => acc + t.totalPacientes, 0)
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

    try {
      const batchList = [];
      let currentBatch = writeBatch(db);
      let opCounter = 0;
      let successCount = 0;
      let minDate = '9999-99-99';
      let maxDate = '0000-00-00';

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
          creadoEl: Date.now()
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
            currentBatch.set(newPacDoc, { ...p, loteId });
            opCounter++;
            successCount++;
          }
        }
      }
      
      if (opCounter > 0) batchList.push(currentBatch);
      
      const auditLog = {
        fecha: Date.now(),
        accion: 'Carga Masiva',
        detalles: `Archivo ${pendingUpload.fileName} importado (${successCount} pacientes distribuidos en ${pendingUpload.turnos.length} turnos).`,
        centro: centroActivo || 'Desconocido',
        usuario: user?.email || 'Anónimo'
      };
      
      const lastBatch = writeBatch(db);
      lastBatch.set(doc(collection(db, 'artifacts', appId, 'public', 'data', 'audit_logs')), auditLog);
      batchList.push(lastBatch);

      await Promise.all(batchList.map(b => b.commit()));
      
      setUploadSuccess(true);
      setTimeout(() => {
          setUploadSuccess(false);
          setPendingUpload(null);
          if (minDate !== '9999-99-99') {
            setFiltroFechaInicio(minDate);
            setFiltroFechaFin(maxDate);
          }
          showNotif(`Carga completada: ${successCount} pacientes organizados en ${pendingUpload.turnos.length} turnos.`, 'success');
          setActiveTab('resumen');
      }, 1500);

    } catch (err) { showNotif("Error al guardar lote en la nube.", "error"); }
    setIsUploading(false); setSyncStatus('synced');
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

      setUploadSuccess(true);
      setTimeout(() => {
          setUploadSuccess(false);
          setManualForm({ fechaInicio: '', fechaFin: '', horario: '17:00 - 08:00 (Semana Largo)', equipoTurno: 'Sin Asignar', totalPacientes: '', altasAdmin: '', c1: '', c2: '', c3: '', c4: '', c5: '' });
          if (manualForm.fechaInicio && manualForm.fechaFin) { setFiltroFechaInicio(manualForm.fechaInicio); setFiltroFechaFin(manualForm.fechaFin); }
          showNotif(`Carga manual guardada: ${manualForm.totalPacientes} pacientes totales.`, 'success');
          setActiveTab('resumen');
      }, 1500);
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
          Limpieza de Base de Datos
        </button>
      </div>

      {activeGestionTab === 'carga' && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CARGA MASIVA (EXCEL) */}
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

        {/* CARGA MANUAL */}
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
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Modo de Purgado</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="modo_purgado" checked={limpiezaModo === 'mes'} onChange={() => setLimpiezaModo('mes')} />
                <span className="text-sm font-bold text-slate-700">Por Mes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="modo_purgado" checked={limpiezaModo === 'dia'} onChange={() => setLimpiezaModo('dia')} />
                <span className="text-sm font-bold text-slate-700">Por Día</span>
              </label>
            </div>
            
            <div className="mt-4">
              {limpiezaModo === 'mes' ? (
                <input type="month" value={limpiezaMes} onChange={e => setLimpiezaMes(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-bold text-slate-700 outline-none focus:border-rose-500" />
              ) : (
                <input type="date" value={limpiezaDia} onChange={e => setLimpiezaDia(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-bold text-slate-700 outline-none focus:border-rose-500" />
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
          onClick={purgarDatos} 
          disabled={isUploading || (registrosALimpiar.turnos.length === 0 && registrosALimpiar.pacientes.length === 0)}
          className="mt-6 w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          {isUploading ? <Loader2 className="animate-spin w-5 h-5" /> : <X className="w-5 h-5" />}
          {isUploading ? 'Eliminando Registros...' : `Purgar ${registrosALimpiar.pacientes.length} Pacientes`}
        </button>
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
                <h4 className="text-xs font-black uppercase text-primary-custom tracking-wider">Descarga del Reporte Daily</h4>
              </div>
              <p className="text-[11px] text-secondary-custom font-medium leading-relaxed">
                Ingresa al sistema de registro institucional (HIS) y exporta el reporte diario consolidado de atenciones en formato Excel (.xlsx o .xls). Asegúrate de que el archivo contenga las marcas de tiempo completas de admisión, triaje, atención médica y alta.
              </p>
            </div>
            <span className="text-[9px] font-bold text-secondary-custom opacity-60 mt-4 block">Fuente: Registro Clínico Interno</span>
          </div>

          {/* Paso 2 */}
          <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-black bg-indigo-500 text-white shadow-sm">2</span>
                <h4 className="text-xs font-black uppercase text-primary-custom tracking-wider">Columnas Obligatorias</h4>
              </div>
              <p className="text-[11px] text-secondary-custom font-medium leading-relaxed">
                Abre el archivo descargado y conserva únicamente las siguientes columnas (elimina todas las demás filas de metadatos o comentarios):
              </p>
              <ul className="list-disc pl-4 text-[10px] text-secondary-custom font-semibold mt-2 space-y-1">
                <li><code className="text-primary-custom font-black">ID</code> / <code className="text-primary-custom font-black">NUMERO</code> (Identificador de atención)</li>
                <li><code className="text-primary-custom font-black">FECHA_INGRESO</code> (Fecha en formato dd/mm/yyyy)</li>
                <li><code className="text-primary-custom font-black">HORA_INGRESO</code> (Formato hh:mm o hh:mm:ss)</li>
                <li><code className="text-primary-custom font-black">TRIAJE</code> / <code className="text-primary-custom font-black">CATEGORIZACION</code> (C1 a C5)</li>
                <li><code className="text-primary-custom font-black">DESTINO_ALTA</code> (Médica o Administrativa)</li>
              </ul>
            </div>
            <span className="text-[9px] font-bold text-secondary-custom opacity-60 mt-4 block">Estructura de Base de Datos</span>
          </div>

          {/* Paso 3 */}
          <div className="bg-black/5 dark:bg-white/5 border border-card-custom p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-black bg-indigo-500 text-white shadow-sm">3</span>
                <h4 className="text-xs font-black uppercase text-primary-custom tracking-wider">Depuración de Duplicados</h4>
              </div>
              <p className="text-[11px] text-secondary-custom font-medium leading-relaxed">
                Utiliza la función de Excel <strong>&quot;Quitar duplicados&quot;</strong> seleccionando todas las columnas para depurar el reporte. 
                <br/><br/>
                Una vez completado el descarte de duplicados, <strong>elimina la columna del ID / NÚMERO de atención</strong> antes de subir el reporte. Esto es crítico por motivos de anonimización y protección de datos sensibles.
              </p>
            </div>
            <span className="text-[9px] font-bold text-secondary-custom opacity-60 mt-4 block">Protección de Datos Personales</span>
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-bounce-in border border-slate-100">
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
                  <span className="text-xs font-bold text-slate-500 uppercase">Pacientes Válidos</span>
                  <span className="text-3xl font-black text-blue-600">{pendingUpload.totalPacientes}</span>
                  <span className="text-xs font-bold text-slate-400 mt-1">En {pendingUpload.turnos.length} turnos</span>
                </div>
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex flex-col">
                  <span className="text-xs font-bold text-rose-500 uppercase">Duplicados Omitidos</span>
                  <span className="text-3xl font-black text-rose-600">{pendingUpload.totalDuplicados}</span>
                  <span className="text-xs font-bold text-rose-400 mt-1">Ya estaban en sistema</span>
                </div>
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
            
            <div className="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-200">
              <button onClick={() => setPendingUpload(null)} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-200 transition">Cancelar</button>
              <button onClick={confirmMassUpload} disabled={isUploading || uploadSuccess} className="px-6 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 shadow-md transition flex items-center gap-2">
                {isUploading ? (
                  <><Loader2 className="animate-spin h-4 w-4" /> Guardando Lote...</>
                ) : uploadSuccess ? (
                  <><CheckCircle className="w-4 h-4"/> ¡Éxito!</>
                ) : "Confirmar Subida"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
