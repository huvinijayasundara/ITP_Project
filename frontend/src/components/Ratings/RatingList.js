import React from "react";
import StarRating from "./StarRating";

const RatingList = ({ ratings }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
      {ratings.map(r => (
        <div 
          key={r._id} 
          style={{ 
            border: "2px solid #E8D4C0", 
            borderRadius: "12px",
            padding: "20px",
            backgroundColor: "white",
            boxShadow: "0 2px 8px rgba(139, 69, 19, 0.08)",
            transition: "all 0.3s"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(139, 69, 19, 0.15)";
            e.currentTarget.style.borderColor = "#B8764F";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(139, 69, 19, 0.08)";
            e.currentTarget.style.borderColor = "#E8D4C0";
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <p style={{ 
              margin: "0 0 8px 0", 
              fontSize: "16px",
              color: "#333"
            }}>
              <strong style={{ color: "#8B4513" }}>{r.customerName}</strong> for <em style={{ color: "#B8764F" }}>{r.productId}</em>
            </p>
            <StarRating rating={r.ratingValue} />
          </div>
          <p style={{ 
            margin: "0", 
            padding: "12px",
            backgroundColor: "#F5DEB3",
            borderRadius: "8px",
            color: "#666",
            fontSize: "14px",
            lineHeight: "1.6",
            border: "1px solid #E8D4C0"
          }}>
            {r.comment}
          </p>
        </div>
      ))}
    </div>
  );
};

export default RatingList;