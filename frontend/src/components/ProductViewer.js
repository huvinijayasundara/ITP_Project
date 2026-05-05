import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getFeedbacks } from "../api/feedbackApi";

const URL = "http://localhost:5000/products";
const RATINGS_URL = "http://localhost:5000/api/ratings";

function ProductViewer() {
  const [products, setProducts] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({});
  const [userRatings, setUserRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const userRole = localStorage.getItem('userRole') || localStorage.getItem('role') || 'user';
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || 'Guest User';
  const isAdmin = userRole === 'admin';

  // Fetch feedback statistics
  const fetchAllFeedbackStats = useCallback(async (productsData) => {
    try {
      const statsPromises = productsData.map(async (product) => {
        try {
          const response = await getFeedbacks({ productId: product._id });
          const feedbacks = response.data.data || [];
          
          const totalReviews = feedbacks.length;
          const averageRating = totalReviews > 0
            ? feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / totalReviews
            : 0;
          
          return { productId: product._id, totalReviews, averageRating };
        } catch (error) {
          return { productId: product._id, totalReviews: 0, averageRating: 0 };
        }
      });

      const stats = await Promise.all(statsPromises);
      const statsMap = {};
      stats.forEach(stat => {
        statsMap[stat.productId] = {
          totalReviews: stat.totalReviews,
          averageRating: stat.averageRating
        };
      });
      
      setFeedbackStats(statsMap);
    } catch (error) {
      console.error("Error fetching feedback stats:", error);
    }
  }, []);

  // Fetch user's ratings
  const fetchUserRatings = useCallback(async () => {
    try {
      const response = await axios.get(RATINGS_URL);
      const allRatings = response.data.data || response.data || [];
      
      const userRatingsMap = {};
      allRatings.forEach(rating => {
        if (rating.customerName === userName || rating.customerId === userId) {
          userRatingsMap[rating.productId] = rating.rating;
        }
      });
      
      setUserRatings(userRatingsMap);
    } catch (error) {
      console.error("Error fetching user ratings:", error);
    }
  }, [userName, userId]);

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(URL);
      const productsData = response.data.products || response.data;
      setProducts(productsData);
      await fetchAllFeedbackStats(productsData);
      await fetchUserRatings();
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch products");
      setLoading(false);
    }
  }, [fetchAllFeedbackStats, fetchUserRatings]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle star rating click - WITH BETTER ERROR HANDLING
  const handleRatingClick = async (productId, ratingValue, e) => {
    e.stopPropagation();

    try {
      console.log("Submitting rating:", { productId, userName, ratingValue });

      const response = await axios.post(RATINGS_URL, {
        productId: productId,
        customerName: userName,
        rating: ratingValue,
        comment: ""
      });

      console.log("✅ Rating submitted successfully:", response.data);

      setUserRatings(prev => ({ ...prev, [productId]: ratingValue }));

      try {
        const statsResponse = await getFeedbacks({ productId });
        const feedbacks = statsResponse.data.data || [];
        const totalReviews = feedbacks.length;
        const averageRating = totalReviews > 0
          ? feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / totalReviews
          : 0;
        
        setFeedbackStats(prev => ({
          ...prev,
          [productId]: { totalReviews, averageRating }
        }));
      } catch (statsError) {
        console.error("Error refreshing stats:", statsError);
      }

      alert(`✅ You rated this product ${ratingValue} stars!`);
    } catch (error) {
      console.error("❌ Error submitting rating:", error);
      
      if (error.response) {
        const errorMsg = error.response.data?.error || error.response.data?.message || 'Failed to submit rating';
        console.error("Server error:", errorMsg);
        alert(`❌ ${errorMsg}\n\nPlease make sure the backend server is running on http://localhost:5000`);
      } else if (error.request) {
        console.error("No response from server");
        alert("❌ Cannot connect to server.\n\nPlease check:\n1. Backend is running (npm start)\n2. Server is on http://localhost:5000\n3. Rating routes are configured");
      } else {
        console.error("Error:", error.message);
        alert(`❌ Error: ${error.message}`);
      }
    }
  };

  // Clickable Star Rating Component
  const ClickableStarRating = ({ productId, userRating, onRate }) => {
    const [hoverRating, setHoverRating] = useState(0);
    const displayRating = hoverRating || userRating || 0;

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          
          return (
            <span
              key={star}
              onClick={(e) => onRate(productId, star, e)}
              onMouseEnter={(e) => { e.stopPropagation(); setHoverRating(star); }}
              onMouseLeave={(e) => { e.stopPropagation(); setHoverRating(0); }}
              style={{
                fontSize: "24px",
                color: isFilled ? "#CD7F32" : "#D3D3D3",
                cursor: "pointer",
                transition: "all 0.2s ease",
                transform: hoverRating === star ? "scale(1.2)" : "scale(1)",
                display: "inline-block",
                userSelect: "none"
              }}
            >
              ★
            </span>
          );
        })}
      </div>
    );
  };

  // Add to cart
  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    
    if (!token) {
      if (window.confirm('⚠️ Please login to add items to cart\n\nClick OK to go to login page')) {
        navigate('/login');
      }
      return;
    }
    
    if (product.Quantity <= 0) {
      alert('❌ Sorry, this product is out of stock!');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/cart/add',
        { productId: product._id, quantity: 1 },
        { headers: { 'Authorization': `Bearer ${token}` }}
      );

      if (response.data.status === 'Ok') {
        alert(`✅ ${product.product_name} added to cart!`);
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
    }
  };

  const handleDelete = (id) => {
    if (!isAdmin) { alert('⛔ Only administrators can delete products!'); return; }
    if (window.confirm("Are you sure?")) {
      axios.delete(`${URL}/${id}`)
        .then(() => { alert("✅ Deleted!"); setProducts(products.filter((p) => p._id !== id)); })
        .catch(err => alert("❌ Error: " + err.message));
    }
  };

  const handleUpdate = (id) => {
    if (!isAdmin) { alert('⛔ Only administrators can edit!'); return; }
    navigate(`/Updateproduct/${id}`);
  };

  const handleAdd = () => {
    if (!isAdmin) { alert('⛔ Only administrators can add!'); return; }
    navigate("/addproduct");
  };

  const handleViewDetails = (id) => navigate(`/products/${id}`);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '24px' }}>
        ⏳ Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
          <h2 style={{ color: '#dc3545' }}>❌ {error}</h2>
          <button onClick={fetchProducts} style={{ marginTop: '20px', padding: '12px 24px', background: '#B8764F', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter((p) =>
    p.product_name.toLowerCase().includes(search.toLowerCase()) ||
    p.Category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <h1 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '32px' }}>🎨 Handcraft Products Collection</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>Discover authentic handcrafted items - Click stars to rate!</p>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            {isAdmin && (
              <button onClick={handleAdd} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                ➕ Add New Product
              </button>
            )}
            <input
              type="text"
              placeholder="🔍 Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: '250px', padding: '12px 20px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
            />
            <div style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
              📦 {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredProducts.map((product) => {
              const stats = feedbackStats[product._id] || { totalReviews: 0, averageRating: 0 };
              const userRating = userRatings[product._id] || 0;

              return (
                <div key={product._id} style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', transition: 'all 0.3s', display: 'flex', flexDirection: 'column' }}>
                  <div onClick={() => handleViewDetails(product._id)} style={{ height: '200px', background: product.imageUrl ? `url(http://localhost:5000/uploads/${product.imageUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', color: 'white', cursor: 'pointer' }}>
                    {!product.imageUrl && '🎨'}
                  </div>

                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '18px', fontWeight: 'bold' }}>{product.product_name}</h3>
                    <p style={{ color: '#666', fontSize: '14px', margin: '0 0 15px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>{product.Description}</p>

                    <div style={{ padding: '16px', background: '#F5F5F5', borderRadius: '12px', marginBottom: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                        <ClickableStarRating productId={product._id} userRating={userRating} onRate={handleRatingClick} />
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
                          {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "0.0"}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                        <span>💬</span>
                        <span>{stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}</span>
                      </div>

                      <div style={{ height: '6px', background: '#E0E0E0', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                        <div style={{ width: `${(stats.averageRating / 5) * 100}%`, height: '100%', background: '#FFC107', transition: 'width 0.3s ease' }} />
                      </div>

                      {stats.averageRating >= 4 && (
                        <div style={{ background: '#E8F5E9', color: '#2E7D32', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }}>
                          ⭐ HIGHLY RATED
                        </div>
                      )}

                      {userRating > 0 && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#2E7D32', fontWeight: '600', fontStyle: 'italic' }}>
                          ✓ You rated: {userRating} {userRating === 1 ? 'star' : 'stars'}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <span style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{product.Category}</span>
                      <span style={{ color: product.Quantity > 0 ? '#28a745' : '#dc3545', fontWeight: 'bold', fontSize: '13px' }}>
                        {product.Quantity > 0 ? `✅ ${product.Quantity} in stock` : '❌ Out of stock'}
                      </span>
                    </div>

                    <div style={{ background: '#FF6B35', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '15px' }}>
                      <div style={{ fontSize: '12px', color: 'white', marginBottom: '4px' }}>Price</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>Rs. {product.Price?.toLocaleString()}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                      {!isAdmin && product.Quantity > 0 && (
                        <>
                          <button onClick={(e) => handleAddToCart(product, e)} style={{ flex: 1, padding: '12px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                            🛒 Add to Cart
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleViewDetails(product._id); }} style={{ flex: 1, padding: '12px', background: '#28A745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                            💳 Buy Now
                          </button>
                        </>
                      )}
                      {!isAdmin && product.Quantity <= 0 && (
                        <button disabled style={{ flex: 1, padding: '12px', background: '#9E9E9E', color: 'white', border: 'none', borderRadius: '8px', cursor: 'not-allowed', fontWeight: 'bold', fontSize: '14px' }}>
                          ❌ Out of Stock
                        </button>
                      )}
                      {isAdmin && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); handleUpdate(product._id); }} style={{ flex: 1, padding: '12px', background: '#FFC107', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                            ✏️ Edit
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(product._id); }} style={{ flex: 1, padding: '12px', background: '#DC3545', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                            🗑️ Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ background: 'white', padding: '60px 40px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
            <h2 style={{ color: '#666', marginBottom: '10px' }}>No Products Found</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductViewer;