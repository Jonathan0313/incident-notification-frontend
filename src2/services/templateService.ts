import { axiosClient } from './axiosClient';
import type { Template } from '../domain/template';

const BASE_URL = '/v1/api/templates';

export const templateService = {
  getAll: async (): Promise<Template[]> => {
    const response = await axiosClient.get<Template[]>(BASE_URL);
    return response.data;
  },

  getById: async (id: string): Promise<Template> => {
    const response = await axiosClient.get<Template>(`${BASE_URL}/${id}`);
    return response.data;
  },

  create: async (request: Omit<Template, 'id' | 'createdAt'>): Promise<Template> => {
    const response = await axiosClient.post<Template>(BASE_URL, request);
    return response.data;
  },

  update: async (id: string, request: Omit<Template, 'id' | 'createdAt'>): Promise<Template> => {
    const response = await axiosClient.put<Template>(`${BASE_URL}/${id}`, request);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`${BASE_URL}/${id}`);
  },
};