import sys

with open("src/components/Dashboard.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
in_return = False
replaced = False

for i, line in enumerate(lines):
    if "return (" in line and "space-y-6" in lines[i+1] and not replaced:
        in_return = True
        new_lines.append("  return (\n")
        new_lines.append("""    <div className="space-y-6 animate-fade-in text-slate-700 bg-slate-50 p-6 min-h-screen font-sans pb-12">
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-sm font-medium z-50 animate-bounce-in ${notification.type === 'error' ? 'bg-red-600 text-white' : notification.type === 'warning' ? 'bg-orange-500 text-white' : 'bg-emerald-600 text-white'}`}>
          {notification.msg}
        </div>
      )}

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
        pacientesFiltrados={pacientesFiltrados}
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
    </div>
  );
""")
        replaced = True
        continue
    
    if in_return:
        if line.strip() == ");" and lines[i+1].strip() == "}":
            in_return = False
        continue
    
    new_lines.append(line)

with open("src/components/Dashboard.jsx", "w", encoding="utf-8") as f:
    f.writelines(new_lines)
