import React, { useState, useEffect } from "react";
import axios from "axios";
import { ShoppingBag } from "lucide-react";
import { createRating, getRatings } from "../api/ratingApi";

const URL = "http://localhost:5000/products";

function Product() {
  const [products, setProducts] = useState([]);
  const [productRatings, setProductRatings] = useState({});
  const [userRatings, setUserRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const userId = localStorage.getItem('userId') || 'guest';
  const userName = localStorage.getItem('userName') || 'Guest User';

  // Fetch products and ratings
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsRes = await axios.get(URL);
        const productsData = productsRes.data.products || productsRes.data;
        setProducts(productsData);

        // Fetch all ratings
        const ratingsRes = await getRatings({});
        const allRatings = ratingsRes.data.data || ratingsRes.data || [];

        // Calculate average ratings per product
        const ratingsMap = {};
        const userRatingsMap = {};

        productsData.forEach(product => {
          const productId = product._id;
          const productRatingsList = allRatings.filter(r => r.productId === productId);
          
          if (productRatingsList.length > 0) {
            const avgRating = productRatingsList.reduce((sum, r) => sum + r.rating, 0) / productRatingsList.length;
            ratingsMap[productId] = {
              average: Math.round(avgRating * 10) / 10,
              count: productRatingsList.length
            };

            // Check if current user has rated this product
            const userRating = productRatingsList.find(r => 
              r.customerName === userName || r.customerId === userId
            );
            if (userRating) {
              userRatingsMap[productId] = userRating.rating;
            }
          } else {
            ratingsMap[productId] = { average: 0, count: 0 };
          }
        });

        setProductRatings(ratingsMap);
        setUserRatings(userRatingsMap);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch products");
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, userName]);

  // Handle star rating click
  const handleRatingClick = async (productId, rating, e) => {
    e.stopPropagation();

    try {
      // Submit rating
      await createRating({
        productId,
        customerName: userName,
        rating,
        comment: ""
      });

      // Update local state
      setUserRatings(prev => ({ ...prev, [productId]: rating }));

      // Recalculate average
      const ratingsRes = await getRatings({ productId });
      const productRatingsList = ratingsRes.data.data || ratingsRes.data || [];
      
      if (productRatingsList.length > 0) {
        const avgRating = productRatingsList.reduce((sum, r) => sum + r.rating, 0) / productRatingsList.length;
        setProductRatings(prev => ({
          ...prev,
          [productId]: {
            average: Math.round(avgRating * 10) / 10,
            count: productRatingsList.length
          }
        }));
      }

      alert(`✅ You rated this product ${rating} stars!`);
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating. Please try again.");
    }
  };

  // Clickable Star Rating Component - Matches your design exactly
  const ClickableStarRating = ({ productId, averageRating, reviewCount, userRating, onRate }) => {
    const [hoverRating, setHoverRating] = useState(0);
    const currentRating = userRating || 0;

    return (
      <div style={{
        backgroundColor: '#F5F5F5',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '12px'
      }}>
        {/* Stars and Average Rating */}
        <div style={{ 
          display: "flex", 
          alignItems: "center",
          gap: "12px",
          marginBottom: "10px"
        }}>
          {/* Clickable Stars */}
          <div style={{ display: "flex", gap: "4px" }}>
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= (hoverRating || currentRating);
              
              return (
                <span
                  key={star}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRate(productId, star, e);
                  }}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    setHoverRating(star);
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    setHoverRating(0);
                  }}
                  style={{
                    fontSize: "24px",
                    color: isFilled ? "#CD7F32" : "#D3D3D3", // Copper/Orange for filled, Light gray for empty
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    transform: hoverRating === star ? "scale(1.15)" : "scale(1)",
                    display: "inline-block",
                    userSelect: "none"
                  }}
                >
                  ★
                </span>
              );
            })}
          </div>

          {/* Average Rating Score */}
          <div style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#333",
            minWidth: "40px"
          }}>
            {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
          </div>
        </div>

        {/* Review Count */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px"
        }}>
          <span style={{ fontSize: "14px", color: "#9C27B0" }}>💬</span>
          <span style={{ fontSize: "14px", color: "#666" }}>
            {reviewCount || 0} reviews
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{
          height: "6px",
          backgroundColor: "#E0E0E0",
          borderRadius: "3px",
          overflow: "hidden",
          marginBottom: "8px"
        }}>
          <div style={{
            height: "100%",
            width: `${averageRating > 0 ? (averageRating / 5) * 100 : 0}%`,
            backgroundColor: "#FFC107",
            borderRadius: "3px",
            transition: "width 0.3s ease"
          }} />
        </div>

        {/* Highly Rated Badge */}
        {averageRating >= 4.0 && (
          <div style={{
            backgroundColor: "#E8F5E9",
            color: "#2E7D32",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "600",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px"
          }}>
            <span>⭐</span>
            <span>HIGHLY RATED</span>
          </div>
        )}

        {/* User Rating Indicator */}
        {currentRating > 0 && (
          <div style={{
            marginTop: "8px",
            fontSize: "12px",
            color: "#2E7D32",
            fontWeight: "600",
            fontStyle: "italic"
          }}>
            ✓ You rated: {currentRating} {currentRating === 1 ? 'star' : 'stars'}
          </div>
        )}

        {/* Click to Rate Message */}
        {!currentRating && (
          <div style={{
            marginTop: "8px",
            fontSize: "12px",
            color: "#999",
            fontStyle: "italic"
          }}>
            Click stars to rate this product
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
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
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <p style={{ color: '#dc3545', fontSize: '1.2rem', margin: '0' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)',
        padding: '40px 20px'
      }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: 'white',
          borderRadius: '12px',
          maxWidth: '600px',
          margin: '0 auto',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <ShoppingBag style={{ width: '64px', height: '64px', color: '#ccc', margin: '0 auto 20px' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
            No Products Available
          </h3>
          <p style={{ fontSize: '1rem', color: '#999', margin: 0 }}>
            Check back later for amazing handicrafts!
          </p>
        </div>
      </div>
    );
  }

  // Filter products based on search
  const filteredProducts = products.filter((p) =>
    p.product_name.toLowerCase().includes(search.toLowerCase()) ||
    p.Category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #B8764F 0%, #8B4513 100%)', 
      padding: '40px 20px' 
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '40px', color: 'white' }}>
          <h1 style={{ 
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '12px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Our Handicraft Collection
          </h1>
          <p style={{ 
            fontSize: '1.125rem',
            opacity: 0.95
          }}>
            Explore our handmade treasures crafted with love
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ 
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <input
            type="text"
            placeholder="Search by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          />
        </div>

        {/* Products Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {filteredProducts.map((p) => (
            <div 
              key={p._id}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              }}
            >
              {/* Product Image */}
              <div style={{ height: '250px', backgroundColor: '#f5f5f5', position: 'relative' }}>
                {p.imageUrl ? (
                  <img
                    src={`http://localhost:5000/uploads/${p.imageUrl}`}
                    alt={p.product_name}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }}
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

              {/* Product Details */}
              <div style={{ 
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                flex: 1
              }}>
                {/* Product Title */}
                <h5 style={{ 
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {p.product_name}
                </h5>
                
                {/* Product Description */}
                <p style={{ 
                  fontSize: '0.875rem',
                  color: '#666',
                  marginBottom: '16px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  minHeight: '40px'
                }}>
                  {p.Description}
                </p>

                {/* Clickable Star Rating Section */}
                <ClickableStarRating
                  productId={p._id}
                  averageRating={productRatings[p._id]?.average || 0}
                  reviewCount={productRatings[p._id]?.count || 0}
                  userRating={userRatings[p._id] || 0}
                  onRate={handleRatingClick}
                />

                {/* Price Section */}
                <div style={{
                  backgroundColor: '#FF6B35',
                  padding: '16px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '14px', color: 'white', marginBottom: '4px' }}>
                    Price
                  </div>
                  <div style={{ 
                    fontSize: '1.75rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    Rs. {p.Price?.toLocaleString() || '0'}
                  </div>
                </div>

                {/* Stock Status */}
                {p.Quantity <= 0 && (
                  <div style={{
                    backgroundColor: '#FFF9C4',
                    padding: '10px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    marginBottom: '12px',
                    color: '#F57C00',
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}>
                    <span>⚠️</span>
                    <span>Out of Stock</span>
                  </div>
                )}

                {/* Action Buttons */}
                {p.Quantity > 0 ? (
                  <>
                    <button 
                      style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: '#007BFF',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '10px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#0056b3';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#007BFF';
                      }}
                    >
                      <ShoppingBag style={{ width: '18px', height: '18px' }} />
                      Add to Cart
                    </button>
                    <button 
                      style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: '#28A745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#218838';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#28A745';
                      }}
                    >
                      <span>💳</span>
                      Buy Now
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      disabled
                      style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: '#9E9E9E',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'not-allowed',
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>❌</span>
                      Out of Stock
                    </button>
                    <button 
                      disabled
                      style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: '#9E9E9E',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>❌</span>
                      Unavailable
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ 
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <ShoppingBag style={{ width: '64px', height: '64px', color: '#ccc', margin: '0 auto 20px' }} />
            <p style={{ 
              fontSize: '1.2rem',
              color: '#999',
              margin: 0
            }}>
              No matching products found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Product;