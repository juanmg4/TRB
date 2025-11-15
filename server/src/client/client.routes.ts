import { Router } from 'express';
import { createClient, getClients, getClientById, updateClient, deleteClient } from './client.controller';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/rbacMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// All client routes require supervisor or admin role
router.post('/', authenticateToken, authorizeRoles([Role.admin, Role.supervisor]), createClient);
router.get('/', authenticateToken, authorizeRoles([Role.admin, Role.supervisor]), getClients);
router.get('/:id', authenticateToken, authorizeRoles([Role.admin, Role.supervisor]), getClientById);
router.put('/:id', authenticateToken, authorizeRoles([Role.admin, Role.supervisor]), updateClient);
router.delete('/:id', authenticateToken, authorizeRoles([Role.admin, Role.supervisor]), deleteClient); // Soft delete

export default router;
