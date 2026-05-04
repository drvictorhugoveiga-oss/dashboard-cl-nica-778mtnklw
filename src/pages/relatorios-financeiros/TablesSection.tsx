import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { formatBRL } from './SummaryCards'

export function TablesSection({ data }: { data: any }) {
  if (!data) return null

  const totalProfCost = data.professionals.reduce((acc: number, p: any) => acc + p.totalCost, 0)
  const totalPlanQty = data.plans.reduce((acc: number, p: any) => acc + p.quantity, 0)
  const totalPlanRev = data.plans.reduce((acc: number, p: any) => acc + p.totalRev, 0)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Custo por Profissional</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader className="table-header-custom">
              <TableRow>
                <TableHead>Profissional</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead className="text-right">Custo Mensal</TableHead>
                <TableHead className="text-right">Total no Período</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.professionals.map((p: any, i: number) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="capitalize">{p.specialty}</TableCell>
                  <TableCell className="text-right">{formatBRL(p.monthlyCost)}</TableCell>
                  <TableCell className="text-right">{formatBRL(p.totalCost)}</TableCell>
                </TableRow>
              ))}
              {data.professionals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    Nenhum custo registrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {data.professionals.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-bold">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-bold text-destructive">
                    {formatBRL(totalProfCost)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pacientes por Plano</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader className="table-header-custom">
              <TableRow>
                <TableHead>Plano</TableHead>
                <TableHead className="text-center">Quantidade</TableHead>
                <TableHead className="text-right">Receita Mensal</TableHead>
                <TableHead className="text-right">Total no Período</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.plans.map((p: any, i: number) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-center">{p.quantity}</TableCell>
                  <TableCell className="text-right">{formatBRL(p.monthlyRev)}</TableCell>
                  <TableCell className="text-right">{formatBRL(p.totalRev)}</TableCell>
                </TableRow>
              ))}
              {data.plans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    Nenhum paciente registrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {data.plans.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="text-center font-bold">{totalPlanQty}</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {formatBRL(totalPlanRev)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
