import { Router } from 'express';
import { getProfesionales, getProfesionalById, updateProfesional } from './profesional.controller';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/rbacMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticateToken, authorizeRoles([Role.admin, Role.supervisor]), getProfesionales);
router.get('/:id', authenticateToken, getProfesionalById); // Logic for user to view own profile is in controller
router.put('/:id', authenticateToken, updateProfesional); // Logic for user to update own profile is in controller

export default router;
