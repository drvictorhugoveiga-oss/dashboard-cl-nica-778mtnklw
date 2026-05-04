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
  content: z
    .string()
    .min(10, 'O conteúdo deve ter pelo menos 10 caracteres')
    .max(500, 'O conteúdo não pode exceder 500 caracteres'),
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
        toast({ title: 'Nota atualizada com sucesso', duration: 3000 })
      } else {
        await createPatientNote({ ...values, patient_id: patientId, created_by: user.id })
        toast({ title: 'Nota criada com sucesso', duration: 3000 })
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
        toast({ title: 'Erro ao salvar nota', variant: 'destructive', duration: 3000 })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const contentValue = form.watch('content') || ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-lg p-6 shadow-elevation animate-in fade-in duration-200 ease-out border-gray-200">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold text-foreground">
            {note ? 'Editar Nota' : 'Nova Nota Clínica'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormLabel className="text-sm text-gray-600">Paciente</FormLabel>
              <Input
                value={patientName}
                readOnly
                className="bg-gray-100 text-gray-600 border-gray-200 rounded-lg"
              />
            </div>
            <FormField
              control={form.control}
              name="professional_id"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm text-gray-600">Profissional</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <div className="relative">
                        <SelectTrigger
                          className={cn(
                            'rounded-lg border-gray-200 pr-10',
                            fieldState.error
                              ? 'border-destructive text-destructive focus:ring-destructive'
                              : fieldState.isDirty && !fieldState.invalid
                                ? 'border-success text-success focus:ring-success'
                                : '',
                          )}
                        >
                          <SelectValue placeholder="Selecione o profissional" />
                        </SelectTrigger>
                        {fieldState.error && (
                          <AlertCircle className="absolute right-8 top-2.5 h-4 w-4 text-destructive pointer-events-none" />
                        )}
                        {fieldState.isDirty && !fieldState.invalid && (
                          <Check className="absolute right-8 top-2.5 h-4 w-4 text-success pointer-events-none" />
                        )}
                      </div>
                    </FormControl>
                    <SelectContent className="rounded-lg border-gray-200">
                      {professionals.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} -{' '}
                          <span className="capitalize text-muted-foreground">{p.specialty}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm text-gray-600">Conteúdo da Nota</FormLabel>
                  <FormControl>
                    <div>
                      <div className="relative">
                        <Textarea
                          placeholder="Descreva as observações clínicas..."
                          maxLength={500}
                          className={cn(
                            'min-h-[200px] pr-10 rounded-lg border-gray-200 resize-none',
                            fieldState.error && 'border-destructive focus-visible:ring-destructive',
                            fieldState.isDirty &&
                              !fieldState.invalid &&
                              'border-success focus-visible:ring-success',
                          )}
                          {...field}
                        />
                        {fieldState.error && (
                          <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-destructive pointer-events-none" />
                        )}
                        {fieldState.isDirty && !fieldState.invalid && (
                          <Check className="absolute right-3 top-3 h-5 w-5 text-success pointer-events-none" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {contentValue.length} / 500
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4 flex gap-2 sm:justify-end">
              <Button
                type="button"
                className="bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200 rounded-lg"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-success text-success-foreground hover:bg-success/90 transition-colors duration-200 rounded-lg shadow-subtle"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
