import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancelled from './pages/PaymentCancelled';
import FIBPaymentPage from './pages/FIBPaymentPage';
import FibSsoLogin from './pages/FibSsoLogin';
import FibSplashScreen from './components/FibSplashScreen';
import DebugPanel from './components/DebugPanel';
import ModeIndicator from './components/ModeIndicator';
import { initializeFibBridge } from './utils/fibBridge';
import { useFibContext } from './context/FibContext';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(false);
  const { isFibMode } = useFibContext();

  useEffect(() => {
    // Initialize FIB bridge
    initializeFibBridge();
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    
    // Check for stored user token (for regular mode)
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    console.log('App: isFibMode changed to:', isFibMode);
    
    if (isFibMode) {
      // In FIB app mode, show splash screen for authentication
      console.log('App: Showing splash screen for FIB mode');
      setShowSplash(true);
    } else {
      // In standalone mode, NEVER show splash screen
      console.log('App: Hiding splash screen for regular mode');
      setShowSplash(false);
    }
  }, [isFibMode]);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const login = (userData, token) => {
    setUser(userData);
    if (token) {
      localStorage.setItem('token', token);
    }
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Hide splash screen if in FIB mode
    if (isFibMode) {
      setShowSplash(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    
    // In FIB mode, show splash screen again after logout
    if (isFibMode) {
      setShowSplash(true);
    }
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Show splash screen in FIB mode when not authenticated
  if (showSplash && isFibMode && !user) {
    return (
      <FibSplashScreen 
        onAuthenticationSuccess={login}
        onAuthenticationFailure={() => {
          // Handle authentication failure - could show error or retry
          console.error('FIB authentication failed');
        }}
      />
    );
  }

  return (
    <Router>
      <div className="App">
        <ModeIndicator />
        <DebugPanel />
        <Navbar 
          user={user} 
          logout={logout} 
          cartCount={cart.reduce((total, item) => total + item.quantity, 0)}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop addToCart={addToCart} />} />
            <Route 
              path="/cart" 
              element={
                <Cart 
                  cart={cart} 
                  removeFromCart={removeFromCart} 
                  updateQuantity={updateQuantity}
                  clearCart={clearCart}
                  user={user}
                />
              } 
            />
            <Route 
              path="/login" 
              element={
                user ? <Navigate to="/" /> : <Login login={login} />
              } 
            />
            <Route 
              path="/register" 
              element={
                user ? <Navigate to="/" /> : <Register login={login} />
              } 
            />
            <Route 
              path="/fib-sso-login" 
              element={
                user ? <Navigate to="/" /> : <FibSsoLogin login={login} />
              } 
            />
            <Route 
              path="/orders" 
              element={
                user ? <Orders user={user} /> : <Navigate to="/login" />
              } 
            />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancelled" element={<PaymentCancelled />} />
            <Route path="/fib-payment" element={<FIBPaymentPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 