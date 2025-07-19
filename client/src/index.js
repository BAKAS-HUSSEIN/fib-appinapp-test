import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { FibProvider } from './context/FibContext';
import { registerFIBNativeBridge } from "@first-iraqi-bank/sdk/fib-native-bridge";

// Register FIB Native Bridge as soon as the app loads
try {
  registerFIBNativeBridge();
  console.log('FIB Native Bridge registered successfully');
} catch (error) {
  console.log('FIB Native Bridge not available (running in standalone mode):', error.message);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <FibProvider>
      <App />
    </FibProvider>
  </React.StrictMode>
); 