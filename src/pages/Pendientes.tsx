import { History, Star } from 'lucide-react';
import type { ReactNode } from 'react';

function Pendiente({ icono, titulo, fase, children }: { icono: ReactNode; titulo: string; fase: number; children: ReactNode }) {
  return (
    <section className="card text-center" aria-labelledby="titulo-pendiente">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-dccv-teal/15 text-dccv-navy">{icono}</div>
      <h1 id="titulo-pendiente" className="text-lg font-bold">{titulo}</h1>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">{children}</p>
      <p className="mt-3 inline-block rounded-full bg-dccv-yellow/40 px-3 py-1 text-xs font-semibold">
        Pendiente de implementar · Fase {fase}
      </p>
    </section>
  );
}

export function FavoritosPage() {
  return (
    <Pendiente icono={<Star aria-hidden="true" />} titulo="Favoritos" fase={8}>
      Aquí podrás guardar las plazas que te interesen. Requiere que antes existan plazas reales extraídas de las
      convocatorias.
    </Pendiente>
  );
}

export function HistoricoPage() {
  return (
    <Pendiente icono={<History aria-hidden="true" />} titulo="Histórico de convocatorias" fase={8}>
      Aquí podrás consultar convocatorias anteriores y detectar centros o municipios que repiten oferta. Requiere la
      descarga y extracción automática de documentos.
    </Pendiente>
  );
}
