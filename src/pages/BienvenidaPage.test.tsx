// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '../app/contexts';
import App from '../App';
import { ONBOARDING_KEY } from '../lib/onboarding';
import { STORAGE_KEY } from '../lib/profile';

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({ needRefresh: [false, vi.fn()], offlineReady: [false, vi.fn()], updateServiceWorker: vi.fn() }),
}));

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = vi.fn();
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404, json: async () => ({}) })));
  render(
    <MemoryRouter initialEntries={['/bienvenida']}>
      <AppProviders>
        <App />
      </AppProviders>
    </MemoryRouter>,
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const clic = (nombre: RegExp | string) => fireEvent.click(screen.getByRole('button', { name: nombre }));

describe('asistente de bienvenida', () => {
  it('no deja avanzar sin especialidad y explica por qué', () => {
    clic(/Empezar/);
    clic(/Continuar/);
    expect(screen.getByRole('alert')).toHaveTextContent(/al menos una especialidad/i);
    expect(screen.getByRole('heading', { name: /especialidades tienes/i })).toBeInTheDocument();
  });

  it('completa los pasos y guarda el perfil', () => {
    clic(/Empezar/);
    fireEvent.click(screen.getByRole('button', { name: /121/ }));
    clic(/Continuar/);

    fireEvent.change(screen.getByLabelText(/Municipio de residencia/i), { target: { value: 'Municipio de prueba' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Alicante' }));
    fireEvent.click(screen.getByRole('radio', { name: '30 km' }));
    clic(/Continuar/);

    fireEvent.click(screen.getByRole('radio', { name: /Bolsa de la especialidad/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Grado' }));
    fireEvent.click(within(screen.getByRole('radiogroup', { name: 'Valenciano' })).getByRole('radio', { name: 'C1' }));
    clic(/Continuar/);

    expect(screen.getByRole('heading', { name: /Todo listo/i })).toBeInTheDocument();
    clic(/Ver mis plazas/);

    const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(guardado).toMatchObject({ municipio: 'Municipio de prueba', provincia: 'Alicante', distanciaMaxKm: 30, especialidades: ['121'], situacionBolsa: 'bolsa-especialidad', titulaciones: ['grado'], valenciano: 'C1' });
    expect(localStorage.getItem(ONBOARDING_KEY)).toBe('1');
  });

  it('permite explorar sin perfil sin guardar nada', () => {
    clic(/Explorar sin configurar/);
    expect(localStorage.getItem(ONBOARDING_KEY)).toBe('1');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('valida el código de especialidad añadido a mano', () => {
    clic(/Empezar/);
    fireEvent.change(screen.getByLabelText(/Añade su código/i), { target: { value: '12' } });
    clic(/Añadir/);
    expect(screen.getByRole('alert')).toHaveTextContent(/3 dígitos/);
    fireEvent.change(screen.getByLabelText(/Añade su código/i), { target: { value: '125' } });
    clic(/Añadir/);
    expect(screen.getByRole('button', { name: /125/ })).toHaveAttribute('aria-pressed', 'true');
  });
});
