import React from 'react';
import { useFibContext } from '../context/FibContext';

const ModeIndicator = () => {
  const { isFibMode } = useFibContext();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: isFibMode ? '#28a745' : '#dc3545',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontWeight: 'bold',
      zIndex: 10000,
      fontFamily: 'monospace'
    }}>
      {isFibMode ? 'FIB MODE' : 'REGULAR MODE'}
    </div>
  );
};

export default ModeIndicator; 