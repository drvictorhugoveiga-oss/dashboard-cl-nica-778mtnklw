import { useState, useEffect, useCallback } from 'react'
import { getProfessionals, deleteProfessional } from '@/services/professionals'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
import { useToast } from '@/hooks/use-toast'
import { ProfissionalForm } from './ProfissionalForm'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProfissionaisTable } from './ProfissionaisTable'
import { Skeleton } from '@/components/ui/skeleton'

export function ProfissionaisList() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [specialty, setSpecialty] = useState<string>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(false)
      const filter = specialty !== 'all' ? specialty : undefined
      const res = await getProfessionals(filter)
      setData(res)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [specialty])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('professionals', loadData)

  const handleDelete = async (id: string) => {
    try {
      await deleteProfessional(id)
      toast({ title: 'Profissional deletado com sucesso' })
    } catch {
      toast({ title: 'Erro ao deletar profissional', variant: 'destructive' })
    }
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormOpen(true)
  }

  const handleNew = () => {
    setEditingItem(null)
    setFormOpen(true)
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <Select value={specialty} onValueChange={setSpecialty}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Todas as especialidades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as especialidades</SelectItem>
            <SelectItem value="nutrição">Nutrição</SelectItem>
            <SelectItem value="psicologia">Psicologia</SelectItem>
            <SelectItem value="fisioterapia">Fisioterapia</SelectItem>
            <SelectItem value="fonoaudiologia">Fonoaudiologia</SelectItem>
            <SelectItem value="enfermagem">Enfermagem</SelectItem>
            <SelectItem value="médico">Médico</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleNew} className="w-full sm:w-auto">
          <Plus className="size-4 mr-2" />
          Novo Profissional
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-destructive mb-4">Erro ao carregar profissionais.</p>
          <Button variant="outline" onClick={loadData}>
            Tentar novamente
          </Button>
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          title="Nenhum profissional cadastrado"
          description="Adicione seu primeiro profissional para começar."
        />
      ) : (
        <ProfissionaisTable data={data} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <ProfissionalForm open={formOpen} onOpenChange={setFormOpen} item={editingItem} />
    </div>
  )
}
