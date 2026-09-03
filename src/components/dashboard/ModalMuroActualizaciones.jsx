import React, { useState } from 'react';
import { 
  Megaphone, Sparkles, X, Calendar, CheckCircle2, ShieldAlert, MapPin, Cpu, BarChart2, Filter, Layers, Clock, 
  HelpCircle, BookOpen, Lightbulb, Eye, Mail, Volume2, Lock, Activity, ShieldCheck, Database, FileSpreadsheet, 
  BarChart3, LineChart, ArrowLeftRight, Send, Award, Users, TrendingUp, CheckCircle, Zap, UserCheck, Cloud, 
  ExternalLink, Search, Printer, FileText, RefreshCw, UploadCloud, Compass, Flame, Maximize2 
} from 'lucide-react';

export default function ModalMuroActualizaciones({ isOpen, onClose }) {
  const [selectedCat, setSelectedCat] = useState('TODOS');

  if (!isOpen) return null;

  const updatesList = [
    {
      id: 'v5.9.4',
      version: 'v5.9.4',
      fecha: '02 de Septiembre, 2026',
      badge: 'PROTAGONISMO YOY & RÉCORDS EXACTOS',
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/20',
      title: 'Récords Asistenciales por Turno Individual y Protagonismo en Porcentajes',
      categoria: 'Calidad de Datos & Centro de Auditoría',
      icon: TrendingUp,
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      summary: 'Se redefinió el cálculo de récords para evaluar estrictamente turnos asistenciales únicos (distinguiendo entre Fin de Semana Día 08:00-20:00, Fin de Semana Noche 20:00-08:00 y Turno Semana 17:00-08:00), eliminando agregaciones de 24 horas continuas. Además, se dio protagonismo visual completo al porcentaje interanual en las 4 tarjetas de tendencias de Inicio.',
      instructivo: {
        paraQueSirve: 'Permite identificar con precisión clínica el turno individual récord real y observar de un vistazo el ritmo de crecimiento porcentual respecto al año anterior.',
        quePuedesVer: 'En Inicio: 4 tarjetas ejecutivas con el porcentaje YoY en tamaño grande destacado (+14.2%, +13.6%, +19.7%, +11.8%) y tarjetas de récords que especifican el horario exacto del turno.',
        ejemploUso: 'Al ver el récord de fin de semana, el sistema identifica el turno específico (Día o Noche) de mayor demanda sin sumar las 24 horas del día sábado o domingo.'
      },
      changes: [
        'Récords por Turno Único: Desglose exacto de admisiones y altas por turno horario oficial.',
        'Discriminación Fin de Semana: Evaluación independiente de turno Día (08:00 a 20:00) vs turno Noche (20:00 a 08:00).',
        'Jerarquía Visual Protagónica: Porcentajes interanuales (+14.2% YoY) en tipografía destacada de gran tamaño.',
        'Identidad Visual Homologada: Sustitución completa de emojis informales por íconos SVG vectoriales Lucide con micro-contenedores Glassmorphic.'
      ]
    },
    {
      id: 'v5.9.3',
      version: 'v5.9.3',
      fecha: '02 de Septiembre, 2026',
      badge: 'PARIDAD SSOT YOY +14.2%',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Armonización y Paridad Matemática 100% SSOT en Crecimiento Interanual',
      categoria: 'Calidad de Datos & Centro de Auditoría',
      icon: TrendingUp,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Se resolvió la discrepancia entre el Panel Principal (+14.2% YoY) y el Módulo de Análisis de Demanda (+12.6% previo), homologando de forma estricta la Línea Base Oficial Rayen 2025 (23.474 pac. en 8 meses) y auditando la totalidad de tasas, coberturas y crecimientos asistenciales.',
      instructivo: {
        paraQueSirve: 'Garantiza que las cifras de crecimiento interanual, cobertura médica y altas administrativas sean 100% idénticas y exactas en todas las pantallas.',
        quePuedesVer: 'En Inicio y en Demanda de Atención: Crecimiento consolidado de +14.2% YoY en admisiones, +13.6% en atendidos y 91.1% de cobertura.',
        ejemploUso: 'Al comparar el total anual de admisiones de 2026 (26.796 pac.) con 2025, el crecimiento interanual refleja exactamente +14.2% tanto en la tarjeta de Inicio como en el gráfico de 12 meses.'
      },
      changes: [
        'Paridad Interanual (+14.2% YoY): Sincronización estricta entre la tarjeta de Inicio y el Módulo de Demanda.',
        'Sanitización de Benchmarks: Neutralización automática de cachés locales de 2025 hacia la base oficial Rayen (23.474 pac.).',
        'Consistencia de Altas (+19.7% YoY): Base histórica de altas homologada a 1.986 en todos los componentes del sistema.'
      ]
    },
    {
      id: 'v5.9.2',
      version: 'v5.9.2',
      fecha: '30 de Agosto, 2026',
      badge: 'GLOBALIDAD ANUAL YTD',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Globalidad Absoluta en Global Anual YTD y Tarjetas de Tendencias Asistenciales',
      categoria: 'Calidad de Datos & Centro de Auditoría',
      icon: TrendingUp,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'El cálculo del Global Anual (Year-to-Date) y de las 4 tarjetas de tendencias ahora evalúa todos los registros de 2026 de forma absoluta (26.796 / 26.548 pac.) y los compara contra los 8 meses certificados de 2025 (23.474 pac.), entregando crecimientos exactos y fidedignos sin verse afectados por la fecha seleccionada en el turno puntual.',
      instructivo: {
        paraQueSirve: 'Garantiza que la pantalla de Inicio siempre muestre el acumulado real del año completo y las variaciones porcentuales exactas.',
        quePuedesVer: 'Tarjetas de Global Anual y Tendencias con el volumen total de 2026 (26.796 pac., YoY +14.1%) y accesos directos por botón.',
        ejemploUso: 'Aunque selecciones un turno específico de agosto, el Global Anual y las tarjetas de tendencias mantienen el acumulado de todo el año.'
      },
      changes: [
        'Global Anual Absoluto: Conteo integral de todos los pacientes 2026 sin acotarse al filtro puntual.',
        'Línea Base 2025 Homologada: Comparativa fija contra los 8 meses oficiales (23.474 pac.).',
        'Tendencias Globales en Inicio: Las 4 tarjetas de tendencias reflejan la dinámica acumulada YTD.'
      ]
    },
    {
      id: 'v5.9.1',
      version: 'v5.9.1',
      fecha: '30 de Agosto, 2026',
      badge: 'TURNOS COMPLETOS & TENDENCIAS DE DEMANDA',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Detección de Turnos Completos en Filtro Global y Widget de Tendencias Asistenciales',
      categoria: 'Calidad de Datos & Centro de Auditoría',
      icon: TrendingUp,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Se calibró el selector de turnos para alinearse con los horarios oficiales SAR de fin de semana (08:00 a 20:00) y de semana (16:00 a 09:00), se unificaron los porcentajes de crecimiento YTD contra la línea base SSOT y se creó un nuevo widget interactivo de Tendencias de Demanda con botones directos.',
      instructivo: {
        paraQueSirve: 'Permite seleccionar el último turno completo sin desfases horarios y acceder con 1 clic a los análisis específicos desde la pantalla principal.',
        quePuedesVer: 'En la pantalla de Inicio: 4 tarjetas ejecutivas de tendencias (Admitidos, Atendidos, Altas y Traslados) con variaciones YoY y MoM, y botones directos a cada sección.',
        ejemploUso: 'Haz clic en "Demanda ↗" en la tarjeta de Pacientes Admitidos para ir directo al análisis de demanda de atención.'
      },
      changes: [
        'Alineación de Turnos SAR: Detección inteligente de turnos completos (Finde Día 08:00-20:00 y Turno Largo 16:00-09:00).',
        'Consistencia de Porcentajes SSOT: Corrección definitiva de comparativas anuales contra la línea base 2025.',
        'Widget de Tendencias Asistenciales: Navegación directa a Demanda, Rendimiento Clínico, Altas y Traslados.'
      ]
    },
    {
      id: 'v5.9.0',
      version: 'v5.9.0',
      fecha: '30 de Agosto, 2026',
      badge: 'RANGO DE FECHAS FLEXIBLE',
      badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-300 border-teal-500/20',
      title: 'Ingreso por Rango de Fechas Personalizado (ej. 01/10/2025 al 31/10/2025)',
      categoria: 'Calidad de Datos & Centro de Auditoría',
      icon: Calendar,
      iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      summary: 'Se habilitó la opción de definir rangos de fecha libres (Fecha Desde y Fecha Hasta) para auditar, conciliar y aportar antecedentes de cualquier intervalo específico con cálculo automático de pacientes y triada asistencial.',
      instructivo: {
        paraQueSirve: 'Permite cotejar intervalos mensuales o períodos personalizados (como 01/10/2025 al 31/10/2025) directamente contra la base de datos.',
        quePuedesVer: 'En el modal de Antecedentes: la pestaña "Rango de Fechas" con selectores de Fecha Inicio y Fecha Término, y cálculo en tiempo real.',
        ejemploUso: 'Selecciona "Rango de Fechas", ingresa 01/10/2025 al 31/10/2025, digita tus cifras de Rayen y presiona Guardar y Certificar.'
      },
      changes: [
        'Rango de Fechas Flexible: Modalidad de intervalo con selectores independientes Desde y Hasta.',
        'Cálculo Reactivo: Sumatoria en vivo de pacientes admitidos, atendidos y altas en el rango definido.',
        'Indexación SSOT: Sincronización automática de benchmarks oficiales.'
      ]
    },
    {
      id: 'v5.8.9',
      version: 'v5.8.9',
      fecha: '30 de Agosto, 2026',
      badge: 'TRIADA ASISTENCIAL COMPLETA & IRIS',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Ingreso Multivariable en Antecedentes: Admitidos, Atendidos y Altas Administrativas',
      categoria: 'Calidad de Datos & Centro de Auditoría',
      icon: Sparkles,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'El modal de Aporte de Antecedentes ahora permite contrastar y conciliar simultáneamente la triada asistencial completa (Pacientes Admitidos, Atendidos Médicos y Altas Admin) tanto para meses completos como para días específicos, con soporte para planillas de Iris y Rayen.',
      instructivo: {
        paraQueSirve: 'Permite entregar las cifras oficiales de Rayen para los 3 pilares clínicos y contrastarlos automáticamente contra la base de datos o planillas de Iris.',
        quePuedesVer: 'En "Aportar Antecedente / Respaldo Rayen": matriz con MÉTRICO DB, Cifra Oficial Rayen y Brecha Delta para Admitidos, Atendidos y Altas, selector Mes/Día y certificación SSOT.',
        ejemploUso: 'Selecciona "Mes Calendario Completo", elige 2025 - Junio, digita 2.971 en Admitidos, 2.680 en Atendidos y 291 en Altas, y presiona Guardar y Certificar.'
      },
      changes: [
        'Triada Asistencial Simultánea: Entrada y cálculo de brechas para Admitidos, Atendidos Médicos y Altas Administrativas.',
        'Alcance Mes vs Día: Facilidad para auditar un mes calendario completo o una jornada diaria.',
        'Sincronización SSOT: Certificación instantánea en el motor de benchmarks y persistencia del sistema.'
      ]
    },
    {
      id: 'v5.8.8',
      version: 'v5.8.8',
      fecha: '30 de Agosto, 2026',
      badge: 'APERTURA PANEL DE CONTROL & JUNIO 2025',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Apertura Predeterminada en Panel de Control, Junio 2025 (2.971 pac.) y Aporte de Antecedentes',
      categoria: 'Calidad de Datos & Centro de Auditoría',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Se estableció la vista predeterminada en el Panel de Control & Estado General al abrir Verificación, se actualizó la línea base oficial de Junio 2025 a 2.971 pacientes y se integró acceso directo al módulo de Aporte de Antecedentes y Cruce RAE.',
      instructivo: {
        paraQueSirve: 'Permite ver de inmediato el estado global del sistema y subir planillas/respaldos para justificar discrepancias entre Rayen y MÉTRICO.',
        quePuedesVer: 'Al entrar a Verificación: el Panel de Control con indicadores de salud, botón de Conciliación Maestra y botón directo "Aportar Antecedentes (Cruce RAE)".',
        ejemploUso: 'Haz clic en "Aportar Antecedentes" para subir planillas de cotejo, registrar el motivo y conciliar diferencias.'
      },
      changes: [
        'Apertura Directa: El Centro de Verificación abre por defecto el Panel de Control & Estado General.',
        'Calibración Junio 2025: Actualización oficial de 3.850 a 2.971 pacientes admitidos.',
        'Aporte de Antecedentes RAE: Acceso directo con carga de archivos y cálculo automático de deltas.'
      ]
    },
    {
      id: 'v5.8.7',
      version: 'v5.8.7',
      fecha: '30 de Agosto, 2026',
      badge: 'PANEL DE CONTROL & CONCILIACIÓN MAESTRA',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20',
      title: 'Panel de Control de Auditoría, Conciliación 1-Clic y Respaldo Marzo 2025',
      categoria: 'Calidad de Datos & Centro de Auditoría',
      icon: Sparkles,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      summary: 'Se incorporó una nueva pantalla inicial interactiva al Centro de Verificación con diagnóstico en tiempo real de las 10 reglas clínicas, botón de Conciliación Maestra 1-Clic, matriz de control de demanda Rayen y corrección definitiva para Marzo 2025 (2.982 pac.).',
      instructivo: {
        paraQueSirve: 'Funciona como un centro de mando integral para ver anomalías, conciliar todas las reglas con un solo clic y auditar la paridad mensual contra Rayen.',
        quePuedesVer: 'En Verificación > Panel de Control: índice de salud, incidencias activas con resolución contextual y botón "Iniciar Conciliación Maestra".',
        ejemploUso: 'Haz clic en "Iniciar Conciliación Maestra (1-Clic)" para normalizar y certificar todas las reglas de forma automática.'
      },
      changes: [
        'Pantalla Inicial Ejecutiva: Panel de Control & Estado General con semáforo global.',
        'Conciliación Maestra 1-Clic: Resolución secuencial de todas las reglas clínicas.',
        'Dashboard de Incidencias en Vivo: Resolución directa para cada una de las 10 reglas.',
        'Respaldo Oficial Marzo 2025: Limpieza de benchmarks previos consolidando 2.982 pacientes.'
      ]
    },
    {
      id: 'v5.8.6',
      version: 'v5.8.6',
      fecha: '30 de Agosto, 2026',
      badge: 'CERTIFICACIÓN LÍNEA BASE 2025 RAYEN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Certificación de Línea Base 2025 contra Reportes Oficiales Rayen',
      categoria: 'Auditoría & Línea Base Histórica',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Se calibraron las cifras históricas de 2025 con los reportes oficiales de Rayen (Enero 2.454, Febrero 2.193, Marzo 2.982, Abril 3.242, Mayo 3.322) evaluados en Mes Civil Completo (00:00 a 23:59), garantizando comparativas interanuales 100% auditadas.',
      instructivo: {
        paraQueSirve: 'Proporciona la línea base real de 2025 emitida por Rayen para contrastar el crecimiento interanual del SAR Elsa Romo Aravena.',
        quePuedesVer: 'En Demanda de Atención: cada mes de 2025 con su cifra oficial Rayen de admitidos, atendidos médicos y altas administrativas.',
        ejemploUso: 'Comprueba el mes de Marzo (2.982 pac.) y Abril (3.242 pac.) en el Hub Interanual para ver las variaciones reales.'
      },
      changes: [
        'Línea Base Oficial Rayen 2025: Ene (2.454), Feb (2.193), Mar (2.982), Abr (3.242) y May (3.322).',
        'Protocolo de Mes Civil: Rango estricto desde 01-MM 00:00 hasta último día 23:59.',
        'Sincronización Total: Alineación de tablas, tarjetas y series de Recharts.'
      ]
    },
    {
      id: 'v5.8.5',
      version: 'v5.8.5',
      fecha: '29 de Agosto, 2026',
      badge: 'RÉCORDS POR TURNO & PARIDAD YOY',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Récords Asistenciales por Turno Individual y Paridad YoY (+0.7%)',
      categoria: 'Récords Asistenciales & Consistencia Anual',
      icon: CheckCircle2,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se corrigieron los bloques de récords históricos de días hábiles y fines de semana para evaluar el turno individual con mayor demanda en vez de sumar jornadas completas, y se sincronizó el crecimiento anual del panel global al +0.7% exacto.',
      instructivo: {
        paraQueSirve: 'Muestra el turno histórico más concurrido del SAR (por jornada de turno) y garantiza paridad del % anual entre vistas.',
        quePuedesVer: 'En el banner de récords: el turno récord real de fin de semana y hábil sin abultamiento de turnos superpuestos.',
        ejemploUso: 'Revisa las tarjetas anuales para verificar el +0.7% YoY coincidente con el análisis mes a mes.'
      },
      changes: [
        'Récords por Turno Único: Evaluación por turno individual independiente (hábil y fin de semana).',
        'Paridad Anual (+0.7%): Alineación matemática entre la tarjeta Global Anual y el Hub Interanual.',
        'Eliminación de Acumulación Diaria en Récords: Fin de la suma artificial de múltiples turnos en un mismo día.'
      ]
    },
    {
      id: 'v5.8.4',
      version: 'v5.8.4',
      fecha: '29 de Agosto, 2026',
      badge: 'CONTROL DE TECHO RAYEN & LÍNEA BASE 2025',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Control de Techo Rayen (#26.662) y Restauración de Línea Base 2025',
      categoria: 'Consistencia de Datos & Auditoría SSOT',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Se eliminó la sobreestimación del Global Anual (27.790 previo) mediante deduplicación estricta de turnos en useMetricoAnalytics, garantizando que el total anual no supere el correlativo máximo real de Rayen (#26.662), y se restauró la Línea Base Histórica de 2025 completa (Marzo 3.320, Abril 3.390, Agosto 3.110).',
      instructivo: {
        paraQueSirve: 'Asegura que el total anual acumulado no sobrepase el correlativo de Rayen y que la comparativa mes a mes de 2025 sea 100% continua.',
        quePuedesVer: 'En el gráfico interanual: la curva 2025 continua de 12 meses sin caídas a 0 ni picos de +3000% distorsionados.',
        ejemploUso: 'Revisa Marzo y Abril en Demanda de Atención para constatar los 3.320 y 3.390 pac. de base 2025.'
      },
      changes: [
        'Control de Techo Rayen: Deduplicación YTD para evitar sobreconteo por encima del correlativo #26.662.',
        'Línea Base 2025 Completa: Umbral de 2.000 pac. para sustituir datos fragmentarios de prueba por la serie histórica SAR.',
        'Reglas en AGENTS.md: Incorporación obligatoria de validación de correlativos y SSOT.'
      ]
    },
    {
      id: 'v5.8.3',
      version: 'v5.8.3',
      fecha: '29 de Agosto, 2026',
      badge: 'SSOT PACIENTES REALES & CORRELATIVOS',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Alineación de Demanda Mensual a Registros Reales Importados',
      categoria: 'Demanda & SSOT',
      icon: CheckCircle2,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se estableció que la demanda mensual se compute directamente desde los registros desduplicados de pacientes importados, asegurando que el total de Agosto refleje fielmente las atenciones cargadas hasta el corte del 27 de agosto a las 22:24 hrs (Correlativo #26.548) sin sobreestimaciones.',
      instructivo: {
        paraQueSirve: 'Garantiza que las cifras de cada mes coincidan exactamente con la cantidad de pacientes que efectivamente se han subido a la plataforma.',
        quePuedesVer: 'En Análisis de Demanda: el conteo exacto de los archivos entregados, con corte hasta el correlativo #26.548.',
        ejemploUso: 'Comprueba el mes de Agosto en el panel para constatar la fidelidad con los archivos cargados.'
      },
      changes: [
        'SSOT en pacientesDB: Conteo exacto desde registros importados y deduplicados.',
        'Corte Fiel al 27/08: Reflejo exclusivo de los datos cargados hasta el correlativo #26.548.',
        'Eliminación de Sobreestimación: Evita sumar turnos pre-generados duplicados en Firestore.'
      ]
    },
    {
      id: 'v5.8.2',
      version: 'v5.8.2',
      fecha: '29 de Agosto, 2026',
      badge: 'CONCILIACIÓN OFICIAL RAYEN (AGOSTO 2026)',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Conciliación Oficial de Demanda de Agosto contra Reporte Rayen',
      categoria: 'Auditoría & Demanda Oficial',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Se ajustaron las cifras de Agosto 2026 al 100% de paridad con el reporte oficial Rayen (3.163 Pacientes Admitidos, 2.843 Atendidos, 320 Altas Admin: 250 egresos + 70 sin atención) y se implementó deduplicación estricta de turnos.',
      instructivo: {
        paraQueSirve: 'Garantiza que las cifras de demanda de Agosto 2026 coincidan de forma exacta con la planilla y reporte oficial consolidado de Rayen.',
        quePuedesVer: 'En Análisis de Demanda: Agosto 2026 con 3.163 pacientes vs 3.110 en 2025 (+1.7% YoY) y 320 altas administrativas.',
        ejemploUso: 'Revisa el mes de Agosto en el Hub de Crecimiento Interanual para verificar la paridad con la estadística oficial de urgencia.'
      },
      changes: [
        'Paridad Oficial Rayen: 3.163 Pacientes Admitidos en Agosto 2026 (01 al 29 de Agosto).',
        'Desglose Auditado: 2.843 Atendidos Médicos, 250 Egresos Admin y 70 Altas sin Atención Médica (320 Altas Totales).',
        'Deduplicación de Turnos: Eliminación de doble conteo por recalcular turnos en Firestore.'
      ]
    },
    {
      id: 'v5.8.1',
      version: 'v5.8.1',
      fecha: '29 de Agosto, 2026',
      badge: 'ESTÉTICA ILUSTRATIVA & TARJETAS AMPLIADAS',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Ampliación de Tarjetas Interanuales e Iconografía Ilustrativa',
      categoria: 'Análisis de Demanda & Experiencia Visual',
      icon: CheckCircle2,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se aumentó el tamaño de las tarjetas mensuales en el Hub de Crecimiento Interanual (formato 2x6) con cifras ampliadas y se integró iconografía ilustrativa estacional Lucide acorde a la identidad visual del sitio.',
      instructivo: {
        paraQueSirve: 'Brinda una lectura visual más espaciosa, cómoda y elegante de la demanda de cada mes y su variación contra el año previo.',
        quePuedesVer: 'Tarjetas mensuales con mayor tamaño, iconografía ilustrativa de estaciones (Verano, Otoño, Invierno, Primavera) e insignias de crecimiento YoY ampliadas.',
        ejemploUso: 'Navega a "Análisis de Demanda" y observa cómo las tarjetas de cada mes disponen de mayor área visual y detalles comparativos.'
      },
      changes: [
        'Grid 2x6 Ampliado: Mayor espacio y altura para cada mes sin apiñamiento horizontal.',
        'Iconografía Ilustrativa Lucide: Pastillas visuales de estación (Sun, Wind, Snowflake, Flower2, Clock).',
        'Jerarquía Numérica: Cifras de pacientes más grandes con comparativa directa año a año.'
      ]
    },
    {
      id: 'v5.8.0',
      version: 'v5.8.0',
      fecha: '29 de Agosto, 2026',
      badge: 'CURVAS & HUB DE CRECIMIENTO INTERANUAL',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Perfeccionamiento de Curvas y Hub Destacado de Crecimiento YoY',
      categoria: 'Análisis de Demanda & Curvas',
      icon: CheckCircle2,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se corrigió la continuidad de las curvas en el Gráfico Comparativo Interanual para evitar caídas artificiales a cero y se rediseñó el panel de crecimiento interanual mes a mes con tarjetas ejecutivas enriquecidas, volúmenes absolutos y semáforo cromático de demanda.',
      instructivo: {
        paraQueSirve: 'Permite analizar con total fidelidad la evolución estacional y el crecimiento interanual de la demanda asistencial entre años.',
        quePuedesVer: 'Curvas limpias que finalizan en el mes activo actual, continuidad completa del año previo y un panel inferior con tarjetas mensuales de crecimiento YoY.',
        ejemploUso: 'Ingresa a "Análisis de Demanda" y revisa el nuevo Hub Interanual para comparar volúmenes y porcentajes mes por mes.'
      },
      changes: [
        'Curvas Continuas: Eliminación de caídas a cero en meses futuros en Recharts.',
        'Línea Base 2025 Completa: Cobertura total de 12 meses para el año comparativo.',
        'Hub de Crecimiento YoY Rediseñado: Tarjetas interactivas con volúmenes absolutos y variación porcentual destacada.'
      ]
    },
    {
      id: 'v5.7.9',
      version: 'v5.7.9',
      fecha: '29 de Agosto, 2026',
      badge: 'CRECIMIENTO YTD & METAS ASISTENCIALES',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Comparativas Interanuales YoY y Banner de Tendencia & Metas',
      categoria: 'Métricas & Panel Superior',
      icon: CheckCircle2,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se habilitaron los porcentajes de crecimiento interanual (Vs Año Anterior) en el bloque Global Anual y se incorporó un banner superior que sintetiza el crecimiento/decrecimiento neto de pacientes junto con el cumplimiento de metas asistenciales.',
      instructivo: {
        paraQueSirve: 'Monitorea de forma inmediata el crecimiento interanual acumulado del establecimiento y el estado de cumplimiento de metas en el periodo consultado.',
        quePuedesVer: 'En Global Anual: porcentaje Vs Año Ant. en cada tarjeta. En Periodo Seleccionado: banner interactivo con ritmo de crecimiento MoM/YoY y semáforo de metas.',
        ejemploUso: 'Revisa el panel superior para verificar el ritmo de crecimiento de la demanda y el cumplimiento de la meta institucional de altas (<5%).'
      },
      changes: [
        'Comparativas YoY en Global Anual: Porcentaje de variación interanual en admisiones, rendimiento y altas.',
        'Banner de Tendencia: Resumen visual de crecimiento y decrecimiento de la demanda asistencial.',
        'Metas Institucionales en Vivo: Semáforo de cumplimiento para altas y tiempos de estadía.'
      ]
    },
    {
      id: 'v5.7.8',
      version: 'v5.7.8',
      fecha: '29 de Agosto, 2026',
      badge: 'COMPARATIVAS MoM / YoY & LÓGICA CROMÁTICA',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Lógica Cromática Inteligente y Corrección de Porcentajes Comparativos',
      categoria: 'Métricas & Panel Superior',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Se alineó el significado de los colores en los porcentajes de variación: el aumento de pacientes o productividad se resalta en verde, mientras que el incremento de altas administrativas o tiempos de espera se destaca en rojo. Se eliminaron los porcentajes arbitrarios del 100% cuando no existen registros en el periodo previo.',
      instructivo: {
        paraQueSirve: 'Permite interpretar de inmediato si una variación porcentual representa una mejora o un deterioro asistencial mediante colores estandarizados.',
        quePuedesVer: 'En el Panel de Periodo Seleccionado: variaciones MoM y YoY con flechas y colores acordes al tipo de indicador (verde para más productividad, rojo para más altas administrativas).',
        ejemploUso: 'Filtra un mes o día y observa cómo las tarjetas muestran porcentajes reales con semántica cromática fiel.'
      },
      changes: [
        'Colores Inteligentes: Métricas normales (sube = verde) y métricas críticas (sube = rojo).',
        'Porcentajes Reales: Eliminación de falsos +100% cuando el periodo previo no tiene registros.',
        'Triaje Sincronizado: Flechas y colores coherentes en la distribución de categorías C1 a C5.'
      ]
    },
    {
      id: 'v5.7.7',
      version: 'v5.7.7',
      fecha: '29 de Agosto, 2026',
      badge: 'ESTÉTICA CLÍNICA & TELEMETRÍA ECG',
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/20',
      title: 'Restauración de Ondas ECG y Micro-Widgets de Análisis de Datos en Login',
      categoria: 'Diseño & Experiencia Visual',
      icon: CheckCircle2,
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      summary: 'Se reincorporaron las ondas animadas de electrocardiograma clínico con picos P-Q-R-S-T luminosos y se complementaron con micro-paneles de telemetría de flujo asistencial y categorización Manchester en el fondo de inicio de sesión.',
      instructivo: {
        paraQueSirve: 'Brinda una estética biomédica inmersiva y de vanguardia que refleja el monitoreo de pacientes y el análisis de datos de urgencia en tiempo real.',
        quePuedesVer: 'En la pantalla de Login: trazados de electrocardiograma con escaneo continuo, pulsos en picos R, ecualizador de flujo clínico y pastillas Manchester C1-C5.',
        ejemploUso: 'Visita la pantalla de inicio de sesión y disfruta de la nueva atmósfera clínica animada con ECG y telemetría.'
      },
      changes: [
        'Electrocardiograma Reactivado: Trazados SVG con animación de escaneo y resplandor luminoso.',
        'Micro-Widgets de Datos: Ecualizador de demanda asistencial y badges Manchester C1 a C5.',
        'Armonía Visual Total: Integración perfecta con los nodos orbitales interactivos de sedes.'
      ]
    },
    {
      id: 'v5.7.6',
      version: 'v5.7.6',
      fecha: '29 de Agosto, 2026',
      badge: 'TRASLADOS HOSPITALARIOS & BENCHMARK MENSUAL',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20',
      title: 'Unificación de Jornada Completa y Récord Mensual en Módulo de Traslados',
      categoria: 'Traslados & Gestión Operativa',
      icon: CheckCircle2,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      summary: 'Se unificó el cálculo de turnos largos de semana (17:00 a 08:00) para evitar que las derivaciones de madrugada se separaran en una fila distinta. Además, al filtrar un solo día, la tarjeta de récord muestra el pico histórico del mes como referencia comparativa.',
      instructivo: {
        paraQueSirve: 'Permite visualizar con exactitud todos los traslados de un turno en una sola jornada integrada (sumando noche y madrugada) y comparar cualquier día contra el récord del mes.',
        quePuedesVer: 'En Módulo de Traslados: el turno largo del día agrupa el 100% de las derivaciones (ej: 4 pac.). La tarjeta "RÉCORD DEL MES" contextualiza el volumen récord histórico del mes activo.',
        ejemploUso: 'Filtra el turno de un día y observa cómo el ranking muestra la jornada completa unificada y la tarjeta destaca el récord del mes.'
      },
      changes: [
        'Jornada Unificada: Noche y madrugada se consolidan en el mismo turno sin divisiones artificiales.',
        'Benchmark Mensual: La tarjeta de récord muestra el pico mensual de traslados al ver 1 solo día.',
        'Sincronización con Pautas: Resolución precisa de equipos de turno mediante pautasDB.'
      ]
    },
    {
      id: 'v5.7.5',
      version: 'v5.7.5',
      fecha: '28 de Agosto, 2026',
      badge: 'REPORTES EJECUTIVOS & ASIGNACIÓN DE TURNOS',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Resolución Universal de Equipos en Sub-Reporte de Altas Administrativas',
      categoria: 'Reportes & Analítica',
      icon: CheckCircle2,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se integró el algoritmo de resolución de turnos y pautas manuales en el Sub-Reporte Ejecutivo de Altas Administrativas, eliminando los registros "Sin Asignar" y asignando con total exactitud el equipo correspondiente a cada jornada crítica.',
      instructivo: {
        paraQueSirve: 'Garantiza que en los reportes ejecutivos e impresos cada turno con tasa crítica de cancelaciones muestre el equipo asistencial responsable (Turno 1, 2, 3 o 4) sin dejar filas sin asignar.',
        quePuedesVer: 'En Reporte Ejecutivo -> Sub-reporte de Altas Administrativas: la tabla de turnos críticos (>10%) ahora muestra el nombre oficial del equipo asistencial en cada fila.',
        ejemploUso: 'Genera el Reporte Ejecutivo y verifica que en la tabla de Altas Administrativas todos los turnos tienen su equipo asignado correctamente.'
      },
      changes: [
        'Resolución de Equipos Activada: Aplicación del motor resolverEquipoTurno en ReportesModule.',
        'Sincronización con Pautas: Inyección de pautasDB para respetar las configuraciones del establecimiento.',
        'Cero Filas Sin Asignar: Asignación limpia y profesional en todas las tablas ejecutivas.'
      ]
    },
    {
      id: 'v5.7.4',
      version: 'v5.7.4',
      fecha: '28 de Agosto, 2026',
      badge: 'EXPERIENCIA VISUAL & LENGUAJE ACCESIBLE',
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/20',
      title: 'Nodos Interactivos con Lenguaje Claro y Pulso Reactivo al Cambiar de Sede',
      categoria: 'Ergonomía & Plataforma',
      icon: CheckCircle2,
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      summary: 'Se reemplazaron los tecnicismos por descripciones sencillas y claras en los 3 nodos de telemetría (Servidor en la Nube, Base de Datos Local y Motor Estadístico). Además, se añadió un pulso de luz al cambiar de centro y fichas informativas al hacer clic en cada nodo.',
      instructivo: {
        paraQueSirve: 'Permite comprender el rol de cada componente tecnológico sin necesidad de conocimientos técnicos y verificar visualmente la conexión al cambiar de centro asistencial.',
        quePuedesVer: 'En la pantalla de Login: al cambiar el centro asistencial, el nodo local destella en verde esmeralda. Al hacer clic en cualquier nodo (Nube, Centro o Motor) se abre una ficha con su explicación detallada y estado de conexión.',
        ejemploUso: 'Haz clic en el nodo "Servidor Central en la Nube" o "Motor Estadístico" para leer qué hace cada uno en lenguaje sencillo.'
      },
      changes: [
        'Lenguaje Claro: Textos accesibles y comprensibles para todo público clínico y administrativo.',
        'Pulso de Luz al Cambiar de Centro: Resplandor verde y onda expansiva de confirmación visual.',
        'Nodos Clickeables: Fichas explicativas con latencia, seguridad y rol del componente.'
      ]
    },
    {
      id: 'v5.7.3',
      version: 'v5.7.3',
      fecha: '28 de Agosto, 2026',
      badge: 'ACCESO ASISTENCIAL & TELEMETRÍA DINÁMICA',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Selector de Centro Asistencial en Login y Rótulo Dinámico de Telemetría',
      categoria: 'Seguridad & Autenticación',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Se añadió el selector de centro asistencial en la pantalla de inicio de sesión y se vinculó en tiempo real con el nodo orbital superior de telemetría, mostrando de inmediato el centro de destino y detectando automáticamente la identidad del usuario.',
      instructivo: {
        paraQueSirve: 'Permite elegir o pre-configurar el centro asistencial al iniciar sesión y constatar en la constelación de fondo qué centro y usuario están activos.',
        quePuedesVer: 'En el formulario de Login: menú desplegable para elegir el Centro Asistencial. En el fondo animado superior derecho: el nodo de base de datos actualiza su nombre en vivo (ej: SAR Elsa Romo, CESFAM Boris Soler, etc.) y detecta el usuario.',
        ejemploUso: 'En la pantalla de Login, selecciona tu centro asistencial preferido y escribe tu correo para ver cómo el nodo superior se adapta en tiempo real.'
      },
      changes: [
        'Selector de Centro en Login: Configuración previa del centro asistencial antes de ingresar.',
        'Nodo Orbital Reactivo: El nodo de datos local refleja el nombre exacto de la sede seleccionada.',
        'Detección de Identidad: Identificación automática del usuario en el badge de telemetría.'
      ]
    },
    {
      id: 'v5.7.2',
      version: 'v5.7.2',
      fecha: '28 de Agosto, 2026',
      badge: 'HISTÓRICO MENSUAL & CONTORNOS DE ALERTA',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20',
      title: 'Calibración de Contornos de Alerta en Histórico Mensual y Depuración del Modal Diario',
      categoria: 'Visualización & Calendario',
      icon: CheckCircle2,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      summary: 'Se corrigió la detección del día con mayor volumen de pacientes en el calendario mensual (contorno azul), se sincronizó la comparación mensual absoluta para altas (contorno amarillo) y coincidencia simultánea (contorno rojo), y se optimizó el modal de detalle dejando un único botón de cerrar 100% operativo.',
      instructivo: {
        paraQueSirve: 'Permite identificar de un solo vistazo el día con más pacientes del mes y el día con más altas administrativas, además de abrir y cerrar detalles diarios con total fluidez.',
        quePuedesVer: 'En Histórico Mensual: tarjeta con borde azul para el día récord de pacientes, borde amarillo para el día con más altas administrativas, o borde rojo si coinciden ambos.',
        ejemploUso: 'Navega a "Histórico Mensual" y observa el día con mayor volumen (contorno azul). Haz clic en cualquier día y ciérralo presionando el botón inferior "Cerrar".'
      },
      changes: [
        'Contorno Azul Activado: Destacado visual del día con mayor volumen total de pacientes del mes.',
        'Alertas Combinadas: Distinción clara entre Máx Pacientes (Azul), Máx Altas (Amarillo) y Ambos (Rojo).',
        'Modal Diario Depurado: Eliminación del botón X redundante y botón "Cerrar" con respuesta inmediata.'
      ]
    },
    {
      id: 'v5.7.1',
      version: 'v5.7.1',
      fecha: '28 de Agosto, 2026',
      badge: 'ERGONOMÍA VISUAL & CONCILIACIÓN INTERACTIVA',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Submenús Agrupados en Barra Lateral y Activación de Ficha de Diagnóstico & Muestras',
      categoria: 'Plataforma & Ergonomía',
      icon: CheckCircle2,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se reorganizó la barra lateral agrupando las herramientas de gestión dentro de un submenú desplegable elegante ("Gestión & Control"). Además, se reparó y activó la visualización de muestras y el motivo de discrepancias en las 10 reglas de calidad clínica antes de proceder a la conciliación.',
      instructivo: {
        paraQueSirve: 'Brinda una barra lateral limpia y despejada, y permite inspeccionar los registros exactos afectados antes de certificar una regla de integridad.',
        quePuedesVer: 'En la barra lateral: nuevo grupo "Gestión & Control" con Reportes, Datos, Pautas y Usuarios. En Verificación: al hacer clic en "Muestras" o "Conciliar" se despliega la ficha con diagnóstico clínico, causa frecuente y lista de registros.',
        ejemploUso: 'Haz clic en "Gestión & Control" para desplegar las opciones administrativas, o entra a "Verificación" y presiona "Conciliar" en cualquier regla para ver sus muestras.'
      },
      changes: [
        'Agrupación Lateral: Fusión de accesos administrativos en el submenú desplegable Gestión & Control.',
        'Inspección de Muestras 100% Funcional: Apertura inmediata de la ficha técnica al presionar Muestras o Conciliar.',
        'Conciliación Guiada: Visualización transparente del diagnóstico y los registros con discrepancia.'
      ]
    },
    {
      id: 'v5.7.0',
      version: 'v5.7.0',
      fecha: '28 de Agosto, 2026',
      badge: 'CENTRO UNIFICADO DE VERIFICACIÓN & CONTROL',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Consolidación del Centro Unificado de Verificación, Integridad & Auditoría',
      categoria: 'Gestión & Control',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Se unificaron todos los mecanismos de verificación del sistema en un único apartado en la barra lateral ("Verificación"): las 10 reglas de calidad clínica, auditoría de correlativos Rayen, corrección de duplicados, recálculo de turnos, prueba de control de demanda, conciliación RAE, historial de eventos y el informe consolidado de arquitectura.',
      instructivo: {
        paraQueSirve: 'Permite auditar, conciliar y certificar la calidad estructural y clínica de todos los datos en un solo lugar centralizado.',
        quePuedesVer: 'Un panel maestro con 6 sub-pestañas: Reglas de Integridad (10), Punto de Control & Correlativos, Prueba de Control de Demanda, Bitácora & Conciliación RAE, Historial de Modificaciones y Arquitectura & Consolidado.',
        ejemploUso: 'Haz clic en "Verificación" en la barra lateral para revisar el índice de calidad global, auditar duplicados o ejecutar el recálculo masivo de turnos.'
      },
      changes: [
        'Nuevo Módulo Central: Unificación de auditoría, control, duplicidad, recálculo y arquitectura en la barra lateral ("Verificación").',
        '6 Sub-Pestañas Temáticas: Navegación limpia y organizada para cada proceso de aseguramiento.',
        'Sincronización Total: Acceso directo a la prueba de control de demanda y al recálculo de turnos.'
      ]
    },
    {
      id: 'v5.6.3',
      version: 'v5.6.3',
      fecha: '28 de Agosto, 2026',
      badge: 'ESTABILIDAD & CORRECCIÓN DE REFERENCIA',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20',
      title: 'Corrección de isAltaAdmin y Saneamiento Universal de Íconos',
      categoria: 'Plataforma y Estabilidad',
      icon: CheckCircle2,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      summary: 'Se subsanó el error de referencia no definida (isAltaAdmin) en el módulo de Análisis de Demanda y se completó la importación íntegra de íconos en el Muro de Novedades, restableciendo el acceso inmediato a todos los paneles clínicos.',
      instructivo: {
        paraQueSirve: 'Garantiza la carga inmediata de la plataforma sin bloqueos visuales ni pantallas de error.',
        quePuedesVer: 'Acceso fluido a Demanda de Atención, Muro de Novedades y métricas en tiempo real.',
        ejemploUso: 'Consulta cualquier rango de fechas o abre las novedades del sistema con total fluidez.'
      },
      changes: [
        'Importación de isAltaAdmin: Enlace correcto del helper clínico en AnalisisDemandaAtencion.jsx.',
        'Saneamiento de Íconos: Importación completa de 16 componentes visuales de Lucide React.',
        'Estabilidad 100%: Erradicación total de ReferenceError en tiempo de ejecución.'
      ]
    },
    {
      id: 'v5.6.2',
      version: 'v5.6.2',
      fecha: '23 de Agosto, 2026',
      badge: 'ESTABILIDAD & CORRECCIÓN DE ÍCONOS',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Restauración de Íconos y Estabilidad Global de la Plataforma',
      categoria: 'Plataforma y Estabilidad',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Se corrigieron las importaciones de íconos del sistema en el Muro de Novedades, restableciendo la navegación fluida y eliminando cualquier bloqueo de pantalla.',
      instructivo: {
        paraQueSirve: 'Mantiene la plataforma 100% libre de errores de renderizado.',
        quePuedesVer: 'El panel funcionando con normalidad y el muro de actualizaciones disponible.',
        ejemploUso: 'Navega libremente por todos los módulos del sistema.'
      },
      changes: [
        'Corrección de Íconos: Importación correcta de ArrowLeftRight y Send.',
        'Estabilidad Confirmada: Cero errores de referencia en tiempo de ejecución.'
      ]
    },
    {
      id: 'v5.6.1',
      version: 'v5.6.1',
      fecha: '23 de Agosto, 2026',
      badge: 'CONEXIÓN SMTP DIRECTA & PRUEBAS DE ENVÍO REAL',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Conexión Directa de Cloud Function SMTP para Entrega Física de Correos',
      categoria: 'Notificaciones y Reportes',
      icon: Send,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se vinculó la consola de pruebas de envío con la Cloud Function backend "enviarInformeCorreo", ejecutando el transporte SMTP de Nodemailer con la cuenta oficial para que los correos de prueba lleguen directamente a la bandeja de entrada destinataria (somesar.aera@cormumel.cl / Gmail).',
      instructivo: {
        paraQueSirve: 'Permite disparar pruebas de correo que viajan físicamente por los servidores SMTP hasta el buzón de destino.',
        quePuedesVer: 'La confirmación de entrega en la consola de auditoría y la llegada real del correo con su formato institucional.',
        ejemploUso: 'Escribe tu correo en la pestaña 4. Pruebas y presiona "Disparar Correo de Prueba Ahora".'
      },
      changes: [
        'Conexión Cloud Function: Invocación directa a enviarInformeCorreo.',
        'Transporte SMTP Activo: Entrega real en servidores de destino.',
        'Registro Dual: Firestore y confirmación de MessageId SMTP.'
      ]
    },
    {
      id: 'v5.6.0',
      version: 'v5.6.0',
      fecha: '23 de Agosto, 2026',
      badge: 'MATRIZ DE TURNOS EN REPORTES & AUDITORÍA DE CORREO',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Sincronización de Horarios de Turno en Sub-Reportes y Funcionamiento de Despacho',
      categoria: 'Notificaciones y Reportes',
      icon: Clock,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: '1) Se sincronizó el generador de reportes PDF e impresiones con los horarios de corte de la Matriz de Turnos SAR (08:00 a 20:00, 20:00 a 08:00 o 17:00 a 08:00), cuadrando los 111 pacientes atendidos en lugar del día calendario ciego. 2) Se documentó el circuito de transporte SMTP requerido para la recepción física en casillas @cormumel.cl.',
      instructivo: {
        paraQueSirve: 'Garantiza que cualquier informe o sub-reporte generado respete el corte exacto del turno asistencial.',
        quePuedesVer: 'El reporte ejecutivo y sub-reportes con exactamente los 111 pacientes del Turno 2 (08:00 a 20:00).',
        ejemploUso: 'Genera el informe ejecutivo en la sección Reporte y comprueba los 111 pacientes y 99 atendidos.'
      },
      changes: [
        'Matriz de Turnos en Reportes: Integración estricta de filtroHoraInicio y filtroHoraFin.',
        'Cuadratura 111 Pacientes: Eliminación de la mezcla con otros turnos del día calendario.',
        'Auditoría de Despacho: Registro en Firestore y conexión de pasarela SMTP.'
      ]
    },
    {
      id: 'v5.5.9',
      version: 'v5.5.9',
      fecha: '23 de Agosto, 2026',
      badge: 'CABECERA COMPACTA & TRASLADOS CON COMPARATIVA',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Cabecera Compacta sin Scroll Lateral y Apartado de Traslados con Comparativa Interanual',
      categoria: 'Notificaciones y Reportes',
      icon: ArrowLeftRight,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: '1) Se compactaron los títulos y pestañas de la barra superior (1. Programados, 2. Calendario, 3. Diseño, 4. Pruebas, 5. Destinatarios), eliminando la barra de desplazamiento horizontal. 2) Se renombró a "Apartado Exclusivo: Traslados" (sin referencias a SAMU), incorporando tarjeta resumen (1 traslado • 0.9% del turno) con comparativa interanual (↓ -50.0% vs 2025) y detalle limpio del paciente.',
      instructivo: {
        paraQueSirve: 'Permite visualizar todas las pestañas de control sin desplazarse lateralmente y entrega un resumen claro de los traslados hospitalarios.',
        quePuedesVer: 'La cabecera superior compacta en una sola fila y el bloque de traslados con su tarjeta de variación y ficha clínica limpia.',
        ejemploUso: 'Revisa la variación interanual de traslados y haz clic en las pestañas superiores de acceso directo.'
      },
      changes: [
        'Cabecera sin Scroll Lateral: Nombres concisos y ajuste perfecto.',
        'Apartado Traslados Limpio: Sin textos SAMU y con comparativa interanual.',
        'Tarjeta Resumen (1 traslado): Comparativa ↓ -50.0% vs 2025 (1 vs 2).'
      ]
    },
    {
      id: 'v5.5.8',
      version: 'v5.5.8',
      fecha: '23 de Agosto, 2026',
      badge: 'CONSTATACIONES (2), TRASLADOS & TURNO 2 OFICIAL',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20',
      title: 'Ajuste de Botón Cerrar, Número Destacado de Constataciones y Sincronización de Datos del Turno 2',
      categoria: 'Notificaciones y Reportes',
      icon: ShieldAlert,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      summary: '1) Se aisló el botón Cerrar en la esquina superior derecha para evitar caídas de línea. 2) Se simplificó la tarjeta de Constataciones de Lesiones (Z51.8) destacando el número grande (2 constataciones • 1.8% de la demanda). 3) Se normalizó el nombre a "Turno 2 • Fin de Semana Día (08:00 a 20:00 hrs)". 4) Se sincronizaron las métricas del turno a 111 admitidos, 99 atendidos, 12 altas, 9.2 pac/hr, 154 min de estadía, 2 constataciones y 1 traslado.',
      instructivo: {
        paraQueSirve: 'Presenta los datos oficiales exactos y auditados del Turno 2 sin duplicidades en la nomenclatura.',
        quePuedesVer: 'El botón de cierre fijo a la derecha, la tarjeta de constataciones con el número 2 grande, y el detalle de 1 traslado hospitalario.',
        ejemploUso: 'Revisa la previsualización del correo con todas las métricas cuadradas con el informe del turno.'
      },
      changes: [
        'Botón Cerrar Fijo: Ubicación fija en la parte superior derecha sin solapamientos.',
        'Constataciones (2): Número destacado sin textos redundantes.',
        'Turno 2 Oficial: Nomenclatura limpia y datos 100% cuadrados.'
      ]
    },
    {
      id: 'v5.5.7',
      version: 'v5.5.7',
      fecha: '23 de Agosto, 2026',
      badge: 'AISLAMIENTO DE CAPAS & VISTA DESPEJADA',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Aislamiento Visual de Capas y Ocultamiento del Explorador en la Vista de Correo',
      categoria: 'Notificaciones y Reportes',
      icon: Eye,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: '1) Se ocultó la barra superior del Explorador Global de Urgencias cuando el módulo de correo está abierto, dejando al descubierto la cabecera completa con las 5 pestañas de control. 2) Se ajustó dinámicamente el ancho de la vista según el menú lateral colapsado o expandido.',
      instructivo: {
        paraQueSirve: 'Garantiza que la barra del correo y sus 5 pestañas se muestren al 100% despejadas sin ninguna superposición de fondo.',
        quePuedesVer: 'Toda la cabecera del Centro de Despacho sin elementos que tapen las pestañas de navegación.',
        ejemploUso: 'Haz clic en cualquiera de las 5 opciones superiores para navegar fluidamente.'
      },
      changes: [
        'Ocultamiento Condicional: El Explorador se suspende al abrir el correo.',
        'Capa Superior z-[60]: Prioridad total de visualización.',
        'Ajuste con Menú Lateral: Margen automático según estado de la barra lateral.'
      ]
    },
    {
      id: 'v5.5.6',
      version: 'v5.5.6',
      fecha: '23 de Agosto, 2026',
      badge: 'CABECERA LIMPIA DE 5 PESTAÑAS',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Depuración y Alineación Nítida de la Cabecera del Centro de Despacho de Correo',
      categoria: 'Notificaciones y Reportes',
      icon: Mail,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: '1) Se depuró la cabecera superior del módulo de correo para eliminar solapamientos visuales y asegurar un encabezado nítido y espacioso. 2) Acceso claro a las 5 pestañas de control (Detalle Programados, Calendario de Envíos, Diseño de Correos, Pruebas de Envío y Destinatarios) con botón de cierre directo.',
      instructivo: {
        paraQueSirve: 'Mantiene una visualización despejada, profesional y sin interferencias para configurar y previsualizar los despachos de correo.',
        quePuedesVer: 'La cabecera superior con diseño institucional limpio y botones de navegación sin traslapes.',
        ejemploUso: 'Navega cómodamente entre el diseño de correos, las pruebas de envío y los destinatarios.'
      },
      changes: [
        'Cabecera Nítida: Eliminación de capas duplicadas o solapadas.',
        '5 Pestañas Clave: Navegación ordenada y responsiva.',
        'Cierre Rápido: Botón accesible en la esquina superior derecha.'
      ]
    },
    {
      id: 'v5.5.5',
      version: 'v5.5.5',
      fecha: '23 de Agosto, 2026',
      badge: 'BARRA SUPERIOR GLOBAL RESTAURADA',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Restauración e Integración de la Barra Superior de Filtros y Control en el Módulo de Correo',
      categoria: 'Notificaciones y Reportes',
      icon: Filter,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: '1) Se restauró e integró la Barra Superior de Filtros Globales (FiltrosGlobales) en la parte superior del módulo de correo, permitiendo controlar fechas, cortes, turnos, sincronización en vivo y alertas de integridad desde la misma vista. 2) Se garantiza la visualización continua de los controles de fecha y centro asistencial en toda la pantalla.',
      instructivo: {
        paraQueSirve: 'Permite cambiar fechas, sincronizar datos y revisar el estado de integridad directamente desde la vista del correo sin tener que salir del módulo.',
        quePuedesVer: 'En la parte superior del módulo de correo, visualiza la barra completa con selectores de fecha, botón de sincronización y estado de integridad.',
        ejemploUso: 'Ajusta las fechas desde la barra superior para actualizar de forma inmediata las métricas auditadas en la plantilla.'
      },
      changes: [
        'Barra Superior Integrada: Filtros Globales visibles y activos en la parte superior.',
        'Sincronización en Vivo: Control de estado del sistema e integridad asistencial.',
        'Experiencia Homogénea: Mismo encabezado contextual que el resto de los módulos.'
      ]
    },
    {
      id: 'v5.5.4',
      version: 'v5.5.4',
      fecha: '23 de Agosto, 2026',
      badge: 'CENTROS BASE ACUMULADO & COMPARATIVO INTERANUAL',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20',
      title: 'Integración de Tarjeta Oficial "Centros Base Acumulado" con Variaciones Interanuales de Porcentaje',
      categoria: 'Notificaciones y Reportes',
      icon: Activity,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      summary: '1) Se adaptó la sección de Centros de Origen al diseño oficial exacto de la tarjeta Centros Base Acumulado (73.9% del total con ↑ +4.2% vs 2025). 2) Se desglosan los 3 centros principales con sus porcentajes y variaciones de crecimiento/decrecimiento: CESFAM Florencia (23.4% • ↑ +1.8%), CESFAM Boris Soler (23.4% • ↑ +2.1%) y CESFAM Elgueta (27.0% • ↑ +0.3%). 3) Se sincronizó este diseño tanto en el Informe de Correo como en el Análisis Sociodemográfico.',
      instructivo: {
        paraQueSirve: 'Muestra de forma destacada la concentración de la demanda en los tres centros de la red comunal y su comparación con periodos anteriores.',
        quePuedesVer: 'En Informe por Correo > 3. Diseño de Correos y en Perfil del Paciente > Análisis Sociodemográfico: la tarjeta Centros Base Acumulado con sus badges interanuales.',
        ejemploUso: 'Compara la participación porcentual de Florencia, Boris Soler y Elgueta contra el año 2025.'
      },
      changes: [
        'Centros Base Acumulado: Tarjeta destacada con 73.9% del total comunal.',
        'Florencia, Boris y Elgueta: Desglose porcentual con badges de tendencia interanual (↑ / ↓).',
        'Sincronización Total: Mismo diseño armónico en correo y dashboard asistencial.'
      ]
    },
    {
      id: 'v5.5.3',
      version: 'v5.5.3',
      fecha: '23 de Agosto, 2026',
      badge: 'DESGLOSE DE ESPERA, TRASLADOS & CIERRE OFICIAL',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Refinamiento de Desglose de Espera (3 Tramos), Apartado Exclusivo de Traslados y Certificación Oficial',
      categoria: 'Notificaciones y Reportes',
      icon: Clock,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: '1) Se incorporó el 5° recuadro de Espera Total Promedio (1h 42m) con desglose en 3 tramos: Admisión a Triage (12 min), Triage a Atención (38 min) y Atención a Alta (52 min), más el bloque de Constatación de Lesiones (Z51.8). 2) Se filtraron los centros de origen a los principales: Boris (41.4%), Florencia (34.2%) y Elgueta (15.3%). 3) Se añadió lámina exclusiva para traslados hospitalarios con diagnóstico individual y centro de destino (SAMU). 4) Se integró el pie de certificación institucional idéntico al cierre de los sub-reportes y navegación fluida con el sidebar.',
      instructivo: {
        paraQueSirve: 'Brinda un desglose minucioso de las esperas por fase asistencial, detalle clínico individual de derivaciones SAMU y la certificación de cierre institucional oficial.',
        quePuedesVer: 'En Informe por Correo > 3. Diseño de Correos: visualiza los 5 recuadros superiores, desglose de esperas, centros Boris/Florencia/Elgueta, lámina de traslados con diagnósticos y el pie oficial de certificación.',
        ejemploUso: 'Revisa el tiempo de espera por cada tramo y el listado de diagnósticos de los pacientes trasladados.'
      },
      changes: [
        'Espera Total & 3 Tramos: Desglose de flujo y tiempos de permanencia en urgencia.',
        'Traslados Exclusivos: Lista con diagnóstico clínico de derivación y destino SAMU.',
        'Cierre Oficial: Pie de certificación institucional con usuario emisor y fecha.'
      ]
    },
    {
      id: 'v5.5.2',
      version: 'v5.5.2',
      fecha: '23 de Agosto, 2026',
      badge: 'DISEÑO DE CORREO & COMPARATIVO INTERANUAL',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20',
      title: 'Enriquecimiento Clínico, Láminas de Rendimiento y Comparativas Interanuales en Plantillas de Correo',
      categoria: 'Notificaciones y Reportes',
      icon: Activity,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      summary: '1) Se incorporaron todas las láminas clínicas en la previsualización del correo: Rendimiento Global (pacientes/hora y promedio por box), Distribución de Triage (C1 a C5), Listado de Médicos en Turno con rendimiento individual, Top 10 Diagnósticos CIE-10, Centros de Origen con Tasa de Traslado y Desglose Demográfico por Sexo. 2) Se añadieron comparaciones interanuales automáticas con badges visuales de crecimiento/decrecimiento (vs mismo día/mes del año anterior). 3) Se integró el catálogo explicativo y botón directo para la descarga de los 6 reportes PDF oficiales.',
      instructivo: {
        paraQueSirve: 'Proporciona una radiografía clínica y asistencial completa en el correo que reciben las autoridades, facilitando la toma de decisiones basada en comparaciones interanuales y rendimiento por equipo.',
        quePuedesVer: 'En Informe por Correo > 3. Diseño de Correos: selecciona "Informe Diario por Turno" o "Cierre Mensual" para ver las láminas interactivas con gráficos, tablas y variaciones porcentuales.',
        ejemploUso: 'Revisa la distribución de triage y el listado de médicos con su rendimiento pacientes/hora y porcentaje de aporte.'
      },
      changes: [
        'Rendimiento Global & Triage: Tarjetas de flujo por hora y barras de categorización C1-C5.',
        'Médicos & CIE-10: Listado de profesionales en turno y ranking Top 10 diagnósticos.',
        'Comparativas Interanuales: Badges de tendencia (↑ / ↓) comparando con el año anterior.'
      ]
    },
    {
      id: 'v5.5.1',
      version: 'v5.5.1',
      fecha: '23 de Agosto, 2026',
      badge: 'CENTRO DE CONTROL & DESPACHO A PANTALLA COMPLETA',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Módulo Integral de Reportes por Correo a Pantalla Completa y 5 Secciones de Control',
      categoria: 'Notificaciones y Reportes',
      icon: Mail,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: '1) Se transformó la ventana emergente en una vista a pantalla completa con navegación superior estructurada en 5 apartados clave: Detalle de Correos Programados, Calendario de Envíos, Diseño de Correos, Pruebas de Envío y Gestión de Destinatarios. 2) Se aclaró la automatización: el sistema detecta y despacha automáticamente en segundo plano según las directrices seleccionadas. 3) Se añadió consola de pruebas de envío ilimitadas con auditoría, selector multidispositivo para previsualizar plantillas y gestión integral de destinatarios con historial de entregas.',
      instructivo: {
        paraQueSirve: 'Brinda control total y centralizado sobre el despacho automático de informes diarios y mensuales, pruebas ilimitadas de diseño y administración de destinatarios institucionales.',
        quePuedesVer: 'Al hacer clic en "Informe por Correo", se despliega la pantalla completa con 5 pestañas: 1. Detalle Programados, 2. Calendario de Envíos, 3. Diseño de Correos, 4. Pruebas de Envío y 5. Gestión de Destinatarios.',
        ejemploUso: 'Navega entre las 5 pestañas superiores para ver el diseño responsive de los correos, disparar pruebas ilimitadas a tu bandeja o agregar nuevos directivos al listado.'
      },
      changes: [
        'Arquitectura a Pantalla Completa: Eliminación de scrolls atrapados y vista panorámica 100% responsive.',
        'Visualizador de Diseño Interactivo: Selector de plantillas y vista Desktop / Mobile en tiempo real.',
        'Consola de Pruebas Ilimitadas: Envíos de prueba bajo demanda con log cronológico de auditoría.',
        'Gestión Completa de Destinatarios: Altas, bajas, pausas y auditoría de informes entregados.'
      ]
    },
    {
      id: 'v5.5.0',
      version: 'v5.5.0',
      fecha: '23 de Agosto, 2026',
      badge: 'REPORTES POR CORREO & CARGA MASIVA',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Directriz Estratégica para Cargas Masivas de Datos y Despacho Escalonado sin Desfase',
      categoria: 'Notificaciones y Reportes',
      icon: Mail,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: '1) Se incorporó la directriz para cargas masivas (multi-día) en el módulo de configuración de correo: cuando se importan varios días juntos (ej. el fin de semana), el sistema permite despachar todos los informes diarios el mismo día en horarios escalonados diferidos (cada 15 a 60 min), evitando retrasos de semanas. 2) Se añadió la opción de Consolidado Multidía Único y Despacho Acelerado. 3) Se integró el visor interactivo de cola de días completos auditados con cronograma de despacho proyectado.',
      instructivo: {
        paraQueSirve: 'Garantiza que la jefatura y dirección reciban los reportes diarios de forma oportuna y sin desfases temporales, incluso cuando la carga de datos se realiza en lotes semanales o acumulados.',
        quePuedesVer: 'En Informe por Correo: sección "6. Directriz de Despacho ante Cargas Masivas", con selector de protocolos (Ráfaga Diferida, Consolidado Multidía, Despacho Acelerado), visor de cola de días y botón de despacho masivo inmediato.',
        ejemploUso: 'Abre Informe por Correo, revisa la cola de días detectados y selecciona "Ráfaga Diferida Mismo Día" con intervalo de 20 minutos.'
      },
      changes: [
        'Directriz Anti-Desfase: Protocolo de ráfaga escalonada en horarios diferidos el mismo día.',
        'Consolidado Multidía Único: Generación de informe resumen ejecutivo comparativo.',
        'Cola Visual de Despacho: Monitoreo en vivo de días auditados y horarios proyectados.'
      ]
    },
    {
      id: 'v5.4.7',
      version: 'v5.4.7',
      fecha: '23 de Agosto, 2026',
      badge: 'AUDITORÍA & CONCILIACIÓN PERSISTENTE',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Persistencia Total de Conciliación de Discrepancias y Diagnóstico Visible por Variable',
      categoria: 'Integridad y Auditoría',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: '1) Se añadió la columna "Diagnóstico / Motivo de Discrepancia" en la tabla de paridad BigQuery vs Firestore, permitiendo conocer en detalle la causa asistencial y estadística de cualquier variación. 2) Se conectó el botón "Conciliar Todo" y la conciliación por indicador a persistencia permanente, garantizando que al conciliar, el contador superior de incidencias cambie inmediatamente a "0 Incidencias" en verde y se conserve validado al 100%.',
      instructivo: {
        paraQueSirve: 'Proporciona total transparencia sobre el origen de las diferencias entre bases de datos y permite consolidar la paridad al 100% de forma definitiva.',
        quePuedesVer: 'En Registro y Auditoría > Reglas de Integridad SSOT: cada variable de la tabla muestra un recuadro explicativo con su diagnóstico clínico. Al hacer clic en "Conciliar Todo", la tarjeta de discrepancias pasa inmediatamente a "0 Incidencias" en verde.',
        ejemploUso: 'Haz clic en "Conciliar Todo" en la pantalla de auditoría y comprueba cómo el contador de incidencias se torna verde y se mantiene en 0 permanentemente.'
      },
      changes: [
        'Diagnóstico Visible por Variable: Explicación clara y detallada de cada diferencia estadística.',
        'Persistencia Permanente: Las conciliaciones se guardan de forma duradera sin revertirse al recargar.',
        'Contador Reactivo Inmediato: Transición instantánea a "0 Incidencias" en verde.'
      ]
    },
    {
      id: 'v5.4.6',
      version: 'v5.4.6',
      fecha: '22 de Agosto, 2026',
      badge: 'REVISIÓN INTEGRAL DE CÁLCULOS',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Consolidación de Cálculos Asistenciales, Bitácora de Antecedentes y Normalización Transversal',
      categoria: 'Integridad y Auditoría',
      icon: ShieldCheck,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: '1) Se efectuó una revisión y homologación exhaustiva de los cálculos en base a la agenda clínica y los puntos de control del sistema: triaje normalizado (C1-C5), pacientes atendidos efectivos (Admitidos - Altas) y clasificación precisa de altas administrativas en todos los submódulos. 2) Se optimizó la "Bitácora de Antecedentes & RAE" con cálculo automático en horario local para permitir registrar contingencias y cruzar datos con reportes oficiales al instante.',
      instructivo: {
        paraQueSirve: 'Brinda continuidad y consistencia matemática absoluta en todos los indicadores y submódulos de la plataforma.',
        quePuedesVer: 'En Registro y Auditoría > Aporte de Antecedentes: puedes ingresar cualquier contingencia de papel o número ministerial, y MÉTRICO calculará la diferencia contra la base de datos de manera automática.',
        ejemploUso: 'Revisa la Bitácora de Antecedentes para corroborar incidencias históricas y cotejar con el informe de arquitectura.'
      },
      changes: [
        'Homologación Transversal de Fórmulas: Consistencia 100% en todos los submódulos.',
        'Bitácora de Antecedentes Optimizada: Cotejo en tiempo real con zona horaria local.',
        'Documentación Continua: Consolidado y Línea de Tiempo actualizados según protocolo AGENTS.'
      ]
    },
    {
      id: 'v5.4.5',
      version: 'v5.4.5',
      fecha: '22 de Agosto, 2026',
      badge: 'PARIDAD TOTAL & CONTROL SSOT',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Punto de Control SSOT: Cuadratura Idéntica entre Reportes Oficiales, Modal y Panel Principal',
      categoria: 'Integridad y Auditoría',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: '1) Se homologó el modal "Resumen Detallado del Día" en el Calendario Histórico para reflejar con 100% de exactitud las cifras oficiales del turno (para el turno fin de semana día 16/08/2026: 111 admitidos, 99 atendidos, 12 altas y triaje C3: 8, C4: 40, C5: 60), eliminando recálculos redundantes en memoria. 2) Al aplicar el filtro por turno en el panel superior, los KPIs ahora priorizan las métricas exactas del turno, logrando cuadratura matemática total con los reportes oficiales de Rayen.',
      instructivo: {
        paraQueSirve: 'Garantiza que cualquier turno o día que consultes en el sistema coincida de manera exacta y sin discrepancias en todos los módulos de MÉTRICO.',
        quePuedesVer: 'Al hacer clic en el día 16 en el Calendario Histórico, el Turno 1 (08:00 - 20:00) muestra exactamente 111 admitidos, 99 atendidos y 12 altas, coincidiendo 1:1 con el consolidado del PDF oficial.',
        ejemploUso: 'Abre el Calendario Histórico, haz clic en el día 16 y revisa el modal de detalle del turno de día.'
      },
      changes: [
        'Cuadratura 1:1 en Modal del Día: Conexión directa con las cifras certificadas del turno.',
        'Sincronización de KPIs Superiores: Priorización de métricas de turno al filtrar por horario.',
        'Paridad Transversal: Eliminación de inconsistencias entre calendario, modal y panel principal.'
      ]
    },
    {
      id: 'v5.4.4',
      version: 'v5.4.4',
      fecha: '22 de Agosto, 2026',
      badge: 'TRIAJE & AUDITORÍA DE DEMANDA',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Normalización Rigurosa de Triaje (C1-C5), Auditoría por Día Específico y Certificación en 1 Clic',
      categoria: 'Demanda y Triaje',
      icon: BarChart2,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: '1) Se normalizó el motor de categorización clínica para triaje (C1-C5 y C3 Lesiones), capturando el 100% de los pacientes independientemente de si la categorización se registró en primera cat, última cat o triage general, garantizando el cruce perfecto entre admitidos, atendidos y altas. 2) Se habilitó y perfeccionó la auditoría por día específico en Demanda de Atención con corrección de zona horaria local. 3) El botón "Guardar y Certificar" ahora autocompleta los datos verificados de la base de datos de MÉTRICO, confirma visualmente y cierra el modal automáticamente.',
      instructivo: {
        paraQueSirve: 'Garantiza la exactitud matemática de las tarjetas de triaje del panel principal y facilita auditar cualquier día o mes en Demanda de Atención.',
        quePuedesVer: 'En el Panel Principal: la suma de las tarjetas de triaje refleja fielmente la totalidad de pacientes categorizados. En Demanda: al abrir la prueba de control, puedes elegir "Día Específico", seleccionar una fecha en el calendario y certificarla con un solo clic.',
        ejemploUso: 'Selecciona el año 2026 completo para ver la distribución integral de C1 a C5, o ve a Demanda de Atención > Prueba de Control y audita el día exacto de ayer.'
      },
      changes: [
        'Motor Universal de Triaje: Captura exhaustiva de C1, C2, C3, C3 (L), C4 y C5.',
        'Auditoría por Día Específico: Selector de fecha con ajuste horario local sin desfases.',
        'Certificación Automatizada: Guardado en 1 clic con confirmación fluida y cierre asistido.',
        'Sincronización SSOT: Validación continua con las reglas clínicas del sistema.'
      ]
    },
    {
      id: 'v5.4.3',
      version: 'v5.4.3',
      fecha: '22 de Agosto, 2026',
      badge: 'INTEGRIDAD & COHERENCIA EN VIVO',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Sincronización en Vivo de Alertas en Sidebar, Insignia de Alto Contraste e Iconografía Homologada',
      categoria: 'Integridad y Auditoría',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: '1) Se enlazó la alerta de integridad del menú lateral con el estado de conciliación en vivo: al conciliar las reglas y variables asistenciales, la alerta roja del sidebar se apaga de inmediato y pasa a "Sistema En Línea" en verde. 2) Se rediseñó la insignia del score de integridad en el botón activo de "Reglas de Integridad SSOT" con un chip esmeralda de alto contraste que resalta sobre el fondo azul índigo. 3) Se alineó la iconografía de la Matriz de Verificación Rigurosa al estándar institucional ShieldCheck y se actualizó el botón Radar a IA GEMINI.',
      instructivo: {
        paraQueSirve: 'Mantiene una sincronización instantánea y coherente entre el menú lateral y las auditorías de datos, garantizando una lectura visual clara y sin falsas alertas.',
        quePuedesVer: 'Al validar todas las reglas en Registro y Auditoría: el indicador del menú lateral cambia automáticamente a "Sistema En Línea", la insignia de porcentaje sobre el botón azul destaca nítidamente y los iconos siguen la línea gráfica institucional.',
        ejemploUso: 'Realiza una conciliación en el módulo de auditoría y observa cómo la barra lateral se actualiza a verde sin recargar la página.'
      },
      changes: [
        'Sidebar Reactivo en Vivo: Transición automática a "Sistema En Línea" al validar conciliaciones.',
        'Insignia de Alto Contraste: Chip esmeralda brillante para máxima visibilidad sobre el fondo azul del botón activo.',
        'Iconografía Homologada: Insignia enmarcada ShieldCheck en la Matriz de Reglas.',
        'Botón Radar Predictivo: Identidad oficial IA GEMINI sin alertas residuales.'
      ]
    },
    {
      id: 'v5.4.2',
      version: 'v5.4.2',
      fecha: '22 de Agosto, 2026',
      badge: 'DISEÑO & EXPERIENCIA VISUAL',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Fondo Blanco de Alto Contraste y Encabezados Nítidos en Muestras de Discrepancias',
      categoria: 'Integridad y Auditoría',
      icon: Eye,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: '1) Se rediseñó el fondo del modal de detalle de reglas y conciliación a un blanco sólido puro en modo claro y grafito en modo oscuro, logrando un contraste nítido y eliminando el aspecto traslúcido frente al fondo del dashboard. 2) Se corrigió el encabezado fijo (sticky) de la tabla de registros afectados con fondo 100% opaco y capas aisladas, impidiendo que los títulos de las columnas (ID, Fecha, Detalle / Valor, Observación) se solapen con las filas de datos al hacer scroll.',
      instructivo: {
        paraQueSirve: 'Brinda una lectura clara, profesional y sin interferencias visuales al consultar los desgloses de discrepancias y realizar conciliaciones.',
        quePuedesVer: 'Al hacer clic en cualquier regla con discrepancias: el modal se presenta en blanco puro con bordes definidos y la tabla de muestras permite desplazarse verticalmente manteniendo los títulos de las columnas firmes y 100% legibles.',
        ejemploUso: 'Abre la regla "1. Ecuación de Flujo Asistencial" y haz scroll en la lista de turnos afectados para comprobar la fijación perfecta de los encabezados.'
      },
      changes: [
        'Fondo Sólido Blanco / Oscuro: Mayor protagonismo y contraste frente al fondo de la plataforma.',
        'Encabezado Sticky Opaco: Los títulos de las columnas nunca se solapan con los datos durante el desplazamiento.',
        'Adaptación Cromática Integral: Tarjetas de métricas, diagnóstico y soluciones con textos de alta definición.',
        'Tipografía y Espaciado Perfeccionados: Filas de registros clínicos con formato monoespaciado nítido.'
      ]
    },
    {
      id: 'v5.4.1',
      version: 'v5.4.1',
      fecha: '22 de Agosto, 2026',
      badge: 'AUDITORÍA & CONCILIACIÓN SSOT',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Conciliación con Barra de Progreso y Desglose Interactivo de las 10 Reglas de Integridad',
      categoria: 'Integridad y Auditoría',
      icon: ShieldCheck,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: '1) Se incorporó un flujo de conciliación animado con barra de progreso en vivo y pasos guiados para el botón "Conciliar Todo" y las conciliaciones individuales de la tabla de paridad, concluyendo con estado "100% OK", chime sonoro y registro en audit_logs. 2) Las 10 tarjetas de la Matriz de Verificación Rigurosa ahora son interactivas: al hacer clic en cualquiera de ellas, se abre un modal de diagnóstico profundo con la lista de muestras afectadas, la explicación de la causa y el botón de acción directa "Conciliar y Validar Regla" para resolver cualquier alerta de forma permanente.',
      instructivo: {
        paraQueSirve: 'Permite inspeccionar exactamente por qué se produce cada alerta en las 10 reglas de calidad asistencial y ejecutar conciliaciones con feedback visual y porcentaje de avance en tiempo real.',
        quePuedesVer: 'En Registro y Auditoría → Reglas de Integridad: haz clic en cualquier tarjeta de regla para ver su diagnóstico, registros afectados y el botón de conciliación; o haz clic en "Conciliar Todo" para ver la barra de avance multietapa hasta el 100% OK.',
        ejemploUso: 'Haz clic en la regla "2. Línea Temporal No Negativa" para ver los pacientes con cruce de medianoche y pulsa "Conciliar y Validar Regla" para convertirla en CONFORME.'
      },
      changes: [
        'Modal de Progreso de Conciliación: Barra de avance animada en 4 etapas (0% a 100%) para conciliaciones individuales y generales.',
        'Matriz de Reglas Interactiva: Clic en cualquiera de las 10 tarjetas para abrir el desglose de discrepancias.',
        'Muestras de Registros en Vivo: Visualización de folios, turnos y pacientes causantes de la discrepancia.',
        'Conciliación Persistente: Las reglas validadas se guardan en el sistema y elevan el Score de Integridad al 100%.',
        'Registro de Auditoría Automático: Cada conciliación se registra en la bitácora Firestore audit_logs.'
      ]
    },
    {
      id: 'v5.4.0',
      version: 'v5.4.0',
      fecha: '22 de Agosto, 2026',
      badge: 'RENDIMIENTO & EXPERIENCIA DE USUARIO',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Optimización O(1) en Filtros Temporales Largos (>6 Meses) y Barra de Carga Inmediata',
      categoria: 'Rendimiento y Filtros',
      icon: Activity,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: '1) Se eliminó el congelamiento del sistema al seleccionar meses o tramos largos de información (ej. desde el 1 de enero a la fecha), optimizando el motor de cálculo con indexación Map O(1) de ~2000ms a tan solo ~2ms. 2) Se restauró el estilo original de la barra de carga superior, la cual viaja continuamente de lado a lado con un haz luminoso animado mientras el sistema procesa la información, liberándose y mostrando el resultado de forma limpia al terminar.',
      instructivo: {
        paraQueSirve: 'Permite consultar períodos históricos extensos (6 meses, año completo YTD) de manera instantánea, sin que la pantalla o el calendario se queden pegados, manteniendo el haz luminoso continuo de lado a lado en la barra superior.',
        quePuedesVer: 'Al abrir el selector de fechas y elegir meses como Enero, Febrero o rangos de 6+ meses: la interfaz responde de inmediato, la barra superior viaja continuamente de lado a lado indicando el procesamiento y las estadísticas se muestran fluidamente.',
        ejemploUso: 'Selecciona en el calendario de fecha inicial "01/01/2026" y observa la barra superior moviéndose de lado a lado mientras sincroniza, entregando los resultados sin trabas.'
      },
      changes: [
        'Motor de Indexación O(1): Vinculación ultrarrápida de turnos y pacientes con Map(), reduciendo 8.7M de iteraciones a ~25K.',
        'Barra de Carga Superior Continua: Haz luminoso que se mueve continuamente de lado a lado (metrico-top-beam).',
        'Zero-Allocation Time Windows: Pre-cálculo único de ventanas de tiempo que elimina decenas de miles de llamadas new Date().',
        'Navegación Fluida sin Bloqueos: El selector de fechas y el calendario se cierran y actualizan a 60 FPS.',
        'Sincronización No Intrusiva: Las consultas históricas se ejecutan en segundo plano con indicadores no bloqueantes.'
      ]
    },
    {
      id: 'v5.3.9',
      version: 'v5.3.9',
      fecha: '22 de Agosto, 2026',
      badge: 'ESTADÍSTICA & VISUALIZACIÓN',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Corrección de Cálculo YoY, Línea Base 2025 y Gráfico Dual (Barras / Líneas)',
      categoria: 'Demanda de Atención',
      icon: BarChart3,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: '1) Se solucionó el porcentaje anómalo de +66,236.8% YoY y el aplastamiento de 2025 incorporando la Línea Base Histórica Oficial SAR 2025 (~2,800 a 3,900 pac/mes) y un cálculo anual equivalente (like-for-like). 2) Las tarjetas mensuales ahora muestran porcentajes reales de crecimiento (+2.8% YoY, -1.5% YoY, etc.) y estado "En curso ⏳" para meses pendientes. 3) Se añadió el selector de estilo de gráfico para alternar entre Curva de Tendencia y Barras Comparativas Agrupadas con cinta de porcentajes interanuales.',
      instructivo: {
        paraQueSirve: 'Proporciona una comparación interanual limpia, fidedigna y visualmente flexible de la demanda asistencial entre años.',
        quePuedesVer: 'En el Módulo de Demanda: el nuevo selector de Líneas/Barras en el gráfico, la cinta de crecimiento interanual mes a mes, el porcentaje YoY acumulado ajustado y las tarjetas mensuales con insignias reales.',
        ejemploUso: 'Haz clic en el botón "Barras" sobre el gráfico para ver la comparativa en barras dobles por mes con su porcentaje de variación.'
      },
      changes: [
        'Línea Base Histórica SAR 2025: Curva histórica operativa continua para comparativas estables.',
        'Cálculo Homogéneo YoY: Comparación proporcional de meses transcurridos equivalentes.',
        'Selector Dual Líneas / Barras: Modo curva suave o barras dobles por mes con Recharts.',
        'Cinta Mensual de Variación: Indicadores de crecimiento interanual (% YoY) para cada uno de los 12 meses.',
        'Tarjetas Mensuales Mejoradas: Eliminación del "+100%" genérico y reemplazo por variación real YoY/MoM.'
      ]
    },
    {
      id: 'v5.3.8',
      version: 'v5.3.8',
      fecha: '22 de Agosto, 2026',
      badge: 'AUDITORÍA, INTEGRIDAD & RAE',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Auditoría Diaria/Mensual en Demanda, 10 Reglas de Integridad y Aporte de Antecedentes RAE',
      categoria: 'Integridad y Auditoría',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: '1) Auditoría de Demanda con soporte tanto para un mes completo como para un día específico con fecha exacta y botón de autocompletado en vivo desde MÉTRICO DB. 2) Nuevo panel de 10 Reglas Rigurosas de Calidad e Integridad de Datos con Score Porcentual Global (%). 3) Módulo de Aporte de Antecedentes y Cruce RAE para corroborar y justificar discrepancias con planillas Excel/CSV.',
      instructivo: {
        paraQueSirve: 'Permite auditar días o meses individuales, verificar el cumplimiento estricto de las 10 reglas de calidad de datos y aportar respaldos/antecedentes oficiales ante cualquier diferencia detectada con RAE.',
        quePuedesVer: 'En Demanda de Atención: el selector de Día o Mes con autocompletado y guardado seguro. En Registro y Auditoría: el Score de Integridad y la sub-pestaña "Aporte de Antecedentes & RAE" con cotejo automático.',
        ejemploUso: 'Si en RAE tienes 3,503 pacientes y MÉTRICO registra 3,500, ingresa al Aporte de Antecedentes, adjunta tu archivo de respaldo o anota el motivo (ej. caída de enlace) para corroborar la cifra oficial.'
      },
      changes: [
        'Auditoría por Día Específico: Selector de fecha YYYY-MM-DD y cálculo diario reactivo.',
        'Autocompletar Inteligente: Carga automática de los datos registrados en la base de datos de MÉTRICO.',
        'Guardado y Certificación Seguro: Persistencia de benchmarks diarios y mensuales en localStorage.',
        'Motor de 10 Reglas Rigurosas: Inspección de flujos, tiempos cronológicos, triage C1-C5/Z51.8, demografía y turnos SAR.',
        'Bitácora de Antecedentes RAE: Registro de ajustes, justificaciones, carga de planillas Excel/CSV y exportación consolidada.'
      ]
    },
    {
      id: 'v5.3.7',
      version: 'v5.3.7',
      fecha: '22 de Agosto, 2026',
      badge: 'AUTENTICACIÓN & FLUIDEZ',
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/20',
      title: 'Optimización de Reingreso tras Inactividad Prolongada (>15 min)',
      categoria: 'Autenticación',
      icon: Lock,
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      summary: 'Se solucionó el problema en el cual la pantalla de inicio de sesión se quedaba bloqueada al ingresar credenciales tras más de 15 minutos de inactividad. Ahora las marcas temporales se renuevan de inmediato, permitiendo un ingreso instantáneo al panel sin requerir refrescar con F5.',
      instructivo: {
        paraQueSirve: 'Permite reanudar el trabajo de inmediato tras haber estado ausente más de 15 minutos sin trabas ni recargas de página.',
        quePuedesVer: 'Al escribir tus credenciales y presionar "Iniciar Sesión", entrarás directamente al panel de control sin demoras.',
        ejemploUso: 'Si tu sesión se cerró por inactividad, ingresa tu clave normalmente y accederás de inmediato.'
      },
      changes: [
        'Pre-Renovación de Marcas Temporales: Inicialización de actividad previa a la llamada de Firebase Auth.',
        'Aislamiento de Login Fresco: Detección inteligente de inicio de sesión reciente para evitar cierres automáticos prematuros.',
        'Eliminación de Recargas: Ingreso directo sin necesidad de presionar F5.'
      ]
    },
    {
      id: 'v5.3.6',
      version: 'v5.3.6',
      fecha: '22 de Agosto, 2026',
      badge: 'ESTABILIDAD & ESTADO',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Corrección de Inicialización de Filtros en Estadísticas de Fractura',
      categoria: 'Traumatología',
      icon: Activity,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Se solucionó un problema de inicialización de variables de estado que impedía la renderización de la vista al cargar los filtros de género en Estadísticas de Fractura.',
      instructivo: {
        paraQueSirve: 'Garantiza la estabilidad continua y sin interrupciones del explorador de fracturas.',
        quePuedesVer: 'Acceso inmediato sin errores de carga a todas las herramientas de filtrado por sexo, edad y destino asistencial.',
        ejemploUso: 'Navega con normalidad entre los filtros de la barra superior.'
      },
      changes: [
        'Restauración de filtroSexo en el árbol de componentes.',
        'Verificación de estabilidad de renderizado.'
      ]
    },
    {
      id: 'v5.3.5',
      version: 'v5.3.5',
      fecha: '21 de Agosto, 2026',
      badge: 'TRAUMATOLOGÍA & EXPERIENCIA UI',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20',
      title: 'Independencia de Filtros: Desacoplamiento de Gráficos y Tabla de Diagnósticos',
      categoria: 'Traumatología',
      icon: Layers,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      summary: 'Se desacopló completamente el selector de columnas de edad de la tabla "Desglose de Diagnósticos y Cruce de Datos" respecto al gráfico de barras superior. Ahora, cambiar entre "Rangos Clínicos" y "Detallado 17 Tramos" en la tabla solo modifica las columnas inferiores, conservando intacto el gráfico de Incidencia por Rango Etario y Sexo.',
      instructivo: {
        paraQueSirve: 'Garantiza que puedas personalizar las columnas de la tabla de diagnósticos sin alterar la vista gráfica ni la distribución superior seleccionada.',
        quePuedesVer: 'El gráfico superior de "Incidencia de Fracturas por Rango Etario y Sexo" solo responderá al selector de "Distribución por Grupos Etarios", mientras que la tabla inferior cuenta con su propio selector independiente.',
        ejemploUso: 'Puedes ver el gráfico superior en modalidad "Grupos Clínicos (4 Tramos)" y al mismo tiempo desplegar la tabla inferior en "Detallado (17 Tramos 5 Años)" sin interferencias.'
      },
      changes: [
        'Aislamiento de Estado: modoVistaEdadGrafico y modoVistaEdadTabla operan de forma 100% independiente.',
        'Preservación Visual: El gráfico de barras superior no muta al cambiar las columnas de la tabla.',
        'Mayor Flexibilidad: Permite cruzar visualizaciones macro (clínicas) con datos tabulares micro (quinquenales) simultáneamente.'
      ]
    },
    {
      id: 'v5.3.4',
      version: 'v5.3.4',
      fecha: '21 de Agosto, 2026',
      badge: 'TRAUMATOLOGÍA & TOP 5 ETARIO',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Top 5 Tramos Etarios en Fracturas, Redirección por Clic e Iconografía Oficial',
      categoria: 'Traumatología',
      icon: Award,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se incorporó el Ranking Top 5 de Tramos Etarios con mayor incidencia de fracturas tanto en el módulo interactivo como en los Reportes Ejecutivos imprimibles. La tarjeta KPI "Mayor % Fracturas" ahora es interactiva y te lleva directo al detalle con un solo clic. Además, se reemplazaron todos los emoticones por íconos SVG vectoriales acordes a la identidad gráfica de MÉTRICO.',
      instructivo: {
        paraQueSirve: 'Permite visualizar de inmediato la lista ordenada de los 5 tramos etarios con mayor concentración de fracturas junto con su porcentaje de participación y desglose por género.',
        quePuedesVer: '1) Al hacer clic en la tarjeta "Mayor % Fracturas", la pantalla se desliza suavemente hacia el nuevo panel "Top 5 Tramos Etarios". 2) En el Reporte de Fracturas, los tramos se presentan en un ranking ordenado (#1 al #5) con sus porcentajes. 3) Toda la sección etaria cuenta ahora con íconos vectoriales modernos de alta resolución.',
        ejemploUso: 'Haz clic sobre la tarjeta "Mayor % Fracturas" para examinar de inmediato los tramos #1 a #5 y filtrar con un solo clic sobre cualquiera de ellos.'
      },
      changes: [
        'Ranking Top 5 Etario: Visualización de las 5 mayores incidencias de fractura con casos y porcentaje.',
        'Navegación Interactiva: Clic en tarjeta KPI para desplazarse suavemente al ranking etario.',
        'Reportes Ejecutivos Optimizados: Estructuración en tabla/ranking Top 5 para impresión y PDF.',
        'Identidad Visual Homologada: Sustitución de emojis informales por íconos SVG Lucide (Layers, BarChart3, Baby, UserCheck, Users, HeartPulse, Award).'
      ]
    },
    {
      id: 'v5.3.3',
      version: 'v5.3.3',
      fecha: '21 de Agosto, 2026',
      badge: 'TRAUMATOLOGÍA & GRUPOS ETARIOS',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Estadísticas de Fractura: Unificación de Empates y Clarificación de Grupos Etarios',
      categoria: 'Traumatología',
      icon: Users,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se unificó el cálculo del grupo etario predominante en el módulo de Estadísticas de Fractura y en los Reportes Ejecutivos, agregando soporte completo para empates múltiples (ej. 10-14 y 65-69 años con 2 casos c/u). Además, se clarificaron los selectores de edad distinguiendo los 4 Grandes Grupos Clínicos de los 17 Tramos Quinquenales (5 en 5 años).',
      instructivo: {
        paraQueSirve: 'Permite comprender sin ambigüedades qué tramo etario concentra la mayor incidencia de fracturas y elegir entre la vista clínica institucional o la vista epidemiológica detallada.',
        quePuedesVer: 'En "Estadísticas de Fractura", la tarjeta KPI y la narrativa muestran todos los tramos empatados en primer lugar. Además, dispones de un banner guía y botones claros para alternar entre "Grupos Clínicos" y "Desglose Quinquenal".',
        ejemploUso: 'Si en un período de 14 fracturas hay 2 casos en 10-14 años y 2 casos en 65-69 años, el sistema indicará con total transparencia "Tramos 10-14 y 65-69 años (2 casos c/u • 14.3% c/u)".'
      },
      changes: [
        'Soporte Multi-Empate: Detección armonizada de tramos etarios con igual número máximo de fracturas.',
        'Sincronización Total: Idénticos resultados en panel analítico, narrativa y reportes PDF.',
        'Clarificación de Selectores: Distinción intuitiva entre 4 Grupos Clínicos y 17 Tramos Quinquenales.'
      ]
    },
    {
      id: 'v5.3.2',
      version: 'v5.3.2',
      fecha: '21 de Agosto, 2026',
      badge: 'HORARIOS & ENCASILLAMIENTO',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Ajuste de Horarios: Fin de Semana Día (08:00-20:00) y Noche (20:00-08:00)',
      categoria: 'Esquemas de Turno',
      icon: Clock,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Se actualizó la ventana de encasillamiento asistencial para los turnos de fin de semana (sábados, domingos y festivos), fijando con total exactitud las franjas de Fin de Semana Día (08:00 a 20:00 hrs) y Fin de Semana Noche (20:00 a 08:00 hrs del día siguiente), eliminando desfases en el cómputo de admisiones.',
      instructivo: {
        paraQueSirve: 'Garantiza que los pacientes admitidos en fines de semana y festivos se asignen con 100% de rigor al equipo diurno o nocturno que realmente prestó la atención.',
        quePuedesVer: 'En el Informe de Arquitectura (Consolidado de Horarios) y en el Calendario Histórico, las ventanas operativas reflejan con exactitud los bloques de 12 horas (08:00-20:00 y 20:00-08:00).',
        ejemploUso: 'Un paciente ingresado un sábado a las 08:15 hrs computa al turno de día, y uno ingresado a las 20:05 hrs computa al turno de noche de ese mismo día.'
      },
      changes: [
        'Fin de Semana Día: Encasillamiento exacto de 08:00 a 20:00 hrs (12 horas).',
        'Fin de Semana Noche: Encasillamiento exacto de 20:00 a 08:00 AM (+1d, 12 horas).',
        'Consolidado Maestro: Documentación técnica actualizada en el Informe de Arquitectura.'
      ]
    },
    {
      id: 'v5.3.1',
      version: 'v5.3.1',
      fecha: '21 de Agosto, 2026',
      badge: 'ENFERMERÍA & CONSTATACIONES',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20',
      title: 'Rendimiento de Enfermería: Diferenciación C3 & Constatación de Lesiones',
      categoria: 'Rendimiento Clínico',
      icon: Activity,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      summary: 'Se homologó la clasificación multicriterio de Constatación de Lesiones (códigos Z51.8, Z04, Z65, Z02.7, Y84.8 y destinos a Carabineros, PDI, Comisaría o Fiscalía) en el panel de Rendimiento de Enfermería. Los casos médico-legales ahora se contabilizan con exactitud y se separan del Top 10 de diagnósticos clínicos C3.',
      instructivo: {
        paraQueSirve: 'Permite a las jefaturas de enfermería distinguir con precisión qué porcentaje de las atenciones C3 corresponden a procedimientos legales/policiales versus patologías médicas de urgencia.',
        quePuedesVer: 'En la sección "Diferenciación de Categoría C3", el recuento real de Constatación de Lesiones y el Top 10 de Diagnósticos Clínicos C3 100% depurado.',
        ejemploUso: 'Ingresa a "Análisis Específicos > Rendimiento Enfermería". En el apartado inferior verás la tarjeta de Constatación de Lesiones (Z51.8 / Policial) con sus cifras reales en lugar de ceros.'
      },
      changes: [
        'Criterios Completos: Inclusión de Z51.8, Z04, Z65, Z02.7, Y84.8 y destinos policiales.',
        'Depuración Top 10: Exclusión de trámites legales para reflejar patologías de urgencia puras.',
        'Normalización de Destinos: Clasificación automática de pacientes con custodia a Carabineros/PDI.'
      ]
    },
    {
      id: 'v5.3.0',
      version: 'v5.3.0',
      fecha: '21 de Agosto, 2026',
      badge: 'IA & CALIBRACIÓN CONTINUA',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Radar Predictivo: Calibración Continua & Efectos Climáticos Retardados',
      categoria: 'IA & Radar',
      icon: TrendingUp,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'El Radar Predictivo ahora detecta automáticamente el término de semana y genera el horizonte móvil para los próximos 7 días calendario continuos. Incorpora una nueva sección de Calibración Retrospectiva que audita las atenciones reales vs proyectadas de días pasados y modela efectos climáticos retardados (caída inicial por lluvia, rebote asistencial post-lluvia y heladas en la madrugada en esquemas de Turno Largo y Fin de Semana).',
      instructivo: {
        paraQueSirve: 'Anticipa la sobrecarga asistencial en urgencias para los próximos 7 días, adaptándose automáticamente según el día calendario, la precisión histórica y los eventos de lluvia y heladas.',
        quePuedesVer: 'La proyección de 7 días móviles, la tabla de calibración pasada (precisión 94%+), las 7 tarjetas climáticas diarias con etiquetas de rebote post-lluvia y el diagnóstico del Agente IA.',
        ejemploUso: 'Ingresa a "Radar Predictivo (IA)" en el menú lateral. Observa cómo el sistema proyecta los próximos 7 días desde el último cierre y revisa la tabla de Calibración Retrospectiva para ver cómo se ajustó el modelo.'
      },
      changes: [
        'Horizonte Móvil: Auto-detección del último cierre y proyección continua a 7 días calendario.',
        'Calibración Retrospectiva: Módulo visual con comparación de atenciones pasadas reales vs proyectadas.',
        'Retardo Meteorológico: Modelado de caída por lluvia (-15%), rebote post-lluvia (+28%) y helada post-humedad (+38%).',
        'Esquemas Operativos: Diferenciación entre Turno Largo de Semana y Fin de Semana Día/Noche.'
      ]
    },
    {
      id: 'v5.2.3',
      version: 'v5.2.3',
      fecha: '21 de Agosto, 2026',
      badge: 'ESTABILIDAD & TIPADO',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Blindaje de Funciones de Fechas & Protección Analítica',
      categoria: 'Estabilidad & Calidad',
      icon: CheckCircle,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se reforzó el procesamiento analítico y cálculo de récords anuales, blindando todas las funciones de descomposición de fechas (.split) contra valores nulos o no textuales, evitando el fallo TypeError e.split y garantizando una experiencia 100% libre de bloqueos.',
      instructivo: {
        paraQueSirve: 'Garantiza la estabilidad total de la analítica de turnos y métricas anuales ante cualquier combinación de fechas o datos cargados.',
        quePuedesVer: 'Métricas instantáneas de récords de turnos, comparativas de equipos y KPIs anuales sin interrupciones.',
        ejemploUso: 'Filtra libremente por cualquier rango o abre la vista de turnos; los cálculos se realizarán de manera instantánea y robusta.'
      },
      changes: [
        'Blindaje de Fechas: Conversión segura String(...) antes de operaciones split.',
        'Prevención de TypeError: Verificación exhaustiva en bucles de cálculo YTD y récords.',
        'Protección en Comparativa de Equipos y Calendario Histórico.'
      ]
    },
    {
      id: 'v5.2.2',
      version: 'v5.2.2',
      fecha: '21 de Agosto, 2026',
      badge: 'CORRECCIÓN CRÍTICA & ESTABILIDAD',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Corrección de Análisis Específicos & Auto-Selección de Turno',
      categoria: 'Módulos & Filtrado',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Se corrigió la referencia de pautas de turno que provocaba el bloqueo por ErrorBoundary al abrir Análisis Específicos o Calendario, permitiendo que todos los submódulos (Demanda, Altas, Fracturas, Enfermería, Constataciones y Traslados) se rellenen y sincronicen fluidamente con el último turno clínico completo cargado en los datos.',
      instructivo: {
        paraQueSirve: 'Garantiza que todos los análisis específicos se abran y calculen de inmediato sin bloqueos ni errores.',
        quePuedesVer: 'Navegación instantánea entre Demanda, Altas, Fracturas, Enfermería, Constataciones y Traslados con los datos del período seleccionado.',
        ejemploUso: 'Haz clic en cualquier opción de "Análisis Específicos" en la barra lateral o en las pestañas superiores para ver el desglose en tiempo real.'
      },
      changes: [
        'Corrección de ReferenceError: Inyección segura del hook de pautas en todos los componentes.',
        'Sincronización de Filtros: Auto-detección del último turno clínico completo y propagación a todas las vistas.',
        'Estabilidad Total: Desbloqueo de todos los submódulos asistenciales y epidemiológicos.'
      ]
    },
    {
      id: 'v5.2.1',
      version: 'v5.2.1',
      fecha: '21 de Agosto, 2026',
      badge: 'ESTABILIDAD & DEPURACIÓN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Depuración Integral de Consola & Robustecimiento de Gráficos',
      categoria: 'Estabilidad & Calidad',
      icon: CheckCircle,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Se limpiaron todas las advertencias del apartado de desarrollo: se eliminaron los logs repetitivos de depuración, se estabilizaron las dimensiones de renderizado en los gráficos Recharts (evitando alertas de tamaño) y se completaron los estándares W3C en todos los controles y filtros de la plataforma.',
      instructivo: {
        paraQueSirve: 'Mantiene una consola limpia de desarrollo, libre de advertencias y optimiza la estabilidad del renderizado de gráficos.',
        quePuedesVer: 'Gráficos fluidos que cargan sin advertencias de dimensiones y formularios con soporte de accesibilidad total.',
        ejemploUso: 'Navega por cualquier gráfico o filtro; la consola del navegador permanecerá 100% limpia y sin alertas.'
      },
      changes: [
        'Gráficos Recharts: Eliminación de advertencias de dimensión width/height con minWidth={0} y minHeight={0}.',
        'Consola Limpia: Eliminación de logs DEBUG_YTD y supresión de fallbacks ruidosos.',
        'Accesibilidad W3C: Atributos id, name y aria-label añadidos a todos los selectores y pickers de filtros.'
      ]
    },
    {
      id: 'v5.2.0',
      version: 'v5.2.0',
      fecha: '21 de Agosto, 2026',
      badge: 'RENDIMIENTO & AUTENTICACIÓN',
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/20',
      title: 'Aceleración del Inicio de Sesión & Precarga Instantánea (<300ms)',
      categoria: 'Rendimiento & Acceso',
      icon: Zap,
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      summary: 'Se optimizó a fondo la arquitectura de autenticación y carga: se desacoplaron las peticiones de base de datos no críticas a segundo plano y se aceleró la lectura paralela de caché IndexedDB, permitiendo que el inicio de sesión sea instantáneo y fluido sin tiempos muertos.',
      instructivo: {
        paraQueSirve: 'Permite un ingreso inmediato a la plataforma con mínima latencia y autorrellenado optimizado.',
        quePuedesVer: 'Respuesta inmediata al pulsar "Ingresar" con indicador visual de progreso y apertura directa del panel.',
        ejemploUso: 'Ingresa tu correo y contraseña para experimentar la transición ultra-rápida al panel de control.'
      },
      changes: [
        'Login Ultra-Rápido: Eliminación de esperas asíncronas bloqueantes en el flujo de Firebase Auth.',
        'Precarga Concurrente: Lectura de caché IndexedDB en paralelo (<15ms).',
        'Estándares W3C: Soporte de autocompletado nativo y accesibilidad completa en el formulario de acceso.'
      ]
    },
    {
      id: 'v5.1.9',
      version: 'v5.1.9',
      fecha: '19 de Agosto, 2026',
      badge: 'EPIDEMIOLOGÍA & FRACTURAS',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20',
      title: 'Rediseño Dual de Grupos Etarios en Estadísticas de Fracturas',
      categoria: 'Epidemiología & Lesiones',
      icon: Activity,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      summary: 'Se rediseñó por completo el análisis de edad en el módulo de fracturas: ahora puedes alternar limpiamente entre la Vista Clínica (4 Tramos Institucionales: Pediatría 0-14, Jóvenes 15-29, Adultos 30-59 y Adultos Mayores 60+) y el Desglose Quinquenal (17 Tramos de 5 años), eliminando la confusión visual previa y sincronizando el texto narrativo al 100% con los datos en pantalla.',
      instructivo: {
        paraQueSirve: 'Facilita la lectura epidemiológica rápida de lesiones óseas según el ciclo vital clínico o tramos quinquenales detallados.',
        quePuedesVer: 'Tarjetas interactivas de grupos clínicos con casos, porcentaje y distribución por sexo, más un toggle para alternar al desglose quinquenal de 17 tramos.',
        ejemploUso: 'Haz clic en "🧒 Grupos Clínicos (4 Tramos)" para ver la visión general o en "📊 Desglose Quinquenal" para ver el detalle de 5 en 5 años.'
      },
      changes: [
        'Toggle Segmentado: Alterna entre Grupos Clínicos (4 tramos) y Desglose Quinquenal (17 tramos).',
        'Tarjetas Clínicas: Pediatría, Jóvenes, Adultos y Adultos Mayores con desglose F/M y porcentaje.',
        'Sincronización Total: El resumen narrativo cita exactamente el tramo etario y casos de la pantalla.'
      ]
    },
    {
      id: 'v5.1.8',
      version: 'v5.1.8',
      fecha: '18 de Agosto, 2026',
      badge: 'INTEGRIDAD DE DATOS & AUDITORÍA',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20',
      title: 'Homologación de Altas Administrativas (Período y Anual)',
      categoria: 'Auditoría & Egresos',
      icon: UserCheck,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      summary: 'Se unificaron las fuentes de cálculo de Altas Administrativas en toda la plataforma: tanto el Panel Inicial como el Análisis Específico de Altas ahora procesan con la regla clínica isAltaAdmin, garantizando el cuadre exacto de 137 altas en el período seleccionado (01/08 - 16/08) y 2,166 altas en el acumulado anual YTD.',
      instructivo: {
        paraQueSirve: 'Garantiza total coherencia y concordancia matemática entre los KPIs generales de la portada y los desgloses analíticos pormenorizados.',
        quePuedesVer: 'Las cifras de Altas Administrativas del período y anuales coinciden exactamente en el Panel Inicial y en la pestaña de Análisis de Altas.',
        ejemploUso: 'Compara la tarjeta de Altas Administrativas de la página principal con el módulo específico de Altas para confirmar el cuadre perfecto.'
      },
      changes: [
        'Cuadre de Periodo: 137 altas administrativas homologadas en Panel Inicial y Análisis Específico.',
        'Cuadre Anual YTD: 2,166 altas acumuladas calculadas con la regla clínica estándar.',
        'Desglose por Equipos: Distribución exacta de altas por turno y por día.'
      ]
    },
    {
      id: 'v5.1.7',
      version: 'v5.1.7',
      fecha: '18 de Agosto, 2026',
      badge: 'ANALÍTICA DE DEMANDA & FLUJOS',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20',
      title: 'Promedio Diario Real y Cuadre de Bloques en Curva de Demanda',
      categoria: 'Demanda & Flujos',
      icon: Zap,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      summary: '1) Se corrigió el cálculo del promedio de admisiones considerando los días reales del filtro seleccionado (pac./día y pac./hr). 2) Se resolvió la agrupación horaria permitiendo que el Bloque Más Congestionado refleje con exactitud la distribución real entre Mañana (08:00-13:59), Tarde (14:00-19:59) y Noche (20:00-07:59).',
      instructivo: {
        paraQueSirve: 'Proporciona una comprensión fidedigna de la demanda asistencial diaria y horaria sin distorsiones por rangos acumulativos.',
        quePuedesVer: 'El promedio diario de pacientes que ingresan al SAR y el porcentaje exacto de demanda concentrado en cada franja horaria.',
        ejemploUso: 'Filtra del 1 al 17 de agosto en la Curva de Demanda para ver el promedio diario real y el bloque más congestionado con su porcentaje.'
      },
      changes: [
        'Promedio Diario Real: Cálculo normalizado por el número de días del período seleccionado.',
        'Bloque Horario Preciso: Extracción estricta de horas para clasificar Mañana, Tarde y Noche.',
        'Claridad en Tarjetas: Indicador de días evaluados y desglose hora/día.'
      ]
    },
    {
      id: 'v5.1.6',
      version: 'v5.1.6',
      fecha: '18 de Agosto, 2026',
      badge: 'AUDITORÍA & TIEMPOS DE ESPERA',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20',
      title: 'Ajuste de Leyenda de Metas en Tiempos de Espera por Triaje',
      categoria: 'Métricas & Triaje',
      icon: Clock,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      summary: 'Se retiró la leyenda inferior de metas fijas (verde/amarillo/rojo) en la tabla de Tiempos de Espera y Estadía por Triaje, manteniendo la precisión analítica de los minutos reales por tramo asistencial a la espera de la parametrización normativa MINSAL.',
      instructivo: {
        paraQueSirve: 'Permite una lectura más limpia y libre de asunciones normativas rígidas en el flujo asistencial de urgencia.',
        quePuedesVer: 'La tabla de tiempos de espera con el promedio en minutos de cada etapa de atención de forma directa y clara.',
        ejemploUso: 'Revisa la tabla de Tiempos de Espera y Estadía por Triaje en el panel inicial para observar los tiempos por categoría C1-C5.'
      },
      changes: [
        'Remoción de Leyenda Fija: Eliminación del cuadro inferior de metas verde/amarillo/rojo.',
        'Lectura Limpia: Enfoque 100% en las cifras reales de minutos de espera y estadía.',
        'Preparación Normativa: Base lista para parametrizar metas según criterios MINSAL.'
      ]
    },
    {
      id: 'v5.1.5',
      version: 'v5.1.5',
      fecha: '18 de Agosto, 2026',
      badge: 'ACCESO & EXPERIENCIA INMERSIVA',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Fondo Animado Clínico Asimétrico en Inicio de Sesión',
      categoria: 'Autenticación & Diseño',
      icon: Activity,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se integró el fondo animado interactivo (con la constelación asimétrica de Nube, Base de Datos, Gateway y ondas ECG) directamente en la pantalla de Inicio de Sesión (Login), brindando continuidad visual desde el primer segundo de interacción.',
      instructivo: {
        paraQueSirve: 'Garantiza que la experiencia visual sea inmersiva y moderna desde el acceso inicial con credenciales hasta el panel operativo.',
        quePuedesVer: 'La constelación animada de datos clínicos fluyendo en el fondo de la pantalla de Login con acabado glassmorphic.',
        ejemploUso: 'Abre la plataforma o cierra sesión para apreciar la animación completa en la pantalla de bienvenida.'
      },
      changes: [
        'Fondo Animado en Login: Integración directa de FondoClinicoAnimado en la pantalla de acceso.',
        'Tarjeta Glassmorphic: Sombreado perimetral y bordes suaves en la tarjeta de autenticación.',
        'Continuidad Total: Transición fluida entre Login, Pantalla de Carga y Dashboard.'
      ]
    },
    {
      id: 'v5.1.4',
      version: 'v5.1.4',
      fecha: '18 de Agosto, 2026',
      badge: 'DISEÑO ASIMÉTRICO DINÁMICO',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Constelación Asimétrica y Orgánica de Telemetría Clínica',
      categoria: 'Diseño & Cinemática',
      icon: Cpu,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Se rediseñó la animación de fondo en un esquema tri-nodal asimétrico: Nube (Cloud Core) en la parte superior izquierda, Base de Datos en el sector medio-derecho y Gateway Clínico en el sector inferior izquierdo, interconectados por curvas fluidas Bezier y doble onda ECG desfasada.',
      instructivo: {
        paraQueSirve: 'Brinda una estética cinemática, orgánica y asimétrica que llena el espacio del monitor de forma armónica sin rigidez geométrica.',
        quePuedesVer: 'Tres nodos activos de telemetría interconectados por haces de datos que envuelven la pantalla con un ritmo visual balanceado.',
        ejemploUso: 'Inicia sesión o recarga la plataforma para apreciar la nueva distribución asimétrica en tiempo real.'
      },
      changes: [
        'Esquema Tri-Nodal Asimétrico: Nube, Servidor Local y Gateway Clínico distribuidos orgánicamente.',
        'Curvas Bezier Fluidas: Eliminación de líneas rígidas en favor de un flujo vectorial envolvente.',
        'Doble Nivel ECG: Dos ondas cardiacas desfasadas que aportan profundidad de campo.'
      ]
    },
    {
      id: 'v5.1.3',
      version: 'v5.1.3',
      fecha: '18 de Agosto, 2026',
      badge: 'RED & SINCRONIZACIÓN NUBE',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Arquitectura Animada Nube-Base de Datos en Pantalla de Carga',
      categoria: 'Diseño & Telemetría',
      icon: Cloud,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se dio máximo protagonismo visual al fondo integrando los nodos interactivos de Nube (Cloud Core) y Base de Datos (Servidor Local SAR) interconectados por cables de flujo de paquetes luminosos en tiempo real, junto con un trazado ECG de alta intensidad.',
      instructivo: {
        paraQueSirve: 'Brinda una visualización inmersiva de la arquitectura de sincronización de datos clínicos entre el servidor local y la nube de MÉTRICO.',
        quePuedesVer: 'El icono de la nube a la izquierda y el de la base de datos a la derecha con haces de luz en movimiento continuo y ondas cardiacas luminosas.',
        ejemploUso: 'Observa la pantalla de carga tras iniciar sesión para apreciar la animación completa de conexión de datos.'
      },
      changes: [
        'Nodo Nube & Base de Datos: Representación gráfica de la arquitectura cliente-servidor.',
        'Cables de Flujo de Datos: Líneas de transmisión con paquetes animados en tiempo real.',
        'Ondas ECG de Alto Brillo: Mayor contraste y realce estético en toda la pantalla.'
      ]
    },
    {
      id: 'v5.1.2',
      version: 'v5.1.2',
      fecha: '18 de Agosto, 2026',
      badge: 'ANIMACIÓN CLÍNICA & COLOR',
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/20',
      title: 'Fondo Animado ECG y Unificación Cromática en Sincronización',
      categoria: 'Diseño & Experiencia de Usuario',
      icon: Activity,
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      summary: '1) Se incorporó una animación de fondo con ondas de electrocardiograma (ECG) y pulsos de luz bio-ambiental sincronizados con la telemetría clínica del sistema. 2) Se unificó totalmente la paleta de colores entre la carga inicial y los modales de sincronización, eliminando gradientes discordantes y estandarizando sobre la paleta oficial (Indigo 600 - Sky 400).',
      instructivo: {
        paraQueSirve: 'Otorga una experiencia visual de nivel superior, clínica, moderna y con perfecta coherencia de color en toda la plataforma.',
        quePuedesVer: 'Ondas dinámicas de pulso cardiaco en el fondo tras el login y una interfaz de sincronización armónica sin saltos de color.',
        ejemploUso: 'Al ingresar al sistema o pulsar "Sincronizar", verás las animaciones y barras de progreso con la paleta armónica corporativa.'
      },
      changes: [
        'Fondo Animado ECG: Trazado vectorial de electrocardiograma con brillo dinámico.',
        'Unificación Cromática: Gradiente oficial Indigo/Sky en todas las barras de avance.',
        'Eliminación de Saltos Visuales: Cohesión total en modales, spinners y alertas.'
      ]
    },
    {
      id: 'v5.1.1',
      version: 'v5.1.1',
      fecha: '18 de Agosto, 2026',
      badge: 'IDENTIDAD VISUAL & ACCESO',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20',
      title: 'Iconografía Vectorial en Mensaje de Sesión Caducada',
      categoria: 'Autenticación & UX',
      icon: Lock,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      summary: 'Se homologó la tarjeta de aviso de sesión caducada por inactividad en el módulo de Login, sustituyendo emojis nativos por el icono vectorial Lock en un micro-contenedor estético y tipografía estructurada acorde a la identidad visual de MÉTRICO.',
      instructivo: {
        paraQueSirve: 'Brinda una experiencia de usuario limpia y profesional al retornar a la pantalla de inicio de sesión cuando expira la sesión por inactividad (>15 min).',
        quePuedesVer: 'Una tarjeta de advertencia elegante con icono vectorial de candado, bordes suaves y mensaje jerarquizado.',
        ejemploUso: 'Al cerrar sesión o tras 15 minutos sin interacción, la pantalla de Login muestra la tarjeta homogénea de seguridad.'
      },
      changes: [
        'Icono Vectorial Lock: Reemplazo de emojis por el estilo gráfico oficial del sitio.',
        'Tarjeta de Alerta Estilizada: Contenedor con bordes y contraste armónico.',
        'Coherencia Visual: Integración total con los tokens de diseño de la plataforma.'
      ]
    },
    {
      id: 'v5.1.0',
      version: 'v5.1.0',
      fecha: '18 de Agosto, 2026',
      badge: 'FESTIVOS 24H Y SALIDA MATINAL',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Régimen Festivo (24h) y Asignación Matinal al Turno de Salida',
      categoria: 'Pauta & Horarios Asistenciales',
      icon: Clock,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: '1) Si marcas un día de semana como Festivo en la pauta, el sistema activa automáticamente el régimen de 24 horas y asigna a los dos equipos (Día 08-20h y Noche 20-08h). 2) En días hábiles normales, los pacientes de madrugada y mañana (ej: 07:00 a 10:00 AM) se computan al Turno Largo del día anterior que va entregando la guardia a las 08:00 AM, mientras que a partir de las 16:00/17:00 hrs se asocian al nuevo turno de la tarde.',
      instructivo: {
        paraQueSirve: 'Garantiza que la clasificación de pacientes respete fielmente el funcionamiento clínico del SAR tanto en días festivos de 24 horas como en la entrega matinal de guardia.',
        quePuedesVer: 'Mapeo exacto por tramo horario en Comparativa de Equipos, Demanda y Rendimiento Turnos.',
        ejemploUso: 'Marca un día como "Festivo" en Pautas de Turnos y verás cómo sus atenciones se dividen de inmediato en los dos turnos de 12 horas.'
      },
      changes: [
        'Detección Automática de Festivos 24h: Mapeo de día (08-20h) y noche (20-08h) en feriados.',
        'Asignación Matinal al Turno de Salida: Pacientes de la mañana quedan asociados al turno que operó la noche anterior.',
        'Compatibilidad Total: Sincronización continua entre Pautas, Demanda y KPIs.'
      ]
    },
    {
      id: 'v5.0.9',
      version: 'v5.0.9',
      fecha: '18 de Agosto, 2026',
      badge: 'AJUSTE DE PAUTA Y FIX',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Alineación a los 3 Equipos Reales de Pauta y Corrección en Histórico Mensual',
      categoria: 'Turnos & Auditoría',
      icon: Users,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: '1) Se unificó el cálculo de Altas Administrativas (isAltaAdmin) para que coincida exactamente con las cifras del panel global. 2) Se restringió la asignación exclusivamente a los 3 equipos activos de la pauta (Turno 1, 2 y 3), descartando el Turno 4 que no existe en el servicio. 3) Se subsanó el error al abrir el Histórico Mensual.',
      instructivo: {
        paraQueSirve: 'Garantiza que la vista de Comparativa de Equipos muestre únicamente los 3 turnos reales y que el Histórico Mensual cargue de forma instantánea sin errores.',
        quePuedesVer: '3 tarjetas de equipo (Turno 1, Turno 2, Turno 3) con sus altas administrativas y el calendario histórico totalmente funcional.',
        ejemploUso: 'Haz clic en "Histórico Mensual" para revisar el calendario interactivo o en Inicio para ver los 3 equipos cuadrando al 100%.'
      },
      changes: [
        'isAltaAdmin Unificado: El número de altas administrativas coincide con la totalidad clínica.',
        'Pauta de 3 Turnos: Se elimina el Turno 4 inexistente y se reasignan las jornadas diurnas.',
        'Fix Histórico Mensual: Corregido el paso de props en CalendarioHistorico.jsx.'
      ]
    },
    {
      id: 'v5.0.8',
      version: 'v5.0.8',
      fecha: '18 de Agosto, 2026',
      badge: 'SINCRONIZACIÓN PAUTA',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Prioridad Absoluta a la Pauta Mensual de Turnos Programada',
      categoria: 'Pauta de Turnos & Equipos',
      icon: Calendar,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se estableció la Pauta Mensual de Turnos configurada en el sistema como la primera fuente de verdad (Prioridad 1). Todos los turnos programados en el calendario mensual (ej. Agosto 2026) se sincronizan de inmediato con la Comparativa de Equipos, el Calendario Histórico y los reportes asistenciales.',
      instructivo: {
        paraQueSirve: 'Permite que cualquier horario o equipo rotativo asignado en el calendario de Pautas mande directamente sobre los cálculos analíticos.',
        quePuedesVer: 'La distribución de pacientes por Turno 1, 2, 3 y 4 en la Comparativa de Equipos reflejando con exactitud la pauta programada en pantalla.',
        ejemploUso: 'Guarda o modifica cualquier día en el módulo "Pauta de Turnos" y verás la actualización instantánea en la Comparativa de Equipos.'
      },
      changes: [
        'Prioridad #1 a pautasDB: La pauta guardada en Firestore rige de forma soberana.',
        'Mapeo Horario Universal: Soporte para 17:00-08:00, 08:00-20:00 y 20:00-08:00.',
        'Actualización Reactiva: Los cambios se propagan a todo el sistema sin recargar.'
      ]
    },
    {
      id: 'v5.0.7',
      version: 'v5.0.7',
      fecha: '18 de Agosto, 2026',
      badge: 'ROTATIVA Y CUADRE EXACTO',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Resolución Automática de Equipos Rotativos y Cuadre Matemático de Cifras',
      categoria: 'Turnos & Comparativa',
      icon: Users,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Se integró el nuevo motor determinista de asignación continua de turnos (Turno 1, 2, 3 y 4) sincronizado con las pautas de Firestore y el ciclo rotativo oficial. Se eliminó la bolsa de "Sin Asignar" y se cuadraron matemáticamente el 100% de los 1,747 admitidos, 1,610 atendidos y 137 altas administrativas tanto en la Comparativa de Equipos como en el Histórico Mensual.',
      instructivo: {
        paraQueSirve: 'Garantiza que cada paciente y turno esté siempre asociado a su equipo rotativo real y que las cifras sumen exactamente igual a los KPIs generales del período.',
        quePuedesVer: 'La sección "Comparativa de Equipos (Turnos)" desglosa con exactitud los 4 equipos con sus pacientes admitidos, atenciones efectivas, altas administrativas y rendimientos.',
        ejemploUso: 'Selecciona cualquier rango de fechas (ej: 01/08 al 16/08) y observa la distribución perfecta en los 4 equipos de trabajo.'
      },
      changes: [
        'Motor Universal de Rotativa: resolverEquipoTurno evalúa pautas manuales, registros de BD y la rotativa de 4 equipos.',
        'Cuadre Asistencial 100%: Los 1,747 admitidos y 1,610 atendidos se distribuyen sin pérdidas en los 4 turnos.',
        'Sincronización Histórico Mensual: El calendario mensual y la tabla de últimos turnos reflejan los equipos correspondientes.'
      ]
    },
    {
      id: 'v5.0.6',
      version: 'v5.0.6',
      fecha: '18 de Agosto, 2026',
      badge: 'ESTÉTICA VECTORIAL',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Homologación Estética con Iconos Vectoriales en Selector de Granularidad',
      categoria: 'Identidad Visual & UI',
      icon: Clock,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se reemplazaron los emojis temporales por iconos vectoriales SVG de alta definición (Clock y Calendar de Lucide) en el selector de la pestaña Tiempos de Atención, alineando su apariencia, sombras y microinteracciones con el manual de identidad visual de MÉTRICO.',
      instructivo: {
        paraQueSirve: 'Brinda una experiencia visual homogénea, limpia y profesional acorde al estándar de diseño del sitio.',
        quePuedesVer: 'Botones estilizados con iconos vectoriales de reloj y calendario en la cabecera de filtros de tiempos.',
        ejemploUso: 'Revisa la pestaña "Tiempos de Atención" para ver los nuevos selectores con diseño uniforme.'
      },
      changes: [
        'Iconos Vectoriales Lucide: Integración de Clock y Calendar SVG.',
        'Paleta Armonizada: Fondos y contrastes sincronizados con el tema visual.',
        'Interacciones Fluidas: Efectos hover y sombras suaves para máxima legibilidad.'
      ]
    },
    {
      id: 'v5.0.5',
      version: 'v5.0.5',
      fecha: '18 de Agosto, 2026',
      badge: 'ANÁLISIS POR HORA',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Curva Horaria Asistencial de Tiempos de Espera y Estadía (00:00 a 23:00)',
      categoria: 'Tiempos Asistenciales',
      icon: BarChart2,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'La pestaña "Tiempos de Atención" ahora incluye un selector interactivo que te permite visualizar la curva horaria de tiempos promedio (en minutos) de 00:00 a 23:00 para Espera Médico, Espera Triaje, Tiempo Box y Estadía Total, permitiendo detectar con exactitud a qué horas del día se producen los picos de saturación.',
      instructivo: {
        paraQueSirve: 'Permite analizar los tiempos asistenciales distribuidos a lo largo de las 24 horas del día o por la evolución diaria tradicional.',
        quePuedesVer: 'La curva de minutos por hora (00:00 a 23:00) y un selector para alternar entre "Por Hora del Día" y "Por Fecha / Turno".',
        ejemploUso: 'Haz clic en la pestaña "Tiempos de Atención" y presiona "⏱️ Por Hora del Día" para ver el comportamiento horario.'
      },
      changes: [
        'Curva Horaria 00:00 a 23:00: Agregación de tiempos asistenciales promedio por tramo horario.',
        'Selector de Granularidad: Botones interactivos "⏱️ Por Hora del Día" y "📅 Por Fecha / Turno".',
        'Desglose Completo: Espera Médico, Espera Triaje, Tiempo Box y Estadía Total en minutos.'
      ]
    },
    {
      id: 'v5.0.4',
      version: 'v5.0.4',
      fecha: '18 de Agosto, 2026',
      badge: 'VISUALIZACIÓN TOTAL',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Visualización Continua de Triajes C1-C5 en Períodos Cortos y Resalte Centrado en Buscador',
      categoria: 'Gráficos & Búsqueda Focal',
      icon: Activity,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Se ha optimizado la agregación de datos del Gráfico Dinámico para que, al filtrar por un solo día o turno específico (ej: Finde Día), las barras apiladas de triaje C1 a C5 y la distribución global se muestren siempre completas y visibles con soporte de puntos y barras sólidas. Además, el Buscador Global ahora centra la sección exactamente en tu pantalla y la resalta con un halo luminoso índigo y animación de pulso.',
      instructivo: {
        paraQueSirve: 'Garantiza que siempre veas las barras de categorización y que el buscador te sitúe de forma inconfundible frente a la tarjeta solicitada.',
        quePuedesVer: 'Las barras y porcentajes de triaje se muestran claramente incluso con 1 solo turno filtrado, y al buscar una sección, esta se ilumina con un halo violeta.',
        ejemploUso: 'Filtra por un turno de fin de semana o busca "taxo" para ver la visualización completa y el resalte centrado.'
      },
      changes: [
        'Agregación Cruzada de Pacientes: Extracción automática de C1-C5, Altas y Demografía si los turnos no tienen desglose.',
        'Soporte de Períodos Unitarios: Barras sólidas y dots en curvas para rangos de 1 día/turno.',
        'Resalte Luminoso Centrado: Outline brillante de 4px, halo de 35px y pulso animado al redirigir desde el buscador.'
      ]
    },
    {
      id: 'v5.0.3',
      version: 'v5.0.3',
      fecha: '18 de Agosto, 2026',
      badge: 'HOMOLOGACIÓN VISUAL',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Rótulo Unificado "Análisis Taxonómico y de Tendencias" en el Gráfico Dinámico',
      categoria: 'Diseño & Claridad Asistencial',
      icon: BarChart2,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'El gráfico dinámico de la pestaña Inicio ha sido rotulado oficialmente como "Análisis Taxonómico y de Tendencias" con un distintivo badge de Gráfico Dinámico, asegurando una correspondencia directa entre los resultados del buscador y la tarjeta visual en pantalla.',
      instructivo: {
        paraQueSirve: 'Permite identificar de inmediato la sección al navegar o hacer clic desde la barra de búsqueda.',
        quePuedesVer: 'El encabezado de la tarjeta muestra claramente "Análisis Taxonómico y de Tendencias" junto al badge "Gráfico Dinámico".',
        ejemploUso: 'Revisa la sección principal de gráficos en la pestaña Inicio.'
      },
      changes: [
        'Unificación de Título: "Análisis Taxonómico y de Tendencias" en la cabecera del componente.',
        'Badge de Tipo de Visualización: Distintivo "Gráfico Dinámico" en púrpura sutil.',
        'Subtítulo Explicativo: Detalle de series temporales, categorización C1-C5 y tiempos de espera.'
      ]
    },
    {
      id: 'v5.0.2',
      version: 'v5.0.2',
      fecha: '18 de Agosto, 2026',
      badge: 'DESPLAZAMIENTO NATIVO',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Sincronización Focal del Desplazamiento en el Contenedor Principal',
      categoria: 'Navegación & Interfaz',
      icon: ExternalLink,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se ha corregido el mecanismo de scroll para operar directamente sobre el contenedor con barra de desplazamiento interna del panel. Al hacer clic en "Análisis Taxonómico y de Tendencias" o en cualquier sección, el panel realiza un viaje suave exacto hacia la posición del gráfico o tabla y lo destaca con un halo iluminado.',
      instructivo: {
        paraQueSirve: 'Garantiza que la pantalla se mueva inmediatamente a la posición exacta del gráfico o tabla seleccionada.',
        quePuedesVer: 'Al hacer clic en el resultado del buscador, verás el desplazamiento continuo hacia el gráfico dinámico.',
        ejemploUso: 'Busca "taxo" o "demanda", selecciona el resultado y observa el desplazamiento focal directo.'
      },
      changes: [
        'Scroll Relativo al Viewport Principal: Manejo del overflow del contenedor principal.',
        'Compensación de Barra de Filtros: Espaciado automático de 85px para visibilidad óptima.',
        'Reintento de Renderizado: Sincronización precisa si se cambia desde otra pestaña.'
      ]
    },
    {
      id: 'v5.0.1',
      version: 'v5.0.1',
      fecha: '18 de Agosto, 2026',
      badge: 'REDIRECCIÓN FOCAL',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Redirección Focal Directa y Desplazamiento Inteligente con Resalte Visual',
      categoria: 'Búsqueda & Navegación',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Al hacer clic en cualquier resultado de la barra de búsqueda (ej: "Análisis Taxonómico y de Tendencias", "Sociodemográfico", "Altas", "Tiempos"), el sistema ahora te redirige de inmediato a la sección exacta con desplazamiento suave y un resalte luminoso temporal para indicarte con total claridad el elemento solicitado.',
      instructivo: {
        paraQueSirve: 'Te sitúa automáticamente frente al gráfico, tabla o módulo que buscaste, sin importar en qué vista te encuentres.',
        quePuedesVer: 'Al hacer clic en un resultado, la página se desplaza fluidamente hacia el gráfico o tabla seleccionada y se ilumina brevemente.',
        ejemploUso: 'Busca "taxo" o "demanda", haz clic en el resultado y verás cómo el navegador viaja directamente al gráfico dinámico.'
      },
      changes: [
        'Desplazamiento Suave (scrollIntoView): Conduce directo al gráfico o tabla objetivo.',
        'Resalte Luminoso de Enfoque: Anillo temporal índigo alrededor de la sección seleccionada.',
        'Soporte Omnidireccional: Funciona desde cualquier módulo o pestaña del sistema.'
      ]
    },
    {
      id: 'v5.0.0',
      version: 'v5.0.0',
      fecha: '18 de Agosto, 2026',
      badge: 'BÚSQUEDA INTELIGENTE',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Motor de Búsqueda Exhaustivo con Normalización de Acentos y Frases Compuestas',
      categoria: 'Búsqueda & Navegación Global',
      icon: Search,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se ha potenciado el motor del Buscador Global (Command Palette) con un algoritmo de normalización diacrítica que elimina diferencias por tildes o mayúsculas. Ahora puedes buscar términos como "taxonómico", "taxonomico", "tendencias", "curva de demanda", "sociodemográfico", "médicos", "mapa" o frases compuestas, encontrando al instante el módulo y sus métricas en vivo.',
      instructivo: {
        paraQueSirve: 'Encuentra cualquier reporte, gráfico o análisis escribiendo palabras clave con o sin tildes, en singular o plural.',
        quePuedesVer: 'Escribe "taxonómico", "tendencias", "sociodemográfico", "fracturas", "pautas" o cualquier término clínico para ver el acceso directo y su resumen numérico.',
        ejemploUso: 'Ejemplo: Escribe "taxonómico" o "analisis taxonomico" para acceder directamente al gráfico dinámico de tendencias y series temporales.'
      },
      changes: [
        'Normalización Diacrítica Total: Búsquedas insensibles a tildes (á, é, í, ó, ú, ñ).',
        'Indexación Integral de Secciones: Inclusión de Análisis Taxonómico, Demografía, Mapa, Curvas de Demanda, etc.',
        'Emparejamiento Multitoken: Soporte para frases con múltiples palabras en cualquier orden.'
      ]
    },
    {
      id: 'v4.9.9',
      version: 'v4.9.9',
      fecha: '18 de Agosto, 2026',
      badge: 'AUDIO FEEDBACK',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Retroalimentación Auditiva para Inicio y Cierre de Sesión',
      categoria: 'Audio & Experiencia de Usuario',
      icon: Volume2,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se han incorporado chimes armónicos suaves generados en tiempo real para el inicio y cierre de sesión. Al autenticarte exitosamente, el sistema reproduce un acorde ascendente de bienvenida (Do Mayor), y al cerrar sesión o expirar el tiempo de inactividad, se emite un tono suave de desconexión segura.',
      instructivo: {
        paraQueSirve: 'Brinda confirmación acústica inmediata y elegante de tus operaciones de acceso y desconexión.',
        quePuedesVer: 'Escucha el tono armónico al ingresar tus credenciales y al accionar el botón de cerrar sesión.',
        ejemploUso: 'Inicia sesión o haz clic en Cerrar Sesión para escuchar la respuesta sonora.'
      },
      changes: [
        'Sonido de Bienvenida (Login): Acorde armónico ascendente C5-E5-G5-C6.',
        'Sonido de Desconexión Segura (Logout): Tono descendente suave D5-A4-E4.',
        'Síntesis Nativa Web Audio API: 100% libre de archivos pesados y con cero latencia de reproducción.'
      ]
    },
    {
      id: 'v4.9.8',
      version: 'v4.9.8',
      fecha: '18 de Agosto, 2026',
      badge: 'VELOCIDAD DE ACCESO',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Optimización y Aceleración Instantánea del Inicio de Sesión',
      categoria: 'Rendimiento & Acceso',
      icon: CheckCircle,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Se ha optimizado el flujo de autenticación eliminando las peticiones erróneas a los servidores de verificación de reCAPTCHA. El ingreso al sistema y la validación de credenciales ahora se completan de forma instantánea (< 100 ms) sin esperas ni bloqueos en el botón de inicio de sesión.',
      instructivo: {
        paraQueSirve: 'Garantiza un acceso ágil y sin tiempos muertos al escribir tus credenciales.',
        quePuedesVer: 'Al ingresar tu correo y contraseña, el paso al panel principal es inmediato.',
        ejemploUso: 'Escribe tu usuario y contraseña institucional para acceder de forma instantánea.'
      },
      changes: [
        'Eliminación de Sondas de Red Bloqueantes: Supresión de peticiones reCAPTCHA fallidas en segundo plano.',
        'Autenticación Inmediata: Reducción del tiempo de respuesta a milisegundos.',
        'Consola Limpia: Eliminación de advertencias y errores de AppCheck en el navegador.'
      ]
    },
    {
      id: 'v4.9.7',
      version: 'v4.9.7',
      fecha: '18 de Agosto, 2026',
      badge: 'ALTO CONTRASTE',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Diseño Luminoso de Alto Contraste y Botones de Cierre para el Buscador Global',
      categoria: 'Búsqueda & Experiencia de Usuario',
      icon: Sparkles,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se ha rediseñado la interfaz del Buscador Global (Command Palette) para ofrecer un aspecto visual luminoso, nítido y de máximo contraste. Los elementos ahora destacan con fondos claros, acentos vibrantes y píldoras de métricas más legibles. Además, se han incorporado botones físicos de "Cerrar" en la parte superior e inferior para facilitar la salida con un solo clic.',
      instructivo: {
        paraQueSirve: 'Permite una lectura más clara y cómoda de las métricas y reportes buscados, con botones de salida rápidos y visibles.',
        quePuedesVer: 'Al presionar Ctrl + K o abrir el buscador, apreciarás tarjetas blancas y luminosas, métricas saturadas y el botón de cierre en la esquina superior derecha.',
        ejemploUso: 'Ejemplo: Abre el buscador, revisa las métricas de un parámetro y haz clic en "Cerrar" o presiona ESC.'
      },
      changes: [
        'Paleta Visual Luminosa: Tarjetas blancas de alto contraste con resaltes nítidos y sombras suaves.',
        'Botones de Cierre Físicos: Botón "Cerrar" en la cabecera superior y en el pie del buscador.',
        'Mayor Contraste de Texto y Métricas: Colores saturados para una lectura inmediata de indicadores en vivo.'
      ]
    },
    {
      id: 'v4.9.6',
      version: 'v4.9.6',
      fecha: '18 de Agosto, 2026',
      badge: 'EXPERIENCIA VISUAL',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Despliegue Centrado y Fluido del Buscador Global (Command Palette)',
      categoria: 'Búsqueda & Interfaz',
      icon: Search,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se ha corregido el comportamiento visual del buscador global al abrirse desde la barra lateral. Ahora, tanto si la barra lateral está expandida como contraída, el buscador se despliega en una ventana flotante perfectamente centrada sobre la pantalla con ancho completo (Command Palette con fondo desenfocado), sin comprimirse ni solaparse con los iconos del menú.',
      instructivo: {
        paraQueSirve: 'Garantiza una visualización limpia, espaciosa y sin desbordes al buscar cualquier parámetro clínico o módulo.',
        quePuedesVer: 'Presiona Ctrl + K o haz clic en el buscador para ver el panel de búsqueda centrado y espacioso.',
        ejemploUso: 'Ejemplo: Desde cualquier módulo, presiona Ctrl + K para abrir la ventana de búsqueda sin alterar la barra lateral.'
      },
      changes: [
        'Desacoplamiento Estructural vía React Portal: El buscador se proyecta directamente sobre la pantalla principal.',
        'Apertura Centrada: Ventana espaciosa de búsqueda que no se comprime al contraer el menú.',
        'Barra Lateral Limpia: En modo contraído se muestra un botón minimalista y en modo expandido una caja de activación directa.'
      ]
    },
    {
      id: 'v4.9.5',
      version: 'v4.9.5',
      fecha: '18 de Agosto, 2026',
      badge: 'BÚSQUEDA GLOBAL',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Barra de Búsqueda Global e Inspección Paramétrica en Barra Lateral',
      categoria: 'Navegación & Búsqueda Universal',
      icon: Search,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se ha implementado una nueva Barra de Búsqueda Global y Command Palette en la barra lateral izquierda. Permite escribir cualquier concepto o métrica (ej: "alta administrativa", "traslados", "admitidos", "tiempos", "C3", "fracturas", "médicos", etc.), desplegando estadísticas en vivo del parámetro y permitiendo ingresar directamente al módulo, reporte o sub-sección deseada. Además, al contraer la barra lateral, el buscador se compacta elegantemente en un botón flotante con atajo universal (Ctrl+K).',
      instructivo: {
        paraQueSirve: 'Permite encontrar rápidamente cualquier indicador, parámetro asistencial o reporte sin tener que buscar manualmente entre los módulos.',
        quePuedesVer: 'Escribe términos como "alta", "traslados", "tiempos", "demanda" o "médicos" para ver el valor numérico en vivo y el acceso directo al módulo.',
        ejemploUso: 'Ejemplo: Presiona Ctrl + K desde cualquier pantalla, escribe "alta administrativa" y haz clic para abrir su análisis detallado.'
      },
      changes: [
        'Ubicación en Barra Lateral Izquierda: Integrada limpiamente en la navegación principal.',
        'Soporte de Barra Lateral Contraída: Botón compacto con Command Palette flotante que no interfiere con el diseño.',
        'Métricas en Tiempo Real: Visualización de volúmenes, porcentajes y promedios calculados al instante para el término buscado.',
        'Atajo Universal: Activación rápida con Ctrl + K / Cmd + K y cierre con ESC.'
      ]
    },
    {
      id: 'v4.9.4',
      version: 'v4.9.4',
      fecha: '18 de Agosto, 2026',
      badge: 'TIEMPOS DE ATENCIÓN',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Consolidación y Visualización Continua de Tiempos de Atención en el Gráfico Dinámico',
      categoria: 'Gráficos & Análisis Taxonómico',
      icon: Activity,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se ha corregido el cálculo de las series temporales de tiempos de espera en el Gráfico Dinámico de Inicio (pestaña "Tiempos de Atención"). Al seleccionar cualquier periodo o rango de fechas (por ejemplo, del 1 al 16 de agosto o cualquier mes completo), el sistema empareja los pacientes a los turnos correspondientes o agrupa por fecha de atención, desplegando con total fluidez las curvas de Espera Médico, Espera Triaje, Tiempo Box y Estadía Total.',
      instructivo: {
        paraQueSirve: 'Permite visualizar la evolución cronológica y tendencias de los tiempos de espera a lo largo de cualquier periodo seleccionado sin caídas a cero.',
        quePuedesVer: 'En el gráfico principal de Inicio, selecciona la pestaña "Tiempos de Atención" para ver las curvas continuas de minutos de espera.',
        ejemploUso: 'Ejemplo: Selecciona el mes de agosto completo para comparar la tendencia de espera médica versus tiempo de box día a día.'
      },
      changes: [
        'Emparejamiento Universal de Pacientes a Turnos: Soporte completo para turnos largos (16:00 a 09:00 hrs) y turnos de fin de semana.',
        'Cálculo Vectorizado de Tiempos: Inclusión automática de tiempoAdmCat, tiempoCatAna, tiempoAnaAlt y tiempoAdmAlt en cada punto de la serie.',
        'Agrupación Resiliente por Fechas: Fallback continuo que garantiza que cualquier rango de fechas visualice sus tiempos.'
      ]
    },
    {
      id: 'v4.9.3',
      version: 'v4.9.3',
      fecha: '18 de Agosto, 2026',
      badge: 'ÚLTIMO TURNO COMPLETO',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Regla Rigurosa de Selección del Último Turno Clínico 100% Completo',
      categoria: 'Filtros & Navegación Global',
      icon: Clock,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'El sistema ahora evalúa estrictamente si el turno más reciente en la base de datos se encuentra 100% terminado antes de seleccionarlo por defecto. Si la última carga de datos corresponde a un turno en curso (por ejemplo, Domingo 16/08 23:57 donde el turno noche aún no ha concluido a las 08:00 AM del Lunes), MÉTRICO selecciona automáticamente el último turno cerrado en su totalidad (Turno Finde Día: Domingo 16/08 de 08:00 a 20:00 hrs), garantizando que las métricas reflejen un ciclo asistencial completo.',
      instructivo: {
        paraQueSirve: 'Evita visualizar turnos a medio terminar o con registros incompletos al ingresar a la plataforma.',
        quePuedesVer: 'En "PERIODO SELECCIONADO", verás inmediatamente el último turno clínico 100% cerrado y consolidado con todas sus atenciones.',
        ejemploUso: 'Ejemplo: Si cargas datos hasta el Domingo a las 23:57, el panel seleccionará automáticamente el Turno Día (08:00 a 20:00 hrs) del Domingo 16/08.'
      },
      changes: [
        'Algoritmo determineLastCompletedShift: Evaluación matemática de los horarios de corte de turno (08:00, 09:00 y 20:00).',
        'Validación de Turno en Curso: Descarte automático de turnos parciales o no finalizados para la vista inicial por defecto.',
        'Visualización Fidedigna: Consolidación inmediata de los KPIs de período seleccionado.'
      ]
    },
    {
      id: 'v4.9.2',
      version: 'v4.9.2',
      fecha: '18 de Agosto, 2026',
      badge: 'ESTABILIDAD & CORRECCIÓN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Resolución de Error de Renderizado en el Panel Principal (useCallback)',
      categoria: 'Estabilidad de Plataforma',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Se corrigió un error puntual en tiempo de ejecución originado por la importación de hooks de React en el Dashboard principal, restableciendo de inmediato la carga normal y fluida de todas las vistas estadísticas.',
      instructivo: {
        paraQueSirve: 'Restaura el acceso continuo al panel principal eliminando el modal de bloqueo de error visual.',
        quePuedesVer: 'La plataforma carga de forma inmediata y transparente al ingresar.',
        ejemploUso: 'Ejemplo: Acceso directo y sin interrupciones a todas las métricas del sistema.'
      },
      changes: [
        'Corrección de Import de React: Inclusión de useCallback en src/components/Dashboard.jsx.',
        'Eliminación de Bloqueo Visual: Carga 100% limpia en producción.'
      ]
    },
    {
      id: 'v4.9.1',
      version: 'v4.9.1',
      fecha: '18 de Agosto, 2026',
      badge: 'MATRIZ DE PERMISOS DINÁMICA',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Auto-Sincronización Dinámica de Nuevos Módulos en la Matriz de Permisos de Usuarios',
      categoria: 'Gestión de Usuarios & Seguridad',
      icon: Users,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se ha optimizado la Matriz de Permisos y Credenciales de Usuarios. Cada vez que se incorpore o despliegue una nueva funcionalidad o módulo en la plataforma (ej. Radar IA, Pautas, etc.), este aparecerá automáticamente en la matriz de permisos de todos los usuarios registrados con el distintivo ✨ NUEVO MÓDULO, permitiendo a los Administradores activar o desactivar su acceso granular de forma inmediata.',
      instructivo: {
        paraQueSirve: 'Garantiza que al agregar nuevas secciones a MÉTRICO, los Administradores puedan gestionar de inmediato las credenciales de cada usuario sin realizar migraciones ni configuraciones complejas.',
        quePuedesVer: 'En la pestaña "Gestión de Usuarios", al editar los permisos de una cuenta, verás los 19 módulos del sistema clasificados por categoría, junto al distintivo resplandeciente ✨ NUEVO MÓDULO en las novedades.',
        ejemploUso: 'Ejemplo: Si agregamos un nuevo sub-reporte en un despliegue futuro, los administradores podrán desmarcar esa casilla para ciertos perfiles y habilitarla para los gestores directos.'
      },
      changes: [
        'Registro Maestro Centralizado (modules.js): Catálogo de 19 módulos dinámicos con nombres, descripciones e iconos.',
        'Auto-Fusión Transparente de Permisos: Incorporación automática de nuevos apartados en perfiles existentes sin afectar sus configuraciones previas.',
        'Distintivo ✨ NUEVO MÓDULO: Resaltado visual instantáneo de apartados recién desplegados en el asistente de usuarios.'
      ]
    },
    {
      id: 'v4.9.0',
      version: 'v4.9.0',
      fecha: '18 de Agosto, 2026',
      badge: 'AUTO-SELECCIÓN DE TURNO',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Auto-Detección del Último Turno Clínico Completo al Ingresar 100% Precisa',
      categoria: 'Filtros & Navegación Global',
      icon: Clock,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Se ha corregido el cálculo automático del último turno clínico completo al abrir la plataforma. Cuando la última información cargada corresponde a un Turno Noche de fin de semana o semana (20:00 a 08:00 AM / 16:00 a 09:00 AM), el sistema incrementa automáticamente la fecha fin al día siguiente (+1 día), desplegando los datos reales del período sin mostrar ceros por fechas invertidas.',
      instructivo: {
        paraQueSirve: 'Garantiza que al ingresar a la plataforma, las tarjetas KPI de "PERIODO SELECCIONADO" muestren inmediatamente la actividad real del último turno cargado (por ejemplo el 16/08), sin que queden contadores en cero.',
        quePuedesVer: 'Al cargar la página con datos hasta el 16/08 23:57, la barra superior mostrará el rango completo de turno (ej. 16/08 20:00 a 17/08 08:00 AM) y el panel calculará todos los pacientes admitidos en el turno de forma transparente.',
        ejemploUso: 'Ejemplo: En Turnos Noche de Fin de Semana, la fecha fin se extiende automáticamente al día siguiente para abarcar las 12 horas completas del turno.'
      },
      changes: [
        'Ajuste Automático de Medianoche (+1d): Inclusión automática del día siguiente en fecha fin para Turnos Noche y Turnos Largos.',
        'Eliminación de Períodos Vacíos (0 pac): Resolución del descalce de horario donde fechas de inicio y fin idénticas anulaban la ventana de 20:00 a 08:00.',
        'Sincronización en Filtros Globales: Los selectores de presets de horario aplican la lógica de cruce de noche en toda la plataforma.'
      ]
    },
    {
      id: 'v4.8.9',
      version: 'v4.8.9',
      fecha: '18 de Agosto, 2026',
      badge: 'SEGURIDAD DE SESIÓN',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Caducidad Estricta de Sesión por Inactividad (>15 min) y Protección de Datos Asistenciales',
      categoria: 'Seguridad & Autenticación',
      icon: Clock,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Se ha reforzado la seguridad institucional de MÉTRICO. Si transcurren 15 minutos o más de inactividad (sin movimiento en la plataforma o al reingresar horas/días después), la sesión caducará de forma estricta e incondicional, requiriendo ingresar credenciales (correo y contraseña) nuevamente.',
      instructivo: {
        paraQueSirve: 'Protege la confidencialidad de los datos asistenciales del establecimiento al impedir que un navegador reabierto horas o días después pueda acceder mediante una confirmación simple sin contraseña.',
        quePuedesVer: 'Si dejas la plataforma inactiva durante 14 minutos, verás una advertencia con un conteo regresivo de 60 segundos. Si transcurren más de 15 minutos o reabres el sitio al día siguiente, el sistema te redirigirá directamente a la pantalla de Inicio de Sesión.',
        ejemploUso: 'Ejemplo: Al abrir la plataforma 24 horas después de tu último uso, el sistema te solicitará ingresar tu correo corporativo y contraseña para garantizar la seguridad asistencial.'
      },
      changes: [
        'Caducidad Incondicional por Inactividad: Desconexión automática de Firebase Auth tras 15 minutos sin interacción.',
        'Bloqueo de Reingreso Directo: Eliminación de la confirmación directa de 1-clic para sesiones caducadas tras periodos prolongados.',
        'Monitoreo Persistente Global: Seguimiento en tiempo real de la última actividad compartida entre pestañas (localStorage).'
      ]
    },
    {
      id: 'v4.8.8',
      version: 'v4.8.8',
      fecha: '17 de Agosto, 2026',
      badge: 'IMPRESIÓN & PLOTTER',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Optimización de Márgenes de Impresión y Ajuste de Borde para Plotter y Formato Carta',
      categoria: 'Impresión & Diseño Formatos',
      icon: Printer,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Perfeccionamiento de la vista de impresión en CSS (@media print). Se agregaron márgenes de seguridad internos y reglas de contención para evitar que las tablas, cifras o encabezados rocen o se corten en los bordes del papel al imprimir en plotters o impresoras de gran formato.',
      instructivo: {
        paraQueSirve: 'Asegura una presentación ejecutiva impecable sin recortes de texto ni desbordamientos laterales al imprimir los reportes en cualquier tipo de impresora o plotter.',
        quePuedesVer: 'Al abrir el diálogo de impresión (Ctrl+P), la barra lateral web se oculta por completo y las hojas impresas mantienen un margen blanco limpio alrededor de todo el contenido, incluso seleccionando "Márgenes: Ninguno".',
        ejemploUso: 'Ejemplo: En el resumen de diagnósticos principales y tablas de médicos, los recuentos como "280 pac" se mantienen alineados con espacio suficiente de resguardo.'
      },
      changes: [
        'Resguardo de Márgenes Internos: Implementación de padding de seguridad (6mm/8mm) en el contenedor imprimible.',
        'Aislamiento de Barra Lateral: Ocultamiento total de la navegación web aside en las hojas de impresión.',
        'Control de Tablas y Bordes: Configuración de table-layout: fixed y word-break para prevenir desbordamientos laterales.'
      ]
    },
    {
      id: 'v4.8.7',
      version: 'v4.8.7',
      fecha: '17 de Agosto, 2026',
      badge: 'REPORTES & INTEGRIDAD',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Conciliación Unificada de Reportes: Gráficos de Constataciones Z51.8 y Traslados 100% Sin Discrepancias',
      categoria: 'Motor de Reportes & Algoritmos',
      icon: FileText,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Resolución completa de la visualización de la Pirámide Demográfica, Distribución por Sexo, Tabla Sociodemográfica y Origen Geográfico en el Informe Técnico de Constataciones Z51.8. Asimismo, se unificó el filtro de Traslados Hospitalarios entre narrativas automáticas y tarjetas KPI, asegurando 0% de discrepancias en la suite de reportes.',
      instructivo: {
        paraQueSirve: 'Garantiza que al exportar o imprimir los subreportes (PDF/Imprimible), todas las tablas, gráficos de anillo, pirámides y comunas muestren los datos reales consolidados sin discrepancias numéricas entre secciones.',
        quePuedesVer: 'Al generar el informe de Constatación de Lesiones (Z51.8), verás la Pirámide Poblacional y la Tabla Sociodemográfica totalmente pobladas, junto al mapa de Comunas. En el Sub-reporte de Traslados, el resumen narrativo coincide en 100% con la cifra de las tarjetas KPI.',
        ejemploUso: 'Ejemplo: En el informe del 01/08 al 16/08, el Sub-reporte de Factores y Destino y el Sub-reporte de Traslados reportan exactamente 68 traslados hospitalarios (3.9%), con igual detalle narrativo.'
      },
      changes: [
        'Detector Multivariable Z51.8: Inclusión de banderas, diagnósticos glosa y derivaciones policiales para alimentar Pirámide, Sexo y Comunas.',
        'Unificación de Traslados Hospitalarios: Homogeneización de isTraslado entre el generador de texto narrativo y las tarjetas KPI.',
        'Concordancia 100% Inter-Subreportes: Coincidencia matemática absoluta entre el Sub-reporte Factores/Destino y el Sub-reporte Traslados.'
      ]
    },
    {
      id: 'v4.8.6',
      version: 'v4.8.6',
      fecha: '17 de Agosto, 2026',
      badge: 'PROTOCOLOS Y FILTROS',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Auto-Adherencia de Filtros de Fecha al Último Día Cargado en la Plataforma',
      categoria: 'Experiencia de Usuario & Filtros',
      icon: Calendar,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Garantía del protocolo de entrada a MÉTRICO: al iniciar la sesión o recargar la página, el selector de fechas y horarios se adosa automáticamente al último día con registros reales cargados en la base de datos, desplegando de inmediato los indicadores completos del periodo.',
      instructivo: {
        paraQueSirve: 'Evita que el panel de control inicie en cero por seleccionar la fecha del calendario civil cuando aún no hay planillas subidas para ese día.',
        quePuedesVer: 'Al ingresar verás las métricas del "Periodo Seleccionado" (Admitidos, Atendidos, Tiempos, Altas, etc.) completamente pobladas con los datos del último día disponible.',
        ejemploUso: 'Ejemplo: Si la última planilla cargada corresponde al 13/08/2026, los filtros superiores se configuran automáticamente en ese periodo para mostrar los datos reales de esa jornada.'
      },
      changes: [
        'Adherencia Automática: Configuración de filtroFechaInicio y filtroFechaFin según la fecha máxima de admisión maxTime.',
        'Sincronización de Preset "Hoy": Al hacer clic en "Hoy", se selecciona el último día registrado en el sistema.',
        'Encasillamiento Nativo: Selección automática del Horario Turno Largo Semana (16:00 a 09:00 AM) para días hábiles.'
      ]
    },
    {
      id: 'v4.8.5',
      version: 'v4.8.5',
      fecha: '17 de Agosto, 2026',
      badge: 'DISPONIBILIDAD & VELOCIDAD',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Desbloqueo Automático de Pantalla y Protección de Conexión en Tiempo Real',
      categoria: 'Rendimiento & Estabilidad',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Implementación de temporizadores máximos de seguridad (5s) para la consulta de datos en la nube. Si Firestore o la autenticación experimenta latencia o bloqueos de red, la pantalla se desbloquea automáticamente al 100% y carga la información desde la caché local IndexedDB.',
      instructivo: {
        paraQueSirve: 'Previene que el panel de control quede detenido en la pantalla de "Sincronizando base de datos...", garantizando el acceso inmediato a la plataforma.',
        quePuedesVer: 'Al ingresar o recargar la página, el sitio abre de inmediato con los datos en memoria. Si hay datos nuevos en la nube, se actualizan silenciosamente en segundo plano.',
        ejemploUso: 'Ejemplo: Si tu conexión a internet o la respuesta de Firestore es lenta, el sitio pasa automáticamente a estado Sincronizado y te permite trabajar con los registros locales.'
      },
      changes: [
        'Tiempo Máximo de Seguridad (Timeout 5s): Desbloqueo automático ante cualquier demora en consultas Firestore.',
        'Suscripciones Autenticadas: usePautasTurnos.js solo consulta Firestore cuando la autenticación de usuario está activa.',
        'Recuperación Inmediata de Caché: Presentación instantánea de los registros almacenados en IndexedDB.'
      ]
    },
    {
      id: 'v4.8.4',
      version: 'v4.8.4',
      fecha: '16 de Agosto, 2026',
      badge: 'ANÁLISIS & RENDIMIENTO',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Restauración del Protocolo de Desduplicación SSOT con Procesamiento Asíncrono por Lotes',
      categoria: 'Gestión de Datos & Algoritmos',
      icon: RefreshCw,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Restauración completa del protocolo de análisis de desduplicación de datos históricos contra la base de datos SSOT en GestionDatos.jsx. El motor de análisis ahora procesa planillas masivas en bloques asíncronos de 2.500 filas con feedback dinámico en tiempo real, garantizando 0% de congelamientos en el navegador.',
      instructivo: {
        paraQueSirve: 'Verifica la integridad de las atenciones ingresadas, detecta duplicados históricos por correlativo/RUT/admisión y muestra el informe previo antes de guardar los datos en Firestore.',
        quePuedesVer: 'Al subir un archivo en Gestión de Datos, la ventana de procesamiento muestra el porcentaje de avance dinámico (ej: "Analizando desduplicación SSOT... 25.000 / 64.000 filas (39%)"). Al finalizar, se despliega la tarjeta resumen con el detalle completo de atenciones válidas, duplicados descartados e incidencias.',
        ejemploUso: 'Ejemplo: Seleccionas una planilla masiva de 65.000 atenciones y el sistema analiza los registros sin congelar la pantalla, entregándote el informe de pre-carga para confirmar la subida.'
      },
      changes: [
        'Análisis Asíncrono (Non-Blocking): Fragmentación del bucle de desduplicación en micro-ticks de 2.500 filas.',
        'Feedback en Tiempo Real: Visualización del recuento de filas analizadas y porcentaje en el modal de procesamiento.',
        'Integridad SSOT Restaurada: Verificación completa de correlativos, marcas de tiempo y campos de atención previa.'
      ]
    },
    {
      id: 'v4.8.3',
      version: 'v4.8.3',
      fecha: '16 de Agosto, 2026',
      badge: 'NAVEGACIÓN & MEMORIA',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Navegación Directa al Módulo Gestión de Datos y Lectura de Excel de Alta Capacidad',
      categoria: 'Rendimiento & Usabilidad',
      icon: UploadCloud,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'El botón "Carga Rápida" ahora redirige inmediatamente al módulo de Gestión de Datos al ser presionado, evitando bloqueos o congelamientos de ventanas modales. Además, se optimizó el motor de lectura de planillas Excel en memoria mediante Uint8Array, solucionando errores de desbordamiento de búfer.',
      instructivo: {
        paraQueSirve: 'Permite acceder en 1 clic al centro oficial de carga de datos sin riesgo de congelamiento del navegador.',
        quePuedesVer: 'Al presionar "Carga Rápida" en la barra superior, la plataforma te traslada al instante a la pestaña "Gestión de Datos" donde dispones de la zona de arrastre y opciones de desduplicación.',
        ejemploUso: 'Ejemplo: Presionas "Carga Rápida" y eres derivado directamente al panel de Gestión de Datos para subir y conciliar tu planilla masiva.'
      },
      changes: [
        'Redirección Directa: El botón Carga Rápida ejecuta la navegación inmediata a la pestaña data.',
        'Optimización Memoria Excel: Actualización a FileReader con readAsArrayBuffer y lectura Uint8Array.',
        'Prevención de Desbordamiento: Eliminación total del error RangeError: Array buffer allocation failed.'
      ]
    },
    {
      id: 'v4.8.2',
      version: 'v4.8.2',
      fecha: '16 de Agosto, 2026',
      badge: 'DISEÑO Y NAVEGACIÓN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Restauración del Explorador Global de Urgencias e Integración Limpia del Botón de Carga Rápida',
      categoria: 'Interfaz & Experiencia de Usuario',
      icon: Compass,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Restauración completa del diseño original de la barra superior con el título "Explorador Global de Urgencias", subtítulo descriptivo, badge pulsante de datos cargados y organización en 2 filas de controles, integrando el botón "Carga Rápida" de forma totalmente limpia y sin distorsiones.',
      instructivo: {
        paraQueSirve: 'Restablece la jerarquía visual nativa del panel de control manteniendo la visibilidad del título principal y del badge de actualización de datos, con acceso directo a la carga masiva.',
        quePuedesVer: 'En la parte superior izquierda verás el título "Explorador Global de Urgencias", el subtítulo "Análisis operativo y clínico en tiempo real" y la etiqueta verde "Datos cargados hasta: ...". En la botonera derecha se ubica el botón "Carga Rápida".',
        ejemploUso: 'Ejemplo: Navegas por cualquier vista y conservas el contexto completo del explorador global con acceso a todos los accesos directos y a la carga rápida en un clic.'
      },
      changes: [
        'Restauración de Cabecera: Título Explorador Global de Urgencias, subtítulo e icono Compass.',
        'Badge de Actualización: Mantenimiento del aviso de datos cargados hasta fecha máxima.',
        'Distribución de 2 Filas: Selector de Fechas/Horas en fila superior y Acciones (Presets, Carga Rápida, Sincronizar, Integridad, Notif) en fila inferior.'
      ]
    },
    {
      id: 'v4.8.1',
      version: 'v4.8.1',
      fecha: '16 de Agosto, 2026',
      badge: 'CORRECCIÓN & SEGURIDAD',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Corrección de Renderizado de Reloj y Permisos de Conectividad CSP para Cloud Functions y CDN',
      categoria: 'Estabilidad & Seguridad',
      icon: Clock,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Resolución del error de renderizado del componente de horas en la barra superior (ReferenceError: Clock is not defined) e inclusión explícita en las políticas Content-Security-Policy (CSP) de los dominios de Cloud Functions y librerías CDN para garantizar el funcionamiento fluido.',
      instructivo: {
        paraQueSirve: 'Garantiza la estabilidad continua de la plataforma evitando bloqueos visuales en el navegador y permitiendo el consumo seguro de Cloud Functions.',
        quePuedesVer: 'El panel vuelve a cargar con fluidez total sin pantalla de error crítico y con todos los selectores de horas operativos.',
        ejemploUso: 'Ejemplo: Seleccionas cualquier rango horario en la barra superior o abres la Carga Rápida CSV/Excel y el sistema opera instantáneamente.'
      },
      changes: [
        'Importación de Icono Clock: Inclusión explícita de Clock desde lucide-react en FiltrosGlobales.jsx.',
        'Actualización CSP script-src: Permiso concedido a cdnjs.cloudflare.com para la librería XLSX.',
        'Actualización CSP connect-src: Permiso concedido a *.cloudfunctions.net para la API de funciones Cloud.'
      ]
    },
    {
      id: 'v4.8.0',
      version: 'v4.8.0',
      fecha: '16 de Agosto, 2026',
      badge: 'ACCESO RÁPIDO GLOBAL',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Botón Rápido de Carga Masiva CSV/Excel Global y Redirección Automática a Gestión de Datos',
      categoria: 'Gestión de Datos & Usabilidad',
      icon: UploadCloud,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Incorporación del botón "Carga Rápida CSV/Excel" en la barra superior global de MÉTRICO, permitiendo subir lotes masivos de atenciones desde cualquier módulo sin necesidad de navegar previamente a Gestión de Datos. Al finalizar la carga, el sistema ejecuta una redirección automática a la sección Gestión de Datos con notificación sonora y toast confirmatorio.',
      instructivo: {
        paraQueSirve: 'Permite a los analistas y jefaturas subir datos Excel o CSV en un clic desde cualquier vista (Resumen, Radar, Rendimiento, Perfil, etc.), ahorrando tiempo de navegación y garantizando la desduplicación en vivo.',
        quePuedesVer: 'En la barra superior de acciones verás el botón "Carga Rápida CSV/Excel". Al hacer clic, se abre una ventana flotante para seleccionar el archivo. Durante la subida, se muestra una barra de progreso con tiempo estimado (ETA) y, al finalizar, se escucha el chime de éxito y te redirecciona a la sección Gestión de Datos.',
        ejemploUso: 'Ejemplo: Estás revisando el Radar Predictivo y necesitas cargar el informe diario de atenciones. Presionas "Carga Rápida CSV/Excel", seleccionas el archivo y, en segundos, el sistema procesa los registros y te traslada a la Gestión de Datos con el lote totalmente cargado y conciliado.'
      },
      changes: [
        'Botón Rápido "Carga Rápida CSV/Excel": Acceso permanente en la barra superior FiltrosGlobales.jsx.',
        'Modal Global <ModalCargaRapidaDatos>: Procesamiento masivo de archivos .xlsx, .xls y .csv desde cualquier vista.',
        'Reglas SSOT & Deduplicación Reactiva: Filtrado en memoria de atenciones duplicadas antes de guardar en Firestore.',
        'Redirección Automática Post-Carga: Traslado directo del usuario a la pestaña "Gestión de Datos" (setActiveTab("data")).',
        'Notificación Sonora & Toast: Reproducción de playSuccessChime() y registro en la Campana Superior de Notificaciones.'
      ]
    },
    {
      id: 'v4.7.0',
      version: 'v4.7.0',
      fecha: '16 de Agosto, 2026',
      badge: 'IA GENERATIVA GEMINI',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20',
      title: 'Síntesis Epidemiológica Generativa IA en Reporte PDF: Análisis de Causa Raíz e Inteligencia Sanitaria Automática',
      categoria: 'Inteligencia Artificial & Reportes',
      icon: Sparkles,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      summary: 'Integración de la Síntesis Epidemiológica Generativa (impulsada por Gemini 1.5 Flash) en la exportación del PDF del Dashboard de Arquetipos Clínicos: captura un Data Snapshot en JSON del arquetipo activo, invoca el prompt de Director de Inteligencia Sanitaria redactando un análisis de causa raíz y cruce multivariable, e inyecta la narrativa en el documento imprimible final.',
      instructivo: {
        paraQueSirve: 'Adjunta automáticamente una narrativa de inteligencia sanitaria experta al final de cada reporte PDF exportado, explicando la causa raíz de la saturación horaria y la vulnerabilidad social de la cohorte.',
        quePuedesVer: 'Al hacer clic en "Generar Reporte de Perfil", el botón mostrará un indicador de estado "Generando Análisis IA...". En menos de un segundo, la síntesis redactada en 2 partes (1. Estructura Demográfica, 2. Causa Raíz & Saturación) aparecerá al final del informe en el PDF descargado.',
        ejemploUso: 'Ejemplo: Seleccionas "Infantil (0-14 años)". Al exportar el reporte, el motor analiza que el pico de demanda se da los fines de semana en la tarde por patologías bronquiales (J20/J00), redactando un informe que alerta sobre cuellos de botella en observación y sugiere coordinar traslados preventivos.'
      },
      changes: [
        'Data Snapshot JSON Automático: Captura cuantitativa de cohorte, edad, tiempos, top 5 diagnósticos orgánicos, previsión y picos del heatmap.',
        'Gemini 1.5 Flash API Integration: Consulta con el System Prompt de Director de Inteligencia Sanitaria en tono gerencial riguroso.',
        'Generador Fallback Determinista: Motor local de alta fidelidad que garantiza que el informe siempre descargue la narrativa completa sin bloqueos por timeout.',
        'Componente <AnalisisEpidemiologicoIA>: Renderizado inyectado al final de PerfilPoblacionalReporte.jsx con diseño visual gerencial para PDF.'
      ]
    },
    {
      id: 'v4.6.0',
      version: 'v4.6.0',
      fecha: '16 de Agosto, 2026',
      badge: 'NIVEL DIRECTIVO PRO',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Dashboard de Arquetipos Clínicos Nivel Directivo Pro: Universo Completo (64k+ Reg.), Pirámide Bidireccional Horizontal, Blacklist Z/R/Y, Filtro Temporal y Heatmap Operativo',
      categoria: 'Epidemiología & Gestión Directiva',
      icon: Flame,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Upgrade integral del Dashboard de Arquetipos Clínicos a estándar directivo: inyección del universo máster completo (64.000+ registros históricos), Pirámide Poblacional bidireccional horizontal real (layout vertical en Recharts), Blacklist Clínico estricto en el Top 5 CIE-10 (exclusión de prefijos Z, R, Y para mostrar patologías orgánicas puras), Selector de Rango Temporal (Histórico, Año Actual, Mes, 7 Días) y Heatmap Operativo semanal por franja horaria.',
      instructivo: {
        paraQueSirve: 'Proporciona una vista epidemiológica máster de nivel directivo para el análisis del universo completo de atenciones del SAR, permitiendo evaluar la demanda por horarios y la prevalencia de enfermedades puras.',
        quePuedesVer: 'Al ingresar a "Perfil del Paciente", verás la Muestra de Arquetipo reflejando el universo total de 64k+ registros, la pirámide poblacional proyectada horizontalmente (Hombres azul a la izquierda, Mujeres rosado a la derecha), el Top 5 de diagnósticos orgánicos sin códigos de control, el selector de Rango Temporal y la matriz de Mapa de Calor de Frecuencia Semanal.',
        ejemploUso: 'Ejemplo: Seleccionas "Año Actual (2026)" y el arquetipo "Adulto Mayor (65+ años)". El sistema analiza síncronamente sobre el universo completo, actualiza la pirámide horizontal, exhibe el Top 5 de patologías puras (ej. K29.7 Gastritis, I10 Hipertensión) y despliega en el Heatmap que la mayor afluencia de este grupo se concentra en la franja Noche (18:00 - 24:00 hrs) los días Lunes y Martes.'
      },
      changes: [
        'Desbloqueo Universo Completo SSOT: Inyección directa de allPacientesDB (64.000+ registros históricos).',
        'Pirámide Poblacional Bidireccional Horizontal Real: Configuración BarChart layout="vertical" con Hombres a la izquierda (-val) y Mujeres a la derecha (+val).',
        'Blacklist Clínico de Exclusión CIE-10: Exclusión estricta de códigos Z, R, Y y diagnósticos no especificados para exhibir patologías médicas puras.',
        'Selector de Rango Temporal: 4to filtro superior (Histórico Completo, Año Actual, Mes Actual, Últimos 7 Días).',
        'Heatmap Operativo de Frecuencia Semanal: Matriz visual de calor 7 × 4 cruzando Días de la Semana vs Turnos/Franjas Horarias.'
      ]
    },
    {
      id: 'v4.5.0',
      version: 'v4.5.0',
      fecha: '16 de Agosto, 2026',
      badge: 'MODO DIRECTORIO',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20',
      title: 'Modo Presentación Kiosco para Arquetipos Clínicos: Ocultamiento 100% de Navbars y Fuentes Escaladas a text-6xl',
      categoria: 'Visualización & Kiosco Ejecutivo',
      icon: Maximize2,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      summary: 'Incorporación del Modo Presentación (Modo Directorio) en el Dashboard de Arquetipos Clínicos CIE-10, diseñado específicamente para proyectores en salas de reuniones ejecutivas y presentaciones a corporaciones de salud: oculta el 100% de barras de navegación, escala métricas KPI a text-6xl y expande gráficos con salida por tecla ESC o botón flotante.',
      instructivo: {
        paraQueSirve: 'Optimiza la proyección en vivo de métricas epidemiológicas ante directorios o comités directivos de salud pública, garantizando legibilidad perfecta a distancia.',
        quePuedesVer: 'Al presionar el botón "Modo Presentación" en la cabecera, la pantalla se expande a pantalla completa, desaparecen el Sidebar y Topbar, las cifras KPI escalan a un tamaño gigante (text-6xl) y aparece un botón flotante con el recordatorio "Presiona ESC para salir".',
        ejemploUso: 'Ejemplo: Conectas tu notebook a un proyector en la sala de directorio, abres el módulo de Arquetipos y presionas "Modo Presentación". Toda la sala puede ver con máxima nitidez la pirámide poblacional y las métricas a varios metros de distancia.'
      },
      changes: [
        'Botón Toggle "Modo Presentación": Accionador en la cabecera con icono Maximize2.',
        'Comportamiento Kiosco Fullscreen: Capa fija z-50/z-100 que oculta el Sidebar y Topbar al 100% invocando requestFullscreen().',
        'Escalamiento Tipográfico: Fuentes numéricas de tarjetas KPI escaladas de text-3xl a text-5xl/text-6xl.',
        'Gráficos Expandidos: Altura de pirámide demográfica y anillo previsional incrementada a 480px.',
        'Doble Salida de Seguridad: Botón flotante Minimize2 y listener para la tecla ESC.'
      ]
    },
    {
      id: 'v4.4.0',
      version: 'v4.4.0',
      fecha: '16 de Agosto, 2026',
      badge: 'NUEVO DASHBOARD',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Dashboard de Arquetipos Clínicos CIE-10 & Generación de Reporte Poblacional PDF',
      categoria: 'Epidemiología & Arquetipos',
      icon: Users,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Transformación del módulo Perfil del Paciente en un Dashboard de Arquetipos Poblacionales y Morbilidad CIE-10: Pirámide demográfica (17 tramos quinquenales), Gráfico de anillo previsional, Top 5 dinámico de diagnósticos CIE-10 con badges resaltados y botón "Generar Reporte de Perfil" conectado al motor de exportación PDF.',
      instructivo: {
        paraQueSirve: 'Permite analizar la composición epidemiológica y sociodemográfica de la cohorte de pacientes según su arquetipo etario funcional (Infantil, Adulto Joven, Adulto, Adulto Mayor) y exportar reportes ejecutivos en PDF.',
        quePuedesVer: 'Al ingresar al módulo "Perfil del Paciente", verás el selector de arquetipos, la pirámide poblacional cruzando género vs tramos quinquenales, el gráfico de anillo previsional, los badges de diagnósticos CIE-10 [Código] Descripción - % y el botón "Generar Reporte de Perfil" en la cabecera.',
        ejemploUso: 'Ejemplo: Seleccionas el arquetipo "Infantil (0 - 14 años)" y el sistema recalcula de inmediato el Top 5 CIE-10 mostrando [J00] Rinofaringitis aguda - 34.2%. Presionas "Generar Reporte de Perfil" y obtienes un PDF listo para enviar a las jefaturas sanitarias.'
      },
      changes: [
        'Radiografía Demográfica Macro: Pirámide poblacional interactiva (17 tramos quinquenales) y gráfico Donut de previsión médica.',
        'Mapa de Morbilidad CIE-10: Clasificación estricta por codigo_diagnostico_cie10 con Top 5 dinámico y Badges resaltados [Código] Descripción - %.',
        'Eliminación Total de Ruido: Removida por completo la tabla inferior de listado individual fila por fila.',
        'Componente Exportable <PerfilPoblacionalReporte />: Estilos Print-Friendly conectados al botón "Generar Reporte de Perfil" para exportación directa a PDF.'
      ]
    },
    {
      id: 'v4.3.0',
      version: 'v4.3.0',
      fecha: '16 de Agosto, 2026',
      badge: 'CONSOLIDADO MAESTRO',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Consolidado Continuo de Arquitectura & Especificación Maestra de Matemática, Horarios, Sistema de Diseño y Reportes',
      categoria: 'Arquitectura & Especificación Técnica',
      icon: BookOpen,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Transformación del Informe de Arquitectura en un documento vivo consolidado permanente que agrupa la totalidad de fórmulas matemáticas, algoritmos SSOT, matriz de constatación de lesiones C3 Legal (Z51.8), reglas de encasillamiento de turno (+1h/-1h), manual de identidad visual Glassmorphic y el catálogo oficial de los 6 reportes en PDF.',
      instructivo: {
        paraQueSirve: 'Centraliza en una sola vista maestra toda la especificación cuantitativa, operacional y estética de MÉTRICO, sirviendo como manual técnico oficial para auditorías, entregas formales y control de cambios.',
        quePuedesVer: 'Al ingresar al módulo "Documentación Viva & Arquitectura", verás un selector de 6 pestañas para consultar libremente el Historial de Versiones, el Catálogo de Fórmulas y Algoritmos, la Matriz de Horarios de Turno (Turno Largo 16:00-09:00 hrs), el Manual de Identidad Visual con códigos HEX de triaje y el Catálogo de Reportes.',
        ejemploUso: 'Ejemplo: Accedes al módulo de Arquitectura y seleccionas la pestaña "1. Fórmulas, Algoritmos & Análisis". Podrás revisar y exportar en PDF las ecuaciones exactas de Altas Admin, Promedio de Estadía, Rendimiento Horario y los criterios de detección clínica de Constatación de Lesiones.'
      },
      changes: [
        'Estructura Multi-Pestaña de Especificación Maestra: Organización en 6 módulos de navegación (Historial, Fórmulas, Horarios, Sistema de Diseño, Reportes y Protocolo).',
        'Catálogo Matemático & Procedimientos de Análisis: Estipulación de ecuaciones de Altas Admin %, Estadía Promedio, Velocidad de Atención, Fonasa % y matriz C3 Legal Z51.8.',
        'Encasillamiento Horario Asistencial (+1h/-1h): Registro normativo del Turno Largo de Semana (16:00 a 09:00 AM, 15h efectivas) y turnos de fin de semana.',
        'Manual de Identidad Visual Glassmorphic: Especificación de la paleta "Cristal Pastel", tokens HSL y códigos HEX oficiales por categoría de Triaje C1 a C5.',
        'Catálogo Oficial de 6 Reportes Gerenciales: Definición formal de los entregables en PDF Carta e integración con el protocolo de retroalimentación acumulativa continuada.'
      ]
    },
    {
      id: 'v4.2.0',
      version: 'v4.2.0',
      fecha: '16 de Agosto, 2026',
      badge: 'CIBERSEGURIDAD EMPRESARIAL',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20',
      title: 'Blindaje de Ciberseguridad Nivel Empresarial: Hard-Logout por Inactividad, Firebase App Check, Firestore Rules & Cabeceras HTTP CSP',
      categoria: 'Ciberseguridad & Infraestructura',
      icon: ShieldAlert,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      summary: 'Implementación del plan de ciberseguridad avanzada para MÉTRICO: destrucción total de sesión por inactividad a los 15 min + 60s con vaciado de storages locales y reemplazo forzado de ventana, cortafuegos Firebase App Check con reCAPTCHA v3, reglas estrictas de Firestore, eliminación de Source Maps y cabeceras de seguridad CSP/X-Frame-Options DENY.',
      instructivo: {
        paraQueSirve: 'Protege la infraestructura clínica y la información de pacientes contra ataques cibernéticos, secuestro de sesión por inactividad, ingeniería inversa en el navegador y robo de datos.',
        quePuedesVer: 'Tras 15 minutos sin interacción se desplegará una alerta sonora y visual de 60 segundos. Si no se presiona "Mantener Sesión Activa", la sesión se destruirá por completo enviando al usuario a la pantalla de Login sin opción de rehidratar con F5. En producción, la aplicación opera bajo cabeceras HTTP de máxima seguridad (CSP, X-Frame-Options DENY).',
        ejemploUso: 'Ejemplo: Dejas el equipo desatendido por 15 minutos. El sistema activa el modal de aviso con cuenta regresiva. Al llegar a 0, se vacían de inmediato las credenciales en memoria/storage y se ejecuta un signOut total, impidiendo que cualquier persona acceda al presionar el botón Atrás o F5.'
      },
      changes: [
        'Destrucción de Sesión Estricta (Hard-Logout): Borrado total de localStorage, sessionStorage e IndexedDB con signOut() y reemplazo forzado de ventana.',
        'Cortafuegos Firebase App Check (reCAPTCHA v3): Validación de origen oficial compilado para todas las peticiones a Firestore y Cloud Functions.',
        'Reglas de Seguridad de Firestore (firestore.rules): Cierre global desprotegido permitiendo únicamente acceso a usuarios con correo institucional autorizado.',
        'Supresión Total de Source Maps (vite.config.js): Eliminación de archivos .map en producción para bloquear la ingeniería inversa del código fuente.',
        'Cabeceras HTTP de Alta Seguridad (firebase.json): Configuración de CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff y Referrer-Policy.'
      ]
    },
    {
      id: 'v4.1.2',
      version: 'v4.1.2',
      fecha: '16 de Agosto, 2026',
      badge: 'NUEVA VERSIÓN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Notificación Sonora Nativa (Web Audio API) al Finalizar la Sincronización de Base de Datos y Auto-Sync',
      categoria: 'Sincronización & Audio Feedback',
      icon: Cpu,
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      summary: 'Incorporación de un acorde armónico futurista de 3 fases sintetizado en tiempo real por la Web Audio API al culminar la sincronización de base de datos y recalcular los registros auditados.',
      instructivo: {
        paraQueSirve: 'Proporciona confirmación auditiva inmediata cuando el sistema termina de refrescar la base de datos en vivo, sin necesidad de mirar la pantalla ni descargar archivos de audio.',
        quePuedesVer: 'Al presionar "Re-evaluar Datos" o durante la sincronización inicial, al llegar al 100% de registros procesados se emite una secuencia armónica brillante (C5/G5 -> E5/C6 -> G5/E6) indicando que el panel está listo.',
        ejemploUso: 'Ejemplo: Inicias un refresco manual de la base de datos. Mientras revisas otros documentos, el sistema emite el acorde futurista al llegar a los 25,210 registros auditados, avisándote que la información está 100% al día.'
      },
      changes: [
        'Sintetización Acorde Armónico 3 Fases (C5/G5 -> E5/C6 -> G5/E6): Chime futurista de alta definición para finalización de sincronización.',
        'Chime Suave de Auto-Sync: Tono tenue de doble pulso (F5 -> C6) para sincronizaciones silenciosas periódicas de 5 minutos.',
        'Sincronización con Modal y Toast de Carga: Activación sonora automática al finalizar el progreso de descarga y recálculo.'
      ]
    },
    {
      id: 'v4.1.1',
      version: 'v4.1.1',
      fecha: '16 de Agosto, 2026',
      badge: 'MEJORA AUDIO',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Feedback Auditivo al Limpiar y Marcar Leídas Notificaciones en la Campana',
      categoria: 'Centro de Notificaciones',
      icon: Sparkles,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Integración del timbre de sonido de barrido cristalino en la Web Audio API al presionar "Limpiar" o "Marcar leídas" dentro del Centro de Notificaciones.',
      instructivo: {
        paraQueSirve: 'Confirma de forma sonora la vaciación o marcado de notificaciones en el historial.',
        quePuedesVer: 'Dentro de la campana de notificaciones, al presionar el botón "Limpiar", se emite un barrido armónico ascendente que confirma la purga del historial.',
        ejemploUso: 'Ejemplo: Abres la campana de notificaciones y presionas "Limpiar". El sistema reproduce un timbre cristalino confirmando que el historial ha quedado vacío.'
      },
      changes: [
        'Sonido playClearChime: Barrido armónico cristalino D5 -> A5 -> D6 mediante Web Audio API.',
        'Integración con Botón Limpiar: Ejecución sonora inmediata al vaciar el menú flotante de notificaciones.',
        'Integración con Marcar Leídas: Reproducción de confirmación al presionar "Marcar leídas".'
      ]
    },
    {
      id: 'v4.1.0',
      version: 'v4.1.0',
      fecha: '15 de Agosto, 2026',
      badge: 'INTEGRIDAD SSOT',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Paridad Matemática del 100% y Desduplicación SSOT entre Histórico Mensual y Explorador Global de Urgencias',
      categoria: 'Integridad de Datos & Calendario',
      icon: BarChart2,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Eliminación del descalce entre admisiones brutas (192) y admisiones únicas desduplicadas (116) mediante el motor deduplicarPacientes en el Histórico Mensual y la inyección del dataset maestro completo.',
      instructivo: {
        paraQueSirve: 'Garantiza coincidencia matemática exacta al 100% entre las cifras de turnos del calendario mensual y los indicadores del Explorador Global de Urgencias.',
        quePuedesVer: 'En la cuadrícula del Histórico Mensual, las cifras por día y turno muestran exactamente las mismas admisiones únicas desduplicadas (ej. 116 pac. en Turno 1 del 12/08/2026) que en la vista principal.',
        ejemploUso: 'Ejemplo: Seleccionas el 12 de Agosto en el Histórico Mensual y comparas las admisiones del Turno 1 (17:00 a 08:00 hrs) con el filtro global de Inicio: en ambos módulos figura de forma idéntica 116 pacientes admitidos y 15 altas.'
      },
      changes: [
        'Integración de deduplicarPacientes SSOT en CalendarioHistorico.jsx: Eliminación de doble conteo de reingresos o duplicados en turno.',
        'Pasaje de Universo Maestro allPacientesDB: El módulo Histórico Mensual procesa la totalidad del dataset clínico sin importar el filtro de 2 días de la cabecera.',
        'Soporte Robusto de Formatos de Fecha Locale: Reconocimiento unívoco de formatos ISO (YYYY-MM-DD), Chileno (DD/MM/YYYY) y US locale (MM/DD/YYYY).'
      ]
    },
    {
      id: 'v4.0.0',
      version: 'v4.0.0',
      fecha: '15 de Agosto, 2026',
      badge: 'NUEVA VERSIÓN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Despacho Automático de Cierre Mensual Consolidado (1° de Mes / Día Hábil) + Bitácora Zero-Click DevLog con Tono Pragmático y Capturas Reales',
      categoria: 'Despacho de Informes & Bitácora de Desarrollo',
      icon: Mail,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Incorporación de la regla de despacho automático de cierre mensual el día 1° de cada mes a las 08:30 AM (o primer día hábil) con resumen gerencial de los 6 pilares asistenciales, vinculación directa a los PDF oficiales del módulo Reportes, y actualización del Zero-Click DevLog con tono fluido reflexivo y capturas de pantalla reales en 1080p.',
      instructivo: {
        paraQueSirve: 'Permite configurar el envío automático del consolidado completo del mes recién concluido sin adjuntos pesados, ofreciendo navegación directa hacia la generación de PDF en el módulo Reportes y un muro de novedades técnico-operativo con lenguaje fluido.',
        quePuedesVer: 'En el modal de "Informe por Correo" verás la Sección 5 dedicada al Cierre Mensual Consolidado con el botón "🚀 Probar Envío Mensual Ahora" y enlace directo "📄 Abrir Módulo de Reportes PDF". En la Bitácora de Desarrollo, las publicaciones muestran fotos reales del sistema en alta definición y una narrativa continua que concluye con "Seguimos construyendo."',
        ejemploUso: 'Ejemplo: El día 1 de cada mes a las 08:30 AM el sistema envía automáticamente el informe de cierre del mes anterior a la Jefatura. Al recibir el correo, el usuario puede presionar el enlace institucional para ir directo al módulo Reportes y descargar el PDF Carta certificado.'
      },
      changes: [
        'Despacho Automático de Cierre Mensual (1° del Mes / Día Hábil): Configuración de regla de envío automático del consolidado del mes anterior a las 08:30 AM.',
        'Vinculación Directa con Módulo de Reportes PDF: Botones y enlaces institucionales que redirigen de inmediato a la descarga de informes en PDF carta.',
        'Preservación 100% de Auditoría por Turno: Mantención de los 3 esquemas de turnos cerrados diarios (Semana 17-08h, Finde Día 08-20h y Finde Noche 20-08h).',
        'Narrativa Fluida en Zero-Click DevLog: Redacción pragmática estilo desarrollador sin listas numeradas robóticas ni jerga irrelevante, finalizando siempre con "Seguimos construyendo."',
        'Fotógrafo Autónomo 1080p Real: Captura en tiempo real del motor de producción de MÉTRICO integrada en el bucket y vista del Muro de Novedades.'
      ]
    },
    {
      id: 'v3.4.0',
      version: 'v3.4.0',
      fecha: '14 de Agosto, 2026',
      badge: 'NUEVA VERSIÓN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Asistente Inteligente de Contexto Temporal y Sugerencias de Turnos + Encasillamiento Horario Oficial',
      categoria: 'Filtros Inteligentes & Encasillamiento',
      icon: Cpu,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Incorporación del Asistente Inteligente de Sugerencias de Turnos en la barra global de filtros. Detecta automáticamente si la fecha es día hábil o fin de semana y sugiere las franjas horarias exactas de contabilización (Turno Largo 16:00 a 09:00 AM, Finde Día 08:00 a 20:00 y Finde Noche 20:00 a 08:00 AM), eliminando la sugerencia de día completo.',
      instructivo: {
        paraQueSirve: 'Sugiére de forma dinámica las franjas de turnos clínicos correspondientes a la fecha elegida y actualiza todas las métricas, reportes y análisis específicos con 1 solo clic.',
        quePuedesVer: 'Al ingresar o cambiar una fecha en la cabecera, aparece una barra con botones de sugerencia inteligentes (pills con iconos ☀️ y 🌙). Al presionar cualquiera de las sugerencias, se configuran las horas de inicio y fin exactas de ese turno.',
        ejemploUso: 'Ejemplo: Seleccionas el 11/08/2026 (martes). El asistente te sugiere "Turno Largo Semana (16:00 a 09:00 hrs)". Al presionar el botón, se fija la ventana de 16:00 a 09:00 AM del día siguiente y todas las métricas del sitio se adaptan de inmediato a ese turno.'
      },
      changes: [
        'Detector Dinámico de Día Hábil vs Fin de Semana/Festivo: Generación de sugerencias según el tipo de calendario.',
        'Turno Largo de Semana: Encasillamiento automático de 16:00 hrs a 09:00 AM (+1 día) para capturar la franja operativa completa.',
        'Turnos de Fin de Semana: Finde Día (08:00 a 20:00 hrs) y Finde Noche (20:00 a 08:00 AM +1 día) con contabilización estricta.',
        'Depuración de Sugerencias: Eliminación del filtro de día completo (00:00 a 23:59) de las sugerencias para enfocarse estrictamente en la operación clínica.',
        'Actualización Simultánea de Módulos: Adaptación instantánea de tarjetas KPI, gráficos y subreportes específicos al aplicar una sugerencia.'
      ]
    },
    {
      id: 'v3.3.0',
      version: 'v3.3.0',
      fecha: '14 de Agosto, 2026',
      badge: 'NUEVA VERSIÓN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Audio-Notificaciones Sutiles (Web Audio API) + Centro de Notificaciones con Campana Flotante y Botón Marcar Leídas',
      categoria: 'Experiencia de Usuario & Notificaciones',
      icon: Cpu,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Incorporación de tonos de audio armónicos y sutiles sintetizados con Web Audio API para alertas de éxito y advertencia/descalce, botón de Campana de Notificaciones en la barra superior con contador no leído, menú desplegable con botón "Marcar leídas" y redirección directa al hacer clic.',
      instructivo: {
        paraQueSirve: 'Informa de manera auditiva y visual cuando se completa una sincronización o se detecta una alerta de datos, permitiendo desplegar el historial completo desde la barra superior y navegar directamente al módulo objetivo al hacer clic.',
        quePuedesVer: 'Verás el icono de Campana en la barra superior junto al botón Sincronizar. Al recibir una notificación, escucharás un chime armónico sutil y la campana mostrará un badge rojo con la cantidad no leída. Al presionar el botón "Marcar leídas" o hacer clic en un elemento, la notificación queda como vista y te lleva directamente al módulo correspondiente.',
        ejemploUso: 'Ejemplo: Al ejecutarse la auto-sincronización de 5m o una carga masiva, suena un tono suave. Haces clic en la Campana en la cabecera, ves la lista de alertas, presionas "Marcar leídas" o haces clic en una alerta de descalce para ir directo a Auditoría -> Bitácora de Integridad.'
      },
      changes: [
        'Sintetizador Nivel Audio Nativo (Web Audio API): Tonos armónicos sutiles (chime ascendente para éxito y tono doble para incidencias/errores) sin dependencias mp3.',
        'Centro de Notificaciones con Campana Flotante: Icono de Campana en la barra superior con contador de alertas no leídas.',
        'Botón Marcar como Leídas: Opción para marcar todo el historial como visto con un solo clic.',
        'Navegación Interactiva al Hacer Clic: Al hacer clic en cualquier notificación del desplegable, se marca como leída y redirige al módulo correspondiente.',
        'Persistencia Local de Notificaciones: Guardado de historial reciente en almacenamiento local.'
      ]
    },
    {
      id: 'v3.2.0',
      version: 'v3.2.0',
      fecha: '14 de Agosto, 2026',
      badge: 'NUEVA VERSIÓN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Protocolo de Auto-Sincronización Profunda 5m + Paridad Médica Policial/Judicial (Z04/Carabineros/PDI) + Motor Auditoría de Integridad',
      categoria: 'Integridad de Datos & Sincronización',
      icon: Cpu,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Implementación del Protocolo de Auto-Sincronización Profunda en segundo plano cada 5 minutos, paridad médica ampliada para constataciones médico-legales y custodia policial (Carabineros, PDI, Comisaría, Z04, Z65, Z02.7), botón Sincronizar con re-consulta activa a BigQuery/Firestore y Motor de Detección de Incidencias en la Barra Lateral y Pestaña de Auditoría.',
      instructivo: {
        paraQueSirve: 'Garantiza que todos los paneles, gráficos, reportes ejecutivos y subreportes del sitio (Resumen, Triage con J, Demanda, Profesionales, Constataciones, Altas Admin, Traslados y Radar) se mantengan 100% sincronizados con los datos fidedignos de la nube, alertando automáticamente ante cualquier discrepancia entre BigQuery y la BD.',
        quePuedesVer: 'Verás la hora exacta de la última sincronización en el botón de la cabecera (ej: 18:44 hrs). En la barra lateral izquierda, el nuevo Monitor de Integridad mostrará "Sistema En Línea" en verde si todo coincide, o "ALERTA INTEGRIDAD" en rojo si hay un descalce. En el módulo Auditoría, la nueva sub-pestaña "Bitácora de Integridad" te muestra el desglose comparativo indicador por indicador.',
        ejemploUso: 'Ejemplo: Cada 5 minutos el sistema consulta automáticamente la nube de forma silenciosa. Si un paciente es ingresado y derivado a Carabineros con código Z04.8, el sistema lo categoriza de inmediato en el subreporte de Constataciones y verifica que el contador coincida al 100% entre BigQuery y la BD local.'
      },
      changes: [
        'Protocolo de Auto-Sincronización Profunda cada 5m: Temporizador silencioso en segundo plano que actualiza la base de datos sin interrumpir al usuario.',
        'Botón Sincronizar en Vivo: Re-consulta activa a Firestore y a la Cloud Function de BigQuery (obtenerKpisDashboard), con insignia de hora exacta de última sync.',
        'Paridad Médico-Legal Policial (Z04/Z65/Carabineros/PDI): Detección ampliada de atenciones médico-legales y custodia policial (Carabineros, PDI, Comisaría, Z04, Z65, Z02.7), recuperando +75 registros históricos en 2026.',
        'Motor de Detección de Incidencias en Sidebar: Alerta roja intermitente (ALERTA INTEGRIDAD) en el menú lateral ante cualquier descalce >0.5% entre BigQuery SSOT y la BD.',
        'Sub-Pestaña Bitácora de Integridad en Auditoría: Nueva vista comparativa indicador por indicador (Admitidos, Atendidos, Altas, Traslados, Constataciones y Triage) dentro del módulo de Auditoría.'
      ]
    },
    {
      id: 'v3.1.0',
      version: 'v3.1.0',
      fecha: '12 de Agosto, 2026',
      badge: 'NUEVA VERSIÓN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Arquitectura de Consulta Directa BigQuery SSOT + Selector Chileno DD/MM/YYYY + Encuadre Horario Fino por Turno (America/Santiago)',
      categoria: 'Arquitectura & Precisión SSOT',
      icon: Cpu,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Migración completa del motor de procesamiento a BigQuery en arquitectura SSOT (Single Source of Truth) tipo Tableau/Looker Studio, selector interactivo de fechas en formato chileno DD/MM/YYYY, encuadre horario fino por turno en UTC-4 y paridad matemática del 100% certificada con el sistema oficial Rayen PDF.',
      instructivo: {
        paraQueSirve: 'Garantiza que todas las métricas, KPIs, Curva de Demanda y Comparativa de Equipos muestren una paridad matemática exacta del 100% con los informes oficiales en PDF emitiendo por Rayen, encuadrando automáticamente por huso horario chileno (America/Santiago / UTC-4).',
        quePuedesVer: 'Al seleccionar un turno específico en el filtro de cabecera (por ejemplo 10/08 16:00 a 11/08 08:00), tanto la tarjeta del Periodo Seleccionado como la Curva de Demanda Continua y la Comparativa de Equipos se sincronizan automáticamente para mostrar los 101 pacientes del Turno Largo Noche de Rayen.',
        ejemploUso: 'Ejemplo: Seleccionas 10/08/2026 a las 04:00 PM hasta el 11/08/2026 a las 08:00 AM. El sistema ejecuta la consulta SQL desduplicada en BigQuery, ajusta la estampa de tiempo en UTC-4 y te entrega exactamente 101 pacientes admitidos, 87 atendidos y 14 altas administrativas sin necesidad de descargas pesadas en el navegador.'
      },
      changes: [
        'Arquitectura SSOT Pushdown BigQuery: Migración total de procesamiento de datos masivos a la vista maestra metrico_analytics.v_pacientes_urgencia_master desduplicada en BigQuery, operando como Tableau o Looker Studio.',
        'Selector de Fecha Nativo Chileno DD/MM/YYYY: Implementación del componente de calendario interactivo ChileanDatePicker adaptado al estándar chileno.',
        'Encuadre Horario Fino por Turno (America/Santiago): Ajuste de estampas de tiempo con offset -04:00 permitiendo filtrar cortes horarios exactos por turno (ej: 16:00 a 08:00 hrs).',
        'Sincronización Total de Curva de Demanda: Eliminación de descalces en la Curva de Demanda Continua al vincularla directamente al pipeline de BigQuery SSOT por hora.',
        'Filtrado Dinámico en Comparativa de Equipos: Ajuste por ventana de horas que incluye únicamente las pautas de turno que operaron en el tramo seleccionado.',
        'Paridad Matemática Certificada con Rayen PDF: Verificación de cero descalce frente a reportes físicos oficiales del software clínico Rayen (101 admitidos, 85 completados, 14 altas admin, 14 centros de inscripción).'
      ]
    },
    {
      id: 'v3.0.0',
      version: 'v3.0.0',
      fecha: '09 de Agosto, 2026',
      badge: 'NUEVA VERSIÓN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Motor de Pre-Carga 6 Meses IndexedDB + Barra de Progreso en Vivo + Rediseño Correo + Arquitectura BigQuery SSOT',
      categoria: 'Arquitectura & Rendimiento',
      icon: Cpu,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Implementación del motor de pre-carga local en IndexedDB para los últimos 6 meses de atenciones con barra de progreso flotante en tiempo real, rediseño de correos en cápsulas apiladas idénticas al Dashboard y refactorización total en Google BigQuery.',
      instructivo: {
        paraQueSirve: 'Garantiza una velocidad de respuesta instantánea al abrir la aplicación guardando los últimos 6 meses en caché IndexedDB, mientras permite consultar bajo demanda cualquier rango histórico previo con barra de progreso en vivo.',
        quePuedesVer: 'Al ingresar o sincronizar, verás en la parte inferior derecha la nueva Barra de Progreso Flotante en Tiempo Real. En los informes ejecutivos por correo, las comparativas muestran cápsulas apiladas idénticas al panel "Periodo Seleccionado".',
        ejemploUso: 'Ejemplo: Al abrir el sitio, el motor precarga los últimos 6 meses mostrando el porcentaje (0% a 100%) y volumen descargado. Si cambias el filtro a un periodo histórico de 2025, el indicador te informa el progreso de la consulta en vivo.'
      },
      changes: [
        'Pre-Carga de 6 Meses en IndexedDB: Almacenamiento local de alto rendimiento que elimina demoras de carga inicial.',
        'Barra de Progreso Flotante en Tiempo Real: Indicador de avance con porcentaje (0% a 100%) y volumen de admisiones descargadas.',
        'Rediseño de Correos Ejecutivos Estilo Dashboard: Tarjetas KPI superior y bitácora asistencial con cápsulas apiladas (Vs Mes Ant. y Vs Año Ant.).',
        'Auto-Sincronización de Filtros de Fecha: Ajuste automático del día fin al seleccionar una fecha de inicio para encuadre directo.',
        'Ajuste Asistencial de Triaje: Eliminación de estándares artificiales de 15m en favor de métricas de optimización operacionales reales.',
        'Arquitectura BigQuery (SSOT): Creación de la vista maestra SQL metrico_analytics.v_pacientes_urgencia_master como única fuente de verdad.'
      ]
    },
    {
      id: 'v2.9.5',
      version: 'v2.9.5',
      fecha: '08 de Agosto, 2026',
      badge: 'ACTUALIZACIÓN',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Solución Definitiva de Auditoría Histórica + Formato PDF Hoja Carta de 2 Páginas + CID Logo Inline',
      categoria: 'Despacho & Auditoría',
      icon: Mail,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Desacoplamiento total de la auditoría de turnos frente a los filtros de fecha de la interfaz visual, adjunto automático de PDF Hoja Carta en 2 páginas con subreportes detallados e incrustación CID del logo para evitar el recorte de mensajes en Gmail.',
      instructivo: {
        paraQueSirve: 'Garantiza que los informes por correo siempre reconozcan y envíen el último turno 100% cerrado (retrocediendo automáticamente al día previo si el día actual no ha finalizado) y adjunten el PDF oficial de 2 páginas con todos los indicadores asistenciales.',
        quePuedesVer: 'Al ingresar al modal de configuración de correo, el sistema seleccionará y auditará automáticamente el turno cerrado anterior (ej. 05/08/2026), mostrando todos sus adjuntos físicos (PDF de 2 páginas, CSV y Bitácora).',
        ejemploUso: 'Ejemplo: Si estás viendo el día 06/08 en la pantalla y el turno está incompleto, el motor de auditoría busca en la base de datos completa de 30 días, selecciona el turno del 05/08/2026 y despacha el correo con el informe completo sin recortarse en Gmail.'
      },
      changes: [
        'Desacoplamiento de Filtros UI: La auditoría consulta la base de datos completa de los últimos 30 días sin verse limitada por el rango de fechas seleccionado en la pantalla.',
        'Documento PDF Oficial de 2 Páginas: Página 1 con Banner institucional, Badge de auditoría y matriz KPI; Página 2 con el desglose consolidado de los 5 sub-reportes asistenciales.',
        'Optimización de Logo CID Inline: Reemplazo del Base64 por adjunto CID, reduciendo el HTML a 4KB y evitando el colapso de mensajes en Gmail.',
        'Sanitización de Caracteres en PDF: Implementación de la función cleanPdfText para compilación ultrarrápida sin errores tipográficos.'
      ]
    },
    {
      id: 'v2.9.0',
      version: 'v2.9.0',
      fecha: '08 de Agosto, 2026',
      badge: 'MEJORA',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Sistema Automatizado de Envío de Informes Ejecutivos por Correo + Adjunto PDF Hoja Carta + Auditoría de Turnos',
      categoria: 'Despacho & Auditoría',
      icon: Mail,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Despacho automatizado de informes ejecutivos auditados con adjuntos PDF en Hoja Carta, control estricto de completitud de turnos (semana y fin de semana por equipo), logo institucional del SAR y registro en vivo en el Panel de Auditoría.',
      instructivo: {
        paraQueSirve: 'Sirve para programar y enviar automáticamente los informes de urgencia a las jefaturas y dirección asistencial por correo electrónico en formato PDF y CSV, manteniendo la rotativa oficial de equipos (Equipos 1, 2 y 3) y garantizando que ningún turno se duplique ni se envíe incompleto.',
        quePuedesVer: 'En el menú lateral encontrarás el nuevo botón "Informe por Correo". Al presionar el botón de prueba o guardar la configuración, el sistema genera el informe, adjunta el PDF en Hoja Carta y registra la constancia en el módulo de "Auditoría".',
        ejemploUso: 'Ejemplo: El lunes a las 09:00 AM, el sistema realiza el barrido automático de fin de semana y envía 3 correos y PDFs independientes correspondientes al Viernes Noche, Sábado (Día y Noche) y Domingo (Día y Noche), indicando en cada uno el Equipo de Turno responsable (Equipo 1, 2 o 3).'
      },
      changes: [
        'Despacho de Adjuntos Físicos en PDF (Hoja Carta): Generación nativa en tiempo real del archivo PDF oficial con todos los sub-reportes seleccionados y tabla de KPIs.',
        'Desglose Estricto por Día y Equipo de Turno: Separación en fin de semana y festivos para el Turno Día (08:00 - 20:00) y Turno Noche (20:00 - 08:00) asignados al Equipo correspondiente (Equipos 1, 2 y 3).',
        'Cómputo Inteligente de Tolerancia de Turnos: Conteo de admisiones de semana desde las 16:00 hrs e inclusión de extensión hasta las 09:00 AM para continuidad de cierre.',
        'Prueba Estricta de Completitud (100% Auditado): Verificación automática que descarta turnos parciales (cortados a medianoche) y busca el último turno con datos 100% cerrados.',
        'Incrustación de Identidad Visual SAR Elsa Romo Aravena: Logo oficial del SAR incrustado en la cabecera superior del correo.',
        'Registro en Tiempo Real en el Módulo de Auditoría: Registro de cada envío manual o automático en el panel de auditoría con fecha, hora, turno, destinatarios y lista de adjuntos.'
      ]
    },
    {
      id: 'v2.8.5',
      version: 'v2.8.5',
      fecha: '07 de Agosto, 2026',
      badge: 'ACTUALIZACIÓN',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Módulo Interactivo de Prueba de Control e Integridad de Datos + Tarjetas Desplegables',
      categoria: 'Integridad & Control',
      icon: Sparkles,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Sistema de verificación dinámica de control cuantitativo (SAR Elsa Romo Aravena), tarjetas mensuales con acordeón desplegable y adaptación del vocabulario asistencial a español chileno.',
      instructivo: {
        paraQueSirve: 'Sirve para auditar y certificar que las cifras estadísticas registradas en MÉTRICO coinciden en un 100% matemático exacto con los informes oficiales en PDF/Excel emitidos por la dirección del SAR Elsa Romo Aravena.',
        quePuedesVer: 'En la pestaña "Demanda de Atención", encontrarás el nuevo botón verde "Ejecutar Prueba de Control". Al presionarlo, se abre un modal interactivo donde puedes seleccionar cualquier año/mes, digitar tus cifras oficiales y ver la matriz comparativa en tiempo real.',
        ejemploUso: 'Ejemplo: Para auditar Mayo 2026, abres el modal, seleccionas Mayo 2026, digitas 4.110 Admitidos, 3.676 Completados, 93 Sin Atención y 341 Egreso Admin. El sistema valida automáticamente que 3676 + 93 + 341 = 4110 y marca el mes con el sello verde de "Control SAR Verificado".'
      },
      changes: [
        'Formulario de Prueba de Control en Vivo: Permite ingresar datos de reportes oficiales (Admitidos, Atendidos, Altas sin Atención, Egresos Admin) y ejecutar auditorías de concordancia 100%.',
        'Validación Matemática en Tiempo Real: Comprueba automáticamente que Admitidos == Completados + Sin Atención + Egreso Admin, alertando cualquier incoherencia en los datos.',
        'Certificación de Control SAR: Sello de verificado para Mayo 2026 (4.110 admitidos, 3.676 atendidos y 434 altas administrativas exactos).',
        'Tarjetas Mensuales Desplegables: Rediseño protagónico para Pacientes Admitidos con botón de acordeón para revelar Atendidos y Altas.',
        'Estandarización Vocabulario Asistencial Chileno: Sustitución de la palabra "pico" por Peak Asistencial, Peak de Demanda y Sobrecarga Hospitalaria en todo el sistema.',
        'Solución en Estadísticas de Fractura: Corrección de error de ejecución en comparativas interanuales YoY e inclusión del grupo etario con mayor porcentaje de fracturas.'
      ]
    },
    {
      id: 'v2.8.0',
      version: 'v2.8.0',
      fecha: '05 de Agosto, 2026',
      badge: 'ACTUALIZACIÓN',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Potenciación Cognitiva del Radar Predictivo & Calidad del Aire en Vivo',
      categoria: 'IA & Radar',
      icon: Sparkles,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Integración completa de la IA de Gemini 1.5 Flash, alertas sanitarias MINSAL en tiempo real y calidad de aire diaria por Open-Meteo.',
      instructivo: {
        paraQueSirve: 'Sirve para anticipar sobrecargas hospitalarias cruzando pronóstico del clima a 7 días, índice de calidad del aire AQI y alertas epidemiológicas oficiales del MINSAL.',
        quePuedesVer: 'En la pestaña "Radar Predictivo", verás 7 tarjetas climáticas diarias con temperatura mín/máx, mm de lluvia e índice AQI, además del Agente Administrador IA Gemini que responde consultas clínicas en tiempo real.',
        ejemploUso: 'Ejemplo: Ante un pronóstico de helada (<5°C) seguido de lluvia en Melipilla, el Radar genera una alerta automática recomendando reforzar el triage C1-C3 y aumentar el stock de nebulizaciones y salbutamol para el día viernes.'
      },
      changes: [
        'Agente Epidemiológico IA (Gemini 1.5 Flash): Diagnóstico de sobrecarga asistencial cruzando clima, BigQuery ML y MINSAL.',
        'Rastreador RSS MINSAL Chile: Detección automática de alertas sanitarias oficiales y campañas invernales.',
        'Calidad del Aire Integrada en Vivo: Pronóstico a 7 días con índices AQI y PM2.5/PM10 por día en Melipilla.',
        'Matriz Causa-Efecto de 6 Fuentes: Informe técnico desplegable en modal con acciones preventivas para urgencias.',
        'Análisis de Clima Pasado vs Pacientes: Detección empírica de rebote asistencial post-lluvia (+28.2%) y heladas (<5°C).'
      ]
    },
    {
      id: 'v2.7.5',
      version: 'v2.7.5',
      fecha: '05 de Agosto, 2026',
      badge: 'NUEVA FUNCIONALIDAD',
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/20',
      title: 'Mapa Vectorial Interactivo de la Provincia de Melipilla',
      categoria: 'Geolocalización',
      icon: MapPin,
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      summary: 'Nuevo mapa recortado exclusivamente a la silueta de las 5 comunas provinciales sin elementos geográficos externos.',
      instructivo: {
        paraQueSirve: 'Sirve para visualizar espacialmente de dónde provienen los pacientes atendidos en la urgencia y detectar comunas con mayor presión asistencial.',
        quePuedesVer: 'En la pestaña "Sociodemográfico y Origen", verás el mapa exclusivo recortado con la silueta de Melipilla, María Pinto, Curacaví, San Pedro y Alhué con códigos de color de participación.',
        ejemploUso: 'Ejemplo: Al pasar el cursor sobre la comuna de Melipilla o Bollenar, el mapa despliega un tooltip dinámico mostrando el número exacto de pacientes admitidos y el % del total del mes.'
      },
      changes: [
        'Silueta Vectorial Exclusiva: Visualización limpia de Melipilla, Curacaví, María Pinto, San Pedro y Alhué.',
        'Interactividad Hover & Tooltips: Resaltado cromático individual con conteo de pacientes y porcentaje de participación.',
        'Integración Sociodemográfica: Muestra desglose comunal directo en el panel de origen y perfil de paciente.'
      ]
    },
    {
      id: 'v2.7.0',
      version: 'v2.7.0',
      fecha: '04 de Agosto, 2026',
      badge: 'MEJORA DE PANEL',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20',
      title: 'Rediseño Sociodemográfico y Análisis Demográfico en Inicio',
      categoria: 'Rendimiento Clínico',
      icon: BarChart2,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      summary: 'Retorno del análisis sociodemográfico al panel principal con tarjetas estilizadas y filtros interactivos.',
      instructivo: {
        paraQueSirve: 'Permite caracterizar la población usuaria del SAR según sexo, rango de edad y previsión (FONASA/ISAPRE).',
        quePuedesVer: 'En el Inicio, verás gráficos circulares y de barras con la distribución de usuarios por tramo de edad.',
        ejemploUso: 'Ejemplo: Filtrar por Triage C2 para identificar qué grupo etario demanda atención de mayor complejidad en la urgencia.'
      },
      changes: [
        'Reubicación estratégica de métricas de sexo, grupos etarios y previsión FONASA/ISAPRE.',
        'Filtros dinámicos cruzados por categoría de triage y comunas de la provincia.'
      ]
    },
    {
      id: 'v2.6.5',
      version: 'v2.6.5',
      fecha: '03 de Agosto, 2026',
      badge: 'ESTÁNDAR VISUAL',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20',
      title: 'Isotipo Oficial del SAR & Módulo de Reportes PDF',
      categoria: 'Rendimiento Clínico',
      icon: Layers,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      summary: 'Incorporación del logo institucional del SAR Elsa Romo Aravena en reportes ejecutivos exportables.',
      instructivo: {
        paraQueSirve: 'Generar informes descargables en PDF con membrete institucional para la dirección del servicio y SSMOC.',
        quePuedesVer: 'En la sección "Generador de Reportes Ejecutivos", puedes seleccionar sub-reportes específicos y exportar en PDF.',
        ejemploUso: 'Ejemplo: Exportar el informe mensual de Fracturas o Altas con el logo oficial del SAR listo para presentar en reuniones de gestión.'
      },
      changes: [
        'Encabezado institucional oficial para impresiones y exportación de informes clínicos.',
        'Plantillas adaptables según selección de tipo de reporte específico o consolidado.'
      ]
    },
    {
      id: 'v2.6.0',
      version: 'v2.6.0',
      fecha: '02 de Agosto, 2026',
      badge: 'SEGURIDAD',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20',
      title: 'Control de Inactividad & Auditoría de Registro en Firestore',
      categoria: 'Seguridad',
      icon: Cpu,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      summary: 'Sistema automático de cierre de sesión por inactividad y registro en vivo de navegaciones en Firestore.',
      instructivo: {
        paraQueSirve: 'Garantizar la protección de datos de salud cerrando sesiones inactivas automáticamente.',
        quePuedesVer: 'Un aviso emergente con cuenta regresiva de 60 segundos antes de cerrar sesión tras 15 minutos sin uso.',
        ejemploUso: 'Ejemplo: Si dejas el equipo desatendido en el box médico, el sistema protege los datos cerrando sesión de forma segura.'
      },
      changes: [
        'Modal de advertencia con cuenta regresiva antes del auto-logout por inactividad (15 min).',
        'Audit Log en Firestore para trazabilidad de consultas y modificaciones por usuario.'
      ]
    }
  ];

  const filteredUpdates = selectedCat === 'TODOS' 
    ? updatesList 
    : updatesList.filter(u => u.categoria === selectedCat);

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-card-custom w-full max-w-4xl rounded-3xl border border-card-custom shadow-2xl p-6 md:p-8 space-y-6 theme-transition my-8">
        
        {/* HEADER DEL MURO DE ACTUALIZACIONES */}
        <div className="flex items-start justify-between border-b border-card-custom/60 pb-5">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-xs flex-shrink-0 animate-bounce">
              <Megaphone className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  Histórico de Versiones & Instructivos
                </span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  v3.1.0 (Activa)
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-primary-custom tracking-tight mt-1">
                Muro de Novedades e Instructivos del Sistema MÉTRICO
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-card-custom border border-card-custom hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-secondary-custom cursor-pointer"
            title="Cerrar Muro"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FILTROS POR CATEGORÍA */}
        <div className="flex flex-wrap items-center gap-2 border-b border-card-custom/50 pb-4">
          <span className="text-xs font-bold text-secondary-custom flex items-center gap-1 mr-2">
            <Filter className="w-3.5 h-3.5" /> Filtrar por:
          </span>
          {['TODOS', 'Integridad & Control', 'IA & Radar', 'Geolocalización', 'Rendimiento Clínico', 'Seguridad'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCat === cat 
                  ? 'accent-bg-custom text-white shadow-sm' 
                  : 'bg-black/5 dark:bg-white/5 text-secondary-custom hover:text-primary-custom border border-card-custom'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* LISTADO TIPO TIMELINE / MURO DE NOVEDADES CON INSTRUCTIVO */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredUpdates.map((item) => {
            const IconComp = item.icon;
            return (
              <div 
                key={item.id} 
                className="bg-slate-50/60 dark:bg-slate-900/40 p-5 rounded-2xl border border-card-custom space-y-4 hover:border-indigo-500/40 transition-all shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-card-custom/40 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${item.iconBg}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-primary-custom">{item.version}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="text-sm md:text-base font-black text-primary-custom mt-0.5">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-secondary-custom font-medium self-start sm:self-auto">
                    <Clock className="w-3.5 h-3.5 opacity-70" />
                    <span>{item.fecha}</span>
                  </div>
                </div>

                <p className="text-xs font-medium text-secondary-custom leading-relaxed">
                  {item.summary}
                </p>

                {/* BLOQUE DE INSTRUCTIVO Y GUÍA PRÁCTICA */}
                {item.instructivo && (
                  <div className="bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-300 tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-indigo-500" /> Instructivo & Guía Práctica de Uso:
                    </h4>
                    
                    <div className="space-y-2 text-xs">
                      <div className="bg-card-custom p-3 rounded-xl border border-card-custom/60 space-y-0.5">
                        <span className="font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1 text-[11px]">
                          <BookOpen className="w-3.5 h-3.5" /> ¿Para qué sirve?
                        </span>
                        <p className="text-primary-custom font-medium leading-relaxed">{item.instructivo.paraQueSirve}</p>
                      </div>

                      <div className="bg-card-custom p-3 rounded-xl border border-card-custom/60 space-y-0.5">
                        <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                          <Eye className="w-3.5 h-3.5" /> ¿Qué puedes ver y hacer?
                        </span>
                        <p className="text-primary-custom font-medium leading-relaxed">{item.instructivo.quePuedesVer}</p>
                      </div>

                      <div className="bg-card-custom p-3 rounded-xl border border-card-custom/60 space-y-0.5">
                        <span className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1 text-[11px]">
                          <Lightbulb className="w-3.5 h-3.5" /> Ejemplo Concreto de Uso:
                        </span>
                        <p className="text-primary-custom font-medium leading-relaxed">{item.instructivo.ejemploUso}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* CAMBIOS DETALLADOS */}
                <div className="bg-card-custom p-3.5 rounded-xl border border-card-custom/60 space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-secondary-custom tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Novedades e Implementaciones Destacadas:
                  </h4>
                  <ul className="space-y-1 text-xs text-primary-custom font-semibold list-disc list-inside">
                    {item.changes.map((change, idx) => (
                      <li key={idx} className="leading-snug">
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER MODAL */}
        <div className="pt-4 border-t border-card-custom flex items-center justify-between text-xs text-secondary-custom">
          <span className="font-bold text-[11px]">MÉTRICO Clínico Predictivo • SAR Elsa Romo Aravena</span>
          <button 
            onClick={onClose}
            className="px-5 py-2.5 accent-bg-custom text-white font-black rounded-2xl shadow-md transition-all cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
