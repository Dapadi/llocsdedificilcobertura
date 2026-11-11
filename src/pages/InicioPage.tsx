import { AlertTriangle, ExternalLink, RefreshCw, UserRound } from 'lucide-react';
import type { PerfilUsuario } from '../types';

export const URL_CONVOCATORIAS = 'https://ceice.gva.es/va/web/rrhh-educacion/convocatoria-y-peticion-telematica6';

interface Props {
  perfil: PerfilUsuario;
  completo: boolean;
  onEditarPerfil: () => void;
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{etiqueta}</dt>
      <dd className="mt-0.5 text-sm font-medium">{valor || '—'}</dd>
    </div>
  );
}

function Cifra({ etiqueta }: { etiqueta: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-2xl font-bold text-slate-400" aria-label="Sin datos">—</p>
      <p className="mt-1 text-xs text-slate-600">{etiqueta}</p>
    </div>
  );
}

export function InicioPage({ perfil, completo, onEditarPerfil }: Props) {
  return (
    <div className="space-y-6">
      <section aria-labelledby="t-perfil" className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h1 id="t-perfil" className="text-lg font-bold">Mi perfil docente</h1>
          <button type="button" className="btn-secondary" onClick={onEditarPerfil}>
            <UserRound className="h-4 w-4" aria-hidden="true" />
            {completo ? 'Editar perfil' : 'Configurar perfil'}
          </button>
        </div>
        {completo ? (
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Dato etiqueta="Localidad" valor={perfil.municipio} />
            <Dato etiqueta="Distancia" valor={`${perfil.distanciaMaxKm} km`} />
            <Dato etiqueta="Especialidades" valor={perfil.especialidades.join(' · ')} />
            <Dato etiqueta="Valenciano" valor={perfil.valenciano === 'sin-acreditar' ? 'Sin acreditar' : perfil.valenciano} />
          </dl>
        ) : (
          <p className="text-sm text-slate-600">
            Configura tu perfil una sola vez (se guarda solo en este dispositivo) para que DCCV pueda filtrar las
            plazas según tu situación.
          </p>
        )}
      </section>

      <section aria-labelledby="t-convocatoria" className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 id="t-convocatoria" className="text-lg font-bold">Última convocatoria</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" disabled title="Disponible cuando se implemente la Fase 3">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Actualizar datos
            </button>
            <a className="btn-secondary" href={URL_CONVOCATORIAS} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Página oficial
            </a>
          </div>
        </div>

        <div role="status" className="mb-4 flex gap-3 rounded-lg border border-dccv-yellow bg-dccv-yellow/20 p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            <strong>Sin datos reales todavía.</strong> La conexión con la Conselleria y la extracción de listados aún
            no están implementadas (Fases 3 y 4). No se muestra ninguna convocatoria ni plaza de ejemplo para evitar
            confusiones.
          </p>
        </div>

        <dl className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Dato etiqueta="Nombre" valor="" />
          <Dato etiqueta="Fecha de publicación" valor="" />
          <Dato etiqueta="Estado del documento" valor="" />
        </dl>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Cifra etiqueta="Puestos detectados" />
          <Cifra etiqueta="Compatibles con tu perfil" />
          <Cifra etiqueta="Pendientes de revisión" />
          <Cifra etiqueta="Última actualización" />
        </div>
      </section>

      <section aria-labelledby="t-plazas" className="card">
        <h2 id="t-plazas" className="text-lg font-bold">Plazas compatibles</h2>
        <p className="mt-2 text-sm text-slate-600">
          Cuando se procesen los documentos de la convocatoria, aquí aparecerán las plazas con su estado
          (compatible, no compatible o revisión necesaria), la distancia por carretera y el enlace al documento de
          origen.
        </p>
      </section>
    </div>
  );
}
