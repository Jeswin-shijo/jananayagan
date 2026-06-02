import {apiClient} from './client';
import {ApiResponse, User} from '@appTypes/api';
import {UserRole} from '@appTypes/navigation';

export interface LoginPayload {
  phone: string;
  role: UserRole;
}

export interface OTPPayload {
  phone: string;
  otp: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// TODO: connect to backend
export const sendOTP = async (payload: LoginPayload): Promise<ApiResponse<{message: string}>> => {
  const response = await apiClient.post('/auth/send-otp', payload);
  return response.data;
};

// TODO: connect to backend
export const verifyOTP = async (payload: OTPPayload): Promise<ApiResponse<AuthResponse>> => {
  const response = await apiClient.post('/auth/verify-otp', payload);
  return response.data;
};

// TODO: connect to backend
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

// TODO: connect to backend
export const refreshToken = async (): Promise<ApiResponse<{token: string}>> => {
  const response = await apiClient.post('/auth/refresh');
  return response.data;
};
