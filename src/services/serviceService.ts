import { axiosClient } from './axiosClient';
import type { Service } from '../domain/service';

export const serviceService = {
  getAllServices: async (): Promise<Service[]> => {
    const response = await axiosClient.get<Service[]>('/v1/api/services/all');
    return response.data || [];
  },

  getServiceByCode: async (code: string): Promise<Service | null> => {
    const response = await axiosClient.get<Service>(`/v1/api/services/${code}`);
    return response.data || null;
  },

  createService: async (serviceData: Service) => {
    return await axiosClient.post('/v1/api/services', serviceData);
  },

  updateService: async (code: string, serviceData: Service) => {
    return await axiosClient.put(`/v1/api/services/${code}`, serviceData);
  }
};