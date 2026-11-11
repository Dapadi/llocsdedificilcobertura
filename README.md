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
| 3 | Conexión con la página de la Conselleria | ⏳ Pendiente |
| 4 | Descarga y extracción de documentos | ⏳ Pendiente |
| 5 | Motor de compatibilidad normativa | ⏳ Pendiente |
| 6 | Geolocalización y distancias por carretera | ⏳ Pendiente |
| 7 | Actualización automática semanal | ⏳ Pendiente |
| 8 | Histórico, favoritos y exportación | ⏳ Pendiente |

Mientras una fase no esté implementada, la interfaz lo indica y **no muestra datos simulados**.
Lo que falta para cada fase (credenciales, servicios, catálogos oficiales) está en [`docs/PENDIENTES.md`](docs/PENDIENTES.md).

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
