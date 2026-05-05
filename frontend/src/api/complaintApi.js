import axios from "axios";


const BASE_URL = "http://localhost:5000/api/complaints";

export const createComplaint = async (data) => {
  return await axios.post(BASE_URL, data);
};

export const getComplaints = async (params) => {
  return await axios.get(BASE_URL, { params });
};

export const updateComplaintStatus = async (id, status) => {
  return await axios.put(`${BASE_URL}/${id}`, { status });
};

export const deleteComplaint = async (id) => {
  return await axios.delete(`${BASE_URL}/${id}`);
};
