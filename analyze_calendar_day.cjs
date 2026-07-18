const XLSX = require('xlsx');
const filePath = 'C:\\Users\\Datos Gestion Sar\\Downloads\\Informe_Urgencia_Tiempo_Espera.xlsx';

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
    
    return new Date(fullYear, Number(month) - 1, Number(day), Number(hour), Number(min), Number(sec));
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

  let totalPacientes = 0;
  let completas = 0;
  let canceladas = 0;

  rowsData.forEach(row => {
    if (!row || row.length === 0) return;
    
    const fAdm = String(row[fAdmIdx] || '').trim();
    const hAdm = String(row[hAdmIdx] || '').trim();
    const estado = String(row[estadoIdx] || '').trim();
    
    const tAdmDate = parseDateStr(fAdm, hAdm);
    if (!tAdmDate) return;

    const y = tAdmDate.getFullYear();
    const m = String(tAdmDate.getMonth() + 1).padStart(2, '0');
    const d = String(tAdmDate.getDate()).padStart(2, '0');
    const dateStr = `${d}/${m}/${y}`;

    if (dateStr === '24/06/2026') {
      totalPacientes++;
      if (estado === 'Completa') completas++;
      else if (estado === 'Cancelada') canceladas++;
    }
  });

  console.log(`Día Calendario 24/06/2026 (00:00 - 23:59):`);
  console.log(`- Total Pacientes: ${totalPacientes}`);
  console.log(`- Completa: ${completas}`);
  console.log(`- Cancelada (Altas Administrativas): ${canceladas}`);

} catch (err) {
  console.error("Error al procesar el archivo:", err);
}
