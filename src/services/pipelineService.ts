import { axiosClient } from './axiosClient';

export interface PipelineDto {
  services: string;
  variables: any;
}

export const pipelineService = {
  getAllPipelines: async (): Promise<PipelineDto[]> => {
    const response = await axiosClient.get('/v1/api/pipelines');
    return response.data;
  },

  createPipeline: async (pipelines: PipelineDto[]): Promise<any> => {
    const payload = Array.isArray(pipelines) ? pipelines : [pipelines];
    const response = await axiosClient.post('/v1/api/pipelines', payload);
    return response.data;
  },

  updatePipeline: async (services: string, pipelines: PipelineDto[]): Promise<void> => {
    const payload = Array.isArray(pipelines) ? pipelines : [pipelines];
    await axiosClient.put(`/v1/api/pipelines/${services}`, payload);
  },

  deletePipeline: async (services: string): Promise<void> => {
    await axiosClient.delete(`/v1/api/pipelines/${services}`);
  },

  getForms: async () => {
    const response = await axiosClient.get('/v1/api/forms');
    return response.data;
  },

  getServicesStatus: async () => {
    const response = await axiosClient.get('/v1/api/services/all');
    return response.data;
  }
};