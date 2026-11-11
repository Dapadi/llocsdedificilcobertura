/**
 * Catálogo PROVISIONAL de especialidades del cuerpo de Maestros.
 *
 * ⚠️ No es el catálogo oficial. Solo contiene los códigos citados en la
 * especificación funcional del proyecto (121 Inglés y 128 Primaria) y su
 * denominación debe contrastarse con la normativa vigente.
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
  { codigo: '121', nombre: 'Inglés', verificada: false },
  { codigo: '128', nombre: 'Primaria', verificada: false },
];

export const CATALOGO_ESPECIALIDADES_OFICIAL_CARGADO = false;

/** Los códigos de especialidad son numéricos de 3 dígitos en las convocatorias. */
export function esCodigoEspecialidadValido(codigo: string): boolean {
  return /^\d{3}$/.test(codigo.trim());
}
