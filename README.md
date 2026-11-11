# DCCV · Buscador de difícil cobertura

Aplicación web para docentes del cuerpo de Maestros de la Comunitat Valenciana. Su objetivo es convertir las
convocatorias de difícil cobertura de la Conselleria en un buscador personalizado: detectar publicaciones nuevas,
interpretar los listados y mostrar solo las plazas que encajan con el perfil de cada usuario.

> La convocatoria oficial de la Generalitat Valenciana es siempre la fuente de referencia y prevalece sobre
> cualquier interpretación de esta aplicación.

Fuente oficial: <https://ceice.gva.es/va/web/rrhh-educacion/convocatoria-y-peticion-telematica6>

## Estado

| Fase | Contenido | Estado |
|------|-----------|--------|
| 1 | Interfaz y perfil de usuario (localStorage) | ✅ Implementada |
| 2 | Base de datos y catálogo oficial de especialidades | ⏳ Pendiente |
| 3 | Conexión con la página de la Conselleria | ✅ Listado provisional (jueves) |
| 4 | Descarga y extracción de documentos | ✅ Listado provisional · ⏳ adjudicaciones |
| 5 | Motor de compatibilidad normativa | ⏳ Pendiente |
| 6 | Geolocalización y distancias por carretera | ⏳ Pendiente |
| 7 | Actualización automática semanal | ✅ GitHub Actions (jueves y viernes) |
| 8 | Histórico, favoritos y exportación | ⏳ Pendiente |

Mientras una fase no esté implementada, la interfaz lo indica y **no muestra datos simulados**.
Lo que falta para cada fase (credenciales, servicios, catálogos oficiales) está en [`docs/PENDIENTES.md`](docs/PENDIENTES.md).

## Cómo se actualizan los datos

Cada jueves la Conselleria publica el PDF «Llocs provisionals oferits» (`AAMMDD_pue_prov.pdf`). El flujo
[`actualizar-convocatorias.yml`](.github/workflows/actualizar-convocatorias.yml) lo comprueba varias veces el
jueves y el viernes por la mañana:

1. Descarga la página oficial (con reintentos) y localiza el enlace del PDF.
2. Calcula su huella SHA-256: si ya está procesado, no hace nada (idempotente).
3. Extrae los puestos con [`scripts/dccv/parser.py`](scripts/dccv/parser.py) conservando los valores originales.
4. Guarda el resultado en `public/data/` (`index.json`, `status.json`, `convocatorias/*.json`) y hace commit.
5. Si algo falla, **no se publica nada parcial**: se conserva el último listado válido y `status.json` registra el
   error, que la aplicación muestra al usuario.

Ejecución manual: `pip install -r scripts/requirements.txt && python scripts/update_convocatorias.py`.
Pruebas del extractor: `python -m pytest scripts/tests`.

## Stack

React 18 · Vite · TypeScript · Tailwind CSS · Lucide React. Backend previsto: Supabase (PostgreSQL + Edge Functions).

## Desarrollo

```bash
npm install
npm run dev        # servidor de desarrollo
npm run typecheck  # comprobación de tipos
npm test           # pruebas (Vitest)
npm run build      # build de producción en dist/
```

## Privacidad

El perfil se guarda únicamente en `localStorage` del dispositivo (clave `dccv.perfil.v1`). La aplicación no pide ni
almacena DNI, credenciales ni datos de acceso a la Generalitat.

## Identidad visual

Azul oscuro `#1F2A44` · Amarillo `#FFD54F` · Turquesa `#2EC4B6` · Blanco `#FFFFFF`.
