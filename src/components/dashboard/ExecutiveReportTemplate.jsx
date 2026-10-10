import React, { useState } from 'react';
import { 
  Download, Printer, Trophy, AlertTriangle, Flame, Star, 
  Clock, CheckCircle2, XCircle, ShieldAlert, Sparkles, Building2,
  Calendar, Users, ArrowUpRight
} from 'lucide-react';
import { KPI_POLARITY_DEFINITIONS } from '../../utils/kpiExtremes';

/**
 * Plantilla del Informe Ejecutivo (ExecutiveReportTemplate)
 * Diseño minimalista simulando hoja de papel A4 blanca, con síntesis narrativa automática,
 * tarjetas de impacto (Big Numbers), tabla de extremos por métrica y motor de descarga PDF (html2pdf.js).
 */
export default function ExecutiveReportTemplate({
  scorecardRanking = [],
  globalAggregates = {},
  kpiExtremes = {},
  fechaInicio = '',
  fechaFin = '',
  onBackToAnalytics = null
}) {
  const [isExporting, setIsExporting] = useState(false);

  // Derivar Turno Líder (#1) y Rezagado (último del ranking)
  const leader = scorecardRanking && scorecardRanking.length > 0 ? scorecardRanking[0] : null;
  const lagging = scorecardRanking && scorecardRanking.length > 0 ? scorecardRanking[scorecardRanking.length - 1] : null;

  // Total pacientes
  const totalPacientes = globalAggregates?.totalGlobalPacientes || 
    scorecardRanking.reduce((acc, t) => acc + (t.stats?.totalPacientes || t.vol || 0), 0);

  // Encontrar el peor KPI del turno rezagado para la síntesis narrativa
  let worstMetricName = 'Latencia a Triaje';
  let worstMetricValue = '';
  if (lagging && kpiExtremes) {
    if (kpiExtremes.latenciaTriage?.worst?.teamKey === lagging.teamKey) {
      worstMetricName = 'latencia promedio en triaje';
      worstMetricValue = `${kpiExtremes.latenciaTriage.worstFormatted}`;
    } else if (kpiExtremes.tasaFuga?.worst?.teamKey === lagging.teamKey) {
      worstMetricName = 'tasa de fuga asistencial';
      worstMetricValue = `${kpiExtremes.tasaFuga.worstFormatted}`;
    } else if (kpiExtremes.tasaResolutiva?.worst?.teamKey === lagging.teamKey) {
      worstMetricName = 'tasa resolutiva';
      worstMetricValue = `${kpiExtremes.tasaResolutiva.worstFormatted}`;
    } else if (kpiExtremes.leadTime?.worst?.teamKey === lagging.teamKey) {
      worstMetricName = 'lead time global de permanencia';
      worstMetricValue = `${kpiExtremes.leadTime.worstFormatted}`;
    } else {
      worstMetricName = 'tiempos de atención y retención';
      worstMetricValue = `${Number(lagging.latencia || 0).toFixed(1)} min`;
    }
  }

  // Nombre de archivo dinámico: Informe_SAR_[Mes]_[Año].pdf
  const getDynamicPdfFileName = () => {
    try {
      const parts = (fechaFin || '').split('-');
      const year = parts[0] || new Date().getFullYear();
      const monthNum = parseInt(parts[1] || '10', 10);
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      const monthName = monthNames[monthNum - 1] || 'Periodo';
      return `Informe_SAR_${monthName}_${year}.pdf`;
    } catch {
      return `Informe_SAR_Rendimiento_2026.pdf`;
    }
  };

  // Motor de exportación mediante html2pdf.js
  const handleDownloadPdf = async () => {
    const element = document.getElementById('executive-report-a4-document');
    if (!element) return;

    try {
      setIsExporting(true);
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const fileName = getDynamicPdfFileName();
      const opt = {
        margin: [8, 8, 8, 8],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true,
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Error al exportar informe a PDF con html2pdf.js:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* BARRA SUPERIOR DE ACCIONES */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card-custom p-4 rounded-2xl border border-card-custom shadow-xs">
        <div className="flex items-center gap-2">
          {onBackToAnalytics && (
            <button
              onClick={onBackToAnalytics}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-black/5 dark:bg-white/5 text-secondary-custom hover:text-primary-custom hover:bg-black/10 transition-colors cursor-pointer"
            >
              ← Volver a Vista Analítica
            </button>
          )}
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Vista Previa de Informe Ejecutivo Imprimible
          </span>
        </div>

        {/* BOTÓN PRINCIPAL FLOTANTE / DESTACADO */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-black/5 dark:bg-white/10 text-primary-custom hover:bg-black/10 transition-all cursor-pointer"
            title="Imprimir documento nativo"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
            title="Descargar PDF en alta resolución con html2pdf.js"
          >
            <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Generando PDF...' : 'Descargar Informe (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* CONTENEDOR DEL INFORME A4 (FONDO BLANCO PURO) */}
      <div className="flex justify-center">
        <div
          id="executive-report-a4-document"
          className="w-full max-w-[800px] bg-white text-slate-900 border border-slate-300 shadow-xl rounded-xl p-8 md:p-12 space-y-7 print:border-none print:shadow-none print:p-0 print:m-0"
          style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
        >
          {/* 1. ENCABEZADO INSTITUCIONAL */}
          <div className="border-b-2 border-slate-900 pb-5 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 tracking-wider">
                    SAR ELSA ROMO ARAVENA
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    RED APS MELIPILLA
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-slate-950 tracking-tight mt-1">
                  Informe Ejecutivo de Rendimiento SAR
                </h1>
                <p className="text-xs font-bold text-slate-600 mt-0.5">
                  Evaluación Operativa de Guardia, Capacidad Resolutiva y Extremos Asistenciales
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">
                  Fecha de Corte
                </span>
                <span className="text-xs font-black text-slate-900 font-mono">
                  {fechaInicio} → {fechaFin}
                </span>
                <span className="text-[9px] font-bold text-indigo-700 block mt-1">
                  {scorecardRanking.length} Equipos Evaluados
                </span>
              </div>
            </div>
          </div>

          {/* 2. SÍNTESIS NARRATIVA AUTOMÁTICA (DATA STORYTELLING) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs leading-relaxed space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white">
                Síntesis Ejecutiva
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                Veredicto Consolidado del Período
              </span>
            </div>
            <p className="font-medium text-slate-800 text-[11.5px] leading-relaxed pt-1">
              Durante el período evaluado, el SAR admitió <strong className="font-black text-slate-950">{totalPacientes.toLocaleString('es-CL')}</strong> pacientes. 
              El equipo con mayor eficiencia global fue el <strong className="font-black text-emerald-800">{leader?.alias || leader?.teamKey || 'Turno Líder'}</strong> ({leader?.scoreFinal ?? 0} pts), 
              destacando por una latencia promedio de <strong className="font-black text-emerald-800">{Number(leader?.latencia || 0).toFixed(1)}</strong> minutos y una tasa resolutiva de <strong className="font-black text-emerald-800">{Number(leader?.resolutiva || 0).toFixed(1)}%</strong>. 
              Se requiere monitorear al <strong className="font-black text-rose-800">{lagging?.alias || lagging?.teamKey || 'Turno Rezagado'}</strong> debido a oportunidades de mejora identificadas prioritariamente en <strong className="font-black text-rose-800">{worstMetricName}</strong> ({worstMetricValue}).
            </p>
          </div>

          {/* 3. TARJETAS DE IMPACTO (BIG NUMBERS) */}
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-900 mb-2.5 flex items-center gap-1.5">
              <span>Indicadores de Impacto Clínico-Operativo</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 🔥 PUNTO CRÍTICO */}
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 text-slate-900 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-rose-900 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-600" /> Punto Crítico
                  </span>
                  <span className="text-[8.5px] font-black px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">
                    Latencia Máx.
                  </span>
                </div>
                <div className="text-xl font-black text-rose-950 tracking-tight">
                  {kpiExtremes.latenciaTriage?.worstFormatted || '—'}
                </div>
                <p className="text-[10px] text-slate-700 font-medium leading-tight">
                  Registrado en <strong>{kpiExtremes.latenciaTriage?.worst?.alias || '—'}</strong>. Meta clínica institucional: ≤15 minutos.
                </p>
              </div>

              {/* ⭐ PUNTO FUERTE */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 text-slate-900 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-emerald-600" /> Punto Fuerte
                  </span>
                  <span className="text-[8.5px] font-black px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                    Resolución Máx.
                  </span>
                </div>
                <div className="text-xl font-black text-emerald-950 tracking-tight">
                  {kpiExtremes.tasaResolutiva?.bestFormatted || '—'}
                </div>
                <p className="text-[10px] text-slate-700 font-medium leading-tight">
                  Alcanzado por <strong>{kpiExtremes.tasaResolutiva?.best?.alias || '—'}</strong>. Altas médicas directas sin fuga ni deserción.
                </p>
              </div>

              {/* ⚠️ RIESGO DETECTADO */}
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 text-slate-900 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Riesgo Detectado
                  </span>
                  <span className="text-[8.5px] font-black px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                    Pico de Fuga
                  </span>
                </div>
                <div className="text-xl font-black text-amber-950 tracking-tight">
                  {kpiExtremes.tasaFuga?.worstFormatted || '—'}
                </div>
                <p className="text-[10px] text-slate-700 font-medium leading-tight">
                  Observado en <strong>{kpiExtremes.tasaFuga?.worst?.alias || '—'}</strong>. Deserción de box previo a evaluación médica.
                </p>
              </div>
            </div>
          </div>

          {/* 4. TABLA RESUMEN: DESGLOSE DE EXTREMOS POR MÉTRICA */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-900">
                Desglose de Extremos por Métrica
              </h3>
              <span className="text-[9.5px] font-bold text-slate-500">
                Comparativa de Extremos Operativos
              </span>
            </div>

            <div className="overflow-hidden border border-slate-300 rounded-lg">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300">
                    <th className="py-2.5 px-3 font-black text-slate-900 uppercase text-[9.5px] tracking-wider w-2/5">
                      Métrica Evaluada
                    </th>
                    <th className="py-2.5 px-3 font-black text-emerald-800 uppercase text-[9.5px] tracking-wider w-3/10 bg-emerald-50/50">
                      Turno Destacado 🟢
                    </th>
                    <th className="py-2.5 px-3 font-black text-rose-800 uppercase text-[9.5px] tracking-wider w-3/10 bg-rose-50/50">
                      Turno Rezagado 🔴
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {KPI_POLARITY_DEFINITIONS.map((def) => {
                    const ext = kpiExtremes[def.key];
                    if (!ext) return null;

                    return (
                      <tr key={def.key} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 text-slate-900 font-bold">
                          <div className="flex items-center gap-1.5">
                            <span>{def.name}</span>
                            <span className="text-[8.5px] font-normal text-slate-500">
                              ({def.polarity === 'higher_is_better' ? 'Mayor es mejor' : 'Menor es mejor'})
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 bg-emerald-50/30 font-medium">
                          <span className="font-black text-emerald-900 block text-xs">
                            {ext.best?.alias || ext.best?.teamKey || '—'}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-800">
                            {ext.bestFormatted}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 bg-rose-50/30 font-medium">
                          <span className="font-black text-rose-900 block text-xs">
                            {ext.worst?.alias || ext.worst?.teamKey || '—'}
                          </span>
                          <span className="text-[11px] font-bold text-rose-800">
                            {ext.worstFormatted}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. PODIO SCORECARD GERENCIAL */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-900">
              Clasificación de Desempeño Global (Scorecard SAR)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {scorecardRanking.map((t, idx) => (
                <div 
                  key={t.slotId || idx} 
                  className={`p-3 rounded-xl border ${idx === 0 ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-slate-50'} text-xs space-y-1`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 text-xs">
                      {t.alias || t.teamKey}
                    </span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded ${idx === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800'}`}>
                      {t.scoreFinal} pts
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-600 font-medium flex items-center justify-between">
                    <span>{t.rankTitle || `#${idx + 1}`}</span>
                    <span className="font-bold text-slate-800">
                      {Number(t.vol || 0).toLocaleString('es-CL')} pac.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. PIE DE PÁGINA INSTITUCIONAL DE AUDITORÍA */}
          <div className="pt-4 border-t border-slate-300 text-[9.5px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span>Sistema MÉTRICO v6.3.71 • Dirección Técnica SAR Elsa Romo Aravena</span>
            </div>
            <div>
              <span>Documento Oficial Certificado para Toma de Decisiones Directivas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
