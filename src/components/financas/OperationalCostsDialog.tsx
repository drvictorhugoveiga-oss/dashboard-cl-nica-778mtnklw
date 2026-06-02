import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

export function OperationalCostsDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: any
}) {
  const [formData, setFormData] = useState({
    name: '',
    cost_value: '',
    date: '',
    category: 'Outros',
    paid_status: false,
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (item && open) {
      setFormData({
        name: item.name,
        cost_value: item.cost_value.toString(),
        date: item.date ? item.date.substring(0, 10) : '',
        category: item.category || 'Outros',
        paid_status: item.paid_status,
        description: item.description || '',
      })
    } else if (open) {
      setFormData({
        name: '',
        cost_value: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Outros',
        paid_status: false,
        description: '',
      })
    }
  }, [item, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        ...formData,
        cost_value: parseFloat(formData.cost_value),
        date: `${formData.date} 12:00:00.000Z`,
      }
      if (item) {
        await pb.collection('operational_costs').update(item.id, data)
        toast({ title: 'Atualizado com sucesso' })
      } else {
        await pb.collection('operational_costs').create(data)
        toast({ title: 'Criado com sucesso' })
      }
      onOpenChange(false)
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? 'Editar Gasto Operacional' : 'Novo Gasto Operacional'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome/Motivo</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={formData.cost_value}
                onChange={(e) => setFormData({ ...formData, cost_value: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(v) => setFormData({ ...formData, category: v })}
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
                ].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Descrição (Opcional)</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="paid"
              checked={formData.paid_status}
              onCheckedChange={(c) => setFormData({ ...formData, paid_status: c })}
            />
            <Label htmlFor="paid">Gasto Pago?</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
