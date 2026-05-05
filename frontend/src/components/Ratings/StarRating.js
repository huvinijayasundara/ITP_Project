import React from "react";

const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span 
        key={i} 
        style={{ 
          color: i <= rating ? "#B8764F" : "#E5E5E5",
          fontSize: "20px",
          textShadow: i <= rating ? "0 0 4px rgba(184, 118, 79, 0.3)" : "none"
        }}
      >
        ★
      </span>
    );
  }
  return <div style={{ display: "flex", gap: "2px" }}>{stars}</div>;
};

export default StarRating;