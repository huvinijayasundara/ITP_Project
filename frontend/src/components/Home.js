import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, TrendingUp, Award, ShoppingBag, Users, Heart,  Shield } from 'lucide-react';
import axios from 'axios';
import ChatBot from '../components/ChatBot/ChatBot';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    happyCustomers: 1250,
    artisanPartners: 45
  });

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/products');
      const allProducts = response.data.products || response.data || [];
      const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
      setFeaturedProducts(shuffled.slice(0, 6));
      setStats(prev => ({ ...prev, totalProducts: allProducts.length }));
    } catch (error) {
      console.error('Error fetching products:', error);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { 
      icon: Award, 
      title: 'Premium Quality', 
      description: 'Handpicked products from verified artisans'
    },
    { 
      icon: TrendingUp, 
      title: 'Best Prices', 
      description: 'Competitive prices with regular promotions'
    },
    { 
      icon: Shield, 
      title: 'Secure Shopping', 
      description: 'Safe and secure payment methods'
    },
    { 
      icon: Users, 
      title: 'Community Support', 
      description: 'Supporting local artisans and communities'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section style={{ backgroundColor: '#B8764F', padding: '120px 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: 'bold', 
            color: 'white', 
            marginBottom: '1.5rem',
            lineHeight: '1.2'
          }}>
            Discover Unique Handicrafts
          </h1>
          <p style={{ 
            fontSize: '1.5rem', 
            color: 'white', 
            marginBottom: '2.5rem',
            opacity: '0.95'
          }}>
            Handmade treasures crafted with love by skilled artisans
          </p>
          <Link
            to="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'white',
              color: '#8B4513',
              padding: '14px 32px',
              borderRadius: '8px',
              fontSize: '1.125rem',
              fontWeight: '600',
              textDecoration: 'none',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.3s'
            }}
          >
            Shop Now
            <ArrowRight style={{ marginLeft: '8px', width: '20px', height: '20px' }} />
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#E8D4C0',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <ShoppingBag style={{ width: '36px', height: '36px', color: '#8B4513' }} />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#8B4513', marginBottom: '0.5rem' }}>
                {stats.totalProducts}+
              </div>
              <div style={{ fontSize: '1.125rem', color: '#666', fontWeight: '500' }}>
                Products Available
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#E8D4C0',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Users style={{ width: '36px', height: '36px', color: '#8B4513' }} />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#8B4513', marginBottom: '0.5rem' }}>
                {stats.happyCustomers}+
              </div>
              <div style={{ fontSize: '1.125rem', color: '#666', fontWeight: '500' }}>
                Happy Customers
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#E8D4C0',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Heart style={{ width: '36px', height: '36px', color: '#8B4513' }} />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#8B4513', marginBottom: '0.5rem' }}>
                {stats.artisanPartners}+
              </div>
              <div style={{ fontSize: '1.125rem', color: '#666', fontWeight: '500' }}>
                Artisan Partners
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 0', backgroundColor: '#F5F5F5' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>
              Why Choose Handicraft?
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#666' }}>
              We bring you the finest handmade products with unmatched quality
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            
            {features.map((feature, i) => (
              <div key={i} style={{ 
                textAlign: 'center',
                padding: '2rem',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                transition: 'transform 0.3s, box-shadow 0.3s'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#E8D4C0',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <feature.icon style={{ width: '36px', height: '36px', color: '#8B4513' }} />
                </div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold', 
                  color: '#333', 
                  marginBottom: '0.75rem' 
                }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '1rem', color: '#666', margin: 0 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>
              Featured Products
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#666' }}>
              Explore our collection of handcrafted items
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #B8764F',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '2rem',
                marginBottom: '3rem'
              }}>
                {featuredProducts.map(product => (
                  <Link
                    key={product._id}
                    to={`/products/${product._id}`}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      textDecoration: 'none',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      display: 'block'
                    }}
                  >
                    <div style={{ position: 'relative', height: '250px', backgroundColor: '#f5f5f5' }}>
                      {product.imageUrl ? (
                        <img
                          src={`http://localhost:5000/uploads/${product.imageUrl}`}
                          alt={product.product_name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ 
                          width: '100%', 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          <ShoppingBag style={{ width: '64px', height: '64px', color: '#ccc' }} />
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{
                          backgroundColor: '#F5DEB3',
                          color: '#8B4513',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>
                          {product.Category || 'Category'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Star style={{ width: '16px', height: '16px', color: '#FFC107', fill: '#FFC107' }} />
                          <span style={{ marginLeft: '4px', fontSize: '0.875rem', color: '#666' }}>4.8</span>
                        </div>
                      </div>
                      <h3 style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: 'bold', 
                        color: '#333', 
                        marginBottom: '0.75rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {product.product_name || 'Product Name'}
                      </h3>
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: '#666', 
                        marginBottom: '1rem',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {product.Description || 'No description available.'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#8B4513' }}>
                          Rs. {product.Price?.toLocaleString() || '0'}
                        </span>
                        <span style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '600',
                          color: product.Quantity > 0 ? '#28a745' : '#dc3545'
                        }}>
                          {product.Quantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div style={{ textAlign: 'center' }}>
                <Link
                  to="/products"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: '#8B4513',
                    color: 'white',
                    padding: '14px 32px',
                    borderRadius: '8px',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s'
                  }}
                >
                  View All Products
                  <ArrowRight style={{ marginLeft: '8px', width: '20px', height: '20px' }} />
                </Link>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <ShoppingBag style={{ width: '64px', height: '64px', color: '#ccc', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>
                No Products Available
              </h3>
              <p style={{ fontSize: '1rem', color: '#999' }}>
                Check back later for amazing handicrafts!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - ONLY FOR ARTISAN REGISTRATION */}
      <section style={{ padding: '80px 0', backgroundColor: '#B8764F' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem' }}>
            Start Your Handicraft Journey Today
          </h2>
          <p style={{ fontSize: '1.25rem', color: 'white', opacity: '0.95', marginBottom: '2rem' }}>
            Are you an artisan? Join our community and showcase your handmade creations to thousands of customers
          </p>
          
          {/* ✅ ONLY ARTISAN REGISTRATION BUTTON */}
          <Link
            to="/addUser"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'white',
              color: '#8B4513',
              padding: '14px 32px',
              borderRadius: '8px',
              fontSize: '1.125rem',
              fontWeight: '600',
              textDecoration: 'none',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.3s'
            }}
          >
            🎨 Artisan Registration
            <ArrowRight style={{ marginLeft: '8px', width: '20px', height: '20px' }} />
          </Link>
        </div>
      </section>

      {/* ✅ CHATBOT COMPONENT - Fixed at bottom right */}
      <ChatBot />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Home;