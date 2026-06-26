import sys

with open("src/components/dashboard/GraficoDinamico.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

# add imports
for i, line in enumerate(lines):
    if "import { BarChart2" in line:
        # replace lucide-react import to add CheckCircle
        if "CheckCircle" not in line:
            lines[i] = line.replace("BarChart2,", "BarChart2, CheckCircle,")
    if line.startswith("export default function GraficoDinamico"):
        lines.insert(i, "import { COLORS, METRIC_LABELS } from '../../config/constants';\n\n")
        break

# fix function signature
for i, line in enumerate(lines):
    if "renderCheckbox," in line or "getColorForMetric," in line or "formatMetricName," in line or "METRIC_LABELS," in line or "COLORS," in line:
        lines[i] = ""
    if "handleGraphToggleChange," in line:
        lines[i] = ""

# add the functions inside the component
inserted = False
for i, line in enumerate(lines):
    if "return (" in line and not inserted:
        functions = """
  const getColorForMetric = (metricKey) => {
      if (METRIC_LABELS[metricKey]) return COLORS[metricKey] || '#94a3b8';
      for (const group in dynamicMetricKeys) {
        const found = dynamicMetricKeys[group].find(m => m.value === metricKey);
        if (found) return found.color;
      }
      return '#cbd5e1';
  };

  const formatMetricName = (metricKey) => {
      if (METRIC_LABELS[metricKey]) return METRIC_LABELS[metricKey];
      for (const group in dynamicMetricKeys) {
        const found = dynamicMetricKeys[group].find(m => m.value === metricKey);
        if (found) return found.label;
      }
      return metricKey;
  };

  const handleGraphToggleChange = (metricValue) => {
    setMetricasGrafico(prev => {
      if (prev.includes(metricValue)) return prev.filter(m => m !== metricValue);
      return [...prev, metricValue];
    });
  };

  const renderCheckbox = (metric) => (
    <label key={metric.value} className="flex items-center gap-2 cursor-pointer text-xs group">
      <div className="relative flex items-center justify-center">
        <input 
          type="checkbox" 
          checked={metricasGrafico.includes(metric.value)}
          onChange={() => handleGraphToggleChange(metric.value)}
          className="sr-only"
        />
        <div className={`w-4 h-4 rounded transition border ${metricasGrafico.includes(metric.value) ? 'border-transparent' : 'border-slate-300 group-hover:border-slate-400'}`} style={{ backgroundColor: metricasGrafico.includes(metric.value) ? metric.color : 'transparent' }}>
          {metricasGrafico.includes(metric.value) && <CheckCircle className="w-3.5 h-3.5 text-white absolute top-0.5 left-0.5" />}
        </div>
      </div>
      <span className={metricasGrafico.includes(metric.value) ? 'font-bold text-slate-700' : 'text-slate-500'}>{metric.label}</span>
    </label>
  );

"""
        lines.insert(i, functions)
        inserted = True
        break

with open("src/components/dashboard/GraficoDinamico.jsx", "w", encoding="utf-8") as f:
    f.writelines(lines)
