import axios from 'axios';

const API_URL = 'http://localhost:3001/api/auth'; // Assuming backend runs on 3001

const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  if (response.data.accessToken) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
  }
  return response.data;
};

const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    await axios.post(`${API_URL}/logout`, { refreshToken });
  }
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

const refreshToken = async () => {
  const oldRefreshToken = localStorage.getItem('refreshToken');
  if (!oldRefreshToken) {
    throw new Error('No refresh token found');
  }
  const response = await axios.post(`${API_URL}/refresh`, { refreshToken: oldRefreshToken });
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user)); // Update user data if needed
  }
  return response.data;
};

const authService = {
  login,
  logout,
  refreshToken,
};

export default authService;
