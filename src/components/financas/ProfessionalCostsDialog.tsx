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

export function ProfessionalCostsDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: any
}) {
  const [formData, setFormData] = useState({
    professional_id: '',
    cost_per_month: '',
    date: '',
    paid_status: false,
    description: '',
  })
  const [professionals, setProfessionals] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    pb.collection('professionals')
      .getFullList({ sort: 'name' })
      .then(setProfessionals)
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (item && open) {
      setFormData({
        professional_id: item.professional_id,
        cost_per_month: item.cost_per_month.toString(),
        date: item.date ? item.date.split(' ')[0] : new Date().toISOString().split('T')[0],
        paid_status: item.paid_status,
        description: item.description || '',
      })
    } else if (open) {
      setFormData({
        professional_id: '',
        cost_per_month: '',
        date: new Date().toISOString().split('T')[0],
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
        cost_per_month: parseFloat(formData.cost_per_month),
        plan_id: null, // Unlinking plans for simplified monthly model
      }
      if (item) {
        await pb.collection('professional_costs').update(item.id, data)
        toast({ title: 'Atualizado com sucesso' })
      } else {
        await pb.collection('professional_costs').create(data)
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
          <DialogTitle>
            {item ? 'Editar Custo Profissional' : 'Novo Custo Profissional'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Profissional</Label>
            <Select
              required
              value={formData.professional_id}
              onValueChange={(v) => setFormData({ ...formData, professional_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o profissional" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Custo Fixo (Mês) (R$)</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={formData.cost_per_month}
                onChange={(e) => setFormData({ ...formData, cost_per_month: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Mês de Referência (Data)</Label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
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
              id="prof_paid"
              checked={formData.paid_status}
              onCheckedChange={(c) => setFormData({ ...formData, paid_status: c })}
            />
            <Label htmlFor="prof_paid">Custo Pago?</Label>
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
