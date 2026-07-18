const XLSX = require('xlsx');
const path = require('path');

const filePath = 'C:\\Users\\Datos Gestion Sar\\Downloads\\Informe_Urgencia_Tiempo_Espera.xlsx';

const isWeekendOrHoliday = (dateObj) => {
  const dayOfWeek = dateObj.getDay();
  // 0 = Sunday, 6 = Saturday
  if (dayOfWeek === 0 || dayOfWeek === 6) return true;
  
  // Hardcoded known holidays in June for validation
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  const dateStr = `${y}-${m}-${d}`;
  
  // 29th of June is typically a holiday in Chile (San Pedro y San Pablo)
  if (m === '06' && d === '29') return true;
  
  return false;
};

const getShiftBoundaries = (tAdmMs) => {
  const d = new Date(tAdmMs);
  const hours = d.getHours();
  
  const today = new Date(tAdmMs);
  const yesterday = new Date(tAdmMs);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const isTodayWknd = isWeekendOrHoliday(today);
  const isYestWknd = isWeekendOrHoliday(yesterday);
  
  let logicalDate;
  let horario;

  // Regla 1: Fin de semana o Festivo (Continuo)
  if (isTodayWknd) {
    if (hours < 8) {
      logicalDate = yesterday;
      horario = isYestWknd ? '20:00 - 08:00 (Fin de semana Noche)' : '17:00 - 08:00 (Semana Largo)';
    } 
    else if (hours >= 8 && hours < 20) {
      logicalDate = today;
      horario = '08:00 - 20:00 (Fin de semana Día)';
    } 
    else {
      logicalDate = today;
      horario = '20:00 - 08:00 (Fin de semana Noche)';
    }
  } 
  // Regla 2: Día de semana
  else {
    if (hours < 15) {
      logicalDate = yesterday;
      horario = isYestWknd ? '20:00 - 08:00 (Fin de semana Noche)' : '17:00 - 08:00 (Semana Largo)';
    } 
    else {
      logicalDate = today;
      horario = '17:00 - 08:00 (Semana Largo)';
    }
  }

  const y = logicalDate.getFullYear();
  const m = String(logicalDate.getMonth() + 1).padStart(2, '0');
  const day = String(logicalDate.getDate()).padStart(2, '0');
  return { fechaInicio: `${y}-${m}-${day}`, horario };
};

const parseDateStr = (dString, tString) => {
  if (!dString) return null;
  try {
    let day, month, year;
    if (dString.includes('-')) { const p = dString.split('-'); year = p[0]; month = p[1]; day = p[2].split(' ')[0]; }
    else if (dString.includes('/')) { const p = dString.split('/'); day = p[0]; month = p[1]; year = p[2].split(' ')[0]; }
    else if (!isNaN(dString) && dString > 10000) {
        const excelDate = new Date((dString - 25569) * 86400 * 1000);
        return excelDate.getTime();
    } else return null;

    let hour = 0, min = 0, sec = 0;
    let extractedTimeStr = '';
    if (dString.includes(' ') || dString.includes('T')) extractedTimeStr = dString.split(/[ T]/)[1];
    else if (tString !== '') extractedTimeStr = tString.split(/[ T]/).pop(); 

    if (extractedTimeStr) {
        if (extractedTimeStr.includes(':')) {
            const tParts = extractedTimeStr.split(':');
            hour = parseInt(tParts[0] || 0); min = parseInt(tParts[1] || 0); sec = parseInt(tParts[2] || 0);
        } else if (!isNaN(extractedTimeStr)) {
            const totalSeconds = Math.round(parseFloat(extractedTimeStr) * 86400);
            hour = Math.floor(totalSeconds / 3600); min = Math.floor((totalSeconds % 3600) / 60); sec = totalSeconds % 60;
        }
    }
    if (!year || isNaN(year) || isNaN(hour)) return null;
    let fullYear = Number(year); if (fullYear < 100) fullYear += 2000;
    
    return new Date(fullYear, Number(month) - 1, Number(day), Number(hour), Number(min), Number(sec)).getTime();
  } catch (e) { return null; }
};

try {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Encontrar cabecera
  let headerIdx = -1;
  let headers = [];
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i].map(c => String(c || '').trim().toUpperCase());
    if (row.some(c => c.includes('FECHA') || c.includes('ESTADO') || c.includes('CORRELATIVO'))) {
      headerIdx = i;
      headers = rows[i].map(c => String(c || '').trim());
      break;
    }
  }

  const rowsData = rows.slice(headerIdx + 1);
  const fAdmIdx = headers.findIndex(h => h.toUpperCase().includes('FECHA ADMISION'));
  const hAdmIdx = headers.findIndex(h => h.toUpperCase().includes('HORA ADMISION'));
  const estadoIdx = headers.findIndex(h => h.toUpperCase().includes('ESTADO'));

  const shiftsMap = {};

  rowsData.forEach(row => {
    if (!row || row.length === 0) return;
    
    const fAdm = String(row[fAdmIdx] || '').trim();
    const hAdm = String(row[hAdmIdx] || '').trim();
    const estado = String(row[estadoIdx] || '').trim();
    
    const tAdm = parseDateStr(fAdm, hAdm);
    if (!tAdm) return;

    const shift = getShiftBoundaries(tAdm);
    const key = `${shift.fechaInicio} | ${shift.horario}`;

    if (!shiftsMap[key]) {
      shiftsMap[key] = {
        fecha: shift.fechaInicio,
        horario: shift.horario,
        total: 0,
        completa: 0,
        cancelada: 0,
        comenzada: 0,
        otros: 0
      };
    }

    shiftsMap[key].total++;
    if (estado === 'Completa') shiftsMap[key].completa++;
    else if (estado === 'Cancelada') shiftsMap[key].cancelada++;
    else if (estado === 'Comenzada') shiftsMap[key].comenzada++;
    else shiftsMap[key].otros++;
  });

  console.log("\n=== Resumen de Turnos en el Archivo ===");
  Object.keys(shiftsMap).sort().forEach(key => {
    const s = shiftsMap[key];
    console.log(`\nTurno: ${key}`);
    console.log(`  - Total Pacientes: ${s.total}`);
    console.log(`  - Completa (Atención finalizada): ${s.completa}`);
    console.log(`  - Cancelada (Alta Administrativa): ${s.cancelada}`);
    if (s.comenzada > 0) console.log(`  - Comenzada: ${s.comenzada}`);
    if (s.otros > 0) console.log(`  - Otros: ${s.otros}`);
  });

} catch (err) {
  console.error("Error al procesar el archivo:", err);
}
