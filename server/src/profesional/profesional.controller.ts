import { Request, Response } from 'express';
import prisma from '../utils/db';
import { Role } from '@prisma/client';

export const getProfesionales = async (req: Request, res: Response) => {
  // Implement pagination and filters later
  try {
    const profesionales = await prisma.profesional.findMany({
      where: {
        isActive: true,
      },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });
    res.status(200).json(profesionales);
  } catch (error) {
    console.error('Error al obtener profesionales:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const getProfesionalById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const profesional = await prisma.profesional.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });
    if (!profesional) {
      return res.status(404).json({ message: 'Profesional no encontrado.' });
    }

    // Users can only view their own profile
    if (req.role === Role.user && req.profesionalId !== profesional.id) {
      return res.status(403).json({ message: 'Acceso denegado: No tiene permisos para ver este perfil.' });
    }

    res.status(200).json(profesional);
  } catch (error) {
    console.error('Error al obtener profesional por ID:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const updateProfesional = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { firstName, lastName, phone, address, isActive } = req.body;

  try {
    const existingProfesional = await prisma.profesional.findUnique({ where: { id: parseInt(id) } });
    if (!existingProfesional) {
      return res.status(404).json({ message: 'Profesional no encontrado.' });
    }

    // Users can only update their own profile
    if (req.role === Role.user && req.profesionalId !== existingProfesional.id) {
      return res.status(403).json({ message: 'Acceso denegado: No tiene permisos para actualizar este perfil.' });
    }

    const updatedProfesional = await prisma.profesional.update({
      where: { id: parseInt(id) },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        address: address || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(200).json({
      message: 'Profesional actualizado exitosamente.',
      profesional: updatedProfesional,
    });
  } catch (error) {
    console.error('Error al actualizar profesional:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar profesional.' });
  }
};
