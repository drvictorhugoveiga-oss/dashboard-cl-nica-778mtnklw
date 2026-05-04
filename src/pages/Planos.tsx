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

export default function Planos() {
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
      <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-fade-in-up">
        <p className="text-red-500 font-medium">{error}</p>
        <Button
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
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Planos</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 size-4" />
          Novo Plano
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Duração (meses)</TableHead>
                  <TableHead>Preço (R$)</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-[100px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[50px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-16 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : plans.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <EmptyState
              title="Nenhum plano cadastrado"
              description="Cadastre novos planos para começar a visualizar os dados e gerenciar pacientes."
            />
            <div className="flex justify-center pb-8">
              <Button onClick={handleCreate}>
                <Plus className="mr-2 size-4" />
                Novo Plano
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop View */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Duração (meses)</TableHead>
                    <TableHead>Preço (R$)</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right w-[120px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>{plan.duration_months}</TableCell>
                      <TableCell>{formatCurrency(plan.price)}</TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-[250px]">
                        {plan.description || '-'}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(plan)}
                          title="Editar"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingPlan(plan)}
                          title="Deletar"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Mobile View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {plans.map((plan) => (
              <Card key={plan.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(plan.price)} • {plan.duration_months} meses
                      </p>
                    </div>
                    <div className="flex space-x-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingPlan(plan)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  {plan.description && (
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

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
    </div>
  )
}
