import { useState, useEffect, useCallback } from 'react'
import { getProfessionals, deleteProfessional } from '@/services/professionals'
import { useRealtime } from '@/hooks/use-realtime'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { Button } from '@/components/ui/button'
import { Plus, Filter, User } from 'lucide-react'
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

interface Props {
  selectedProfId: string
  onSelectProf: (id: string) => void
}

export function ProfissionaisList({ selectedProfId, onSelectProf }: Props) {
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
      if (selectedProfId === id) {
        onSelectProf('')
      }
      toast({
        title: 'Profissional deletado com sucesso',
        className: 'bg-success text-success-foreground',
        duration: 3000,
      })
    } catch (err: unknown) {
      toast({
        title: 'Erro ao deletar',
        description: getErrorMessage(err) || 'Não foi possível deletar o profissional.',
        variant: 'destructive',
        duration: 5000,
      })
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
          <SelectTrigger className="w-full sm:w-[240px]">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <SelectValue placeholder="Todas as especialidades" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as especialidades</SelectItem>
            <SelectItem value="enfermagem">Enfermagem</SelectItem>
            <SelectItem value="fisioterapia">Fisioterapia</SelectItem>
            <SelectItem value="fonoaudiologia">Fonoaudiologia</SelectItem>
            <SelectItem value="medicina">Medicina</SelectItem>
            <SelectItem value="nutrição">Nutrição</SelectItem>
            <SelectItem value="psicologia">Psicologia</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={handleNew}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="size-4 mr-2" />
          Novo Profissional
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] w-full rounded-lg animate-pulse duration-1500" />
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
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-lg bg-card shadow-subtle animate-fade-in">
          <div className="flex size-16 items-center justify-center rounded-full bg-slate-50 mb-4">
            <User className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold tracking-tight mb-2">Nenhum profissional cadastrado</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Adicione seu primeiro profissional para começar a gerenciar custos.
          </p>
          <Button
            onClick={handleNew}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="size-4 mr-2" />
            Novo Profissional
          </Button>
        </div>
      ) : (
        <ProfissionaisTable
          data={data}
          onEdit={handleEdit}
          onDelete={handleDelete}
          selectedProfId={selectedProfId}
          onSelectProf={onSelectProf}
        />
      )}

      <ProfissionalForm open={formOpen} onOpenChange={setFormOpen} item={editingItem} />
    </div>
  )
}
