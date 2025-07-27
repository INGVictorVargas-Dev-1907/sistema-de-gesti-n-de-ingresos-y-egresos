import { Transaction, TransactionDomainService } from '@/core/domain/entities/Transaction';
import { User, UserDomainService } from '@/core/domain/entities/User';
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError
} from '@/core/domain/errors/AppErrors';
import { CreateTransactionInput, UpdateTransactionInput } from '@/lib/validations/transaction';
import { TransactionRepository } from '../ports/TransactionRepository';

/**
 * Use Case: Gestión de Transacciones.
 * Implementa los casos de uso relacionados con transacciones financieras.
 */
export class TransactionUseCases {
  constructor(private transactionRepository: TransactionRepository) {}

  /**
   * Obtiene todas las transacciones.
   * Nota: Considerar si solo los administradores o un usuario específico deberían ver todas las transacciones.
   * Si es por usuario, este método necesitaría `currentUser` como parámetro.
   */
  async getAllTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.findAll();
  }

  /**
   * Crea una nueva transacción.
   * Solo disponible para administradores.
   * @returns Una promesa que resuelve al crear una transaction.
   * @throws ForbiddenError Si el usuario actual no es administrador.
   * @throws InternalServerError Si ocurre un error inesperado en la capa de persistencia.
   */
  async createTransaction(data: CreateTransactionInput, currentUser: User): Promise<Transaction> {
    if (!UserDomainService.isAdmin(currentUser)) {
      throw new ForbiddenError('Solo los administradores pueden crear transacciones');
    }
    
    try{
      return await this.transactionRepository.create({
        ...data,
        userId: currentUser.id,
      });
    } catch (error) {
      console.error('Error al crear transacción en el repositorio:', error);
      throw new InternalServerError('Hubo un problema al crear la transacción.');
    }
  }

  /**
   * Actualiza una transacción existente.
   * Los administradores pueden editar cualquier transacción.
   * @returns Una promesa que resuelve al actualizar una transaction.
   * @throws NotFoundError Si la transaccion no se encuentra.
   * @throws ForbiddenError Si el usuario actual no tiene permisos para ver este perfil.
   * @throws InternalServerError Si ocurre un error inesperado en la capa de persistencia.
   */
  async updateTransaction(id: string, data: UpdateTransactionInput, currentUser: User): Promise<Transaction> {
    const existingTransaction = await this.transactionRepository.findById(id);
    
    if (!existingTransaction) {
      throw new NotFoundError(`Transacción con ID ${id} no encontrada.`);
    }

    if (!UserDomainService.isAdmin(currentUser) && existingTransaction.userId !== currentUser.id) {
      throw new ForbiddenError('No tienes permisos para actualizar esta transacción.');
    }

    try {
      const updatedTransaction = await this.transactionRepository.update(id, data);
      if (!updatedTransaction) {
        throw new InternalServerError('La transacción no pudo ser actualizada por un error inesperado.');
      }
      return updatedTransaction;
    } catch (error) {
      console.error(`Error al actualizar transacción ${id} en el repositorio:`, error);
      throw new InternalServerError('Hubo un problema al actualizar la transacción.');
    }
  }

  /**
   * Elimina una transacción.
   * Solo disponible para administradores.
   * @returns una promesa vacia para indicar que se ha eliminado una transaction.
   * @throws NotFoundError Si la transaccion no se encuentra.
   * @throws ForbiddenError Si el usuario actual no tiene permisos para ver este perfil.
   * @throws InternalServerError Si ocurre un error inesperado en la capa de persistencia.
   */
  async deleteTransaction(id: string, currentUser: User): Promise<void> {
    const existingTransaction = await this.transactionRepository.findById(id);

    if (!existingTransaction) {
      throw new NotFoundError(`Transacción con ID ${id} no encontrada.`);
    }

    if (!UserDomainService.isAdmin(currentUser) && existingTransaction.userId !== currentUser.id) {
      throw new ForbiddenError('No tienes permisos para eliminar esta transacción.');
    }

    try {
      await this.transactionRepository.delete(id);
    } catch (error) {
      console.error(`Error al eliminar transacción ${id} en el repositorio:`, error);
      throw new InternalServerError('Hubo un problema al eliminar la transacción.');
    }
  }

  /**
   * Genera reporte financiero.
   * Solo disponible para administradores.
   * @returns un reporte financiero con ingrsos, egresos y un balance.
   * @throws ForbiddenError Si el usuario actual no tiene permisos para ver este perfil.
   * @throws InternalServerError Si ocurre un error inesperado en la capa de persistencia.
   */
  async generateFinancialReport(currentUser: User) {
    if (!UserDomainService.canViewReports(currentUser)) {
      throw new ForbiddenError('No tienes permisos para ver reportes financieros.');
    }

    try {
      const transactions = await this.transactionRepository.findByUserId(currentUser.id);

      return {
        balance: TransactionDomainService.calculateBalance(transactions),
        totalIncome: TransactionDomainService.getTotalIncome(transactions),
        totalExpenses: TransactionDomainService.getTotalExpenses(transactions),
        transactions,
      };
    } catch (error) {
      console.error('Error al generar reporte financiero:', error);
      throw new InternalServerError('Hubo un problema al generar el reporte financiero.');
    }
  }
}