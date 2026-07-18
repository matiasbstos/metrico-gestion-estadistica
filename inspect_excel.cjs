const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const downloadsDir = 'C:\\Users\\Datos Gestion Sar\\Downloads';
const files = fs.readdirSync(downloadsDir)
  .filter(f => f.endsWith('.xlsx'))
  .map(f => ({ name: f, path: path.join(downloadsDir, f), time: fs.statSync(path.join(downloadsDir, f)).mtime }))
  .sort((a, b) => b.time - a.time);

if (files.length === 0) {
  console.log("No se encontraron archivos Excel (.xlsx) en la carpeta de Descargas.");
  process.exit(0);
}

files.forEach(targetFile => {
  console.log("\n==================================================");
  console.log(`Archivo: ${targetFile.name} (${targetFile.time.toLocaleString()})`);
  console.log("==================================================");

  try {
    const workbook = XLSX.readFile(targetFile.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (rows.length === 0) {
      console.log("El archivo está vacío.");
      return;
    }

    // Encontrar fila de cabecera
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

    if (headerIdx === -1) {
      headerIdx = 0;
      headers = rows[0].map(c => String(c || '').trim());
    }

    // Encontrar índices de interés
    const getColIdx = (keywords) => {
      return headers.findIndex(h => {
        const normalized = h.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
        return keywords.some(k => normalized.includes(k.toUpperCase()));
      });
    };

    const estadoIdx = getColIdx(['ESTADO', 'STATUS']);
    const tipoAltaIdx = getColIdx(['TIPO DE ALTA', 'TIPO ALTA', 'MOTIVO DE ALTA', 'MOTIVO ALTA', 'DESTINO', 'EGRESO', 'ALTA']);
    
    console.log(`Columna Estado: ${estadoIdx !== -1 ? `[${estadoIdx}] "${headers[estadoIdx]}"` : 'No encontrada'}`);
    console.log(`Columna Tipo/Motivo Alta: ${tipoAltaIdx !== -1 ? `[${tipoAltaIdx}] "${headers[tipoAltaIdx]}"` : 'No encontrada'}`);

    const statusCounts = {};
    const altaCounts = {};
    const rowsData = rows.slice(headerIdx + 1);

    rowsData.forEach(row => {
      if (!row || row.length === 0) return;
      
      if (estadoIdx !== -1) {
        const val = String(row[estadoIdx] || '').trim();
        statusCounts[val] = (statusCounts[val] || 0) + 1;
      }
      
      if (tipoAltaIdx !== -1) {
        const val = String(row[tipoAltaIdx] || '').trim();
        altaCounts[val] = (altaCounts[val] || 0) + 1;
      }
    });

    if (estadoIdx !== -1) {
      console.log("Valores de 'Estado':");
      Object.entries(statusCounts).forEach(([val, count]) => {
        console.log(`  - "${val}": ${count} registros`);
      });
    }

    if (tipoAltaIdx !== -1) {
      console.log("Valores de Altas/Destino:");
      Object.entries(altaCounts).forEach(([val, count]) => {
        console.log(`  - "${val}": ${count} registros`);
      });
    }

  } catch (err) {
    console.error("Error al leer el archivo:", err);
  }
});
