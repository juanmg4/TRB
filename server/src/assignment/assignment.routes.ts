import { Router } from 'express';
import { assignProfessionalToProject, unassignProfessionalFromProject } from './assignment.controller';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/rbacMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// All assignment routes require supervisor or admin role
router.post('/:projectId/assign', authenticateToken, authorizeRoles([Role.admin, Role.supervisor]), assignProfessionalToProject);
router.delete('/:projectId/assign/:projectProfessionalId', authenticateToken, authorizeRoles([Role.admin, Role.supervisor]), unassignProfessionalFromProject);

export default router;
