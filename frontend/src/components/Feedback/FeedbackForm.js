import React, { useState } from "react";
import { createFeedback } from "../../api/feedbackApi";
import InteractiveStarRating from "../Ratings/InteractiveStarRating";

const FeedbackForm = ({ onAdded, productId }) => {
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phoneNumber: "",
    category: "product",
    rating: 5, // Default to 5 stars
    message: "",
    productId: productId || ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Category options
  const categories = [
    { value: "product", label: "Product Quality" },
    { value: "service", label: "Customer Service" },
    { value: "delivery", label: "Delivery Experience" },
    { value: "website", label: "Website Experience" },
    { value: "general", label: "General Feedback" }
  ];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = type === "number" ? Number(value) : value;
    
    // Special handling for phone number - only allow digits
    if (name === "phoneNumber") {
      processedValue = value.replace(/\D/g, '');
      if (processedValue.length > 10) {
        processedValue = processedValue.slice(0, 10);
      }
    }
    
    setForm(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  // Handle star rating change
  const handleRatingChange = (newRating) => {
    setForm(prev => ({
      ...prev,
      rating: newRating
    }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateForm = () => {
    const errors = [];

    if (!form.customerName.trim()) {
      errors.push("Customer name is required");
    }

    if (!form.email.trim()) {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        errors.push("Please enter a valid email address");
      }
    }

    if (!form.message.trim()) {
      errors.push("Message is required");
    }

    if (form.rating < 1 || form.rating > 5) {
      errors.push("Please select a rating from 1 to 5 stars");
    }

    // Phone number validation (optional but must be 10 digits if provided)
    if (form.phoneNumber.trim() && !/^\d{10}$/.test(form.phoneNumber.trim())) {
      errors.push("Phone number must be exactly 10 digits");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Submitting feedback:", form);
      const response = await createFeedback(form);
      
      if (response.data && response.data.success) {
        setSuccess("✅ Feedback submitted successfully! Thank you for your input.");
        
        // Reset form on success
        setForm({
          customerName: "",
          email: "",
          phoneNumber: "",
          category: "product",
          rating: 5,
          message: "",
          productId: productId || ""
        });

        // Refresh the list
        if (onAdded) {
          onAdded();
        }

        console.log("✅ Feedback submitted successfully!");
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess("");
        }, 5000);
      }
    } catch (error) {
      console.error("❌ Error submitting feedback:", error);
      setError("Failed to submit feedback: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get rating description
  const getRatingDescription = () => {
    const descriptions = {
      1: "Poor - Not satisfied",
      2: "Fair - Below expectations",
      3: "Good - Meets expectations",
      4: "Very Good - Exceeds expectations",
      5: "Excellent - Outstanding!"
    };
    return descriptions[form.rating] || "Select your rating";
  };

  return (
    <div style={{ 
      background: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ 
        textAlign: "center", 
        marginTop: 0,
        marginBottom: "25px", 
        color: "#333",
        fontSize: "24px"
      }}>
        ✍️ Share Your Experience
      </h3>
      
      {/* Success Message */}
      {success && (
        <div style={{ 
          color: "#155724",
          backgroundColor: "#d4edda", 
          padding: "15px", 
          borderRadius: "10px", 
          marginBottom: "20px",
          border: "1px solid #c3e6cb",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <span style={{ fontSize: "20px" }}>✅</span>
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{ 
          color: "#721c24",
          backgroundColor: "#f8d7da", 
          padding: "15px", 
          borderRadius: "10px", 
          marginBottom: "20px",
          border: "1px solid #f5c6cb",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <span style={{ fontSize: "20px" }}>❌</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Rating Selection - INTERACTIVE STARS */}
        <div style={{ 
          marginBottom: "25px",
          padding: "20px",
          background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
          borderRadius: "12px",
          textAlign: "center"
        }}>
          <label style={{ 
            display: "block", 
            marginBottom: "15px", 
            fontWeight: "bold",
            fontSize: "16px",
            color: "#333"
          }}>
            How would you rate this product? <span style={{ color: "red" }}>*</span>
          </label>
          
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            gap: "15px"
          }}>
            <InteractiveStarRating 
              rating={form.rating} 
              size={40}
              interactive={true}
              disabled={loading}
              showLabel={false}
              onChange={handleRatingChange}
            />
            
            <div style={{
              padding: "10px 20px",
              background: "white",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "bold",
              color: form.rating >= 4 ? "#28a745" : form.rating >= 3 ? "#ffc107" : "#dc3545",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}>
              {form.rating} ★ - {getRatingDescription()}
            </div>
          </div>
          
          <p style={{ 
            margin: "10px 0 0 0", 
            fontSize: "12px", 
            color: "#666",
            fontStyle: "italic"
          }}>
            Click on the stars to select your rating (1-5 stars)
          </p>
        </div>

        {/* Customer Name */}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="customerName" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Full Name: <span style={{ color: "red" }}>*</span>
          </label>
          <input
            id="customerName"
            name="customerName"
            type="text"
            placeholder="Enter your full name"
            value={form.customerName}
            onChange={handleChange}
            required
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "14px",
              boxSizing: "border-box",
              transition: "border 0.3s"
            }}
            onFocus={(e) => e.target.style.border = "2px solid #667eea"}
            onBlur={(e) => e.target.style.border = "2px solid #e0e0e0"}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Email Address: <span style={{ color: "red" }}>*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "14px",
              boxSizing: "border-box",
              transition: "border 0.3s"
            }}
            onFocus={(e) => e.target.style.border = "2px solid #667eea"}
            onBlur={(e) => e.target.style.border = "2px solid #e0e0e0"}
          />
        </div>

        {/* Phone Number */}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="phoneNumber" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Phone Number: <span style={{ fontSize: "12px", color: "#666", fontWeight: "normal" }}>(Optional - 10 digits)</span>
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            placeholder="Enter 10-digit phone number"
            value={form.phoneNumber}
            onChange={handleChange}
            disabled={loading}
            maxLength="10"
            pattern="[0-9]{10}"
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "14px",
              boxSizing: "border-box",
              transition: "border 0.3s"
            }}
            onFocus={(e) => e.target.style.border = "2px solid #667eea"}
            onBlur={(e) => e.target.style.border = "2px solid #e0e0e0"}
          />
          {form.phoneNumber && !/^\d{0,10}$/.test(form.phoneNumber) && (
            <small style={{ color: "#dc3545", fontSize: "12px" }}>
              Only numbers allowed (10 digits maximum)
            </small>
          )}
        </div>

        {/* Category Dropdown */}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="category" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Feedback Category:
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "14px",
              backgroundColor: "white",
              boxSizing: "border-box",
              cursor: "pointer"
            }}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div style={{ marginBottom: "25px" }}>
          <label htmlFor="message" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Your Review: <span style={{ color: "red" }}>*</span>
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="Tell us about your experience with this handcraft product..."
            value={form.message}
            onChange={handleChange}
            required
            disabled={loading}
            rows={5}
            style={{
              width: "100%",
              padding: "12px",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "14px",
              resize: "vertical",
              minHeight: "100px",
              boxSizing: "border-box",
              transition: "border 0.3s"
            }}
            onFocus={(e) => e.target.style.border = "2px solid #667eea"}
            onBlur={(e) => e.target.style.border = "2px solid #e0e0e0"}
          />
          <small style={{ color: "#666", fontSize: "12px" }}>
            Characters: {form.message.length}/1000
          </small>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px",
            backgroundColor: loading ? "#cccccc" : "transparent",
            background: loading ? "#cccccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.3s",
            boxSizing: "border-box",
            boxShadow: loading ? "none" : "0 4px 12px rgba(102, 126, 234, 0.3)"
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
            }
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <span>⏳</span>
              <span>Submitting...</span>
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <span>💬</span>
              <span>Submit Review & Rating</span>
            </span>
          )}
        </button>
      </form>

      <div style={{ 
        marginTop: "20px", 
        padding: "15px", 
        backgroundColor: "#e7f3ff", 
        borderRadius: "10px", 
        fontSize: "12px", 
        color: "#004085",
        border: "1px solid #bee5eb"
      }}>
        <strong>🔒 Privacy Notice:</strong> Your feedback helps us improve our handcraft products and services. 
        We respect your privacy and will only use your contact information to follow up on your feedback if necessary.
      </div>
    </div>
  );
};

export default FeedbackForm;