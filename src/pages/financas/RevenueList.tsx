import { useState, useEffect, useMemo } from 'react'
import { getRevenues, deleteRevenue, Revenue } from '@/services/revenue'
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
import { Plus, Edit2, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { RevenueFormModal } from './RevenueFormModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

export function RevenueList({ isAdmin, period }: { isAdmin: boolean; period: string }) {
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Revenue | null>(null)
  const { toast } = useToast()

  const [categoryFilter, setCategoryFilter] = useState('all')

  const loadData = async () => {
    try {
      const data = await getRevenues()
      setRevenues(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('revenue', loadData)

  const filteredRevenues = useMemo(() => {
    return revenues.filter((r) => {
      const matchCat = categoryFilter === 'all' || r.category === categoryFilter
      const matchMonth = !period || (r.date && r.date.startsWith(period))
      return matchCat && matchMonth
    })
  }, [revenues, categoryFilter, period])

  const totalValue = useMemo(() => {
    return filteredRevenues.reduce((sum, item) => sum + item.value, 0)
  }, [filteredRevenues])

  const handleDelete = async (id: string) => {
    if (!isAdmin) return
    if (!confirm('Deseja realmente excluir este ganho?')) return
    try {
      await deleteRevenue(id)
      toast({ title: 'Ganho removido', className: 'bg-success text-success-foreground' })
    } catch (err) {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
  }

  const handleEdit = (item: Revenue) => {
    if (!isAdmin) return
    setSelectedItem(item)
    setModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
          <Card className="w-full sm:w-auto min-w-[200px] shadow-subtle border-border/50 bg-success/5">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium text-success">Total de Ganhos</CardTitle>
            </CardHeader>
            <CardContent className="py-2 pt-0">
              <div className="text-2xl font-bold">
                {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Consultas">Consultas</SelectItem>
                <SelectItem value="Planos">Planos</SelectItem>
                <SelectItem value="Particulares">Particulares</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isAdmin && (
          <Button
            onClick={() => {
              setSelectedItem(null)
              setModalOpen(true)
            }}
            className="w-full sm:w-auto bg-success hover:bg-success/90 text-success-foreground"
          >
            <Plus className="size-4 mr-2" />
            Adicionar Ganho
          </Button>
        )}
      </div>

      <div className="rounded-lg border bg-card overflow-hidden shadow-subtle">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-center">Status</TableHead>
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
            ) : filteredRevenues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="h-24 text-center">
                  Nenhum ganho encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredRevenues.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell>
                    {item.date ? item.date.substring(0, 10).split('-').reverse().join('/') : '-'}
                  </TableCell>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-center">
                    {item.received_status ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                        <CheckCircle2 className="size-3" /> Recebido
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 px-2 py-1 rounded-full">
                        <Circle className="size-3" /> Pendente
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-success font-medium whitespace-nowrap">
                    {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                          <Edit2 className="size-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
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
        <RevenueFormModal open={modalOpen} onOpenChange={setModalOpen} item={selectedItem} />
      )}
    </div>
  )
}
