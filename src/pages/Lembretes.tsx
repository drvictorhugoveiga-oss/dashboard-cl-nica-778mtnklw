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

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    try {
      await updateReminder(id, { status: newStatus as 'completed' | 'pending' })
      toast({
        title: newStatus === 'completed' ? 'Lembrete concluído' : 'Lembrete reativado',
        duration: 3000,
        className:
          newStatus === 'completed'
            ? 'bg-success text-success-foreground'
            : 'bg-primary text-primary-foreground',
      })
      loadData()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: getErrorMessage(error),
        duration: 3000,
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteReminder(id)
      toast({ title: 'Lembrete deletado', duration: 3000 })
      loadData()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: getErrorMessage(error),
        duration: 3000,
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-[24px] font-bold tracking-tight">Lembretes e Follow-ups</h1>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-primary text-primary-foreground hover:shadow-elevation hover:bg-primary/90 transition-all duration-200"
        >
          <Plus className="size-4 mr-2" />
          Novo Lembrete
        </Button>
      </div>

      <div className="flex flex-row gap-4 mb-6">
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
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
        onCreateNew={() => handleOpenDialog()}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[8px] bg-card p-6 shadow-elevation animate-fade-in duration-200">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-[20px] font-bold">
              {editingReminder ? 'Editar Lembrete' : 'Novo Lembrete'}
            </DialogTitle>
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
