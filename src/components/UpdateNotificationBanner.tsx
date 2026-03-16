import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SESSION_KEY = 'vizzu-update-dismissed';

export default function UpdateNotificationBanner() {
  const [show, setShow] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [animateIn, setAnimateIn] = useState(false);

  const handleSWUpdate = useCallback((reg: ServiceWorkerRegistration) => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    setRegistration(reg);
    setShow(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimateIn(true));
    });
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

    // Also listen for controllerchange to reload
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, [handleSWUpdate]);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const handleDismiss = () => {
    setAnimateIn(false);
    sessionStorage.setItem(SESSION_KEY, '1');
    setTimeout(() => setShow(false), 300);
  };

  if (!show) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-xl border border-border/60 bg-card shadow-xl transition-all duration-300 ease-out ${
        animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      <div className="p-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <RefreshCw className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">
                Nova versão disponível
              </h4>
              <button
                onClick={handleDismiss}
                className="ml-2 shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Uma nova versão do app foi baixada. Atualize para aplicar as melhorias.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 pl-[3.375rem]">
          <Button
            size="sm"
            onClick={handleUpdate}
            className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-xs px-4"
          >
            Atualizar Agora
          </Button>
          <button
            onClick={handleDismiss}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Depois
          </button>
        </div>
      </div>
    </div>
  );
}
