import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addMonths, format, parseISO } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { Switch } from '@/components/ui/switch'
import { Patient, createPatient, updatePatient, PatientFormData } from '@/services/patients'
import { Plan } from '@/services/plans'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { DatePicker } from '@/components/ui/date-picker'
import { Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const formSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    phone: z.string().min(1, 'Telefone é obrigatório'),
    birth_date: z
      .string()
      .min(1, 'Obrigatório')
      .refine((val) => new Date(val) < new Date(), 'Deve ser no passado'),
    plan_id: z.string().min(1, 'Plano é obrigatório'),
    status: z.enum(['active', 'inactive', 'paused']),
    gender: z.enum(['male', 'female', 'other']).optional(),
    contract_start: z.string().min(1, 'Data de início é obrigatória'),
    contract_end: z.string().optional(),
    is_deceased: z.boolean().default(false),
    death_date: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.is_deceased && !data.death_date) return false
      return true
    },
    {
      message: 'Data do óbito é obrigatória',
      path: ['death_date'],
    },
  )
  .refine(
    (data) => {
      if (data.is_deceased && data.death_date) {
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        return new Date(data.death_date) <= today
      }
      return true
    },
    {
      message: 'Não pode ser no futuro',
      path: ['death_date'],
    },
  )

type Props = {
  isOpen: boolean
  onClose: () => void
  patient: Patient | null
  plans: Plan[]
  onSuccess: () => void
}

export function PatientFormModal({ isOpen, onClose, patient, plans, onSuccess }: Props) {
  const { toast } = useToast()
  const { user } = useAuth()

  const isAdmin = user?.role === 'admin'
  const isInactive = patient?.status === 'inactive' && !isAdmin

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      birth_date: '',
      plan_id: '',
      status: 'active',
      contract_start: '',
      contract_end: '',
      is_deceased: false,
      death_date: '',
    },
  })

  useEffect(() => {
    if (!isOpen) return
    if (patient) {
      form.reset({
        name: patient.name,
        email: patient.email || '',
        phone: patient.phone || '',
        birth_date: patient.birth_date ? patient.birth_date.substring(0, 10) : '',
        plan_id: patient.plan_id || '',
        status: patient.status,
        gender: patient.gender,
        contract_start: patient.contract_start ? patient.contract_start.substring(0, 10) : '',
        contract_end: patient.contract_end ? patient.contract_end.substring(0, 10) : '',
        is_deceased: !!patient.death_date,
        death_date: patient.death_date ? patient.death_date.substring(0, 10) : '',
      })
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        birth_date: '',
        plan_id: '',
        status: 'active',
        gender: undefined,
        contract_start: format(new Date(), 'yyyy-MM-dd'),
        contract_end: '',
        is_deceased: false,
        death_date: '',
      })
    }
  }, [patient, form, isOpen])

  const start = form.watch('contract_start')
  const pId = form.watch('plan_id')
  const isDeceased = form.watch('is_deceased')

  useEffect(() => {
    if (start && pId) {
      const p = plans.find((x) => x.id === pId)
      if (p?.duration_months) {
        try {
          form.setValue(
            'contract_end',
            format(addMonths(parseISO(start), p.duration_months), 'yyyy-MM-dd'),
            { shouldValidate: true },
          )
        } catch {
          /* intentionally ignored */
        }
      }
    }
  }, [start, pId, plans, form])

  useEffect(() => {
    if (isDeceased) {
      form.setValue('status', 'inactive', { shouldValidate: true })
    }
  }, [isDeceased, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const data: PatientFormData = {
        ...values,
        email: values.email || undefined,
        contract_end: values.contract_end || undefined,
        death_date: values.is_deceased ? values.death_date : '',
        status: values.is_deceased ? 'inactive' : values.status,
      }
      delete data.is_deceased

      if (patient) {
        await updatePatient(patient.id, data)
        toast({ title: 'Paciente atualizado com sucesso', duration: 3000 })
      } else {
        await createPatient(data)
        toast({ title: 'Paciente criado com sucesso', duration: 3000 })
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive', duration: 3000 })
    }
  }

  const renderFeedbackIcon = (fieldName: keyof z.infer<typeof formSchema>) => {
    const isDirty = form.formState.dirtyFields[fieldName] || form.formState.isSubmitted
    const hasError = !!form.formState.errors[fieldName]

    if (hasError)
      return (
        <AlertCircle className="absolute right-3 top-2.5 h-4 w-4 text-destructive pointer-events-none" />
      )
    if (isDirty && !hasError)
      return <Check className="absolute right-3 top-2.5 h-4 w-4 text-success pointer-events-none" />
    return null
  }

  const getInputClass = (fieldName: keyof z.infer<typeof formSchema>) => {
    const isDirty = form.formState.dirtyFields[fieldName] || form.formState.isSubmitted
    const hasError = !!form.formState.errors[fieldName]
    return cn(
      'rounded-[8px]',
      hasError && 'border-destructive focus-visible:ring-destructive pr-10',
      isDirty && !hasError && 'border-success focus-visible:ring-success pr-10',
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[8px] duration-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {patient ? 'Editar Paciente' : 'Novo Paciente'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-2">
            {isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="is_deceased"
                  render={({ field }) => (
                    <FormItem
                      className={cn(
                        'flex flex-row items-center justify-between rounded-lg border p-4',
                        isDeceased ? 'md:col-span-1' : 'md:col-span-2',
                      )}
                    >
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-semibold text-destructive">
                          Óbito
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Marcar paciente como falecido
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isInactive && !isAdmin}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {isDeceased && (
                  <FormField
                    control={form.control}
                    name="death_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-center">
                        <FormLabel className="text-sm font-medium">Data do Óbito</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value ? parseISO(field.value) : undefined}
                            onChange={(date) =>
                              field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                            }
                            error={!!form.formState.errors.death_date}
                            disabled={isInactive && !isAdmin}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-destructive" />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Nome</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input {...field} disabled={isInactive} className={getInputClass('name')} />
                        {renderFeedbackIcon('name')}
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email (Opcional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="email"
                          {...field}
                          disabled={isInactive}
                          className={getInputClass('email')}
                        />
                        {renderFeedbackIcon('email')}
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Telefone</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          disabled={isInactive}
                          className={getInputClass('phone')}
                        />
                        {renderFeedbackIcon('phone')}
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Data de Nascimento</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ? parseISO(field.value) : undefined}
                        onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                        error={!!form.formState.errors.birth_date}
                        disabled={isInactive}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plan_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Plano</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isInactive}
                    >
                      <FormControl>
                        <SelectTrigger className={getInputClass('plan_id')}>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {plans.map((p) => (
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!isAdmin || isDeceased}
                    >
                      <FormControl>
                        <SelectTrigger className={getInputClass('status')}>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="paused">Pausado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Gênero</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isInactive}
                    >
                      <FormControl>
                        <SelectTrigger className={getInputClass('gender')}>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contract_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Início do Contrato</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ? parseISO(field.value) : undefined}
                        onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                        error={!!form.formState.errors.contract_start}
                        disabled={isInactive}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contract_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-muted-foreground">
                      Fim do Contrato (Auto)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          value={field.value ? format(parseISO(field.value), 'dd/MM/yyyy') : ''}
                          disabled
                          className="bg-muted/50 rounded-[8px]"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="secondary" onClick={onClose} className="rounded-[8px]">
                Cancelar
              </Button>
              {!isInactive && (
                <Button
                  type="submit"
                  className="bg-success hover:bg-success/90 text-success-foreground rounded-[8px]"
                >
                  Salvar
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
