import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { FibProvider } from './context/FibContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <FibProvider>
      <App />
    </FibProvider>
  </React.StrictMode>
); 