import { describe, expect, it } from 'vitest';
import { aFrase, aTitulo } from './texto';

describe('aTitulo', () => {
  it.each([
    ['CEIP GREGORI MAYANS I CISCAR', 'CEIP Gregori Mayans i Ciscar'],
    ['SANT JOAN D\'ALACANT', "Sant Joan d'Alacant"],
    ['CREVILLENT - SAN FELIPE NERI', 'Crevillent - San Felipe Neri'],
    ['IES L\'OM', "IES l'Om"],
    ['CEE PÚB. VIRGEN DE LA LUZ', 'CEE Púb. Virgen de la Luz'],
    ['CASTELLÓ DE LA PLANA', 'Castelló de la Plana'],
    ['ALCALÀ DE XIVERT - ALCOSSEBRE', 'Alcalà de Xivert - Alcossebre'],
    ["L'ALCORA", "L'Alcora"],
  ])('%s', (entrada, esperado) => expect(aTitulo(entrada)).toBe(esperado));

  it('tolera vacíos', () => {
    expect(aTitulo(null)).toBe('');
    expect(aTitulo('')).toBe('');
  });
});

describe('aFrase', () => {
  it.each([
    ['LENGUA EXTRANJERA: INGLÉS', 'Lengua extranjera: Inglés'],
    ['EDUCACIÓN ESPECIAL: PEDAGOGÍA TERAPÉUTICA', 'Educación especial: Pedagogía terapéutica'],
    ['FPA PRIMARIA', 'FPA primaria'],
    ['EDUCACIÓN PRIMARIA', 'Educación primaria'],
  ])('%s', (entrada, esperado) => expect(aFrase(entrada)).toBe(esperado));
});
