import axios from 'axios';
import { getAccessToken } from '../utils/auth'; // Assuming a utility to get access token

const API_URL = 'http://localhost:3001/api/users';

const getUsers = async (page: number = 1, pageSize: number = 10, sort: string = 'createdAt:desc') => {
  const token = getAccessToken();
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
    params: { page, pageSize, sort },
  });
  return response.data;
};

const getUserById = async (id: number) => {
  const token = getAccessToken();
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const createUser = async (userData: any) => {
  const token = getAccessToken();
  const response = await axios.post(API_URL, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateUser = async (id: number, userData: any) => {
  const token = getAccessToken();
  const response = await axios.put(`${API_URL}/${id}`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deactivateUser = async (id: number) => {
  const token = getAccessToken();
  const response = await axios.patch(`${API_URL}/${id}/deactivate`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const userService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
};

export default userService;
