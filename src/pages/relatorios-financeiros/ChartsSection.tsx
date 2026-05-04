import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { formatBRL } from './SummaryCards'

export function ChartsSection({ data }: { data: any }) {
  if (!data) return null

  const pieConfig: any = {}
  data.pieData.forEach((d: any) => {
    pieConfig[d.name] = { label: d.name, color: d.fill }
  })

  const barConfig = {
    revenue: { label: 'Receita', color: '#3b82f6' },
    costs: { label: 'Custos', color: '#ef4444' },
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Receita por Plano</CardTitle>
        </CardHeader>
        <CardContent>
          {data.pieData.length > 0 ? (
            <ChartContainer config={pieConfig} className="h-[300px] w-full">
              <PieChart>
                <Pie
                  data={data.pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                >
                  {data.pieData.map((entry: any, index: number) => (
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
          <CardTitle>Receita vs Custos (Timeline)</CardTitle>
        </CardHeader>
        <CardContent>
          {data.timeline.length > 0 ? (
            <ChartContainer config={barConfig} className="h-[300px] w-full">
              <BarChart data={data.timeline} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Sem dados para este período
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
