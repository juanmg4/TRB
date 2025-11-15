import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Import Navigate
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import UsersPage from './pages/UsersPage';
import ClientsPage from './pages/ClientsPage';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage from './pages/TasksPage';
import ProfilePage from './pages/ProfilePage';
import HoursPage from './pages/HoursPage'; // New import

import { Role } from './types/types'; // Import Role enum

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}> {/* MainLayout wraps all authenticated content */}
              <Route path="/" element={<Navigate to="/Dashboard" replace />} /> {/* Redirect root to /Dashboard */}
              <Route path="/Dashboard" element={<DashboardPage />} /> {/* New route for Dashboard */}
              {/* UsersPage requires admin role */}
              <Route path="/usuarios" element={<UsersPage />} />
              {/* ClientsPage requires admin or supervisor role */}
              <Route path="/clientes" element={<ClientsPage />} />
              {/* ProjectsPage requires admin or supervisor role */}
              <Route path="/proyectos" element={<ProjectsPage />} />
              {/* TasksPage requires admin or supervisor role */}
              <Route path="/tareas" element={<TasksPage />} /> {/* New route for all tasks */}
              <Route path="/proyectos/:projectId/tareas" element={<TasksPage />} />
              {/* ProfilePage is accessible by all authenticated roles */}
              <Route path="/perfil" element={<ProfilePage />} />
              {/* HoursPage is accessible by all authenticated roles */}
              <Route path="/horas" element={<HoursPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
