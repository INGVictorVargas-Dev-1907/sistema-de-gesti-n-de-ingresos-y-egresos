import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

interface FinancialSummaryProps {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
}

/**
 * FinancialSummary Component
 * Tarjetas de resumen financiero con métricas clave
 */
export function FinancialSummary({ balance, totalIncome, totalExpenses }: FinancialSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(amount);
  };

  const summaryCards = [
    {
      title: 'Saldo Actual (Balance Total)',
      value: balance,
      icon: DollarSign,
      color: balance >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: balance >= 0 ? 'bg-green-100' : 'bg-red-100',
    },
    {
      title: 'Total Ingresos',
      value: totalIncome,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Egresos',
      value: totalExpenses,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {summaryCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {formatCurrency(card.value)}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}