import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { authApi } from '../api/auth';
import { Box, Container, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import backgroundImage from '../assets/background.jpg';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) {
      validateEmail(value);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordError) {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      login(response.user, response.token);
      navigate('/patients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        width: '100vw',
        padding: 0,
        margin: 0,
        left: 0,
        right: 0,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(8px)',
          zIndex: 0,
        },
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          padding: { xs: 2, sm: 4 },
          margin: 0,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            padding: 4,
            borderRadius: 6,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            maxWidth: '420px',
            margin: '0 auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            align="center" 
            gutterBottom 
            sx={{ 
              mb: 3,
              fontWeight: 700,
              letterSpacing: '2px',
              fontSize: '2.5rem',
              background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.7) 0%, rgba(59, 130, 246, 0.8) 50%, rgba(96, 165, 250, 0.9) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 2px 8px rgba(59, 130, 246, 0.3), 0 0 20px rgba(96, 165, 250, 0.2)',
              filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.4))',
              opacity: 0.9,
            }}
          >
            Login
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => validateEmail(email)}
              error={!!emailError}
              helperText={emailError}
              disabled={loading}
              margin="normal"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'primary.main',
                },
              }}
            />

            <TextField
              fullWidth
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => validatePassword(password)}
              error={!!passwordError}
              helperText={passwordError}
              disabled={loading}
              margin="normal"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'primary.main',
                },
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                },
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <span style={{ color: '#666' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#0d47a1', textDecoration: 'none', fontWeight: 500 }}>
                  Register
                </Link>
              </span>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
