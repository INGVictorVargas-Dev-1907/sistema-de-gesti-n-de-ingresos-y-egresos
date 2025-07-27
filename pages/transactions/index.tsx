import { TransactionEditForm } from '@/components/transactions/TransactionEditForm';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Transaction } from '@/core/domain/entities/Transaction';
import { useToast } from '@/hooks/use-toast';
import { CreateTransactionInput, UpdateTransactionInput } from '@/lib/validations/transaction';
import { AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

/**
 * Transactions Page
 * Página principal para la gestión de transacciones
 */
export default function TransactionsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewFormOpen, setIsNewFormOpen] = useState(false); // Renombrado para claridad
  const [isEditFormOpen, setIsEditFormOpen] = useState(false); // Nuevo estado para el formulario de edición
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null); // Nuevo estado para la transacción seleccionada
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const isAdmin = session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setError('');
      setIsLoading(true);
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error('Error al cargar las transacciones');
      }
      const data = await response.json();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las transacciones');
      toast({
        title: 'Error de carga',
        description: 'No se pudieron cargar las transacciones.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTransaction = async (data: CreateTransactionInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la transacción');
      }

      await fetchTransactions();
      setIsNewFormOpen(false);
      toast({
        title: 'Transacción Creada',
        description: `La transacción de ${data.amount ? `$ ${data.amount.toLocaleString('es-CO')}` : ''} ha sido registrada con éxito.`,
        duration: 4000,
      });
    } catch (err: any) {
      setError(err.message || 'Error al crear la transacción. Intenta de nuevo.');
      toast({
        title: 'Error de creación',
        description: err.message || 'No se pudo crear la transacción.',
        variant: 'destructive',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditFormOpen(true);
  };

  const handleUpdateTransaction = async (data: UpdateTransactionInput) => {
    if (!selectedTransaction) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/transactions/${selectedTransaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la transacción');
      }

      await fetchTransactions();
      setIsEditFormOpen(false);
      setSelectedTransaction(null);
      toast({
        title: 'Transacción Actualizada',
        description: `La transacción "${data.concept}" ha sido actualizada con éxito.`,
        duration: 4000,
      });
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la transacción. Intenta de nuevo.');
      toast({
        title: 'Error de actualización',
        description: err.message || 'No se pudo actualizar la transacción.',
        variant: 'destructive',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la transacción');
      }

      await fetchTransactions();
      toast({
        title: 'Transacción Eliminada',
        description: 'La transacción fue eliminada correctamente.',
        duration: 4000,
      });
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la transacción');
      toast({
        title: 'Error al eliminar',
        description: err.message || 'No se pudo eliminar la transacción. Intenta nuevamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Transacciones</h1>
          <p className="text-gray-600">Administra los ingresos y egresos del sistema</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>¡Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <TransactionTable
        transactions={transactions}
        onDelete={isAdmin ? handleDeleteTransaction : undefined}
        onEdit={isAdmin ? handleEditTransaction : undefined}
        onNew={isAdmin ? () => setIsNewFormOpen(true) : undefined}
        canEdit={isAdmin}
        isLoading={isLoading}
      />

      {/* Diálogo para CREAR Transacción */}
      <Dialog open={isNewFormOpen} onOpenChange={setIsNewFormOpen}>
        <DialogContent className="w-full max-h-[95vh] top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 rounded-lg overflow-y-auto p-8 border">
          <DialogHeader>
            <DialogTitle>Nueva Transacción</DialogTitle>
          </DialogHeader>
          <TransactionForm
            onSubmit={handleCreateTransaction}
            onCancel={() => setIsNewFormOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo para EDITAR Transacción */}
      {selectedTransaction && (
        <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
          <DialogContent className="w-full max-h-[95vh] top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 rounded-lg overflow-y-auto p-8 border">
            <DialogHeader>
              <DialogTitle>Editar Transacción</DialogTitle>
            </DialogHeader>
            <TransactionEditForm
              transaction={selectedTransaction}
              onSubmit={handleUpdateTransaction}
              onCancel={() => {
                setIsEditFormOpen(false);
                setSelectedTransaction(null); 
              }}
              isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}