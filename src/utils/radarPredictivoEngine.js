/**
 * radarPredictivoEngine.js
 * Motor Unificado del Radar Predictivo IA (SSOT SAR Urgencias)
 * Conforme a las Reglas 4, 9, 17, 19 y 20 de AGENTS.md.
 * 
 * Modela:
 * 1. Regímenes de Turnos SAR (Diurno 08:00-20:00 vs Nocturno 20:00-08:00 en fines de semana/feriados; Turno Largo 17:00-08:00 en días hábiles).
 * 2. Triage Manchester (Alta Complejidad C1-C3 vs Leves C4-C5).
 * 3. Curva horaria de afluencia intradía (cuello de botella 19:00 - 22:30).
 * 4. Modelado multivariable climático con retardo post-lluvia y heladas.
 * 5. Estimación de dotación médica y de enfermería en urgencias.
 */

import { determinarTipoJornada, CHILE_HOLIDAYS_OFFICIAL } from './turnosSarDemanda';

/**
 * Genera la curva horaria de afluencia asistencial intradía
 * @param {boolean} isFindeOFeriado
 * @param {number} totalPacientes
 * @returns {Array<{ hora: string, pacientes: number, isPeak: boolean }>}
 */
export const generateHourlyCurve = (isFindeOFeriado, totalPacientes) => {
  if (isFindeOFeriado) {
    // 24 horas fin de semana/feriado (00:00 a 23:00)
    const weights = [
      0.02, 0.02, 0.015, 0.01, 0.01, 0.01, 0.01, 0.015, // 00:00 a 07:00
      0.04, 0.06, 0.08, 0.095, 0.095, 0.07, 0.05, 0.05, // 08:00 a 15:00
      0.05, 0.06, 0.08, 0.08, 0.06, 0.05, 0.04, 0.03   // 16:00 a 23:00
    ];
    return weights.map((w, h) => {
      const horaStr = `${String(h).padStart(2, '0')}:00`;
      const pacs = Math.max(1, Math.round(totalPacientes * w));
      const isPeak = h === 11 || h === 12 || h === 18 || h === 19;
      return { hora: horaStr, pacientes: pacs, isPeak };
    });
  } else {
    // Turno Largo Semana (17:00 a 08:00 del día siguiente)
    const hours = [17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7];
    const weightsByHour = {
      17: 0.05, 18: 0.10, 19: 0.15, 20: 0.17, 21: 0.15, 22: 0.11, 23: 0.08,
      0: 0.06, 1: 0.04, 2: 0.03, 3: 0.02, 4: 0.01, 5: 0.01, 6: 0.01, 7: 0.01
    };
    return hours.map(h => {
      const horaStr = `${String(h).padStart(2, '0')}:00`;
      const pacs = Math.max(1, Math.round(totalPacientes * (weightsByHour[h] || 0.02)));
      const isPeak = h === 19 || h === 20 || h === 21;
      return { hora: horaStr, pacientes: pacs, isPeak };
    });
  }
};

/**
 * Generador dinámico de proyección a 7 días
 * @param {Date} baseDate
 * @param {Array} liveWeather
 * @param {number} calibrationFactor
 * @param {Array<number>} customBaselines - [Dom, Lun, Mar, Mie, Jue, Vie, Sab]
 * @param {boolean} alertaHospitalMelipilla - Saturación en la Urgencia del Hospital San José de Melipilla
 * @returns {Array}
 */
export const generateDynamicProyeccion = (baseDate, liveWeather = null, calibrationFactor = 1.0, customBaselines = null, alertaHospitalMelipilla = false) => {
  const proyecciones = [];
  const weatherList = liveWeather || [];
  // Línea base semanal calibrada con el estándar asistencial real SAR Elsa Romo (Domingo: 162 pac, Sábado: 168 pac)
  const baseByDay = customBaselines || [162, 86, 82, 80, 88, 118, 168];

  let prevDayHadRain = false;

  for (let i = 1; i <= 7; i++) {
    const targetDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + i, 12, 0, 0);
    const yStr = targetDate.getFullYear();
    const mStr = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(targetDate.getDate()).padStart(2, '0');
    const fechaStr = `${yStr}-${mStr}-${dStr}`;
    const dayOfWeek = targetDate.getDay();

    // Reconocimiento de Jornada SAR & Feriados Oficiales de Chile (Reglas 4, 9, 17, 24)
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
    const isOfficialChileHoliday = Boolean(CHILE_HOLIDAYS_OFFICIAL && CHILE_HOLIDAYS_OFFICIAL.has(fechaStr));
    const tipoJornada = (isWeekend || isOfficialChileHoliday) ? 'FINDE_FERIADO' : determinarTipoJornada(fechaStr);
    const isFindeOFeriado = isWeekend || isOfficialChileHoliday || tipoJornada === 'FINDE_FERIADO';

    // Si es feriado oficial o fin de semana en día hábil, la línea base se asimila a fin de semana
    let baseExpected = isFindeOFeriado && (dayOfWeek >= 1 && dayOfWeek <= 5)
      ? Math.round((baseByDay[0] + baseByDay[6]) / 2)
      : baseByDay[dayOfWeek];

    // Clima del día
    const weatherToday = weatherList.find(w => w.fecha === fechaStr) || {
      fecha: fechaStr,
      tempMax: isFindeOFeriado ? 15 : 14,
      tempMin: dayOfWeek === 6 ? 1.5 : (dayOfWeek === 0 ? 2.0 : 4.0),
      precipitacionMm: 0
    };

    const prec = weatherToday.precipitacionMm || 0;
    const tMin = weatherToday.tempMin !== undefined ? weatherToday.tempMin : 4;

    // Modelado de Efectos Climáticos & Retardo (Lag)
    let weatherMultiplier = 1.0;
    let weatherReason = 'Condiciones normales de demanda asistencial';
    let tagClima = 'Normal';

    if (prec > 2.0) {
      weatherMultiplier *= 0.85;
      weatherReason = `Día de lluvia (${prec}mm): Reducción transitoria (-15%) por aplazamiento de consultas no urgentes.`;
      tagClima = `🌧️ Lluvia ${prec}mm (-15%)`;
      prevDayHadRain = true;
    } else if (prevDayHadRain) {
      weatherMultiplier *= 1.28;
      if (tMin < 3.0) {
        weatherMultiplier *= 1.10;
        weatherReason = `Rebote Post-Lluvia + Helada (${tMin}°C): Fuerte sobrecarga (+38%) por acumulación y cuadros respiratorios.`;
        tagClima = `🧊 Helada Post-Lluvia (+38%)`;
      } else {
        weatherReason = `Rebote Post-Lluvia: Incremento del +28% por consultas postergadas y humedad residual.`;
        tagClima = `⚠️ Rebote Post-Lluvia (+28%)`;
      }
      prevDayHadRain = false;
    } else if (tMin < 3.0) {
      weatherMultiplier *= 1.16;
      weatherReason = `Helada matinal (${tMin}°C): Aumento del +16% en síntomas obstructivos y descompensación respiratoria/cardiovascular.`;
      tagClima = `❄️ Helada (${tMin}°C)`;
    }

    // Efecto Rebote / Saturación Hospital San José de Melipilla (+20% afluencia C4/C5)
    const hospitalMultiplier = alertaHospitalMelipilla ? 1.20 : 1.0;
    const totalMultiplier = weatherMultiplier * hospitalMultiplier;

    const adjustedEstimate = Math.round(baseExpected * totalMultiplier * calibrationFactor);
    const lowerBound = Math.round(adjustedEstimate * 0.76);
    const upperBound = Math.round(adjustedEstimate * (alertaHospitalMelipilla ? 1.28 : 1.25));

    // Desglose oficial de turnos SAR (Día vs Noche)
    let atencionesDiurno = 0;
    let atencionesNocturno = 0;
    let limiteInfDiurno = 0;
    let limiteSupDiurno = 0;
    let limiteInfNocturno = 0;
    let limiteSupNocturno = 0;
    let esquemaTurno = '';
    let tagTipoJornada = '';

    if (isFindeOFeriado) {
      tagTipoJornada = isOfficialChileHoliday ? '🎉 Feriado Oficial SAR' : 'Fin de Semana SAR';
      esquemaTurno = 'Fin de Semana / Festivo (08:00 a 20:00 y 20:00 a 08:00)';
      atencionesDiurno = Math.round(adjustedEstimate * 0.72);
      atencionesNocturno = Math.max(0, adjustedEstimate - atencionesDiurno);
      limiteInfDiurno = Math.round(lowerBound * 0.72);
      limiteSupDiurno = Math.round(upperBound * 0.72);
      limiteInfNocturno = Math.round(lowerBound * 0.28);
      limiteSupNocturno = Math.round(upperBound * 0.28);
    } else {
      tagTipoJornada = 'Día Hábil SAR';
      esquemaTurno = 'Turno Largo Semana (17:00 a 08:00)';
      atencionesDiurno = 0; // SAR cerrado de día en semana hábil
      atencionesNocturno = adjustedEstimate;
      limiteInfDiurno = 0;
      limiteSupDiurno = 0;
      limiteInfNocturno = lowerBound;
      limiteSupNocturno = upperBound;
    }

    // Desglose de Complejidad por Triage Manchester (Saturación hospitalaria aporta +80% a C4/C5 leves)
    const c1_c2 = Math.max(1, Math.round(adjustedEstimate * 0.04));
    const c3 = Math.round(adjustedEstimate * (alertaHospitalMelipilla ? 0.45 : 0.49));
    const altaComplejidad = c1_c2 + c3;
    const c4_c5 = Math.max(0, adjustedEstimate - altaComplejidad);
    const alertaAltaComplejidad = altaComplejidad >= 45;

    // Horas Médicas Requeridas (Rendimiento estándar SAR: 3.8 pac/hora)
    const horasMedicasRequeridas = Number((adjustedEstimate / 3.8).toFixed(1));
    const horasMedicasMin = Number((lowerBound / 3.8).toFixed(1));
    const horasMedicasMax = Number((upperBound / 3.8).toFixed(1));

    // Curva Horaria Intradía
    const curvaHoraria = generateHourlyCurve(isFindeOFeriado, adjustedEstimate);

    proyecciones.push({
      fecha_predicha: fechaStr,
      atenciones_estimadas: adjustedEstimate,
      yhat: adjustedEstimate,
      limite_inferior: lowerBound,
      limite_superior: upperBound,
      lo_90: lowerBound,
      hi_90: upperBound,
      prediction_interval_lower_bound: lowerBound,
      prediction_interval_upper_bound: upperBound,
      rangoConfianza: [lowerBound, upperBound],
      tipoJornada,
      tagTipoJornada,
      isFindeOFeriado,
      esFeriadoOficial: Boolean(isOfficialChileHoliday),
      esquemaTurno,
      atenciones_diurno: atencionesDiurno,
      atenciones_nocturno: atencionesNocturno,
      limite_inferior_diurno: limiteInfDiurno,
      limite_superior_diurno: limiteSupDiurno,
      limite_inferior_nocturno: limiteInfNocturno,
      limite_superior_nocturno: limiteSupNocturno,
      c1_c2_estimados: c1_c2,
      c3_estimados: c3,
      alta_complejidad_total: altaComplejidad,
      c4_c5_estimados: c4_c5,
      alertaAltaComplejidad,
      horasMedicasRequeridas,
      horasMedicasMin,
      horasMedicasMax,
      curvaHoraria,
      weatherMultiplier: Number(weatherMultiplier.toFixed(2)),
      weatherReason,
      tagClima,
      alertaHospitalariaActiva: alertaHospitalMelipilla,
      tagHospital: alertaHospitalMelipilla ? '🚨 Saturación Hospital San José de Melipilla (+20% C4/C5)' : '🟢 Flujo Hospitalario Regular',
      clima: weatherToday
    });
  }

  return proyecciones;
};

/**
 * Detecta la fecha máxima de corte real desde pacientesDB o turnosDB
 * @param {Array} pacientesDB
 * @param {Array} turnosDB
 * @returns {Date}
 */
export const detectEffectiveBaseDate = (pacientesDB = [], turnosDB = []) => {
  let maxTime = 0;
  if (pacientesDB && pacientesDB.length > 0) {
    for (const p of pacientesDB) {
      const t = p.tAdmision ? new Date(p.tAdmision).getTime() : 0;
      if (t > maxTime && t < 1893456000000) { // < año 2030
        maxTime = t;
      }
    }
  }
  if (turnosDB && turnosDB.length > 0) {
    for (const t of turnosDB) {
      if (t.fechaInicio && typeof t.fechaInicio === 'string') {
        const parts = t.fechaInicio.split('-');
        if (parts.length === 3) {
          const tMs = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 23, 59, 0).getTime();
          if (tMs > maxTime && tMs < 1893456000000) maxTime = tMs;
        }
      }
    }
  }
  if (maxTime > 0) {
    return new Date(maxTime);
  }
  return new Date();
};
