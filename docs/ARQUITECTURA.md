# Arquitectura de DCCV

Objetivo: una app instalable (PWA) que, sin cambios de código, se pueda empaquetar para Google Play y App Store.
Principio rector: **cimientos primero**. Cada capa se puede probar y sustituir sin tocar las demás.

## Capas

```
Conselleria (PDF) ──► scripts/ (Python)  ──► public/data/*.json ──► app web (React PWA) ──► Capacitor (iOS/Android)
                      extractor + updater      datos estáticos         UI, motor, offline      envoltorio nativo
                      GitHub Actions (jue.)    versionados en git      service worker
```

| Capa | Dónde | Responsabilidad | Notas |
|------|-------|-----------------|-------|
| Ingesta | `scripts/dccv/` | Descargar, extraer y validar el PDF. Nunca publica datos parciales. | Probada con el PDF real |
| Datos | `public/data/` | JSON versionado: `index.json`, `status.json`, `convocatorias/*.json` | Cada plaza lleva documento y página de origen |
| Dominio | `src/lib/` | Perfil, compatibilidad, carga de datos. **Sin React**, fáciles de probar | Aquí vivirá el motor normativo (Fase 5) |
| Estado | `src/app/contexts.tsx`, `src/hooks/` | Perfil (localStorage) y convocatoria (fetch) | Un único punto de acceso |
| UI | `src/pages/`, `src/components/` | Pantallas y componentes | Móvil primero |
| PWA | `vite.config.ts` | Manifiesto, service worker, caché | Ver más abajo |

## PWA: qué hay y por qué

- **Instalable**: manifiesto con iconos normales y *maskable*, `apple-touch-icon`, `display: standalone`, `viewport-fit=cover` y zonas seguras de iOS.
- **Sin conexión**: la aplicación se precachea; los datos (`/data/*`) usan *stale-while-revalidate* (se ve lo último conocido al instante y se refresca en segundo plano).
- **Actualizaciones controladas**: `registerType: 'prompt'`. El usuario decide cuándo actualizar; nunca se recarga a mitad de uso.
- **Enrutado**: React Router con reescritura SPA en `vercel.json`.
- **Cabeceras de seguridad** básicas y `sw.js` sin caché.

## Sistema de diseño

- Tokens semánticos (`canvas`, `surface`, `ink`, `muted`, `line`, `brand`…) definidos como variables CSS en `src/index.css`, con modo oscuro automático. Los componentes no usan colores fijos.
- Clases de componentes reutilizables: `.card`, `.chip`, `.btn-primary`, `.btn-secondary`, `.input`.
- Animaciones de entrada con `prefers-reduced-motion` respetado; objetivos táctiles de al menos 44 px; campos a 16 px para evitar el zoom de iOS.
- La bienvenida (`/bienvenida`) es un asistente de 4 pasos a pantalla completa que deja el perfil guardado.

## Calidad

- `npm run typecheck`, `npm test` (Vitest: lógica y navegación) y `pytest` (extractor) se ejecutan en cada PR (`.github/workflows/ci.yml`).
- Principio de datos: ante un PDF que no se entienda, se **conserva el último listado válido** y se avisa; nunca se inventa.

## Hoja de ruta hacia las tiendas

| Etapa | Contenido | Estado |
|-------|-----------|--------|
| A. Base PWA | Rutas, instalación, offline, avisos, CI | ✅ este PR |
| B. Producto | Motor de compatibilidad (titulación, bolsas, idiomas), distancias por carretera, adjudicaciones | ⏳ |
| C. Experiencia | Asistente de bienvenida, sistema de diseño con modo oscuro, animaciones | ✅ este PR |
| C2. Experiencia | Favoritos, exportar, esqueletos de carga, conmutador manual de tema | ⏳ |
| D. Notificaciones | Aviso de listado nuevo (push). Es lo que da valor nativo ante Apple (guía 4.2) | ⏳ |
| E. Capacitor | Proyectos iOS/Android, iconos y *splash*, compilación en la nube | ⏳ |
| F. Tiendas | Cuentas (Apple 99 $/año, Google 25 $), política de privacidad, fichas, revisión | ⏳ |

## Decisiones abiertas (necesitan al propietario)

1. **Nombre y aviso legal**: DCCV no es oficial; las tiendas son estrictas con apps que parecen de un organismo público.
2. **Notificaciones push**: requieren un servicio de envío (p. ej. FCM/APNs) y un modo de guardar suscripciones sin datos personales.
3. **Cuentas de desarrollador** y acceso a un Mac (o compilación en la nube) para iOS.
4. **Tema manual**: hoy el modo oscuro sigue al sistema; falta decidir si se ofrece un conmutador manual.
