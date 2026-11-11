# Qué falta para completar cada fase

Documento de trabajo. Se actualiza al avanzar. No se simula ninguna conexión que no esté implementada.

## Fase 2 · Base de datos y catálogo oficial
- **Proyecto Supabase** (URL y claves `anon`/`service_role`) o confirmación de qué proyecto existente usar.
- **Catálogo oficial de especialidades del cuerpo de Maestros** y la **norma de titulaciones y habilitaciones por
  especialidad**. La página oficial enlaza el PDF «Especialitats i títols – Mestres»
  (`/documents/162909733/385996074/2024-25_(1)_MESTRES_ESPECIALITATS+I+TÍTOLS.pdf`, 17 págs.), candidato a fuente del
  catálogo; falta extraerlo y validarlo. El catálogo actual de `src/data/especialidades.ts` es provisional.
- Códigos de Maestros vistos en el listado real (no sustituyen al catálogo oficial): 121 Lengua extranjera: Inglés ·
  123 Educación Física · 126 Audición y Lenguaje · 127 Pedagogía Terapéutica · 128 Educación Primaria · 151 Educación
  Especial: AL · 152 Educación Especial: PT · 153 FPA Primaria.
- Catálogo de municipios (por ejemplo, el nomenclátor oficial) para sustituir el campo de texto libre.

## Fase 3 · Conexión con la Conselleria (hecha para el listado provisional)
- Implementado: detección del enlace «Llocs provisionals oferits», descarga con reintentos y conservación del último listado válido.
- **Pendiente:** los documentos de adjudicación (se publican en
  <https://ceice.gva.es/ca/web/rrhh-educacion/adjudicaciones-de-puestos-de-dificil-cobertura>). Hace falta un PDF de
  ejemplo para diseñar su extractor y poder marcar como adjudicadas las plazas ya cubiertas.
- **Comprobar con el primer jueves real:** que el workflow de GitHub Actions llega a `ceice.gva.es` (la web ha dado
  errores de tiempo de espera y podría bloquear IP de GitHub). Si fallara, el estado queda registrado en `status.json`.
- **Publicación:** los datos se sirven como ficheros estáticos junto a la web; hay que desplegar la aplicación
  (p. ej. Vercel conectado a este repositorio) para que cada commit de datos se publique automáticamente.

## Fase 4 · Extracción de documentos (hecha para el listado provisional)
- Implementado y probado con el PDF real del 05/11/2026: 58 puestos (verificados contra `pdftotext`).
- Columnas reales del listado: Localidad-Centro, Lloc, Horas, Itinerante (SI/NO), Tipus/Tipo, Requisito,
  Composición, Observaciones. No existe una columna «IT/COM» como tal: se guardan `Itinerante` y `Composición` por separado.
- **Pendiente:** un PDF de **adjudicación** y otro **definitivo**, para su extractor.
- **Pendiente:** documentación oficial que defina las abreviaturas de **Requisito** (p. ej. `ING-B2.`),
  **Composición** (p. ej. `TEC+MAT+FQ`) y **Observaciones**. Se muestran literalmente; no se interpretan. Las
  columnas TIPO (`Vacante`, `Sust. Det.`, `Sust. Ind.`) están normalizadas solo para esos tres valores exactos.

## Fase 5 · Motor de compatibilidad
- Normativa vigente y anexos de la convocatoria que fijan los requisitos de acceso (bolsas, titulación, lengua).

## Fase 6 · Geolocalización
- Proveedor de geocodificación y rutas por carretera (p. ej. OpenRouteService, Mapbox, Google) y su **clave de API**.
  Si no hay ruta disponible, se mostrará "distancia no disponible"; nunca se sustituirá por distancia en línea recta.

## Fase 7 · Actualización semanal
- Despliegue de Edge Functions y programación de cron en Supabase (jueves con reintentos y comprobación del viernes).

## Fase 8 · Histórico, favoritos, exportación
- Dependen de que existan plazas reales almacenadas (Fases 2 a 4).
