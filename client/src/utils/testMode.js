// Test mode utilities for development
export const enableTestMode = () => {
  // Simulate FIB bridge for testing
  window.FIBNativeBridge = {
    sendMessage: (message) => {
      console.log('Test Mode: Sending message to native app:', message);
      
      // Simulate response after a delay
      setTimeout(() => {
        if (message.type === 'AUTHENTICATE') {
          // Simulate successful authentication
          const event = new CustomEvent('AUTHENTICATED', {
            detail: { body: { readableId: message.body.readableId } }
          });
          window.dispatchEvent(event);
        } else if (message.type === 'PAYMENT') {
          // Simulate successful payment
          const event = new CustomEvent('PAYMENT_SUCCESSFULLY_PAID', {
            detail: { body: { transactionId: message.body.transactionId } }
          });
          window.dispatchEvent(event);
        }
      }, 2000);
    },
    addEventListener: (eventType, handler) => {
      console.log('Test Mode: Adding event listener for:', eventType);
      window.addEventListener(eventType, handler);
    },
    removeEventListener: (eventType, handler) => {
      console.log('Test Mode: Removing event listener for:', eventType);
      window.removeEventListener(eventType, handler);
    }
  };
  
  console.log('Test Mode: FIB bridge simulated');
};

export const disableTestMode = () => {
  delete window.FIBNativeBridge;
  console.log('Test Mode: FIB bridge removed');
};

// Check if test mode is enabled via URL parameter
export const checkTestMode = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const testMode = urlParams.get('testMode');
  
  if (testMode === 'true') {
    enableTestMode();
    return true;
  }
  
  return false;
}; 