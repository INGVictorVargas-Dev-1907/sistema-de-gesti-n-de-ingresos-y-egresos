import { UserUseCases } from '@/core/application/use-cases/UserUseCases';
import {
  AppError,
  UnauthorizedError
} from '@/core/domain/errors/AppErrors';
import { PrismaUserRepository } from '@/infrastructure/repositories/PrismaUserRepository';
import { authOptions } from '@/lib/auth';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

const userRepository = new PrismaUserRepository();
const userUseCases = new UserUseCases(userRepository);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtiene todos los usuarios registrados
 *     description: Este endpoint permite a los administradores recuperar la lista completa de usuarios registrados en el sistema. Requiere autenticación vía JWT y permisos de administrador.
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página a consultar (opcional)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, user]
 *         description: Filtrar usuarios por rol (opcional)
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *             examples:
 *               ejemploUsuarios:
 *                 summary: Respuesta simulada
 *                 value:
 *                   - id: "abc123"
 *                     name: "Ana Gómez"
 *                     email: "ana@example.com"
 *                     role: "admin"
 *                   - id: "def456"
 *                     name: "Juan Pérez"
 *                     email: "juan@example.com"
 *                     role: "user"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               noAuth:
 *                 value:
 *                   error: "No autorizado"
 *       403:
 *         description: Permisos insuficientes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               forbidden:
 *                 value:
 *                   error: "Acceso denegado: se requiere rol administrador"
 *       405:
 *         description: Método no permitido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               methodNotAllowed:
 *                 value:
 *                   error: "Método POST no permitido"
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  try {
    if (!session?.user) {
      throw new UnauthorizedError('No autorizado: Debes iniciar sesión para acceder.');
    }

    switch (req.method) {
      case 'GET':
        const users = await userUseCases.getAllUsers(session.user as any);
        return res.status(200).json(users);

      default:
        res.setHeader('Allow', ['GET']);
        throw new AppError(`Método ${req.method} no permitido`, 405);
    }
  } catch (error) {
    console.error('Error en /api/users:', error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message,
        details: error.details,
      });
    } else if (error instanceof Error) {
      return res.status(500).json({
        message: 'Error interno del servidor. Por favor, intente de nuevo más tarde.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    } else {
      return res.status(500).json({
        message: 'Ocurrió un error inesperado.',
      });
    }
  }
}