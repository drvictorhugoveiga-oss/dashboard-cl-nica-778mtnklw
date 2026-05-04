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
  if (status === 'completed') return 'completed'
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
      <div className="space-y-4 w-full">
        <div className="hidden md:block border border-gray-200 rounded-[8px] overflow-hidden bg-card w-full">
          <div className="h-12 bg-muted/30 border-b"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-none border-b border-white" />
          ))}
        </div>
        <div className="flex flex-col gap-4 md:hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-[8px]" />
          ))}
        </div>
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
    <div className="flex items-center gap-1 justify-end">
      {r.status === 'pending' && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-success hover:text-success hover:bg-success/20"
          onClick={() => onComplete(r.id)}
          title="Marcar como Concluído"
        >
          <CheckCircle2 className="size-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/20"
        onClick={() => onEdit(r)}
        title="Editar"
      >
        <Edit2 className="size-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/20"
            title="Excluir"
          >
            <Trash2 className="size-4" />
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

  const getRowClass = (urgency: string, index: number) => {
    let base = index % 2 === 0 ? 'bg-card' : 'bg-muted/30'
    let highlight = ''
    if (urgency === 'overdue') {
      highlight = 'bg-highlight-red animate-pulse-subtle'
    } else if (urgency === 'upcoming') {
      highlight = 'bg-highlight-blue'
    } else if (urgency === 'completed') {
      highlight = 'bg-highlight-green'
    }
    return cn(base, highlight, 'hover:bg-muted cursor-pointer transition-colors duration-200')
  }

  const getUrgencyClass = (urgency: string) => {
    if (urgency === 'overdue') return 'text-[hsl(0,84%,60%)] font-semibold'
    if (urgency === 'upcoming') return 'text-[hsl(212,100%,48%)] font-medium'
    if (urgency === 'completed') return 'text-[hsl(142,71%,45%)] font-medium'
    return ''
  }

  return (
    <>
      <div className="hidden md:block border border-gray-200 rounded-[8px] overflow-hidden bg-card shadow-subtle w-full max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="table-header-custom">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-foreground">Paciente</TableHead>
              <TableHead className="font-bold text-foreground">Tipo</TableHead>
              <TableHead className="font-bold text-foreground">Título</TableHead>
              <TableHead className="font-bold text-foreground">Data Agendada</TableHead>
              <TableHead className="font-bold text-foreground text-center">Status</TableHead>
              <TableHead className="font-bold text-foreground text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reminders.map((r, i) => {
              const urgency = getUrgencyStatus(r.scheduled_date, r.status)
              return (
                <TableRow key={r.id} className={getRowClass(urgency, i)}>
                  <TableCell className="font-medium text-left">
                    {r.expand?.patient_id?.name}
                  </TableCell>
                  <TableCell className="text-left">{TYPE_LABELS[r.type]}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-left" title={r.description}>
                    {r.title}
                  </TableCell>
                  <TableCell className="text-left">
                    <div className={cn('flex items-center gap-2', getUrgencyClass(urgency))}>
                      <CalendarClock className="size-4" />
                      {formatDate(r.scheduled_date)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
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
        {reminders.map((r, i) => {
          const urgency = getUrgencyStatus(r.scheduled_date, r.status)
          return (
            <Card
              key={r.id}
              className={cn(
                'overflow-hidden rounded-[8px] shadow-subtle border-b-2',
                urgency === 'overdue'
                  ? 'border-destructive'
                  : urgency === 'upcoming'
                    ? 'border-primary'
                    : urgency === 'completed'
                      ? 'border-success'
                      : 'border-border',
              )}
            >
              <CardContent className="p-[16px] flex flex-col gap-4 bg-card">
                <div className="flex justify-between items-start mb-2 border-b pb-2">
                  <div>
                    <h4 className="font-bold text-[16px]">{r.expand?.patient_id?.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{r.title}</p>
                  </div>
                  <Badge variant={r.status === 'completed' ? 'default' : 'outline'}>
                    {STATUS_LABELS[r.status]}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">Tipo</span>
                    <span className="font-medium">{TYPE_LABELS[r.type]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs mb-1">Data</span>
                    <div
                      className={cn(
                        'font-medium flex items-center gap-1',
                        getUrgencyClass(urgency),
                      )}
                    >
                      <CalendarClock className="size-3" />
                      {formatDate(r.scheduled_date)}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-border mt-2">
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
