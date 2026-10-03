import React, { useState } from 'react';
import { Info } from 'lucide-react';

export const GLOSARIO_KPIS = {
  scoreGlobal: {
    title: 'Score Global de Desempeño',
    text: 'Índice ponderado: 30% Tasa Resolutiva + 30% Agilidad Triage + 20% Estadía Global + 20% Volumen Absorbido.',
    standard: 'Escala 0 a 100 puntos'
  },
  volumenTotal: {
    title: 'Volumen Total (Carga Operativa)',
    text: 'Total de pacientes admitidos en el servicio de urgencia durante los turnos correspondientes al equipo evaluado.',
    standard: 'Absorción de demanda asistencial'
  },
  latenciaTriage: {
    title: 'Latencia Admisión - Triaje',
    text: 'Tiempo transcurrido desde que el paciente es ingresado en ventanilla (Admisión) hasta que se le asigna una categoría (C1-C5). Estándar institucional: ≤ 15 minutos.',
    standard: 'Estándar institucional: ≤ 15 minutos'
  },
  leadTime: {
    title: 'Lead Time Global (Estadía Total)',
    text: 'Tiempo total de permanencia en el recinto. Mide desde la hora de categorización en Triage hasta el egreso final (Alta o Derivación).',
    standard: 'Permanencia total en urgencia'
  },
  tasaResolutiva: {
    title: 'Tasa Resolutiva',
    text: 'Porcentaje de pacientes que completaron su atención médica. Fórmula: (Altas Médicas + Traslados + Constataciones) / Total Admitidos.',
    standard: 'Fórmula: (Altas Médicas + Traslados + Constataciones) / Total Admitidos'
  },
  tasaFuga: {
    title: 'Tasa de Fuga (Abandono Pre-Atención)',
    text: 'Riesgo Operativo: Pacientes que abandonan el recinto antes de ser evaluados por un médico en box. Se asocia a saturación de la sala de espera.',
    standard: 'Riesgo Operativo en sala de espera'
  },
  reingreso48h: {
    title: 'Reingreso < 48H',
    text: 'Riesgo Clínico: Pacientes que vuelven a consultar por el mismo o peor cuadro clínico dentro de 2 días. Permite auditar la calidad del alta de primer contacto.',
    standard: 'Riesgo Clínico: Calidad del alta médica'
  },
  trasladosCriticos: {
    title: 'Rescate Crítico UEH (C1/C2)',
    text: 'Porcentaje de derivaciones de urgencia vital o alta complejidad hacia el hospital base en ambulancia de rescate SAMU.',
    standard: 'Urgencia vital C1/C2'
  },
  extremosVida: {
    title: 'Demografía Dependiente (Extremos de la Vida)',
    text: 'Proporción de atenciones a población vulnerable: pacientes pediátricos (≤ 14 años) y personas mayores (≥ 60 años).',
    standard: 'Población con alta demanda de cuidados'
  },
  trackerHorario: {
    title: 'Monitor de Triage (El Semáforo Horario)',
    text: 'Semáforo intradiario hora a hora: Bloque esmeralda para horas con latencia promedio ≤ 15 min, y bloque rosa para horas que superaron el estándar.',
    standard: 'Meta: ≤ 15 min por bloque'
  }
};

/**
 * Componente KPITooltip
 * Envuelve el título o nombre de un KPI con tooltip explicativo al hover e ícono informativo (ⓘ).
 */
export default function KPITooltip({
  kpiKey,
  title,
  text,
  standard,
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

  if (!displayText) {
    return <span className={className}>{children}</span>;
  }

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

      <span
        role="tooltip"
        className={`absolute z-[9999] pointer-events-none w-64 sm:w-72 bg-[#0f172a] text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-left font-normal ${
          show ? 'block' : 'hidden group-hover:block'
        } ${
          position === 'top'
            ? 'bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 mb-2'
            : 'top-full left-0 sm:left-1/2 sm:-translate-x-1/2 mt-2'
        }`}
      >
        {/* Triángulo indicador */}
        <span
          className={`absolute left-4 sm:left-1/2 sm:-translate-x-1/2 w-2.5 h-2.5 bg-[#0f172a] border-slate-700 transform rotate-45 block ${
            position === 'top'
              ? '-bottom-1.5 border-b border-r'
              : '-top-1.5 border-t border-l'
          }`}
        />
        {displayTitle && (
          <span className="flex items-center gap-1.5 mb-1.5 border-b border-slate-700/60 pb-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0 inline-block" />
            <span className="font-black text-indigo-300 text-xs tracking-tight leading-tight block">
              {displayTitle}
            </span>
          </span>
        )}
        <span className="text-slate-200 font-medium text-[11px] leading-relaxed block whitespace-normal">
          {displayText}
        </span>
        {displayStandard && (
          <span className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-semibold">Criterio:</span>
            <span className="text-emerald-400 font-black">{displayStandard}</span>
          </span>
        )}
      </span>
    </span>
  );
}
