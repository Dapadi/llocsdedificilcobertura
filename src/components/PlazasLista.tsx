import { ExternalLink, MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';
import { evaluarPuesto, type EstadoCompatibilidad, type Evaluacion } from '../lib/compatibilidad';
import { ETIQUETA_TIPO, type Convocatoria, type Puesto } from '../lib/convocatorias';
import type { PerfilUsuario } from '../types';

const ESTADO: Record<EstadoCompatibilidad, { texto: string; clase: string }> = {
  compatible: { texto: 'Compatible', clase: 'bg-dccv-teal/20 text-dccv-navy' },
  revision: { texto: 'Revisión necesaria', clase: 'bg-dccv-yellow/50 text-dccv-navy' },
  'no-compatible': { texto: 'No compatible', clase: 'bg-slate-200 text-slate-700' },
};

interface Fila {
  puesto: Puesto;
  evaluacion: Evaluacion;
}

function Preferencia({ ok, etiqueta }: { ok: boolean | null; etiqueta: string }) {
  if (ok === null) return null;
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs ${ok ? 'bg-dccv-teal/15' : 'bg-slate-100 text-slate-600'}`}>
      {etiqueta}: {ok ? 'encaja con tu preferencia' : 'no es lo que prefieres'}
    </span>
  );
}

function Tarjeta({ fila, convocatoria }: { fila: Fila; convocatoria: Convocatoria }) {
  const { puesto: p, evaluacion: ev } = fila;
  const est = ESTADO[ev.estado];
  return (
    <li className="card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-bold">{p.centro ?? 'Centro no identificado'}</h3>
          <p className="flex items-center gap-1 text-sm text-slate-600">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {p.municipio ?? '—'} · {p.provincia ?? '—'}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${est.clase}`}>{est.texto}</span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
        <div><dt className="text-xs text-slate-500">Especialidad</dt><dd className="font-medium">{p.especialidad_codigo} · {p.especialidad_nombre}</dd></div>
        <div><dt className="text-xs text-slate-500">Tipo (según listado)</dt><dd className="font-medium">{p.tipo_original ?? '—'}{p.tipo && ETIQUETA_TIPO[p.tipo] !== p.tipo_original ? ` · ${ETIQUETA_TIPO[p.tipo]}` : ''}</dd></div>
        <div><dt className="text-xs text-slate-500">Horas</dt><dd className="font-medium">{p.horas_original ?? '—'}</dd></div>
        <div><dt className="text-xs text-slate-500">Itinerante (según listado)</dt><dd className="font-medium">{p.itinerante_original ?? '—'}</dd></div>
        <div><dt className="text-xs text-slate-500">Distancia por carretera</dt><dd className="font-medium text-slate-500">No disponible</dd></div>
        {p.requisito && <div><dt className="text-xs text-slate-500">Requisito (según listado)</dt><dd className="font-medium">{p.requisito}</dd></div>}
        {p.composicion && <div><dt className="text-xs text-slate-500">Composición</dt><dd className="font-medium">{p.composicion}</dd></div>}
        {p.observaciones && <div className="col-span-2"><dt className="text-xs text-slate-500">Observaciones</dt><dd className="font-medium">{p.observaciones}</dd></div>}
      </dl>

      <div className="mt-3 flex flex-wrap gap-2">
        <Preferencia ok={ev.preferencias.tipo} etiqueta="Tipo de puesto" />
        <Preferencia ok={ev.preferencias.itinerancia} etiqueta="Itinerancia" />
      </div>

      <ul className="mt-3 list-disc space-y-0.5 pl-5 text-xs text-slate-600">
        {ev.motivos.map((m) => <li key={m}>{m}</li>)}
      </ul>

      <p className="mt-3 flex flex-wrap items-center gap-x-4 text-xs text-slate-500">
        <span>Puesto {p.id} · {convocatoria.documento.nombre_archivo}, página {p.pagina}</span>
        <a className="inline-flex items-center gap-1 font-semibold text-dccv-navy underline" href={`${convocatoria.documento.url}#page=${p.pagina}`} target="_blank" rel="noopener noreferrer">
          Documento oficial <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </p>
    </li>
  );
}

interface Props {
  convocatoria: Convocatoria;
  perfil: PerfilUsuario;
  perfilCompleto: boolean;
}

export function PlazasLista({ convocatoria, perfil, perfilCompleto }: Props) {
  const filas = useMemo<Fila[]>(
    () => convocatoria.puestos.filter((p) => p.cuerpo === 'MESTRES').map((puesto) => ({ puesto, evaluacion: evaluarPuesto(puesto, perfil) })),
    [convocatoria, perfil],
  );

  const [soloMiEspecialidad, setSoloMiEspecialidad] = useState(true);
  const [especialidad, setEspecialidad] = useState('');
  const [tipo, setTipo] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [itinerante, setItinerante] = useState('');

  const especialidades = useMemo(
    () => [...new Map(filas.map((f) => [f.puesto.especialidad_codigo, f.puesto.especialidad_nombre])).entries()].sort(),
    [filas],
  );

  const visibles = filas
    .filter((f) => !(perfilCompleto && soloMiEspecialidad) || f.evaluacion.estado !== 'no-compatible')
    .filter((f) => !especialidad || f.puesto.especialidad_codigo === especialidad)
    .filter((f) => !tipo || f.puesto.tipo_original === tipo)
    .filter((f) => !itinerante || f.puesto.itinerante_original === itinerante)
    .filter((f) => !municipio.trim() || (f.puesto.municipio ?? '').toLowerCase().includes(municipio.trim().toLowerCase()))
    // Sin distancia por carretera disponible (Fase 6), se ordena por municipio.
    .sort((a, b) => (a.puesto.municipio ?? '').localeCompare(b.puesto.municipio ?? '', 'es') || a.puesto.id.localeCompare(b.puesto.id));

  return (
    <div>
      <form className="mb-4 grid gap-3 sm:grid-cols-4" onSubmit={(e) => e.preventDefault()} aria-label="Filtros de plazas">
        <div>
          <label className="label" htmlFor="f-esp">Especialidad</label>
          <select id="f-esp" className="input" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)}>
            <option value="">Todas</option>
            {especialidades.map(([c, n]) => <option key={c} value={c ?? ''}>{c} · {n}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="f-tipo">Tipo de puesto</label>
          <select id="f-tipo" className="input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            <option value="Vacante">Vacante</option>
            <option value="Sust. Det.">Sust. Det.</option>
            <option value="Sust. Ind.">Sust. Ind.</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="f-mun">Municipio</label>
          <input id="f-mun" className="input" value={municipio} onChange={(e) => setMunicipio(e.target.value)} placeholder="Buscar…" />
        </div>
        <div>
          <label className="label" htmlFor="f-it">Itinerante</label>
          <select id="f-it" className="input" value={itinerante} onChange={(e) => setItinerante(e.target.value)}>
            <option value="">Todos</option>
            <option value="SI">Sí</option>
            <option value="NO">No</option>
          </select>
        </div>
        {perfilCompleto && (
          <label className="flex items-center gap-2 text-sm sm:col-span-4">
            <input type="checkbox" className="h-4 w-4 accent-dccv-teal" checked={soloMiEspecialidad} onChange={(e) => setSoloMiEspecialidad(e.target.checked)} />
            Mostrar solo plazas de mis especialidades
          </label>
        )}
      </form>

      <p className="mb-3 text-sm text-slate-600" role="status">
        {visibles.length} de {filas.length} plazas de Maestros.
        {!perfilCompleto && ' Configura tu perfil para filtrar por tus especialidades.'}
      </p>

      {visibles.length === 0 ? (
        <p className="card text-sm text-slate-600">Ninguna plaza coincide con los filtros actuales.</p>
      ) : (
        <ul className="space-y-3">
          {visibles.map((f) => <Tarjeta key={f.puesto.id} fila={f} convocatoria={convocatoria} />)}
        </ul>
      )}
    </div>
  );
}
