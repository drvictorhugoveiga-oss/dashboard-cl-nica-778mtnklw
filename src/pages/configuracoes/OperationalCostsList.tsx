import { useState, useEffect, useMemo } from 'react'
import {
  getOperationalCosts,
  deleteOperationalCost,
  OperationalCost,
} from '@/services/operational_costs'
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
import { OperationalCostFormModal } from './OperationalCostFormModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, parseISO } from 'date-fns'

export function OperationalCostsList({ isAdmin }: { isAdmin: boolean }) {
  const [costs, setCosts] = useState<OperationalCost[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCost, setSelectedCost] = useState<OperationalCost | null>(null)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const data = await getOperationalCosts()
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
  useRealtime('operational_costs', loadData)

  const totalValue = useMemo(() => {
    return costs.reduce((sum, cost) => sum + cost.cost_value, 0)
  }, [costs])

  const handleDelete = async (id: string) => {
    if (!isAdmin) return
    if (!confirm('Deseja realmente excluir esta despesa?')) return
    try {
      await deleteOperationalCost(id)
      toast({ title: 'Despesa removida', className: 'bg-success text-success-foreground' })
    } catch (err) {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
  }

  const handleEdit = (cost: OperationalCost) => {
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
            Nova Despesa
          </Button>
        )}
      </div>

      <div className="rounded-lg border bg-card overflow-hidden shadow-subtle">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              {isAdmin && <TableHead className="text-right w-[100px]">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="h-24 text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : costs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="h-24 text-center">
                  Nenhuma despesa encontrada.
                </TableCell>
              </TableRow>
            ) : (
              costs.map((cost) => (
                <TableRow key={cost.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell>{format(parseISO(cost.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="font-medium">{cost.name}</TableCell>
                  <TableCell>{cost.category || '-'}</TableCell>
                  <TableCell className="text-right text-destructive font-medium whitespace-nowrap">
                    {cost.cost_value.toLocaleString('pt-BR', {
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
        <OperationalCostFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          item={selectedCost}
        />
      )}
    </div>
  )
}
