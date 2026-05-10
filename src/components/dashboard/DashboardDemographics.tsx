import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import type { DashboardData } from '@/hooks/use-dashboard-data'

export function DashboardDemographics({
  isLoading,
  data,
}: {
  isLoading: boolean
  data: DashboardData
}) {
  if (isLoading) return <div className="h-[300px] bg-muted/20 animate-pulse rounded-lg" />

  const genderConfig: any = {}
  data.genderDistribution.forEach((d) => {
    genderConfig[d.name] = { label: d.name, color: d.fill }
  })

  const ageConfig = { count: { label: 'Pacientes', color: '#8b5cf6' } }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle className="text-lg">Distribuição por Gênero</CardTitle>
        </CardHeader>
        <CardContent>
          {data.genderDistribution.length > 0 ? (
            <ChartContainer config={genderConfig} className="h-[250px] w-full">
              <PieChart>
                <Pie
                  data={data.genderDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                >
                  {data.genderDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Sem dados
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle className="text-lg">Faixa Etária</CardTitle>
        </CardHeader>
        <CardContent>
          {data.ageDistribution.length > 0 ? (
            <ChartContainer config={ageConfig} className="h-[250px] w-full">
              <BarChart
                data={data.ageDistribution}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'transparent' }} />
                <Bar
                  dataKey="count"
                  name="Pacientes"
                  fill="#8b5cf6"
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
    </div>
  )
}
