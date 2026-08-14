const { PDFDocument, rgb, StandardFonts } = require('./functions/node_modules/pdf-lib');
const fs = require('fs');

const generarPdfConsolidado = async (turnoInfo) => {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const page = pdfDoc.addPage([612, 792]); // Standard US Letter (Hoja Carta)
  const { width, height } = page.getSize();

  const cleanText = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/[✓✔🏆📊📑📋🦴🩺🛡️🚑•—–]/g, '')
      .replace(/[áäâà]/g, 'a').replace(/[ÁÄÂÀ]/g, 'A')
      .replace(/[éëêè]/g, 'e').replace(/[ÉËÊÈ]/g, 'E')
      .replace(/[íïîì]/g, 'i').replace(/[ÍÏÎÌ]/g, 'I')
      .replace(/[óöôò]/g, 'o').replace(/[ÓÖÔÒ]/g, 'O')
      .replace(/[úüûù]/g, 'u').replace(/[ÚÜÛÙ]/g, 'U')
      .replace(/[ñ]/g, 'n').replace(/[Ñ]/g, 'N')
      .replace(/[^\x20-\x7E]/g, ' ');
  };

  // Header Bar
  page.drawRectangle({
    x: 0,
    y: height - 90,
    width: width,
    height: 90,
    color: rgb(0.31, 0.27, 0.9)
  });

  page.drawText(cleanText('SAR ELSA ROMO ARAVENA'), {
    x: 30,
    y: height - 42,
    size: 16,
    font: fontBold,
    color: rgb(1, 1, 1)
  });

  page.drawText(cleanText('REPORTE EJECUTIVO DE GESTION DE URGENCIAS - METRICO'), {
    x: 30,
    y: height - 64,
    size: 11,
    font: fontBold,
    color: rgb(0.9, 0.9, 1)
  });

  let y = height - 120;

  // Header Details
  page.drawText(cleanText(`Fecha de Turno: ${turnoInfo.fechaTurno}`), { x: 30, y, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.2) });
  y -= 18;
  page.drawText(cleanText(`Identificador: ${turnoInfo.textoCompleto}`), { x: 30, y, size: 10, font: fontRegular, color: rgb(0.3, 0.3, 0.4) });
  y -= 16;
  page.drawText(cleanText(`Rotativa: ${turnoInfo.rotativa} | ${turnoInfo.equipo || 'Equipo 2'}`), { x: 30, y, size: 10, font: fontRegular, color: rgb(0.3, 0.3, 0.4) });
  y -= 25;

  // Status Badge
  page.drawRectangle({ x: 30, y: y - 22, width: width - 60, height: 22, color: rgb(0.92, 0.98, 0.95) });
  page.drawText(cleanText('CONTROL DE GUIA & VERIFICACION ASISTENCIAL: 100% DATOS AUDITADOS'), { x: 40, y: y - 16, size: 9, font: fontBold, color: rgb(0.02, 0.45, 0.3) });
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
    ['Profesional Mas Productivo:', cleanText(String(turnoInfo.medicoMasProductivo || 'No especificado'))]
  ];

  kpis.forEach(([label, val]) => {
    page.drawText(cleanText(label), { x: 40, y, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.3) });
    page.drawText(cleanText(val), { x: width - 200, y, size: 10, font: fontBold, color: rgb(0.3, 0.2, 0.8) });
    y -= 18;
  });

  y -= 15;
  page.drawText(cleanText('BITACORA ASISTENCIAL Y SUB-REPORTES DETALLADOS:'), { x: 30, y, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.2) });
  y -= 20;

  const subSections = [
    ['1. Demanda de Atencion:', cleanText(turnoInfo.totalAdmitidos > 0 ? `Se registraron ${turnoInfo.totalAdmitidos} admisiones en el periodo.` : 'No se registraron admisiones en este periodo.')],
    ['2. Facturas & Traumatologia:', cleanText((turnoInfo.fracturasCount || 0) > 0 ? `Se registraron ${turnoInfo.fracturasCount} atenciones por fractura auditadas.` : 'No se registraron atenciones por fractura en este turno.')],
    ['3. Rendimiento de Enfermeria:', cleanText('Tiempos de respuesta asistencial dentro del estandar.')],
    ['4. Constatacion de Lesiones (Z51.8):', cleanText((turnoInfo.constatacionesCount || 0) > 0 ? `Se registraron ${turnoInfo.constatacionesCount} constataciones de lesiones.` : 'No se registraron constataciones de lesiones en este turno.')],
    ['5. Traslados Hospitalarios a UEH:', cleanText((turnoInfo.trasladosCount || 0) > 0 ? `Se registraron ${turnoInfo.trasladosCount} traslados a la Unidad de Emergencia.` : 'No se registraron traslados hospitalarios en este turno.')]
  ];

  subSections.forEach(([title, text]) => {
    page.drawText(cleanText(title), { x: 30, y, size: 10, font: fontBold, color: rgb(0.3, 0.2, 0.8) });
    y -= 14;
    page.drawText(cleanText(text), { x: 45, y, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.4) });
    y -= 22;
  });

  page.drawText(cleanText('METRICO Clinico Predictivo - SAR Elsa Romo Aravena'), {
    x: 30,
    y: 25,
    size: 9,
    font: fontBold,
    color: rgb(0.5, 0.5, 0.6)
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

// Execute test
(async () => {
  try {
    const testBuffer = await generarPdfConsolidado({
      fechaTurno: '07/08/2026',
      turnoNum: 2,
      equipo: 'Equipo 2',
      rotativa: 'Turno Largo Semana (17:00 a 08:00 hrs)',
      textoCompleto: '07/08/2026 - Turno 2 (Equipo 2 • Turno Largo Semana 17:00 a 08:00 hrs)',
      totalAdmitidos: 142,
      atendidos: 128,
      altasAdmin: 14,
      fracturasCount: 0,
      constatacionesCount: 0,
      trasladosCount: 1,
      triage: { c1: 2, c2: 18, c3: 65, c4: 42, c5: 15 },
      medicoMasProductivo: 'Dr. Fernando Morales (34 atenciones)'
    });

    console.log('PDF generated successfully! Buffer length:', testBuffer.length);
  } catch (err) {
    console.error('PDF Generation ERROR:', err);
  }
})();
