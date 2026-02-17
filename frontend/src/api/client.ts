import axios from 'axios';
import type { GenerateResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const generateBRD = async (idea: string): Promise<GenerateResponse> => {
    const response = await apiClient.post<GenerateResponse>('/generate', { idea });
    return response.data;
};
