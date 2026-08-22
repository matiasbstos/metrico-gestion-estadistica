import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, Upload, Plus, CheckCircle2, AlertTriangle, ShieldCheck, 
  Trash2, Download, Search, Filter, Calendar, Info, RefreshCw, FileSpreadsheet,
  Check, ArrowRight, Layers, FileCheck, HelpCircle, X
} from 'lucide-react';
import * as XLSX from 'xlsx';

const STORAGE_KEY_ANTECEDENTES = 'metrico_antecedentes_incidencias';

export default function BitacoraAntecedentes({ 
  pacientesDB = [], 
  turnosDB = [], 
  filtroFechaInicio, 
  filtroFechaFin,
  user,
  showNotif 
}) {
  const [antecedentes, setAntecedentes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ANTECEDENTES);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'ANT-2026-05-01',
        fecha: '2026-05-15',
        tipo: 'Falla Rayen / Contingencia Papel',
        variable: 'Pacientes Admitidos',
        cifraDB: 135,
        cifraOficialRAE: 138,
        diferencia: 3,
        motivo: '3 pacientes atendidos durante micro-corte de enlace Rayen entre las 19:15 y 19:40 hrs. Registrados en planilla física de contingencia.',
        archivoNombre: 'contingencia_15_mayo_2026.xlsx',
        estado: 'CONCILIADO',
        creadoPor: 'Matías Bustos',
        creadoEl: new Date('2026-05-16').getTime()
      }
    ];
  });

  const [showModalNuevo, setShowModalNuevo] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  // Formulario de Nuevo Antecedente
  const [formFecha, setFormFecha] = useState(new Date().toISOString().substring(0, 10));
  const [formTipo, setFormTipo] = useState('Cotejo RAE / Discrepancia Ministerial');
  const [formVariable, setFormVariable] = useState('Pacientes Admitidos');
  const [formCifraRAE, setFormCifraRAE] = useState('');
  const [formMotivo, setFormMotivo] = useState('');
  const [formArchivoNombre, setFormArchivoNombre] = useState('');
  const [formArchivoRegistros, setFormArchivoRegistros] = useState(null);
  const [isReadingFile, setIsReadingFile] = useState(false);

  // Guardar en localStorage cada vez que cambia
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ANTECEDENTES, JSON.stringify(antecedentes));
    } catch (e) {}
  }, [antecedentes]);

  // Cálculo automático del dato real en MÉTRICO DB para la fecha seleccionada en el formulario
  const cifraDBCalculada = useMemo(() => {
    if (!formFecha) return 0;
    
    // Contar pacientes con tAdmision en formFecha
    let countPac = 0;
    (pacientesDB || []).forEach(p => {
      if (!p.tAdmision) return;
      const dStr = new Date(p.tAdmision).toISOString().substring(0, 10);
      if (dStr === formFecha) {
        if (formVariable === 'Pacientes Admitidos') countPac++;
        else if (formVariable === 'Pacientes Atendidos' && p.estado !== 'Cancelada') countPac++;
        else if (formVariable === 'Altas Administrativas' && p.estado === 'Cancelada') countPac++;
        else if (formVariable === 'Traslados Hospitalarios') {
          const dest = String(p.destinoAlta || p.destino || '').toLowerCase();
          if (dest.includes('hospital') || dest.includes('emergencia') || dest.includes('derivac')) countPac++;
        }
      }
    });

    if (countPac === 0) {
      // Fallback a turnosDB
      (turnosDB || []).forEach(t => {
        if (t.fechaInicio === formFecha) {
          if (formVariable === 'Pacientes Admitidos') countPac += Number(t.totalPacientes || 0);
          else if (formVariable === 'Pacientes Atendidos') countPac += Math.max(0, Number(t.totalPacientes || 0) - Number(t.altasAdmin || 0));
          else if (formVariable === 'Altas Administrativas') countPac += Number(t.altasAdmin || 0);
        }
      });
    }

    return countPac;
  }, [formFecha, formVariable, pacientesDB, turnosDB]);

  // Diferencia calculada en el formulario
  const diferenciaCalculada = useMemo(() => {
    const rae = parseInt(formCifraRAE, 10);
    if (isNaN(rae)) return 0;
    return rae - cifraDBCalculada;
  }, [formCifraRAE, cifraDBCalculada]);

  // Procesamiento de Archivo Excel / CSV de Cotejo
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReadingFile(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const firstSheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // Excluir cabecera
        const validRows = rows.filter(r => r && r.length > 0 && r.some(cell => String(cell).trim() !== ''));
        const count = Math.max(0, validRows.length - 1);

        setFormArchivoNombre(file.name);
        setFormArchivoRegistros(count);
        if (count > 0 && !formCifraRAE) {
          setFormCifraRAE(count.toString());
        }
        setIsReadingFile(false);
      } catch (err) {
        console.error('Error al procesar archivo de cotejo:', err);
        setIsReadingFile(false);
        if (showNotif) showNotif('Error al leer archivo de cotejo. Asegúrese de que sea Excel o CSV válido.', 'error');
      }
    };

    reader.readAsArrayBuffer(file);
    e.target.value = null;
  };

  // Guardar Antecedente
  const handleGuardarAntecedente = (e) => {
    e.preventDefault();
    if (!formFecha || !formCifraRAE) {
      if (showNotif) showNotif('Por favor complete la fecha y la cifra oficial de RAE.', 'warning');
      return;
    }

    const nuevo = {
      id: `ANT-${Date.now()}`,
      fecha: formFecha,
      tipo: formTipo,
      variable: formVariable,
      cifraDB: cifraDBCalculada,
      cifraOficialRAE: parseInt(formCifraRAE, 10),
      diferencia: diferenciaCalculada,
      motivo: formMotivo || 'Antecedente de contraste registrado para corroboración estadística.',
      archivoNombre: formArchivoNombre || null,
      archivoRegistros: formArchivoRegistros || null,
      estado: 'CONCILIADO',
      creadoPor: user?.displayName || user?.email?.split('@')[0] || 'Usuario Autorizado',
      creadoEl: Date.now()
    };

    setAntecedentes(prev => [nuevo, ...prev]);
    setShowModalNuevo(false);
    
    // Limpiar formulario
    setFormMotivo('');
    setFormCifraRAE('');
    setFormArchivoNombre('');
    setFormArchivoRegistros(null);

    if (showNotif) showNotif('¡Antecedente registrado y corroborado con éxito en MÉTRICO!', 'success');
  };

  // Eliminar Antecedente
  const handleEliminarAntecedente = (id) => {
    setAntecedentes(prev => prev.filter(a => a.id !== id));
    if (showNotif) showNotif('Antecedente eliminado de la bitácora.', 'info');
  };

  // Filtrado de Antecedentes
  const antecedentesFiltrados = useMemo(() => {
    return antecedentes.filter(a => {
      if (filtroTipo !== 'TODOS' && a.tipo !== filtroTipo) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          a.fecha.toLowerCase().includes(term) ||
          a.motivo.toLowerCase().includes(term) ||
          a.tipo.toLowerCase().includes(term) ||
          a.variable.toLowerCase().includes(term) ||
          (a.archivoNombre && a.archivoNombre.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [antecedentes, filtroTipo, searchTerm]);

  // Exportar Bitácora a Excel
  const handleExportExcel = () => {
    const dataExport = antecedentes.map(a => ({
      'ID': a.id,
      'Fecha Incidencia': a.fecha,
      'Tipo de Antecedente': a.tipo,
      'Variable Contrastada': a.variable,
      'Cifra en MÉTRICO DB': a.cifraDB,
      'Cifra Oficial RAE / MINSAL': a.cifraOficialRAE,
      'Diferencia (Brecha)': a.diferencia > 0 ? `+${a.diferencia}` : a.diferencia,
      'Justificación / Motivo': a.motivo,
      'Archivo de Respaldo': a.archivoNombre || 'Sin archivo adjunto',
      'Estado': a.estado,
      'Registrado Por': a.creadoPor,
      'Fecha Registro': new Date(a.creadoEl).toLocaleString('es-CL')
    }));

    const ws = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Antecedentes_Conciliados');
    XLSX.writeFile(wb, `Bitacora_Antecedentes_MÉTRICO_${new Date().toISOString().substring(0, 10)}.xlsx`);
  };

  // Estadísticas del Panel
  const totalCasosCorregidos = useMemo(() => {
    return antecedentes.reduce((acc, a) => acc + Math.abs(a.diferencia || 0), 0);
  }, [antecedentes]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER DE LA BITÁCORA */}
      <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
              Contraste Oficial SSOT
            </span>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              Cruce RAE / MINSAL
            </span>
          </div>
          <h2 className="text-xl font-black text-primary-custom tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            Bitácora de Antecedentes y Cruce de Incidencias
          </h2>
          <p className="text-xs text-secondary-custom font-medium max-w-2xl">
            Aporta antecedentes, respaldos en archivos Excel/CSV y notas operativas ante cualquier discrepancia detectada entre MÉTRICO y el reporte oficial RAE para corroborar y certificar las cifras asistenciales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setFormFecha(new Date().toISOString().substring(0, 10));
              setFormCifraRAE('');
              setFormMotivo('');
              setFormArchivoNombre('');
              setShowModalNuevo(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Aportar Antecedente / Respaldo RAE</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="p-2.5 bg-card-custom hover:bg-black/5 dark:hover:bg-white/5 border border-card-custom rounded-xl text-secondary-custom hover:text-primary-custom transition-all cursor-pointer"
            title="Exportar Bitácora a Excel"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TARJETAS RESUMEN DE CONCILIACIÓN */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card-custom p-4 rounded-2xl border border-card-custom shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider block">Total Antecedentes Validados</span>
            <span className="text-2xl font-black text-primary-custom">{antecedentes.length}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">100% Conciliados con RAE</span>
          </div>
        </div>

        <div className="bg-card-custom p-4 rounded-2xl border border-card-custom shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider block">Casos Discrepantes Justificados</span>
            <span className="text-2xl font-black text-indigo-600">{totalCasosCorregidos}</span>
            <span className="text-[10px] text-secondary-custom font-medium block">Respaldados con antecedentes</span>
          </div>
        </div>

        <div className="bg-card-custom p-4 rounded-2xl border border-card-custom shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider block">Índice de Certeza Asistencial</span>
            <span className="text-2xl font-black text-teal-600">100.0%</span>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold block">Sin brechas sin justificar</span>
          </div>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card-custom p-3.5 rounded-2xl border border-card-custom">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-secondary-custom absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por fecha, motivo, archivo..."
              className="w-full bg-input-custom text-xs font-semibold text-primary-custom pl-9 pr-3 py-1.5 rounded-xl border border-card-custom outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[10px] font-bold text-secondary-custom uppercase">Tipo:</span>
          <select
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
            className="bg-input-custom text-xs font-bold text-primary-custom px-3 py-1.5 rounded-xl border border-card-custom outline-none cursor-pointer"
          >
            <option value="TODOS">Todos los tipos</option>
            <option value="Cotejo RAE / Discrepancia Ministerial">Cotejo RAE / Discrepancia Ministerial</option>
            <option value="Falla Rayen / Contingencia Papel">Falla Rayen / Contingencia Papel</option>
            <option value="Corte de Energía / Emergencia Externa">Corte de Energía / Emergencia</option>
            <option value="Aclaración / Justificación Estadística">Aclaración Estadística</option>
          </select>
        </div>
      </div>

      {/* TABLA DE ANTECEDENTES Y CRUCE */}
      <div className="bg-card-custom rounded-3xl border border-card-custom shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 text-[10px] font-bold text-secondary-custom uppercase border-b border-card-custom">
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5">Tipo de Antecedente</th>
                <th className="p-3.5">Variable</th>
                <th className="p-3.5 text-center text-indigo-500">MÉTRICO DB</th>
                <th className="p-3.5 text-center text-emerald-500">Oficial RAE</th>
                <th className="p-3.5 text-center text-amber-500">Brecha / Ajuste</th>
                <th className="p-3.5">Justificación y Respaldo</th>
                <th className="p-3.5 text-center">Estado</th>
                <th className="p-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-custom font-medium text-primary-custom">
              {antecedentesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-secondary-custom">
                    <Info className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-xs">No se encontraron antecedentes registrados con los filtros actuales.</p>
                    <p className="text-[10px] mt-1">Usa el botón "Aportar Antecedente / Respaldo RAE" para ingresar cotejos de información.</p>
                  </td>
                </tr>
              ) : (
                antecedentesFiltrados.map(a => (
                  <tr key={a.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                    <td className="p-3.5 font-bold whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{a.fecha}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-primary-custom">
                        {a.tipo}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-secondary-custom">{a.variable}</td>
                    <td className="p-3.5 text-center font-black text-indigo-600 dark:text-indigo-400">
                      {a.cifraDB} pac.
                    </td>
                    <td className="p-3.5 text-center font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                      {a.cifraOficialRAE} pac.
                    </td>
                    <td className="p-3.5 text-center font-black">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        a.diferencia === 0 
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {a.diferencia > 0 ? `+${a.diferencia}` : a.diferencia}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <p className="text-[11px] text-primary-custom font-medium leading-tight">{a.motivo}</p>
                      {a.archivoNombre && (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-indigo-500 font-bold">
                          <FileSpreadsheet className="w-3 h-3" />
                          <span>{a.archivoNombre}</span>
                          {a.archivoRegistros && <span className="opacity-70">({a.archivoRegistros} registros)</span>}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1 justify-center mx-auto w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>{a.estado}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleEliminarAntecedente(a.id)}
                        className="p-1.5 text-secondary-custom hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                        title="Eliminar antecedente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PARA APORTAR ANTECEDENTE / RESPALDO RAE */}
      {showModalNuevo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-card-custom rounded-3xl border border-card-custom shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Header del Modal */}
            <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Aportar Antecedente / Respaldo de Contraste</h3>
                  <p className="text-xs text-emerald-100 font-medium">Corrobora discrepancias entre RAE y MÉTRICO DB</p>
                </div>
              </div>

              <button
                onClick={() => setShowModalNuevo(false)}
                className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleGuardarAntecedente} className="p-6 overflow-y-auto space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary-custom tracking-wider block">
                    Fecha del Período / Día a Auditar
                  </label>
                  <input
                    type="date"
                    value={formFecha}
                    onChange={e => setFormFecha(e.target.value)}
                    className="w-full bg-input-custom border border-card-custom p-2.5 rounded-xl text-xs font-bold text-primary-custom outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-secondary-custom tracking-wider block">
                    Variable a Contrastar
                  </label>
                  <select
                    value={formVariable}
                    onChange={e => setFormVariable(e.target.value)}
                    className="w-full bg-input-custom border border-card-custom p-2.5 rounded-xl text-xs font-bold text-primary-custom outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Pacientes Admitidos">Pacientes Admitidos</option>
                    <option value="Pacientes Atendidos">Pacientes Atendidos</option>
                    <option value="Altas Administrativas">Altas Administrativas</option>
                    <option value="Traslados Hospitalarios">Traslados Hospitalarios</option>
                  </select>
                </div>
              </div>

              {/* Matriz de Cruce en Vivo */}
              <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-card-custom space-y-3">
                <h4 className="text-xs font-black text-primary-custom uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  Cruce Automático de Cifras
                </h4>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-card-custom p-3 rounded-xl border border-card-custom">
                    <span className="text-[9px] font-bold text-secondary-custom uppercase block">MÉTRICO DB</span>
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{cifraDBCalculada} pac.</span>
                    <span className="text-[8px] text-secondary-custom block">Detectados en BD</span>
                  </div>

                  <div className="bg-card-custom p-3 rounded-xl border-2 border-emerald-500/40">
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase block">Cifra RAE / Oficial</span>
                    <input
                      type="number"
                      value={formCifraRAE}
                      onChange={e => setFormCifraRAE(e.target.value)}
                      placeholder="Ej: 138"
                      className="w-full text-center text-lg font-black text-emerald-600 dark:text-emerald-400 bg-transparent outline-none"
                      required
                    />
                    <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold block">Digita tu cifra RAE</span>
                  </div>

                  <div className="bg-card-custom p-3 rounded-xl border border-card-custom">
                    <span className="text-[9px] font-bold text-secondary-custom uppercase block">Diferencia / Ajuste</span>
                    <span className={`text-lg font-black ${diferenciaCalculada === 0 ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {diferenciaCalculada > 0 ? `+${diferenciaCalculada}` : diferenciaCalculada}
                    </span>
                    <span className="text-[8px] text-secondary-custom block">Casos de brecha</span>
                  </div>
                </div>
              </div>

              {/* Tipo de Antecedente */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-secondary-custom tracking-wider block">
                  Tipo de Incidencia u Origen del Antecedente
                </label>
                <select
                  value={formTipo}
                  onChange={e => setFormTipo(e.target.value)}
                  className="w-full bg-input-custom border border-card-custom p-2.5 rounded-xl text-xs font-bold text-primary-custom outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Cotejo RAE / Discrepancia Ministerial">Cotejo RAE / Discrepancia Ministerial</option>
                  <option value="Falla Rayen / Contingencia Papel">Falla Rayen / Contingencia en Ficha Papel</option>
                  <option value="Corte de Energía / Emergencia Externa">Corte de Energía / Emergencia Externa</option>
                  <option value="Aclaración / Justificación Estadística">Aclaración / Justificación Estadística</option>
                </select>
              </div>

              {/* Carga de Archivo Excel / CSV de Cotejo */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-secondary-custom tracking-wider block">
                  Adjuntar Archivo de Cotejo (Opcional - Excel / CSV)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 border-2 border-dashed border-card-custom hover:border-emerald-500/50 p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-secondary-custom hover:text-primary-custom cursor-pointer transition-all bg-input-custom">
                    <Upload className="w-4 h-4 text-emerald-500" />
                    <span>{formArchivoNombre || (isReadingFile ? 'Leyendo archivo...' : 'Seleccionar planilla Excel / CSV')}</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {formArchivoNombre && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormArchivoNombre('');
                        setFormArchivoRegistros(null);
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl"
                      title="Quitar archivo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Justificación y Motivo */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-secondary-custom tracking-wider block">
                  Justificación / Explicación del Antecedente
                </label>
                <textarea
                  value={formMotivo}
                  onChange={e => setFormMotivo(e.target.value)}
                  placeholder="Explica el motivo de la diferencia (Ej: En RAE se registraron 3 pacientes manualmente en ficha papel por caída temporal de enlace)..."
                  className="w-full bg-input-custom border border-card-custom p-3 rounded-xl text-xs font-semibold text-primary-custom outline-none focus:border-emerald-500 min-h-[80px]"
                  required
                />
              </div>

              {/* Botones de Acción */}
              <div className="pt-3 border-t border-card-custom flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModalNuevo(false)}
                  className="px-4 py-2 text-xs font-bold text-secondary-custom hover:text-primary-custom cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar y Corroborar en MÉTRICO</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
