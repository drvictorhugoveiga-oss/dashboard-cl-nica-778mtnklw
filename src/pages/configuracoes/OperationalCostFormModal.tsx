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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createOperationalCost,
  updateOperationalCost,
  OperationalCost,
} from '@/services/operational_costs'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cost_value: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  date: z.string().min(1, 'Data é obrigatória'),
  category: z.enum(
    ['Aluguel', 'Utilidades', 'Materiais', 'Manutenção', 'Pessoal', 'Marketing', 'Outros'],
    { required_error: 'Categoria é obrigatória' },
  ),
  description: z.string().optional(),
})

export function OperationalCostFormModal({
  open,
  onOpenChange,
  item,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: OperationalCost | null
}) {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      cost_value: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      category: 'Outros',
      description: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          name: item.name,
          cost_value: item.cost_value,
          date: item.date.split('T')[0],
          category: item.category || 'Outros',
          description: item.description || '',
        })
      } else {
        form.reset({
          name: '',
          cost_value: 0,
          date: format(new Date(), 'yyyy-MM-dd'),
          category: 'Outros',
          description: '',
        })
      }
    }
  }, [open, item, form])

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const dateToSave = new Date(values.date + 'T12:00:00Z').toISOString()
      if (item) {
        await updateOperationalCost(item.id, { ...values, date: dateToSave })
        toast({ title: 'Despesa atualizada', className: 'bg-success text-success-foreground' })
      } else {
        await createOperationalCost({ ...values, date: dateToSave } as any)
        toast({ title: 'Despesa criada', className: 'bg-success text-success-foreground' })
      }
      onOpenChange(false)
    } catch (err) {
      toast({ title: 'Erro ao salvar despesa', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-lg">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
          <DialogDescription>
            {item ? 'Altere os detalhes da despesa.' : 'Preencha os dados da nova despesa.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome / Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Conta de Luz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cost_value"
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
                      <SelectItem value="Aluguel">Aluguel</SelectItem>
                      <SelectItem value="Utilidades">Utilidades</SelectItem>
                      <SelectItem value="Materiais">Materiais</SelectItem>
                      <SelectItem value="Manutenção">Manutenção</SelectItem>
                      <SelectItem value="Pessoal">Pessoal</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
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
