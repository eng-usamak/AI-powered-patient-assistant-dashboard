const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface RequestOptions extends RequestInit {
  token?: string | null;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  // 1. Initialize with any existing HeadersInit (object, array, or Headers)
  const headers = new Headers(fetchOptions.headers);

  // 2. Use built-in methods for safe manipulation
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: { message: 'Request failed' },
    }));
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
  }

  // Handle 204 No Content responses (common for DELETE operations)
  if (response.status === 204 || response.status === 204) {
    return undefined as T;
  }

  // Check if response has content before parsing
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text();
    return text ? JSON.parse(text) : undefined as T;
  }

  return undefined as T;
}

export const api = {
  get: <T>(endpoint: string, token?: string | null) =>
    request<T>(endpoint, { method: 'GET', token }),

  post: <T>(endpoint: string, data?: unknown, token?: string | null) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  put: <T>(endpoint: string, data?: unknown, token?: string | null) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  delete: <T>(endpoint: string, token?: string | null) =>
    request<T>(endpoint, { method: 'DELETE', token }),
};
