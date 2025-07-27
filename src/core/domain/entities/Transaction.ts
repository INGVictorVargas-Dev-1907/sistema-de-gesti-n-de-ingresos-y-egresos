/**
 * Entity: Transaction
 * Representa una transacción financiera (ingreso o egreso)
 */
export interface Transaction {
  id: string;
  concept: string;
  amount: number;
  date: Date;
  type: TransactionType;
  userId: string;
  user?: {
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Value Object: TransactionType
 * Define los tipos de transacciones disponibles
 */
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

/**
 * Domain Service: TransactionService
 * Contiene la lógica de negocio relacionada con transacciones
 */
export class TransactionDomainService {
  /**
   * Calcula el balance total de un conjunto de transacciones
   */
  static calculateBalance(transactions: Transaction[]): number {
    return transactions.reduce((balance, transaction) => {
      if (transaction.type === TransactionType.INCOME) {
        return balance + transaction.amount;
      } else {
        return balance - transaction.amount;
      }
    }, 0);
  }

  /**
   * Filtra transacciones por tipo
   */
  static filterByType(transactions: Transaction[], type: TransactionType): Transaction[] {
    return transactions.filter(transaction => transaction.type === type);
  }

  /**
   * Obtiene el total de ingresos
   */
  static getTotalIncome(transactions: Transaction[]): number {
    const incomes = this.filterByType(transactions, TransactionType.INCOME);
    return incomes.reduce((total, transaction) => total + transaction.amount, 0);
  }

  /**
   * Obtiene el total de egresos
   */
  static getTotalExpenses(transactions: Transaction[]): number {
    const expenses = this.filterByType(transactions, TransactionType.EXPENSE);
    return expenses.reduce((total, transaction) => total + transaction.amount, 0);
  }
}