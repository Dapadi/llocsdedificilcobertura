import { RefreshCw, WifiOff } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useOnline } from '../hooks/useOnline';

/** Avisos globales: sin conexión y nueva versión disponible. */
export function AvisosApp() {
  const online = useOnline();
  const {
    needRefresh: [hayNuevaVersion],
    updateServiceWorker,
  } = useRegisterSW();

  return (
    <>
      {!online && (
        <div role="status" className="flex items-center justify-center gap-2 bg-dccv-yellow px-4 py-2 text-sm font-medium text-dccv-navy">
          <WifiOff className="h-4 w-4" aria-hidden="true" />
          Sin conexión: se muestran los últimos datos guardados en este dispositivo.
        </div>
      )}
      {hayNuevaVersion && (
        <div role="alert" className="fixed inset-x-3 bottom-24 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl bg-dccv-navy p-3 text-sm text-white shadow-lg md:bottom-6">
          <span>Hay una nueva versión de DCCV.</span>
          <button type="button" onClick={() => void updateServiceWorker(true)} className="inline-flex items-center gap-1 rounded-lg bg-dccv-yellow px-3 py-1.5 font-semibold text-dccv-navy">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Actualizar
          </button>
        </div>
      )}
    </>
  );
}
