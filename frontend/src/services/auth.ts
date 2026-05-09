import api from './api';
import type { Token } from '../types';

export const authService = {
  register: async (email: string, password: string): Promise<Token> => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  login: async (username: string, password: string): Promise<Token> => {
    const response = await api.post('/auth/login', {
      username,
      password,
    });
    return response.data;
  },
};