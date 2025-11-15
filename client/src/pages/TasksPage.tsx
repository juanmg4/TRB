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
} from '@mui/material';
import { useParams } from 'react-router-dom';
import taskService from '../api/task.service';

interface Task {
  id: number;
  projectId: number;
  name: string;
  description: string | null;
}

const TasksPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchTasks(parseInt(projectId));
    }
  }, [projectId]);

  const fetchTasks = async (projId: number) => {
    try {
      setLoading(true);
      const data = await taskService.getTasksByProjectId(projId);
      setTasks(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar tareas.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setIsEditMode(false);
    setCurrentTask(null);
    setName('');
    setDescription('');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (task: Task) => {
    setIsEditMode(true);
    setCurrentTask(task);
    setName(task.name);
    setDescription(task.description || '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!projectId) {
      setError('ID de proyecto no encontrado.');
      return;
    }

    const taskData = {
      projectId: parseInt(projectId),
      name,
      description: description || null,
    };

    try {
      if (isEditMode && currentTask) {
        await taskService.updateTask(currentTask.id, taskData);
      } else {
        await taskService.createTask(parseInt(projectId), taskData);
      }
      handleCloseDialog();
      fetchTasks(parseInt(projectId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar tarea.');
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta tarea?')) {
      try {
        await taskService.deleteTask(id); // Hard delete
        if (projectId) {
          fetchTasks(parseInt(projectId));
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al eliminar tarea.');
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
        Tareas del Proyecto {projectId}
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpenCreateDialog} sx={{ mb: 2 }}>
        Crear Nueva Tarea
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.id}</TableCell>
                <TableCell>{task.name}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => handleOpenEditDialog(task)}>
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={() => handleDeleteTask(task.id)}
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
        <DialogTitle>{isEditMode ? 'Editar Tarea' : 'Crear Nueva Tarea'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Nombre de la Tarea"
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit}>{isEditMode ? 'Guardar Cambios' : 'Crear Tarea'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TasksPage;
