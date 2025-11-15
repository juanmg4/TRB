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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Switch,
  FormControlLabel,
  TablePagination, // New import
  TableSortLabel, // New import
} from '@mui/material';
import userService from '../api/user.service';
import { Role } from '../types/types';

interface User {
  id: number;
  email: string;
  role: Role;
  isActive: boolean;
  profesional: {
    id: number;
    firstName: string;
    lastName: string;
    phone: string | null;
    address: string | null;
    isActive: boolean;
  } | null;
}

type Order = 'asc' | 'desc';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Pagination and Sorting states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof User>('id');
  const [order, setOrder] = useState<Order>('asc');
  const [totalUsers, setTotalUsers] = useState(0);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.user);
  const [isActive, setIsActive] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, orderBy, order]); // Re-fetch when pagination/sorting changes

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const sortString = `${orderBy}:${order}`;
      const response = await userService.getUsers(page + 1, rowsPerPage, sortString); // Backend expects 1-indexed page
      setUsers(response.data);
      setTotalUsers(response.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSort = (property: keyof User) => {
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
    setCurrentUser(null);
    setEmail('');
    setPassword('');
    setRole(Role.user);
    setIsActive(true);
    setFirstName('');
    setLastName('');
    setPhone('');
    setAddress('');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (user: User) => {
    setIsEditMode(true);
    setCurrentUser(user);
    setEmail(user.email);
    setRole(user.role);
    setIsActive(user.isActive);
    setFirstName(user.profesional?.firstName || '');
    setLastName(user.profesional?.lastName || '');
    setPhone(user.profesional?.phone || '');
    setAddress(user.profesional?.address || '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const userData = {
      email,
      password: isEditMode ? undefined : password, // Password only for creation
      role,
      isActive,
      profesional: {
        firstName,
        lastName,
        phone: phone || null,
        address: address || null,
        isActive: isActive, // Profesional isActive matches User isActive
      },
    };

    try {
      if (isEditMode && currentUser) {
        await userService.updateUser(currentUser.id, userData);
      } else {
        await userService.createUser(userData);
      }
      handleCloseDialog();
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar usuario.');
    }
  };

  const handleDeactivateUser = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea desactivar este usuario?')) {
      try {
        await userService.deactivateUser(id);
        fetchUsers();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al desactivar usuario.');
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
        Gestión de Usuarios
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpenCreateDialog} sx={{ mb: 2 }}>
        Crear Nuevo Usuario
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
              <TableCell sortDirection={orderBy === 'email' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'email'}
                  direction={orderBy === 'email' ? order : 'asc'}
                  onClick={() => handleRequestSort('email')}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'role' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'role'}
                  direction={orderBy === 'role' ? order : 'asc'}
                  onClick={() => handleRequestSort('role')}
                >
                  Rol
                </TableSortLabel>
              </TableCell>
              <TableCell>Nombre</TableCell> {/* No direct sorting for nested fields */}
              <TableCell>Apellido</TableCell> {/* No direct sorting for nested fields */}
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
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.profesional?.firstName}</TableCell>
                <TableCell>{user.profesional?.lastName}</TableCell>
                <TableCell>{user.isActive ? 'Sí' : 'No'}</TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => handleOpenEditDialog(user)}>
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={() => handleDeactivateUser(user.id)}
                    disabled={!user.isActive}
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
        count={totalUsers}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Correo Electrónico"
            type="email"
            fullWidth
            variant="standard"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isEditMode} // Email cannot be changed in edit mode
          />
          {!isEditMode && (
            <TextField
              margin="dense"
              id="password"
              label="Contraseña"
              type="password"
              fullWidth
              variant="standard"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}
          <FormControl fullWidth margin="dense" variant="standard">
            <InputLabel id="role-label">Rol</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              value={role}
              label="Rol"
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <MenuItem value={Role.user}>Usuario</MenuItem>
              <MenuItem value={Role.supervisor}>Supervisor</MenuItem>
              <MenuItem value={Role.admin}>Admin</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            id="firstName"
            label="Nombre"
            type="text"
            fullWidth
            variant="standard"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            id="lastName"
            label="Apellido"
            type="text"
            fullWidth
            variant="standard"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
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
            id="address"
            label="Dirección"
            type="text"
            fullWidth
            variant="standard"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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
          <Button onClick={handleSubmit}>{isEditMode ? 'Guardar Cambios' : 'Crear Usuario'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsersPage;