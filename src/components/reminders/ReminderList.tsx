import { useState } from 'react'
import { isBefore, isAfter, addDays, startOfDay, parseISO } from 'date-fns'
import { Edit2, CheckCircle2, Trash2, CalendarClock, Eye } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { TYPE_LABELS, STATUS_LABELS } from './constants'
import type { Reminder } from '@/services/reminders'
import { cn } from '@/lib/utils'

interface Props {
  reminders: Reminder[]
  isLoading: boolean
  onEdit: (r: Reminder) => void
  onToggleStatus: (id: string, currentStatus: string) => void
  onDelete: (id: string) => void
  onCreateNew: () => void
}

function getUrgencyStatus(dateStr: string, status: string) {
  if (status === 'completed') return 'completed'
  if (status !== 'pending') return 'none'
  const scheduled = startOfDay(parseISO(dateStr))
  const today = startOfDay(new Date())
  if (isBefore(scheduled, today)) return 'overdue'
  if (!isAfter(scheduled, addDays(today, 1))) return 'upcoming'
  return 'none'
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr))
}

export function ReminderList({
  reminders,
  isLoading,
  onEdit,
  onToggleStatus,
  onDelete,
  onCreateNew,
}: Props) {
  const [viewingReminder, setViewingReminder] = useState<Reminder | null>(null)

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
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/20 font-medium"
        onClick={() => setViewingReminder(r)}
        title="Ver"
      >
        <Eye className="size-4 mr-1" />
        Ver
      </Button>
      {(r.status === 'pending' || r.status === 'completed') && (
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 w-8 p-0',
            r.status === 'completed'
              ? 'text-muted-foreground hover:bg-muted'
              : 'text-success hover:text-success hover:bg-success/20',
          )}
          onClick={() => onToggleStatus(r.id, r.status)}
          title={r.status === 'completed' ? 'Marcar como Pendente' : 'Marcar como Concluído'}
        >
          <CheckCircle2
            className={cn(
              'size-4',
              r.status === 'completed' ? 'fill-muted-foreground text-card' : '',
            )}
          />
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

  const getRowClass = (urgency: string, status: string, index: number) => {
    let base = index % 2 === 0 ? 'bg-card' : 'bg-muted/30'
    let highlight = ''

    if (status === 'completed') {
      highlight = 'opacity-60 grayscale-[30%] border-l-4 border-l-transparent'
    } else if (urgency === 'overdue') {
      highlight = 'border-l-4 border-l-destructive bg-destructive/5'
    } else if (urgency === 'upcoming') {
      highlight = 'border-l-4 border-l-orange-500 bg-orange-500/5'
    } else {
      highlight = 'border-l-4 border-l-transparent'
    }

    return cn(base, highlight, 'hover:bg-muted transition-all duration-200')
  }

  const getUrgencyClass = (urgency: string) => {
    if (urgency === 'overdue') return 'text-destructive font-bold'
    if (urgency === 'upcoming') return 'text-orange-500 font-semibold'
    if (urgency === 'completed') return 'text-success font-medium'
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
                <TableRow key={r.id} className={getRowClass(urgency, r.status, i)}>
                  <TableCell
                    className={cn(
                      'font-medium text-left',
                      r.status === 'completed' && 'line-through text-muted-foreground',
                    )}
                  >
                    {r.expand?.patient_id?.name}
                  </TableCell>
                  <TableCell className="text-left">{TYPE_LABELS[r.type]}</TableCell>
                  <TableCell
                    className={cn(
                      'max-w-[200px] truncate text-left',
                      r.status === 'completed' && 'line-through text-muted-foreground',
                    )}
                    title={r.description}
                  >
                    {r.title}
                  </TableCell>
                  <TableCell className="text-left">
                    <div className={cn('flex items-center gap-2', getUrgencyClass(urgency))}>
                      <CalendarClock className="size-4" />
                      {formatDate(r.scheduled_date)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Badge
                        variant={
                          r.status === 'completed'
                            ? 'default'
                            : r.status === 'cancelled'
                              ? 'secondary'
                              : 'outline'
                        }
                        className={cn(
                          r.status === 'completed' && 'bg-success hover:bg-success/90',
                          urgency === 'overdue' && 'border-destructive text-destructive',
                          urgency === 'upcoming' && 'border-orange-500 text-orange-500',
                        )}
                      >
                        {STATUS_LABELS[r.status]}
                      </Badge>
                      {urgency === 'overdue' && (
                        <span className="text-[10px] font-bold text-destructive uppercase">
                          Atrasado
                        </span>
                      )}
                      {urgency === 'upcoming' && (
                        <span className="text-[10px] font-bold text-orange-500 uppercase">
                          Próximo
                        </span>
                      )}
                    </div>
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
                'overflow-hidden rounded-[8px] shadow-subtle border-l-4',
                r.status === 'completed'
                  ? 'opacity-70 grayscale-[30%] border-l-transparent'
                  : urgency === 'overdue'
                    ? 'border-l-destructive bg-destructive/5'
                    : urgency === 'upcoming'
                      ? 'border-l-orange-500 bg-orange-500/5'
                      : 'border-l-transparent',
              )}
            >
              <CardContent className="p-[16px] flex flex-col gap-4 bg-card">
                <div className="flex justify-between items-start mb-2 border-b pb-2">
                  <div>
                    <h4
                      className={cn(
                        'font-bold text-[16px]',
                        r.status === 'completed' && 'line-through text-muted-foreground',
                      )}
                    >
                      {r.expand?.patient_id?.name}
                    </h4>
                    <p
                      className={cn(
                        'text-sm mt-1',
                        r.status === 'completed'
                          ? 'line-through text-muted-foreground'
                          : 'text-muted-foreground',
                      )}
                    >
                      {r.title}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={r.status === 'completed' ? 'default' : 'outline'}
                      className={cn(
                        r.status === 'completed' && 'bg-success hover:bg-success/90',
                        urgency === 'overdue' && 'border-destructive text-destructive',
                        urgency === 'upcoming' && 'border-orange-500 text-orange-500',
                      )}
                    >
                      {STATUS_LABELS[r.status]}
                    </Badge>
                    {urgency === 'overdue' && (
                      <span className="text-[10px] font-bold text-destructive uppercase">
                        Atrasado
                      </span>
                    )}
                    {urgency === 'upcoming' && (
                      <span className="text-[10px] font-bold text-orange-500 uppercase">
                        Próximo
                      </span>
                    )}
                  </div>
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

      <Dialog open={!!viewingReminder} onOpenChange={(open) => !open && setViewingReminder(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Lembrete</DialogTitle>
            <DialogDescription>Informações completas sobre o lembrete.</DialogDescription>
          </DialogHeader>
          {viewingReminder && (
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Paciente</span>
                <p className="font-medium">{viewingReminder.expand?.patient_id?.name || '-'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Tipo</span>
                <p className="font-medium">{TYPE_LABELS[viewingReminder.type]}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Título</span>
                <p className="font-medium">{viewingReminder.title}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Data Agendada</span>
                <p className="font-medium">{formatDate(viewingReminder.scheduled_date)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Descrição</span>
                <p className="text-sm bg-muted/50 p-3 rounded-md min-h-[60px] whitespace-pre-wrap">
                  {viewingReminder.description || 'Nenhuma descrição fornecida.'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
