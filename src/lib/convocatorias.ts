/** Tipos y carga de los datos generados por `scripts/update_convocatorias.py`. */

export interface Puesto {
  id: string;
  cuerpo: string | null;
  especialidad_codigo: string | null;
  especialidad_nombre: string | null;
  provincia: string | null;
  municipio: string | null;
  centro_codigo: string | null;
  centro: string | null;
  horas: number | null;
  horas_original: string | null;
  itinerante_original: string | null;
  tipo_original: string | null;
  tipo: 'vacante' | 'sustitucion-determinada' | 'sustitucion-indeterminada' | null;
  requisito: string | null;
  composicion: string | null;
  observaciones: string | null;
  pagina: number;
  revision: string[];
}

export interface DocumentoConvocatoria {
  nombre_archivo: string;
  url: string;
  url_pagina: string;
  sha256: string;
  estado: 'provisional' | 'desconocido';
  fecha_listado: string | null;
  fecha_nombre_archivo: string | null;
  paginas: number;
  descargado_en: string;
}

export interface Convocatoria {
  id: string;
  documento: DocumentoConvocatoria;
  avisos: string[];
  puestos: Puesto[];
}

export interface EntradaIndice {
  id: string;
  archivo_datos: string;
  num_puestos: number;
  num_revision: number;
  fecha_listado: string | null;
  estado: string;
}

export interface Indice {
  convocatorias: EntradaIndice[];
  ultima: string | null;
  actualizado_en?: string;
}

export interface EstadoActualizacion {
  resultado: 'ok' | 'error';
  mensaje: string;
  ultima_convocatoria: string | null;
  ultimo_exito: string | null;
  ultimo_intento: string;
}

export interface DatosCargados {
  convocatoria: Convocatoria | null;
  estado: EstadoActualizacion | null;
}

export const CUERPO_MAESTROS = 'MESTRES';
/** Días tras los que un listado se considera potencialmente desactualizado (se publica cada semana). */
export const DIAS_MAX_ANTIGUEDAD = 8;

type Fetcher = (url: string, init?: RequestInit) => Promise<Pick<Response, 'ok' | 'status' | 'json'>>;

async function obtenerJson<T>(f: Fetcher, url: string, requerido: boolean): Promise<T | null> {
  const r = await f(url, { cache: 'no-cache' });
  if (r.status === 404 && !requerido) return null;
  if (!r.ok) throw new Error(`No se pudo cargar ${url} (HTTP ${r.status})`);
  return (await r.json()) as T;
}

/** Carga el índice, la última convocatoria y el estado de la última actualización. */
export async function cargarDatos(base: string, f: Fetcher = fetch): Promise<DatosCargados> {
  const indice = await obtenerJson<Indice>(f, `${base}data/index.json`, false);
  const estado = await obtenerJson<EstadoActualizacion>(f, `${base}data/status.json`, false).catch(() => null);
  if (!indice || !indice.ultima) return { convocatoria: null, estado };
  const entrada = indice.convocatorias.find((c) => c.id === indice.ultima);
  if (!entrada) throw new Error('El índice de convocatorias es incoherente: falta la última convocatoria');
  const convocatoria = await obtenerJson<Convocatoria>(f, `${base}data/${entrada.archivo_datos}`, true);
  return { convocatoria, estado };
}

export function diasDesde(fechaIso: string, ahora: Date = new Date()): number {
  const [a, m, d] = fechaIso.split('-').map(Number);
  const f = Date.UTC(a, m - 1, d);
  const hoy = Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  return Math.floor((hoy - f) / 86_400_000);
}

export function formatearFecha(fechaIso: string | null): string {
  if (!fechaIso) return '—';
  const [a, m, d] = fechaIso.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

export const ETIQUETA_TIPO: Record<NonNullable<Puesto['tipo']>, string> = {
  vacante: 'Vacante',
  'sustitucion-determinada': 'Sustitución determinada',
  'sustitucion-indeterminada': 'Sustitución indeterminada',
};
