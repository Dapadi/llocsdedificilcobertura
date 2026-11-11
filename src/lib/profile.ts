import { esCodigoEspecialidadValido } from '../data/especialidades';
import {
  DISTANCIAS_KM,
  ENTIDADES_CERTIFICADORAS,
  NIVELES_INGLES,
  NIVELES_VALENCIANO,
  PROVINCIAS,
  type DistanciaKm,
  type PerfilErrores,
  type PerfilUsuario,
} from '../types';

export const STORAGE_KEY = 'dccv.perfil.v1';

/** Subconjunto de la API de Storage que usamos (facilita las pruebas). */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const PERFIL_POR_DEFECTO: PerfilUsuario = {
  version: 1,
  municipio: '',
  provincia: null,
  distanciaMaxKm: 50,
  especialidades: [],
  situacionBolsa: null,
  titulaciones: [],
  valenciano: 'sin-acreditar',
  ingles: 'sin-acreditar',
  inglesCertificado: null,
  tiposPuesto: { vacante: true, sustitucionDeterminada: true, sustitucionIndeterminada: true },
  itCom: 'todos',
};

const SITUACIONES = ['bolsa-especialidad', 'otras-bolsas', 'ninguna'] as const;
const TITULACIONES = ['grado', 'diplomatura', 'otras'] as const;
const IT_COM = ['todos', 'itinerante', 'compartido', 'ninguno'] as const;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function pick<T extends string | number>(value: unknown, allowed: readonly T[]): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

function pickMany<T extends string>(value: unknown, allowed: readonly T[]): T[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((v): v is T => allowed.includes(v as T)))];
}

/**
 * Convierte datos desconocidos (p. ej. leídos de localStorage) en un perfil
 * válido, descartando campo a campo lo que no cumpla el esquema.
 */
export function normalizarPerfil(raw: unknown): PerfilUsuario {
  const base = structuredClone(PERFIL_POR_DEFECTO);
  if (!isRecord(raw)) return base;

  const tp = isRecord(raw.tiposPuesto) ? raw.tiposPuesto : {};
  const bool = (v: unknown, def: boolean) => (typeof v === 'boolean' ? v : def);

  return {
    version: 1,
    municipio: typeof raw.municipio === 'string' ? raw.municipio.trim().slice(0, 80) : base.municipio,
    provincia: pick(raw.provincia, PROVINCIAS) ?? null,
    distanciaMaxKm: (pick(raw.distanciaMaxKm, DISTANCIAS_KM) ?? base.distanciaMaxKm) as DistanciaKm,
    especialidades: Array.isArray(raw.especialidades)
      ? [...new Set(raw.especialidades.filter((c): c is string => typeof c === 'string' && esCodigoEspecialidadValido(c)).map((c) => c.trim()))]
      : [],
    situacionBolsa: pick(raw.situacionBolsa, SITUACIONES) ?? null,
    titulaciones: pickMany(raw.titulaciones, TITULACIONES),
    valenciano: pick(raw.valenciano, NIVELES_VALENCIANO) ?? base.valenciano,
    ingles: pick(raw.ingles, NIVELES_INGLES) ?? base.ingles,
    inglesCertificado: pick(raw.inglesCertificado, ENTIDADES_CERTIFICADORAS) ?? null,
    tiposPuesto: {
      vacante: bool(tp.vacante, base.tiposPuesto.vacante),
      sustitucionDeterminada: bool(tp.sustitucionDeterminada, base.tiposPuesto.sustitucionDeterminada),
      sustitucionIndeterminada: bool(tp.sustitucionIndeterminada, base.tiposPuesto.sustitucionIndeterminada),
    },
    itCom: pick(raw.itCom, IT_COM) ?? base.itCom,
  };
}

/** Validación para el formulario. Un objeto vacío significa perfil válido. */
export function validarPerfil(p: PerfilUsuario): PerfilErrores {
  const errores: PerfilErrores = {};
  if (!p.municipio.trim()) errores.municipio = 'Indica tu municipio de residencia.';
  if (!p.provincia) errores.provincia = 'Selecciona una provincia.';
  if (p.especialidades.length === 0) errores.especialidades = 'Selecciona al menos una especialidad.';
  if (!p.situacionBolsa) errores.situacionBolsa = 'Indica tu situación en bolsas.';
  if (p.titulaciones.length === 0) errores.titulaciones = 'Selecciona al menos una titulación.';
  const t = p.tiposPuesto;
  if (!t.vacante && !t.sustitucionDeterminada && !t.sustitucionIndeterminada) {
    errores.tiposPuesto = 'Selecciona al menos un tipo de puesto.';
  }
  if (p.inglesCertificado && p.ingles === 'sin-acreditar') {
    errores.inglesCertificado = 'Indica el nivel de inglés que acredita el certificado.';
  }
  return errores;
}

export function cargarPerfil(storage: StorageLike | null): PerfilUsuario {
  if (!storage) return structuredClone(PERFIL_POR_DEFECTO);
  try {
    const txt = storage.getItem(STORAGE_KEY);
    return txt ? normalizarPerfil(JSON.parse(txt)) : structuredClone(PERFIL_POR_DEFECTO);
  } catch {
    // JSON corrupto o almacenamiento inaccesible: se parte de un perfil vacío.
    return structuredClone(PERFIL_POR_DEFECTO);
  }
}

/** Devuelve `true` si se guardó correctamente. */
export function guardarPerfil(storage: StorageLike | null, perfil: PerfilUsuario): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(perfil));
    return true;
  } catch {
    return false;
  }
}

export function borrarPerfil(storage: StorageLike | null): void {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    /* sin acción: el almacenamiento puede estar bloqueado */
  }
}

export function perfilCompleto(p: PerfilUsuario): boolean {
  return Object.keys(validarPerfil(p)).length === 0;
}

export function obtenerStorage(): StorageLike | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}
