import React, { createContext, useContext, useState, useEffect } from 'react';
import { isInFibApp } from '../utils/fibBridge';

const FibContext = createContext();

export const useFibContext = () => {
  const context = useContext(FibContext);
  if (!context) throw new Error('useFibContext must be used within a FibProvider');
  return context;
};

export const FibProvider = ({ children }) => {
  const [isFibMode, setIsFibMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Wait a bit for the bridge to be registered and available
    const timer = setTimeout(() => {
      const fibMode = isInFibApp();
      console.log('FibContext: Setting isFibMode to:', fibMode);
      setIsFibMode(fibMode);
      setIsInitialized(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <FibContext.Provider value={{ isFibMode, isInitialized }}>
      {children}
    </FibContext.Provider>
  );
}; 