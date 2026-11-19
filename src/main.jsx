import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { LangProvider } from './context/LangContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Inline base stylesheet ensuring high readability, large fonts and chilli red theme
const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  :root {
    --color-primary: #991b1b;
    --color-primary-dark: #7f1d1d;
    --color-accent: #d97706;
    --color-bg: #f8fafc;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    font-family: 'Plus Jakarta Sans', 'Noto Sans Telugu', system-ui, -apple-system, sans-serif;
    background-color: #f1f5f9;
    color: #0f172a;
    font-size: 16px;
    line-height: 1.5;
    min-height: 100vh;
  }

  button, input, select, textarea {
    font-family: inherit;
    font-size: 1rem;
  }

  /* Custom Scrollbar for Spreadsheet view */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #e2e8f0;
  }
  ::-webkit-scrollbar-thumb {
    background: #94a3b8;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #64748b;
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LangProvider>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </LangProvider>
  </React.StrictMode>
);
