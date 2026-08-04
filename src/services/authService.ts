// src/services/authService.ts
import { axiosClient } from './axiosClient';

export const authService = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await axiosClient.post('/v1/api/auth/login', credentials);
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