import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Check } from 'lucide-react'

import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { cn } from '@/lib/utils'
import { createPatientNote, updatePatientNote } from '@/services/patient_notes'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  professional_id: z.string().min(1, 'Profissional é obrigatório'),
  content: z.string().min(10, 'O conteúdo deve ter pelo menos 10 caracteres'),
})

export function NoteFormDialog({
  open,
  onOpenChange,
  note,
  patientId,
  patientName,
  professionals,
  onSuccess,
}: any) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { professional_id: '', content: '' },
  })

  useEffect(() => {
    if (open) {
      if (note) {
        form.reset({ professional_id: note.professional_id, content: note.content })
      } else {
        form.reset({ professional_id: '', content: '' })
      }
    }
  }, [open, note, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      if (note) {
        await updatePatientNote(note.id, values)
        toast({ title: 'Nota atualizada com sucesso' })
      } else {
        await createPatientNote({ ...values, patient_id: patientId, created_by: user.id })
        toast({ title: 'Nota criada com sucesso' })
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      const fieldErrors = extractFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          form.setError(field as any, { type: 'manual', message })
        })
      } else {
        toast({ title: 'Erro ao salvar nota', variant: 'destructive' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{note ? 'Editar Nota' : 'Nova Nota Clínica'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormLabel>Paciente</FormLabel>
              <Input value={patientName} readOnly className="bg-muted text-muted-foreground" />
            </div>
            <FormField
              control={form.control}
              name="professional_id"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Profissional</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          fieldState.error
                            ? 'border-destructive text-destructive'
                            : fieldState.isDirty && !fieldState.invalid
                              ? 'border-green-500 text-green-700'
                              : '',
                        )}
                      >
                        <SelectValue placeholder="Selecione o profissional" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {professionals.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} -{' '}
                          <span className="capitalize text-muted-foreground">{p.specialty}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Conteúdo da Nota</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        placeholder="Descreva as observações clínicas..."
                        className={cn(
                          'min-h-[150px] pr-10',
                          fieldState.error && 'border-destructive focus-visible:ring-destructive',
                          fieldState.isDirty &&
                            !fieldState.invalid &&
                            'border-green-500 focus-visible:ring-green-500',
                        )}
                        {...field}
                      />
                      {fieldState.error && (
                        <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-destructive" />
                      )}
                      {fieldState.isDirty && !fieldState.invalid && (
                        <Check className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
