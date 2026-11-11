import { createContext, useContext, type ReactNode } from 'react';
import { useConvocatoria } from '../hooks/useConvocatoria';
import { useFavoritos } from '../hooks/useFavoritos';
import { usePerfil } from '../hooks/usePerfil';

/** Estado global de la aplicación: perfil (local) y datos de convocatorias (estáticos). */
type PerfilCtx = ReturnType<typeof usePerfil>;
type ConvocatoriaCtx = ReturnType<typeof useConvocatoria>;
type FavoritosCtx = ReturnType<typeof useFavoritos>;

const PerfilContext = createContext<PerfilCtx | null>(null);
const ConvocatoriaContext = createContext<ConvocatoriaCtx | null>(null);
const FavoritosContext = createContext<FavoritosCtx | null>(null);

export function AppProviders({ children }: { children: ReactNode }) {
  const perfil = usePerfil();
  const convocatoria = useConvocatoria();
  const favoritos = useFavoritos();
  return (
    <PerfilContext.Provider value={perfil}>
      <ConvocatoriaContext.Provider value={convocatoria}>
        <FavoritosContext.Provider value={favoritos}>{children}</FavoritosContext.Provider>
      </ConvocatoriaContext.Provider>
    </PerfilContext.Provider>
  );
}

function exigir<T>(valor: T | null, nombre: string): T {
  if (!valor) throw new Error(`${nombre} debe usarse dentro de <AppProviders>`);
  return valor;
}

export const usePerfilCtx = () => exigir(useContext(PerfilContext), 'usePerfilCtx');
export const useConvocatoriaCtx = () => exigir(useContext(ConvocatoriaContext), 'useConvocatoriaCtx');
export const useFavoritosCtx = () => exigir(useContext(FavoritosContext), 'useFavoritosCtx');
