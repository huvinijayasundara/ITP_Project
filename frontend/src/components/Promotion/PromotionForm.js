import React, { useState, useEffect } from "react";
import { createPromotion, updatePromotion } from "../../api/promotionApi";

const PromotionForm = ({ onAdded, editingPromotion = null, onCancelEdit = null }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    platform: "",
    type: "",
    discountType: "percentage",
    discountValue: "",
    promotionCode: "",
    startDate: "",
    endDate: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ EDIT MODE: Pre-fill form when editing
  useEffect(() => {
    if (editingPromotion) {
      console.log("📝 Editing promotion:", editingPromotion);
      
      // Format dates for input fields (YYYY-MM-DD)
      const startDate = editingPromotion.startDate ? 
        new Date(editingPromotion.startDate).toISOString().split('T')[0] : '';
      const endDate = editingPromotion.endDate ? 
        new Date(editingPromotion.endDate).toISOString().split('T')[0] : '';
      
      setForm({
        title: editingPromotion.title || "",
        description: editingPromotion.description || "",
        platform: editingPromotion.platform || "",
        type: editingPromotion.type || "",
        discountType: editingPromotion.discountType || "percentage",
        discountValue: editingPromotion.discountValue || "",
        promotionCode: editingPromotion.promotionCode || "",
        startDate: startDate,
        endDate: endDate
      });
    } else {
      // Reset form for new promotion
      setForm({
        title: "",
        description: "",
        platform: "",
        type: "",
        discountType: "percentage",
        discountValue: "",
        promotionCode: "",
        startDate: "",
        endDate: ""
      });
    }
  }, [editingPromotion]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      setError("Title is required");
      return false;
    }
    if (!form.description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!form.platform) {
      setError("Platform is required");
      return false;
    }
    if (!form.type) {
      setError("Type is required");
      return false;
    }
    if (!form.discountValue || form.discountValue <= 0) {
      setError("Valid discount value is required");
      return false;
    }
    if (form.discountType === "percentage" && form.discountValue > 100) {
      setError("Percentage discount cannot exceed 100%");
      return false;
    }
    if (!form.startDate) {
      setError("Start date is required");
      return false;
    }
    if (!form.endDate) {
      setError("End date is required");
      return false;
    }

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (end <= start) {
      setError("End date must be after start date");
      return false;
    }

    // Only check past dates for NEW promotions, not edits
    if (!editingPromotion && start < today) {
      setError("Start date cannot be in the past");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const promotionData = {
        ...form,
        discountValue: Number(form.discountValue)
      };

      if (editingPromotion) {
        // ✅ UPDATE existing promotion
        console.log("🔄 Updating promotion:", editingPromotion._id);
        await updatePromotion(editingPromotion._id, promotionData);
        alert("✅ Promotion updated successfully!");
      } else {
        // ✅ CREATE new promotion
        console.log("➕ Creating new promotion");
        await createPromotion(promotionData);
        alert("✅ Promotion created successfully!");
      }

      // Reset form
      setForm({
        title: "",
        description: "",
        platform: "",
        type: "",
        discountType: "percentage",
        discountValue: "",
        promotionCode: "",
        startDate: "",
        endDate: ""
      });

      // Call callback
      if (onAdded) {
        onAdded();
      }

    } catch (err) {
      console.error("Error saving promotion:", err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to save promotion";
      setError(errorMessage);
      alert("❌ " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <div style={{
      background: "white",
      borderRadius: "20px",
      padding: "30px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      border: "3px solid #E8D4C0"
    }}>
      <h3 style={{
        textAlign: "center",
        color: "#8B4513",
        marginBottom: "25px",
        fontSize: "24px"
      }}>
        {editingPromotion ? "✏️ Edit Promotion" : "➕ Create New Promotion"}
      </h3>

      {error && (
        <div style={{
          backgroundColor: "#f8d7da",
          color: "#721c24",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
          border: "1px solid #f5c6cb"
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: "20px" }}>
          {/* Title */}
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#8B4513" }}>
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Summer Sale 2025"
              required
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #E8D4C0",
                borderRadius: "8px",
                fontSize: "15px"
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#8B4513" }}>
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your promotion..."
              required
              disabled={loading}
              rows={3}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #E8D4C0",
                borderRadius: "8px",
                fontSize: "15px",
                resize: "vertical"
              }}
            />
          </div>

          {/* Type and Platform */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#8B4513" }}>
                Type *
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #E8D4C0",
                  borderRadius: "8px",
                  fontSize: "15px",
                  backgroundColor: "white"
                }}
              >
                <option value="">Select Type</option>
                {promotionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#8B4513" }}>
                Platform *
              </label>
              <select
                name="platform"
                value={form.platform}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #E8D4C0",
                  borderRadius: "8px",
                  fontSize: "15px",
                  backgroundColor: "white"
                }}
              >
                <option value="">Select Platform</option>
                {platforms.map(platform => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Discount */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#8B4513" }}>
                Discount Type *
              </label>
              <select
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #E8D4C0",
                  borderRadius: "8px",
                  fontSize: "15px",
                  backgroundColor: "white"
                }}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (Rs.)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#8B4513" }}>
                Discount Value *
              </label>
              <input
                type="number"
                name="discountValue"
                value={form.discountValue}
                onChange={handleChange}
                placeholder={form.discountType === "percentage" ? "e.g., 20" : "e.g., 500"}
                required
                disabled={loading}
                min="0"
                max={form.discountType === "percentage" ? "100" : undefined}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #E8D4C0",
                  borderRadius: "8px",
                  fontSize: "15px"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#8B4513" }}>
                Promo Code
              </label>
              <input
                type="text"
                name="promotionCode"
                value={form.promotionCode}
                onChange={handleChange}
                placeholder="e.g., SUMMER25"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #E8D4C0",
                  borderRadius: "8px",
                  fontSize: "15px",
                  textTransform: "uppercase"
                }}
              />
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#8B4513" }}>
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #E8D4C0",
                  borderRadius: "8px",
                  fontSize: "15px"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#8B4513" }}>
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #E8D4C0",
                  borderRadius: "8px",
                  fontSize: "15px"
                }}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "15px",
                background: loading ? "#cccccc" : "linear-gradient(45deg, #8B4513, #B8764F)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                boxShadow: loading ? "none" : "0 4px 12px rgba(139, 69, 19, 0.3)"
              }}
            >
              {loading ? (
                <span>⏳ {editingPromotion ? "Updating..." : "Creating..."}</span>
              ) : (
                <span>{editingPromotion ? "💾 Update Promotion" : "➕ Create Promotion"}</span>
              )}
            </button>

            {editingPromotion && onCancelEdit && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                style={{
                  padding: "15px 30px",
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                ❌ Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div style={{
        marginTop: "20px",
        padding: "15px",
        backgroundColor: "#e7f3ff",
        borderRadius: "10px",
        fontSize: "13px",
        color: "#004085",
        border: "1px solid #bee5eb"
      }}>
        <strong>💡 Tips:</strong>
        <ul style={{ margin: "5px 0 0 0", paddingLeft: "20px" }}>
          <li>Choose a clear, descriptive title for your promotion</li>
          <li>Use uppercase for promo codes (e.g., SUMMER25)</li>
          <li>Percentage discounts are capped at 100%</li>
          <li>End date must be after start date</li>
        </ul>
      </div>
    </div>
  );
};

export default PromotionForm;