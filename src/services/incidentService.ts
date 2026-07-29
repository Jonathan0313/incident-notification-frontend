import { axiosClient } from './axiosClient';
import type { Incident } from '../domain/incident';

// Extractor universal para los errores de incidentes
const handleAxiosError = (error: any, defaultMessage: string): never => {
  const data = error?.response?.data;
  let errorMessage = '';

  if (typeof data === 'string') {
    errorMessage = data;
  } else if (data && typeof data === 'object') {
    // Captura mensajes individuales, listas de errores de validación de Spring, etc.
    errorMessage = data.message || data.error || data.mensaje || (Array.isArray(data.errors) ? data.errors.join(', ') : '');
  }

  if (!errorMessage) {
    errorMessage = error?.message || defaultMessage;
  }

  throw new Error(errorMessage);
};

export const incidentService = {
  getOpenIncidents: async () => {
    try {
      const response = await axiosClient.get('/v1/api/notifications/open');
      const rawData = response.data;
      return Array.isArray(rawData) ? rawData : (rawData?.content || rawData?.data || []);
    } catch (error) {
      return handleAxiosError(error, 'Error al obtener incidentes abiertos');
    }
  },

  getAvailableServices: async () => {
    try {
      const response = await axiosClient.get('/v1/api/services/all');
      return response.data || [];
    } catch (error) {
      return handleAxiosError(error, 'Error al cargar servicios disponibles');
    }
  },

  createIncident: async (formData: Incident) => {
    try {
      const response = await axiosClient.post('/v1/api/notifications', formData);
      return response.data;
    } catch (error) {
      // 🟢 Aquí se captura el error 400 y se procesa el mensaje del backend
      return handleAxiosError(error, 'Error al crear el incidente');
    }
  },

  updateIncident: async (id: string | number, formData: Incident) => {
    try {
      const response = await axiosClient.put(`/v1/api/notifications/${id}`, formData);
      return response.data;
    } catch (error) {
      return handleAxiosError(error, 'Error al actualizar el incidente');
    }
  },

  closeIncident: async (id: string | number, dataToClose: Incident) => {
    try {
      const response = await axiosClient.put(`/v1/api/notifications/${id}/close`, dataToClose);
      return response.data;
    } catch (error) {
      return handleAxiosError(error, 'Error al cerrar el incidente');
    }
  },

  getRecentClosedIncidents: async () => {
    try {
      const response = await axiosClient.get('/v1/api/notifications/closed/recent');
      return response.data;
    } catch (error) {
      return handleAxiosError(error, 'Error al obtener incidentes cerrados');
    }
  },
};