import { ArrowLeft, ArrowRight, BellRing, Check, MapPinned, Plus, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerfilCtx } from '../app/contexts';
import { ESPECIALIDADES_PROVISIONALES, esCodigoEspecialidadValido } from '../data/especialidades';
import { useInstalarPwa } from '../hooks/useInstalarPwa';
import { marcarOnboardingVisto } from '../lib/onboarding';
import { obtenerStorage, validarPerfil } from '../lib/profile';
import {
  DISTANCIAS_KM,
  NIVELES_INGLES,
  NIVELES_VALENCIANO,
  PROVINCIAS,
  type PerfilErrores,
  type PerfilUsuario,
  type SituacionBolsa,
  type Titulacion,
} from '../types';

/** Pasos del asistente. El 0 es la portada; el último, el resumen. */
const PASOS = ['portada', 'especialidades', 'ubicacion', 'situacion', 'listo'] as const;
type Paso = (typeof PASOS)[number];

/** Campos del perfil que deben ser válidos para avanzar desde cada paso. */
const CAMPOS_OBLIGATORIOS: Partial<Record<Paso, (keyof PerfilUsuario)[]>> = {
  especialidades: ['especialidades'],
  ubicacion: ['municipio', 'provincia'],
  situacion: ['situacionBolsa', 'titulaciones'],
};

const SITUACIONES: { valor: SituacionBolsa; titulo: string; texto: string }[] = [
  { valor: 'bolsa-especialidad', titulo: 'Bolsa de la especialidad', texto: 'Estoy en la bolsa de la especialidad.' },
  { valor: 'otras-bolsas', titulo: 'Otras bolsas', texto: 'Estoy en bolsas de otras especialidades.' },
  { valor: 'ninguna', titulo: 'Ninguna bolsa', texto: 'Todavía no estoy en ninguna bolsa.' },
];

const TITULACIONES: { valor: Titulacion; etiqueta: string }[] = [
  { valor: 'grado', etiqueta: 'Grado' },
  { valor: 'diplomatura', etiqueta: 'Diplomatura' },
  { valor: 'otras', etiqueta: 'Otras titulaciones' },
];

const etiquetaNivel = (n: string) => (n === 'sin-acreditar' ? 'Sin acreditar' : n);

export function BienvenidaPage() {
  const navigate = useNavigate();
  const { perfil, guardar } = usePerfilCtx();
  const { puedeInstalar, instalar, esIos, instalada } = useInstalarPwa();

  const [indice, setIndice] = useState(0);
  const [form, setForm] = useState<PerfilUsuario>(perfil);
  const [intentado, setIntentado] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [errorCodigo, setErrorCodigo] = useState('');
  const [errorGuardado, setErrorGuardado] = useState('');
  const titulo = useRef<HTMLHeadingElement>(null);

  const paso = PASOS[indice];
  const errores: PerfilErrores = validarPerfil(form);
  const obligatorios = CAMPOS_OBLIGATORIOS[paso] ?? [];
  const pendientes = obligatorios.filter((c) => errores[c]);
  const puedeAvanzar = pendientes.length === 0;

  // Al cambiar de paso, el foco va al título (lectores de pantalla y teclado).
  const primerRender = useRef(true);
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    titulo.current?.focus();
    window.scrollTo({ top: 0 });
  }, [indice]);

  const set = <K extends keyof PerfilUsuario>(k: K, v: PerfilUsuario[K]) => setForm((f) => ({ ...f, [k]: v }));
  const alternar = <T extends string>(lista: T[], v: T) => (lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v]);

  const salir = (destino: string) => {
    marcarOnboardingVisto(obtenerStorage());
    navigate(destino, { replace: true });
  };

  const siguiente = () => {
    if (!puedeAvanzar) {
      setIntentado(true);
      return;
    }
    setIntentado(false);
    setIndice((i) => Math.min(i + 1, PASOS.length - 1));
  };

  const terminar = () => {
    const ok = guardar(form);
    if (!ok) {
      setErrorGuardado('No se ha podido guardar en este navegador. Puedes continuar, pero el perfil se perderá al cerrar la página.');
    }
    salir('/');
  };

  const anadirCodigo = () => {
    const c = codigo.trim();
    if (!esCodigoEspecialidadValido(c)) {
      setErrorCodigo('El código tiene 3 dígitos (por ejemplo, 121).');
      return;
    }
    setErrorCodigo('');
    if (!form.especialidades.includes(c)) set('especialidades', [...form.especialidades, c]);
    setCodigo('');
  };

  // ───────────────────────── Portada ─────────────────────────
  if (paso === 'portada') {
    return (
      <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-gradient-to-b from-dccv-navy via-[#1b2540] to-[#0f1626] px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-dccv-teal/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-dccv-yellow/10 blur-3xl" />

        <div className="relative flex flex-1 flex-col items-center justify-center text-center">
          <div className="relative mb-4 flex h-32 w-32 items-center justify-center [@media(min-height:760px)]:mb-8 [@media(min-height:760px)]:h-40 [@media(min-height:760px)]:w-40">
            <span aria-hidden="true" className="anim-pulse absolute h-24 w-24 rounded-full border-2 border-dccv-yellow/60" />
            <span aria-hidden="true" className="anim-pulse absolute h-24 w-24 rounded-full border-2 border-dccv-teal/60 [animation-delay:1.2s]" />
            <svg viewBox="0 0 512 512" className="anim-drop relative h-24 w-24 drop-shadow-xl [@media(min-height:760px)]:h-28 [@media(min-height:760px)]:w-28" role="img" aria-label="Logotipo de DCCV">
              <path d="M256 70c-76 0-136 58-136 132 0 96 136 216 136 216s136-120 136-216c0-74-60-132-136-132z" fill="#FFD54F" />
              <circle cx="256" cy="204" r="56" fill="#1F2A44" />
            </svg>
          </div>

          <h1 ref={titulo} tabIndex={-1} className="anim-in text-3xl font-extrabold leading-tight tracking-tight outline-none focus-visible:ring-0 [animation-delay:150ms] [@media(min-height:760px)]:text-4xl">
            Encuentra tu plaza de <span className="text-dccv-yellow">difícil cobertura</span>
          </h1>
          <p className="anim-in mt-3 max-w-sm text-base text-white/75 [animation-delay:250ms]">
            Las plazas de la Conselleria, filtradas para ti. Sin descargar PDF cada semana.
          </p>

          <ul className="anim-in mt-8 hidden w-full max-w-sm gap-3 text-left [animation-delay:350ms] [@media(min-height:700px)]:grid">
            {[
              { i: SlidersHorizontal, t: 'Configuras tu perfil una vez' },
              { i: MapPinned, t: 'Ves solo las plazas que encajan' },
              { i: BellRing, t: 'Con los datos siempre al día' },
            ].map(({ i: Icono, t }) => (
              <li key={t} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dccv-teal/25"><Icono className="h-5 w-5" aria-hidden="true" /></span>
                <span className="text-sm font-medium">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="anim-in relative mx-auto mt-4 flex [@media(min-height:700px)]:mt-8 w-full max-w-sm flex-col gap-3 [animation-delay:450ms]">
          <button type="button" onClick={siguiente} className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-dccv-yellow text-base font-bold text-dccv-navy shadow-lg transition active:scale-[0.98]">
            Empezar <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => salir('/')} className="min-h-[44px] text-sm font-medium text-white/80 underline-offset-4 hover:underline">
            Explorar sin configurar el perfil
          </button>
          {puedeInstalar && (
            <button type="button" onClick={() => void instalar()} className="min-h-[44px] rounded-xl border border-white/25 text-sm font-semibold">
              Instalar la aplicación
            </button>
          )}
          {esIos && !instalada && <p className="text-center text-xs text-white/60">En iPhone: Compartir → «Añadir a pantalla de inicio».</p>}
          <p className="text-center text-[11px] text-white/50">DCCV no es una aplicación oficial de la Generalitat Valenciana.</p>
        </div>
      </div>
    );
  }

  // ───────────────────────── Pasos con formulario ─────────────────────────
  const numeroPaso = indice; // 1..4
  const totalPasos = PASOS.length - 1;
  const esUltimo = paso === 'listo';

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="mb-6">
        <div className="mb-4 flex items-center gap-3">
          <button type="button" onClick={() => setIndice((i) => Math.max(0, i - 1))} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-line/60" aria-label="Paso anterior">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex-1" role="progressbar" aria-valuemin={1} aria-valuemax={totalPasos} aria-valuenow={numeroPaso} aria-label={`Paso ${numeroPaso} de ${totalPasos}`}>
            <div className="flex gap-1.5">
              {Array.from({ length: totalPasos }, (_, i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i < numeroPaso ? 'bg-dccv-teal' : 'bg-line'}`} />
              ))}
            </div>
          </div>
          <button type="button" onClick={() => salir('/')} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-line/60" aria-label="Saltar configuración">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Paso {numeroPaso} de {totalPasos}</p>
      </header>

      <main key={paso} className="anim-step flex-1">
        {paso === 'especialidades' && (
          <section aria-labelledby="t-paso">
            <h1 id="t-paso" ref={titulo} tabIndex={-1} className="text-3xl font-extrabold tracking-tight outline-none focus-visible:ring-0">¿Qué especialidades tienes?</h1>
            <p className="mt-2 text-muted">Elige todas las que te habilitan. Solo verás plazas de estas especialidades.</p>
            <div role="group" aria-label="Especialidades" className="mt-6 flex flex-wrap gap-2.5">
              {ESPECIALIDADES_PROVISIONALES.map((e) => (
                <button key={e.codigo} type="button" className="chip" aria-pressed={form.especialidades.includes(e.codigo)} onClick={() => set('especialidades', alternar(form.especialidades, e.codigo))}>
                  {form.especialidades.includes(e.codigo) && <Check className="h-4 w-4" aria-hidden="true" />}
                  <span className="font-bold">{e.codigo}</span> {e.nombre}
                </button>
              ))}
              {form.especialidades.filter((c) => !ESPECIALIDADES_PROVISIONALES.some((e) => e.codigo === c)).map((c) => (
                <button key={c} type="button" className="chip" aria-pressed="true" onClick={() => set('especialidades', alternar(form.especialidades, c))}>
                  <Check className="h-4 w-4" aria-hidden="true" /> <span className="font-bold">{c}</span> <X className="h-3.5 w-3.5" aria-label="Quitar" />
                </button>
              ))}
            </div>
            <div className="mt-6">
              <label className="label" htmlFor="cod">¿No ves la tuya? Añade su código</label>
              <div className="flex gap-2">
                <input id="cod" className="input max-w-[9rem]" inputMode="numeric" maxLength={3} placeholder="p. ej. 125" value={codigo} onChange={(e) => setCodigo(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); anadirCodigo(); } }} />
                <button type="button" className="btn-secondary" onClick={anadirCodigo}><Plus className="h-4 w-4" aria-hidden="true" />Añadir</button>
              </div>
              {errorCodigo && <p className="error-text" role="alert">{errorCodigo}</p>}
              <p className="hint">La lista completa de especialidades se incorporará con el catálogo oficial.</p>
            </div>
          </section>
        )}

        {paso === 'ubicacion' && (
          <section aria-labelledby="t-paso">
            <h1 id="t-paso" ref={titulo} tabIndex={-1} className="text-3xl font-extrabold tracking-tight outline-none focus-visible:ring-0">¿Dónde vives?</h1>
            <p className="mt-2 text-muted">Para mostrarte primero las plazas más cercanas.</p>
            <div className="mt-6 space-y-6">
              <div>
                <label className="label" htmlFor="mun">Municipio de residencia</label>
                <input id="mun" className="input" autoComplete="address-level2" maxLength={80} value={form.municipio} onChange={(e) => set('municipio', e.target.value)} />
              </div>
              <div role="radiogroup" aria-label="Provincia">
                <span className="label">Provincia</span>
                <div className="grid grid-cols-3 gap-2">
                  {PROVINCIAS.map((p) => (
                    <button key={p} type="button" role="radio" aria-checked={form.provincia === p} className="chip justify-center" onClick={() => set('provincia', p)}>{p}</button>
                  ))}
                </div>
              </div>
              <div role="radiogroup" aria-label="Distancia máxima por carretera">
                <span className="label">Distancia máxima por carretera</span>
                <div className="flex flex-wrap gap-2">
                  {DISTANCIAS_KM.map((d) => (
                    <button key={d} type="button" role="radio" aria-checked={form.distanciaMaxKm === d} className="chip min-w-[4.5rem] justify-center" onClick={() => set('distanciaMaxKm', d)}>{d} km</button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {paso === 'situacion' && (
          <section aria-labelledby="t-paso">
            <h1 id="t-paso" ref={titulo} tabIndex={-1} className="text-3xl font-extrabold tracking-tight outline-none focus-visible:ring-0">Tu situación</h1>
            <p className="mt-2 text-muted">Estos datos determinan a qué plazas puedes optar.</p>
            <div className="mt-6 space-y-6">
              <div role="radiogroup" aria-label="Situación en bolsas">
                <span className="label">Situación en bolsas</span>
                <div className="grid gap-2">
                  {SITUACIONES.map((s) => (
                    <button key={s.valor} type="button" role="radio" aria-checked={form.situacionBolsa === s.valor} className="chip !items-start !justify-start text-left" onClick={() => set('situacionBolsa', s.valor)}>
                      <span><span className="block font-bold">{s.titulo}</span><span className="block text-xs font-normal text-muted">{s.texto}</span></span>
                    </button>
                  ))}
                </div>
              </div>
              <div role="group" aria-label="Titulación">
                <span className="label">Titulación</span>
                <div className="flex flex-wrap gap-2">
                  {TITULACIONES.map((t) => (
                    <button key={t.valor} type="button" className="chip" aria-pressed={form.titulaciones.includes(t.valor)} onClick={() => set('titulaciones', alternar(form.titulaciones, t.valor))}>{t.etiqueta}</button>
                  ))}
                </div>
              </div>
              <div role="radiogroup" aria-label="Valenciano">
                <span className="label">Valenciano</span>
                <div className="flex flex-wrap gap-2">
                  {NIVELES_VALENCIANO.map((n) => (
                    <button key={n} type="button" role="radio" aria-checked={form.valenciano === n} className="chip" onClick={() => set('valenciano', n)}>{etiquetaNivel(n)}</button>
                  ))}
                </div>
              </div>
              <div role="radiogroup" aria-label="Inglés">
                <span className="label">Inglés</span>
                <div className="flex flex-wrap gap-2">
                  {NIVELES_INGLES.map((n) => (
                    <button key={n} type="button" role="radio" aria-checked={form.ingles === n} className="chip" onClick={() => set('ingles', n)}>{etiquetaNivel(n)}</button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {esUltimo && (
          <section aria-labelledby="t-paso" className="text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-dccv-teal/20">
              <svg viewBox="0 0 24 24" className="h-10 w-10 text-dccv-teal" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path className="anim-check" d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>
            <h1 id="t-paso" ref={titulo} tabIndex={-1} className="text-3xl font-extrabold tracking-tight outline-none focus-visible:ring-0">¡Todo listo!</h1>
            <p className="mt-2 text-muted">Este es tu perfil. Podrás cambiarlo cuando quieras.</p>
            <dl className="card mt-6 space-y-3 text-left text-sm">
              {[
                ['Especialidades', form.especialidades.join(' · ')],
                ['Localidad', `${form.municipio} (${form.provincia ?? '—'})`],
                ['Situación en bolsas', SITUACIONES.find((x) => x.valor === form.situacionBolsa)?.titulo ?? '—'],
                ['Titulación', form.titulaciones.map((t) => TITULACIONES.find((x) => x.valor === t)?.etiqueta ?? t).join(', ') || '—'],
                ['Distancia máxima', `${form.distanciaMaxKm} km`],
                ['Valenciano / Inglés', `${etiquetaNivel(form.valenciano)} / ${etiquetaNivel(form.ingles)}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4"><dt className="text-subtle">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
              ))}
            </dl>
            <p className="hint mt-3">Se guarda solo en este dispositivo. No pedimos DNI ni credenciales.</p>
            {errorGuardado && <p className="error-text" role="alert">{errorGuardado}</p>}
          </section>
        )}
      </main>

      <footer className="mt-6">
        {intentado && !puedeAvanzar && (
          <p role="alert" className="mb-3 text-center text-sm font-medium text-red-600">
            {pendientes.map((c) => errores[c]).filter(Boolean).join(' ')}
          </p>
        )}
        <button type="button" onClick={esUltimo ? terminar : siguiente} className="btn-primary min-h-[52px] w-full rounded-2xl text-base">
          {esUltimo ? 'Ver mis plazas' : 'Continuar'} <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </footer>
    </div>
  );
}
