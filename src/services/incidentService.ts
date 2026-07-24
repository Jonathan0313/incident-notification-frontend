import { axiosClient } from './axiosClient';
import type { Incident } from '../domain/incident';

export const incidentService = {
  getOpenIncidents: async () => {
    const response = await axiosClient.get('/v1/api/notifications/open');
    const rawData = response.data;
    return Array.isArray(rawData) ? rawData : (rawData?.content || rawData?.data || []);
  },

  getAvailableServices: async () => {
    const response = await axiosClient.get('/v1/api/services/all');
    return response.data || [];
  },

  createIncident: async (formData: Incident) => {
    return await axiosClient.post('/v1/api/notifications', formData);
  },

  updateIncident: async (id: string | number, formData: Incident) => {
    return await axiosClient.put(`/v1/api/notifications/${id}`, formData);
  },

  closeIncident: async (id: string | number, dataToClose: Incident) => {
    return await axiosClient.put(`/v1/api/notifications/${id}/close`, dataToClose);
  },

  getRecentClosedIncidents: async () => {
    const response = await axiosClient.get('/incidents/closed/recent'); // Ajusta tu endpoint real
    return response.data;
  },
};