import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
};

export const articlesAPI = {
  getAll: (page = 1, limit = 10) => 
    api.get(`/articles?page=${page}&limit=${limit}`),
  
  getById: (id) => api.get(`/articles/${id}`),
  
  create: (articleData) => {
    const formData = new FormData();
    formData.append('title', articleData.title);
    formData.append('content', articleData.content);
    if (articleData.category_id) {
      formData.append('category_id', articleData.category_id);
    }
    if (articleData.image) {
      formData.append('image', articleData.image);
    }
    
    return api.post('/articles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  update: (id, articleData) => {
    const formData = new FormData();
    if (articleData.title) formData.append('title', articleData.title);
    if (articleData.content) formData.append('content', articleData.content);
    if (articleData.category_id !== undefined) {
      formData.append('category_id', articleData.category_id || '');
    }
    if (articleData.image) {
      formData.append('image', articleData.image);
    }
    
    return api.put(`/articles/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  delete: (id) => api.delete(`/articles/${id}`),
  
  getMyArticles: () => api.get('/my-articles'),
  
  getAllForAdmin: () => api.get('/admin/articles'),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  
  getArticlesByCategory: (slug, page = 1, limit = 10) => 
    api.get(`/categories/${slug}/articles?page=${page}&limit=${limit}`),
  
  // Admin only
  getAllForAdmin: () => api.get('/admin/categories'),
  
  create: (categoryData) => api.post('/admin/categories', categoryData),
  
  update: (id, categoryData) => api.put(`/admin/categories/${id}`, categoryData),
  
  delete: (id) => api.delete(`/admin/categories/${id}`),
};

export default api; 