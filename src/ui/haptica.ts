/** Vibración muy breve donde el navegador la permite (Android). En iOS no existe y no hace nada. */
export function haptica(ms = 8): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(ms);
  } catch {
    /* sin efecto */
  }
}
