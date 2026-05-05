import axios from "axios";

const BASE_URL = "http://localhost:5000/api/ratings";

export const createRating = async (data) => {
  return await axios.post(BASE_URL, data);
};

export const getRatings = async (params) => {
  return await axios.get(BASE_URL, { params });
};

export const updateRating = async (id, data) => {
  return await axios.put(`${BASE_URL}/${id}`, data);
};

export const deleteRating = async (id) => {
  return await axios.delete(`${BASE_URL}/${id}`);
};
