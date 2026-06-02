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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { createRevenue, updateRevenue, Revenue } from '@/services/revenue'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

const schema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  value: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  date: z.string().min(1, 'Data é obrigatória'),
  category: z.enum(['Consultas', 'Planos', 'Particulares', 'Outros'], {
    required_error: 'Categoria é obrigatória',
  }),
  received_status: z.boolean(),
})

export function RevenueFormModal({
  open,
  onOpenChange,
  item,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: Revenue | null
}) {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      value: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      category: 'Consultas',
      received_status: true,
    },
  })

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          description: item.description,
          value: item.value,
          date: item.date.substring(0, 10),
          category: item.category,
          received_status: item.received_status,
        })
      } else {
        form.reset({
          description: '',
          value: 0,
          date: format(new Date(), 'yyyy-MM-dd'),
          category: 'Consultas',
          received_status: true,
        })
      }
    }
  }, [open, item, form])

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const dateToSave = `${values.date} 12:00:00.000Z`
      if (item) {
        await updateRevenue(item.id, { ...values, date: dateToSave })
        toast({ title: 'Ganho atualizado', className: 'bg-success text-success-foreground' })
      } else {
        await createRevenue({ ...values, date: dateToSave } as any)
        toast({ title: 'Ganho registrado', className: 'bg-success text-success-foreground' })
      }
      onOpenChange(false)
    } catch (err) {
      toast({ title: 'Erro ao salvar ganho', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-lg">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar Ganho' : 'Novo Ganho'}</DialogTitle>
          <DialogDescription>
            {item ? 'Altere os detalhes do ganho.' : 'Preencha os dados do novo ganho.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Pagamento Consulta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Consultas">Consultas</SelectItem>
                      <SelectItem value="Planos">Planos</SelectItem>
                      <SelectItem value="Particulares">Particulares</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="received_status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Status de Recebimento</FormLabel>
                    <p className="text-[10px] text-muted-foreground">
                      Marque se o valor já foi recebido
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
                className="bg-success hover:bg-success/90 text-success-foreground"
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
