import { axiosClient } from './axiosClient';

export const incidentService = {
  getOpen: async () => {
    const res = await axiosClient.get('/v1/api/notifications/open').catch(() => ({ data: [] }));
    return res.data;
  },
  getClosedRecent: async () => {
    const res = await axiosClient.get('/v1/api/notifications/closed/recent').catch(() => ({ data: [] }));
    return res.data;
  },
  getById: async (id: string | number) => {
    const res = await axiosClient.get(`/v1/api/notifications/${id}`);
    return res.data;
  },
  create: async (payload: any) => {
    const res = await axiosClient.post('/v1/api/notifications', payload);
    return res.data;
  },
  update: async (id: string | number, payload: any) => {
    const res = await axiosClient.put(`/v1/api/notifications/${id}`, payload);
    return res.data;
  },
  close: async (id: string | number, payload: any) => {
    const res = await axiosClient.put(`/v1/api/notifications/${id}/close`, payload);
    return res.data;
  },
  getAllServices: async () => {
    const res = await axiosClient.get('/v1/api/services/all').catch(() => ({ data: [] }));
    return res.data;
  },
  getTemplates: async () => {
    const res = await axiosClient.get('/v1/api/templates').catch(() => ({ data: [] }));
    return res.data;
  },
};