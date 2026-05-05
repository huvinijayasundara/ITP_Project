import React from "react";

const PromotionList = ({ promotions, onDelete, onEdit, userRole }) => {
  const getStatusInfo = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < now) {
      return { 
        status: "Expired", 
        color: "#999", 
        bgColor: "#f5f5f5",
        borderColor: "#999"
      };
    } else if (start <= now && now <= end) {
      return { 
        status: "Active", 
        color: "#8B4513", 
        bgColor: "#E8D4C0",
        borderColor: "#8B4513"
      };
    } else if (start > now) {
      return { 
        status: "Upcoming", 
        color: "#B8764F", 
        bgColor: "#F5DEB3",
        borderColor: "#B8764F"
      };
    }
    return { 
      status: "Unknown", 
      color: "#666", 
      bgColor: "#f8f9fa",
      borderColor: "#666"
    };
  };

  const getTypeIcon = (type) => {
    const icons = {
      "social_media": "📱",
      "email": "📧",
      "sms": "💬",
      "messaging": "💬",
      "welcome": "🎉",
      "loyalty": "⭐"
    };
    return icons[type] || "📢";
  };

  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", 
      gap: "25px",
      padding: "20px"
    }}>
      {promotions.map(p => {
        const statusInfo = getStatusInfo(p.startDate, p.endDate);
        const typeIcon = getTypeIcon(p.type);
        
        return (
          <div
            key={p._id}
            style={{
              border: `3px solid ${statusInfo.borderColor}`,
              borderRadius: "16px",
              overflow: "hidden",
              backgroundColor: "white",
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
            }}
          >
            {/* Header with Status */}
            <div style={{
              background: statusInfo.color,
              color: "white",
              padding: "20px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>
                {typeIcon}
              </div>
              <div style={{
                background: "rgba(255,255,255,0.25)",
                display: "inline-block",
                padding: "6px 18px",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "bold",
                marginBottom: "10px"
              }}>
                {statusInfo.status.toUpperCase()}
              </div>
              <h3 style={{ 
                margin: "0", 
                fontSize: "1.5rem",
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)"
              }}>
                {p.title}
              </h3>
            </div>

            {/* Content */}
            <div style={{ padding: "25px" }}>
              {/* Platform Badge */}
              {p.platform && (
                <div style={{ marginBottom: "15px" }}>
                  <span style={{
                    background: "#E8D4C0",
                    color: "#8B4513",
                    padding: "6px 14px",
                    borderRadius: "12px",
                    fontSize: "0.85rem",
                    fontWeight: "bold"
                  }}>
                    📱 {p.platform}
                  </span>
                </div>
              )}

              {/* Description */}
              <p style={{
                color: "#666",
                lineHeight: "1.6",
                marginBottom: "20px",
                fontSize: "0.95rem"
              }}>
                {p.description}
              </p>

              {/* Discount Info */}
              <div style={{
                background: "linear-gradient(135deg, #F5DEB3, #E8D4C0)",
                padding: "15px",
                borderRadius: "12px",
                textAlign: "center",
                marginBottom: "20px"
              }}>
                <div style={{ 
                  fontSize: "1.5rem", 
                  fontWeight: "bold", 
                  color: "#8B4513",
                  marginBottom: "5px"
                }}>
                  {p.discountType === "percentage" 
                    ? `${p.discountValue}% OFF` 
                    : `Rs. ${p.discountValue} OFF`
                  }
                </div>
                {p.promotionCode && (
                  <div style={{
                    fontSize: "0.9rem",
                    color: "#666",
                    fontWeight: "bold"
                  }}>
                    Code: {p.promotionCode}
                  </div>
                )}
              </div>

              {/* Date Range */}
              <div style={{
                background: "#F5F5F5",
                padding: "12px",
                borderRadius: "10px",
                textAlign: "center",
                marginBottom: userRole === "admin" ? "20px" : "0"
              }}>
                <div style={{ 
                  fontSize: "0.85rem", 
                  color: "#8B4513",
                  fontWeight: "bold",
                  marginBottom: "5px"
                }}>
                  📅 Promotion Period
                </div>
                <div style={{ 
                  fontSize: "0.9rem", 
                  color: "#333",
                  fontWeight: "600"
                }}>
                  {new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}
                </div>
              </div>

              {/* ✅ ADMIN-ONLY Action Buttons */}
              {userRole === "admin" && (
                <div style={{ 
                  marginTop: 'auto',
                  display: "flex", 
                  gap: "10px"
                }}>
                  <button
                    onClick={() => onEdit(p)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "#8B4513",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      fontWeight: "bold",
                      transition: "background 0.3s, transform 0.2s",
                      boxShadow: "0 4px 10px rgba(139, 69, 19, 0.3)"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.02)";
                      e.target.style.boxShadow = "0 6px 15px rgba(139, 69, 19, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                      e.target.style.boxShadow = "0 4px 10px rgba(139, 69, 19, 0.3)";
                    }}
                  >
                    ✏️ Edit
                  </button>
                  
                  <button
                    onClick={() => onDelete(p._id, p.title)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "linear-gradient(135deg, #dc3545, #c82333)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      fontWeight: "bold",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 10px rgba(220, 53, 69, 0.3)"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 15px rgba(220, 53, 69, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 10px rgba(220, 53, 69, 0.3)";
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Empty State */}
      {promotions.length === 0 && (
        <div style={{
          gridColumn: "1 / -1",
          textAlign: "center",
          padding: "60px 20px",
          background: "white",
          borderRadius: "15px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📢</div>
          <h3 style={{ color: "#8B4513", marginBottom: "10px" }}>No Promotions Yet</h3>
          <p style={{ color: "#666" }}>
            {userRole === "admin" 
              ? "Create your first promotion to get started!" 
              : "Check back soon for exciting promotions!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default PromotionList;