import { useEffect } from 'react'
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
import { createProfessionalCost, updateProfessionalCost } from '@/services/professional_costs'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  cost_per_month: z.coerce
    .number({ invalid_type_error: 'Valor inválido' })
    .min(0.01, 'Custo deve ser maior que zero'),
})

type FormValues = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: any
  costRecord: any | null
  professionalId: string
}

export function CustoForm({ open, onOpenChange, plan, costRecord, professionalId }: Props) {
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cost_per_month: costRecord ? costRecord.cost_per_month : 0,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        cost_per_month: costRecord ? costRecord.cost_per_month : 0,
      })
    }
  }, [open, costRecord, form])

  const onSubmit = async (values: FormValues) => {
    try {
      if (costRecord) {
        await updateProfessionalCost(costRecord.id, { cost_per_month: values.cost_per_month })
      } else {
        await createProfessionalCost({
          professional_id: professionalId,
          plan_id: plan.id,
          cost_per_month: values.cost_per_month,
        })
      }
      toast({ title: 'Custo atualizado com sucesso' })
      onOpenChange(false)
    } catch (err) {
      toast({ title: 'Erro ao salvar custo', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Custo - {plan?.name}</DialogTitle>
          <DialogDescription>
            Defina o valor de repasse mensal para este profissional neste plano.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cost_per_month"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Custo Mensal (R$)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        className={cn(
                          fieldState.error &&
                            'border-destructive focus-visible:ring-destructive pr-10',
                        )}
                      />
                      {fieldState.error && (
                        <AlertCircle className="absolute right-3 top-2.5 size-4 text-destructive" />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Custo</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
