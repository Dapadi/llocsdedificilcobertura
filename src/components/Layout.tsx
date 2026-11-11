import { History, Home, Star, UserRound, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type Vista = 'inicio' | 'perfil' | 'favoritos' | 'historico';

const ENLACES: { vista: Vista; etiqueta: string; icono: LucideIcon }[] = [
  { vista: 'inicio', etiqueta: 'Inicio', icono: Home },
  { vista: 'perfil', etiqueta: 'Mi perfil', icono: UserRound },
  { vista: 'favoritos', etiqueta: 'Favoritos', icono: Star },
  { vista: 'historico', etiqueta: 'Histórico', icono: History },
];

interface Props {
  vista: Vista;
  onNavegar: (v: Vista) => void;
  children: ReactNode;
}

export function Layout({ vista, onNavegar, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-dccv-yellow focus:px-3 focus:py-2">
        Saltar al contenido
      </a>
      <header className="bg-dccv-navy text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-2xl font-extrabold tracking-tight">
              DCC<span className="text-dccv-yellow">V</span>
            </p>
            <p className="text-sm text-white/80">Buscador de difícil cobertura</p>
          </div>
          <p className="text-xs text-white/70">Comunitat Valenciana · Cuerpo de Maestros</p>
        </div>
        <nav aria-label="Principal" className="mx-auto max-w-5xl px-2">
          <ul className="flex gap-1 overflow-x-auto">
            {ENLACES.map(({ vista: v, etiqueta, icono: Icono }) => {
              const activo = v === vista;
              return (
                <li key={v}>
                  <button
                    type="button"
                    onClick={() => onNavegar(v)}
                    aria-current={activo ? 'page' : undefined}
                    className={`flex items-center gap-2 whitespace-nowrap border-b-4 px-3 py-2 text-sm font-medium ${
                      activo ? 'border-dccv-yellow text-white' : 'border-transparent text-white/70 hover:text-white'
                    }`}
                  >
                    <Icono className="h-4 w-4" aria-hidden="true" />
                    {etiqueta}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <p className="mx-auto max-w-5xl px-4 py-4 text-xs text-slate-500">
          La convocatoria oficial de la Generalitat Valenciana es siempre la fuente de referencia y prevalece sobre
          cualquier interpretación de esta aplicación. No introduzcas DNI ni credenciales de la Generalitat: DCCV no
          las necesita.
        </p>
      </footer>
    </div>
  );
}
