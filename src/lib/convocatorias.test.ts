import { describe, expect, it } from 'vitest';
import { cargarDatos, diasDesde, formatearFecha } from './convocatorias';

const resp = (status: number, cuerpo?: unknown) => ({ ok: status >= 200 && status < 300, status, json: async () => cuerpo });

describe('cargarDatos', () => {
  it('devuelve convocatoria nula si todavía no hay datos', async () => {
    const d = await cargarDatos('/', async () => resp(404));
    expect(d).toEqual({ convocatoria: null, estado: null });
  });

  it('carga índice, estado y última convocatoria', async () => {
    const urls: string[] = [];
    const d = await cargarDatos('/app/', async (u) => {
      urls.push(u);
      if (u.endsWith('index.json')) return resp(200, { convocatorias: [{ id: 'a', archivo_datos: 'convocatorias/a.json' }], ultima: 'a' });
      if (u.endsWith('status.json')) return resp(200, { resultado: 'ok' });
      return resp(200, { id: 'a', puestos: [] });
    });
    expect(urls).toContain('/app/data/convocatorias/a.json');
    expect(d.convocatoria?.id).toBe('a');
    expect(d.estado?.resultado).toBe('ok');
  });

  it('propaga los errores de red o de servidor', async () => {
    await expect(cargarDatos('/', async () => resp(500))).rejects.toThrow(/HTTP 500/);
    await expect(cargarDatos('/', async () => { throw new Error('sin red'); })).rejects.toThrow('sin red');
  });

  it('detecta un índice incoherente', async () => {
    await expect(
      cargarDatos('/', async (u) => (u.endsWith('index.json') ? resp(200, { convocatorias: [], ultima: 'x' }) : resp(404))),
    ).rejects.toThrow(/incoherente/);
  });
});

describe('fechas', () => {
  it('formatea y calcula antigüedad', () => {
    expect(formatearFecha('2026-11-05')).toBe('05/11/2026');
    expect(formatearFecha(null)).toBe('—');
    expect(diasDesde('2026-11-05', new Date(2026, 10, 12))).toBe(7);
    expect(diasDesde('2026-11-05', new Date(2026, 10, 5))).toBe(0);
  });
});
