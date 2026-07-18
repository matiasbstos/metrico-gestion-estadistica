const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const downloadsDir = 'C:\\Users\\Datos Gestion Sar\\Downloads';
const files = fs.readdirSync(downloadsDir)
  .filter(f => f.endsWith('.xlsx'))
  .map(f => ({ name: f, path: path.join(downloadsDir, f) }));

files.forEach(targetFile => {
  try {
    const workbook = XLSX.readFile(targetFile.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (rows.length === 0) return;

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
    const estadoIdx = headers.findIndex(h => h.toUpperCase().includes('ESTADO'));

    let falseCanceladas = [];

    rowsData.forEach((row, idx) => {
      if (!row || row.length === 0) return;
      
      const rawEstado = String(row[estadoIdx] || '').trim();
      const rowStrLower = row.map(c => String(c || '').toLowerCase()).join(' ');
      
      const containsCanceladInRow = rowStrLower.includes('cancelad');
      const isEstadoCancelada = rawEstado.toLowerCase().includes('cancelad');

      if (containsCanceladInRow && !isEstadoCancelada) {
        falseCanceladas.push({
          rowLine: headerIdx + idx + 2,
          rawEstado: rawEstado,
          rowValues: row.slice(0, 10) // Muestra los primeros 10 campos
        });
      }
    });

    if (falseCanceladas.length > 0) {
      console.log(`\n[ALERTA] Archivo: ${targetFile.name}`);
      console.log(`Se detectaron ${falseCanceladas.length} filas donde 'Cancelada' se activó por coincidencia en la fila, pero su Estado real era diferente:`);
      falseCanceladas.forEach(fc => {
        console.log(`  - Fila ${fc.rowLine}: Estado real="${fc.rawEstado}". Campos: ${JSON.stringify(fc.rowValues)}`);
      });
    } else {
      console.log(`\n[OK] Archivo: ${targetFile.name} - No hay falsos positivos de 'Cancelada'.`);
    }

  } catch (err) {
    // Silently continue
  }
});
