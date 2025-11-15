import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  AccessTime,
  Work,
  CheckCircleOutline,
  HighlightOff,
} from '@mui/icons-material';

interface MisHoras {
  totalACargar: number;
  cargadas: number;
  faltaCargar: number;
}

interface Proyectos {
  total: number;
  activos: number;
  inactivos: number;
}

interface ProyectoActivo {
  cliente: string;
  proyecto: string;
  depto: string;
  hsContr: number;
  hsCarg: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card sx={{ backgroundColor: color }}>
    <CardContent>
      <Grid container spacing={2} alignItems="center">
        <Grid item>{icon}</Grid>
        <Grid item xs>
          <Typography sx={{ color: 'text.secondary' }} gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const DashboardPage: React.FC = () => {
  const navigate = useNavigate(); // Add this line
  const [selectedMonth, setSelectedMonth] = useState('Noviembre');
  const [selectedYear, setSelectedYear] = useState('2025');
  // Dummy data - to be replaced with actual data from services
  const misHoras: MisHoras = {
    totalACargar: 120,
    cargadas: 108,
    faltaCargar: 12,
  };

  const proyectos: Proyectos = {
    total: 21,
    activos: 13,
    inactivos: 8,
  };

  const proyectosActivos: ProyectoActivo[] = [
    { cliente: 'Intersoft', proyecto: 'Capacitación', depto: 'Calidad', hsContr: 0, hsCarg: '20292.88' },
    { cliente: 'Intersoft', proyecto: 'Ausencias justificadas', depto: 'Administración', hsContr: 0, hsCarg: '14386.03' },
    { cliente: 'Intersoft', proyecto: 'TRB - Sistema de control de Horas', depto: 'Software Factory', hsContr: 0, hsCarg: '1319.33' },
    { cliente: 'Intersoft', proyecto: 'RD SaaS', depto: 'Servicios', hsContr: 0, hsCarg: '4009.85' },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Mis Horas Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              MIS HORAS
            </Typography>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={2}>
                <TextField
                  select
                  label="Mes"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="Noviembre">Noviembre</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField select label="Año" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} fullWidth>
                  <MenuItem value="2025">2025</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={8} />

              <Grid item xs={12} md={4}>
                <StatCard
                  title="TOTAL A CARGAR"
                  value={misHoras.totalACargar}
                  icon={<AccessTime fontSize="large" />}
                  color="#f0e68c"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StatCard
                  title="CARGADAS"
                  value={misHoras.cargadas}
                  icon={<AccessTime fontSize="large" />}
                  color="#ffd700"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StatCard
                  title="FALTA CARGAR"
                  value={misHoras.faltaCargar}
                  icon={<AccessTime fontSize="large" />}
                  color="#ffA500"
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" onClick={() => navigate('/hours')}>Cargar horas faltantes</Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Proyectos Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <StatCard
                  title="PROYECTOS"
                  value={proyectos.total}
                  icon={<Work fontSize="large" />}
                  color="#00bcd4"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StatCard
                  title="ACTIVOS"
                  value={proyectos.activos}
                  icon={<CheckCircleOutline fontSize="large" />}
                  color="#4caf50"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StatCard
                  title="INACTIVOS"
                  value={proyectos.inactivos}
                  icon={<HighlightOff fontSize="large" />}
                  color="#9e9e9e"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Tables Section */}
        <Grid item xs={12} md={7}>
          <TableContainer component={Paper}>
            <Typography variant="h6" sx={{ p: 2 }}>PROYECTOS ACTIVOS</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Proyecto</TableCell>
                  <TableCell>Depto.</TableCell>
                  <TableCell>HsContr</TableCell>
                  <TableCell>HsCarg</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proyectosActivos.map((row) => (
                  <TableRow key={row.proyecto}>
                    <TableCell>{row.cliente}</TableCell>
                    <TableCell>{row.proyecto}</TableCell>
                    <TableCell>{row.depto}</TableCell>
                    <TableCell>{row.hsContr}</TableCell>
                    <TableCell>{row.hsCarg}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12} md={5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">HORAS POR PROFESIONALES</Typography>
                {/* Placeholder */}
                <Box sx={{ mt: 2 }}>Datos de horas por profesionales...</Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">MOVIMIENTOS POR PROFESIONAL</Typography>
                {/* Placeholder */}
                <Box sx={{ mt: 2 }}>Datos de movimientos por profesional...</Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;