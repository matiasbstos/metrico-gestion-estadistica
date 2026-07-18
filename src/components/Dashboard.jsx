import React, { useState, useEffect, useMemo, Component } from 'react';
import PanelKPIs from './dashboard/PanelKPIs';
import FiltrosGlobales from './dashboard/FiltrosGlobales';
import GraficoDinamico from './dashboard/GraficoDinamico';
import AnalisisEquiposTurno from './dashboard/AnalisisEquiposTurno';
import CurvaDemanda from './dashboard/CurvaDemanda';
import AnalisisSociodemografico from './dashboard/AnalisisSociodemografico';
import TablaTiemposEspera from './dashboard/TablaTiemposEspera';
import AnalisisProfesionales from './dashboard/AnalisisProfesionales';
import RankingProfesionales from './dashboard/RankingProfesionales';
import TopDiagnosticos from './dashboard/TopDiagnosticos';
import AnalisisAltasDetail from './dashboard/AnalisisAltasDetail';
import DataGridTurnos from './dashboard/DataGridTurnos';
import GestionDatos from './dashboard/GestionDatos';
import ReportesModule from './dashboard/ReportesModule';
import MatrizCruzada from './dashboard/MatrizCruzada';
import PautaTurnos from './dashboard/PautaTurnos';
import AuditLog from './dashboard/AuditLog';
import AnalisisComparativoTriple from './dashboard/AnalisisComparativoTriple';
import CalendarioHistorico from './dashboard/CalendarioHistorico';
import Login from './Login';
import { 
  Clock, Users, UserCheck, AlertTriangle, Activity, ArrowRight, 
  FileSpreadsheet, Database, BarChart2, Trash2, Edit, Edit2,
  CheckCircle, XCircle, Filter, PieChart as PieChartIcon, 
  BarChart as BarChartIcon, TrendingUp, X, Cloud, CloudUpload, CloudOff,
  Calendar, Layers, Save, TrendingDown, ArrowUpRight, ArrowDownRight,
  HeartPulse, Shield, Globe, Building2, MapPin, Search, Zap, UserPlus, Eraser, Lock, GitCompare
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, 
  LineChart, Line, ResponsiveContainer, CartesianGrid, ComposedChart, Area, AreaChart
} from 'recharts';

import { auth, db, appId } from '../config/firebase';
import { collection, doc, writeBatch, updateDoc, deleteDoc } from 'firebase/firestore';
import { useMetricoData } from '../hooks/useMetricoData';
import { useMetricoAnalytics } from '../hooks/useMetricoAnalytics';
import { useMetricoDemanda } from '../hooks/useMetricoDemanda';
import { useMetricoProfesionales } from '../hooks/useMetricoProfesionales';
import { usePautasTurnos } from '../hooks/usePautasTurnos';
import { COLORS, DOC_COLORS, AGE_RANGES, METRIC_LABELS } from '../config/constants';

// Colores Institucionales



const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [notification, setNotification] = useState(null);
  const [pendingUpload, setPendingUpload] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [centroActivo, setCentroActivo] = useState(localStorage.getItem('metrico_centro') || 'SAR Elsa Romo Aravena');
  
  const [manualForm, setManualForm] = useState({
    fechaInicio: '', fechaFin: '', horario: '08:00 - 20:00',
    c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0, altasAdmin: 0, totalPacientes: 0
  });

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [filtroFechaInicio, setFiltroFechaInicio] = useState(firstDayOfMonth);
  const [filtroFechaFin, setFiltroFechaFin] = useState(lastDayOfMonth);
  const [modoComparativo, setModoComparativo] = useState(false);
  const [filtroFechaInicioB, setFiltroFechaInicioB] = useState('');
  const [filtroFechaFinB, setFiltroFechaFinB] = useState('');
  
  const [demandaFechaInicio, setDemandaFechaInicio] = useState(firstDayOfMonth);
  const [demandaFechaFin, setDemandaFechaFin] = useState(lastDayOfMonth);
  const [demandaViewMode, setDemandaViewMode] = useState('total');

  const [profFechaInicio, setProfFechaInicio] = useState(firstDayOfMonth);
  const [profFechaFin, setProfFechaFin] = useState(lastDayOfMonth);
  const [docsToCompare, setDocsToCompare] = useState([]);
  const [searchDoctor, setSearchDoctor] = useState('');
  const [profesionalesChartType, setProfesionalesChartType] = useState('ambos');

  const [tipoGrafico, setTipoGrafico] = useState('barras');
  const [metricasGrafico, setMetricasGrafico] = useState(['totalPacientes']);
  const [filtroVariables, setFiltroVariables] = useState('');
  const [paginaTurnos, setPaginaTurnos] = useState(1);
  const turnosPorPagina = 10;

  const [filtrosGlobales, setFiltrosGlobales] = useState({ sexo: 'TODOS', prevision: 'TODOS', edad: 'TODOS', establecimiento: 'TODOS' });
  const [tipoCorte, setTipoCorte] = useState('turno');
  const [filtroHoraInicio, setFiltroHoraInicio] = useState('00:00');
  const [filtroHoraFin, setFiltroHoraFin] = useState('23:59');
  const [horarioPreset, setHorarioPreset] = useState('civil');

  const { user, userProfile, loading, syncStatus, setSyncStatus, setLoading, pacientesDB, turnosDB } = useMetricoData();

  const [tema, setTema] = useState(() => localStorage.getItem('metrico-tema') || 'crextio');

  useEffect(() => {
    localStorage.setItem('metrico-tema', tema);
  }, [tema]);

  const isGlobalAdmin = useMemo(() => {
    return user?.email === 'matias.bustos@cormumel.cl' || userProfile?.rol === 'global';
  }, [user, userProfile]);

  const maxDateLabel = useMemo(() => {
    if (!pacientesDB || pacientesDB.length === 0) return '';
    let maxTime = 0;
    pacientesDB.forEach(p => {
      if (p.tAdmision && p.tAdmision > maxTime) {
        maxTime = p.tAdmision;
      }
    });
    if (maxTime === 0) return '';
    const d = new Date(maxTime);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }, [pacientesDB]);
  const pautasTurnosHook = usePautasTurnos();

  useEffect(() => {
    const loadSheetJS = () => {
      if (!document.getElementById('sheetjs-script')) {
        const script = document.createElement('script');
        script.id = 'sheetjs-script';
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        document.head.appendChild(script);
      }
    };
    loadSheetJS();
  }, []);

  useEffect(() => {
    localStorage.setItem('metrico_centro', centroActivo);
  }, [centroActivo]);

  useEffect(() => {
    setDemandaFechaInicio(filtroFechaInicio);
    setDemandaFechaFin(filtroFechaFin);
    setProfFechaInicio(filtroFechaInicio);
    setProfFechaFin(filtroFechaFin);
  }, [filtroFechaInicio, filtroFechaFin]);

  useEffect(() => {
    if (demandaViewMode === 'periodos' && !modoComparativo) setDemandaViewMode('total');
    if (demandaViewMode === 'doctores' && docsToCompare.length === 0) setDemandaViewMode('total');
  }, [modoComparativo, docsToCompare, demandaViewMode]);

  const showNotif = (msg, type = 'info') => {
    setNotification({ msg: String(msg), type });
    setTimeout(() => setNotification(null), 5000);
  };

  const perc = (val, tot) => tot > 0 ? ((val / tot) * 100).toFixed(1) : 0;

  const formatTime = (minutes) => {
    if (isNaN(minutes) || minutes < 0 || minutes === null) return '-';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const h = Math.floor(minutes / 60); const m = Math.round(minutes % 60);
    return `${h}h ${m}m`;
  };

  const applyDatePreset = (preset) => {
    const today = new Date();
    const formatDate = (d) => isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
    let startA, endA, startB, endB;
    if (preset === 'mes') {
      startA = new Date(today.getFullYear(), today.getMonth(), 1);
      endA = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      startB = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endB = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (preset === 'semana') {
      const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + 1));
      const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 7));
      startA = firstDay; endA = lastDay;
      startB = new Date(firstDay.getTime() - 7 * 24 * 60 * 60 * 1000);
      endB = new Date(lastDay.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (preset === 'dia') {
      startA = endA = new Date();
      startB = endB = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    }
    setFiltroFechaInicio(formatDate(startA));
    setFiltroFechaFin(formatDate(endA));
    if(modoComparativo) {
      setFiltroFechaInicioB(formatDate(startB));
      setFiltroFechaFinB(formatDate(endB));
    }
  };

  const { turnosFiltrados, pacientesFiltrados, demografiaStats, promediosGlobales, metricsByCategory, statsKPI, rankingCentros, topDiagnosticos } = useMetricoAnalytics(pacientesDB, turnosDB, filtroFechaInicio, filtroFechaFin, filtrosGlobales, tipoCorte, filtroHoraInicio, filtroHoraFin);
  const { turnosDemanda, pacientesDemanda, peakHoursData } = useMetricoDemanda(pacientesDB, turnosDB, demandaFechaInicio, demandaFechaFin, modoComparativo, filtroFechaInicioB, filtroFechaFinB, docsToCompare, tipoCorte, filtroHoraInicio, filtroHoraFin);
  const { turnosProf, pacientesProf, metricsByDoctor, filteredMetricsByDoctor, dailyDoctorData } = useMetricoProfesionales(pacientesDB, turnosDB, profFechaInicio, profFechaFin, docsToCompare, searchDoctor, tipoCorte, filtroHoraInicio, filtroHoraFin);

  const toggleDocToCompare = (docName) => {
    setDocsToCompare(prev => prev.includes(docName) ? prev.filter(d => d !== docName) : [...prev, docName]);
  };
  const clearDocComparison = () => setDocsToCompare([]);

  const totalPaginasTurnos = Math.ceil(turnosDB.length / turnosPorPagina) || 1;
  const turnosPaginados = useMemo(() => {
    return turnosDB.slice((paginaTurnos - 1) * turnosPorPagina, paginaTurnos * turnosPorPagina);
  }, [turnosDB, paginaTurnos]);

  const saveEditedTurno = async () => {
    if (!editModal || !user || !db) return;
    if (userProfile?.rol !== 'global') {
      showNotif('No tienes permisos para editar turnos.', 'error');
      return;
    }
    setLoading(true); setSyncStatus('syncing');
    try {
      const horasTurno = String(editModal.horario || '').includes("17:00") ? 15 : 12;
      const ratio = Number(editModal.totalPacientes) / horasTurno;
      const ref = doc(db, 'artifacts', appId, 'public', 'data', 'turnos', editModal.id);
      
      const auditLog = {
        fecha: Date.now(),
        accion: 'Edición',
        detalles: `Turno ${editModal.id} editado (${editModal.totalPacientes} pacientes).`,
        centro: centroActivo,
        usuario: user?.email || 'Anónimo'
      };

      const batch = writeBatch(db);
      batch.update(ref, {
        totalPacientes: Number(editModal.totalPacientes), altasAdmin: Number(editModal.altasAdmin),
        c1: Number(editModal.c1), c2: Number(editModal.c2), c3: Number(editModal.c3), 
        c3_z518: Number(editModal.c3_z518 || 0), c4: Number(editModal.c4), c5: Number(editModal.c5), 
        horario: editModal.horario, equipoTurno: editModal.equipoTurno || 'Sin Asignar', pacientesPorHora: ratio
      });
      batch.set(doc(collection(db, 'artifacts', appId, 'public', 'data', 'audit_logs')), auditLog);
      await batch.commit();

      showNotif('Turno actualizado correctamente.', 'success');
      setEditModal(null);
    } catch(e) { showNotif('Error al guardar cambios', 'error'); }
    setLoading(false); setSyncStatus('synced');
  };

  const executeDeleteTurno = async (turno) => {
    if (!user || !db) return;
    if (userProfile?.rol !== 'global') {
      showNotif('No tienes permisos para eliminar turnos.', 'error');
      return;
    }
    setLoading(true); setSyncStatus('syncing');
    try {
      const auditLog = {
        fecha: Date.now(),
        accion: 'Eliminación',
        detalles: `Turno ${turno.id} eliminado.`,
        centro: centroActivo,
        usuario: user?.email || 'Anónimo'
      };
      await writeBatch(db).set(doc(collection(db, 'artifacts', appId, 'public', 'data', 'audit_logs')), auditLog).commit();
      
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'turnos', turno.id));
      if (turno.tipo === 'Masiva' && turno.loteId) {
        const pacientesAsociados = pacientesDB.filter(p => p.loteId === turno.loteId);
        for (let i = 0; i < pacientesAsociados.length; i += 400) {
            const batch = writeBatch(db);
            pacientesAsociados.slice(i, i + 400).forEach(p => {
                const pRef = doc(db, 'artifacts', appId, 'public', 'data', 'pacientes_urgencia', p.id);
                batch.delete(pRef);
            });
            await batch.commit();
        }
      }
      setNotification({ message: 'Lote eliminado.', type: 'success' });
    } catch (e) { setNotification({ message: 'Hubo un problema al limpiar pacientes.', type: 'warning' }); }
    setDeleteConfirm(null);
    setLoading(false); setSyncStatus('synced');
  };

  // Variables para GraficoDinamico
  const dynamicMetricKeys = {
      sexo: [{ label: 'Mujeres', value: 'sexo_f', color: '#ec4899' }, { label: 'Hombres', value: 'sexo_m', color: '#3b82f6' }],
      edad: [
        { label: 'Niños (0-14)', value: 'edad_0_14', color: '#f59e0b' },
        { label: 'Jóvenes (15-29)', value: 'edad_15_29', color: '#84cc16' },
        { label: 'Adultos (30-59)', value: 'edad_30_59', color: '#14b8a6' },
        { label: 'Mayor (60+)', value: 'edad_60_plus', color: '#6366f1' }
      ],
      prev: [{ label: 'Fonasa', value: 'prev_fonasa', color: '#10b981' }, { label: 'Isapre', value: 'prev_isapre', color: '#0ea5e9' }],
      com: [{ label: 'Melipilla', value: 'com_melipilla', color: '#8b5cf6' }, { label: 'Otras Comunas', value: 'com_otras', color: '#f43f5e' }],
      nac: [{ label: 'Chilenos', value: 'nac_chilena', color: '#ef4444' }, { label: 'Extranjeros', value: 'nac_extranjera', color: '#06b6d4' }],
      est: [
        { label: 'CESFAM Florencia', value: 'est_florencia', color: '#8b5cf6' },
        { label: 'CESFAM Boris', value: 'est_boris', color: '#d946ef' },
        { label: 'CESFAM Elgueta', value: 'est_elgueta', color: '#f43f5e' },
        { label: 'Otros Centros', value: 'est_otros', color: '#94a3b8' }
      ]
  };

  const getColorForMetric = (metricKey) => {
      if (METRIC_LABELS[metricKey]) return COLORS[metricKey] || '#94a3b8';
      for (const group in dynamicMetricKeys) {
        const found = dynamicMetricKeys[group].find(m => m.value === metricKey);
        if (found) return found.color;
      }
      return '#cbd5e1';
  };

  const formatMetricName = (metricKey) => {
      if (METRIC_LABELS[metricKey]) return METRIC_LABELS[metricKey];
      for (const group in dynamicMetricKeys) {
        const found = dynamicMetricKeys[group].find(m => m.value === metricKey);
        if (found) return found.label;
      }
      return metricKey;
  };

  const handleGraphToggleChange = (metricValue) => {
    setMetricasGrafico(prev => {
      if (prev.includes(metricValue)) return prev.filter(m => m !== metricValue);
      return [...prev, metricValue];
    });
  };

  const renderCheckbox = (metric) => (
    <label key={metric.value} className="flex items-center gap-2 cursor-pointer text-xs group">
      <div className="relative flex items-center justify-center">
        <input 
          type="checkbox" 
          checked={metricasGrafico.includes(metric.value)}
          onChange={() => handleGraphToggleChange(metric.value)}
          className="sr-only"
        />
        <div className={`w-4 h-4 rounded transition border ${metricasGrafico.includes(metric.value) ? 'border-transparent' : 'border-slate-300 group-hover:border-slate-400'}`} style={{ backgroundColor: metricasGrafico.includes(metric.value) ? metric.color : 'transparent' }}>
          {metricasGrafico.includes(metric.value) && <CheckCircle className="w-3.5 h-3.5 text-white absolute top-0.5 left-0.5" />}
        </div>
      </div>
      <span className={metricasGrafico.includes(metric.value) ? 'font-bold text-slate-700' : 'text-slate-500'}>{metric.label}</span>
    </label>
  );

  const compareChartData = useMemo(() => {
    if (!modoComparativo) return [];
    let currentTotal = turnosFiltrados.reduce((acc, t) => acc + Number(t.totalPacientes || 0), 0);
    const turnosB = turnosDB.filter(t => t.fechaInicio >= filtroFechaInicioB && t.fechaFin <= filtroFechaFinB);
    let prevTotal = turnosB.reduce((acc, t) => acc + Number(t.totalPacientes || 0), 0);
    return [{ name: 'Volumen Total', 'Periodo A': currentTotal, 'Periodo B': prevTotal }];
  }, [turnosFiltrados, turnosDB, filtroFechaInicioB, filtroFechaFinB, modoComparativo]);

  const chartData = useMemo(() => {
    if (modoComparativo) return [];
    
    // Todas las métricas que nos interesan
    const allMetrics = [
      ...Object.keys(METRIC_LABELS),
      'sexo_f', 'sexo_m', 'edad_0_14', 'edad_15_29', 'edad_30_59', 'edad_60_plus',
      'prev_fonasa', 'prev_isapre', 'com_melipilla', 'com_otras', 'nac_chilena', 'nac_extranjera',
      'est_florencia', 'est_boris', 'est_elgueta', 'est_otros',
      'tiempoAdmCat', 'tiempoCatAna', 'tiempoAnaAlt', 'tiempoAdmAlt'
    ];

    return turnosFiltrados.slice().reverse().map(t => {
      const row = { name: t.fechaInicio === t.fechaFin ? t.fechaInicio : `${t.fechaInicio} - ${t.fechaFin}` };
      const pacs = pacientesFiltrados.filter(p => p.loteId === t.loteId);
      
      allMetrics.forEach(m => {
        if (['tiempoAdmCat', 'tiempoCatAna', 'tiempoAnaAlt', 'tiempoAdmAlt'].includes(m)) {
          let sum = 0; let count = 0;
          pacs.forEach(p => {
            if (m === 'tiempoAdmCat' && p.tAdmision && p.tCat1) { sum += (p.tCat1 - p.tAdmision)/60000; count++; }
            if (m === 'tiempoCatAna' && p.tCatUlt && p.tAnamnesis) { sum += (p.tAnamnesis - p.tCatUlt)/60000; count++; }
            if (m === 'tiempoAnaAlt' && p.tAnamnesis && p.tAlta) { sum += (p.tAlta - p.tAnamnesis)/60000; count++; }
            if (m === 'tiempoAdmAlt' && p.tAdmision && p.tAlta) { sum += (p.tAlta - p.tAdmision)/60000; count++; }
          });
          row[m] = count > 0 ? Number((sum / count).toFixed(2)) : 0;
        } else if (METRIC_LABELS[m]) {
          row[m] = Number(t[m] || 0);
        } else {
          if (m === 'sexo_f') row[m] = pacs.filter(p => String(p.sexo).toUpperCase().includes('F')).length;
          else if (m === 'sexo_m') row[m] = pacs.filter(p => String(p.sexo).toUpperCase().includes('M')).length;
          else if (m === 'edad_0_14') row[m] = pacs.filter(p => p.edad !== null && p.edad >= 0 && p.edad <= 14).length;
          else if (m === 'edad_15_29') row[m] = pacs.filter(p => p.edad !== null && p.edad >= 15 && p.edad <= 29).length;
          else if (m === 'edad_30_59') row[m] = pacs.filter(p => p.edad !== null && p.edad >= 30 && p.edad <= 59).length;
          else if (m === 'edad_60_plus') row[m] = pacs.filter(p => p.edad !== null && p.edad >= 60).length;
          else if (m === 'prev_fonasa') row[m] = pacs.filter(p => String(p.prevision).toUpperCase().includes('FONASA')).length;
          else if (m === 'prev_isapre') row[m] = pacs.filter(p => String(p.prevision).toUpperCase().includes('ISAPRE')).length;
          else if (m === 'com_melipilla') row[m] = pacs.filter(p => String(p.comuna).toUpperCase() === 'MELIPILLA').length;
          else if (m === 'com_otras') row[m] = pacs.filter(p => p.comuna && String(p.comuna).toUpperCase() !== 'MELIPILLA').length;
          else if (m === 'nac_chilena') row[m] = pacs.filter(p => String(p.nacionalidad).toUpperCase().includes('CHILEN')).length;
          else if (m === 'nac_extranjera') row[m] = pacs.filter(p => p.nacionalidad && !String(p.nacionalidad).toUpperCase().includes('CHILEN')).length;
          else if (m === 'est_florencia') row[m] = pacs.filter(p => String(p.establecimiento).toUpperCase().includes('FLORENCIA')).length;
          else if (m === 'est_boris') row[m] = pacs.filter(p => String(p.establecimiento).toUpperCase().includes('BORIS')).length;
          else if (m === 'est_elgueta') row[m] = pacs.filter(p => String(p.establecimiento).toUpperCase().includes('ELGUETA')).length;
          else if (m === 'est_otros') row[m] = pacs.filter(p => p.establecimiento && !String(p.establecimiento).toUpperCase().match(/FLORENCIA|BORIS|ELGUETA/)).length;
        }
      });

      return row;
    });
  }, [turnosFiltrados, pacientesFiltrados, modoComparativo]);

  const pieData = useMemo(() => {
    if (modoComparativo) return [];
    return ['c1', 'c2', 'c3', 'c3_z518', 'c4', 'c5'].map(c => ({
      name: c === 'c3_z518' ? 'C3 (Lesiones)' : c.toUpperCase(),
      value: turnosFiltrados.reduce((acc, t) => acc + Number(t[c] || 0), 0)
    })).filter(d => d.value > 0);
  }, [turnosFiltrados, modoComparativo]);

  if (loading) {
    return <LoadingProgress syncStatus={syncStatus} />;
  }

  if (!user) {
    return <Login />;
  }

  const handleLogout = () => {
    import('firebase/auth').then(({ signOut }) => {
      signOut(auth);
    });
  };

  const handlePasswordResetRequest = () => {
    if (!user.email) return;
    import('firebase/auth').then(({ sendPasswordResetEmail }) => {
      sendPasswordResetEmail(auth, user.email).then(() => {
        showNotif('Se ha enviado un correo para restablecer tu contraseña.', 'success');
      }).catch(() => {
        showNotif('Hubo un error al enviar el correo.', 'error');
      });
    });
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden bg-app-custom font-sans text-secondary-custom theme-transition theme-${tema}`}>
      {/* COLUMNA IZQUIERDA: SIDEBAR FIJO */}
      <aside className="w-64 h-full bg-sidebar-custom border-r border-card-custom text-primary-custom flex flex-col justify-between flex-shrink-0 z-10 shadow-xl theme-transition">
        <div>
          <div className="p-6 flex items-center gap-3">
            <Activity className="w-8 h-8 accent-text-custom" />
            <div>
              <h1 className="font-black text-lg tracking-tight leading-none text-primary-custom">MÉTRICO</h1>
              <p className="text-[10px] text-secondary-custom font-medium mb-2">Clínico Predictivo</p>
              <select 
                className="bg-input-custom text-primary-custom text-xs p-1.5 rounded-xl border border-card-custom outline-none w-full font-bold cursor-pointer transition-all"
                value={centroActivo} 
                onChange={e => setCentroActivo(e.target.value)}
              >
                <option value="SAR Elsa Romo Aravena">SAR Elsa Romo Aravena</option>
                <option value="CESFAM Florencia">CESFAM Florencia</option>
                <option value="CESFAM Boris Soler">CESFAM Boris Soler</option>
                <option value="CESFAM Elgueta">CESFAM Elgueta</option>
              </select>
            </div>
          </div>

          {/* Selector de Tema */}
          <div className="px-6 mb-4">
            <label className="block text-[9px] font-bold text-secondary-custom uppercase tracking-wide mb-1.5 opacity-80">Tema Visual</label>
            <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-card-custom transition-all">
              <button 
                onClick={() => setTema('crextio')}
                className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all ${tema === 'crextio' ? 'accent-bg-custom text-white shadow-sm' : 'text-secondary-custom hover:text-primary-custom'}`}
                title="Cristal Pastel"
              >
                Pastel
              </button>
              <button 
                onClick={() => setTema('lordbank')}
                className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all ${tema === 'lordbank' ? 'accent-bg-custom text-white shadow-sm' : 'text-secondary-custom hover:text-primary-custom'}`}
                title="Portal Limpio"
              >
                Limpio
              </button>
              <button 
                onClick={() => setTema('dark')}
                className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-all ${tema === 'dark' ? 'accent-bg-custom text-white shadow-sm' : 'text-secondary-custom hover:text-primary-custom'}`}
                title="Clásico Oscuro"
              >
                Oscuro
              </button>
            </div>
          </div>
          
          <div className="px-6 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-emerald-500">Sistema En Línea</span>
            </div>
            {syncStatus === 'synced' && <p className="text-[10px] text-secondary-custom">Último guardado: hace unos segundos</p>}
            {syncStatus === 'syncing' && <p className="text-[10px] text-sky-500">Guardando cambios...</p>}
          </div>

          <nav className="mt-2 flex flex-col gap-1 px-3">
            <button 
              onClick={() => setActiveTab('resumen')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm shadow-sm transition-all duration-200 ${activeTab === 'resumen' ? 'accent-bg-custom text-white' : 'bg-transparent text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'}`}>
              <BarChart2 className="w-4 h-4" /> Inicio
            </button>
            <button 
              onClick={() => setActiveTab('comparativo')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm shadow-sm transition-all duration-200 ${activeTab === 'comparativo' ? 'accent-bg-custom text-white' : 'bg-transparent text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'}`}>
              <GitCompare className="w-4 h-4" /> Comparativo
            </button>
            <button 
              onClick={() => setActiveTab('calendario')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm shadow-sm transition-all duration-200 ${activeTab === 'calendario' ? 'accent-bg-custom text-white' : 'bg-transparent text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'}`}>
              <Calendar className="w-4 h-4" /> Histórico Mensual
            </button>
            <button 
              onClick={() => setActiveTab('altas')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm shadow-sm transition-all duration-200 ${activeTab === 'altas' ? 'accent-bg-custom text-white' : 'bg-transparent text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'}`}>
              <UserCheck className="w-4 h-4" /> Altas Admin
            </button>
            <button 
              onClick={() => setActiveTab('reportes')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm shadow-sm transition-all duration-200 ${activeTab === 'reportes' ? 'accent-bg-custom text-white' : 'bg-transparent text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'}`}>
              <FileSpreadsheet className="w-4 h-4" /> Reporte
            </button>
            {isGlobalAdmin && (
              <>
                <button 
                  onClick={() => setActiveTab('data')} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm shadow-sm transition-all duration-200 ${activeTab === 'data' ? 'accent-bg-custom text-white' : 'bg-transparent text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'}`}>
                  <Database className="w-4 h-4" /> Gestión de Datos
                </button>
                <button 
                  onClick={() => setActiveTab('pauta')} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm shadow-sm transition-all duration-200 ${activeTab === 'pauta' ? 'accent-bg-custom text-white' : 'bg-transparent text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'}`}>
                  <Calendar className="w-4 h-4" /> Pauta de Turnos
                </button>
                <button 
                  onClick={() => setActiveTab('auditoria')} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm shadow-sm transition-all duration-200 ${activeTab === 'auditoria' ? 'accent-bg-custom text-white' : 'bg-transparent text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'}`}>
                  <Shield className="w-4 h-4" /> Auditoría
                </button>
              </>
            )}
          </nav>
        </div>
        <div className="p-4 border-t border-card-custom">
          <div className="mb-4 px-2">
            <p className="text-xs font-bold text-primary-custom truncate" title={user.email}>{user.email}</p>
            <p className="text-[10px] accent-text-custom font-medium uppercase mt-0.5">{isGlobalAdmin ? 'Administrador Global' : 'Usuario Local'}</p>
          </div>
          <button onClick={handlePasswordResetRequest} className="flex items-center gap-3 px-4 py-2 text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5 rounded-lg font-medium text-xs transition-all w-full mb-1">
            <Lock className="w-3.5 h-3.5" /> Cambiar Clave
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5 rounded-lg font-medium text-xs transition-all w-full">
            <XCircle className="w-3.5 h-3.5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MODALES Y OVERLAYS */}
      {syncStatus === 'syncing' && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-lg flex flex-col justify-center items-center animate-fade-in transition-all">
          <div className="bg-slate-800/40 p-8 rounded-[2rem] backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(14,165,233,0.3)] flex flex-col items-center max-w-sm text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 to-indigo-500/10 opacity-50 z-0"></div>
            <HeartPulse className="w-16 h-16 text-sky-400 animate-bounce mb-4 relative z-10 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
            <h3 className="text-xl font-black text-white tracking-widest uppercase relative z-10">Actualizando</h3>
            <p className="text-sky-200 text-sm mt-2 font-medium relative z-10">Sincronizando registros...</p>
            <div className="w-32 bg-slate-800/80 rounded-full h-1 mt-6 overflow-hidden relative z-10 border border-slate-700/50">
              <div className="absolute top-0 left-0 h-full bg-sky-400 w-1/2 animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_10px_rgba(56,189,248,1)]"></div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] max-w-md w-full overflow-hidden border border-white/60">
            <div className="bg-gradient-to-r from-rose-500 to-rose-700 text-white p-5 flex justify-between items-center shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
              <h3 className="font-black tracking-wide flex items-center gap-2 relative z-10 text-lg"><Trash2 className="w-5 h-5"/> Eliminar Lote</h3>
              <button onClick={() => setDeleteConfirm(null)} className="hover:bg-white/20 p-1.5 rounded-xl transition-all relative z-10 backdrop-blur-sm"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6">
              <div className="bg-rose-50/80 border border-rose-200/60 p-4 rounded-2xl mb-6 shadow-inner">
                <p className="text-rose-800 text-sm font-medium leading-relaxed">¿Estás seguro que deseas eliminar este registro de forma permanente? <br/><br/>Si es una carga masiva, se borrarán <span className="font-bold">todos los pacientes</span> asociados a este lote.</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-3 border-2 border-slate-200/80 text-slate-600 bg-white/50 rounded-2xl hover:bg-slate-50 hover:text-slate-900 font-bold transition-all shadow-sm">Cancelar</button>
                <button onClick={() => executeDeleteTurno(deleteConfirm)} className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-2xl hover:from-rose-600 hover:to-rose-700 font-bold transition-all shadow-lg shadow-rose-500/30">Sí, Eliminar Registro</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] max-w-md w-full overflow-hidden border border-white/60">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-5 flex justify-between items-center shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
              <h3 className="font-black tracking-wide flex items-center gap-2 relative z-10 text-lg"><Edit className="w-5 h-5"/> Editar Registro</h3>
              <button onClick={() => setEditModal(null)} className="hover:bg-white/20 p-1.5 rounded-xl transition-all relative z-10 backdrop-blur-sm"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 shadow-inner">
                 <p className="text-sm text-slate-500">Fecha del turno: <span className="font-bold text-indigo-700 bg-white px-2 py-1 rounded-lg border border-indigo-100 shadow-sm ml-1">{editModal.fechaInicio}</span></p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Horario</label>
                  <select value={editModal.horario} onChange={e => setEditModal({...editModal, horario: e.target.value})} className="w-full text-sm border-2 border-slate-200/80 rounded-xl p-2.5 focus:border-indigo-500 outline-none bg-white/70 shadow-sm transition-all focus:bg-white">
                    <option value="17:00 - 08:00 (Semana)">17:00 - 08:00 (Semana)</option>
                    <option value="08:00 - 20:00 (Finde)">08:00 - 20:00 (Finde)</option>
                    <option value="20:00 - 08:00 (Finde)">20:00 - 08:00 (Finde)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Equipo de Turno</label>
                  <select value={editModal.equipoTurno} onChange={e => setEditModal({...editModal, equipoTurno: e.target.value})} className="w-full text-sm border-2 border-slate-200/80 rounded-xl p-2.5 focus:border-indigo-500 outline-none font-bold text-indigo-600 bg-white/70 shadow-sm transition-all focus:bg-white">
                    <option value="Sin Asignar">Sin Asignar</option>
                    <option value="Turno 1">Turno 1</option>
                    <option value="Turno 2">Turno 2</option>
                    <option value="Turno 3">Turno 3</option>
                    <option value="Turno 4">Turno 4</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Total Pacientes</label>
                  <input type="number" value={editModal.totalPacientes} onChange={e => setEditModal({...editModal, totalPacientes: e.target.value})} className="w-full text-lg font-bold border-2 border-slate-200/80 rounded-xl p-2.5 text-blue-600 focus:border-blue-500 outline-none bg-white/70 shadow-sm transition-all focus:bg-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-rose-400 mb-1.5 uppercase tracking-wide">Altas Admin</label>
                  <input type="number" value={editModal.altasAdmin} onChange={e => setEditModal({...editModal, altasAdmin: e.target.value})} className="w-full text-lg font-bold border-2 border-rose-200/80 rounded-xl p-2.5 text-rose-600 focus:border-rose-500 outline-none bg-white/70 shadow-sm transition-all focus:bg-white" />
                </div>
              </div>
              <hr className="border-slate-200/80 my-2" />
              <div className="flex gap-2 justify-between">
                {['c1', 'c2', 'c3', 'c3_z518', 'c4', 'c5'].map(c => (
                  <div key={c} className="flex-1 text-center">
                    <label className={`block text-[9px] font-bold mb-1.5 uppercase tracking-wide ${c === 'c1' ? 'text-red-500' : c === 'c2' ? 'text-orange-500' : c === 'c3' ? 'text-yellow-500' : c === 'c3_z518' ? 'text-yellow-600' : c === 'c4' ? 'text-green-500' : 'text-blue-500'}`}>
                      {c === 'c3_z518' ? 'C3 (L)' : c.toUpperCase()}
                    </label>
                    <input type="number" value={editModal[c]} onChange={e => setEditModal({...editModal, [c]: e.target.value})} className="w-full text-center border-2 border-slate-200/80 rounded-lg p-2 text-sm font-bold focus:border-indigo-500 outline-none bg-white/70 shadow-sm transition-all focus:bg-white" />
                  </div>
                ))}
              </div>
              <button onClick={saveEditedTurno} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-4 rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all mt-4 flex justify-center items-center gap-2 text-sm shadow-lg shadow-emerald-500/30"><Save className="w-5 h-5"/> Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* COLUMNA DERECHA: CANVAS DE SCROLL CONTINUO */}
      <main className="flex-1 h-full overflow-y-auto p-8 space-y-6 relative theme-transition">
        {notification && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-sm font-medium z-50 animate-bounce-in ${notification.type === 'error' ? 'bg-red-600 text-white' : notification.type === 'warning' ? 'bg-orange-500 text-white' : 'bg-emerald-600 text-white'}`}>
            {notification.msg}
          </div>
        )}

        {activeTab === 'resumen' && (
          <>
            {/* SECTOR DE FILTROS Y CONTROL DE CONTEXTO */}
            <FiltrosGlobales 
              modoComparativo={modoComparativo} setModoComparativo={setModoComparativo}
              filtroFechaInicio={filtroFechaInicio} setFiltroFechaInicio={setFiltroFechaInicio}
              filtroFechaFin={filtroFechaFin} setFiltroFechaFin={setFiltroFechaFin}
              filtroFechaInicioB={filtroFechaInicioB} setFiltroFechaInicioB={setFiltroFechaInicioB}
              filtroFechaFinB={filtroFechaFinB} setFiltroFechaFinB={setFiltroFechaFinB}
              applyDatePreset={applyDatePreset}
              tipoCorte={tipoCorte} setTipoCorte={setTipoCorte}
              filtroHoraInicio={filtroHoraInicio} setFiltroHoraInicio={setFiltroHoraInicio}
              filtroHoraFin={filtroHoraFin} setFiltroHoraFin={setFiltroHoraFin}
              horarioPreset={horarioPreset} setHorarioPreset={setHorarioPreset}
              maxDateLabel={maxDateLabel}
            />

            <hr className="border-card-custom/40 my-6 theme-transition" />

            {/* DATOS DE RENDIMIENTO Y KPIs */}
            {statsKPI && <PanelKPIs statsKPI={statsKPI} />}



        <GraficoDinamico 
          chartData={chartData} compareChartData={compareChartData} pieData={pieData}
          tipoGrafico={tipoGrafico} setTipoGrafico={setTipoGrafico}
          metricasGrafico={metricasGrafico} setMetricasGrafico={setMetricasGrafico}
          filtroVariables={filtroVariables} setFiltroVariables={setFiltroVariables}
          modoComparativo={modoComparativo} dynamicMetricKeys={dynamicMetricKeys}
          turnosFiltrados={turnosFiltrados} demografiaStats={demografiaStats}
        />

        <AnalisisEquiposTurno turnosFiltrados={turnosFiltrados} pacientesFiltrados={pacientesFiltrados} />

        {topDiagnosticos && topDiagnosticos.length > 0 && (
          <TopDiagnosticos topDiagnosticos={topDiagnosticos} />
        )}

        {demografiaStats && (
          <>
            <AnalisisSociodemografico 
              demografiaStats={demografiaStats} 
              rankingCentros={rankingCentros} 
            />
            <MatrizCruzada pacientesFiltrados={pacientesFiltrados} />
          </>
        )}

        <TablaTiemposEspera 
          metricsByCategory={metricsByCategory} 
          promediosGlobales={promediosGlobales} 
        />

        <CurvaDemanda 
          peakHoursData={peakHoursData}
          demandaFechaInicio={demandaFechaInicio} setDemandaFechaInicio={setDemandaFechaInicio}
          demandaFechaFin={demandaFechaFin} setDemandaFechaFin={setDemandaFechaFin}
          demandaViewMode={demandaViewMode} setDemandaViewMode={setDemandaViewMode}
          modoComparativo={modoComparativo} docsToCompare={docsToCompare}
        />

        <AnalisisProfesionales 
          profFechaInicio={profFechaInicio} setProfFechaInicio={setProfFechaInicio}
          profFechaFin={profFechaFin} setProfFechaFin={setProfFechaFin}
          searchDoctor={searchDoctor} setSearchDoctor={setSearchDoctor}
          docsToCompare={docsToCompare} toggleDocToCompare={toggleDocToCompare}
          clearDocComparison={clearDocComparison}
          filteredMetricsByDoctor={filteredMetricsByDoctor}
          dailyDoctorData={dailyDoctorData}
        />

        <RankingProfesionales
          profFechaInicio={profFechaInicio} setProfFechaInicio={setProfFechaInicio}
          profFechaFin={profFechaFin} setProfFechaFin={setProfFechaFin}
          filteredMetricsByDoctor={filteredMetricsByDoctor}
        />

        <DataGridTurnos 
          turnosPaginados={turnosPaginados} turnosDB={turnosDB}
          paginaTurnos={paginaTurnos} setPaginaTurnos={setPaginaTurnos}
          totalPaginasTurnos={totalPaginasTurnos}
          setEditModal={setEditModal} setDeleteConfirm={setDeleteConfirm}
          userProfile={userProfile}
        />
          </>
        )}

        {activeTab === 'reportes' && (
          <ReportesModule pacientesDB={pacientesDB} turnosDB={turnosDB} />
        )}

        {activeTab === 'comparativo' && (
          <AnalisisComparativoTriple pacientesDB={pacientesDB} turnosDB={turnosDB} />
        )}

        {activeTab === 'calendario' && (
          <CalendarioHistorico pacientesDB={pacientesDB} turnosDB={turnosDB} />
        )}

        {activeTab === 'altas' && (
          <AnalisisAltasDetail 
            turnosDB={turnosDB} 
            filtroFechaInicio={filtroFechaInicio} 
            filtroFechaFin={filtroFechaFin} 
          />
        )}

        {activeTab === 'data' && (
          <GestionDatos 
            user={user} 
            db={db} 
            appId={appId} 
            loading={loading}
            setLoading={setLoading} 
            setSyncStatus={setSyncStatus} 
            showNotif={showNotif} 
            setActiveTab={setActiveTab} 
            setFiltroFechaInicio={setFiltroFechaInicio} 
            setFiltroFechaFin={setFiltroFechaFin} 
            centroActivo={centroActivo}
            pautasTurnosHook={pautasTurnosHook}
            pacientesDB={pacientesDB}
            turnosDB={turnosDB}
          />
        )}

        {activeTab === 'auditoria' && (
          <AuditLog db={db} appId={appId} centroActivo={centroActivo} />
        )}

        {activeTab === 'pauta' && (
          <PautaTurnos 
            usePautasTurnos={pautasTurnosHook} 
            showNotif={showNotif} 
            isGlobalAdmin={isGlobalAdmin} 
          />
        )}
      </main>
    </div>
  );
}

function LoadingProgress({ syncStatus }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev < 30) return prev + Math.floor(Math.random() * 8) + 2;
        if (prev < 65) return prev + Math.floor(Math.random() * 4) + 1;
        if (prev < 90) return prev + Math.floor(Math.random() * 2) + 0.5;
        if (prev < 98) return prev + 0.1;
        return prev;
      });
    }, 85);

    return () => clearInterval(timer);
  }, []);

  const roundedProgress = Math.min(100, Math.floor(progress));

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3"></div>
      
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-sm w-full text-center relative overflow-hidden">
        {/* Glow pulsing ring icon */}
        <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 relative border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.15)] animate-pulse">
          <Activity className="w-8 h-8 text-sky-400" />
        </div>
        
        <h2 className="text-xl font-black text-white tracking-wide mb-1">Cargando base de datos METRICO</h2>
        <p className="text-xs text-slate-400 font-semibold mb-6">Sincronizando registros clínicos e históricos</p>
        
        {/* Progress Bar Container */}
        <div className="relative pt-1">
          <div className="flex mb-2.5 items-center justify-between">
            <div>
              <span className="text-[10px] font-black inline-block py-1 px-2.5 uppercase rounded-lg bg-sky-500/20 text-sky-400 tracking-wider">
                {syncStatus === 'connecting' ? 'Conectando...' : 'Descargando...'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-sky-400">
                {roundedProgress}%
              </span>
            </div>
          </div>
          
          {/* Outer track */}
          <div className="overflow-hidden h-3 text-xs flex rounded-full bg-slate-950 p-[2px] border border-slate-800/80 shadow-inner">
            {/* Inner fill */}
            <div 
              style={{ width: `${roundedProgress}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 rounded-full transition-all duration-150 ease-out"
            ></div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-800/60 text-[10px] text-slate-500 font-black uppercase tracking-wider">
          <span>Servidor SAR</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            En línea
          </span>
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-8 font-sans">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-2xl border border-red-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h1 className="text-xl font-black">Error crítico en el panel</h1>
            </div>
            <p className="text-gray-600 mb-4 text-sm">React ha bloqueado la página por seguridad debido al siguiente error visual:</p>
            <div className="bg-gray-100 p-4 rounded text-xs font-mono text-gray-800 overflow-auto whitespace-pre-wrap max-h-64">
              {String(this.state.error)}
            </div>
            <button onClick={() => window.location.reload()} className="mt-6 bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700 transition">Recargar Sistema</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Dashboard() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
