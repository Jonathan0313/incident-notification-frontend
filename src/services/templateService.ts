// src/services/templateService.ts
import { axiosClient } from './axiosClient';

export const templateService = {
  getAll: async () => {
    const res = await axiosClient.get('/v1/api/templates').catch(() => ({ data: [] }));
    return res.data;
  },
  getById: async (id: string | number) => {
    const res = await axiosClient.get(`/v1/api/templates/${id}`);
    return res.data;
  },
  create: async (payload: any) => {
    const res = await axiosClient.post('/v1/api/templates', payload);
    return res.data;
  },
  update: async (id: string | number, payload: any) => {
    const res = await axiosClient.put(`/v1/api/templates/${id}`, payload);
    return res.data;
  },
  delete: async (id: string | number) => {
    const res = await axiosClient.delete(`/v1/api/templates/${id}`);
    return res.data;
  },
};