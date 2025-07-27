import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateTransactionInput, createTransactionSchema } from '@/lib/validations/transaction';
import { zodResolver } from '@hookform/resolvers/zod';
import { TransactionType } from '@prisma/client';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { NumericFormat } from 'react-number-format';

interface TransactionFormProps {
  onSubmit: (data: CreateTransactionInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * TransactionForm Component
 * Formulario para crear nuevas transacciones financieras
 */
export function TransactionForm({ onSubmit, onCancel, isLoading = false }: TransactionFormProps) {
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
    reset
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      date: new Date(),
      amount: 0,
      type: undefined,
    },
    mode: 'onChange',
  });

  const type = watch('type');
  const amountValue = watch('amount');

  const handleFormSubmit = async (data: CreateTransactionInput) => {
    try {
      setError('');
      await onSubmit(data);

      toast({
        title: 'Transacción Creada',
        description: `La transacción de ${data.amount ? `$ ${data.amount.toLocaleString('es-CO')}` : ''} ha sido registrada con éxito.`,
        duration: 4000,
      });

      reset({
        date: new Date(),
        amount: 0,
        concept: '',
        type: undefined,
      });
    } catch (err: any) {
      console.error('Error al crear transacción:', err);
      setError(err.message || 'Error al crear la transacción. Intenta de nuevo.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Nueva Transacción</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="concept">Concepto</Label>
            <Input
              id="concept"
              placeholder="Descripción de la transacción"
              {...register('concept')}
              className={errors.concept ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.concept && (
              <p className="text-sm text-destructive mt-1">{errors.concept.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <NumericFormat
              id="amount"
              name="amount"
              thousandSeparator="."
              decimalSeparator=","
              prefix="$"
              allowNegative={false}
              decimalScale={0}
              value={amountValue}
              onValueChange={(values) => {
                setValue('amount', values.floatValue || 0, { shouldValidate: true, shouldDirty: true });
              }}
              customInput={Input}
              placeholder="$ 0"
              className={errors.amount ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.amount && (
              <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              onValueChange={(value) => setValue('type', value as TransactionType, { shouldValidate: true, shouldDirty: true })}
              value={type}
            >
              <SelectTrigger className={errors.type ? "border-destructive focus-visible:ring-destructive" : ""}>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TransactionType.INCOME}>Ingreso</SelectItem>
                <SelectItem value={TransactionType.EXPENSE}>Egreso</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive mt-1">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${errors.date ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch('date') ? format(watch('date'), 'PPP', { locale: es }) : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={watch('date')}
                  onSelect={(date) =>
                    setValue('date', date as Date, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  initialFocus
                  locale={es}
                  captionLayout="dropdown"
                  fromYear={2000}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-sm text-destructive mt-1">{errors.date.message}</p>
            )}
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !isValid || !isDirty}
              className="flex-1"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}