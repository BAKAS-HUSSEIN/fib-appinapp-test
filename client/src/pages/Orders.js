import React, { useState, useEffect } from 'react';
import { FaBox, FaCalendar, FaDollarSign } from 'react-icons/fa';
import axios from 'axios';
import './Orders.css';

const Orders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fibDetails, setFibDetails] = useState({}); // paymentId -> details
  const [fibLoading, setFibLoading] = useState({}); // paymentId -> loading

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    // Fetch FIB details for each paid order with payment_id
    orders.forEach(order => {
      if (order.payment_id && !fibDetails[order.payment_id] && !fibLoading[order.payment_id]) {
        setFibLoading(prev => ({ ...prev, [order.payment_id]: true }));
        fetch(`/api/payment/fib/status/${order.payment_id}`)
          .then(res => res.json())
          .then(data => {
            setFibDetails(prev => ({ ...prev, [order.payment_id]: data }));
          })
          .catch(() => {
            setFibDetails(prev => ({ ...prev, [order.payment_id]: { error: true } }));
          })
          .finally(() => {
            setFibLoading(prev => ({ ...prev, [order.payment_id]: false }));
          });
      }
    });
  }, [orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load orders. Please try again later.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  // Group orders by order ID
  const groupedOrders = orders.reduce((acc, item) => {
    if (!acc[item.id]) {
      acc[item.id] = {
        ...item,
        items: []
      };
    }
    acc[item.id].items.push({
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price
    });
    return acc;
  }, {});
  const groupedOrdersArr = Object.values(groupedOrders);

  if (loading) {
    return (
      <div className="orders">
        <div className="container">
          <h2>My Orders</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders">
        <div className="container">
          <h2>My Orders</h2>
          <div className="alert alert-error">{error}</div>
          <button onClick={fetchOrders} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders">
      <div className="container">
        <h2>My Orders</h2>
        
        {orders.length === 0 ? (
          <div className="empty-orders">
            <FaBox className="empty-icon" />
            <h3>No orders yet</h3>
            <p>Start shopping to see your orders here!</p>
          </div>
        ) : (
          <div className="orders-grid">
            {groupedOrdersArr.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.id}</h3>
                    <div className="order-meta">
                      <span className="order-date">
                        <FaCalendar /> {formatDate(order.created_at)}
                      </span>
                      <span 
                        className="order-status"
                        style={{ color: getStatusColor(order.status) }}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="order-total">
                    IQD
                    <span>{order.total_amount}</span>
                  </div>
                </div>
                {order.items && order.items.length > 0 && (
                  <div className="order-items">
                    {order.items.map((item, idx) => (
                      <div className="order-item" key={idx}>
                        <span className="item-name" style={{ flex: 2, textAlign: 'left' }}>{item.product_name || 'Unknown Product'}</span>
                        <span className="item-quantity" style={{ flex: 1, textAlign: 'center' }}>Qty: {item.quantity}</span>
                        <span className="item-price" style={{ flex: 1, textAlign: 'right' }}>IQD {item.price}</span>
                      </div>
                    ))}
                  </div>
                )}
                {order.payment_id && (
                  <div className="payment-info">
                    <span>Payment ID: {order.payment_id}</span>
                    {fibLoading[order.payment_id] && <span style={{ marginLeft: 10 }}>Loading payment details...</span>}
                    {fibDetails[order.payment_id] && !fibLoading[order.payment_id] && !fibDetails[order.payment_id].error && (
                      <div className="fib-details">
                        {fibDetails[order.payment_id].paidBy && (
                          <>
                            <div><strong>Payer Name:</strong> {fibDetails[order.payment_id].paidBy.name}</div>
                            <div><strong>Payer IBAN:</strong> {fibDetails[order.payment_id].paidBy.iban}</div>
                          </>
                        )}
                        {fibDetails[order.payment_id].paidAt && (
                          <div><strong>Paid At:</strong> {fibDetails[order.payment_id].paidAt}</div>
                        )}
                        {fibDetails[order.payment_id].status && (
                          <div><strong>Payment Status:</strong> {fibDetails[order.payment_id].status}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders; 