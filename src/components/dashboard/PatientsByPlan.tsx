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

const data = [
  { plan: 'VIVA 1', count: 5, revenue: 'R$ 45.200,00' },
  { plan: 'VIVA 2', count: 3, revenue: 'R$ 45.000,00' },
  { plan: 'VIVA 3', count: 2, revenue: 'R$ 44.800,00' },
  { plan: 'VIVA ANUAL', count: 1, revenue: 'R$ 44.000,00' },
]

export function PatientsByPlan({ isLoading }: { isLoading: boolean }) {
  return (
    <Card
      className="lg:col-span-2 transition-all duration-300 hover:shadow-md animate-fade-in-up border-border/50"
      style={{ animationDelay: '400ms' }}
    >
      <CardHeader>
        <CardTitle className="text-lg">Pacientes Ativos por Plano</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Plano</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Receita Mensal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.plan} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{item.plan}</TableCell>
                  <TableCell className="text-right">{item.count} pacientes</TableCell>
                  <TableCell className="text-right">{item.revenue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-transparent">
              <TableRow className="hover:bg-transparent border-t-2 border-border">
                <TableCell className="font-bold text-foreground">Total</TableCell>
                <TableCell className="text-right font-bold text-foreground">11 pacientes</TableCell>
                <TableCell className="text-right font-bold text-primary">R$ 179.000,00</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
