import { api } from './client';

export interface ChatMessage {
  id: number;
  patientId: number;
  sender: 'USER' | 'AI';
  content: string;
  createdAt: string;
}

export interface PostChatRequest {
  patientId: number;
  message: string;
}

export interface PostChatResponse {
  data: {
    userMessage: ChatMessage;
    aiMessage: ChatMessage;
  };
}

export const chatApi = {
  getHistory: (patientId: number, token: string): Promise<{ data: ChatMessage[] }> =>
    api.get<{ data: ChatMessage[] }>(`/api/chat/${patientId}`, token),

  sendMessage: (data: PostChatRequest, token: string): Promise<PostChatResponse> =>
    api.post<PostChatResponse>('/api/chat', data, token),
};
