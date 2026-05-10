import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Download, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'
import { useFinancialData, type Period } from './use-financial-data'
import { SummaryCards } from './SummaryCards'
import { ChartsSection } from './ChartsSection'
import { TablesSection } from './TablesSection'

export function RelatoriosFinanceiros() {
  const { usuario } = useAuth()
  const [period, setPeriod] = useState<Period>('this_month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const { computed, loading, error, refetch } = useFinancialData(period, customStart, customEnd)

  if (usuario?.role !== 'admin' && usuario?.role_name !== 'admin') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex-1 space-y-6 p-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatórios Financeiros</h2>
          <p className="text-muted-foreground">Visão geral do desempenho financeiro da clínica.</p>
        </div>
        <Button variant="outline" disabled className="gap-2">
          <Download className="w-4 h-4" />
          Exportar como PDF
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="w-full sm:w-[240px]">
          <Select value={period} onValueChange={(v: Period) => setPeriod(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">Este Mês</SelectItem>
              <SelectItem value="last_3">Últimos 3 Meses</SelectItem>
              <SelectItem value="last_6">Últimos 6 Meses</SelectItem>
              <SelectItem value="last_12">Últimos 12 Meses</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-2 w-full sm:w-auto animate-fade-in">
            <Input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full sm:w-[150px]"
            />
            <span className="text-muted-foreground">até</span>
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full sm:w-[150px]"
            />
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar dados</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Não foi possível obter as informações financeiras. Verifique sua conexão.</span>
            <Button variant="outline" size="sm" onClick={refetch}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full animate-shimmer" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[380px] w-full animate-shimmer" />
            <Skeleton className="h-[380px] w-full animate-shimmer" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[300px] w-full animate-shimmer" />
            <Skeleton className="h-[300px] w-full animate-shimmer" />
          </div>
        </div>
      ) : (
        computed && (
          <>
            <SummaryCards data={computed} />
            <ChartsSection data={computed} />
            <TablesSection data={computed} />
          </>
        )
      )}
    </div>
  )
}
