import { Plus, Save, Trash2, X } from 'lucide-react';
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import {
  CATALOGO_ESPECIALIDADES_OFICIAL_CARGADO,
  ESPECIALIDADES_PROVISIONALES,
  esCodigoEspecialidadValido,
} from '../data/especialidades';
import { PERFIL_POR_DEFECTO, validarPerfil } from '../lib/profile';
import {
  DISTANCIAS_KM,
  ENTIDADES_CERTIFICADORAS,
  NIVELES_INGLES,
  NIVELES_VALENCIANO,
  PROVINCIAS,
  type EntidadCertificadora,
  type FiltroItCom,
  type NivelIngles,
  type NivelValenciano,
  type PerfilErrores,
  type PerfilUsuario,
  type Provincia,
  type SituacionBolsa,
  type Titulacion,
} from '../types';

interface Props {
  perfil: PerfilUsuario;
  almacenamientoDisponible: boolean;
  onGuardar: (p: PerfilUsuario) => boolean;
  onRestablecer: () => void;
  onGuardado: () => void;
}

function Seccion({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: ReactNode }) {
  return (
    <section className="card space-y-4">
      <div>
        <h2 className="text-base font-bold">{titulo}</h2>
        {descripcion && <p className="hint">{descripcion}</p>}
      </div>
      {children}
    </section>
  );
}

function Campo({ etiqueta, error, hint, children, htmlFor }: { etiqueta: string; error?: string; hint?: string; children: ReactNode; htmlFor: string }) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>{etiqueta}</label>
      {children}
      {hint && <p className="hint">{hint}</p>}
      {error && <p className="error-text" role="alert">{error}</p>}
    </div>
  );
}

function Grupo({ leyenda, error, hint, children }: { leyenda: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="label">{leyenda}</legend>
      <div className="flex flex-wrap gap-x-5 gap-y-2">{children}</div>
      {hint && <p className="hint">{hint}</p>}
      {error && <p className="error-text" role="alert">{error}</p>}
    </fieldset>
  );
}

function Opcion({ tipo, nombre, etiqueta, marcado, onChange }: { tipo: 'radio' | 'checkbox'; nombre: string; etiqueta: string; marcado: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type={tipo} name={nombre} checked={marcado} onChange={onChange} className="h-4 w-4 accent-dccv-teal" />
      {etiqueta}
    </label>
  );
}

const SITUACIONES: { valor: SituacionBolsa; etiqueta: string }[] = [
  { valor: 'bolsa-especialidad', etiqueta: 'Pertenezco a la bolsa de la especialidad' },
  { valor: 'otras-bolsas', etiqueta: 'Pertenezco a otras bolsas' },
  { valor: 'ninguna', etiqueta: 'No pertenezco a ninguna bolsa' },
];

const TITULACIONES: { valor: Titulacion; etiqueta: string }[] = [
  { valor: 'grado', etiqueta: 'Grado' },
  { valor: 'diplomatura', etiqueta: 'Diplomatura' },
  { valor: 'otras', etiqueta: 'Otras titulaciones' },
];

const IT_COM: { valor: FiltroItCom; etiqueta: string }[] = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'itinerante', etiqueta: 'Itinerante' },
  { valor: 'compartido', etiqueta: 'Compartido' },
  { valor: 'ninguno', etiqueta: 'Ninguno' },
];

const etiquetaNivel = (n: string) => (n === 'sin-acreditar' ? 'Sin acreditar' : n);

export function PerfilPage({ perfil, almacenamientoDisponible, onGuardar, onRestablecer, onGuardado }: Props) {
  const id = useId();
  const [form, setForm] = useState<PerfilUsuario>(perfil);
  const [errores, setErrores] = useState<PerfilErrores>({});
  const [codigoManual, setCodigoManual] = useState('');
  const [errorCodigo, setErrorCodigo] = useState('');
  const [aviso, setAviso] = useState('');

  const set = <K extends keyof PerfilUsuario>(k: K, v: PerfilUsuario[K]) => setForm((f) => ({ ...f, [k]: v }));

  const alternarEspecialidad = (codigo: string) =>
    set('especialidades', form.especialidades.includes(codigo) ? form.especialidades.filter((c) => c !== codigo) : [...form.especialidades, codigo]);

  const alternarTitulacion = (t: Titulacion) =>
    set('titulaciones', form.titulaciones.includes(t) ? form.titulaciones.filter((x) => x !== t) : [...form.titulaciones, t]);

  const anadirCodigo = () => {
    const c = codigoManual.trim();
    if (!esCodigoEspecialidadValido(c)) {
      setErrorCodigo('El código debe tener 3 dígitos (por ejemplo, 121).');
      return;
    }
    setErrorCodigo('');
    if (!form.especialidades.includes(c)) set('especialidades', [...form.especialidades, c]);
    setCodigoManual('');
  };

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const errs = validarPerfil(form);
    setErrores(errs);
    if (Object.keys(errs).length > 0) {
      setAviso('Revisa los campos marcados antes de guardar.');
      return;
    }
    const ok = onGuardar(form);
    if (ok) {
      onGuardado();
    } else {
      setAviso('No se ha podido guardar en este navegador (almacenamiento bloqueado). El perfil solo se mantendrá mientras la página siga abierta.');
    }
  };

  const nombresProvisionales = new Map(ESPECIALIDADES_PROVISIONALES.map((e) => [e.codigo, e.nombre]));

  return (
    <form onSubmit={enviar} noValidate className="space-y-6" aria-labelledby={`${id}-t`}>
      <div>
        <h1 id={`${id}-t`} className="text-xl font-bold">Mi perfil docente</h1>
        <p className="mt-1 text-sm text-slate-600">
          Los datos se guardan únicamente en este dispositivo (localStorage). No se envían a ningún servidor.
        </p>
        {!almacenamientoDisponible && (
          <p className="mt-2 rounded border border-dccv-yellow bg-dccv-yellow/20 p-2 text-sm" role="status">
            Tu navegador no permite guardar datos locales: el perfil se perderá al cerrar la página.
          </p>
        )}
      </div>

      <Seccion titulo="Ubicación" descripcion="La distancia se calculará por carretera cuando se implemente la geolocalización (Fase 6).">
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo etiqueta="Municipio de residencia" htmlFor={`${id}-mun`} error={errores.municipio}>
            <input id={`${id}-mun`} className="input" value={form.municipio} onChange={(e) => set('municipio', e.target.value)} autoComplete="address-level2" maxLength={80} />
          </Campo>
          <Campo etiqueta="Provincia" htmlFor={`${id}-prov`} error={errores.provincia}>
            <select id={`${id}-prov`} className="input" value={form.provincia ?? ''} onChange={(e) => set('provincia', (e.target.value || null) as Provincia | null)}>
              <option value="">Selecciona…</option>
              {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Distancia máxima por carretera" htmlFor={`${id}-dist`}>
            <select id={`${id}-dist`} className="input" value={form.distanciaMaxKm} onChange={(e) => set('distanciaMaxKm', Number(e.target.value) as PerfilUsuario['distanciaMaxKm'])}>
              {DISTANCIAS_KM.map((d) => <option key={d} value={d}>{d} km</option>)}
            </select>
          </Campo>
        </div>
      </Seccion>

      <Seccion titulo="Especialidades" descripcion="Requisito de acceso: una plaza de una especialidad que no hayas seleccionado no se mostrará como compatible.">
        {!CATALOGO_ESPECIALIDADES_OFICIAL_CARGADO && (
          <p className="rounded border border-dccv-yellow bg-dccv-yellow/20 p-2 text-sm" role="status">
            El catálogo oficial de especialidades aún no está cargado (Fase 2). Se ofrece una lista provisional y puedes
            añadir cualquier código de 3 dígitos manualmente.
          </p>
        )}
        <Grupo leyenda="Catálogo provisional" error={errores.especialidades}>
          {ESPECIALIDADES_PROVISIONALES.map((e) => (
            <Opcion key={e.codigo} tipo="checkbox" nombre="especialidad" etiqueta={`${e.codigo} · ${e.nombre}`} marcado={form.especialidades.includes(e.codigo)} onChange={() => alternarEspecialidad(e.codigo)} />
          ))}
        </Grupo>
        <div>
          <label className="label" htmlFor={`${id}-cod`}>Añadir código de especialidad</label>
          <div className="flex gap-2">
            <input id={`${id}-cod`} className="input max-w-[10rem]" inputMode="numeric" maxLength={3} value={codigoManual} onChange={(e) => setCodigoManual(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); anadirCodigo(); } }} placeholder="p. ej. 121" />
            <button type="button" className="btn-secondary" onClick={anadirCodigo}><Plus className="h-4 w-4" aria-hidden="true" />Añadir</button>
          </div>
          {errorCodigo && <p className="error-text" role="alert">{errorCodigo}</p>}
        </div>
        {form.especialidades.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Especialidades seleccionadas">
            {form.especialidades.map((c) => (
              <li key={c} className="flex items-center gap-1 rounded-full bg-dccv-navy px-3 py-1 text-xs font-semibold text-white">
                {c}{nombresProvisionales.has(c) ? ` · ${nombresProvisionales.get(c)}` : ''}
                <button type="button" onClick={() => alternarEspecialidad(c)} aria-label={`Quitar especialidad ${c}`} className="rounded-full p-0.5 hover:bg-white/20"><X className="h-3 w-3" aria-hidden="true" /></button>
              </li>
            ))}
          </ul>
        )}
      </Seccion>

      <Seccion titulo="Situación administrativa y titulación" descripcion="Estos datos se usarán para comprobar requisitos obligatorios según los anexos de cada convocatoria (Fase 5).">
        <Grupo leyenda="Situación en bolsas" error={errores.situacionBolsa}>
          {SITUACIONES.map((s) => (
            <Opcion key={s.valor} tipo="radio" nombre="situacionBolsa" etiqueta={s.etiqueta} marcado={form.situacionBolsa === s.valor} onChange={() => set('situacionBolsa', s.valor)} />
          ))}
        </Grupo>
        <Grupo leyenda="Titulación" error={errores.titulaciones} hint="Clasificación general provisional. Las titulaciones y habilitaciones reconocidas para cada especialidad se incorporarán con el catálogo oficial.">
          {TITULACIONES.map((t) => (
            <Opcion key={t.valor} tipo="checkbox" nombre="titulacion" etiqueta={t.etiqueta} marcado={form.titulaciones.includes(t.valor)} onChange={() => alternarTitulacion(t.valor)} />
          ))}
        </Grupo>
      </Seccion>

      <Seccion titulo="Acreditación lingüística" descripcion="Un certificado lingüístico no equivale automáticamente a una habilitación docente.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo etiqueta="Valenciano" htmlFor={`${id}-val`}>
            <select id={`${id}-val`} className="input" value={form.valenciano} onChange={(e) => set('valenciano', e.target.value as NivelValenciano)}>
              {NIVELES_VALENCIANO.map((n) => <option key={n} value={n}>{etiquetaNivel(n)}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Inglés" htmlFor={`${id}-ing`}>
            <select id={`${id}-ing`} className="input" value={form.ingles} onChange={(e) => set('ingles', e.target.value as NivelIngles)}>
              {NIVELES_INGLES.map((n) => <option key={n} value={n}>{etiquetaNivel(n)}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Certificado de inglés" htmlFor={`${id}-cert`} error={errores.inglesCertificado}>
            <select id={`${id}-cert`} className="input" value={form.inglesCertificado ?? ''} onChange={(e) => set('inglesCertificado', (e.target.value || null) as EntidadCertificadora | null)}>
              <option value="">Ninguno</option>
              {ENTIDADES_CERTIFICADORAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Campo>
        </div>
      </Seccion>

      <Seccion titulo="Preferencias laborales" descripcion="Son preferencias personales: ordenan y filtran resultados, pero no sustituyen a los requisitos obligatorios.">
        <Grupo leyenda="Tipo de puesto" error={errores.tiposPuesto}>
          <Opcion tipo="checkbox" nombre="tp" etiqueta="Vacantes" marcado={form.tiposPuesto.vacante} onChange={() => set('tiposPuesto', { ...form.tiposPuesto, vacante: !form.tiposPuesto.vacante })} />
          <Opcion tipo="checkbox" nombre="tp" etiqueta="Sustituciones determinadas" marcado={form.tiposPuesto.sustitucionDeterminada} onChange={() => set('tiposPuesto', { ...form.tiposPuesto, sustitucionDeterminada: !form.tiposPuesto.sustitucionDeterminada })} />
          <Opcion tipo="checkbox" nombre="tp" etiqueta="Sustituciones indeterminadas" marcado={form.tiposPuesto.sustitucionIndeterminada} onChange={() => set('tiposPuesto', { ...form.tiposPuesto, sustitucionIndeterminada: !form.tiposPuesto.sustitucionIndeterminada })} />
        </Grupo>
        <Grupo leyenda="IT/COM" hint="Se compararán los valores originales de la columna IT/COM de cada listado; su significado se tomará del diccionario validado con la documentación oficial.">
          {IT_COM.map((o) => (
            <Opcion key={o.valor} tipo="radio" nombre="itcom" etiqueta={o.etiqueta} marcado={form.itCom === o.valor} onChange={() => set('itCom', o.valor)} />
          ))}
        </Grupo>
      </Seccion>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <button type="submit" className="btn-primary"><Save className="h-4 w-4" aria-hidden="true" />Guardar perfil</button>
        <button type="button" className="btn-secondary" onClick={() => { if (window.confirm('¿Borrar el perfil guardado en este dispositivo?')) { onRestablecer(); setForm(structuredClone(PERFIL_POR_DEFECTO)); setErrores({}); setAviso(''); } }}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />Borrar perfil
        </button>
        <p role="status" className="text-sm font-medium text-red-700">{aviso}</p>
      </div>
    </form>
  );
}
