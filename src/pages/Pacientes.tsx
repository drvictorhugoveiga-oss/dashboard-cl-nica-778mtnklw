import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, AlertCircle } from 'lucide-react'
import { Patient, getPatients, deletePatient } from '@/services/patients'
import { Plan, getPlans } from '@/services/plans'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { PatientTable } from './pacientes/PatientTable'
import { PatientFormModal } from './pacientes/PatientFormModal'
import { PatientDetailsModal } from './pacientes/PatientDetailsModal'

export default function Pacientes() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { toast } = useToast()

  // Filters
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const [pts, pls] = await Promise.all([getPatients(), getPlans()])
      setPatients(pts)
      setPlans(pls)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar pacientes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('patients', loadData)
  useRealtime('plans', loadData)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const filteredPatients = useMemo(() => {
    return patients
      .filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        const matchStatus = statusFilter === 'all' || p.status === statusFilter
        const matchPlan = planFilter === 'all' || p.plan_id === planFilter
        return matchSearch && matchStatus && matchPlan
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [patients, debouncedSearch, statusFilter, planFilter])

  const handleDelete = async () => {
    if (!patientToDelete) return
    try {
      await deletePatient(patientToDelete.id)
      toast({ title: 'Paciente deletado com sucesso', duration: 3000 })
    } catch (err: any) {
      toast({
        title: 'Erro ao deletar',
        description: err.message,
        variant: 'destructive',
        duration: 3000,
      })
    } finally {
      setPatientToDelete(null)
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => {
            setSelectedPatient(null)
            setIsFormOpen(true)
          }}
        >
          <Plus className="size-4 mr-2" /> Novo Paciente
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription className="flex items-center gap-4">
            {error}{' '}
            <Button variant="outline" size="sm" onClick={loadData}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full rounded-[8px] border-border"
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[160px] rounded-[8px] border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-full md:w-[200px] rounded-[8px] border-border">
                  <SelectValue placeholder="Todos Planos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Planos</SelectItem>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <PatientTable
            patients={filteredPatients}
            loading={loading}
            onCreate={() => {
              setSelectedPatient(null)
              setIsFormOpen(true)
            }}
            onEdit={(p) => {
              setSelectedPatient(p)
              setIsFormOpen(true)
            }}
            onView={(p) => {
              setSelectedPatient(p)
              setIsDetailsOpen(true)
            }}
            onDelete={(p) => setPatientToDelete(p)}
          />
        </>
      )}

      <PatientFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        patient={selectedPatient}
        plans={plans}
        onSuccess={loadData}
      />

      <PatientDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        patient={selectedPatient}
      />

      <AlertDialog
        open={!!patientToDelete}
        onOpenChange={(open) => !open && setPatientToDelete(null)}
      >
        <AlertDialogContent className="rounded-[8px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Paciente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este paciente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
