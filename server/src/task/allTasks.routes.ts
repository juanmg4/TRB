import { Router } from 'express';
import { getAllTasks } from './task.controller';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/rbacMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticateToken, authorizeRoles([Role.admin, Role.supervisor]), getAllTasks);

export default router;
