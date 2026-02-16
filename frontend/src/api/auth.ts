import { api } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
  };
  token: string;
}

export const authApi = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    api.post<AuthResponse>('/api/auth/login', data),

  register: (data: RegisterRequest): Promise<AuthResponse> =>
    api.post<AuthResponse>('/api/auth/register', data),
};
