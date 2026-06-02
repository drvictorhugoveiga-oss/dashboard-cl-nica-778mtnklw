import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { createReminder, updateReminder, type Reminder } from '@/services/reminders'
import pb from '@/lib/pocketbase/client'
import { getPatients, type Patient } from '@/services/patients'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { TYPE_LABELS, STATUS_LABELS } from './constants'
import { cn } from '@/lib/utils'

const schema = z
  .object({
    patient_id: z.string().min(1, 'Paciente é obrigatório'),
    type: z.enum(['follow_up', 'renewal_warning', 'contract_end', 'birthday']),
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().optional(),
    scheduled_date: z.date({ required_error: 'Data é obrigatória' }),
    status: z.enum(['pending', 'completed', 'cancelled']).default('pending'),
  })
  .refine(
    (data) => {
      if (data.status === 'pending' && data.scheduled_date) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return data.scheduled_date >= today
      }
      return true
    },
    {
      message: 'Não é possível agendar um lembrete pendente no passado',
      path: ['scheduled_date'],
    },
  )

type FormValues = z.infer<typeof schema>

interface Props {
  initialData?: Reminder
  onSuccess: () => void
  onCancel: () => void
}

export function ReminderForm({ initialData, onSuccess, onCancel }: Props) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patient_id: initialData?.patient_id || '',
      type: initialData?.type || 'follow_up',
      title: initialData?.title || '',
      description: initialData?.description || '',
      scheduled_date: initialData?.scheduled_date
        ? new Date(initialData.scheduled_date)
        : undefined,
      status: initialData?.status || 'pending',
    },
  })

  useEffect(() => {
    getPatients()
      .then(setPatients)
      .catch(() => {})
  }, [])

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    try {
      const payload: any = {
        ...data,
        scheduled_date: data.scheduled_date.toISOString(),
      }

      if (!initialData) {
        payload.created_by = user?.id || pb.authStore.record?.id || ''
      }

      if (initialData) {
        await updateReminder(initialData.id, payload)
        toast({
          title: 'Lembrete atualizado com sucesso',
          duration: 3000,
          className: 'bg-success text-success-foreground',
        })
      } else {
        await createReminder(payload)
        toast({
          title: 'Lembrete criado com sucesso',
          duration: 3000,
          className: 'bg-success text-success-foreground',
        })
      }
      onSuccess()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: getErrorMessage(error),
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[16px]">
        <FormField
          control={form.control}
          name="patient_id"
          render={({ field, fieldState }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium">Paciente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um paciente..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {patients.map((p) => (
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field, fieldState }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
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
            name="scheduled_date"
            render={({ field, fieldState }) => (
              <FormItem className="flex flex-col pt-1 space-y-2">
                <FormLabel className="text-sm font-medium">Data Agendada</FormLabel>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  error={!!fieldState.error}
                />
                <FormMessage className="text-xs text-destructive" />
              </FormItem>
            )}
          />
        </div>{' '}
        <FormField
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium">Título</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Ex: Ligar para confirmar renovação"
                    {...field}
                    className={cn(
                      'rounded-[8px] transition-colors',
                      fieldState.error && 'border-destructive pr-10 focus-visible:ring-destructive',
                      !fieldState.error &&
                        fieldState.isTouched &&
                        'border-success pr-10 focus-visible:ring-success',
                    )}
                  />
                  {fieldState.error && (
                    <AlertCircle className="absolute right-3 top-2.5 h-4 w-4 text-destructive" />
                  )}
                  {!fieldState.error && fieldState.isTouched && (
                    <CheckCircle className="absolute right-3 top-2.5 h-4 w-4 text-success" />
                  )}
                </div>
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium">Descrição (Opcional)</FormLabel>
              <FormControl>
                <Textarea className="resize-none rounded-[8px]" {...field} />
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />
        {initialData && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="bg-muted text-muted-foreground hover:bg-muted/80 rounded-[8px] transition-all duration-200"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-success text-success-foreground hover:bg-success/90 rounded-[8px] transition-all duration-200 shadow-subtle hover:shadow-elevation"
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
