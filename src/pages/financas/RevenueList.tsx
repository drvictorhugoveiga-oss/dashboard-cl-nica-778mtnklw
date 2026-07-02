import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, CheckCircle2, Circle, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { format } from 'date-fns'
import { RevenueDialog } from '@/components/financas/RevenueDialog'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

export function RevenueList({ isAdmin, period }: { isAdmin?: boolean; period?: string }) {
  const [data, setData] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const res = await pb.collection('revenue').getFullList({ sort: '-date,-created' })
      setData(res)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('revenue', loadData)

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este registro?')) return
    try {
      await pb.collection('revenue').delete(id)
      toast({ title: 'Excluído com sucesso' })
    } catch (e) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  const handleToggleStatus = async (item: any) => {
    try {
      await pb.collection('revenue').update(item.id, { received_status: !item.received_status })
    } catch (e) {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' })
    }
  }

  const filteredData = data.filter((item) => !period || (item.date && item.date.startsWith(period)))
  const totalRevenue = filteredData.reduce((sum, item) => sum + (item.value || 0), 0)

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-card to-card/50 border-success/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-success/10">
              <TrendingUp className="size-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Receita Bruta</p>
              <p className="text-2xl font-bold text-success">
                {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ganhos</CardTitle>
          {isAdmin !== false && (
            <Button
              onClick={() => {
                setEditingItem(null)
                setDialogOpen(true)
              }}
            >
              <Plus className="size-4 mr-2" /> Novo Ganho
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.date ? format(new Date(item.date), 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell>R$ {item.value.toFixed(2)}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className="flex items-center gap-1 hover:opacity-80"
                    >
                      {item.received_status ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600">
                          <CheckCircle2 className="size-3 mr-1" /> Recebido
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Circle className="size-3 mr-1" /> Pendente
                        </Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {isAdmin !== false && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingItem(item)
                            setDialogOpen(true)
                          }}
                        >
                          <Edit2 className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RevenueDialog open={dialogOpen} onOpenChange={setDialogOpen} item={editingItem} />
    </div>
  )
}
