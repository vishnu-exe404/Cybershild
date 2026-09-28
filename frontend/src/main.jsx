import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { LanguageProvider } from './services/i18n.jsx';
import { UserAuthProvider } from './services/userAuth.jsx';
import { AdminAuthProvider } from './services/adminAuth.jsx';
import { ToastProvider } from './services/toast.jsx';
import { ThemeProvider } from './services/theme.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <UserAuthProvider>
              <AdminAuthProvider>
                <App />
              </AdminAuthProvider>
            </UserAuthProvider>
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
