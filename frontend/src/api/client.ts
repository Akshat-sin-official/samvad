import axios from 'axios';
import type { GenerateResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// The token getter — set once Firebase auth is resolved with a real user
let tokenGetter: (() => Promise<string | null>) | null = null;

export const setAuthTokenGetter = (getter: (() => Promise<string | null>) | null) => {
  tokenGetter = getter;
};

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Attach Bearer token to every outgoing request.
 * If tokenGetter is null or returns null (user not yet authenticated),
 * the request is still sent but without an auth header — the backend
 * will return 401, which triggers the retry interceptor below.
 */
apiClient.interceptors.request.use(async (config) => {
  if (tokenGetter) {
    try {
      const token = await tokenGetter();
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('[API] tokenGetter returned null for:', config.url);
      }
    } catch (e) {
      console.error('[API] Token getter threw:', e);
    }
  } else {
    console.warn('[API] No tokenGetter registered yet for:', config.url);
  }
  return config;
});

/**
 * On 401: force-refresh the Firebase ID token and retry the request once.
 * This handles:
 *  - Expired tokens (>1 hour)
 *  - Race condition where tokenGetter is registered but user.getIdToken was
 *    served from a stale cache at request time
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && tokenGetter) {
      originalRequest._retry = true;
      console.warn('[API] 401 — force-refreshing Firebase token and retrying:', originalRequest.url);
      try {
        // forceRefresh=true bypasses the Firebase 1-hour token cache
        const freshToken = await tokenGetter();
        if (freshToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers['Authorization'] = `Bearer ${freshToken}`;
          return apiClient(originalRequest);
        } else {
          console.error('[API] Retry aborted: force-refreshed token is still null.');
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
  context_data?: string;
  context_data_2?: string;
  project_id?: string;
  title?: string;
  description?: string;
  selected_model?: string;
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

/** Load sample context from backend (dataset/emails/emails.csv) for Demo. */
export const fetchDemoContext = async (): Promise<{ context_data: string }> => {
  const response = await apiClient.get<{ context_data: string }>('/demo-context');
  return response.data;
};

export const updateProjectTitle = async (projectId: string, title: string): Promise<{ ok: boolean; title: string }> => {
  const response = await apiClient.patch(`/projects/${projectId}`, { title: title.trim() });
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
