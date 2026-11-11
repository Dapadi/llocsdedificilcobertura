import { useCallback, useEffect, useState } from 'react';
import { cargarDatos, type DatosCargados } from '../lib/convocatorias';

export function useConvocatoria() {
  const [datos, setDatos] = useState<DatosCargados | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cargadoEn, setCargadoEn] = useState<Date | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setDatos(await cargarDatos(import.meta.env.BASE_URL));
      setCargadoEn(new Date());
    } catch (e) {
      // Se conservan los últimos datos cargados (si los hay) pero se avisa del fallo.
      setError(e instanceof Error ? e.message : 'Error desconocido al cargar los datos');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  return { datos, error, cargando, cargadoEn, recargar };
}
