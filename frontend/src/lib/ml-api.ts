import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants';

export interface UploadResponse {
  filename: string;
  path: string;
  message: string;
}

// Đảm bảo rằng API endpoints được cập nhật đúng
const getApiUrl = (endpoint: string): string => {
  const baseUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : 'http://localhost:8000';
  return `${baseUrl}${endpoint}`;
};

export interface PredictResponse {
  filename: string;
  prediction: string;
  message: string;
}

export interface MlApi {
  uploadImage: (file: File) => Promise<UploadResponse>;
  predictImage: (file: File) => Promise<PredictResponse>;
  predictFromUploaded: (filename: string) => Promise<PredictResponse>;
}

// Sử dụng apiClient đã có cấu hình baseURL từ file api.ts
export const mlApi: MlApi = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return await apiClient.uploadFile<UploadResponse>(
      API_ENDPOINTS.ml.upload,
      formData
    );
  },

  predictImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return await apiClient.uploadFile<PredictResponse>(
      API_ENDPOINTS.ml.predict,
      formData
    );
  },

  predictFromUploaded: async (filename: string) => {
    return await apiClient.post<PredictResponse>(
      API_ENDPOINTS.ml.predictFromUpload(filename),
      {}
    );
  },
};