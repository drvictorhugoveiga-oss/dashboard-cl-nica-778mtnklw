import { useState, useEffect } from 'react'
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
import { useFinancialData, MONTHS } from './use-financial-data'
import { SummaryCards } from './SummaryCards'
import { ChartsSection } from './ChartsSection'
import { TablesSection } from './TablesSection'

export function RelatoriosFinanceiros() {
  const { usuario } = useAuth()
  const now = new Date()

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth().toString())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear().toString())

  const [appliedMonth, setAppliedMonth] = useState(now.getMonth())
  const [appliedYear, setAppliedYear] = useState(now.getFullYear())

  const { computed, loading, error, refetch } = useFinancialData(appliedMonth, appliedYear)

  const handleApply = () => {
    setAppliedMonth(parseInt(selectedMonth, 10))
    setAppliedYear(parseInt(selectedYear, 10))
    refetch()
  }

  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-area, #print-area * {
          visibility: visible;
        }
        #print-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  if (usuario?.role !== 'admin' && usuario?.role_name !== 'admin') {
    return <Navigate to="/" replace />
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div id="print-area" className="flex-1 space-y-6 p-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatórios Financeiros</h2>
          <p className="text-muted-foreground">Visão geral do desempenho financeiro da clínica.</p>
        </div>
        <Button variant="outline" className="gap-2 print:hidden" onClick={handlePrint}>
          <Download className="w-4 h-4" />
          Exportar PDF
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-lg border border-border shadow-sm print:hidden">
        <div className="w-full sm:w-[180px]">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-[120px]">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }).map((_, i) => {
                const year = new Date().getFullYear() - 2 + i
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleApply}
          className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Aplicar
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="print:hidden">
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
