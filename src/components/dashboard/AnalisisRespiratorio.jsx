import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wind, Activity, Stethoscope, Building2, Users, Search, Download, Filter, 
  AlertCircle, Calendar, ChevronRight, ChevronDown, ChevronUp, ArrowRightLeft, 
  Info, TrendingUp, TrendingDown, Layers, BarChart3, Baby, UserCheck, HeartPulse, 
  ArrowUpRight, Sparkles, ShieldAlert, FileSpreadsheet, Printer, Clock, Hospital,
  Settings2, Plus, Trash2, CheckCircle2, X, RefreshCw, Sliders
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, CartesianGrid, AreaChart, Area 
} from 'recharts';
import InfoTooltip from '../InfoTooltip';
import { obtenerTurnoDetallado } from '../../utils/helpers';

const perc = (val, tot) => tot > 0 ? ((val / tot) * 100).toFixed(1) : '0.0';

// Colores Manchester Triaje
const TRIAGE_COLORS = {
  C1: '#ef4444', // Rojo
  C2: '#f97316', // Naranja
  C3: '#eab308', // Amarillo
  C4: '#22c55e', // Verde
  C5: '#3b82f6'  // Azul
};

// Subgrupos base por defecto
const DEFAULT_SUBGROUPS = {
  'Neumonía / Influenza': { color: '#ef4444', icono: '🔴' },
  'SBO / Asma / EPOC': { color: '#f97316', icono: '🟠' },
  'Bronquitis / Bronquiolitis / VRS': { color: '#8b5cf6', icono: '🟣' },
  'Vías Altas (IRA Alta)': { color: '#06b6d4', icono: '🔵' },
  'COVID-19 / Otros Respiratorios': { color: '#10b981', icono: '🟢' }
};

// Función de clasificación diagnóstica con soporte dinámico de personalización
export const clasificarDiagnosticoRespiratorio = (diagnostico, codigo, customTerms = [], excludedTerms = []) => {
  const diag = String(diagnostico || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const cod = String(codigo || '').toUpperCase().trim();

  if (!diag && !cod) return null;

  // 0. Si el término está explícitamente excluido por el administrador
  if (excludedTerms.some(ex => diag.includes(ex.toLowerCase()) || cod.includes(ex.toUpperCase()))) {
    return null;
  }

  // 1. Evaluar si coincide con algún término personalizado agregado por el administrador
  for (const custom of customTerms) {
    const termClean = String(custom.term || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (termClean && (diag.includes(termClean) || cod.includes(termClean.toUpperCase()))) {
      const sub = custom.subgrupo || 'COVID-19 / Otros Respiratorios';
      const meta = DEFAULT_SUBGROUPS[sub] || DEFAULT_SUBGROUPS['COVID-19 / Otros Respiratorios'];
      return {
        subgrupo: sub,
        color: meta.color,
        icono: meta.icono,
        isCustom: true
      };
    }
  }

  // 2. Neumonías & Influenza
  if (
    cod.startsWith('J09') || cod.startsWith('J10') || cod.startsWith('J11') || 
    cod.startsWith('J12') || cod.startsWith('J13') || cod.startsWith('J14') || 
    cod.startsWith('J15') || cod.startsWith('J16') || cod.startsWith('J17') || 
    cod.startsWith('J18') || diag.includes('neumonia') || diag.includes('bronconeumonia') || 
    diag.includes('influenza') || diag.includes('gripe')
  ) {
    return {
      subgrupo: 'Neumonía / Influenza',
      color: '#ef4444',
      icono: '🔴'
    };
  }

  // 3. Patologías Obstructivas, Asma & SBO
  if (
    cod.startsWith('J40') || cod.startsWith('J41') || cod.startsWith('J42') || 
    cod.startsWith('J43') || cod.startsWith('J44') || cod.startsWith('J45') || 
    cod.startsWith('J46') || cod.startsWith('J47') || diag.includes('asma') || 
    diag.includes('sbo') || diag.includes('obstructivo') || diag.includes('epoc') || 
    diag.includes('enfisema') || diag.includes('broncoespasmo') || diag.includes('crisis asmatica')
  ) {
    return {
      subgrupo: 'SBO / Asma / EPOC',
      color: '#f97316',
      icono: '🟠'
    };
  }

  // 4. Vías Respiratorias Bajas / Bronquitis & Bronquiolitis (VRS)
  if (
    cod.startsWith('J20') || cod.startsWith('J21') || cod.startsWith('J22') || 
    diag.includes('bronquiolitis') || diag.includes('bronquitis') || 
    diag.includes('vrs') || diag.includes('sincicial') || diag.includes('adenovirus')
  ) {
    return {
      subgrupo: 'Bronquitis / Bronquiolitis / VRS',
      color: '#8b5cf6',
      icono: '🟣'
    };
  }

  // 5. Infecciones de Vías Respiratorias Altas
  if (
    cod.startsWith('J00') || cod.startsWith('J01') || cod.startsWith('J02') || 
    cod.startsWith('J03') || cod.startsWith('J04') || cod.startsWith('J05') || 
    cod.startsWith('J06') || diag.includes('faringitis') || diag.includes('amigdalitis') || 
    diag.includes('rinofaringitis') || diag.includes('sinusitis') || diag.includes('laringitis') || 
    diag.includes('crup') || diag.includes('traqueitis') || diag.includes('resfrio') || 
    diag.includes('catarro') || diag.includes('coriza') || diag.includes('congestion')
  ) {
    return {
      subgrupo: 'Vías Altas (IRA Alta)',
      color: '#06b6d4',
      icono: '🔵'
    };
  }

  // 6. Covid-19, Síndromes Respiratorios y Otros
  if (
    cod.startsWith('U07') || cod.startsWith('J96') || cod.startsWith('J98') || 
    diag.includes('covid') || diag.includes('sars') || diag.includes('coronavirus') || 
    diag.includes('insuficiencia respirat') || diag.includes('disnea') || 
    diag.includes('tos') || diag.includes('coqueluche') || diag.includes('sindrome respirat') || 
    diag.includes('respirat')
  ) {
    return {
      subgrupo: 'COVID-19 / Otros Respiratorios',
      color: '#10b981',
      icono: '🟢'
    };
  }

  return null;
};

// Encasillamiento Inteligente por Centros de la Provincia de Melipilla
export const encasillarCentroProvinciaMelipilla = (paciente) => {
  const estRaw = String(paciente.establecimiento || paciente.centro || paciente.cesfam || '').trim().toUpperCase();
  const comRaw = String(paciente.comuna || '').trim().toUpperCase();

  // 1. Comuna de Melipilla - Centros Específicos
  if (estRaw.includes('BORIS') || estRaw.includes('FRANCISCO BORIS')) {
    return { centro: 'CESFAM Dr. Francisco Boris Soler', comuna: 'Melipilla', tipo: 'CESFAM Urbano' };
  }
  if (estRaw.includes('ELGUETA') || estRaw.includes('EDELBERTO')) {
    return { centro: 'CESFAM Dr. Edelberto Elgueta', comuna: 'Melipilla', tipo: 'CESFAM Urbano' };
  }
  if (estRaw.includes('FLORENCIA')) {
    return { centro: 'CESFAM Florencia', comuna: 'Melipilla', tipo: 'CESFAM Urbano' };
  }
  if (estRaw.includes('SAN MANUEL')) {
    return { centro: 'CESFAM San Manuel', comuna: 'Melipilla', tipo: 'CESFAM Rural' };
  }
  if (estRaw.includes('SAR') || estRaw.includes('ELSA ROMO')) {
    return { centro: 'SAR Elsa Romo Aravena', comuna: 'Melipilla', tipo: 'SAR Urgencia' };
  }
  if (estRaw.includes('HOSPITAL') && (estRaw.includes('MELIPILLA') || estRaw.includes('SAN JOSE') || estRaw.includes('SAN JOSÉ'))) {
    return { centro: 'Hospital San José de Melipilla', comuna: 'Melipilla', tipo: 'Hospital Base' };
  }
  if (
    estRaw.includes('BOLLENAR') || estRaw.includes('PABELLON') || estRaw.includes('PABELLÓN') || 
    estRaw.includes('CULIPRAN') || estRaw.includes('CULIPRÁN') || estRaw.includes('SAN JOSE') || 
    estRaw.includes('CHOCALAN') || estRaw.includes('CHOCALÁN') || estRaw.includes('POSTA')
  ) {
    return { centro: 'Postas Rurales Melipilla', comuna: 'Melipilla', tipo: 'Posta Rural' };
  }

  // 2. Otras Comunas de la Provincia de Melipilla
  if (estRaw.includes('SAN PEDRO') || comRaw.includes('SAN PEDRO')) {
    return { centro: 'CESFAM / Postas San Pedro', comuna: 'San Pedro', tipo: 'Red San Pedro' };
  }
  if (estRaw.includes('ALHUE') || estRaw.includes('ALHUÉ') || comRaw.includes('ALHUE') || comRaw.includes('ALHUÉ')) {
    return { centro: 'CESFAM / Postas Alhué', comuna: 'Alhué', tipo: 'Red Alhué' };
  }
  if (estRaw.includes('MARIA PINTO') || estRaw.includes('MARÍA PINTO') || comRaw.includes('MARIA PINTO') || comRaw.includes('MARÍA PINTO')) {
    return { centro: 'CESFAM / Postas María Pinto', comuna: 'María Pinto', tipo: 'Red María Pinto' };
  }
  if (estRaw.includes('CURACAVI') || estRaw.includes('CURACAVÍ') || comRaw.includes('CURACAVI') || comRaw.includes('CURACAVÍ')) {
    return { centro: 'CESFAM / Hosp. Curacaví', comuna: 'Curacaví', tipo: 'Red Curacaví' };
  }

  // Si la comuna es Melipilla pero el centro no está detallado
  if (comRaw.includes('MELIPILLA')) {
    return { centro: 'Comuna Melipilla (Sin Centro Especificado)', comuna: 'Melipilla', tipo: 'Comuna Melipilla' };
  }

  if (estRaw && estRaw !== 'DESCONOCIDO' && estRaw !== 'UNDEFINED' && estRaw !== 'SIN ESPECIFICAR' && estRaw !== '-') {
    return { centro: `Otro: ${estRaw}`, comuna: comRaw || 'Otra Comuna', tipo: 'Otro Establecimiento' };
  }

  return { centro: 'Sin Establecimiento Registrado', comuna: comRaw || 'Sin Registro', tipo: 'No Determinado' };
};

export default function AnalisisRespiratorio({ 
  pacientesFiltrados, 
  pacientesDB, 
  turnosDB, 
  filtroFechaInicio, 
  filtroFechaFin,
  kpisBigQuery 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCentro, setFiltroCentro] = useState('TODOS');
  const [filtroComuna, setFiltroComuna] = useState('TODOS');
  const [filtroSubgrupo, setFiltroSubgrupo] = useState('TODOS');
  const [filtroTriaje, setFiltroTriaje] = useState('TODOS');
  const [filtroEdad, setFiltroEdad] = useState('TODOS');
  const [filtroSexo, setFiltroSexo] = useState('TODOS');
  const [filtroDestino, setFiltroDestino] = useState('TODOS');
  const [vistaGrafico, setVistaGrafico] = useState('centros'); // 'centros' | 'temporal' | 'subgrupos' | 'triaje' | 'edad'
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 12;

  // ESTADO: GESTOR ADMINISTRATIVO DE DIAGNÓSTICOS RESPIRATORIOS
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [customTerms, setCustomTerms] = useState(() => {
    try {
      const saved = localStorage.getItem('metrico_respiratorio_custom_terms');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [excludedTerms, setExcludedTerms] = useState(() => {
    try {
      const saved = localStorage.getItem('metrico_respiratorio_excluded_terms');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [newCustomTerm, setNewCustomTerm] = useState('');
  const [newCustomSubgroup, setNewCustomSubgroup] = useState('COVID-19 / Otros Respiratorios');
  const [searchDiscoveryTerm, setSearchDiscoveryTerm] = useState('');
  const [configTab, setConfigTab] = useState('descubiertos'); // 'descubiertos' | 'manual' | 'activos'

  useEffect(() => {
    localStorage.setItem('metrico_respiratorio_custom_terms', JSON.stringify(customTerms));
  }, [customTerms]);

  useEffect(() => {
    localStorage.setItem('metrico_respiratorio_excluded_terms', JSON.stringify(excludedTerms));
  }, [excludedTerms]);

  // 1. Determinar Universo de Pacientes del Período
  const targetPacientes = useMemo(() => {
    if (pacientesFiltrados && pacientesFiltrados.length > 0) {
      return pacientesFiltrados;
    }
    const startMs = filtroFechaInicio ? new Date(filtroFechaInicio + 'T00:00:00').getTime() : 0;
    const endMs = filtroFechaFin ? new Date(filtroFechaFin + 'T23:59:59').getTime() : Date.now();
    return (pacientesDB || []).filter(p => p.tAdmision && p.tAdmision >= startMs && p.tAdmision <= endMs);
  }, [pacientesFiltrados, pacientesDB, filtroFechaInicio, filtroFechaFin]);

  // Catálogo de todos los diagnósticos únicos presentes en los datos cargados para descubrimiento por el Admin
  const catalogoDiagnosticosDescubiertos = useMemo(() => {
    const map = new Map();
    const records = (pacientesDB && pacientesDB.length > 0) ? pacientesDB : targetPacientes;

    records.forEach(p => {
      const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').trim();
      const cod = String(p.codigoDiagnostico || p.codigo_diagnostico_cie10 || '').trim().toUpperCase();
      if (!diag && !cod) return;

      const key = `${cod ? `[${cod}] ` : ''}${diag || 'Sin Glosa'}`;
      if (!map.has(key)) {
        const isResp = Boolean(clasificarDiagnosticoRespiratorio(diag, cod, customTerms, excludedTerms));
        map.set(key, {
          key,
          diag,
          cod,
          count: 0,
          isResp,
          subgrupo: isResp ? clasificarDiagnosticoRespiratorio(diag, cod, customTerms, excludedTerms)?.subgrupo : null
        });
      }
      map.get(key).count++;
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [pacientesDB, targetPacientes, customTerms, excludedTerms]);

  // 2. Extraer y Enriquecer Pacientes con Patología Respiratoria
  const pacientesRespiratorios = useMemo(() => {
    return targetPacientes.map(p => {
      const respInfo = clasificarDiagnosticoRespiratorio(
        p.diagnosticoPrincipal || p.diagnostico, 
        p.codigoDiagnostico || p.codigo_diagnostico_cie10,
        customTerms,
        excludedTerms
      );
      if (!respInfo) return null;

      const centroInfo = encasillarCentroProvinciaMelipilla(p);
      const cat = String(p.categoria || p.categoria_triage || 'C4').toUpperCase();
      const triageKey = ['C1', 'C2', 'C3', 'C4', 'C5'].includes(cat) ? cat : (cat.includes('1') ? 'C1' : cat.includes('2') ? 'C2' : cat.includes('3') ? 'C3' : cat.includes('4') ? 'C4' : 'C5');

      return {
        ...p,
        respSubgrupo: respInfo.subgrupo,
        respColor: respInfo.color,
        respIcono: respInfo.icono,
        centroProvincia: centroInfo.centro,
        comunaProvincia: centroInfo.comuna,
        tipoCentro: centroInfo.tipo,
        triageManchester: triageKey
      };
    }).filter(Boolean);
  }, [targetPacientes, customTerms, excludedTerms]);

  // 3. Pacientes del Año Anterior para Comparativa YoY
  const prevYearStart = useMemo(() => {
    if (!filtroFechaInicio) return null;
    const p = filtroFechaInicio.split('-');
    if (p.length !== 3) return null;
    return `${parseInt(p[0]) - 1}-${p[1]}-${p[2]}`;
  }, [filtroFechaInicio]);

  const prevYearEnd = useMemo(() => {
    if (!filtroFechaFin) return null;
    const p = filtroFechaFin.split('-');
    if (p.length !== 3) return null;
    return `${parseInt(p[0]) - 1}-${p[1]}-${p[2]}`;
  }, [filtroFechaFin]);

  const statsPrevYear = useMemo(() => {
    if (!prevYearStart || !prevYearEnd || !pacientesDB || pacientesDB.length === 0) return { totalResp: 0, totalGlobal: 0 };
    const startMs = new Date(prevYearStart + 'T00:00:00').getTime();
    const endMs = new Date(prevYearEnd + 'T23:59:59').getTime();
    const prevPacs = pacientesDB.filter(p => p.tAdmision && p.tAdmision >= startMs && p.tAdmision <= endMs);
    let totalResp = 0;
    prevPacs.forEach(p => {
      if (clasificarDiagnosticoRespiratorio(p.diagnosticoPrincipal || p.diagnostico, p.codigoDiagnostico || p.codigo_diagnostico_cie10, customTerms, excludedTerms)) {
        totalResp++;
      }
    });
    return {
      totalResp,
      totalGlobal: prevPacs.length
    };
  }, [pacientesDB, prevYearStart, prevYearEnd, customTerms, excludedTerms]);

  // 4. Aplicar Filtros Interactivos
  const pacientesFiltradosResp = useMemo(() => {
    return pacientesRespiratorios.filter(p => {
      // Filtro por Centro
      if (filtroCentro !== 'TODOS' && p.centroProvincia !== filtroCentro) return false;

      // Filtro por Comuna
      if (filtroComuna !== 'TODOS' && p.comunaProvincia !== filtroComuna) return false;

      // Filtro por Subgrupo Respiratorio
      if (filtroSubgrupo !== 'TODOS' && p.respSubgrupo !== filtroSubgrupo) return false;

      // Filtro por Triaje Manchester
      if (filtroTriaje !== 'TODOS' && p.triageManchester !== filtroTriaje) return false;

      // Filtro por Sexo
      if (filtroSexo !== 'TODOS') {
        const s = String(p.sexo || '').toUpperCase();
        if (filtroSexo === 'M' && !(s.includes('HOMBRE') || s.includes('MASCULINO') || s === 'M')) return false;
        if (filtroSexo === 'F' && !(s.includes('MUJER') || s.includes('FEMENINO') || s === 'F')) return false;
      }

      // Filtro por Destino
      if (filtroDestino !== 'TODOS') {
        const dest = String(p.destinoAlta || p.destino || '').toUpperCase();
        if (filtroDestino === 'HOSPITAL' && !(dest.includes('HOSPITAL') || dest.includes('DERIV') || dest.includes('TRASLADO'))) return false;
        if (filtroDestino === 'DOMICILIO' && !dest.includes('DOMICILIO')) return false;
        if (filtroDestino === 'OTRO' && (dest.includes('HOSPITAL') || dest.includes('DOMICILIO'))) return false;
      }

      // Filtro por Edad
      if (filtroEdad !== 'TODOS') {
        const edadNum = Number(p.edad);
        if (isNaN(edadNum)) return false;
        if (filtroEdad === 'pediatrico' && !(edadNum < 15)) return false;
        if (filtroEdad === '0-4' && !(edadNum >= 0 && edadNum <= 4)) return false;
        if (filtroEdad === '5-14' && !(edadNum >= 5 && edadNum <= 14)) return false;
        if (filtroEdad === 'adulto' && !(edadNum >= 15 && edadNum <= 59)) return false;
        if (filtroEdad === 'adulto_mayor' && !(edadNum >= 60)) return false;
        if (filtroEdad === '80+' && !(edadNum >= 80)) return false;
      }

      // Buscador de Texto (Diagnóstico, CIE-10, Profesional, Destino, Centro)
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase().trim();
        const fullStr = `${p.diagnosticoPrincipal || ''} ${p.codigoDiagnostico || ''} ${p.profesional || p.medico || ''} ${p.centroProvincia || ''} ${p.destinoAlta || ''} ${p.correlativo || ''}`.toLowerCase();
        if (!fullStr.includes(q)) return false;
      }

      return true;
    });
  }, [pacientesRespiratorios, filtroCentro, filtroComuna, filtroSubgrupo, filtroTriaje, filtroSexo, filtroDestino, filtroEdad, searchTerm]);

  // 5. KPIs y Métricas Resumen
  const statsResumen = useMemo(() => {
    const totalResp = pacientesFiltradosResp.length;
    const totalUniverso = targetPacientes.length;
    const pctDemandaGlobal = totalUniverso > 0 ? ((totalResp / totalUniverso) * 100).toFixed(1) : '0.0';

    let pediatricos = 0;
    let adultosMayores = 0;
    let gravesC1C2 = 0;
    let hospitalizados = 0;

    pacientesFiltradosResp.forEach(p => {
      const e = Number(p.edad);
      if (!isNaN(e)) {
        if (e < 15) pediatricos++;
        if (e >= 60) adultosMayores++;
      }
      if (p.triageManchester === 'C1' || p.triageManchester === 'C2') gravesC1C2++;
      const dest = String(p.destinoAlta || p.destino || '').toUpperCase();
      if (dest.includes('HOSPITAL') || dest.includes('DERIV') || dest.includes('TRASLADO')) hospitalizados++;
    });

    // Variación interanual
    let varYoY = null;
    if (statsPrevYear.totalResp > 0) {
      varYoY = (((totalResp - statsPrevYear.totalResp) / statsPrevYear.totalResp) * 100).toFixed(1);
    }

    return {
      totalResp,
      pctDemandaGlobal,
      pediatricos,
      pctPediatricos: perc(pediatricos, totalResp),
      adultosMayores,
      pctAdultosMayores: perc(adultosMayores, totalResp),
      gravesC1C2,
      pctGraves: perc(gravesC1C2, totalResp),
      hospitalizados,
      pctHospitalizados: perc(hospitalizados, totalResp),
      varYoY
    };
  }, [pacientesFiltradosResp, targetPacientes, statsPrevYear]);

  // 6. Datos para Gráfico por Centros de Melipilla
  const dataCentros = useMemo(() => {
    const map = {};
    pacientesFiltradosResp.forEach(p => {
      const c = p.centroProvincia;
      map[c] = (map[c] || 0) + 1;
    });

    return Object.entries(map)
      .map(([nombre, count]) => ({
        nombre,
        pacientes: count,
        porcentaje: perc(count, pacientesFiltradosResp.length)
      }))
      .sort((a, b) => b.pacientes - a.pacientes);
  }, [pacientesFiltradosResp]);

  // 7. Datos para Gráfico de Subgrupos Respiratorios
  const dataSubgrupos = useMemo(() => {
    const map = {};
    pacientesFiltradosResp.forEach(p => {
      const s = p.respSubgrupo;
      map[s] = (map[s] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: DEFAULT_SUBGROUPS[name]?.color || '#6366f1',
      pct: perc(value, pacientesFiltradosResp.length)
    })).sort((a, b) => b.value - a.value);
  }, [pacientesFiltradosResp]);

  // 8. Datos para Curva de Tendencia Temporal (Diaria)
  const dataTemporal = useMemo(() => {
    const map = {};
    pacientesFiltradosResp.forEach(p => {
      if (!p.tAdmision) return;
      const d = new Date(p.tAdmision);
      const diaStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map[diaStr]) {
        map[diaStr] = { dia: diaStr, total: 0, pediatricos: 0, adultos: 0, adultosMayores: 0, timestamp: p.tAdmision };
      }
      map[diaStr].total++;
      const e = Number(p.edad);
      if (!isNaN(e)) {
        if (e < 15) map[diaStr].pediatricos++;
        else if (e >= 60) map[diaStr].adultosMayores++;
        else map[diaStr].adultos++;
      }
    });

    return Object.values(map).sort((a, b) => a.timestamp - b.timestamp);
  }, [pacientesFiltradosResp]);

  // Paginación de la Tabla Anonimizada
  const totalPaginas = Math.ceil(pacientesFiltradosResp.length / itemsPorPagina) || 1;
  const pacientesPaginados = useMemo(() => {
    const start = (paginaActual - 1) * itemsPorPagina;
    return pacientesFiltradosResp.slice(start, start + itemsPorPagina);
  }, [pacientesFiltradosResp, paginaActual]);

  // Listas para Filtros Desplegables
  const listaCentrosUnicos = useMemo(() => {
    const set = new Set();
    pacientesRespiratorios.forEach(p => set.add(p.centroProvincia));
    return Array.from(set).sort();
  }, [pacientesRespiratorios]);

  const listaComunasUnicas = useMemo(() => {
    const set = new Set();
    pacientesRespiratorios.forEach(p => set.add(p.comunaProvincia));
    return Array.from(set).sort();
  }, [pacientesRespiratorios]);

  // Funciones Administrativas de Diagnósticos
  const handleToggleDiagnosisInclusion = (diagItem) => {
    const term = diagItem.diag || diagItem.cod;
    if (!term) return;

    if (diagItem.isResp) {
      // Excluirlo
      setExcludedTerms(prev => [...prev.filter(t => t !== term), term]);
      setCustomTerms(prev => prev.filter(c => c.term.toLowerCase() !== term.toLowerCase()));
    } else {
      // Incluirlo
      setExcludedTerms(prev => prev.filter(t => t !== term));
      setCustomTerms(prev => [
        ...prev.filter(c => c.term.toLowerCase() !== term.toLowerCase()),
        { term, subgrupo: 'COVID-19 / Otros Respiratorios' }
      ]);
    }
  };

  const handleAddManualCustomTerm = (e) => {
    e.preventDefault();
    if (!newCustomTerm.trim()) return;

    const termClean = newCustomTerm.trim();
    setExcludedTerms(prev => prev.filter(t => t.toLowerCase() !== termClean.toLowerCase()));
    setCustomTerms(prev => [
      ...prev.filter(c => c.term.toLowerCase() !== termClean.toLowerCase()),
      { term: termClean, subgrupo: newCustomSubgroup }
    ]);
    setNewCustomTerm('');
  };

  const handleRemoveCustomTerm = (termToRemove) => {
    setCustomTerms(prev => prev.filter(c => c.term !== termToRemove));
  };

  const handleResetCustomTerms = () => {
    if (window.confirm("¿Deseas restaurar la lista de diagnósticos respiratorios a la configuración de fábrica?")) {
      setCustomTerms([]);
      setExcludedTerms([]);
      localStorage.removeItem('metrico_respiratorio_custom_terms');
      localStorage.removeItem('metrico_respiratorio_excluded_terms');
    }
  };

  // Exportar a Excel con SheetJS
  const handleExportExcel = () => {
    try {
      if (typeof window.XLSX === 'undefined') {
        alert("La librería de exportación se está cargando. Por favor, intente en 3 segundos.");
        return;
      }

      const rows = pacientesFiltradosResp.map((p, idx) => {
        const d = p.tAdmision ? new Date(p.tAdmision) : null;
        const fechaStr = d ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : '-';
        const turnoInfo = obtenerTurnoDetallado(p.tAdmision);

        return {
          'N°': idx + 1,
          'Correlativo / ID': p.correlativo || p.id || `REC-${idx + 1}`,
          'Fecha y Hora Admisión': fechaStr,
          'Turno Asignado': turnoInfo.textoCompleto || '-',
          'Edad (Años)': p.edad || '-',
          'Sexo': p.sexo || '-',
          'Previsión': p.prevision || 'FONASA',
          'Establecimiento / Centro Melipilla': p.centroProvincia || '-',
          'Comuna Origen': p.comunaProvincia || '-',
          'Triaje Manchester': p.triageManchester || 'C4',
          'Subgrupo Respiratorio': p.respSubgrupo || '-',
          'Código CIE-10': p.codigoDiagnostico || p.codigo_diagnostico_cie10 || 'J00',
          'Hipótesis Diagnóstica Principal': p.diagnosticoPrincipal || p.diagnostico || '-',
          'Destino de Alta': p.destinoAlta || p.destino || 'DOMICILIO',
          'Profesional Tratante': p.profesional || p.medico || 'MÉDICO SAR',
          'Estado Atención': p.estado || 'Finalizada'
        };
      });

      const ws = window.XLSX.utils.json_to_sheet(rows);
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, "Vigilancia_Respiratoria");
      window.XLSX.writeFile(wb, `Reporte_Epidemiologico_Respiratorio_${filtroFechaInicio || 'Actual'}_a_${filtroFechaFin || 'Actual'}.xlsx`);
    } catch (err) {
      console.error("Error al exportar a Excel:", err);
      alert("Hubo un problema al generar el archivo Excel.");
    }
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    const headers = [
      'Correlativo', 'Fecha_Hora', 'Edad', 'Sexo', 'Prevision', 
      'Establecimiento_Melipilla', 'Comuna', 'Triaje', 'Subgrupo_Respiratorio', 
      'CIE10', 'Hipotesis_Diagnostica', 'Destino', 'Profesional', 'Estado'
    ];

    const csvRows = [headers.join(';')];

    pacientesFiltradosResp.forEach(p => {
      const d = p.tAdmision ? new Date(p.tAdmision) : null;
      const fechaStr = d ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : '-';

      const row = [
        `"${p.correlativo || p.id || ''}"`,
        `"${fechaStr}"`,
        `"${p.edad || ''}"`,
        `"${p.sexo || ''}"`,
        `"${p.prevision || 'FONASA'}"`,
        `"${p.centroProvincia || ''}"`,
        `"${p.comunaProvincia || ''}"`,
        `"${p.triageManchester || ''}"`,
        `"${p.respSubgrupo || ''}"`,
        `"${p.codigoDiagnostico || ''}"`,
        `"${(p.diagnosticoPrincipal || '').replace(/"/g, '""')}"`,
        `"${p.destinoAlta || 'DOMICILIO'}"`,
        `"${p.profesional || p.medico || ''}"`,
        `"${p.estado || 'Finalizada'}"`
      ];
      csvRows.push(row.join(';'));
    });

    const blob = new Blob(["\uFEFF" + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Vigilancia_Respiratoria_Melipilla_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in print:p-0">
      
      {/* CABECERA PRINCIPAL DEL SUBREPORTE */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card-custom border border-card-custom p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500 shadow-sm shrink-0">
            <Wind className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-primary-custom tracking-tight">
                Vigilancia Epidemiológica Respiratoria
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                Campaña Invierno & Red Melipilla
              </span>
            </div>
            <p className="text-xs text-secondary-custom font-medium mt-0.5">
              Encasillamiento clínico de patologías respiratorias y georreferenciación por centros de salud de la Provincia de Melipilla.
            </p>
          </div>
        </div>

        {/* BOTONERA DE ACCIÓN, CONFIGURACIÓN Y EXPORTACIÓN */}
        <div className="flex items-center gap-2 self-end lg:self-auto flex-wrap">
          
          {/* BOTÓN ADMINISTRATIVO: GESTOR DE DIAGNÓSTICOS RESPIRATORIOS */}
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer"
            title="Abrir gestor administrativo de diagnósticos respiratorios y personalización"
          >
            <Settings2 className="w-4 h-4" />
            <span>Configurar Diagnósticos ({customTerms.length > 0 ? `+${customTerms.length}` : 'Clasificador'})</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
            title="Exportar base completa a Excel XLSX"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm transition-all cursor-pointer"
            title="Exportar archivo CSV delimitado"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-card-custom hover:bg-black/5 dark:hover:bg-white/5 text-primary-custom border border-card-custom shadow-sm transition-all cursor-pointer"
            title="Imprimir informe oficial"
          >
            <Printer className="w-4 h-4 text-secondary-custom" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* TARJETAS EJECUTIVAS DE KPIS Y ALERTAS EPIDEMIOLÓGICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* KPI 1: TOTAL CASOS RESPIRATORIOS */}
        <div className="bg-card-custom border border-card-custom rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-secondary-custom uppercase tracking-wider">Casos Respiratorios</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-primary-custom tracking-tight">
              {statsResumen.totalResp.toLocaleString()} <span className="text-sm font-bold text-secondary-custom">pac.</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-secondary-custom">
              <span>Representa el</span>
              <strong className="text-cyan-500 font-bold">{statsResumen.pctDemandaGlobal}%</strong>
              <span>de la urgencia</span>
            </div>
          </div>
          {statsResumen.varYoY !== null && (
            <div className={`mt-2 pt-2 border-t border-card-custom/40 flex items-center justify-between text-[11px] font-bold ${Number(statsResumen.varYoY) >= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              <span>Variación vs Año Ant:</span>
              <span>{Number(statsResumen.varYoY) >= 0 ? `+${statsResumen.varYoY}%` : `${statsResumen.varYoY}%`}</span>
            </div>
          )}
        </div>

        {/* KPI 2: DEMANDA PEDIÁTRICA */}
        <div className="bg-card-custom border border-card-custom rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-secondary-custom uppercase tracking-wider">Carga Pediátrica (&lt;15a)</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Baby className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
              {statsResumen.pediatricos.toLocaleString()} <span className="text-sm font-bold text-secondary-custom">pac.</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-secondary-custom">
              <span>Proporción infantil:</span>
              <strong className="text-purple-500 font-bold">{statsResumen.pctPediatricos}%</strong>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-card-custom/40 text-[10px] text-secondary-custom">
            Lactantes y escolares de la provincia
          </div>
        </div>

        {/* KPI 3: ADULTOS MAYORES */}
        <div className="bg-card-custom border border-card-custom rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-secondary-custom uppercase tracking-wider">Adultos Mayores (60+a)</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {statsResumen.adultosMayores.toLocaleString()} <span className="text-sm font-bold text-secondary-custom">pac.</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-secondary-custom">
              <span>Proporción senescente:</span>
              <strong className="text-amber-500 font-bold">{statsResumen.pctAdultosMayores}%</strong>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-card-custom/40 text-[10px] text-secondary-custom">
            Población vulnerable respiratoria
          </div>
        </div>

        {/* KPI 4: CASOS COMPLEJOS / GRAVES (C1-C2) */}
        <div className="bg-card-custom border border-card-custom rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-secondary-custom uppercase tracking-wider">Alta Complejidad (C1/C2)</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              {statsResumen.gravesC1C2.toLocaleString()} <span className="text-sm font-bold text-secondary-custom">pac.</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-secondary-custom">
              <span>Tasa de gravedad:</span>
              <strong className="text-rose-500 font-bold">{statsResumen.pctGraves}%</strong>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-card-custom/40 text-[10px] text-secondary-custom">
            Reanimación y Emergencia crítica
          </div>
        </div>

        {/* KPI 5: TRASLADOS / DERIVACIONES HOSPITALARIAS */}
        <div className="bg-card-custom border border-card-custom rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-secondary-custom uppercase tracking-wider">Derivación Hospital</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Hospital className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              {statsResumen.hospitalizados.toLocaleString()} <span className="text-sm font-bold text-secondary-custom">pac.</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-secondary-custom">
              <span>Tasa hospitalización:</span>
              <strong className="text-indigo-500 font-bold">{statsResumen.pctHospitalizados}%</strong>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-card-custom/40 text-[10px] text-secondary-custom">
            Derivados a Hospital San José
          </div>
        </div>

      </div>

      {/* BARRA DE FILTROS INTERACTIVOS ESPECÍFICOS */}
      <div className="bg-card-custom border border-card-custom p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          
          {/* Selector de Centro de la Provincia de Melipilla */}
          <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-card-custom px-3 py-1.5 rounded-xl text-xs">
            <Building2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <span className="text-secondary-custom font-medium">Centro:</span>
            <select
              value={filtroCentro}
              onChange={(e) => { setFiltroCentro(e.target.value); setPaginaActual(1); }}
              className="bg-transparent font-bold text-primary-custom outline-none cursor-pointer text-xs"
            >
              <option value="TODOS" className="bg-slate-900 text-white">Todos los Centros ({listaCentrosUnicos.length})</option>
              {listaCentrosUnicos.map(c => (
                <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
              ))}
            </select>
          </div>

          {/* Selector de Comuna de la Provincia */}
          <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-card-custom px-3 py-1.5 rounded-xl text-xs">
            <span className="text-secondary-custom font-medium">Comuna:</span>
            <select
              value={filtroComuna}
              onChange={(e) => { setFiltroComuna(e.target.value); setPaginaActual(1); }}
              className="bg-transparent font-bold text-primary-custom outline-none cursor-pointer text-xs"
            >
              <option value="TODOS" className="bg-slate-900 text-white">Todas las Comunas</option>
              {listaComunasUnicas.map(com => (
                <option key={com} value={com} className="bg-slate-900 text-white">{com}</option>
              ))}
            </select>
          </div>

          {/* Selector de Subgrupo Respiratorio */}
          <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-card-custom px-3 py-1.5 rounded-xl text-xs">
            <Wind className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="text-secondary-custom font-medium">Patología:</span>
            <select
              value={filtroSubgrupo}
              onChange={(e) => { setFiltroSubgrupo(e.target.value); setPaginaActual(1); }}
              className="bg-transparent font-bold text-primary-custom outline-none cursor-pointer text-xs"
            >
              <option value="TODOS" className="bg-slate-900 text-white">Todas las Patologías</option>
              <option value="Neumonía / Influenza" className="bg-slate-900 text-white">Neumonía / Influenza</option>
              <option value="SBO / Asma / EPOC" className="bg-slate-900 text-white">SBO / Asma / EPOC</option>
              <option value="Bronquitis / Bronquiolitis / VRS" className="bg-slate-900 text-white">Bronquitis / Bronquiolitis (VRS)</option>
              <option value="Vías Altas (IRA Alta)" className="bg-slate-900 text-white">Vías Altas (IRA Alta)</option>
              <option value="COVID-19 / Otros Respiratorios" className="bg-slate-900 text-white">COVID-19 / Otros</option>
            </select>
          </div>

          {/* Selector de Triaje Manchester */}
          <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-card-custom px-3 py-1.5 rounded-xl text-xs">
            <span className="text-secondary-custom font-medium">Triaje:</span>
            <select
              value={filtroTriaje}
              onChange={(e) => { setFiltroTriaje(e.target.value); setPaginaActual(1); }}
              className="bg-transparent font-bold text-primary-custom outline-none cursor-pointer text-xs"
            >
              <option value="TODOS" className="bg-slate-900 text-white">Todos los Triajes</option>
              <option value="C1" className="bg-slate-900 text-red-400 font-bold">C1 - Resucitación</option>
              <option value="C2" className="bg-slate-900 text-orange-400 font-bold">C2 - Emergencia</option>
              <option value="C3" className="bg-slate-900 text-yellow-400 font-bold">C3 - Urgencia</option>
              <option value="C4" className="bg-slate-900 text-green-400 font-bold">C4 - Menor</option>
              <option value="C5" className="bg-slate-900 text-blue-400 font-bold">C5 - No urgente</option>
            </select>
          </div>

          {/* Selector de Grupo Etario */}
          <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 border border-card-custom px-3 py-1.5 rounded-xl text-xs">
            <span className="text-secondary-custom font-medium">Edad:</span>
            <select
              value={filtroEdad}
              onChange={(e) => { setFiltroEdad(e.target.value); setPaginaActual(1); }}
              className="bg-transparent font-bold text-primary-custom outline-none cursor-pointer text-xs"
            >
              <option value="TODOS" className="bg-slate-900 text-white">Todas las Edades</option>
              <option value="pediatrico" className="bg-slate-900 text-white">Pediátricos (&lt; 15 años)</option>
              <option value="0-4" className="bg-slate-900 text-white">Lactantes (0 - 4 años)</option>
              <option value="5-14" className="bg-slate-900 text-white">Escolares (5 - 14 años)</option>
              <option value="adulto" className="bg-slate-900 text-white">Adultos (15 - 59 años)</option>
              <option value="adulto_mayor" className="bg-slate-900 text-white">Adultos Mayores (60+ años)</option>
              <option value="80+" className="bg-slate-900 text-white">Cuarta Edad (80+ años)</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(filtroCentro !== 'TODOS' || filtroComuna !== 'TODOS' || filtroSubgrupo !== 'TODOS' || filtroTriaje !== 'TODOS' || filtroEdad !== 'TODOS' || filtroSexo !== 'TODOS' || filtroDestino !== 'TODOS' || searchTerm !== '') && (
            <button
              onClick={() => {
                setFiltroCentro('TODOS');
                setFiltroComuna('TODOS');
                setFiltroSubgrupo('TODOS');
                setFiltroTriaje('TODOS');
                setFiltroEdad('TODOS');
                setFiltroSexo('TODOS');
                setFiltroDestino('TODOS');
                setSearchTerm('');
                setPaginaActual(1);
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              Limpiar
            </button>
          )}

        </div>

        {/* Buscador Rápido de Hipótesis Diagnóstica / Profesional */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-secondary-custom absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar hipótesis, CIE-10, médico..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPaginaActual(1); }}
            className="w-full bg-black/5 dark:bg-white/5 border border-card-custom rounded-xl pl-9 pr-3 py-1.5 text-xs text-primary-custom placeholder:text-secondary-custom/60 outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* SECCIÓN DE VISUALIZACIÓN GRÁFICA INTERACTIVA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRÁFICO PRINCIPAL: ENCASILLAMIENTO POR CENTROS DE LA PROVINCIA */}
        <div className="lg:col-span-2 bg-card-custom border border-card-custom rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-card-custom/40">
            <div>
              <h3 className="text-sm font-black text-primary-custom tracking-tight flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-500" />
                <span>Distribución por Centros de Salud de la Provincia de Melipilla</span>
              </h3>
              <p className="text-[11px] text-secondary-custom mt-0.5">
                Volumen asistencial clasificado por establecimiento de origen del paciente
              </p>
            </div>

            {/* Selector de Tipo de Gráfico */}
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-card-custom text-xs">
              <button
                onClick={() => setVistaGrafico('centros')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${vistaGrafico === 'centros' ? 'bg-cyan-500 text-white shadow-xs' : 'text-secondary-custom hover:text-primary-custom'}`}
              >
                Centros
              </button>
              <button
                onClick={() => setVistaGrafico('temporal')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${vistaGrafico === 'temporal' ? 'bg-cyan-500 text-white shadow-xs' : 'text-secondary-custom hover:text-primary-custom'}`}
              >
                Evolución Diaria
              </button>
            </div>
          </div>

          {/* Render del Gráfico */}
          <div className="h-72 w-full mt-4">
            {vistaGrafico === 'centros' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataCentros.slice(0, 8)} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis 
                    dataKey="nombre" 
                    type="category" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    width={180} 
                    tickFormatter={(val) => val.length > 25 ? `${val.substring(0, 25)}...` : val} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', borderRadius: '1rem', color: '#f8fafc', fontSize: '12px' }}
                    formatter={(val, name, props) => [`${val} pacientes (${props.payload.porcentaje}%)`, 'Volumen Respiratorio']}
                  />
                  <Bar dataKey="pacientes" fill="#06b6d4" radius={[0, 8, 8, 0]}>
                    {dataCentros.slice(0, 8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#06b6d4' : index === 1 ? '#0891b2' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataTemporal} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRespTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRespPed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="dia" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#38bdf8', borderRadius: '1rem', color: '#f8fafc', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area type="monotone" dataKey="total" name="Total Respiratorio" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRespTotal)" />
                  <Area type="monotone" dataKey="pediatricos" name="Pediátricos (<15a)" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorRespPed)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* GRÁFICO SECUNDARIO: DISTRIBUCIÓN POR PATOLOGÍA Y TRIAJE */}
        <div className="bg-card-custom border border-card-custom rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="pb-3 border-b border-card-custom/40">
            <h3 className="text-sm font-black text-primary-custom tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Patologías & Severidad Triaje</span>
            </h3>
            <p className="text-[11px] text-secondary-custom mt-0.5">
              Desglose de subgrupos respiratorios identificados
            </p>
          </div>

          {/* Gráfico Donut de Patologías */}
          <div className="h-44 w-full relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataSubgrupos}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={65}
                  paddingAngle={3}
                >
                  {dataSubgrupos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#a855f7', borderRadius: '1rem', color: '#f8fafc', fontSize: '11px' }}
                  formatter={(val, name, props) => [`${val} pac. (${props.payload.pct}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-primary-custom">{statsResumen.totalResp}</span>
              <span className="text-[9px] font-bold text-secondary-custom uppercase">Casos</span>
            </div>
          </div>

          {/* Leyenda Detallada */}
          <div className="space-y-1.5 pt-2 border-t border-card-custom/40">
            {dataSubgrupos.slice(0, 4).map((sub) => (
              <div key={sub.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                  <span className="text-secondary-custom font-medium truncate max-w-[140px]">{sub.name}</span>
                </div>
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-primary-custom">{sub.value}</span>
                  <span className="text-[10px] text-secondary-custom">({sub.pct}%)</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* TABLA OFICIAL DE AUDITORÍA Y REGISTROS CLÍNICOS (ANONIMIZADA) */}
      <div className="bg-card-custom border border-card-custom rounded-2xl shadow-sm overflow-hidden">
        
        {/* Cabecera de la Tabla */}
        <div className="p-5 border-b border-card-custom/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card-custom">
          <div>
            <div className="flex items-center gap-2.5">
              <Stethoscope className="w-4 h-4 text-cyan-500" />
              <h3 className="text-base font-black text-primary-custom tracking-tight">
                Nómina de Auditoría y Vigilancia Epidemiológica Respiratoria
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Anonimizado (Sin RUT ni Nombres)
              </span>
            </div>
            <p className="text-xs text-secondary-custom font-medium mt-1">
              Registro trazable por Correlativo / ID con Hipótesis Diagnóstica para auditoría médica y validación de coberturas.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-secondary-custom">
            <span>Mostrando</span>
            <strong className="text-cyan-500 font-black">{pacientesFiltradosResp.length}</strong>
            <span>registros clasificados</span>
          </div>
        </div>

        {/* Contenedor con Scroll Horizontal */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-card-custom/40 bg-black/5 dark:bg-white/5 text-[11px] font-black text-secondary-custom uppercase tracking-wider">
                <th className="py-3.5 px-4">Correlativo / ID</th>
                <th className="py-3.5 px-4">Fecha & Hora</th>
                <th className="py-3.5 px-3">Triaje</th>
                <th className="py-3.5 px-3">Edad / Sexo</th>
                <th className="py-3.5 px-4">Centro Provincia Melipilla</th>
                <th className="py-3.5 px-4">Hipótesis Diagnóstica Principal</th>
                <th className="py-3.5 px-3">CIE-10</th>
                <th className="py-3.5 px-4">Destino de Alta</th>
                <th className="py-3.5 px-4">Médico / Profesional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-custom/30 text-xs">
              {pacientesPaginados.length > 0 ? (
                pacientesPaginados.map((p, index) => {
                  const d = p.tAdmision ? new Date(p.tAdmision) : null;
                  const fechaStr = d ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : '-';
                  const triageColor = TRIAGE_COLORS[p.triageManchester] || '#22c55e';

                  return (
                    <tr key={p.id || index} className="hover:bg-cyan-500/5 transition-colors">
                      
                      {/* Correlativo */}
                      <td className="py-3 px-4 font-mono font-bold text-primary-custom">
                        <span className="px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5 border border-card-custom text-xs">
                          {p.correlativo || p.id || `REC-${index + 1}`}
                        </span>
                      </td>

                      {/* Fecha y Hora */}
                      <td className="py-3 px-4 text-secondary-custom font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-secondary-custom shrink-0" />
                          <span>{fechaStr} hrs</span>
                        </div>
                      </td>

                      {/* Triaje Manchester */}
                      <td className="py-3 px-3">
                        <span 
                          className="px-2 py-0.5 rounded-md text-[10px] font-black text-white shadow-xs"
                          style={{ backgroundColor: triageColor }}
                        >
                          {p.triageManchester}
                        </span>
                      </td>

                      {/* Edad / Sexo */}
                      <td className="py-3 px-3 font-medium text-primary-custom">
                        <span>{p.edad ? `${p.edad} a.` : '-'}</span>
                        <span className="text-secondary-custom text-[11px] ml-1">({p.sexo ? String(p.sexo).substring(0, 1).toUpperCase() : '-'})</span>
                      </td>

                      {/* Centro Melipilla */}
                      <td className="py-3 px-4 font-bold text-cyan-600 dark:text-cyan-400">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          <span className="truncate max-w-[200px]" title={p.centroProvincia}>
                            {p.centroProvincia}
                          </span>
                        </div>
                      </td>

                      {/* Hipótesis Diagnóstica */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-primary-custom">
                            {p.diagnosticoPrincipal || p.diagnostico || 'Sin Glosa Diagnóstica'}
                          </span>
                          <span className="text-[10px] font-medium text-secondary-custom">
                            {p.respSubgrupo}
                          </span>
                        </div>
                      </td>

                      {/* Código CIE-10 */}
                      <td className="py-3 px-3 font-mono font-bold text-xs text-indigo-500">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                          {p.codigoDiagnostico || p.codigo_diagnostico_cie10 || 'J00'}
                        </span>
                      </td>

                      {/* Destino */}
                      <td className="py-3 px-4 font-medium text-secondary-custom">
                        <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                          String(p.destinoAlta || '').toUpperCase().includes('HOSPITAL')
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {p.destinoAlta || p.destino || 'DOMICILIO'}
                        </span>
                      </td>

                      {/* Médico */}
                      <td className="py-3 px-4 text-secondary-custom font-medium text-xs">
                        <span className="truncate max-w-[160px] block" title={p.profesional || p.medico}>
                          {p.profesional || p.medico || 'MÉDICO GENERAL SAR'}
                        </span>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-secondary-custom">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Wind className="w-8 h-8 text-secondary-custom opacity-40" />
                      <p className="font-bold text-sm">No se encontraron registros respiratorios para los filtros seleccionados.</p>
                      <p className="text-xs">Prueba seleccionando otro centro o ampliando el rango de fechas.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginador Inferior */}
        {totalPaginas > 1 && (
          <div className="p-4 border-t border-card-custom/40 flex flex-col sm:flex-row justify-between items-center gap-3 bg-card-custom">
            <span className="text-xs text-secondary-custom font-medium">
              Página <strong className="text-primary-custom">{paginaActual}</strong> de <strong className="text-primary-custom">{totalPaginas}</strong>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-card-custom border border-card-custom hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                Anterior
              </button>
              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                let pageNum = i + 1;
                if (paginaActual > 3 && totalPaginas > 5) {
                  pageNum = paginaActual - 2 + i;
                  if (pageNum > totalPaginas) pageNum = totalPaginas - (4 - i);
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPaginaActual(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${paginaActual === pageNum ? 'bg-cyan-500 text-white shadow-xs' : 'bg-card-custom border border-card-custom text-secondary-custom hover:text-primary-custom'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-card-custom border border-card-custom hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

      </div>

      {/* MODAL ADMINISTRATIVO: GESTIÓN DE DIAGNÓSTICOS RESPIRATORIOS */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header del Modal */}
            <div className="p-5 border-b border-indigo-500/20 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">
                    Gestor de Diagnósticos Respiratorios
                  </h3>
                  <p className="text-xs text-slate-400">
                    Selecciona o añade diagnósticos para incluirlos en el clasificador de vigilancia epidemiológica.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pestañas de Gestión */}
            <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-3 gap-2">
              <button
                onClick={() => setConfigTab('descubiertos')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${configTab === 'descubiertos' ? 'text-indigo-400 border-indigo-500 bg-indigo-500/10' : 'text-slate-400 border-transparent hover:text-white'}`}
              >
                Diagnósticos en Base de Datos ({catalogoDiagnosticosDescubiertos.length})
              </button>
              <button
                onClick={() => setConfigTab('manual')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${configTab === 'manual' ? 'text-indigo-400 border-indigo-500 bg-indigo-500/10' : 'text-slate-400 border-transparent hover:text-white'}`}
              >
                + Añadir Diagnóstico Manual
              </button>
              <button
                onClick={() => setConfigTab('activos')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${configTab === 'activos' ? 'text-indigo-400 border-indigo-500 bg-indigo-500/10' : 'text-slate-400 border-transparent hover:text-white'}`}
              >
                Personalizados Activos ({customTerms.length})
              </button>
            </div>

            {/* Contenido de las Pestañas */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              
              {/* TAB 1: DIAGNÓSTICOS DESCUBIERTOS EN LA BD */}
              {configTab === 'descubiertos' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Filtrar diagnósticos encontrados en el archivo cargado..."
                        value={searchDiscoveryTerm}
                        onChange={(e) => setSearchDiscoveryTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                      onClick={handleResetCustomTerms}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all shrink-0 cursor-pointer"
                    >
                      Restaurar Todo
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                    {catalogoDiagnosticosDescubiertos
                      .filter(d => searchDiscoveryTerm === '' || d.key.toLowerCase().includes(searchDiscoveryTerm.toLowerCase()))
                      .slice(0, 100)
                      .map((d) => (
                        <div 
                          key={d.key} 
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${d.isResp ? 'bg-indigo-500/10 border-indigo-500/30 text-slate-100' : 'bg-slate-950/40 border-slate-800/80 text-slate-400'}`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <input
                              type="checkbox"
                              checked={d.isResp}
                              onChange={() => handleToggleDiagnosisInclusion(d)}
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700 cursor-pointer"
                            />
                            <div className="flex flex-col truncate">
                              <span className="font-bold text-xs truncate">{d.key}</span>
                              <span className="text-[10px] text-slate-500">
                                {d.isResp ? `Incluido en: ${d.subgrupo}` : 'No clasificado como respiratorio'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                              {d.count} pac.
                            </span>
                            <button
                              onClick={() => handleToggleDiagnosisInclusion(d)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${d.isResp ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
                            >
                              {d.isResp ? 'Excluir' : 'Incluir'}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 2: AGREGAR DIAGNÓSTICO MANUAL */}
              {configTab === 'manual' && (
                <form onSubmit={handleAddManualCustomTerm} className="space-y-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Registrar nuevo término o código CIE-10
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Nombre o Glosa / Código CIE-10:</label>
                      <input
                        type="text"
                        placeholder="Ej: Laringotraqueitis, J21.8, Croup..."
                        value={newCustomTerm}
                        onChange={(e) => setNewCustomTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Subgrupo Clínico Asignado:</label>
                      <select
                        value={newCustomSubgroup}
                        onChange={(e) => setNewCustomSubgroup(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {Object.keys(DEFAULT_SUBGROUPS).map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Guardar y Procesar en Vigilancia</span>
                  </button>
                </form>
              )}

              {/* TAB 3: DIAGNÓSTICOS PERSONALIZADOS ACTIVOS */}
              {configTab === 'activos' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Lista de términos agregados o ajustados de forma personalizada por la administración:
                  </p>
                  {customTerms.length > 0 ? (
                    <div className="space-y-1.5 max-h-72 overflow-y-auto">
                      {customTerms.map(c => (
                        <div key={c.term} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-xs font-bold text-white">{c.term}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
                              {c.subgrupo}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveCustomTerm(c.term)}
                            className="text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                            title="Eliminar de personalizados"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      No hay diagnósticos personalizados manuales. Se están utilizando los algoritmos normativos CIE-10.
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Footer del Modal */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Los cambios se aplican inmediatamente sobre todos los gráficos y tablas de la sesión.
              </span>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer"
              >
                Cerrar y Ver Resultados
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
