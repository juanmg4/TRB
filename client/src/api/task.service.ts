import axios from 'axios';
import { getAccessToken } from '../utils/auth';

const API_URL = 'http://localhost:3001/api/proyectos'; // Base URL for project-related tasks

const getTasksByProjectId = async (projectId: number) => {
  const token = getAccessToken();
  const response = await axios.get(`${API_URL}/${projectId}/tareas`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getTaskById = async (id: number) => {
  const token = getAccessToken();
  const response = await axios.get(`${API_URL}/tareas/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const createTask = async (projectId: number, taskData: any) => {
  const token = getAccessToken();
  const response = await axios.post(`${API_URL}/${projectId}/tareas`, taskData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateTask = async (id: number, taskData: any) => {
  const token = getAccessToken();
  const response = await axios.put(`${API_URL}/tareas/${id}`, taskData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deleteTask = async (id: number) => { // Hard delete
  const token = getAccessToken();
  const response = await axios.delete(`${API_URL}/tareas/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const taskService = {
  getTasksByProjectId,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};

export default taskService;
