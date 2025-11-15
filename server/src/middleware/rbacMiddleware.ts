import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

export const authorizeRoles = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.role || !roles.includes(req.role)) {
      return res.status(403).json({ message: 'Acceso denegado: No tiene los permisos necesarios.' });
    }
    next();
  };
};
