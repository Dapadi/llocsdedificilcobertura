import { describe, expect, it } from 'vitest';
import { PERFIL_POR_DEFECTO } from './profile';
import { evaluarPuesto } from './compatibilidad';
import type { Puesto } from './convocatorias';
import type { PerfilUsuario } from '../types';

const puesto: Puesto = {
  id: '1', cuerpo: 'MESTRES', especialidad_codigo: '121', especialidad_nombre: 'LENGUA EXTRANJERA: INGLÉS',
  provincia: 'ALICANTE', municipio: 'TIBI', centro_codigo: '03008587', centro: 'CEIP LUIS GOSÁLBEZ',
  horas: 11.5, horas_original: '11,5', itinerante_original: 'NO', tipo_original: 'Vacante', tipo: 'vacante',
  requisito: null, composicion: null, observaciones: null, pagina: 7, revision: [],
};
const perfil = (p: Partial<PerfilUsuario> = {}): PerfilUsuario => ({ ...PERFIL_POR_DEFECTO, especialidades: ['121'], ...p });

describe('evaluarPuesto', () => {
  it('una especialidad que no está en el perfil nunca es compatible', () => {
    const e = evaluarPuesto(puesto, perfil({ especialidades: ['128'] }));
    expect(e.estado).toBe('no-compatible');
  });

  it('con la especialidad correcta queda en revisión (titulación y bolsas no verificadas), nunca compatible', () => {
    const e = evaluarPuesto(puesto, perfil());
    expect(e.estado).toBe('revision');
    expect(e.motivos.join(' ')).toMatch(/Titulación y situación en bolsas/);
  });

  it('un requisito indicado en el listado se muestra tal cual, sin interpretarlo', () => {
    const e = evaluarPuesto({ ...puesto, requisito: 'ING-B2.' }, perfil({ ingles: 'C1' }));
    expect(e.estado).toBe('revision');
    expect(e.motivos.join(' ')).toContain('«ING-B2.»');
  });

  it('sin especialidad identificable pide revisión', () => {
    expect(evaluarPuesto({ ...puesto, especialidad_codigo: null }, perfil()).estado).toBe('revision');
  });

  it('las preferencias no cambian el estado de compatibilidad', () => {
    const p = perfil({ tiposPuesto: { vacante: false, sustitucionDeterminada: true, sustitucionIndeterminada: true } });
    const e = evaluarPuesto(puesto, p);
    expect(e.estado).toBe('revision');
    expect(e.preferencias.tipo).toBe(false);
  });

  it('itinerancia: coincide, no coincide o no determinable', () => {
    expect(evaluarPuesto(puesto, perfil({ itCom: 'ninguno' })).preferencias.itinerancia).toBe(true);
    expect(evaluarPuesto(puesto, perfil({ itCom: 'itinerante' })).preferencias.itinerancia).toBe(false);
    expect(evaluarPuesto({ ...puesto, itinerante_original: 'SI' }, perfil({ itCom: 'itinerante' })).preferencias.itinerancia).toBe(true);
    expect(evaluarPuesto(puesto, perfil({ itCom: 'compartido' })).preferencias.itinerancia).toBeNull();
    expect(evaluarPuesto({ ...puesto, itinerante_original: null }, perfil({ itCom: 'ninguno' })).preferencias.itinerancia).toBeNull();
  });
});
