import api from './api';
import type { Candidate, AISummary, Score, PaginatedResponse } from '../types';

export const candidatesService = {
  listCandidates: async (params?: {
    status?: string;
    role?: string;
    skill?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Candidate>> => {
    const response = await api.get('/candidates', { params });
    return response.data;
  },

  getCandidate: async (id: number): Promise<Candidate> => {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
  },

  createCandidate: async (candidate: {
    name: string;
    email: string;
    role_applied: string;
    skills: string[];
  }): Promise<Candidate> => {
    const response = await api.post('/candidates', candidate);
    return response.data;
  },

  updateCandidate: async (
    id: number,
    update: { status?: string; internal_notes?: string }
  ): Promise<Candidate> => {
    const response = await api.patch(`/candidates/${id}`, update);
    return response.data;
  },

  deleteCandidate: async (id: number): Promise<void> => {
    await api.delete(`/candidates/${id}`);
  },

  getAISummary: async (id: number): Promise<AISummary> => {
    const response = await api.post(`/candidates/${id}/summary`);
    return response.data;
  },

  submitScore: async (
    id: number,
    score: { category: string; score: number; note?: string }
  ): Promise<Score> => {
    const response = await api.post(`/candidates/${id}/scores`, score);
    return response.data;
  },
};