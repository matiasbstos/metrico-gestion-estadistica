const https = require('https');

// Consultar los datos de Firestore en public/data/pacientes
const url = 'https://firestore.googleapis.com/v1/projects/metrico-dashboard-2026/databases/(default)/documents/artifacts/default/public/data/pacientes';

https.get(url, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      const docs = json.documents || [];
      console.log(`Total documentos recibidos en batch inicial: ${docs.length}`);

      const destinationsMap = {};
      const fieldsSet = new Set();
      let julyCount = 0;
      let trasladoCount = 0;

      docs.forEach(doc => {
        const fields = doc.fields || {};
        Object.keys(fields).forEach(k => fieldsSet.add(k));

        const tAdmision = fields.tAdmision ? Number(fields.tAdmision.integerValue || fields.tAdmision.doubleValue || 0) : 0;
        const fecha = fields.fecha ? (fields.fecha.stringValue || '') : '';
        
        const destAlta = fields.destinoAlta ? fields.destinoAlta.stringValue : (fields.destino ? fields.destino.stringValue : '');
        const tipoAlta = fields.tipoAlta ? fields.tipoAlta.stringValue : '';
        const motivoAlta = fields.motivoAlta ? fields.motivoAlta.stringValue : '';

        if (destAlta) {
          destinationsMap[destAlta] = (destinationsMap[destAlta] || 0) + 1;
        }

        // Chequear julio (07/2026 o timestamp entre 2026-07-01 y 2026-07-31)
        if (fecha.includes('07/2026') || (tAdmision >= 1782864000000 && tAdmision <= 1785542399000)) {
          julyCount++;
          console.log(`Doc ID: ${doc.name.split('/').pop()} | Fecha: ${fecha} | DestinoAlta: ${destAlta} | TipoAlta: ${tipoAlta} | Motivo: ${motivoAlta}`);
        }
      });

      console.log("\nCampos disponibles en paciente:", Array.from(fieldsSet));
      console.log("\nFrecuencia de Destinos de Alta:", destinationsMap);
      console.log(`Pacientes en Julio: ${julyCount}`);
    } catch (e) {
      console.error("Error parseando JSON:", e);
    }
  });
}).on('error', e => console.error("Error en HTTP GET:", e));
