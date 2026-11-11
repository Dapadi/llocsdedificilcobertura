import { useCallback, useMemo, useState } from 'react';
import {
  PERFIL_POR_DEFECTO,
  borrarPerfil,
  cargarPerfil,
  guardarPerfil,
  obtenerStorage,
  perfilCompleto,
} from '../lib/profile';
import type { PerfilUsuario } from '../types';

export function usePerfil() {
  const storage = useMemo(() => obtenerStorage(), []);
  const [perfil, setPerfil] = useState<PerfilUsuario>(() => cargarPerfil(storage));

  /** Guarda en localStorage. Devuelve false si el navegador lo impide. */
  const guardar = useCallback(
    (nuevo: PerfilUsuario) => {
      setPerfil(nuevo);
      return guardarPerfil(storage, nuevo);
    },
    [storage],
  );

  const restablecer = useCallback(() => {
    borrarPerfil(storage);
    setPerfil(structuredClone(PERFIL_POR_DEFECTO));
  }, [storage]);

  return {
    perfil,
    guardar,
    restablecer,
    completo: perfilCompleto(perfil),
    almacenamientoDisponible: storage !== null,
  };
}
