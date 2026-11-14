import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth APIs ---
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (email, password, full_name) => {
  const response = await api.post('/auth/register', { email, password, full_name });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// --- Student APIs ---
export const getProfile = async () => {
  const response = await api.get('/student/profile');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/student/profile', data);
  return response.data;
};

export const addEducation = async (data) => {
  const response = await api.post('/student/education', data);
  return response.data;
};

export const deleteEducation = async (id) => {
  const response = await api.delete(`/student/education/${id}`);
  return response.data;
};

export const addProject = async (data) => {
  const response = await api.post('/student/projects', data);
  return response.data;
};

export const deleteProject = async (id) => {
  const response = await api.delete(`/student/projects/${id}`);
  return response.data;
};

export const updateSkills = async (skills) => {
  const response = await api.post('/student/skills', { skills });
  return response.data;
};

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  const response = await api.post('/student/resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// --- Jobs APIs ---
export const getJobs = async (params = {}) => {
  const response = await api.get('/jobs', { params });
  return response.data;
};

export const getJob = async (id) => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

export const applyToJob = async (id, cover_letter = '') => {
  const response = await api.post(`/jobs/${id}/apply`, { cover_letter });
  return response.data;
};

export const getApplications = async (status = '') => {
  const params = status ? { status } : {};
  const response = await api.get('/jobs/applications', { params });
  return response.data;
};

// --- AI APIs ---
export const getRecommendations = async () => {
  const response = await api.get('/ai/recommendations');
  return response.data;
};

export const getSkillGap = async (jobId = null) => {
  const endpoint = jobId ? `/ai/skill-gap/${jobId}` : '/ai/skill-gap';
  const response = await api.get(endpoint);
  return response.data;
};

export const getCourses = async (skill = '') => {
  const endpoint = skill ? `/ai/courses?skill=${encodeURIComponent(skill)}` : '/ai/courses';
  const response = await api.get(endpoint);
  return response.data;
};

// --- Admin APIs ---
export const getStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getStudents = async (search = '') => {
  const response = await api.get('/admin/students', { params: { search } });
  return response.data;
};

export const getStudent = async (id) => {
  const response = await api.get(`/admin/students/${id}`);
  return response.data;
};

export const createJob = async (data) => {
  const response = await api.post('/admin/jobs', data);
  return response.data;
};

export const updateJob = async (id, data) => {
  const response = await api.put(`/admin/jobs/${id}`, data);
  return response.data;
};

export const deleteJob = async (id) => {
  const response = await api.delete(`/admin/jobs/${id}`);
  return response.data;
};

export const getAdminApplications = async () => {
  const response = await api.get('/admin/applications');
  return response.data;
};

export const updateApplicationStatus = async (id, status) => {
  const response = await api.put(`/admin/applications/${id}/status`, { status });
  return response.data;
};

export default api;
