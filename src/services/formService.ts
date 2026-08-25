// src/services/formService.ts
import { axiosClient } from './axiosClient';

export interface FormDto {
  pipelineId: string;
  name: string;
  platform: string;
  organization: string;
  project: string;
  variables: string[];
  // Nuevos campos opcionales para la activación dinámica
  activationParamName?: string;
  enableValue?: string | number;
  disableValue?: string | number;
}

export const formService = {
  getForms: async () => {
    const response = await axiosClient.get('/v1/api/forms');
    return response.data;
  },

  getFormByPipelineId: async (pipelineId: string) => {
    const response = await axiosClient.get(`/v1/api/forms/${pipelineId}`);
    return response.data;
  },

  createForm: async (formData: FormDto) => {
    const response = await axiosClient.post('/v1/api/forms', formData);
    return response.data;
  },

  updateForm: async (formData: FormDto) => {
    const response = await axiosClient.put('/v1/api/forms', formData);
    return response.data;
  },

  deleteForm: async (pipelineId: string) => {
    await axiosClient.delete(`/v1/api/forms/${pipelineId}`);
  }
};