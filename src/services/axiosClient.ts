import axios from 'axios';

// Configura aquí la URL base de tu backend
const API_BASE_URL = 'http://localhost:8080'; // Cambiala por la URL de tu servidor si es diferente

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});