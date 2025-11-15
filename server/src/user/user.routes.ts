import { Router } from 'express';
import { createUser, getUsers, getUserById, updateUser, deactivateUser } from './user.controller';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/rbacMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// Admin only routes
router.post('/', authenticateToken, authorizeRoles([Role.admin]), createUser);
router.get('/', authenticateToken, authorizeRoles([Role.admin]), getUsers);
router.get('/:id', authenticateToken, authorizeRoles([Role.admin]), getUserById);
router.put('/:id', authenticateToken, authorizeRoles([Role.admin]), updateUser);
router.patch('/:id/deactivate', authenticateToken, authorizeRoles([Role.admin]), deactivateUser);

export default router;
