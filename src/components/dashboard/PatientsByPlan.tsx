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

const data = [
  { plan: 'VIVA 1', count: 5, revenue: 'R$ 45.200,00' },
  { plan: 'VIVA 2', count: 3, revenue: 'R$ 45.000,00' },
  { plan: 'VIVA 3', count: 2, revenue: 'R$ 44.800,00' },
  { plan: 'VIVA ANUAL', count: 1, revenue: 'R$ 44.000,00' },
]

export function PatientsByPlan({ isLoading }: { isLoading: boolean }) {
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
            <div className="hidden md:block">
              <Table>
                <TableHeader className="bg-muted/30">
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
                        'transition-colors duration-200 ease-out hover:bg-muted/80 cursor-default',
                        i % 2 === 0 ? 'bg-card' : 'bg-muted/20',
                      )}
                    >
                      <TableCell className="font-medium">{item.plan}</TableCell>
                      <TableCell className="text-right">{item.count} pacientes</TableCell>
                      <TableCell className="text-right">{item.revenue}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter className="bg-transparent border-t border-border">
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="font-bold text-foreground">Total</TableCell>
                    <TableCell className="text-right font-bold text-foreground">
                      11 pacientes
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      R$ 179.000,00
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
                    <span className="font-bold text-primary">{item.revenue}</span>
                  </div>
                </div>
              ))}
              <div className="border-t border-border mt-2 pt-4 flex justify-between items-center">
                <span className="font-bold">Total (11 pct)</span>
                <span className="font-bold text-primary">R$ 179.000,00</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
