const XLSX = require('xlsx');
const path = require('path');

const filePath = 'C:\\Users\\Datos Gestion Sar\\Downloads\\Informe_Urgencia_Tiempo_Espera(1).xlsx';

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
  const estadoIdx = headers.findIndex(h => h.toUpperCase().includes('ESTADO'));
  const medicoIdx = headers.findIndex(h => h.toUpperCase().includes('NOMBRE PROFESIONAL'));
  const diagIdx = headers.findIndex(h => h.toUpperCase().includes('DIAGNOSTICO'));
  const fAltaIdx = headers.findIndex(h => h.toUpperCase().includes('FECHA ALTA'));
  const hAltaIdx = headers.findIndex(h => h.toUpperCase().includes('HORA ALTA'));
  const fAnaIdx = headers.findIndex(h => h.toUpperCase().includes('FECHA ANAMNESIS'));

  console.log("--- Inspección de registros 'Cancelada' ---");
  let canceladasCount = 0;
  let hasAnamnesis = 0;
  let hasMedico = 0;
  let hasDiag = 0;
  let samples = [];

  rowsData.forEach(row => {
    if (!row || row.length === 0) return;
    const estado = String(row[estadoIdx] || '').trim();
    
    if (estado === 'Cancelada') {
      canceladasCount++;
      const medico = String(row[medicoIdx] || '').trim();
      const diag = String(row[diagIdx] || '').trim();
      const fAna = String(row[fAnaIdx] || '').trim();
      
      if (fAna !== '') hasAnamnesis++;
      if (medico !== '' && medico !== 'No Registrado') hasMedico++;
      if (diag !== '') hasDiag++;

      if (samples.length < 5) {
        samples.push({
          rowNum: rows.indexOf(row) + 1,
          fechaAdm: row[headers.findIndex(h => h.toUpperCase().includes('FECHA ADMISION'))],
          horaAdm: row[headers.findIndex(h => h.toUpperCase().includes('HORA ADMISION'))],
          fechaAlta: row[fAltaIdx],
          horaAlta: row[hAltaIdx],
          medico,
          diag,
          fAna
        });
      }
    }
  });

  console.log(`Total 'Cancelada' en archivo: ${canceladasCount}`);
  console.log(`Con fecha de Anamnesis: ${hasAnamnesis}`);
  console.log(`Con Médico registrado: ${hasMedico}`);
  console.log(`Con Diagnóstico registrado: ${hasDiag}`);
  
  console.log("\nMuestra de 5 registros 'Cancelada':");
  console.log(JSON.stringify(samples, null, 2));

} catch (err) {
  console.error("Error leyendo el archivo:", err);
}
