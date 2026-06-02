import {apiClient} from './client';
import {ApiResponse, PaginatedResponse, Complaint, ComplaintStatus} from '@appTypes/api';

export interface SubmitComplaintPayload {
  category: string;
  subCategory?: string;
  description: string;
  priority: string;
  latitude: number;
  longitude: number;
  address: string;
  images: string[];
}

// TODO: connect to backend
export const submitComplaint = async (payload: SubmitComplaintPayload): Promise<ApiResponse<Complaint>> => {
  const response = await apiClient.post('/complaints', payload);
  return response.data;
};

// TODO: connect to backend
export const getComplaints = async (params?: {
  status?: ComplaintStatus;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Complaint>> => {
  const response = await apiClient.get('/complaints', {params});
  return response.data;
};

// TODO: connect to backend
export const getComplaintById = async (id: string): Promise<ApiResponse<Complaint>> => {
  const response = await apiClient.get(`/complaints/${id}`);
  return response.data;
};

// TODO: connect to backend
export const updateComplaintStatus = async (id: string, status: ComplaintStatus): Promise<ApiResponse<Complaint>> => {
  const response = await apiClient.patch(`/complaints/${id}/status`, {status});
  return response.data;
};

// TODO: connect to backend
export const assignVolunteer = async (complaintId: string, volunteerId: string): Promise<ApiResponse<Complaint>> => {
  const response = await apiClient.post(`/complaints/${complaintId}/assign`, {volunteerId});
  return response.data;
};
