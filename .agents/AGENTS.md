# Protocolo Obligatorio de Despliegue, Consolidación Continua & Validación de Datos en MÉTRICO

## 📌 Reglas de Consistencia y Auditoría de Datos (SSOT Rayen):
1. **Techo y Límite de Correlativos en Archivo Cargado**:
   - **Correlativo Máximo Cargado en Sistema**: `#26.548` (Fecha de corte: `27/08/2026 a las 22:24 hrs`).
   - **Correlativo Oficial Rayen en Vivo**: `#26.662` (al 29/08/2026).
   - El total acumulado de admisiones (YTD) procesado en MÉTRICO nunca puede superar el correlativo máximo del archivo entregado (`#26.548`) ni el correlativo de control oficial Rayen (`#26.662`).
2. **SSOT en `pacientesDB` y Deduplicación Estricta**: La demanda mensual y global debe priorizar siempre el conteo desduplicado directo de `pacientesDB` (`deduplicarPacientes`) para evitar que turnos precalculados o sincronizaciones superpuestas en Firestore inflen artificialmente los totales.
3. **Integridad de Líneas Base Históricas (2025)**: Las series comparativas de 12 meses deben mantener la continuidad de la línea base histórica SAR si la base de datos local contiene meses incompletos o fragmentos de prueba (< 2.000 pacientes por mes).

---

## 🚀 Secuencia Obligatoria de 4 Pasos antes de Finalizar:
1. **Consolidado Continuo & Informe de Arquitectura**: 
   - Registrar la nueva versión y sus detalles técnicos en la Línea de Tiempo de `src/components/dashboard/InformeArquitectura.jsx`.
   - **Mantenimiento del Consolidado Continuo**: En caso de modificar o agregar variables, algoritmos, reglas de desduplicación, esquemas de turno, estilos o reportes, se DEBEN actualizar y enriquecer obligatoriamente las secciones correspondientes del Consolidado Maestro (**Fórmulas y Análisis**, **Horarios de Turno**, **Manual de Identidad Visual** y **Catálogo de Reportes**), manteniendo la documentación viva 100% acumulativa y retroalimentada.
2. **Muro de Novedades del Sitio**: Registrar la actualización explicativa para los usuarios en `src/components/dashboard/ModalMuroActualizaciones.jsx`.
3. **Control de Versiones GitHub**: Compilar la aplicación (`npm run build`), realizar `git add`, `git commit` con mensaje semántico y `git push origin main`.
4. **Despliegue a Producción Firebase**: Ejecutar el comando de despliegue a Firebase Hosting (`npx --yes firebase-tools deploy --only hosting`) y confirmar su disponibilidad pública en `https://metrico-dashboard-2026.web.app`.
