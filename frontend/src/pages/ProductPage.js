import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getFeedbacks } from '../api/feedbackApi';
import { getRatings } from '../api/ratingApi';
import FeedbackForm from '../components/Feedback/FeedbackForm';
import FeedbackList from '../components/Feedback/FeedbackList';
import InteractiveStarRating from '../components/Ratings/InteractiveStarRating';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  
  const userRole = localStorage.getItem('userRole') || localStorage.getItem('role') || 'user';
  const token = localStorage.getItem('token');

  // Fetch product details
  const fetchProductDetails = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/products/${id}`);
      setProduct(response.data.products);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
      setLoading(false);
    }
  }, [id]);

  // Fetch feedbacks
  const fetchProductFeedbacks = useCallback(async () => {
    setLoadingFeedback(true);
    try {
      const response = await getFeedbacks({ productId: id });
      setFeedbacks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setFeedbacks([]);
    } finally {
      setLoadingFeedback(false);
    }
  }, [id]);

  // Fetch ratings
  const fetchProductRatings = useCallback(async () => {
    try {
      await getRatings({ productId: id });
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchProductDetails();
    fetchProductFeedbacks();
    fetchProductRatings();
  }, [fetchProductDetails, fetchProductFeedbacks, fetchProductRatings]);

  // 🛒 ADD TO CART FUNCTION
  const handleAddToCart = async () => {
    if (!token) {
      if (window.confirm('⚠️ Please login to add items to cart\n\nClick OK to go to login page')) {
        navigate('/login');
      }
      return;
    }

    if (product.Quantity < 1) {
      alert('❌ This product is out of stock!');
      return;
    }

    setAddingToCart(true);

    try {
      const response = await axios.post('http://localhost:5000/cart/add', {
        productId: product._id,
        quantity: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 'Ok') {
        alert(`✅ ${product.product_name} added to cart!`);
      } else {
        alert('⚠️ Failed to add to cart. Please try again.');
      }
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      
      if (error.response?.status === 401) {
        alert('⚠️ Session expired. Please login again.');
        localStorage.clear();
        navigate('/login');
      } else {
        alert(`❌ Error: ${error.response?.data?.message || 'Failed to add to cart'}`);
      }
    } finally {
      setAddingToCart(false);
    }
  };

  // Calculate average rating
  const calculateAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
    return sum / feedbacks.length;
  };

  // Rating distribution
  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbacks.forEach(f => {
      if (f.rating >= 1 && f.rating <= 5) {
        distribution[f.rating]++;
      }
    });
    return distribution;
  };

  const handleFeedbackSubmitted = () => {
    setShowFeedbackForm(false);
    fetchProductFeedbacks();
  };

  const isAdmin = userRole === 'admin';

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: 'white', fontSize: '1.2rem', fontWeight: '600' }}>
            Loading product details...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          maxWidth: '500px'
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>❌ {error}</h2>
          <button onClick={fetchProductDetails} style={{
            padding: '12px 24px',
            background: '#8B4513',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}>
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          maxWidth: '500px'
        }}>
          <h2 style={{ color: '#8B4513', marginBottom: '20px' }}>Product not found</h2>
          <button onClick={() => navigate('/products')} style={{
            padding: '12px 24px',
            background: '#8B4513',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}>
            ← Back to Products
          </button>
        </div>
      </div>
    );
  }

  const averageRating = calculateAverageRating();
  const distribution = getRatingDistribution();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '10px 20px',
              background: '#8B4513',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            ← Back to Products
          </button>
          <h1 style={{ 
            color: '#8B4513', 
            margin: 0,
            fontSize: '1.8rem',
            fontWeight: 'bold'
          }}>
            Product Details
          </h1>
          <div style={{ width: '150px' }}></div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* LEFT COLUMN - Product Details */}
          <div>
            {/* Product Image */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              {product.imageUrl ? (
                <img
                  src={`http://localhost:5000/uploads/${product.imageUrl}`}
                  alt={product.product_name}
                  style={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '400px',
                  background: '#E8D4C0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '64px',
                  color: '#8B4513'
                }}>
                  📦
                </div>
              )}
            </div>

            {/* Product Info Card */}
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '12px',
              marginBottom: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              <div style={{ marginBottom: '15px' }}>
                <span style={{
                  backgroundColor: '#F5DEB3',
                  color: '#8B4513',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  {product.Category}
                </span>
              </div>

              <h2 style={{
                color: '#333',
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '15px',
                margin: '0 0 15px 0'
              }}>
                {product.product_name}
              </h2>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '20px',
                paddingBottom: '20px',
                borderBottom: '1px solid #E8D4C0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <InteractiveStarRating rating={averageRating} size={24} />
                  <span style={{
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    color: '#333'
                  }}>
                    {averageRating.toFixed(1)}
                  </span>
                </div>
                <span style={{
                  color: '#666',
                  fontSize: '1rem'
                }}>
                  ({feedbacks.length} {feedbacks.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>

              <div style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: '#8B4513',
                marginBottom: '20px'
              }}>
                Rs. {product.Price?.toLocaleString()}
              </div>

              <div style={{
                marginBottom: '20px',
                padding: '15px',
                background: '#F5F5F5',
                borderRadius: '8px'
              }}>
                <p style={{
                  margin: '0 0 10px 0',
                  color: '#666',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  Stock Status:
                </p>
                <span style={{
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  color: product.Quantity > 0 ? '#28a745' : '#dc3545'
                }}>
                  {product.Quantity > 0 ? `✅ In Stock (${product.Quantity} available)` : '❌ Out of Stock'}
                </span>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <h3 style={{
                  color: '#333',
                  fontSize: '1.3rem',
                  marginBottom: '12px',
                  margin: '0 0 12px 0'
                }}>
                  Description
                </h3>
                <p style={{
                  color: '#666',
                  fontSize: '1rem',
                  lineHeight: '1.8',
                  margin: 0
                }}>
                  {product.Description}
                </p>
              </div>

              {/* USER ACTIONS */}
              {!isAdmin && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleAddToCart}
                    disabled={product.Quantity < 1 || addingToCart}
                    style={{
                      flex: 1,
                      padding: '16px 24px',
                      background: product.Quantity < 1 || addingToCart ? '#ccc' : '#8B4513',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: product.Quantity < 1 || addingToCart ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    {addingToCart ? '⏳ Adding...' : product.Quantity < 1 ? '❌ Out of Stock' : '🛒 Add to Cart'}
                  </button>
                  
                  <button
                    onClick={() => navigate('/cart')}
                    style={{
                      padding: '16px 24px',
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
                    }}
                  >
                    🛒
                  </button>
                </div>
              )}

              {/* ADMIN ACTIONS */}
              {isAdmin && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => navigate(`/Updateproduct/${product._id}`)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#8B4513',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this product?')) {
                        axios.delete(`http://localhost:5000/products/${product._id}`)
                          .then(() => {
                            alert('✅ Product deleted!');
                            navigate('/products');
                          })
                          .catch(err => alert('❌ Error deleting'));
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>

            {/* Rating Distribution */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ 
                color: '#8B4513', 
                marginBottom: '20px', 
                margin: '0 0 20px 0',
                fontSize: '1.3rem',
                fontWeight: 'bold'
              }}>
                📊 Rating Distribution
              </h3>
              
              {[5, 4, 3, 2, 1].map(star => {
                const count = distribution[star];
                const percentage = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0;
                
                return (
                  <div key={star} style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '12px',
                    gap: '15px'
                  }}>
                    <div style={{
                      minWidth: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{star}</span>
                      <span style={{ color: '#FFD700', fontSize: '16px' }}>★</span>
                    </div>
                    
                    <div style={{
                      flex: 1,
                      height: '24px',
                      background: '#E8D4C0',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${percentage}%`,
                        background: star >= 4 ? '#28a745' : star >= 3 ? '#ffc107' : '#dc3545',
                        borderRadius: '12px'
                      }} />
                    </div>
                    
                    <div style={{
                      minWidth: '80px',
                      textAlign: 'right',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#666'
                    }}>
                      {count} ({percentage.toFixed(0)}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT - Feedbacks */}
          <div>
            {!isAdmin && (
              <div style={{ marginBottom: '20px' }}>
                {!showFeedbackForm ? (
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    style={{
                      width: '100%',
                      padding: '20px',
                      background: '#8B4513',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                  >
                    💬 Give Feedback & Rating
                  </button>
                ) : (
                  <div>
                    <FeedbackForm 
                      onAdded={handleFeedbackSubmitted}
                      productId={id}
                    />
                    <button
                      onClick={() => setShowFeedbackForm(false)}
                      style={{
                        width: '100%',
                        marginTop: '10px',
                        padding: '12px',
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ✖️ Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '15px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ 
                margin: '0', 
                color: '#8B4513',
                fontSize: '1.3rem',
                fontWeight: 'bold'
              }}>
                💬 Customer Reviews ({feedbacks.length})
              </h3>
            </div>

            {loadingFeedback && (
              <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#666',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  border: '4px solid #E8D4C0',
                  borderTop: '4px solid #B8764F',
                  borderRadius: '50%',
                  margin: '0 auto 15px',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Loading reviews...
              </div>
            )}

            {!loadingFeedback && feedbacks.length > 0 && (
              <div style={{ maxHeight: '800px', overflowY: 'auto' }}>
                <FeedbackList 
                  feedbacks={feedbacks}
                  onUpdate={fetchProductFeedbacks}
                  userRole={userRole}
                />
              </div>
            )}

            {!loadingFeedback && feedbacks.length === 0 && (
              <div style={{
                background: 'white',
                padding: '60px 40px',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>💬</div>
                <h3 style={{ 
                  color: '#8B4513', 
                  marginBottom: '10px',
                  margin: '0 0 10px 0',
                  fontSize: '1.3rem'
                }}>
                  No reviews yet
                </h3>
                <p style={{ margin: 0, color: '#666', fontSize: '1rem' }}>
                  Be the first to review this product!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;