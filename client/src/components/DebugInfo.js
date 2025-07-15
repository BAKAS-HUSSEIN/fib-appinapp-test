import React from 'react';
import { useFibContext } from '../context/FibContext';
import { isInFibApp } from '../utils/fibBridge';

const DebugInfo = () => {
  const { isFibMode, isBridgeReady } = useFibContext();
  const bridgeAvailable = isInFibApp();

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 10000,
      fontFamily: 'monospace'
    }}>
      <div><strong>Debug Info:</strong></div>
      <div>FIB Mode: {isFibMode ? '✅' : '❌'}</div>
      <div>Bridge Ready: {isBridgeReady ? '✅' : '❌'}</div>
      <div>Bridge Available: {bridgeAvailable ? '✅' : '❌'}</div>
      <div>Environment: {process.env.NODE_ENV}</div>
    </div>
  );
};

export default DebugInfo; 