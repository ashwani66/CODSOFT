import axios from 'axios';

// ------------------ Token Helpers ------------------
const TOKEN_KEY = 'pm_token';

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ------------------ Axios Instance ------------------
const API_BASE = 'https://codsoft-alsb.onrender.com/api';
const api = axios.create({ baseURL: API_BASE });

// Attach token to every request if exists
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// ------------------ User APIs ------------------
export const registerUser = async (name, email, password) => {
  const res = await api.post('/users/register', { name, email, password });
  return res.data;
};

export const loginUser = async (email, password) => {
  const res = await api.post('/users/login', { email, password });
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/users/me');
  return res.data;
};

// ------------------ Project APIs ------------------
export const getProjects = async () => {
  const res = await api.get('/projects');
  return res.data;
};

export const getProjectById = async (id) => {
  const res = await api.get(`/projects/${id}`);
  return res.data;
};

export const createProject = async (title, description) => {
  const res = await api.post('/projects', { title, description });
  return res.data;
};

export const joinProjectByCode = async (teamCode) => {
  const res = await api.post('/projects/join', { teamCode });
  return res.data;
};

// ------------------ Task APIs ------------------
export const addTask = async (projectId, title, assigneeName, deadline) => {
  const res = await api.post(`/tasks/${projectId}`, { title, assigneeName, deadline });
  return res.data;
};

export const updateTask = async (taskId, updates) => {
  const res = await api.put(`/tasks/${taskId}`, updates);
  return res.data;
};

export const deleteTask = async (taskId) => {
  const res = await api.delete(`/tasks/${taskId}`);
  return res.data;
};
