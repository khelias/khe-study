/** Installs the worker of a production build. Without one the app still works online. */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  const scope = import.meta.env.BASE_URL;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${scope}sw.js`, { scope }).catch(() => undefined);
  });
}
