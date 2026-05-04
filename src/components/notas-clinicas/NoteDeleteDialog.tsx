import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { deletePatientNote } from '@/services/patient_notes'
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

export function NoteDeleteDialog({ open, onOpenChange, note, onSuccess }: any) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!note) return
    setIsDeleting(true)
    try {
      await deletePatientNote(note.id)
      toast({ title: 'Nota deletada com sucesso' })
      onSuccess()
      onOpenChange(false)
    } catch (e) {
      toast({ title: 'Erro ao deletar nota', variant: 'destructive' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza que deseja deletar esta nota?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. A nota clínica será permanentemente removida.
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
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isDeleting ? 'Deletando...' : 'Deletar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
