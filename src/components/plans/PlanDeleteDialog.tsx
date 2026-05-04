import { useState } from 'react'
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
import { deletePlan, Plan } from '@/services/plans'
import { useToast } from '@/hooks/use-toast'

interface Props {
  plan: Plan | null
  onClose: () => void
  onSuccess: () => void
}

export function PlanDeleteDialog({ plan, onClose, onSuccess }: Props) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!plan) return
    setIsDeleting(true)
    try {
      await deletePlan(plan.id)
      toast({ title: 'Plano deletado com sucesso' })
      onSuccess()
      onClose()
    } catch (err) {
      toast({ title: 'Erro ao deletar plano', variant: 'destructive' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={!!plan} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza que deseja deletar este plano?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. O plano "{plan?.name}" será removido permanentemente da
            base de dados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? 'Deletando...' : 'Deletar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
