import React, { createContext, useContext, useState, useEffect } from 'react';
import { isInFibApp } from '../utils/fibBridge';

const FibContext = createContext();

export const useFibContext = () => {
  const context = useContext(FibContext);
  if (!context) {
    throw new Error('useFibContext must be used within a FibProvider');
  }
  return context;
};

export const FibProvider = ({ children }) => {
  const [isFibMode, setIsFibMode] = useState(false);
  const [isBridgeReady, setIsBridgeReady] = useState(false);

  useEffect(() => {
    // Check if running in FIB app mode
    const checkFibMode = () => {
      const fibMode = isInFibApp();
      console.log('FibContext: FIB mode =', fibMode);
      setIsFibMode(fibMode);
      setIsBridgeReady(fibMode);
    };

    // Check immediately
    checkFibMode();

    // Check again after bridge initialization
    const timer = setTimeout(checkFibMode, 1000);

    return () => clearTimeout(timer);
  }, []);

  const value = {
    isFibMode,
    isBridgeReady,
    setIsFibMode
  };

  return (
    <FibContext.Provider value={value}>
      {children}
    </FibContext.Provider>
  );
}; 