import React, { useState } from "react";
import { createRating } from "../../api/ratingApi"; // correct relative path

const RatingForm = ({ onAdded }) => {
  const [form, setForm] = useState({
    productId: "",
    customerName: "",
    ratingValue: 1,
    comment: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.name === "ratingValue" ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createRating(form);
      onAdded(); // refresh list
      setForm({ productId: "", customerName: "", ratingValue: 1, comment: "" });
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      maxWidth: "400px", 
      margin: "0 auto",
      padding: "30px",
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(139, 69, 19, 0.1)",
      border: "1px solid #E8D4C0"
    }}>
      <h3 style={{ color: "#d5e521ea", marginBottom: "20px", textAlign: "center" }}>Submit Rating</h3>
      
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="productId" style={{ 
          display: "block", 
          marginBottom: "8px", 
          fontWeight: "600", 
          color: "#666" 
        }}>
          Product ID:
        </label>
        <input
          id="productId"
          name="productId"
          value={form.productId}
          onChange={handleChange}
          placeholder="Product ID"
          required
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "2px solid #E8D4C0",
            borderRadius: "8px",
            fontSize: "14px",
            outline: "none",
            transition: "border-color 0.3s"
          }}
          onFocus={(e) => e.target.style.borderColor = "#B8764F"}
          onBlur={(e) => e.target.style.borderColor = "#E8D4C0"}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="customerName" style={{ 
          display: "block", 
          marginBottom: "8px", 
          fontWeight: "600", 
          color: "#666" 
        }}>
          Your Name:
        </label>
        <input
          id="customerName"
          name="customerName"
          value={form.customerName}
          onChange={handleChange}
          placeholder="Your Name"
          required
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "2px solid #E8D4C0",
            borderRadius: "8px",
            fontSize: "14px",
            outline: "none",
            transition: "border-color 0.3s"
          }}
          onFocus={(e) => e.target.style.borderColor = "#B8764F"}
          onBlur={(e) => e.target.style.borderColor = "#E8D4C0"}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="ratingValue" style={{ 
          display: "block", 
          marginBottom: "8px", 
          fontWeight: "600", 
          color: "#666" 
        }}>
          Rating:
        </label>
        <select
          id="ratingValue"
          name="ratingValue"
          value={form.ratingValue}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "2px solid #E8D4C0",
            borderRadius: "8px",
            fontSize: "14px",
            outline: "none",
            cursor: "pointer",
            backgroundColor: "white",
            transition: "border-color 0.3s"
          }}
          onFocus={(e) => e.target.style.borderColor = "#B8764F"}
          onBlur={(e) => e.target.style.borderColor = "#E8D4C0"}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "25px" }}>
        <label htmlFor="comment" style={{ 
          display: "block", 
          marginBottom: "8px", 
          fontWeight: "600", 
          color: "#666" 
        }}>
          Comment:
        </label>
        <textarea
          id="comment"
          name="comment"
          value={form.comment}
          onChange={handleChange}
          placeholder="Comment"
          rows="4"
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "2px solid #E8D4C0",
            borderRadius: "8px",
            fontSize: "14px",
            outline: "none",
            resize: "vertical",
            transition: "border-color 0.3s"
          }}
          onFocus={(e) => e.target.style.borderColor = "#B8764F"}
          onBlur={(e) => e.target.style.borderColor = "#E8D4C0"}
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: loading ? "#999" : "#B8764F",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background-color 0.3s"
        }}
        onMouseOver={(e) => !loading && (e.target.style.backgroundColor = "#8B4513")}
        onMouseOut={(e) => !loading && (e.target.style.backgroundColor = "#B8764F")}
      >
        {loading ? "Submitting..." : "Submit Rating"}
      </button>
    </form>
  );
};

export default RatingForm;