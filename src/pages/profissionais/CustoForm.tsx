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
import { AlertCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  cost_per_month: z.coerce
    .number({ invalid_type_error: 'Valor numérico inválido' })
    .min(0.01, 'O custo deve ser maior que zero'),
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
    mode: 'onTouched',
  })

  useEffect(() => {
    if (open) {
      form.reset({
        cost_per_month: costRecord ? costRecord.cost_per_month : '',
      } as any)
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
      toast({
        title: 'Custo atualizado com sucesso',
        className: 'bg-success text-success-foreground',
        duration: 3000,
      })
      onOpenChange(false)
    } catch (err) {
      toast({ title: 'Erro ao salvar custo', variant: 'destructive', duration: 3000 })
    }
  }

  const renderInput = (field: any, fieldState: any) => {
    const hasError = !!fieldState.error
    const isSuccess = fieldState.isDirty && !hasError && field.value !== '' && field.value > 0

    return (
      <div className="relative">
        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          {...field}
          className={cn(
            'h-10 transition-colors',
            hasError && 'border-destructive focus-visible:ring-destructive pr-10',
            isSuccess && 'border-success focus-visible:ring-success pr-10',
          )}
        />
        {hasError && (
          <AlertCircle className="absolute right-3 top-3 size-4 text-destructive animate-fade-in" />
        )}
        {isSuccess && (
          <Check className="absolute right-3 top-3 size-4 text-success animate-fade-in" />
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-lg p-6 data-[state=open]:animate-fade-in duration-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Editar Custo - {plan?.name}</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">
            Defina o valor de repasse mensal para este profissional neste plano.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField
              control={form.control}
              name="cost_per_month"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm">Custo Mensal (R$)</FormLabel>
                  <FormControl>{renderInput(field, fieldState)}</FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="text-muted-foreground"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-success hover:bg-success/90 text-success-foreground"
              >
                Salvar Custo
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
