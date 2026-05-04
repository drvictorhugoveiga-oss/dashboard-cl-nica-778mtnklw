import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createProfessional, updateProfessional } from '@/services/professionals'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { Switch } from '@/components/ui/switch'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  specialty: z.enum(['nutrição', 'psicologia', 'fisioterapia', 'fonoaudiologia', 'enfermagem'], {
    required_error: 'Selecione uma especialidade',
  }),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  status: z.enum(['active', 'inactive']),
})

type FormValues = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: any | null
}

export function ProfissionalForm({ open, onOpenChange, item }: Props) {
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      specialty: 'nutrição',
      email: '',
      phone: '',
      status: 'active',
    },
  })

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          name: item.name,
          specialty: item.specialty,
          email: item.email,
          phone: item.phone,
          status: item.status,
        })
      } else {
        form.reset({ name: '', specialty: 'nutrição', email: '', phone: '', status: 'active' })
      }
    }
  }, [open, item, form])

  const onSubmit = async (values: FormValues) => {
    try {
      if (item) {
        await updateProfessional(item.id, values)
        toast({ title: 'Profissional atualizado com sucesso' })
      } else {
        await createProfessional(values)
        toast({ title: 'Profissional criado com sucesso' })
      }
      onOpenChange(false)
    } catch (err: any) {
      const fieldErrors = extractFieldErrors(err)
      Object.keys(fieldErrors).forEach((key) =>
        form.setError(key as any, { message: fieldErrors[key] }),
      )
      toast({ title: 'Erro ao salvar profissional', variant: 'destructive' })
    }
  }

  const renderInput = (field: any, error: boolean, placeholder: string, type = 'text') => (
    <div className="relative">
      <Input
        type={type}
        placeholder={placeholder}
        {...field}
        className={cn(error && 'border-destructive focus-visible:ring-destructive pr-10')}
      />
      {error && <AlertCircle className="absolute right-3 top-2.5 size-4 text-destructive" />}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar Profissional' : 'Novo Profissional'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    {renderInput(field, !!fieldState.error, 'Nome completo')}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialty"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Especialidade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          fieldState.error && 'border-destructive focus-visible:ring-destructive',
                        )}
                      >
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="nutrição">Nutrição</SelectItem>
                      <SelectItem value="psicologia">Psicologia</SelectItem>
                      <SelectItem value="fisioterapia">Fisioterapia</SelectItem>
                      <SelectItem value="fonoaudiologia">Fonoaudiologia</SelectItem>
                      <SelectItem value="enfermagem">Enfermagem</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    {renderInput(field, !!fieldState.error, 'email@exemplo.com', 'email')}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    {renderInput(field, !!fieldState.error, '(11) 99999-9999')}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <FormLabel className="cursor-pointer">Profissional Ativo</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value === 'active'}
                      onCheckedChange={(checked) => field.onChange(checked ? 'active' : 'inactive')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
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
