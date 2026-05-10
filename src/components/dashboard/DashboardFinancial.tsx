import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import type { DashboardData } from '@/hooks/use-dashboard-data'

export function DashboardFinancial({
  isLoading,
  data,
}: {
  isLoading: boolean
  data: DashboardData
}) {
  if (isLoading) return <div className="h-[300px] bg-muted/20 animate-pulse rounded-lg" />

  const formatBRL = (val: number) => `R$ ${val.toLocaleString('pt-BR')}`
  const config = {
    revenue: { label: 'Receita', color: '#3b82f6' },
    costs: { label: 'Custos', color: '#ef4444' },
  }

  return (
    <Card className="shadow-subtle">
      <CardHeader>
        <CardTitle className="text-lg">Receita vs Custos (Timeline)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.financialTimeline.length > 0 ? (
          <ChartContainer config={config} className="h-[250px] w-full">
            <BarChart
              data={data.financialTimeline}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `R$ ${val / 1000}k`}
              />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(v: number) => formatBRL(v)} />}
                cursor={{ fill: 'transparent' }}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="revenue"
                name="Receita"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="costs"
                name="Custos"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Sem dados
          </div>
        )}
      </CardContent>
    </Card>
  )
}
