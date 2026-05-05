import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

// Create axios instance with authentication
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

// ✅ Add JWT token to every request automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.error("🔒 Unauthorized - Please login again");
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      // Redirect to login
      window.location.href = '/login';
    }
    
    // Handle forbidden errors
    if (error.response?.status === 403) {
      console.error("⛔ Forbidden - You don't have permission");
    }
    
    if (error.response) {
      const errorMsg = error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`;
      throw new Error(errorMsg);
    } else if (error.request) {
      throw new Error("Network error - please check if the server is running on port 5000");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
);

// Create feedback (Authenticated users only)
export const createFeedback = async (data) => {
  try {
    console.log("📤 Creating feedback:", data);
    const response = await apiClient.post("/feedbacks", data);
    console.log("✅ Feedback created successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Failed to create feedback:", error.message);
    throw error;
  }
};

// Get all feedbacks (Public)
export const getFeedbacks = async (params = {}) => {
  try {
    console.log("📥 Fetching feedbacks with params:", params);
    const response = await apiClient.get("/feedbacks", { params });
    console.log("✅ Feedbacks fetched successfully:", response.data.data?.length || 0, "items");
    return response;
  } catch (error) {
    console.error("❌ Failed to fetch feedbacks:", error.message);
    throw error;
  }
};

// Update feedback (Authenticated users - own feedback only)
export const updateFeedback = async (id, data) => {
  try {
    console.log("📝 Updating feedback:", id, data);
    const response = await apiClient.put(`/feedbacks/${id}`, data);
    console.log("✅ Feedback updated successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Failed to update feedback:", error.message);
    throw error;
  }
};

// Delete feedback (Authenticated users - own feedback OR admin)
export const deleteFeedback = async (id) => {
  try {
    console.log("🗑️ Deleting feedback:", id);
    const response = await apiClient.delete(`/feedbacks/${id}`);
    console.log("✅ Feedback deleted successfully");
    return response;
  } catch (error) {
    console.error("❌ Failed to delete feedback:", error.message);
    throw error;
  }
};

// Get analytics data (Public)
export const getFeedbackAnalytics = async () => {
  try {
    console.log("📊 Fetching feedback analytics...");
    const response = await apiClient.get("/feedbacks/analytics");
    console.log("✅ Analytics fetched successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch analytics:", error.message);
    throw error;
  }
};

// Download PDF Report (Admin only)
export const downloadFeedbackPDF = async () => {
  try {
    console.log("📄 Generating PDF report...");
    const response = await apiClient.get("/feedbacks/report/pdf", {
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `handcraft-feedback-report-${new Date().toISOString().split('T')[0]}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
    
    console.log("✅ PDF downloaded successfully");
    return response;
  } catch (error) {
    console.error("❌ Failed to generate PDF report:", error.message);
    throw error;
  }
};

// Get report data (Admin only)
export const getFeedbackReportData = async () => {
  try {
    console.log("📊 Fetching report preview data...");
    const response = await apiClient.get("/feedbacks/report/pdf");
    console.log("✅ Report preview data fetched successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch report preview data:", error.message);
    throw error;
  }
};

// Add helpful vote (Authenticated users)
export const addHelpfulVote = async (feedbackId) => {
  try {
    console.log("👍 Adding helpful vote to feedback:", feedbackId);
    const response = await apiClient.post(`/feedbacks/${feedbackId}/helpful`);
    console.log("✅ Helpful vote added successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to add helpful vote:", error.message);
    throw error;
  }
};

// Remove helpful vote (Authenticated users)
export const removeHelpfulVote = async (feedbackId) => {
  try {
    console.log("👎 Removing helpful vote from feedback:", feedbackId);
    const response = await apiClient.delete(`/feedbacks/${feedbackId}/helpful`);
    console.log("✅ Helpful vote removed successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to remove helpful vote:", error.message);
    throw error;
  }
};

// Report feedback (Authenticated users)
export const reportFeedback = async (feedbackId, reason) => {
  try {
    console.log("🚨 Reporting feedback:", feedbackId, "for:", reason);
    const response = await apiClient.post(`/feedbacks/${feedbackId}/report`, { reason });
    console.log("✅ Feedback reported successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to report feedback:", error.message);
    throw error;
  }
};