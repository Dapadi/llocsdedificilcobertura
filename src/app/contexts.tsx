import { createContext, useContext, type ReactNode } from 'react';
import { useConvocatoria } from '../hooks/useConvocatoria';
import { usePerfil } from '../hooks/usePerfil';

/** Estado global de la aplicación: perfil (local) y datos de convocatorias (estáticos). */
type PerfilCtx = ReturnType<typeof usePerfil>;
type ConvocatoriaCtx = ReturnType<typeof useConvocatoria>;

const PerfilContext = createContext<PerfilCtx | null>(null);
const ConvocatoriaContext = createContext<ConvocatoriaCtx | null>(null);

export function AppProviders({ children }: { children: ReactNode }) {
  const perfil = usePerfil();
  const convocatoria = useConvocatoria();
  return (
    <PerfilContext.Provider value={perfil}>
      <ConvocatoriaContext.Provider value={convocatoria}>{children}</ConvocatoriaContext.Provider>
    </PerfilContext.Provider>
  );
}

function exigir<T>(valor: T | null, nombre: string): T {
  if (!valor) throw new Error(`${nombre} debe usarse dentro de <AppProviders>`);
  return valor;
}

export const usePerfilCtx = () => exigir(useContext(PerfilContext), 'usePerfilCtx');
export const useConvocatoriaCtx = () => exigir(useContext(ConvocatoriaContext), 'useConvocatoriaCtx');
