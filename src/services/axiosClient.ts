import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

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

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      console.warn('La sesión ha expirado o no es válida. Cerrando sesión...');
      
      // Limpia todo el almacenamiento local para evitar datos corruptos o residuales
      localStorage.clear();
      sessionStorage.clear();

      // Evita bucles si ya está en la vista de login o raíz
      if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);