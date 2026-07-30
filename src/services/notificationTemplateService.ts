import { axiosClient } from './axiosClient';

export const notificationTemplateService = {
  getAll: async () => {
    const res = await axiosClient.get('/v1/api/notification-templates').catch(() => ({ data: [] }));
    return res.data;
  },

  // 🟢 Método faltante agregado para solucionar la carga individual
  getById: async (id: string | number) => {
    const res = await axiosClient.get(`/v1/api/notification-templates/${id}`);
    return res.data;
  },

  create: async (payload: any) => {
    const res = await axiosClient.post('/v1/api/notification-templates', payload);
    return res.data;
  },

  update: async (id: string | number, payload: any) => {
    const res = await axiosClient.put(`/v1/api/notification-templates/${id}`, payload);
    return res.data;
  },

  delete: async (id: string | number) => {
    const res = await axiosClient.delete(`/v1/api/notification-templates/${id}`);
    return res.data;
  },
};