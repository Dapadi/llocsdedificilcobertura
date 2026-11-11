/**
 * Tipos de dominio del perfil docente (Fase 1).
 *
 * Los valores de los selectores proceden de la propuesta funcional del proyecto.
 * Los catálogos oficiales (especialidades, titulaciones habilitantes, municipios)
 * se incorporarán en la Fase 2 y sustituirán a las listas provisionales.
 */

export const DISTANCIAS_KM = [10, 20, 30, 40, 50, 60, 80, 100] as const;
export type DistanciaKm = (typeof DISTANCIAS_KM)[number];

export const PROVINCIAS = ['Alicante', 'Castellón', 'Valencia'] as const;
export type Provincia = (typeof PROVINCIAS)[number];

export type SituacionBolsa = 'bolsa-especialidad' | 'otras-bolsas' | 'ninguna';

export type Titulacion = 'grado' | 'diplomatura' | 'otras';

export const NIVELES_VALENCIANO = ['sin-acreditar', 'B2', 'C1', 'C2'] as const;
export type NivelValenciano = (typeof NIVELES_VALENCIANO)[number];

export const NIVELES_INGLES = ['sin-acreditar', 'B1', 'B2', 'C1', 'C2'] as const;
export type NivelIngles = (typeof NIVELES_INGLES)[number];

export const ENTIDADES_CERTIFICADORAS = ['Cambridge', 'EOI', 'Trinity', 'Otro'] as const;
export type EntidadCertificadora = (typeof ENTIDADES_CERTIFICADORAS)[number];

export type FiltroItCom = 'todos' | 'itinerante' | 'compartido' | 'ninguno';

/** Preferencias sobre el tipo de puesto. No son requisitos de acceso. */
export interface PreferenciasTipoPuesto {
  vacante: boolean;
  sustitucionDeterminada: boolean;
  sustitucionIndeterminada: boolean;
}

export interface PerfilUsuario {
  /** Versión del esquema almacenado en localStorage. */
  version: 1;

  // Ubicación
  municipio: string;
  provincia: Provincia | null;
  distanciaMaxKm: DistanciaKm;

  // Requisitos (candidatos a ser obligatorios según anexos de cada convocatoria)
  /** Códigos de especialidad seleccionados. */
  especialidades: string[];
  situacionBolsa: SituacionBolsa | null;
  titulaciones: Titulacion[];
  valenciano: NivelValenciano;
  ingles: NivelIngles;
  inglesCertificado: EntidadCertificadora | null;

  // Preferencias personales (nunca excluyen por sí solas una plaza "no compatible")
  tiposPuesto: PreferenciasTipoPuesto;
  itCom: FiltroItCom;
}

export type PerfilErrores = Partial<Record<keyof PerfilUsuario, string>>;
