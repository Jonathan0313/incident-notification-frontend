import { axiosClient } from './axiosClient';

export const orchestratorPipelineService = {
  checkPipelineExists: async (serviceName: string) => {
    const encodedService = encodeURIComponent(serviceName.trim());
    const res = await axiosClient.get(`/v1/api/pipelines/${encodedService}`);
    return res.data;
  },

  triggerPipeline: async (payload: { serviceName: string; status: string }) => {
    const res = await axiosClient.post('/v1/api/pipeline-workflows', payload);
    return res.data;
  },

  streamPipelineProgress: async (serviceName: string, status: string) => {
    const params = new URLSearchParams({ serviceName, status });
    const baseURL = axiosClient.defaults.baseURL || import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('jwt') || '';

    return fetch(`${baseURL}/v1/api/pipelines/progress?${params.toString()}`, {
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        'Accept': 'text/event-stream'
      }
    });
  },

  getProgressStreamUrl: (serviceName: string, status: string) => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
    return `${apiBaseUrl}/v1/api/pipelines/progress?serviceName=${encodeURIComponent(serviceName)}&status=${encodeURIComponent(status)}&token=${token}`;
  }
};