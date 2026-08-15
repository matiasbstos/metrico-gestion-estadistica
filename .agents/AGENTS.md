# Directrices de Desarrollo y Protocolo de Documentación Viva (MÉTRICO)

## 📌 Protocolo Obligatorio: "Documentación Viva y Arquitectura" (Living Documentation)

Cada vez que se realice una actualización, refactorización mayor o despliegue de una nueva versión en la plataforma **MÉTRICO**, el agente tiene la **obligación estricta** de redactar y adjuntar el objeto de datos JSON correspondiente a esa actualización para inyectarlo en el módulo **"Informe de Arquitectura"** ([InformeArquitectura.jsx](file:///c:/Users/Datos%20Gestion%20Sar/Documents/METRICO/metrico-gestion-estadistica/src/components/dashboard/InformeArquitectura.jsx)) y en la colección de Firestore `system_architecture_log`.

### Estructura Obligatoria del Registro:
* `version_tag`: Identificador semántico de versión (ej. `v3.4.5`).
* `fecha_despliegue`: Fecha legible del despliegue en producción.
* `proposito_actualizacion`: Explicación sintética del problema o valor que resuelve la versión.
* `medios_y_stack`: Lista de tecnologías, APIs, motores de compilación o librerías integradas.
* `estructura_datos`: Descripción de reglas de negocio, encasillamientos horarias, colecciones Firestore o consultas BigQuery.
* `modulos_afectados`: Lista de componentes React y vistas impactadas.
* `detalles_tecnicos`: Lista de viñetas con especificaciones técnicas detalladas.

**Regla de Oro:** La documentación vive dentro del repositorio y nunca debe quedar desactualizada.
