import { 
  BarChart2, GitCompare, Calendar, Award, Users, UserCheck, Activity,
  ShieldAlert, ArrowLeftRight, FileSpreadsheet, Database, Shield, BookOpen, Terminal, Sparkles
} from 'lucide-react';

export const SYSTEM_MODULES = [
  { 
    id: 'resumen', 
    name: 'Inicio / Resumen General', 
    description: 'Acceso al dashboard principal y tarjetas de KPIs globales.', 
    icon: BarChart2, 
    color: 'text-indigo-500', 
    category: 'General',
    defaultEnabled: true 
  },
  { 
    id: 'comparativo', 
    name: 'Rendimiento Turno', 
    description: 'Comparativa tripartita de turnos y curvas de demanda.', 
    icon: GitCompare, 
    color: 'text-emerald-500', 
    category: 'General',
    defaultEnabled: true 
  },
  { 
    id: 'calendario', 
    name: 'Histórico Mensual', 
    description: 'Cuadrícula mensual de turnos y mapa de calor de atenciones.', 
    icon: Calendar, 
    color: 'text-blue-500', 
    category: 'General',
    defaultEnabled: true 
  },
  { 
    id: 'profesionales', 
    name: 'Rendimiento Clínico', 
    description: 'Auditoría de médicos, promedio de atenciones y prescripción.', 
    icon: Award, 
    color: 'text-amber-500', 
    category: 'General',
    defaultEnabled: true 
  },
  { 
    id: 'perfil_paciente', 
    name: 'Perfil del Paciente', 
    description: 'Análisis sociodemográfico y procedencia por comuna.', 
    icon: Users, 
    color: 'text-purple-500', 
    category: 'General',
    defaultEnabled: true 
  },
  { 
    id: 'radar', 
    name: 'Radar Predictivo (IA)', 
    description: 'Monitoreo epidemiológico en tiempo real y alertas tempranas.', 
    icon: Activity, 
    color: 'text-rose-500', 
    category: 'General',
    defaultEnabled: true,
    isNew: true
  },
  { 
    id: 'demanda', 
    name: 'Demanda de Atención', 
    description: 'Comportamiento horario de admisiones y distribución por triaje.', 
    icon: BarChart2, 
    color: 'text-indigo-500', 
    category: 'Análisis Específicos',
    defaultEnabled: true 
  },
  { 
    id: 'altas', 
    name: 'Altas Administrativas', 
    description: 'Filtro y auditoría de cancelaciones no médicas en triaje.', 
    icon: UserCheck, 
    color: 'text-slate-500', 
    category: 'Análisis Específicos',
    defaultEnabled: true 
  },
  { 
    id: 'fracturas', 
    name: 'Estadísticas de Fractura', 
    description: 'Epidemiología ósea de lesiones CIE-10 (S02 a S92).', 
    icon: Activity, 
    color: 'text-rose-500', 
    category: 'Análisis Específicos',
    defaultEnabled: true 
  },
  { 
    id: 'enfermeria', 
    name: 'Rendimiento Enfermería', 
    description: 'Evaluación de categorización de triaje y enfermeros.', 
    icon: Activity, 
    color: 'text-indigo-500', 
    category: 'Análisis Específicos',
    defaultEnabled: true 
  },
  { 
    id: 'constataciones', 
    name: 'Constatación de Lesiones', 
    description: 'Análisis de atenciones clínico-legales Z51.8 y Z04.', 
    icon: ShieldAlert, 
    color: 'text-amber-500', 
    category: 'Análisis Específicos',
    defaultEnabled: true 
  },
  { 
    id: 'traslados', 
    name: 'Traslados Hospitalarios', 
    description: 'Derivaciones a centros de alta complejidad y Top 10.', 
    icon: ArrowLeftRight, 
    color: 'text-indigo-500', 
    category: 'Análisis Específicos',
    defaultEnabled: true 
  },
  { 
    id: 'reportes', 
    name: 'Reporte Ejecutivo', 
    description: 'Generación de informes ejecutivos e impresiones PDF.', 
    icon: FileSpreadsheet, 
    color: 'text-emerald-500', 
    category: 'Gestión & Control',
    defaultEnabled: true 
  },
  { 
    id: 'data', 
    name: 'Gestión de Datos', 
    description: 'Carga masiva de Excel, sanitización y re-cálculo.', 
    icon: Database, 
    color: 'text-teal-500', 
    category: 'Gestión & Control',
    defaultEnabled: true 
  },
  { 
    id: 'pauta', 
    name: 'Pauta de Turnos', 
    description: 'Programación mensual y cuadrante de personal.', 
    icon: Calendar, 
    color: 'text-sky-500', 
    category: 'Gestión & Control',
    defaultEnabled: true 
  },
  { 
    id: 'usuarios', 
    name: 'Gestión de Usuarios', 
    description: 'Administración de cuentas, permisos y credenciales.', 
    icon: Users, 
    color: 'text-indigo-500', 
    category: 'Gestión & Control',
    defaultEnabled: true 
  },
  { 
    id: 'auditoria', 
    name: 'Registro de Auditoría', 
    description: 'Historial de modificaciones y acciones del sistema.', 
    icon: Shield, 
    color: 'text-indigo-500', 
    category: 'Gestión & Control',
    defaultEnabled: true 
  },
  { 
    id: 'arquitectura', 
    name: 'Informe de Arquitectura', 
    description: 'Documentación técnica de evolución del software.', 
    icon: BookOpen, 
    color: 'text-indigo-400', 
    category: 'Sistema & Dev',
    defaultEnabled: true 
  },
  { 
    id: 'devlog', 
    name: 'Bitácora de Desarrollo', 
    description: 'Registro de logs del sistema y eventos técnicos.', 
    icon: Terminal, 
    color: 'text-emerald-400', 
    category: 'Sistema & Dev',
    defaultEnabled: true 
  }
];

export function getNormalizedUserPermissions(rawPermisos = {}, isGlobalAdmin = false) {
  const normalized = {};

  SYSTEM_MODULES.forEach(mod => {
    if (isGlobalAdmin) {
      normalized[mod.id] = true;
    } else if (rawPermisos && Object.prototype.hasOwnProperty.call(rawPermisos, mod.id)) {
      normalized[mod.id] = Boolean(rawPermisos[mod.id]);
    } else {
      normalized[mod.id] = mod.defaultEnabled !== false;
    }
  });

  return normalized;
}
