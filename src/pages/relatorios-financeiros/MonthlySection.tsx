import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatBRL } from './SummaryCards'
import { cn } from '@/lib/utils'

export function MonthlySection({ data }: { data: any }) {
  if (!data || !data.details) return null

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Ganhos vs Gastos por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.details} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="monthLabel"
                  stroke="hsl(var(--foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `R$ ${val}`}
                />
                <RechartsTooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  formatter={(val: number) => formatBRL(val)}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar
                  dataKey="revenue"
                  name="Ganhos"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
                <Bar
                  dataKey="costs"
                  name="Gastos"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento Mensal</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead className="text-right">Ganhos</TableHead>
                <TableHead className="text-right">Gastos</TableHead>
                <TableHead className="text-right">Lucro Líquido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.details.map((m: any, i: number) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{m.monthLabel}</TableCell>
                  <TableCell className="text-right text-success">{formatBRL(m.revenue)}</TableCell>
                  <TableCell className="text-right text-destructive">
                    {formatBRL(m.costs)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-bold',
                      m.net >= 0 ? 'text-success' : 'text-destructive',
                    )}
                  >
                    {formatBRL(m.net)}
                  </TableCell>
                </TableRow>
              ))}
              {data.details.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    Nenhum dado para o período
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
