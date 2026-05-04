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
      toast({ title: 'Nota deletada com sucesso', duration: 3000 })
      onSuccess()
      onOpenChange(false)
    } catch (e) {
      toast({ title: 'Erro ao deletar nota', variant: 'destructive', duration: 3000 })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white rounded-lg p-6 shadow-elevation border-gray-200 animate-in fade-in duration-200 ease-out">
        <AlertDialogHeader className="mb-4">
          <AlertDialogTitle className="text-xl font-bold text-foreground">
            Tem certeza que deseja deletar esta nota?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-gray-600">
            Esta ação não pode ser desfeita. A nota clínica será permanentemente removida.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel
            disabled={isDeleting}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200 rounded-lg mt-0"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors duration-200 rounded-lg shadow-subtle"
          >
            {isDeleting ? 'Deletando...' : 'Deletar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
