import { axiosClient } from './axiosClient';

export const serviceManagementService = {
  getAll: async () => {
    const res = await axiosClient.get('/v1/api/services/all');
    return res.data;
  },
  create: async (payload: any) => {
    const res = await axiosClient.post('/v1/api/services', payload);
    return res.data;
  },
  update: async (id: string | number, payload: any) => {
    const res = await axiosClient.put(`/v1/api/services/${id}`, payload);
    return res.data;
  },
  delete: async (id: string | number) => {
    const res = await axiosClient.delete(`/v1/api/services/${id}`);
    return res.data;
  },
};