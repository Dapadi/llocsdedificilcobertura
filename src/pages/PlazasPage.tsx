import { AlertTriangle, SlidersHorizontal, UserRound, WifiOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConvocatoriaCtx, useFavoritosCtx, usePerfilCtx } from '../app/contexts';
import { PlazaCard } from '../components/PlazaCard';
import { PlazaDetalle } from '../components/PlazaDetalle';
import { evaluarPuesto, type Evaluacion } from '../lib/compatibilidad';
import { aFrase } from '../lib/texto';
import { CUERPO_MAESTROS, DIAS_MAX_ANTIGUEDAD, diasDesde, formatearFecha, type Puesto } from '../lib/convocatorias';
import { Segmentado } from '../ui/controles';
import { PaginaGrande } from '../ui/PaginaGrande';
import { Sheet } from '../ui/Sheet';
import { useOnline } from '../hooks/useOnline';

type Vista = 'para-ti' | 'todas';
type TipoFiltro = '' | 'Vacante' | 'Sust. Det.' | 'Sust. Ind.';

interface Fila {
  puesto: Puesto;
  evaluacion: Evaluacion;
}

function Aviso({ tono, icono, children }: { tono: 'info' | 'error'; icono?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div role={tono === 'error' ? 'alert' : 'status'} className={`mb-4 flex gap-3 rounded-ios p-4 text-[15px] ${tono === 'error' ? 'bg-red-500/10' : 'bg-dccv-yellow/30'}`}>
      <span className="mt-0.5 shrink-0">{icono ?? <AlertTriangle className="h-5 w-5" aria-hidden="true" />}</span>
      <div>{children}</div>
    </div>
  );
}

function Esqueleto() {
  return (
    <div aria-busy="true" aria-label="Cargando plazas" className="space-y-3">
      <div className="skeleton h-28" />
      {[0, 1, 2].map((i) => <div key={i} className="skeleton h-[104px]" />)}
    </div>
  );
}

export function PlazasPage() {
  const { perfil, completo } = usePerfilCtx();
  const { datos, error, cargando, recargar } = useConvocatoriaCtx();
  const { esFavorito, alternar } = useFavoritosCtx();
  const online = useOnline();
  const navigate = useNavigate();

  const conv = datos?.convocatoria ?? null;
  const estado = datos?.estado ?? null;

  const [vista, setVista] = useState<Vista>('para-ti');
  const [tipo, setTipo] = useState<TipoFiltro>('');
  const [itinerante, setItinerante] = useState<'' | 'SI' | 'NO'>('');
  const [municipio, setMunicipio] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [abierta, setAbierta] = useState<string | null>(null);

  const filas = useMemo<Fila[]>(
    () => (conv ? conv.puestos.filter((p) => p.cuerpo === CUERPO_MAESTROS).map((puesto) => ({ puesto, evaluacion: evaluarPuesto(puesto, perfil) })) : []),
    [conv, perfil],
  );

  const paraTi = filas.filter((f) => f.evaluacion.estado !== 'no-compatible').length;
  const vistaEfectiva: Vista = completo ? vista : 'todas';

  const especialidades = useMemo(
    () => [...new Map(filas.map((f) => [f.puesto.especialidad_codigo ?? '', f.puesto.especialidad_nombre ?? ''])).entries()].sort(),
    [filas],
  );

  const visibles = filas
    .filter((f) => vistaEfectiva === 'todas' || f.evaluacion.estado !== 'no-compatible')
    .filter((f) => !especialidad || f.puesto.especialidad_codigo === especialidad)
    .filter((f) => !tipo || f.puesto.tipo_original === tipo)
    .filter((f) => !itinerante || f.puesto.itinerante_original === itinerante)
    .filter((f) => !municipio.trim() || (f.puesto.municipio ?? '').toLowerCase().includes(municipio.trim().toLowerCase()))
    .sort((a, b) => {
      // Primero las que encajan con las preferencias; después, por municipio (aún no hay distancia).
      const pa = a.evaluacion.preferencias.tipo === false || a.evaluacion.preferencias.itinerancia === false ? 1 : 0;
      const pb = b.evaluacion.preferencias.tipo === false || b.evaluacion.preferencias.itinerancia === false ? 1 : 0;
      return pa - pb || (a.puesto.municipio ?? '').localeCompare(b.puesto.municipio ?? '', 'es') || a.puesto.id.localeCompare(b.puesto.id);
    });

  const filtrosActivos = [tipo, itinerante, municipio.trim(), especialidad].filter(Boolean).length;
  const antiguedad = conv?.documento.fecha_listado ? diasDesde(conv.documento.fecha_listado) : null;
  const detalle = filas.find((f) => f.puesto.id === abierta) ?? null;

  const limpiarFiltros = () => {
    setTipo('');
    setItinerante('');
    setMunicipio('');
    setEspecialidad('');
  };

  return (
    <PaginaGrande
      titulo="Plazas"
      subtitulo={conv ? `Listado del ${formatearFecha(conv.documento.fecha_listado)}` : 'Difícil cobertura · Maestros'}
      accion={
        conv && (
          <button type="button" className="btn-icon relative" onClick={() => setFiltrosAbiertos(true)} aria-label={`Filtros${filtrosActivos ? `, ${filtrosActivos} activos` : ''}`}>
            <SlidersHorizontal className="h-6 w-6" aria-hidden="true" />
            {filtrosActivos > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-dccv-teal px-1 text-[10px] font-bold text-dccv-navy">{filtrosActivos}</span>}
          </button>
        )
      }
    >
      {!online && conv && (
        <Aviso tono="info" icono={<WifiOff className="h-5 w-5" aria-hidden="true" />}>Sin conexión. Mostramos los últimos datos guardados.</Aviso>
      )}
      {error && <Aviso tono="error"><strong>No hemos podido cargar los datos.</strong> {conv ? 'Mostramos los últimos que teníamos.' : 'Comprueba tu conexión e inténtalo de nuevo.'} <button type="button" className="font-semibold underline" onClick={() => void recargar()}>Reintentar</button></Aviso>}
      {estado?.resultado === 'error' && <Aviso tono="info"><strong>La última comprobación automática falló.</strong> Este puede no ser el listado más reciente: mira la web oficial en Más.</Aviso>}
      {antiguedad !== null && antiguedad > DIAS_MAX_ANTIGUEDAD && <Aviso tono="info"><strong>Este listado tiene {antiguedad} días.</strong> Puede haber uno más nuevo en la web oficial.</Aviso>}

      {cargando && !conv && <Esqueleto />}

      {!cargando && !conv && !error && (
        <div className="card text-center">
          <p className="text-[19px] font-semibold">Todavía no hay listados</p>
          <p className="mt-1 text-[15px] text-muted">En cuanto la Conselleria publique el primero lo verás aquí. Se comprueba cada semana.</p>
        </div>
      )}

      {conv && (
        <>
          {!completo && (
            <div className="card mb-5 text-center">
              <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-dccv-teal/20"><UserRound className="h-6 w-6" aria-hidden="true" /></span>
              <p className="text-[19px] font-semibold">Dinos qué especialidad tienes</p>
              <p className="mx-auto mt-1 max-w-xs text-[15px] text-muted">Así solo te enseñamos las plazas que te interesan. Son 4 pasos rápidos.</p>
              <button type="button" className="btn-primary mt-4 w-full" onClick={() => navigate('/bienvenida')}>Configurar mi perfil</button>
            </div>
          )}

          {completo && (
            <div className="mb-5 rounded-ios bg-gradient-to-br from-dccv-navy to-[#2a3a63] p-5 text-white">
              <p className="text-[15px] text-white/70">Plazas para ti</p>
              <p className="text-[48px] font-bold leading-none tracking-tight" aria-label={`${paraTi} plazas para ti`}>{paraTi}</p>
              <p className="mt-1 text-[15px] text-white/70">de {filas.length} plazas de Maestros en este listado</p>
            </div>
          )}

          {completo && (
            <div className="mb-4">
              <Segmentado<Vista>
                etiqueta="Qué plazas ver"
                valor={vista}
                onCambio={setVista}
                opciones={[{ valor: 'para-ti', etiqueta: `Para ti (${paraTi})` }, { valor: 'todas', etiqueta: `Todas (${filas.length})` }]}
              />
            </div>
          )}

          <p className="sr-only" role="status">{visibles.length} plazas mostradas</p>

          {visibles.length === 0 ? (
            <div className="card text-center">
              <p className="text-[19px] font-semibold">No hay plazas con estos filtros</p>
              <p className="mt-1 text-[15px] text-muted">
                {vistaEfectiva === 'para-ti' && filtrosActivos === 0 ? 'En este listado no hay plazas de tus especialidades. Se actualiza cada semana.' : 'Prueba a quitar algún filtro.'}
              </p>
              {filtrosActivos > 0 && <button type="button" className="btn-secondary mt-4" onClick={limpiarFiltros}>Quitar filtros</button>}
              {filtrosActivos === 0 && vistaEfectiva === 'para-ti' && <button type="button" className="btn-secondary mt-4" onClick={() => setVista('todas')}>Ver todas las plazas</button>}
            </div>
          ) : (
            <ul className="space-y-3">
              {visibles.map((f, i) => (
                <PlazaCard key={f.puesto.id} indice={i} puesto={f.puesto} evaluacion={f.evaluacion} favorita={esFavorito(f.puesto.id)} onAbrir={() => setAbierta(f.puesto.id)} onFavorito={() => alternar(f.puesto.id)} />
              ))}
            </ul>
          )}

          <PlazaDetalle
            puesto={detalle?.puesto ?? null}
            evaluacion={detalle?.evaluacion ?? null}
            convocatoria={conv}
            favorita={detalle ? esFavorito(detalle.puesto.id) : false}
            onFavorito={() => detalle && alternar(detalle.puesto.id)}
            onCerrar={() => setAbierta(null)}
          />

          <Sheet
            abierto={filtrosAbiertos}
            onCerrar={() => setFiltrosAbiertos(false)}
            titulo="Filtros"
            pie={
              <div className="grid grid-cols-2 gap-2.5">
                <button type="button" className="btn-secondary" onClick={limpiarFiltros} disabled={filtrosActivos === 0}>Quitar todos</button>
                <button type="button" className="btn-primary" onClick={() => setFiltrosAbiertos(false)}>Ver {visibles.length}</button>
              </div>
            }
          >
            <div className="space-y-6 pt-2">
              <div>
                <label className="label" htmlFor="f-esp">Especialidad</label>
                <select id="f-esp" className="input" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)}>
                  <option value="">Todas</option>
                  {especialidades.map(([c, n]) => <option key={c} value={c}>{c} · {aFrase(n)}</option>)}
                </select>
              </div>
              <div>
                <span className="label">Tipo de plaza</span>
                <Segmentado<TipoFiltro> etiqueta="Tipo de plaza" valor={tipo} onCambio={setTipo} opciones={[{ valor: '', etiqueta: 'Todas' }, { valor: 'Vacante', etiqueta: 'Vacante' }, { valor: 'Sust. Det.', etiqueta: 'Sust. Det.' }, { valor: 'Sust. Ind.', etiqueta: 'Sust. Ind.' }]} />
              </div>
              <div>
                <span className="label">Itinerante</span>
                <Segmentado<'' | 'SI' | 'NO'> etiqueta="Itinerante" valor={itinerante} onCambio={setItinerante} opciones={[{ valor: '', etiqueta: 'Todas' }, { valor: 'SI', etiqueta: 'Sí' }, { valor: 'NO', etiqueta: 'No' }]} />
              </div>
              <div>
                <label className="label" htmlFor="f-mun">Municipio</label>
                <input id="f-mun" className="input" value={municipio} onChange={(e) => setMunicipio(e.target.value)} placeholder="Escribe un municipio" autoComplete="off" />
              </div>
            </div>
          </Sheet>
        </>
      )}
    </PaginaGrande>
  );
}
