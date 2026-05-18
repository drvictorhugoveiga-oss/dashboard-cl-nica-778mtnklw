import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { FileText } from 'lucide-react'
import type { DashboardData } from '@/hooks/use-dashboard-data'

export function DashboardConsultations({
  isLoading,
  data,
}: {
  isLoading: boolean
  data: DashboardData
}) {
  if (isLoading) return <div className="h-[300px] bg-muted/20 animate-pulse rounded-lg" />

  const chartConfig = { count: { label: 'Atendimentos', color: '#10b981' } }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle className="text-lg">Volume de Atendimentos (Mês)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[250px] pb-6">
          <div className="flex items-center justify-center size-24 rounded-full bg-emerald-500/10 mb-6">
            <FileText className="size-12 text-emerald-500" />
          </div>
          <div className="text-5xl font-bold text-emerald-600">{data.monthlyConsultations}</div>
          <div className="text-sm text-muted-foreground mt-2 font-medium">
            Notas Clínicas Criadas
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle className="text-lg">Atendimentos por Profissional</CardTitle>
        </CardHeader>
        <CardContent>
          {data.consultationsByProfessional.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart
                data={data.consultationsByProfessional}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'transparent' }} />
                <Bar
                  dataKey="count"
                  name="Atendimentos"
                  fill="#10b981"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
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
