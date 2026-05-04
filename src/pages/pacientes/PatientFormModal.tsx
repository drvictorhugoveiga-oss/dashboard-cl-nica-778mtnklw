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
import { Patient, createPatient, updatePatient, PatientFormData } from '@/services/patients'
import { Plan } from '@/services/plans'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido').min(1, 'E-mail é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  birth_date: z
    .string()
    .min(1, 'Obrigatório')
    .refine((val) => new Date(val) < new Date(), 'Deve ser no passado'),
  plan_id: z.string().min(1, 'Plano é obrigatório'),
  status: z.enum(['active', 'inactive', 'paused']),
  contract_start: z.string().min(1, 'Data de início é obrigatória'),
  contract_end: z.string().optional(),
})

type Props = {
  isOpen: boolean
  onClose: () => void
  patient: Patient | null
  plans: Plan[]
  onSuccess: () => void
}

export function PatientFormModal({ isOpen, onClose, patient, plans, onSuccess }: Props) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      birth_date: '',
      plan_id: '',
      status: 'active',
      contract_start: '',
      contract_end: '',
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
        contract_start: patient.contract_start ? patient.contract_start.substring(0, 10) : '',
        contract_end: patient.contract_end ? patient.contract_end.substring(0, 10) : '',
      })
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        birth_date: '',
        plan_id: '',
        status: 'active',
        contract_start: format(new Date(), 'yyyy-MM-dd'),
        contract_end: '',
      })
    }
  }, [patient, form, isOpen])

  const start = form.watch('contract_start')
  const pId = form.watch('plan_id')

  useEffect(() => {
    if (start && pId) {
      const p = plans.find((x) => x.id === pId)
      if (p?.duration_months) {
        try {
          form.setValue(
            'contract_end',
            format(addMonths(parseISO(start), p.duration_months), 'yyyy-MM-dd'),
          )
        } catch {
          /* intentionally ignored */
        }
      }
    }
  }, [start, pId, plans, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const data: PatientFormData = { ...values, contract_end: values.contract_end || undefined }
      if (patient) {
        await updatePatient(patient.id, data)
        toast({ title: 'Paciente atualizado com sucesso' })
      } else {
        await createPatient(data)
        toast({ title: 'Paciente criado com sucesso' })
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{patient ? 'Editar Paciente' : 'Novo Paciente'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plan_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plano</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="paused">Pausado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contract_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Início do Contrato</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contract_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fim do Contrato (Automático)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
