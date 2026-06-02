import {apiClient} from './client';
import {ApiResponse, PaginatedResponse, Poll} from '@appTypes/api';

// TODO: connect to backend
export const getPolls = async (params?: {status?: 'active' | 'ended'; page?: number}): Promise<PaginatedResponse<Poll>> => {
  const response = await apiClient.get('/polls', {params});
  return response.data;
};

// TODO: connect to backend
export const submitVote = async (pollId: string, optionId: string): Promise<ApiResponse<Poll>> => {
  const response = await apiClient.post(`/polls/${pollId}/vote`, {optionId});
  return response.data;
};
