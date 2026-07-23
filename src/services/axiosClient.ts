// src/services/axiosClient.ts
import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/v1/api',
  headers: {
    'Content-Type': 'application/json',
  },
});