import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createNoteTemplate, updateNoteTemplate, NoteTemplate } from '@/services/note_templates'
import { useToast } from '@/hooks/use-toast'
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react'

function RichTextEditor({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleCommand = (command: string) => {
    document.execCommand(command, false, undefined)
    editorRef.current?.focus()
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }

  return (
    <div className="border rounded-md focus-within:ring-1 focus-within:ring-primary overflow-hidden bg-background">
      <div className="flex items-center gap-1 p-1 border-b bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          onClick={() => handleCommand('bold')}
        >
          <Bold className="size-4 text-foreground" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          onClick={() => handleCommand('italic')}
        >
          <Italic className="size-4 text-foreground" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          onClick={() => handleCommand('underline')}
        >
          <Underline className="size-4 text-foreground" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          onClick={() => handleCommand('insertUnorderedList')}
        >
          <List className="size-4 text-foreground" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          onClick={() => handleCommand('insertOrderedList')}
        >
          <ListOrdered className="size-4 text-foreground" />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="p-3 min-h-[250px] outline-none prose prose-sm max-w-none focus:outline-none"
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
      />
    </div>
  )
}

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
})

export function NoteTemplateFormModal({
  open,
  onOpenChange,
  item,
  userId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: NoteTemplate | null
  userId?: string
}) {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', content: '' },
  })

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({ name: item.name, content: item.content })
      } else {
        form.reset({ name: '', content: '' })
      }
    }
  }, [open, item, form])

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      if (item) {
        await updateNoteTemplate(item.id, values)
        toast({ title: 'Modelo atualizado', className: 'bg-success text-success-foreground' })
      } else {
        await createNoteTemplate({ ...values, created_by: userId })
        toast({ title: 'Modelo criado', className: 'bg-success text-success-foreground' })
      }
      onOpenChange(false)
    } catch (err) {
      toast({ title: 'Erro ao salvar modelo', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] w-[95vw] rounded-lg">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar Modelo' : 'Novo Modelo'}</DialogTitle>
          <DialogDescription>
            {item
              ? 'Atualize as informações do modelo.'
              : 'Crie um novo modelo de anotação clínica.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Anamnese Inicial" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo do Modelo</FormLabel>
                  <FormControl>
                    <RichTextEditor value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Salvar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
