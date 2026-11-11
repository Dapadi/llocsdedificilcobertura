import { BellRing, Download, FileText, History, ListChecks, MapPinned, Share, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useConvocatoriaCtx } from '../app/contexts';
import { useInstalarPwa } from '../hooks/useInstalarPwa';
import { formatearFecha } from '../lib/convocatorias';
import { Fila, Grupo } from '../ui/controles';
import { PaginaGrande } from '../ui/PaginaGrande';
import { Sheet } from '../ui/Sheet';

const URL_OFICIAL = 'https://ceice.gva.es/va/web/rrhh-educacion/convocatoria-y-peticion-telematica6';

function momento(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
}

export function MasPage() {
  const { datos, recargar, cargando } = useConvocatoriaCtx();
  const { puedeInstalar, instalar, instalada, esIos } = useInstalarPwa();
  const [guiaInstalar, setGuiaInstalar] = useState(false);
  const conv = datos?.convocatoria ?? null;
  const estado = datos?.estado ?? null;

  return (
    <PaginaGrande titulo="Más">
      <Grupo titulo="Cómo funciona">
        <Fila icono={<SlidersHorizontal className="h-5 w-5" aria-hidden="true" />} etiqueta="1. Cuéntanos tu situación" detalle="Tu especialidad, dónde vives y tus idiomas. Se guarda solo en tu móvil." />
        <Fila icono={<ListChecks className="h-5 w-5" aria-hidden="true" />} etiqueta="2. Mira las plazas para ti" detalle="Cada semana leemos el listado oficial y te enseñamos las que encajan." />
        <Fila icono={<MapPinned className="h-5 w-5" aria-hidden="true" />} etiqueta="3. Pídela en la web oficial" detalle="Desde cada plaza abres el documento oficial. Las solicitudes se hacen siempre en la web de la Conselleria." />
      </Grupo>

      <Grupo titulo="Los datos">
        <Fila etiqueta="Último listado" valor={conv ? formatearFecha(conv.documento.fecha_listado) : '—'} />
        <Fila etiqueta="Tipo de documento" valor={conv ? (conv.documento.estado === 'provisional' ? 'Provisional' : 'Sin determinar') : '—'} detalle="Un listado provisional no es una adjudicación" />
        <Fila etiqueta="Última comprobación" valor={momento(estado?.ultimo_intento)} detalle={estado?.resultado === 'error' ? 'Falló: se conserva el último listado válido' : 'Se comprueba cada jueves'} />
        <Fila etiqueta="Datos descargados" valor={momento(conv?.documento.descargado_en)} />
        <button type="button" className="row" onClick={() => void recargar()} disabled={cargando}>
          <span className="text-link">{cargando ? 'Actualizando…' : 'Actualizar ahora'}</span>
        </button>
        <Fila icono={<FileText className="h-5 w-5" aria-hidden="true" />} etiqueta="Web oficial de la Conselleria" href={URL_OFICIAL} />
        {conv && <Fila etiqueta="Documento original (PDF)" detalle={conv.documento.nombre_archivo} href={conv.documento.url} />}
      </Grupo>

      <Grupo titulo="La aplicación" pie={instalada ? undefined : 'Instálala para abrirla como una app, a pantalla completa y sin conexión.'}>
        {instalada ? (
          <Fila icono={<Download className="h-5 w-5" aria-hidden="true" />} etiqueta="Instalada" detalle="Ya la tienes en tu pantalla de inicio" />
        ) : (
          <Fila
            icono={<Download className="h-5 w-5" aria-hidden="true" />}
            etiqueta="Instalar en tu móvil"
            chevron
            onClick={() => (puedeInstalar ? void instalar() : setGuiaInstalar(true))}
          />
        )}
      </Grupo>

      <Grupo titulo="Próximamente">
        <Fila icono={<History className="h-5 w-5" aria-hidden="true" />} etiqueta="Histórico de listados" detalle="Qué centros y municipios repiten plazas" valor="Pronto" />
        <Fila icono={<BellRing className="h-5 w-5" aria-hidden="true" />} etiqueta="Avisos de listados nuevos" detalle="Te avisamos cuando haya plazas para ti" valor="Pronto" />
      </Grupo>

      <Grupo titulo="Legal y privacidad">
        <Fila icono={<ShieldCheck className="h-5 w-5" aria-hidden="true" />} etiqueta="Tus datos son tuyos" detalle="Todo se guarda en tu dispositivo. No te pedimos DNI ni claves de la Generalitat." />
        <Fila etiqueta="No es una app oficial" detalle="DCCV no pertenece a la Generalitat Valenciana. El documento oficial manda siempre sobre lo que veas aquí." />
      </Grupo>

      <Sheet abierto={guiaInstalar} onCerrar={() => setGuiaInstalar(false)} titulo="Instalar DCCV" pie={<button type="button" className="btn-primary w-full" onClick={() => setGuiaInstalar(false)}>Entendido</button>}>
        <ol className="mt-2 space-y-3">
          {(esIos
            ? [
                ['Pulsa el botón Compartir', 'El cuadrado con una flecha hacia arriba, en la barra de Safari.'],
                ['Elige «Añadir a pantalla de inicio»', 'Desliza hacia abajo en el menú si no lo ves.'],
                ['Pulsa «Añadir»', 'DCCV aparecerá como una app más en tu pantalla de inicio.'],
              ]
            : [
                ['Abre el menú del navegador', 'Los tres puntos, arriba a la derecha.'],
                ['Pulsa «Instalar aplicación»', 'O «Añadir a pantalla de inicio».'],
                ['Confirma', 'DCCV aparecerá como una app más en tu móvil.'],
              ]
          ).map(([t, d], i) => (
            <li key={t} className="flex gap-3 rounded-ios bg-surface p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dccv-teal/20 text-[15px] font-bold">{i + 1}</span>
              <div>
                <p className="flex items-center gap-1.5 font-semibold">{t}{i === 0 && esIos && <Share className="h-4 w-4" aria-hidden="true" />}</p>
                <p className="text-[15px] text-muted">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </Sheet>
    </PaginaGrande>
  );
}
