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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import hourService from '../api/hour.service';
import clientService from '../api/client.service';
import projectService from '../api/project.service';
import taskService from '../api/task.service';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/types';

interface Client {
  id: number;
  name: string;
}

interface Project {
  id: number;
  name: string;
}

interface Task {
  id: number;
  name: string;
}

interface Hour {
  id: number;
  professionalId: number;
  date: string; // ISO date string
  hours: number;
  minutes: number;
  clientId: number | null;
  client?: Client;
  projectId: number | null;
  project?: Project;
  taskId: number | null;
  task?: Task;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

const HoursPage: React.FC = () => {
  const { user } = useAuth();
  const [hours, setHours] = useState<Hour[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentHour, setCurrentHour] = useState<Hour | null>(null);

  // Form states
  const [movimientofecha, setMovimientoFecha] = useState('');
  const [movimientohoras, setMovimientoHoras] = useState<number | ''>('');
  const [movimientominutos, setMovimientoMinutos] = useState<number | ''>('');
  const [clienteid, setClienteId] = useState<number | ''>('');
  const [proyectoid, setProyectoId] = useState<number | ''>('');
  const [proyectotareaid, setProyectoTareaId] = useState<number | ''>('');
  const [movimientodescripcion, setMovimientoDescripcion] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hoursData, clientsData, projectsData] = await Promise.all([
        hourService.getHours(),
        clientService.getClients(),
        projectService.getProjects(),
      ]);
      setHours(hoursData.data);
      setClients(clientsData.data);
      setProjects(projectsData.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proyectoid) {
      fetchTasksForProject(proyectoid as number);
    } else {
      setTasks([]);
      setProyectoTareaId('');
    }
  }, [proyectoid]);

  const fetchTasksForProject = async (projId: number) => {
    try {
      const tasksData = await taskService.getTasksByProjectId(projId);
      setTasks(tasksData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar tareas del proyecto.');
    }
  };

  const handleOpenCreateDialog = () => {
    setIsEditMode(false);
    setCurrentHour(null);
    setMovimientoFecha(new Date().toISOString().split('T')[0]); // Default to today
    setMovimientoHoras('');
    setMovimientoMinutos('');
    setClienteId('');
    setProyectoId('');
    setProyectoTareaId('');
    setMovimientoDescripcion('');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (hour: Hour) => {
    setIsEditMode(true);
    setCurrentHour(hour);
    setMovimientoFecha(hour.date.split('T')[0]);
    setMovimientoHoras(hour.hours);
    setMovimientoMinutos(hour.minutes);
    setClienteId(hour.clientId || '');
    setProyectoId(hour.projectId || '');
    setProyectoTareaId(hour.taskId || '');
    setMovimientoDescripcion(hour.description || '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const hourData = {
      movimientofecha,
      movimientohoras: movimientohoras === '' ? 0 : movimientohoras,
      movimientominutos: movimientominutos === '' ? 0 : movimientominutos,
      clienteid: clienteid === '' ? null : clienteid,
      proyectoid: proyectoid === '' ? null : proyectoid,
      proyectotareaid: proyectotareaid === '' ? null : proyectotareaid,
      movimientodescripcion: movimientodescripcion || null,
    };

    try {
      if (isEditMode && currentHour) {
        await hourService.updateHour(currentHour.id, hourData);
      } else {
        await hourService.createHour(hourData);
      }
      handleCloseDialog();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar registro de horas.');
    }
  };

  const handleDeleteHour = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro de horas? Esta acción es irreversible.')) {
      try {
        await hourService.deleteHour(id); // Hard delete
        fetchData();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al eliminar registro de horas.');
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
        Mis Horas
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpenCreateDialog} sx={{ mb: 2 }}>
        Registrar Horas
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Horas</TableCell>
              <TableCell>Minutos</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Proyecto</TableCell>
              <TableCell>Tarea</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hours.map((hour) => (
              <TableRow key={hour.id}>
                <TableCell>{new Date(hour.date).toLocaleDateString('es-AR')}</TableCell>
                <TableCell>{hour.hours}</TableCell>
                <TableCell>{hour.minutes}</TableCell>
                <TableCell>{hour.client?.name || 'N/A'}</TableCell>
                <TableCell>{hour.project?.name || 'N/A'}</TableCell>
                <TableCell>{hour.task?.name || 'N/A'}</TableCell>
                <TableCell>{hour.description}</TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => handleOpenEditDialog(hour)}>
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={() => handleDeleteHour(hour.id)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isEditMode ? 'Editar Registro de Horas' : 'Registrar Horas'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            id="movimientofecha"
            label="Fecha"
            type="date"
            fullWidth
            variant="standard"
            value={movimientofecha}
            onChange={(e) => setMovimientoFecha(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            margin="dense"
            id="movimientohoras"
            label="Horas"
            type="number"
            fullWidth
            variant="standard"
            value={movimientohoras}
            onChange={(e) => setMovimientoHoras(parseInt(e.target.value))}
            required
            inputProps={{ min: 0, max: 23 }}
          />
          <TextField
            margin="dense"
            id="movimientominutos"
            label="Minutos"
            type="number"
            fullWidth
            variant="standard"
            value={movimientominutos}
            onChange={(e) => setMovimientoMinutos(parseInt(e.target.value))}
            required
            inputProps={{ min: 0, max: 59 }}
          />
          <FormControl fullWidth margin="dense" variant="standard">
            <InputLabel id="cliente-label">Cliente</InputLabel>
            <Select
              labelId="cliente-label"
              id="clienteid"
              value={clienteid}
              label="Cliente"
              onChange={(e) => setClienteId(e.target.value as number)}
            >
              <MenuItem value="">
                <em>Ninguno</em>
              </MenuItem>
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" variant="standard">
            <InputLabel id="proyecto-label">Proyecto</InputLabel>
            <Select
              labelId="proyecto-label"
              id="proyectoid"
              value={proyectoid}
              label="Proyecto"
              onChange={(e) => setProyectoId(e.target.value as number)}
            >
              <MenuItem value="">
                <em>Ninguno</em>
              </MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" variant="standard" disabled={!proyectoid}>
            <InputLabel id="tarea-label">Tarea</InputLabel>
            <Select
              labelId="tarea-label"
              id="proyectotareaid"
              value={proyectotareaid}
              label="Tarea"
              onChange={(e) => setProyectoTareaId(e.target.value as number)}
            >
              <MenuItem value="">
                <em>Ninguno</em>
              </MenuItem>
              {tasks.map((task) => (
                <MenuItem key={task.id} value={task.id}>
                  {task.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            id="movimientodescripcion"
            label="Descripción"
            type="text"
            fullWidth
            variant="standard"
            value={movimientodescripcion}
            onChange={(e) => setMovimientoDescripcion(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit}>{isEditMode ? 'Guardar Cambios' : 'Registrar Horas'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HoursPage;
