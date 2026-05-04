import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getReminders, updateReminder, deleteReminder, type Reminder } from '@/services/reminders'
import { useRealtime } from '@/hooks/use-realtime'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { ReminderList } from '@/components/reminders/ReminderList'
import { ReminderForm } from '@/components/reminders/ReminderForm'
import { TYPE_LABELS, STATUS_LABELS } from '@/components/reminders/constants'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function Lembretes() {
  const { toast } = useToast()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('pending')
  const [filterType, setFilterType] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | undefined>(undefined)

  const loadData = async () => {
    try {
      setIsLoading(true)
      const data = await getReminders(filterStatus, filterType)
      setReminders(data)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar',
        description: getErrorMessage(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filterStatus, filterType])

  useRealtime('reminders', () => {
    loadData()
  })

  const handleOpenDialog = (reminder?: Reminder) => {
    setEditingReminder(reminder)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingReminder(undefined)
  }

  const handleComplete = async (id: string) => {
    try {
      await updateReminder(id, { status: 'completed' })
      toast({ title: 'Lembrete concluído' })
      loadData()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(error) })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteReminder(id)
      toast({ title: 'Lembrete deletado' })
      loadData()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(error) })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Lembretes e Follow-ups</h1>
        <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
          <Plus className="size-4 mr-2" />
          Novo Lembrete
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-64">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-64">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ReminderList
        reminders={reminders}
        isLoading={isLoading}
        onEdit={handleOpenDialog}
        onComplete={handleComplete}
        onDelete={handleDelete}
        onCreateNew={() => handleOpenDialog()}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingReminder ? 'Editar Lembrete' : 'Novo Lembrete'}</DialogTitle>
          </DialogHeader>
          <ReminderForm
            initialData={editingReminder}
            onSuccess={handleCloseDialog}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
