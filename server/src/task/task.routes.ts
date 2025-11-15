import { Router } from 'express';
import { createTask, getTasksByProjectId, getTaskById, updateTask, deleteTask, getAllTasks } from './task.controller';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/rbacMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// All task routes require supervisor or admin role
router.post('/proyectos/:projectId/tareas', authenticateToken, authorizeRoles([Role.admin, Role.supervisor]), createTask);
router.get('/proyectos/:projectId/tareas', authenticateToken, authorizeRoles([Role.admin, Role.supervisor]), getTasksByProjectId);
router.get('/tareas', authenticateToken, authorizeRoles([Role.admin, Role.supervisor]), getAllTasks); // Route to get all tasks
router.get('/tareas/:id', authenticateToken, authorizeRoles([Role.admin, Role.supervisor]), getTaskById);
router.put('/tareas/:id', authenticateToken, authorizeRoles([Role.admin, Role.supervisor]), updateTask);
router.delete('/tareas/:id', authenticateToken, authorizeRoles([Role.admin, Role.supervisor]), deleteTask);

export default router;
