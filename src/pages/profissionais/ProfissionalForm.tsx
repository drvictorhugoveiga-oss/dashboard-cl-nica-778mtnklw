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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createProfessional, updateProfessional } from '@/services/professionals'
import { getUsers, User } from '@/services/users'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { Switch } from '@/components/ui/switch'
import { AlertCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  specialty: z.enum(
    ['enfermagem', 'fisioterapia', 'fonoaudiologia', 'medicina', 'nutrição', 'psicologia'],
    {
      required_error: 'Selecione uma especialidade',
    },
  ),
  email: z.string().email('Formato de email inválido').min(1, 'Email é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  pix_key: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  user_id: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: any | null
}

export function ProfissionalForm({ open, onOpenChange, item }: Props) {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    if (open) {
      getUsers().then(setUsers).catch(console.error)
    }
  }, [open])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      specialty: 'enfermagem',
      email: '',
      phone: '',
      pix_key: '',
      status: 'active',
      user_id: '',
    },
    mode: 'onTouched',
  })

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          name: item.name || '',
          specialty: item.specialty || 'enfermagem',
          email: item.email || '',
          phone: item.phone || '',
          pix_key: item.pix_key || '',
          status: item.status || 'active',
          user_id: item.user_id || '',
        })
      } else {
        form.reset({
          name: '',
          specialty: 'enfermagem',
          email: '',
          phone: '',
          pix_key: '',
          status: 'active',
          user_id: '',
        })
      }
    }
  }, [open, item, form])

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = { ...values }
      if (payload.user_id === 'none' || !payload.user_id) {
        payload.user_id = ''
      }

      if (item) {
        await updateProfessional(item.id, payload)
        toast({
          title: 'Profissional atualizado com sucesso',
          className: 'bg-success text-success-foreground',
          duration: 3000,
        })
      } else {
        await createProfessional(payload)
        toast({
          title: 'Profissional criado com sucesso',
          className: 'bg-success text-success-foreground',
          duration: 3000,
        })
      }
      onOpenChange(false)
    } catch (err: any) {
      const fieldErrors = extractFieldErrors(err)
      Object.keys(fieldErrors).forEach((key) =>
        form.setError(key as any, { message: fieldErrors[key] }),
      )
      toast({ title: 'Erro ao salvar profissional', variant: 'destructive', duration: 3000 })
    }
  }

  const renderInput = (field: any, fieldState: any, placeholder: string, type = 'text') => {
    const hasError = !!fieldState.error
    const isSuccess = fieldState.isDirty && !hasError && field.value

    return (
      <div className="relative">
        <Input
          type={type}
          placeholder={placeholder}
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
      <DialogContent className="sm:max-w-[425px] rounded-lg p-6 data-[state=open]:animate-fade-in duration-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {item ? 'Editar Profissional' : 'Novo Profissional'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Formulário para adicionar ou editar profissional
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm">Nome</FormLabel>
                  <FormControl>{renderInput(field, fieldState, 'Nome completo')}</FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialty"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm">Especialidade</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          'h-10',
                          fieldState.error && 'border-destructive focus-visible:ring-destructive',
                        )}
                      >
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="enfermagem">Enfermagem</SelectItem>
                      <SelectItem value="fisioterapia">Fisioterapia</SelectItem>
                      <SelectItem value="fonoaudiologia">Fonoaudiologia</SelectItem>
                      <SelectItem value="medicina">Medicina</SelectItem>
                      <SelectItem value="nutrição">Nutrição</SelectItem>
                      <SelectItem value="psicologia">Psicologia</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm">Email</FormLabel>
                  <FormControl>
                    {renderInput(field, fieldState, 'email@exemplo.com', 'email')}
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm">Telefone</FormLabel>
                  <FormControl>{renderInput(field, fieldState, '(11) 99999-9999')}</FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pix_key"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm">Chave Pix (Opcional)</FormLabel>
                  <FormControl>
                    {renderInput(field, fieldState, 'CPF, Email, Celular ou Chave Aleatória')}
                  </FormControl>
                  <FormMessage className="text-xs text-destructive" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="user_id"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm">Vincular Usuário (Opcional)</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(val === 'none' ? '' : val)}
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          'h-10',
                          fieldState.error && 'border-destructive focus-visible:ring-destructive',
                        )}
                      >
                        <SelectValue placeholder="Nenhum usuário vinculado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Nenhum usuário vinculado</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm h-14">
                  <FormLabel className="cursor-pointer text-sm">Profissional Ativo</FormLabel>
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
                Salvar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
