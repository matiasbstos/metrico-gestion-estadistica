import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle, X, Loader2, AlertTriangle, ArrowRight, Zap, Check } from 'lucide-react';
import { writeBatch, collection, doc, serverTimestamp } from 'firebase/firestore';
import { playSuccessChime, playErrorChime } from '../../utils/audioNotifications';

const runWithTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))
  ]);
};

export default function ModalCargaRapidaDatos({
  isOpen,
  onClose,
  user,
  db,
  pacientesDB = [],
  turnosDB = [],
  showNotif,
  onSuccessRedirect
}) {
  const [file, setFile] = useState(null);
  const [pendingUpload, setPendingUpload] = useState(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadRecordCount, setUploadRecordCount] = useState(0);
  const [uploadEta, setUploadEta] = useState(null);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadResultSummary, setUploadResultSummary] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleResetModal = () => {
    setFile(null);
    setPendingUpload(null);
    setIsReadingFile(false);
    setIsUploading(false);
    setUploadSuccess(false);
    setUploadProgress(0);
    setUploadRecordCount(0);
    setUploadEta(null);
    setUploadError(null);
    setUploadResultSummary(null);
  };

  const handleClose = () => {
    handleResetModal();
    onClose();
  };

  // PROCESAMIENTO DE ARCHIVO EXCEL/CSV CON DEDUPLICACIÓN Y ESTRUCTURA SSOT
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsReadingFile(true);
    setUploadError(null);

    setTimeout(() => {
      const processArray = (rows) => {
        try {
          if (!rows || rows.length <= 1) {
            setIsReadingFile(false);
            setUploadError("El archivo no contiene filas de datos válidas.");
            return;
          }

          const header = rows[0].map(c => String(c || '').trim().toLowerCase());
          
          const idxFecha = header.findIndex(h => h.includes('fecha') || h.includes('atencion') || h.includes('ingreso') || h.includes('admision'));
          const idxHora = header.findIndex(h => h.includes('hora') || h.includes('time'));
          const idxSexo = header.findIndex(h => h.includes('sexo') || h.includes('genero') || h.includes('gender'));
          const idxEdad = header.findIndex(h => h.includes('edad') || h.includes('age'));
          const idxPrev = header.findIndex(h => h.includes('prevision') || h.includes('previsió') || h.includes('tramo'));
          const idxDiag = header.findIndex(h => h.includes('diagnostico') || h.includes('diagnóstic') || h.includes('cie'));
          const idxCie10 = header.findIndex(h => h.includes('codigo') || h.includes('código') || h.includes('cie10'));

          const turnosMap = {};
          let totalPacientesCounter = 0;
          let totalDuplicadosCounter = 0;
          const parsedPacientes = [];

          // Hash de deduplicación existente en pacientesDB
          const existingHashes = new Set();
          pacientesDB.forEach(p => {
            const sexNorm = String(p.sexo || '').trim().toUpperCase();
            const edadNorm = p.edad ?? '';
            const diagNorm = String(p.diagnosticoPrincipal || '').trim().toUpperCase();
            if (p.tAdmision) {
              existingHashes.add(`${p.tAdmision}_${edadNorm}_${sexNorm}_${diagNorm}`);
            }
          });

          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0 || !row.some(cell => String(cell || '').trim() !== '')) continue;

            const rawFecha = idxFecha >= 0 ? String(row[idxFecha] || '').trim() : '';
            const rawHora = idxHora >= 0 ? String(row[idxHora] || '').trim() : '12:00';
            const rawSexo = idxSexo >= 0 ? String(row[idxSexo] || '').trim() : 'N/E';
            const rawEdad = idxEdad >= 0 ? parseInt(row[idxEdad], 10) : 0;
            const rawPrev = idxPrev >= 0 ? String(row[idxPrev] || '').trim() : 'FONASA A';
            const rawDiag = idxDiag >= 0 ? String(row[idxDiag] || '').trim() : 'Diagnóstico General';
            const rawCie10 = idxCie10 >= 0 ? String(row[idxCie10] || '').trim() : 'Z00';

            // Formatear Fecha Turno
            let fechaIso = new Date().toISOString().substring(0, 10);
            if (rawFecha) {
              if (rawFecha.includes('/')) {
                const parts = rawFecha.split('/');
                if (parts.length === 3) {
                  const day = parts[0].padStart(2, '0');
                  const month = parts[1].padStart(2, '0');
                  const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
                  fechaIso = `${year}-${month}-${day}`;
                }
              } else if (rawFecha.includes('-')) {
                fechaIso = rawFecha.substring(0, 10);
              }
            }

            const timeMs = new Date(`${fechaIso}T${rawHora.length === 5 ? rawHora : '12:00'}:00`).getTime() || Date.now();
            const sexNorm = rawSexo.toUpperCase();
            const diagNorm = rawDiag.toUpperCase();

            const dupHash = `${timeMs}_${isNaN(rawEdad) ? 0 : rawEdad}_${sexNorm}_${diagNorm}`;
            if (existingHashes.has(dupHash)) {
              totalDuplicadosCounter++;
              continue; // Excluir duplicados
            }
            existingHashes.add(dupHash);

            const pObj = {
              fechaTurno: fechaIso,
              tAdmision: timeMs,
              tCat1: timeMs + (15 * 60000),
              tAlta: timeMs + (45 * 60000),
              sexo: rawSexo,
              edad: isNaN(rawEdad) ? 30 : rawEdad,
              prevision: rawPrev,
              diagnosticoPrincipal: rawDiag,
              codigo_diagnostico_cie10: rawCie10,
              diagnostico_cie10: rawDiag
            };

            parsedPacientes.push(pObj);
            totalPacientesCounter++;

            // Agrupar en Turnos
            if (!turnosMap[fechaIso]) {
              turnosMap[fechaIso] = {
                fechaInicio: fechaIso,
                horario: '17:00 a 08:00 hrs (Largo)',
                equipoTurno: 'Turno Masivo Carga Rápida',
                totalPacientes: 0,
                altasAdmin: 0,
                c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0
              };
            }
            turnosMap[fechaIso].totalPacientes++;
            turnosMap[fechaIso].c3++;
          }

          const turnosArray = Object.values(turnosMap);

          if (parsedPacientes.length === 0) {
            setIsReadingFile(false);
            setUploadError(`El archivo no aportó registros nuevos. (${totalDuplicadosCounter} duplicados omitidos).`);
            return;
          }

          setPendingUpload({
            fileName: selectedFile.name,
            totalPacientes: parsedPacientes.length,
            totalDuplicados: totalDuplicadosCounter,
            filasOriginales: rows.length - 1,
            turnos: turnosArray,
            pacientes: parsedPacientes
          });

          setIsReadingFile(false);
        } catch (err) {
          console.error("Error al procesar archivo en Carga Rápida:", err);
          setIsReadingFile(false);
          setUploadError("Fallo en la lectura del formato del archivo: " + err.message);
        }
      };

      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        if (!window.XLSX) {
          setIsReadingFile(false);
          setUploadError("Cargando librerías Excel... reintenta en 1 segundo.");
          return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
          const wb = window.XLSX.read(evt.target.result, { type: 'binary' });
          const rows = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, dateNF: 'dd/mm/yyyy' });
          processArray(rows);
        };
        reader.readAsBinaryString(selectedFile);
      } else {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const text = evt.target.result;
          const lines = text.split('\n').filter(l => l.trim() !== '');
          if (lines.length === 0) {
            setIsReadingFile(false);
            setUploadError("El archivo CSV se encuentra vacío.");
            return;
          }
          const delimiter = lines[0].includes(';') ? ';' : ',';
          const rows = lines.map(l => l.split(delimiter).map(c => c.replace(/"/g, '').trim()));
          processArray(rows);
        };
        reader.readAsText(selectedFile);
      }
    }, 100);

    e.target.value = null;
  };

  // EJECUCIÓN DE CARGA POR LOTES A FIRESTORE
  const executeMassUpload = async () => {
    if (!pendingUpload || !user || !db) return;

    setIsUploading(true);
    setUploadError(null);
    const startTime = Date.now();

    try {
      const batchList = [];
      let currentBatch = writeBatch(db);
      let opCounter = 0;
      let successCount = 0;

      const cargaId = `CARGA-RAPIDA-${Date.now()}`;
      const cleanFileName = (pendingUpload.fileName || 'LOTE').replace(/\s+/g, '_').toUpperCase();

      for (const turno of pendingUpload.turnos) {
        const loteId = `${cleanFileName}-${turno.fechaInicio}-${Date.now()}`;
        const turnoDoc = {
          loteId,
          tipo: 'Carga Rápida Directa',
          fechaInicio: turno.fechaInicio,
          fechaFin: turno.fechaInicio,
          horario: turno.horario,
          equipoTurno: turno.equipoTurno,
          totalPacientes: Number(turno.totalPacientes),
          altasAdmin: 0,
          pacientesPorHora: Number((turno.totalPacientes / 15).toFixed(2)),
          c1: turno.c1, c2: turno.c2, c3: turno.c3, c3_z518: 0, c4: turno.c4, c5: turno.c5,
          createdAt: serverTimestamp(),
          userEmail: user.email || 'usuario@cormumel.cl',
          cargaId
        };

        const tRef = doc(collection(db, 'turnos'));
        currentBatch.set(tRef, turnoDoc);
        opCounter++;

        if (opCounter >= 450) {
          batchList.push(currentBatch);
          currentBatch = writeBatch(db);
          opCounter = 0;
        }
      }

      for (const p of pendingUpload.pacientes) {
        const pDoc = {
          tAdmision: p.tAdmision,
          tCat1: p.tCat1,
          tAlta: p.tAlta,
          fechaTurno: p.fechaTurno,
          sexo: p.sexo,
          edad: p.edad,
          prevision: p.prevision,
          diagnosticoPrincipal: p.diagnosticoPrincipal,
          codigo_diagnostico_cie10: p.codigo_diagnostico_cie10,
          diagnostico_cie10: p.diagnostico_cie10,
          loteId: `${cleanFileName}-${p.fechaTurno}`,
          cargaId,
          createdAt: serverTimestamp()
        };

        const pRef = doc(collection(db, 'pacientes_urgencia'));
        currentBatch.set(pRef, pDoc);
        opCounter++;
        successCount++;

        if (opCounter >= 450) {
          batchList.push(currentBatch);
          currentBatch = writeBatch(db);
          opCounter = 0;
        }
      }

      if (opCounter > 0) {
        batchList.push(currentBatch);
      }

      setTotalBatches(batchList.length);

      for (let i = 0; i < batchList.length; i++) {
        setCurrentBatchIndex(i + 1);
        await runWithTimeout(batchList[i].commit(), 30000);

        const batchProgress = i + 1;
        const pct = (batchProgress / batchList.length) * 100;
        setUploadProgress(pct);

        const elapsedTime = Date.now() - startTime;
        const avgTimePerBatch = elapsedTime / batchProgress;
        const remainingBatches = batchList.length - batchProgress;
        setUploadEta(Math.round((avgTimePerBatch * remainingBatches) / 1000));

        setUploadRecordCount(Math.min(successCount, Math.round((batchProgress / batchList.length) * successCount)));
      }

      setUploadResultSummary({
        fileName: pendingUpload.fileName,
        successCount,
        totalDuplicados: pendingUpload.totalDuplicados
      });

      setUploadSuccess(true);
      playSuccessChime();

      if (showNotif) {
        showNotif(`¡Carga Rápida Exitosa! Se registraron ${successCount} pacientes de ${pendingUpload.fileName}.`, "success");
      }

      // REDIRECCIÓN AUTOMÁTICA A GESTIÓN DE DATOS TRAS 1.2 SEGUNDOS
      setTimeout(() => {
        handleClose();
        if (onSuccessRedirect) {
          onSuccessRedirect('data');
        }
      }, 1200);

    } catch (err) {
      console.error("Error en Carga Rápida a Firebase:", err);
      playErrorChime();
      setIsUploading(false);
      setUploadError("Fallo en la persistencia de datos: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in print:hidden">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl space-y-6 text-slate-100 relative">
        
        {/* BOTÓN CERRAR */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* CABECERA DE LA MODAL */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-white">Carga Rápida de Datos CSV/Excel</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-widest">
                DIRECTA GLOBAL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Sube tu lote masivo desde cualquier vista. El sistema te redireccionará automáticamente a Gestión de Datos.
            </p>
          </div>
        </div>

        {/* ERRORES */}
        {uploadError && (
          <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-bold flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* PANTALLA 1: DROPZONE Y SELECCIÓN DE ARCHIVO */}
        {!pendingUpload && !isUploading && !uploadSuccess && (
          <div className="space-y-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-3xl p-8 text-center bg-emerald-500/5 hover:bg-emerald-500/10 transition-all cursor-pointer group space-y-3"
            >
              <FileSpreadsheet className="w-12 h-12 text-emerald-400 mx-auto group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-sm font-black text-white">Haz clic aquí o arrastra tu archivo Excel / CSV</p>
                <p className="text-xs text-slate-400 mt-1 font-semibold">Formatos admitidos: .xlsx, .xls, .csv (Formatos Rayen / REM / Registro SAR)</p>
              </div>
              <span className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all">
                Seleccionar Archivo
              </span>
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".xlsx,.xls,.csv" 
              onChange={handleFileChange} 
              className="hidden" 
            />

            {isReadingFile && (
              <div className="flex items-center justify-center gap-3 p-4 bg-white/5 rounded-2xl text-xs font-bold text-emerald-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analizando y verificando desduplicación SSOT del archivo...</span>
              </div>
            )}
          </div>
        )}

        {/* PANTALLA 2: PREVISTAZO DE RESUMEN Y BOTÓN DE CONFIRMACIÓN */}
        {pendingUpload && !isUploading && !uploadSuccess && (
          <div className="space-y-5 bg-slate-800/60 p-5 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">Lote Listo para Procesar</span>
              <span className="text-xs font-mono font-bold text-slate-300">{pendingUpload.fileName}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Registros Válidos</span>
                <span className="text-lg font-black text-emerald-400 font-mono">{pendingUpload.totalPacientes.toLocaleString('es-CL')}</span>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Duplicados Omitidos</span>
                <span className="text-lg font-black text-amber-400 font-mono">{pendingUpload.totalDuplicados.toLocaleString('es-CL')}</span>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Turnos Detectados</span>
                <span className="text-lg font-black text-indigo-400 font-mono">{pendingUpload.turnos.length}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleResetModal}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cambiar Archivo
              </button>
              <button
                onClick={executeMassUpload}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Zap className="w-4 h-4" />
                <span>Confirmar y Cargar Lote</span>
              </button>
            </div>
          </div>
        )}

        {/* PANTALLA 3: PROGRESO DE CARGA Y BARRA DE FIRESTORE */}
        {isUploading && (
          <div className="space-y-4 p-6 bg-slate-800/80 rounded-2xl border border-emerald-500/30 text-center">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
            <div>
              <h3 className="text-sm font-black text-white">Procesando y Guardando Lote en Firebase...</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Lote {currentBatchIndex} de {totalBatches} ({Math.round(uploadProgress)}%) — {uploadRecordCount.toLocaleString('es-CL')} registros persistidos
              </p>
            </div>

            {/* Barra de progreso */}
            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-white/10">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>

            {uploadEta !== null && (
              <span className="text-[11px] font-mono text-emerald-300 font-bold block">
                Tiempo estimado restante: {uploadEta} segundos
              </span>
            )}
          </div>
        )}

        {/* PANTALLA 4: ÉXITO Y REDIRECCIÓN */}
        {uploadSuccess && (
          <div className="space-y-4 p-6 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-center animate-fade-in">
            <div className="w-12 h-12 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">¡Carga Masiva Exitosa!</h3>
              <p className="text-xs text-emerald-300 font-semibold mt-1">
                Se registraron {uploadResultSummary?.successCount.toLocaleString('es-CL')} atenciones en la base máster SSOT.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-slate-400 pt-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Redireccionando a Gestión de Datos...</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
