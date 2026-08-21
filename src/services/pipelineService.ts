import axios from 'axios';

const API_URL = 'http://localhost:8080/v1/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export interface PipelineDto {
  services: string;
  pipelineId: string;
  variables: Record<string, any>;
  enabled: string;
  disabled: string;
}

export const pipelineService = {
  getAllPipelines: async (): Promise<PipelineDto[]> => {
    const response = await axios.get(`${API_URL}/pipelines`, getAuthHeaders());
    return response.data;
  },

  getPipelineByServices: async (services: string): Promise<PipelineDto[]> => {
    const response = await axios.get(`${API_URL}/pipelines/${services}`, getAuthHeaders());
    return response.data;
  },

  // Ajustado con transformRequest para asegurar que viaje estrictamente como un arreglo JSON plano
  createPipeline: async (pipelines: PipelineDto[]): Promise<any> => {
    const auth = getAuthHeaders();
    const response = await axios.post(`${API_URL}/pipelines`, pipelines, {
      headers: auth.headers,
      transformRequest: [(data) => JSON.stringify(data)]
    });
    return response.data;
  },

  // Ajustado con transformRequest para asegurar que viaje estrictamente como un arreglo JSON plano
  updatePipeline: async (services: string, pipelines: PipelineDto[]): Promise<void> => {
    const auth = getAuthHeaders();
    await axios.put(`${API_URL}/pipelines/${services}`, pipelines, {
      headers: auth.headers,
      transformRequest: [(data) => JSON.stringify(data)]
    });
  },

  deletePipeline: async (services: string): Promise<void> => {
    await axios.delete(`${API_URL}/pipelines/${services}`, getAuthHeaders());
  },

  getForms: async () => {
    const response = await axios.get(`${API_URL}/forms`, getAuthHeaders());
    return response.data;
  },

  getServicesStatus: async () => {
    const response = await axios.get(`${API_URL}/services/all`, getAuthHeaders());
    return response.data;
  }
};