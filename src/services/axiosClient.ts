// src/services/axiosClient.ts
import axios from 'axios';

// Configura aquí la URL base de tu backend
const API_BASE_URL = 'http://localhost:8080'; // Cambiala por la URL de tu servidor si es diferente

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar automáticamente el token JWT en las peticiones protegidas
axiosClient.interceptors.request.use(
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