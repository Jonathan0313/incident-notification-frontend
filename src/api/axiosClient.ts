import axios from 'axios';

// Creamos una instancia de axios configurada con la URL de nuestro backend
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;