import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { getSystemConfig, updateSystemConfig, SystemConfig } from '@/services/system_config'
import { getPlans, Plan } from '@/services/plans'
import { getProfessionals, deleteProfessional } from '@/services/professionals'
import { PlanFormModal } from '@/components/plans/PlanFormModal'
import { ProfissionaisTable } from '@/pages/profissionais/ProfissionaisTable'
import { ProfissionalForm } from '@/pages/profissionais/ProfissionalForm'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Edit2, Plus } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'

const SkeletonRow = () => (
  <div className="flex w-full animate-pulse gap-4 p-4 border-b border-border/50">
    <div className="h-6 w-1/4 rounded bg-muted" />
    <div className="h-6 w-1/4 rounded bg-muted" />
    <div className="h-6 w-1/4 rounded bg-muted" />
    <div className="h-6 w-1/4 rounded bg-muted" />
  </div>
)

import { NoteTemplatesList } from './configuracoes/NoteTemplatesList'
import { UserProfile } from './configuracoes/UserProfile'

export default function Configuracoes() {
  const { usuario, user } = useAuth()
  const currentUser = usuario || user
  const { toast } = useToast()

  const isAdmin = currentUser?.role === 'admin'

  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  const [professionals, setProfessionals] = useState<any[]>([])
  const [loadingProfs, setLoadingProfs] = useState(true)
  const [profModalOpen, setProfModalOpen] = useState(false)
  const [selectedProf, setSelectedProf] = useState<any | null>(null)

  const [costConfig, setCostConfig] = useState<SystemConfig | null>(null)
  const [costValue, setCostValue] = useState('')
  const [costDesc, setCostDesc] = useState('')
  const [loadingCosts, setLoadingCosts] = useState(true)
  const [savingCosts, setSavingCosts] = useState(false)

  const loadPlans = async () => {
    try {
      const data = await getPlans()
      setPlans(data as any)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingPlans(false)
    }
  }

  const loadProfessionals = async () => {
    try {
      const data = await getProfessionals()
      setProfessionals(data as any)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingProfs(false)
    }
  }

  const loadCosts = async () => {
    try {
      const config = await getSystemConfig('fixed_operational_cost')
      setCostConfig(config)
      setCostValue(config.value_number.toString())
      setCostDesc(config.value_text)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingCosts(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadPlans()
      loadProfessionals()
      loadCosts()
    }
  }, [isAdmin])

  useRealtime('plans', () => {
    if (isAdmin) loadPlans()
  })

  useRealtime('professionals', () => {
    if (isAdmin) loadProfessionals()
  })

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan)
    setPlanModalOpen(true)
  }

  const handleEditProf = (prof: any) => {
    setSelectedProf(prof)
    setProfModalOpen(true)
  }

  const handleDeleteProf = async (id: string) => {
    try {
      await deleteProfessional(id)
      toast({
        title: 'Profissional deletado',
        className: 'bg-success text-success-foreground',
        duration: 3000,
      })
    } catch (err) {
      toast({ title: 'Erro ao deletar', variant: 'destructive', duration: 3000 })
    }
  }

  const handleSaveCosts = async () => {
    if (!costConfig) return
    const val = parseFloat(costValue)
    if (isNaN(val) || val < 0) {
      toast({
        title: 'O custo deve ser maior ou igual a 0',
        variant: 'destructive',
        duration: 3000,
      })
      return
    }

    setSavingCosts(true)
    try {
      await updateSystemConfig(costConfig.id, {
        value_number: val,
        value_text: costDesc,
      })
      toast({
        title: 'Custos operacionais atualizados com sucesso',
        className: 'bg-success text-success-foreground',
        duration: 3000,
      })
      loadCosts()
    } catch (err) {
      toast({ title: 'Erro ao salvar custos', variant: 'destructive', duration: 3000 })
    } finally {
      setSavingCosts(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie planos, profissionais e configurações globais do sistema.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="flex flex-wrap w-full mb-6 h-auto p-1 justify-start gap-2 bg-transparent">
          <TabsTrigger
            value="profile"
            className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card"
          >
            Perfil
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger
              value="plans"
              className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card"
            >
              Planos
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger
              value="professionals"
              className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card"
            >
              Profissionais
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger
              value="system_costs"
              className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card"
            >
              Custo Fixo Global
            </TabsTrigger>
          )}
          <TabsTrigger
            value="note_templates"
            className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card"
          >
            Modelos de Notas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 outline-none">
          <UserProfile />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="plans" className="space-y-4 outline-none">
            <Card className="shadow-subtle border-border/50">
              <CardHeader>
                <CardTitle>Planos</CardTitle>
                <CardDescription>
                  Gerencie os detalhes e preços dos planos disponíveis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPlans ? (
                  <div className="space-y-2">
                    <SkeletonRow />
                    <SkeletonRow />
                  </div>
                ) : (
                  <div className="rounded-[8px] border border-border/50 bg-card overflow-x-auto shadow-subtle">
                    <Table className="min-w-[600px]">
                      <TableHeader className="bg-slate-50/80">
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Duração (meses)</TableHead>
                          <TableHead>Preço (R$)</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {plans.map((plan) => (
                          <TableRow key={plan.id} className="hover:bg-slate-50 transition-colors">
                            <TableCell className="font-medium">{plan.name}</TableCell>
                            <TableCell>{plan.duration_months}</TableCell>
                            <TableCell>
                              {plan.price.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditPlan(plan)}
                                className="text-primary hover:text-primary/80 hover:bg-primary/10 size-8"
                              >
                                <Edit2 className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {plans.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="h-24 text-center text-muted-foreground"
                            >
                              Nenhum plano encontrado.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="professionals" className="space-y-4 outline-none">
            <Card className="shadow-subtle border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1.5">
                  <CardTitle>Profissionais</CardTitle>
                  <CardDescription>
                    Gerencie a equipe, suas especialidades e status de atuação.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setSelectedProf(null)
                    setProfModalOpen(true)
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="size-4 mr-2" />
                  Novo Profissional
                </Button>
              </CardHeader>
              <CardContent>
                {loadingProfs ? (
                  <div className="space-y-2">
                    <SkeletonRow />
                    <SkeletonRow />
                  </div>
                ) : (
                  <ProfissionaisTable
                    data={professionals}
                    onEdit={handleEditProf}
                    onDelete={handleDeleteProf}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="system_costs" className="space-y-4 outline-none">
            <Card className="shadow-subtle border-border/50 max-w-2xl">
              <CardHeader>
                <CardTitle>Custo Fixo Global</CardTitle>
                <CardDescription>
                  Configure os custos fixos mensais que são calculados no dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingCosts ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                      <div className="h-10 w-full max-w-sm rounded bg-muted animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                      <div className="h-24 w-full rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="cost" className="font-semibold">
                        Custo Mensal Fixo (R$)
                      </Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        value={costValue}
                        onChange={(e) => setCostValue(e.target.value)}
                        placeholder="Ex: 5000.00"
                        className="max-w-sm transition-colors focus-visible:ring-primary"
                      />
                      <p className="text-sm text-muted-foreground">
                        Este valor é descontado do lucro líquido no dashboard.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="desc" className="font-semibold">
                        Descrição
                      </Label>
                      <Textarea
                        id="desc"
                        value={costDesc}
                        onChange={(e) => setCostDesc(e.target.value)}
                        placeholder="Detalhes adicionais sobre os custos operacionais (aluguel, água, luz, etc)..."
                        className="resize-none h-24 transition-colors focus-visible:ring-primary"
                      />
                    </div>

                    <Button
                      onClick={handleSaveCosts}
                      disabled={savingCosts}
                      className="bg-success hover:bg-success/90 text-success-foreground w-full sm:w-auto"
                    >
                      {savingCosts ? 'Salvando...' : 'Salvar Custos'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="note_templates" className="space-y-4 outline-none">
          <Card className="shadow-subtle border-border/50">
            <CardHeader>
              <CardTitle>Modelos de Notas Clínicas</CardTitle>
              <CardDescription>
                Gerencie templates pré-formatados para agilizar as anotações clínicas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NoteTemplatesList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PlanFormModal
        open={planModalOpen}
        onOpenChange={setPlanModalOpen}
        plan={selectedPlan}
        onSuccess={() => {}}
      />

      <ProfissionalForm open={profModalOpen} onOpenChange={setProfModalOpen} item={selectedProf} />
    </div>
  )
}
