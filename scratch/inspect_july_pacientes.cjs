const https = require('https');

const appId = 'urgencias-dashboard';
const url = `https://firestore.googleapis.com/v1/projects/metrico-dashboard-2026/databases/(default)/documents/artifacts/${appId}/public/data/pacientes_urgencia?pageSize=300`;

https.get(url, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      const docs = json.documents || [];
      console.log(`Total documentos en pacientes_urgencia (batch): ${docs.length}`);

      let julyCount = 0;
      let julyTraslados = 0;
      const datesMap = {};
      const destinationsMap = {};
      const julyList = [];

      docs.forEach(doc => {
        const fields = doc.fields || {};
        const tAdmision = fields.tAdmision ? Number(fields.tAdmision.integerValue || fields.tAdmision.doubleValue || 0) : 0;
        
        const dateObj = new Date(tAdmision);
        const yyyymm = tAdmision > 0 ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}` : 'SinFecha';
        datesMap[yyyymm] = (datesMap[yyyymm] || 0) + 1;

        const dest = fields.destinoAlta ? fields.destinoAlta.stringValue : (fields.destino ? fields.destino.stringValue : '');
        if (dest) destinationsMap[dest] = (destinationsMap[dest] || 0) + 1;

        // Check if patient admission is in July 2026 (2026-07-01 to 2026-07-31)
        // Timestamp range for July 2026: 1782864000000 to 1785542399000
        if (tAdmision >= 1782864000000 && tAdmision <= 1785542399000) {
          julyCount++;
          const isTraslado = dest.toLowerCase().includes('hospital') || dest.toLowerCase().includes('emergencia') || dest.toLowerCase().includes('derivac');
          if (isTraslado) julyTraslados++;
          julyList.push({
            id: doc.name.split('/').pop(),
            fecha: dateObj.toISOString(),
            dest,
            diag: fields.diagnosticoPrincipal ? fields.diagnosticoPrincipal.stringValue : ''
          });
        }
      });

      console.log("Distribución de Pacientes por Año-Mes (tAdmision):", datesMap);
      console.log("Frecuencia de Destinos de Alta:", destinationsMap);
      console.log(`Pacientes en Julio 2026: ${julyCount}`);
      console.log(`Traslados en Julio 2026: ${julyTraslados}`);
      console.log("Listado de Pacientes en Julio 2026:", julyList.slice(0, 15));
    } catch (e) {
      console.error("Error parseando JSON:", e);
    }
  });
}).on('error', e => console.error("Error HTTP:", e));
