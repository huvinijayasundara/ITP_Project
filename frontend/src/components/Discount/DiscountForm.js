import React, { useState, useEffect } from "react";
import "../../App.css";      
import "../../index.css"; 
import { createDiscount, updateDiscount } from "../../api/discountApi";

const DiscountForm = ({ onAdded, editData = null, onCancelEdit = null }) => {
  const [form, setForm] = useState({
    discountCode: "",
    title: "",
    description: "",
    discountValue: "",
    discountType: "percentage",
    validFrom: "",
    validTo: "",
    status: "active",
    usageLimit: "",
    minimumOrderAmount: "",
    applicableCategories: [],
    excludedCategories: []
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categoryOptions = [
    "Home Decor", "Accessories", "Clothing", "Art", 
    "Jewelry", "Pottery", "Textiles", "Wood Craft", "General"
  ];

  // This effect will run when editData changes
  useEffect(() => {
    console.log("DiscountForm useEffect - editData:", editData);
    
    if (editData && editData._id) {
      // We're editing an existing discount
      console.log("Setting up form for editing discount:", editData.discountCode);
      
      setForm({
        discountCode: editData.discountCode || "",
        title: editData.title || "",
        description: editData.description || "",
        discountValue: editData.discountValue ? String(editData.discountValue) : "",
        discountType: editData.discountType || "percentage",
        validFrom: editData.validFrom ? editData.validFrom.split('T')[0] : "",
        validTo: editData.validTo ? editData.validTo.split('T')[0] : "",
        status: editData.status || "active",
        usageLimit: editData.usageLimit ? String(editData.usageLimit) : "",
        minimumOrderAmount: editData.minimumOrderAmount ? String(editData.minimumOrderAmount) : "",
        applicableCategories: editData.applicableCategories || [],
        excludedCategories: editData.excludedCategories || []
      });
      
      console.log("Form populated for editing");
    } else {
      // We're creating a new discount - reset form
      console.log("Resetting form for new discount");
      
      setForm({
        discountCode: "",
        title: "",
        description: "",
        discountValue: "",
        discountType: "percentage",
        validFrom: "",
        validTo: "",
        status: "active",
        usageLimit: "",
        minimumOrderAmount: "",
        applicableCategories: [],
        excludedCategories: []
      });
    }
    
    // Clear errors when switching modes
    setErrors({});
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleCategoryChange = (category, type) => {
    const fieldName = type === 'applicable' ? 'applicableCategories' : 'excludedCategories';
    const currentCategories = form[fieldName];
    
    if (currentCategories.includes(category)) {
      setForm(prev => ({
        ...prev,
        [fieldName]: currentCategories.filter(c => c !== category)
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [fieldName]: [...currentCategories, category]
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.discountCode.trim()) {
      newErrors.discountCode = "Discount code is required";
    }
    
    if (!form.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!form.discountValue || parseFloat(form.discountValue) <= 0) {
      newErrors.discountValue = "Discount value must be greater than 0";
    }
    
    if (form.discountType === "percentage" && parseFloat(form.discountValue) > 100) {
      newErrors.discountValue = "Percentage discount cannot exceed 100%";
    }
    
    if (!form.validFrom) {
      newErrors.validFrom = "Start date is required";
    }
    
    if (!form.validTo) {
      newErrors.validTo = "End date is required";
    }
    
    if (form.validFrom && form.validTo && new Date(form.validFrom) >= new Date(form.validTo)) {
      newErrors.validTo = "End date must be after start date";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("=== FORM SUBMIT START ===");
    console.log("Is Editing:", !!editData);
    console.log("Edit Data ID:", editData?._id);
    console.log("Form Values:", form);
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      console.log("Validation failed:", formErrors);
      setErrors(formErrors);
      alert("Please fix the form errors before submitting");
      return;
    }
    
    setLoading(true);
    
    try {
      const submitData = {
        discountCode: form.discountCode.trim().toUpperCase(),
        title: form.title.trim(),
        description: form.description.trim(),
        discountValue: parseFloat(form.discountValue),
        discountType: form.discountType,
        validFrom: form.validFrom,
        validTo: form.validTo,
        status: form.status,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        minimumOrderAmount: form.minimumOrderAmount ? parseFloat(form.minimumOrderAmount) : 0,
        applicableCategories: form.applicableCategories,
        excludedCategories: form.excludedCategories
      };

      console.log("Submit data prepared:", submitData);

      if (editData && editData._id) {
        // UPDATE MODE
        console.log("=== UPDATE MODE ===");
        console.log("Updating discount ID:", editData._id);
        
        const response = await updateDiscount(editData._id, submitData);
        console.log("Update response:", response);
        
        alert('Discount updated successfully!');
        
        if (onCancelEdit) {
          console.log("Calling onCancelEdit");
          onCancelEdit();
        }
      } else {
        // CREATE MODE
        console.log("=== CREATE MODE ===");
        
        const response = await createDiscount(submitData);
        console.log("Create response:", response);
        
        alert('Discount created successfully!');
        
        // Reset form
        setForm({
          discountCode: "",
          title: "",
          description: "",
          discountValue: "",
          discountType: "percentage",
          validFrom: "",
          validTo: "",
          status: "active",
          usageLimit: "",
          minimumOrderAmount: "",
          applicableCategories: [],
          excludedCategories: []
        });
      }
      
      setErrors({});
      console.log("Calling onAdded callback");
      if (onAdded) onAdded();
      
      console.log("=== FORM SUBMIT SUCCESS ===");
      
    } catch (error) {
      console.error("=== FORM SUBMIT ERROR ===");
      console.error("Error object:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to save discount";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = editData && editData._id;

  return (
    <div style={{ 
      backgroundColor: "white", 
      padding: "30px", 
      borderRadius: "12px", 
      border: "2px solid #E8D4C0",
      boxShadow: "0 4px 8px rgba(139, 69, 19, 0.1)",
      marginBottom: "30px"
    }}>
      <h3 style={{ color: "#8B4513", marginBottom: "25px", fontSize: "24px", fontWeight: "bold", textAlign: "center" }}>
        {isEditing ? "✏️ Edit Discount" : "➕ Create New Discount"}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginBottom: "25px" }}>
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: "#666" }}>
              Discount Code *
            </label>
            <input
              type="text"
              name="discountCode"
              value={form.discountCode}
              onChange={handleChange}
              placeholder="SAVE20"
              className="w-full p-3 border-2 rounded-lg focus:outline-none"
              disabled={loading}
              style={{ borderColor: errors.discountCode ? "#dc3545" : "#E8D4C0" }}
            />
            {errors.discountCode && (
              <p className="text-red-500 text-sm mt-1">{errors.discountCode}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: "#666" }}>
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Holiday Sale"
              className="w-full p-3 border-2 rounded-lg focus:outline-none"
              disabled={loading}
              style={{ borderColor: errors.title ? "#dc3545" : "#E8D4C0" }}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: "#666" }}>
              Discount Type
            </label>
            <select
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              className="w-full p-3 border-2 rounded-lg focus:outline-none"
              disabled={loading}
              style={{ borderColor: "#E8D4C0" }}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed_amount">Fixed Amount ($)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: "#666" }}>
              Discount Value *
            </label>
            <input
              type="number"
              name="discountValue"
              value={form.discountValue}
              onChange={handleChange}
              placeholder="20"
              min="0.01"
              step="0.01"
              className="w-full p-3 border-2 rounded-lg focus:outline-none"
              disabled={loading}
              style={{ borderColor: errors.discountValue ? "#dc3545" : "#E8D4C0" }}
            />
            {errors.discountValue && (
              <p className="text-red-500 text-sm mt-1">{errors.discountValue}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: "#666" }}>
              Valid From *
            </label>
            <input
              type="date"
              name="validFrom"
              value={form.validFrom}
              onChange={handleChange}
              className="w-full p-3 border-2 rounded-lg focus:outline-none"
              disabled={loading}
              style={{ borderColor: errors.validFrom ? "#dc3545" : "#E8D4C0" }}
            />
            {errors.validFrom && (
              <p className="text-red-500 text-sm mt-1">{errors.validFrom}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: "#666" }}>
              Valid To *
            </label>
            <input
              type="date"
              name="validTo"
              value={form.validTo}
              onChange={handleChange}
              className="w-full p-3 border-2 rounded-lg focus:outline-none"
              disabled={loading}
              style={{ borderColor: errors.validTo ? "#dc3545" : "#E8D4C0" }}
            />
            {errors.validTo && (
              <p className="text-red-500 text-sm mt-1">{errors.validTo}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: "#666" }}>
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full p-3 border-2 rounded-lg focus:outline-none"
              disabled={loading}
              style={{ borderColor: "#E8D4C0" }}
            >
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: "#666" }}>
              Usage Limit
            </label>
            <input
              type="number"
              name="usageLimit"
              value={form.usageLimit}
              onChange={handleChange}
              placeholder="Leave empty for unlimited"
              min="1"
              className="w-full p-3 border-2 rounded-lg focus:outline-none"
              disabled={loading}
              style={{ borderColor: "#E8D4C0" }}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: "#666" }}>
              Minimum Order Amount ($)
            </label>
            <input
              type="number"
              name="minimumOrderAmount"
              value={form.minimumOrderAmount}
              onChange={handleChange}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full p-3 border-2 rounded-lg focus:outline-none"
              disabled={loading}
              style={{ borderColor: "#E8D4C0" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label className="block text-sm font-bold mb-2" style={{ color: "#666" }}>
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional description..."
            rows="3"
            className="w-full p-3 border-2 rounded-lg focus:outline-none"
            disabled={loading}
            style={{ borderColor: "#E8D4C0" }}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label className="block text-sm font-bold mb-3" style={{ color: "#666" }}>
            Applicable Categories
          </label>
          <div className="grid grid-cols-3 gap-3">
            {categoryOptions.map(category => (
              <label key={category} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.applicableCategories.includes(category)}
                  onChange={() => handleCategoryChange(category, 'applicable')}
                  disabled={loading}
                  className="w-4 h-4"
                />
                <span className="text-sm">{category}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label className="block text-sm font-bold mb-3" style={{ color: "#666" }}>
            Excluded Categories
          </label>
          <div className="grid grid-cols-3 gap-3">
            {categoryOptions.map(category => (
              <label key={category} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.excludedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category, 'excluded')}
                  disabled={loading}
                  className="w-4 h-4"
                />
                <span className="text-sm">{category}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6" style={{ borderTop: "2px solid #E8D4C0" }}>
          {isEditing && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-8 py-3 rounded-lg font-bold text-lg"
              disabled={loading}
              style={{ 
                backgroundColor: "#6c757d", 
                color: "white", 
                border: "none",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-lg font-bold text-lg disabled:opacity-50"
            style={{ 
              backgroundColor: loading ? "#999" : "#B8764F", 
              color: "white", 
              border: "none",
              cursor: loading ? "not-allowed" : "pointer"
            }}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = "#8B4513")}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = "#B8764F")}
          >
            {loading ? 
              (isEditing ? "Updating..." : "Saving...") : 
              (isEditing ? "Update Discount" : "Save Discount")
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default DiscountForm;