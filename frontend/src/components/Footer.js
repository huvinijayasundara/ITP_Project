import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ FIXED: Load user from localStorage with proper fallbacks
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('name') || localStorage.getItem('userName');
    const userRole = localStorage.getItem('role') || localStorage.getItem('userRole');
    
    if (token && userId) {
      setUser({
        id: userId,
        name: userName,
        role: userRole
      });
    }
  }, []);

  // ✅ FIXED: My Account navigation based on role
  const handleMyAccountClick = (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    // Navigate to profile for all users (not just dashboard)
    navigate('/profile');
  };

  // ✅ Handle Payment History Click
  const handlePaymentHistoryClick = (e) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      alert('⚠️ Please login to view payment history');
      navigate('/login');
      return;
    }

    // Navigate to MyPayments with user ID
    navigate(`/payments/user/${user.id}`);
  };

  // ✅ FIXED: Handle My Orders Click - Navigate to Orders page
  const handleMyOrdersClick = (e) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      alert('⚠️ Please login to view orders');
      navigate('/login');
      return;
    }

    // Navigate to the orders page (not deliveries)
    navigate('/orders');
  };

  return (
    <footer style={{ backgroundColor: '#1F2937', color: '#D1D5DB' }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '3rem 1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2.5rem'
      }}>
        {/* About Section */}
        <div>
          <h3 style={{ 
            color: 'white', 
            fontSize: '1.125rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem' 
          }}>
            Craftlink Store
          </h3>
          <p style={{ 
            fontSize: '0.875rem', 
            lineHeight: '1.6',
            color: '#D1D5DB'
          }}>
            Discover unique handmade treasures crafted by skilled artisans from around the world. Supporting local crafts and communities.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ 
            color: 'white', 
            fontSize: '1.125rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem' 
          }}>
            Quick Links
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link 
                to="/" 
                style={{ 
                  color: '#D1D5DB', 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseOver={(e) => e.target.style.color = 'white'}
                onMouseOut={(e) => e.target.style.color = '#D1D5DB'}
              >
                Home
              </Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link 
                to="/products" 
                style={{ 
                  color: '#D1D5DB', 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseOver={(e) => e.target.style.color = 'white'}
                onMouseOut={(e) => e.target.style.color = '#D1D5DB'}
              >
                Products
              </Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link 
                to="/about" 
                style={{ 
                  color: '#D1D5DB', 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseOver={(e) => e.target.style.color = 'white'}
                onMouseOut={(e) => e.target.style.color = '#D1D5DB'}
              >
                About Us
              </Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link 
                to="/contact" 
                style={{ 
                  color: '#D1D5DB', 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseOver={(e) => e.target.style.color = 'white'}
                onMouseOut={(e) => e.target.style.color = '#D1D5DB'}
              >
                Contact
              </Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link 
                to="/promotions" 
                style={{ 
                  color: '#D1D5DB', 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseOver={(e) => e.target.style.color = 'white'}
                onMouseOut={(e) => e.target.style.color = '#D1D5DB'}
              >
                Promotions
              </Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link 
                to="/discounts" 
                style={{ 
                  color: '#D1D5DB', 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseOver={(e) => e.target.style.color = 'white'}
                onMouseOut={(e) => e.target.style.color = '#D1D5DB'}
              >
                Discounts
              </Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link 
                to="/feedback" 
                style={{ 
                  color: '#D1D5DB', 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseOver={(e) => e.target.style.color = 'white'}
                onMouseOut={(e) => e.target.style.color = '#D1D5DB'}
              >
                Feedback
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 style={{ 
            color: 'white', 
            fontSize: '1.125rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem' 
          }}>
            Customer Service
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {/* ✅ FIXED: My Account - Goes to Profile for logged-in users */}
            <li style={{ marginBottom: '0.5rem' }}>
              <button
                onClick={handleMyAccountClick}
                style={{ 
                  color: '#D1D5DB', 
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  font: 'inherit',
                  textAlign: 'left',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = 'white'}
                onMouseOut={(e) => e.target.style.color = '#D1D5DB'}
              >
                👤 My Account
              </button>
            </li>
            
            {/* ✅ FIXED: My Orders - Navigate to /orders */}
            <li style={{ marginBottom: '0.5rem' }}>
              <button
                onClick={handleMyOrdersClick}
                style={{ 
                  color: '#D1D5DB', 
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  font: 'inherit',
                  textAlign: 'left',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = 'white'}
                onMouseOut={(e) => e.target.style.color = '#D1D5DB'}
              >
                📦 My Orders
              </button>
            </li>
            
            {/* 💳 PAYMENT HISTORY LINK */}
            <li style={{ marginBottom: '0.5rem' }}>
              <button
                onClick={handlePaymentHistoryClick}
                style={{ 
                  color: '#D1D5DB', 
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  font: 'inherit',
                  textAlign: 'left',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = 'white'}
                onMouseOut={(e) => e.target.style.color = '#D1D5DB'}
              >
                💳 Payment History
              </button>
            </li>

            <li style={{ marginBottom: '0.5rem' }}>
              <Link 
                to="/complaints" 
                style={{ 
                  color: '#D1D5DB', 
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
                onMouseOver={(e) => e.target.style.color = 'white'}
                onMouseOut={(e) => e.target.style.color = '#D1D5DB'}
              >
                📝 Complaints
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ 
            color: 'white', 
            fontSize: '1.125rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem' 
          }}>
            Contact Us
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem' }}>
            <li style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <MapPin style={{ height: '16px', width: '16px', marginTop: '3px', flexShrink: 0 }} />
              <span>123 Artisan Street, Colombo, Sri Lanka</span>
            </li>
            <li style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <Phone style={{ height: '16px', width: '16px', flexShrink: 0 }} />
              <span>+94 11 234 5678</span>
            </li>
            <li style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <Mail style={{ height: '16px', width: '16px', flexShrink: 0 }} />
              <span>info@craftlink.com</span>
            </li>
          </ul>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginTop: '1rem' 
          }}>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#D1D5DB', transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'white'}
              onMouseOut={(e) => e.currentTarget.style.color = '#D1D5DB'}
            >
              <Facebook style={{ height: '20px', width: '20px' }} />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#D1D5DB', transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'white'}
              onMouseOut={(e) => e.currentTarget.style.color = '#D1D5DB'}
            >
              <Twitter style={{ height: '20px', width: '20px' }} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#D1D5DB', transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'white'}
              onMouseOut={(e) => e.currentTarget.style.color = '#D1D5DB'}
            >
              <Instagram style={{ height: '20px', width: '20px' }} />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={{
        borderTop: '1px solid #374151',
        marginTop: '2rem',
        paddingTop: '1.5rem',
        paddingBottom: '1.5rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: '#9CA3AF'
      }}>
        <p style={{ margin: 0 }}>
          &copy; {new Date().getFullYear()} Craftlink Store. All rights reserved.
        </p>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem' }}>
          Made with ❤️ for Artisans Worldwide
        </p>
      </div>
    </footer>
  );
};

export default Footer;