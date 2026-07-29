// Generadores de resumen analítico y narrativo clínico para dashboards e informes

const formatPct = (val, tot) => tot > 0 ? ((val / tot) * 100).toFixed(1) : '0.0';

export const generateAltasSummary = (pacs) => {
  if (!pacs || pacs.length === 0) return 'Sin registros suficientes para generar análisis de altas administrativas.';
  const total = pacs.length;
  const altas = pacs.filter(p => p.estado === 'Cancelada');
  const totalAltas = altas.length;
  const pct = formatPct(totalAltas, total);

  // Médicos con más altas
  const medCounts = {};
  altas.forEach(p => {
    const med = p.medico || 'Sin Especificar';
    medCounts[med] = (medCounts[med] || 0) + 1;
  });
  const sortedMed = Object.entries(medCounts).sort((a,b) => b[1] - a[1]).slice(0, 2);
  const topMedsText = sortedMed.length > 0
    ? sortedMed.map(([name, count]) => `${name} (${count} altas)`).join(' y ')
    : 'médicos no especificados';

  // Estadía promedio de las altas
  let sumEstadia = 0, countEstadia = 0;
  altas.forEach(p => {
    if (p.tAdmision && p.tAlta && p.tAlta >= p.tAdmision) {
      const diff = (p.tAlta - p.tAdmision) / 60000;
      if (diff <= 1440) { sumEstadia += diff; countEstadia++; }
    }
  });
  const avgEstadia = countEstadia > 0 ? Math.round(sumEstadia / countEstadia) : 0;

  return `Durante el período consultado, se registraron un total de ${totalAltas} altas administrativas de un universo de ${total} admisiones, lo que representa una tasa de representatividad del ${pct}%. Los profesionales médicos con mayor cantidad de altas indicadas corresponden a: ${topMedsText}. La estadía promedio de estos pacientes fue de ${avgEstadia} minutos, demostrando un flujo de resolución administrativa rápido y eficiente.`;
};

export const generateFracturasSummary = (pacs) => {
  if (!pacs || pacs.length === 0) return 'Sin registros suficientes para generar análisis de estadísticas de fracturas.';
  
  const total = pacs.length;
  // Identificar fracturas
  const listFracturas = pacs.filter(p => {
    const cod = String(p.codigoDiagnostico || '').toUpperCase();
    const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
    return cod.startsWith('S') && (diag.includes('FRACTURA') || diag.includes('FRAC') || diag.includes('ESGUINCE') || diag.includes('TORCEDURA') || diag.includes('LUXACION'));
  });
  const totalFracturas = listFracturas.length;
  const pct = formatPct(totalFracturas, total);

  // Diagnósticos más recurrentes
  const diagCounts = {};
  listFracturas.forEach(p => {
    const diag = p.diagnosticoPrincipal || 'Sin Especificar';
    diagCounts[diag] = (diagCounts[diag] || 0) + 1;
  });
  const sortedDiags = Object.entries(diagCounts).sort((a,b) => b[1] - a[1]).slice(0, 2);
  const topDiagsText = sortedDiags.length > 0
    ? sortedDiags.map(([name, count]) => `"${name}" (${count} casos)`).join(' y ')
    : 'diagnósticos no especificados';

  // Destino más frecuente de fracturas
  const destCounts = {};
  listFracturas.forEach(p => {
    const dest = p.destinoAlta || p.destino || 'Sin Especificar';
    destCounts[dest] = (destCounts[dest] || 0) + 1;
  });
  const sortedDests = Object.entries(destCounts).sort((a,b) => b[1] - a[1])[0];
  const topDestText = sortedDests ? `${sortedDests[0]} (${formatPct(sortedDests[1], totalFracturas)}% de los casos)` : 'Sin especificar';

  return `Se identificó un total de ${totalFracturas} casos de fracturas y lesiones osteomusculares, que equivalen al ${pct}% de las admisiones totales del periodo. Las lesiones de mayor incidencia clínica corresponden a: ${topDiagsText}. El principal destino de resolución o derivación para estos pacientes fue ${topDestText}, reflejando la capacidad resolutiva local o la necesidad de traslado a centros de mayor complejidad según gravedad.`;
};

export const generateEnfermeriaSummary = (pacs) => {
  if (!pacs || pacs.length === 0) return 'Sin registros suficientes para generar análisis de rendimiento de enfermería.';
  
  const total = pacs.length;
  let sumMinCat1 = 0, countMinCat1 = 0;
  let reCatCount = 0;

  pacs.forEach(p => {
    const tAdm = p.tAdmision || null;
    const tC1 = p.tCat1 || p.tCatUlt || null;
    const tCU = p.tCatUlt || null;
    if (tAdm && tC1 && tC1 >= tAdm) {
      const diff = (tC1 - tAdm) / 60000;
      if (diff <= 300) { sumMinCat1 += diff; countMinCat1++; }
    }
    if (tC1 && tCU && tCU > tC1) {
      reCatCount++;
    }
  });

  const avgMinCat1 = countMinCat1 ? Math.round(sumMinCat1 / countMinCat1) : 0;
  const pctReCat = formatPct(reCatCount, total);

  // Enfermero con mayor cantidad de atenciones
  const enfCounts = {};
  pacs.forEach(p => {
    const enf = p.enfermeroCat1 || p.enfermeroCatUlt || 'Sin Especificar';
    if (enf !== 'Sin Especificar') enfCounts[enf] = (enfCounts[enf] || 0) + 1;
  });
  const sortedEnf = Object.entries(enfCounts).sort((a,b) => b[1] - a[1])[0];
  const topEnfText = sortedEnf ? `${sortedEnf[0]} (${sortedEnf[1]} categorizaciones)` : 'Sin especificar';

  return `El análisis de triaje y enfermería registra un tiempo promedio de admisión a primera categorización de ${avgMinCat1} minutos, situándose dentro de los estándares óptimos de respuesta asistencial. Del total de ${total} pacientes evaluados, un ${pctReCat}% requirió re-categorización clínica. El profesional con mayor nivel de actividad y categorizaciones en el periodo fue ${topEnfText}.`;
};

export const generateConstatacionesSummary = (pacs) => {
  if (!pacs || pacs.length === 0) return 'Sin registros suficientes para generar análisis de constatación de lesiones.';

  const isConstatacionOficial = (p) => {
    if (!p) return false;
    if (p.categoria === 'c3_z518') return true;
    const cod = String(p.codigoDiagnostico || p.diagnostico || '').toUpperCase();
    const diag = String(p.diagnosticoPrincipal || p.diagnostico || '').toUpperCase();
    return cod.includes('Z51.8') || cod.includes('Z518') || diag.includes('CONSTATAC');
  };

  const listConstataciones = pacs.filter(isConstatacionOficial);
  const totalConst = listConstataciones.length;
  if (totalConst === 0) return 'No se registraron constataciones de lesiones en el período seleccionado.';

  // Sexo
  let hombres = 0, mujeres = 0;
  listConstataciones.forEach(p => {
    const s = String(p.sexo || '').toUpperCase();
    if (s.includes('MUJER') || s.includes('FEMENINO') || s === 'F') mujeres++;
    else if (s.includes('HOMBRE') || s.includes('MASCULINO') || s === 'M') hombres++;
  });
  const hombresPct = formatPct(hombres, totalConst);
  const mujeresPct = formatPct(mujeres, totalConst);

  // Rango etario principal
  const porRangoEdad = { '0-14': 0, '15-29': 0, '30-59': 0, '60+': 0 };
  listConstataciones.forEach(p => {
    if (p.edad !== null && p.edad !== undefined && !isNaN(p.edad)) {
      if (p.edad <= 14) porRangoEdad['0-14']++;
      else if (p.edad <= 29) porRangoEdad['15-29']++;
      else if (p.edad <= 59) porRangoEdad['30-59']++;
      else porRangoEdad['60+']++;
    }
  });
  const topRango = Object.entries(porRangoEdad).sort((a,b) => b[1] - a[1])[0];
  const topRangoText = topRango ? `${topRango[0]} años` : 'No especificado';

  // Comuna dominante
  const comCounts = {};
  listConstataciones.forEach(p => {
    const com = String(p.comuna || 'DESCONOCIDA').toUpperCase().trim();
    comCounts[com] = (comCounts[com] || 0) + 1;
  });
  const sortedCom = Object.entries(comCounts).sort((a,b) => b[1] - a[1])[0];
  const topComText = sortedCom ? sortedCom[0] : 'DESCONOCIDA';

  return `Se registraron un total de ${totalConst} constataciones de lesiones de urgencia en el periodo. La distribución demográfica indica una presencia de ${hombresPct}% hombres frente a un ${mujeresPct}% mujeres, con una concentración prioritaria en el rango etario de ${topRangoText}. La procedencia territorial del mayor volumen de atenciones clínico-legales corresponde a la comuna de ${topComText}.`;
};

export const generateTrasladosSummary = (pacs, prevYearPacs = []) => {
  if (!pacs || pacs.length === 0) return 'Sin registros suficientes para generar análisis de traslados hospitalarios.';

  const isTraslado = (p) => {
    const dest = (p.destinoAlta || p.destino || '').toLowerCase();
    return dest.includes('hospital') || dest.includes('emergencia') || dest.includes('derivac');
  };

  const listTraslados = pacs.filter(isTraslado);
  const total = listTraslados.length;
  if (total === 0) return 'No se registraron traslados hospitalarios en el período seleccionado.';

  const pct = formatPct(total, pacs.length);

  // Principal hospital receptor
  const destCounts = {};
  listTraslados.forEach(p => {
    const dest = p.destinoAlta || p.destino || 'Sin Especificar';
    destCounts[dest] = (destCounts[dest] || 0) + 1;
  });
  const sortedDests = Object.entries(destCounts).sort((a,b) => b[1] - a[1])[0];
  const topDestText = sortedDests ? `${sortedDests[0]} (${formatPct(sortedDests[1], total)}% de las derivaciones)` : 'Sin especificar';

  // Comparativa año anterior
  let compText = '';
  if (prevYearPacs && prevYearPacs.length > 0) {
    const prevTras = prevYearPacs.filter(isTraslado).length;
    const prevPct = formatPct(prevTras, prevYearPacs.length);
    compText = ` (en comparación con el ${prevPct}% del mismo periodo del año anterior)`;
  }

  return `El volumen total de traslados a centros de mayor complejidad asistencial en el periodo alcanzó los ${total} pacientes, representando el ${pct}% del total de admisiones de urgencia${compText}. El principal centro receptor fue el ${topDestText}. Este flujo continuo de derivaciones refleja el comportamiento y la demanda operativa de urgencias externas.`;
};
