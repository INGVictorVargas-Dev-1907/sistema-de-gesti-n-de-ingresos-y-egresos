import { TransactionUseCases } from '@/core/application/use-cases/TransactionUseCases';
import {
  AppError,
  UnauthorizedError,
  ValidationError
} from '@/core/domain/errors/AppErrors';
import { PrismaTransactionRepository } from '@/infrastructure/repositories/PrismaTransactionRepository';
import { authOptions } from '@/lib/auth';
import { updateTransactionSchema } from '@/lib/validations/transaction';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

const transactionRepository = new PrismaTransactionRepository();
const transactionUseCases = new TransactionUseCases(transactionRepository);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Actualiza una transacción existente
 *     tags: [Transacciones]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la transacción
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               concept:
 *                 type: string
 *               amount:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *     responses:
 *       200:
 *         description: Transacción actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Transacción no encontrada
 *   delete:
 *     summary: Elimina una transacción
 *     tags: [Transacciones]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la transacción
 *     responses:
 *       204:
 *         description: Transacción eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Transacción no encontrada
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  try {
    if (!session?.user) {
      throw new UnauthorizedError('No autorizado: Debes iniciar sesión para acceder.');
    }

    const { id } = req.query;
    const transactionId = Array.isArray(id) ? id[0] : id;

    if (!transactionId) {
      throw new ValidationError('ID de transacción no proporcionado o inválido.');
    }

    
    switch (req.method) {
      case 'PUT':
        const validation = updateTransactionSchema.safeParse({
          ...req.body,
          date: req.body.date ? new Date(req.body.date) : undefined,
        });

        if (!validation.success) {
          throw new ValidationError('Datos de actualización inválidos.', validation.error.issues);
        }

        const updatedTransaction = await transactionUseCases.updateTransaction(
          transactionId,
          validation.data,
          session.user as any
        );

        // Responder con éxito
        return res.status(200).json(updatedTransaction);

      case 'DELETE':
        await transactionUseCases.deleteTransaction(transactionId, session.user as any);
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        throw new AppError(`Método ${req.method} no permitido`, 405);
    }
  } catch (error) {
    console.error(`Error en /api/transactions/${req.query.id || 'desconocido'}:`, error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message,
        details: error.details,
      });
    
    }
    else if (error instanceof Error) {
      return res.status(500).json({
        message: 'Error interno del servidor. Por favor, intente de nuevo más tarde.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
    else {
      return res.status(500).json({
        message: 'Ocurrió un error inesperado.',
      });
    }
  }
}