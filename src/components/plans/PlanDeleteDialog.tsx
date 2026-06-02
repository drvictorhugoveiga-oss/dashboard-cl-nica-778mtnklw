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
      toast({
        title: 'Plano excluído com sucesso',
        duration: 3000,
        className: 'data-[state=open]:duration-300',
      })
      onSuccess()
      onClose()
    } catch (err) {
      toast({
        title: 'Erro ao excluir plano',
        variant: 'destructive',
        duration: 3000,
        className: 'data-[state=open]:duration-300',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={!!plan} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="rounded-[8px] animate-in fade-in duration-200 shadow-elevation border-border/50">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-bold text-[20px]">
            Tem certeza que deseja excluir este plano?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-regular">
            Esta ação não pode ser desfeita. O plano{' '}
            <strong className="font-bold text-foreground">"{plan?.name}"</strong> será removido
            permanentemente da base de dados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:space-x-0">
          <AlertDialogCancel
            disabled={isDeleting}
            className="rounded-[8px] bg-muted text-muted-foreground hover:bg-muted/80 border-transparent transition-colors duration-200 mt-0 sm:mt-0"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className="rounded-[8px] bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all duration-200 shadow-sm"
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
