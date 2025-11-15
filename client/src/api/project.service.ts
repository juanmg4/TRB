import axios from 'axios';
import { getAccessToken } from '../utils/auth';

const API_URL = 'http://localhost:3001/api/proyectos';

const getProjects = async (page: number = 1, pageSize: number = 10, sort: string = 'name:asc', clientId?: number, isActive?: boolean) => {
  const token = getAccessToken();
  const params: any = { page, pageSize, sort };
  if (clientId) params.clientId = clientId;
  if (isActive !== undefined) params.isActive = isActive;

  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

const getProjectById = async (id: number) => {
  const token = getAccessToken();
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const createProject = async (projectData: any) => {
  const token = getAccessToken();
  const response = await axios.post(API_URL, projectData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateProject = async (id: number, projectData: any) => {
  const token = getAccessToken();
  const response = await axios.put(`${API_URL}/${id}`, projectData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const deleteProject = async (id: number) => { // Soft delete
  const token = getAccessToken();
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const projectService = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};

export default projectService;
