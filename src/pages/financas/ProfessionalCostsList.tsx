import { useState, useEffect, useMemo } from 'react'
import {
  getProfessionalCosts,
  deleteProfessionalCost,
  ProfessionalCost,
} from '@/services/professional_costs'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ProfessionalCostFormModal } from './ProfessionalCostFormModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ProfessionalCostsList({ isAdmin, period }: { isAdmin: boolean; period: string }) {
  const [costs, setCosts] = useState<ProfessionalCost[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCost, setSelectedCost] = useState<ProfessionalCost | null>(null)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const data = await getProfessionalCosts()
      setCosts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('professional_costs', loadData)
  useRealtime('professionals', loadData)

  const totalValue = useMemo(() => {
    return costs.reduce((sum, cost) => sum + cost.cost_per_month, 0)
  }, [costs])

  const sortedCosts = useMemo(() => {
    return costs
      .filter((cost) => !period || (cost.date && cost.date.startsWith(period)))
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
  }, [costs, period])

  const handleDelete = async (id: string) => {
    if (!isAdmin) return
    if (!confirm('Deseja realmente excluir este custo de profissional?')) return
    try {
      await deleteProfessionalCost(id)
      toast({ title: 'Custo removido', className: 'bg-success text-success-foreground' })
    } catch (err) {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
  }

  const handleEdit = (cost: ProfessionalCost) => {
    if (!isAdmin) return
    setSelectedCost(cost)
    setModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Card className="w-full sm:w-auto min-w-[200px] shadow-subtle border-border/50 bg-primary/5">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-primary">Valor Total</CardTitle>
          </CardHeader>
          <CardContent className="py-2 pt-0">
            <div className="text-2xl font-bold">
              {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Button
            onClick={() => {
              setSelectedCost(null)
              setModalOpen(true)
            }}
          >
            <Plus className="size-4 mr-2" />
            Novo Custo
          </Button>
        )}
      </div>

      <div className="rounded-lg border bg-card overflow-hidden shadow-subtle">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              {isAdmin && <TableHead className="text-right w-[100px]">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="h-24 text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : sortedCosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="h-24 text-center">
                  Nenhum custo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              sortedCosts.map((cost) => (
                <TableRow key={cost.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell>
                    {cost.date ? cost.date.substring(0, 10).split('-').reverse().join('/') : '-'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {cost.expand?.professional_id?.name || 'Desconhecido'}
                  </TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-[200px]">
                    {cost.description || '-'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        cost.paid_status
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {cost.paid_status ? 'Pago' : 'Pendente'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-destructive font-medium whitespace-nowrap">
                    {cost.cost_per_month.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(cost)}>
                          <Edit2 className="size-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cost.id)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isAdmin && (
        <ProfessionalCostFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          item={selectedCost}
        />
      )}
    </div>
  )
}
