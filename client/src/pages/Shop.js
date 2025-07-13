import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaStar } from 'react-icons/fa';
import axios from 'axios';
import './Shop.css';
import { useLocation } from 'react-router-dom';

const PRODUCTS_PER_PAGE = 6;

const Shop = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');
  const location = useLocation();
  const [showCancelMsg, setShowCancelMsg] = useState(false);

  useEffect(() => {
    fetchProducts(page);
    // eslint-disable-next-line
  }, [page]);

  useEffect(() => {
    if (location.state && location.state.cancelled) {
      setShowCancelMsg(true);
      const t = setTimeout(() => setShowCancelMsg(false), 3000);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  const fetchProducts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products?page=${pageNum}&limit=${PRODUCTS_PER_PAGE}`);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to load products. Please try again later.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setSuccessMsg(`${product.name} added to cart!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="shop">
        <div className="container">
          <h2>Our Products</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop">
        <div className="container">
          <h2>Our Products</h2>
          <div className="alert alert-error">{error}</div>
          <button onClick={() => fetchProducts(page)} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shop">
      <div className="container">
        <h2>Our Products</h2>
        {successMsg && (
          <div className="alert alert-success shop-success-alert">{successMsg}</div>
        )}
        {showCancelMsg && (
          <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
            Payment or order has been canceled.
          </div>
        )}
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.image_url} alt={product.name} />
                <div className="product-overlay">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="add-to-cart-btn"
                  >
                    <FaShoppingCart /> Add to Cart
                  </button>
                </div>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-rating">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <span>(4.5)</span>
                </div>
                <div className="product-price">
                  <span className="price">IQD {product.price}</span>
                  <span className="stock">In Stock: {product.stock}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination Controls */}
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx + 1}
              className={`pagination-btn${page === idx + 1 ? ' active' : ''}`}
              onClick={() => handlePageChange(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Shop; 