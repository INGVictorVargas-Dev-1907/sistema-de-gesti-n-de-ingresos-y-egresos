import { TransactionUseCases } from '@/core/application/use-cases/TransactionUseCases';
import { PrismaTransactionRepository } from '@/infrastructure/repositories/PrismaTransactionRepository';
import { authOptions } from '@/lib/auth';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import {
  AppError,
  ForbiddenError,
  UnauthorizedError
} from '@/core/domain/errors/AppErrors';

const transactionRepository = new PrismaTransactionRepository();
const transactionUseCases = new TransactionUseCases(transactionRepository);

/**
 * @swagger
 * /api/reports/financial:
 *   get:
 *     summary: Genera reporte financiero
 *     description: Este endpoint permite obtener el reporte financiero consolidado del sistema, incluyendo balance, ingresos, egresos y el historial de transacciones. Solo accesible para administradores autenticados vía OAUTH.
 *     tags: [Reportes]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Reporte financiero generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                   description: Balance total (ingresos - egresos)
 *                 totalIncome:
 *                   type: number
 *                   description: Total de ingresos
 *                 totalExpenses:
 *                   type: number
 *                   description: Total de egresos
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             examples:
 *               noAuth:
 *                 value:
 *                   error: "No autorizado"
 *       403:
 *         description: Permisos insuficientes
 *         content:
 *           application/json:
 *             examples:
 *               forbidden:
 *                 value:
 *                   error: "Acceso denegado: se requiere rol administrador"
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  try {
    if (!session?.user) {
      throw new UnauthorizedError('No autorizado: Debes iniciar sesión para acceder.');
    }

    switch (req.method) {
      case 'GET':
        const report = await transactionUseCases.generateFinancialReport(session.user as any);
        return res.status(200).json(report);

      default:
        res.setHeader('Allow', ['GET']);
        throw new AppError(`Método ${req.method} no permitido`, 405);
    }
  } catch (error) {
    console.error('Error en /api/reports/financial:', error);

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