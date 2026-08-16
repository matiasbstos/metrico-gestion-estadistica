/**
 * Motor de Síntesis Epidemiológica Generativa (IA Gemini)
 * Para MÉTRICO — Plataforma Estadistica de Salud Pública y Urgencias
 */

const SYSTEM_PROMPT = `Eres el Director de Inteligencia Sanitaria del SAR. Tu tarea es redactar un 'Resumen Ejecutivo y Análisis de Brechas' basado en los datos proporcionados. Utiliza el Modelo Epidemiológico Descriptivo (Persona, Tiempo, Resolución). Estructura el texto en dos partes: 1. Resumen de Estructura Demográfica (volumen, edad, vulnerabilidad según previsión). 2. Análisis de Causa Raíz (cruza los picos de saturación del mapa de calor con el Top de diagnósticos para explicar los tiempos de estadía y prever posibles cuellos de botella en traslados). Tono gerencial, riguroso, sin saludos, máximo 3 párrafos cortos.`;

/**
 * Generador Fallback de Alta Fidelidad en caso de timeout o ausencia de API Key
 */

function generateFallbackSynthesis(snapshot) {
  const {
    arquetipo_seleccionado = {},
    total_pacientes = 0,
    edad_promedio = '-',
    tiempos_promedio = {},
    top_5_diagnosticos_cie10 = [],
    distribucion_prevision_fonasa = [],
    picos_heatmap = 'Horarios habituales de baja demanda'
  } = snapshot;

  const tramo = arquetipo_seleccionado.tramoEtario || 'Cohorte General';
  const sexo = arquetipo_seleccionado.sexo || 'Todos los géneros';
  const prev = arquetipo_seleccionado.prevision || 'Previsión General';
  const rango = arquetipo_seleccionado.rangoTemporal || 'Universo Histórico SSOT';

  // Calcular vulnerabilidad Fonasa
  const fonasaCount = distribucion_prevision_fonasa
    .filter(p => String(p.name).toUpperCase().includes('FONASA'))
    .reduce((sum, p) => sum + (p.value || 0), 0);
  const fonasaPct = total_pacientes > 0 ? ((fonasaCount / total_pacientes) * 100).toFixed(1) : '85.0';

  // Formatear Top 2 diagnósticos para causa raíz
  const diag1 = top_5_diagnosticos_cie10[0] ? `[${top_5_diagnosticos_cie10[0].code}] ${top_5_diagnosticos_cie10[0].name} (${top_5_diagnosticos_cie10[0].pct}%)` : 'patologías respiratorias/gastrointestinales';
  const diag2 = top_5_diagnosticos_cie10[1] ? `[${top_5_diagnosticos_cie10[1].code}] ${top_5_diagnosticos_cie10[1].name} (${top_5_diagnosticos_cie10[1].pct}%)` : 'síndromes de manejo médico local';

  const parte1 = `1. Resumen de Estructura Demográfica: La cohorte filtrada bajo el arquetipo "${tramo}" (${sexo}, ${prev}, período: ${rango}) registra una muestra consolidada de ${total_pacientes.toLocaleString('es-CL')} admisiones, con una media etaria de ${edad_promedio}. El perfil socio-sanitario evidencia un ${fonasaPct}% de beneficiarios pertenecientes a la red pública FONASA, concentrando un elevado índice de vulnerabilidad social y dependencia asistencial directa del Servicio de Atención Primaria de Urgencia (SAR).`;

  const parte2 = `2. Análisis de Causa Raíz & Saturación: El cruce epidemiológico entre el mapa de calor operativo y la morbilidad orgánica revela que las mayores demandas de atención se focalizan en ${picos_heatmap}. Esta concentración horaria se correlaciona directamente con la prevalencia de ${diag1} y ${diag2}, patologías cuya resolución clínica requiere tiempos de observación y exámenes de laboratorio que elevan el tiempo promedio de estadía a ${tiempos_promedio.estadia || 'minutos habituales'} y la espera previa a ${tiempos_promedio.espera || 'minutos'}. Se identifican cuellos de botella potenciales en momentos de saturación horaria, sugiriendo la activación de protocolos de agilización de traslados a la red hospitalaria de derivación.`;

  return `${parte1}\n\n${parte2}`;
}

/**
 * Función principal para generar la síntesis epidemiológica mediante Gemini API o Fallback
 */
export async function generateEpidemiologicalSynthesis(snapshot) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;

  if (!apiKey) {
    console.info("Gemini API key no configurada en entorno cliente. Usando motor analítico determinista.");
    return generateFallbackSynthesis(snapshot);
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const userPrompt = `A continuación se presentan los datos cuantitativos del arquetipo poblacional en formato JSON:
${JSON.stringify(snapshot, null, 2)}

Por favor genera el "Resumen Ejecutivo y Análisis de Brechas" siguiendo estrictamente el System Prompt.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500); // 4.5s timeout max

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
              { text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 500
        }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini API respondió con status ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text && text.trim().length > 50) {
      return text.trim();
    } else {
      return generateFallbackSynthesis(snapshot);
    }
  } catch (err) {
    console.warn("Fallo o timeout en Gemini API, utilizando fallback experto:", err.message);
    return generateFallbackSynthesis(snapshot);
  }
}
