import api from './api';

export const getTransactions = async (tipo = null) => {
  try {
    const url = tipo ? `/transacciones?tipo=${tipo}` : '/transacciones';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addTransaction = async (data) => {
  try {
    const response = await api.post('/transacciones', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCuentas = async () => {
  try {
    const response = await api.get('/cuentas');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addCuenta = async (data) => {
  try {
    const response = await api.post('/cuentas', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCuenta = async (id, data) => {
  try {
    const response = await api.put(`/cuentas/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteCuenta = async (id) => {
  try {
    const response = await api.delete(`/cuentas/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
