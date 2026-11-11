import { Check, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { haptica } from './haptica';

/** Interruptor estilo iOS. */
export function Interruptor({ marcado, onCambio, etiqueta }: { marcado: boolean; onCambio: (v: boolean) => void; etiqueta: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={marcado}
      aria-label={etiqueta}
      onClick={() => {
        haptica();
        onCambio(!marcado);
      }}
      className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200 ${marcado ? 'bg-dccv-teal' : 'bg-line-strong'}`}
    >
      <span className={`absolute left-[2px] top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-md transition-transform duration-200 ease-ios ${marcado ? 'translate-x-5' : ''}`} />
    </button>
  );
}

/** Selector segmentado estilo iOS. */
export function Segmentado<T extends string>({
  opciones,
  valor,
  onCambio,
  etiqueta,
}: {
  opciones: { valor: T; etiqueta: string }[];
  valor: T;
  onCambio: (v: T) => void;
  etiqueta: string;
}) {
  return (
    <div role="radiogroup" aria-label={etiqueta} className="flex rounded-[10px] bg-ink/[0.08] p-[2px]">
      {opciones.map((o) => {
        const activo = o.valor === valor;
        return (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => {
              haptica(5);
              onCambio(o.valor);
            }}
            className={`min-h-[32px] flex-1 rounded-[8px] px-2 py-1 text-[14px] font-semibold transition-all duration-200 ${activo ? 'bg-surface text-ink shadow-sm' : 'text-muted'}`}
          >
            {o.etiqueta}
          </button>
        );
      })}
    </div>
  );
}

/** Sección con título y lista agrupada. */
export function Grupo({ titulo, pie, children }: { titulo?: string; pie?: ReactNode; children: ReactNode }) {
  return (
    <section className="mb-7">
      {titulo && <h2 className="section-title">{titulo}</h2>}
      <div className="group-list">{children}</div>
      {pie && <p className="section-foot">{pie}</p>}
    </section>
  );
}

/** Fila de una lista agrupada. Con `onClick` se comporta como botón (con flecha opcional). */
export function Fila({
  etiqueta,
  detalle,
  valor,
  onClick,
  chevron,
  href,
  icono,
  children,
}: {
  etiqueta: ReactNode;
  detalle?: ReactNode;
  valor?: ReactNode;
  onClick?: () => void;
  chevron?: boolean;
  href?: string;
  icono?: ReactNode;
  children?: ReactNode;
}) {
  // Los valores cortos nunca se parten; los largos se reparten en varias líneas por palabras.
  const largo = typeof valor === 'string' && valor.length > 18;
  const contenido = (
    <>
      <span className="flex min-w-0 items-center gap-3">
        {icono && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dccv-teal/15 text-link">{icono}</span>}
        <span className="min-w-0">
          <span className="block text-[17px]">{etiqueta}</span>
          {detalle && <span className="block text-[13px] leading-snug text-subtle">{detalle}</span>}
        </span>
      </span>
      <span className={`ml-auto flex items-center justify-end gap-2 text-right text-[17px] text-muted ${largo ? 'max-w-[62%] [overflow-wrap:break-word]' : 'shrink-0 whitespace-nowrap'}`}>
        {valor}
        {children}
        {(chevron || href) && <ChevronRight className="h-5 w-5" aria-hidden="true" />}
      </span>
    </>
  );
  if (href) return <a className="row" href={href} target="_blank" rel="noopener noreferrer">{contenido}</a>;
  if (onClick) return <button type="button" className="row" onClick={onClick}>{contenido}</button>;
  return <div className="row">{contenido}</div>;
}

/** Fila con marca de verificación (selección única). */
export function FilaOpcion({ etiqueta, detalle, marcada, onClick }: { etiqueta: string; detalle?: string; marcada: boolean; onClick: () => void }) {
  return (
    <button type="button" role="radio" aria-checked={marcada} className="row" onClick={() => { haptica(5); onClick(); }}>
      <span>
        <span className="block text-[17px]">{etiqueta}</span>
        {detalle && <span className="block text-[13px] text-subtle">{detalle}</span>}
      </span>
      {marcada && <Check className="h-5 w-5 text-link" aria-hidden="true" />}
    </button>
  );
}

/** Fila con marca de verificación (selección múltiple). */
export function FilaCheck({ etiqueta, detalle, marcada, onClick }: { etiqueta: ReactNode; detalle?: string; marcada: boolean; onClick: () => void }) {
  return (
    <button type="button" role="checkbox" aria-checked={marcada} className="row" onClick={() => { haptica(5); onClick(); }}>
      <span>
        <span className="block text-[17px]">{etiqueta}</span>
        {detalle && <span className="block text-[13px] text-subtle">{detalle}</span>}
      </span>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${marcada ? 'border-dccv-teal bg-dccv-teal text-dccv-navy' : 'border-line-strong'}`}>
        {marcada && <Check className="h-4 w-4 stroke-[3]" aria-hidden="true" />}
      </span>
    </button>
  );
}
