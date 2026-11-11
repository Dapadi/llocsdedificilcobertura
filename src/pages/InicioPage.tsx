import { AlertTriangle, ExternalLink, Loader2, RefreshCw, UserRound } from 'lucide-react';
import { PlazasLista } from '../components/PlazasLista';
import type { useConvocatoria } from '../hooks/useConvocatoria';
import { CUERPO_MAESTROS, DIAS_MAX_ANTIGUEDAD, diasDesde, formatearFecha } from '../lib/convocatorias';
import { evaluarPuesto } from '../lib/compatibilidad';
import type { PerfilUsuario } from '../types';

export const URL_CONVOCATORIAS = 'https://ceice.gva.es/va/web/rrhh-educacion/convocatoria-y-peticion-telematica6';

interface Props {
  perfil: PerfilUsuario;
  completo: boolean;
  onEditarPerfil: () => void;
  convocatoria: ReturnType<typeof useConvocatoria>;
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-subtle">{etiqueta}</dt>
      <dd className="mt-0.5 text-sm font-medium">{valor || '—'}</dd>
    </div>
  );
}

function Cifra({ etiqueta, valor, nota }: { etiqueta: string; valor: string; nota?: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className={`text-2xl font-bold ${valor === '—' ? 'text-subtle' : ''}`}>{valor}</p>
      <p className="mt-1 text-xs text-muted">{etiqueta}</p>
      {nota && <p className="mt-1 text-[11px] text-subtle">{nota}</p>}
    </div>
  );
}

function formatearMomento(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
}

export function InicioPage({ perfil, completo, onEditarPerfil, convocatoria: cv }: Props) {
  const conv = cv.datos?.convocatoria ?? null;
  const estado = cv.datos?.estado ?? null;
  const maestros = conv ? conv.puestos.filter((p) => p.cuerpo === CUERPO_MAESTROS) : [];
  const coinciden = completo ? maestros.filter((p) => evaluarPuesto(p, perfil).estado !== 'no-compatible').length : null;
  const antiguedad = conv?.documento.fecha_listado ? diasDesde(conv.documento.fecha_listado) : null;
  const posiblementeAntiguo = antiguedad !== null && antiguedad > DIAS_MAX_ANTIGUEDAD;
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
          <p className="text-sm text-muted">
            Configura tu perfil una sola vez (se guarda solo en este dispositivo) para que DCCV pueda filtrar las
            plazas según tu situación.
          </p>
        )}
      </section>

      <section aria-labelledby="t-convocatoria" className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 id="t-convocatoria" className="text-lg font-bold">Última convocatoria</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={() => void cv.recargar()} disabled={cv.cargando} title="Vuelve a leer los datos publicados. Los listados nuevos se descargan automáticamente de la Conselleria cada semana.">
              {cv.cargando ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
              Recargar datos
            </button>
            <a className="btn-secondary" href={conv?.documento.url_pagina ?? URL_CONVOCATORIAS} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Página oficial
            </a>
          </div>
        </div>

        {cv.error && (
          <div role="alert" className="mb-4 flex gap-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p><strong>No se han podido cargar los datos.</strong> {cv.error}{conv ? ' Se muestran los últimos datos cargados.' : ''}</p>
          </div>
        )}
        {!cv.error && !cv.cargando && !conv && (
          <div role="status" className="mb-4 flex gap-3 rounded-lg border border-dccv-yellow bg-dccv-yellow/20 p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p><strong>Todavía no hay ninguna convocatoria procesada.</strong> Se descargará automáticamente cuando se ejecute la primera actualización.</p>
          </div>
        )}
        {estado?.resultado === 'error' && (
          <div role="alert" className="mb-4 flex gap-3 rounded-lg border border-dccv-yellow bg-dccv-yellow/20 p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p><strong>La última comprobación automática falló</strong> ({formatearMomento(estado.ultimo_intento)}): {estado.mensaje}. Se conserva el último listado válido, que puede no ser el más reciente.</p>
          </div>
        )}
        {posiblementeAntiguo && (
          <div role="status" className="mb-4 flex gap-3 rounded-lg border border-dccv-yellow bg-dccv-yellow/20 p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p><strong>Este listado tiene {antiguedad} días.</strong> Puede haberse publicado uno más reciente: consulta la página oficial.</p>
          </div>
        )}

        <dl className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Dato etiqueta="Documento" valor={conv?.documento.nombre_archivo ?? ''} />
          <Dato etiqueta="Fecha del listado" valor={conv ? formatearFecha(conv.documento.fecha_listado) : ''} />
          <Dato etiqueta="Estado del documento" valor={conv ? (conv.documento.estado === 'provisional' ? 'Provisional (no es adjudicación)' : 'Sin determinar') : ''} />
        </dl>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Cifra etiqueta="Puestos de Maestros" valor={conv ? String(maestros.length) : '—'} nota={conv ? `${conv.puestos.length} en todo el documento` : undefined} />
          <Cifra etiqueta="Coinciden con tu especialidad" valor={coinciden === null ? '—' : String(coinciden)} nota={completo ? undefined : 'Configura tu perfil'} />
          <Cifra etiqueta="Compatibles verificados" valor="—" nota="La comprobación de titulación y bolsas llegará con la Fase 5" />
          <Cifra etiqueta="Datos descargados" valor={formatearMomento(conv?.documento.descargado_en)} />
        </div>
      </section>

      <section aria-labelledby="t-plazas">
        <h2 id="t-plazas" className="mb-3 text-lg font-bold">Plazas</h2>
        {conv ? (
          <PlazasLista convocatoria={conv} perfil={perfil} perfilCompleto={completo} />
        ) : (
          <p className="card text-sm text-muted">Cuando haya una convocatoria procesada, aquí aparecerán las plazas.</p>
        )}
      </section>
    </div>
  );
}
