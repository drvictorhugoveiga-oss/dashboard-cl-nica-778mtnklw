import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { PieChart, Pie, Cell } from 'recharts'
import { formatBRL } from './SummaryCards'

export function ChartsSection({ data }: { data: any }) {
  if (!data) return null

  const profitConfig: any = {}
  data.profitPerPlan.forEach((d: any) => {
    profitConfig[d.name] = { label: d.name, color: d.fill }
  })

  const glConfig: any = {}
  data.gainsVsLosses.forEach((d: any) => {
    glConfig[d.name] = { label: d.name, color: d.fill }
  })

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Lucro por Plano</CardTitle>
        </CardHeader>
        <CardContent>
          {data.profitPerPlan.length > 0 ? (
            <ChartContainer config={profitConfig} className="h-[300px] w-full">
              <PieChart>
                <Pie
                  data={data.profitPerPlan}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                >
                  {data.profitPerPlan.map((entry: any, index: number) => (
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
          {data.gainsVsLosses.length > 0 ? (
            <ChartContainer config={glConfig} className="h-[300px] w-full">
              <PieChart>
                <Pie
                  data={data.gainsVsLosses}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                >
                  {data.gainsVsLosses.map((entry: any, index: number) => (
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
  )
}
