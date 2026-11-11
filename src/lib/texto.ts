/**
 * Presentación de textos del listado oficial, que viene TODO EN MAYÚSCULAS.
 * Solo afecta a lo que se ve en pantalla: los datos guardados no se modifican.
 */

const SIGLAS = new Set(['CEIP', 'CEE', 'CEP', 'IES', 'CIPFP', 'CIFP', 'CFPA', 'FPA', 'EOI', 'ESO', 'CRA', 'CP', 'EPA', 'AT', 'PT', 'AL', 'II', 'III', 'IV', 'UE', 'FP', 'TIC', 'COM', 'IT']);
const MINUSCULAS = new Set(['de', 'del', 'la', 'las', 'el', 'els', 'los', 'les', 'y', 'i', 'e', 'a', 'al', 'en', 'o', 'u', 'per']);

const capitalizar = (s: string) => (s ? s[0].toLocaleUpperCase('es') + s.slice(1) : s);

function palabra(token: string, primera: boolean): string {
  if (!token) return token;
  const sinPuntuacion = token.replace(/[.,:;()]/g, '');
  const upper = sinPuntuacion.toLocaleUpperCase('es');
  if (SIGLAS.has(upper) || /\d/.test(token)) return token.toLocaleUpperCase('es');
  const baja = token.toLocaleLowerCase('es');
  // d'Alacant, l'Om: el artículo contraído va en minúscula salvo al principio.
  const ap = baja.match(/^([dlnsmt])['’](.+)$/);
  if (ap) return (primera ? ap[1].toLocaleUpperCase('es') : ap[1]) + "'" + capitalizar(ap[2]);
  if (!primera && MINUSCULAS.has(baja)) return baja;
  return baja.split('-').map(capitalizar).join('-');
}

/** Nombres propios: «CEIP GREGORI MAYANS I CISCAR» → «CEIP Gregori Mayans i Ciscar». */
export function aTitulo(texto: string | null | undefined): string {
  if (!texto) return '';
  return texto.trim().split(/\s+/).map((t, i) => palabra(t, i === 0)).join(' ');
}

/** Frases y denominaciones: «LENGUA EXTRANJERA: INGLÉS» → «Lengua extranjera: Inglés». */
export function aFrase(texto: string | null | undefined): string {
  if (!texto) return '';
  let mayuscula = true;
  return texto
    .trim()
    .split(/\s+/)
    .map((t) => {
      const sig = t.replace(/[.,:;()]/g, '').toLocaleUpperCase('es');
      let r: string;
      if (SIGLAS.has(sig) || /\d/.test(t)) r = t.toLocaleUpperCase('es');
      else {
        const baja = t.toLocaleLowerCase('es');
        r = mayuscula ? capitalizar(baja) : baja;
      }
      mayuscula = t.endsWith(':');
      return r;
    })
    .join(' ');
}
