import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Patient } from '@/services/patients'
import { differenceInDays, parseISO, isValid } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { deletePatient } from '@/services/patients'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'
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
import { Trash2 } from 'lucide-react'

type Props = {
  isOpen: boolean
  onClose: () => void
  patient: Patient | null
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-success text-success-foreground border-success hover:bg-success/90">
          Ativo
        </Badge>
      )
    case 'inactive':
      return (
        <Badge className="bg-muted text-muted-foreground border-muted-foreground/20 hover:bg-muted">
          Inativo
        </Badge>
      )
    case 'paused':
      return (
        <Badge className="bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600">
          Pausado
        </Badge>
      )
    default:
      return <Badge>Desconhecido</Badge>
  }
}

export function PatientDetailsModal({ isOpen, onClose, patient }: Props) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!patient) return null

  let daysRemaining: number | null = null
  if (patient.contract_end) {
    const end = parseISO(patient.contract_end)
    if (isValid(end)) {
      daysRemaining = differenceInDays(end, new Date())
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-[8px] duration-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Detalhes do Paciente</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-sm">
          <div className="grid grid-cols-3 gap-y-3 gap-x-2">
            <span className="font-semibold text-muted-foreground">Nome:</span>
            <span className="col-span-2 font-medium">{patient.name}</span>

            <span className="font-semibold text-muted-foreground">Email:</span>
            <span className="col-span-2">{patient.email || '-'}</span>

            <span className="font-semibold text-muted-foreground">Telefone:</span>
            <span className="col-span-2">{patient.phone || '-'}</span>

            <span className="font-semibold text-muted-foreground">Nascimento:</span>
            <span className="col-span-2">
              {patient.birth_date
                ? new Date(patient.birth_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                : '-'}
            </span>

            <span className="font-semibold text-muted-foreground">Plano:</span>
            <span className="col-span-2">{patient.expand?.plan_id?.name || '-'}</span>

            <span className="font-semibold text-muted-foreground">Início:</span>
            <span className="col-span-2">
              {patient.contract_start
                ? new Date(patient.contract_start).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                : '-'}
            </span>

            <span className="font-semibold text-muted-foreground">Fim do Contrato:</span>
            <span className="col-span-2">
              {patient.contract_end
                ? new Date(patient.contract_end).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                : '-'}
            </span>

            <span className="font-semibold text-muted-foreground">Dias Restantes:</span>
            <span className="col-span-2 font-medium">
              {daysRemaining !== null
                ? daysRemaining < 0
                  ? 'Expirado'
                  : `${daysRemaining} dia(s)`
                : '-'}
            </span>

            <span className="font-semibold text-muted-foreground">Status:</span>
            <span className="col-span-2">{getStatusBadge(patient.status)}</span>

            {patient.death_date && (
              <>
                <span className="font-semibold text-muted-foreground text-destructive">
                  Data do Óbito:
                </span>
                <span className="col-span-2 font-medium text-destructive">
                  {new Date(patient.death_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </span>
              </>
            )}

            <span className="font-semibold text-muted-foreground">Gênero:</span>
            <span className="col-span-2 capitalize">
              {patient.gender === 'male'
                ? 'Masculino'
                : patient.gender === 'female'
                  ? 'Feminino'
                  : patient.gender === 'other'
                    ? 'Outro'
                    : '-'}
            </span>
          </div>
        </div>
        <DialogFooter className="border-t border-border pt-4 flex sm:justify-between items-center gap-2">
          <Button
            variant="destructive"
            className="rounded-[8px] w-full sm:w-auto"
            onClick={() => setShowDeleteAlert(true)}
          >
            <Trash2 className="size-4 mr-2" />
            Excluir
          </Button>
          <Button onClick={onClose} variant="secondary" className="rounded-[8px] w-full sm:w-auto">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="rounded-[8px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o paciente{' '}
              <span className="font-semibold text-foreground">{patient.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="rounded-[8px]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-[8px]"
              disabled={isDeleting}
              onClick={async (e) => {
                e.preventDefault()
                setIsDeleting(true)
                try {
                  await deletePatient(patient.id)
                  toast.success('Paciente excluído com sucesso.')
                  setShowDeleteAlert(false)
                  onClose()
                } catch (error) {
                  toast.error(getErrorMessage(error))
                  setShowDeleteAlert(false)
                } finally {
                  setIsDeleting(false)
                }
              }}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
