// src/services/tokenService.ts
import { axiosClient } from './axiosClient';

// Definimos la interfaz exacta que coincide con tu payload
export interface TokenPayload {
  platform: string;
  tokenValue: string;
  expiresAt: string;
  user: string;
}

export const tokenService = {
  getTokens: async () => {
    const response = await axiosClient.get('/v1/api/tokens');
    return response.data;
  },

  createToken: async (tokenData: TokenPayload) => {
    const response = await axiosClient.post('/v1/api/tokens', tokenData);
    return response.data;
  },

  updateToken: async (tokenData: TokenPayload) => {
    const response = await axiosClient.put('/v1/api/tokens', tokenData);
    return response.data;
  },

  deleteToken: async (platform: string, user: string) => {
    await axiosClient.delete(`/v1/api/tokens/${platform}/${user}`);
  }
};