import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { format, parseISO } from 'date-fns'

import {
  getRevenues,
  createRevenue,
  updateRevenue,
  deleteRevenue,
  Revenue,
} from '@/services/revenue'
import {
  getOperationalCosts,
  createOperationalCost,
  updateOperationalCost,
  deleteOperationalCost,
  OperationalCost,
} from '@/services/operational_costs'
import { useAuth } from '@/hooks/use-auth'

export default function Financas() {
  const { toast } = useToast()

  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [costs, setCosts] = useState<OperationalCost[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [revs, csts] = await Promise.all([getRevenues(), getOperationalCosts()])
      setRevenues(revs)
      setCosts(csts)
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
  useRealtime('operational_costs', loadData)

  // Revenue Form State
  const [revModalOpen, setRevModalOpen] = useState(false)
  const [revEditing, setRevEditing] = useState<Revenue | null>(null)
  const [revForm, setRevForm] = useState<Partial<Revenue>>({})

  // Cost Form State
  const [costModalOpen, setCostModalOpen] = useState(false)
  const [costEditing, setCostEditing] = useState<OperationalCost | null>(null)
  const [costForm, setCostForm] = useState<Partial<OperationalCost>>({})

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'revenue' | 'cost' } | null>(
    null,
  )

  const openRevModal = (rev?: Revenue) => {
    if (rev) {
      setRevEditing(rev)
      setRevForm({ ...rev, date: rev.date.split('T')[0] })
    } else {
      setRevEditing(null)
      setRevForm({
        date: new Date().toISOString().split('T')[0],
        category: 'Consultas',
        value: 0,
        received_status: true,
        description: '',
      })
    }
    setRevModalOpen(true)
  }

  const openCostModal = (cost?: OperationalCost) => {
    if (cost) {
      setCostEditing(cost)
      setCostForm({ ...cost, date: cost.date.split('T')[0] })
    } else {
      setCostEditing(null)
      setCostForm({
        date: new Date().toISOString().split('T')[0],
        category: 'Outros',
        cost_value: 0,
        paid_status: true,
        name: '',
      })
    }
    setCostModalOpen(true)
  }

  const handleRevSubmit = async () => {
    try {
      if (revEditing) await updateRevenue(revEditing.id, revForm)
      else await createRevenue(revForm as Revenue)
      toast({ title: 'Receita salva com sucesso', className: 'bg-success text-success-foreground' })
      setRevModalOpen(false)
    } catch (err: any) {
      toast({ title: 'Erro ao salvar receita', description: err.message, variant: 'destructive' })
    }
  }

  const handleCostSubmit = async () => {
    try {
      if (costEditing) await updateOperationalCost(costEditing.id, costForm)
      else await createOperationalCost(costForm as OperationalCost)
      toast({ title: 'Despesa salva com sucesso', className: 'bg-success text-success-foreground' })
      setCostModalOpen(false)
    } catch (err: any) {
      toast({ title: 'Erro ao salvar despesa', description: err.message, variant: 'destructive' })
    }
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    try {
      if (itemToDelete.type === 'revenue') await deleteRevenue(itemToDelete.id)
      else await deleteOperationalCost(itemToDelete.id)
      toast({
        title: 'Registro excluído com sucesso',
        className: 'bg-success text-success-foreground',
      })
    } catch (err: any) {
      toast({ title: 'Erro ao excluir registro', description: err.message, variant: 'destructive' })
    } finally {
      setDeleteModalOpen(false)
      setItemToDelete(null)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finanças</h1>
        <p className="text-muted-foreground mt-1">Gerencie as receitas e despesas da clínica.</p>
      </div>

      <Tabs defaultValue="revenues" className="w-full">
        <TabsList className="flex flex-wrap w-full mb-6 h-auto p-1 justify-start gap-2 bg-transparent">
          <TabsTrigger
            value="revenues"
            className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card"
          >
            Receitas
          </TabsTrigger>
          <TabsTrigger
            value="costs"
            className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card"
          >
            Despesas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenues">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1">
                <CardTitle>Receitas</CardTitle>
                <CardDescription>Lista de entradas financeiras.</CardDescription>
              </div>
              <Button onClick={() => openRevModal()} className="bg-primary text-primary-foreground">
                <Plus className="size-4 mr-2" /> Nova Receita
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : revenues.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Nenhuma receita encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      revenues.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{format(parseISO(r.date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell className="font-medium">{r.description}</TableCell>
                          <TableCell>{r.category}</TableCell>
                          <TableCell>{r.received_status ? 'Recebido' : 'Pendente'}</TableCell>
                          <TableCell className="text-right text-success font-medium">
                            {r.value.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openRevModal(r)}
                              className="text-primary hover:bg-primary/10"
                            >
                              <Edit2 className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setItemToDelete({ id: r.id, type: 'revenue' })
                                setDeleteModalOpen(true)
                              }}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1">
                <CardTitle>Despesas</CardTitle>
                <CardDescription>Lista de despesas operacionais.</CardDescription>
              </div>
              <Button
                onClick={() => openCostModal()}
                className="bg-primary text-primary-foreground"
              >
                <Plus className="size-4 mr-2" /> Nova Despesa
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : costs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Nenhuma despesa encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      costs.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>{format(parseISO(c.date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell>{c.category}</TableCell>
                          <TableCell>{c.paid_status ? 'Pago' : 'Pendente'}</TableCell>
                          <TableCell className="text-right text-destructive font-medium">
                            {c.cost_value.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openCostModal(c)}
                              className="text-primary hover:bg-primary/10"
                            >
                              <Edit2 className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setItemToDelete({ id: c.id, type: 'cost' })
                                setDeleteModalOpen(true)
                              }}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Revenue Dialog */}
      <Dialog open={revModalOpen} onOpenChange={setRevModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{revEditing ? 'Editar Receita' : 'Nova Receita'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label>Descrição</Label>
              <Input
                value={revForm.description || ''}
                onChange={(e) => setRevForm({ ...revForm, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Valor</Label>
              <Input
                type="number"
                step="0.01"
                value={revForm.value || ''}
                onChange={(e) => setRevForm({ ...revForm, value: parseFloat(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={revForm.date || ''}
                onChange={(e) => setRevForm({ ...revForm, date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Categoria</Label>
              <Select
                value={revForm.category || 'Outros'}
                onValueChange={(val: any) => setRevForm({ ...revForm, category: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Consultas', 'Planos', 'Particulares', 'Outros'].map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={revForm.received_status ? 'true' : 'false'}
                onValueChange={(val) => setRevForm({ ...revForm, received_status: val === 'true' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Recebido</SelectItem>
                  <SelectItem value="false">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleRevSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cost Dialog */}
      <Dialog open={costModalOpen} onOpenChange={setCostModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{costEditing ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label>Descrição / Nome</Label>
              <Input
                value={costForm.name || ''}
                onChange={(e) => setCostForm({ ...costForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Valor</Label>
              <Input
                type="number"
                step="0.01"
                value={costForm.cost_value || ''}
                onChange={(e) =>
                  setCostForm({ ...costForm, cost_value: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={costForm.date || ''}
                onChange={(e) => setCostForm({ ...costForm, date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Categoria</Label>
              <Select
                value={costForm.category || 'Outros'}
                onValueChange={(val: any) => setCostForm({ ...costForm, category: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'Aluguel',
                    'Utilidades',
                    'Materiais',
                    'Manutenção',
                    'Pessoal',
                    'Marketing',
                    'Outros',
                  ].map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={costForm.paid_status ? 'true' : 'false'}
                onValueChange={(val) => setCostForm({ ...costForm, paid_status: val === 'true' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Pago</SelectItem>
                  <SelectItem value="false">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCostSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
