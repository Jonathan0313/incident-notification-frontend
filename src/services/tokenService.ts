// src/services/tokenService.ts
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

// Definimos la interfaz exacta que coincide con tu payload
export interface TokenPayload {
  platform: string;
  tokenValue: string;
  expiresAt: string;
  user: string;
}

export const tokenService = {
  getTokens: async () => {
  const response = await axios.get(`${API_URL}/tokens`, getAuthHeaders());
  return response.data;
},

  createToken: async (tokenData: TokenPayload) => {
    const response = await axios.post(`${API_URL}/tokens`, tokenData, getAuthHeaders());
    return response.data;
  },

  updateToken: async (tokenData: TokenPayload) => {
    const response = await axios.put(`${API_URL}/tokens`, tokenData, getAuthHeaders());
    return response.data;
  },

  deleteToken: async (platform: string, user: string) => {
    await axios.delete(`${API_URL}/tokens/${platform}/${user}`, getAuthHeaders());
  }
};