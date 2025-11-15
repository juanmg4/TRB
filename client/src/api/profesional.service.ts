import axios from 'axios';
import { getAccessToken } from '../utils/auth';

const API_URL = 'http://localhost:3001/api/profesionales';

const getProfesionales = async (page: number = 1, pageSize: number = 10, sort: string = 'firstName:asc') => {
  const token = getAccessToken();
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
    params: { page, pageSize, sort },
  });
  return response.data;
};

const getProfesionalById = async (id: number) => {
  const token = getAccessToken();
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateProfesional = async (id: number, profesionalData: any) => {
  const token = getAccessToken();
  const response = await axios.put(`${API_URL}/${id}`, profesionalData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const profesionalService = {
  getProfesionales,
  getProfesionalById,
  updateProfesional,
};

export default profesionalService;
