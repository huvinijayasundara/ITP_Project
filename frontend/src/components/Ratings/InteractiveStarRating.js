import React, { useState } from "react";

const InteractiveStarRating = ({ 
  rating = 0, 
  onRatingChange, 
  size = 30, 
  disabled = false,
  showLabel = true 
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (starValue) => {
    if (!disabled && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleStarHover = (starValue) => {
    if (!disabled) {
      setHoverRating(starValue);
    }
  };

  const handleStarLeave = () => {
    if (!disabled) {
      setHoverRating(0);
    }
  };

  const getStarColor = (starIndex) => {
    const currentRating = hoverRating || rating;
    
    if (starIndex <= currentRating) {
      // Filled star - brown gradient based on rating level
      if (currentRating >= 4) return "#d5e521ea"; // Tan for high ratings
      if (currentRating >= 3) return "#e8b724c1"; // Brown for medium ratings
      return "#A0522D"; // Sienna for low ratings
    }
    
    return "#E5E5E5"; // Gray for empty stars
  };

  const getStarStyle = (starIndex) => ({
    fontSize: `${size}px`,
    color: getStarColor(starIndex),
    cursor: disabled ? "default" : "pointer",
    transition: "color 0.2s ease, transform 0.1s ease",
    userSelect: "none",
    display: "inline-block",
    transform: hoverRating === starIndex && !disabled ? "scale(1.1)" : "scale(1)",
    textShadow: starIndex <= (hoverRating || rating) ? "0 0 8px rgba(184, 118, 79, 0.3)" : "none"
  });

  const getRatingLabel = () => {
    const currentRating = hoverRating || rating;
    const labels = {
      1: "Poor",
      2: "Fair", 
      3: "Good",
      4: "Very Good",
      5: "Excellent"
    };
    return labels[currentRating] || "No Rating";
  };

  const getRatingColor = () => {
    const currentRating = hoverRating || rating;
    if (currentRating >= 4) return "#28A745"; // Green
    if (currentRating >= 3) return "#B8764F"; // Tan
    if (currentRating >= 2) return "#8B4513"; // Brown
    if (currentRating >= 1) return "#A0522D"; // Sienna
    return "#6C757D"; // Gray
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center",
      gap: "10px"
    }}>
      {/* Stars */}
      <div style={{ 
        display: "flex", 
        gap: "2px",
        padding: "8px",
        borderRadius: "12px",
        background: disabled ? "transparent" : "#FFF9F0",
        boxShadow: disabled ? "none" : "0 2px 8px rgba(139, 69, 19, 0.1)"
      }}>
        {[1, 2, 3, 4, 5].map((starIndex) => (
          <span
            key={starIndex}
            style={getStarStyle(starIndex)}
            onClick={() => handleStarClick(starIndex)}
            onMouseEnter={() => handleStarHover(starIndex)}
            onMouseLeave={handleStarLeave}
          >
            ★
          </span>
        ))}
      </div>

      {/* Rating Label */}
      {showLabel && (
        <div style={{
          fontSize: "14px",
          fontWeight: "bold",
          color: getRatingColor(),
          textAlign: "center",
          minHeight: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          {(hoverRating || rating) > 0 && (
            <>
              <span>{getRatingLabel()}</span>
              <span style={{ 
                fontSize: "12px", 
                opacity: "0.9",
                background: getRatingColor(),
                color: "white",
                padding: "2px 8px",
                borderRadius: "12px"
              }}>
                {hoverRating || rating}/5
              </span>
            </>
          )}
          {!hoverRating && !rating && (
            <span style={{ color: "#999", fontStyle: "italic" }}>
              Click to rate
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractiveStarRating;