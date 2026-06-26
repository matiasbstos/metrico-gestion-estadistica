const fs = require('fs');
const path = require('path');

const codigoPath = path.join(__dirname, 'codigo_completo.txt');
const dashboardPath = path.join(__dirname, 'src', 'components', 'Dashboard.jsx');

const codigoCompleto = fs.readFileSync(codigoPath, 'utf8');

// 1. Extract imports from current Dashboard
const currentDashboard = fs.readFileSync(dashboardPath, 'utf8');
const importsMatch = currentDashboard.match(/import[\s\S]*?(?=\n\n|\nconst)/);
let importsStr = importsMatch ? importsMatch[0] : '';

// Make sure we have the new component imports!
importsStr += `
import PanelKPIs from './dashboard/PanelKPIs';
import FiltrosGlobales from './dashboard/FiltrosGlobales';
import GraficoDinamico from './dashboard/GraficoDinamico';
import AnalisisSociodemografico from './dashboard/AnalisisSociodemografico';
import TablaTiemposEspera from './dashboard/TablaTiemposEspera';
import CurvaDemanda from './dashboard/CurvaDemanda';
import AnalisisProfesionales from './dashboard/AnalisisProfesionales';
import DataGridTurnos from './dashboard/DataGridTurnos';
`;

// Extract constants
const constantsRegex = /(const COLORS = [\s\S]*?const DOC_COLORS = [\s\S]*?\}\n)/;
const constantsMatch = codigoCompleto.match(constantsRegex);
const constantsStr = constantsMatch ? constantsMatch[0] : '';

// Extract DashboardContent component shell
// We'll write it from scratch to be safe.
const newDashboardContent = `
const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [notification, setNotification] = useState(null);
  const [pendingUpload, setPendingUpload] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [manualForm, setManualForm] = useState({
    fechaInicio: '', fechaFin: '', horario: '08:00 - 20:00',
    c1: 0, c2: 0, c3: 0, c3_z518: 0, c4: 0, c5: 0, altasAdmin: 0, totalPacientes: 0
  });

  const today = new Date();
  const currentDay = today.toISOString().split('T')[0];
  const [filtroFechaInicio, setFiltroFechaInicio] = useState(currentDay);
  const [filtroFechaFin, setFiltroFechaFin] = useState(currentDay);
  const [modoComparativo, setModoComparativo] = useState(false);
  const [filtroFechaInicioB, setFiltroFechaInicioB] = useState('');
  const [filtroFechaFinB, setFiltroFechaFinB] = useState('');
  
  const [demandaFechaInicio, setDemandaFechaInicio] = useState(currentDay);
  const [demandaFechaFin, setDemandaFechaFin] = useState(currentDay);
  const [demandaViewMode, setDemandaViewMode] = useState('total');

  const [profFechaInicio, setProfFechaInicio] = useState(currentDay);
  const [profFechaFin, setProfFechaFin] = useState(currentDay);
  const [docsToCompare, setDocsToCompare] = useState([]);
  const [searchDoctor, setSearchDoctor] = useState('');
  const [profesionalesChartType, setProfesionalesChartType] = useState('ambos');

  const [tipoGrafico, setTipoGrafico] = useState('compuesto');
  const [metricasGrafico, setMetricasGrafico] = useState(['totalPacientes']);
  const [filtroVariables, setFiltroVariables] = useState('');
  const [paginaTurnos, setPaginaTurnos] = useState(1);
  const turnosPorPagina = 10;

  const { user, loading, syncStatus, setSyncStatus, setLoading, pacientesDB, turnosDB } = useMetricoData();

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
    if (demandaViewMode === 'periodos' && !modoComparativo) setDemandaViewMode('total');
    if (demandaViewMode === 'doctores' && docsToCompare.length === 0) setDemandaViewMode('total');
  }, [modoComparativo, docsToCompare, demandaViewMode]);

  const showNotif = (msg, type = 'info') => {
    setNotification({ msg: String(msg), type });
    setTimeout(() => setNotification(null), 5000);
  };

  const perc = (val, tot) => tot > 0 ? ((val / tot) * 100).toFixed(1) : 0;
  
  const AGE_RANGES = ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'];

  const formatTime = (minutes) => {
    if (isNaN(minutes) || minutes < 0 || minutes === null) return '-';
    if (minutes < 60) return \`\${Math.round(minutes)} min\`;
    const h = Math.floor(minutes / 60); const m = Math.round(minutes % 60);
    return \`\${h}h \${m}m\`;
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

  const { turnosFiltrados, pacientesFiltrados, demografiaStats, promediosGlobales, metricsByCategory, statsKPI, rankingCentros } = useMetricoAnalytics(pacientesDB, turnosDB, filtroFechaInicio, filtroFechaFin);
  const { turnosDemanda, pacientesDemanda, peakHoursData } = useMetricoDemanda(pacientesDB, turnosDB, demandaFechaInicio, demandaFechaFin, modoComparativo, filtroFechaInicioB, filtroFechaFinB, docsToCompare);
  const { turnosProf, pacientesProf, metricsByDoctor, filteredMetricsByDoctor, dailyDoctorData } = useMetricoProfesionales(pacientesDB, turnosDB, profFechaInicio, profFechaFin, docsToCompare, searchDoctor);

  const toggleDocToCompare = (docName) => {
    setDocsToCompare(prev => prev.includes(docName) ? prev.filter(d => d !== docName) : [...prev, docName]);
  };
  const clearDocComparison = () => setDocsToCompare([]);

  const totalPaginasTurnos = Math.ceil(turnosDB.length / turnosPorPagina) || 1;
  const turnosPaginados = useMemo(() => {
    return turnosDB.slice((paginaTurnos - 1) * turnosPorPagina, paginaTurnos * turnosPorPagina);
  }, [turnosDB, paginaTurnos]);

  // Variables para GraficoDinamico
  const METRIC_LABELS = {
      totalPacientes: 'Total Pacientes', altasAdmin: 'Altas Admin',
      c1: 'C1', c2: 'C2', c3: 'C3', c3_z518: 'C3 (Lesiones)', c4: 'C4', c5: 'C5'
  };
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
        <div className={\`w-4 h-4 rounded transition border \${metricasGrafico.includes(metric.value) ? 'border-transparent' : 'border-slate-300 group-hover:border-slate-400'}\`} style={{ backgroundColor: metricasGrafico.includes(metric.value) ? metric.color : 'transparent' }}>
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
    return turnosFiltrados.slice().reverse().map(t => {
      const row = { name: t.fechaInicio === t.fechaFin ? t.fechaInicio : \`\${t.fechaInicio} - \${t.fechaFin}\` };
      metricasGrafico.forEach(m => {
        if (METRIC_LABELS[m]) {
          row[m] = Number(t[m] || 0);
        } else {
          const pacs = pacientesFiltrados.filter(p => p.loteId === t.loteId);
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
  }, [turnosFiltrados, pacientesFiltrados, metricasGrafico, modoComparativo]);

  const pieData = useMemo(() => {
    if (modoComparativo) return [];
    return ['c1', 'c2', 'c3', 'c3_z518', 'c4', 'c5'].map(c => ({
      name: c === 'c3_z518' ? 'C3 (Lesiones)' : c.toUpperCase(),
      value: turnosFiltrados.reduce((acc, t) => acc + Number(t[c] || 0), 0)
    })).filter(d => d.value > 0);
  }, [turnosFiltrados, modoComparativo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 font-sans">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-sm w-full text-center border border-slate-100">
          <Activity className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Conectando a METRICO</h2>
          <p className="text-sm text-slate-500 mb-6">Sincronizando registros encriptados...</p>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-2"><div className="bg-blue-600 h-2 rounded-full w-2/3 animate-pulse"></div></div>
          <p className="text-[10px] text-slate-400 font-mono">Buscando actualizaciones ({syncStatus})</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-slate-700 bg-slate-50 p-6 min-h-screen font-sans pb-12">
      {notification && (
        <div className={\`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-sm font-medium z-50 animate-bounce-in \${notification.type === 'error' ? 'bg-red-600 text-white' : notification.type === 'warning' ? 'bg-orange-500 text-white' : 'bg-emerald-600 text-white'}\`}>
          {notification.msg}
        </div>
      )}

      <PanelKPIs statsKPI={statsKPI} COLORS={COLORS} />

      <FiltrosGlobales 
        modoComparativo={modoComparativo}
        setModoComparativo={setModoComparativo}
        filtroFechaInicio={filtroFechaInicio}
        setFiltroFechaInicio={setFiltroFechaInicio}
        filtroFechaFin={filtroFechaFin}
        setFiltroFechaFin={setFiltroFechaFin}
        filtroFechaInicioB={filtroFechaInicioB}
        setFiltroFechaInicioB={setFiltroFechaInicioB}
        filtroFechaFinB={filtroFechaFinB}
        setFiltroFechaFinB={setFiltroFechaFinB}
        applyDatePreset={applyDatePreset}
      />

      <GraficoDinamico 
        modoComparativo={modoComparativo}
        tipoGrafico={tipoGrafico}
        setTipoGrafico={setTipoGrafico}
        filtroVariables={filtroVariables}
        setFiltroVariables={setFiltroVariables}
        metricasGrafico={metricasGrafico}
        handleGraphToggleChange={handleGraphToggleChange}
        dynamicMetricKeys={dynamicMetricKeys}
        renderCheckbox={renderCheckbox}
        compareChartData={compareChartData}
        chartData={chartData}
        pieData={pieData}
        getColorForMetric={getColorForMetric}
        formatMetricName={formatMetricName}
        METRIC_LABELS={METRIC_LABELS}
        COLORS={COLORS}
        turnosFiltrados={turnosFiltrados}
      />

      <AnalisisSociodemografico 
        demografiaStats={demografiaStats}
        rankingCentros={rankingCentros}
        perc={perc}
        AGE_RANGES={AGE_RANGES}
      />

      <TablaTiemposEspera 
        metricsByCategory={metricsByCategory}
        promediosGlobales={promediosGlobales}
        formatTime={formatTime}
        COLORS={COLORS}
      />

      <CurvaDemanda 
        peakHoursData={peakHoursData}
        demandaFechaInicio={demandaFechaInicio}
        setDemandaFechaInicio={setDemandaFechaInicio}
        demandaFechaFin={demandaFechaFin}
        setDemandaFechaFin={setDemandaFechaFin}
        demandaViewMode={demandaViewMode}
        modoComparativo={modoComparativo}
        docsToCompare={docsToCompare}
        DOC_COLORS={DOC_COLORS}
      />

      <AnalisisProfesionales 
        profFechaInicio={profFechaInicio}
        setProfFechaInicio={setProfFechaInicio}
        profFechaFin={profFechaFin}
        setProfFechaFin={setProfFechaFin}
        searchDoctor={searchDoctor}
        setSearchDoctor={setSearchDoctor}
        docsToCompare={docsToCompare}
        toggleDocToCompare={toggleDocToCompare}
        clearDocComparison={clearDocComparison}
        filteredMetricsByDoctor={filteredMetricsByDoctor}
        dailyDoctorData={dailyDoctorData}
        profesionalesChartType={profesionalesChartType}
        setProfesionalesChartType={setProfesionalesChartType}
        DOC_COLORS={DOC_COLORS}
        formatTime={formatTime}
      />

      <DataGridTurnos 
        turnosPaginados={turnosPaginados}
        paginaTurnos={paginaTurnos}
        setPaginaTurnos={setPaginaTurnos}
        totalPaginasTurnos={totalPaginasTurnos}
        setEditModal={setEditModal}
        setDeleteConfirm={setDeleteConfirm}
        COLORS={COLORS}
      />

    </div>
  );
}
`;

const ErrorBoundaryComponent = `
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
`;

const finalFileContent = importsStr + '\\n' + constantsStr + '\\n' + newDashboardContent + '\\n' + ErrorBoundaryComponent;

fs.writeFileSync(dashboardPath, finalFileContent, 'utf8');
console.log('Successfully rebuilt Dashboard.jsx with exact requirements!');
