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
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Role } from '../types/types';

const drawerWidth = 240;

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
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
      { text: 'Tareas', path: '/tareas', roles: [Role.supervisor, Role.admin] }, // Restored Tareas link
      { text: 'Usuarios', path: '/usuarios', roles: [Role.admin] },
      { text: 'Mi Perfil', path: '/perfil', roles: [Role.user, Role.supervisor, Role.admin] },
    ];

    return links.filter(link => user && link.roles.includes(user.role));
  };

  const getPageTitle = (pathname: string): string => {
    const navLinks = getNavLinks();

    // Sort navLinks by path length in descending order to prioritize more specific routes
    const sortedNavLinks = [...navLinks].sort((a, b) => {
      // Handle dynamic segments for sorting as well, so /proyectos/:id/tareas is considered longer than /proyectos
      const aPathSegments = a.path.split('/').filter(segment => segment !== '');
      const bPathSegments = b.path.split('/').filter(segment => segment !== '');
      return bPathSegments.length - aPathSegments.length;
    });

    // Handle root path
    if (pathname === '/') {
      return 'Dashboard';
    }

    for (const link of sortedNavLinks) {
      // Convert link.path to a regex pattern to handle dynamic segments like :projectId
      const pattern = new RegExp(`^${link.path.replace(/:[a-zA-Z0-9_]+/g, '[^/]+')}$`);
      if (pattern.test(pathname)) {
        return link.text;
      }
    }

    // Fallback if no specific match found
    const firstSegment = pathname.substring(1).split('/')[0];
    return firstSegment ? (firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1)) : 'Dashboard';
  };

  const currentTitle = getPageTitle(location.pathname);

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 2 }}>
      <img src="/intersoft_logo.png" alt="Intersoft Logo" style={{ maxWidth: '100%', height: 'auto', maxHeight: '60px' }} />
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
            {currentTitle}
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#f5f5f5' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#f5f5f5' },
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
