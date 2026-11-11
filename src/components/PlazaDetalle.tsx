import { ExternalLink, Share2, Star } from 'lucide-react';
import type { Evaluacion } from '../lib/compatibilidad';
import { ETIQUETA_TIPO, type Convocatoria, type Puesto } from '../lib/convocatorias';
import { aFrase, aTitulo } from '../lib/texto';
import { Fila, Grupo } from '../ui/controles';
import { Sheet } from '../ui/Sheet';

interface Props {
  puesto: Puesto | null;
  evaluacion: Evaluacion | null;
  convocatoria: Convocatoria;
  favorita: boolean;
  onFavorito: () => void;
  onCerrar: () => void;
}

const MENSAJE_ESTADO = {
  revision: { titulo: 'Coincide con tu especialidad', texto: 'Antes de pedirla, comprueba en el documento oficial que cumples los requisitos (titulación, bolsas e idiomas).', clase: 'bg-dccv-yellow/30' },
  compatible: { titulo: 'Cumples los requisitos', texto: 'Según los datos que nos has dado.', clase: 'bg-dccv-teal/20' },
  'no-compatible': { titulo: 'No coincide con tu perfil', texto: 'Es de una especialidad que no has marcado.', clase: 'bg-line' },
} as const;

export function PlazaDetalle({ puesto: p, evaluacion: ev, convocatoria, favorita, onFavorito, onCerrar }: Props) {
  const url = p ? `${convocatoria.documento.url}#page=${p.pagina}` : '';
  const compartir = async () => {
    if (!p || !navigator.share) return;
    try {
      await navigator.share({ title: `${aTitulo(p.centro)} · ${aTitulo(p.municipio)}`, text: `Plaza de difícil cobertura en ${aTitulo(p.municipio)}: ${aFrase(p.especialidad_nombre)}`, url });
    } catch {
      /* el usuario canceló */
    }
  };

  return (
    <Sheet
      abierto={p !== null}
      onCerrar={onCerrar}
      titulo={aTitulo(p?.centro) || 'Plaza'}
      pie={
        p && (
          <div className="grid gap-2.5">
            <a className="btn-primary w-full" href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-5 w-5" aria-hidden="true" /> Abrir el documento oficial
            </a>
            <div className="grid grid-cols-2 gap-2.5">
              <button type="button" className="btn-secondary" onClick={onFavorito} aria-pressed={favorita}>
                <Star className={`h-5 w-5 ${favorita ? 'fill-dccv-yellow stroke-dccv-yellow' : ''}`} aria-hidden="true" />
                {favorita ? 'Guardada' : 'Guardar'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => void compartir()} disabled={typeof navigator === 'undefined' || !('share' in navigator)}>
                <Share2 className="h-5 w-5" aria-hidden="true" /> Compartir
              </button>
            </div>
          </div>
        )
      }
    >
      {p && ev && (
        <div className="pt-1">
          <p className="-mt-1 mb-4 text-[15px] text-muted">{aTitulo(p.municipio)} · {aTitulo(p.provincia)}</p>

          <div className={`mb-6 rounded-ios p-4 ${MENSAJE_ESTADO[ev.estado].clase}`}>
            <p className="text-[17px] font-semibold">{MENSAJE_ESTADO[ev.estado].titulo}</p>
            <p className="mt-1 text-[15px] text-muted">{MENSAJE_ESTADO[ev.estado].texto}</p>
          </div>

          <Grupo titulo="La plaza">
            <Fila etiqueta="Especialidad" valor={`${p.especialidad_codigo} · ${aFrase(p.especialidad_nombre)}`} />
            <Fila etiqueta="Tipo" detalle={p.tipo_original ? `En el listado: «${p.tipo_original}»` : undefined} valor={p.tipo ? ETIQUETA_TIPO[p.tipo] : '—'} />
            <Fila etiqueta="Horas" valor={p.horas_original ?? '—'} />
            <Fila etiqueta="Itinerante" detalle="Tal y como figura en el listado" valor={p.itinerante_original === 'SI' ? 'Sí' : p.itinerante_original === 'NO' ? 'No' : '—'} />
            <Fila etiqueta="Distancia" detalle="Por carretera" valor="Aún no disponible" />
            {p.requisito && <Fila etiqueta="Requisito" detalle="Tal y como figura en el listado" valor={p.requisito} />}
            {p.composicion && <Fila etiqueta="Composición" detalle="Tal y como figura en el listado" valor={p.composicion} />}
            {p.observaciones && <Fila etiqueta="Observaciones" valor={<span className="max-w-[55%] text-right">{p.observaciones}</span>} />}
          </Grupo>

          <Grupo titulo="Por qué te la mostramos">
            {ev.motivos.map((m) => (
              <Fila key={m} etiqueta={<span className="text-[15px]">{m}</span>} />
            ))}
          </Grupo>

          <Grupo
            titulo="Dónde se pide"
            pie="DCCV no tramita solicitudes. La petición se hace siempre en la web oficial de la Conselleria."
          >
            <Fila etiqueta="Web oficial de la Conselleria" href={convocatoria.documento.url_pagina} />
          </Grupo>

          <p className="mb-2 px-1 text-center text-[12px] text-subtle">
            Puesto {p.id} · {convocatoria.documento.nombre_archivo} · página {p.pagina}
          </p>
        </div>
      )}
    </Sheet>
  );
}
