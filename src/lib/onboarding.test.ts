import { describe, expect, it } from 'vitest';
import { marcarOnboardingVisto, onboardingVisto } from './onboarding';
import type { StorageLike } from './profile';

const memoria = (): StorageLike => {
  const d: Record<string, string> = {};
  return { getItem: (k) => d[k] ?? null, setItem: (k, v) => { d[k] = v; }, removeItem: (k) => { delete d[k]; } };
};

describe('onboarding', () => {
  it('empieza sin ver y recuerda que se ha visto', () => {
    const s = memoria();
    expect(onboardingVisto(s)).toBe(false);
    marcarOnboardingVisto(s);
    expect(onboardingVisto(s)).toBe(true);
  });

  it('tolera almacenamiento ausente o que lanza errores', () => {
    expect(onboardingVisto(null)).toBe(false);
    const roto: StorageLike = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); }, removeItem: () => {} };
    expect(onboardingVisto(roto)).toBe(false);
    expect(() => marcarOnboardingVisto(roto)).not.toThrow();
  });
});
