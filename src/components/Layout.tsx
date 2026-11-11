import { History, Home, Star, UserRound, type LucideIcon } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { AvisosApp } from './AvisosApp';

const ENLACES: { to: string; etiqueta: string; icono: LucideIcon; end?: boolean }[] = [
  { to: '/', etiqueta: 'Inicio', icono: Home, end: true },
  { to: '/perfil', etiqueta: 'Mi perfil', icono: UserRound },
  { to: '/favoritos', etiqueta: 'Favoritos', icono: Star },
  { to: '/historico', etiqueta: 'Histórico', icono: History },
];

/** Cabecera + navegación superior en escritorio; barra de pestañas inferior en móvil (con zona segura de iOS). */
export function Layout() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-dccv-yellow focus:px-3 focus:py-2">
        Saltar al contenido
      </a>
      <AvisosApp />
      <header className="bg-dccv-navy pt-[env(safe-area-inset-top)] text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-2xl font-extrabold leading-none tracking-tight">
              DCC<span className="text-dccv-yellow">V</span>
            </p>
            <p className="mt-1 text-xs text-white/80">Buscador de difícil cobertura</p>
          </div>
          <nav aria-label="Principal" className="hidden md:block">
            <ul className="flex gap-1">
              {ENLACES.map(({ to, etiqueta, icono: Icono, end }) => (
                <li key={to}>
                  <NavLink to={to} end={end} className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white'}`}>
                    <Icono className="h-4 w-4" aria-hidden="true" />
                    {etiqueta}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-28 md:pb-8">
        <Outlet />
      </main>

      <footer className="hidden border-t border-slate-200 bg-white md:block">
        <p className="mx-auto max-w-5xl px-4 py-4 text-xs text-slate-500">
          DCCV no es una aplicación oficial de la Generalitat Valenciana. La convocatoria oficial es siempre la fuente de
          referencia y prevalece sobre cualquier interpretación de esta aplicación. No introduzcas DNI ni credenciales de la
          Generalitat: DCCV no las necesita.
        </p>
      </footer>

      <nav aria-label="Principal (móvil)" className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-4">
          {ENLACES.map(({ to, etiqueta, icono: Icono, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${isActive ? 'text-dccv-navy' : 'text-slate-500'}`}>
                {({ isActive }) => (
                  <>
                    <Icono className={`h-6 w-6 ${isActive ? 'stroke-[2.5]' : ''}`} aria-hidden="true" />
                    {etiqueta}
                    <span className={`mt-0.5 h-1 w-6 rounded-full ${isActive ? 'bg-dccv-yellow' : 'bg-transparent'}`} aria-hidden="true" />
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
