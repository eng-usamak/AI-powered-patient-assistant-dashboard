import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { patientApi, type Patient } from '../api/patient';
import { chatApi, type ChatMessage } from '../api/chat';
import ChatWindow from '../components/ChatWindow';
import {
  Box,
  Container,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

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
      toast.error(errorMessage);
      throw err; // Re-throw so ChatWindow can handle it
    } finally {
      setChatLoading(false);
    }
  };

  if (!patientId) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Invalid patient ID
        </Alert>
        <IconButton onClick={() => navigate('/patients')} color="primary">
          <ArrowBackIcon />
        </IconButton>
      </Container>
    );
  }

  if (loading && !patient) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !patient) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <IconButton onClick={() => navigate('/patients')} color="primary">
          <ArrowBackIcon />
        </IconButton>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'grey.100',
        pt: 4,
        pb: 0,
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header with back button */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
          }}
        >
          <IconButton
            onClick={() => navigate('/patients')}
            sx={{
              backgroundColor: 'rgba(25, 118, 210, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.2)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'black' }}>
            Patient Details
          </Typography>
        </Box>

        {/* Two-column layout: Patient info on left, Chat on right */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
          }}
        >
          {/* Patient Information Card - Left Side with less width */}
          <Box
            sx={{
              width: { xs: '100%', md: '400px' },
              flexShrink: 0,
            }}
          >
            <Paper
              elevation={3}
              sx={{
                borderRadius: 3,
                padding: 3,
                height: 'fit-content',
                position: { md: 'sticky' },
                top: 20,
              }}
            >
              <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
                Patient Information
              </Typography>

              {patient ? (
                <Box>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Name
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500 }}>
                      {patient.name}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {patient.email || <Chip label="N/A" size="small" variant="outlined" />}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Phone
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {patient.phone || <Chip label="N/A" size="small" variant="outlined" />}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Date of Birth
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {patient.dob
                        ? new Date(patient.dob).toLocaleDateString()
                        : <Chip label="N/A" size="small" variant="outlined" />}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                      Medical Notes
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.5,
                        whiteSpace: 'pre-wrap',
                        padding: 2,
                        backgroundColor: 'grey.50',
                        borderRadius: 2,
                        minHeight: 100,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {patient.medicalNotes || 'No notes available'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Created: {new Date(patient.createdAt).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Updated: {new Date(patient.updatedAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              )}
            </Paper>
          </Box>

          {/* Chat Window - Right Side */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <Paper
              elevation={3}
              sx={{
                borderRadius: 3,
                padding: 3,
                height: { xs: '600px', md: 'calc(100vh - 200px)' },
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
                Chat
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <CircularProgress />
                </Box>
              ) : (
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <ChatWindow
                      onSendMessage={handleSendMessage}
                      messages={messages}
                      loading={chatLoading}
                    />
                  </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default PatientDetailPage;
