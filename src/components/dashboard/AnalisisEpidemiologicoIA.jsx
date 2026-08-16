import React from 'react';
import { Sparkles, Brain, Activity, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';

export default function AnalisisEpidemiologicoIA({ narrativeText, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-6 bg-slate-50 border border-slate-300 rounded-2xl text-slate-700 flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
        <span className="text-xs font-bold font-mono">Generando Síntesis Epidemiológica Generativa con IA Gemini...</span>
      </div>
    );
  }

  if (!narrativeText) return null;

  // Separar el texto en párrafos o secciones
  const paragraphs = narrativeText.split('\n\n').filter(p => p.trim().length > 0);

  return (
    <div className="mt-6 pt-4 border-t-2 border-slate-300 space-y-4 print:mt-6 print:space-y-3">
      {/* Header del Bloque de Inteligencia Sanitaria */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-900 text-white rounded-lg">
            <Sparkles className="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
              Síntesis Epidemiológica Generativa & Análisis de Brechas (IA Director Sanitario)
            </h3>
            <span className="text-[9px] text-slate-500 font-bold block">
              Modelo Epidemiológico Descriptivo: Persona, Tiempo y Resolución (Gemini 1.5 Flash SSOT)
            </span>
          </div>
        </div>
        <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-900 text-[10px] font-mono font-black rounded-md border border-indigo-300">
          SÍNTESIS OFICIAL IA
        </span>
      </div>

      {/* Cuerpo del Análisis Generado */}
      <div className="p-5 bg-slate-50 border border-slate-300 rounded-2xl space-y-3 text-slate-800 text-xs font-serif leading-relaxed">
        {paragraphs.map((paragraph, idx) => (
          <p key={idx} className="text-justify leading-relaxed text-slate-800">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Nota de Certificación al Pie */}
      <div className="flex items-center justify-between text-[9px] text-slate-500 font-sans font-semibold pt-1">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Análisis Automático Auditado por el Motor de Inteligencia Predictiva MÉTRICO
        </span>
        <span>Dirección de Inteligencia Sanitaria SAR Melipilla</span>
      </div>
    </div>
  );
}
