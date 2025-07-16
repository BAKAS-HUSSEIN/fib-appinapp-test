import React, { useState } from 'react';
import { useFibContext } from '../context/FibContext';
import { isInFibApp } from '../utils/fibBridge';

const DebugPanel = () => {
  const { isFibMode, isBridgeReady } = useFibContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const bridgeAvailable = isInFibApp();

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const debugInfo = {
    'Environment': process.env.NODE_ENV,
    'FIB Mode (Context)': isFibMode ? '✅' : '❌',
    'Bridge Ready (Context)': isBridgeReady ? '✅' : '❌',
    'Bridge Available (Direct)': bridgeAvailable ? '✅' : '❌',
    'window.FIBNativeBridge': window.FIBNativeBridge ? '✅' : '❌',
    'User Agent': navigator.userAgent.substring(0, 50) + '...',
    'URL': window.location.href,
    'Test Mode': window.location.search.includes('testMode=true') ? '✅' : '❌'
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '11px',
      zIndex: 10000,
      fontFamily: 'monospace',
      maxWidth: '300px',
      cursor: 'pointer'
    }} onClick={() => setIsExpanded(!isExpanded)}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        🔧 Debug Panel {isExpanded ? '▼' : '▶'}
      </div>
      
      {isExpanded && (
        <div>
          {Object.entries(debugInfo).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '3px' }}>
              <span style={{ color: '#aaa' }}>{key}:</span> {value}
            </div>
          ))}
          
          <div style={{ marginTop: '10px', paddingTop: '5px', borderTop: '1px solid #333' }}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                console.log('Debug Info:', debugInfo);
              }}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '2px 8px',
                borderRadius: '3px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              Log to Console
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel; 