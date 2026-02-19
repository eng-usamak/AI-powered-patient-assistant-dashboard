import React, { useState, useEffect, useRef } from 'react';
import { type ChatMessage } from '../api/chat';

interface ChatWindowProps {
  onSendMessage: (message: string) => Promise<void>;
  messages: ChatMessage[];
  loading?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  onSendMessage,
  messages,
  loading = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;

    setSending(true);
    try {
      await onSendMessage(inputValue.trim());
      setInputValue(''); // Clear input after successful send
    } catch (err) {
      // Error handling is done in parent component
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '600px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: '#6c757d',
              marginTop: '2rem',
            }}
          >
            No messages yet. Start a conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: msg.sender === 'USER' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: msg.sender === 'USER' ? '#007bff' : '#ffffff',
                  color: msg.sender === 'USER' ? '#ffffff' : '#000000',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    opacity: 0.8,
                    marginBottom: '0.25rem',
                  }}
                >
                  {msg.sender === 'USER' ? 'You' : 'AI Assistant'}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {msg.content}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    opacity: 0.7,
                    marginTop: '0.25rem',
                  }}
                >
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator when AI is responding */}
        {loading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <span>AI is typing</span>
                <span>...</span>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        style={{
          borderTop: '1px solid #ccc',
          padding: '1rem',
          backgroundColor: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={sending || loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              color: '#000000',
            }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || sending || loading}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor:
                !inputValue.trim() || sending || loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor:
                !inputValue.trim() || sending || loading
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
