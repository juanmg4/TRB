import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './auth/auth.routes';
import userRoutes from './user/user.routes';
import profesionalRoutes from './profesional/profesional.routes';
import clientRoutes from './client/client.routes';
import projectRoutes from './project/project.routes';
import taskRoutes from './task/task.routes';
import assignmentRoutes from './assignment/assignment.routes';
import hourRoutes from './hour/hour.routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allow these methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
}));
app.use(express.json());

app.use('/api', taskRoutes); // Mount taskRoutes directly under /api
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profesionales', profesionalRoutes);
app.use('/api/clientes', clientRoutes);
app.use('/api/proyectos', projectRoutes);
app.use('/api/proyectos', assignmentRoutes); // Assignment routes are nested under projects
app.use('/api/horas', hourRoutes);

app.get('/', (req, res) => {
  res.send('TRB Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
