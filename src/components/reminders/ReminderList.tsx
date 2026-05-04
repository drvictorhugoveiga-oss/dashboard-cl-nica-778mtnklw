import { isBefore, isAfter, addDays, startOfDay, parseISO } from 'date-fns'
import { Edit2, CheckCircle2, Trash2, CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { TYPE_LABELS, STATUS_LABELS } from './constants'
import type { Reminder } from '@/services/reminders'
import { cn } from '@/lib/utils'

interface Props {
  reminders: Reminder[]
  isLoading: boolean
  onEdit: (r: Reminder) => void
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  onCreateNew: () => void
}

function getUrgencyStatus(dateStr: string, status: string) {
  if (status !== 'pending') return 'none'
  const scheduled = startOfDay(parseISO(dateStr))
  const today = startOfDay(new Date())
  if (isBefore(scheduled, today)) return 'overdue'
  if (!isAfter(scheduled, addDays(today, 7))) return 'upcoming'
  return 'none'
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr))
}

export function ReminderList({
  reminders,
  isLoading,
  onEdit,
  onComplete,
  onDelete,
  onCreateNew,
}: Props) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    )
  }

  if (reminders.length === 0) {
    return (
      <EmptyState
        title="Nenhum lembrete encontrado"
        description="Você não possui lembretes cadastrados no momento."
        action={{ label: '+ Novo Lembrete', onClick: onCreateNew }}
      />
    )
  }

  const renderActions = (r: Reminder) => (
    <div className="flex items-center gap-2">
      {r.status === 'pending' && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onComplete(r.id)}
          title="Marcar como Concluído"
        >
          <CheckCircle2 className="size-4 text-green-600" />
        </Button>
      )}
      <Button variant="ghost" size="icon" onClick={() => onEdit(r)} title="Editar">
        <Edit2 className="size-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" title="Excluir">
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Lembrete?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O lembrete será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(r.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )

  const getUrgencyClass = (urgency: string) => {
    if (urgency === 'overdue') return 'text-destructive font-semibold'
    if (urgency === 'upcoming') return 'text-blue-500 font-medium'
    return ''
  }

  return (
    <>
      <div className="hidden md:block border rounded-lg overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Data Agendada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reminders.map((r) => {
              const urgency = getUrgencyStatus(r.scheduled_date, r.status)
              return (
                <TableRow key={r.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{r.expand?.patient_id?.name}</TableCell>
                  <TableCell>{TYPE_LABELS[r.type]}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={r.description}>
                    {r.title}
                  </TableCell>
                  <TableCell className={cn('flex items-center gap-2', getUrgencyClass(urgency))}>
                    <CalendarClock className="size-4" />
                    {formatDate(r.scheduled_date)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        r.status === 'completed'
                          ? 'default'
                          : r.status === 'cancelled'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {STATUS_LABELS[r.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right flex justify-end">{renderActions(r)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 md:hidden">
        {reminders.map((r) => {
          const urgency = getUrgencyStatus(r.scheduled_date, r.status)
          return (
            <Card key={r.id} className="overflow-hidden">
              <CardContent className="p-4 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-base">{r.expand?.patient_id?.name}</h4>
                    <p className="text-sm text-muted-foreground">{r.title}</p>
                  </div>
                  <Badge variant={r.status === 'completed' ? 'default' : 'outline'}>
                    {STATUS_LABELS[r.status]}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">Tipo</span>
                    <span className="font-medium">{TYPE_LABELS[r.type]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Data</span>
                    <span className={cn('font-medium', getUrgencyClass(urgency))}>
                      {formatDate(r.scheduled_date)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end pt-2 border-t border-border/50 mt-2">
                  {renderActions(r)}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}
