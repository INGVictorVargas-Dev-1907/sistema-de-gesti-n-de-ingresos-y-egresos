import { UserUseCases } from '@/core/application/use-cases/UserUseCases';
import {
  AppError,
  UnauthorizedError,
  ValidationError
} from '@/core/domain/errors/AppErrors';
import { PrismaUserRepository } from '@/infrastructure/repositories/PrismaUserRepository';
import { authOptions } from '@/lib/auth';
import { updateUserSchema } from '@/lib/validations/user';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

const userRepository = new PrismaUserRepository();
const userUseCases = new UserUseCases(userRepository);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtiene un usuario por ID
 *     description: Este endpoint permite recuperar los datos de un usuario específico mediante su ID. Requiere autenticación vía JWT y permisos adecuados.
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a consultar
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             examples:
 *               ejemploUsuario:
 *                 value:
 *                   id: "abc123"
 *                   name: "Ana Gómez"
 *                   email: "ana@example.com"
 *                   phone: "3233813456/ null"
 *                   role: "admin"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Usuario no encontrado
 *   put:
 *     summary: Actualiza un usuario
 *     description: Este endpoint permite modificar los datos de un usuario específico por su ID. Requiere autenticación y permisos de administrador.
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Juan Pérez"
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *                 example: "ADMIN"
 *               phone:
 *                 type: string
 *                 example: "+573001234567"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Usuario no encontrado
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  try {
    if (!session?.user) {
      throw new UnauthorizedError('No autorizado: Debes iniciar sesión para acceder.');
    }

    const { id } = req.query;
    const userId = Array.isArray(id) ? id[0] : id;

    if (!userId) {
      throw new ValidationError('ID de usuario no proporcionado o inválido.');
    }

    switch (req.method) {
      case 'GET':
        const user = await userUseCases.getUserById(userId, session.user as any);
        return res.status(200).json(user);

      case 'PUT':
        const validation = updateUserSchema.safeParse(req.body);

        if (!validation.success) {
          throw new ValidationError('Datos inválidos para actualizar el usuario.', validation.error.issues);
        }

        const updatedUser = await userUseCases.updateUser(
          userId,
          validation.data,
          session.user as any
        );

        return res.status(200).json(updatedUser);

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        throw new AppError(`Método ${req.method} no permitido`, 405);
    }
  } catch (error) {
    console.error(`Error en /api/users/${req.query.id || 'desconocido'}:`, error);

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