// src/services/formService.ts
import axios from 'axios';

const API_URL = 'http://localhost:8080/v1/api'; // Ajusta según tu prefijo global (ej: /v1/api)

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

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
    const response = await axios.get(`${API_URL}/forms`, getAuthHeaders());
    return response.data;
  },

  getFormByPipelineId: async (pipelineId: string) => {
    const response = await axios.get(`${API_URL}/forms/${pipelineId}`, getAuthHeaders());
    return response.data;
  },

  createForm: async (formData: FormDto) => {
    const response = await axios.post(`${API_URL}/forms`, formData, getAuthHeaders());
    return response.data;
  },

  updateForm: async (formData: FormDto) => {
    const response = await axios.put(`${API_URL}/forms`, formData, getAuthHeaders());
    return response.data;
  },

  deleteForm: async (pipelineId: string) => {
    await axios.delete(`${API_URL}/forms/${pipelineId}`, getAuthHeaders());
  }
};