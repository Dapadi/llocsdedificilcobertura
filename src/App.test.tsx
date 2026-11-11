// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from './app/contexts';
import App from './App';
import { ONBOARDING_KEY } from './lib/onboarding';

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({ needRefresh: [false, vi.fn()], offlineReady: [false, vi.fn()], updateServiceWorker: vi.fn() }),
}));

function montar(ruta: string) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <AppProviders>
        <App />
      </AppProviders>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  // Sin datos publicados todavía: el índice devuelve 404.
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404, json: async () => ({}) })));
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

  it('tras ver la bienvenida muestra el inicio', async () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    montar('/');
    expect(await screen.findByRole('heading', { name: /Mi perfil docente/i })).toBeInTheDocument();
    expect(await screen.findByText(/Todavía no hay ninguna convocatoria/i)).toBeInTheDocument();
  });

  it('las rutas desconocidas redirigen al inicio', async () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    montar('/ruta-inventada');
    expect(await screen.findByRole('heading', { name: /Mi perfil docente/i })).toBeInTheDocument();
  });

  it('la ruta de perfil muestra el formulario', async () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    montar('/perfil');
    expect(await screen.findByRole('button', { name: /Guardar perfil/i })).toBeInTheDocument();
  });

  it('expone navegación principal con las cuatro secciones', async () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    montar('/');
    await screen.findByRole('heading', { name: /Mi perfil docente/i });
    for (const nav of screen.getAllByRole('navigation', { name: /Principal/i })) {
      expect(nav).toHaveTextContent(/Inicio/);
      expect(nav).toHaveTextContent(/Favoritos/);
    }
  });
});
