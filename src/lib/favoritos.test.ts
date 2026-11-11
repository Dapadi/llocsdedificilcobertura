import { describe, expect, it } from 'vitest';
import { FAVORITOS_KEY, alternarFavorito, cargarFavoritos, guardarFavoritos } from './favoritos';
import type { StorageLike } from './profile';

const memoria = (ini: Record<string, string> = {}): StorageLike => {
  const d = { ...ini };
  return { getItem: (k) => d[k] ?? null, setItem: (k, v) => { d[k] = v; }, removeItem: (k) => { delete d[k]; } };
};

describe('favoritos', () => {
  it('alterna un identificador', () => {
    expect(alternarFavorito([], '1')).toEqual(['1']);
    expect(alternarFavorito(['1', '2'], '1')).toEqual(['2']);
    expect(alternarFavorito(['2'], '3')).toEqual(['3', '2']);
  });

  it('guarda y recupera', () => {
    const s = memoria();
    expect(guardarFavoritos(s, ['10', '20'])).toBe(true);
    expect(cargarFavoritos(s)).toEqual(['10', '20']);
  });

  it('descarta datos corruptos o con formato inesperado', () => {
    expect(cargarFavoritos(memoria({ [FAVORITOS_KEY]: '{no json' }))).toEqual([]);
    expect(cargarFavoritos(memoria({ [FAVORITOS_KEY]: '{"a":1}' }))).toEqual([]);
    expect(cargarFavoritos(memoria({ [FAVORITOS_KEY]: JSON.stringify(['12', 'x', 5, '12', '<script>']) }))).toEqual(['12']);
  });

  it('tolera almacenamiento ausente o que falla', () => {
    expect(cargarFavoritos(null)).toEqual([]);
    expect(guardarFavoritos(null, ['1'])).toBe(false);
    const roto: StorageLike = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); }, removeItem: () => {} };
    expect(cargarFavoritos(roto)).toEqual([]);
    expect(guardarFavoritos(roto, ['1'])).toBe(false);
  });
});
