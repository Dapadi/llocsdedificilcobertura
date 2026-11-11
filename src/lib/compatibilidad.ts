/**
 * Evaluación PROVISIONAL de compatibilidad entre un puesto y el perfil.
 *
 * Solo comprueba lo que se puede comprobar con certeza con los datos actuales:
 *  - la especialidad (requisito obligatorio de acceso), y
 *  - las preferencias de tipo de puesto e itinerancia (no excluyen, solo informan).
 *
 * Titulación, situación en bolsas y requisitos lingüísticos dependen de la normativa y de
 * los anexos de cada convocatoria (Fase 5). Mientras no estén implementados, ningún puesto
 * se marca como COMPATIBLE: como máximo queda en REVISIÓN NECESARIA con los motivos.
 */
import type { PerfilUsuario } from '../types';
import type { Puesto } from './convocatorias';

export type EstadoCompatibilidad = 'compatible' | 'no-compatible' | 'revision';

export interface Evaluacion {
  estado: EstadoCompatibilidad;
  /** Motivos que explican el estado (trazabilidad). */
  motivos: string[];
  /** Resultado de las preferencias personales (independiente del estado). */
  preferencias: { tipo: boolean | null; itinerancia: boolean | null };
}

export function evaluarPuesto(puesto: Puesto, perfil: PerfilUsuario): Evaluacion {
  const motivos: string[] = [];

  const preferencias = {
    tipo: puesto.tipo ? perfil.tiposPuesto[claveTipo(puesto.tipo)] : null,
    itinerancia: evaluarItinerancia(puesto, perfil),
  };

  if (!puesto.especialidad_codigo) {
    return { estado: 'revision', motivos: ['El listado no permite identificar la especialidad del puesto.'], preferencias };
  }
  if (!perfil.especialidades.includes(puesto.especialidad_codigo)) {
    return {
      estado: 'no-compatible',
      motivos: [`La especialidad ${puesto.especialidad_codigo} no está entre las de tu perfil.`],
      preferencias,
    };
  }

  motivos.push(`Coincide con tu especialidad ${puesto.especialidad_codigo}.`);
  if (puesto.requisito) {
    motivos.push(`El listado indica el requisito «${puesto.requisito}»: compruébalo en el documento oficial.`);
  }
  if (puesto.revision.length > 0) {
    motivos.push('La extracción de este puesto tiene campos dudosos: consulta el documento oficial.');
  }
  motivos.push('Titulación y situación en bolsas aún no se comprueban automáticamente: verifícalas en la convocatoria.');
  return { estado: 'revision', motivos, preferencias };
}

function claveTipo(tipo: NonNullable<Puesto['tipo']>): keyof PerfilUsuario['tiposPuesto'] {
  return tipo === 'vacante' ? 'vacante' : tipo === 'sustitucion-determinada' ? 'sustitucionDeterminada' : 'sustitucionIndeterminada';
}

/** `null` = no se puede determinar con los datos del listado. */
function evaluarItinerancia(puesto: Puesto, perfil: PerfilUsuario): boolean | null {
  if (perfil.itCom === 'todos') return true;
  const it = puesto.itinerante_original;
  if (it !== 'SI' && it !== 'NO') return null;
  if (perfil.itCom === 'itinerante') return it === 'SI';
  if (perfil.itCom === 'ninguno') return it === 'NO';
  // «Compartido»: el significado de la columna Composición no está validado con documentación oficial.
  return null;
}
