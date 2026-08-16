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
    // Si no hay respuesta del servidor (Pérdida de red / Servidor caído)
    if (!error.response) {
      console.error('Sin conexión al servidor. Redirigiendo automáticamente...');
      
      // Limpiamos tokens/sesión
      localStorage.removeItem('token');
      localStorage.removeItem('token_expiration');
      sessionStorage.clear();

      // Ajuste: Validar explícitamente que no estemos intentando hacer login o ya en /login
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      
      if (!window.location.pathname.includes('/login') && !isLoginRequest) {
        window.location.href = '/login?reason=network_error';
      }
      return Promise.reject(error);
    }

    // Errores 401 / 403 (Sesión expirada)
    const status = error.response.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('token_expiration'); // <--- Añadido aquí
      sessionStorage.clear();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?reason=session_expired';
      }
    }

    return Promise.reject(error);
  }
);