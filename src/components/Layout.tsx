import { Ellipsis, MapPin, Star, UserRound, type LucideIcon } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { AvisosApp } from './AvisosApp';

const ENLACES: { to: string; etiqueta: string; icono: LucideIcon; end?: boolean }[] = [
  { to: '/', etiqueta: 'Plazas', icono: MapPin, end: true },
  { to: '/favoritos', etiqueta: 'Favoritos', icono: Star },
  { to: '/perfil', etiqueta: 'Mi perfil', icono: UserRound },
  { to: '/mas', etiqueta: 'Más', icono: Ellipsis },
];

/**
 * Marco de la aplicación. En móvil: contenido a pantalla completa y barra de pestañas inferior
 * translúcida (con zona segura de iOS). En escritorio: barra superior con las mismas secciones.
 */
export function Layout() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-dccv-yellow focus:px-3 focus:py-2 focus:text-dccv-navy">
        Saltar al contenido
      </a>
      <AvisosApp />

      <header className="hidden bg-dccv-navy text-white md:block">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <p className="text-2xl font-extrabold leading-none tracking-tight">
            DCC<span className="text-dccv-yellow">V</span>
          </p>
          <nav aria-label="Principal">
            <ul className="flex gap-1">
              {ENLACES.map(({ to, etiqueta, icono: Icono, end }) => (
                <li key={to}>
                  <NavLink to={to} end={end} className={({ isActive }) => `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white'}`}>
                    <Icono className="h-4 w-4" aria-hidden="true" />
                    {etiqueta}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="contenido" className="mx-auto w-full max-w-3xl flex-1 px-4 pb-32 md:pb-10 md:pt-4">
        <Outlet />
      </main>

      <nav aria-label="Principal (móvil)" className="fixed inset-x-0 bottom-0 z-40 border-t border-line/60 bg-surface/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-4">
          {ENLACES.map(({ to, etiqueta, icono: Icono, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={({ isActive }) => `flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${isActive ? 'text-link' : 'text-subtle'}`}>
                {({ isActive }) => (
                  <>
                    <Icono className={`h-[26px] w-[26px] transition-transform ${isActive ? 'scale-105 fill-current/20 stroke-[2.4]' : ''}`} aria-hidden="true" />
                    <span className={isActive ? 'font-semibold' : ''}>{etiqueta}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
