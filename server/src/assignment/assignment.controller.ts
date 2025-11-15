import { Request, Response } from 'express';
import prisma from '../utils/db';

export const assignProfessionalToProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { professionalId, taskId } = req.body;

  if (!professionalId) {
    return res.status(400).json({ message: 'El ID del profesional es requerido.' });
  }

  try {
    const assignment = await prisma.projectProfessional.create({
      data: {
        projectId: parseInt(projectId),
        professionalId: parseInt(professionalId),
        taskId: taskId ? parseInt(taskId) : null,
      },
    });
    res.status(201).json({ message: 'Profesional asignado exitosamente al proyecto.', assignment });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'El profesional ya está asignado a este proyecto/tarea.' });
    }
    console.error('Error al asignar profesional:', error);
    res.status(500).json({ message: 'Error interno del servidor al asignar profesional.' });
  }
};

export const unassignProfessionalFromProject = async (req: Request, res: Response) => {
  const { projectId, projectProfessionalId } = req.params;

  try {
    await prisma.projectProfessional.delete({
      where: {
        id: parseInt(projectProfessionalId),
        projectId: parseInt(projectId),
      },
    });
    res.status(200).json({ message: 'Profesional desasignado exitosamente del proyecto.' });
  } catch (error) {
    console.error('Error al desasignar profesional:', error);
    res.status(500).json({ message: 'Error interno del servidor al desasignar profesional.' });
  }
};
