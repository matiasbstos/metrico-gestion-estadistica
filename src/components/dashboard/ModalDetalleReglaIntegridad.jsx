import React, { useState } from 'react';
import { 
  X, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, 
  HelpCircle, Activity, Database, RefreshCw, CheckCheck
} from 'lucide-react';

export default function ModalDetalleReglaIntegridad({
  isOpen = true,
  onClose,
  rule,
  regla,
  onReconcileRule,
  onConciliar,
  isReconciled = false
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPct, setProgressPct] = useState(0);

  const activeRule = rule || regla;
  if (!isOpen || !activeRule) return null;

  const {
    id,
    nombre,
    descripcion = activeRule.desc || '',
    estado = activeRule.discrepancias === 0 ? 'CONFORME' : 'ALERTA',
    fallos = activeRule.discrepancias !== undefined ? activeRule.discrepancias : (activeRule.fallos || 0),
    total = activeRule.totalEvaluados !== undefined ? activeRule.totalEvaluados : (activeRule.total || 0),
    severidad = 'Media',
    diagnostico = '',
    causaFrecuente = '',
    solucionGuia = '',
    muestras = activeRule.muestras || []
  } = activeRule;

  const isConforme = estado === 'CONFORME' || fallos === 0 || isReconciled;

  const handleExecuteReconciliation = async () => {
    setIsProcessing(true);
    setProgressPct(20);

    setTimeout(() => setProgressPct(60), 350);
    setTimeout(() => setProgressPct(90), 700);

    setTimeout(() => {
      setProgressPct(100);
      setTimeout(() => {
        setIsProcessing(false);
        if (onReconcileRule) onReconcileRule(id, nombre);
        if (onConciliar) onConciliar(activeRule);
      }, 400);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in text-left">
      <div className="bg-card-custom border border-card-custom rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden relative animate-scale-up theme-transition">
        
        {/* Barra superior de acento dinámico */}
        <div className={`h-2.5 w-full ${isConforme ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500' : 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500'}`} />

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-start justify-between gap-4 border-b border-card-custom/50 bg-card-custom/50">
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-2xl border shrink-0 ${isConforme ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'}`}>
              {isConforme ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6 animate-bounce" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-secondary-custom border border-card-custom">
                  Regla #{id} • Severidad {severidad}
                </span>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  isConforme 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20'
                }`}>
                  {isConforme ? '✓ CONFORME (100% OK)' : `DISCREPANCIA / ALERTA (${fallos} Incidencias)`}
                </span>
              </div>
              <h3 className="text-lg font-black text-primary-custom mt-1 tracking-tight">
                {nombre}
              </h3>
              <p className="text-xs text-secondary-custom font-medium">
                {descripcion}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with Scroll */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar text-xs">

          {/* Estado Resumen de Métricas */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-card-custom/60 text-center">
              <span className="text-[10px] font-bold text-secondary-custom uppercase tracking-wider">Total Evaluados</span>
              <p className="text-lg font-black text-primary-custom mt-0.5">{total.toLocaleString('es-CL')}</p>
            </div>
            <div className={`p-3.5 rounded-2xl border text-center ${fallos === 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-600'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider">Discrepancias</span>
              <p className="text-lg font-black mt-0.5">{fallos.toLocaleString('es-CL')}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider">Conformidad</span>
              <p className="text-lg font-black mt-0.5">
                {total > 0 ? ((1 - fallos / total) * 100).toFixed(1) : '100.0'}%
              </p>
            </div>
          </div>

          {/* Sección de Diagnóstico Clínico-Técnico */}
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-card-custom/60 space-y-1.5">
            <div className="flex items-center gap-1.5 font-black text-primary-custom text-[11px] uppercase tracking-wider">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span>Diagnóstico del Sistema</span>
            </div>
            <p className="text-secondary-custom leading-relaxed font-medium">
              {diagnostico || (
                isConforme
                  ? 'Todos los registros evaluados cumplen rigurosamente con los criterios de integridad y paridad asistencial.'
                  : `Se identificaron ${fallos} registros con descalce respecto a la regla definida. A continuación se detallan las muestras detectadas.`
              )}
            </p>
          </div>

          {/* Tabla de Muestras de Discrepancias / Afectados */}
          {muestras && muestras.length > 0 && !isConforme && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-primary-custom tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-500" />
                  Muestras de Registros Afectados ({muestras.length} de {fallos})
                </span>
                <span className="text-[9px] font-bold text-secondary-custom">Detalle en memoria</span>
              </div>

              <div className="border border-card-custom rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 max-h-52 overflow-y-auto shadow-inner custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-black/10 dark:bg-white/10 text-primary-custom uppercase text-[10px] font-black tracking-wider sticky top-0 z-20 border-b border-card-custom shadow-sm backdrop-blur-xs">
                    <tr>
                      <th className="p-3">ID / Fecha</th>
                      <th className="p-3">Detalle / Valor</th>
                      <th className="p-3 text-right">Observación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-custom/40 font-mono text-[11px] font-medium">
                    {muestras.map((m, idx) => (
                      <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="p-3 text-primary-custom font-bold whitespace-nowrap">
                          {m.id || m.fecha || `Reg #${idx + 1}`}
                        </td>
                        <td className="p-3 text-secondary-custom">
                          {m.valor || m.detalle || '-'}
                        </td>
                        <td className="p-3 text-right text-rose-600 dark:text-rose-400 font-bold whitespace-nowrap">
                          {m.motivo || 'Discrepancia detectada'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Explicación: ¿Por qué ocurre? */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-black text-[11px] uppercase tracking-wide">
              <HelpCircle className="w-4 h-4" />
              <span>¿Por qué ocurre esta alerta o discrepancia?</span>
            </div>
            <p className="text-secondary-custom leading-relaxed font-medium">
              {causaFrecuente || 'Ocurre habitualmente por diferencias de categorización en los límites de turno, registros con datos incompletos en el ingreso o cruce de medianoche en las marcas temporales de urgencia.'}
            </p>
          </div>

          {/* Guía: ¿Cómo solucionarlo? */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black text-[11px] uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4" />
              <span>¿Cómo solucionarlo?</span>
            </div>
            <p className="text-secondary-custom leading-relaxed font-medium">
              {solucionGuia || 'Puedes aplicar la homologación y conciliación asistencial haciendo clic en el botón inferior. El sistema ajustará la regla al estándar SSOT, guardando el certificado de auditoría correspondiente.'}
            </p>
          </div>

          {/* Barra de progreso si está ejecutando conciliación */}
          {isProcessing && (
            <div className="space-y-2 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Homologando y validando regla SSOT...
                </span>
                <span>{progressPct}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 pt-3 bg-black/5 dark:bg-white/5 border-t border-card-custom/60 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-secondary-custom hover:text-primary-custom hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          {!isConforme ? (
            <button
              onClick={handleExecuteReconciliation}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProcessing ? 'Conciliando...' : 'Conciliar y Certificar Regla'}</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
              <CheckCheck className="w-4 h-4" />
              <span>Regla 100% Conforme y Validada</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
