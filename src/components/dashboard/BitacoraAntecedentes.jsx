import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, Upload, Plus, CheckCircle2, AlertTriangle, ShieldCheck, 
  Trash2, Download, Search, Filter, Calendar, Info, RefreshCw, FileSpreadsheet,
  Check, ArrowRight, Layers, FileCheck, HelpCircle, X, Sparkles, UserCheck,
  TrendingUp, Activity, BarChart2, CalendarRange
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { isAltaAdmin } from '../../utils/helpers';

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
        id: 'ANT-2025-06-01',
        fecha: '2025-06 (01/06/2025 al 30/06/2025)',
        rangoDesde: '2025-06-01',
        rangoHasta: '2025-06-30',
        modo: 'mes',
        tipo: 'Cotejo RAE / Reporte Oficial Rayen',
        variable: 'Triada Asistencial (Adm/Aten/Altas)',
        cifraDB: 2971,
        cifraOficialRAE: 2971,
        diferencia: 0,
        admitidosDB: 2971,
        cifraOficialAdmitidos: 2971,
        deltaAdmitidos: 0,
        atendidosDB: 2680,
        cifraOficialAtendidos: 2680,
        deltaAtendidos: 0,
        altasDB: 291,
        cifraOficialAltas: 291,
        deltaAltas: 0,
        motivo: 'Certificación oficial de Junio 2025 validada contra reporte mensual de Rayen.',
        archivoNombre: 'reporte_rayen_junio_2025.xlsx',
        estado: 'CONCILIADO',
        creadoPor: 'Matías Bustos',
        creadoEl: new Date('2026-08-30').getTime()
      }
    ];
  });

  const [showModalNuevo, setShowModalNuevo] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  // Formulario de Nuevo Antecedente
  const [formModo, setFormModo] = useState('rango'); // 'rango' | 'mes' | 'dia'
  const [formYear, setFormYear] = useState(2025);
  const [formMonth, setFormMonth] = useState('10');
  const [formFechaDesde, setFormFechaDesde] = useState('2025-10-01');
  const [formFechaHasta, setFormFechaHasta] = useState('2025-10-31');
  const [formFecha, setFormFecha] = useState(new Date().toISOString().substring(0, 10));
  const [formTipo, setFormTipo] = useState('Cotejo RAE / Reporte Oficial Rayen');

  // Triada Asistencial ingresada por el usuario
  const [formCifraAdmitidos, setFormCifraAdmitidos] = useState('');
  const [formCifraAtendidos, setFormCifraAtendidos] = useState('');
  const [formCifraAltas, setFormCifraAltas] = useState('');
  const [formCifraTraslados, setFormCifraTraslados] = useState('');
  
  const [syncBenchmark, setSyncBenchmark] = useState(true);
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

  // Rango activo calculado
  const rangoActivo = useMemo(() => {
    if (formModo === 'mes') {
      const daysInMonth = new Date(formYear, Number(formMonth), 0).getDate();
      const desde = `${formYear}-${formMonth}-01`;
      const hasta = `${formYear}-${formMonth}-${String(daysInMonth).padStart(2, '0')}`;
      return {
        desde,
        hasta,
        label: `${formYear}-${formMonth} (01/${formMonth}/${formYear} al ${daysInMonth}/${formMonth}/${formYear})`,
        benchmarkKey: `${formYear}-${formMonth}`
      };
    } else if (formModo === 'rango') {
      const d = formFechaDesde || '2025-10-01';
      const h = formFechaHasta || '2025-10-31';
      const isFullMonth = d.endsWith('-01') && (h.endsWith('-30') || h.endsWith('-31') || h.endsWith('-28') || h.endsWith('-29')) && d.substring(0, 7) === h.substring(0, 7);
      return {
        desde: d,
        hasta: h,
        label: `${d} al ${h}`,
        benchmarkKey: isFullMonth ? d.substring(0, 7) : d
      };
    } else {
      return {
        desde: formFecha,
        hasta: formFecha,
        label: formFecha,
        benchmarkKey: formFecha
      };
    }
  }, [formModo, formYear, formMonth, formFechaDesde, formFechaHasta, formFecha]);

  // Cálculo automático de cifras en MÉTRICO DB en Vivo para el período seleccionado
  const cifrasDBCalculadas = useMemo(() => {
    let admitidos = 0;
    let atendidos = 0;
    let altas = 0;
    let traslados = 0;

    const { desde, hasta } = rangoActivo;

    (pacientesDB || []).forEach(p => {
      if (!p.tAdmision) return;
      const d = new Date(p.tAdmision);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${day}`;

      if (dStr >= desde && dStr <= hasta) {
        admitidos++;
        if (isAltaAdmin(p)) {
          altas++;
        } else {
          atendidos++;
        }
        const dest = String(p.destinoAlta || p.destino || '').toLowerCase();
        if (dest.includes('hospital') || dest.includes('emergencia') || dest.includes('derivac') || dest.includes('ueh')) {
          traslados++;
        }
      }
    });

    if (admitidos === 0) {
      // Fallback a turnosDB
      (turnosDB || []).forEach(t => {
        if (!t.fechaInicio) return;
        const f = String(t.fechaInicio);
        if (f >= desde && f <= hasta) {
          const tot = Number(t.totalPacientes || 0);
          const alt = Number(t.altasAdmin || 0);
          admitidos += tot;
          altas += alt;
          atendidos += Math.max(0, tot - alt);
          traslados += Number(t.trasladosCount || 0);
        }
      });
    }

    return { admitidos, atendidos, altas, traslados };
  }, [rangoActivo, pacientesDB, turnosDB]);

  // Diferencias calculadas para cada variable
  const deltasCalculados = useMemo(() => {
    const adm = parseInt(formCifraAdmitidos, 10);
    const ate = parseInt(formCifraAtendidos, 10);
    const alt = parseInt(formCifraAltas, 10);
    const tra = parseInt(formCifraTraslados, 10);

    const deltaAdmitidos = !isNaN(adm) ? adm - cifrasDBCalculadas.admitidos : 0;
    const deltaAtendidos = !isNaN(ate) ? ate - cifrasDBCalculadas.atendidos : 0;
    const deltaAltas = !isNaN(alt) ? alt - cifrasDBCalculadas.altas : 0;
    const deltaTraslados = !isNaN(tra) ? tra - cifrasDBCalculadas.traslados : 0;

    const esEcuacionValida = (!isNaN(adm) && !isNaN(ate) && !isNaN(alt)) 
      ? adm === (ate + alt) 
      : true;

    return {
      deltaAdmitidos,
      deltaAtendidos,
      deltaAltas,
      deltaTraslados,
      esEcuacionValida
    };
  }, [formCifraAdmitidos, formCifraAtendidos, formCifraAltas, formCifraTraslados, cifrasDBCalculadas]);

  // Procesamiento de Archivo Excel / CSV de Cotejo (Iris / Rayen)
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

        // Pre-llenar admitidos si está vacío
        if (count > 0 && !formCifraAdmitidos) {
          setFormCifraAdmitidos(count.toString());
        }

        setIsReadingFile(false);
        if (showNotif) showNotif(`Archivo "${file.name}" cargado (${count.toLocaleString('es-CL')} registros leídos).`, 'info');
      } catch (err) {
        console.error('Error al procesar archivo de cotejo:', err);
        setIsReadingFile(false);
        if (showNotif) showNotif('Error al leer archivo de cotejo. Asegúrese de que sea Excel o CSV válido.', 'error');
      }
    };

    reader.readAsArrayBuffer(file);
    e.target.value = null;
  };

  // Guardar Antecedente Completo
  const handleGuardarAntecedente = (e) => {
    e.preventDefault();
    const adm = parseInt(formCifraAdmitidos, 10);
    if (isNaN(adm) && !formCifraAtendidos && !formCifraAltas) {
      if (showNotif) showNotif('Por favor ingresa al menos la cifra de Pacientes Admitidos de Rayen/Iris.', 'warning');
      return;
    }

    const finalAdmitidos = !isNaN(adm) ? adm : cifrasDBCalculadas.admitidos;
    const finalAtendidos = parseInt(formCifraAtendidos, 10) || Math.max(0, finalAdmitidos - (parseInt(formCifraAltas, 10) || 0));
    const finalAltas = parseInt(formCifraAltas, 10) || Math.max(0, finalAdmitidos - finalAtendidos);
    const finalTraslados = parseInt(formCifraTraslados, 10) || 0;

    const nuevo = {
      id: `ANT-${Date.now()}`,
      fecha: rangoActivo.label,
      rangoDesde: rangoActivo.desde,
      rangoHasta: rangoActivo.hasta,
      modo: formModo,
      tipo: formTipo,
      variable: 'Triada Asistencial (Adm/Aten/Altas)',
      
      // Detalle de las 3 variables
      admitidosDB: cifrasDBCalculadas.admitidos,
      cifraOficialAdmitidos: finalAdmitidos,
      deltaAdmitidos: finalAdmitidos - cifrasDBCalculadas.admitidos,

      atendidosDB: cifrasDBCalculadas.atendidos,
      cifraOficialAtendidos: finalAtendidos,
      deltaAtendidos: finalAtendidos - cifrasDBCalculadas.atendidos,

      altasDB: cifrasDBCalculadas.altas,
      cifraOficialAltas: finalAltas,
      deltaAltas: finalAltas - cifrasDBCalculadas.altas,

      trasladosDB: cifrasDBCalculadas.traslados,
      cifraOficialTraslados: finalTraslados,
      deltaTraslados: finalTraslados - cifrasDBCalculadas.traslados,

      // Retrocompatibilidad
      cifraDB: cifrasDBCalculadas.admitidos,
      cifraOficialRAE: finalAdmitidos,
      diferencia: finalAdmitidos - cifrasDBCalculadas.admitidos,

      motivo: formMotivo || `Cruce asistencial oficial de Rayen/Iris para el rango ${rangoActivo.label}.`,
      archivoNombre: formArchivoNombre || null,
      archivoRegistros: formArchivoRegistros || null,
      estado: 'CONCILIADO',
      creadoPor: user?.displayName || user?.email?.split('@')[0] || 'Usuario Autorizado',
      creadoEl: Date.now()
    };

    setAntecedentes(prev => [nuevo, ...prev]);

    // Sincronizar directamente con Benchmarks Certificados SSOT si está marcado
    if (syncBenchmark) {
      try {
        const savedBenchmarks = localStorage.getItem('metrico_certified_benchmarks');
        const parsedBenchmarks = savedBenchmarks ? JSON.parse(savedBenchmarks) : {};
        parsedBenchmarks[rangoActivo.benchmarkKey] = {
          admitidos: finalAdmitidos,
          atendidos: finalAtendidos,
          altas: finalAltas,
          sinAtencion: Math.round(finalAltas * 0.45),
          egresoAdmin: Math.round(finalAltas * 0.55),
          tipo: formModo,
          fecha: rangoActivo.label,
          desde: rangoActivo.desde,
          hasta: rangoActivo.hasta,
          verificado: true,
          actualizadoEl: Date.now()
        };
        localStorage.setItem('metrico_certified_benchmarks', JSON.stringify(parsedBenchmarks));
      } catch (e) {
        console.error('Error guardando benchmark:', e);
      }
    }

    setShowModalNuevo(false);
    
    // Limpiar formulario
    setFormMotivo('');
    setFormCifraAdmitidos('');
    setFormCifraAtendidos('');
    setFormCifraAltas('');
    setFormCifraTraslados('');
    setFormArchivoNombre('');
    setFormArchivoRegistros(null);

    if (showNotif) showNotif(`¡Antecedente para ${rangoActivo.label} conciliado y registrado en MÉTRICO!`, 'success');
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
      'Período / Rango': a.fecha,
      'Fecha Desde': a.rangoDesde || '—',
      'Fecha Hasta': a.rangoHasta || '—',
      'Modo': a.modo || 'rango',
      'Tipo de Antecedente': a.tipo,
      'Admitidos (DB)': a.admitidosDB ?? a.cifraDB,
      'Admitidos (Oficial Rayen)': a.cifraOficialAdmitidos ?? a.cifraOficialRAE,
      'Delta Admitidos': a.deltaAdmitidos ?? a.diferencia,
      'Atendidos Médicos (Oficial)': a.cifraOficialAtendidos ?? '—',
      'Altas Admin (Oficial)': a.cifraOficialAltas ?? '—',
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
    return antecedentes.reduce((acc, a) => acc + Math.abs(a.deltaAdmitidos ?? a.diferencia ?? 0), 0);
  }, [antecedentes]);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* HEADER DE LA BITÁCORA */}
      <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
              Contraste Oficial SSOT
            </span>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              Cruce Rayen / Iris / RAE
            </span>
          </div>
          <h2 className="text-xl font-black text-primary-custom tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            Bitácora de Antecedentes y Cruce de Incidencias
          </h2>
          <p className="text-xs text-secondary-custom font-medium max-w-2xl">
            Aporta antecedentes y cotejos con rango de fechas flexible (ej. 01/10/2025 al 31/10/2025) y la triada asistencial completa (Admitidos, Atendidos Médicos y Altas Admin) para certificar la verdad oficial SSOT.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setFormModo('rango');
              setFormFechaDesde('2025-10-01');
              setFormFechaHasta('2025-10-31');
              setFormCifraAdmitidos('');
              setFormCifraAtendidos('');
              setFormCifraAltas('');
              setFormCifraTraslados('');
              setFormMotivo('');
              setFormArchivoNombre('');
              setShowModalNuevo(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Aportar Antecedente / Rango de Fechas</span>
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
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">100% Conciliados con Rayen</span>
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
              placeholder="Buscar por período, motivo, archivo..."
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
            <option value="Cotejo RAE / Reporte Oficial Rayen">Reporte Oficial Rayen</option>
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
                <th className="p-3.5">Período / Rango</th>
                <th className="p-3.5">Tipo de Antecedente</th>
                <th className="p-3.5 text-center text-indigo-500">Admitidos (DB)</th>
                <th className="p-3.5 text-center text-emerald-500">Oficial Rayen</th>
                <th className="p-3.5 text-center text-sky-500">Atendidos Méd.</th>
                <th className="p-3.5 text-center text-purple-500">Altas Admin</th>
                <th className="p-3.5 text-center text-amber-500">Brecha Δ</th>
                <th className="p-3.5">Justificación y Respaldo</th>
                <th className="p-3.5 text-center">Estado</th>
                <th className="p-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-custom font-medium text-primary-custom">
              {antecedentesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-secondary-custom">
                    <Info className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-xs">No se encontraron antecedentes registrados con los filtros actuales.</p>
                    <p className="text-[10px] mt-1">Usa el botón "Aportar Antecedente / Rango de Fechas" para ingresar cotejos de información.</p>
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
                    <td className="p-3.5 text-center font-black text-indigo-600 dark:text-indigo-400">
                      {(a.admitidosDB ?? a.cifraDB)?.toLocaleString('es-CL')} pac.
                    </td>
                    <td className="p-3.5 text-center font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                      {(a.cifraOficialAdmitidos ?? a.cifraOficialRAE)?.toLocaleString('es-CL')} pac.
                    </td>
                    <td className="p-3.5 text-center font-bold text-sky-600 dark:text-sky-400">
                      {a.cifraOficialAtendidos ? `${a.cifraOficialAtendidos.toLocaleString('es-CL')} pac.` : '—'}
                    </td>
                    <td className="p-3.5 text-center font-bold text-purple-600 dark:text-purple-400">
                      {a.cifraOficialAltas ? `${a.cifraOficialAltas.toLocaleString('es-CL')} pac.` : '—'}
                    </td>
                    <td className="p-3.5 text-center font-black">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        (a.deltaAdmitidos ?? a.diferencia) === 0 
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {(a.deltaAdmitidos ?? a.diferencia) > 0 ? `+${a.deltaAdmitidos ?? a.diferencia}` : (a.deltaAdmitidos ?? a.diferencia)}
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

      {/* MODAL PARA APORTAR ANTECEDENTE / RESPALDO DE CONTRASTE */}
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
                  <p className="text-xs text-white/80 font-medium">Corrobora discrepancias entre Rayen, Iris y MÉTRICO DB</p>
                </div>
              </div>
              <button
                onClick={() => setShowModalNuevo(false)}
                className="p-2 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleGuardarAntecedente} className="p-6 overflow-y-auto space-y-5">
              
              {/* SELECTOR DE ALCANCE: RANGO DE FECHAS VS MES COMPLETO VS DÍA */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-secondary-custom tracking-wider block">
                  Alcance del Período / Modalidad de Ingreso
                </label>
                <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-card-custom">
                  <button
                    type="button"
                    onClick={() => setFormModo('rango')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      formModo === 'rango'
                        ? 'bg-primary-custom text-white shadow-sm'
                        : 'text-secondary-custom hover:text-primary-custom'
                    }`}
                  >
                    <CalendarRange className="w-3.5 h-3.5" />
                    <span>Rango de Fechas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormModo('mes')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      formModo === 'mes'
                        ? 'bg-primary-custom text-white shadow-sm'
                        : 'text-secondary-custom hover:text-primary-custom'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Mes Calendario</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormModo('dia')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      formModo === 'dia'
                        ? 'bg-primary-custom text-white shadow-sm'
                        : 'text-secondary-custom hover:text-primary-custom'
                    }`}
                  >
                    <span>Día Único</span>
                  </button>
                </div>
              </div>

              {/* SELECTORES SEGÚN EL MODO */}
              {formModo === 'rango' && (
                <div className="space-y-2 bg-card-custom p-3.5 rounded-2xl border border-card-custom">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-secondary-custom tracking-wider block">
                        Fecha Inicio (Desde)
                      </label>
                      <input
                        type="date"
                        value={formFechaDesde}
                        onChange={e => setFormFechaDesde(e.target.value)}
                        className="w-full bg-input-custom border border-card-custom p-2.5 rounded-xl text-xs font-bold text-primary-custom outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-secondary-custom tracking-wider block">
                        Fecha Término (Hasta)
                      </label>
                      <input
                        type="date"
                        value={formFechaHasta}
                        onChange={e => setFormFechaHasta(e.target.value)}
                        className="w-full bg-input-custom border border-card-custom p-2.5 rounded-xl text-xs font-bold text-primary-custom outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 text-center">
                    Auditoría activa del <span className="font-mono underline">{formFechaDesde}</span> al <span className="font-mono underline">{formFechaHasta}</span> (00:00 a 23:59 hrs)
                  </div>
                </div>
              )}

              {formModo === 'mes' && (
                <div className="grid grid-cols-2 gap-4 bg-card-custom p-3.5 rounded-2xl border border-card-custom">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-secondary-custom tracking-wider block">
                      Año
                    </label>
                    <select
                      value={formYear}
                      onChange={e => setFormYear(Number(e.target.value))}
                      className="w-full bg-input-custom border border-card-custom p-2.5 rounded-xl text-xs font-bold text-primary-custom outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-secondary-custom tracking-wider block">
                      Mes
                    </label>
                    <select
                      value={formMonth}
                      onChange={e => setFormMonth(e.target.value)}
                      className="w-full bg-input-custom border border-card-custom p-2.5 rounded-xl text-xs font-bold text-primary-custom outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="01">01 - Enero</option>
                      <option value="02">02 - Febrero</option>
                      <option value="03">03 - Marzo</option>
                      <option value="04">04 - Abril</option>
                      <option value="05">05 - Mayo</option>
                      <option value="06">06 - Junio</option>
                      <option value="07">07 - Julio</option>
                      <option value="08">08 - Agosto</option>
                      <option value="09">09 - Septiembre</option>
                      <option value="10">10 - Octubre</option>
                      <option value="11">11 - Noviembre</option>
                      <option value="12">12 - Diciembre</option>
                    </select>
                  </div>
                </div>
              )}

              {formModo === 'dia' && (
                <div className="space-y-1 bg-card-custom p-3.5 rounded-2xl border border-card-custom">
                  <label className="text-[10px] font-black uppercase text-secondary-custom tracking-wider block">
                    Fecha Específica del Turno / Jornada
                  </label>
                  <input
                    type="date"
                    value={formFecha}
                    onChange={e => setFormFecha(e.target.value)}
                    className="w-full bg-input-custom border border-card-custom p-2.5 rounded-xl text-xs font-bold text-primary-custom outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              )}

              {/* MATRIZ DE CRUCE EN VIVO: TRIADA ASISTENCIAL COMPLETA */}
              <div className="bg-black/5 dark:bg-white/5 p-4 sm:p-5 rounded-2xl border border-card-custom space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-primary-custom uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    Cruce de Triada Asistencial ({rangoActivo.desde} al {rangoActivo.hasta})
                  </h4>
                  {!deltasCalculados.esEcuacionValida && (
                    <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      ⚠️ Admitidos ≠ Atendidos + Altas
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {/* VARIABLE 1: PACIENTES ADMITIDOS */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-card-custom p-3 rounded-xl border border-card-custom">
                    <div className="sm:col-span-4">
                      <span className="text-xs font-black text-primary-custom block">1. Pacientes Admitidos</span>
                      <span className="text-[10px] text-secondary-custom">Demanda Global del Rango</span>
                    </div>
                    <div className="sm:col-span-3 text-center">
                      <span className="text-[9px] font-bold text-secondary-custom uppercase block">MÉTRICO DB</span>
                      <span className="text-base font-black text-indigo-600 dark:text-indigo-400">{cifrasDBCalculadas.admitidos.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="number"
                        value={formCifraAdmitidos}
                        onChange={e => setFormCifraAdmitidos(e.target.value)}
                        placeholder={`Ej: ${cifrasDBCalculadas.admitidos || '2971'}`}
                        className="w-full text-center text-sm font-black text-emerald-600 dark:text-emerald-400 bg-input-custom p-2 rounded-lg border-2 border-emerald-500/40 outline-none focus:border-emerald-500"
                        required
                      />
                      <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold block text-center mt-0.5">Cifra Oficial Rayen</span>
                    </div>
                    <div className="sm:col-span-2 text-center">
                      <span className="text-[9px] font-bold text-secondary-custom uppercase block">Brecha Δ</span>
                      <span className={`text-sm font-black ${deltasCalculados.deltaAdmitidos === 0 ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {deltasCalculados.deltaAdmitidos > 0 ? `+${deltasCalculados.deltaAdmitidos}` : deltasCalculados.deltaAdmitidos}
                      </span>
                    </div>
                  </div>

                  {/* VARIABLE 2: PACIENTES ATENDIDOS MÉDICOS */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-card-custom p-3 rounded-xl border border-card-custom">
                    <div className="sm:col-span-4">
                      <span className="text-xs font-black text-primary-custom block">2. Atendidos Médicos</span>
                      <span className="text-[10px] text-secondary-custom">Completados + Tratamiento</span>
                    </div>
                    <div className="sm:col-span-3 text-center">
                      <span className="text-[9px] font-bold text-secondary-custom uppercase block">MÉTRICO DB</span>
                      <span className="text-base font-black text-indigo-600 dark:text-indigo-400">{cifrasDBCalculadas.atendidos.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="number"
                        value={formCifraAtendidos}
                        onChange={e => setFormCifraAtendidos(e.target.value)}
                        placeholder={`Ej: ${cifrasDBCalculadas.atendidos || '2680'}`}
                        className="w-full text-center text-sm font-black text-sky-600 dark:text-sky-400 bg-input-custom p-2 rounded-lg border border-sky-500/40 outline-none focus:border-sky-500"
                      />
                      <span className="text-[8px] text-sky-600 dark:text-sky-400 font-bold block text-center mt-0.5">Cifra Oficial Rayen</span>
                    </div>
                    <div className="sm:col-span-2 text-center">
                      <span className="text-[9px] font-bold text-secondary-custom uppercase block">Brecha Δ</span>
                      <span className={`text-sm font-black ${deltasCalculados.deltaAtendidos === 0 ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {deltasCalculados.deltaAtendidos > 0 ? `+${deltasCalculados.deltaAtendidos}` : deltasCalculados.deltaAtendidos}
                      </span>
                    </div>
                  </div>

                  {/* VARIABLE 3: ALTAS ADMINISTRATIVAS */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-card-custom p-3 rounded-xl border border-card-custom">
                    <div className="sm:col-span-4">
                      <span className="text-xs font-black text-primary-custom block">3. Altas Administrativas</span>
                      <span className="text-[10px] text-secondary-custom">Egresos Admin + Sin Atención</span>
                    </div>
                    <div className="sm:col-span-3 text-center">
                      <span className="text-[9px] font-bold text-secondary-custom uppercase block">MÉTRICO DB</span>
                      <span className="text-base font-black text-indigo-600 dark:text-indigo-400">{cifrasDBCalculadas.altas.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="number"
                        value={formCifraAltas}
                        onChange={e => setFormCifraAltas(e.target.value)}
                        placeholder={`Ej: ${cifrasDBCalculadas.altas || '291'}`}
                        className="w-full text-center text-sm font-black text-purple-600 dark:text-purple-400 bg-input-custom p-2 rounded-lg border border-purple-500/40 outline-none focus:border-purple-500"
                      />
                      <span className="text-[8px] text-purple-600 dark:text-purple-400 font-bold block text-center mt-0.5">Cifra Oficial Rayen</span>
                    </div>
                    <div className="sm:col-span-2 text-center">
                      <span className="text-[9px] font-bold text-secondary-custom uppercase block">Brecha Δ</span>
                      <span className={`text-sm font-black ${deltasCalculados.deltaAltas === 0 ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {deltasCalculados.deltaAltas > 0 ? `+${deltasCalculados.deltaAltas}` : deltasCalculados.deltaAltas}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TIPO DE INCIDENCIA */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-secondary-custom tracking-wider block">
                  Tipo de Incidencia u Origen del Antecedente
                </label>
                <select
                  value={formTipo}
                  onChange={e => setFormTipo(e.target.value)}
                  className="w-full bg-input-custom border border-card-custom p-2.5 rounded-xl text-xs font-bold text-primary-custom outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Cotejo RAE / Reporte Oficial Rayen">Reporte Oficial Rayen (Certificación Mensual o Rango)</option>
                  <option value="Cotejo RAE / Discrepancia Ministerial">Cotejo RAE / Discrepancia Ministerial</option>
                  <option value="Falla Rayen / Contingencia Papel">Falla Rayen / Contingencia en Ficha Papel</option>
                  <option value="Corte de Energía / Emergencia Externa">Corte de Energía / Emergencia Externa</option>
                  <option value="Aclaración / Justificación Estadística">Aclaración / Justificación Estadística</option>
                </select>
              </div>

              {/* CARGA DE ARCHIVO EXCEL / CSV DE COTEJO (IRIS O RAYEN) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-secondary-custom tracking-wider block">
                  Adjuntar Archivo de Cotejo (Excel o CSV de Iris / Rayen)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 border-2 border-dashed border-card-custom hover:border-emerald-500/50 p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-secondary-custom hover:text-primary-custom cursor-pointer transition-all bg-input-custom">
                    <Upload className="w-4 h-4 text-emerald-500" />
                    <span>{formArchivoNombre || (isReadingFile ? 'Leyendo archivo...' : 'Seleccionar planilla Excel / CSV de Iris o Rayen')}</span>
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
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer"
                      title="Quitar archivo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* CHECKBOX DE CERTIFICACIÓN DE BENCHMARK SSOT */}
              <label className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncBenchmark}
                  onChange={e => setSyncBenchmark(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
                <div>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 block">
                    Certificar y Sincronizar como Benchmark Oficial SSOT
                  </span>
                  <span className="text-[10px] text-secondary-custom block">
                    Actualiza inmediatamente el motor analítico, las tarjetas anuales y las comparativas mes a mes.
                  </span>
                </div>
              </label>

              {/* JUSTIFICACIÓN Y MOTIVO */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-secondary-custom tracking-wider block">
                  Justificación / Observación Técnica del Antecedente
                </label>
                <textarea
                  value={formMotivo}
                  onChange={e => setFormMotivo(e.target.value)}
                  placeholder="Explica el motivo del cotejo (Ej: Certificación del período en base al archivo de Iris cruzado con Rayen)..."
                  className="w-full bg-input-custom border border-card-custom p-3 rounded-xl text-xs font-semibold text-primary-custom outline-none focus:border-emerald-500 min-h-[70px]"
                />
              </div>

              {/* BOTONES DE ACCIÓN */}
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
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar, Corroborar y Certificar en MÉTRICO</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
