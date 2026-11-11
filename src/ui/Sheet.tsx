import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  children: ReactNode;
  /** Botón de acción fijo en la parte inferior (por ejemplo, «Hecho»). */
  pie?: ReactNode;
}

/** Hoja modal que sube desde abajo (como en iOS). En pantallas anchas se muestra centrada. */
export function Sheet({ abierto, onCerrar, titulo, children, pie }: Props) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const previo = useRef<Element | null>(null);

  useEffect(() => {
    if (!abierto) return;
    previo.current = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
      // Trampa de foco sencilla: el tabulador se queda dentro de la hoja.
      if (e.key === 'Tab' && panel.current) {
        const foco = panel.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (foco.length === 0) return;
        const primero = foco[0];
        const ultimo = foco[foco.length - 1];
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    };
    window.addEventListener('keydown', alTeclear);
    return () => {
      window.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = overflow;
      (previo.current as HTMLElement | null)?.focus?.();
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div className="anim-fade absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={onCerrar} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
        className="anim-sheet relative flex max-h-[92dvh] w-full max-w-xl flex-col rounded-t-[28px] bg-canvas shadow-2xl outline-none md:rounded-[28px]"
      >
        <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-line-strong md:hidden" aria-hidden="true" />
        <header className="flex shrink-0 items-center justify-between gap-3 px-5 pb-2 pt-3">
          <h2 id={id} className="text-[20px] font-bold tracking-tight">{titulo}</h2>
          <button type="button" onClick={onCerrar} className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/10 text-muted active:scale-95" aria-label="Cerrar">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4">{children}</div>
        {pie && <footer className="shrink-0 border-t border-line/70 bg-canvas/90 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">{pie}</footer>}
      </div>
    </div>,
    document.body,
  );
}
