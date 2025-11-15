import { Router } from 'express';
import { login, refreshToken, logout } from './auth.controller';

const router = Router();

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;
