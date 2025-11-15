import axios from 'axios';
import { getAccessToken } from '../utils/auth';

const API_URL = 'http://localhost:3001/api/clientes';

const getClients = async (page: number = 1, pageSize: number = 10, sort: string = 'name:asc') => {
  const token = getAccessToken();
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
    params: { page, pageSize, sort },
  });
  return response.data;
};

const getClientById = async (id: number) => {
  const token = getAccessToken();
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const createClient = async (clientData: any) => {
  const token = getAccessToken();
  const response = await axios.post(API_URL, clientData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateClient = async (id: number, clientData: any) => {
  const token = getAccessToken();
  const response = await axios.put(`${API_URL}/${id}`, clientData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deleteClient = async (id: number) => { // Soft delete
  const token = getAccessToken();
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const clientService = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};

export default clientService;
