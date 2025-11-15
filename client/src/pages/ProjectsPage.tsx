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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination, // New import
  TableSortLabel, // New import
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import projectService from '../api/project.service';
import clientService from '../api/client.service'; // To fetch clients for dropdown

interface Client {
  id: number;
  name: string;
}

interface Project {
  id: number;
  clientId: number;
  client: Client;
  name: string;
  description: string | null;
  isActive: boolean;
}

type Order = 'asc' | 'desc';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Pagination and Sorting states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof Project>('id');
  const [order, setOrder] = useState<Order>('asc');
  const [totalProjects, setTotalProjects] = useState(0);

  // Form states
  const [clientId, setClientId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, orderBy, order]); // Re-fetch when pagination/sorting changes

  const fetchData = async () => {
    try {
      setLoading(true);
      const sortString = `${orderBy}:${order}`;
      const [projectsResponse, clientsData] = await Promise.all([
        projectService.getProjects(page + 1, rowsPerPage, sortString),
        clientService.getClients(1, 9999, 'name:asc'), // Fetch all clients for dropdown
      ]);
      setProjects(projectsResponse.data);
      setTotalProjects(projectsResponse.pagination.total);
      setClients(clientsData.data); // Assuming clientsData is also paginated
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSort = (property: keyof Project) => {
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
    setCurrentProject(null);
    setClientId('');
    setName('');
    setDescription('');
    setIsActive(true);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (project: Project) => {
    setIsEditMode(true);
    setCurrentProject(project);
    setClientId(project.clientId);
    setName(project.name);
    setDescription(project.description || '');
    setIsActive(project.isActive);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!clientId) {
      setError('Debe seleccionar un cliente.');
      return;
    }

    const projectData = {
      clientId: clientId as number,
      name,
      description: description || null,
      isActive,
    };

    try {
      if (isEditMode && currentProject) {
        await projectService.updateProject(currentProject.id, projectData);
      } else {
        await projectService.createProject(projectData);
      }
      handleCloseDialog();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar proyecto.');
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea desactivar este proyecto?')) {
      try {
        await projectService.deleteProject(id); // Soft delete
        fetchData();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al desactivar proyecto.');
      }
    }
  };

  const handleViewTasks = (projectId: number) => {
    navigate(`/proyectos/${projectId}/tareas`);
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
        Gestión de Proyectos
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpenCreateDialog} sx={{ mb: 2 }}>
        Crear Nuevo Proyecto
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
              <TableCell>Cliente</TableCell> {/* No direct sorting for nested fields */}
              <TableCell sortDirection={orderBy === 'name' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                >
                  Nombre
                </TableSortLabel>
              </TableCell>
              <TableCell>Descripción</TableCell>
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
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.id}</TableCell>
                <TableCell>{project.client?.name}</TableCell>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.description}</TableCell>
                <TableCell>{project.isActive ? 'Sí' : 'No'}</TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => handleOpenEditDialog(project)}>
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={() => handleDeleteProject(project.id)}
                    disabled={!project.isActive}
                  >
                    Desactivar
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={() => handleViewTasks(project.id)}
                  >
                    Ver Tareas
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
        count={totalProjects}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isEditMode ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <FormControl fullWidth margin="dense" variant="standard" required>
            <InputLabel id="client-label">Cliente</InputLabel>
            <Select
              labelId="client-label"
              id="clientId"
              value={clientId}
              label="Cliente"
              onChange={(e) => setClientId(e.target.value as number)}
            >
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Nombre del Proyecto"
            type="text"
            fullWidth
            variant="standard"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            id="description"
            label="Descripción"
            type="text"
            fullWidth
            variant="standard"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
          <Button onClick={handleSubmit}>{isEditMode ? 'Guardar Cambios' : 'Crear Proyecto'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectsPage;