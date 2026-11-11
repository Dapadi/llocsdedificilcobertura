// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from './app/contexts';
import App from './App';
import { FAVORITOS_KEY } from './lib/favoritos';
import { ONBOARDING_KEY } from './lib/onboarding';
import { STORAGE_KEY, PERFIL_POR_DEFECTO } from './lib/profile';

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({ needRefresh: [false, vi.fn()], offlineReady: [false, vi.fn()], updateServiceWorker: vi.fn() }),
}));

const puesto = (id: string, extra: Record<string, unknown> = {}) => ({
  id, cuerpo: 'MESTRES', especialidad_codigo: '121', especialidad_nombre: 'LENGUA EXTRANJERA: INGLÉS', provincia: 'ALICANTE',
  municipio: 'TIBI', centro_codigo: '03008587', centro: 'CEIP Luis Gosálbez', horas: 11.5, horas_original: '11,5',
  itinerante_original: 'NO', tipo_original: 'Vacante', tipo: 'vacante', requisito: null, composicion: null,
  observaciones: null, pagina: 7, revision: [], ...extra,
});

const DATOS = {
  indice: { convocatorias: [{ id: 'c1', archivo_datos: 'convocatorias/c1.json' }], ultima: 'c1' },
  conv: {
    id: 'c1',
    documento: { nombre_archivo: 'x.pdf', url: 'https://ejemplo.test/x.pdf', url_pagina: 'https://ejemplo.test/', estado: 'provisional', fecha_listado: '2026-11-05', descargado_en: '2026-11-11T20:00:00Z' },
    avisos: [],
    puestos: [
      puesto('100001'),
      puesto('100002', { especialidad_codigo: '128', especialidad_nombre: 'EDUCACIÓN PRIMARIA', municipio: 'CALP', centro: 'CEIP Oltà', tipo_original: 'Sust. Ind.', tipo: 'sustitucion-indeterminada' }),
      puesto('100003', { cuerpo: "PROFESSORS D'ENSENYAMENT SECUNDARI", centro: 'IES NO MAESTROS' }),
    ],
  },
};

function simularRed(con: 'sin-datos' | 'datos') {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    if (con === 'sin-datos') return { ok: false, status: 404, json: async () => ({}) };
    if (url.endsWith('index.json')) return { ok: true, status: 200, json: async () => DATOS.indice };
    if (url.endsWith('status.json')) return { ok: true, status: 200, json: async () => ({ resultado: 'ok', mensaje: 'sin-cambios', ultimo_intento: '2026-11-11T21:00:00Z', ultimo_exito: '2026-11-11T21:00:00Z', ultima_convocatoria: 'c1' }) };
    return { ok: true, status: 200, json: async () => DATOS.conv };
  }));
}

function montar(ruta: string) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <AppProviders>
        <App />
      </AppProviders>
    </MemoryRouter>,
  );
}

const perfilCompleto = { ...PERFIL_POR_DEFECTO, municipio: 'Elche', provincia: 'Alicante', especialidades: ['121'], situacionBolsa: 'ninguna', titulaciones: ['grado'] };

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = vi.fn();
  simularRed('sin-datos');
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('navegación y primer arranque', () => {
  it('en el primer arranque lleva a la bienvenida', async () => {
    montar('/');
    expect(await screen.findByRole('heading', { name: /Encuentra tu plaza/i })).toBeInTheDocument();
  });

  it('tras ver la bienvenida muestra Plazas', async () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    montar('/');
    expect(await screen.findByRole('heading', { name: 'Plazas' })).toBeInTheDocument();
    expect(await screen.findByText(/Todavía no hay listados/i)).toBeInTheDocument();
  });

  it('las rutas desconocidas y /historico redirigen', async () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    montar('/ruta-inventada');
    expect(await screen.findByRole('heading', { name: 'Plazas' })).toBeInTheDocument();
  });

  it('expone las cuatro secciones en la navegación', async () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    montar('/');
    await screen.findByRole('heading', { name: 'Plazas' });
    for (const nav of screen.getAllByRole('navigation', { name: /Principal/i })) {
      for (const t of ['Plazas', 'Favoritos', 'Mi perfil', 'Más']) expect(nav).toHaveTextContent(t);
    }
  });
});

describe('plazas', () => {
  beforeEach(() => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    simularRed('datos');
  });

  it('sin perfil invita a configurarlo y muestra solo plazas de Maestros', async () => {
    montar('/');
    expect(await screen.findByText(/Dinos qué especialidad tienes/i)).toBeInTheDocument();
    expect(screen.getByText('CEIP Luis Gosálbez')).toBeInTheDocument();
    expect(screen.getByText('CEIP Oltà')).toBeInTheDocument();
    expect(screen.queryByText('IES NO MAESTROS')).not.toBeInTheDocument();
  });

  it('con perfil muestra «Para ti» con solo su especialidad y permite ver todas', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(perfilCompleto));
    montar('/');
    expect(await screen.findByText('CEIP Luis Gosálbez')).toBeInTheDocument();
    expect(screen.queryByText('CEIP Oltà')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /Todas/ }));
    expect(screen.getByText('CEIP Oltà')).toBeInTheDocument();
  });

  it('abre el detalle, con enlace al documento oficial y aviso de requisitos', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(perfilCompleto));
    montar('/');
    fireEvent.click(await screen.findByRole('button', { name: /CEIP Luis Gosálbez.*Ver detalle/ }));
    const dialogo = await screen.findByRole('dialog');
    expect(within(dialogo).getAllByText(/Coincide con tu especialidad/).length).toBeGreaterThan(0);
    expect(within(dialogo).getByRole('link', { name: /Abrir el documento oficial/ })).toHaveAttribute('href', 'https://ejemplo.test/x.pdf#page=7');
    expect(within(dialogo).getByText(/DCCV no tramita solicitudes/)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('guarda una plaza en favoritos y aparece en la pestaña Favoritos', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(perfilCompleto));
    montar('/');
    fireEvent.click(await screen.findByRole('button', { name: 'Guardar en favoritos' }));
    expect(JSON.parse(localStorage.getItem(FAVORITOS_KEY) ?? '[]')).toEqual(['100001']);
    cleanup();
    montar('/favoritos');
    expect(await screen.findByText('CEIP Luis Gosálbez')).toBeInTheDocument();
  });

  it('los filtros reducen la lista', async () => {
    montar('/');
    await screen.findByText('CEIP Oltà');
    fireEvent.click(screen.getByRole('button', { name: /Filtros/ }));
    const dialogo = await screen.findByRole('dialog');
    fireEvent.click(within(dialogo).getByRole('radio', { name: 'Vacante' }));
    expect(screen.queryByText('CEIP Oltà')).not.toBeInTheDocument();
    expect(screen.getByText('CEIP Luis Gosálbez')).toBeInTheDocument();
  });
});

describe('favoritos vacíos y perfil', () => {
  beforeEach(() => localStorage.setItem(ONBOARDING_KEY, '1'));

  it('favoritos vacío explica qué hacer', async () => {
    montar('/favoritos');
    expect(await screen.findByText(/Aún no has guardado ninguna/i)).toBeInTheDocument();
  });

  it('el perfil se guarda al instante, sin botón de guardar', async () => {
    montar('/perfil');
    await screen.findByRole('heading', { name: 'Mi perfil' });
    fireEvent.change(screen.getByLabelText('Municipio de residencia'), { target: { value: 'Elche' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /121/ }));
    fireEvent.click(screen.getByRole('radio', { name: 'Alicante' }));
    fireEvent.click(screen.getByRole('radio', { name: /Ninguna bolsa/ }));
    fireEvent.click(screen.getByRole('switch', { name: 'Grado' }));
    const g = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(g).toMatchObject({ municipio: 'Elche', provincia: 'Alicante', especialidades: ['121'], situacionBolsa: 'ninguna', titulaciones: ['grado'] });
    expect(screen.getByText(/Perfil completo/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Guardar perfil/ })).not.toBeInTheDocument();
  });

  it('pide confirmación antes de borrar el perfil', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(perfilCompleto));
    montar('/perfil');
    fireEvent.click(await screen.findByRole('button', { name: 'Borrar mis datos' }));
    const dialogo = await screen.findByRole('dialog');
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    fireEvent.click(within(dialogo).getByRole('button', { name: /Sí, borrar/ }));
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('«Más» explica cómo funciona y avisa de que no es una app oficial', async () => {
    montar('/mas');
    expect(await screen.findByText(/1\. Cuéntanos tu situación/)).toBeInTheDocument();
    expect(screen.getByText(/No es una app oficial/)).toBeInTheDocument();
  });
});
