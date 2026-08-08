import React, { useState } from 'react';
import { Megaphone, Sparkles, X, Calendar, CheckCircle2, ShieldAlert, MapPin, Cpu, BarChart2, Filter, Layers, Clock, HelpCircle, BookOpen, Lightbulb, Eye, Mail } from 'lucide-react';

export default function ModalMuroActualizaciones({ isOpen, onClose }) {
  const [selectedCat, setSelectedCat] = useState('TODOS');

  if (!isOpen) return null;

  const updatesList = [
    {
      id: 'v2.9.0',
      version: 'v2.9.0',
      fecha: '08 de Agosto, 2026',
      badge: 'ÚLTIMA VERSIÓN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      title: 'Sistema Automatizado de Envío de Informes Ejecutivos por Correo + Adjunto PDF Hoja Carta + Auditoría de Turnos',
      categoria: 'Despacho & Auditoría',
      icon: Mail,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Despacho automatizado de informes ejecutivos auditados con adjuntos PDF en Hoja Carta, control estricto de completitud de turnos (semana y fin de semana por equipo), logo institucional del SAR y registro en vivo en el Panel de Auditoría.',
      instructivo: {
        paraQueSirve: 'Sirve para programar y enviar automáticamente los informes de urgencia a las jefaturas y dirección asistencial por correo electrónico en formato PDF y CSV, manteniendo la rotativa oficial de equipos (Equipos 1, 2 y 3) y garantizando que ningún turno se duplique ni se envíe incompleto.',
        quePuedesVer: 'En el menú lateral encontrarás el nuevo botón "Informe por Correo". Al presionar el botón de prueba o guardar la configuración, el sistema genera el informe, adjunta el PDF en Hoja Carta y registra la constancia en el módulo de "Auditoría".',
        ejemploUso: 'Ejemplo: El lunes a las 09:00 AM, el sistema realiza el barrido automático de fin de semana y envía 3 correos y PDFs independientes correspondientes al Viernes Noche, Sábado (Día y Noche) y Domingo (Día y Noche), indicando en cada uno el Equipo de Turno responsable (Equipo 1, 2 o 3).'
      },
      changes: [
        'Despacho de Adjuntos Físicos en PDF (Hoja Carta): Generación nativa en tiempo real del archivo PDF oficial con todos los sub-reportes seleccionados y tabla de KPIs.',
        'Desglose Estricto por Día y Equipo de Turno: Separación en fin de semana y festivos para el Turno Día (08:00 - 20:00) y Turno Noche (20:00 - 08:00) asignados al Equipo correspondiente (Equipos 1, 2 y 3).',
        'Cómputo Inteligente de Tolerancia de Turnos: Conteo de admisiones de semana desde las 16:00 hrs e inclusión de extensión hasta las 09:00 AM para continuidad de cierre.',
        'Prueba Estricta de Completitud (100% Auditado): Verificación automática que descarta turnos parciales (cortados a medianoche) y busca el último turno con datos 100% cerrados.',
        'Incrustación de Identidad Visual SAR Elsa Romo Aravena: Logo oficial del SAR incrustado en la cabecera superior del correo.',
        'Registro en Tiempo Real en el Módulo de Auditoría: Registro de cada envío manual o automático en el panel de auditoría con fecha, hora, turno, destinatarios y lista de adjuntos.'
      ]
    },
    {
      id: 'v2.8.5',
      version: 'v2.8.5',
      fecha: '07 de Agosto, 2026',
      badge: 'ACTUALIZACIÓN',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Módulo Interactivo de Prueba de Control e Integridad de Datos + Tarjetas Desplegables',
      categoria: 'Integridad & Control',
      icon: Sparkles,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      summary: 'Sistema de verificación dinámica de control cuantitativo (SAR Elsa Romo Aravena), tarjetas mensuales con acordeón desplegable y adaptación del vocabulario asistencial a español chileno.',
      instructivo: {
        paraQueSirve: 'Sirve para auditar y certificar que las cifras estadísticas registradas en MÉTRICO coinciden en un 100% matemático exacto con los informes oficiales en PDF/Excel emitidos por la dirección del SAR Elsa Romo Aravena.',
        quePuedesVer: 'En la pestaña "Demanda de Atención", encontrarás el nuevo botón verde "Ejecutar Prueba de Control". Al presionarlo, se abre un modal interactivo donde puedes seleccionar cualquier año/mes, digitar tus cifras oficiales y ver la matriz comparativa en tiempo real.',
        ejemploUso: 'Ejemplo: Para auditar Mayo 2026, abres el modal, seleccionas Mayo 2026, digitas 4.110 Admitidos, 3.676 Completados, 93 Sin Atención y 341 Egreso Admin. El sistema valida automáticamente que 3676 + 93 + 341 = 4110 y marca el mes con el sello verde de "Control SAR Verificado".'
      },
      changes: [
        'Formulario de Prueba de Control en Vivo: Permite ingresar datos de reportes oficiales (Admitidos, Atendidos, Altas sin Atención, Egresos Admin) y ejecutar auditorías de concordancia 100%.',
        'Validación Matemática en Tiempo Real: Comprueba automáticamente que Admitidos == Completados + Sin Atención + Egreso Admin, alertando cualquier incoherencia en los datos.',
        'Certificación de Control SAR: Sello de verificado para Mayo 2026 (4.110 admitidos, 3.676 atendidos y 434 altas administrativas exactos).',
        'Tarjetas Mensuales Desplegables: Rediseño protagónico para Pacientes Admitidos con botón de acordeón para revelar Atendidos y Altas.',
        'Estandarización Vocabulario Asistencial Chileno: Sustitución de la palabra "pico" por Peak Asistencial, Peak de Demanda y Sobrecarga Hospitalaria en todo el sistema.',
        'Solución en Estadísticas de Fractura: Corrección de error de ejecución en comparativas interanuales YoY e inclusión del grupo etario con mayor porcentaje de fracturas.'
      ]
    },
    {
      id: 'v2.8.0',
      version: 'v2.8.0',
      fecha: '05 de Agosto, 2026',
      badge: 'ACTUALIZACIÓN',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
      title: 'Potenciación Cognitiva del Radar Predictivo & Calidad del Aire en Vivo',
      categoria: 'IA & Radar',
      icon: Sparkles,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      summary: 'Integración completa de la IA de Gemini 1.5 Flash, alertas sanitarias MINSAL en tiempo real y calidad de aire diaria por Open-Meteo.',
      instructivo: {
        paraQueSirve: 'Sirve para anticipar sobrecargas hospitalarias cruzando pronóstico del clima a 7 días, índice de calidad del aire AQI y alertas epidemiológicas oficiales del MINSAL.',
        quePuedesVer: 'En la pestaña "Radar Predictivo", verás 7 tarjetas climáticas diarias con temperatura mín/máx, mm de lluvia e índice AQI, además del Agente Administrador IA Gemini que responde consultas clínicas en tiempo real.',
        ejemploUso: 'Ejemplo: Ante un pronóstico de helada (<5°C) seguido de lluvia en Melipilla, el Radar genera una alerta automática recomendando reforzar el triage C1-C3 y aumentar el stock de nebulizaciones y salbutamol para el día viernes.'
      },
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
      instructivo: {
        paraQueSirve: 'Sirve para visualizar espacialmente de dónde provienen los pacientes atendidos en la urgencia y detectar comunas con mayor presión asistencial.',
        quePuedesVer: 'En la pestaña "Sociodemográfico y Origen", verás el mapa exclusivo recortado con la silueta de Melipilla, María Pinto, Curacaví, San Pedro y Alhué con códigos de color de participación.',
        ejemploUso: 'Ejemplo: Al pasar el cursor sobre la comuna de Melipilla o Bollenar, el mapa despliega un tooltip dinámico mostrando el número exacto de pacientes admitidos y el % del total del mes.'
      },
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
      instructivo: {
        paraQueSirve: 'Permite caracterizar la población usuaria del SAR según sexo, rango de edad y previsión (FONASA/ISAPRE).',
        quePuedesVer: 'En el Inicio, verás gráficos circulares y de barras con la distribución de usuarios por tramo de edad.',
        ejemploUso: 'Ejemplo: Filtrar por Triage C2 para identificar qué grupo etario demanda atención de mayor complejidad en la urgencia.'
      },
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
      instructivo: {
        paraQueSirve: 'Generar informes descargables en PDF con membrete institucional para la dirección del servicio y SSMOC.',
        quePuedesVer: 'En la sección "Generador de Reportes Ejecutivos", puedes seleccionar sub-reportes específicos y exportar en PDF.',
        ejemploUso: 'Ejemplo: Exportar el informe mensual de Fracturas o Altas con el logo oficial del SAR listo para presentar en reuniones de gestión.'
      },
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
      instructivo: {
        paraQueSirve: 'Garantizar la protección de datos de salud cerrando sesiones inactivas automáticamente.',
        quePuedesVer: 'Un aviso emergente con cuenta regresiva de 60 segundos antes de cerrar sesión tras 15 minutos sin uso.',
        ejemploUso: 'Ejemplo: Si dejas el equipo desatendido en el box médico, el sistema protege los datos cerrando sesión de forma segura.'
      },
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
                  Histórico de Versiones & Instructivos
                </span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  v2.8.5 (Activa)
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-primary-custom tracking-tight mt-1">
                Muro de Novedades e Instructivos del Sistema MÉTRICO
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
          {['TODOS', 'Integridad & Control', 'IA & Radar', 'Geolocalización', 'Rendimiento Clínico', 'Seguridad'].map(cat => (
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

        {/* LISTADO TIPO TIMELINE / MURO DE NOVEDADES CON INSTRUCTIVO */}
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

                {/* BLOQUE DE INSTRUCTIVO Y GUÍA PRÁCTICA */}
                {item.instructivo && (
                  <div className="bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-300 tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-indigo-500" /> Instructivo & Guía Práctica de Uso:
                    </h4>
                    
                    <div className="space-y-2 text-xs">
                      <div className="bg-card-custom p-3 rounded-xl border border-card-custom/60 space-y-0.5">
                        <span className="font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1 text-[11px]">
                          <BookOpen className="w-3.5 h-3.5" /> ¿Para qué sirve?
                        </span>
                        <p className="text-primary-custom font-medium leading-relaxed">{item.instructivo.paraQueSirve}</p>
                      </div>

                      <div className="bg-card-custom p-3 rounded-xl border border-card-custom/60 space-y-0.5">
                        <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                          <Eye className="w-3.5 h-3.5" /> ¿Qué puedes ver y hacer?
                        </span>
                        <p className="text-primary-custom font-medium leading-relaxed">{item.instructivo.quePuedesVer}</p>
                      </div>

                      <div className="bg-card-custom p-3 rounded-xl border border-card-custom/60 space-y-0.5">
                        <span className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1 text-[11px]">
                          <Lightbulb className="w-3.5 h-3.5" /> Ejemplo Concreto de Uso:
                        </span>
                        <p className="text-primary-custom font-medium leading-relaxed">{item.instructivo.ejemploUso}</p>
                      </div>
                    </div>
                  </div>
                )}

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
          <span className="font-bold text-[11px]">MÉTRICO Clínico Predictivo • SAR Elsa Romo Aravena</span>
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
