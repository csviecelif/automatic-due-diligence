import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Certifique-se de que este arquivo existe e contém estilos globais

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
