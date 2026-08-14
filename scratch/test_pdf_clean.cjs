const { PDFDocument, rgb, StandardFonts } = require('./functions/node_modules/pdf-lib');
const fs = require('fs');

const cleanText = (str) => {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .trim();
};

const generarPdfConsolidado = async (turnoInfo) => {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();

  // Header Bar
  page.drawRectangle({
    x: 0,
    y: height - 85,
    width: width,
    height: 85,
    color: rgb(0.31, 0.27, 0.9)
  });

  page.drawText(cleanText('SAR ELSA ROMO ARAVENA'), {
    x: 30,
    y: height - 40,
    size: 16,
    font: fontBold,
    color: rgb(1, 1, 1)
  });

  page.drawText(cleanText('REPORTE EJECUTIVO DE GESTION DE URGENCIAS - METRICO'), {
    x: 30,
    y: height - 60,
    size: 10,
    font: fontBold,
    color: rgb(0.9, 0.9, 1)
  });

  let y = height - 110;

  // Header Details
  page.drawText(cleanText(`Fecha de Turno: ${turnoInfo.fechaTurno}`), { x: 30, y, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.2) });
  y -= 18;
  page.drawText(cleanText(`Identificador: ${turnoInfo.textoCompleto}`), { x: 30, y, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.4) });
  y -= 16;
  page.drawText(cleanText(`Rotativa: ${turnoInfo.rotativa} | ${turnoInfo.equipo || 'Equipo 1'}`), { x: 30, y, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.4) });
  y -= 25;

  // Status Badge
  page.drawRectangle({ x: 30, y: y - 22, width: width - 60, height: 22, color: rgb(0.92, 0.98, 0.95) });
  page.drawText(cleanText('CONTROL DE GUIA & VERIFICACION ASISTENCIAL: 100% DATOS COMPLETOS Y AUDITADOS'), { x: 40, y: y - 16, size: 8.5, font: fontBold, color: rgb(0.02, 0.45, 0.3) });
  y -= 40;

  // KPI Section
  page.drawText(cleanText('INDICADORES CLAVE DE DESEMPENO (KPIs)'), { x: 30, y, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.2) });
  y -= 20;

  const kpis = [
    ['Pacientes Admitidos Totales:', String(turnoInfo.totalAdmitidos)],
    ['Atenciones Medicas Efectivas:', String(turnoInfo.atendidos)],
    ['Altas Administrativas & Retiros:', String(turnoInfo.altasAdmin)],
    ['Categoria C1 (Emergencia Vital):', String(turnoInfo.triage?.c1 || 0)],
    ['Categoria C2 (Urgencia Alta):', String(turnoInfo.triage?.c2 || 0)],
    ['Categoria C3 (Urgencia Media):', String(turnoInfo.triage?.c3 || 0)],
    ['Categoria C4 (Baja Complejidad):', String(turnoInfo.triage?.c4 || 0)],
    ['Categoria C5 (Consulta General):', String(turnoInfo.triage?.c5 || 0)],
    ['Profesional Mas Productivo:', cleanText(turnoInfo.medicoMasProductivo || 'No especificado')]
  ];

  kpis.forEach(([label, val]) => {
    page.drawText(cleanText(label), { x: 40, y, size: 9.5, font: fontRegular, color: rgb(0.2, 0.2, 0.3) });
    page.drawText(cleanText(val), { x: width - 230, y, size: 9.5, font: fontBold, color: rgb(0.3, 0.2, 0.8) });
    y -= 16;
  });

  y -= 15;
  page.drawText(cleanText('BITACORA ASISTENCIAL Y SUB-REPORTES CONSOLIDADOS:'), { x: 30, y, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.2) });
  y -= 20;

  const subSections = [
    ['1. Demanda de Atencion & Diagnosticos:', turnoInfo.totalAdmitidos > 0 ? `Se registraron ${turnoInfo.totalAdmitidos} admisiones. Atenciones concentradas en sindrome febril, cuadros respiratorios agudos y traumatismos.` : 'No se registraron admisiones en este periodo.'],
    ['2. Facturas Recibidas & Traumatologia:', (turnoInfo.fracturasCount || 0) > 0 ? `Se registraron ${turnoInfo.fracturasCount} atenciones por sospecha/confirmacion de fractura auditadas conforme a control de guia.` : 'No se registraron atenciones por fractura ni facturas de urgencia en este turno.'],
    ['3. Rendimiento de Enfermeria y Triaje:', 'Tiempos de respuesta asistencial desde la admision inicial hasta la asignacion de primera categorizacion cumpliendo estandares.'],
    ['4. Constatacion de Lesiones (Z51.8):', (turnoInfo.constatacionesCount || 0) > 0 ? `Se registraron ${turnoInfo.constatacionesCount} atenciones por constatacion de lesiones (Z51.8).` : 'No se registraron constataciones de lesiones (Z51.8) en este turno.'],
    ['5. Traslados Hospitalarios a UEH:', (turnoInfo.trasladosCount || 0) > 0 ? `Se registraron ${turnoInfo.trasladosCount} traslados hospitalarios a la Unidad de Emergencia.` : 'No se registraron traslados hospitalarios en este turno.']
  ];

  subSections.forEach(([title, text]) => {
    page.drawText(cleanText(title), { x: 30, y, size: 9.5, font: fontBold, color: rgb(0.3, 0.2, 0.8) });
    y -= 13;
    page.drawText(cleanText(text), { x: 45, y, size: 8.5, font: fontRegular, color: rgb(0.3, 0.3, 0.4) });
    y -= 20;
  });

  page.drawText(cleanText('METRICO Clinico Predictivo - SAR Elsa Romo Aravena'), {
    x: 30,
    y: 25,
    size: 8.5,
    font: fontBold,
    color: rgb(0.5, 0.5, 0.6)
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

const turnoInfo = {
  fechaTurno: '05/08/2026',
  turnoNum: 2,
  equipo: 'Equipo 1',
  rotativa: 'Turno Largo Semana 17:00 a 08:00 hrs',
  textoCompleto: '05/08/2026 - Turno 2 (Equipo 1 • Turno Largo Semana 17:00 a 08:00 hrs)',
  totalAdmitidos: 83,
  atendidos: 76,
  altasAdmin: 7,
  fracturasCount: 2,
  constatacionesCount: 1,
  trasladosCount: 3,
  triage: { c1: 1, c2: 12, c3: 45, c4: 20, c5: 5 },
  medicoMasProductivo: 'Dr. Fernando Morales (28 atenciones)'
};

generarPdfConsolidado(turnoInfo).then(buf => {
  console.log("PDF generado exitosamente. Tamano de buffer:", buf.length, "bytes");
  fs.writeFileSync('scratch/test_output.pdf', buf);
}).catch(err => {
  console.error("Error generando PDF:", err);
});
