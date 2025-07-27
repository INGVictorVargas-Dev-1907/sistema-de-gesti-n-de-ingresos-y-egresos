import { useState, useEffect } from 'react';
import { Transaction } from '@/core/domain/entities/Transaction';
import { FinancialChart } from '@/components/reports/FinancialChart';
import { FinancialSummary } from '@/components/reports/FinancialSummary';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Download, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

interface FinancialReport {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  transactions: Transaction[];
}

/**
 * Reports Page
 * Página de reportes financieros (solo administradores)
 */
export default function ReportsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string>('');

  const isAdmin = session?.user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin && session) {
      router.push('/');
      return;
    }
    if (isAdmin) {
      fetchReport();
    }
  }, [isAdmin, session]);

  const fetchReport = async () => {
    try {
      setError('');
      const response = await fetch('/api/reports/financial');
      if (!response.ok) {
        throw new Error('Error al cargar el reporte');
      }
      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el reporte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/reports/csv');
      if (!response.ok) {
        throw new Error('Error al generar el CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `reporte_financiero_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Error al descargar el reporte');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isAdmin && session) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes Financieros</h1>
          <p className="text-gray-600">Analiza el rendimiento financiero del sistema</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes Financieros</h1>
          <p className="text-gray-600">Analiza el rendimiento financiero del sistema</p>
        </div>
        <Button
          onClick={handleDownloadCSV}
          disabled={isDownloading}
          variant="outline"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Descargar CSV
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {report && (
        <div className="space-y-6">
          <FinancialSummary
            balance={report.balance}
            totalIncome={report.totalIncome}
            totalExpenses={report.totalExpenses}
          />
          
          <FinancialChart transactions={report.transactions} />
        </div>
      )}
    </div>
  );
}