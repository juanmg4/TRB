import axios from 'axios';
import { getAccessToken } from '../utils/auth';

const API_URL = 'http://localhost:3001/api/horas';

const getHours = async (page: number = 1, pageSize: number = 10, sort: string = 'date:desc', from?: string, to?: string, projectId?: number) => {
  const token = getAccessToken();
  const params: any = { page, pageSize, sort };
  if (from) params.from = from;
  if (to) params.to = to;
  if (projectId) params.proyectoid = projectId;

  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

const getHourById = async (id: number) => {
  const token = getAccessToken();
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const createHour = async (hourData: any) => {
  const token = getAccessToken();
  const response = await axios.post(API_URL, hourData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateHour = async (id: number, hourData: any) => {
  const token = getAccessToken();
  const response = await axios.put(`${API_URL}/${id}`, hourData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deleteHour = async (id: number) => { // Hard delete
  const token = getAccessToken();
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const hourService = {
  getHours,
  getHourById,
  createHour,
  updateHour,
  deleteHour,
};

export default hourService;
