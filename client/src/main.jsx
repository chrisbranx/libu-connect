import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import './i18n/config';

const splash = document.getElementById('splash');
if (splash) {
  splash.style.opacity = '0';
  setTimeout(() => splash.remove(), 500);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: { borderRadius: '12px', background: '#2563EB', color: '#FFFFFF', fontFamily: 'Satoshi, sans-serif' },
        success: { iconTheme: { primary: '#059669', secondary: '#FFFFFF' } },
        error: { iconTheme: { primary: '#DC2626', secondary: '#FFFFFF' } },
      }} />
    </BrowserRouter>
  </React.StrictMode>
);