import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, CheckCircle2, Circle } from 'lucide-react'
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
import { RevenueDialog } from './RevenueDialog'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

export function RevenueList() {
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ganhos</CardTitle>
        <Button
          onClick={() => {
            setEditingItem(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="size-4 mr-2" /> Novo Ganho
        </Button>
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
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.date ? format(new Date(item.date), 'dd/MM/yyyy') : '-'}</TableCell>
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
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <RevenueDialog open={dialogOpen} onOpenChange={setDialogOpen} item={editingItem} />
    </Card>
  )
}
