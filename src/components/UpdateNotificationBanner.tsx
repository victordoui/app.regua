import { useEffect, useCallback } from 'react';

/**
 * Invisible component that auto-reloads the page when a new Service Worker
 * version is detected. No user interaction required.
 */
export default function UpdateNotificationBanner() {
  const handleSWUpdate = useCallback((reg: ServiceWorkerRegistration) => {
    if (reg.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const checkWaiting = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting) {
        handleSWUpdate(reg);
      }
    };

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;

      checkWaiting(reg);

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            handleSWUpdate(reg);
          }
        });
      });
    });

    // Reload when new SW takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, [handleSWUpdate]);

  // No visible UI — auto-updates silently
  return null;
}
