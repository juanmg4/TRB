import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  TablePagination, // New import
  TableSortLabel, // New import
} from '@mui/material';
import clientService from '../api/client.service';

interface Client {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
}

type Order = 'asc' | 'desc';

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);

  // Pagination and Sorting states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof Client>('id');
  const [order, setOrder] = useState<Order>('asc');
  const [totalClients, setTotalClients] = useState(0);

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchClients();
  }, [page, rowsPerPage, orderBy, order]); // Re-fetch when pagination/sorting changes

  const fetchClients = async () => {
    try {
      setLoading(true);
      const sortString = `${orderBy}:${order}`;
      const response = await clientService.getClients(page + 1, rowsPerPage, sortString); // Backend expects 1-indexed page
      setClients(response.data);
      setTotalClients(response.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar clientes.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSort = (property: keyof Client) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page when rows per page changes
  };

  const handleOpenCreateDialog = () => {
    setIsEditMode(false);
    setCurrentClient(null);
    setName('');
    setAddress('');
    setPhone('');
    setEmail('');
    setIsActive(true);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (client: Client) => {
    setIsEditMode(true);
    setCurrentClient(client);
    setName(client.name);
    setAddress(client.address || '');
    setPhone(client.phone || '');
    setEmail(client.email || '');
    setIsActive(client.isActive);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const clientData = {
      name,
      address: address || null,
      phone: phone || null,
      email: email || null,
      isActive,
    };

    try {
      if (isEditMode && currentClient) {
        await clientService.updateClient(currentClient.id, clientData);
      } else {
        await clientService.createClient(clientData);
      }
      handleCloseDialog();
      fetchClients();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar cliente.');
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea desactivar este cliente?')) {
      try {
        await clientService.deleteClient(id); // Soft delete
        fetchClients();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al desactivar cliente.');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Clientes
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpenCreateDialog} sx={{ mb: 2 }}>
        Crear Nuevo Cliente
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === 'id' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'id'}
                  direction={orderBy === 'id' ? order : 'asc'}
                  onClick={() => handleRequestSort('id')}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'name' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                >
                  Nombre
                </TableSortLabel>
              </TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Email</TableCell>
              <TableCell sortDirection={orderBy === 'isActive' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'isActive'}
                  direction={orderBy === 'isActive' ? order : 'asc'}
                  onClick={() => handleRequestSort('isActive')}
                >
                  Activo
                </TableSortLabel>
              </TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.id}</TableCell>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.address}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.isActive ? 'Sí' : 'No'}</TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => handleOpenEditDialog(client)}>
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={() => handleDeleteClient(client.id)}
                    disabled={!client.isActive}
                  >
                    Desactivar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalClients}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isEditMode ? 'Editar Cliente' : 'Crear Nuevo Cliente'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Nombre"
            type="text"
            fullWidth
            variant="standard"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            id="address"
            label="Dirección"
            type="text"
            fullWidth
            variant="standard"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <TextField
            margin="dense"
            id="phone"
            label="Teléfono"
            type="text"
            fullWidth
            variant="standard"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            margin="dense"
            id="email"
            label="Correo Electrónico"
            type="email"
            fullWidth
            variant="standard"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                name="isActive"
                color="primary"
              />
            }
            label="Activo"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit}>{isEditMode ? 'Guardar Cambios' : 'Crear Cliente'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClientsPage;