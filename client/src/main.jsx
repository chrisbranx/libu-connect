import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import './i18n/config';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: { borderRadius: '12px', background: '#1E1B4B', color: '#F0EFF8', fontFamily: 'Satoshi, sans-serif' },
        success: { iconTheme: { primary: '#059669', secondary: '#F0EFF8' } },
        error: { iconTheme: { primary: '#DC2626', secondary: '#F0EFF8' } },
      }} />
    </BrowserRouter>
  </React.StrictMode>
);