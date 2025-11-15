import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/db';
import { Role } from '@prisma/client';

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');

export const createUser = async (req: Request, res: Response) => {
  const { email, password, role, isActive, profesional } = req.body;

  if (!email || !password || !role || !profesional) {
    return res.status(400).json({ message: 'Todos los campos requeridos deben ser proporcionados.' });
  }

  if (role === Role.admin && req.role !== Role.admin) {
    return res.status(403).json({ message: 'Solo un administrador puede crear otros administradores.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        isActive: isActive !== undefined ? isActive : true,
        Profesional: {
          create: {
            firstName: profesional.firstName,
            lastName: profesional.lastName,
            phone: profesional.phone,
            address: profesional.address,
            isActive: profesional.isActive !== undefined ? profesional.isActive : true,
          },
        },
      },
      include: {
        Profesional: true,
      },
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente.',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        profesional: newUser.Profesional,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
    }
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear usuario.' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, sort = 'createdAt:desc' } = req.query;

  const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string);
  const take = parseInt(pageSize as string);

  const orderBy: any = {};
  const [sortField, sortOrder] = (sort as string).split(':');
  orderBy[sortField] = sortOrder; // e.g., { createdAt: 'desc' }

  try {
    const users = await prisma.user.findMany({
      skip,
      take,
      orderBy,
      include: { Profesional: true },
      where: {
        isActive: true, // Only show active users by default
      }
    });

    const totalUsers = await prisma.user.count({
      where: {
        isActive: true,
      },
    });

    res.status(200).json({
      data: users,
      pagination: {
        total: totalUsers,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
        totalPages: Math.ceil(totalUsers / take),
      },
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: { Profesional: true },
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, role, isActive, profesional } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!existingUser) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Admin cannot change other admins' roles
    if (existingUser.role === Role.admin && role !== Role.admin && req.role === Role.admin) {
      return res.status(403).json({ message: 'Un administrador no puede cambiar el rol de otro administrador.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        email: email || existingUser.email,
        role: role || existingUser.role,
        isActive: isActive !== undefined ? isActive : existingUser.isActive,
        Profesional: profesional ? {
          update: {
            firstName: profesional.firstName || undefined,
            lastName: profesional.lastName || undefined,
            phone: profesional.phone || undefined,
            address: profesional.address || undefined,
            isActive: profesional.isActive !== undefined ? profesional.isActive : undefined,
          },
        } : undefined,
      },
      include: { Profesional: true },
    });

    res.status(200).json({
      message: 'Usuario actualizado exitosamente.',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        profesional: updatedUser.Profesional,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
    }
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar usuario.' });
  }
};

export const deactivateUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const existingUser = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!existingUser) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Admin cannot deactivate other admins
    if (existingUser.role === Role.admin && req.role === Role.admin) {
      return res.status(403).json({ message: 'Un administrador no puede desactivar a otro administrador.' });
    }

    // Deactivate user
    const deactivatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    // Revoke all refresh tokens for the deactivated user
    await prisma.refreshToken.updateMany({
      where: { userId: parseInt(id), isRevoked: false },
      data: { isRevoked: true },
    });

    res.status(200).json({ message: 'Usuario desactivado y tokens revocados exitosamente.', user: deactivatedUser });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor al desactivar usuario.' });
  }
};
