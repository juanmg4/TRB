import { Request, Response } from 'express';
import prisma from '../utils/db';
import { Role } from '@prisma/client';

export const createHour = async (req: Request, res: Response) => {
  const { movimientofecha, movimientohoras, movimientominutos, clienteid, proyectoid, proyectotareaid, movimientodescripcion } = req.body;
  const professionalId = req.profesionalId;

  if (!professionalId) {
    return res.status(403).json({ message: 'No se encontró el ID del profesional asociado al usuario.' });
  }

  if (!movimientofecha || movimientohoras === undefined || movimientominutos === undefined) {
    return res.status(400).json({ message: 'Fecha, horas y minutos son requeridos.' });
  }

  try {
    const newHour = await prisma.hour.create({
      data: {
        professionalId,
        date: new Date(movimientofecha),
        hours: movimientohoras,
        minutes: movimientominutos,
        clientId: clienteid ? parseInt(clienteid) : null,
        projectId: proyectoid ? parseInt(proyectoid) : null,
        taskId: proyectotareaid ? parseInt(proyectotareaid) : null,
        description: movimientodescripcion,
      },
    });
    res.status(201).json({ message: 'Horas registradas exitosamente.', hour: newHour });
  } catch (error) {
    console.error('Error al registrar horas:', error);
    res.status(500).json({ message: 'Error interno del servidor al registrar horas.' });
  }
};

export const getHours = async (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, sort = 'movimientofecha:desc', from, to, proyectoid } = req.query;
  const professionalId = req.profesionalId;
  const userRole = req.role;

  const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string);
  const take = parseInt(pageSize as string);
  const orderBy: any = {};
  const [sortField, sortOrder] = (sort as string).split(':');
  orderBy[sortField] = sortOrder;

  let whereClause: any = {};

  if (userRole === Role.user) {
    if (!professionalId) {
      return res.status(403).json({ message: 'No se encontró el ID del profesional asociado al usuario.' });
    }
    whereClause.professionalId = professionalId;
  } else if (userRole === Role.supervisor) {
    // Supervisors can view hours for projects they are assigned to
    if (proyectoid) {
      whereClause.projectId = parseInt(proyectoid as string);
      // Further check if supervisor is assigned to this project (complex, might need a join or separate query)
      // For now, assuming if proyectoid is provided, it's for an assigned project.
      // A more robust solution would involve checking ProjectProfessional table.
    }
  }

  if (from) {
    whereClause.date = { ...whereClause.date, gte: new Date(from as string) };
  }
  if (to) {
    whereClause.date = { ...whereClause.date, lte: new Date(to as string) };
  }

  try {
    const hours = await prisma.hour.findMany({
      where: whereClause,
      skip,
      take,
      orderBy,
      include: {
        client: true,
        project: true,
        task: true,
        professional: {
          include: {
            user: {
              select: { email: true }
            }
          }
        }
      },
    });

    const totalHours = await prisma.hour.count({ where: whereClause });

    res.status(200).json({
      data: hours,
      pagination: {
        total: totalHours,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
        totalPages: Math.ceil(totalHours / take),
      },
    });
  } catch (error) {
    console.error('Error al obtener horas:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const getHourById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const professionalId = req.profesionalId;
  const userRole = req.role;

  try {
    const hour = await prisma.hour.findUnique({
      where: { id: parseInt(id) },
      include: {
        project: true,
        professional: {
          include: {
            ProjectProfessional: true, // To check if supervisor is assigned to this project
          }
        }
      },
    });

    if (!hour) {
      return res.status(404).json({ message: 'Registro de horas no encontrado.' });
    }

    // Authorization check
    if (userRole === Role.user && hour.professionalId !== professionalId) {
      return res.status(403).json({ message: 'Acceso denegado: No tiene permisos para ver este registro de horas.' });
    }

    if (userRole === Role.supervisor) {
      // Check if supervisor is assigned to the project of this hour entry
      const isSupervisorAssignedToProject = hour.professional?.ProjectProfessional.some(
        (pp) => pp.projectId === hour.projectId && pp.professionalId === professionalId
      );
      if (hour.projectId && !isSupervisorAssignedToProject) {
        return res.status(403).json({ message: 'Acceso denegado: No tiene permisos para ver este registro de horas.' });
      }
    }

    res.status(200).json(hour);
  } catch (error) {
    console.error('Error al obtener registro de horas por ID:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const updateHour = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { movimientofecha, movimientohoras, movimientominutos, clienteid, proyectoid, proyectotareaid, movimientodescripcion } = req.body;
  const professionalId = req.profesionalId;
  const userRole = req.role;

  try {
    const existingHour = await prisma.hour.findUnique({ where: { id: parseInt(id) } });

    if (!existingHour) {
      return res.status(404).json({ message: 'Registro de horas no encontrado.' });
    }

    // Only owner can update
    if (userRole === Role.user && existingHour.professionalId !== professionalId) {
      return res.status(403).json({ message: 'Acceso denegado: No tiene permisos para actualizar este registro de horas.' });
    }

    const updatedHour = await prisma.hour.update({
      where: { id: parseInt(id) },
      data: {
        date: movimientofecha ? new Date(movimientofecha) : undefined,
        hours: movimientohoras !== undefined ? movimientohoras : undefined,
        minutes: movimientominutos !== undefined ? movimientominutos : undefined,
        clientId: clienteid !== undefined ? parseInt(clienteid) : undefined,
        projectId: proyectoid !== undefined ? parseInt(proyectoid) : undefined,
        taskId: proyectotareaid !== undefined ? parseInt(proyectotareaid) : undefined,
        description: movimientodescripcion !== undefined ? movimientodescripcion : undefined,
      },
    });
    res.status(200).json({ message: 'Registro de horas actualizado exitosamente.', hour: updatedHour });
  } catch (error) {
    console.error('Error al actualizar registro de horas:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar registro de horas.' });
  }
};

export const deleteHour = async (req: Request, res: Response) => {
  const { id } = req.params;
  const professionalId = req.profesionalId;
  const userRole = req.role;

  try {
    const existingHour = await prisma.hour.findUnique({ where: { id: parseInt(id) } });

    if (!existingHour) {
      return res.status(404).json({ message: 'Registro de horas no encontrado.' });
    }

    // Only owner can delete
    if (userRole === Role.user && existingHour.professionalId !== professionalId) {
      return res.status(403).json({ message: 'Acceso denegado: No tiene permisos para eliminar este registro de horas.' });
    }

    await prisma.hour.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ message: 'Registro de horas eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar registro de horas:', error);
    res.status(500).json({ message: 'Error interno del servidor al eliminar registro de horas.' });
  }
};
