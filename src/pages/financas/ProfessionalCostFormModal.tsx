import { useEffect, useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createProfessionalCost,
  updateProfessionalCost,
  ProfessionalCost,
} from '@/services/professional_costs'
import { getProfessionals } from '@/services/professionals'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

const schema = z.object({
  professional_id: z.string().min(1, 'Profissional é obrigatório'),
  cost_per_month: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  date: z.string().min(1, 'Data é obrigatória'),
  description: z.string().optional(),
  paid_status: z.boolean().default(false),
})

export function ProfessionalCostFormModal({
  open,
  onOpenChange,
  item,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ProfessionalCost | null
}) {
  const { toast } = useToast()
  const [professionals, setProfessionals] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      getProfessionals().then(setProfessionals).catch(console.error)
    }
  }, [open])

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      professional_id: '',
      cost_per_month: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      paid_status: false,
    },
  })

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          professional_id: item.professional_id,
          cost_per_month: item.cost_per_month,
          date: item.date ? item.date.substring(0, 10) : format(new Date(), 'yyyy-MM-dd'),
          description: item.description || '',
          paid_status: !!item.paid_status,
        })
      } else {
        form.reset({
          professional_id: '',
          cost_per_month: 0,
          date: format(new Date(), 'yyyy-MM-dd'),
          description: '',
          paid_status: false,
        })
      }
    }
  }, [open, item, form])

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const dateToSave = `${values.date} 12:00:00.000Z`
      if (item) {
        await updateProfessionalCost(item.id, { ...values, date: dateToSave })
        toast({ title: 'Custo atualizado', className: 'bg-success text-success-foreground' })
      } else {
        await createProfessionalCost({ ...values, date: dateToSave })
        toast({ title: 'Custo registrado', className: 'bg-success text-success-foreground' })
      }
      onOpenChange(false)
    } catch (err) {
      toast({ title: 'Erro ao salvar custo', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-lg">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar Custo' : 'Novo Custo de Profissional'}</DialogTitle>
          <DialogDescription>
            {item ? 'Altere os detalhes do custo.' : 'Registre um novo repasse/custo profissional.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField
              control={form.control}
              name="professional_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profissional</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {professionals.map((p) => (
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cost_per_month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      placeholder="Ex: Repasse referente a Maio/26"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paid_status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm">Custo Pago</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Marque se este repasse já foi realizado.
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
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
