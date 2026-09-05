import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wind, Activity, Stethoscope, Building2, Users, Search, Download, Filter, 
  AlertCircle, Calendar, ChevronRight, ChevronDown, ChevronUp, ArrowRightLeft, 
  Info, TrendingUp, TrendingDown, Layers, BarChart3, Baby, UserCheck, HeartPulse, 
  ArrowUpRight, Sparkles, ShieldAlert, FileSpreadsheet, Printer, Clock, Hospital,
  Settings2, Plus, Trash2, CheckCircle2, X, RefreshCw, Sliders, Phone, Mail, 
  MapPin, User, Eye, ExternalLink, FileText, CheckCircle
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

// Directorio Oficial de Centros de Salud CORMUMEL / Provincia de Melipilla
export const DIRECTORIO_CENTROS_MELIPILLA = {
  'CESFAM Dr. Francisco Boris Soler': {
    nombre: 'CESFAM Dr. Francisco Boris Soler',
    tipo: 'CESFAM Urbano',
    categoriaFiltro: 'CESFAM',
    comuna: 'Melipilla',
    encargado: 'Pilar González Núñez',
    cargo: 'Directora',
    direccion: 'Silva Chávez N° 1650',
    telefono: '2 2800 0430',
    email: 'direccion.boris@cormumel.cl',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30'
  },
  'CESFAM Dr. Edelberto Elgueta': {
    nombre: 'CESFAM Dr. Edelberto Elgueta',
    tipo: 'CESFAM Urbano',
    categoriaFiltro: 'CESFAM',
    comuna: 'Melipilla',
    encargado: 'Claudia Cerda Madrid',
    cargo: 'Directora',
    direccion: 'Arza N° 1576',
    telefono: '2 2574 3550',
    email: 'direccion.elgueta@cormumel.cl',
    badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-300 border-orange-500/30'
  },
  'CESFAM Alfarera Rosa Reyes Vilches': {
    nombre: 'CESFAM Alfarera Rosa Reyes Vilches',
    tipo: 'CESFAM Urbano / Rural (Pomaire)',
    categoriaFiltro: 'CESFAM',
    comuna: 'Melipilla',
    encargado: 'Jorge Condeza García',
    cargo: 'Director',
    direccion: 'Artesana Julita Vera N° 354, Pomaire',
    telefono: '2 2568 8849',
    email: 'direccion.pomaire@cormumel.cl',
    badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/30'
  },
  'CESFAM Florencia': {
    nombre: 'CESFAM Florencia',
    tipo: 'CESFAM Urbano',
    categoriaFiltro: 'CESFAM',
    comuna: 'Melipilla',
    encargado: 'Eliana Espinoza Alarcón',
    cargo: 'Directora',
    direccion: 'Libertad N°1923',
    telefono: '2 2568 8141 – 2 2612 4987',
    email: 'direccion.florencia@cormumel.cl',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30'
  },
  'CESFAM San Manuel': {
    nombre: 'CESFAM San Manuel',
    tipo: 'CESFAM Rural',
    categoriaFiltro: 'CESFAM',
    comuna: 'Melipilla',
    encargado: 'Mónica Adasme Jerez',
    cargo: 'Directora',
    direccion: 'Ruta G-668, camino público s/n, Melipilla',
    telefono: '2 2574 5501',
    email: 'direccion.sanmanuel@cormumel.cl',
    badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-300 border-orange-500/30'
  },
  'CECOSF Padre Demetrio Bravo': {
    nombre: 'CECOSF Padre Demetrio Bravo',
    tipo: 'CECOSF Urbano',
    categoriaFiltro: 'CECOSF',
    comuna: 'Melipilla',
    encargado: 'Tamara Gallardo Seguel',
    cargo: 'Encargada',
    direccion: 'Ignacio Carrera Pinto N°60',
    telefono: '2 2575 9851',
    email: 'direccion.demetriobravo@cormumel.cl',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30'
  },
  'CECOSF Obispo Pablo Lizama': {
    nombre: 'CECOSF Obispo Pablo Lizama',
    tipo: 'CECOSF Urbano',
    categoriaFiltro: 'CECOSF',
    comuna: 'Melipilla',
    encargado: 'Evelin Villouta Torres',
    cargo: 'Encargada',
    direccion: 'Obispo Guillermo Vera N°2091',
    telefono: '2 2574 9718 / +569 7216 5183',
    email: 'direccion.lizama@cormumel.cl',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30'
  },
  'CECOSF Codigua': {
    nombre: 'CECOSF Codigua',
    tipo: 'CECOSF Rural',
    categoriaFiltro: 'CECOSF',
    comuna: 'Melipilla',
    encargado: 'Camila Videla Gómez',
    cargo: 'Encargada',
    direccion: 'Codigua KM 8, S/N',
    telefono: '+569 9610 2499',
    email: 'direccion.codigua@cormumel.cl',
    badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-300 border-orange-500/30'
  },
  'Posta de Salud Rural El Bollenar': {
    nombre: 'Posta de Salud Rural El Bollenar',
    tipo: 'Posta Rural',
    categoriaFiltro: 'POSTA',
    comuna: 'Melipilla',
    encargado: 'María Victoria Valenzuela Barrios',
    cargo: 'Encargada',
    direccion: 'Av. Valparaíso, KM 014, El Bollenar',
    telefono: '2 2832 4914',
    email: 'direccion.bollenar@cormumel.cl',
    badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-300 border-orange-500/30'
  },
  'Posta de Salud Rural El Pabellón': {
    nombre: 'Posta de Salud Rural El Pabellón',
    tipo: 'Posta Rural',
    categoriaFiltro: 'POSTA',
    comuna: 'Melipilla',
    encargado: 'Paloma Trujillo Céspedes',
    cargo: 'Encargada',
    direccion: 'Camino a Cholqui S/N, El Pabellón',
    telefono: '2 2800 0413',
    email: 'posta.pabellon@cormumel.cl',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30'
  },
  'Posta de Salud Rural Pahuilmo': {
    nombre: 'Posta de Salud Rural Pahuilmo',
    tipo: 'Posta Rural',
    categoriaFiltro: 'POSTA',
    comuna: 'Melipilla',
    encargado: 'Alice Garrido Fuentes',
    cargo: 'Encargada',
    direccion: 'Ruta G-380 S/N',
    telefono: '2 2831 1428 / +569 6105 6705',
    email: 'direccion.pahuilmo@cormumel.cl',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30'
  },
  'COSAM – Centro de Salud Mental': {
    nombre: 'COSAM – Centro de Salud Mental',
    tipo: 'Centro Especialidad Mental',
    categoriaFiltro: 'COSAM',
    comuna: 'Melipilla',
    encargado: 'Didier Henríquez Angulo',
    cargo: 'Encargado',
    direccion: 'Pardo N° 830',
    telefono: '2 2881 4040',
    email: 'cosam.melipilla@cormumel.cl',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30'
  },
  'SAR Elsa Romo Aravena': {
    nombre: 'SAR Elsa Romo Aravena',
    tipo: 'SAR Urgencia Alta Resolutividad',
    categoriaFiltro: 'SAR',
    comuna: 'Melipilla',
    encargado: 'Equipo Gestión Clínica SAR',
    cargo: 'Jefatura SAR',
    direccion: 'Silva Chávez N° 1650, Melipilla',
    telefono: '2 2800 0400',
    email: 'sar.elsaromo@cormumel.cl',
    badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/30'
  },
  'Hospital San José de Melipilla': {
    nombre: 'Hospital San José de Melipilla',
    tipo: 'Hospital Base Alta Complejidad',
    categoriaFiltro: 'HOSPITAL',
    comuna: 'Melipilla',
    encargado: 'Dirección Médica Hospital San José',
    cargo: 'Dirección Hospitalaria',
    direccion: "O'Higgins N° 551, Melipilla",
    telefono: '2 2574 2000',
    email: 'hospitalmelipilla@redsalud.gob.cl',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/30'
  },
  'Postas Rurales Melipilla (Otras)': {
    nombre: 'Postas Rurales Melipilla (Otras)',
    tipo: 'Red de Postas Rurales Melipilla',
    categoriaFiltro: 'POSTA',
    comuna: 'Melipilla',
    encargado: 'Coordinación Rural CORMUMEL',
    cargo: 'Coordinación Rural',
    direccion: 'Sectores Rurales Melipilla (Culiprán, San José, Chocalán, Rumay)',
    telefono: '2 2800 0400',
    email: 'salud.rural@cormumel.cl',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
  },
  'CESFAM / Postas San Pedro': {
    nombre: 'CESFAM / Postas San Pedro',
    tipo: 'Red Comunal San Pedro',
    categoriaFiltro: 'COMUNAS',
    comuna: 'San Pedro',
    encargado: 'Dirección de Salud San Pedro',
    cargo: 'Dirección Comunal',
    direccion: 'San Pedro, Provincia de Melipilla',
    telefono: 'Red Asistencial',
    email: 'salud@sanpedro.cl',
    badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-300 border-teal-500/30'
  },
  'CESFAM / Postas Alhué': {
    nombre: 'CESFAM / Postas Alhué',
    tipo: 'Red Comunal Alhué',
    categoriaFiltro: 'COMUNAS',
    comuna: 'Alhué',
    encargado: 'Dirección de Salud Alhué',
    cargo: 'Dirección Comunal',
    direccion: 'Villa Alhué, Provincia de Melipilla',
    telefono: 'Red Asistencial',
    email: 'salud@alhue.cl',
    badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-300 border-teal-500/30'
  },
  'CESFAM / Postas María Pinto': {
    nombre: 'CESFAM / Postas María Pinto',
    tipo: 'Red Comunal María Pinto',
    categoriaFiltro: 'COMUNAS',
    comuna: 'María Pinto',
    encargado: 'Dirección de Salud María Pinto',
    cargo: 'Dirección Comunal',
    direccion: 'María Pinto, Provincia de Melipilla',
    telefono: 'Red Asistencial',
    email: 'salud@mpinto.cl',
    badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-300 border-teal-500/30'
  },
  'CESFAM / Hosp. Curacaví': {
    nombre: 'CESFAM / Hosp. Curacaví',
    tipo: 'Red Comunal Curacaví',
    categoriaFiltro: 'COMUNAS',
    comuna: 'Curacaví',
    encargado: 'Dirección de Salud Curacaví',
    cargo: 'Dirección Comunal',
    direccion: 'Curacaví, Provincia de Melipilla',
    telefono: 'Red Asistencial',
    email: 'salud@curacavi.cl',
    badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-300 border-teal-500/30'
  }
};

// Encasillamiento Inteligente por Centros de la Provincia de Melipilla (CORMUMEL)
export const encasillarCentroProvinciaMelipilla = (paciente) => {
  const estRaw = String(paciente.establecimiento || paciente.centro || paciente.cesfam || '').trim().toUpperCase();
  const comRaw = String(paciente.comuna || '').trim().toUpperCase();

  // 1. CESFAM Dr. Francisco Boris Soler
  if (estRaw.includes('BORIS') || estRaw.includes('FRANCISCO BORIS')) {
    return { centro: 'CESFAM Dr. Francisco Boris Soler', comuna: 'Melipilla', tipo: 'CESFAM Urbano' };
  }

  // 2. CESFAM Dr. Edelberto Elgueta
  if (estRaw.includes('ELGUETA') || estRaw.includes('EDELBERTO')) {
    return { centro: 'CESFAM Dr. Edelberto Elgueta', comuna: 'Melipilla', tipo: 'CESFAM Urbano' };
  }

  // 3. CESFAM Alfarera Rosa Reyes Vilches (Pomaire)
  if (estRaw.includes('ALFARERA') || estRaw.includes('ROSA REYES') || estRaw.includes('POMAIRE')) {
    return { centro: 'CESFAM Alfarera Rosa Reyes Vilches', comuna: 'Melipilla', tipo: 'CESFAM Urbano / Rural (Pomaire)' };
  }

  // 4. CESFAM Florencia
  if (estRaw.includes('FLORENCIA')) {
    return { centro: 'CESFAM Florencia', comuna: 'Melipilla', tipo: 'CESFAM Urbano' };
  }

  // 5. CESFAM San Manuel
  if (estRaw.includes('SAN MANUEL')) {
    return { centro: 'CESFAM San Manuel', comuna: 'Melipilla', tipo: 'CESFAM Rural' };
  }

  // 6. CECOSF Padre Demetrio Bravo
  if (estRaw.includes('DEMETRIO') || estRaw.includes('PADRE DEMETRIO') || estRaw.includes('DEMETRIO BRAVO')) {
    return { centro: 'CECOSF Padre Demetrio Bravo', comuna: 'Melipilla', tipo: 'CECOSF Urbano' };
  }

  // 7. CECOSF Obispo Pablo Lizama
  if (estRaw.includes('LIZAMA') || estRaw.includes('OBISPO LIZAMA') || estRaw.includes('PABLO LIZAMA')) {
    return { centro: 'CECOSF Obispo Pablo Lizama', comuna: 'Melipilla', tipo: 'CECOSF Urbano' };
  }

  // 8. CECOSF Codigua
  if (estRaw.includes('CODIGUA')) {
    return { centro: 'CECOSF Codigua', comuna: 'Melipilla', tipo: 'CECOSF Rural' };
  }

  // 9. Posta de Salud Rural El Bollenar
  if (estRaw.includes('BOLLENAR') || estRaw.includes('EL BOLLENAR')) {
    return { centro: 'Posta de Salud Rural El Bollenar', comuna: 'Melipilla', tipo: 'Posta Rural' };
  }

  // 10. Posta de Salud Rural El Pabellón
  if (estRaw.includes('PABELLON') || estRaw.includes('PABELLÓN') || estRaw.includes('EL PABELLON') || estRaw.includes('EL PABELLÓN')) {
    return { centro: 'Posta de Salud Rural El Pabellón', comuna: 'Melipilla', tipo: 'Posta Rural' };
  }

  // 11. Posta de Salud Rural Pahuilmo
  if (estRaw.includes('PAHUILMO')) {
    return { centro: 'Posta de Salud Rural Pahuilmo', comuna: 'Melipilla', tipo: 'Posta Rural' };
  }

  // 12. COSAM – Centro de Salud Mental Melipilla
  if (estRaw.includes('COSAM') || estRaw.includes('SALUD MENTAL')) {
    return { centro: 'COSAM – Centro de Salud Mental', comuna: 'Melipilla', tipo: 'Centro Especialidad Mental' };
  }

  // 13. SAR Elsa Romo Aravena
  if (estRaw.includes('SAR') || estRaw.includes('ELSA ROMO')) {
    return { centro: 'SAR Elsa Romo Aravena', comuna: 'Melipilla', tipo: 'SAR Urgencia' };
  }

  // 14. Hospital San José de Melipilla
  if (estRaw.includes('HOSPITAL') && (estRaw.includes('MELIPILLA') || estRaw.includes('SAN JOSE') || estRaw.includes('SAN JOSÉ'))) {
    return { centro: 'Hospital San José de Melipilla', comuna: 'Melipilla', tipo: 'Hospital Base' };
  }

  // 15. Otras Postas Rurales Melipilla (Culiprán, San José, Chocalán, Rumay, etc.)
  if (
    estRaw.includes('CULIPRAN') || estRaw.includes('CULIPRÁN') || 
    estRaw.includes('CHOCALAN') || estRaw.includes('CHOCALÁN') || 
    estRaw.includes('RUMAY') || estRaw.includes('CHOLQUI') || 
    (estRaw.includes('SAN JOSE') && !estRaw.includes('HOSPITAL')) || 
    estRaw.includes('POSTA')
  ) {
    return { centro: 'Postas Rurales Melipilla (Otras)', comuna: 'Melipilla', tipo: 'Posta Rural' };
  }

  // 16. Otras Comunas de la Provincia de Melipilla
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

export default function AnalisisRespiratorio({ 
  pacientesFiltrados, 
  pacientesDB, 
  turnosDB, 
  filtroFechaInicio, 
  filtroFechaFin,
  kpisBigQuery 
}) {
  // Pestaña de navegación principal del módulo: 'centros' | 'general' | 'auditoria'
  const [seccionActiva, setSeccionActiva] = useState('centros');

  // Filtros generales
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCentro, setFiltroCentro] = useState('TODOS');
  const [filtroComuna, setFiltroComuna] = useState('TODOS');
  const [filtroSubgrupo, setFiltroSubgrupo] = useState('TODOS');
  const [filtroTriaje, setFiltroTriaje] = useState('TODOS');
  const [filtroEdad, setFiltroEdad] = useState('TODOS');
  const [filtroSexo, setFiltroSexo] = useState('TODOS');
  const [filtroDestino, setFiltroDestino] = useState('TODOS');
  const [vistaGrafico, setVistaGrafico] = useState('centros'); // 'centros' | 'temporal'
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 12;

  // Filtro específico para la cuadrícula de centros
  const [filtroCategoriaCentro, setFiltroCategoriaCentro] = useState('TODOS'); // 'TODOS' | 'CESFAM' | 'CECOSF' | 'POSTA' | 'COSAM' | 'COMUNAS'
  const [searchCentroTerm, setSearchCentroTerm] = useState('');

  // Estado del Modal / Panel de Verificación de Centro Específico
  const [centroSeleccionadoModal, setCentroSeleccionadoModal] = useState(null);
  const [paginaModalCentro, setPaginaModalCentro] = useState(1);
  const [searchModalCentro, setSearchModalCentro] = useState('');

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

  // 4. ANÁLISIS DETALLADO AGRUPADO POR CENTROS DE SALUD (CORMUMEL + RED PROVINCIAL)
  const centrosAnalisisDetallado = useMemo(() => {
    const map = new Map();

    // Inicializar con todos los centros del Directorio Oficial
    Object.entries(DIRECTORIO_CENTROS_MELIPILLA).forEach(([nombre, meta]) => {
      map.set(nombre, {
        nombre,
        metadata: meta,
        pacientes: [],
        total: 0,
        pediatricos: 0,
        adultos: 0,
        adultosMayores: 0,
        gravesC1C2: 0,
        hospitalizados: 0,
        domicilio: 0,
        diagnosticosMap: new Map()
      });
    });

    // Cargar pacientes respiratorios en cada centro
    pacientesRespiratorios.forEach(p => {
      const centroNombre = p.centroProvincia;
      if (!map.has(centroNombre)) {
        map.set(centroNombre, {
          nombre: centroNombre,
          metadata: {
            nombre: centroNombre,
            tipo: p.tipoCentro || 'Establecimiento de Salud',
            categoriaFiltro: 'OTROS',
            comuna: p.comunaProvincia || 'Provincia Melipilla',
            encargado: 'Responsable Establecimiento',
            cargo: 'Jefatura / Encargada',
            direccion: `Comuna ${p.comunaProvincia || 'Melipilla'}`,
            telefono: 'Red Asistencial',
            email: 'contacto.salud@cormumel.cl',
            badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/30'
          },
          pacientes: [],
          total: 0,
          pediatricos: 0,
          adultos: 0,
          adultosMayores: 0,
          gravesC1C2: 0,
          hospitalizados: 0,
          domicilio: 0,
          diagnosticosMap: new Map()
        });
      }

      const item = map.get(centroNombre);
      item.pacientes.push(p);
      item.total++;

      const e = Number(p.edad);
      if (!isNaN(e)) {
        if (e < 15) item.pediatricos++;
        else if (e >= 60) item.adultosMayores++;
        else item.adultos++;
      }

      if (p.triageManchester === 'C1' || p.triageManchester === 'C2') item.gravesC1C2++;

      const dest = String(p.destinoAlta || p.destino || '').toUpperCase();
      if (dest.includes('HOSPITAL') || dest.includes('DERIV') || dest.includes('TRASLADO')) {
        item.hospitalizados++;
      } else {
        item.domicilio++;
      }

      // Conteo de Diagnósticos para el Top 10
      const diagStr = (p.diagnosticoPrincipal || p.diagnostico || 'Sin Glosa Diagnóstica').trim();
      const cie = p.codigoDiagnostico || p.codigo_diagnostico_cie10 || 'J00';
      const diagKey = `${cie ? `[${cie}] ` : ''}${diagStr}`;

      if (!item.diagnosticosMap.has(diagKey)) {
        item.diagnosticosMap.set(diagKey, {
          key: diagKey,
          glosa: diagStr,
          cie10: cie,
          subgrupo: p.respSubgrupo,
          color: p.respColor,
          count: 0
        });
      }
      item.diagnosticosMap.get(diagKey).count++;
    });

    const totalUniversoResp = pacientesRespiratorios.length;

    // Calcular estadísticas y Top 10 diagnósticos para cada centro
    const lista = Array.from(map.values()).map(c => {
      const top10 = Array.from(c.diagnosticosMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map((d, i) => ({
          ...d,
          ranking: i + 1,
          porcentajeCentro: c.total > 0 ? ((d.count / c.total) * 100).toFixed(1) : '0.0'
        }));

      return {
        ...c,
        pctTotalSAR: totalUniversoResp > 0 ? ((c.total / totalUniversoResp) * 100).toFixed(1) : '0.0',
        pctPediatricos: c.total > 0 ? ((c.pediatricos / c.total) * 100).toFixed(1) : '0.0',
        pctAdultosMayores: c.total > 0 ? ((c.adultosMayores / c.total) * 100).toFixed(1) : '0.0',
        pctGraves: c.total > 0 ? ((c.gravesC1C2 / c.total) * 100).toFixed(1) : '0.0',
        pctHospitalizados: c.total > 0 ? ((c.hospitalizados / c.total) * 100).toFixed(1) : '0.0',
        top10Diagnosticos: top10
      };
    });

    // Ordenar: primero los centros con pacientes (de mayor a menor volumen), luego alfabéticamente
    return lista.sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      return a.nombre.localeCompare(b.nombre);
    });
  }, [pacientesRespiratorios]);

  // Centros filtrados para la cuadrícula
  const centrosFiltradosGrid = useMemo(() => {
    return centrosAnalisisDetallado.filter(c => {
      if (filtroCategoriaCentro !== 'TODOS') {
        const cat = c.metadata.categoriaFiltro;
        if (filtroCategoriaCentro === 'CESFAM' && cat !== 'CESFAM') return false;
        if (filtroCategoriaCentro === 'CECOSF' && cat !== 'CECOSF') return false;
        if (filtroCategoriaCentro === 'POSTA' && cat !== 'POSTA') return false;
        if (filtroCategoriaCentro === 'COSAM' && cat !== 'COSAM') return false;
        if (filtroCategoriaCentro === 'COMUNAS' && cat !== 'COMUNAS') return false;
      }
      if (searchCentroTerm.trim() !== '') {
        const q = searchCentroTerm.toLowerCase().trim();
        const str = `${c.nombre} ${c.metadata.encargado} ${c.metadata.direccion} ${c.metadata.comuna}`.toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });
  }, [centrosAnalisisDetallado, filtroCategoriaCentro, searchCentroTerm]);

  // 5. Aplicar Filtros Interactivos para la Nómina General
  const pacientesFiltradosResp = useMemo(() => {
    return pacientesRespiratorios.filter(p => {
      if (filtroCentro !== 'TODOS' && p.centroProvincia !== filtroCentro) return false;
      if (filtroComuna !== 'TODOS' && p.comunaProvincia !== filtroComuna) return false;
      if (filtroSubgrupo !== 'TODOS' && p.respSubgrupo !== filtroSubgrupo) return false;
      if (filtroTriaje !== 'TODOS' && p.triageManchester !== filtroTriaje) return false;

      if (filtroSexo !== 'TODOS') {
        const s = String(p.sexo || '').toUpperCase();
        if (filtroSexo === 'M' && !(s.includes('HOMBRE') || s.includes('MASCULINO') || s === 'M')) return false;
        if (filtroSexo === 'F' && !(s.includes('MUJER') || s.includes('FEMENINO') || s === 'F')) return false;
      }

      if (filtroDestino !== 'TODOS') {
        const dest = String(p.destinoAlta || p.destino || '').toUpperCase();
        if (filtroDestino === 'HOSPITAL' && !(dest.includes('HOSPITAL') || dest.includes('DERIV') || dest.includes('TRASLADO'))) return false;
        if (filtroDestino === 'DOMICILIO' && !dest.includes('DOMICILIO')) return false;
        if (filtroDestino === 'OTRO' && (dest.includes('HOSPITAL') || dest.includes('DOMICILIO'))) return false;
      }

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

      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase().trim();
        const fullStr = `${p.diagnosticoPrincipal || ''} ${p.codigoDiagnostico || ''} ${p.profesional || p.medico || ''} ${p.centroProvincia || ''} ${p.destinoAlta || ''} ${p.correlativo || ''}`.toLowerCase();
        if (!fullStr.includes(q)) return false;
      }

      return true;
    });
  }, [pacientesRespiratorios, filtroCentro, filtroComuna, filtroSubgrupo, filtroTriaje, filtroSexo, filtroDestino, filtroEdad, searchTerm]);

  // 6. KPIs y Métricas Resumen
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

  // 7. Datos para Gráficos
  const dataCentros = useMemo(() => {
    return centrosAnalisisDetallado
      .filter(c => c.total > 0)
      .slice(0, 10)
      .map(c => ({
        nombre: c.nombre,
        pacientes: c.total,
        porcentaje: c.pctTotalSAR
      }));
  }, [centrosAnalisisDetallado]);

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

  // Paginación de la Tabla General
  const totalPaginas = Math.ceil(pacientesFiltradosResp.length / itemsPorPagina) || 1;
  const pacientesPaginados = useMemo(() => {
    const start = (paginaActual - 1) * itemsPorPagina;
    return pacientesFiltradosResp.slice(start, start + itemsPorPagina);
  }, [pacientesFiltradosResp, paginaActual]);

  // Pacientes filtrados dentro del Modal de Centro Específico
  const pacientesModalCentroFiltrados = useMemo(() => {
    if (!centroSeleccionadoModal) return [];
    const pacs = centroSeleccionadoModal.pacientes || [];
    if (!searchModalCentro.trim()) return pacs;
    const q = searchModalCentro.toLowerCase().trim();
    return pacs.filter(p => {
      const full = `${p.correlativo || ''} ${p.diagnosticoPrincipal || ''} ${p.codigoDiagnostico || ''} ${p.profesional || ''} ${p.destinoAlta || ''}`.toLowerCase();
      return full.includes(q);
    });
  }, [centroSeleccionadoModal, searchModalCentro]);

  const totalPaginasModalCentro = Math.ceil(pacientesModalCentroFiltrados.length / 10) || 1;
  const pacientesModalCentroPaginados = useMemo(() => {
    const start = (paginaModalCentro - 1) * 10;
    return pacientesModalCentroFiltrados.slice(start, start + 10);
  }, [pacientesModalCentroFiltrados, paginaModalCentro]);

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

  // Exportar Ficha Específica de Centro a Excel
  const handleExportCentroExcel = (centroObj) => {
    try {
      if (typeof window.XLSX === 'undefined') {
        alert("La librería de exportación se está cargando. Por favor, intente en un momento.");
        return;
      }

      const rows = (centroObj.pacientes || []).map((p, idx) => {
        const d = p.tAdmision ? new Date(p.tAdmision) : null;
        const fechaStr = d ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : '-';
        const turnoInfo = obtenerTurnoDetallado(p.tAdmision);

        return {
          'N°': idx + 1,
          'Correlativo / ID': p.correlativo || p.id || `REC-${idx + 1}`,
          'Fecha y Hora': fechaStr,
          'Turno': turnoInfo.textoCompleto || '-',
          'Edad': p.edad || '-',
          'Sexo': p.sexo || '-',
          'Establecimiento': p.centroProvincia || centroObj.nombre,
          'Triaje': p.triageManchester || 'C4',
          'Subgrupo': p.respSubgrupo || '-',
          'CIE-10': p.codigoDiagnostico || p.codigo_diagnostico_cie10 || 'J00',
          'Hipótesis Diagnóstica Principal': p.diagnosticoPrincipal || p.diagnostico || '-',
          'Destino Alta': p.destinoAlta || p.destino || 'DOMICILIO',
          'Médico Tratante': p.profesional || p.medico || 'MÉDICO GENERAL'
        };
      });

      const ws = window.XLSX.utils.json_to_sheet(rows);
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, "Pacientes_Centro");
      window.XLSX.writeFile(wb, `Reporte_Respiratorio_${centroObj.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.xlsx`);
    } catch (err) {
      console.error("Error al exportar centro:", err);
      alert("Hubo un problema al generar el archivo Excel del centro.");
    }
  };

  // Exportar Nómina Global a Excel
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
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-primary-custom tracking-tight">
                Vigilancia Epidemiológica Respiratoria
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                Red CORMUMEL & Provincia de Melipilla
              </span>
            </div>
            <p className="text-xs text-secondary-custom font-medium mt-0.5">
              Rendimiento asistencial agrupado por centros de salud, Top 10 de diagnósticos respiratorios y módulo de verificación clínica.
            </p>
          </div>
        </div>

        {/* BOTONERA DE ACCIÓN Y GESTIÓN */}
        <div className="flex items-center gap-2 self-end lg:self-auto flex-wrap">
          
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer"
            title="Abrir gestor administrativo de diagnósticos respiratorios y personalización"
          >
            <Settings2 className="w-4 h-4" />
            <span>Gestionar Diagnósticos ({customTerms.length > 0 ? `+${customTerms.length}` : 'Filtro'})</span>
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

      {/* SELECTOR DE MODO DE VISUALIZACIÓN / SECCIONES DEL SUBREPORTE */}
      <div className="flex items-center justify-between gap-3 bg-card-custom border border-card-custom p-2 rounded-2xl shadow-sm overflow-x-auto">
        <div className="flex items-center gap-2">
          
          {/* TAB 1: RENDIMIENTO Y AGRUPACIÓN POR CENTROS (CORMUMEL) */}
          <button
            onClick={() => setSeccionActiva('centros')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              seccionActiva === 'centros'
                ? 'bg-cyan-500 text-white shadow-md'
                : 'text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Rendimiento por Centros (CORMUMEL)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              seccionActiva === 'centros' ? 'bg-white/20 text-white' : 'bg-cyan-500/10 text-cyan-500'
            }`}>
              {centrosAnalisisDetallado.filter(c => c.total > 0).length} Activos
            </span>
          </button>

          {/* TAB 2: VISIÓN GENERAL EPIDEMIOLÓGICA & GRÁFICOS */}
          <button
            onClick={() => setSeccionActiva('general')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              seccionActiva === 'general'
                ? 'bg-cyan-500 text-white shadow-md'
                : 'text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Visión General & Gráficos</span>
          </button>

          {/* TAB 3: NÓMINA COMPLETA DE AUDITORÍA */}
          <button
            onClick={() => setSeccionActiva('auditoria')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              seccionActiva === 'auditoria'
                ? 'bg-cyan-500 text-white shadow-md'
                : 'text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Nómina Completa de Auditoría</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              seccionActiva === 'auditoria' ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/5 text-secondary-custom'
            }`}>
              {pacientesFiltradosResp.length} pac.
            </span>
          </button>

        </div>

        <div className="text-xs text-secondary-custom font-medium hidden md:flex items-center gap-2 pr-2">
          <Clock className="w-3.5 h-3.5 text-cyan-500" />
          <span>Filtro activo: <strong>{filtroFechaInicio || 'Inicio'}</strong> al <strong>{filtroFechaFin || 'Cierre'}</strong></span>
        </div>
      </div>

      {/* TARJETAS EJECUTIVAS GLOBALES DE KPIS */}
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
              <span>del total SAR</span>
            </div>
          </div>
          {statsResumen.varYoY !== null && (
            <div className={`mt-2 pt-2 border-t border-card-custom/40 flex items-center justify-between text-[11px] font-bold ${Number(statsResumen.varYoY) >= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              <span>Variación YoY:</span>
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

      {/* ========================================================================= */}
      {/* VISTA 1: RENDIMIENTO AGRUPADO POR CENTROS DE SALUD (CORMUMEL)             */}
      {/* ========================================================================= */}
      {seccionActiva === 'centros' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          
          {/* BARRA DE FILTROS DE CENTROS */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card-custom border border-card-custom p-4 rounded-2xl shadow-sm">
            
            {/* Categorías de Centros */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'TODOS', label: 'Todos los Establecimientos' },
                { id: 'CESFAM', label: 'CESFAM Urbanos/Rurales' },
                { id: 'CECOSF', label: 'CECOSF' },
                { id: 'POSTA', label: 'Postas Rurales' },
                { id: 'COSAM', label: 'Salud Mental / COSAM' },
                { id: 'COMUNAS', label: 'Otras Comunas' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFiltroCategoriaCentro(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filtroCategoriaCentro === cat.id
                      ? 'bg-cyan-500 text-white shadow-xs'
                      : 'bg-black/5 dark:bg-white/5 text-secondary-custom hover:text-primary-custom border border-card-custom'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Buscador de Centro / Directora */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-secondary-custom absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por centro, directora o dirección..."
                value={searchCentroTerm}
                onChange={(e) => setSearchCentroTerm(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-card-custom rounded-xl pl-9 pr-3 py-1.5 text-xs text-primary-custom placeholder:text-secondary-custom/60 outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
          </div>

          {/* CUADRÍCULA DE TARJETAS EJECUTIVAS POR CENTRO DE SALUD */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {centrosFiltradosGrid.map((centro) => {
              const meta = centro.metadata;
              const hasPacientes = centro.total > 0;

              return (
                <div 
                  key={centro.nombre}
                  className={`bg-card-custom border rounded-3xl p-5 shadow-sm flex flex-col justify-between transition-all group ${
                    hasPacientes 
                      ? 'border-card-custom hover:border-cyan-500/50 hover:shadow-lg' 
                      : 'border-card-custom/50 opacity-75'
                  }`}
                >
                  {/* Encabezado del Centro */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${meta.badgeColor || 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'}`}>
                          {meta.tipo}
                        </span>
                        <h3 className="text-base font-black text-primary-custom mt-2 tracking-tight line-clamp-1" title={centro.nombre}>
                          {centro.nombre}
                        </h3>
                      </div>

                      {/* Badge Total Pacientes */}
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-black text-cyan-500">
                          {centro.total} <span className="text-xs font-bold text-secondary-custom">pac.</span>
                        </div>
                        <span className="text-[10px] font-bold text-secondary-custom block">
                          {centro.pctTotalSAR}% de la urgencia
                        </span>
                      </div>
                    </div>

                    {/* Ficha Oficial de Contacto CORMUMEL */}
                    <div className="mt-3.5 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-card-custom/40 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-primary-custom font-bold">
                        <User className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                        <span>{meta.cargo}: <strong className="text-cyan-600 dark:text-cyan-400">{meta.encargado}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-secondary-custom font-medium text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-secondary-custom shrink-0" />
                        <span className="truncate" title={meta.direccion}>{meta.direccion}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-card-custom/30 text-[11px] text-secondary-custom">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{meta.telefono}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate max-w-[130px]" title={meta.email}>{meta.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Indicadores Clave del Centro */}
                    <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                      <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-300 block">Pediátricos</span>
                        <strong className="text-sm font-black text-purple-600 dark:text-purple-400">{centro.pediatricos}</strong>
                        <span className="text-[9px] text-purple-500 block">({centro.pctPediatricos}%)</span>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-300 block">60+ Años</span>
                        <strong className="text-sm font-black text-amber-600 dark:text-amber-400">{centro.adultosMayores}</strong>
                        <span className="text-[9px] text-amber-500 block">({centro.pctAdultosMayores}%)</span>
                      </div>
                      <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-300 block">C1 / C2</span>
                        <strong className="text-sm font-black text-rose-600 dark:text-rose-400">{centro.gravesC1C2}</strong>
                        <span className="text-[9px] text-rose-500 block">({centro.pctGraves}%)</span>
                      </div>
                      <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 block">Traslados</span>
                        <strong className="text-sm font-black text-indigo-600 dark:text-indigo-400">{centro.hospitalizados}</strong>
                        <span className="text-[9px] text-indigo-500 block">({centro.pctHospitalizados}%)</span>
                      </div>
                    </div>

                    {/* TOP 10 DE DIAGNÓSTICOS RESPIRATORIOS DEL CENTRO */}
                    <div className="mt-4 pt-3 border-t border-card-custom/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-primary-custom flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-cyan-500" />
                          <span>Top 10 Diagnósticos Respiratorios</span>
                        </span>
                        <span className="text-[10px] font-bold text-secondary-custom">
                          {centro.top10Diagnosticos.length} registrados
                        </span>
                      </div>

                      {centro.top10Diagnosticos.length > 0 ? (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {centro.top10Diagnosticos.map((diag) => (
                            <div 
                              key={diag.key}
                              className="p-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-card-custom/30 text-xs flex flex-col gap-1"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="w-4 h-4 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-black flex items-center justify-center shrink-0">
                                    #{diag.ranking}
                                  </span>
                                  <span className="font-bold text-primary-custom truncate text-[11px]" title={diag.glosa}>
                                    {diag.glosa}
                                  </span>
                                </div>
                                <span className="font-mono text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-1 py-0.2 rounded shrink-0">
                                  {diag.cie10}
                                </span>
                              </div>
                              {/* Barra de Proporción */}
                              <div className="flex items-center gap-2">
                                <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ 
                                      width: `${diag.porcentajeCentro}%`,
                                      backgroundColor: diag.color || '#06b6d4'
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-secondary-custom shrink-0">
                                  {diag.count} pac. ({diag.porcentajeCentro}%)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-secondary-custom text-xs">
                          <Wind className="w-6 h-6 mx-auto mb-1 opacity-30 text-cyan-500" />
                          <p className="font-medium">Sin registros respiratorios en este período.</p>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* BOTONERA DE ACCIÓN POR CENTRO */}
                  <div className="mt-5 pt-3 border-t border-card-custom/40 flex items-center justify-between gap-2">
                    
                    {/* Botón de Verificación de Datos de Pacientes */}
                    <button
                      disabled={!hasPacientes}
                      onClick={() => {
                        setCentroSeleccionadoModal(centro);
                        setPaginaModalCentro(1);
                        setSearchModalCentro('');
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-black bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 disabled:pointer-events-none text-white shadow-sm transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Verificar Pacientes ({centro.total})</span>
                    </button>

                    <button
                      disabled={!hasPacientes}
                      onClick={() => handleExportCentroExcel(centro)}
                      className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-card-custom hover:bg-emerald-500/10 hover:text-emerald-500 text-secondary-custom disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                      title="Descargar Ficha Excel de este Centro"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: VISIÓN GENERAL EPIDEMIOLÓGICA & GRÁFICOS INTERACTIVOS             */}
      {/* ========================================================================= */}
      {seccionActiva === 'general' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          
          {/* BARRA DE FILTROS INTERACTIVOS */}
          <div className="bg-card-custom border border-card-custom p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              
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

              {(filtroCentro !== 'TODOS' || filtroSubgrupo !== 'TODOS' || filtroTriaje !== 'TODOS' || searchTerm !== '') && (
                <button
                  onClick={() => {
                    setFiltroCentro('TODOS');
                    setFiltroSubgrupo('TODOS');
                    setFiltroTriaje('TODOS');
                    setSearchTerm('');
                    setPaginaActual(1);
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
                >
                  Limpiar
                </button>
              )}

            </div>

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

          {/* SECCIÓN DE VISUALIZACIÓN GRÁFICA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* GRÁFICO PRINCIPAL */}
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

              <div className="h-72 w-full mt-4">
                {vistaGrafico === 'centros' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataCentros} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
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
                        {dataCentros.map((entry, index) => (
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

            {/* GRÁFICO DONUT DE PATOLOGÍAS */}
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

              <div className="space-y-1.5 pt-2 border-t border-card-custom/40">
                {dataSubgrupos.slice(0, 5).map((sub) => (
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

        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: NÓMINA COMPLETA DE AUDITORÍA CLÍNICA (ANONIMIZADA)                */}
      {/* ========================================================================= */}
      {seccionActiva === 'auditoria' && (
        <div className="bg-card-custom border border-card-custom rounded-2xl shadow-sm overflow-hidden animate-fade-in">
          
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
                        
                        <td className="py-3 px-4 font-mono font-bold text-primary-custom">
                          <span className="px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5 border border-card-custom text-xs">
                            {p.correlativo || p.id || `REC-${index + 1}`}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-secondary-custom font-medium">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-secondary-custom shrink-0" />
                            <span>{fechaStr} hrs</span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span 
                            className="px-2 py-0.5 rounded-md text-[10px] font-black text-white shadow-xs"
                            style={{ backgroundColor: triageColor }}
                          >
                            {p.triageManchester}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-medium text-primary-custom">
                          <span>{p.edad ? `${p.edad} a.` : '-'}</span>
                          <span className="text-secondary-custom text-[11px] ml-1">({p.sexo ? String(p.sexo).substring(0, 1).toUpperCase() : '-'})</span>
                        </td>

                        <td className="py-3 px-4 font-bold text-cyan-600 dark:text-cyan-400">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 shrink-0 opacity-70" />
                            <span className="truncate max-w-[200px]" title={p.centroProvincia}>
                              {p.centroProvincia}
                            </span>
                          </div>
                        </td>

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

                        <td className="py-3 px-3 font-mono font-bold text-xs text-indigo-500">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                            {p.codigoDiagnostico || p.codigo_diagnostico_cie10 || 'J00'}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-medium text-secondary-custom">
                          <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                            String(p.destinoAlta || '').toUpperCase().includes('HOSPITAL')
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {p.destinoAlta || p.destino || 'DOMICILIO'}
                          </span>
                        </td>

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
      )}

      {/* ========================================================================= */}
      {/* MODAL / PANEL DE VERIFICACIÓN DE PACIENTES POR CENTRO ESPECÍFICO          */}
      {/* ========================================================================= */}
      {centroSeleccionadoModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Cabecera del Modal de Centro */}
            <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-3 bg-slate-950/60">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${centroSeleccionadoModal.metadata.badgeColor || 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}`}>
                      {centroSeleccionadoModal.metadata.tipo}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {centroSeleccionadoModal.metadata.comuna}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight mt-0.5">
                    {centroSeleccionadoModal.nombre}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportCentroExcel(centroSeleccionadoModal)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel Centro</span>
                </button>
                <button
                  onClick={() => setCentroSeleccionadoModal(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Subcabecera con Directorio y Métricas */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Datos Directora y Contacto */}
              <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-1 text-xs">
                <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Directorio Oficial CORMUMEL</p>
                <p className="font-black text-white text-sm">{centroSeleccionadoModal.metadata.cargo}: {centroSeleccionadoModal.metadata.encargado}</p>
                <p className="text-slate-300 flex items-center gap-1.5 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {centroSeleccionadoModal.metadata.direccion}
                </p>
                <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400">
                  <span>Tel: <strong className="text-emerald-400">{centroSeleccionadoModal.metadata.telefono}</strong></span>
                  <span>Email: <strong className="text-indigo-400">{centroSeleccionadoModal.metadata.email}</strong></span>
                </div>
              </div>

              {/* Métricas Asistenciales del Centro */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Total Pac.</span>
                  <strong className="text-lg font-black text-cyan-400">{centroSeleccionadoModal.total}</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[10px] text-purple-400 font-bold block">Pediátricos</span>
                  <strong className="text-lg font-black text-purple-400">{centroSeleccionadoModal.pediatricos}</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[10px] text-amber-400 font-bold block">60+ Años</span>
                  <strong className="text-lg font-black text-amber-400">{centroSeleccionadoModal.adultosMayores}</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[10px] text-rose-400 font-bold block">C1 / C2</span>
                  <strong className="text-lg font-black text-rose-400">{centroSeleccionadoModal.gravesC1C2}</strong>
                </div>
              </div>

            </div>

            {/* Buscador dentro del Modal */}
            <div className="p-3 bg-slate-950/30 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="relative w-full max-w-sm">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar por correlativo, hipótesis, CIE-10 o médico..."
                  value={searchModalCentro}
                  onChange={(e) => { setSearchModalCentro(e.target.value); setPaginaModalCentro(1); }}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500 transition-all"
                />
              </div>

              <span className="text-xs text-slate-400 font-medium">
                Mostrando <strong className="text-cyan-400">{pacientesModalCentroFiltrados.length}</strong> de {centroSeleccionadoModal.total} pacientes
              </span>
            </div>

            {/* TABLA DETALLADA DE PACIENTES DEL CENTRO (ANONIMIZADA) */}
            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Correlativo</th>
                    <th className="py-2.5 px-3">Fecha & Hora</th>
                    <th className="py-2.5 px-2">Triaje</th>
                    <th className="py-2.5 px-2">Edad/Sexo</th>
                    <th className="py-2.5 px-3">Hipótesis Diagnóstica</th>
                    <th className="py-2.5 px-2">CIE-10</th>
                    <th className="py-2.5 px-3">Destino Alta</th>
                    <th className="py-2.5 px-3">Médico Tratante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {pacientesModalCentroPaginados.length > 0 ? (
                    pacientesModalCentroPaginados.map((p, idx) => {
                      const d = p.tAdmision ? new Date(p.tAdmision) : null;
                      const fechaStr = d ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : '-';
                      const triageColor = TRIAGE_COLORS[p.triageManchester] || '#22c55e';

                      return (
                        <tr key={p.id || idx} className="hover:bg-cyan-500/5 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-white">
                            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs">
                              {p.correlativo || p.id || `REC-${idx + 1}`}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 font-medium">{fechaStr}</td>
                          <td className="py-2.5 px-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black text-white" style={{ backgroundColor: triageColor }}>
                              {p.triageManchester}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-slate-300">{p.edad} a. ({p.sexo ? String(p.sexo).substring(0, 1) : '-'})</td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-white block">{p.diagnosticoPrincipal || p.diagnostico || 'Sin Glosa'}</span>
                            <span className="text-[10px] text-slate-400">{p.respSubgrupo}</span>
                          </td>
                          <td className="py-2.5 px-2 font-mono font-bold text-indigo-400">
                            {p.codigoDiagnostico || 'J00'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              String(p.destinoAlta || '').toUpperCase().includes('HOSPITAL')
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {p.destinoAlta || 'DOMICILIO'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 truncate max-w-[140px]">{p.profesional || 'MÉDICO SAR'}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No se encontraron pacientes para el criterio de búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginador Modal */}
            {totalPaginasModalCentro > 1 && (
              <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/60 text-xs">
                <span className="text-slate-400">Página {paginaModalCentro} de {totalPaginasModalCentro}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={paginaModalCentro === 1}
                    onClick={() => setPaginaModalCentro(p => Math.max(p - 1, 1))}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={paginaModalCentro === totalPaginasModalCentro}
                    onClick={() => setPaginaModalCentro(p => Math.min(p + 1, totalPaginasModalCentro))}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL ADMINISTRATIVO: GESTIÓN DE DIAGNÓSTICOS RESPIRATORIOS               */}
      {/* ========================================================================= */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">
                    Gestor de Diagnósticos Respiratorios
                  </h3>
                  <p className="text-xs text-slate-400">
                    Administra qué diagnósticos y códigos CIE-10 se procesan en la vigilancia epidemiológica.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pestañas Internas del Gestor */}
            <div className="flex border-b border-slate-800 px-5 pt-3 gap-2 bg-slate-950/30">
              <button
                onClick={() => setConfigTab('descubiertos')}
                className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  configTab === 'descubiertos'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Diagnósticos Descubiertos en Base de Datos ({catalogoDiagnosticosDescubiertos.length})
              </button>
              <button
                onClick={() => setConfigTab('manual')}
                className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  configTab === 'manual'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Agregar Término Manual ({customTerms.length} activos)
              </button>
            </div>

            {/* Contenido según Pestaña */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              
              {configTab === 'descubiertos' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Buscar diagnóstico o CIE-10 en la base cargada..."
                        value={searchDiscoveryTerm}
                        onChange={(e) => setSearchDiscoveryTerm(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm("¿Deseas restaurar los diagnósticos respiratorios a los valores estándar?")) {
                          setCustomTerms([]);
                          setExcludedTerms([]);
                          localStorage.removeItem('metrico_respiratorio_custom_terms');
                          localStorage.removeItem('metrico_respiratorio_excluded_terms');
                        }
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Restablecer</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {catalogoDiagnosticosDescubiertos
                      .filter(d => {
                        if (!searchDiscoveryTerm.trim()) return true;
                        const q = searchDiscoveryTerm.toLowerCase().trim();
                        return d.key.toLowerCase().includes(q) || d.diag.toLowerCase().includes(q) || d.cod.toLowerCase().includes(q);
                      })
                      .map((item) => (
                        <div
                          key={item.key}
                          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                            item.isResp 
                              ? 'bg-indigo-950/30 border-indigo-500/30' 
                              : 'bg-slate-950/30 border-slate-800/80 opacity-75'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={item.isResp}
                              onChange={() => {
                                const term = item.diag || item.cod;
                                if (!term) return;
                                if (item.isResp) {
                                  setExcludedTerms(prev => [...prev.filter(t => t !== term), term]);
                                  setCustomTerms(prev => prev.filter(c => c.term.toLowerCase() !== term.toLowerCase()));
                                } else {
                                  setExcludedTerms(prev => prev.filter(t => t !== term));
                                  setCustomTerms(prev => [
                                    ...prev.filter(c => c.term.toLowerCase() !== term.toLowerCase()),
                                    { term, subgrupo: 'COVID-19 / Otros Respiratorios' }
                                  ]);
                                }
                              }}
                              className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{item.diag || 'Sin Glosa'}</span>
                                {item.cod && (
                                  <span className="font-mono text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                                    {item.cod}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                {item.count} atenciones registradas en el archivo
                              </span>
                            </div>
                          </div>

                          {item.isResp && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                              {item.subgrupo || 'Respiratorio Activo'}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {configTab === 'manual' && (
                <div className="space-y-4">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newCustomTerm.trim()) return;
                      const termClean = newCustomTerm.trim();
                      setExcludedTerms(prev => prev.filter(t => t.toLowerCase() !== termClean.toLowerCase()));
                      setCustomTerms(prev => [
                        ...prev.filter(c => c.term.toLowerCase() !== termClean.toLowerCase()),
                        { term: termClean, subgrupo: newCustomSubgroup }
                      ]);
                      setNewCustomTerm('');
                    }} 
                    className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-3"
                  >
                    <p className="text-xs font-bold text-white">Agregar Nuevo Diagnóstico o Código CIE-10</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Ej: Laringotraqueítis aguda o J04"
                          value={newCustomTerm}
                          onChange={(e) => setNewCustomTerm(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <select
                          value={newCustomSubgroup}
                          onChange={(e) => setNewCustomSubgroup(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                        >
                          <option value="Neumonía / Influenza">Neumonía / Influenza</option>
                          <option value="SBO / Asma / EPOC">SBO / Asma / EPOC</option>
                          <option value="Bronquitis / Bronquiolitis / VRS">Bronquitis / VRS</option>
                          <option value="Vías Altas (IRA Alta)">Vías Altas (IRA Alta)</option>
                          <option value="COVID-19 / Otros Respiratorios">COVID-19 / Otros</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar a Vigilancia Respiratoria</span>
                    </button>
                  </form>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400">Términos Personalizados Agregados ({customTerms.length})</p>
                    {customTerms.length > 0 ? (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {customTerms.map((c, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                            <div>
                              <strong className="text-white">{c.term}</strong>
                              <span className="text-[10px] text-slate-400 ml-2">({c.subgrupo})</span>
                            </div>
                            <button
                              onClick={() => setCustomTerms(prev => prev.filter(t => t.term !== c.term))}
                              className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No hay términos manuales agregados aún.</p>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/50">
              <span className="text-xs text-slate-400">
                Los cambios se guardan automáticamente en tu navegador.
              </span>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer"
              >
                Cerrar y Aplicar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
