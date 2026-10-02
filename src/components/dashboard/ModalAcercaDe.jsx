import React, { useState } from 'react';
import { 
  Info, X, Sparkles, Award, Users, HeartPulse, ShieldCheck, Stethoscope, 
  Building2, Cpu, Database, Activity, CheckCircle2, Terminal, Code,
  Layers, Lock, ExternalLink, Calendar, MapPin, ChevronRight, Zap
} from 'lucide-react';
import { CURRENT_APP_VERSION } from '../../config/version';

export default function ModalAcercaDe({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('sistema'); // 'sistema' | 'creador' | 'equipo' | 'stack'

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in"
      style={{ backgroundColor: 'var(--bg-overlay, rgba(15, 23, 42, 0.75))' }}
      onClick={onClose}
    >
      <div 
        className="bg-card-custom w-full max-w-4xl max-h-[92vh] rounded-[2rem] border border-card-custom shadow-[0_0_60px_rgba(99,102,241,0.2)] flex flex-col overflow-hidden theme-transition"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER DEL MODAL CON GRADIENTE INSTITUCIONAL */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 border-b border-indigo-500/20 flex-shrink-0 overflow-hidden">
          {/* Luces de fondo y decoraciones orbitales */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-sky-500/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <HeartPulse className="w-8 h-8 text-sky-400 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    Sobre MÉTRICO
                  </h2>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-sm tracking-wider">
                    {CURRENT_APP_VERSION || 'v6.3.40'}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    SSOT RAYEN
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                  Plataforma de Inteligencia Asistencial, Trazabilidad Operativa & Vigilancia de Urgencias
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-semibold">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" /> SAR Elsa Romo Aravena
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" /> CORMUMEL Salud Melipilla
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex-shrink-0"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SELECTOR DE PESTAÑAS NAVEGABLES */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 scrollbar-none relative z-10">
            {[
              { id: 'sistema', label: '¿Qué es el Sistema?', icon: Sparkles },
              { id: 'creador', label: 'Creador & Dirección Técnica', icon: Award },
              { id: 'equipo', label: 'Equipo & Red Asistencial', icon: Users },
              { id: 'stack', label: 'Ficha Técnica & Seguridad', icon: Cpu }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                    isActive 
                      ? 'bg-white text-indigo-950 shadow-md font-black scale-[1.02]' 
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENIDO DEL MODAL (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-primary-custom text-sm leading-relaxed">
          
          {/* PESTAÑA 1: ¿QUÉ ES EL SISTEMA? */}
          {activeTab === 'sistema' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gradient-to-br from-indigo-500/10 via-sky-500/5 to-transparent p-5 sm:p-6 rounded-2xl border border-indigo-500/20">
                <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wide">
                      MÉTRICO: Módulo Estadístico de Trazabilidad, Rendimiento e Inteligencia Clínica Operativa
                    </h3>
                    <p className="text-xs text-secondary-custom font-semibold">
                      Sistema Integral de Analítica y Gestión de Urgencias de Atención Primaria
                    </p>
                  </div>
                </div>
                <p className="text-secondary-custom text-sm leading-relaxed">
                  <strong className="text-primary-custom">MÉTRICO</strong> es la plataforma tecnológica central de inteligencia asistencial desarrollada a medida para el <strong className="text-primary-custom">SAR Elsa Romo Aravena</strong> y la <strong className="text-primary-custom">Red de Salud CORMUMEL de Melipilla</strong>. Su objetivo cardinal es transformar los datos de atenciones brutas provenientes del sistema oficial Rayen Urgencia en información estratégica, oportuna y verídica en tiempo real, erradicando discrepancias estadísticas y respaldando la toma de decisiones clínicas y directivas con una <strong className="text-indigo-600 dark:text-indigo-400">Única Fuente de Verdad (Single Source of Truth - SSOT)</strong>.
                </p>
              </div>

              {/* 4 PILARES FUNDAMENTALES */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-secondary-custom mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-500" /> Pilares Cardinales de Operación Asistencial
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="bg-input-custom/50 p-4 rounded-2xl border border-card-custom space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <h5 className="font-black text-xs text-primary-custom uppercase tracking-wide">
                        Cuadratura Universal Rayen (100%)
                      </h5>
                    </div>
                    <p className="text-xs text-secondary-custom leading-relaxed">
                      Implementa la ecuación estricta de auditoría clínica de Rayen: <code className="bg-card-custom px-1.5 py-0.5 rounded text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold border border-card-custom">Admitidos = Completados + Egreso Admin + Sin Atención</code>, discriminando de forma unívoca los trámites administrativos de las deserciones voluntarias.
                    </p>
                  </div>

                  <div className="bg-input-custom/50 p-4 rounded-2xl border border-card-custom space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">
                        <Activity className="w-4 h-4" />
                      </div>
                      <h5 className="font-black text-xs text-primary-custom uppercase tracking-wide">
                        Triage Manchester & Tiempos de Espera
                      </h5>
                    </div>
                    <p className="text-xs text-secondary-custom leading-relaxed">
                      Desglose riguroso de categorización clínica (C1 a C5) y medición en minutos de los tres tramos de estadía: <strong className="text-primary-custom">Admisión a Triage</strong>, <strong className="text-primary-custom">Triage a Box Médico</strong> y <strong className="text-primary-custom">Box a Alta</strong>, garantizando cumplimiento normativo de reanimación y atención inmediata.
                    </p>
                  </div>

                  <div className="bg-input-custom/50 p-4 rounded-2xl border border-card-custom space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                        <Zap className="w-4 h-4" />
                      </div>
                      <h5 className="font-black text-xs text-primary-custom uppercase tracking-wide">
                        Despacho Automatizado de Informes de Guardia
                      </h5>
                    </div>
                    <p className="text-xs text-secondary-custom leading-relaxed">
                      Generación y entrega programada de informes de turno (Fin de Semana Diurno/Nocturno y Semana Hábil) directamente a las bandejas de entrada de directivos y coordinadores con React Email nativo y diseño clínico de alta fidelidad.
                    </p>
                  </div>

                  <div className="bg-input-custom/50 p-4 rounded-2xl border border-card-custom space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <h5 className="font-black text-xs text-primary-custom uppercase tracking-wide">
                        Vigilancia Epidemiológica & Alertas Clínicas
                      </h5>
                    </div>
                    <p className="text-xs text-secondary-custom leading-relaxed">
                      Monitorización en tiempo real de patologías respiratorias estacionales (IRA / ERA), bitácora traumatológica de fracturas complejas, sospecha diagnóstica de traslados a Urgencia Hospitalaria (UEH) y constancia de lesiones Z51.8.
                    </p>
                  </div>

                </div>
              </div>

              {/* REGLA DE ORO DE COMPARABILIDAD */}
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-3">
                <Info className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="font-bold text-indigo-700 dark:text-indigo-300">Principio Universal de Comparación Homóloga (Regla 22 SSOT):</strong>
                  <p className="mt-1 leading-relaxed text-secondary-custom">
                    MÉTRICO garantiza que toda comparación interanual (YoY) compare estrictamente períodos homólogos transcurridos ("manzanas con manzanas"), erradicando contracciones o distorsiones estadísticas tanto en el año 2025 (37.526 pacientes cerrados), 2026 en curso, y para las futuras series 2027 y 2028.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 2: CREADOR & DIRECCIÓN TÉCNICA */}
          {activeTab === 'creador' && (
            <div className="space-y-6 animate-fade-in">
              {/* FICHA 1: CREADOR & DESARROLLADOR */}
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-indigo-500/30 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 p-1 shadow-lg shadow-indigo-500/40 flex-shrink-0">
                    <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                      <Code className="w-10 h-10 text-sky-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-xl font-black text-white">Matías Bustos</h3>
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-500 text-white shadow-sm">
                        Creador & Arquitecto de Software
                      </span>
                    </div>
                    <p className="text-xs text-sky-300 font-bold uppercase tracking-wider">
                      Diseño de Arquitectura de Datos Clínicos, Algoritmos SSOT & Desarrollo Full-Stack
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed pt-2">
                      Responsable de la concepción, ingeniería, desarrollo integral, algoritmos de cuadratura estadística, pipelines de sincronización en tiempo real y diseño de experiencia de usuario (UX/UI) del sistema <strong className="text-white font-bold">MÉTRICO</strong>.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center sm:text-left">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="block text-[10px] text-slate-400 uppercase font-black">Rol Principal</span>
                    <span className="text-xs font-bold text-slate-200">Arquitecto & Desarrollador</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="block text-[10px] text-slate-400 uppercase font-black">Enfoque Clínico</span>
                    <span className="text-xs font-bold text-slate-200">SSOT Rayen & Triage SAR</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="block text-[10px] text-slate-400 uppercase font-black">Bitácora Oficial</span>
                    <span className="text-xs font-bold text-emerald-400">40+ Versiones Registradas</span>
                  </div>
                </div>
              </div>

              {/* FICHA 2: DIRECCIÓN TÉCNICA & APOYO ASISTENCIAL */}
              <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-emerald-500/30 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-400 p-1 shadow-lg shadow-emerald-500/40 flex-shrink-0">
                    <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                      <Stethoscope className="w-10 h-10 text-emerald-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-xl font-black text-white">Mariel Quintanilla</h3>
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-sm">
                        Directora Técnica SAR
                      </span>
                    </div>
                    <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider">
                      Apoyo Técnico, Validación Asistencial & Gestión Clínica SAR Elsa Romo Aravena
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed pt-2">
                      Liderazgo técnico y conducción asistencial en la definición de requerimientos clínicos de urgencia, auditoría de tiempos de espera, protocolos de Triage Manchester (C1 a C5), supervisión de calidad y respaldo institucional fundamental para la conceptualización e implementación del sistema <strong className="text-white font-bold">MÉTRICO</strong>.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center sm:text-left">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="block text-[10px] text-slate-400 uppercase font-black">Cargo Directivo</span>
                    <span className="text-xs font-bold text-slate-200">Directora Técnica SAR</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="block text-[10px] text-slate-400 uppercase font-black">Apoyo Técnico</span>
                    <span className="text-xs font-bold text-emerald-400">Validación de Flujos Clínicos</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="block text-[10px] text-slate-400 uppercase font-black">Centro Asistencial</span>
                    <span className="text-xs font-bold text-sky-400">SAR Elsa Romo (CORMUMEL)</span>
                  </div>
                </div>
              </div>

              {/* PROPÓSITO DEL DESARROLLO Y ALIANZA TÉCNICA */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-secondary-custom flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-500" /> Alianza Técnica, Rigor Clínico y Propósito
                </h4>
                <div className="bg-input-custom/50 p-5 rounded-2xl border border-card-custom space-y-3 text-secondary-custom text-xs leading-relaxed">
                  <p>
                    El proyecto MÉTRICO nació de la necesidad urgente y sentida en el <strong className="text-primary-custom">SAR Elsa Romo Aravena</strong> de contar con una herramienta ágil, confiable y 100% verídica que permitiera auditar en segundos lo que antes tomaba horas o días de cruce manual de planillas Excel.
                  </p>
                  <p>
                    La sinergia entre el desarrollo de arquitectura de software y algoritmos liderado por <strong className="text-primary-custom">Matías Bustos</strong> junto con el apoyo técnico, validación asistencial y supervisión de procesos de la Directora Técnica <strong className="text-primary-custom">Mariel Quintanilla</strong>, permitió diseñar una solución adaptada exactamente a la dinámica operativa real de las guardias médicas y de enfermería de urgencia.
                  </p>
                  <p>
                    Cada módulo, fórmula de cálculo y gráfico fue programado desde cero bajo rigurosos protocolos de consistencia matemática (norma de oro: <strong className="text-primary-custom">ningún informe puede emitirse si no concilia al 100% con los datos de Rayen</strong>). Toda la evolución del sistema se encuentra documentada en la <strong className="text-indigo-600 dark:text-indigo-400">Bitácora de Desarrollo (DevLog)</strong> del panel lateral.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 3: EQUIPO ASISTENCIAL & RED DE SALUD */}
          {activeTab === 'equipo' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-input-custom/50 p-5 sm:p-6 rounded-2xl border border-card-custom">
                <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <Users className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wide">
                      Comunidad Asistencial & Red Operativa
                    </h3>
                    <p className="text-xs text-secondary-custom font-semibold">
                      El equipo humano que da vida y custodia la atención continua 24/7
                    </p>
                  </div>
                </div>
                <p className="text-secondary-custom text-xs leading-relaxed">
                  MÉTRICO es una herramienta viva que refleja el esfuerzo diario de todo el personal que integra el Servicio de Alta Resolutividad (SAR) y los centros de salud de la comuna de Melipilla.
                </p>
              </div>

              {/* ESTRUCTURA INSTITUCIONAL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-2xl bg-card-custom border border-card-custom shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <Building2 className="w-4 h-4" />
                    <h5 className="font-black text-xs uppercase tracking-wide">
                      SAR Elsa Romo Aravena (Melipilla)
                    </h5>
                  </div>
                  <p className="text-xs text-secondary-custom leading-relaxed">
                    Centro asistencial de urgencia de alta resolutividad, cabecera de la red comunal para la atención de urgencias de mediana y alta complejidad médica, categorización Manchester y procedimientos de reanimación y estabilización.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-card-custom border border-emerald-500/30 shadow-sm space-y-2 bg-emerald-500/5">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Stethoscope className="w-4 h-4" />
                    <h5 className="font-black text-xs uppercase tracking-wide">
                      Dirección Técnica SAR
                    </h5>
                  </div>
                  <p className="text-xs text-secondary-custom leading-relaxed">
                    Conducción técnica y asistencial liderada por <strong className="text-primary-custom">Mariel Quintanilla</strong>, Directora Técnica del SAR. Supervisión continua de calidad, auditoría de tiempos clínicos y enlace estratégico con los equipos de guardia y la red comunal.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-card-custom border border-card-custom shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
                    <Users className="w-4 h-4" />
                    <h5 className="font-black text-xs uppercase tracking-wide">
                      Equipos de Guardia (Turnos 1, 2, 3 y 4)
                    </h5>
                  </div>
                  <p className="text-xs text-secondary-custom leading-relaxed">
                    Cuerpo multidisciplinario compuesto por Médicos de Guardia, Enfermeras/os de Triage y Box, Técnicos en Enfermería (TENS), Personal Administrativo de Admisión y Conductores de Ambulancia, que aseguran la continuidad operativa los 365 días del año.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-card-custom border border-card-custom shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                    <MapPin className="w-4 h-4" />
                    <h5 className="font-black text-xs uppercase tracking-wide">
                      Red Comunal de Centros de Origen (APS)
                    </h5>
                  </div>
                  <p className="text-xs text-secondary-custom leading-relaxed">
                    Articulación directa con los centros de salud primaria de procedencia: <strong className="text-primary-custom">CESFAM Florencia</strong>, <strong className="text-primary-custom">CESFAM Dr. Francisco Boris Soler</strong>, <strong className="text-primary-custom">CESFAM Elgueta</strong> y postas rurales dependientes de CORMUMEL.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-card-custom border border-card-custom shadow-sm space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <HeartPulse className="w-4 h-4" />
                    <h5 className="font-black text-xs uppercase tracking-wide">
                      Hospital Receptor (UEH Melipilla)
                    </h5>
                  </div>
                  <p className="text-xs text-secondary-custom leading-relaxed">
                    Enlace asistencial continuo para la derivación y rescate de pacientes de alta complejidad médica (C1 y C2 con riesgo vital o requerimiento quirúrgico) hacia la Urgencia del Hospital San José de Melipilla.
                  </p>
                </div>

              </div>

              {/* DIRECCIÓN Y GESTIÓN */}
              <div className="p-4 rounded-2xl bg-slate-500/10 border border-card-custom flex items-center justify-between text-xs">
                <div>
                  <span className="font-black text-primary-custom uppercase tracking-wide block">
                    Dirección Asistencial & Departamento de Salud CORMUMEL
                  </span>
                  <span className="text-secondary-custom font-medium">
                    Corporación Municipal para la Educación y Salud de Melipilla
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-1 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  MELIPILLA • CHILE
                </span>
              </div>
            </div>
          )}

          {/* PESTAÑA 4: FICHA TÉCNICA & SEGURIDAD */}
          {activeTab === 'stack' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-2xl bg-input-custom/50 border border-card-custom space-y-2">
                  <span className="text-[10px] uppercase font-black text-indigo-500 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" /> Frontend & Visualización
                  </span>
                  <p className="text-xs text-primary-custom font-bold">
                    React 18 • Vite SPA • Tailwind CSS • Lucide Icons • Recharts
                  </p>
                  <p className="text-xs text-secondary-custom leading-relaxed">
                    Arquitectura desacoplada de alto rendimiento con renderizado acelerado por GPU, lazy-loading dinámico de submódulos y tiempo de carga inferior a 300ms.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-input-custom/50 border border-card-custom space-y-2">
                  <span className="text-[10px] uppercase font-black text-emerald-500 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" /> Backend & Motor de Datos
                  </span>
                  <p className="text-xs text-primary-custom font-bold">
                    Firebase Cloud Firestore • IndexedDB Local • BigQuery
                  </p>
                  <p className="text-xs text-secondary-custom leading-relaxed">
                    Sincronización multi-hilo en segundo plano con persistencia local en caché IndexedDB, garantizando operatividad fluida sin bloqueos ante caídas transitorias de red.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-input-custom/50 border border-card-custom space-y-2">
                  <span className="text-[10px] uppercase font-black text-sky-500 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Comunicaciones & Correo
                  </span>
                  <p className="text-xs text-primary-custom font-bold">
                    Google Cloud Functions • Nodemailer • React Email
                  </p>
                  <p className="text-xs text-secondary-custom leading-relaxed">
                    Motor de ensamblado serverless de correos institucionales en HTML inline estricto, compatible con Outlook, Gmail y dispositivos móviles.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-input-custom/50 border border-card-custom space-y-2">
                  <span className="text-[10px] uppercase font-black text-rose-500 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Privacidad & Ley 20.584
                  </span>
                  <p className="text-xs text-primary-custom font-bold">
                    Seguridad Cero-Confianza • Control de Sesión 15 Minutos
                  </p>
                  <p className="text-xs text-secondary-custom leading-relaxed">
                    Anonimización de datos sensibles de pacientes, auto-logout por inactividad tras 14 minutos + advertencia de 60 segundos, y cifrado SSL/TLS de extremo a extremo.
                  </p>
                </div>

              </div>

              {/* ESPECIFICACIONES DE CONTROL DE CORRELATIVOS */}
              <div className="p-4 rounded-2xl bg-slate-500/10 border border-card-custom text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-primary-custom uppercase tracking-wide">
                    Especificaciones de Auditoría Activa
                  </span>
                  <span className="font-mono text-[11px] text-emerald-500 font-bold">
                    Corte Oficial Rayen
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2 rounded-xl bg-card-custom border border-card-custom text-center">
                    <span className="block text-[9px] text-secondary-custom uppercase font-sans">Correlativo Máx</span>
                    <span className="font-black text-primary-custom">#30.131 (Lote 50)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-card-custom border border-card-custom text-center">
                    <span className="block text-[9px] text-secondary-custom uppercase font-sans">Admitidos YTD 2026</span>
                    <span className="font-black text-sky-500">29.895 pac.</span>
                  </div>
                  <div className="p-2 rounded-xl bg-card-custom border border-card-custom text-center">
                    <span className="block text-[9px] text-secondary-custom uppercase font-sans">Atendidos Efectivos</span>
                    <span className="font-black text-emerald-500">27.183 pac.</span>
                  </div>
                  <div className="p-2 rounded-xl bg-card-custom border border-card-custom text-center">
                    <span className="block text-[9px] text-secondary-custom uppercase font-sans">Histórico 2025</span>
                    <span className="font-black text-indigo-500">37.526 pac.</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* FOOTER DEL MODAL */}
        <div className="p-4 sm:p-5 border-t border-card-custom/80 bg-input-custom/30 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 text-xs text-secondary-custom">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold">
              MÉTRICO {CURRENT_APP_VERSION} • Desarrollado por Matías Bustos con el Apoyo Técnico de Mariel Quintanilla (Directora Técnica) para SAR Elsa Romo Aravena
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all shadow-md shadow-indigo-600/30 cursor-pointer text-center"
            >
              Entendido / Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
