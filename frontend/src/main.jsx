import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Register Service Worker for Chrome PWA & WebAPK install
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[EL PWA] Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('[EL PWA] Service Worker registration failed:', err);
      });
  });
}

// Global beforeinstallprompt hook so UI can trigger Chrome APK install
window.deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  window.dispatchEvent(new CustomEvent('pwa-installable'));
  console.log('[EL PWA] Chrome WebAPK install prompt ready');
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
