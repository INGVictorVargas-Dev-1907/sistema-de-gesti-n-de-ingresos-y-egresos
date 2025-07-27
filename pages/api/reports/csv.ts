import { TransactionUseCases } from '@/core/application/use-cases/TransactionUseCases';
import {
  AppError,
  UnauthorizedError
} from '@/core/domain/errors/AppErrors';
import { PrismaTransactionRepository } from '@/infrastructure/repositories/PrismaTransactionRepository';
import { authOptions } from '@/lib/auth';
import { formatInTimeZone } from 'date-fns-tz';
import { format } from 'date-fns/format';
import { es } from 'date-fns/locale/es';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

const transactionRepository = new PrismaTransactionRepository();
const transactionUseCases = new TransactionUseCases(transactionRepository);

/**
 * @swagger
 * /api/reports/csv:
 *   get:
 *     summary: Descarga reporte financiero en formato CSV (solo administradores)
 *     tags: [Reportes]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Archivo CSV con el reporte financiero
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
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

        const colombiaTimezone = 'America/Bogota';

        const headers = [
          { title: 'N°' },
          { title: 'Fecha' },
          { title: 'Concepto' },
          { title: 'Tipo' },
          { title: 'Monto' },
          { title: 'Usuario' },
        ];

        const formatCell = (value: string | number) => {
          const stringValue = String(value);
          return `"${stringValue.replace(/"/g, '""')}"`;
        };

        const csvHeader = headers.map(h => formatCell(h.title)).join(',') + '\n';

        // Generar las filas de datos
        const csvRows = report.transactions
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((transaction, index) => {
            const formattedTransactionDate = formatInTimeZone(
              new Date(transaction.date),
              colombiaTimezone,
              'dd/MM/yyyy HH:mm',
              { locale: es }
            );

            
            const row = [
              (index + 1).toString(),
              formattedTransactionDate,
              transaction.concept || '',
              transaction.type === 'INCOME' ? 'INGRESO' : 'EGRESO',
              `$${transaction.amount.toFixed(2)}`,
              transaction.user?.name || transaction.user?.email || 'N/A',
            ];
            return row.map(cell => formatCell(cell)).join(',');
          }).join('\n');

        const now = new Date();
        const reportDateInColombia = formatInTimeZone(now, colombiaTimezone, 'dd/MM/yyyy HH:mm', { locale: es });

        const summary = [
          '\n\n',
          formatCell('RESUMEN FINANCIERO'),
          `${formatCell('Total Ingresos:')},${formatCell(`$${report.totalIncome.toFixed(2)}`)}`,
          `${formatCell('Total Egresos:')},${formatCell(`$${report.totalExpenses.toFixed(2)}`)}`,
          `${formatCell('Balance Final:')},${formatCell(`$${report.balance.toFixed(2)}`)}`,
          `${formatCell('Total Transacciones:')},${formatCell(report.transactions.length)}`,
          `${formatCell('Fecha Reporte:')},${formatCell(reportDateInColombia)}`
        ].join('\n');

        const finalCsv = csvHeader + csvRows + summary;

        const fileName = `Reporte_Financiero_${format(new Date(), 'yyyyMMdd_HHmmss', { locale: es })}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);


        return res.status(200).send('\ufeff' + finalCsv);

      default:
        res.setHeader('Allow', ['GET']);
        throw new AppError(`Método ${req.method} no permitido`, 405);
    }
  } catch (error) {
    console.error('Error al generar reporte:', error);

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