import type { StorageLike } from './profile';

export const ONBOARDING_KEY = 'dccv.onboarding.v1';

/** ¿Ha visto el usuario la pantalla de bienvenida? Ante cualquier fallo de almacenamiento, se asume que no. */
export function onboardingVisto(storage: StorageLike | null): boolean {
  try {
    return storage?.getItem(ONBOARDING_KEY) === '1';
  } catch {
    return false;
  }
}

export function marcarOnboardingVisto(storage: StorageLike | null): void {
  try {
    storage?.setItem(ONBOARDING_KEY, '1');
  } catch {
    /* almacenamiento bloqueado: la bienvenida volverá a mostrarse, sin más consecuencias */
  }
}
