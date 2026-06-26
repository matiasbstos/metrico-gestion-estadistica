import re

with open('src/components/Dashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the return block of DashboardContent
old_return_block = r"  return \(\s*<div className=\"space-y-6 animate-fade-in text-slate-700 bg-slate-50 p-6 min-h-screen font-sans pb-12\">.*?^\s*\);\s*}\s*class ErrorBoundary"

new_return_block = """  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
      {/* COLUMNA IZQUIERDA: SIDEBAR FIJO */}
      <aside className="w-64 h-full bg-slate-900 text-white flex flex-col justify-between flex-shrink-0 z-10 shadow-xl">
        <div>
          <div className="p-6 flex items-center gap-3">
            <Activity className="w-8 h-8 text-sky-500" />
            <div>
              <h1 className="font-black text-lg tracking-tight leading-none">METRICO</h1>
              <p className="text-[10px] text-slate-400 font-medium">Clinical Predictive</p>
            </div>
          </div>
          <nav className="mt-4 flex flex-col gap-1 px-3">
            <button className="flex items-center gap-3 px-4 py-3 bg-sky-500 text-white rounded-lg font-bold text-sm shadow-md transition-colors">
              <BarChart2 className="w-4 h-4" /> Dashboard
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg font-medium text-sm transition-colors">
              <FileSpreadsheet className="w-4 h-4" /> Reports
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg font-medium text-sm transition-colors">
              <Database className="w-4 h-4" /> Data Management
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg font-medium text-sm transition-colors w-full">
            <XCircle className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* COLUMNA DERECHA: CANVAS DE SCROLL CONTINUO */}
      <main className="flex-1 h-full overflow-y-auto p-8 space-y-6 relative">
        {notification && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-sm font-medium z-50 animate-bounce-in ${notification.type === 'error' ? 'bg-red-600 text-white' : notification.type === 'warning' ? 'bg-orange-500 text-white' : 'bg-emerald-600 text-white'}`}>
            {notification.msg}
          </div>
        )}

        {/* Título Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-sky-500" />
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Explorador Global de Urgencias</h1>
          </div>
        </div>

        {statsKPI && <PanelKPIs statsKPI={statsKPI} />}
        
        <FiltrosGlobales 
          modoComparativo={modoComparativo} setModoComparativo={setModoComparativo}
          filtroFechaInicio={filtroFechaInicio} setFiltroFechaInicio={setFiltroFechaInicio}
          filtroFechaFin={filtroFechaFin} setFiltroFechaFin={setFiltroFechaFin}
          filtroFechaInicioB={filtroFechaInicioB} setFiltroFechaInicioB={setFiltroFechaInicioB}
          filtroFechaFinB={filtroFechaFinB} setFiltroFechaFinB={setFiltroFechaFinB}
          applyDatePreset={applyDatePreset}
        />

        <GraficoDinamico 
          chartData={chartData} compareChartData={compareChartData} pieData={pieData}
          tipoGrafico={tipoGrafico} setTipoGrafico={setTipoGrafico}
          metricasGrafico={metricasGrafico} setMetricasGrafico={setMetricasGrafico}
          filtroVariables={filtroVariables} setFiltroVariables={setFiltroVariables}
          modoComparativo={modoComparativo} dynamicMetricKeys={dynamicMetricKeys}
          turnosFiltrados={turnosFiltrados}
        />

        {demografiaStats && (
          <AnalisisSociodemografico 
            demografiaStats={demografiaStats} 
            rankingCentros={rankingCentros} 
          />
        )}

        <TablaTiemposEspera 
          metricsByCategory={metricsByCategory} 
          promediosGlobales={promediosGlobales} 
        />

        <CurvaDemanda 
          peakHoursData={peakHoursData}
          demandaFechaInicio={demandaFechaInicio} setDemandaFechaInicio={setDemandaFechaInicio}
          demandaFechaFin={demandaFechaFin} setDemandaFechaFin={setDemandaFechaFin}
          demandaViewMode={demandaViewMode} setDemandaViewMode={setDemandaViewMode}
          modoComparativo={modoComparativo} docsToCompare={docsToCompare}
        />

        <AnalisisProfesionales 
          profFechaInicio={profFechaInicio} setProfFechaInicio={setProfFechaInicio}
          profFechaFin={profFechaFin} setProfFechaFin={setProfFechaFin}
          searchDoctor={searchDoctor} setSearchDoctor={setSearchDoctor}
          docsToCompare={docsToCompare} toggleDocToCompare={toggleDocToCompare}
          clearDocComparison={clearDocComparison}
          filteredMetricsByDoctor={filteredMetricsByDoctor}
          dailyDoctorData={dailyDoctorData}
          profesionalesChartType={profesionalesChartType} setProfesionalesChartType={setProfesionalesChartType}
        />

        <DataGridTurnos 
          turnosPaginados={turnosPaginados} turnosDB={turnosDB}
          paginaTurnos={paginaTurnos} setPaginaTurnos={setPaginaTurnos}
          totalPaginasTurnos={totalPaginasTurnos}
          setEditModal={setEditModal} setDeleteConfirm={setDeleteConfirm}
        />
      </main>
    </div>
  );
}

class ErrorBoundary"""

new_content = re.sub(old_return_block, new_return_block, content, flags=re.DOTALL | re.MULTILINE)

with open('src/components/Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
