import React, { createContext, useContext, useState, useEffect } from 'react';
import { shouldEnableFibMode } from '../utils/fibBridge';

const FibContext = createContext();

export const useFibContext = () => {
  const context = useContext(FibContext);
  if (!context) throw new Error('useFibContext must be used within a FibProvider');
  return context;
};

export const FibProvider = ({ children }) => {
  const [isFibMode, setIsFibMode] = useState(false);

  useEffect(() => {
    // Check if FIB mode should be enabled
    const fibMode = shouldEnableFibMode();
    setIsFibMode(fibMode);
  }, []);

  return (
    <FibContext.Provider value={{ isFibMode }}>
      {children}
    </FibContext.Provider>
  );
}; 