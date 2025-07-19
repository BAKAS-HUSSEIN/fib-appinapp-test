import { registerFIBNativeBridge } from "@first-iraqi-bank/sdk/fib-native-bridge";
import { UnsupportedPlatformError, InvalidMessageError } from "@first-iraqi-bank/sdk/fib-native-bridge";
import { checkTestMode } from './testMode';

export function isInWebView() {
  const userAgent = window.navigator.userAgent || window.navigator.vendor || window.opera;
  return (
    (/wv/.test(userAgent)) || // Android WebView
    (userAgent.includes('WebView')) || // iOS WebView
    (window.ReactNativeWebView !== undefined) // React Native WebView
  );
}

export function isFibApp() {
  // Enable FIB mode for any WebView
  return isInWebView();
}

// Check if FIB Native Bridge is available
export const isFibBridgeAvailable = () => {
  return !!(window.FIBNativeBridge && typeof window.FIBNativeBridge.sendMessage === 'function');
};

// Check if running inside FIB native app
export const isInFibApp = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const testMode = urlParams.get('testMode');
  
  if (testMode === 'true') {
    console.log('isInFibApp: Test mode detected');
    return true;
  }
  
  // Check if we're in a WebView AND the bridge is available
  const inWebView = isFibApp();
  const bridgeAvailable = isFibBridgeAvailable();
  
  console.log(`isInFibApp: inWebView=${inWebView}, bridgeAvailable=${bridgeAvailable}`);
  return inWebView && bridgeAvailable;
};

// Send message to native app with proper error handling
export const sendMessageToNative = (type, body = {}) => {
  if (!isFibBridgeAvailable()) {
    throw new Error('FIB Native Bridge not available');
  }

  try {
    window.FIBNativeBridge.sendMessage({ type, body });
    console.log(`Sent message to native app: ${type}`, body);
    return true;
  } catch (error) {
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
    console.warn('Cannot add event listener: FIB Native Bridge not available');
    return;
  }

  try {
    window.FIBNativeBridge.addEventListener(eventType, handler);
    console.log(`Added event listener for: ${eventType}`);
  } catch (error) {
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
    console.log(`Removed event listener for: ${eventType}`);
  } catch (error) {
    console.error(`Failed to remove event listener for ${eventType}:`, error);
  }
};

// SSO Authentication helpers
export const authenticateWithNative = (readableId) => {
  const normalizedReadableId = readableId.replaceAll("-", "");
  console.log(`Authenticating with readableId: ${normalizedReadableId}`);
  return sendMessageToNative("AUTHENTICATE", { readableId: normalizedReadableId });
};

// Payment helpers
export const initiatePaymentWithNative = (transactionId, readableId) => {
  const normalizedReadableId = readableId.replaceAll("-", "");
  return sendMessageToNative("PAYMENT", { 
    transactionId, 
    readableId: normalizedReadableId 
  });
};

// Exit app
export const exitNativeApp = () => {
  return sendMessageToNative("EXIT");
};

// Event types constants
export const NATIVE_EVENTS = {
  AUTHENTICATED: "AUTHENTICATED",
  AUTHENTICATION_FAILED: "AUTHENTICATION_FAILED",
  PAYMENT_SUCCESSFULLY_PAID: "PAYMENT_SUCCESSFULLY_PAID",
  PAYMENT_FAILED: "PAYMENT_FAILED"
}; 