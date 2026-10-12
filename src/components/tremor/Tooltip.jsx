import React, { useState } from 'react';
import { Info, Award, CheckCircle2, TrendingUp, TrendingDown, Clock, Activity, Target } from 'lucide-react';

export const GLOSARIO_KPIS = {
  scoreGlobal: {
    title: 'Score Global de Desempeño',
    text: 'Esta herramienta evalúa el desempeño de las guardias mediante un modelo de puntuación ponderada (0-100 pts), priorizando la agilidad clínica, la resolución de pacientes y la capacidad de absorción.',
    formulaTitle: 'Fórmula de Puntuación Máxima (100 pts) & Justificación de Porcentajes:',
    breakdown: [
      { pct: '30%', name: 'Tasa Resolutiva', desc: '¿Por qué 30%? Es la misión central del SAR: resolver la urgencia ambulatoria y evitar derivaciones evitables al Hospital Base. Premia altas médicas efectivas y retención asistencial (meta ≥90%).' },
      { pct: '30%', name: 'Agilidad Triage', desc: '¿Por qué 30%? Primera barrera de seguridad del paciente. La categorización oportuna (≤15 min) detecta emergencias críticas C1/C2; la seguridad vital es intransable.' },
      { pct: '20%', name: 'Estadía (Lead Time)', desc: '¿Por qué 20%? Premia la rotación ágil de box sin hacinamiento, pero se topa al 20% para no inducir altas apresuradas que comprometan la observación médica necesaria.' },
      { pct: '20%', name: 'Volumen Absorbido', desc: '¿Por qué 20%? Reconoce el esfuerzo de absorber alta demanda comunitaria, pero se acota al 20% para no penalizar a turnos con menor afluencia natural (días hábiles).' }
    ],
    criterion: 'Criterio de evaluación: Polaridad positiva (mayor puntaje = mejor balance integral entre agilidad, resolución, permanencia y capacidad de absorción).',
    standard: 'Escala 0 a 100 puntos (Modelo Ponderado Oficial SAR)'
  },
  volumenTotal: {
    title: 'Volumen Total (Carga Asistencial)',
    text: 'Total de pacientes admitidos en el servicio de urgencia durante los turnos correspondientes al equipo evaluado.',
    criterion: 'Criterio de evaluación: Polaridad positiva. Evalúa la capacidad de absorción y resiliencia asistencial ante alta demanda.',
    standard: 'Absorción de demanda asistencial'
  },
  latenciaTriage: {
    title: 'Latencia Admisión - Triaje',
    text: 'Mide el tiempo transcurrido desde que el paciente es ingresado en ventanilla (Admisión) hasta que se le asigna una categoría (C1-C5).',
    criterion: 'Criterio de evaluación: Polaridad negativa (menor tiempo = mayor puntaje). El estándar óptimo institucional es ≤15 minutos.',
    standard: 'Estándar institucional: ≤ 15 minutos'
  },
  leadTime: {
    title: 'Lead Time Global (Estadía Total)',
    text: 'Mide el tiempo total de permanencia en el recinto desde la categorización en Triage hasta el egreso final (Alta o Derivación).',
    criterion: 'Criterio de evaluación: Polaridad negativa (menor tiempo = mayor agilidad y rotación de camillas). Penaliza esperas prolongadas en box.',
    standard: 'Permanencia total en urgencia'
  },
  tasaResolutiva: {
    title: 'Tasa Resolutiva',
    text: 'Porcentaje de pacientes que completaron su atención médica. Fórmula: (Altas Médicas + Traslados + Constataciones) / Total Admitidos.',
    criterion: 'Criterio de evaluación: Polaridad positiva (mayor tasa = mayor capacidad de resolución clínica directa). Meta institucional: ≥90%.',
    standard: 'Meta institucional: ≥ 90%'
  },
  tasaFuga: {
    title: 'Tasa de Fuga (Abandono Pre-Atención)',
    text: 'Pacientes que se retiran del recinto sin atención médica tras esperar en sala de espera. Indicador directo de saturación operativa.',
    criterion: 'Criterio de evaluación: Polaridad negativa. Un aumento aquí penaliza severamente el puntaje de retención asistencial y alerta riesgo médico-legal.',
    standard: 'Meta de seguridad: < 5.0%'
  },
  reingreso48h: {
    title: 'Reingreso Inesperado < 48H',
    text: 'Pacientes que vuelven a consultar en urgencia por el mismo o peor cuadro clínico dentro de las 48 horas siguientes al alta médica.',
    criterion: 'Criterio de evaluación: Polaridad negativa (menor porcentaje = mayor calidad diagnóstica y seguridad del alta). Meta: < 3.0%.',
    standard: 'Control de calidad: < 3.0%'
  },
  trasladosCriticos: {
    title: 'Rescate Crítico UEH (C1/C2)',
    text: 'Porcentaje de derivaciones de urgencia vital o alta complejidad hacia el hospital base en ambulancia de rescate SAMU.',
    criterion: 'Criterio de evaluación: Monitor de severidad asistencial. Turnos con mayor porcentaje requieren coordinación inmediata de red y disponibilidad de reanimador.',
    standard: 'Severidad C1/C2 y gestión de red'
  },
  extremosVida: {
    title: 'Demografía Dependiente (Extremos de la Vida)',
    text: 'Proporción de atenciones a población vulnerable: pacientes pediátricos (≤ 14 años) y personas mayores (≥ 60 años).',
    criterion: 'Criterio de evaluación: Carga asistencial dependiente. Mayor proporción exige mayor tiempo de enfermería, dosificación y cuidados complejos.',
    standard: 'Población dependiente vulnerable'
  },
  trackerHorario: {
    title: 'Monitor de Triage (El Semáforo Horario)',
    text: 'Mapeo cronológico hora a hora de la latencia a categorización. Identifica cuellos de botella intradiarios.',
    criterion: 'Criterio de evaluación: Polaridad positiva para horas con latencia promedio ≤ 15 min (verde esmeralda). Bloques rosados indican congestión en admisión.',
    standard: 'Meta: 100% bloques ≤ 15 min'
  },
  manchester: {
    title: 'Categorización Triage Manchester (C1 a C5)',
    text: 'Distribución de severidad clínica según el protocolo internacional Manchester: C1 (Reanimación), C2 (Emergencia), C3 (Urgencia), C4 (Menor) y C5 (No Urgente).',
    criterion: 'Criterio de evaluación: Ajuste por complejidad asistencial. C1-C3 concentran la mayor demanda diagnóstica y consumo de recursos clínicos.',
    standard: 'Protocolo Manchester Internacional'
  },
  radarMultieje: {
    title: 'Poligonometría Multieje Operativa',
    text: 'Representación pentagonal de 5 dimensiones operativas: Volumen, Agilidad Triage, Permanencia (Lead Time), Resolutividad y Complejidad C1-C3.',
    criterion: 'Criterio de evaluación: Mayor área y simetría poligonal refleja equilibrio armónico entre velocidad asistencial y resolución en box.',
    standard: 'Equilibrio de guardia (5 ejes)'
  },
  pctTriageOportuno: {
    title: 'Triage Oportuno (≤15 min)',
    text: 'Proporción de pacientes que recibieron categorización clínica en 15 minutos o menos desde la ventanilla de admisión.',
    criterion: 'Criterio de evaluación: Polaridad positiva (meta ministerial: ≥ 85% de atenciones categorizadas a tiempo).',
    standard: 'Estándar ministerial: ≥ 85%'
  },
  altasAdmin: {
    title: 'Altas Administrativas',
    text: 'Pacientes con egreso administrativo, deserciones voluntarias o cancelaciones de ventanilla.',
    criterion: 'Criterio de evaluación: Polaridad negativa (menor número = mayor retención del servicio asistencial).',
    standard: 'Mínima deserción asistencial'
  }
};

/**
 * Componente KPITooltip
 * Envuelve el título o nombre de un KPI con tooltip o popover explicativo al hover e ícono informativo (ⓘ).
 * Si la métrica contiene un desglose de fórmula (ej. scoreGlobal), despliega un Popover grande enriquecido.
 */
export default function KPITooltip({
  kpiKey,
  title,
  text,
  standard,
  criterion,
  children,
  showIcon = true,
  position = 'top',
  className = ''
}) {
  const [show, setShow] = useState(false);

  const entry = GLOSARIO_KPIS[kpiKey] || {};
  const displayTitle = title || entry.title;
  const displayText = text || entry.text;
  const displayStandard = standard || entry.standard;
  const displayCriterion = criterion || entry.criterion;
  const breakdown = entry.breakdown;
  const formulaTitle = entry.formulaTitle;

  if (!displayText && !breakdown) {
    return <span className={className}>{children}</span>;
  }

  const isLargePopover = Boolean(breakdown && breakdown.length > 0);

  return (
    <span
      className={`relative inline-flex items-center gap-1 group cursor-help ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      title={`${displayTitle}: ${displayText}`}
    >
      <span className="inline-flex items-center">
        {children || displayTitle}
      </span>

      {showIcon && (
        <span
          className="inline-flex items-center text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-0.5"
          aria-label={`Información sobre ${displayTitle}`}
        >
          <Info className="w-3.5 h-3.5" />
        </span>
      )}

      {/* TOOLTIP / POPOVER FLOTANTE */}
      <span
        role="tooltip"
        className={`absolute z-[9999] pointer-events-none bg-[#0f172a] text-white rounded-2xl shadow-2xl border border-slate-700 text-left font-normal transition-opacity duration-150 ${
          isLargePopover ? 'w-80 sm:w-96 p-4' : 'w-64 sm:w-72 p-3.5'
        } ${
          show ? 'block opacity-100' : 'hidden group-hover:block opacity-0 group-hover:opacity-100'
        } ${
          position === 'top'
            ? 'bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 mb-2.5'
            : position === 'bottom'
              ? 'top-full left-0 sm:left-1/2 sm:-translate-x-1/2 mt-2.5'
              : position === 'left'
                ? 'right-full top-1/2 -translate-y-1/2 mr-2.5'
                : 'left-full top-1/2 -translate-y-1/2 ml-2.5'
        }`}
      >
        {/* Triángulo indicador */}
        <span
          className={`absolute w-2.5 h-2.5 bg-[#0f172a] border-slate-700 transform rotate-45 block ${
            position === 'top'
              ? 'left-4 sm:left-1/2 sm:-translate-x-1/2 -bottom-1.5 border-b border-r'
              : position === 'bottom'
                ? 'left-4 sm:left-1/2 sm:-translate-x-1/2 -top-1.5 border-t border-l'
                : position === 'left'
                  ? '-right-1.5 top-1/2 -translate-y-1/2 border-t border-r'
                  : '-left-1.5 top-1/2 -translate-y-1/2 border-b border-l'
          }`}
        />

        {/* Encabezado del Popover */}
        {displayTitle && (
          <span className="flex items-center gap-2 mb-2 border-b border-slate-700/60 pb-2">
            <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0 inline-flex items-center justify-center">
              {isLargePopover ? <Award className="w-3.5 h-3.5 text-amber-400" /> : <Info className="w-3 h-3" />}
            </span>
            <span className="font-black text-indigo-300 text-xs tracking-tight leading-tight block">
              {displayTitle}
            </span>
          </span>
        )}

        {/* Texto descriptivo principal */}
        <span className="text-slate-200 font-medium text-[11px] leading-relaxed block whitespace-normal">
          {displayText}
        </span>

        {/* Desglose de Ponderación si es un Popover compuesto (Fase 2: Score Global) */}
        {isLargePopover && (
          <span className="mt-2.5 pt-2 border-t border-slate-700/80 block space-y-1.5">
            {formulaTitle && (
              <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block">
                {formulaTitle}
              </span>
            )}
            <span className="space-y-1.5 block">
              {breakdown.map((item, bIdx) => (
                <span key={bIdx} className="flex items-start gap-2 text-[10.5px] leading-snug">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-black text-[9.5px] shrink-0 border border-indigo-500/30">
                    {item.pct}
                  </span>
                  <span className="text-slate-300">
                    <strong className="text-white font-bold">{item.name}:</strong> {item.desc}
                  </span>
                </span>
              ))}
            </span>
          </span>
        )}

        {/* Criterio de Evaluación y Polaridad (Fase 3: Glosario Universal) */}
        {displayCriterion && (
          <span className="mt-2 pt-2 border-t border-slate-800/80 block text-[10px] text-emerald-300 font-semibold leading-tight">
            {displayCriterion}
          </span>
        )}

        {/* Estándar / Meta Institucional */}
        {displayStandard && (
          <span className="mt-1.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-semibold">Estándar:</span>
            <span className="text-indigo-300 font-black">{displayStandard}</span>
          </span>
        )}
      </span>
    </span>
  );
}
