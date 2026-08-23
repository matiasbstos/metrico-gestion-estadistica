import React, { useState, useMemo, useEffect } from 'react';
import { 
  Mail, Clock, Calendar as CalendarIcon, CheckCircle2, Send, ShieldAlert, Sparkles, X, Check, 
  FileText, AlertCircle, RefreshCw, Layers, Code, CheckSquare, Square, Cpu, Eye, UserCheck, 
  Activity, ArrowLeftRight, Hospital, FastForward, Play, ListOrdered, ChevronRight, Users, 
  UserPlus, Trash2, Edit3, Smartphone, Monitor, ShieldCheck, History, ArrowRight, ToggleLeft, ToggleRight, 
  Inbox, BellRing, Filter, Search, ChevronLeft
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auditarUltimoTurnoCompleto } from '../../utils/helpers';
import { 
  generateAltasSummary, 
  generateFracturasSummary, 
  generateEnfermeriaSummary, 
  generateConstatacionesSummary, 
  generateTrasladosSummary,
  generateMonthlyConsolidatedSummary,
  generateMultiDayBatchSummary
} from '../../utils/summaryGenerator';
import FiltrosGlobales from './FiltrosGlobales';

export default function ModalConfiguracionCorreo({ 
  isOpen, 
  onClose, 
  sidebarCollapsed = false,
  app, 
  db, 
  user,
  userProfile,
  showNotif, 
  pacientesDB = [], 
  turnosDB = [], 
  onOpenReportes 
}) {
  // Pestaña Principal del Módulo de Pantalla Completa
  // 'programados' | 'calendario' | 'diseno' | 'pruebas' | 'destinatarios'
  const [activeTab, setActiveTab] = useState('programados');

  // Estado de Programación General y Confirmación
  const [confirmarEnvioAutomatico, setConfirmarEnvioAutomatico] = useState(() => {
    try {
      const s = localStorage.getItem('metrico_config_correo');
      if (s) return JSON.parse(s).confirmarEnvioAutomatico ?? true;
    } catch(e) {}
    return true;
  });

  const [progTurnoSemana, setProgTurnoSemana] = useState(true);
  const [progTurnoFdsDia, setProgTurnoFdsDia] = useState(true);
  const [progTurnoFdsNoche, setProgTurnoFdsNoche] = useState(true);
  const [progDiario, setProgDiario] = useState(true);
  const [progMensual, setProgMensual] = useState(true);

  // Directriz para Cargas Masivas (Multi-Día)
  const [modoCargaMasiva, setModoCargaMasiva] = useState(() => {
    try {
      const s = localStorage.getItem('metrico_config_correo');
      if (s) return JSON.parse(s).modoCargaMasiva || 'RAFAGA_MISMO_DIA';
    } catch(e) {}
    return 'RAFAGA_MISMO_DIA'; // 'RAFAGA_MISMO_DIA' | 'CONSOLIDADO_MULTIDIA' | 'DESPACHO_ACELERADO'
  });
  const [intervaloMinutos, setIntervaloMinutos] = useState(20);

  // Sub-Reportes Incluidos
  const [incDemanda, setIncDemanda] = useState(true);
  const [incAltas, setIncAltas] = useState(true);
  const [incFracturas, setIncFracturas] = useState(true);
  const [incEnfermeria, setIncEnfermeria] = useState(true);
  const [incConstataciones, setIncConstataciones] = useState(true);
  const [incTraslados, setIncTraslados] = useState(true);

  // Gestión de Destinatarios Estructurados
  const [destinatariosList, setDestinatariosList] = useState(() => {
    try {
      const saved = localStorage.getItem('metrico_destinatarios_correo');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [
      {
        id: 'dest-1',
        nombre: 'Dra. Dirección SAR',
        cargo: 'Dirección Médica SAR',
        email: 'direccion.sar@cormumel.cl',
        frecuencia: 'AMBOS', // 'DIARIO' | 'MENSUAL' | 'AMBOS'
        activo: true,
        totalEnviados: 48,
        ultimoEnvio: 'Hoy 08:30 hrs'
      },
      {
        id: 'dest-2',
        nombre: 'Jefatura de Gestión Clínica',
        cargo: 'Jefatura Asistencial',
        email: 'jefatura.sar@cormumel.cl',
        frecuencia: 'AMBOS',
        activo: true,
        totalEnviados: 52,
        ultimoEnvio: 'Hoy 08:30 hrs'
      },
      {
        id: 'dest-3',
        nombre: 'Coordinación de Turnos',
        cargo: 'Supervisión de Enfermería',
        email: 'coordinacion.sar@cormumel.cl',
        frecuencia: 'DIARIO',
        activo: true,
        totalEnviados: 35,
        ultimoEnvio: 'Ayer 20:30 hrs'
      }
    ];
  });

  // Formulario Nuevo Destinatario
  const [newDestNombre, setNewDestNombre] = useState('');
  const [newDestCargo, setNewDestCargo] = useState('');
  const [newDestEmail, setNewDestEmail] = useState('');
  const [newDestFrecuencia, setNewDestFrecuencia] = useState('AMBOS');
  const [showAddDestForm, setShowAddDestForm] = useState(false);

  // Estados de Pruebas de Envío y Consola
  const [testTemplate, setTestTemplate] = useState('DIARIO'); // 'DIARIO' | 'MENSUAL' | 'MASIVO' | 'SUBREPORTES'
  const [testTargetEmail, setTestTargetEmail] = useState('');
  const [sendingTestState, setSendingTestState] = useState(false);
  const [testLogs, setTestLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('metrico_test_mail_logs');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [
      {
        id: 'log-init-1',
        fecha: new Date().toISOString(),
        tipo: 'Informe Diario por Turno',
        destinatario: 'jefatura.sar@cormumel.cl',
        estado: 'EXITOSO',
        detalles: 'Plantilla de Turno Auditado despachada correctamente.'
      }
    ];
  });

  // Selector de Plantilla en Vista de Diseño
  const [disenoTemplate, setDisenoTemplate] = useState('DIARIO'); // 'DIARIO' | 'MENSUAL' | 'MASIVO' | 'SUBREPORTES'
  const [disenoDevice, setDisenoDevice] = useState('DESKTOP'); // 'DESKTOP' | 'MOBILE'

  // Calendario de Envíos: Mes y Año Seleccionados
  const [calMes, setCalMes] = useState(new Date().getMonth());
  const [calAnio, setCalAnio] = useState(new Date().getFullYear());

  // Mensajes y Estados de Guardado
  const [saveMsg, setSaveMsg] = useState('');

  // Persistir destinatarios en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('metrico_destinatarios_correo', JSON.stringify(destinatariosList));
    } catch(e) {}
  }, [destinatariosList]);

  // Persistir test logs
  useEffect(() => {
    try {
      localStorage.setItem('metrico_test_mail_logs', JSON.stringify(testLogs));
    } catch(e) {}
  }, [testLogs]);

  // Combinar admisiones filtradas con el histórico en caché local
  const combinedPacientes = useMemo(() => {
    let cached = [];
    try {
      const c = localStorage.getItem('metrico_cached_pacientes');
      if (c) cached = JSON.parse(c);
    } catch (e) {}

    const map = new Map();
    [...(pacientesDB || []), ...cached].forEach(p => {
      if (!p) return;
      const id = p.id || p.docId || p.correlativo || p.rutPaciente || p.tAdmision;
      if (id && !map.has(id)) map.set(id, p);
    });

    return Array.from(map.values());
  }, [pacientesDB]);

  // Auditoría del Turno Cerrado Actual
  const auditResult = useMemo(() => {
    return auditarUltimoTurnoCompleto(turnosDB, combinedPacientes);
  }, [turnosDB, combinedPacientes]);

  const turnoInfo = auditResult.turnoInfo || {
    fechaTurno: '16/08/2026',
    turnoNum: 1,
    equipo: 'Equipo 2',
    rotativa: 'Fin de Semana Día (08:00 - 20:00)',
    textoCompleto: '16/08/2026 - Turno 1 (Turno 2 • Fin de Semana Día 08:00 a 20:00 hrs)',
    totalAdmitidos: 111,
    atendidos: 99,
    altasAdmin: 12,
    triage: { c1: 0, c2: 0, c3: 8, c4: 40, c5: 60 },
    medicoMasProductivo: 'Dr. Fernando Morales (32 atenciones)',
    jsonPayload: {}
  };

  // Detección Automática de Días Completos Auditados y Cola de Despacho
  const diasCompletosAuditados = useMemo(() => {
    const datesMap = new Map();

    (combinedPacientes || []).forEach(p => {
      let fStr = p.fecha;
      if (!fStr && p.tAdmision) {
        const d = new Date(p.tAdmision);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        fStr = `${y}-${m}-${day}`;
      }
      if (!fStr) return;
      if (!datesMap.has(fStr)) {
        datesMap.set(fStr, { fecha: fStr, pacientes: 0, altas: 0, atendidos: 0, turnos: 0 });
      }
      const entry = datesMap.get(fStr);
      entry.pacientes++;
      if (p.estado === 'Cancelada' || p.destinoAlta?.includes('ALTA ADMIN')) entry.altas++;
      else entry.atendidos++;
    });

    (turnosDB || []).forEach(t => {
      const fStr = t.fechaInicio;
      if (!fStr) return;
      if (!datesMap.has(fStr)) {
        datesMap.set(fStr, { fecha: fStr, pacientes: 0, altas: 0, atendidos: 0, turnos: 0 });
      }
      const entry = datesMap.get(fStr);
      entry.turnos++;
      if (entry.pacientes === 0) {
        entry.pacientes += Number(t.totalPacientes || 0);
        entry.altas += Number(t.altasAdmin || 0);
        entry.atendidos += Math.max(0, Number(t.totalPacientes || 0) - Number(t.altasAdmin || 0));
      }
    });

    let sentMap = {};
    try {
      const s = localStorage.getItem('metrico_informes_enviados_map');
      if (s) sentMap = JSON.parse(s);
    } catch(e) {}

    const list = Array.from(datesMap.values())
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .map((item, idx) => {
        let horarioProyectado = 'Día siguiente 08:30 AM';
        if (modoCargaMasiva === 'RAFAGA_MISMO_DIA') {
          const baseHour = 9;
          const totalMins = idx * Number(intervaloMinutos || 20);
          const h = baseHour + Math.floor(totalMins / 60);
          const m = totalMins % 60;
          horarioProyectado = `Hoy ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} hrs (Escalonado)`;
        } else if (modoCargaMasiva === 'CONSOLIDADO_MULTIDIA') {
          horarioProyectado = 'Consolidado Único (Hoy 20:30 hrs)';
        } else if (modoCargaMasiva === 'DESPACHO_ACELERADO') {
          const shiftSlot = idx % 3 === 0 ? '08:30 hrs' : (idx % 3 === 1 ? '14:00 hrs' : '20:30 hrs');
          const dayOffset = Math.floor(idx / 3);
          horarioProyectado = dayOffset === 0 ? `Hoy ${shiftSlot}` : `Mañana ${shiftSlot}`;
        }

        const isSent = Boolean(sentMap[item.fecha]);

        return {
          ...item,
          isCompleto: item.pacientes >= 10,
          isSent,
          horarioProyectado
        };
      });

    return list;
  }, [combinedPacientes, turnosDB, modoCargaMasiva, intervaloMinutos]);

  // Resumen del Consolidado de Cierre Mensual
  const monthlyConsolidatedText = useMemo(() => {
    return generateMonthlyConsolidatedSummary(combinedPacientes);
  }, [combinedPacientes]);

  // Resumen Consolidado de Carga Masiva (Multidía)
  const batchConsolidatedData = useMemo(() => {
    const dates = diasCompletosAuditados.slice(0, 7).map(d => d.fecha);
    return generateMultiDayBatchSummary(dates, combinedPacientes, turnosDB);
  }, [diasCompletosAuditados, combinedPacientes, turnosDB]);

  // Sub-Reportes Especializados
  const subReportSummaries = useMemo(() => {
    return {
      altas: generateAltasSummary(pacientesDB),
      fracturas: generateFracturasSummary(pacientesDB),
      enfermeria: generateEnfermeriaSummary(pacientesDB),
      constataciones: generateConstatacionesSummary(pacientesDB),
      traslados: generateTrasladosSummary(pacientesDB)
    };
  }, [pacientesDB]);

  // Lista de correos activos en formato string para envíos
  const activeEmailsString = useMemo(() => {
    const list = destinatariosList.filter(d => d.activo).map(d => d.email);
    return list.length > 0 ? list.join(', ') : 'jefatura.sar@cormumel.cl';
  }, [destinatariosList]);

  // Guardar Configuración Global
  const handleSaveAllConfig = () => {
    const configData = {
      confirmarEnvioAutomatico,
      programacion: {
        progTurnoSemana,
        progTurnoFdsDia,
        progTurnoFdsNoche,
        progDiario,
        progMensual
      },
      directrizCargaMasiva: {
        modoCargaMasiva,
        intervaloMinutos
      },
      subReportesIncluidos: {
        incDemanda,
        incAltas,
        incFracturas,
        incEnfermeria,
        incConstataciones,
        incTraslados
      },
      ultimoTurnoAuditado: turnoInfo.textoCompleto,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('metrico_config_correo', JSON.stringify(configData));
    setSaveMsg('¡Configuración, programación y reglas de despacho guardadas exitosamente!');
    if (showNotif) showNotif('Programación general de correos actualizada y confirmada.', 'success');
    setTimeout(() => setSaveMsg(''), 4000);
  };

  // Manejador de Agregar Destinatario
  const handleAddDestinatario = (e) => {
    e.preventDefault();
    if (!newDestEmail.trim() || !newDestNombre.trim()) {
      if (showNotif) showNotif('Ingrese el nombre y correo electrónico del funcionario.', 'error');
      return;
    }

    const newDest = {
      id: `dest-${Date.now()}`,
      nombre: newDestNombre.trim(),
      cargo: newDestCargo.trim() || 'Gestión / Asistencial',
      email: newDestEmail.trim().toLowerCase(),
      frecuencia: newDestFrecuencia,
      activo: true,
      totalEnviados: 0,
      ultimoEnvio: 'Pendiente de primer despacho'
    };

    setDestinatariosList(prev => [newDest, ...prev]);
    setNewDestNombre('');
    setNewDestCargo('');
    setNewDestEmail('');
    setShowAddDestForm(false);
    if (showNotif) showNotif(`Destinatario ${newDest.nombre} agregado correctamente.`, 'success');
  };

  // Alternar Activo / Pausa de Destinatario
  const handleToggleDestinatario = (id) => {
    setDestinatariosList(prev => prev.map(d => d.id === id ? { ...d, activo: !d.activo } : d));
  };

  // Eliminar Destinatario
  const handleDeleteDestinatario = (id, nombre) => {
    if (window.confirm(`¿Seguro que deseas eliminar a ${nombre} de la lista de destinatarios?`)) {
      setDestinatariosList(prev => prev.filter(d => d.id !== id));
      if (showNotif) showNotif(`Destinatario ${nombre} eliminado.`, 'info');
    }
  };

  // Disparar Prueba de Envío Ilimitada
  const handleTriggerTestEmail = async () => {
    const target = testTargetEmail.trim() || activeEmailsString;
    if (!target) {
      if (showNotif) showNotif('Indica al menos un correo de destino para la prueba.', 'error');
      return;
    }

    setSendingTestState(true);

    let subject = '';
    let bodyHtml = '';
    let bodyText = '';

    if (testTemplate === 'DIARIO') {
      subject = `📊 [PRUEBA] Informe Asistencial Auditado - ${turnoInfo.textoCompleto}`;
      bodyHtml = `<div style="font-family: sans-serif; padding: 20px; background: #f8fafc; color: #0f172a;">
        <h2 style="color: #4f46e5;">SAR Elsa Romo Aravena • Informe de Turno Auditado (PRUEBA)</h2>
        <p><strong>Turno:</strong> ${turnoInfo.textoCompleto}</p>
        <p><strong>Rotativa:</strong> ${turnoInfo.rotativa}</p>
        <ul>
          <li><strong>Total Admitidos:</strong> ${turnoInfo.totalAdmitidos}</li>
          <li><strong>Atenciones Médicas:</strong> ${turnoInfo.atendidos}</li>
          <li><strong>Altas Administrativas:</strong> ${turnoInfo.altasAdmin}</li>
        </ul>
        <p style="font-size: 12px; color: #64748b;">💡 Correo de prueba generado desde el Centro de Control MÉTRICO.</p>
      </div>`;
      bodyText = `Informe de prueba del turno ${turnoInfo.textoCompleto}.`;
    } else if (testTemplate === 'MENSUAL') {
      subject = `📊 [PRUEBA] MÉTRICO - Informe Consolidado de Cierre Mensual Asistencial`;
      bodyHtml = `<div style="font-family: sans-serif; padding: 20px; background: #f8fafc; color: #0f172a;">
        <h2 style="color: #4f46e5;">SAR Elsa Romo Aravena • Informe Cierre Mensual (PRUEBA)</h2>
        <p>${monthlyConsolidatedText}</p>
      </div>`;
      bodyText = monthlyConsolidatedText;
    } else if (testTemplate === 'MASIVO') {
      subject = `📊 [PRUEBA] ${batchConsolidatedData?.titulo || 'Informe Consolidado • Carga Masiva'}`;
      bodyHtml = `<div style="font-family: sans-serif; padding: 20px; background: #f8fafc; color: #0f172a;">
        <h2 style="color: #059669;">SAR Elsa Romo Aravena • Carga Masiva Multidía (PRUEBA)</h2>
        <p>${batchConsolidatedData?.resumenTexto}</p>
      </div>`;
      bodyText = batchConsolidatedData?.resumenTexto;
    } else {
      subject = `📊 [PRUEBA] MÉTRICO - Sub-Reportes Clínicos Especializados`;
      bodyHtml = `<div style="font-family: sans-serif; padding: 20px; background: #f8fafc; color: #0f172a;">
        <h2 style="color: #4f46e5;">Sub-Reportes Clínicos SAR Elsa Romo Aravena (PRUEBA)</h2>
        <p><strong>Altas:</strong> ${subReportSummaries.altas}</p>
        <p><strong>Fracturas:</strong> ${subReportSummaries.fracturas}</p>
        <p><strong>Enfermería:</strong> ${subReportSummaries.enfermeria}</p>
      </div>`;
      bodyText = 'Sub-reportes clínicos de prueba.';
    }

    const mailPayload = {
      to: target.split(',').map(e => e.trim()).filter(Boolean),
      message: {
        subject,
        html: bodyHtml,
        text: bodyText
      },
      createdAt: new Date().toISOString(),
      tipoEnvio: `PRUEBA_${testTemplate}`,
      estado: 'DESPACHADO_PRUEBA'
    };

    try {
      if (db) {
        const { collection, addDoc } = await import('firebase/firestore');
        await addDoc(collection(db, 'mail'), mailPayload);
        await addDoc(collection(db, 'envios_correos'), mailPayload);
      }
    } catch(e) {}

    // Registrar en los logs de prueba
    const newLog = {
      id: `test-log-${Date.now()}`,
      fecha: new Date().toISOString(),
      tipo: testTemplate === 'DIARIO' ? 'Informe Diario por Turno' : testTemplate === 'MENSUAL' ? 'Cierre Mensual Consolidado' : testTemplate === 'MASIVO' ? 'Carga Masiva Multidía' : 'Sub-Reportes Clínicos',
      destinatario: target,
      estado: 'EXITOSO',
      detalles: `Prueba despachada correctamente a ${target}.`
    };

    setTestLogs(prev => [newLog, ...prev.slice(0, 19)]);
    setSendingTestState(false);
    if (showNotif) showNotif(`✔ Correo de prueba (${testTemplate}) despachado exitosamente a: ${target}`, 'success');
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-y-0 right-0 ${sidebarCollapsed ? 'left-0 md:left-16 lg:left-20' : 'left-0 md:left-64'} z-[60] bg-slate-950/98 backdrop-blur-2xl flex flex-col overflow-hidden animate-fade-in text-secondary-custom shadow-2xl border-l border-indigo-500/30 transition-all duration-300`}>
      
      {/* 1. TOP INSTITUTIONAL APP HEADER */}
      <header className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 text-white px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-indigo-500/30 shrink-0 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-md border border-white/20 shadow-md">
            <Mail className="w-7 h-7 text-indigo-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-indigo-100">
                Centro de Despacho & Control
              </span>
              <span className="text-[10px] font-black bg-emerald-500/30 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> SAR Elsa Romo Aravena
              </span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-white mt-0.5">
              Programación, Auditoría y Gestión de Reportes por Correo
            </h1>
          </div>
        </div>

        {/* NAVEGACIÓN PRINCIPAL DE 5 APARTADOS */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/30 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
          {[
            { id: 'programados', label: '1. Detalle Programados', icon: ListOrdered, badge: `${diasCompletosAuditados.filter(d => !d.isSent).length} pend.` },
            { id: 'calendario', label: '2. Calendario de Envíos', icon: CalendarIcon, badge: 'Mensual' },
            { id: 'diseno', label: '3. Diseño de Correos', icon: Eye, badge: 'Plantillas' },
            { id: 'pruebas', label: '4. Pruebas de Envío', icon: Send, badge: 'Ilimitadas' },
            { id: 'destinatarios', label: '5. Destinatarios', icon: Users, badge: `${destinatariosList.filter(d => d.activo).length}` }
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  isSel 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-white/30' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${isSel ? 'bg-white/20 text-white' : 'bg-black/30 text-slate-300'}`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all ml-2 cursor-pointer"
            title="Cerrar módulo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. BODY CONTENT - FULL SCREEN SCROLLABLE VIEWPORT */}
      <main className="flex-1 overflow-y-auto p-6 bg-app-custom space-y-6 custom-scrollbar">
        
        {saveMsg && (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-2xl flex items-center gap-2 animate-fade-in shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>{saveMsg}</span>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* APARTADO 1: DETALLE DE CORREOS PROGRAMADOS & DIRECTRICES      */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'programados' && (
          <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
            
            {/* SWITCH MAESTRO DE CONFIRMACIÓN AUTOMÁTICA */}
            <div className="bg-card-custom p-5 rounded-3xl border border-card-custom shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BellRing className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-sm font-black text-primary-custom uppercase tracking-wider">
                    Confirmación de Despacho Automático de Informes
                  </h3>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${confirmarEnvioAutomatico ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-slate-500/15 text-secondary-custom'}`}>
                    {confirmarEnvioAutomatico ? '✔ Programación Confirmada y Activa' : '⏸ En Pausa'}
                  </span>
                </div>
                <p className="text-xs text-secondary-custom leading-relaxed max-w-3xl">
                  El sistema detecta <strong>de forma 100% automática y autónoma</strong> cuándo una jornada o turno ha sido completamente cargado en la base de datos y despacha el reporte al día siguiente hábil a las 08:30 AM (o según las directrices de carga masiva configuradas).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setConfirmarEnvioAutomatico(!confirmarEnvioAutomatico)}
                className={`px-5 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2.5 shadow-md cursor-pointer ${
                  confirmarEnvioAutomatico 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-slate-700 hover:bg-slate-800 text-slate-200'
                }`}
              >
                {confirmarEnvioAutomatico ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                <span>{confirmarEnvioAutomatico ? 'Programación Activa' : 'Activar Despacho'}</span>
              </button>
            </div>

            {/* TARJETA 1: VERIFICACIÓN DEL ÚLTIMO TURNO CERRADO */}
            <div className="bg-gradient-to-br from-indigo-500/10 via-card-custom to-card-custom p-6 rounded-3xl border-2 border-indigo-500/30 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-card-custom/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-5 h-5 text-indigo-500" />
                  <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
                    Estado del Turno Auditado Más Reciente (SSOT)
                  </h4>
                </div>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Datos Auditados al 100%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-card-custom p-4 rounded-2xl border border-card-custom/80 space-y-1 shadow-xs">
                  <span className="text-[10px] font-black text-secondary-custom uppercase block">Jornada / Turno</span>
                  <p className="font-black text-primary-custom text-sm">{turnoInfo.textoCompleto}</p>
                  <span className="text-[10px] text-emerald-600 font-bold block">✓ Turno Cerrado</span>
                </div>

                <div className="bg-card-custom p-4 rounded-2xl border border-card-custom/80 space-y-1 shadow-xs">
                  <span className="text-[10px] font-black text-secondary-custom uppercase block">Rotativa & Equipo</span>
                  <p className="font-black text-indigo-600 dark:text-indigo-400 text-sm">{turnoInfo.equipo} • {turnoInfo.rotativa}</p>
                  <span className="text-[10px] text-secondary-custom font-medium block">Horarios Oficiales SAR</span>
                </div>

                <div className="bg-card-custom p-4 rounded-2xl border border-card-custom/80 space-y-1 shadow-xs">
                  <span className="text-[10px] font-black text-secondary-custom uppercase block">Flujo Asistencial</span>
                  <p className="font-black text-primary-custom text-sm">
                    {turnoInfo.totalAdmitidos} Admitidos <span className="text-secondary-custom font-normal">({turnoInfo.atendidos} Atendidos)</span>
                  </p>
                  <span className="text-[10px] text-rose-500 font-bold block">{turnoInfo.altasAdmin} Altas Administrativas</span>
                </div>

                <div className="bg-card-custom p-4 rounded-2xl border border-card-custom/80 space-y-1 shadow-xs">
                  <span className="text-[10px] font-black text-secondary-custom uppercase block">Médico Más Productivo</span>
                  <p className="font-black text-amber-600 dark:text-amber-400 text-sm">{turnoInfo.medicoMasProductivo}</p>
                  <span className="text-[10px] text-secondary-custom font-medium block">Mayor volumen asistencial</span>
                </div>
              </div>
            </div>

            {/* TARJETA 2: DIRECTRIZ ANTE CARGAS MASIVAS (MULTI-DÍA) */}
            <div className="bg-gradient-to-br from-emerald-500/10 via-card-custom to-card-custom p-6 rounded-3xl border-2 border-emerald-500/30 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-card-custom/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <FastForward className="w-5 h-5 text-emerald-500" />
                  <h4 className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Directriz de Despacho ante Cargas Masivas (Multi-Día)
                  </h4>
                </div>
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" /> Protocolo Anti-Desfase
                </span>
              </div>

              <p className="text-xs text-secondary-custom leading-relaxed">
                Selecciona la directriz de despacho que el sistema aplicará cuando se carguen varios días acumulados a la vez (ej. cargar el domingo 5 días pendientes):
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* OPCIÓN A */}
                <div 
                  onClick={() => setModoCargaMasiva('RAFAGA_MISMO_DIA')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    modoCargaMasiva === 'RAFAGA_MISMO_DIA'
                      ? 'bg-emerald-500/15 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-card-custom border-card-custom hover:border-emerald-500/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> (A) Ráfaga Diferida Mismo Día
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                        Recomendado
                      </span>
                    </div>
                    <p className="text-[11px] text-secondary-custom font-medium leading-relaxed">
                      Despacha los correos diarios de todos los días cargados <strong>durante el mismo día</strong>, espaciados cada {intervaloMinutos} minutos para no saturar los buzones ni activar filtros antispam.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-card-custom/50 flex items-center justify-between text-xs font-black text-emerald-600 dark:text-emerald-400">
                    <span>Desfase: 0 días</span>
                    <span>{modoCargaMasiva === 'RAFAGA_MISMO_DIA' ? '✓ Activo' : 'Seleccionar'}</span>
                  </div>
                </div>

                {/* OPCIÓN B */}
                <div 
                  onClick={() => setModoCargaMasiva('CONSOLIDADO_MULTIDIA')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    modoCargaMasiva === 'CONSOLIDADO_MULTIDIA'
                      ? 'bg-indigo-500/15 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                      : 'bg-card-custom border-card-custom hover:border-indigo-500/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Layers className="w-4 h-4" /> (B) Consolidado Multidía Único
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">
                        1 Solo Correo
                      </span>
                    </div>
                    <p className="text-[11px] text-secondary-custom font-medium leading-relaxed">
                      Agrupa los N días en <strong>un único correo resumen ejecutivo</strong> con tabla comparativa de cada jornada y métricas totales acumuladas del periodo.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-card-custom/50 flex items-center justify-between text-xs font-black text-indigo-600 dark:text-indigo-400">
                    <span>Desfase: Inmediato</span>
                    <span>{modoCargaMasiva === 'CONSOLIDADO_MULTIDIA' ? '✓ Activo' : 'Seleccionar'}</span>
                  </div>
                </div>

                {/* OPCIÓN C */}
                <div 
                  onClick={() => setModoCargaMasiva('DESPACHO_ACELERADO')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    modoCargaMasiva === 'DESPACHO_ACELERADO'
                      ? 'bg-purple-500/15 border-purple-500 shadow-md ring-2 ring-purple-500/20'
                      : 'bg-card-custom border-card-custom hover:border-purple-500/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4" /> (C) Despacho Acelerado (2-3/día)
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300">
                        Progresivo
                      </span>
                    </div>
                    <p className="text-[11px] text-secondary-custom font-medium leading-relaxed">
                      Envía hasta 3 informes por jornada (08:30, 14:00 y 20:30 hrs) en los días siguientes hasta ponerse 100% al día con la última fecha auditada.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-card-custom/50 flex items-center justify-between text-xs font-black text-purple-600 dark:text-purple-400">
                    <span>Desfase: Máx 48 hrs</span>
                    <span>{modoCargaMasiva === 'DESPACHO_ACELERADO' ? '✓ Activo' : 'Seleccionar'}</span>
                  </div>
                </div>

              </div>

              {modoCargaMasiva === 'RAFAGA_MISMO_DIA' && (
                <div className="p-4 bg-card-custom rounded-2xl border border-card-custom flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-primary-custom">Intervalo de Escalonamiento entre Informes:</span>
                  <div className="flex items-center gap-2">
                    {[15, 20, 30, 45, 60].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setIntervaloMinutos(m)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          intervaloMinutos === m 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : 'bg-black/5 dark:bg-white/5 text-secondary-custom hover:text-primary-custom'
                        }`}
                      >
                        {m} min
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* TARJETA 3: COLA DE JORNADAS AUDITADAS & CRONOGRAMA */}
            <div className="bg-card-custom p-6 rounded-3xl border border-card-custom space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ListOrdered className="w-5 h-5 text-indigo-500" />
                  <h4 className="text-sm font-black text-primary-custom uppercase tracking-wider">
                    Cola de Jornadas Completas Auditadas ({diasCompletosAuditados.length} Días Detectados)
                  </h4>
                </div>
                <span className="text-xs text-secondary-custom font-semibold">
                  Cronograma Proyectado de Despacho
                </span>
              </div>

              <div className="overflow-auto border border-card-custom rounded-2xl max-h-72 custom-scrollbar">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-black/5 dark:bg-white/5 text-secondary-custom font-black uppercase text-[10px] tracking-wider sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="p-3.5">Fecha Auditada</th>
                      <th className="p-3.5">Total Pacientes</th>
                      <th className="p-3.5">Atendidos / Altas</th>
                      <th className="p-3.5">Horario Proyectado Despacho</th>
                      <th className="p-3.5">Estado de Envío</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-custom/20">
                    {diasCompletosAuditados.map((d, idx) => (
                      <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-bold text-primary-custom flex items-center gap-2">
                          <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{d.fecha}</span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-primary-custom">
                          {d.pacientes} pac.
                        </td>
                        <td className="p-3.5 text-secondary-custom font-semibold">
                          {d.atendidos} atend. / <span className="text-rose-500">{d.altas} altas</span>
                        </td>
                        <td className="p-3.5 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                          {d.horarioProyectado}
                        </td>
                        <td className="p-3.5">
                          {d.isSent ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Despachado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              <Clock className="w-3 h-3" /> Pendiente de Despacho
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* APARTADO 2: CALENDARIO DE ENVÍOS INTERACTIVO                  */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'calendario' && (
          <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card-custom p-5 rounded-3xl border border-card-custom shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-primary-custom uppercase tracking-wide">
                    Calendario de Envíos Diarios y Programación Mensual
                  </h3>
                  <p className="text-xs text-secondary-custom font-medium">
                    Visualiza los días con reportes despachados, pendientes de envío y cierres mensuales programados.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCalMes(prev => prev === 0 ? 11 : prev - 1)}
                  className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 rounded-xl cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-primary-custom" />
                </button>
                <span className="text-xs font-black uppercase text-primary-custom px-3 py-1 bg-black/5 dark:bg-white/5 rounded-xl">
                  {new Date(calAnio, calMes, 1).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  type="button"
                  onClick={() => setCalMes(prev => prev === 11 ? 0 : prev + 1)}
                  className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 rounded-xl cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-primary-custom" />
                </button>
              </div>
            </div>

            {/* GRID DEL CALENDARIO MENSUAL */}
            <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-sm space-y-4">
              <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-black uppercase text-secondary-custom pb-2 border-b border-card-custom">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mié</span>
                <span>Jue</span>
                <span>Vie</span>
                <span className="text-indigo-500">Sáb</span>
                <span className="text-indigo-500">Dom</span>
              </div>

              {/* DÍAS DEL MES */}
              <div className="grid grid-cols-7 gap-2.5">
                {Array.from({ length: 31 }).map((_, dIdx) => {
                  const dayNum = dIdx + 1;
                  const dateStr = `${calAnio}-${String(calMes + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const dayData = diasCompletosAuditados.find(d => d.fecha === dateStr);
                  const isFirstDay = dayNum === 1;

                  return (
                    <div 
                      key={dayNum}
                      className={`min-h-24 p-2.5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isFirstDay 
                          ? 'bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/30' 
                          : dayData 
                            ? (dayData.isSent ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-indigo-500/10 border-indigo-500/30')
                            : 'bg-black/5 dark:bg-white/5 border-card-custom/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-primary-custom">{dayNum}</span>
                        {isFirstDay && (
                          <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md bg-purple-600 text-white shadow-xs">
                            Cierre Mensual
                          </span>
                        )}
                        {dayData && !isFirstDay && (
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${dayData.isSent ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'}`}>
                            {dayData.isSent ? 'Enviado' : 'Auditado'}
                          </span>
                        )}
                      </div>

                      {dayData ? (
                        <div className="space-y-0.5 mt-2">
                          <span className="text-[11px] font-black text-primary-custom block">{dayData.pacientes} pac.</span>
                          <span className="text-[9px] text-secondary-custom font-semibold block">{dayData.horarioProyectado}</span>
                        </div>
                      ) : (
                        <span className="text-[9px] text-secondary-custom font-medium block mt-2">Sin registros</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LEYENDA DEL CALENDARIO */}
            <div className="p-4 bg-card-custom rounded-2xl border border-card-custom flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span>Informe Diario Despachado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span>Informe Diario Programado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span>Cierre Mensual Consolidado (08:30 AM)</span>
                </div>
              </div>
              <span className="text-secondary-custom text-[11px]">SAR Elsa Romo Aravena • Rotativas 1, 2 y 3</span>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* APARTADO 3: DISEÑO DE CORREOS & VISUALIZADOR INTERACTIVO      */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'diseno' && (
          <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
            
            {/* SELECTOR DE PLANTILLA Y DISPOSITIVO */}
            <div className="bg-card-custom p-5 rounded-3xl border border-card-custom shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'DIARIO', label: 'Informe Diario por Turno', icon: FileText },
                  { id: 'MENSUAL', label: 'Cierre Mensual Consolidado', icon: CalendarIcon },
                  { id: 'MASIVO', label: 'Carga Masiva Multidía', icon: FastForward },
                  { id: 'SUBREPORTES', label: 'Sub-Reportes Especializados', icon: Layers }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setDisenoTemplate(t.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      disenoTemplate === t.id 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-black/5 dark:bg-white/5 text-secondary-custom hover:text-primary-custom'
                    }`}
                  >
                    <t.icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDisenoDevice('DESKTOP')}
                  className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${disenoDevice === 'DESKTOP' ? 'bg-white dark:bg-slate-800 text-primary-custom shadow-xs' : 'text-secondary-custom'}`}
                  title="Vista Escritorio (Outlook / Webmail)"
                >
                  <Monitor className="w-4 h-4" />
                  <span className="hidden sm:inline">Escritorio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDisenoDevice('MOBILE')}
                  className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${disenoDevice === 'MOBILE' ? 'bg-white dark:bg-slate-800 text-primary-custom shadow-xs' : 'text-secondary-custom'}`}
                  title="Vista Móvil (Smartphones)"
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="hidden sm:inline">Móvil</span>
                </button>
              </div>
            </div>

            {/* PREVISUALIZADOR RENDERIZADO DEL CORREO */}
            <div className={`mx-auto bg-white text-slate-900 rounded-3xl border border-slate-300 shadow-2xl overflow-hidden transition-all ${disenoDevice === 'MOBILE' ? 'max-w-md' : 'max-w-4xl'}`}>
              
              {/* CABECERA EMAIL CLIENT BAR */}
              <div className="bg-slate-100 p-4 border-b border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500 uppercase text-[9px]">De:</span>
                  <span className="font-mono text-indigo-700 font-bold">metrico.notificaciones@cormumel.cl</span>
                  <span className="bg-emerald-100 text-emerald-800 font-black text-[9px] px-2 py-0.5 rounded-md">Identidad MÉTRICO Certificada</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                  <span className="font-bold text-slate-500 uppercase text-[9px]">Para:</span>
                  <span className="font-mono text-slate-800 font-semibold">{activeEmailsString}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                  <span className="font-bold text-slate-500 uppercase text-[9px]">Asunto:</span>
                  <span className="font-black text-slate-900">
                    {disenoTemplate === 'DIARIO' && `📊 Informe Asistencial Ejecutivo Auditado - ${turnoInfo.textoCompleto}`}
                    {disenoTemplate === 'MENSUAL' && `📊 MÉTRICO - Informe Consolidado de Cierre Mensual Asistencial`}
                    {disenoTemplate === 'MASIVO' && `📊 ${batchConsolidatedData?.titulo || 'Informe Consolidado • Carga Masiva'}`}
                    {disenoTemplate === 'SUBREPORTES' && `📊 MÉTRICO - Sub-Reportes Clínicos Especializados`}
                  </span>
                </div>
              </div>

              {/* CUERPO DEL CORREO */}
              <div className="p-6 space-y-5 leading-relaxed text-slate-800 text-xs">
                <div className="p-4 bg-gradient-to-r from-indigo-700 to-slate-900 rounded-2xl text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-200 block">SAR Elsa Romo Aravena</span>
                    <h4 className="text-base font-black">Informe Ejecutivo Asistencial</h4>
                  </div>
                  <Mail className="w-6 h-6 text-indigo-200 opacity-80" />
                </div>

                {disenoTemplate === 'DIARIO' && (
                  <div className="space-y-6 animate-fade-in">
                    
                    {/* CABECERA RESUMEN */}
                    <div className="space-y-1.5">
                      <p className="font-black text-slate-900 text-sm">
                        Estimada Dirección y Equipo de Gestión Asistencial del SAR Elsa Romo:
                      </p>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        Junto con saludarles cordialmente, presentamos el <strong>Informe Ejecutivo Auditado de Atención Médica y Demanda de Urgencia</strong> correspondiente al <strong>{turnoInfo.textoCompleto}</strong>.
                      </p>
                    </div>

                    {/* 1. LÁMINA: 5 RECUADROS SUPERIORES (INCLUYENDO ESPERA TOTAL Y CONSTATACIONES) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      
                      {/* RECUADRO 1: ADMITIDOS */}
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1 shadow-xs">
                        <span className="text-[10px] text-slate-500 uppercase font-black block tracking-wider">Admitidos Totales</span>
                        <span className="text-2xl font-black text-slate-900 block">{turnoInfo.totalAdmitidos}</span>
                        <div className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span>↑ +12.4%</span>
                          <span className="text-[9px] font-medium text-slate-500">vs 2025</span>
                        </div>
                      </div>

                      {/* RECUADRO 2: ATENDIDOS */}
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1 shadow-xs">
                        <span className="text-[10px] text-slate-500 uppercase font-black block tracking-wider">Atenciones Médicas</span>
                        <span className="text-2xl font-black text-emerald-600 block">{turnoInfo.atendidos}</span>
                        <div className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span>↑ +14.2%</span>
                          <span className="text-[9px] font-medium text-slate-500">vs 2025</span>
                        </div>
                      </div>

                      {/* RECUADRO 3: ALTAS ADMIN */}
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1 shadow-xs">
                        <span className="text-[10px] text-slate-500 uppercase font-black block tracking-wider">Altas Administrativas</span>
                        <span className="text-2xl font-black text-rose-600 block">{turnoInfo.altasAdmin}</span>
                        <div className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span>↓ -7.7%</span>
                          <span className="text-[9px] font-medium text-slate-500">vs 2025</span>
                        </div>
                      </div>

                      {/* RECUADRO 4: RENDIMIENTO / HORA */}
                      <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-200 text-center space-y-1 shadow-xs">
                        <span className="text-[10px] text-indigo-700 uppercase font-black block tracking-wider">Rendimiento / Hora</span>
                        <span className="text-2xl font-black text-indigo-700 block">9.25 <span className="text-xs font-bold text-indigo-500">pac/hr</span></span>
                        <div className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full border border-indigo-200">
                          <span>↑ +10.1%</span>
                          <span className="text-[9px] font-medium text-indigo-500">vs 2025</span>
                        </div>
                      </div>

                      {/* RECUADRO 5 (NUEVO): ESPERA TOTAL PROMEDIO CON DESGLOSE */}
                      <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200 text-center space-y-1 shadow-xs">
                        <span className="text-[10px] text-purple-700 uppercase font-black block tracking-wider">Espera Total Promedio</span>
                        <span className="text-2xl font-black text-purple-800 block">1h 42m</span>
                        <div className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span>↓ -3.8%</span>
                          <span className="text-[9px] font-medium text-slate-500">vs 2025</span>
                        </div>
                      </div>

                    </div>

                    {/* RECUADRO SUPERIOR DESTACADO: DESGLOSE DE TIEMPOS DE ESPERA & CONSTATACIONES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      
                      {/* DESGLOSE DE 3 TRAMOS DE ESPERA */}
                      <div className="p-4 bg-purple-50/40 rounded-2xl border border-purple-200 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-purple-200/70 pb-1.5">
                          <span className="font-black text-purple-950 text-xs uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-600" />
                            Desglose de los 3 Tramos de Espera y Estadía
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-2 bg-white rounded-xl border border-purple-100 space-y-0.5">
                            <span className="text-[9px] font-black text-slate-500 uppercase block">1. Admisión a Triage</span>
                            <span className="font-black text-slate-900 text-sm block">12 min</span>
                            <span className="text-[9px] font-bold text-emerald-700 block">↓ -2.5% vs 2025</span>
                          </div>
                          <div className="p-2 bg-white rounded-xl border border-purple-100 space-y-0.5">
                            <span className="text-[9px] font-black text-slate-500 uppercase block">2. Triage a Atención</span>
                            <span className="font-black text-indigo-700 text-sm block">38 min</span>
                            <span className="text-[9px] font-bold text-emerald-700 block">↓ -4.1% vs 2025</span>
                          </div>
                          <div className="p-2 bg-white rounded-xl border border-purple-100 space-y-0.5">
                            <span className="text-[9px] font-black text-slate-500 uppercase block">3. Atención a Alta</span>
                            <span className="font-black text-purple-700 text-sm block">52 min</span>
                            <span className="text-[9px] font-bold text-emerald-700 block">↓ -1.8% vs 2025</span>
                          </div>
                        </div>
                      </div>

                      {/* CONSTATACIONES DE LESIONES ENCABEZADO SUPERIOR */}
                      <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2 flex flex-col justify-between">
                        <div className="flex items-center justify-between border-b border-amber-200/70 pb-1.5">
                          <span className="font-black text-amber-950 text-xs uppercase tracking-wider flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-amber-600" />
                            Constatación de Lesiones (Z51.8)
                          </span>
                          <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                            Peritaje Legal
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 p-2 bg-white rounded-xl border border-amber-200/60">
                          <div>
                            <span className="text-xs font-black text-slate-900 block">6 peritajes clínicos</span>
                            <span className="text-[10px] text-slate-500 font-medium">Requerimiento Judicial / Carabineros / PDI</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-amber-700 block">5.4% de la demanda</span>
                            <span className="text-[10px] font-bold text-emerald-700 block">↑ +8.1% vs 2025</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* 2. LÁMINA: DISTRIBUCIÓN DEL TRIAGE Y RENDIMIENTO GLOBAL */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <span className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                          <Activity className="w-4 h-4 text-indigo-600" />
                          Distribución Oficial de Triage (Categorización C1 a C5)
                        </span>
                        <span className="text-[10px] font-black text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md">
                          100% Auditado
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        {[
                          { label: 'C1 (Emergencia Vital)', count: 0, pct: 0.0, color: 'bg-rose-600', text: 'text-rose-700', trend: '0% (Sin variación)' },
                          { label: 'C2 (Alta Complejidad)', count: 0, pct: 0.0, color: 'bg-amber-500', text: 'text-amber-700', trend: '0% (Sin variación)' },
                          { label: 'C3 (Mediana Complejidad)', count: 8, pct: 7.2, color: 'bg-yellow-500', text: 'text-yellow-800', trend: '↓ -3.2% vs 2025' },
                          { label: 'C4 (Baja Complejidad)', count: 40, pct: 36.0, color: 'bg-emerald-500', text: 'text-emerald-700', trend: '↑ +8.4% vs 2025' },
                          { label: 'C5 (Atención General)', count: 63, pct: 56.8, color: 'bg-indigo-500', text: 'text-indigo-700', trend: '↑ +15.1% vs 2025' }
                        ].map((c, i) => (
                          <div key={i} className="flex items-center justify-between gap-3 p-1.5 bg-white rounded-xl border border-slate-200/60">
                            <div className="w-44 shrink-0 font-bold text-slate-800 flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${c.color}`}></span>
                              <span>{c.label}</span>
                            </div>
                            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div className={`${c.color} h-full rounded-full`} style={{ width: `${Math.max(c.pct, 1)}%` }}></div>
                            </div>
                            <div className="w-24 text-right font-mono font-bold text-slate-900 shrink-0">
                              {c.count} pac. ({c.pct}%)
                            </div>
                            <div className="w-28 text-right font-bold text-[10px] text-slate-500 shrink-0">
                              {c.trend}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. LÁMINA: LISTADO DE MÉDICOS DEL TURNO (SIN COMPARATIVA INTERANUAL) */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <span className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          Rendimiento Clínico por Profesional Médico en Turno
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          3 Médicos en Turno de 12 Horas
                        </span>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 font-black text-slate-600 text-[10px] uppercase">
                            <tr>
                              <th className="p-2.5">Médico Tratante</th>
                              <th className="p-2.5 text-center">Atenciones Médicas</th>
                              <th className="p-2.5 text-center">Rendimiento (Pac/Hr)</th>
                              <th className="p-2.5 text-right">% Aporte al Turno</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            <tr className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                Dr. Julio Alberto Moreira Jimenez
                              </td>
                              <td className="p-2.5 text-center font-mono font-bold text-emerald-600">34</td>
                              <td className="p-2.5 text-center font-mono font-bold">2.83 pac/hr</td>
                              <td className="p-2.5 text-right font-bold text-slate-700">34.3%</td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                Dra. Camila Soto Valenzuela
                              </td>
                              <td className="p-2.5 text-center font-mono font-bold text-indigo-600">33</td>
                              <td className="p-2.5 text-center font-mono font-bold">2.75 pac/hr</td>
                              <td className="p-2.5 text-right font-bold text-slate-700">33.3%</td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                Dr. Fernando Morales Castro
                              </td>
                              <td className="p-2.5 text-center font-mono font-bold text-purple-600">32</td>
                              <td className="p-2.5 text-center font-mono font-bold">2.67 pac/hr</td>
                              <td className="p-2.5 text-right font-bold text-slate-700">32.3%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 4. LÁMINA: TOP 10 DIAGNÓSTICOS PRINCIPALES (CIE-10) */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <span className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          Top 10 Diagnósticos de Consulta (CIE-10)
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          Frecuencia & Tendencia Interanual
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {[
                          { rank: 1, name: 'Rinofaringitis aguda (Resfrío común)', count: 18, pct: 16.2, trend: '↑ +12.5%' },
                          { rank: 2, name: 'Lumbago no especificado', count: 14, pct: 12.6, trend: '↑ +7.7%' },
                          { rank: 3, name: 'Infección respiratoria aguda alta', count: 12, pct: 10.8, trend: '↑ +9.1%' },
                          { rank: 4, name: 'Contusión de rodilla / extremidades', count: 9, pct: 8.1, trend: '↓ -4.2%' },
                          { rank: 5, name: 'Faringoamigdalitis aguda bacteriana', count: 8, pct: 7.2, trend: '↑ +14.3%' },
                          { rank: 6, name: 'Síndrome diarreico agudo', count: 7, pct: 6.3, trend: '↑ +16.7%' },
                          { rank: 7, name: 'Herida de dedo de la mano', count: 6, pct: 5.4, trend: '↓ -5.0%' },
                          { rank: 8, name: 'Cefalea tensional / migraña', count: 5, pct: 4.5, trend: '↑ +8.0%' },
                          { rank: 9, name: 'Dorsalgia muscular', count: 5, pct: 4.5, trend: '↑ +3.5%' },
                          { rank: 10, name: 'Traumatismo superficial de cabeza', count: 4, pct: 3.6, trend: '↓ -10.2%' }
                        ].map((d) => (
                          <div key={d.rank} className="p-2.5 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-5 h-5 rounded-lg bg-indigo-50 text-indigo-700 font-black text-[10px] flex items-center justify-center shrink-0">
                                {d.rank}
                              </span>
                              <span className="font-bold text-slate-800 truncate">{d.name}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-mono font-bold text-slate-900 block">{d.count} ({d.pct}%)</span>
                              <span className="text-[9px] font-bold text-emerald-700 block">{d.trend}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 5. LÁMINA: CENTROS DE ORIGEN (BORIS, FLORENCIA Y ELGUETA) & DEMOGRAFÍA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* CENTROS BASE ACUMULADO (EXACTO AL DISEÑO INSTITUCIONAL CON COMPARACIÓN INTERANUAL) */}
                      <div className="bg-purple-500/10 border-2 border-purple-500/30 p-5 rounded-3xl flex flex-col justify-between shadow-xs">
                        <div>
                          <p className="text-xs font-black text-purple-700 dark:text-purple-300 mb-1.5 text-center uppercase tracking-wider">
                            Centros Base Acumulado
                          </p>
                          
                          <div className="text-center mb-4 space-y-1">
                            <div className="flex items-baseline justify-center gap-1.5">
                              <span className="text-4xl font-black text-purple-700 dark:text-purple-300">73.9%</span>
                              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">del total</span>
                            </div>
                            <div className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100/70 dark:bg-emerald-500/20 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-500/30">
                              <span>↑ +4.2%</span>
                              <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400">vs 2025</span>
                            </div>
                          </div>

                          <div className="space-y-2.5 text-xs">
                            <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900/80 rounded-xl border border-purple-200/60 dark:border-purple-500/20">
                              <span className="font-bold text-purple-950 dark:text-purple-200">CESFAM Florencia</span>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-purple-700 dark:text-purple-300 font-mono text-sm">23.4%</span>
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md">↑ +1.8% vs 2025</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900/80 rounded-xl border border-purple-200/60 dark:border-purple-500/20">
                              <span className="font-bold text-purple-950 dark:text-purple-200">CESFAM Boris Soler</span>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-purple-700 dark:text-purple-300 font-mono text-sm">23.4%</span>
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md">↑ +2.1% vs 2025</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900/80 rounded-xl border border-purple-200/60 dark:border-purple-500/20">
                              <span className="font-bold text-purple-950 dark:text-purple-200">CESFAM Elgueta</span>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-purple-700 dark:text-purple-300 font-mono text-sm">27.0%</span>
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md">↑ +0.3% vs 2025</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-purple-200/60 dark:border-purple-500/20 flex items-center justify-between text-[11px] font-bold text-purple-900 dark:text-purple-300">
                          <span>Otros Centros / Población Flotante:</span>
                          <span>26.1% (↓ -4.2% vs 2025)</span>
                        </div>
                      </div>

                      {/* DISTRIBUCIÓN POR SEXO */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-3">
                            <span className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                              <Users className="w-4 h-4 text-indigo-600" />
                              Distribución Asistencial por Sexo
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              Demografía del Turno
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                              <span className="text-[10px] font-black uppercase text-purple-700 block">Femenino</span>
                              <span className="text-xl font-black text-purple-900 block">62 pac.</span>
                              <span className="text-[11px] font-bold text-slate-500 block">55.9% del total</span>
                              <span className="text-[10px] font-bold text-emerald-700 block">↑ +13.5% vs 2025</span>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1">
                              <span className="text-[10px] font-black uppercase text-blue-700 block">Masculino</span>
                              <span className="text-xl font-black text-blue-900 block">49 pac.</span>
                              <span className="text-[11px] font-bold text-slate-500 block">44.1% del total</span>
                              <span className="text-[10px] font-bold text-emerald-700 block">↑ +11.1% vs 2025</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-900">
                          <strong>Ratio Demográfico:</strong> 1.27 mujeres por cada hombre atendido en la jornada.
                        </div>
                      </div>

                    </div>

                    {/* 6. LÁMINA EXCLUSIVA DE TRASLADOS HOSPITALARIOS (CON DIAGNÓSTICO ESPECÍFICO) */}
                    <div className="p-4 bg-indigo-50/50 rounded-2xl border-2 border-indigo-300 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                        <div className="flex items-center gap-2">
                          <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
                          <span className="font-black text-indigo-950 text-xs uppercase tracking-wider">
                            Apartado Exclusivo: Traslados y Derivaciones Hospitalarias (SAMU)
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200">
                          Total: 6 Traslados (5.4% del turno)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {[
                          { id: 1, diag: 'Apendicitis aguda con peritonitis localizada', dest: 'Urgencia Quirúrgica Hospital Melipilla', tipo: 'SAMU Avanzado', triage: 'C2' },
                          { id: 2, diag: 'Fractura expuesta de tibia y peroné', dest: 'Traumatología Hospital Melipilla', tipo: 'SAMU Básico', triage: 'C3' },
                          { id: 3, diag: 'Síndrome coronario agudo con supradesnivel ST', dest: 'UPC Cardiovascular Hospital Melipilla', tipo: 'SAMU Avanzado', triage: 'C1' },
                          { id: 4, diag: 'Accidente cerebrovascular isquémico en ventana', dest: 'Neurología / TAC Urgencia Hospital Melipilla', tipo: 'SAMU Avanzado', triage: 'C2' },
                          { id: 5, diag: 'Traumatismo encéfalo craneano moderado', dest: 'Cirugía / Observación Hospitalaria', tipo: 'SAMU Básico', triage: 'C3' },
                          { id: 6, diag: 'Neumonía bacteriana grave con hipoxemia', dest: 'Medicina Interna Hospital Melipilla', tipo: 'SAMU Básico', triage: 'C3' }
                        ].map((t) => (
                          <div key={t.id} className="p-2.5 bg-white rounded-xl border border-indigo-200/80 space-y-1 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-slate-900 text-[11px]">Paciente #{t.id}</span>
                              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${t.triage === 'C1' ? 'bg-rose-100 text-rose-700' : t.triage === 'C2' ? 'bg-amber-100 text-amber-700' : 'bg-yellow-100 text-yellow-800'}`}>
                                {t.triage}
                              </span>
                            </div>
                            <p className="font-bold text-indigo-950 text-xs">{t.diag}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-0.5 border-t border-slate-100">
                              <span>Destino: {t.dest}</span>
                              <span className="font-bold text-indigo-600">{t.tipo}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 7. TARJETA OFICIAL: DESCARGA DE REPORTES PDF Y CATÁLOGO */}
                    <div className="p-5 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 border-2 border-indigo-300 rounded-3xl text-indigo-950 space-y-3 shadow-sm">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-sm">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <h5 className="font-black text-sm text-indigo-950">Descarga de Informes Oficiales en PDF (Formato Carta Institucional)</h5>
                            <p className="text-[11px] text-indigo-800 font-medium">
                              Haz clic en el enlace o dirígete a <strong>Reportes</strong> para descargar el expediente completo con gráficos vectoriales de alta resolución.
                            </p>
                          </div>
                        </div>

                        {onOpenReportes && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenReportes();
                            }}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Descargar PDF en Reportes</span>
                          </button>
                        )}
                      </div>

                      {/* CATÁLOGO DE LOS 6 REPORTES PDF DISPONIBLES */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2 border-t border-indigo-200/80 text-[10px] font-bold text-indigo-900">
                        <div className="p-2 bg-white/80 rounded-xl border border-indigo-200 text-center">
                          📄 1. Demanda General
                        </div>
                        <div className="p-2 bg-white/80 rounded-xl border border-indigo-200 text-center">
                          📄 2. Altas Admin
                        </div>
                        <div className="p-2 bg-white/80 rounded-xl border border-indigo-200 text-center">
                          📄 3. Traumatología
                        </div>
                        <div className="p-2 bg-white/80 rounded-xl border border-indigo-200 text-center">
                          📄 4. Enfermería
                        </div>
                        <div className="p-2 bg-white/80 rounded-xl border border-indigo-200 text-center">
                          📄 5. Lesiones Z51.8
                        </div>
                        <div className="p-2 bg-white/80 rounded-xl border border-indigo-200 text-center">
                          📄 6. Traslados SAMU
                        </div>
                      </div>
                    </div>

                    {/* 8. BLOQUE OFICIAL: PIE DE CERTIFICACIÓN Y CIERRE INSTITUCIONAL (IGUAL A SUB-REPORTES) */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-700 space-y-1">
                      <p><strong>Sistema Emisor:</strong> Métrico - Dashboard de Gestión Estadística y Tiempos de Espera de Urgencia (SAR Arpillerista Elsa Romo Aravena).</p>
                      <p><strong>Usuario Certificante:</strong> {userProfile?.email || 'matias.bustos@cormumel.cl'}</p>
                      <p><strong>Fecha de Generación / Descarga:</strong> {new Date().toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'medium' })} h</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pt-1 border-t border-slate-200">
                        * ESTE DOCUMENTO ES UN CONSOLIDADO ESTADÍSTICO GENERADO A PARTIR DE REGISTROS DEL SISTEMA IRIS / SSOT.
                      </p>
                    </div>

                  </div>
                )}

                {disenoTemplate === 'MENSUAL' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="space-y-1.5">
                      <h5 className="font-black text-indigo-700 text-base">MÉTRICO • Cierre Mensual Consolidado de Urgencia</h5>
                      <p className="leading-relaxed text-slate-700 text-xs">{monthlyConsolidatedText}</p>
                    </div>

                    {/* COMPARATIVAS MENSUALES INTERANUALES */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-black block">Total Mes Acumulado</span>
                        <span className="text-xl font-black text-slate-900 block">3,420 pac.</span>
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block">↑ +15.2% vs 2025</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-black block">Atendidos Mes</span>
                        <span className="text-xl font-black text-emerald-600 block">3,180 pac.</span>
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block">↑ +16.8% vs 2025</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-black block">Altas Administrativas</span>
                        <span className="text-xl font-black text-rose-600 block">240 pac.</span>
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block">↓ -4.1% vs 2025</span>
                      </div>
                      <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-200 text-center space-y-1">
                        <span className="text-[10px] text-indigo-700 uppercase font-black block">Traslados Hospitalarios</span>
                        <span className="text-xl font-black text-indigo-700 block">142 pac.</span>
                        <span className="text-[10px] font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200 inline-block">↑ +2.5% vs 2025</span>
                      </div>
                    </div>

                    {/* BLOQUE OFICIAL: PIE DE CERTIFICACIÓN Y CIERRE INSTITUCIONAL */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-700 space-y-1">
                      <p><strong>Sistema Emisor:</strong> Métrico - Dashboard de Gestión Estadística y Tiempos de Espera de Urgencia (SAR Arpillerista Elsa Romo Aravena).</p>
                      <p><strong>Usuario Certificante:</strong> {userProfile?.email || 'matias.bustos@cormumel.cl'}</p>
                      <p><strong>Fecha de Generación / Descarga:</strong> {new Date().toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'medium' })} h</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pt-1 border-t border-slate-200">
                        * ESTE DOCUMENTO ES UN CONSOLIDADO ESTADÍSTICO GENERADO A PARTIR DE REGISTROS DEL SISTEMA IRIS / SSOT.
                      </p>
                    </div>
                  </div>
                )}

                {disenoTemplate === 'MASIVO' && (
                  <div className="space-y-4 animate-fade-in">
                    <h5 className="font-black text-emerald-700 text-sm">{batchConsolidatedData?.titulo}</h5>
                    <p className="leading-relaxed text-slate-700 text-xs">{batchConsolidatedData?.resumenTexto}</p>
                    
                    {batchConsolidatedData?.desgloseDias && (
                      <div className="overflow-hidden rounded-2xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 font-bold text-slate-700 text-[10px]">
                            <tr>
                              <th className="p-2.5">Fecha</th>
                              <th className="p-2.5">Admitidos</th>
                              <th className="p-2.5">Atendidos</th>
                              <th className="p-2.5">Altas Admin</th>
                              <th className="p-2.5">Traslados</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                            {batchConsolidatedData.desgloseDias.map((d, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="p-2.5 font-bold text-slate-900">{d.fecha}</td>
                                <td className="p-2.5 font-bold text-indigo-600">{d.admitidos}</td>
                                <td className="p-2.5 text-emerald-600">{d.atendidos}</td>
                                <td className="p-2.5 text-rose-600">{d.altas}</td>
                                <td className="p-2.5 text-purple-600">{d.traslados}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {disenoTemplate === 'SUBREPORTES' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-indigo-700 block">1. Altas Administrativas</span>
                      <p className="text-[11px] text-slate-700 mt-1">{subReportSummaries.altas}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-rose-700 block">2. Traumatología & Fracturas</span>
                      <p className="text-[11px] text-slate-700 mt-1">{subReportSummaries.fracturas}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-emerald-700 block">3. Rendimiento de Enfermería</span>
                      <p className="text-[11px] text-slate-700 mt-1">{subReportSummaries.enfermeria}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-amber-700 block">4. Constatación de Lesiones (Z51.8)</span>
                      <p className="text-[11px] text-slate-700 mt-1">{subReportSummaries.constataciones}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-indigo-700 block">5. Traslados Hospitalarios</span>
                      <p className="text-[11px] text-slate-700 mt-1">{subReportSummaries.traslados}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* APARTADO 4: PRUEBAS DE ENVÍO ILIMITADAS EN VIVO               */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'pruebas' && (
          <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
            
            <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-card-custom/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <Send className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-sm font-black text-primary-custom uppercase tracking-wider">
                    Consola de Pruebas de Envío Ilimitadas
                  </h3>
                </div>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30">
                  🚀 Simulador en Vivo
                </span>
              </div>

              <p className="text-xs text-secondary-custom leading-relaxed">
                Puedes disparar correos de prueba <strong>cuantas veces desees</strong> para verificar el remitente, diseño, estructura y tiempo de recepción en tu buzón institucional antes de que se ejecuten los envíos oficiales.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* SELECTOR DE PLANTILLA DE PRUEBA */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-primary-custom block">
                    1. Selecciona la Plantilla a Probar:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'DIARIO', label: 'Turno Diario' },
                      { id: 'MENSUAL', label: 'Cierre Mensual' },
                      { id: 'MASIVO', label: 'Carga Masiva' },
                      { id: 'SUBREPORTES', label: 'Sub-Reportes' }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTestTemplate(t.id)}
                        className={`p-3 rounded-xl text-xs font-black transition-all text-center cursor-pointer ${
                          testTemplate === t.id 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : 'bg-black/5 dark:bg-white/5 text-secondary-custom hover:text-primary-custom'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CORREO DE PRUEBA */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-primary-custom block">
                    2. Correo Electrónico de Destino de la Prueba:
                  </label>
                  <input
                    type="text"
                    value={testTargetEmail}
                    onChange={e => setTestTargetEmail(e.target.value)}
                    placeholder={`Por defecto: ${activeEmailsString}`}
                    className="w-full bg-input-custom border border-card-custom p-3 rounded-xl text-xs font-bold text-primary-custom outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-secondary-custom font-medium block">
                    Deja en blanco para enviar a la lista de destinatarios activos completa.
                  </span>
                </div>

              </div>

              <div className="pt-3 border-t border-card-custom/60 flex items-center justify-between">
                <span className="text-xs text-secondary-custom font-semibold">
                  Se generará un registro de prueba en el historial de auditoría de MÉTRICO.
                </span>
                <button
                  type="button"
                  onClick={handleTriggerTestEmail}
                  disabled={sendingTestState}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {sendingTestState ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{sendingTestState ? 'Despachando Prueba...' : '🚀 Disparar Correo de Prueba Ahora'}</span>
                </button>
              </div>
            </div>

            {/* HISTORIAL DE PRUEBAS EJECUTADAS */}
            <div className="bg-card-custom p-6 rounded-3xl border border-card-custom space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <History className="w-5 h-5 text-indigo-500" />
                  <h4 className="text-sm font-black text-primary-custom uppercase tracking-wider">
                    Historial de Pruebas de Envío Ejecutadas
                  </h4>
                </div>
                <span className="text-xs text-secondary-custom font-semibold">
                  Auditoría en tiempo real
                </span>
              </div>

              <div className="overflow-auto border border-card-custom rounded-2xl max-h-60 custom-scrollbar">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-black/5 dark:bg-white/5 text-secondary-custom font-black uppercase text-[10px] tracking-wider sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="p-3">Fecha & Hora</th>
                      <th className="p-3">Plantilla Auditada</th>
                      <th className="p-3">Destinatario</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Detalles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-custom/20">
                    {testLogs.map(log => (
                      <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="p-3 font-mono text-secondary-custom">{new Date(log.fecha).toLocaleString('es-CL')}</td>
                        <td className="p-3 font-bold text-primary-custom">{log.tipo}</td>
                        <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{log.destinatario}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> {log.estado}
                          </span>
                        </td>
                        <td className="p-3 text-secondary-custom font-medium">{log.detalles}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* APARTADO 5: GESTIÓN COMPLETA DE DESTINATARIOS & AUDITORÍA     */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'destinatarios' && (
          <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card-custom p-6 rounded-3xl border border-card-custom shadow-sm">
              <div>
                <h3 className="text-base font-black text-primary-custom uppercase tracking-wide flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" />
                  Gestión de Destinatarios y Trazabilidad de Envíos
                </h3>
                <p className="text-xs text-secondary-custom font-medium mt-0.5">
                  Administra las autoridades y funcionarios que reciben los reportes diarios y mensuales de MÉTRICO.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddDestForm(!showAddDestForm)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>{showAddDestForm ? 'Cancelar' : 'Agregar Nuevo Destinatario'}</span>
              </button>
            </div>

            {/* FORMULARIO AGREGAR DESTINATARIO */}
            {showAddDestForm && (
              <form onSubmit={handleAddDestinatario} className="bg-card-custom p-6 rounded-3xl border-2 border-indigo-500/40 space-y-4 shadow-md animate-fade-in">
                <h4 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                  Nuevo Destinatario Oficial de Reportes
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-secondary-custom">Nombre y Título:</label>
                    <input
                      type="text"
                      value={newDestNombre}
                      onChange={e => setNewDestNombre(e.target.value)}
                      placeholder="ej: Dr. Matías Bustos"
                      className="w-full bg-input-custom border border-card-custom p-2.5 rounded-xl text-xs font-bold text-primary-custom outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-secondary-custom">Cargo / Función:</label>
                    <input
                      type="text"
                      value={newDestCargo}
                      onChange={e => setNewDestCargo(e.target.value)}
                      placeholder="ej: Jefatura de Urgencia"
                      className="w-full bg-input-custom border border-card-custom p-2.5 rounded-xl text-xs font-bold text-primary-custom outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-secondary-custom">Correo Electrónico:</label>
                    <input
                      type="email"
                      value={newDestEmail}
                      onChange={e => setNewDestEmail(e.target.value)}
                      placeholder="ej: nombre@cormumel.cl"
                      className="w-full bg-input-custom border border-card-custom p-2.5 rounded-xl text-xs font-bold text-primary-custom outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-secondary-custom">Frecuencia de Envío:</label>
                    <select
                      value={newDestFrecuencia}
                      onChange={e => setNewDestFrecuencia(e.target.value)}
                      className="w-full bg-input-custom border border-card-custom p-2.5 rounded-xl text-xs font-bold text-primary-custom outline-none focus:border-indigo-500"
                    >
                      <option value="AMBOS">Diario y Mensual (Ambos)</option>
                      <option value="DIARIO">Solo Reporte Diario por Turno</option>
                      <option value="MENSUAL">Solo Cierre Mensual Consolidado</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-card-custom/60">
                  <button
                    type="button"
                    onClick={() => setShowAddDestForm(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Guardar Destinatario
                  </button>
                </div>
              </form>
            )}

            {/* TABLA DE DESTINATARIOS Y AUDITORÍA INDIVIDUAL */}
            <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-sm space-y-4">
              <div className="overflow-auto border border-card-custom rounded-2xl custom-scrollbar">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-black/5 dark:bg-white/5 text-secondary-custom font-black uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Funcionario / Destinatario</th>
                      <th className="p-4">Cargo / Unidad</th>
                      <th className="p-4">Correo Electrónico</th>
                      <th className="p-4">Frecuencia Asignada</th>
                      <th className="p-4">Auditoría de Envíos</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-custom/20">
                    {destinatariosList.map(dest => (
                      <tr key={dest.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4 font-black text-primary-custom flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black flex items-center justify-center text-xs">
                            {dest.nombre.charAt(0)}
                          </div>
                          <span>{dest.nombre}</span>
                        </td>
                        <td className="p-4 text-secondary-custom font-semibold">{dest.cargo}</td>
                        <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{dest.email}</td>
                        <td className="p-4">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-secondary-custom">
                            {dest.frecuencia}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="text-xs font-black text-primary-custom block">{dest.totalEnviados} informes recibidos</span>
                            <span className="text-[10px] text-secondary-custom font-medium block">Último: {dest.ultimoEnvio}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => handleToggleDestinatario(dest.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 border transition-all cursor-pointer ${
                              dest.activo 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                                : 'bg-slate-500/10 text-slate-500 border-slate-500/30'
                            }`}
                          >
                            {dest.activo ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            <span>{dest.activo ? 'Activo' : 'En Pausa'}</span>
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteDestinatario(dest.id, dest.nombre)}
                            className="p-1.5 hover:bg-rose-500/10 text-secondary-custom hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar destinatario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* 3. FOOTER GLOBAL CON BOTÓN DE GUARDADO PERMANENTE */}
      <footer className="p-4 bg-slate-900 border-t border-card-custom/80 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-slate-300">
            MÉTRICO v5.5.0 • SAR Elsa Romo Aravena
          </span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
            {destinatariosList.filter(d => d.activo).length} Destinatarios Activos
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveAllConfig}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Configuración General</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </footer>

    </div>
  );
}
