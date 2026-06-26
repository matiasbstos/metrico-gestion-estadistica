import React, { useState } from 'react';
import { Database, UploadCloud, FileSpreadsheet, CheckCircle, Save, X, Calendar } from 'lucide-react';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';

export default function GestionDatos({ 
  user, db, appId, loading,
  setLoading, setSyncStatus, showNotif, 
  setActiveTab, setFiltroFechaInicio, setFiltroFechaFin, centroActivo,
  pautasTurnosHook
}) {
  const [pendingUpload, setPendingUpload] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [manualForm, setManualForm] = useState({
    fechaInicio: '', fechaFin: '', horario: '17:00 - 08:00 (Semana Largo)', equipoTurno: 'Sin Asignar',
    c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, altasAdmin: 0, totalPacientes: 0
  });

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

  const recomputeTurno = (uploadObj, newHorario, newFechaInicio) => {
    if (!uploadObj || !uploadObj.todosLosRegistros) return uploadObj;
    
    const [y, m, d] = (newFechaInicio || uploadObj.fechaInicio).split('-');
    const baseTime = new Date(y, m - 1, d).getTime();
    
    let startMs, endMs;
    if (newHorario.includes("17:00")) {
      startMs = baseTime + 17 * 3600 * 1000;
      endMs = baseTime + 32 * 3600 * 1000;
    } else if (newHorario.includes("08:00 - 20:00")) {
      startMs = baseTime + 8 * 3600 * 1000;
      endMs = baseTime + 20 * 3600 * 1000;
    } else if (newHorario.includes("20:00 - 08:00")) {
      startMs = baseTime + 20 * 3600 * 1000;
      endMs = baseTime + 32 * 3600 * 1000;
    } else {
      startMs = 0; endMs = Infinity;
    }

    let canceladasCalc = 0;
    let catCounts = { c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0, sincat: 0 };
    
    const filtered = uploadObj.todosLosRegistros.filter(p => {
      const t = p.tAdmision;
      return t >= startMs && t < endMs;
    });

    filtered.forEach(p => {
      if (p.estado === 'Cancelada') canceladasCalc++;
      if (catCounts[p.categoria] !== undefined) catCounts[p.categoria]++;
    });

    return {
      ...uploadObj,
      horario: newHorario,
      fechaInicio: newFechaInicio,
      fechaFin: newFechaInicio,
      registros: filtered,
      totalPacientes: filtered.length,
      altasAdmin: canceladasCalc,
      ...catCounts
    };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    setSyncStatus('syncing');

    const processArray = (rows) => {
      if (rows.length < 2) return showNotif("El archivo parece vacío o muy corto.", "error");

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

      let iFAdm = getIdx(['FECHA ADMISION', 'FECHA ADM']); let iHAdm = getIdx(['HORA ADMISION', 'HORA ADM']);
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
      let iPrev = getIdx(['PREVISION', 'PREVISIÓN']);
      let iComu = getIdx(['COMUNA']);
      let iRegi = getIdx(['REGIÓN', 'REGION']);
      let iNaci = getIdx(['NACIONALIDAD', 'ORIGEN', 'PAIS', 'PAÍS']);
      let iCentro = getIdx(['ESTABLECIMIENTO', 'CENTRO']);

      if(iFAdm === -1) iFAdm = 1; if(iHAdm === -1) iHAdm = 2;
      
      let parsedRecords = [];
      let canceladasCalc = 0;
      let catCounts = { c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0, sincat: 0 };

      for (let i = headerRowIdx + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 5) continue;

        const safeGet = (idx) => (idx !== -1 && row[idx] !== undefined && row[idx] !== null) ? String(row[idx]).trim() : '';
        const rowStrLower = row.map(c => String(c || '').toLowerCase()).join(' ');

        let estado = safeGet(iEst);
        if (estado.toLowerCase().includes('cancelad') || rowStrLower.includes('cancelad')) {
          canceladasCalc++; estado = 'Cancelada';
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

        if(catCounts[categoria] !== undefined) catCounts[categoria]++;

        const tAdm = parseDateStr(safeGet(iFAdm), safeGet(iHAdm));
        if (!tAdm) continue; 

        const edadRaw = safeGet(iEdad);
        const edad = edadRaw && !isNaN(parseInt(edadRaw)) ? parseInt(edadRaw) : null;

        parsedRecords.push({
          tAdmision: tAdm,
          tCat1: parseDateStr(safeGet(iFCat1), safeGet(iHCat1)),
          tCatUlt: parseDateStr(safeGet(iFCatU), safeGet(iHCatU)),
          tAnamnesis: parseDateStr(safeGet(iFAna), safeGet(iHAna)),
          tAlta: parseDateStr(safeGet(iFAlt), safeGet(iHAlt)),
          estado: estado, categoria: categoria, medico: medico,
          codigoDiagnostico: codDiag, diagnosticoPrincipal: diagPrin,
          edad, sexo: safeGet(iSexo), prevision: safeGet(iPrev),
          comuna: safeGet(iComu), region: safeGet(iRegi), nacionalidad: safeGet(iNaci), establecimiento: safeGet(iCentro)
        });
      }

      if (parsedRecords.length === 0) return showNotif("No se detectaron pacientes válidos.", "error");

      const d = new Date(parsedRecords[0].tAdmision);
      const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const dy = String(d.getDate()).padStart(2, '0');
      const defaultDate = !isNaN(d.getTime()) ? `${y}-${m}-${dy}` : new Date().toISOString().split('T')[0];

      const initialUpload = {
        fileName,
        todosLosRegistros: parsedRecords,
        fechaInicio: defaultDate, fechaFin: defaultDate,
        horario: '17:00 - 08:00 (Semana Largo)', equipoTurno: 'Sin Asignar',
        registros: parsedRecords, totalPacientes: parsedRecords.length,
        altasAdmin: canceladasCalc, ...catCounts
      };
      
      if (pautasTurnosHook) {
        const equipo = pautasTurnosHook.getEquipoParaTurno(initialUpload.fechaInicio, initialUpload.horario);
        if (equipo) initialUpload.equipoTurno = equipo;
      }

      setPendingUpload(recomputeTurno(initialUpload, initialUpload.horario, initialUpload.fechaInicio));
      setSyncStatus('synced');
    };

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      if (!window.XLSX) return showNotif("Cargando librerías Excel... reintenta en 1s", "error");
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
          if(lines.length === 0) return showNotif("Archivo vacío", "error");
          const delimiter = lines[0].includes(';') ? ';' : ',';
          const rows = lines.map(l => l.split(delimiter).map(c => c.replace(/"/g, '').trim()));
          processArray(rows);
      };
      reader.readAsText(file);
    }
    e.target.value = null; 
  };

  const confirmMassUpload = async () => {
    if (!pendingUpload || !user || !db) return;
    setIsUploading(true); setSyncStatus('syncing');

    const cleanFileName = (pendingUpload.fileName || 'LOTE').replace(/\s+/g, '_').toUpperCase();
    const loteId = `${cleanFileName}-${Date.now()}`;
    const horasTurno = String(pendingUpload.horario).includes("17:00") ? 15 : 12;
    const ratio = pendingUpload.totalPacientes / horasTurno;

    const turnoDoc = {
      loteId, tipo: 'Masiva', fechaInicio: pendingUpload.fechaInicio || '', fechaFin: pendingUpload.fechaFin || '',
      horario: pendingUpload.horario, equipoTurno: pendingUpload.equipoTurno, totalPacientes: Number(pendingUpload.totalPacientes),
      altasAdmin: Number(pendingUpload.altasAdmin), pacientesPorHora: ratio,
      c1: pendingUpload.c1 || 0, c2: pendingUpload.c2 || 0, c3: pendingUpload.c3 || 0, 
      c3_z518: pendingUpload.c3_z518 || 0, c4: pendingUpload.c4 || 0, c5: pendingUpload.c5 || 0, 
      creadoEl: Date.now()
    };

    try {
      const batchList = [];
      let currentBatch = writeBatch(db);
      let opCounter = 0;

      const turnoRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'turnos'));
      currentBatch.set(turnoRef, turnoDoc);
      opCounter++;
      
      const pacRef = collection(db, 'artifacts', appId, 'public', 'data', 'pacientes_urgencia');
      let successCount = 0;
      
      for (const p of pendingUpload.registros) {
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
      
      if (opCounter > 0) batchList.push(currentBatch);
      
      const auditLog = {
        fecha: Date.now(),
        accion: 'Carga Masiva',
        detalles: `Archivo ${pendingUpload.fileName} importado (${successCount} pacientes).`,
        centro: centroActivo || 'Desconocido',
        usuario: user?.email || 'Anónimo'
      };
      const lastBatch = writeBatch(db);
      lastBatch.set(doc(collection(db, 'artifacts', appId, 'public', 'data', 'audit_logs')), auditLog);
      batchList.push(lastBatch);

      await Promise.all(batchList.map(b => b.commit()));
      
      const uploadedInicio = pendingUpload.fechaInicio;
      const uploadedFin = pendingUpload.fechaFin;
      
      setUploadSuccess(true);
      setTimeout(() => {
          setUploadSuccess(false);
          setPendingUpload(null);
          if (uploadedInicio && uploadedFin) { setFiltroFechaInicio(uploadedInicio); setFiltroFechaFin(uploadedFin); }
          showNotif(`Carga completada: Se importaron exitosamente ${successCount} pacientes.`, 'success');
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

      {/* MODAL ARCHIVO PROCESADO */}
      {pendingUpload && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-bounce-in border border-slate-100">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                <h3 className="text-xl font-bold text-slate-800">Archivo Procesado</h3>
              </div>
              <p className="text-sm text-slate-500 mb-6">Verifica los datos detectados automáticamente antes de subir a la nube.</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Fecha Inicio</label>
                    <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none" value={pendingUpload.fechaInicio} onChange={e => {
                      const newFecha = e.target.value;
                      let updated = recomputeTurno(pendingUpload, pendingUpload.horario, newFecha);
                      if (pautasTurnosHook) {
                        const equipo = pautasTurnosHook.getEquipoParaTurno(newFecha, updated.horario);
                        if (equipo) updated.equipoTurno = equipo;
                      }
                      setPendingUpload(updated);
                    }} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Fecha Fin</label>
                    <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none" value={pendingUpload.fechaFin} onChange={e => setPendingUpload({...pendingUpload, fechaFin: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Horario del Turno</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none" value={pendingUpload.horario} onChange={e => {
                      const newHorario = e.target.value;
                      let updated = recomputeTurno(pendingUpload, newHorario, pendingUpload.fechaInicio);
                      if (pautasTurnosHook) {
                        const equipo = pautasTurnosHook.getEquipoParaTurno(updated.fechaInicio, newHorario);
                        if (equipo) updated.equipoTurno = equipo;
                      }
                      setPendingUpload(updated);
                    }}>
                      <option value="17:00 - 08:00 (Semana Largo)">17:00 - 08:00 (Semana Largo)</option>
                      <option value="08:00 - 20:00 (Fin de semana Día)">08:00 - 20:00 (Fin de semana Día)</option>
                      <option value="20:00 - 08:00 (Fin de semana Noche)">20:00 - 08:00 (Fin de semana Noche)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Equipo de Turno</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none" value={pendingUpload.equipoTurno} onChange={e => setPendingUpload({...pendingUpload, equipoTurno: e.target.value})}>
                      <option value="Turno 1">Turno 1</option>
                      <option value="Turno 2">Turno 2</option>
                      <option value="Turno 3">Turno 3</option>
                      <option value="Turno 4">Turno 4</option>
                      <option value="Sin Asignar">Sin Asignar</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Pacientes Detectados</label>
                    <span className="text-xl font-bold text-blue-600">{pendingUpload.totalPacientes}</span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Altas Admin (Canceladas)</label>
                    <span className="text-xl font-bold text-red-500">{pendingUpload.altasAdmin}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">DISTRIBUCIÓN DE TRIAJE (DETECTADA)</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1,2,3,4,5].map(c => (
                      <div key={c} className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-center">
                        <span className={`block text-[10px] font-bold mb-1 ${c===1?'text-red-500':c===2?'text-orange-500':c===3?'text-yellow-500':c===4?'text-emerald-500':'text-blue-500'}`}>C{c}</span>
                        <span className="font-bold text-slate-700 text-sm">{pendingUpload[`c${c}`]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-100">
              <button onClick={() => setPendingUpload(null)} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-200 transition">Cancelar</button>
              <button onClick={confirmMassUpload} disabled={isUploading || uploadSuccess} className="px-6 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 shadow-md transition flex items-center gap-2">
                {isUploading ? (
                  <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Guardando...</>
                ) : uploadSuccess ? (
                  <><CheckCircle className="w-4 h-4"/> ¡Éxito!</>
                ) : "Guardar Turno"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
