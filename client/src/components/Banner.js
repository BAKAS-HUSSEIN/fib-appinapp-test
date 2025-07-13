import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './Banner.css';

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Use the first banner's background for all slides
  const commonBackground = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

  const banners = [
    {
      id: 1,
      title: "Welcome to BekasShop",
      subtitle: "Your Premier E-commerce Destination",
      description: "Discover amazing products at great prices with secure payment integration and seamless shopping experience.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop",
      cta: "Shop Now",
      link: "/shop"
    },
    {
      id: 2,
      title: "FIB Payment Integration",
      subtitle: "Secure & Reliable Transactions",
      description: "Powered by First Iraqi Bank's secure payment gateway. Enjoy safe and instant transactions with QR codes and mobile app integration.",
      image: "https://fib.iq/wp-content/uploads/2024/04/homepage-find-the-best-card.png",
      cta: "Learn More",
      link: "/shop"
    },
    {
      id: 3,
      title: "FIB SSO Login",
      subtitle: "One-Click Authentication",
      description: "Login securely with your FIB Personal App. No passwords needed - just scan QR code or use your mobile app for instant access.",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=400&fit=crop",
      cta: "Login with FIB",
      link: "/fib-sso-login"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="banner-container">
      <div className="banner-carousel">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ background: commonBackground }}
          >
            <div className="banner-content">
              <div className="banner-text">
                <h2>{banner.title}</h2>
                <h3>{banner.subtitle}</h3>
                <p>{banner.description}</p>
                <a href={banner.link} className="banner-cta">
                  {banner.cta}
                </a>
              </div>
              <div className="banner-image">
                <img src={banner.image} alt={banner.title} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows at bottom right */}
      <div className="banner-nav-group">
        <button className="banner-nav banner-prev" onClick={prevSlide}>
          <FaChevronLeft />
        </button>
        <button className="banner-nav banner-next" onClick={nextSlide}>
          <FaChevronRight />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="banner-dots">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`banner-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner; 