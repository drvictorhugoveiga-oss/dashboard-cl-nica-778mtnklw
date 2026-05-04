import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export function NoteViewDialog({ open, onOpenChange, note }: any) {
  if (!note) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Nota</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Data</Label>
            <p className="font-medium">
              {format(new Date(note.created), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">Profissional</Label>
            <p className="font-medium">{note.expand?.professional_id?.name}</p>
          </div>
          <div className="col-span-2">
            <Label className="text-muted-foreground">Especialidade</Label>
            <p className="font-medium capitalize">{note.expand?.professional_id?.specialty}</p>
          </div>
          <div className="col-span-2 mt-4">
            <Label className="text-muted-foreground">Conteúdo</Label>
            <div className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
              {note.content}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
