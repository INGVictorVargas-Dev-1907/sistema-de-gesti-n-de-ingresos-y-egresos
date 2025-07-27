import { TransactionRepository } from '@/core/application/ports/TransactionRepository';
import { Transaction } from '@/core/domain/entities/Transaction';
import { CreateTransactionInput, UpdateTransactionInput } from '@/lib/validations/transaction';
import { prisma } from '@/lib/db';

/**
 * Adapter: Prisma Transaction Repository
 * Implementación del repositorio de transacciones usando Prisma
 */
export class PrismaTransactionRepository implements TransactionRepository {
  async findAll(): Promise<Transaction[]> {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
    
    return transactions.map(this.mapToDomain);
  }

  async findById(id: string): Promise<Transaction | null> {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    
    return transaction ? this.mapToDomain(transaction) : null;
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
    
    return transactions.map(this.mapToDomain);
  }

  async create(data: CreateTransactionInput & { userId: string }): Promise<Transaction> {
    const transaction = await prisma.transaction.create({
      data: {
        concept: data.concept,
        amount: data.amount,
        date: data.date,
        type: data.type,
        userId: data.userId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    
    return this.mapToDomain(transaction);
  }

  async update(id: string, data: UpdateTransactionInput): Promise<Transaction> {
    const transaction = await prisma.transaction.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    
    return this.mapToDomain(transaction);
  }

  async delete(id: string): Promise<void> {
    await prisma.transaction.delete({
      where: { id },
    });
  }

  private mapToDomain(transaction: any): Transaction {
    return {
      id: transaction.id,
      concept: transaction.concept,
      amount: Number(transaction.amount),
      date: transaction.date,
      type: transaction.type,
      userId: transaction.userId,
      user: transaction.user,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}