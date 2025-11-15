import { Router } from 'express';
import { createProject, getProjects, getProjectById, updateProject, deleteProject } from './project.controller';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/rbacMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// All project routes require supervisor or admin role
router.post('/', authenticateToken, authorizeRoles([Role.admin, Role.supervisor]), createProject);
router.get('/', authenticateToken, authorizeRoles([Role.admin, Role.supervisor]), getProjects);
router.get('/:id', authenticateToken, authorizeRoles([Role.admin, Role.supervisor]), getProjectById);
router.put('/:id', authenticateToken, authorizeRoles([Role.admin, Role.supervisor]), updateProject);
router.delete('/:id', authenticateToken, authorizeRoles([Role.admin, Role.supervisor]), deleteProject); // Soft delete

export default router;
