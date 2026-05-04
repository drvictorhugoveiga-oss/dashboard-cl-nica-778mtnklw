import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function NoteViewDialog({ open, onOpenChange, note }: any) {
  if (!note) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white rounded-lg p-6 shadow-elevation animate-in fade-in duration-200 ease-out border-gray-200">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-foreground">Detalhes da Nota</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-600">Data</Label>
            <p className="text-base text-foreground">
              {format(new Date(note.created), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-600">Profissional</Label>
            <p className="text-base text-foreground">{note.expand?.professional_id?.name}</p>
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-sm font-medium text-gray-600">Especialidade</Label>
            <p className="text-base text-foreground capitalize">
              {note.expand?.professional_id?.specialty}
            </p>
          </div>
          <div className="col-span-2 mt-2 space-y-2">
            <Label className="text-sm font-medium text-gray-600">Conteúdo</Label>
            <Textarea
              readOnly
              value={note.content}
              className="bg-gray-100 min-h-[200px] border-gray-200 text-foreground resize-none rounded-lg focus-visible:ring-0"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
