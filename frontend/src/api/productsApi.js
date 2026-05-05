import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

// Create axios instance with better error handling
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data?.error || `Server error: ${error.response.status}`);
    } else if (error.request) {
      // Network error
      throw new Error("Network error - please check if the server is running");
    } else {
      // Something else happened
      throw new Error("An unexpected error occurred");
    }
  }
);

// ========== PRODUCTS API ==========

// Get all products
export const getProducts = async (params = {}) => {
  try {
    console.log("📦 Fetching products with params:", params);
    const response = await apiClient.get("/products", { params });
    console.log("✅ Products fetched successfully:", response.data.length, "items");
    return response;
  } catch (error) {
    console.error("❌ Failed to fetch products:", error.message);
    throw error;
  }
};

// Get single product
export const getProduct = async (id) => {
  try {
    console.log("📦 Fetching product:", id);
    const response = await apiClient.get(`/products/${id}`);
    console.log("✅ Product fetched successfully:", response.data.name);
    return response;
  } catch (error) {
    console.error("❌ Failed to fetch product:", error.message);
    throw error;
  }
};

// Create product (Admin only)
export const createProduct = async (data) => {
  try {
    console.log("📦 Creating product:", data);
    const response = await apiClient.post("/products", data);
    console.log("✅ Product created successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Failed to create product:", error.message);
    throw error;
  }
};

// Update product (Admin only)
export const updateProduct = async (id, data) => {
  try {
    console.log("📦 Updating product:", id, data);
    const response = await apiClient.put(`/products/${id}`, data);
    console.log("✅ Product updated successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Failed to update product:", error.message);
    throw error;
  }
};

// Delete product (Admin only)
export const deleteProduct = async (id) => {
  try {
    console.log("📦 Deleting product:", id);
    const response = await apiClient.delete(`/products/${id}`);
    console.log("✅ Product deleted successfully");
    return response;
  } catch (error) {
    console.error("❌ Failed to delete product:", error.message);
    throw error;
  }
};

// Get product statistics
export const getProductStats = async (id) => {
  try {
    console.log("📊 Fetching product stats:", id);
    const response = await apiClient.get(`/products/${id}/stats`);
    console.log("✅ Product stats fetched successfully");
    return response;
  } catch (error) {
    console.error("❌ Failed to fetch product stats:", error.message);
    throw error;
  }
};

// ========== RATINGS API ==========

// Get all ratings
export const getRatings = async (params = {}) => {
  try {
    console.log("⭐ Fetching ratings with params:", params);
    const response = await apiClient.get("/ratings", { params });
    console.log("✅ Ratings fetched successfully:", response.data.length, "items");
    return response;
  } catch (error) {
    console.error("❌ Failed to fetch ratings:", error.message);
    throw error;
  }
};

// Create rating
export const createRating = async (data) => {
  try {
    console.log("⭐ Creating rating:", data);
    const response = await apiClient.post("/ratings", data);
    console.log("✅ Rating created successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Failed to create rating:", error.message);
    throw error;
  }
};

// Update rating
export const updateRating = async (id, data) => {
  try {
    console.log("⭐ Updating rating:", id, data);
    const response = await apiClient.put(`/ratings/${id}`, data);
    console.log("✅ Rating updated successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Failed to update rating:", error.message);
    throw error;
  }
};

// Delete rating
export const deleteRating = async (id) => {
  try {
    console.log("⭐ Deleting rating:", id);
    const response = await apiClient.delete(`/ratings/${id}`);
    console.log("✅ Rating deleted successfully");
    return response;
  } catch (error) {
    console.error("❌ Failed to delete rating:", error.message);
    throw error;
  }
};