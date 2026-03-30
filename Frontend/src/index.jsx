import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';

const storedTheme = localStorage.getItem('marketpulse-theme') || 'dark';

if (storedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
