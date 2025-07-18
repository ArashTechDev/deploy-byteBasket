import axios from 'axios';

const API = 'http://localhost:3001/api/auth';  

export const registerUser = async (userData) => {
  const res = await axios.post(`${API}/register`, userData);
  return res.data;
};

export const loginUser = async (credentials) => {
  const res = await axios.post(`${API}/login`, credentials);
  return res.data;  
};

export const logoutUser = async () => {
  const res = await axios.post(`${API}/logout`);
  return res.data;
};

export const verifyEmail = async (token) => {
  const res = await axios.get(`${API}/verify-email?token=${token}`);
  return res.data;
};

export const resendVerificationEmail = async (email) => {
  const res = await axios.post(`${API}/resend-verification`, { email });
  return res.data;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found in localStorage');

  const res = await axios.get(`${API}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;  
};

export const getDashboard = async () => {
  const res = await axios.get(`${API}/dashboard`);
  return res.data;
};
