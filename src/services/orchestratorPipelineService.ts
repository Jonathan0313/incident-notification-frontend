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
};