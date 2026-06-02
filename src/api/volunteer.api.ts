import {apiClient} from './client';
import {ApiResponse, PaginatedResponse, Volunteer} from '@appTypes/api';

export interface AddVolunteerPayload {
  name: string;
  phone: string;
  area: string;
  email?: string;
}

// TODO: connect to backend
export const getVolunteers = async (params?: {area?: string; isAvailable?: boolean}): Promise<PaginatedResponse<Volunteer>> => {
  const response = await apiClient.get('/volunteers', {params});
  return response.data;
};

// TODO: connect to backend
export const addVolunteer = async (payload: AddVolunteerPayload): Promise<ApiResponse<Volunteer>> => {
  const response = await apiClient.post('/volunteers', payload);
  return response.data;
};

// TODO: connect to backend
export const updateVolunteerAvailability = async (id: string, isAvailable: boolean): Promise<ApiResponse<Volunteer>> => {
  const response = await apiClient.patch(`/volunteers/${id}/availability`, {isAvailable});
  return response.data;
};
