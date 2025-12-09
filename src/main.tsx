
// Polyfill Buffer for @react-pdf/renderer browser compatibility
// import { Buffer } from 'buffer';
// (window as any).Buffer = Buffer;
// (window as any).global = window;
// (window as any).process = (window as any).process || { env: {}, version: '', versions: {}, platform: 'browser', nextTick: (fn: any) => setTimeout(fn, 0) };

import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from './presentation/components/ErrorBoundary';
import { registerServiceWorker } from './infrastructure/pwa/registerSW';

console.log('🚀 Main.tsx executing...');

// Register service worker for PWA support
registerServiceWorker();

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');

  createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
} catch (error) {
  console.error('🔥 CRITICAL ERROR IN MAIN.TSX:', error);
}
