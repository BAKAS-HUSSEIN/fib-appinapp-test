import React, { createContext, useContext, useState, useEffect } from 'react';
import { isFibApp } from '../utils/fibBridge';

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

  useEffect(() => {
    setIsFibMode(isFibApp());
  }, []);

  const value = {
    isFibMode
  };

  return (
    <FibContext.Provider value={value}>
      {children}
    </FibContext.Provider>
  );
}; 