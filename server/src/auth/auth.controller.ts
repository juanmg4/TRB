import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '1h';
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || '30m';
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');

// Helper function to generate tokens
const generateTokens = (userId: number, email: string, role: Role, profesionalId: number | null) => {
  const accessToken = jwt.sign(
    { userId, email, role, profesionalId },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { Profesional: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Credenciales inválidas o usuario inactivo.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const profesionalId = user.Profesional ? user.Profesional.id : null;
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role, profesionalId);

    // Store Refresh Token in DB
    const expiresAt = new Date(Date.now() + (parseInt(REFRESH_TOKEN_TTL) * 60 * 1000)); // Convert minutes to milliseconds
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: expiresAt,
      },
    });

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profesionalId: profesionalId,
      },
    });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken: oldRefreshToken } = req.body;

  if (!oldRefreshToken) {
    return res.status(400).json({ message: 'Refresh token es requerido.' });
  }

  try {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: oldRefreshToken },
      include: { user: { include: { Profesional: true } }, replaces: true }, // Include 'replaces'
    });

    if (!storedToken || storedToken.isRevoked || storedToken.replacedByTokenId) {
      // If token is revoked or already replaced, it's a potential token reuse attack
      // Invalidate all tokens in the family
      if (storedToken && storedToken.replacedByTokenId) {
        let currentToken: typeof storedToken | null = storedToken; // Explicitly type currentToken
        while (currentToken && currentToken.replaces) { // Check currentToken for null
          await prisma.refreshToken.update({
            where: { id: currentToken.id },
            data: { isRevoked: true },
          });
          currentToken = await prisma.refreshToken.findUniqueOrThrow({
            where: { id: currentToken.replaces.id },
            include: { user: { include: { Profesional: true } }, replaces: true }, // Include 'replaces' and 'user'
          });
        }
      }
      return res.status(403).json({ message: 'Refresh token inválido o revocado.' });
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true },
      });
      return res.status(403).json({ message: 'Refresh token expirado.' });
    }

    const decoded: any = jwt.verify(oldRefreshToken, JWT_SECRET);
    if (decoded.userId !== storedToken.userId) {
      return res.status(403).json({ message: 'Refresh token inválido.' });
    }

    const user = storedToken.user;
    if (!user || !user.isActive) {
      return res.status(403).json({ message: 'Usuario inactivo.' });
    }

    const profesionalId = user.Profesional ? user.Profesional.id : null;
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.email, user.role, profesionalId);

    // Mark old token as replaced and create new one
    const newExpiresAt = new Date(Date.now() + (parseInt(REFRESH_TOKEN_TTL) * 60 * 1000));
    const newRefreshTokenEntry = await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: newExpiresAt,
      },
    });

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        replacedByTokenId: newRefreshTokenEntry.id,
        isRevoked: true, // Also revoke the old token immediately
      },
    });

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profesionalId: profesionalId,
      },
    });

  } catch (error) {
    console.error('Error en el refresh token:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ message: 'Refresh token inválido.' });
    }
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token es requerido.' });
  }

  try {
    await prisma.refreshToken.updateMany({
      where: {
        token: refreshToken,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });

    res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
  } catch (error) {
    console.error('Error en el logout:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};