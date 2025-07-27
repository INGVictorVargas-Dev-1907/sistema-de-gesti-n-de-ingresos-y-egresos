import { describe, it, expect } from 'vitest';
import { TransactionDomainService, TransactionType } from '@/core/domain/entities/Transaction';

describe('TransactionDomainService', () => {
  const mockTransactions = [
    {
      id: '1',
      concept: 'Venta',
      amount: 1000,
      type: TransactionType.INCOME,
      date: new Date(),
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      concept: 'Compra',
      amount: 500,
      type: TransactionType.EXPENSE,
      date: new Date(),
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      concept: 'Otra venta',
      amount: 750,
      type: TransactionType.INCOME,
      date: new Date(),
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('should calculate balance correctly', () => {
    const balance = TransactionDomainService.calculateBalance(mockTransactions);
    expect(balance).toBe(1250); // 1000 + 750 - 500
  });

  it('should filter transactions by type', () => {
    const incomes = TransactionDomainService.filterByType(mockTransactions, TransactionType.INCOME);
    const expenses = TransactionDomainService.filterByType(mockTransactions, TransactionType.EXPENSE);
    
    expect(incomes).toHaveLength(2);
    expect(expenses).toHaveLength(1);
  });

  it('should calculate total income correctly', () => {
    const totalIncome = TransactionDomainService.getTotalIncome(mockTransactions);
    expect(totalIncome).toBe(1750); // 1000 + 750
  });

  it('should calculate total expenses correctly', () => {
    const totalExpenses = TransactionDomainService.getTotalExpenses(mockTransactions);
    expect(totalExpenses).toBe(500);
  });
});