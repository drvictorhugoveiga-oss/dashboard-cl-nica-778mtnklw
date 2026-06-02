import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export function TablesSection({ data }: { data: any }) {
  if (!data) return null

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento Financeiro por Paciente</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Plano Ativo</TableHead>
                <TableHead className="text-right">Meses Ativos</TableHead>
                <TableHead className="text-right">Valor do Plano (Ganho)</TableHead>
                <TableHead className="text-right">Custos Profissionais (Perda)</TableHead>
                <TableHead className="text-right">Lucro Líquido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.patientDetails || []).map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.patientName}</TableCell>
                  <TableCell>{p.planName}</TableCell>
                  <TableCell className="text-right">{p.activeMonths}</TableCell>
                  <TableCell className="text-right text-success">{formatBRL(p.gain)}</TableCell>
                  <TableCell className="text-right text-destructive">{formatBRL(p.loss)}</TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-bold',
                      p.netProfit >= 0 ? 'text-success' : 'text-destructive',
                    )}
                  >
                    {formatBRL(p.netProfit)}
                  </TableCell>
                </TableRow>
              ))}
              {(!data.patientDetails || data.patientDetails.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
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
