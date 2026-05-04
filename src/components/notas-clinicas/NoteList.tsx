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
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

export function NoteList({ notes, onEdit, onView, onDelete }: any) {
  return (
    <>
      <div className="hidden md:block border rounded-lg overflow-hidden bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead className="w-1/3">Resumo da Nota</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map((note: any) => (
              <TableRow key={note.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {format(new Date(note.created), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </TableCell>
                <TableCell>{note.expand?.professional_id?.name}</TableCell>
                <TableCell className="capitalize">
                  {note.expand?.professional_id?.specialty}
                </TableCell>
                <TableCell className="max-w-[300px] truncate">{note.content}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => onView(note)}>
                      <Eye className="h-4 w-4 mr-1" /> Ver
                    </Button>
                    <Button variant="default" size="sm" onClick={() => onEdit(note)}>
                      <Edit className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(note)}>
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
          <Card key={note.id}>
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <div className="font-semibold">{note.expand?.professional_id?.name}</div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(note.created), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </div>
              </div>
              <div className="text-sm text-muted-foreground capitalize">
                {note.expand?.professional_id?.specialty}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm line-clamp-3 text-foreground/80 mt-2">{note.content}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex gap-2 flex-wrap">
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => onView(note)}>
                <Eye className="h-4 w-4 mr-2" /> Ver
              </Button>
              <Button variant="default" size="sm" className="flex-1" onClick={() => onEdit(note)}>
                <Edit className="h-4 w-4 mr-2" /> Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => onDelete(note)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Excluir
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}
