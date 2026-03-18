import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Clean up stale Workbox/PWA caches from previous builds
if ('caches' in window) {
  caches.keys().then((names) => {
    names.forEach((name) => {
      if (name.startsWith('workbox-precache') || name.startsWith('vizzu-')) {
        caches.delete(name);
      }
    });
  });
}

// Unregister any Workbox-generated service workers (keep only manual /sw.js)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((reg) => {
      // Unregister Workbox SWs (their scriptURL contains "sw.js" from VitePWA build output)
      const url = reg.active?.scriptURL || '';
      if (!url.endsWith('/sw.js')) {
        reg.unregister();
      }
    });
  });
}

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
  <StrictMode>
    <App />
  </StrictMode>
)