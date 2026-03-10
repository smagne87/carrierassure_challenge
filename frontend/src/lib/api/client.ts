// --- AI-ASSISTED ---
// Tool: Claude 4.5 Sonnet
// Prompt: "Create Axios API client with typed methods for carrier service endpoints"
// Modifications: Added error handling, request interceptors, typed responses
// --- END AI-ASSISTED ---

import axios, { AxiosInstance } from 'axios';
import type { Carrier, ProcessingSummary, ScoreHistory } from '../types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error.response?.data?.message || error.message || 'An error occurred';
        return Promise.reject(new Error(message));
      }
    );
  }

  async getCarriers(params?: {
    limit?: number;
    minScore?: number;
  }): Promise<Carrier[]> {
    const response = await this.client.get<Carrier[]>('/api/carriers', { params });
    return response.data;
  }

  async getCarrierById(id: string): Promise<Carrier> {
    const response = await this.client.get<Carrier>(`/api/carriers/${id}`);
    return response.data;
  }

  async getCarrierHistory(id: string): Promise<ScoreHistory[]> {
    const response = await this.client.get<ScoreHistory[]>(`/api/carriers/${id}/history`);
    return response.data;
  }

  async uploadCCFFile(file: File): Promise<ProcessingSummary> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post<ProcessingSummary>(
      '/api/ccf/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  }

  async checkHealth(): Promise<{ status: string; uptime: number }> {
    const response = await this.client.get<{ status: string; uptime: number }>('/api/health');
    return response.data;
  }
}

export const apiClient = new ApiClient();
