# Qué falta para completar cada fase

Documento de trabajo. Se actualiza al avanzar. No se simula ninguna conexión que no esté implementada.

## Fase 2 · Base de datos y catálogo oficial
- **Proyecto Supabase** (URL y claves `anon`/`service_role`) o confirmación de qué proyecto existente usar.
- **Catálogo oficial de especialidades del cuerpo de Maestros** con códigos y denominaciones, y la **norma que
  establece las titulaciones y habilitaciones por especialidad**. El catálogo actual de `src/data/especialidades.ts`
  es provisional (solo 121 y 128, tomados de la especificación) y está marcado como no verificado.
- Catálogo de municipios (por ejemplo, el nomenclátor oficial) para sustituir el campo de texto libre.

## Fase 3 · Conexión con la Conselleria
- **Acceso de red:** en la sesión de desarrollo en la nube, el host `ceice.gva.es` está bloqueado por la política de
  red (el túnel devuelve 403), por lo que no se ha podido consultar la página ni comprobar su estructura real.
  Hay que permitir ese host (y el de descarga de documentos, si es otro) o desarrollar esta fase desde una máquina con acceso.
- La web ha mostrado errores de tiempo de espera: el descargador debe tener reintentos, conservar la última
  convocatoria válida y marcar como desactualizado cualquier listado antiguo.

## Fase 4 · Extracción de documentos
- **Documentos reales de ejemplo** (PDF/XLSX de un listado provisional, uno definitivo y uno de adjudicación) para
  diseñar y probar el extractor. Sin ellos no se puede validar la extracción de columnas.
- **Documentación oficial que defina las abreviaturas** de las columnas TIPO e IT/COM para construir el diccionario
  de códigos. No se inventarán significados.

## Fase 5 · Motor de compatibilidad
- Normativa vigente y anexos de la convocatoria que fijan los requisitos de acceso (bolsas, titulación, lengua).

## Fase 6 · Geolocalización
- Proveedor de geocodificación y rutas por carretera (p. ej. OpenRouteService, Mapbox, Google) y su **clave de API**.
  Si no hay ruta disponible, se mostrará "distancia no disponible"; nunca se sustituirá por distancia en línea recta.

## Fase 7 · Actualización semanal
- Despliegue de Edge Functions y programación de cron en Supabase (jueves con reintentos y comprobación del viernes).

## Fase 8 · Histórico, favoritos, exportación
- Dependen de que existan plazas reales almacenadas (Fases 2 a 4).
