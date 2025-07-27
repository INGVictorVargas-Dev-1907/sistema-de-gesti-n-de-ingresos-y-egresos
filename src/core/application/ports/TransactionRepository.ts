import { Transaction } from '@/core/domain/entities/Transaction';
import { CreateTransactionInput, UpdateTransactionInput } from '@/lib/validations/transaction';

/**
 * Port: TransactionRepository
 * Define el contrato para el repositorio de transacciones
 */
export interface TransactionRepository {
  findAll(): Promise<Transaction[]>;
  findById(id: string): Promise<Transaction | null>;
  findByUserId(userId: string): Promise<Transaction[]>;
  create(data: CreateTransactionInput & { userId: string }): Promise<Transaction>;
  update(id: string, data: UpdateTransactionInput): Promise<Transaction>;
  delete(id: string): Promise<void>;
}