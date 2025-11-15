import { Request, Response } from 'express';
import prisma from '../utils/db';

export const createProject = async (req: Request, res: Response) => {
  const { clientId, name, description } = req.body;

  if (!clientId || !name) {
    return res.status(400).json({ message: 'El ID del cliente y el nombre del proyecto son requeridos.' });
  }

  try {
    const newProject = await prisma.project.create({
      data: {
        clientId: parseInt(clientId),
        name,
        description,
      },
    });
    res.status(201).json({ message: 'Proyecto creado exitosamente.', project: newProject });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return res.status(409).json({ message: 'Ya existe un proyecto con este nombre para este cliente.' });
    }
    console.error('Error al crear proyecto:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear proyecto.' });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, sort = 'name:asc', clientId, isActive } = req.query;

  const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string);
  const take = parseInt(pageSize as string);

  const orderBy: any = {};
  const [sortField, sortOrder] = (sort as string).split(':');
  orderBy[sortField] = sortOrder; // e.g., { name: 'asc' }

  try {
    const projects = await prisma.project.findMany({
      skip,
      take,
      orderBy,
      where: {
        clientId: clientId ? parseInt(clientId as string) : undefined,
        isActive: isActive ? (isActive === 'true') : undefined,
      },
      include: {
        client: true,
      },
    });

    const totalProjects = await prisma.project.count({
      where: {
        clientId: clientId ? parseInt(clientId as string) : undefined,
        isActive: isActive ? (isActive === 'true') : undefined,
      },
    });

    res.status(200).json({
      data: projects,
      pagination: {
        total: totalProjects,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
        totalPages: Math.ceil(totalProjects / take),
      },
    });
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: { client: true, Tasks: true },
    });
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado.' });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error('Error al obtener proyecto por ID:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { clientId, name, description, isActive } = req.body;

  try {
    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        clientId: clientId ? parseInt(clientId) : undefined,
        name: name || undefined,
        description: description || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });
    res.status(200).json({ message: 'Proyecto actualizado exitosamente.', project: updatedProject });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return res.status(409).json({ message: 'Ya existe un proyecto con este nombre para este cliente.' });
    }
    console.error('Error al actualizar proyecto:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar proyecto.' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });
    res.status(200).json({ message: 'Proyecto desactivado exitosamente (soft-delete).', project: project });
  } catch (error) {
    console.error('Error al eliminar proyecto (soft-delete):', error);
    res.status(500).json({ message: 'Error interno del servidor al eliminar proyecto.' });
  }
};
