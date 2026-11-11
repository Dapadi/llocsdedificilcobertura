import { Check, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerfilCtx } from '../app/contexts';
import { ESPECIALIDADES_PROVISIONALES, esCodigoEspecialidadValido } from '../data/especialidades';
import { validarPerfil } from '../lib/profile';
import { aFrase } from '../lib/texto';
import { Fila, FilaCheck, FilaOpcion, Grupo, Interruptor, Segmentado } from '../ui/controles';
import { PaginaGrande } from '../ui/PaginaGrande';
import { Sheet } from '../ui/Sheet';
import {
  DISTANCIAS_KM,
  ENTIDADES_CERTIFICADORAS,
  NIVELES_INGLES,
  NIVELES_VALENCIANO,
  PROVINCIAS,
  type EntidadCertificadora,
  type FiltroItCom,
  type PerfilUsuario,
  type SituacionBolsa,
  type Titulacion,
} from '../types';

const SITUACIONES: { valor: SituacionBolsa; titulo: string; texto: string }[] = [
  { valor: 'bolsa-especialidad', titulo: 'Bolsa de la especialidad', texto: 'Estoy en la bolsa de la especialidad' },
  { valor: 'otras-bolsas', titulo: 'Otras bolsas', texto: 'Estoy en bolsas de otras especialidades' },
  { valor: 'ninguna', titulo: 'Ninguna bolsa', texto: 'Todavía no estoy en ninguna' },
];
const TITULACIONES: { valor: Titulacion; etiqueta: string }[] = [
  { valor: 'grado', etiqueta: 'Grado' },
  { valor: 'diplomatura', etiqueta: 'Diplomatura' },
  { valor: 'otras', etiqueta: 'Otras titulaciones' },
];
const nivel = (n: string) => (n === 'sin-acreditar' ? 'Sin acreditar' : n);

const NOMBRE_CAMPO: Partial<Record<keyof PerfilUsuario, string>> = {
  municipio: 'municipio', provincia: 'provincia', especialidades: 'especialidades', situacionBolsa: 'situación en bolsas', titulaciones: 'titulación',
};

/** Ajustes del perfil. Cada cambio se guarda al instante, como en los Ajustes de iOS. */
export function PerfilPage() {
  const { perfil, guardar, restablecer, completo } = usePerfilCtx();
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [errorCodigo, setErrorCodigo] = useState('');
  const [borrando, setBorrando] = useState(false);

  const set = <K extends keyof PerfilUsuario>(k: K, v: PerfilUsuario[K]) => guardar({ ...perfil, [k]: v });
  const errores = validarPerfil(perfil);
  const faltan = (Object.keys(errores) as (keyof PerfilUsuario)[]).map((k) => NOMBRE_CAMPO[k]).filter(Boolean);

  const alternarEsp = (c: string) => set('especialidades', perfil.especialidades.includes(c) ? perfil.especialidades.filter((x) => x !== c) : [...perfil.especialidades, c]);
  const alternarTit = (t: Titulacion) => set('titulaciones', perfil.titulaciones.includes(t) ? perfil.titulaciones.filter((x) => x !== t) : [...perfil.titulaciones, t]);
  const tp = perfil.tiposPuesto;

  const anadir = () => {
    const c = codigo.trim();
    if (!esCodigoEspecialidadValido(c)) return setErrorCodigo('El código tiene 3 dígitos, por ejemplo 121.');
    setErrorCodigo('');
    if (!perfil.especialidades.includes(c)) set('especialidades', [...perfil.especialidades, c]);
    setCodigo('');
  };

  return (
    <PaginaGrande titulo="Mi perfil" subtitulo="Los cambios se guardan solos">
      <div className={`mb-6 flex items-center gap-3 rounded-ios p-4 ${completo ? 'bg-dccv-teal/20' : 'bg-dccv-yellow/30'}`} role="status">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface">{completo ? <Check className="h-5 w-5 text-link" aria-hidden="true" /> : <span className="text-[17px] font-bold">!</span>}</span>
        <p className="text-[15px]">{completo ? <><strong>Perfil completo.</strong> Ya puedes ver las plazas para ti.</> : <><strong>Casi listo.</strong> Falta indicar: {faltan.join(', ')}.</>}</p>
      </div>

      <Grupo titulo="Dónde vives" pie="Para mostrarte primero las plazas más cercanas. La distancia por carretera llegará próximamente.">
        <label className="row cursor-text">
          <span>Municipio</span>
          <input className="input-inline" value={perfil.municipio} onChange={(e) => set('municipio', e.target.value.slice(0, 80))} placeholder="Escríbelo" autoComplete="address-level2" aria-label="Municipio de residencia" />
        </label>
        <div className="px-4 py-3">
          <Segmentado<string> etiqueta="Provincia" valor={perfil.provincia ?? ''} onCambio={(v) => set('provincia', v as PerfilUsuario['provincia'])} opciones={PROVINCIAS.map((p) => ({ valor: p, etiqueta: p }))} />
        </div>
        <label className="row">
          <span>Distancia máxima</span>
          <select className="input-inline cursor-pointer !flex-none" value={perfil.distanciaMaxKm} onChange={(e) => set('distanciaMaxKm', Number(e.target.value) as PerfilUsuario['distanciaMaxKm'])} aria-label="Distancia máxima por carretera">
            {DISTANCIAS_KM.map((d) => <option key={d} value={d}>{d} km</option>)}
          </select>
        </label>
      </Grupo>

      <section className="mb-7">
        <h2 className="section-title">Tus especialidades</h2>
        <div className="group-list">
          {ESPECIALIDADES_PROVISIONALES.map((e) => (
            <FilaCheck key={e.codigo} etiqueta={<><span className="font-semibold">{e.codigo}</span> · {aFrase(e.nombre)}</>} marcada={perfil.especialidades.includes(e.codigo)} onClick={() => alternarEsp(e.codigo)} />
          ))}
          {perfil.especialidades.filter((c) => !ESPECIALIDADES_PROVISIONALES.some((e) => e.codigo === c)).map((c) => (
            <FilaCheck key={c} etiqueta={<><span className="font-semibold">{c}</span> · Añadida por ti</>} marcada onClick={() => alternarEsp(c)} />
          ))}
          <div className="flex items-center gap-2 px-4 py-3">
            <input className="input max-w-[11rem]" inputMode="numeric" maxLength={3} placeholder="Otro código" value={codigo} onChange={(e) => setCodigo(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); anadir(); } }} aria-label="Añadir código de especialidad" />
            <button type="button" className="btn-secondary !min-h-[44px] !rounded-xl !px-4 !text-[15px]" onClick={anadir}><Plus className="h-4 w-4" aria-hidden="true" />Añadir</button>
          </div>
        </div>
        {errorCodigo && <p className="error-text px-4" role="alert">{errorCodigo}</p>}
        <p className="section-foot">Solo verás plazas de las especialidades que marques. La lista completa llegará con el catálogo oficial.</p>
      </section>

      <Grupo titulo="Tu situación en bolsas">
        {SITUACIONES.map((s) => <FilaOpcion key={s.valor} etiqueta={s.titulo} detalle={s.texto} marcada={perfil.situacionBolsa === s.valor} onClick={() => set('situacionBolsa', s.valor)} />)}
      </Grupo>

      <Grupo titulo="Tu titulación">
        {TITULACIONES.map((t) => (
          <Fila key={t.valor} etiqueta={t.etiqueta}>
            <Interruptor etiqueta={t.etiqueta} marcado={perfil.titulaciones.includes(t.valor)} onCambio={() => alternarTit(t.valor)} />
          </Fila>
        ))}
      </Grupo>

      <Grupo titulo="Idiomas" pie="Un certificado de idioma no equivale a una habilitación docente.">
        <label className="row">
          <span>Valenciano</span>
          <select className="input-inline cursor-pointer !flex-none" value={perfil.valenciano} onChange={(e) => set('valenciano', e.target.value as PerfilUsuario['valenciano'])} aria-label="Nivel de valenciano">
            {NIVELES_VALENCIANO.map((n) => <option key={n} value={n}>{nivel(n)}</option>)}
          </select>
        </label>
        <label className="row">
          <span>Inglés</span>
          <select className="input-inline cursor-pointer !flex-none" value={perfil.ingles} onChange={(e) => set('ingles', e.target.value as PerfilUsuario['ingles'])} aria-label="Nivel de inglés">
            {NIVELES_INGLES.map((n) => <option key={n} value={n}>{nivel(n)}</option>)}
          </select>
        </label>
        <label className="row">
          <span>Certificado de inglés</span>
          <select className="input-inline cursor-pointer !flex-none" value={perfil.inglesCertificado ?? ''} onChange={(e) => set('inglesCertificado', (e.target.value || null) as EntidadCertificadora | null)} aria-label="Entidad del certificado de inglés">
            <option value="">Ninguno</option>
            {ENTIDADES_CERTIFICADORAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </Grupo>

      <Grupo titulo="Qué plazas prefieres" pie="Son preferencias: las plazas que no las cumplan salen más abajo, pero no se ocultan.">
        <Fila etiqueta="Vacantes"><Interruptor etiqueta="Vacantes" marcado={tp.vacante} onCambio={(v) => set('tiposPuesto', { ...tp, vacante: v })} /></Fila>
        <Fila etiqueta="Sustituciones determinadas"><Interruptor etiqueta="Sustituciones determinadas" marcado={tp.sustitucionDeterminada} onCambio={(v) => set('tiposPuesto', { ...tp, sustitucionDeterminada: v })} /></Fila>
        <Fila etiqueta="Sustituciones indeterminadas"><Interruptor etiqueta="Sustituciones indeterminadas" marcado={tp.sustitucionIndeterminada} onCambio={(v) => set('tiposPuesto', { ...tp, sustitucionIndeterminada: v })} /></Fila>
        <div className="px-4 py-3">
          <p className="mb-2 text-[15px]">Puestos itinerantes</p>
          <Segmentado<FiltroItCom> etiqueta="Puestos itinerantes" valor={perfil.itCom} onCambio={(v) => set('itCom', v)} opciones={[{ valor: 'todos', etiqueta: 'Todos' }, { valor: 'itinerante', etiqueta: 'Sí' }, { valor: 'ninguno', etiqueta: 'No' }]} />
        </div>
      </Grupo>

      {completo && <button type="button" className="btn-primary mb-4 w-full" onClick={() => navigate('/')}>Ver mis plazas</button>}

      <Grupo pie="Se borra solo de este dispositivo. DCCV no guarda tus datos en ningún servidor.">
        <button type="button" className="row justify-center !text-red-600" onClick={() => setBorrando(true)}>Borrar mis datos</button>
      </Grupo>

      <Sheet
        abierto={borrando}
        onCerrar={() => setBorrando(false)}
        titulo="¿Borrar tu perfil?"
        pie={
          <div className="grid gap-2.5">
            <button type="button" className="btn-destructive !bg-red-600 !text-white" onClick={() => { restablecer(); setBorrando(false); }}>Sí, borrar</button>
            <button type="button" className="btn-secondary" onClick={() => setBorrando(false)}>Cancelar</button>
          </div>
        }
      >
        <p className="pt-2 text-[15px] text-muted">Se eliminarán tus especialidades, ubicación y preferencias de este dispositivo. Tus plazas favoritas no se borran.</p>
      </Sheet>
    </PaginaGrande>
  );
}
