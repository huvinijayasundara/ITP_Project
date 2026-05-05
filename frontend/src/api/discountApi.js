import axios from "axios";

const BASE_URL = "http://localhost:5000/api/discounts";

// Create new discount
export const createDiscount = async (data) => {
  try {
    console.log("API: Creating discount with data:", data);
    
    const backendData = {
      discountCode: data.discountCode,
      title: data.title,
      description: data.description,
      discountValue: parseFloat(data.discountValue),
      discountType: data.discountType,
      validFrom: data.validFrom,
      validTo: data.validTo,
      status: data.status,
      usageLimit: data.usageLimit,
      minimumOrderAmount: data.minimumOrderAmount,
      applicableCategories: data.applicableCategories,
      excludedCategories: data.excludedCategories
    };
    
    const response = await axios.post(BASE_URL, backendData);
    console.log("API: Create response:", response.data);
    return response;
  } catch (error) {
    console.error("API: Create error:", error.response?.data || error.message);
    throw error;
  }
};

// Get all discounts
export const getDiscounts = async () => {
  try {
    console.log("API: Fetching all discounts");
    const response = await axios.get(BASE_URL);
    console.log("API: Get response:", response.data);
    return response;
  } catch (error) {
    console.error("API: Get error:", error.response?.data || error.message);
    throw error;
  }
};

// Update discount
export const updateDiscount = async (id, data) => {
  try {
    console.log("API: Updating discount ID:", id);
    console.log("API: Update data:", data);
    
    const backendData = {
      discountCode: data.discountCode,
      title: data.title,
      description: data.description,
      discountValue: parseFloat(data.discountValue),
      discountType: data.discountType,
      validFrom: data.validFrom,
      validTo: data.validTo,
      status: data.status,
      usageLimit: data.usageLimit,
      minimumOrderAmount: data.minimumOrderAmount,
      applicableCategories: data.applicableCategories,
      excludedCategories: data.excludedCategories
    };
    
    console.log("API: Sending backend data:", backendData);
    const response = await axios.put(`${BASE_URL}/${id}`, backendData);
    console.log("API: Update response:", response.data);
    return response;
  } catch (error) {
    console.error("API: Update error details:", error.response?.data || error.message);
    console.error("API: Update error status:", error.response?.status);
    throw error;
  }
};

// Delete discount
export const deleteDiscount = async (id) => {
  try {
    console.log("API: Deleting discount ID:", id);
    const response = await axios.delete(`${BASE_URL}/${id}`);
    console.log("API: Delete response:", response.data);
    return response;
  } catch (error) {
    console.error("API: Delete error:", error.response?.data || error.message);
    throw error;
  }
};