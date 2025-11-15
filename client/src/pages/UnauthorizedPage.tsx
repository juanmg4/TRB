import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" color="error">
          Acceso Denegado
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          No tiene los permisos necesarios para acceder a esta página.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={() => navigate('/')}
        >
          Ir al Inicio
        </Button>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;
