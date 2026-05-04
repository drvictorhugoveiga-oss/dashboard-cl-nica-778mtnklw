import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingDown, Percent, TrendingUp } from 'lucide-react'

export const formatBRL = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

export function SummaryCards({ data }: { data: any }) {
  if (!data) return null

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Bruta</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{formatBRL(data.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Custo Total Profissionais</CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{formatBRL(data.totalCost)}</div>
          <p className="text-xs text-muted-foreground mt-1">Custo acumulado</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Margem Líquida</CardTitle>
          <Percent className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.netMargin.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">Rentabilidade do período</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
          <TrendingUp className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${data.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}
          >
            {formatBRL(data.netProfit)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Após dedução de custos</p>
        </CardContent>
      </Card>
    </div>
  )
}
