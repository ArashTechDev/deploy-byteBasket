import axios from 'axios';

const baseURL = '/api/foodbanks';

export const getFoodBanks = async () => {
  const res = await axios.get(baseURL);
  return res.data;
};

export const getFoodBankById = async (id) => {
  const res = await axios.get(`${baseURL}/${id}`);
  return res.data;
};

export const createFoodBank = async (data) => {
  try {
    const res = await axios.post(baseURL, data);
    return res.data;
  } catch (err) {
    console.error('Failed to create food bank:', err.response?.data || err.message);
    throw err;
  }
};

export const updateFoodBank = async (id, data) => {
  try {
    const { _id, __v, ...cleanData } = data;

    const res = await axios.put(`/api/foodbanks/${id}`, cleanData);
    return res.data;
  } catch (error) {
    console.error('Failed to update food bank:', error.response?.data || error.message);
    throw error;
  }
};


export const deleteFoodBank = async (id) => {
  try {
    const res = await axios.delete(`${baseURL}/${id}`);
    return res.data;
  } catch (err) {
    console.error('Failed to delete food bank:', err.response?.data || err.message);
    throw err;
  }
};
