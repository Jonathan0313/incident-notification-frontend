// src/services/userService.ts
import { axiosClient } from './axiosClient';

export const userService = {
  getAll: async () => {
    const response = await axiosClient.get('/users');
    return response.data;
  }
};