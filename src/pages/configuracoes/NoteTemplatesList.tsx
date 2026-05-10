import { useState, useEffect } from 'react'
import { getNoteTemplates, deleteNoteTemplate, NoteTemplate } from '@/services/note_templates'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { NoteTemplateFormModal } from './NoteTemplateFormModal'
import { format, parseISO } from 'date-fns'
import { useAuth } from '@/hooks/use-auth'

export function NoteTemplatesList() {
  const [templates, setTemplates] = useState<NoteTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<NoteTemplate | null>(null)
  const { toast } = useToast()
  const { usuario } = useAuth()

  const loadData = async () => {
    try {
      const data = await getNoteTemplates()
      setTemplates(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('note_templates', loadData)

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este modelo?')) return
    try {
      await deleteNoteTemplate(id)
      toast({ title: 'Modelo removido', className: 'bg-success text-success-foreground' })
    } catch (err) {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
  }

  const handleEdit = (template: NoteTemplate) => {
    setSelectedTemplate(template)
    setModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Modelos facilitam o preenchimento de notas clínicas.
        </p>
        <Button
          onClick={() => {
            setSelectedTemplate(null)
            setModalOpen(true)
          }}
        >
          <Plus className="size-4 mr-2" />
          Novo Modelo
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden shadow-subtle">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead>Nome do Modelo</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead className="text-right w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Nenhum modelo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              templates.map((t) => (
                <TableRow key={t.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(parseISO(t.updated), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="text-right">
                    {t.created_by === usuario?.id && (
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}>
                          <Edit2 className="size-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <NoteTemplateFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        item={selectedTemplate}
        userId={usuario?.id}
      />
    </div>
  )
}
