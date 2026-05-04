import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plan, PlanFormData, createPlan, updatePlan } from '@/services/plans'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

const planSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  duration_months: z.coerce.number().min(1, 'Duração deve ser pelo menos 1 mês'),
  price: z.coerce.number().positive('Preço deve ser maior que 0'),
  description: z.string().optional(),
})

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan?: Plan | null
  onSuccess: () => void
}

export function PlanFormModal({ open, onOpenChange, plan, onSuccess }: Props) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: { name: '', duration_months: 1, price: 0, description: '' },
  })

  useEffect(() => {
    if (open) {
      reset(plan || { name: '', duration_months: 1, price: 0, description: '' })
    }
  }, [open, plan, reset])

  const onSubmit = async (data: PlanFormData) => {
    setIsSubmitting(true)
    try {
      if (plan) {
        await updatePlan(plan.id, data)
        toast({ title: 'Plano atualizado com sucesso' })
      } else {
        await createPlan(data)
        toast({ title: 'Plano criado com sucesso' })
      }
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      if (Object.keys(fieldErrors).length > 0) {
        Object.entries(fieldErrors).forEach(([field, msg]) => {
          setError(field as any, { message: msg })
        })
      } else {
        toast({ title: 'Erro ao salvar plano', variant: 'destructive' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{plan ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register('name')} placeholder="Ex: VIVA 1" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration_months">Duração (meses)</Label>
              <Input id="duration_months" type="number" {...register('duration_months')} />
              {errors.duration_months && (
                <p className="text-sm text-red-500">{errors.duration_months.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input id="price" type="number" step="0.01" {...register('price')} />
              {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Benefícios do plano..."
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
