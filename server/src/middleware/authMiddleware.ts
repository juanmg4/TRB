import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

// Extend the Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      email?: string;
      role?: Role;
      profesionalId?: number | null;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ message: 'Token de autenticación requerido.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Token de autenticación inválido o expirado.' });
    }
    req.userId = user.userId;
    req.email = user.email;
    req.role = user.role;
    req.profesionalId = user.profesionalId;
    next();
  });
};
