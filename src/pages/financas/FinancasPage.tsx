import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RevenueList } from './RevenueList'
import { OperationalCostsList } from '@/components/financas/OperationalCostsList'
import { ProfessionalCostsList } from './ProfessionalCostsList'
import { format, addMonths, subMonths, setMonth, setYear } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export default function FinancasPage() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.role === 'admin'
  const [currentDate, setCurrentDate] = useState(() => new Date())

  if (usuario && usuario.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  const period = format(currentDate, 'yyyy-MM')
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const handleMonthChange = (val: string) => {
    setCurrentDate(setMonth(currentDate, parseInt(val, 10)))
  }

  const handleYearChange = (val: string) => {
    setCurrentDate(setYear(currentDate, parseInt(val, 10)))
  }

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finanças</h1>
          <p className="text-muted-foreground mt-1">
            Gestão centralizada de ganhos e custos da clínica.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-card border rounded-md p-1 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[120px] h-8 border-none shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={currentYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[90px] h-8 border-none shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ganhos" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto overflow-y-hidden hide-scrollbar">
          <TabsTrigger
            value="ganhos"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Ganhos
          </TabsTrigger>
          <TabsTrigger
            value="custos-operacionais"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Custos Operacionais
          </TabsTrigger>
          <TabsTrigger
            value="custos-profissionais"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Custos de Profissionais
          </TabsTrigger>
        </TabsList>

        <div className="pt-6">
          <TabsContent value="ganhos" className="m-0 focus-visible:outline-none">
            <RevenueList isAdmin={isAdmin} period={period} />
          </TabsContent>
          <TabsContent value="custos-operacionais" className="m-0 focus-visible:outline-none">
            <OperationalCostsList isAdmin={isAdmin} period={period} />
          </TabsContent>
          <TabsContent
            value="custos-profissionais"
            className="m-0 focus-visible:outline-none space-y-4"
          >
            <ProfessionalCostsList isAdmin={isAdmin} period={period} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
