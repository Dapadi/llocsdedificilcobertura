import { Star } from 'lucide-react';
import type { Evaluacion } from '../lib/compatibilidad';
import type { Puesto } from '../lib/convocatorias';
import { aFrase, aTitulo } from '../lib/texto';
import { haptica } from '../ui/haptica';

/** Palabra sencilla para el tipo de puesto (el texto literal del listado se ve en el detalle). */
export function tipoSencillo(p: Puesto): { texto: string; clase: string } {
  if (p.tipo === 'vacante') return { texto: 'Vacante', clase: 'bg-dccv-teal/20 text-ink' };
  if (p.tipo) return { texto: 'Sustitución', clase: 'bg-dccv-yellow/40 text-ink' };
  return { texto: p.tipo_original ?? 'Sin tipo', clase: 'bg-line text-muted' };
}

export function PlazaCard({ puesto: p, evaluacion: ev, favorita, onAbrir, onFavorito, indice }: { puesto: Puesto; evaluacion: Evaluacion; favorita: boolean; onAbrir: () => void; onFavorito: () => void; indice: number }) {
  const tipo = tipoSencillo(p);
  const coincide = ev.estado !== 'no-compatible';
  return (
    <li className="anim-in" style={{ animationDelay: `${Math.min(indice, 8) * 40}ms` }}>
      <div className="group-list !divide-y-0 relative">
        <button type="button" onClick={onAbrir} className="row !items-start !py-4 pr-14" aria-label={`${aTitulo(p.centro) || 'Centro'}, ${aTitulo(p.municipio)}. Ver detalle`}>
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-semibold leading-tight">{aTitulo(p.centro) || 'Centro no identificado'}</span>
            <span className="mt-0.5 block text-[15px] text-muted">{aTitulo(p.municipio) || '—'} · {aTitulo(p.provincia) || '—'}</span>
            <span className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className={`badge ${tipo.clase}`}>{tipo.texto}</span>
              <span className="badge bg-line text-muted">{p.especialidad_codigo} · {aFrase(p.especialidad_nombre)}</span>
              {p.horas_original && <span className="badge bg-line text-muted">{p.horas_original} h</span>}
            </span>
            {coincide && <span className="mt-2 block text-[13px] font-medium text-link">Coincide con tu especialidad</span>}
          </span>
        </button>
        <button
          type="button"
          onClick={() => { haptica(); onFavorito(); }}
          aria-pressed={favorita}
          aria-label={favorita ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-subtle transition active:scale-90"
        >
          <Star className={`h-6 w-6 transition ${favorita ? 'fill-dccv-yellow stroke-dccv-yellow' : ''}`} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
