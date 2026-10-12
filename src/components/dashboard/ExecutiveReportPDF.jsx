import React, { useMemo } from 'react';
import { ArrowLeft, Crown, Calendar, Sparkles, Printer, Download } from 'lucide-react';
import ExecutiveReportTemplate from './ExecutiveReportTemplate';
import { buildScorecardData } from '../../utils/scorecardEngine';

/**
 * Componente Modular ExecutiveReportPDF
 * Vista exportable e independiente del Informe Ejecutivo de Rendimiento SAR.
 * Accesible de forma nativa desde el Router / Menú Lateral en la sección de Subreportes.
 */
export default function ExecutiveReportPDF({
  pacientesDB = [],
  turnosDB = [],
  pautasDB = {},
  filtroFechaInicio = '',
  filtroFechaFin = '',
  scorecardRanking: propScorecardRanking = null,
  globalAggregates: propGlobalAggregates = null,
  kpiExtremes: propKpiExtremes = null,
  onBack = null,
  setActiveTab = null
}) {
  // Rango de fechas normalizado (Por defecto institucional anual completo YTD)
  const currentYearStr = new Date().getFullYear().toString();
  const fechaInicio = filtroFechaInicio || `${currentYearStr}-01-01`;
  const fechaFin = filtroFechaFin || new Date().toISOString().split('T')[0];

  // Si los datos ya vienen pre-calculados desde el módulo padre, usarlos; de lo contrario, computar mediante scorecardEngine
  const computedData = useMemo(() => {
    if (propScorecardRanking && propKpiExtremes) {
      return {
        scorecardRanking: propScorecardRanking,
        globalAggregates: propGlobalAggregates || {},
        kpiExtremes: propKpiExtremes
      };
    }
    return buildScorecardData({
      pacientesDB,
      turnosDB,
      pautasDB,
      fechaInicio,
      fechaFin,
      teams: ['Turno 1', 'Turno 2', 'Turno 3', 'Turno 4']
    });
  }, [pacientesDB, turnosDB, pautasDB, fechaInicio, fechaFin, propScorecardRanking, propGlobalAggregates, propKpiExtremes]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (setActiveTab) {
      setActiveTab('comparativo');
    }
  };

  return (
    <div className="w-full space-y-6 pb-12 animate-fade-in">
      {/* Barra de Control y Navegación del Sub-reporte */}
      <div className="bg-card-custom p-4 md:p-5 rounded-3xl border border-card-custom shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-card-custom text-primary-custom hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Volver a la vista analítica"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-[10px] uppercase flex items-center gap-1 border border-amber-500/30">
                <Crown className="w-3 h-3" /> Sub-reporte Oficial
              </span>
              <span className="text-xs font-bold text-secondary-custom">
                Sección General de Subreportes
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-black text-primary-custom tracking-tight mt-0.5">
              Informe Ejecutivo de Rendimiento SAR
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <div className="text-xs font-bold text-secondary-custom bg-black/5 dark:bg-white/5 px-3 py-2 rounded-xl border border-card-custom flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>Período:</span>
            <strong className="text-primary-custom">{fechaInicio} → {fechaFin}</strong>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-card-custom text-xs font-bold text-secondary-custom hover:text-primary-custom transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Renderizado de la Hoja A4 Ejecutiva */}
      <ExecutiveReportTemplate
        scorecardRanking={computedData.scorecardRanking}
        globalAggregates={computedData.globalAggregates}
        kpiExtremes={computedData.kpiExtremes}
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        onBackToAnalytics={handleBack}
      />
    </div>
  );
}
