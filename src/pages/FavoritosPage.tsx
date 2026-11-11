import { Star } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConvocatoriaCtx, useFavoritosCtx, usePerfilCtx } from '../app/contexts';
import { PlazaCard } from '../components/PlazaCard';
import { PlazaDetalle } from '../components/PlazaDetalle';
import { evaluarPuesto } from '../lib/compatibilidad';
import { PaginaGrande } from '../ui/PaginaGrande';

export function FavoritosPage() {
  const { perfil } = usePerfilCtx();
  const { datos } = useConvocatoriaCtx();
  const { ids, esFavorito, alternar } = useFavoritosCtx();
  const navigate = useNavigate();
  const [abierta, setAbierta] = useState<string | null>(null);

  const conv = datos?.convocatoria ?? null;
  const filas = conv ? ids.map((id) => conv.puestos.find((p) => p.id === id)).filter((p) => p !== undefined).map((puesto) => ({ puesto, evaluacion: evaluarPuesto(puesto, perfil) })) : [];
  const ausentes = ids.length - filas.length;
  const detalle = filas.find((f) => f.puesto.id === abierta) ?? null;

  return (
    <PaginaGrande titulo="Favoritos" subtitulo={ids.length > 0 ? `${ids.length} guardada${ids.length === 1 ? '' : 's'}` : undefined}>
      {ids.length === 0 ? (
        <div className="card mt-8 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-dccv-yellow/30"><Star className="h-7 w-7" aria-hidden="true" /></span>
          <p className="text-[20px] font-semibold">Aún no has guardado ninguna</p>
          <p className="mx-auto mt-1 max-w-xs text-[15px] text-muted">Toca la estrella de una plaza para guardarla aquí y encontrarla fácilmente.</p>
          <button type="button" className="btn-primary mt-5 w-full" onClick={() => navigate('/')}>Ver plazas</button>
        </div>
      ) : (
        <>
          {ausentes > 0 && (
            <div role="status" className="mb-4 rounded-ios bg-dccv-yellow/30 p-4 text-[15px]">
              {ausentes === 1 ? 'Una plaza guardada ya no aparece' : `${ausentes} plazas guardadas ya no aparecen`} en el último listado. Puede que se haya cubierto o retirado.
              <button type="button" className="mt-2 block font-semibold underline" onClick={() => ids.filter((id) => !conv?.puestos.some((p) => p.id === id)).forEach((id) => alternar(id))}>Quitarlas de la lista</button>
            </div>
          )}
          <ul className="space-y-3">
            {filas.map((f, i) => (
              <PlazaCard key={f.puesto.id} indice={i} puesto={f.puesto} evaluacion={f.evaluacion} favorita={esFavorito(f.puesto.id)} onAbrir={() => setAbierta(f.puesto.id)} onFavorito={() => alternar(f.puesto.id)} />
            ))}
          </ul>
        </>
      )}
      {conv && (
        <PlazaDetalle
          puesto={detalle?.puesto ?? null}
          evaluacion={detalle?.evaluacion ?? null}
          convocatoria={conv}
          favorita={detalle ? esFavorito(detalle.puesto.id) : false}
          onFavorito={() => detalle && alternar(detalle.puesto.id)}
          onCerrar={() => setAbierta(null)}
        />
      )}
    </PaginaGrande>
  );
}
