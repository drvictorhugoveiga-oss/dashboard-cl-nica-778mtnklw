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

type Props = {
  isOpen: boolean
  onClose: () => void
  patient: Patient | null
}

const statusMap = {
  active: { label: 'Ativo', variant: 'default' as const },
  inactive: { label: 'Inativo', variant: 'destructive' as const },
  paused: { label: 'Pausado', variant: 'secondary' as const },
}

export function PatientDetailsModal({ isOpen, onClose, patient }: Props) {
  if (!patient) return null

  let daysRemaining: number | null = null
  if (patient.contract_end) {
    const end = parseISO(patient.contract_end)
    if (isValid(end)) {
      daysRemaining = differenceInDays(end, new Date())
    }
  }

  const statusInfo = statusMap[patient.status]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do Paciente</DialogTitle>
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
            <span className="col-span-2">
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="secondary">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
