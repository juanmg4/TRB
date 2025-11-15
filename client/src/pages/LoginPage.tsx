import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Container, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await login(email, password);
      // Redirection handled by useEffect
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5', // Ensure background color for login page
      }}
    >
      <Box
        sx={{
          p: 4,
          backgroundColor: '#FFFFFF',
          borderRadius: '4px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '400px', // Limit form width
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              backgroundColor: 'red', // Placeholder for geometric icon part 1
              clipPath: 'polygon(0 0, 100% 0, 0 100%)', // Example: triangle
              mr: 0.5,
            }}
          />
          <Box
            sx={{
              width: 24,
              height: 24,
              backgroundColor: 'darkblue', // Placeholder for geometric icon part 2
              clipPath: 'polygon(100% 0, 100% 100%, 0 100%)', // Example: triangle
              mr: 1,
            }}
          />
          <Typography
            variant="h4"
            component="div"
            sx={{
              fontWeight: 'bold',
              color: '#333333',
              letterSpacing: '2px',
            }}
          >
            Intersoft
          </Typography>
        </Box>

        <Typography
          component="h1"
          variant="h5"
          sx={{
            color: '#333333',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            mb: 3,
            fontWeight: 'bold',
          }}
        >
          INICIAR SESIÓN
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email" // Changed label to "Email" as per description
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#CCCCCC', // Light gray border
                },
                '&:hover fieldset': {
                  borderColor: '#CCCCCC', // Keep border color on hover
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#F7931E', // Focus color can be vibrant orange
                },
              },
              mb: 2, // Add margin bottom for spacing
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password" // Changed label to "Password" as per description
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#CCCCCC', // Light gray border
                },
                '&:hover fieldset': {
                  borderColor: '#CCCCCC', // Keep border color on hover
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#F7931E', // Focus color can be vibrant orange
                },
              },
              mb: 3, // Add margin bottom for spacing
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              backgroundColor: '#FFA726', // Softer orange (peach-like)
              color: '#FFFFFF', // White text
              borderRadius: '4px', // Slightly rounded corners
              border: '1px solid rgba(255, 255, 255, 0.5)', // Very thin, light outer border
              '&:hover': {
                backgroundColor: '#F7931E', // Darker orange on hover
              },
            }}
          >
            Confirmar
          </Button>
          {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;