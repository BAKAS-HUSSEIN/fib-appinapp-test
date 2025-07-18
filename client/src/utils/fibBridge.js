import { registerFIBNativeBridge } from "@first-iraqi-bank/sdk/fib-native-bridge";
import { checkTestMode } from './testMode';

// Detect whether we're running inside the real FIB mobile app
export const detectRealFibEnv = () => {
  try {
    const ua = navigator.userAgent || '';

    if (window.ReactNativeWebView) return true;
    if (window.webkit?.messageHandlers?.FIBNativeBridge) return true;
    if (/FIBApp|FirstIraqiBank/i.test(ua)) return true;
  } catch (e) {
    // ignore
  }
  return false;
};


// Bridge state
let bridgeInitialized = false;
let bridgeAvailable = false;

// Initialize the FIB native bridge
export const initializeFibBridge = () => {
  // Check for test mode first
  const testModeEnabled = checkTestMode();
  if (testModeEnabled()) {
    bridgeInitialized = true;
    bridgeAvailable = true;
    console.log('Test Mode: FIB Native Bridge initialized');
    return;
  }
  const realEnv = detectRealFibEnv();
  bridgeAvailable = realEnv;

  if (!realEnv) {
    console.log('initializeFibBridge: No native environment detected');
    bridgeInitialized = false;
    return;
  }

  try {
    registerFIBNativeBridge();
    bridgeInitialized = true;
    console.log('FIB Native Bridge initialized successfully');
  } catch (error) {
    console.log('FIB Native Bridge not available (running in standalone mode)');
    bridgeAvailable = false;
    bridgeInitialized = false;
  }
};

// Check if running inside FIB native app
export const isInFibApp = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const testMode = urlParams.get('testMode');
  
  if (testMode === 'true') {
    console.log('isInFibApp: Test mode detected');
    return true;
  }
  
  
  console.log(`isInFibApp: bridgeAvailable=${bridgeAvailable}`);
  return bridgeAvailable;
};

// Send message to native app
export const sendMessageToNative = (type, body = {}) => {
  if (!isInFibApp()) {
    throw new Error('FIB Native Bridge not available');
  }

  try {
    window.FIBNativeBridge.sendMessage({ type, body });
    return true;
  } catch (error) {
    console.error('Failed to send message to native app:', error);
    throw error;
  }
};

// Add event listener for native app events
export const addNativeEventListener = (eventType, handler) => {
  if (!isInFibApp()) {
    console.warn('Cannot add event listener: FIB Native Bridge not available');
    return;
  }

  window.FIBNativeBridge.addEventListener(eventType, handler);
};

// Remove event listener
export const removeNativeEventListener = (eventType, handler) => {
  if (!isInFibApp()) {
    return;
  }

  window.FIBNativeBridge.removeEventListener(eventType, handler);
};

// SSO Authentication helpers
export const authenticateWithNative = (readableId) => {
  const normalizedReadableId = readableId.replaceAll("-", "");
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