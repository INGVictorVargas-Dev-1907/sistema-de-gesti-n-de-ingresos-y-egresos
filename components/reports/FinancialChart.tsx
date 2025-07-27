import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/core/domain/entities/Transaction';
import { eachMonthOfInterval, endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface FinancialChartProps {
  transactions: Transaction[];
  isLoading?: boolean;
  numberOfMonths?: number;
}

/**
 * FinancialChart Component
 * Gráfico de barras que muestra ingresos y egresos por mes para un número configurable de meses.
 * Incluye manejo de estados de carga y datos vacíos.
 */
export function FinancialChart({ transactions,
  isLoading = false,
  numberOfMonths = 6
}: FinancialChartProps) {

  // Función para formatear valores a moneda (COP)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Si los datos están cargando
  if (isLoading) {
    return (
      <Card className="flex items-center justify-center h-80">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Cargando datos financieros...</p>
      </Card>
    );
  }
  // Generar datos para elgrafico
  const endDate = new Date();
  const startDate = subMonths(endDate, numberOfMonths - 1);
  
  const months = eachMonthOfInterval({
    start: startDate,
    end: endDate,
  });

  const chartData = months.map((month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

    const income = monthTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month: format(month, 'MMM yyyy', { locale: es }),
      ingresos: income,
      egresos: expenses,
      balance: income - expenses,
    };
  });

  // Si no hay datos después del procesamiento
  if (chartData.every(data => data.ingresos === 0 && data.egresos === 0 && data.balance === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Movimientos Financieros - Últimos {numberOfMonths} Meses</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">No hay datos de transacciones disponibles para el período seleccionado.</p>
          <p className="text-sm text-muted-foreground mt-2">Registra tus ingresos y egresos para ver el resumen.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimientos Financieros - Últimos {numberOfMonths} Meses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'ingresos' ? 'Ingresos' : name === 'egresos' ? 'Egresos' : 'Balance'
                ]}
                labelStyle={{ color: '#374151' }}
                contentStyle={{
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff'
                }}
              />
              <Legend
                formatter={(value: string) => {
                  switch (value) {
                    case 'ingresos': return 'Ingresos';
                    case 'egresos': return 'Egresos';
                    case 'balance': return 'Balance';
                    default: return value;
                  }
                }}
                wrapperStyle={{ paddingTop: '1rem' }}
              />
              <Bar dataKey="ingresos" fill="#10b981" name="ingresos" />
              <Bar dataKey="egresos" fill="#ef4444" name="egresos" />
              <Bar dataKey="balance" fill="#3b82f6" name="balance" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}