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
  FormControl, // Added
  InputLabel, // Added
  Select, // Added
  MenuItem, // Added
  SelectChangeEvent, // Added
} from '@mui/material';
import { useParams } from 'react-router-dom';
import taskService from '../api/task.service';
import projectService from '../api/project.service'; // Import project service

interface Task {
  id: number;
  projectId: number;
  name: string;
  description: string | null;
}

interface Project { // Define Project interface
  id: number;
  name: string;
}

const TasksPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]); // New state for projects
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>(''); // New state for selected project in form

  useEffect(() => {
    fetchProjectsList(); // Fetch projects for the dropdown
    if (projectId) {
      const parsedProjectId = parseInt(projectId);
      if (isNaN(parsedProjectId)) {
        setError('ID de proyecto inválido en la URL.');
        setLoading(false);
      } else {
        fetchTasks(parsedProjectId);
      }
    } else {
      fetchAllTasks(); // Fetch all tasks if no projectId is provided
    }
  }, [projectId]);

  const fetchProjectsList = async () => {
    try {
      const response = await projectService.getProjects(1, 9999, 'name:asc'); // Fetch all projects
      setProjectsList(response.data);
    } catch (err: any) {
      console.error('Error al cargar la lista de proyectos:', err);
      // Optionally set an error state for projects list
    }
  };

  const fetchTasks = async (projId: number) => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const data = await taskService.getTasksByProjectId(projId);
      setTasks(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar tareas.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTasks = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const data = await taskService.getAllTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar todas las tareas.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setIsEditMode(false);
    setCurrentTask(null);
    setName('');
    setDescription('');
    setSelectedProjectId(projectId && !isNaN(parseInt(projectId)) ? parseInt(projectId) : ''); // Set default project if in project-specific view
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (task: Task) => {
    setIsEditMode(true);
    setCurrentTask(task);
    setName(task.name);
    setDescription(task.description || '');
    setSelectedProjectId(task.projectId); // Set selected project for editing
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!selectedProjectId) {
      setError('Debe seleccionar un proyecto para la tarea.');
      return;
    }

    const taskData = {
      projectId: selectedProjectId as number, // Use selectedProjectId from form
      name,
      description: description || null,
    };

    try {
      if (isEditMode && currentTask) {
        await taskService.updateTask(currentTask.id, taskData);
      } else {
        await taskService.createTask(selectedProjectId as number, taskData); // Use selectedProjectId for creation
      }
      handleCloseDialog();
      if (projectId) { // Refresh based on current view
        fetchTasks(parseInt(projectId));
      } else {
        fetchAllTasks();
      }
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
        } else {
          fetchAllTasks(); // Refresh all tasks if no projectId is present
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
        {error ? 'Error' : (projectId && !isNaN(parseInt(projectId)) ? `Tareas del Proyecto ${projectId}` : 'Todas las Tareas')}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenCreateDialog}
        sx={{ mb: 2 }}
      >
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
          <FormControl fullWidth margin="dense" variant="standard" required>
            <InputLabel id="project-label">Proyecto</InputLabel>
            <Select
              labelId="project-label"
              id="selectedProjectId"
              value={selectedProjectId}
              label="Proyecto"
              onChange={(e: SelectChangeEvent<number>) => setSelectedProjectId(e.target.value as number)}
            >
              <MenuItem value="">
                <em>Seleccione un proyecto</em>
              </MenuItem>
              {projectsList.map((proj) => (
                <MenuItem key={proj.id} value={proj.id}>
                  {proj.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
