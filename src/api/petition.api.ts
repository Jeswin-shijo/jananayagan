import {apiClient} from './client';
import {ApiResponse, PaginatedResponse, Petition} from '@appTypes/api';

export interface SubmitPetitionPayload {
  title: string;
  category: string;
  description: string;
  targetSignatures: number;
  constituency: string;
}

// TODO: connect to backend
export const submitPetition = async (payload: SubmitPetitionPayload): Promise<ApiResponse<Petition>> => {
  const response = await apiClient.post('/petitions', payload);
  return response.data;
};

// TODO: connect to backend
export const getPetitions = async (params?: {page?: number; limit?: number}): Promise<PaginatedResponse<Petition>> => {
  const response = await apiClient.get('/petitions', {params});
  return response.data;
};

// TODO: connect to backend
export const signPetition = async (petitionId: string): Promise<ApiResponse<{signatures: number}>> => {
  const response = await apiClient.post(`/petitions/${petitionId}/sign`);
  return response.data;
};
