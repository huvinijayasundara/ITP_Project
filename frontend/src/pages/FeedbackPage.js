import React, { useState, useEffect } from "react";
import { getFeedbacks } from "../api/feedbackApi";
import FeedbackForm from "../components/Feedback/FeedbackForm";
import FeedbackList from "../components/Feedback/FeedbackList";
import FeedbackPDFButton from "../components/Feedback/FeedbackPDFButton";
import { useNavigate } from "react-router-dom";

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  // Get user role from localStorage
  const userRole = localStorage.getItem("role") || "customer";
  const isLoggedIn = !!localStorage.getItem("token");

  const fetchFeedbacks = React.useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (ratingFilter) params.rating = ratingFilter;
      
      // Admin can see all feedbacks
      if (userRole === "admin") {
        params.showAll = true;
      }

      console.log("Fetching feedbacks with filters:", params);
      const response = await getFeedbacks(params);
      setFeedbacks(response.data.data || []);
      console.log("Feedbacks loaded successfully:", response.data.data?.length || 0);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      setError("Failed to load feedbacks: " + error.message);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, ratingFilter, userRole]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      setCategoryFilter(value);
    } else if (name === "rating") {
      setRatingFilter(value);
    }
  };

  const clearFilters = () => {
    setCategoryFilter("");
    setRatingFilter("");
  };

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #E8D4C0 0%, #F5DEB3 25%, #E8D4C0 50%, #F5DEB3 75%, #E8D4C0 100%)",
      padding: "20px"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Animated Header */}
        <div style={{ 
          textAlign: "center", 
          marginBottom: "40px",
          background: "linear-gradient(135deg, #B8764F 0%, #8B4513 100%)",
          padding: "40px 20px",
          borderRadius: "20px",
          boxShadow: "0 15px 35px rgba(184, 118, 79, 0.3)",
          color: "white",
          position: "relative",
          overflow: "hidden"
        }}>
          <h1 style={{ 
            fontSize: "3rem", 
            margin: "0 0 15px 0",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
          }}>
            Handcraft Feedback Hub
          </h1>
          <p style={{ 
            fontSize: "1.3rem", 
            margin: "0",
            opacity: "0.95"
          }}>
            {userRole === "admin" 
              ? "Admin Dashboard - Manage all feedback with style!" 
              : "Share your handcraft journey with us"
            }
          </p>
          
          {userRole === "admin" && (
            <div style={{
              display: "inline-block",
              marginTop: "20px",
              padding: "10px 25px",
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "25px",
              fontSize: "1rem",
              fontWeight: "bold",
              boxShadow: "0 5px 15px rgba(0,0,0,0.2)"
            }}>
              👑 Administrator Mode
            </div>
          )}
        </div>

        {/* Login Notice for Non-logged in Users */}
        {!isLoggedIn && (
          <div style={{
            marginBottom: "40px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "20px",
            padding: "30px",
            boxShadow: "0 15px 35px rgba(102, 126, 234, 0.3)",
            color: "white",
            textAlign: "center"
          }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "1.5rem" }}>
              🔒 Login Required
            </h3>
            <p style={{ margin: "0 0 20px 0", fontSize: "1.1rem" }}>
              Please login to submit feedback and interact with reviews
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "12px 30px",
                background: "white",
                color: "#667eea",
                border: "none",
                borderRadius: "25px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "bold",
                boxShadow: "0 5px 15px rgba(0,0,0,0.2)"
              }}
            >
              Login Now
            </button>
          </div>
        )}

        {/* Admin PDF Tools - ONLY FOR ADMIN */}
        {userRole === "admin" && isLoggedIn && (
          <div style={{
            marginBottom: "40px",
            background: "linear-gradient(135deg, #8B4513 0%, #654321 100%)",
            borderRadius: "20px",
            padding: "30px",
            boxShadow: "0 15px 35px rgba(139, 69, 19, 0.3)"
          }}>
            <FeedbackPDFButton userRole={userRole} />
          </div>
        )}

        {/* Feedback Form - Only for logged in users */}
        {isLoggedIn && (
          <div style={{ 
            marginBottom: "50px",
            background: "white",
            borderRadius: "25px",
            padding: "40px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            border: "3px solid #E8D4C0"
          }}>
            <h2 style={{ 
              color: "#8B4513",
              fontSize: "2.5rem",
              marginBottom: "30px",
              textAlign: "center",
              textShadow: "2px 2px 4px rgba(0,0,0,0.1)"
            }}>
              {userRole === "admin" ? "Add New Feedback" : "Share Your Experience"}
            </h2>
            <FeedbackForm onAdded={fetchFeedbacks} />
          </div>
        )}

        {/* Filters Section */}
        <div style={{ 
          marginBottom: "40px", 
          background: "white",
          padding: "30px", 
          borderRadius: "20px",
          boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
          border: "3px solid #E8D4C0"
        }}>
          <h3 style={{ 
            color: "#8B4513", 
            marginBottom: "25px",
            fontSize: "2rem",
            textAlign: "center",
            textShadow: "1px 1px 2px rgba(0,0,0,0.1)"
          }}>
            Smart Filters
          </h3>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px", 
            alignItems: "center"
          }}>
            {/* Category Filter */}
            <div style={{
              background: "linear-gradient(45deg, #B8764F, #8B4513)",
              padding: "20px",
              borderRadius: "15px",
              boxShadow: "0 8px 20px rgba(184, 118, 79, 0.3)"
            }}>
              <label style={{ 
                display: "block",
                marginBottom: "10px", 
                fontWeight: "bold",
                color: "white",
                fontSize: "1.1rem",
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
              }}>
                Category:
              </label>
              <select
                name="category"
                value={categoryFilter}
                onChange={handleFilterChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "1rem",
                  background: "white",
                  color: "#333",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                <option value="">All Categories</option>
                <option value="product">Product</option>
                <option value="service">Service</option>
                <option value="delivery">Delivery</option>
                <option value="website">Website</option>
                <option value="general">General</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div style={{
              background: "linear-gradient(45deg, #E8D4C0, #F5DEB3)",
              padding: "20px",
              borderRadius: "15px",
              boxShadow: "0 8px 20px rgba(232, 212, 192, 0.5)"
            }}>
              <label style={{ 
                display: "block",
                marginBottom: "10px", 
                fontWeight: "bold",
                color: "#8B4513",
                fontSize: "1.1rem",
                textShadow: "1px 1px 2px rgba(255,255,255,0.5)"
              }}>
                Rating:
              </label>
              <select
                name="rating"
                value={ratingFilter}
                onChange={handleFilterChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "1rem",
                  background: "white",
                  color: "#333",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div style={{ textAlign: "center" }}>
              <button
                onClick={clearFilters}
                style={{
                  padding: "15px 30px",
                  background: "linear-gradient(45deg, #8B4513, #654321)",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  boxShadow: "0 8px 20px rgba(139, 69, 19, 0.3)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
                }}
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(categoryFilter || ratingFilter) && (
            <div style={{ 
              marginTop: "25px", 
              textAlign: "center"
            }}>
              <p style={{ 
                margin: "0 0 15px 0",
                fontSize: "1.2rem",
                fontWeight: "bold",
                color: "#8B4513"
              }}>
                Active Filters:
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap" }}>
                {categoryFilter && (
                  <span style={{ 
                    padding: "8px 20px",
                    background: "linear-gradient(45deg, #B8764F, #8B4513)",
                    color: "white",
                    borderRadius: "20px",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    boxShadow: "0 5px 15px rgba(184, 118, 79, 0.3)"
                  }}>
                    {categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}
                  </span>
                )}
                {ratingFilter && (
                  <span style={{ 
                    padding: "8px 20px",
                    background: "linear-gradient(45deg, #E8D4C0, #F5DEB3)",
                    color: "#8B4513",
                    borderRadius: "20px",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    boxShadow: "0 5px 15px rgba(232, 212, 192, 0.5)"
                  }}>
                    {ratingFilter} Star{ratingFilter !== "1" ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Feedback List Section */}
        <div style={{
          background: "white",
          borderRadius: "25px",
          padding: "40px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          border: "3px solid #E8D4C0"
        }}>
          <h2 style={{ 
            color: "#8B4513",
            fontSize: "2.5rem",
            marginBottom: "30px",
            textAlign: "center",
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)"
          }}>
            {userRole === "admin" ? "All Customer Voices" : "Community Feedback"}
          </h2>
          <div style={{ 
            fontSize: "1.2rem", 
            color: "#666", 
            fontWeight: "normal",
            marginBottom: "20px",
            background: "#F5DEB3",
            padding: "10px 20px",
            borderRadius: "20px",
            display: "block",
            textAlign: "center",
            boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
          }}>
            {loading ? "Loading feedback..." : `${feedbacks.length} review${feedbacks.length !== 1 ? 's' : ''} found`}
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
              color: "white",
              padding: "20px",
              borderRadius: "15px",
              marginBottom: "30px",
              boxShadow: "0 10px 25px rgba(255, 107, 107, 0.3)",
              textAlign: "center"
            }}>
              <p style={{ margin: "0 0 15px 0", fontSize: "1.1rem", fontWeight: "bold" }}>
                Oops! Something went wrong
              </p>
              <p style={{ margin: "0 0 15px 0" }}>
                {error}
              </p>
              <button 
                onClick={fetchFeedbacks}
                style={{
                  padding: "10px 25px",
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  border: "2px solid white",
                  borderRadius: "25px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  transition: "all 0.3s ease"
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading Animation */}
          {loading && (
            <div style={{
              textAlign: "center",
              padding: "60px",
              background: "linear-gradient(135deg, #F5DEB3, #E8D4C0)",
              borderRadius: "20px",
              color: "#8B4513"
            }}>
              <div style={{ 
                fontSize: "4rem", 
                marginBottom: "20px"
              }}>
                ⏳
              </div>
              <h3 style={{ margin: "0 0 10px 0" }}>Creating magic...</h3>
              <p style={{ margin: "0", opacity: "0.8" }}>Loading your beautiful feedback</p>
            </div>
          )}

          {/* Feedback List */}
          {!loading && !error && feedbacks.length > 0 && (
            <div style={{
              background: "#FAFAFA",
              borderRadius: "20px",
              padding: "30px",
              boxShadow: "inset 0 5px 15px rgba(0,0,0,0.05)"
            }}>
              <FeedbackList 
                feedbacks={feedbacks} 
                onUpdate={fetchFeedbacks}
                userRole={userRole}
                isLoggedIn={isLoggedIn}
              />
            </div>
          )}

          {/* No Feedbacks Message */}
          {!loading && !error && feedbacks.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "60px",
              background: "linear-gradient(135deg, #F5DEB3, #E8D4C0)",
              borderRadius: "20px",
              color: "#8B4513"
            }}>
              <div style={{ fontSize: "5rem", marginBottom: "30px" }}>📭</div>
              <h3 style={{ fontSize: "2rem", margin: "0 0 20px 0", color: "#8B4513" }}>
                No feedback yet!
              </h3>
              <p style={{ fontSize: "1.2rem", margin: "0", opacity: "0.8" }}>
                {(categoryFilter || ratingFilter) 
                  ? "Try different filters to explore more reviews!"
                  : "Be the first artisan to share your handcraft experience!"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default FeedbackPage;