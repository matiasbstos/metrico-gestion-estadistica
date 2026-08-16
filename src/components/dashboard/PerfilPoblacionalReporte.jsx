import React from 'react';
import { Users, FileText, Activity, Shield, Award, Stethoscope, Heart, Calendar } from 'lucide-react';

export default function PerfilPoblacionalReporte({
  selectedTramoLabel,
  selectedSexoLabel,
  selectedPrevisionLabel,
  totalPacientes,
  avgEdad,
  avgEspera,
  avgEstadia,
  topCie10 = [],
  piramideData = [],
  previsionData = []
}) {
  return (
    <div className="hidden print:block p-8 bg-white text-slate-900 font-sans space-y-6">
      {/* Header Institucional de Impresión */}
      <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight">MÉTRICO — REPORTE DE PERFIL POBLACIONAL & ARQUETIPOS CIE-10</h1>
          <p className="text-xs text-slate-600 font-bold mt-1">
            Sistema Estadístico de Gestión SAR & Urgencias — Análisis Epidemiológico Consolidado
          </p>
        </div>
        <div className="text-right text-xs text-slate-600">
          <p><strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-CL')} {new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
          <p><strong>Origen de Datos:</strong> v_pacientes_urgencia_master</p>
          <p><strong>Clasificación:</strong> Informe Epidemiológico Gerencial</p>
        </div>
      </div>

      {/* Resumen de Filtros de Arquetipo Seleccionado */}
      <div className="p-4 bg-slate-100 rounded-xl border border-slate-300 grid grid-cols-3 gap-4 text-xs font-medium">
        <div>
          <span className="text-slate-500 font-bold block uppercase text-[10px]">Tramo Etario Funcional</span>
          <span className="text-slate-900 font-black text-sm">{selectedTramoLabel}</span>
        </div>
        <div>
          <span className="text-slate-500 font-bold block uppercase text-[10px]">Género / Sexo</span>
          <span className="text-slate-900 font-black text-sm">{selectedSexoLabel}</span>
        </div>
        <div>
          <span className="text-slate-500 font-bold block uppercase text-[10px]">Previsión Médica</span>
          <span className="text-slate-900 font-black text-sm">{selectedPrevisionLabel}</span>
        </div>
      </div>

      {/* KPI Cards del Arquetipo */}
      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-300">
          <span className="text-[10px] font-black text-slate-500 uppercase block">Cohorte Evaluada</span>
          <span className="text-xl font-black text-slate-900">{totalPacientes} <span className="text-xs font-normal">pac.</span></span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-300">
          <span className="text-[10px] font-black text-slate-500 uppercase block">Edad Promedio</span>
          <span className="text-xl font-black text-indigo-700">{avgEdad}</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-300">
          <span className="text-[10px] font-black text-slate-500 uppercase block">Espera Promedio</span>
          <span className="text-xl font-black text-amber-700">{avgEspera}</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-300">
          <span className="text-[10px] font-black text-slate-500 uppercase block">Estadía Promedio</span>
          <span className="text-xl font-black text-emerald-700">{avgEstadia}</span>
        </div>
      </div>

      {/* Mapa de Morbilidad Top 5 CIE-10 */}
      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase text-slate-900 border-b border-slate-300 pb-1 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-indigo-600" /> Top 5 Morbilidad Diagnóstica CIE-10 en el Arquetipo
        </h3>
        
        <div className="space-y-2">
          {topCie10.length > 0 ? (
            topCie10.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-indigo-900 text-white font-mono font-black text-xs rounded-md">
                    [{item.code}]
                  </span>
                  <span className="text-slate-800 font-bold">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-indigo-900 font-black text-sm">{item.pct}%</span>
                  <span className="text-slate-500 text-[10px] block">({item.count} pacientes)</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic py-2">Sin datos de diagnósticos CIE-10 para la cohorte seleccionada.</p>
          )}
        </div>
      </div>

      {/* Desglose Previsional */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-black uppercase text-slate-900 border-b border-slate-300 pb-1 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" /> Distribución de Previsión Médica
        </h3>

        <div className="grid grid-cols-3 gap-3 text-xs">
          {previsionData.map((item, idx) => (
            <div key={idx} className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg flex justify-between items-center">
              <span className="font-bold text-slate-700">{item.name}</span>
              <span className="font-black text-slate-900">{item.value} pac. ({item.pct}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pie de Página de Certificación */}
      <div className="pt-6 border-t border-slate-400 flex justify-between items-center text-[10px] text-slate-500 font-semibold">
        <span>MÉTRICO — Plataforma Estadistica de Salud Pública y Urgencias</span>
        <span>Documento Generado Automáticamente — Documento Oficial de Gestión</span>
      </div>
    </div>
  );
}
