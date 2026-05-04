import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { PlanStats } from '@/hooks/use-dashboard-data'

interface Props {
  isLoading: boolean
  data?: PlanStats[]
  totalCount?: number
  totalRevenue?: number
}

export function PatientsByPlan({ isLoading, data = [], totalCount = 0, totalRevenue = 0 }: Props) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <Card
      className="lg:col-span-2 transition-all duration-200 ease-out hover:shadow-subtle animate-fade-in border-border rounded-lg"
      style={{ animationDelay: '200ms' }}
    >
      <CardHeader className="px-6 py-4 border-b border-border/50">
        <CardTitle className="text-lg font-bold">Pacientes Ativos por Plano</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-foreground">Plano</TableHead>
                    <TableHead className="text-right font-bold text-foreground">
                      Quantidade
                    </TableHead>
                    <TableHead className="text-right font-bold text-foreground">
                      Receita Mensal
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, i) => (
                    <TableRow
                      key={item.plan}
                      className={cn(
                        'transition-colors duration-200 ease-out hover:bg-muted/80 hover:shadow-sm cursor-default',
                        i % 2 === 0 ? 'bg-card' : 'bg-muted/20',
                      )}
                    >
                      <TableCell className="font-medium">{item.plan}</TableCell>
                      <TableCell className="text-right">{item.count} pacientes</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                        Nenhum paciente ativo.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter className="bg-transparent border-t border-border">
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="font-bold text-foreground">Total</TableCell>
                    <TableCell className="text-right font-bold text-foreground">
                      {totalCount} pacientes
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {formatCurrency(totalRevenue)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            <div className="md:hidden flex flex-col gap-4 p-4">
              {data.map((item) => (
                <div
                  key={item.plan}
                  className="border border-border rounded-lg p-4 bg-card shadow-sm flex flex-col gap-2 transition-all duration-200 hover:shadow-subtle"
                >
                  <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="font-bold text-foreground">{item.plan}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Quantidade:</span>
                    <span className="font-medium">{item.count} pacientes</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Receita:</span>
                    <span className="font-bold text-primary">{formatCurrency(item.revenue)}</span>
                  </div>
                </div>
              ))}
              {data.length === 0 && (
                <div className="text-center text-muted-foreground py-6 text-sm">
                  Nenhum paciente ativo.
                </div>
              )}
              <div className="border-t border-border mt-2 pt-4 flex justify-between items-center">
                <span className="font-bold">Total ({totalCount} pct)</span>
                <span className="font-bold text-primary">{formatCurrency(totalRevenue)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
