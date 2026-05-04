import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { AlertCircle, Check } from 'lucide-react'
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
import { cn } from '@/lib/utils'

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
    formState: { errors, dirtyFields },
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
        toast({
          title: 'Plano atualizado com sucesso',
          duration: 3000,
          className: 'data-[state=open]:duration-300',
        })
      } else {
        await createPlan(data)
        toast({
          title: 'Plano criado com sucesso',
          duration: 3000,
          className: 'data-[state=open]:duration-300',
        })
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
        toast({
          title: 'Erro ao salvar plano',
          variant: 'destructive',
          duration: 3000,
          className: 'data-[state=open]:duration-300',
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[8px] bg-background border-border/50 shadow-elevation animate-in fade-in duration-200">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-bold text-foreground">
            {plan ? 'Editar Plano' : 'Novo Plano'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-[16px] py-2">
          <div className="space-y-[8px]">
            <Label htmlFor="name" className="text-sm font-semibold">
              Nome
            </Label>
            <div className="relative">
              <Input
                id="name"
                {...register('name')}
                placeholder="Ex: VIVA 1"
                className={cn(
                  'rounded-[8px] pr-10 transition-colors duration-200',
                  errors.name
                    ? 'border-destructive focus-visible:ring-destructive'
                    : dirtyFields.name && !errors.name
                      ? 'border-success focus-visible:ring-success'
                      : 'border-border/50',
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {errors.name ? (
                  <AlertCircle className="size-4 text-destructive" />
                ) : dirtyFields.name && !errors.name ? (
                  <Check className="size-4 text-success" />
                ) : null}
              </div>
            </div>
            {errors.name && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" /> {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-[16px]">
            <div className="space-y-[8px]">
              <Label htmlFor="duration_months" className="text-sm font-semibold">
                Duração (meses)
              </Label>
              <div className="relative">
                <Input
                  id="duration_months"
                  type="number"
                  {...register('duration_months')}
                  className={cn(
                    'rounded-[8px] pr-10 transition-colors duration-200',
                    errors.duration_months
                      ? 'border-destructive focus-visible:ring-destructive'
                      : dirtyFields.duration_months && !errors.duration_months
                        ? 'border-success focus-visible:ring-success'
                        : 'border-border/50',
                  )}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {errors.duration_months ? (
                    <AlertCircle className="size-4 text-destructive" />
                  ) : dirtyFields.duration_months && !errors.duration_months ? (
                    <Check className="size-4 text-success" />
                  ) : null}
                </div>
              </div>
              {errors.duration_months && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" /> {errors.duration_months.message}
                </p>
              )}
            </div>

            <div className="space-y-[8px]">
              <Label htmlFor="price" className="text-sm font-semibold">
                Preço (R$)
              </Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price')}
                  className={cn(
                    'rounded-[8px] pr-10 transition-colors duration-200',
                    errors.price
                      ? 'border-destructive focus-visible:ring-destructive'
                      : dirtyFields.price && !errors.price
                        ? 'border-success focus-visible:ring-success'
                        : 'border-border/50',
                  )}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {errors.price ? (
                    <AlertCircle className="size-4 text-destructive" />
                  ) : dirtyFields.price && !errors.price ? (
                    <Check className="size-4 text-success" />
                  ) : null}
                </div>
              </div>
              {errors.price && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" /> {errors.price.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-[8px]">
            <Label htmlFor="description" className="text-sm font-semibold">
              Descrição
            </Label>
            <div className="relative">
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Benefícios do plano..."
                className={cn(
                  'rounded-[8px] pr-10 transition-colors duration-200 min-h-[80px]',
                  errors.description
                    ? 'border-destructive focus-visible:ring-destructive'
                    : dirtyFields.description && !errors.description
                      ? 'border-success focus-visible:ring-success'
                      : 'border-border/50',
                )}
              />
              <div className="absolute right-3 top-4 pointer-events-none">
                {errors.description ? (
                  <AlertCircle className="size-4 text-destructive" />
                ) : dirtyFields.description && !errors.description ? (
                  <Check className="size-4 text-success" />
                ) : null}
              </div>
            </div>
            {errors.description && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" /> {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-[16px] flex sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-[8px] text-muted-foreground bg-muted hover:bg-muted/80 border-transparent transition-colors duration-200"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-[8px] bg-success hover:bg-success/90 text-success-foreground transition-all duration-200 shadow-sm"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
