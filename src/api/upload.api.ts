import {apiClient} from './client';
import {ApiResponse} from '@appTypes/api';

export interface UploadedFile {
  url: string;
  key: string;
}

// TODO: connect to backend — multipart/form-data upload
export const uploadImage = async (
  uri: string,
  fileName: string,
  type: string,
): Promise<ApiResponse<UploadedFile>> => {
  const formData = new FormData();
  formData.append('file', {uri, name: fileName, type} as unknown as Blob);

  const response = await apiClient.post('/upload/image', formData, {
    headers: {'Content-Type': 'multipart/form-data'},
  });
  return response.data;
};
