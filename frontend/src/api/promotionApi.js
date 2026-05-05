import axios from "axios";

const BASE_URL = "http://localhost:5000/api/promotions";

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createPromotion = async (data) => {
  return await axios.post(BASE_URL, data, {
    headers: getAuthHeader()
  });
};

export const getPromotions = async () => {
  return await axios.get(BASE_URL, {
    headers: getAuthHeader()
  });
};

export const updatePromotion = async (id, data) => {
  return await axios.put(`${BASE_URL}/${id}`, data, {
    headers: getAuthHeader()
  });
};

export const deletePromotion = async (id) => {
  return await axios.delete(`${BASE_URL}/${id}`, {
    headers: getAuthHeader()
  });
};