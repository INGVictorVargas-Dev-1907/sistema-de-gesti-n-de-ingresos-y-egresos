import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Transaction, TransactionType } from '@/core/domain/entities/Transaction';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { UpdateTransactionInput, updateTransactionSchema } from '@/lib/validations/transaction';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle, Calendar as CalendarLucide, DollarSign, Loader2, Save, Tag, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';

interface TransactionEditFormProps {
    transaction: Transaction;
    onSubmit: (data: UpdateTransactionInput) => void;
    onCancel: () => void;
    isLoading: boolean;
    validationErrors?: string[];
}

/**
 * TransactionEditForm Component
 * Formulario para editar transacciones existentes, con un estilo similar a UserEditForm.
 * Presentation Layer - Forms
 */
export function TransactionEditForm({
    transaction,
    onSubmit,
    onCancel,
    isLoading,
    validationErrors,
}: TransactionEditFormProps) {
    const [error, setError] = useState<string>('');
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        control,
        formState: { errors, isDirty, isValid },
    } = useForm<UpdateTransactionInput>({
        resolver: zodResolver(updateTransactionSchema),
        defaultValues: {
            concept: transaction.concept,
            amount: transaction.amount,
            date: new Date(transaction.date),
            type: transaction.type,
        },
        mode: 'onChange',
    });

    const selectedDate = watch('date');
    const watchedType = watch('type');

    const handleFormSubmit = async (data: UpdateTransactionInput) => {
        try {
            setError('');
            await onSubmit(data);
        } catch (err: any) {
            console.error('Error al enviar la actualización de transacción:', err);
            setError(err.message || 'Error desconocido al actualizar la transacción.');
            toast({
                title: 'Error de actualización',
                description: err.message || 'No se pudo actualizar la transacción. Intenta de nuevo.',
                variant: 'destructive',
                duration: 4000,
            });
        }
    };

    return (
        <Card className="w-full max-w-lg mx-auto shadow-lg border-b">
            <CardHeader className="border-b pb-4">
                <CardTitle className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-semibold text-primary">
                            {transaction.concept ? transaction.concept.charAt(0).toUpperCase() : '?'}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Editar Transacción</h2>
                        <p className="text-sm text-muted-foreground">
                            Modificando el movimiento de <span className="font-medium text-gray-700">{transaction.concept}</span>
                        </p>
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {validationErrors && validationErrors.length > 0 && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Errores de Validación</AlertTitle>
                            <AlertDescription>
                                <ul className="list-disc list-inside">
                                    {validationErrors.map((err, index) => (
                                        <li key={index}>{err}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Sección de Información de la Transacción (No Editable) */}
                    <div className="space-y-4 p-4 bg-muted/40 rounded-lg border border-border">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <Tag className="w-4 h-4 text-muted-foreground" />
                            Detalles de la Transacción
                        </h3>
                        <div className="grid grid-cols-1 gap-4 text-sm">
                            <div className="space-y-1">
                                <Label className="text-muted-foreground block mb-1">ID de Transacción</Label>
                                <p className="font-medium text-gray-700 p-2 bg-background rounded-md border border-input break-words">{transaction.id}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground block mb-1">Fecha de Creación</Label>
                                <p className="font-medium text-gray-700 p-2 bg-background rounded-md border border-input">
                                    {format(new Date(transaction.createdAt), 'PPPp', { locale: es })}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground block mb-1">Última Actualización</Label>
                                <p className="font-medium text-gray-700 p-2 bg-background rounded-md border border-input">
                                    {format(new Date(transaction.updatedAt), 'PPPp', { locale: es })}
                                </p>
                            </div>
                            {transaction.user && (
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground block mb-1">Usuario Asociado</Label>
                                    <p className="font-medium text-gray-700 p-2 bg-background rounded-md border border-input">
                                        {/* Asegúrate de que transaction.user.name o .email exista y sea un string */}
                                        {transaction.user.name || transaction.user.email || 'Desconocido'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Sección de Información Editable */}
                    <div className="space-y-5">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <Save className="w-4 h-4 text-muted-foreground" />
                            Información Editable
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="concept" className="text-foreground">Concepto</Label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="concept"
                                    type="text"
                                    placeholder="Descripción de la transacción"
                                    {...register('concept')}
                                    className={cn("pl-10 h-10", errors.concept && 'border-destructive focus-visible:ring-destructive')}
                                />
                            </div>
                            {errors.concept && <p className="text-sm text-destructive mt-1">{errors.concept.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-foreground">Monto</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Controller
                                    name="amount"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field: { name, onChange, value, ref } }) => (
                                        <NumericFormat
                                            id="amount"
                                            name={name}
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            placeholder="0.000.000"
                                            value={value === 0 ? '' : value}
                                            onValueChange={(values) => {
                                                onChange(values.floatValue || 0);
                                            }}
                                            getInputRef={ref}
                                            className={cn(
                                                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                                "pl-10 h-10",
                                                errors.amount && 'border-destructive focus-visible:ring-destructive'
                                            )}
                                        />
                                    )}
                                />
                            </div>
                            {errors.amount && <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-foreground">Tipo</Label>
                            <Select
                                onValueChange={(value: 'INCOME' | 'EXPENSE') => setValue('type', value as TransactionType, { shouldValidate: true, shouldDirty: true })}
                                value={watchedType}
                            >
                                <SelectTrigger className={cn("h-10", errors.type && 'border-destructive focus-visible:ring-destructive')}>
                                    <SelectValue placeholder="Selecciona el tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={TransactionType.INCOME}>Ingreso</SelectItem>
                                    <SelectItem value={TransactionType.EXPENSE}>Egreso</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date" className="text-foreground">Fecha</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal pl-10 h-10",
                                            !selectedDate && "text-muted-foreground",
                                            errors.date && 'border-destructive focus-visible:ring-destructive'
                                        )}
                                    >
                                        <CalendarLucide className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => setValue('date', date as Date, { shouldValidate: true, shouldDirty: true })}
                                        initialFocus
                                        locale={es}
                                        captionLayout="dropdown"
                                        fromYear={2000}
                                        toYear={new Date().getFullYear()}
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.date && <p className="text-sm text-destructive mt-1">{errors.date.message}</p>}
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Botones de Acción */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                            type="submit"
                            className="flex-1 h-10 text-lg font-semibold"
                            disabled={!isValid || !isDirty || isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5 mr-2" />
                            )}
                            Guardar Cambios
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="flex-1 h-10 text-lg font-semibold"
                        >
                            <X className="w-5 h-5 mr-2" />
                            Cancelar
                        </Button>
                    </div>

                    {isDirty && (
                        <div className="text-sm text-amber-800 bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-center gap-3 mt-4 animate-pulse">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                            <span className="font-medium">¡Atención! Hay cambios sin guardar en este formulario.</span>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}