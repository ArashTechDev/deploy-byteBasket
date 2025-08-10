import axios from 'axios';

const baseURL = 'http://localhost:3001/api/storage';

// Create storage location
export const createStorageLocation = async (data) => {
  try {
    const res = await axios.post(baseURL, data);
    return res.data;
  } catch (err) {
    console.error('Failed to create storage location:', err.response?.data || err.message);
    throw err;
  }
};

// Update storage location (strip _id)
export const updateStorageLocation = async (id, data) => {
  try {
    const { _id, ...cleanData } = data; 
    const res = await axios.put(`${baseURL}/${id}`, cleanData);
    return res.data;
  } catch (err) {
    console.error('Failed to update storage location:', err.response?.data || err.message);
    throw err;
  }
};

// Delete storage location
export const deleteStorageLocation = async (id) => {
  try {
    const res = await axios.delete(`${baseURL}/${id}`);
    return res.data;
  } catch (error) {
    console.error('Failed to delete storage location:', error.response?.data || error.message);
    throw error;
  }
};

// Get storage locations by food bank ID
export const getStorageLocationsByFoodBankId = async (foodBankId) => {
  try {
    const res = await axios.get(`${baseURL}?foodBankId=${foodBankId}`);
    return res.data;
  } catch (err) {
    console.error('Failed to fetch storage locations:', err.response?.data || err.message);
    throw err;
  }
};
