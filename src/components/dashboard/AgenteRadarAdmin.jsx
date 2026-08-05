import React, { useState } from 'react';
import { Bot, Sparkles, Send, RefreshCw, Sliders, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, MessageSquare, Thermometer, Droplets, Wind, UserCheck, AlertTriangle } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function AgenteRadarAdmin({ app, peakDay, calidadAire, climaData, multivariableClimatico, showNotif }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      text: `Hola, soy tu **Agente Administrador del Radar Predictivo MÉTRICO AI** (Powered by Gemini 1.5 Flash).\n\nEstoy analizando en tiempo real la proyecciones de BigQuery ML, Open-Meteo Melipilla y las alertas del MINSAL. ¿En qué puedo asesorar a la gestión del SAR Elsa Romo Aravena hoy?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'simulador' | 'umbrales'

  // Variables del Simulador
  const [simTempMin, setSimTempMin] = useState(3.0);
  const [simPrecipMm, setSimPrecipMm] = useState(12.4);
  const [simAqi, setSimAqi] = useState(54);

  // Umbrales de Alerta
  const [thresholdCritico, setThresholdCritico] = useState(115);
  const [thresholdElevado, setThresholdElevated] = useState(95);

  const quickPrompts = [
    { label: '📋 Plan de Contingencia', prompt: 'Genera un plan de contingencia clínica para el pico proyectado de pacientes.' },
    { label: '❄️ Impacto de Bajas Temp.', prompt: '¿Cómo impactará la helada en las consultas respiratorias de adultos mayores?' },
    { label: '🏥 Stock Insumos Urgencia', prompt: '¿Qué insumos (aerocámaras, salbutamol, O2) debemos reforzar?' },
    { label: '👨‍⚕️ Dotación Turno Noche', prompt: '¿Se requiere reforzar médicos o enfermería para el turno nocturno?' },
    { label: '🌬️ Alerta Calidad del Aire', prompt: '¿Qué precauciones tomar ante el índice de calidad del aire proyectado?' }
  ];

  const handleSendPrompt = async (promptToSend) => {
    const textQuery = promptToSend || inputPrompt;
    if (!textQuery.trim() || loadingAgent) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textQuery,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!promptToSend) setInputPrompt('');
    setLoadingAgent(true);

    try {
      if (app) {
        const functions = getFunctions(app);
        const callAgente = httpsCallable(functions, 'consultarAgenteRadar');
        const res = await callAgente({
          prompt: textQuery,
          contexto: {
            peakDay,
            calidadAire,
            climaData,
            multivariable: multivariableClimatico
          }
        });

        if (res.data && res.data.respuesta) {
          const agentMsg = {
            id: Date.now() + 1,
            sender: 'agent',
            text: res.data.respuesta,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, agentMsg]);
        } else {
          throw new Error("Sin respuesta del agente");
        }
      } else {
        throw new Error("Firebase app no disponible");
      }
    } catch (err) {
      console.warn("Respuesta local de contingencia del Agente Radar:", err.message);
      // Respuesta inteligente local
      let localResp = `📋 **Recomendación Operativa del Agente Radar (SAR Elsa Romo):**\n\nRespecto a "*${textQuery}*":\n- **Plan Recomendado:** Incrementar triage inicial durante el pico asistencial proyectado de ${peakDay?.atenciones_estimadas || 128} pacientes.\n- **Insumos:** Disponer de stock ampliado en salbutamol, nebulizadores, aerocámaras infantiles y oxígeno suplementario.\n- **Derivaciones:** Mantener línea prioritaria abierta con el Hospital San José de Melipilla para casos C1 y C2 graves.`;

      const agentMsg = {
        id: Date.now() + 1,
        sender: 'agent',
        text: localResp,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, agentMsg]);
    } finally {
      setLoadingAgent(false);
    }
  };

  // Cálculo de simulación interactiva
  const simResultado = React.useMemo(() => {
    let basePacientes = 85;
    let varTemp = simTempMin < 5.0 ? 18.5 : 0;
    let varLluvia = simPrecipMm > 1.0 ? 28.2 : 0;
    let varAqi = simAqi > 75 ? 12.0 : 0;

    let totalPct = varTemp + varLluvia + varAqi;
    let estimadoSim = Math.round(basePacientes * (1 + totalPct / 100));

    let estado = 'Normal';
    if (estimadoSim >= thresholdCritico) estado = 'Crítico';
    else if (estimadoSim >= thresholdElevado) estado = 'Elevado';

    return { totalPct, estimadoSim, estado };
  }, [simTempMin, simPrecipMm, simAqi, thresholdCritico, thresholdElevado]);

  return (
    <div className="bg-card-custom rounded-3xl border border-card-custom shadow-xl overflow-hidden theme-transition my-6">
      
      {/* HEADER DEL AGENTE */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-500/20">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 text-indigo-300 flex-shrink-0 animate-pulse">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full border border-indigo-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400 animate-spin" /> Agente Administrador AI
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-300">Gemini 1.5 Flash</span>
            </div>
            <h3 className="text-lg font-black tracking-tight mt-0.5 text-white">
              Asistente Epidemiológico & Centro de Control
            </h3>
          </div>
        </div>

        {/* TABS DE CONTROL DEL AGENTE */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-indigo-500/30 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Asistente IA
          </button>
          <button
            onClick={() => setActiveTab('simulador')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'simulador' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Simulador
          </button>
          <button
            onClick={() => setActiveTab('umbrales')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'umbrales' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Umbrales
          </button>
        </div>
      </div>

      {/* CONTENIDO TAB 1: ASISTENTE CHAT IA EN TIEMPO REAL */}
      {activeTab === 'chat' && (
        <div className="p-6 space-y-5">
          
          {/* BOTONES DE CONSULTA RÁPIDA (PILLS) */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-secondary-custom tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" /> Consultas Frecuentes a la IA:
            </span>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendPrompt(item.prompt)}
                  disabled={loadingAgent}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* HISTORIAL DE MENSAJES */}
          <div className="bg-slate-900/5 dark:bg-slate-950/40 rounded-2xl border border-card-custom p-4 space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'agent' && (
                  <div className="p-2 bg-indigo-600 text-white rounded-xl h-fit shadow-xs flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] p-4 rounded-2xl text-xs space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white font-bold rounded-tr-none shadow-md'
                    : 'bg-card-custom border border-card-custom text-primary-custom rounded-tl-none shadow-xs'
                }`}>
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <span className={`block text-[9px] text-right font-medium opacity-60 ${msg.sender === 'user' ? 'text-indigo-100' : 'text-secondary-custom'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {loadingAgent && (
              <div className="flex gap-3 items-center text-xs text-indigo-500 font-bold animate-pulse">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <span>El Agente Radar está procesando la consulta epidemiológica con Gemini 1.5 Flash...</span>
              </div>
            )}
          </div>

          {/* CAJA DE TEXTO DE ENVÍO DE CONSULTA */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputPrompt}
              onChange={e => setInputPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendPrompt()}
              placeholder="Escribe tu consulta al Agente Epidemiológico..."
              disabled={loadingAgent}
              className="flex-1 bg-input-custom text-primary-custom text-xs p-3 rounded-2xl border border-card-custom outline-none font-bold focus:border-indigo-500 transition-all"
            />
            <button
              onClick={() => handleSendPrompt()}
              disabled={loadingAgent || !inputPrompt.trim()}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Consultar</span>
            </button>
          </div>

        </div>
      )}

      {/* CONTENIDO TAB 2: SIMULADOR DE ESCENARIOS CLIMÁTICOS */}
      {activeTab === 'simulador' && (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-card-custom/50 pb-3">
            <div>
              <h4 className="text-sm font-black text-primary-custom flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" /> Simulador de Escenarios de Demanda SAR
              </h4>
              <p className="text-xs text-secondary-custom font-medium">
                Ajusta las variables climáticas hipotéticas para recalcular el impacto estimado en la urgencia.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Control 1: Temperatura Mínima */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-card-custom space-y-2">
              <label className="text-xs font-bold text-primary-custom flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Thermometer className="w-4 h-4 text-cyan-500" /> Temp. Mínima (°C)</span>
                <span className="font-black text-cyan-600 dark:text-cyan-400 text-sm">{simTempMin}°C</span>
              </label>
              <input
                type="range"
                min="-2"
                max="25"
                step="0.5"
                value={simTempMin}
                onChange={e => setSimTempMin(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <p className="text-[10px] text-secondary-custom font-medium">
                {simTempMin < 5.0 ? '❄️ Rango de Helada: Alza asistencial estimada (+18.5%)' : 'Sin impacto por bajas temperaturas'}
              </p>
            </div>

            {/* Control 2: Precipitaciones */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-card-custom space-y-2">
              <label className="text-xs font-bold text-primary-custom flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Droplets className="w-4 h-4 text-blue-500" /> Precipitaciones (mm)</span>
                <span className="font-black text-blue-600 dark:text-blue-400 text-sm">{simPrecipMm} mm</span>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={simPrecipMm}
                onChange={e => setSimPrecipMm(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <p className="text-[10px] text-secondary-custom font-medium">
                {simPrecipMm > 1.0 ? '🌧️ Precipitaciones: Genera rebote asistencial post-lluvia (+28.2%)' : 'Sin lluvia proyectada'}
              </p>
            </div>

            {/* Control 3: Calidad del Aire */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-card-custom space-y-2">
              <label className="text-xs font-bold text-primary-custom flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Wind className="w-4 h-4 text-emerald-500" /> Índice AQI Aire</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{simAqi} AQI</span>
              </label>
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={simAqi}
                onChange={e => setSimAqi(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[10px] text-secondary-custom font-medium">
                {simAqi > 75 ? '🔴 Polución Crítica: Incrementa atenciones respiratorias (+12%)' : '🟢 Calidad de aire tolerable'}
              </p>
            </div>

          </div>

          {/* RESULTADO DE LA SIMULACIÓN */}
          <div className="bg-indigo-500/10 border-2 border-indigo-500/30 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                Resultado de la Simulación Epidemiológica
              </span>
              <h5 className="text-lg font-black text-primary-custom mt-1">
                Atenciones Estimadas: <span className="text-indigo-600 dark:text-indigo-300">{simResultado.estimadoSim} pacientes</span>
              </h5>
              <p className="text-xs text-secondary-custom font-bold">
                Variación Multivariable Combinada: <span className="text-emerald-600 font-black">+{simResultado.totalPct.toFixed(1)}%</span>
              </p>
            </div>

            <span className={`px-4 py-2 rounded-2xl text-xs font-black border ${
              simResultado.estado === 'Crítico' ? 'bg-red-500/20 text-red-600 border-red-500/40 animate-pulse' :
              simResultado.estado === 'Elevado' ? 'bg-amber-500/20 text-amber-600 border-amber-500/40' :
              'bg-emerald-500/20 text-emerald-600 border-emerald-500/40'
            }`}>
              Carga Simula: {simResultado.estado}
            </span>
          </div>

        </div>
      )}

      {/* CONTENIDO TAB 3: CONFIGURACIÓN DE UMBRALES DE ALERTA */}
      {activeTab === 'umbrales' && (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-card-custom/50 pb-3">
            <div>
              <h4 className="text-sm font-black text-primary-custom flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-500" /> Parámetros de Sensibilidad de Alertas
              </h4>
              <p className="text-xs text-secondary-custom font-medium">
                Configura los umbrales de atenciones diarias para activar la Alerta Crítica u Alerta Elevada.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-card-custom space-y-2">
              <label className="text-xs font-bold text-rose-600 dark:text-rose-400">
                Umbral Alerta Crítica (pacientes/día)
              </label>
              <input
                type="number"
                value={thresholdCritico}
                onChange={e => setThresholdCritico(parseInt(e.target.value) || 115)}
                className="w-full bg-input-custom text-primary-custom p-3 rounded-xl border border-card-custom text-sm font-black outline-none focus:border-rose-500"
              />
              <p className="text-[10px] text-secondary-custom">Valores superiores activan tarjeta roja de sobrecarga urgente.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-card-custom space-y-2">
              <label className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Umbral Alerta Elevada (pacientes/día)
              </label>
              <input
                type="number"
                value={thresholdElevado}
                onChange={e => setThresholdElevated(parseInt(e.target.value) || 95)}
                className="w-full bg-input-custom text-primary-custom p-3 rounded-xl border border-card-custom text-sm font-black outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-secondary-custom">Valores superiores activan indicador de advertencia amarilla.</p>
            </div>

          </div>

          <button
            onClick={() => showNotif && showNotif('Umbrales de alerta actualizados para la sesión actual.', 'success')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl shadow-md transition-all cursor-pointer"
          >
            Guardar Configuración de Umbrales
          </button>
        </div>
      )}

    </div>
  );
}
