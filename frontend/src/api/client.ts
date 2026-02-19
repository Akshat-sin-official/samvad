import axios from 'axios';
import type { GenerateResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

let tokenGetter: (() => Promise<string | null>) | null = null;

export const setAuthTokenGetter = (getter: () => Promise<string | null>) => {
  tokenGetter = getter;
};

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  if (tokenGetter) {
    const token = await tokenGetter();
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

export interface GenerateRequestPayload {
  idea: string;
  project_id?: string;
  title?: string;
  description?: string;
}

export interface GenerateApiResponse {
  project_id: string;
  artifacts: GenerateResponse;
  metadata?: GenerateResponse['metadata'];
}

export const generateBRD = async (payload: GenerateRequestPayload): Promise<GenerateApiResponse> => {
  const response = await apiClient.post<GenerateApiResponse>('/generate', payload);
  return response.data;
};

export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  status: string;
  updatedAt?: string;
}

export const fetchProjects = async (): Promise<ProjectSummary[]> => {
  const response = await apiClient.get<ProjectSummary[]>('/projects');
  return response.data;
};

export const fetchProjectById = async (id: string) => {
  const response = await apiClient.get(`/projects/${id}`);
  return response.data;
};

export interface UserSettingsPayload {
  displayName?: string;
  bio?: string;
  notifications?: Record<string, boolean>;
  appearance?: string;
}

export const fetchCurrentUser = async () => {
  const response = await apiClient.get('/users/me');
  return response.data;
};

export const updateUserSettings = async (payload: UserSettingsPayload) => {
  const response = await apiClient.put('/users/me', payload);
  return response.data;
};
