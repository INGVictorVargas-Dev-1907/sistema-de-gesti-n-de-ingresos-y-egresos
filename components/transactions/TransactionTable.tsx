import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertConfirmationDialog } from '@/components/ui/alert-confirmation-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Transaction } from '@/core/domain/entities/Transaction';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowDown, ArrowUp, Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  onNew?: () => void;
  canEdit?: boolean;
  isLoading?: boolean;
}

/**
 * TransactionTable Component
 * Tabla para mostrar las transacciones financieras
 */
export function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  onNew,
  canEdit = false,
  isLoading = false,
}: TransactionTableProps) {
  const [deletingId, setDeletingId] = useState<string>('');
  const { toast } = useToast();


  const handleDeleteConfirmed = async (id: string) => {
    if (!onDelete) return;
    setDeletingId(id);
    try {
      await onDelete(id);
      toast({
        title: 'Transacción eliminada',
        description: 'La transacción fue eliminada correctamente.',
        duration: 4000,
      });
    } catch (error) {
      toast({
        title: 'Error al eliminar',
        description: 'No se pudo eliminar la transacción. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId('');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(amount);
  };

  /**
 * Componente para mostrar indicador visual del tipo de transacción
 */
  function TransactionTypeIndicator({ type }: { type: 'INCOME' | 'EXPENSE' }) {
    return (
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {type === 'INCOME' ? (
          <ArrowUp className="w-4 h-4" />
        ) : (
          <ArrowDown className="w-4 h-4" />
        )}
      </span>
    );
  }

  const getTransactionTypeLabel = (type: 'INCOME' | 'EXPENSE') => {
    const isIncome = type === 'INCOME';
    
    return (
      <div className={`inline-flex items-center justify-center gap-1 px-3 py-0.5 rounded-full ${
        isIncome
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
      }`}>
        {isIncome ? (
          <ArrowUp className="w-3 h-3" />
        ) : (
          <ArrowDown className="w-3 h-3" />
        )}
        <span className="text-xs font-medium">
          {isIncome ? 'Ingreso' : 'Egreso'}
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transacciones</CardTitle>
        {canEdit && onNew && (
          <Button onClick={onNew} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Transacción
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay transacciones registradas</p>
            {canEdit && onNew && (
              <Button onClick={onNew} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Agregar primera transacción
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Usuario</TableHead>
                  {canEdit && <TableHead className="text-right">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.concept}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TransactionTypeIndicator type={transaction.type} />
                        <span className={`font-medium ${
                          transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'EXPENSE' && '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>
                      {getTransactionTypeLabel(transaction.type)}
                    </TableCell>
                    <TableCell>
                      {transaction.user?.name || transaction.user?.email || 'Usuario desconocido'}
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {onEdit && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(transaction)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <AlertConfirmationDialog
                              title="¿Eliminar transacción?"
                              description="Esta acción no se puede deshacer."
                              onConfirm={() => handleDeleteConfirmed(transaction.id)}
                              trigger={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={deletingId === transaction.id}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              }
                            />
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

