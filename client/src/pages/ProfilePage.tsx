import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import profesionalService from '../api/profesional.service';
import { useAuth } from '../context/AuthContext';

interface Profesional {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profesional, setProfesional] = useState<Profesional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (user?.profesionalId) {
      fetchProfesionalData(user.profesionalId);
    } else {
      setError('No se encontró el perfil profesional asociado.');
      setLoading(false);
    }
  }, [user]);

  const fetchProfesionalData = async (id: number) => {
    try {
      setLoading(true);
      const data = await profesionalService.getProfesionalById(id);
      setProfesional(data);
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setPhone(data.phone || '');
      setAddress(data.address || '');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el perfil profesional.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user?.profesionalId) {
      setError('No se puede actualizar el perfil sin un ID profesional.');
      return;
    }

    const profesionalData = {
      firstName,
      lastName,
      phone: phone || null,
      address: address || null,
    };

    try {
      await profesionalService.updateProfesional(user.profesionalId, profesionalData);
      setSuccess('Perfil actualizado exitosamente.');
      // Re-fetch data to ensure UI is up-to-date
      fetchProfesionalData(user.profesionalId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el perfil.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !profesional) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mi Perfil
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          margin="normal"
          fullWidth
          id="firstName"
          label="Nombre"
          name="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <TextField
          margin="normal"
          fullWidth
          id="lastName"
          label="Apellido"
          name="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <TextField
          margin="normal"
          fullWidth
          id="phone"
          label="Teléfono"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <TextField
          margin="normal"
          fullWidth
          id="address"
          label="Dirección"
          name="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Guardar Cambios
        </Button>
      </Box>
    </Container>
  );
};

export default ProfilePage;
