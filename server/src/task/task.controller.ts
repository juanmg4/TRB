import { Request, Response } from 'express';
import prisma from '../utils/db';

export const createTask = async (req: Request, res: Response) => {
  const { projectId, name, description } = req.body;

  if (!projectId || !name) {
    return res.status(400).json({ message: 'El ID del proyecto y el nombre de la tarea son requeridos.' });
  }

  try {
    const newTask = await prisma.task.create({
      data: {
        projectId: parseInt(projectId),
        name,
        description,
      },
    });
    res.status(201).json({ message: 'Tarea creada exitosamente.', task: newTask });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return res.status(409).json({ message: 'Ya existe una tarea con este nombre para este proyecto.' });
    }
    console.error('Error al crear tarea:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear tarea.' });
  }
};

export const getTasksByProjectId = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: parseInt(projectId),
      },
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error al obtener tareas por ID de proyecto:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
    });
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error('Error al obtener tarea por ID:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        name: name || undefined,
        description: description || undefined,
      },
    });
    res.status(200).json({ message: 'Tarea actualizada exitosamente.', task: updatedTask });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return res.status(409).json({ message: 'Ya existe una tarea con este nombre para este proyecto.' });
    }
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar tarea.' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.task.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ message: 'Tarea eliminada exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ message: 'Error interno del servidor al eliminar tarea.' });
  }
};

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await prisma.task.findMany();
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error al obtener todas las tareas:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
