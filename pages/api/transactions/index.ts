import { TransactionUseCases } from '@/core/application/use-cases/TransactionUseCases';
import {
  AppError,
  UnauthorizedError,
  ValidationError
} from '@/core/domain/errors/AppErrors';
import { PrismaTransactionRepository } from '@/infrastructure/repositories/PrismaTransactionRepository';
import { authOptions } from '@/lib/auth';
import { createTransactionSchema } from '@/lib/validations/transaction';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';



/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Obtiene todas las transacciones
 *     tags: [Transacciones]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de transacciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: No autorizado
 *   post:
 *     summary: Crea una nueva transacción
 *     tags: [Transacciones]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               concept:
 *                 type: string
 *                 example: "Venta de producto"
 *               amount:
 *                 type: number
 *                 example: 1.500.000
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *                 example: "INCOME"
 *     responses:
 *       201:
 *         description: Transacción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  const transactionRepository = new PrismaTransactionRepository();
  const transactionUseCases = new TransactionUseCases(transactionRepository);

  try {
    if (!session?.user) {
      throw new UnauthorizedError('No autorizado: Debes iniciar sesión para acceder.');
    }

    switch (req.method) {
      case 'GET':
        const transactions = await transactionUseCases.getAllTransactions();
        return res.status(200).json(transactions);

      case 'POST':
        // Verificación de rol antes de continuar
        if (session.user.role !== 'ADMIN') {
          throw new AppError('Permisos insuficientes', 403);
        }

        const validation = createTransactionSchema.safeParse({
          ...req.body,
          date: new Date(req.body.date),
        });

        if (!validation.success) {
          throw new ValidationError('Datos inválidos para crear la transacción.', validation.error.issues);
        }

        const newTransaction = await transactionUseCases.createTransaction(
          validation.data,
          session.user as any
        );

        return res.status(201).json(newTransaction);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        throw new AppError(`Método ${req.method} no permitido`, 405);
    }
  } catch (error) {
    console.error('Error en /api/transactions:', error);

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