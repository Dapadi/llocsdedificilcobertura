import { describe, expect, it } from 'vitest';
import {
  PERFIL_POR_DEFECTO,
  STORAGE_KEY,
  cargarPerfil,
  guardarPerfil,
  normalizarPerfil,
  perfilCompleto,
  validarPerfil,
  type StorageLike,
} from './profile';
import type { PerfilUsuario } from '../types';

function memoria(inicial: Record<string, string> = {}): StorageLike & { datos: Record<string, string> } {
  const datos = { ...inicial };
  return {
    datos,
    getItem: (k) => (k in datos ? datos[k] : null),
    setItem: (k, v) => { datos[k] = v; },
    removeItem: (k) => { delete datos[k]; },
  };
}

const valido: PerfilUsuario = {
  ...PERFIL_POR_DEFECTO,
  municipio: 'Municipio de prueba',
  provincia: 'Alicante',
  especialidades: ['121'],
  situacionBolsa: 'bolsa-especialidad',
  titulaciones: ['grado'],
};

describe('validarPerfil', () => {
  it('el perfil por defecto es incompleto y señala los campos obligatorios', () => {
    const e = validarPerfil(PERFIL_POR_DEFECTO);
    expect(Object.keys(e).sort()).toEqual(['especialidades', 'municipio', 'provincia', 'situacionBolsa', 'titulaciones']);
    expect(perfilCompleto(PERFIL_POR_DEFECTO)).toBe(false);
  });

  it('acepta un perfil completo', () => {
    expect(validarPerfil(valido)).toEqual({});
  });

  it('exige al menos un tipo de puesto', () => {
    const e = validarPerfil({ ...valido, tiposPuesto: { vacante: false, sustitucionDeterminada: false, sustitucionIndeterminada: false } });
    expect(e.tiposPuesto).toBeDefined();
  });

  it('un certificado de inglés requiere indicar nivel', () => {
    expect(validarPerfil({ ...valido, inglesCertificado: 'Cambridge', ingles: 'sin-acreditar' }).inglesCertificado).toBeDefined();
    expect(validarPerfil({ ...valido, inglesCertificado: 'Cambridge', ingles: 'B2' })).toEqual({});
  });
});

describe('normalizarPerfil', () => {
  it('descarta valores fuera de los catálogos', () => {
    const p = normalizarPerfil({ provincia: 'Madrid', distanciaMaxKm: 75, valenciano: 'C3', itCom: 'xx', especialidades: ['121', 'abc', 121, '121'], titulaciones: ['grado', 'doctorado'] });
    expect(p.provincia).toBeNull();
    expect(p.distanciaMaxKm).toBe(PERFIL_POR_DEFECTO.distanciaMaxKm);
    expect(p.valenciano).toBe('sin-acreditar');
    expect(p.itCom).toBe('todos');
    expect(p.especialidades).toEqual(['121']);
    expect(p.titulaciones).toEqual(['grado']);
  });

  it('devuelve el perfil por defecto ante datos no objeto', () => {
    expect(normalizarPerfil(null)).toEqual(PERFIL_POR_DEFECTO);
    expect(normalizarPerfil('x')).toEqual(PERFIL_POR_DEFECTO);
    expect(normalizarPerfil([])).toEqual(PERFIL_POR_DEFECTO);
  });
});

describe('persistencia local', () => {
  it('guarda y recupera el perfil', () => {
    const s = memoria();
    expect(guardarPerfil(s, valido)).toBe(true);
    expect(cargarPerfil(s)).toEqual(valido);
  });

  it('ignora JSON corrupto', () => {
    expect(cargarPerfil(memoria({ [STORAGE_KEY]: '{no es json' }))).toEqual(PERFIL_POR_DEFECTO);
  });

  it('tolera almacenamiento ausente o que lanza errores', () => {
    expect(cargarPerfil(null)).toEqual(PERFIL_POR_DEFECTO);
    expect(guardarPerfil(null, valido)).toBe(false);
    const roto: StorageLike = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); }, removeItem: () => { throw new Error('x'); } };
    expect(cargarPerfil(roto)).toEqual(PERFIL_POR_DEFECTO);
    expect(guardarPerfil(roto, valido)).toBe(false);
  });
});
