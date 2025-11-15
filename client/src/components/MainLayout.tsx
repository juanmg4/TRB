import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  CssBaseline,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Outlet } from 'react-router-dom';
import { Role } from '../types/types';

const drawerWidth = 240;

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getNavLinks = () => {
    const links = [
      { text: 'Dashboard', path: '/', roles: [Role.user, Role.supervisor, Role.admin] }, // Added Dashboard link
      { text: 'Mis Horas', path: '/horas', roles: [Role.user, Role.supervisor, Role.admin] },
      { text: 'Clientes', path: '/clientes', roles: [Role.supervisor, Role.admin] },
      { text: 'Proyectos', path: '/proyectos', roles: [Role.supervisor, Role.admin] },
      { text: 'Tareas', path: '/proyectos/1/tareas', roles: [Role.supervisor, Role.admin] }, // Placeholder projectId
      { text: 'Usuarios', path: '/usuarios', roles: [Role.admin] },
      { text: 'Mi Perfil', path: '/perfil', roles: [Role.user, Role.supervisor, Role.admin] },
    ];

    return links.filter(link => user && link.roles.includes(user.role));
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        TRB App
      </Typography>
      <List>
        {getNavLinks().map((link) => (
          <ListItem key={link.text} disablePadding>
            <ListItemText primary={link.text} onClick={() => navigate(link.path)} sx={{ cursor: 'pointer', px: 2, py: 1 }} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: '#F7931E', // Vibrant orange top bar
        }}
      >
        <Toolbar>

          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            TRB - {window.location.pathname.substring(1).split('/')[0] || 'Dashboard'}
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Bienvenido, {user?.email} ({user?.role})
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of the drawer. */}

        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar /> {/* This is to offset the AppBar */}
        <Outlet /> {/* This is where child routes will render */}
      </Box>
    </Box>
  );
};

export default MainLayout;
