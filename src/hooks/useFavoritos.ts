import { useCallback, useMemo, useState } from 'react';
import { alternarFavorito, cargarFavoritos, guardarFavoritos } from '../lib/favoritos';
import { obtenerStorage } from '../lib/profile';

export function useFavoritos() {
  const storage = useMemo(() => obtenerStorage(), []);
  const [ids, setIds] = useState<string[]>(() => cargarFavoritos(storage));

  const alternar = useCallback(
    (id: string) => {
      setIds((actual) => {
        const nuevo = alternarFavorito(actual, id);
        guardarFavoritos(storage, nuevo);
        return nuevo;
      });
    },
    [storage],
  );

  return { ids, esFavorito: (id: string) => ids.includes(id), alternar };
}
