import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { patientApi, type Patient } from '../api/patient';
import { chatApi, type ChatMessage } from '../api/chat';
import ChatWindow from '../components/ChatWindow';

const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patientId = id ? Number(id) : null;

  // Fetch patient details
  useEffect(() => {
    if (!token || !patientId) return;

    const fetchPatient = async () => {
      try {
        const response = await patientApi.getById(patientId, token);
        setPatient(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load patient');
      }
    };

    fetchPatient();
  }, [patientId, token]);

  // Fetch chat history
  useEffect(() => {
    if (!token || !patientId) return;

    const fetchChatHistory = async () => {
      setLoading(true);
      try {
        const response = await chatApi.getHistory(patientId, token);
        setMessages(response.data);
      } catch (err) {
        console.error('Failed to load chat history:', err);
        // Don't show error for chat history, just log it
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [patientId, token]);

  const handleSendMessage = async (message: string) => {
    if (!token || !patientId) return;

    setChatLoading(true);
    try {
      const response = await chatApi.sendMessage(
        { patientId, message },
        token
      );

      // Add both user and AI messages to the list
      setMessages((prev) => [
        ...prev,
        response.data.userMessage,
        response.data.aiMessage,
      ]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send message';
      alert(errorMessage);
      throw err; // Re-throw so ChatWindow can handle it
    } finally {
      setChatLoading(false);
    }
  };

  if (!patientId) {
    return (
      <div style={{ padding: '2rem' }}>
        <div>Invalid patient ID</div>
        <button onClick={() => navigate('/patients')}>Back to Patients</button>
      </div>
    );
  }

  if (loading && !patient) {
    return (
      <div style={{ padding: '2rem' }}>
        <div>Loading patient...</div>
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ color: '#c33', marginBottom: '1rem' }}>{error}</div>
        <button
          onClick={() => navigate('/patients')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Back to Patients
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header with back button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/patients')}
          style={{
            padding: '0.5rem 1rem',
            marginBottom: '1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ← Back to Patients
        </button>
        <h1>Patient Details</h1>
      </div>

      {/* Two-column layout: Patient info on left, Chat on right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '2rem',
        }}
      >
        {/* Patient Information Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '1.5rem',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
            Patient Information
          </h2>

          {patient ? (
            <div style={{ color: '#000000' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Name:</strong>
                <div style={{ marginTop: '0.25rem', color: '#000000' }}>{patient.name}</div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>Email:</strong>
                <div style={{ marginTop: '0.25rem', color: '#000000' }}>
                  {patient.email || '-'}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>Phone:</strong>
                <div style={{ marginTop: '0.25rem', color: '#000000' }}>
                  {patient.phone || '-'}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>Date of Birth:</strong>
                <div style={{ marginTop: '0.25rem', color: '#000000' }}>
                  {patient.dob
                    ? new Date(patient.dob).toLocaleDateString()
                    : '-'}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>Medical Notes:</strong>
                <div
                  style={{
                    marginTop: '0.25rem',
                    whiteSpace: 'pre-wrap',
                    padding: '0.75rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    color: '#000000',
                  }}
                >
                  {patient.medicalNotes || 'No notes'}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#000000' }}>
                <div>
                  Created: {new Date(patient.createdAt).toLocaleString()}
                </div>
                <div>
                  Updated: {new Date(patient.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          ) : (
            <div>Loading...</div>
          )}
        </div>

        {/* Chat Window */}
        <div>
          <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Chat</h2>
          {loading ? (
            <div>Loading chat history...</div>
          ) : (
            <ChatWindow
              onSendMessage={handleSendMessage}
              messages={messages}
              loading={chatLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetailPage;
