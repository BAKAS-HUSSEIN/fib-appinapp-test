# FIB Native Bridge Integration

This document explains the dual-mode functionality implemented in the web app to support both standalone web usage and integration with the FIB native mobile app.

## Overview

The app now supports two modes:
1. **Standalone Web Mode**: Traditional web app with QR codes, readable codes, and manual authentication
2. **FIB Native App Mode**: Seamless integration via JavaScript bridge for automatic SSO and payment

## Architecture

### Key Files

#### Bridge Utilities
- `src/utils/fibBridge.js` - Core bridge communication utilities
- `src/context/FibContext.js` - React context for sharing FIB mode state

#### Components
- `src/components/FibSplashScreen.js` - Loading screen for FIB app authentication
- `src/components/FibSplashScreen.css` - Styling for splash screen

#### Updated Components
- `src/App.js` - Main app with dual-mode logic
- `src/components/Navbar.js` - Conditional navigation based on mode
- `src/pages/Cart.js` - Bridge-based payment in FIB mode

## How It Works

### Environment Detection
The app automatically detects if it's running inside the FIB native app by checking for the presence of the `window.FIBNativeBridge` object.

### Dual-Mode Behavior

#### Standalone Web Mode
- Shows login/register buttons
- Uses traditional SSO flow (QR codes, readable codes)
- Uses traditional payment flow (QR codes, polling)
- Shows profile and logout buttons

#### FIB Native App Mode
- Hides login/register buttons (automatic authentication)
- Shows splash screen during authentication
- Uses bridge-based SSO (automatic login)
- Uses bridge-based payment (native app handles payment UI)
- Hides profile and logout buttons (managed by native app)

## Features

### Automatic SSO Authentication
When the app loads in FIB mode:
1. Shows splash screen with "Authenticating with FIB..."
2. Sends `AUTHENTICATE` message to native app
3. Listens for `AUTHENTICATED` or `AUTHENTICATION_FAILED` events
4. Automatically logs user in on success

### Bridge-Based Payment
When user checks out in FIB mode:
1. Creates payment via backend API
2. Sends `PAYMENT` message to native app with transaction details
3. Native app shows payment UI
4. Listens for `PAYMENT_SUCCESSFULLY_PAID` or `PAYMENT_FAILED` events
5. Updates order status based on result

## Installation

1. Install the FIB SDK:
```bash
npm install @first-iraqi-bank/sdk@pre
```

2. The bridge is automatically initialized when the app loads.

## Testing

### Standalone Testing
- Open the app in a regular browser
- Should see login/register buttons
- Should use traditional SSO and payment flows

### FIB App Testing
- Open the app inside the FIB staging app
- Should show splash screen
- Should automatically authenticate
- Should use bridge-based payment

## Error Handling

The bridge includes comprehensive error handling:
- Graceful fallback when bridge is not available
- Timeout handling for payment events
- Retry mechanisms for failed authentication
- Clear error messages for users

## Future Enhancements

- Add more bridge events as needed
- Implement additional native app features
- Add analytics for bridge usage
- Enhance error recovery mechanisms 