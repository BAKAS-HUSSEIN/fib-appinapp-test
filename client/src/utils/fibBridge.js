// Simple bridge utility following the FIB documentation exactly

// Check if we're in a WebView
export function isInWebView() {
  const userAgent = window.navigator.userAgent || window.navigator.vendor || window.opera;
  return (
    (/wv/.test(userAgent)) || // Android WebView
    (userAgent.includes('WebView')) || // iOS WebView
    (window.ReactNativeWebView !== undefined) // React Native WebView
  );
}

// Check if FIB bridge is available
export function isFibBridgeAvailable() {
  return !!(window.FIBNativeBridge && typeof window.FIBNativeBridge.sendMessage === 'function');
}

// Check if we should enable FIB mode (WebView + bridge available)
export function shouldEnableFibMode() {
  return isInWebView() && isFibBridgeAvailable();
}

// Send message to native app (following documentation exactly)
export function sendMessageToNative(type, body = {}) {
  if (!isFibBridgeAvailable()) {
    throw new Error('FIB Native Bridge not available');
  }

  try {
    window.FIBNativeBridge.sendMessage({ type, body });
    return true;
  } catch (error) {
    console.error('Failed to send message to native app:', error);
    throw error;
  }
}

// Add event listener (following documentation exactly)
export function addNativeEventListener(eventType, handler) {
  if (!isFibBridgeAvailable()) {
    console.warn('Cannot add event listener: FIB Native Bridge not available');
    return;
  }

  window.FIBNativeBridge.addEventListener(eventType, handler);
}

// Remove event listener
export function removeNativeEventListener(eventType, handler) {
  if (!isFibBridgeAvailable()) {
    return;
  }

  window.FIBNativeBridge.removeEventListener(eventType, handler);
}

// SSO Authentication helper (following documentation exactly)
export function authenticateWithNative(readableId) {
  const normalizedReadableId = readableId.replaceAll("-", "");
  return sendMessageToNative("AUTHENTICATE", { readableId: normalizedReadableId });
}

// Payment helper
export function initiatePaymentWithNative(transactionId, readableId) {
  const normalizedReadableId = readableId.replaceAll("-", "");
  return sendMessageToNative("PAYMENT", { 
    transactionId, 
    readableId: normalizedReadableId 
  });
}

// Exit app
export function exitNativeApp() {
  return sendMessageToNative("EXIT");
} 