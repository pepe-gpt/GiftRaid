import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App /> // 🔄 Без React.StrictMode, если вызывает двойной ререндер и баги
);
