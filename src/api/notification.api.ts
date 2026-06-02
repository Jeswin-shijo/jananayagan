import {apiClient} from './client';
import {ApiResponse, PaginatedResponse, Notification} from '@appTypes/api';

// TODO: connect to backend
export const registerFCMToken = async (token: string, platform: 'ios' | 'android'): Promise<void> => {
  await apiClient.post('/notifications/register', {token, platform});
};

// TODO: connect to backend
export const getNotifications = async (): Promise<PaginatedResponse<Notification>> => {
  const response = await apiClient.get('/notifications');
  return response.data;
};

// TODO: connect to backend
export const markNotificationRead = async (id: string): Promise<void> => {
  await apiClient.patch(`/notifications/${id}/read`);
};
