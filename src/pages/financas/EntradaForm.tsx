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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  type: z.enum(['ganho', 'despesa']),
  description: z.string().min(1, 'Descrição obrigatória'),
  value: z.coerce.number().min(0.01, 'Deve ser maior que 0'),
  date: z.string().min(1, 'Data obrigatória'),
  category: z.string().min(1, 'Categoria obrigatória'),
  status: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

export function EntradaForm({
  open,
  onOpenChange,
  initialData = null,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initialData?: any
}) {
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'ganho',
      description: '',
      value: 0,
      date: new Date().toISOString().split('T')[0],
      category: '',
      status: false,
    },
  })

  const watchType = form.watch('type')
  const ganhoCategories = ['Consultas', 'Planos', 'Particulares', 'Outros']
  const despesaCategories = [
    'Aluguel',
    'Utilidades',
    'Materiais',
    'Manutenção',
    'Pessoal',
    'Marketing',
    'Outros',
  ]
  const currentCategories = watchType === 'ganho' ? ganhoCategories : despesaCategories

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          type: initialData._type,
          description: initialData._type === 'ganho' ? initialData.description : initialData.name,
          value: initialData._type === 'ganho' ? initialData.value : initialData.cost_value,
          date: initialData._date
            ? initialData._date.toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          category: initialData.category,
          status:
            initialData._type === 'ganho' ? initialData.received_status : initialData.paid_status,
        })
      } else {
        form.reset({
          type: 'ganho',
          description: '',
          value: 0,
          date: new Date().toISOString().split('T')[0],
          category: '',
          status: false,
        })
      }
    }
  }, [open, initialData, form])

  useEffect(() => {
    const cat = form.getValues('category')
    if (watchType === 'ganho' && !ganhoCategories.includes(cat)) form.setValue('category', '')
    if (watchType === 'despesa' && !despesaCategories.includes(cat)) form.setValue('category', '')
  }, [watchType, form])

  const onSubmit = async (values: FormValues) => {
    try {
      if (values.type === 'ganho') {
        const payload = {
          description: values.description,
          value: values.value,
          date: new Date(values.date).toISOString(),
          category: values.category,
          received_status: values.status,
        }
        if (initialData?.id && initialData._type === 'ganho') {
          await pb.collection('revenue').update(initialData.id, payload)
        } else {
          await pb.collection('revenue').create(payload)
        }
      } else {
        const payload = {
          name: values.description,
          cost_value: values.value,
          date: new Date(values.date).toISOString(),
          category: values.category,
          paid_status: values.status,
          description: values.description,
        }
        if (initialData?.id && initialData._type === 'despesa') {
          await pb.collection('operational_costs').update(initialData.id, payload)
        } else {
          await pb.collection('operational_costs').create(payload)
        }
      }
      toast({ title: 'Entrada salva com sucesso' })
      onOpenChange(false)
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Entrada' : 'Nova Entrada'}</DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Altere os dados da transação financeira.'
              : 'Registre um novo ganho ou despesa.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!initialData && (
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0 bg-muted/30 p-3 rounded-lg flex-1 border">
                          <FormControl>
                            <RadioGroupItem value="ganho" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1">Ganho</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0 bg-muted/30 p-3 rounded-lg flex-1 border">
                          <FormControl>
                            <RadioGroupItem value="despesa" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer flex-1">
                            Despesa
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Consulta Dr. João" {...field} />
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
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currentCategories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
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
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      {watchType === 'ganho' ? 'Ganho recebido' : 'Gasto realizado'}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
