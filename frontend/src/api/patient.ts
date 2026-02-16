import { api } from './client';

export interface Patient {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  dob: string | null; // ISO date string from backend
  medicalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientInput {
  name: string;
  email?: string;
  phone?: string;
  dob?: string; // ISO date string
  medicalNotes?: string;
}

export interface UpdatePatientInput {
  name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  medicalNotes?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const patientApi = {
  list: (page: number = 1, limit: number = 10, token: string): Promise<PaginatedResponse<Patient>> =>
    api.get<PaginatedResponse<Patient>>(`/api/patients?page=${page}&limit=${limit}`, token),

  getById: (id: number, token: string): Promise<{ data: Patient }> =>
    api.get<{ data: Patient }>(`/api/patients/${id}`, token),

  create: (data: CreatePatientInput, token: string): Promise<{ data: Patient }> =>
    api.post<{ data: Patient }>('/api/patients', data, token),

  update: (id: number, data: UpdatePatientInput, token: string): Promise<{ data: Patient }> =>
    api.put<{ data: Patient }>(`/api/patients/${id}`, data, token),

  delete: (id: number, token: string): Promise<void> =>
    api.delete<void>(`/api/patients/${id}`, token),
};
