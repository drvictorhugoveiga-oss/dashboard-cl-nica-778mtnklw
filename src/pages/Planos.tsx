import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Plan, getPlans } from '@/services/plans'
import { useRealtime } from '@/hooks/use-realtime'
import { PlanFormModal } from '@/components/plans/PlanFormModal'
import { PlanDeleteDialog } from '@/components/plans/PlanDeleteDialog'
import { useAuth } from '@/hooks/use-auth'

export default function Planos() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null)

  const loadPlans = useCallback(async () => {
    try {
      setError(null)
      const data = await getPlans()
      setPlans(data)
    } catch (err) {
      setError('Falha ao carregar os planos. Por favor, tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPlans()
  }, [loadPlans])

  useRealtime('plans', () => {
    loadPlans()
  })

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setIsFormOpen(true)
  }

  const handleCreate = () => {
    setEditingPlan(null)
    setIsFormOpen(true)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-in fade-in duration-200">
        <p className="text-destructive font-medium">{error}</p>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
          onClick={() => {
            setIsLoading(true)
            loadPlans()
          }}
        >
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-[24px] animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-bold text-foreground tracking-tight">Gestão de Planos</h1>
        {isAdmin && (
          <Button
            onClick={handleCreate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-elevation transition-all duration-200 rounded-[8px]"
          >
            <Plus className="mr-2 size-4" />
            Adicionar Plano
          </Button>
        )}
      </div>

      {isLoading ? (
        <>
          <div className="hidden min-[481px]:block overflow-x-auto bg-card rounded-[8px] border border-border/50 shadow-subtle">
            <Table>
              <TableHeader className="bg-[hsl(100,100%,97%)]">
                <TableRow className="hover:bg-[hsl(100,100%,97%)]">
                  <TableHead className="text-left">Nome</TableHead>
                  <TableHead>Duração (meses)</TableHead>
                  <TableHead className="text-right">Preço (R$)</TableHead>
                  <TableHead className="text-left">Descrição</TableHead>
                  {isAdmin && <TableHead className="w-[100px] text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="even:bg-muted/30">
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" style={{ animationDuration: '1.5s' }} />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[50px]" style={{ animationDuration: '1.5s' }} />
                    </TableCell>
                    <TableCell className="flex justify-end">
                      <Skeleton className="h-4 w-[80px]" style={{ animationDuration: '1.5s' }} />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" style={{ animationDuration: '1.5s' }} />
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Skeleton
                          className="h-8 w-16 ml-auto"
                          style={{ animationDuration: '1.5s' }}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col gap-[16px] min-[481px]:hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-[8px] p-[16px] border border-border/50 shadow-subtle flex flex-col gap-[16px]"
              >
                <Skeleton className="h-6 w-[150px]" style={{ animationDuration: '1.5s' }} />
                <div className="grid grid-cols-2 gap-[16px]">
                  <Skeleton className="h-10 w-full" style={{ animationDuration: '1.5s' }} />
                  <Skeleton className="h-10 w-full" style={{ animationDuration: '1.5s' }} />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : plans.length === 0 ? (
        <Card className="border-border/50 shadow-subtle rounded-[8px]">
          <CardContent className="p-0">
            <EmptyState
              title="Nenhum plano cadastrado"
              description="Cadastre novos planos para começar a visualizar os dados e gerenciar pacientes."
            />
            {isAdmin && (
              <div className="flex justify-center pb-8">
                <Button
                  onClick={handleCreate}
                  className="bg-primary hover:bg-primary/90 transition-all duration-200 shadow-sm rounded-[8px]"
                >
                  <Plus className="mr-2 size-4" />
                  Adicionar Plano
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop/Tablet View */}
          <div className="hidden min-[481px]:block overflow-x-auto bg-card rounded-[8px] border border-border/50 shadow-subtle">
            <Table>
              <TableHeader className="bg-[hsl(100,100%,97%)]">
                <TableRow className="hover:bg-[hsl(100,100%,97%)]">
                  <TableHead className="text-left font-bold text-foreground">Nome</TableHead>
                  <TableHead className="text-left font-bold text-foreground">
                    Duração (meses)
                  </TableHead>
                  <TableHead className="text-right font-bold text-foreground">Preço (R$)</TableHead>
                  <TableHead className="text-left font-bold text-foreground">Descrição</TableHead>
                  {isAdmin && (
                    <TableHead className="text-right w-[120px] font-bold text-foreground">
                      Ações
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow
                    key={plan.id}
                    className="even:bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors duration-200"
                  >
                    <TableCell className="font-regular text-left text-foreground">
                      {plan.name}
                    </TableCell>
                    <TableCell className="text-left font-regular text-foreground">
                      {plan.duration_months}
                    </TableCell>
                    <TableCell className="text-right font-regular text-foreground">
                      {formatCurrency(plan.price)}
                    </TableCell>
                    <TableCell className="text-left text-muted-foreground truncate max-w-[250px] font-regular">
                      {plan.description || '-'}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(plan)}
                          title="Editar"
                          className="text-primary hover:text-primary hover:bg-primary/10 transition-colors duration-200"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingPlan(plan)}
                          title="Deletar"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View */}
          <div className="flex flex-col gap-[16px] min-[481px]:hidden">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-card rounded-[8px] p-[16px] border border-border/50 shadow-subtle flex flex-col gap-[16px] transition-colors duration-200 hover:bg-muted/30"
              >
                <div className="font-bold text-[16px] text-foreground">{plan.name}</div>
                <div className="grid grid-cols-2 gap-[16px] text-sm font-regular">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-xs font-semibold">Preço</span>
                    <span className="text-foreground">{formatCurrency(plan.price)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-xs font-semibold">Duração</span>
                    <span className="text-foreground">
                      {plan.duration_months} {plan.duration_months === 1 ? 'mês' : 'meses'}
                    </span>
                  </div>
                  {plan.description && (
                    <div className="col-span-2 flex flex-col gap-1">
                      <span className="text-muted-foreground text-xs font-semibold">Descrição</span>
                      <span className="text-muted-foreground">{plan.description}</span>
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex flex-row justify-end gap-2 pt-2 border-t border-border mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(plan)}
                      className="text-primary border-primary/20 hover:bg-primary/10 transition-colors duration-200 rounded-[8px]"
                    >
                      <Pencil className="size-4 mr-2" /> Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingPlan(plan)}
                      className="text-destructive border-destructive/20 hover:bg-destructive/10 transition-colors duration-200 rounded-[8px]"
                    >
                      <Trash2 className="size-4 mr-2" /> Deletar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {isAdmin && (
        <>
          <PlanFormModal
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            plan={editingPlan}
            onSuccess={loadPlans}
          />
          <PlanDeleteDialog
            plan={deletingPlan}
            onClose={() => setDeletingPlan(null)}
            onSuccess={loadPlans}
          />
        </>
      )}
    </div>
  )
}
