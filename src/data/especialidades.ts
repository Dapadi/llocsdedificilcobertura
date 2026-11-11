/**
 * Catálogo PROVISIONAL de especialidades del cuerpo de Maestros.
 *
 * ⚠️ No es el catálogo oficial. Solo contiene los códigos de Maestros que aparecen
 * en el listado de difícil cobertura del 05/11/2026, con la denominación literal de ese
 * documento. Debe sustituirse por el catálogo oficial completo.
 *
 * En la Fase 2 este fichero se sustituye por el catálogo oficial completo,
 * cargado en la tabla `especialidades` de la base de datos con su fuente.
 * Mientras tanto, la interfaz permite añadir códigos manualmente para no
 * bloquear la configuración del perfil.
 */

export interface EspecialidadCatalogo {
  codigo: string;
  nombre: string;
  /** Estado de verificación frente a la documentación oficial. */
  verificada: boolean;
}

export const ESPECIALIDADES_PROVISIONALES: readonly EspecialidadCatalogo[] = [
  // Denominaciones tal y como aparecen en el listado oficial de difícil cobertura (05/11/2026).
  { codigo: '121', nombre: 'Lengua extranjera: Inglés', verificada: false },
  { codigo: '123', nombre: 'Educación Física', verificada: false },
  { codigo: '126', nombre: 'Audición y Lenguaje', verificada: false },
  { codigo: '127', nombre: 'Pedagogía Terapéutica', verificada: false },
  { codigo: '128', nombre: 'Educación Primaria', verificada: false },
  { codigo: '151', nombre: 'Educación Especial: Audición y Lenguaje', verificada: false },
  { codigo: '152', nombre: 'Educación Especial: Pedagogía Terapéutica', verificada: false },
  { codigo: '153', nombre: 'FPA Primaria', verificada: false },
];

export const CATALOGO_ESPECIALIDADES_OFICIAL_CARGADO = false;

/** Los códigos de especialidad son numéricos de 3 dígitos en las convocatorias. */
export function esCodigoEspecialidadValido(codigo: string): boolean {
  return /^\d{3}$/.test(codigo.trim());
}
