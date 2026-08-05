import React, { useState } from 'react';
import { Megaphone, Sparkles, X, Calendar, CheckCircle2, ShieldAlert, MapPin, Cpu, BarChart2, Filter, Layers, Clock } from 'lucide-react';

export default function ModalMuroActualizaciones({ isOpen, onClose }) {
  const [selectedCat, setSelectedCat] = useState('TODOS');

  if (!isOpen) return null;

  const updatesList = [
    {
      id: 'v2.8.0',
      version: 'v2.8.0',
      fecha: '05 de Agosto, 2026',
      badge: 'ÚLTIMA VERSIÓN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Potenciación Cognitiva del Radar Predictivo & Calidad del Aire en Vivo',
      categoria: 'IA & Radar',
      icon: Sparkles,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Integración completa de la IA de Gemini 1.5 Flash, alertas sanitarias MINSAL en tiempo real y calidad de aire diaria por Open-Meteo.',
      changes: [
        'Agente Epidemiológico IA (Gemini 1.5 Flash): Diagnóstico de sobrecarga asistencial cruzando clima, BigQuery ML y MINSAL.',
        'Rastreador RSS MINSAL Chile: Detección automática de alertas sanitarias oficiales y campañas invernales.',
        'Calidad del Aire Integrada en Vivo: Pronóstico a 7 días con índices AQI y PM2.5/PM10 por día en Melipilla.',
        'Matriz Causa-Efecto de 6 Fuentes: Informe técnico desplegable en modal con acciones preventivas para urgencias.',
        'Análisis de Clima Pasado vs Pacientes: Detección empírica de rebote asistencial post-lluvia (+28.2%) y heladas (<5°C).'
      ]
    },
    {
      id: 'v2.7.5',
      version: 'v2.7.5',
      fecha: '05 de Agosto, 2026',
      badge: 'NUEVA FUNCIONALIDAD',
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/20',
      title: 'Mapa Vectorial Interactivo de la Provincia de Melipilla',
      categoria: 'Geolocalización',
      icon: MapPin,
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      summary: 'Nuevo mapa recortado exclusivamente a la silueta de las 5 comunas provinciales sin elementos geográficos externos.',
      changes: [
        'Silueta Vectorial Exclusiva: Visualización limpia de Melipilla, Curacaví, María Pinto, San Pedro y Alhué.',
        'Interactividad Hover & Tooltips: Resaltado cromático individual con conteo de pacientes y porcentaje de participación.',
        'Integración Sociodemográfica: Muestra desglose comunal directo en el panel de origen y perfil de paciente.'
      ]
    },
    {
      id: 'v2.7.0',
      version: 'v2.7.0',
      fecha: '04 de Agosto, 2026',
      badge: 'MEJORA DE PANEL',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20',
      title: 'Rediseño Sociodemográfico y Análisis Demográfico en Inicio',
      categoria: 'Rendimiento Clínico',
      icon: BarChart2,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      summary: 'Retorno del análisis sociodemográfico al panel principal con tarjetas estilizadas y filtros interactivos.',
      changes: [
        'Reubicación estratégica de métricas de sexo, grupos etarios y previsión FONASA/ISAPRE.',
        'Filtros dinámicos cruzados por categoría de triage y comunas de la provincia.'
      ]
    },
    {
      id: 'v2.6.5',
      version: 'v2.6.5',
      fecha: '03 de Agosto, 2026',
      badge: 'ESTÁNDAR VISUAL',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20',
      title: 'Isotipo Oficial del SAR & Módulo de Reportes PDF',
      categoria: 'Rendimiento Clínico',
      icon: Layers,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      summary: 'Incorporación del logo institucional del SAR Elsa Romo Aravena en reportes ejecutivos exportables.',
      changes: [
        'Encabezado institucional oficial para impresiones y exportación de informes clínicos.',
        'Plantillas adaptables según selección de tipo de reporte específico o consolidado.'
      ]
    },
    {
      id: 'v2.6.0',
      version: 'v2.6.0',
      fecha: '02 de Agosto, 2026',
      badge: 'SEGURIDAD',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20',
      title: 'Control de Inactividad & Auditoría de Registro en Firestore',
      categoria: 'Seguridad',
      icon: Cpu,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      summary: 'Sistema automático de cierre de sesión por inactividad y registro en vivo de navegaciones en Firestore.',
      changes: [
        'Modal de advertencia con cuenta regresiva antes del auto-logout por inactividad (15 min).',
        'Audit Log en Firestore para trazabilidad de consultas y modificaciones por usuario.'
      ]
    }
  ];

  const filteredUpdates = selectedCat === 'TODOS' 
    ? updatesList 
    : updatesList.filter(u => u.categoria === selectedCat);

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-card-custom w-full max-w-4xl rounded-3xl border border-card-custom shadow-2xl p-6 md:p-8 space-y-6 theme-transition my-8">
        
        {/* HEADER DEL MURO DE ACTUALIZACIONES */}
        <div className="flex items-start justify-between border-b border-card-custom/60 pb-5">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-xs flex-shrink-0 animate-bounce">
              <Megaphone className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  Histórico de Versiones & Novedades
                </span>
                <span className="text-[10px] font-bold text-secondary-custom">v2.8.0 (Estable)</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-primary-custom tracking-tight mt-1">
                Muro de Actualizaciones del Sistema MÉTRICO
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-card-custom border border-card-custom hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-secondary-custom cursor-pointer"
            title="Cerrar Muro"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FILTROS POR CATEGORÍA */}
        <div className="flex flex-wrap items-center gap-2 border-b border-card-custom/50 pb-4">
          <span className="text-xs font-bold text-secondary-custom flex items-center gap-1 mr-2">
            <Filter className="w-3.5 h-3.5" /> Filtrar por:
          </span>
          {['TODOS', 'IA & Radar', 'Geolocalización', 'Rendimiento Clínico', 'Seguridad'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCat === cat 
                  ? 'accent-bg-custom text-white shadow-sm' 
                  : 'bg-black/5 dark:bg-white/5 text-secondary-custom hover:text-primary-custom border border-card-custom'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* LISTADO TIPO TIMELINE / MURO DE NOVEDADES */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredUpdates.map((item) => {
            const IconComp = item.icon;
            return (
              <div 
                key={item.id} 
                className="bg-slate-50/60 dark:bg-slate-900/40 p-5 rounded-2xl border border-card-custom space-y-4 hover:border-indigo-500/40 transition-all shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-card-custom/40 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${item.iconBg}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-primary-custom">{item.version}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="text-sm md:text-base font-black text-primary-custom mt-0.5">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-secondary-custom font-medium self-start sm:self-auto">
                    <Clock className="w-3.5 h-3.5 opacity-70" />
                    <span>{item.fecha}</span>
                  </div>
                </div>

                <p className="text-xs font-medium text-secondary-custom leading-relaxed">
                  {item.summary}
                </p>

                {/* CAMBIOS DETALLADOS */}
                <div className="bg-card-custom p-3.5 rounded-xl border border-card-custom/60 space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-secondary-custom tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Novedades e Implementaciones Destacadas:
                  </h4>
                  <ul className="space-y-1 text-xs text-primary-custom font-semibold list-disc list-inside">
                    {item.changes.map((change, idx) => (
                      <li key={idx} className="leading-snug">
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER MODAL */}
        <div className="pt-4 border-t border-card-custom flex items-center justify-between text-xs text-secondary-custom">
          <span className="font-bold text-[11px]">MÉTRICO Clinico Predictivo • SAR Elsa Romo Aravena</span>
          <button 
            onClick={onClose}
            className="px-5 py-2.5 accent-bg-custom text-white font-black rounded-2xl shadow-md transition-all cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
