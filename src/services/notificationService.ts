import { axiosClient } from './axiosClient';

export const notificationService = {
  create: async (payload: any) => {
    const res = await axiosClient.post('/v1/api/notifications', payload);
    return res.data;
  },
  // Puedes agregar más métodos relacionados (getAll, getById, etc.) aquí si lo requieres en el futuro
};