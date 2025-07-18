import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaCreditCard } from 'react-icons/fa';
import axios from 'axios';
import './Cart.css';

const Cart = ({ cart, removeFromCart, updateQuantity, clearCart, user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Only initiate FIB payment, do NOT save order yet
      const paymentData = {
        amount: calculateTotal(),
        customer_details: {
          name: user.username,
          email: user.email
        },
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name
        })),
        total_amount: calculateTotal(),
        description: `Order for ${user.username}`
      };

      const paymentResponse = await axios.post('/api/payment/fib', paymentData);

      if (paymentResponse.data.success) {
        clearCart();
        navigate('/fib-payment', { state: {
          ...paymentResponse.data,
          ...paymentData,
          payment_id: paymentResponse.data.paymentId, // ensure snake_case for backend
          paymentId: paymentResponse.data.paymentId // ensure camelCase for frontend
        }});
      } else {
        setError('Payment failed. Please try again.');
      }
    } catch (err) {
      setError('Checkout failed. Please try again.');
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart">
        <div className="container">
          <h2>Shopping Cart</h2>
          <div className="empty-cart">
            <h3>Your cart is empty</h3>
            <p>Add some products to your cart to get started!</p>
            <button onClick={() => navigate('/shop')} className="btn btn-primary">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="container">
        <h2>Shopping Cart</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <div className="cart-content">
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img src={item.image_url} alt={item.name} />
                </div>
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  <div className="item-price">IQD {item.price}</div>
                </div>
                <div className="item-quantity">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="quantity-btn"
                  >
                    <FaMinus />
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    <FaPlus />
                  </button>
                </div>
                <div className="item-total">
                  IQD {(item.price * item.quantity).toFixed(2)}
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="remove-btn"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="summary-item">
                <span>Subtotal:</span>
                <span>IQD {calculateTotal().toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="summary-item total">
                <span>Total:</span>
                <span>IQD {calculateTotal().toFixed(2)}</span>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="btn btn-primary checkout-btn"
              >
                {loading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <FaCreditCard /> Proceed to Checkout
                  </>
                )}
              </button>
              
              {!user && (
                <p className="login-prompt">
                  Please <button onClick={() => navigate('/login')} className="link-btn">login</button> to checkout
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 