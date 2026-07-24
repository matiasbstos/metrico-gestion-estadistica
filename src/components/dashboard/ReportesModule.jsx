import React, { useState, useMemo } from 'react';
import { FileText, Download, Printer, Calendar, Users, Clock, AlertTriangle, CheckSquare, Square, Activity, Hospital, UserCheck, ShieldCheck, Layers } from 'lucide-react';
import { useMetricoAnalytics } from '../../hooks/useMetricoAnalytics';
import { useMetricoProfesionales } from '../../hooks/useMetricoProfesionales';
import FiltrosGlobales from './FiltrosGlobales';

export default function ReportesModule({ 
  user,
  pacientesDB, 
  turnosDB,
  modoComparativo, setModoComparativo,
  filtroFechaInicio, setFiltroFechaInicio,
  filtroFechaFin, setFiltroFechaFin,
  filtroFechaInicioB, setFiltroFechaInicioB,
  filtroFechaFinB, setFiltroFechaFinB,
  applyDatePreset,
  tipoCorte, setTipoCorte,
  filtroHoraInicio, setFiltroHoraInicio,
  filtroHoraFin, setFiltroHoraFin,
  horarioPreset, setHorarioPreset,
  maxDateLabel,
  handleClearFilters
}) {
  // Selección de Sub-reportes para incluir en la impresión
  const [incluirGeneral, setIncluirGeneral] = useState(true);
  const [incluirAltas, setIncluirAltas] = useState(true);
  const [incluirFracturas, setIncluirFracturas] = useState(true);
  const [incluirEnfermeria, setIncluirEnfermeria] = useState(true);

  // Fechas dinámicas desde la barra de filtros globales
  const fechas = useMemo(() => {
    const rawInicio = filtroFechaInicio || new Date().toISOString().split('T')[0];
    const rawFin = filtroFechaFin || new Date().toISOString().split('T')[0];

    const formatD = (dateStr) => {
      if (!dateStr || dateStr.length < 10) return '';
      const p = dateStr.split('-');
      return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dateStr;
    };

    return { 
      inicio: formatD(rawInicio), 
      fin: formatD(rawFin), 
      rawInicio, 
      rawFin 
    };
  }, [filtroFechaInicio, filtroFechaFin]);

  // Tipo de reporte dinámico
  const tipoReporte = useMemo(() => {
    if (!fechas.rawInicio || !fechas.rawFin) return 'Consolidado General';
    if (fechas.rawInicio === fechas.rawFin) return 'Diario';
    return 'Consolidado del Periodo';
  }, [fechas.rawInicio, fechas.rawFin]);

  // Extraer KPIs para el reporte
  const { statsKPI, demografiaStats, topDiagnosticos, pacientesFiltrados, turnosFiltrados } = useMetricoAnalytics(pacientesDB, turnosDB, fechas.rawInicio, fechas.rawFin);
  const { filteredMetricsByDoctor } = useMetricoProfesionales(pacientesDB, turnosDB, fechas.rawInicio, fechas.rawFin, [], '');

  // Rango de fechas reales detectado automáticamente de los datos de pacientes
  const rangoFechasReales = useMemo(() => {
    const pacs = pacientesFiltrados || [];
    if (pacs.length === 0) {
      return { inicio: fechas.inicio, fin: fechas.fin, texto: `${fechas.inicio} al ${fechas.fin}` };
    }

    let minT = Infinity;
    let maxT = -Infinity;

    pacs.forEach(p => {
      if (p.tAdmision) {
        if (p.tAdmision < minT) minT = p.tAdmision;
        if (p.tAdmision > maxT) maxT = p.tAdmision;
      }
    });

    if (minT === Infinity || maxT === -Infinity) {
      return { inicio: fechas.inicio, fin: fechas.fin, texto: `${fechas.inicio} al ${fechas.fin}` };
    }

    const formatDate = (ms) => {
      const d = new Date(ms);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const iniStr = formatDate(minT);
    const finStr = formatDate(maxT);

    return {
      inicio: iniStr,
      fin: finStr,
      texto: `${iniStr} al ${finStr}`
    };
  }, [pacientesFiltrados, fechas]);

  // Datos para sub-reporte de Altas Admin
  const altasStats = useMemo(() => {
    if (!statsKPI) return { totalPacientes: 0, totalAltas: 0, pct: '0.0', turnosCriticos: [] };

    const totalPacientes = statsKPI.pacientes.current;
    const totalAltas = statsKPI.altasAdmin.current;
    const pct = totalPacientes > 0 ? ((totalAltas / totalPacientes) * 100).toFixed(1) : '0.0';

    const turnosCriticos = (turnosFiltrados || [])
      .map(t => ({
        ...t,
        pct: t.totalPacientes > 0 ? ((t.altasAdmin / t.totalPacientes) * 100).toFixed(1) : 0
      }))
      .filter(t => Number(t.pct) > 10)
      .sort((a, b) => b.pct - a.pct);

    return { totalPacientes, totalAltas, pct, turnosCriticos };
  }, [statsKPI, turnosFiltrados]);

  // Datos para sub-reporte de Fracturas y Destino
  const fracturasStats = useMemo(() => {
    const pacs = pacientesFiltrados || [];

    let totalFracturas = 0;
    let hospitalCount = 0;
    let domicilioCount = 0;
    let otrosCount = 0;
    let sinRegistroCount = 0;

    // Desglose específico para pacientes con diagnóstico de fracturas
    let fracturasTrasladadas = 0;
    let fracturasDomicilio = 0;
    let fracturasOtros = 0;

    const diagMap = {};

    pacs.forEach(p => {
      const diag = (p.diagnosticoPrincipal || p.codigoDiagnostico || '').toLowerCase();
      const isFrac = diag.includes('fractura') || diag.includes('fx');
      
      const dest = String(p.destinoAlta || p.destino || '').toLowerCase();
      const isTraslado = dest.includes('hospital') || dest.includes('emergencia') || dest.includes('derivac');
      const isDomicilio = dest.includes('domicilio');

      if (isFrac) {
        totalFracturas++;
        const key = (p.diagnosticoPrincipal || p.codigoDiagnostico || 'FRACTURA NO ESPECIFICADA').toUpperCase();
        diagMap[key] = (diagMap[key] || 0) + 1;

        if (isTraslado) {
          fracturasTrasladadas++;
        } else if (isDomicilio) {
          fracturasDomicilio++;
        } else {
          fracturasOtros++;
        }
      }

      if (isTraslado) hospitalCount++;
      else if (isDomicilio) domicilioCount++;
      else if (!dest) sinRegistroCount++;
      else otrosCount++;
    });

    const topFracturas = Object.entries(diagMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);

    return { 
      totalPacientes: pacs.length, 
      totalFracturas, 
      hospitalCount, 
      domicilioCount, 
      otrosCount, 
      sinRegistroCount, 
      topFracturas,
      fracturasTrasladadas,
      fracturasDomicilio,
      fracturasOtros
    };
  }, [pacientesFiltrados]);

  // Datos para sub-reporte de Enfermería
  const enfermeriaStats = useMemo(() => {
    const pacs = pacientesFiltrados || [];

    let sumMinCat1 = 0, countMinCat1 = 0;
    let sumMinReCat = 0, countMinReCat = 0;
    const enfMap = {};

    pacs.forEach(p => {
      const tAdm = p.tAdmision;
      const tC1 = p.tCat1 || p.tCatUlt;
      const tCU = p.tCatUlt;

      if (tAdm && tC1 && tC1 >= tAdm) {
        const m = (tC1 - tAdm) / 60000;
        if (m <= 300) { sumMinCat1 += m; countMinCat1++; }
      }
      if (tC1 && tCU && tCU > tC1) {
        const m = (tCU - tC1) / 60000;
        if (m <= 600) { sumMinReCat += m; countMinReCat++; }
      }

      const enf = p.enfermeroCat1 ? String(p.enfermeroCat1).trim() : 'No Registrado';
      if (enf !== 'No Registrado') {
        if (!enfMap[enf]) {
          enfMap[enf] = {
            nombre: enf,
            total: 0,
            c1: 0, c2: 0, c3: 0, c4: 0, c5: 0,
            sumMinCat1: 0, countMinCat1: 0,
            sumMinReCat: 0, countMinReCat: 0
          };
        }
        
        const item = enfMap[enf];
        item.total++;
        
        let cat = String(p.catPrimera || p.categoria || '').toLowerCase();
        
        // Dinámicamente identificar Constatación de Lesiones
        const cod = (p.codigoDiagnostico || '').toUpperCase();
        const diag = (p.diagnosticoPrincipal || '').toUpperCase();
        const isLesion = cod.includes('Z51.8') || cod.includes('Z518') || 
                         cod.includes('Z04') || 
                         diag.includes('CONSTATAC') || 
                         diag.includes('LESIÓN') || diag.includes('LESION') ||
                         diag.includes('CIRCUNSTANCIAS LEGALES') ||
                         diag.includes('POLICIAL') ||
                         diag.includes('AGRESIÓN') || diag.includes('AGRESION');
        
        if (isLesion && cat === 'c3') {
          cat = 'c3_z518';
        }

        if (cat === 'c1') item.c1++;
        else if (cat === 'c2') item.c2++;
        else if (cat === 'c3') item.c3++;
        else if (cat === 'c3_z518') item.c3++; // En conteo de C3 del funcionario agrupamos ambos
        else if (cat === 'c4') item.c4++;
        else if (cat === 'c5') item.c5++;

        if (tAdm && tC1 && tC1 >= tAdm) {
          const m = (tC1 - tAdm) / 60000;
          if (m <= 300) {
            item.sumMinCat1 += m;
            item.countMinCat1++;
          }
        }
        if (tC1 && tCU && tCU > tC1) {
          const m = (tCU - tC1) / 60000;
          if (m <= 600) {
            item.sumMinReCat += m;
            item.countMinReCat++;
          }
        }
      }
    });

    const topEnfermeros = Object.values(enfMap)
      .map(e => ({
        ...e,
        avgMinCat1: e.countMinCat1 ? Math.round(e.sumMinCat1 / e.countMinCat1) : 0,
        avgMinReCat: e.countMinReCat ? Math.round(e.sumMinReCat / e.countMinReCat) : 0
      }))
      .sort((a, b) => b.total - a.total);

    // Desglose de casos críticos C1 y C2 para el sub-reporte imprimible
    const casosCriticos = pacs.filter(p => {
      const cat = String(p.catPrimera || p.categoria || '').toLowerCase();
      return cat === 'c1' || cat === 'c2';
    });

    // Diferenciación C3 (Constatación de lesiones vs Otros diagnósticos)
    const c3LesionesPacs = pacs.filter(p => {
      const cat = String(p.catPrimera || p.categoria || '').toLowerCase();
      const cod = (p.codigoDiagnostico || '').toUpperCase();
      const diag = (p.diagnosticoPrincipal || '').toUpperCase();
      const isLesion = cod.includes('Z51.8') || cod.includes('Z518') || 
                       cod.includes('Z04') || 
                       diag.includes('CONSTATAC') || 
                       diag.includes('LESIÓN') || diag.includes('LESION') ||
                       diag.includes('CIRCUNSTANCIAS LEGALES') ||
                       diag.includes('POLICIAL') ||
                       diag.includes('AGRESIÓN') || diag.includes('AGRESION');
      return cat === 'c3_z518' || (cat === 'c3' && isLesion);
    });
    const c3ClinicoPacs = pacs.filter(p => {
      const cat = String(p.catPrimera || p.categoria || '').toLowerCase();
      const cod = (p.codigoDiagnostico || '').toUpperCase();
      const diag = (p.diagnosticoPrincipal || '').toUpperCase();
      const isLesion = cod.includes('Z51.8') || cod.includes('Z518') || 
                       cod.includes('Z04') || 
                       diag.includes('CONSTATAC') || 
                       diag.includes('LESIÓN') || diag.includes('LESION') ||
                       diag.includes('CIRCUNSTANCIAS LEGALES') ||
                       diag.includes('POLICIAL') ||
                       diag.includes('AGRESIÓN') || diag.includes('AGRESION');
      return cat === 'c3' && !isLesion;
    });
    const totalC3 = c3LesionesPacs.length + c3ClinicoPacs.length;

    const diagCounts = {};
    c3ClinicoPacs.forEach(p => {
      const diag = (p.diagnosticoPrincipal || p.codigoDiagnostico || 'SIN DIAGNÓSTICO ESPECIFICADO').toUpperCase().trim();
      diagCounts[diag] = (diagCounts[diag] || 0) + 1;
    });

    const top10DiagC3 = Object.entries(diagCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: c3ClinicoPacs.length > 0 ? ((count / c3ClinicoPacs.length) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalTriados: pacs.length,
      avgMinCat1: countMinCat1 ? Math.round(sumMinCat1 / countMinCat1) : 0,
      avgMinReCat: countMinReCat ? Math.round(sumMinReCat / countMinReCat) : 0,
      reCatCount: countMinReCat,
      topEnfermeros,
      casosCriticos,
      c3Stats: {
        totalC3,
        lesionesCount: c3LesionesPacs.length,
        lesionesPerc: totalC3 > 0 ? ((c3LesionesPacs.length / totalC3) * 100).toFixed(1) : '0.0',
        clinicoCount: c3ClinicoPacs.length,
        clinicoPerc: totalC3 > 0 ? ((c3ClinicoPacs.length / totalC3) * 100).toFixed(1) : '0.0',
        top10DiagC3
      }
    };
  }, [pacientesFiltrados]);

  // Totales globales para el pie de la tabla de enfermeros en el reporte consolidado
  const totalesEnfermeriaReporte = useMemo(() => {
    let totalTriados = 0;
    let c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0;
    (enfermeriaStats.topEnfermeros || []).forEach(row => {
      totalTriados += row.total;
      c1 += row.c1;
      c2 += row.c2;
      c3 += row.c3;
      c4 += row.c4;
      c5 += row.c5;
    });
    return {
      totalTriados,
      c1, c2, c3, c4, c5,
      avgMinCat1: enfermeriaStats.avgMinCat1,
      avgMinReCat: enfermeriaStats.avgMinReCat
    };
  }, [enfermeriaStats]);

  const printReport = () => {
    window.print();
  };

  const exportCSV = () => {
    const lotesVisibles = turnosDB.filter(t => t.fechaInicio >= fechas.inicio && t.fechaFin <= fechas.fin).map(t => t.loteId);
    const pacs = pacientesDB.filter(p => lotesVisibles.includes(p.loteId));
    
    if (pacs.length === 0) return alert('No hay datos en este periodo para exportar.');
    
    const headers = ['ID_Lote', 'Edad', 'Sexo', 'Categoria', 'Medico', 'Comuna', 'Nacionalidad', 'Diagnostico_Principal', 'Destino_Alta'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + pacs.map(p => `${p.loteId},${p.edad || ''},${p.sexo || ''},${p.categoria || ''},${p.medico || ''},${p.comuna || ''},${p.nacionalidad || ''},"${String(p.diagnosticoPrincipal || p.codigoDiagnostico || '').replace(/"/g, '""')}","${String(p.destinoAlta || p.destino || '').replace(/"/g, '""')}"`).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `metrico_reporte_completo_${fechas.inicio}_a_${fechas.fin}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasData = statsKPI && statsKPI.pacientes.current > 0;
  
  const generateNarrative = () => {
    if (!hasData) return "No se registraron atenciones en este periodo.";
    
    let text = `Durante el periodo comprendido entre el ${fechas.inicio} y el ${fechas.fin}, se registró un total de ${statsKPI.pacientes.current} pacientes atendidos. `;
    text += `El rendimiento promedio de atención médica se situó en ${statsKPI.pacHora.current.toFixed(1)} pacientes por hora. `;
    text += `El tiempo promedio de estadía por paciente fue de ${Math.round(statsKPI.estadia.current)} minutos. `;

    const topDoc = [...filteredMetricsByDoctor].sort((a,b) => b.total - a.total)[0];
    if (topDoc) {
      text += `El profesional con mayor volumen de pacientes fue ${topDoc.name} con ${topDoc.total} atenciones. `;
    }

    const altasPct = (statsKPI.altasAdmin.current / statsKPI.pacientes.current) * 100;
    if (altasPct > 10) {
      text += `Atención: La tasa de Alta Administrativa fue del ${altasPct.toFixed(1)}%, superando el umbral del 10%.`;
    }

    return { text, altasPct };
  };

  const narrativeData = generateNarrative();
  const maxDiagCount = topDiagnosticos && topDiagnosticos.length > 0 ? Math.max(...topDiagnosticos.map(d => d.count)) : 1;

  return (
    <div className="w-full flex flex-col gap-6 max-w-6xl mx-auto animate-fade-in">
      
      {/* BARRA DE FILTROS GLOBALES Y RANGO DE FECHAS (No se imprime) */}
      <div className="no-print">
        <FiltrosGlobales 
          modoComparativo={modoComparativo} setModoComparativo={setModoComparativo}
          filtroFechaInicio={filtroFechaInicio} setFiltroFechaInicio={setFiltroFechaInicio}
          filtroFechaFin={filtroFechaFin} setFiltroFechaFin={setFiltroFechaFin}
          filtroFechaInicioB={filtroFechaInicioB} setFiltroFechaInicioB={setFiltroFechaInicioB}
          filtroFechaFinB={filtroFechaFinB} setFiltroFechaFinB={setFiltroFechaFinB}
          applyDatePreset={applyDatePreset}
          tipoCorte={tipoCorte} setTipoCorte={setTipoCorte}
          filtroHoraInicio={filtroHoraInicio} setFiltroHoraInicio={setFiltroHoraInicio}
          filtroHoraFin={filtroHoraFin} setFiltroHoraFin={setFiltroHoraFin}
          horarioPreset={horarioPreset} setHorarioPreset={setHorarioPreset}
          maxDateLabel={maxDateLabel}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* PANEL DE ACCIONES E IMPRESIÓN DEL REPORTE (No se imprime) */}
      <div className="bg-card-custom p-6 rounded-3xl border border-card-custom shadow-sm no-print space-y-4 theme-transition">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-primary-custom tracking-tight">Generador de Reportes Ejecutivos</h2>
              <p className="text-xs text-secondary-custom font-semibold">Configura el rango temporal y selecciona los sub-reportes a incluir para formato Hoja Carta (PDF).</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold rounded-xl text-xs hover:bg-emerald-500/20 transition-all cursor-pointer">
              <Download className="w-4 h-4" /> CSV
            </button>

            <button onClick={printReport} disabled={!hasData} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50">
              <Printer className="w-4 h-4" /> Imprimir / PDF (Hoja Carta)
            </button>
          </div>
        </div>

        {/* SELECTOR DE SUB-REPORTES A INCLUIR */}
        <div className="border-t border-card-custom/60 pt-4">
          <span className="text-[10px] font-black text-secondary-custom uppercase tracking-wider block mb-3">SELECCIONAR SUB-REPORTES A INCLUIR EN LA IMPRESIÓN (PAGINADOS EN HOJA CARTA)</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            
            <button 
              onClick={() => setIncluirGeneral(!incluirGeneral)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${incluirGeneral ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400' : 'bg-black/5 dark:bg-white/5 border-card-custom text-secondary-custom'}`}
            >
              {incluirGeneral ? <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0" /> : <Square className="w-4 h-4 opacity-40 shrink-0" />}
              <span>Reporte General Ejecutivo</span>
            </button>

            <button 
              onClick={() => setIncluirAltas(!incluirAltas)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${incluirAltas ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400' : 'bg-black/5 dark:bg-white/5 border-card-custom text-secondary-custom'}`}
            >
              {incluirAltas ? <CheckSquare className="w-4 h-4 text-rose-500 shrink-0" /> : <Square className="w-4 h-4 opacity-40 shrink-0" />}
              <span>Sub-reporte Altas Admin</span>
            </button>

            <button 
              onClick={() => setIncluirFracturas(!incluirFracturas)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${incluirFracturas ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' : 'bg-black/5 dark:bg-white/5 border-card-custom text-secondary-custom'}`}
            >
              {incluirFracturas ? <CheckSquare className="w-4 h-4 text-amber-500 shrink-0" /> : <Square className="w-4 h-4 opacity-40 shrink-0" />}
              <span>Sub-reporte Fracturas y Destino</span>
            </button>

            <button 
              onClick={() => setIncluirEnfermeria(!incluirEnfermeria)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${incluirEnfermeria ? 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400' : 'bg-black/5 dark:bg-white/5 border-card-custom text-secondary-custom'}`}
            >
              {incluirEnfermeria ? <CheckSquare className="w-4 h-4 text-sky-500 shrink-0" /> : <Square className="w-4 h-4 opacity-40 shrink-0" />}
              <span>Sub-reporte Enfermería y Triaje</span>
            </button>

          </div>
        </div>

      </div>

      {/* REPORTE IMPRIMIBLE CON PAGINACIÓN HOJA CARTA */}
      <div id="reporte-printable" className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 mx-auto w-full max-w-4xl text-slate-900">
        
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Calendar className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay registros para las fechas seleccionadas.</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* HOJA 1: REPORTE GENERAL EJECUTIVO */}
            {incluirGeneral && (
              <div className="space-y-6">
                
                {/* Cabecera del Documento */}
                <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
                  <div className="flex items-center gap-4">
                    <img src="/IMG/LogoSAR.png" alt="Logo SAR" className="h-14 object-contain" />
                    <div>
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">METRICO</h1>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Reporte Ejecutivo de Gestión General</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-700 capitalize">Tipo: {tipoReporte}</p>
                    <p className="text-[11px] text-slate-500 font-bold">Periodo de Datos: {rangoFechasReales.texto}</p>
                  </div>
                </div>

                {/* Resumen Narrativo */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" /> Resumen Ejecutivo Automático
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    {narrativeData.text}
                  </p>
                </div>

                {/* KPIs Principales */}
                <div className="print-avoid-break">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Indicadores Clave de Desempeño (KPI)</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="border border-slate-200 p-3 rounded-xl text-center bg-slate-50/50">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Volumen Pacientes</p>
                      <p className="text-xl font-black text-slate-800 mt-1">{statsKPI.pacientes.current}</p>
                    </div>
                    <div className="border border-slate-200 p-3 rounded-xl text-center bg-slate-50/50">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Rendimiento</p>
                      <p className="text-xl font-black text-blue-600 mt-1">{statsKPI.pacHora.current.toFixed(1)} <span className="text-[10px] font-bold">pac/h</span></p>
                    </div>
                    <div className="border border-slate-200 p-3 rounded-xl text-center bg-slate-50/50">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">T. Estadía Prom.</p>
                      <p className="text-xl font-black mt-1 text-slate-700">{Math.round(statsKPI.estadia.current)} <span className="text-[10px] font-bold">min</span></p>
                    </div>
                    <div className={`border p-3 rounded-xl text-center ${narrativeData.altasPct > 10 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                      <p className={`text-[10px] font-bold uppercase ${narrativeData.altasPct > 10 ? 'text-rose-600' : 'text-emerald-600'}`}>Altas Admin</p>
                      <p className={`text-xl font-black mt-1 ${narrativeData.altasPct > 10 ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {statsKPI.altasAdmin.current} <span className="text-xs font-bold">({narrativeData.altasPct.toFixed(1)}%)</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Perfil Demográfico */}
                <div className="print-avoid-break">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Perfil Demográfico y Operativo</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Previsión (Top 5)</p>
                      <ul className="text-xs space-y-1">
                        {Object.entries(demografiaStats.prevs).sort((a,b)=>b[1]-a[1]).slice(0,5).map((p, i) => (
                          <li key={i} className="flex justify-between border-b border-slate-200/50 pb-0.5 last:border-0">
                            <span className="truncate pr-1">{p[0]}</span><span className="font-bold">{p[1]}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Nacionalidad (Top 5)</p>
                      <ul className="text-xs space-y-1">
                        {Object.entries(demografiaStats.nacionalidades).sort((a,b)=>b[1]-a[1]).slice(0,5).map((p, i) => (
                          <li key={i} className="flex justify-between border-b border-slate-200/50 pb-0.5 last:border-0">
                            <span className="truncate pr-1">{p[0]}</span><span className="font-bold">{p[1]}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Establecimiento (Top 5)</p>
                      <ul className="text-xs space-y-1">
                        {Object.entries(demografiaStats.establecimientos).sort((a,b)=>b[1]-a[1]).slice(0,5).map((p, i) => (
                          <li key={i} className="flex justify-between border-b border-slate-200/50 pb-0.5 last:border-0">
                            <span className="truncate pr-1">{p[0]}</span><span className="font-bold">{p[1]}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Top 5 Médicos */}
                <div className="print-avoid-break">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Top 5 Médicos por Volumen</h3>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold">
                        <th className="p-2 border border-slate-200">Médico</th>
                        <th className="p-2 border border-slate-200 text-center">Atenciones</th>
                        <th className="p-2 border border-slate-200 text-center">Rendimiento (Pac/Hora)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...filteredMetricsByDoctor].sort((a,b) => b.total - a.total).slice(0, 5).map(doc => (
                        <tr key={doc.name}>
                          <td className="p-2 border border-slate-200 font-medium text-slate-800">{doc.name}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold text-blue-600">{doc.total}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold text-emerald-600">{doc.promHora}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Top 10 Diagnósticos (Visual Vectorial Vector Bar Chart para Impresión Impresa Perfecta) */}
                {topDiagnosticos && topDiagnosticos.length > 0 && (
                  <div className="print-avoid-break">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Top 10 Diagnósticos Principales</h3>
                    <div className="space-y-2">
                      {topDiagnosticos.map((diag, idx) => {
                        const pctWidth = Math.min(100, Math.round((diag.count / maxDiagCount) * 100));
                        return (
                          <div key={idx} className="flex items-center gap-3 text-xs">
                            <span className="w-48 font-bold text-slate-700 truncate" title={diag.name}>{diag.name}</span>
                            <div className="flex-1 bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200 flex items-center">
                              <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${pctWidth}%` }}></div>
                            </div>
                            <span className="w-12 font-black text-right text-rose-600">{diag.count} pac</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* HOJA 2: SUB-REPORTE DE ALTAS ADMINISTRATIVAS */}
            {incluirAltas && (
              <div className={`${incluirGeneral ? 'print-page-break' : ''} space-y-6`}>
                <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-7 h-7 text-rose-600" />
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">SUB-REPORTE: ALTAS ADMINISTRATIVAS</h2>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Análisis de Cancelaciones e Impacto Operativo</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-600">Periodo de Datos: {rangoFechasReales.texto}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 print-avoid-break">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Total Atenciones</span>
                    <p className="text-2xl font-black text-slate-800 mt-1">{altasStats.totalPacientes}</p>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-rose-600 uppercase">Altas Administrativas</span>
                    <p className="text-2xl font-black text-rose-700 mt-1">{altasStats.totalAltas}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-amber-600 uppercase">Tasa de Cancelación</span>
                    <p className="text-2xl font-black text-amber-700 mt-1">{altasStats.pct}%</p>
                  </div>
                </div>

                <div className="print-avoid-break">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Turnos con Tasa Crítica de Altas Admin (&gt;10%)</h3>
                  {altasStats.turnosCriticos.length > 0 ? (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold">
                          <th className="p-2 border border-slate-200">Fecha Turno</th>
                          <th className="p-2 border border-slate-200">Horario / Jornada</th>
                          <th className="p-2 border border-slate-200 text-center">Equipo</th>
                          <th className="p-2 border border-slate-200 text-center">Altas Admin</th>
                          <th className="p-2 border border-slate-200 text-center">% Cancelación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {altasStats.turnosCriticos.slice(0, 8).map((t, idx) => (
                          <tr key={idx}>
                            <td className="p-2 border border-slate-200 font-bold text-slate-800">{t.fechaInicio}</td>
                            <td className="p-2 border border-slate-200 text-slate-600">{t.horario.split('(')[0]}</td>
                            <td className="p-2 border border-slate-200 text-center font-bold text-indigo-600">{t.equipoTurno}</td>
                            <td className="p-2 border border-slate-200 text-center font-bold text-rose-600">{t.altasAdmin} / {t.totalPacientes}</td>
                            <td className="p-2 border border-slate-200 text-center font-black text-rose-700 bg-rose-50">{t.pct}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-xs text-slate-500 py-4 text-center border border-slate-200 rounded-xl bg-slate-50">¡Excelente! No se registraron turnos con tasa de altas administrativas superior al 10% en este periodo.</p>
                  )}
                </div>
              </div>
            )}

            {/* HOJA 3: SUB-REPORTE DE FRACTURAS Y DESTINO */}
            {incluirFracturas && (
              <div className={`${(incluirGeneral || incluirAltas) ? 'print-page-break' : ''} space-y-6`}>
                <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <Hospital className="w-7 h-7 text-amber-600" />
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">SUB-REPORTE: ESTADÍSTICAS DE FRACTURA Y DESTINO</h2>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Casos de Traumatología y Destinos de Alta Médica</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-600">Periodo de Datos: {rangoFechasReales.texto}</span>
                </div>

                {/* Universo General */}
                <div className="bg-slate-50/50 border border-slate-200 p-4 rounded-2xl space-y-3 print-avoid-break">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-500" /> Universo Total de Atenciones (Todos los Diagnósticos)
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white border border-slate-200 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Pacientes Evaluados</span>
                      <p className="text-xl font-black text-slate-800 mt-1">{fracturasStats.totalPacientes}</p>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-rose-600 uppercase">Traslados Hospital</span>
                      <p className="text-xl font-black text-rose-700 mt-1">{fracturasStats.hospitalCount}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">Altas Domicilio</span>
                      <p className="text-xl font-black text-emerald-700 mt-1">{fracturasStats.domicilioCount}</p>
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Otros / Sin Registro</span>
                      <p className="text-xl font-black text-slate-700 mt-1">{fracturasStats.sinRegistroCount + fracturasStats.otrosCount}</p>
                    </div>
                  </div>
                </div>

                {/* Desglose Específico Fracturas */}
                <div className="bg-amber-50/30 border border-amber-200/60 p-4 rounded-2xl space-y-3 print-avoid-break">
                  <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider border-b border-amber-200 pb-1.5 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-600" /> Desglose Específico de Casos de Fracturas
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-amber-700 uppercase">Total Casos Fracturas</span>
                      <p className="text-xl font-black text-amber-700 mt-1">{fracturasStats.totalFracturas}</p>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-rose-700 uppercase">Trasladados por Fractura</span>
                      <p className="text-xl font-black text-rose-700 mt-1">
                        {fracturasStats.fracturasTrasladadas}
                        <span className="text-[11px] font-bold text-rose-600 ml-1.5">
                          ({fracturasStats.totalFracturas > 0 ? ((fracturasStats.fracturasTrasladadas / fracturasStats.totalFracturas) * 100).toFixed(0) : 0}%)
                        </span>
                      </p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">Alta Domicilio (Ambulatorio)</span>
                      <p className="text-xl font-black text-emerald-700 mt-1">
                        {fracturasStats.fracturasDomicilio}
                        <span className="text-[11px] font-bold text-emerald-600 ml-1.5">
                          ({fracturasStats.totalFracturas > 0 ? ((fracturasStats.fracturasDomicilio / fracturasStats.totalFracturas) * 100).toFixed(0) : 0}%)
                        </span>
                      </p>
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Otros / Sin Registro Fx</span>
                      <p className="text-xl font-black text-slate-700 mt-1">
                        {fracturasStats.fracturasOtros}
                        <span className="text-[11px] font-bold text-slate-500 ml-1.5">
                          ({fracturasStats.totalFracturas > 0 ? ((fracturasStats.fracturasOtros / fracturasStats.totalFracturas) * 100).toFixed(0) : 0}%)
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="print-avoid-break">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Top Diagnósticos de Traumatología y Fractura</h3>
                  {fracturasStats.topFracturas.length > 0 ? (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold">
                          <th className="p-2 border border-slate-200">Diagnóstico Principal</th>
                          <th className="p-2 border border-slate-200 text-center">Nº Casos Registrados</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fracturasStats.topFracturas.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-2 border border-slate-200 font-bold text-slate-800">{item.name}</td>
                            <td className="p-2 border border-slate-200 text-center font-black text-amber-600">{item.count} pac.</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-xs text-slate-500 py-4 text-center border border-slate-200 rounded-xl bg-slate-50">No se detectaron registros específicos de fracturas en este periodo.</p>
                  )}
                </div>
              </div>
            )}

            {/* HOJA 4: SUB-REPORTE DE ENFERMERÍA Y TRIAJE */}
            {incluirEnfermeria && (
              <div className={`${(incluirGeneral || incluirAltas || incluirFracturas) ? 'print-page-break' : ''} space-y-6`}>
                <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <Activity className="w-7 h-7 text-sky-600" />
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">SUB-REPORTE: RENDIMIENTO DE ENFERMERÍA Y TRIAJE</h2>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Tiempos de Respuesta y Gestión de Categorización (C1-C5)</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-600">Periodo de Datos: {rangoFechasReales.texto}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 print-avoid-break">
                  <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-sky-600 uppercase">T. Resp. 1ª Categorización</span>
                    <p className="text-2xl font-black text-sky-700 mt-1">{enfermeriaStats.avgMinCat1} min</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-amber-600 uppercase">T. Re-categorización</span>
                    <p className="text-2xl font-black text-amber-700 mt-1">{enfermeriaStats.avgMinReCat} min</p>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">Pacientes Re-evaluados</span>
                    <p className="text-2xl font-black text-indigo-700 mt-1">{enfermeriaStats.reCatCount} pac.</p>
                  </div>
                </div>

                <div className="print-avoid-break">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Top Profesional de Enfermería por Volumen Triado</h3>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold">
                        <th className="p-2 border border-slate-200">Profesional / Enfermero(a)</th>
                        <th className="p-2 border border-slate-200 text-center">Total Triados</th>
                        <th className="p-2 border border-slate-200 text-center text-red-600">C1</th>
                        <th className="p-2 border border-slate-200 text-center text-orange-600">C2</th>
                        <th className="p-2 border border-slate-200 text-center text-amber-600">C3</th>
                        <th className="p-2 border border-slate-200 text-center text-emerald-600">C4</th>
                        <th className="p-2 border border-slate-200 text-center text-blue-600">C5</th>
                        <th className="p-2 border border-slate-200 text-center text-sky-600">T. 1ª Cat (min)</th>
                        <th className="p-2 border border-slate-200 text-center text-amber-600">T. 2ª Cat (min)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enfermeriaStats.topEnfermeros.map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-2 border border-slate-200 font-bold text-slate-800">{row.nombre}</td>
                          <td className="p-2 border border-slate-200 text-center font-black text-sky-600">{row.total}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold text-red-600">{row.c1 || '-'}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold text-orange-600">{row.c2 || '-'}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold text-amber-600">{row.c3 || '-'}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold text-emerald-600">{row.c4 || '-'}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold text-blue-600">{row.c5 || '-'}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold text-sky-600">{row.avgMinCat1 > 0 ? `${row.avgMinCat1} min` : '-'}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold text-amber-600">{row.avgMinReCat > 0 ? `${row.avgMinReCat} min` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                    {enfermeriaStats.topEnfermeros.length > 0 && (
                      <tfoot className="border-t-2 border-slate-400 font-bold bg-slate-100 text-slate-900 text-xs">
                        <tr>
                          <td className="p-2 border border-slate-200 font-bold text-slate-900">TOTAL / PROMEDIO GLOBAL</td>
                          <td className="p-2 border border-slate-200 text-center font-black text-sky-600">{totalesEnfermeriaReporte.totalTriados}</td>
                          <td className="p-2 border border-slate-200 text-center text-red-600">{totalesEnfermeriaReporte.c1 || '-'}</td>
                          <td className="p-2 border border-slate-200 text-center text-orange-600">{totalesEnfermeriaReporte.c2 || '-'}</td>
                          <td className="p-2 border border-slate-200 text-center text-amber-600">{totalesEnfermeriaReporte.c3 || '-'}</td>
                          <td className="p-2 border border-slate-200 text-center text-emerald-600">{totalesEnfermeriaReporte.c4 || '-'}</td>
                          <td className="p-2 border border-slate-200 text-center text-blue-600">{totalesEnfermeriaReporte.c5 || '-'}</td>
                          <td className="p-2 border border-slate-200 text-center text-sky-600 font-black">{totalesEnfermeriaReporte.avgMinCat1 > 0 ? `${totalesEnfermeriaReporte.avgMinCat1} min` : '-'}</td>
                          <td className="p-2 border border-slate-200 text-center text-amber-600 font-black">{totalesEnfermeriaReporte.avgMinReCat > 0 ? `${totalesEnfermeriaReporte.avgMinReCat} min` : '-'}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>

                <div className="print-avoid-break mt-6">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Diferenciación de Categoría C3</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Total Evaluados C3</span>
                      <p className="text-xl font-black text-slate-800 mt-1">{enfermeriaStats.c3Stats.totalC3} pac.</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-amber-700 uppercase">Constatación Lesiones (Z51.8)</span>
                      <p className="text-xl font-black text-amber-700 mt-1">
                        {enfermeriaStats.c3Stats.lesionesCount}
                        <span className="text-xs font-bold text-amber-600 ml-1.5">({enfermeriaStats.c3Stats.lesionesPerc}%)</span>
                      </p>
                    </div>
                    <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl">
                      <span className="text-[10px] font-bold text-sky-700 uppercase">Diagnóstico Clínico General</span>
                      <p className="text-xl font-black text-sky-700 mt-1">
                        {enfermeriaStats.c3Stats.clinicoCount}
                        <span className="text-xs font-bold text-sky-600 ml-1.5">({enfermeriaStats.c3Stats.clinicoPerc}%)</span>
                      </p>
                    </div>
                  </div>

                  <h4 className="text-[11px] font-bold text-slate-700 uppercase mb-2">Top 10 Diagnósticos Clínicos C3 (Excluye Constatación de Lesiones)</h4>
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold">
                        <th className="p-1.5 border border-slate-200">Diagnóstico Clínico</th>
                        <th className="p-1.5 border border-slate-200 text-center w-28">Nº Casos</th>
                        <th className="p-1.5 border border-slate-200 text-center w-28">% Del Clínico</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enfermeriaStats.c3Stats.top10DiagC3.length > 0 ? (
                        enfermeriaStats.c3Stats.top10DiagC3.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-1.5 border border-slate-200 font-medium text-slate-800">{item.name}</td>
                            <td className="p-1.5 border border-slate-200 text-center font-bold">{item.count}</td>
                            <td className="p-1.5 border border-slate-200 text-center font-black text-sky-600">{item.percentage}%</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="p-2 border border-slate-200 text-center text-slate-500">No hay registros clínicos de C3.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="print-avoid-break mt-6">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Registro Detallado de Atenciones Críticas (C1 y C2)</h3>
                  <table className="w-full text-left text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold">
                        <th className="p-1.5 border border-slate-200">Fecha y Hora</th>
                        <th className="p-1.5 border border-slate-200 text-center">Turno Asociado</th>
                        <th className="p-1.5 border border-slate-200 text-center">ID / Correlativo (IP)</th>
                        <th className="p-1.5 border border-slate-200 text-center">Categoría</th>
                        <th className="p-1.5 border border-slate-200">Diagnóstico Médico</th>
                        <th className="p-1.5 border border-slate-200 text-center">Código</th>
                        <th className="p-1.5 border border-slate-200">Enfermero(a) que Categorizó</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enfermeriaStats.casosCriticos.length > 0 ? (
                        enfermeriaStats.casosCriticos.map((p, idx) => {
                          const d = p.tAdmision ? new Date(p.tAdmision) : null;
                          const dateStr = d ? d.toLocaleDateString('es-CL') : '-';
                          const timeStr = d ? d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '-';
                          const cat = String(p.catPrimera || p.categoria || '').toUpperCase();
                          
                          // Calcular turno asociado
                          let turnoStr = '-';
                          if (d) {
                            const hours = d.getHours();
                            const dayOfWeek = d.getDay();
                            const isWknd = (dayOfWeek === 0 || dayOfWeek === 6);
                            
                            let logicalDate = new Date(p.tAdmision);
                            let label = '';
                            
                            if (isWknd) {
                              if (hours < 8) {
                                logicalDate.setDate(logicalDate.getDate() - 1);
                                label = 'Finde Noche';
                              } else if (hours >= 8 && hours < 20) {
                                label = 'Finde Día';
                              } else {
                                label = 'Finde Noche';
                              }
                            } else {
                              if (hours < 16) {
                                logicalDate.setDate(logicalDate.getDate() - 1);
                                label = 'Largo';
                              } else {
                                label = 'Largo';
                              }
                            }
                            const y = logicalDate.getFullYear();
                            const m = String(logicalDate.getMonth() + 1).padStart(2, '0');
                            const day = String(logicalDate.getDate()).padStart(2, '0');
                            turnoStr = `${day}/${m}/${y} (${label})`;
                          }

                          return (
                            <tr key={idx}>
                              <td className="p-1.5 border border-slate-200 font-medium text-slate-800">{dateStr} {timeStr}</td>
                              <td className="p-1.5 border border-slate-200 text-center font-bold">{turnoStr}</td>
                              <td className="p-1.5 border border-slate-200 text-center font-bold">{p.correlativo || p.idPaciente || '-'}</td>
                              <td className="p-1.5 border border-slate-200 text-center font-black">
                                <span className={cat === 'C1' ? 'text-red-600' : 'text-orange-600'}>{cat}</span>
                              </td>
                              <td className="p-1.5 border border-slate-200 font-medium text-slate-800 max-w-xs truncate" title={p.diagnosticoPrincipal}>{p.diagnosticoPrincipal || '-'}</td>
                              <td className="p-1.5 border border-slate-200 text-center font-bold text-slate-600">{p.codigoDiagnostico || '-'}</td>
                              <td className="p-1.5 border border-slate-200 font-semibold text-slate-700">{p.enfermeroCat1 || '-'}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" className="p-2 border border-slate-200 text-center text-slate-500">No se registraron atenciones críticas (C1/C2).</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECCIÓN DE CIERRE Y CONTROL DE VALIDEZ (PEDIDO POR EL USUARIO) */}
            <div className="print-page-break print-avoid-break space-y-6 pt-6 border-t-2 border-slate-950">
              {/* Header Cierre */}
              <div className="flex justify-between items-center border-b border-slate-300 pb-3">
                <div>
                  <h2 className="text-sm font-black text-slate-900 tracking-wider uppercase">CIERRE DE INFORME Y VALIDACIÓN DE DATOS</h2>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Control Operativo e Integridad de la Información</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-slate-100 text-slate-800 text-[10px] font-black rounded-full border border-slate-200 uppercase">
                    Documento Oficial
                  </span>
                </div>
              </div>

              {/* Grid de Totales Consignados */}
              <div className="grid grid-cols-2 gap-4">
                {/* Cuadro de Resumen General */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block border-b border-slate-200 pb-1">Totales Consignados en Periodo</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-bold block">Total Atenciones:</span>
                      <span className="font-black text-slate-800 text-sm">{pacientesFiltrados.length} pac.</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Casos Críticos (C1/C2):</span>
                      <span className="font-black text-slate-800 text-sm">{enfermeriaStats.casosCriticos.length} pac.</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Constatación Lesiones (C3):</span>
                      <span className="font-black text-slate-800 text-sm">{enfermeriaStats.c3Stats.lesionesCount} pac. ({enfermeriaStats.c3Stats.lesionesPerc}%)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Diagnóstico Clínico C3:</span>
                      <span className="font-black text-slate-800 text-sm">{enfermeriaStats.c3Stats.clinicoCount} pac. ({enfermeriaStats.c3Stats.clinicoPerc}%)</span>
                    </div>
                  </div>
                </div>

                {/* Cuadro de Tiempos y Operatividad */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block border-b border-slate-200 pb-1">Metadatos de Operación y Tiempos</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-bold block">T. Promedio 1ª Cat:</span>
                      <span className="font-black text-slate-800 text-sm">{enfermeriaStats.avgMinCat1} min</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">T. Promedio Re-Cat:</span>
                      <span className="font-black text-slate-800 text-sm">{enfermeriaStats.avgMinReCat} min</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Tasa Altas Admin:</span>
                      <span className="font-black text-rose-700 text-sm">{altasStats.pct}% ({altasStats.totalAltas} altas)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Total Fracturas Fx:</span>
                      <span className="font-black text-amber-700 text-sm">{fracturasStats.totalFracturas} pac.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadatos de Emisión de Reporte */}
              <div className="bg-slate-50/50 border border-slate-200 p-3.5 rounded-xl text-[11px] text-slate-600 leading-relaxed space-y-1.5">
                <p>
                  <strong>Sistema Emisor:</strong> Métrico - Dashboard de Gestión Estadística y Tiempos de Espera de Urgencia (SAR Hospital de Melipilla).
                </p>
                <p>
                  <strong>Usuario Certificante:</strong> {user?.email || 'Usuario de Gestión Local / Localhost'}
                </p>
                <p>
                  <strong>Fecha de Descarga:</strong> {new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })} h
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                  * Este documento es un consolidado estadístico generado a partir de registros del sistema Iris.
                </p>
              </div>

              {/* Bloque de Firmas */}
              <div className="grid grid-cols-2 gap-8 pt-10">
                <div className="text-center space-y-1">
                  <div className="border-t border-slate-400 w-52 mx-auto"></div>
                  <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Firma Enfermero(a) Supervisor(a)</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Gestión de Categorización y Triaje</p>
                </div>
                <div className="text-center space-y-1">
                  <div className="border-t border-slate-400 w-52 mx-auto"></div>
                  <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Firma Jefe de Urgencia</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Validación de Rendimiento SAR</p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
