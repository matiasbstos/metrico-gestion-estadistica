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
   - Los pacientes admitidos y egresados deben resolverse por el timestamp exacto de admisión y atención dentro de la ventana horaria calculada, garantizando exactitud matemática.
10. **Garantía de Alto Contraste, Visibilidad y Accesibilidad UI**:
    - Queda estrictamente prohibido el renderizado de botones activos, pestañas o subpestañas con estilos transparentes, fondos blancos sobre fondos claros o texto ilegible (blanco sobre blanco).
    - Todo selector o elemento de navegación activo debe utilizar estilos sólidos contrastantes institucionales (como `.bg-primary-custom`, o `bg-indigo-600 text-white font-black shadow-md`), asegurando visibilidad óptima tanto en modo Claro como en modo Oscuro.

---

## 🚀 Secuencia Obligatoria de 4 Pasos antes de Finalizar:
1. **Consolidado Continuo & Informe de Arquitectura**: 
   - Registrar la nueva versión y sus detalles técnicos en la Línea de Timeline de `src/components/dashboard/InformeArquitectura.jsx`.
   - **Mantenimiento del Consolidado Continuo**: En caso de modificar o agregar variables, algoritmos, reglas de desduplicación, esquemas de turno, estilos o reportes, se DEBEN actualizar y enriquecer obligatoriamente las secciones correspondientes del Consolidado Maestro (**Fórmulas y Análisis**, **Horarios de Turno**, **Manual de Identidad Visual** y **Catálogo de Reportes**), manteniendo la documentación viva 100% acumulativa y retroalimentada.
2. **Muro de Novedades del Sitio**: Registrar la actualización explicativa para los usuarios en `src/components/dashboard/ModalMuroActualizaciones.jsx`.
3. **Control de Versiones GitHub**: Compilar la aplicación (`npm run build`), realizar `git add`, `git commit` con mensaje semántico y `git push origin main`.
4. **Despliegue a Producción Firebase**: Ejecutar el comando de despliegue a Firebase Hosting (`npx --yes firebase-tools deploy --only hosting`) y confirmar su disponibilidad pública en `https://metrico-dashboard-2026.web.app`.
