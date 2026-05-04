import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function NoteList({ notes, onEdit, onView, onDelete }: any) {
  // Utility to extract raw text for the list view without HTML tags
  const extractText = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent || ''
  }

  return (
    <>
      <div className="hidden md:block w-full overflow-x-auto shadow-subtle rounded-lg border border-gray-200 bg-white">
        <Table className="min-w-[768px]">
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="text-left font-bold text-foreground">Data</TableHead>
              <TableHead className="text-left font-bold text-foreground">Paciente</TableHead>
              <TableHead className="text-left font-bold text-foreground">Profissional</TableHead>
              <TableHead className="text-left font-bold text-foreground">Especialidade</TableHead>
              <TableHead className="text-left font-bold text-foreground w-1/4">
                Resumo da Nota
              </TableHead>
              <TableHead className="text-right font-bold text-foreground">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map((note: any) => (
              <TableRow
                key={note.id}
                className="transition-colors duration-200 ease-out hover:bg-gray-200/50 even:bg-gray-50/50 cursor-pointer"
                onClick={() => onView(note)}
              >
                <TableCell className="text-left whitespace-nowrap">
                  {format(new Date(note.created), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </TableCell>
                <TableCell className="text-left font-medium">
                  {note.expand?.patient_id?.name}
                </TableCell>
                <TableCell className="text-left">{note.expand?.professional_id?.name}</TableCell>
                <TableCell className="text-left capitalize">
                  {note.expand?.professional_id?.specialty}
                </TableCell>
                <TableCell className="text-left max-w-[200px] truncate text-muted-foreground">
                  {extractText(note.content)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 rounded-lg shadow-subtle"
                      size="sm"
                      onClick={() => onView(note)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> Ver
                    </Button>
                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 rounded-lg shadow-subtle"
                      size="sm"
                      onClick={() => onEdit(note)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors duration-200 rounded-lg shadow-subtle"
                      size="sm"
                      onClick={() => onDelete(note)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Deletar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {notes.map((note: any) => (
          <div
            key={note.id}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-subtle transition-all duration-200 ease-out hover:shadow-elevation"
          >
            <div className="flex justify-between items-start mb-1">
              <div className="font-bold text-base text-foreground">
                {note.expand?.patient_id?.name}
              </div>
              <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
                {format(new Date(note.created), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-700 mb-1">
              Profissional: {note.expand?.professional_id?.name}
            </div>
            <div className="text-xs text-gray-500 capitalize mb-2">
              {note.expand?.professional_id?.specialty}
            </div>
            <p className="text-sm line-clamp-2 text-foreground/80 mb-4">
              {extractText(note.content)}
            </p>
            <div className="flex gap-2 w-full pt-3 border-t border-gray-100">
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 rounded-lg shadow-subtle"
                size="sm"
                onClick={() => onView(note)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 rounded-lg shadow-subtle"
                size="sm"
                onClick={() => onEdit(note)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors duration-200 rounded-lg shadow-subtle"
                size="sm"
                onClick={() => onDelete(note)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
