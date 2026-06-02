import {apiClient} from './client';
import {ApiResponse, SentimentData} from '@appTypes/api';

// TODO: connect to backend AI service
export const getSentimentData = async (params?: {
  from?: string;
  to?: string;
  constituency?: string;
}): Promise<ApiResponse<SentimentData>> => {
  const response = await apiClient.get('/sentiment', {params});
  return response.data;
};
