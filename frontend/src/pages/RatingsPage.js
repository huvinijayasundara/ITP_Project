import React from "react";
import ProductViewer from "../components/ProductViewer";

const RatingsPage = ({ userRole = "customer" }) => {
  return (
    <div style={{
      backgroundColor: '#F5F5F5',
      minHeight: "100vh",
      padding: "40px 20px"
    }}>
      {/* Header Section */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "40px",
        marginBottom: "30px",
        boxShadow: "0 4px 12px rgba(139, 69, 19, 0.1)",
        border: "2px solid #E8D4C0",
        textAlign: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "15px", marginBottom: "10px" }}>
          <span style={{ fontSize: "48px" }}>⭐</span>
          <h1 style={{ 
            fontSize: "36px", 
            fontWeight: "bold", 
            color: "#8B4513",
            margin: 0 
          }}>
            Product Ratings
          </h1>
        </div>
        <p style={{ color: "#666", fontSize: "16px", margin: 0 }}>
          View and manage product ratings and reviews
        </p>
      </div>

      {/* Product Viewer Component */}
      <ProductViewer userRole={userRole} />
    </div>
  );
};

export default RatingsPage;