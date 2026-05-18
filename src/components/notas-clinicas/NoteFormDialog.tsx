import { useState, useEffect, useRef } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Check, FileText } from 'lucide-react'

import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'
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
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RichTextEditor } from './RichTextEditor'

const formSchema = z.object({
  patient_id: z.string().min(1, 'Paciente é obrigatório'),
  professional_id: z.string().min(1, 'Profissional é obrigatório'),
  content: z.string().min(1, 'O conteúdo é obrigatório'),
})

const TEMPLATES = {
  anamnese:
    '<p><strong>Queixa Principal:</strong></p><p><br></p><p><strong>Histórico Médico:</strong></p><p><br></p><p><strong>Medicamentos em Uso:</strong></p><p><br></p>',
  evolucao:
    '<p><strong>Evolução:</strong></p><p><br></p><p><strong>Conduta:</strong></p><p><br></p><p><strong>Próximos Passos:</strong></p><p><br></p>',
}

export function NoteFormDialog({
  open,
  onOpenChange,
  note,
  patientId,
  patients,
  professionals,
  onSuccess,
}: any) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [currentNoteId, setCurrentNoteId] = useState<string | undefined>(undefined)
  const { user } = useAuth()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { patient_id: '', professional_id: '', content: '' },
  })

  const watchedValues = form.watch()
  const lastSavedValues = useRef({
    content: '',
    patient_id: '',
    professional_id: '',
  })

  useEffect(() => {
    if (open) {
      setCurrentNoteId(note?.id)
      setSaveStatus('idle')
      setLastSavedAt(note?.updated ? new Date(note.updated) : null)
      if (note) {
        form.reset({
          patient_id: note.patient_id,
          professional_id: note.professional_id,
          content: note.content,
        })
        lastSavedValues.current = {
          patient_id: note.patient_id,
          professional_id: note.professional_id,
          content: note.content,
        }
      } else {
        const currentProfessional = professionals?.find((p: any) => p.user_id === user?.id)
        const initialProfessionalId = currentProfessional ? currentProfessional.id : ''
        const initialPatientId = patientId || ''
        form.reset({
          patient_id: initialPatientId,
          professional_id: initialProfessionalId,
          content: '',
        })
        lastSavedValues.current = {
          patient_id: initialPatientId,
          professional_id: initialProfessionalId,
          content: '',
        }
      }
    }
  }, [open, note, form, professionals, user, patientId])

  useEffect(() => {
    if (!open) return

    const { patient_id, professional_id, content } = watchedValues

    const isEmptyContent =
      !content || content.trim() === '' || content === '<br>' || content === '<p><br></p>'
    if (!patient_id || !professional_id || isEmptyContent) return
    if (!user?.id) return

    const hasChanged =
      content !== lastSavedValues.current.content ||
      patient_id !== lastSavedValues.current.patient_id ||
      professional_id !== lastSavedValues.current.professional_id

    if (!hasChanged) return

    setSaveStatus('idle')

    const timer = setTimeout(async () => {
      if (!pb.authStore.isValid || !user?.id) {
        setSaveStatus('error')
        toast({
          title: 'Authentication Error - Please Login',
          description: 'Sua sessão expirou. Por favor, faça login novamente.',
          variant: 'destructive',
        })
        window.dispatchEvent(new CustomEvent('pb-auth-error'))
        return
      }

      setSaveStatus('saving')
      try {
        let updatedNote
        if (currentNoteId) {
          updatedNote = await updatePatientNote(currentNoteId, {
            patient_id,
            professional_id,
            content,
            created_by: user.id,
          })
        } else {
          updatedNote = await createPatientNote({
            patient_id,
            professional_id,
            content,
            created_by: user.id,
          })
          setCurrentNoteId(updatedNote.id)
        }
        lastSavedValues.current = { content, patient_id, professional_id }
        setSaveStatus('saved')
        setLastSavedAt(updatedNote?.updated ? new Date(updatedNote.updated) : new Date())
        onSuccess?.()
      } catch (err: any) {
        setSaveStatus('error')
        if (err?.status === 401 || err?.status === 403) {
          toast({
            title: 'Authentication Error - Please Login',
            description: 'Sua sessão expirou. Por favor, faça login novamente.',
            variant: 'destructive',
          })
          window.dispatchEvent(new CustomEvent('pb-auth-error'))
        } else {
          const fieldErrors = extractFieldErrors(err)
          if (Object.keys(fieldErrors).length > 0) {
            Object.entries(fieldErrors).forEach(([field, message]) => {
              form.setError(field as any, { type: 'manual', message })
            })
          }
          console.error('Erro no salvamento automático:', err)
        }
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [watchedValues, currentNoteId, open, user, onSuccess, form, toast])

  const applyTemplate = (templateHtml: string) => {
    const current = form.getValues('content')
    if (current && current.trim() !== '' && current !== '<br>') {
      form.setValue('content', current + '<br>' + templateHtml, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } else {
      form.setValue('content', templateHtml, { shouldValidate: true, shouldDirty: true })
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!pb.authStore.isValid || !user?.id) {
      toast({
        title: 'Authentication Error - Please Login',
        description: 'Sua sessão expirou. Por favor, faça login novamente.',
        variant: 'destructive',
      })
      window.dispatchEvent(new CustomEvent('pb-auth-error'))
      return
    }

    const isEmptyContent =
      !values.content ||
      values.content.trim() === '' ||
      values.content === '<br>' ||
      values.content === '<p><br></p>'
    if (isEmptyContent) {
      form.setError('content', { type: 'manual', message: 'O conteúdo não pode estar vazio' })
      return
    }

    setIsSubmitting(true)
    try {
      if (currentNoteId) {
        await updatePatientNote(currentNoteId, {
          patient_id: values.patient_id,
          professional_id: values.professional_id,
          content: values.content,
          created_by: user.id,
        })
        toast({ title: 'Nota clínica salva com sucesso!', duration: 3000 })
      } else {
        await createPatientNote({
          patient_id: values.patient_id,
          professional_id: values.professional_id,
          content: values.content,
          created_by: user.id,
        })
        toast({ title: 'Nota clínica salva com sucesso!', duration: 3000 })
      }
      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      if (error?.status === 401 || error?.status === 403) {
        toast({
          title: 'Authentication Error - Please Login',
          description: 'Sua sessão expirou. Por favor, faça login novamente.',
          variant: 'destructive',
        })
        window.dispatchEvent(new CustomEvent('pb-auth-error'))
        setIsSubmitting(false)
        return
      }

      const fieldErrors = extractFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          form.setError(field as any, { type: 'manual', message })
        })

        const errorMessages = Object.entries(fieldErrors)
          .map(([field, msg]) => {
            const fieldNameMap: Record<string, string> = {
              patient_id: 'Paciente',
              professional_id: 'Profissional',
              content: 'Conteúdo',
              created_by: 'Criador',
            }
            const displayName = fieldNameMap[field] || field
            return `${displayName}: ${msg}`
          })
          .join(' | ')

        toast({
          title: 'Erro de validação',
          description: errorMessages,
          variant: 'destructive',
          duration: 5000,
        })
      } else {
        toast({
          title: 'Erro de comunicação',
          description:
            getErrorMessage(error) || 'Ocorreu um erro de conexão. Por favor, tente novamente.',
          variant: 'destructive',
          duration: 5000,
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] w-[95vw] bg-white rounded-lg p-6 shadow-elevation animate-in fade-in duration-200 ease-out border-gray-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center justify-between">
            <span>{note ? 'Editar Nota' : 'Nova Nota Clínica'}</span>
            {!note && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <FileText className="h-4 w-4 mr-2" />
                    Modelos
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => applyTemplate(TEMPLATES.anamnese)}>
                    Anamnese
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyTemplate(TEMPLATES.evolucao)}>
                    Evolução de Consulta
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patient_id"
                render={({ field, fieldState }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm text-gray-600">Paciente</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={!!note}
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
                            <SelectValue placeholder="Selecione o paciente" />
                          </SelectTrigger>
                          {fieldState.error && (
                            <AlertCircle className="absolute right-8 top-2.5 h-4 w-4 text-destructive pointer-events-none" />
                          )}
                          {fieldState.isDirty && !fieldState.invalid && (
                            <Check className="absolute right-8 top-2.5 h-4 w-4 text-success pointer-events-none" />
                          )}
                        </div>
                      </FormControl>
                      <SelectContent className="rounded-lg border-gray-200 max-h-[300px]">
                        {patients?.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
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
            </div>
            <FormField
              control={form.control}
              name="content"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-2">
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-sm text-gray-600">Conteúdo da Nota</FormLabel>
                    <div className="text-xs font-medium h-4 flex items-center">
                      {saveStatus === 'saving' && (
                        <span className="text-blue-500 animate-pulse">Salvando...</span>
                      )}
                      {saveStatus === 'saved' && (
                        <span className="text-success flex items-center">
                          <Check className="w-3 h-3 mr-1" /> Salvo às{' '}
                          {lastSavedAt?.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      )}
                      {saveStatus === 'error' && (
                        <span className="text-destructive flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" /> Erro ao salvar (Offline/Error)
                        </span>
                      )}
                    </div>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        error={!!fieldState.error}
                        isDirty={fieldState.isDirty}
                        invalid={fieldState.invalid}
                      />
                      {fieldState.error && (
                        <AlertCircle className="absolute right-3 top-10 h-5 w-5 text-destructive pointer-events-none" />
                      )}
                      {fieldState.isDirty && !fieldState.invalid && (
                        <Check className="absolute right-3 top-10 h-5 w-5 text-success pointer-events-none" />
                      )}
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
