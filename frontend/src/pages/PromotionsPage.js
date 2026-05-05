import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPromotions, deletePromotion } from "../api/promotionApi";
import PromotionForm from "../components/Promotion/PromotionForm";
import PromotionList from "../components/Promotion/PromotionList";

const PromotionsPage = () => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get user role from localStorage
  const [userRole, setUserRole] = useState("user");
  const [userName, setUserName] = useState("");

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // ✅ FIX: Form states for admin with EDIT support
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);

  const promotionTypes = [
    { value: "social_media", label: "Social Media", icon: "📱" },
    { value: "email", label: "Email Marketing", icon: "📧" },
    { value: "sms", label: "SMS Campaign", icon: "💬" },
    { value: "messaging", label: "Messaging Apps", icon: "💬" },
    { value: "welcome", label: "Welcome Offer", icon: "🎉" },
    { value: "loyalty", label: "Loyalty Program", icon: "⭐" }
  ];

  const platforms = [
    "Facebook", "Instagram", "Twitter", "LinkedIn", "TikTok",
    "Email Newsletter", "SMS", "WhatsApp", "Telegram", "Website"
  ];

  // Check user authentication and role
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || !user) {
      alert("Please login to view promotions");
      navigate("/login");
      return;
    }

    const role = user.role || "user";
    setUserRole(role);
    setUserName(user.name || "User");

    console.log("Current user:", user);
    console.log("User role:", role);
  }, [navigate]);

  // Fetch promotions from backend
  const fetchPromotions = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getPromotions();
      const promotionsData = response.data.data || response.data || [];
      setPromotions(promotionsData);
      setFilteredPromotions(promotionsData);
    } catch (err) {
      console.error("Error fetching promotions:", err);
      setError("Failed to load promotions: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // Handle search and filtering
  useEffect(() => {
    let filtered = [...promotions];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(promotion =>
        promotion.title?.toLowerCase().includes(query) ||
        promotion.description?.toLowerCase().includes(query) ||
        promotion.platform?.toLowerCase().includes(query) ||
        promotion.promotionCode?.toLowerCase().includes(query) ||
        promotion.type?.toLowerCase().includes(query)
      );
    }

    if (selectedType) {
      filtered = filtered.filter(promotion => promotion.type === selectedType);
    }

    if (selectedPlatform) {
      filtered = filtered.filter(promotion => promotion.platform === selectedPlatform);
    }

    if (selectedStatus) {
      filtered = filtered.filter(promotion => {
        const now = new Date();
        const startDate = new Date(promotion.startDate);
        const endDate = new Date(promotion.endDate);

        let currentStatus = promotion.status;
        if (endDate < now) currentStatus = "expired";
        else if (startDate <= now && now <= endDate) currentStatus = "active";
        else if (startDate > now) currentStatus = "upcoming";

        return currentStatus === selectedStatus;
      });
    }

    setFilteredPromotions(filtered);
  }, [promotions, searchQuery, selectedType, selectedPlatform, selectedStatus]);

  // Handle delete
  const handleDelete = async (promotionId, title) => {
    if (userRole !== "admin") {
      alert("You do not have permission to delete promotions");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await deletePromotion(promotionId);
      alert("✅ Promotion deleted successfully!");
      await fetchPromotions();
      
      // If we were editing this promotion, close the form
      if (editingPromotion && editingPromotion._id === promotionId) {
        setEditingPromotion(null);
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Error deleting promotion:", error);
      alert("❌ Error: " + (error.response?.data?.error || error.message));
    }
  };

  // ✅ FIX: Handle edit - opens form with promotion data
  const handleEdit = (promotion) => {
    if (userRole !== "admin") {
      alert("You do not have permission to edit promotions");
      return;
    }
    
    console.log("✏️ Editing promotion:", promotion);
    setEditingPromotion(promotion);
    setShowAddForm(true);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ Handle form completion (create or update)
  const handleFormComplete = () => {
    fetchPromotions();
    setShowAddForm(false);
    setEditingPromotion(null);
  };

  // ✅ Handle cancel edit
  const handleCancelEdit = () => {
    setEditingPromotion(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div style={{
        background: "linear-gradient(135deg, #B8764F 0%, #8B4513 100%)",
        minHeight: "100vh",
        padding: "20px"
      }}>
        <div style={{
          textAlign: "center",
          padding: "60px",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          maxWidth: "500px",
          margin: "100px auto",
          color: "#333",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📢</div>
          <h3 style={{ color: "#8B4513" }}>Loading amazing promotions...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #B8764F 0%, #8B4513 50%, #B8764F 100%)",
      minHeight: "100vh",
      padding: "20px"
    }}>
      {/* Header */}
      <div style={{
        textAlign: "center",
        marginBottom: "40px",
        color: "white"
      }}>
        <h1 style={{
          fontSize: "3.5rem",
          margin: "0 0 15px 0",
          textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
        }}>
          📢 Promotion Center
        </h1>
        <p style={{ fontSize: "1.3rem", opacity: "0.95" }}>
          {userRole === "admin" 
            ? `Welcome Admin ${userName} - Manage all promotional campaigns` 
            : `Welcome ${userName} - Discover exclusive deals and special offers`}
        </p>
        <div style={{
          background: "rgba(255, 255, 255, 0.25)",
          display: "inline-block",
          padding: "8px 20px",
          borderRadius: "20px",
          marginTop: "10px",
          fontSize: "0.9rem",
          fontWeight: "bold"
        }}>
          {userRole === "admin" ? "🔒 Admin Access" : "Best Promotion for You"}
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* Search and Filters Section */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "30px",
          marginBottom: "40px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
        }}>
          {/* Search Bar */}
          <div style={{
            display: "grid",
            gridTemplateColumns: userRole === "admin" ? "1fr auto" : "1fr",
            gap: "20px",
            marginBottom: "25px",
            alignItems: "center"
          }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="🔍 Search promotions, platforms, codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "15px 20px",
                  fontSize: "1.1rem",
                  border: "2px solid #E8D4C0",
                  borderRadius: "12px",
                  outline: "none",
                  transition: "all 0.3s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "#B8764F"}
                onBlur={(e) => e.target.style.borderColor = "#E8D4C0"}
              />
            </div>
            
            {userRole === "admin" && (
              <button
                onClick={() => {
                  if (showAddForm && !editingPromotion) {
                    setShowAddForm(false);
                  } else {
                    setEditingPromotion(null);
                    setShowAddForm(!showAddForm);
                  }
                }}
                style={{
                  padding: "15px 30px",
                  background: showAddForm 
                    ? "linear-gradient(45deg, #999, #666)"
                    : "linear-gradient(45deg, #8B4513, #B8764F)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                }}
              >
                {showAddForm ? "❌ Cancel" : "➕ Add New Promotion"}
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px"
          }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#8B4513" }}>
                Type:
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #E8D4C0",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  outline: "none",
                  color: "#333"
                }}
              >
                <option value="">All Types</option>
                {promotionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#8B4513" }}>
                Platform:
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #E8D4C0",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  outline: "none",
                  color: "#333"
                }}
              >
                <option value="">All Platforms</option>
                {platforms.map(platform => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#8B4513" }}>
                Status:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #E8D4C0",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  outline: "none",
                  color: "#333"
                }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "end" }}>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("");
                  setSelectedPlatform("");
                  setSelectedStatus("");
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "#666",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "bold"
                }}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div style={{
            marginTop: "20px",
            textAlign: "center",
            color: "#666",
            fontSize: "1rem"
          }}>
            Showing {filteredPromotions.length} of {promotions.length} promotions
          </div>
        </div>

        {/* ✅ Add/Edit Form (Admin Only) */}
        {userRole === "admin" && showAddForm && (
          <div style={{ marginBottom: "40px" }}>
            <PromotionForm 
              onAdded={handleFormComplete}
              editingPromotion={editingPromotion}
              onCancelEdit={handleCancelEdit}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            background: "#dc3545",
            color: "white",
            padding: "20px",
            borderRadius: "15px",
            marginBottom: "30px",
            textAlign: "center",
            boxShadow: "0 10px 25px rgba(220, 53, 69, 0.3)"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>⚠️</div>
            <p style={{ margin: "0", fontSize: "1.1rem" }}>{error}</p>
            <button 
              onClick={fetchPromotions}
              style={{
                marginTop: "15px",
                padding: "10px 20px",
                background: "white",
                color: "#dc3545",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Promotions List */}
        <PromotionList 
          promotions={filteredPromotions} 
          onDelete={handleDelete}
          onEdit={handleEdit}
          userRole={userRole}
        />
      </div>
    </div>
  );
};

export default PromotionsPage;