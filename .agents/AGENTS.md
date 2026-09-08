# Protocolo Obligatorio de Despliegue, Consolidación Continua & Validación de Datos en MÉTRICO

## 📌 Reglas de Consistencia y Auditoría de Datos (SSOT Rayen):
1. **Techo y Límite de Correlativos en Archivo Cargado**:
   - **Correlativo Máximo Cargado en Sistema**: `#26.548` (Fecha de corte: `27/08/2026 a las 22:24 hrs`).
   - **Correlativo Oficial Rayen en Vivo**: `#26.662` (al 29/08/2026).
   - El total acumulado de admisiones (YTD) procesado en MÉTRICO nunca puede superar el correlativo máximo del archivo entregado (`#26.548`) ni el correlativo de control oficial Rayen (`#26.662`).
2. **SSOT en `pacientesDB` y Deduplicación Estricta**: La demanda mensual y global debe priorizar siempre el conteo desduplicado directo de `pacientesDB` (`deduplicarPacientes`) para evitar que turnos precalculados o sincronizaciones superpuestas en Firestore inflen artificialmente los totales.
3. **Integridad de Líneas Base Históricas (2025)**: Las series comparativas de 12 meses deben mantener la continuidad de la línea base histórica SAR si la base de datos local contiene meses incompletos o fragmentos de prueba (< 2.000 pacientes por mes).
4. **Prioridad Absoluta de Pauta Manual de Turnos (`pautas_turnos`)**:
   - Toda resolución de equipos asistenciales (`resolverEquipoTurno` y `usePautasTurnos`) debe subordinarse con prioridad 1 a la pauta guardada por el usuario en Firestore (`pautas_turnos`).
   - Las franjas de fin de semana (`08:00 - 20:00` y `20:00 - 08:00`) deben discriminarse con exactitud antes que cualquier búsqueda genérica de texto, impidiendo que la presencia del término `'fin de semana'` sea confundida con el turno hábil de semana (`17:00 - 08:00`).
5. **Auto-Detección Estricta del Último Turno Clínico 100% Completo y Cerrado**:
   - La selección inicial por defecto del período al abrir la plataforma (`Dashboard.jsx`) debe apuntar siempre al **último turno asistencial cerrado al 100%** (corte a las 20:00 hrs para diurnos y a las 08:00 hrs del día siguiente para nocturnos).
   - Turnos nocturnos en curso o con fragmentos parciales de datos (ej. corte a las 21:57 hrs con 13 pacientes) nunca deben ser auto-seleccionados como turno completo por defecto; el sistema seleccionará el turno previo ya concluido (ej. Sábado Diurno 08:00 a 20:00 con 97 pacientes).
6. **Atribución Continua por Fecha Lógica Asistencial en Cruce de Mes (Cierre Mensual 30/31)**:
   - Todo turno asistencial nocturno que inicie en el último día del mes (ej. día 30 o 31 a las 17:00 o 20:00 hrs) y concluya en la mañana del día 1 del mes siguiente (08:00 hrs) consolida el 100% de sus pacientes (incluyendo las admisiones de madrugada 00:00 a 07:59 del día 1) en el turno y mes que cerró (día 30/31).
   - En el Histórico Mensual y en todos los reportes, el día 1 del nuevo mes sólo contabiliza los turnos que abren a partir de las 08:00 hrs (diurnos) o 17:00/20:00 hrs (nocturnos) del día 1, garantizando integridad sin fragmentar el equipo de guardia.
7. **Tratamiento de Meses Activos / En Curso en Demanda Interanual y Gráficos**:
   - Todo mes civil en curso que aún no haya concluido o presente datos parciales (definido por el umbral asistencial SAR de `< 2.000 pacientes` para el mes calendario actual o posterior) **nunca debe calcular contracciones interanuales engañosas** (ej. `-75.9%` por comparar fragmentos de días contra un mes cerrado completo de 30 días).
   - En las tarjetas mensuales de demanda se debe mostrar obligatoriamente el distintivo institucional: `En curso (X pac.) ⏳ Activo`.
   - En el gráfico comparativo de 12 meses (Recharts), los meses en curso o futuros deben pasar valor `null` para el año en curso, impidiendo caídas artificiales a cero y manteniendo la continuidad visual sin quiebres.
8. **Conciliación Universal SSOT de Crecimiento Interanual (YoY)**:
   - Toda cifra o badge de crecimiento interanual acumulado (YoY) en el módulo de Demanda (`AnalisisDemandaAtencion.jsx`), en `PanelKPIs.jsx`, en `ReportesModule.jsx` o en informes ejecutivos DEBE subordinarse estrictamente al objeto SSOT canónico `statsKPI.anual` (proveniente de `useMetricoAnalytics` / `statsKPIFinal`).
   - El cálculo de meses transcurridos (`elapsedMonthsCount`) y de la línea base comparativa (`totAdmitidosCompareElapsed`) nunca debe acumular cuotas mensuales completas del año anterior para meses abiertos o incompletos (< 2.000 pac), asegurando que el porcentaje YTD (ej. `+18.3% YoY` en admisiones) sea idéntico y consistente en el 100% de los paneles.
   - Todo porcentaje interanual positivo debe formatearse explícitamente con el signo más (`+X.X% YoY`).
9. **Desglose y Auditoría por Franjas Horarias Asistenciales en Control de Demanda**:
   - En la Prueba de Control Clínico de Demanda (Ecuación Universal: `Admitidos = Atendidos + Sin Atención + Egreso Admin.`) y en cualquier módulo de auditoría de turnos, la selección "Día" debe soportar de forma obligatoria el filtrado por franjas horarias asistenciales oficiales:
     a) **Día Completo (24 hrs)**: `00:00 a 23:59 hrs` del día civil.
     b) **Turno Diurno**: `08:00 a 20:00 hrs` (12 horas).
     c) **Turno Noche Fin de Semana / Festivo**: `20:00 a 08:00 hrs` del día siguiente (12 horas con cruce de medianoche).
     d) **Turno Largo Semana Hábil**: `17:00 a 08:00 hrs` del día siguiente (15 horas con cruce de medianoche).
10. **Garantía de Alto Contraste, Visibilidad y Accesibilidad UI**:
    - Queda estrictamente prohibido el renderizado de botones activos, pestañas o subpestañas con estilos transparentes, fondos blancos sobre fondos claros o texto ilegible (blanco sobre blanco).
    - Todo selector o elemento de navegación activo debe utilizar estilos sólidos contrastantes institucionales (como `.bg-primary-custom`, o `bg-indigo-600 text-white font-black shadow-md`), asegurando visibilidad óptima tanto en modo Claro como en modo Oscuro.
11. **Paridad Oficial de Estados Rayen y Desambiguación de Egresos Administrativos vs. Altas sin Atención Médica**:
    - La Ecuación Universal y los controles de demanda deben reflejar de forma estricta y desglosada la terminología oficial de la planilla Rayen (*"Pacientes Admitidos por Rango de Fecha y Hora"*):
      $$\text{Total Pacientes Admitidos} = \text{Completado (Atención Médica)} + \text{Egreso Administrativo} + \text{Alta sin Atención Médica}$$
    - **Reglas de Clasificación Unívoca**:
      a) **Alta sin Atención Médica (`isSinAtencionMedica`)**: Todo paciente cuyo estado o destino indique expresamente retiro, fuga, abandono o alta sin atención médica.
      b) **Egreso Administrativo (`isEgresoAdministrativo`)**: Todo paciente cuyo estado o destino corresponda a cancelación de ventanilla, anulación administrativa, duplicado o trámite administrativo, que no sea un retiro voluntario. Nunca deben sumarse indiscriminadamente a los retiros sin atención.
      c) **Completado (Atención Médica Efectiva)**: Todo paciente con atención completada, finalizada o comenzada/en curso. Queda estrictamente prohibido degradar un paciente con estado `Completa`, `Completado`, `Comenzada`, `Atendida` o en curso a alta administrativa simplemente porque el nombre del médico figure no registrado nominalmente. Todo paciente que ingresó a box y no registra cancelación administrativa ni retiro voluntario es considerado atención clínica efectiva.
    - **Orden y Nomenclatura en la Interfaz (UI)**: Toda tarjeta, input o matriz de auditoría debe presentar los 4 campos en el orden idéntico a Rayen: 1. Total Pacientes (Admitidos), 2. Completados (Atención Médica), 3. Egreso Administrativo, 4. Alta sin Atención Médica, evitando cualquier confusión al ingresar o corroborar datos.
12. **Evaluación de Rendimiento de Equipos de Guardia (Flujo de Admisión y Triage)**:
    - El módulo de Rendimiento de Turnos y los análisis comparativos de guardia deben enfocar su evaluación exclusivamente en el desempeño operativo de los Equipos de Guardia (Turnos 1, 2, 3 y 4) en el flujo de admisión y categorización clínica (Triage), suprimiendo métricas de médicos activos o atenciones por médico para evitar sesgos diagnósticos individuales.
    - Los 3 KPIs canónicos de equipo son obligatorios: 1) Volumen Total Ingresado, 2) Latencia Promedio a Triage (con delta invertido de rapidez) y 3) Criterio de Alta Complejidad % (C1+C2+C3).
    - La correlación de sobrecarga se evalúa mediante ComposedChart con doble eje Y (Volumen en Eje Y Izquierdo e/y Latencia en minutos por categoría en Eje Y Derecho).
13. **Norma Oficial de Despacho de Informes por Correo y 7 Reportes PDF Adjuntos**:
    - Todo despacho de informe asistencial por correo electrónico debe generarse utilizando estrictamente el motor **React Email** (`@react-email/components` y `@react-email/render`) con diseño inline seguro, fondo oscuro institucional (`#0f172a`), logotipo oficial en pill blanco (`cid:logo_sar`) y compatibilidad garantizada en clientes de escritorio y móviles.
    - **Grilla de Demanda Fidedigna a MÉTRICO**: Las tarjetas superiores de demanda deben reflejar sin excepción la estructura canónica de "PERÍODO SELECCIONADO" para los 4 indicadores clave: 1) Pacientes Admitidos, 2) Pacientes Atendidos, 3) Altas Administrativas, y 4) Traslados Hospitalarios. Cada tarjeta debe incluir obligatoriamente:
      a) Badge pill con el porcentaje de variación interanual (`% YoY`) respecto a 2025.
      b) Desglose inferior con el volumen del período actual (cantidad de pacientes).
      c) Desglose inferior con el volumen del año anterior (2025).
    - **Generación y Adjunto Automático Obligatorio de los 7 Reportes Oficiales en PDF**:
      Al cerrar y despachar el informe del turno terminado, el sistema debe generar de forma autónoma en memoria con `pdf-lib` y adjuntar directamente al correo los **7 reportes ejecutivos oficiales en formato Hoja Carta / PDF**:
      1. *Reporte General Ejecutivo Asistencial* (Demanda, KPIs y Triage C1-C5)
      2. *Subreporte Oficial de Altas Administrativas* (Egresos y deserciones de atención)
      3. *Subreporte de Traumatología & Sospecha de Fractura* (Lesiones óseas, yesos y destino)
      4. *Subreporte de Gestión de Enfermería & Triage* (Latencia Manchester y tiempos de categorización)
      5. *Subreporte Oficial de Constataciones de Lesiones Z51.8* (Auditoría médico-legal y DAU)
      6. *Subreporte de Traslados Hospitalarios a Urgencia UEH* (Derivaciones hospitalarias de red)
      7. *Subreporte de Vigilancia Epidemiológica Respiratoria* (IRA, bronquitis y Campaña de Invierno)
      Queda prohibido requerir descargas manuales para estos 7 informes en el flujo de despacho del turno cerrado.

---

## 🚀 Protocolo Oficial y Obligatorio de Despliegue ante Cualquier Cambio, Modificación o Nueva Función:
Al pedir cualquier cambio, modificación o agregar una nueva función, el proceso para realizar el despliegue es estrictamente el siguiente:

1. **Subir la versión a GitHub**:
   - Validar y compilar la aplicación sin fallos (`npm run build`).
   - Sincronizar en Git con mensaje semántico (`git add`, `git commit` y `git push origin main`).

2. **De GitHub, subirlo al Muro de Actualizaciones**:
   - Registrar la nueva versión y sus detalles técnicos en el historial de arquitectura / muro de versiones (`src/components/dashboard/InformeArquitectura.jsx`).

3. **Dentro del mismo sitio, dejarlo en el Apartado de Novedades**:
   - Registrar la actualización explicativa para los usuarios clínicos y administrativos en el Muro de Novedades e Instructivos (`src/components/dashboard/ModalMuroActualizaciones.jsx`), detallando su propósito, qué pueden ver, ejemplo de uso y lista de cambios.

4. **Con eso, actualizar la versión del sitio bajo el apartado de "MÉTRICO Clínico Predictivo"**:
   - La insignia oficial visible en la barra lateral directamente bajo el título "MÉTRICO Clínico Predictivo" (`CURRENT_APP_VERSION` en `Dashboard.jsx`) se actualiza automáticamente con la versión registrada.
   - Ejecutar el comando de despliegue a Firebase Hosting (`npx --yes firebase-tools deploy --only hosting`) y confirmar su disponibilidad pública en `https://metrico-dashboard-2026.web.app`.

### ⚖️ Norma de Parámetros y Reglas del Sitio y del Agente:
Si cualquier modificación o nueva función genera algún cambio o un nuevo parámetro dentro de las reglas del sitio:
- **En el Sitio**: Se debe dejar estipulado obligatoriamente en las secciones correspondientes del Consolidado Maestro de `src/components/dashboard/InformeArquitectura.jsx` (**Fórmulas y Análisis**, **Horarios de Turno**, **Manual de Identidad Visual** o **Catálogo de Reportes**), manteniendo la documentación viva 100% acumulativa.
- **En el Agente**: Se debe dejar estipulado obligatoriamente en este archivo de reglas (`.agents/AGENTS.md`) para que opere como norma activa, inviolable y vinculante para todos los agentes y sesiones futuras.
