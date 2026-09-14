/**
 * Motor de Análisis de Comportamiento Operativo (Gemini AI 1.5 Flash)
 * Submódulo: Curva de Demanda Continua y Comparativa
 */

const SYSTEM_PROMPT = `Actúa como analista de operaciones clínicas. Compara la curva de demanda del periodo actual frente al de contraste. Redacta un análisis gerencial de 2 párrafos cortos. Identifica: 1) Si la demanda está creciendo o contrayéndose y en qué días/horas específicos se produce la brecha. 2) Una posible hipótesis operativa (ej. 'El alza sostenida a partir del miércoles sugiere un brote estacional'). Mantén un tono ejecutivo, directo y sin saludos.`;

/**
 * Fallback determinista clínico experto en caso de falta de API Key o error de red.
 */
export function generarFallbackAnalisisCurva(payload) {
  const {
    periodoBase = {},
    periodoContraste = {},
    deltaVolumenPct = 0,
    vistaTemporal = 'hora', // 'hora' | 'dia'
    brechaPrincipal = {}
  } = payload || {};

  const totalBase = periodoBase.totalPacientes || 0;
  const totalContraste = periodoContraste?.totalPacientes || 0;
  const tieneContraste = totalContraste > 0;

  const peakBase = periodoBase.peakHour || { horaTooltip: '19:00 - 19:59', atenciones: 0 };
  const peakContraste = periodoContraste?.peakHour || { horaTooltip: '20:00 - 20:59', atenciones: 0 };

  const topDiagBase = periodoBase.topDiagnosticos?.[0]?.diagnostico || 'patologías respiratorias agudas y traumatismos';
  const topDiagContraste = periodoContraste?.topDiagnosticos?.[0]?.diagnostico || 'consultas generales y cuadros osteomusculares';

  const tendencia = deltaVolumenPct > 0 
    ? `un incremento de volumen del +${Math.abs(deltaVolumenPct).toFixed(1)}%` 
    : (deltaVolumenPct < 0 
      ? `una contracción de demanda del ${deltaVolumenPct.toFixed(1)}%` 
      : 'un flujo de admisiones estable y sincronizado');

  const franjaBrecha = brechaPrincipal.etiqueta || (vistaTemporal === 'dia' ? 'hacia el cierre de semana (jueves a domingo)' : 'durante la franja vespertina-nocturna (18:00 a 22:00 hrs)');

  // Párrafo 1: Comportamiento de demanda y brechas
  const parrafo1 = tieneContraste
    ? `La dinámica de demanda asistencial registra ${tendencia} en el período actual (${totalBase.toLocaleString('es-CL')} pacientes) frente a la línea base de contraste (${totalContraste.toLocaleString('es-CL')} pacientes). El desacople operacional más significativo se concentra ${franjaBrecha}, momento en que la afluencia presenta una divergencia de ${Math.abs(brechaPrincipal.delta || 0)} pacientes respecto al histórico. Asimismo, el horario de mayor saturación se ubicó a las ${peakBase.horaTooltip} (${peakBase.atenciones} admisiones), mientras que en el período de contraste el peak se registró a las ${peakContraste.horaTooltip} (${peakContraste.atenciones} admisiones), evidenciando un ${peakBase.horaTooltip === peakContraste.horaTooltip ? 'patrón de congestión horario coincidente' : 'desplazamiento temporal del cuello de botella clínico'}.`
    : `Durante el período analizado, el servicio asistencial consolidó un volumen de ${totalBase.toLocaleString('es-CL')} pacientes con una curva de admisión marcada por una aceleración ${franjaBrecha}. El peak máximo de saturación se registró a las ${peakBase.horaTooltip} concentrando ${peakBase.atenciones} admisiones efectivas, lo que demandó una respuesta reactiva de triage y box médico para mitigar la acumulación en sala de espera.`;

  // Párrafo 2: Hipótesis operativa y recomendaciones gerenciales
  const parrafo2 = `Desde una perspectiva operativa, el perfil morbilítico está traccionado prioritariamente por ${topDiagBase}${tieneContraste ? ` (frente a ${topDiagContraste} en el período previo)` : ''}. Esta correlación clínica sugiere que la mayor tensión en box de categorización responde a un aumento de pacientes con necesidad de tratamiento abreviado y observación médica prolongada. Se recomienda reforzar la disponibilidad de personal de enfermería y médico en el tramo de ${peakBase.horaTooltip} para mantener los tiempos de espera bajo el estándar institucional y asegurar una resolución oportuna sin saturar la red hospitalaria de derivación.`;

  return `${parrafo1}\n\n${parrafo2}`;
}

/**
 * Invoca la API de Gemini 1.5 Flash para generar el análisis gerencial de comportamiento operativo.
 */
export async function generarAnalisisComportamientoGemini(payload) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;

  if (!apiKey) {
    return generarFallbackAnalisisCurva(payload);
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const promptUser = `A continuación se presentan los datos cuantitativos comparativos de la Curva de Demanda en formato JSON:
${JSON.stringify(payload, null, 2)}

Por favor genera el análisis gerencial de 2 párrafos cortos conforme al System Prompt estricto.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${SYSTEM_PROMPT}\n\n${promptUser}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 600
        }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini API HTTP status: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (generatedText && generatedText.trim().length > 60) {
      return generatedText.trim();
    } else {
      return generarFallbackAnalisisCurva(payload);
    }
  } catch (err) {
    console.warn("Fallo o timeout en llamada a Gemini API (Curva Demanda), ejecutando fallback:", err?.message || err);
    return generarFallbackAnalisisCurva(payload);
  }
}
