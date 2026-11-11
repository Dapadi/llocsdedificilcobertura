import type { StorageLike } from './profile';

export const FAVORITOS_KEY = 'dccv.favoritos.v1';
const MAX_FAVORITOS = 200;

/** Lee la lista de identificadores de puesto guardados. Ignora cualquier dato que no sea una lista de textos. */
export function cargarFavoritos(storage: StorageLike | null): string[] {
  try {
    const bruto = storage?.getItem(FAVORITOS_KEY);
    if (!bruto) return [];
    const datos: unknown = JSON.parse(bruto);
    if (!Array.isArray(datos)) return [];
    return [...new Set(datos.filter((x): x is string => typeof x === 'string' && /^\d{1,12}$/.test(x)))].slice(0, MAX_FAVORITOS);
  } catch {
    return [];
  }
}

export function guardarFavoritos(storage: StorageLike | null, ids: string[]): boolean {
  try {
    storage?.setItem(FAVORITOS_KEY, JSON.stringify(ids.slice(0, MAX_FAVORITOS)));
    return storage !== null;
  } catch {
    return false;
  }
}

/** Añade el identificador si no está y lo quita si ya estaba (función pura). */
export function alternarFavorito(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids].slice(0, MAX_FAVORITOS);
}
