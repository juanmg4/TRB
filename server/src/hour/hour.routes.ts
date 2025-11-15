import { Router } from 'express';
import { createHour, getHours, getHourById, updateHour, deleteHour } from './hour.controller';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/rbacMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// User can create, view, edit, delete their own hours
router.post('/', authenticateToken, authorizeRoles([Role.user, Role.supervisor, Role.admin]), createHour);
router.get('/', authenticateToken, authorizeRoles([Role.user, Role.supervisor, Role.admin]), getHours);
router.get('/:id', authenticateToken, authorizeRoles([Role.user, Role.supervisor, Role.admin]), getHourById);
router.put('/:id', authenticateToken, authorizeRoles([Role.user, Role.supervisor, Role.admin]), updateHour);
router.delete('/:id', authenticateToken, authorizeRoles([Role.user, Role.supervisor, Role.admin]), deleteHour); // Hard delete

export default router;
