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

/** Attach Bearer token to every outgoing request */
apiClient.interceptors.request.use(async (config) => {
  if (tokenGetter) {
    try {
      const token = await tokenGetter();
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('[API] No token available for request:', config.url);
      }
    } catch (e) {
      console.error('[API] Token getter threw:', e);
    }
  }
  return config;
});

/**
 * On 401, force-refresh the token and retry the request exactly once.
 * This handles the race condition where the token getter is registered
 * before Firebase has fully resolved the session.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only retry once; skip if no tokenGetter or already retried
    if (error.response?.status === 401 && !originalRequest._retry && tokenGetter) {
      originalRequest._retry = true;
      console.warn('[API] 401 received — force-refreshing token and retrying...');
      try {
        // Force Firebase to issue a fresh token (bypasses the 1-hour cache)
        // tokenGetter should call user.getIdToken(true) for force refresh
        const freshToken = await tokenGetter();
        if (freshToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers['Authorization'] = `Bearer ${freshToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        console.error('[API] Token refresh failed during retry:', refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export interface GenerateRequestPayload {
  idea: string;
  project_id?: string;
  title?: string;
  description?: string;
}

export interface GenerateApiResponse {
  project_id: string;
  project_title: string;
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

export const setup2FA = async () => {
  const response = await apiClient.post('/users/me/2fa/setup');
  return response.data;
};

export const enable2FA = async (code: string) => {
  const response = await apiClient.post('/users/me/2fa/enable', { code });
  return response.data;
};

export const verify2FA = async (code: string) => {
  const response = await apiClient.post('/users/me/2fa/verify', { code });
  return response.data;
};

export const disable2FA = async () => {
  const response = await apiClient.post('/users/me/2fa/disable');
  return response.data;
};
