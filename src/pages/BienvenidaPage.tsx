import { BellRing, MapPinned, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInstalarPwa } from '../hooks/useInstalarPwa';
import { marcarOnboardingVisto } from '../lib/onboarding';
import { obtenerStorage } from '../lib/profile';

const PUNTOS = [
  { icono: SlidersHorizontal, titulo: 'Configura tu perfil una vez', texto: 'Especialidades, bolsas, idiomas y preferencias. Se guarda solo en tu dispositivo.' },
  { icono: MapPinned, titulo: 'Solo plazas que encajan contigo', texto: 'Cada semana, el listado oficial de difícil cobertura filtrado según tu situación.' },
  { icono: BellRing, titulo: 'Sin descargar PDF', texto: 'Los listados nuevos se leen automáticamente; tú solo consultas el resultado.' },
];

/** Pantalla de bienvenida (primer arranque). La versión definitiva del asistente llegará en la siguiente fase. */
export function BienvenidaPage() {
  const navigate = useNavigate();
  const { puedeInstalar, instalar, esIos, instalada } = useInstalarPwa();

  const continuar = (destino: string) => {
    marcarOnboardingVisto(obtenerStorage());
    navigate(destino, { replace: true });
  };

  return (
    <section aria-labelledby="t-bienvenida" className="mx-auto max-w-xl space-y-6 text-center">
      <div>
        <h1 id="t-bienvenida" className="text-3xl font-extrabold tracking-tight">Encuentra tu plaza de difícil cobertura</h1>
        <p className="mt-2 text-slate-600">Comunitat Valenciana · Cuerpo de Maestros</p>
      </div>
      <ul className="space-y-3 text-left">
        {PUNTOS.map(({ icono: Icono, titulo, texto }) => (
          <li key={titulo} className="card flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dccv-teal/15"><Icono className="h-5 w-5" aria-hidden="true" /></span>
            <div><h2 className="font-bold">{titulo}</h2><p className="text-sm text-slate-600">{texto}</p></div>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-3">
        <button type="button" className="btn-primary py-3 text-base" onClick={() => continuar('/perfil')}>Configurar mi perfil</button>
        <button type="button" className="btn-secondary" onClick={() => continuar('/')}>Explorar sin perfil</button>
        {puedeInstalar && <button type="button" className="btn-secondary" onClick={() => void instalar()}>Instalar la aplicación</button>}
        {esIos && !instalada && <p className="text-xs text-slate-500">En iPhone: pulsa Compartir y luego «Añadir a pantalla de inicio».</p>}
      </div>
      <p className="text-xs text-slate-500">DCCV no es una aplicación oficial de la Generalitat Valenciana.</p>
    </section>
  );
}
