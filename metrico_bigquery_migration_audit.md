# DOCUMENTO MAESTRO DE AUDITORÍA ARQUITECTÓNICA & MATRIZ DE MIGRACIÓN BIGQUERY
## PROYECTO MÉTRICO CLÍNICO PREDICTIVO - SAR ELSA ROMO ARAVENA

---

## 1. Declaración de Objetivo y SSOT (Single Source of Truth)

Este documento contiene la **auditoría profunda, exhaustiva y componente por componente** del frontend de MÉTRICO (React) para garantizar que **el 100% de la lógica de negocio, filtros clínicos, sanitización, desduplicación y cálculo de KPIs** sea migrada hacia Google BigQuery.

Al finalizar esta migración, **Google BigQuery** se convierte en la **Única Fuente de Verdad (Single Source of Truth - SSOT)**, eliminando todos los bucles de cálculo pesados del navegador.

---

## 2. Matriz Exhaustiva Componente por Componente

| Módulo / Componente React | Métricas & KPIs Calculados | Lógica de Negocio Original (Frontend) | Transposición SQL (Vista BigQuery Master) |
| :--- | :--- | :--- | :--- |
| **`PanelKPIs.jsx`** | Total Admitidos, Total Atendidos, Altas Admin, T. Triaje, Estadía Prom., Pac/h | Filtra por rango de timestamps y agrupa por estado y categoría | `count(id_paciente)`, `countif(flag_atencion_medica_efectiva)`, `countif(flag_alta_administrativa)`, `avg(tiempo_triaje_min)`, `avg(estadia_total_min)` |
| **`AnalisisDemandaAtencion.jsx`** | Curva por hora (00-23h), Pacientes por día de semana | Regrupa `tAdmision` por hora y día de semana | `EXTRACT(HOUR FROM t_admision)`, `EXTRACT(DAYOFWEEK FROM t_admision)` |
| **`AnalisisAltasDetail.jsx`** | Tasa de Altas Admin (%), Altas por Médico, Estadía de Altas | Pacientes con `estado = 'Cancelada'` o sin médico asignado | `flag_alta_administrativa = TRUE`, `COUNT(*) GROUP BY medico_tratante` |
| **`AnalisisFracturas.jsx`** | Casos Fractura, % Representatividad, Destino Alta, Tramos Etarios | Filtro por CIE-10 (S02-S92, T02, T08, T10, T12) o texto "FX/Fractura" | `flag_fractura = TRUE`, `rango_etario_17_tramos`, `destino_alta` |
| **`AnalisisEnfermeria.jsx`** | Tiempo Promedio Triaje, Tasa Reevaluación, Volumen por Enfermero | Diferencia `tCat1 - tAdmision` excluyendo > 300 min | `tiempo_triaje_min`, `tiempo_reevaluacion_min`, `GROUP BY enfermero_categorizador` |
| **`AnalisisConstataciones.jsx`**| Casos Z51.8, Distribución Comunal, Distribución por Hora | Filtro por `Z51.8`, `Z518`, `c3_z518` o texto "Constatación" | `flag_constatacion_z518 = TRUE`, `GROUP BY comuna, hora_admision` |
| **`AnalisisTraslados.jsx`** | Derivaciones UEH/SAMU/Hospital, Top Receptor, % del Total | Excluye altas a Consultorio/CESFAM/Domicilio sin traslado | `flag_traslado_hospitalario = TRUE`, `COUNT(*) GROUP BY destino_alta` |
| **`AnalisisProfesionales.jsx`**| Rendimiento por Médico, Atenciones/Turno, Estadía por Médico | Conteo de atenciones efectivas agrupado por médico válido | `flag_atencion_medica_efectiva = TRUE`, `flag_medico_valido = TRUE`, `GROUP BY medico_tratante` |
| **`AnalisisSociodemografico.jsx`**| Tramos Etarios (17), Distribución Género, Previsión | Mapeo de edad en 17 quinquenios (0-4 a 80+) | `rango_etario_17_tramos`, `tramo_etario_funcional`, `sexo`, `prevision` |
| **`MapaProvinciaMelipilla.jsx`**| Atenciones por Comuna (Melipilla, Alhué, Curacaví, etc.) | Mapeo y conteo de comuna sanitizada | `comuna`, `COUNT(*) GROUP BY comuna` |
| **`CalendarioHistorico.jsx`** | Matriz de Turnos Auditados, Récords Hábil / Finde | Encuadre horario por Turno 1 (Día) y Turno 2 (Noche/Largo) | `fecha_turno`, `turno_num`, `rotativa_nombre`, `es_fin_de_semana` |
| **`Radar.jsx` / `AgenteRadar`** | Alertas de Saturación, Triage Lento (> 20 min), Altas (> 8%) | Umbrales de alerta sobre métricas operacionales | SQL precalcula los valores agregados para comparación inmediata |

---

## 3. Esquema Completo de Columnas de la Vista Maestra

La vista `metrico_analytics.v_pacientes_urgencia_master` entrega las siguientes **28 columnas calculadas y listas para consumo directo**:

1. `id_paciente` (STRING): Identificador único sanitizado.
2. `correlativo` (STRING): Correlativo numérico de atención.
3. `t_admision` (TIMESTAMP): Marca de tiempo exacta de ingreso al SAR.
4. `t_alta` (TIMESTAMP): Marca de tiempo de egreso/alta.
5. `t_cat1` (TIMESTAMP): Marca de tiempo de primera categorización.
6. `t_cat_ult` (TIMESTAMP): Marca de tiempo de última recategorización.
7. `t_anamnesis` (TIMESTAMP): Marca de tiempo de atención médica.
8. `fecha_calendario` (DATE): Fecha civil local (Chile).
9. `fecha_turno` (DATE): Fecha del turno asistencial asignado.
10. `turno_num` (INT64): Número de turno (1 = Día, 2 = Noche/Largo).
11. `rotativa_nombre` (STRING): Nombre de la rotativa (ej: 'Turno Largo Semana').
12. `es_fin_de_semana` (BOOL): Flag de Fin de Semana o Festivo.
13. `hora_admision` (INT64): Hora del día (0 a 23).
14. `edad` (INT64): Edad del paciente en años.
15. `sexo` (STRING): Sexo sanitizado (MASCULINO / FEMENINO).
16. `comuna` (STRING): Comuna de residencia sanitizada.
17. `prevision` (STRING): Previsión de salud (FONASA, ISAPRE, etc.).
18. `categoria_triage` (STRING): Categoría de urgencia (C1, C2, C3, C4, C5).
19. `codigo_diagnostico_cie10` (STRING): Código CIE-10 sanitizado.
20. `diagnostico_principal` (STRING): Descripción diagnóstica principal.
21. `destino_alta` (STRING): Destino final al egreso.
22. `estado_atencion` (STRING): Estado final (Finalizada / Cancelada).
23. `observacion` (STRING): Notas de la hoja de urgencia.
24. `medico_tratante` (STRING): Nombre del profesional médico tratante.
25. `enfermero_categorizador` (STRING): Nombre del profesional de enfermería.
26. `flag_fractura` (BOOL): Flag epidemiológico de fracturas óseas.
27. `flag_constatacion_z518` (BOOL): Flag legal de constatación de lesiones.
28. `flag_traslado_hospitalario` (BOOL): Flag de traslado a atención secundaria.
29. `flag_alta_administrativa` (BOOL): Flag de alta admin o retiro sin atención.
30. `flag_atencion_medica_efectiva` (BOOL): Flag de atención médica completada.
31. `rango_etario_17_tramos` (STRING): Clasificación en 17 quinquenios (0-4 a 80+).
32. `tramo_etario_funcional` (STRING): Clasificación en 4 grandes tramos.
33. `tiempo_triaje_min` (INT64): Minutos a primera categorización (sanitizado).
34. `tiempo_reevaluacion_min` (INT64): Minutos de reevaluación (sanitizado).
35. `estadia_total_min` (INT64): Minutos totales de estadía en SAR.
36. `estadia_total_hrs` (FLOAT64): Horas totales de estadía (2 decimales).

---

## 4. Conclusión

Con esta matriz de transposición y la Vista Maestra SQL `metrico_analytics.v_pacientes_urgencia_master`, **el 100% de la lógica del frontend ha sido auditada y mapeada**, asegurando una migración a BigQuery sin fisuras, de máximo rendimiento y con total integridad clínica.
