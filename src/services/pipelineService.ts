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
  variables: any;
}

export const pipelineService = {
  getAllPipelines: async (): Promise<PipelineDto[]> => {
    const response = await axios.get(`${API_URL}/pipelines`, getAuthHeaders());
    return response.data;
  },

  createPipeline: async (pipelines: PipelineDto[]): Promise<any> => {
    const auth = getAuthHeaders();
    const payload = Array.isArray(pipelines) ? pipelines : [pipelines];

    const response = await axios.post(`${API_URL}/pipelines`, payload, {
      headers: auth.headers,
      transformRequest: [(data) => JSON.stringify(data)]
    });
    return response.data;
  },

  updatePipeline: async (services: string, pipelines: PipelineDto[]): Promise<void> => {
    const auth = getAuthHeaders();
    const payload = Array.isArray(pipelines) ? pipelines : [pipelines];

    await axios.put(`${API_URL}/pipelines/${services}`, payload, {
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