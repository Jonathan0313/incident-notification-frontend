// src/services/authService.ts
import { axiosClient } from './axiosClient';

export const authService = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await axiosClient.post('/v1/api/auth/login', credentials);
    
    // 1. Calculamos las 10 horas a partir del momento exacto del login exitoso
    const expiresInMs = 10 * 60 * 60 * 1000; // 10 horas en milisegundos
    const expirationTime = new Date().getTime() + expiresInMs;

    // 2. Guardamos el token y la fecha de expiración en localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('token_expiration', expirationTime.toString());

    return response.data; // Retorna el objeto con { token: "..." }
  },
  
  register: async (userData: { username: string; password: string }) => {
    const response = await axiosClient.post('/v1/api/auth/register', userData);
    return response.data; // Retorna texto plano o mensaje de éxito
  },

  changePassword: async (passData: { currentPassword: string; newPassword: string }) => {
    const response = await axiosClient.put('/v1/api/auth/password', passData);
    return response.data;
  },

  deleteAccount: async (id: string | number) => {
    const response = await axiosClient.delete(`/v1/api/auth/${id}`);
    return response.data;
  }
};