import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Página con título grande estilo iOS: al hacer scroll, el título se encoge en una barra
 * translúcida superior. Respeta la zona segura (barra de estado) en modo aplicación.
 */
export function PaginaGrande({ titulo, subtitulo, accion, children }: { titulo: string; subtitulo?: string; accion?: ReactNode; children: ReactNode }) {
  const gran = useRef<HTMLHeadingElement>(null);
  const [compacto, setCompacto] = useState(false);

  useEffect(() => {
    const el = gran.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setCompacto(!e.isIntersecting), { rootMargin: '-60px 0px 0px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div>
      <div className={`sticky top-0 z-30 -mx-4 mb-[-48px] flex h-[calc(48px+env(safe-area-inset-top))] items-end justify-center px-4 pb-2 pt-[env(safe-area-inset-top)] transition-all duration-200 md:hidden ${compacto ? 'border-b border-line/60 bg-canvas/80 backdrop-blur-xl' : 'border-b border-transparent'}`} aria-hidden={!compacto}>
        <span className={`text-[17px] font-semibold transition-opacity duration-200 ${compacto ? 'opacity-100' : 'opacity-0'}`}>{titulo}</span>
      </div>
      <div className="flex items-end justify-between gap-3 pt-[calc(env(safe-area-inset-top)+56px)] md:pt-2">
        <div>
          <h1 ref={gran} className="text-[34px] font-bold leading-tight tracking-tight">{titulo}</h1>
          {subtitulo && <p className="text-[15px] text-muted">{subtitulo}</p>}
        </div>
        {accion}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}
