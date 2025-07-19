import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { FibProvider } from './context/FibContext';
import { registerFIBNativeBridge } from "@first-iraqi-bank/sdk/fib-native-bridge";

// Register FIB Native Bridge as soon as the app loads (as per documentation)
registerFIBNativeBridge();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <FibProvider>
      <App />
    </FibProvider>
  </React.StrictMode>
); 