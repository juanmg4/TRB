import { Request, Response } from 'express';
import prisma from '../utils/db';

export const createClient = async (req: Request, res: Response) => {
  const { name, address, phone, email } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'El nombre del cliente es requerido.' });
  }

  try {
    const newClient = await prisma.client.create({
      data: {
        name,
        address,
        phone,
        email,
      },
    });
    res.status(201).json({ message: 'Cliente creado exitosamente.', client: newClient });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return res.status(409).json({ message: 'Ya existe un cliente con este nombre.' });
    }
    console.error('Error al crear cliente:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear cliente.' });
  }
};

export const getClients = async (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, sort = 'name:asc' } = req.query;

  const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string);
  const take = parseInt(pageSize as string);

  const orderBy: any = {};
  const [sortField, sortOrder] = (sort as string).split(':');
  orderBy[sortField] = sortOrder; // e.g., { name: 'asc' }

  try {
    const clients = await prisma.client.findMany({
      skip,
      take,
      orderBy,
      where: {
        isActive: true, // Only show active clients by default
      },
    });

    const totalClients = await prisma.client.count({
      where: {
        isActive: true,
      },
    });

    res.status(200).json({
      data: clients,
      pagination: {
        total: totalClients,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
        totalPages: Math.ceil(totalClients / take),
      },
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const getClientById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const client = await prisma.client.findUnique({
      where: { id: parseInt(id) },
    });
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado.' });
    }
    res.status(200).json(client);
  } catch (error) {
    console.error('Error al obtener cliente por ID:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, address, phone, email, isActive } = req.body;

  try {
    const updatedClient = await prisma.client.update({
      where: { id: parseInt(id) },
      data: {
        name: name || undefined,
        address: address || undefined,
        phone: phone || undefined,
        email: email || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });
    res.status(200).json({ message: 'Cliente actualizado exitosamente.', client: updatedClient });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return res.status(409).json({ message: 'Ya existe un cliente con este nombre.' });
    }
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar cliente.' });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const client = await prisma.client.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });
    res.status(200).json({ message: 'Cliente desactivado exitosamente (soft-delete).', client: client });
  } catch (error) {
    console.error('Error al eliminar cliente (soft-delete):', error);
    res.status(500).json({ message: 'Error interno del servidor al eliminar cliente.' });
  }
};
