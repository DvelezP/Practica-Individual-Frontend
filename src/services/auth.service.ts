import { api } from './api';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/auth/login', payload);
    return response.data.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/auth/register', payload);
    return response.data.data;
  },
};
