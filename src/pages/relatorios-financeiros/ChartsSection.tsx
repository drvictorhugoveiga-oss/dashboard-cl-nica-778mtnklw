import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { PieChart, Pie, Cell, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts'
import { formatBRL } from './SummaryCards'

export function ChartsSection({ data }: { data: any }) {
  if (!data) return null

  const profitPerPlan = data.general?.profitPerPlan || data.profitPerPlan || []
  const gainsVsLosses = data.general?.gainsVsLosses || data.gainsVsLosses || []
  const monthlyDetails = data.monthly?.details || []

  const profitConfig: any = {}
  profitPerPlan.forEach((d: any) => {
    profitConfig[d.name] = { label: d.name, color: d.fill }
  })

  const glConfig: any = {}
  gainsVsLosses.forEach((d: any) => {
    glConfig[d.name] = { label: d.name, color: d.fill }
  })

  const monthlyConfig: any = {
    revenue: { label: 'Ganhos', color: '#22c55e' },
    costs: { label: 'Custos', color: '#ef4444' },
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receita por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {profitPerPlan.length > 0 ? (
              <ChartContainer config={profitConfig} className="h-[300px] w-full">
                <PieChart>
                  <Pie
                    data={profitPerPlan}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                  >
                    {profitPerPlan.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(v: number) => formatBRL(v)} />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados para este período
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ganhos vs Perdas</CardTitle>
          </CardHeader>
          <CardContent>
            {gainsVsLosses.length > 0 ? (
              <ChartContainer config={glConfig} className="h-[300px] w-full">
                <PieChart>
                  <Pie
                    data={gainsVsLosses}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                  >
                    {gainsVsLosses.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(v: number) => formatBRL(v)} />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados para este período
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comparativo Mensal (Ganhos vs Custos)</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyDetails.length > 0 ? (
            <ChartContainer config={monthlyConfig} className="h-[350px] w-full">
              <BarChart data={monthlyDetails}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="monthLabel" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    new Intl.NumberFormat('pt-BR', {
                      notation: 'compact',
                      style: 'currency',
                      currency: 'BRL',
                    }).format(value)
                  }
                  width={80}
                />
                <ChartTooltip
                  content={<ChartTooltipContent formatter={(v: number) => formatBRL(v)} />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="costs" fill="var(--color-costs)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              Sem dados para este período
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
