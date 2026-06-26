const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'Dashboard.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Replace imports and setup
content = content.replace(/\/\/ === FIREBASE SETUP ===[\s\S]*?\} catch \(error\) \{[\s\S]*?\}/, `import { auth, db, appId } from '../config/firebase';
import { collection, doc, writeBatch, updateDoc, deleteDoc } from 'firebase/firestore';
import { useMetricoData } from '../hooks/useMetricoData';
import { useMetricoAnalytics } from '../hooks/useMetricoAnalytics';
import { useMetricoDemanda } from '../hooks/useMetricoDemanda';
import { useMetricoProfesionales } from '../hooks/useMetricoProfesionales';`);

// 2. Replace Global States
content = content.replace(/\/\/ === ESTADOS GLOBALES ===[\s\S]*?const \[turnosDB, setTurnosDB\] = useState\(\[\]\);/, `// === ESTADOS GLOBALES ===
  const [activeTab, setActiveTab] = useState('resumen');
  const [notification, setNotification] = useState(null);
  
  const { user, loading, syncStatus, setSyncStatus, setLoading, pacientesDB, turnosDB } = useMetricoData();`);

// 3. Keep loadSheetJS effect, remove auth and db effects
content = content.replace(/\/\/ === EFECTOS DE INICIALIZACIÓN ===[\s\S]*?return \(\) => \{ unsubPacientes\(\); unsubTurnos\(\); \};\s*\}, \[user\]\);/m, `// === EFECTOS DE INICIALIZACIÓN ===
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
  }, []);`);

// 4. Replace useMemo blocks
// Find start: const turnosFiltrados = useMemo(
// Find end: return \{[\s\S]*?otrosCentros[\s\S]*?\};\s*\}, \[demografiaStats\]\);
content = content.replace(/\/\/ === LÓGICA DE CARGA MASIVA ===/g, '// LÓGICA DE CARGA MASIVA'); // ensure no collision

content = content.replace(/\s*\/\/ =========================================================================\s*\/\/ 1\. PIPELINE DE DATOS GLOBAL \(Afecta KPIs, Triaje, Tabla Global\)[\s\S]*?const renderResumen = \(\) => \(/m, 
`
  const { turnosFiltrados, pacientesFiltrados, demografiaStats, promediosGlobales, metricsByCategory, statsKPI, rankingCentros } = useMetricoAnalytics(pacientesDB, turnosDB, filtroFechaInicio, filtroFechaFin);
  const { turnosDemanda, pacientesDemanda, peakHoursData } = useMetricoDemanda(pacientesDB, turnosDB, demandaFechaInicio, demandaFechaFin, modoComparativo, filtroFechaInicioB, filtroFechaFinB, docsToCompare);
  const { turnosProf, pacientesProf, metricsByDoctor, filteredMetricsByDoctor, dailyDoctorData } = useMetricoProfesionales(pacientesDB, turnosDB, profFechaInicio, profFechaFin, docsToCompare, searchDoctor);

  const renderResumen = () => (`);

fs.writeFileSync(file, content, 'utf8');
console.log("Replaced successfully!");
