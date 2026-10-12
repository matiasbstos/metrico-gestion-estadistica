import React, { useState } from 'react';
import { 
  Scale, 
  ShieldCheck, 
  Clock, 
  Activity, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Target,
  FileCheck2
} from 'lucide-react';

/**
 * ApartadoScoreGlobal.jsx
 * Apartado metodológico institucional y pedagógico que detalla los fundamentos clínicos
 * y la justificación directiva del Score Global Ponderado (0-100 pts) y cada uno de sus 4 porcentajes:
 * - 30% Tasa Resolutiva
 * - 30% Agilidad de Triaje (≤15 min)
 * - 20% Lead Time / Estadía Total
 * - 20% Capacidad de Absorción (Volumen)
 */
export default function ApartadoScoreGlobal({ defaultExpanded = true, id = 'apartado-score-global' }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState('todos'); // 'todos' | 'resolutiva' | 'triage' | 'estadia' | 'volumen'

  const items = [
    {
      id: 'resolutiva',
      pct: '30%',
      name: 'Tasa Resolutiva',
      subname: 'Altas Médicas Directas y Retención',
      color: 'emerald',
      borderColor: 'border-emerald-500/40',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      icon: ShieldCheck,
      meta: '≥ 90% Altas Médicas',
      polaridad: 'Positiva (Mayor % es mejor)',
      porQueSeEvalua: 
        'La misión primaria de un Servicio de Alta Resolutividad (SAR) es resolver la urgencia ambulatoria de baja y mediana complejidad en la red primaria, evitando la sobrecarga y el colapso de la Unidad de Emergencia Hospitalaria (UEH) del hospital base.',
      porQueEstePorcentaje: 
        'Representa el 30% (máxima ponderación compartida) porque mide el desenlace clínico real del paciente: si la consulta culminó con resolución médica efectiva en el establecimiento o si terminó en deserción (fuga/alta sin atención) o derivación secundaria innecesaria.',
      impactoClinico: 
        'Un turno con alta resolutividad descongestiona el hospital de referencia, minimiza eventos de fuga en sala de espera y garantiza un uso óptimo del equipamiento diagnóstico (laboratorio POCT y rayos).'
    },
    {
      id: 'triage',
      pct: '30%',
      name: 'Agilidad de Triaje',
      subname: 'Latencia Admisión → Triage Manchester',
      color: 'blue',
      borderColor: 'border-blue-500/40',
      badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      icon: Activity,
      meta: '≤ 15 minutos (MINSAL)',
      polaridad: 'Negativa (Menor tiempo es mejor)',
      porQueSeEvalua: 
        'El Triage Manchester es la barrera más crítica de seguridad del paciente en el servicio de urgencia. Permite identificar de inmediato a usuarios con compromiso hemodinámico, dolor severo o riesgo vital inminente (categorías C1, C2 y C3).',
      porQueEstePorcentaje: 
        'Se le asigna el 30% (máxima ponderación compartida) porque la seguridad del paciente es intransable. Un retraso en categorizar a un paciente en sala de espera expone a usuarios graves a deterioro inadvertido o desenlaces fatales sin detección oportuna.',
      impactoClinico: 
        'Cumplir el estándar de categorización en ≤15 minutos asegura que los pacientes críticos ingresen de inmediato a reanimación y que los boxes médicos reciban una fila clínica priorizada por riesgo y no por orden de llegada burocrático.'
    },
    {
      id: 'estadia',
      pct: '20%',
      name: 'Lead Time / Estadía Total',
      subname: 'Permanencia en Recinto (Triage → Egreso)',
      color: 'indigo',
      borderColor: 'border-indigo-500/40',
      badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      icon: Clock,
      meta: '≤ 90 - 120 min promedio',
      polaridad: 'Negativa (Menor estadía es mejor)',
      porQueSeEvalua: 
        'Mide la celeridad interna del flujo clínico: tiempo de espera para box médico, toma e informe de radiología, exámenes básicos de laboratorio y administración de terapia en sala de observación.',
      porQueEstePorcentaje: 
        'Se fija en 20% (y no en 30%) de forma deliberada para evitar incentivos perversos. Si la estadía tuviera una ponderación excesiva, los equipos médicos podrían inducir altas apresuradas o recortar tiempos de observación necesarios. El 20% premia la agilidad sin comprometer la exhaustividad diagnóstica.',
      impactoClinico: 
        'Una rotación ágil de camillas previene el hacinamiento en salas de espera y boxes de tratamiento, permitiendo que la guardia mantenga capacidad libre para absorber nuevos ingresos sin generar cuellos de botella.'
    },
    {
      id: 'volumen',
      pct: '20%',
      name: 'Capacidad de Absorción',
      subname: 'Carga Operativa Total Atendida',
      color: 'amber',
      borderColor: 'border-amber-500/40',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      icon: Users,
      meta: 'Demanda real absorbida',
      polaridad: 'Positiva (Mayor volumen es mejor)',
      porQueSeEvalua: 
        'Evalúa la resiliencia operativa y la capacidad de trabajo en equipo frente a peaks de demanda asistencial, epidemias estacionales (campaña de invierno) y turnos de fin de semana con afluencia masiva.',
      porQueEstePorcentaje: 
        'Se fija en 20% para equilibrar la cancha de forma justa entre distintos tipos de jornada. Si el volumen pesara 40%, los turnos de días hábiles (menor afluencia natural) jamás podrían competir con los fines de semana. El 20% reconoce el esfuerzo del alto volumen sin castigar a turnos con menor demanda exógena.',
      impactoClinico: 
        'Premia la capacidad de respuesta y absorción de la guardia frente a la sobredemanda comunitaria, reconociendo el mayor esfuerzo de médicos, enfermería y TENS durante jornadas de alta complejidad asistencial.'
    }
  ];

  return (
    <div id={id} className="bg-card-custom rounded-3xl border border-card-custom shadow-xs overflow-hidden transition-all duration-300">
      {/* CABECERA PRINCIPAL DEL APARTADO */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 md:p-6 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-slate-50/60 dark:from-slate-900/60 dark:via-indigo-950/20 dark:to-slate-900/60 border-b border-card-custom/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none group"
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <Scale className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-600 text-white shadow-2xs">
                Metodología Institucional
              </span>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                Modelo Multidimensional 0 - 100 pts
              </span>
            </div>
            <h3 className="text-base md:text-lg font-black text-primary-custom tracking-tight mt-0.5 flex items-center gap-2">
              <span>Apartado Metodológico: ¿Por qué y Cómo se Evalúa el Score Global?</span>
            </h3>
            <p className="text-xs text-secondary-custom font-medium mt-0.5">
              Fundamentos clínicos y de gestión que justifican la ponderación <strong className="text-primary-custom">30% Resolutiva • 30% Triaje • 20% Estadía • 20% Volumen</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900/60 shadow-2xs flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isExpanded ? 'Ocultar Detalle' : 'Ver Fundamentos'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 ml-0.5" /> : <ChevronDown className="w-4 h-4 ml-0.5" />}
          </span>
        </div>
      </div>

      {/* CONTENIDO EXPANDIDO */}
      {isExpanded && (
        <div className="p-5 md:p-8 space-y-8 animate-fadeIn">
          {/* SECCIÓN 1: ¿POR QUÉ UN SCORE GLOBAL PONDERADO? */}
          <div className="p-5 md:p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-card-custom/60 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Target className="w-4 h-4" />
              </div>
              <h4 className="text-sm md:text-base font-black text-primary-custom tracking-tight">
                1. ¿Por qué evaluar mediante un Score Global Ponderado?
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-secondary-custom">
              <div className="p-4 rounded-xl bg-card-custom border border-card-custom/40 space-y-2">
                <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  El riesgo de evaluar con una métrica aislada (Sesgo Clínico)
                </span>
                <p>
                  Si un dashboard evalúa a las guardias sólo por <strong>volumen de pacientes</strong>, premiará a turnos masivos aunque hayan tenido esperas intolerables o deserciones. Si sólo evalúa <strong>tiempo de espera</strong>, beneficiará a turnos que tuvieron baja demanda externa y perjudicará injustamente a quienes absorbieron una contingencia. Y si sólo mide <strong>velocidad médica</strong>, se incentivan altas prematuras sin resolución efectiva.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-card-custom border border-card-custom/40 space-y-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  La solución integral: Ponderación balanceada y normalizada
                </span>
                <p>
                  El Score Global de MÉTRICO unifica la evaluación en una escala objetiva de <strong>0 a 100 puntos</strong>. Cada métrica es normalizada frente al universo de turnos, premiando a los equipos que logran un <strong>equilibrio armónico</strong>: resolver con rapidez diagnóstica, proteger la seguridad en el triaje, rotar boxes con agilidad y absorber la demanda comunitaria.
                </p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DESGLOSE DE LOS 4 ÍTEMS Y SUS PORCENTAJES */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h4 className="text-sm md:text-base font-black text-primary-custom tracking-tight">
                  2. Justificación Directiva: ¿Por qué cada ítem y por qué ese porcentaje exacto?
                </h4>
              </div>

              {/* Filtro rápido interactivo */}
              <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto text-[11px] font-bold">
                <button
                  onClick={() => setActiveTab('todos')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activeTab === 'todos'
                      ? 'bg-primary-custom text-white shadow-2xs'
                      : 'bg-black/5 dark:bg-white/5 text-secondary-custom hover:text-primary-custom'
                  }`}
                >
                  Ver los 4 Pilares
                </button>
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-2 py-1 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-black/5 dark:bg-white/5 text-secondary-custom hover:text-primary-custom'
                    }`}
                  >
                    {item.pct} {item.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de 4 Tarjetas Detalladas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items
                .filter(it => activeTab === 'todos' || activeTab === it.id)
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={item.id}
                      className={`p-5 rounded-2xl bg-card-custom border ${item.borderColor} shadow-2xs space-y-4 relative overflow-hidden flex flex-col justify-between`}
                    >
                      {/* Cinta superior decorativa */}
                      <div className="flex items-start justify-between gap-3 border-b border-card-custom/40 pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${item.badgeBg}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-black text-primary-custom">
                                {item.name}
                              </span>
                            </div>
                            <span className="text-[11px] text-secondary-custom font-medium block">
                              {item.subname}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-sm md:text-base font-black px-3 py-1 rounded-xl border ${item.badgeBg}`}>
                            {item.pct} del Score
                          </span>
                        </div>
                      </div>

                      {/* Cuerpo de Preguntas y Respuestas Fundamentales */}
                      <div className="space-y-3 text-xs leading-relaxed">
                        {/* Pregunta 1: ¿Por qué se evalúa? */}
                        <div className="space-y-1">
                          <strong className="text-[11px] font-black uppercase text-primary-custom tracking-wider flex items-center gap-1 text-slate-700 dark:text-slate-300">
                            <span>¿Por qué se evalúa este ítem?</span>
                          </strong>
                          <p className="text-secondary-custom pl-2 border-l-2 border-blue-400/40">
                            {item.porQueSeEvalua}
                          </p>
                        </div>

                        {/* Pregunta 2: ¿Por qué este porcentaje exacto? */}
                        <div className="space-y-1">
                          <strong className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <span>¿Por qué exactamente el {item.pct}?</span>
                          </strong>
                          <p className="text-secondary-custom pl-2 border-l-2 border-amber-400/50">
                            {item.porQueEstePorcentaje}
                          </p>
                        </div>

                        {/* Pregunta 3: Impacto clínico */}
                        <div className="space-y-1">
                          <strong className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <span>Impacto en la Operación SAR:</span>
                          </strong>
                          <p className="text-secondary-custom pl-2 border-l-2 border-emerald-400/50">
                            {item.impactoClinico}
                          </p>
                        </div>
                      </div>

                      {/* Footer de Tarjeta con Estándar y Polaridad */}
                      <div className="pt-3 border-t border-card-custom/40 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <span className="text-secondary-custom font-semibold">
                          Meta Oficial: <strong className="text-primary-custom">{item.meta}</strong>
                        </span>
                        <span className="text-[10px] font-bold text-secondary-custom bg-black/5 dark:bg-white/5 px-2.5 py-0.5 rounded-md">
                          {item.polaridad}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* SECCIÓN 3: FÓRMULA MATEMÁTICA Y NORMALIZACIÓN */}
          <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-slate-50 to-blue-50/50 dark:from-slate-900/60 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-2xs">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <h4 className="text-sm md:text-base font-black text-primary-custom tracking-tight">
                3. Ecuación Matemática Canónica del Score Global (SSOT)
              </h4>
            </div>

            <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-indigo-100 dark:border-slate-700 font-mono text-xs md:text-sm text-slate-800 dark:text-slate-100 font-bold overflow-x-auto text-center shadow-2xs py-3">
              Score Global = (Score Resolutiva × 0.30) + (Score Agilidad Triage × 0.30) + (Score Estadía × 0.20) + (Score Volumen × 0.20)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-card-custom/40">
                <span className="font-black text-emerald-600 dark:text-emerald-400 block">30% Resolutiva</span>
                <span className="text-[11px] text-secondary-custom">Directamente proporcional a la tasa de altas médicas (0 - 100 pts).</span>
              </div>
              <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-card-custom/40">
                <span className="font-black text-blue-600 dark:text-blue-400 block">30% Triage</span>
                <span className="text-[11px] text-secondary-custom">Inversamente proporcional a la latencia: menor tiempo = mayor puntaje.</span>
              </div>
              <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-card-custom/40">
                <span className="font-black text-indigo-600 dark:text-indigo-400 block">20% Estadía</span>
                <span className="text-[11px] text-secondary-custom">Inversamente proporcional al tiempo de permanencia en box.</span>
              </div>
              <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-card-custom/40">
                <span className="font-black text-amber-600 dark:text-amber-400 block">20% Volumen</span>
                <span className="text-[11px] text-secondary-custom">Normalizado respecto a la mayor carga atendida en el período.</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-secondary-custom flex items-center justify-between flex-wrap gap-2 border-t border-indigo-100 dark:border-indigo-900/30">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Cálculo libre de peticiones de red paralelas y gobernado por la Regla 34 del Protocolo de Agentes.
              </span>
              <span className="font-mono font-bold text-primary-custom text-[10px]">
                Escala Normalizada: Min 0.0 pts • Max 100.0 pts
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
