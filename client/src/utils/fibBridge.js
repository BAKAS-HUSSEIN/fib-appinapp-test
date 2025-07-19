import { registerFIBNativeBridge } from "@first-iraqi-bank/sdk/fib-native-bridge";
import { UnsupportedPlatformError, InvalidMessageError } from "@first-iraqi-bank/sdk/fib-native-bridge";

// Server-side logging function
const logToServer = (message, data = null) => {
  console.log(`[FIB BRIDGE] ${message}`, data);
  // Send log to server for debugging
  fetch('/api/logs/fib', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `[FIB BRIDGE] ${message}`,
      data: data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    })
  }).catch(err => {
    // Silently fail if logging fails
    console.log('Failed to log to server:', err.message);
  });
};

export function isInWebView() {
  const userAgent = window.navigator.userAgent || window.navigator.vendor || window.opera;
  const result = (
    (/wv/.test(userAgent)) || // Android WebView
    (userAgent.includes('WebView')) || // iOS WebView
    (window.ReactNativeWebView !== undefined) // React Native WebView
  );
  return result;
}

export function isFibApp() {
  // Enable FIB mode for any WebView
  const result = isInWebView();
  return result;
}

// Check if FIB Native Bridge is available
export const isFibBridgeAvailable = () => {
  const result = !!(window.FIBNativeBridge && typeof window.FIBNativeBridge.sendMessage === 'function');
  return result;
};

// Check if running inside FIB native app
export const isInFibApp = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const testMode = urlParams.get('testMode');
  
  if (testMode === 'true') {
    logToServer('Test mode detected');
    return true;
  }
  
  // Check if we're in a WebView AND the bridge is available
  const inWebView = isFibApp();
  const bridgeAvailable = isFibBridgeAvailable();
  
  logToServer('FIB app detection result', { inWebView, bridgeAvailable });
  return inWebView && bridgeAvailable;
};

// Send message to native app with proper error handling
export const sendMessageToNative = (type, body = {}) => {
  logToServer('Attempting to send message to native app', { type, body });
  
  if (!isFibBridgeAvailable()) {
    logToServer('Bridge not available for sending message');
    throw new Error('FIB Native Bridge not available');
  }

  try {
    window.FIBNativeBridge.sendMessage({ type, body });
    logToServer('Message sent successfully to native app', { type, body });
    return true;
  } catch (error) {
    logToServer('Failed to send message to native app', { 
      type, 
      body, 
      error: error.message,
      errorType: error.constructor.name
    });
    
    if (error instanceof UnsupportedPlatformError) {
      console.error("FIB Native App Bridge is not available, call the SDK only when its loaded inside FIB Native apps!", error);
      throw new Error('FIB Native Bridge not available in this environment');
    } else if (error instanceof InvalidMessageError) {
      console.error("Invalid message type or body", error);
      throw new Error('Invalid message format');
    } else {
      console.error('Failed to send message to native app:', error);
      throw error;
    }
  }
};

// Add event listener for native app events
export const addNativeEventListener = (eventType, handler) => {
  if (!isFibBridgeAvailable()) {
    logToServer('Cannot add event listener: Bridge not available');
    console.warn('Cannot add event listener: FIB Native Bridge not available');
    return;
  }

  try {
    window.FIBNativeBridge.addEventListener(eventType, handler);
    logToServer('Event listener added successfully', { eventType });
  } catch (error) {
    logToServer('Failed to add event listener', { eventType, error: error.message });
    console.error(`Failed to add event listener for ${eventType}:`, error);
  }
};

// Remove event listener
export const removeNativeEventListener = (eventType, handler) => {
  if (!isFibBridgeAvailable()) {
    return;
  }

  try {
    window.FIBNativeBridge.removeEventListener(eventType, handler);
    logToServer('Event listener removed successfully', { eventType });
  } catch (error) {
    logToServer('Failed to remove event listener', { eventType, error: error.message });
    console.error(`Failed to remove event listener for ${eventType}:`, error);
  }
};

// SSO Authentication helpers
export const authenticateWithNative = (readableId) => {
  const normalizedReadableId = readableId.replaceAll("-", "");
  logToServer('Authenticating with native app', { 
    originalReadableId: readableId,
    normalizedReadableId 
  });
  return sendMessageToNative("AUTHENTICATE", { readableId: normalizedReadableId });
};

// Payment helpers
export const initiatePaymentWithNative = (transactionId, readableId) => {
  const normalizedReadableId = readableId.replaceAll("-", "");
  logToServer('Initiating payment with native app', { 
    transactionId,
    originalReadableId: readableId,
    normalizedReadableId 
  });
  return sendMessageToNative("PAYMENT", { 
    transactionId, 
    readableId: normalizedReadableId 
  });
};

// Exit app
export const exitNativeApp = () => {
  logToServer('Exiting native app');
  return sendMessageToNative("EXIT");
};

// Event types constants
export const NATIVE_EVENTS = {
  AUTHENTICATED: "AUTHENTICATED",
  AUTHENTICATION_FAILED: "AUTHENTICATION_FAILED",
  PAYMENT_SUCCESSFULLY_PAID: "PAYMENT_SUCCESSFULLY_PAID",
  PAYMENT_FAILED: "PAYMENT_FAILED"
}; 