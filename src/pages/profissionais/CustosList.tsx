import { useState, useEffect, useCallback, useMemo } from 'react'
import { getProfessionals } from '@/services/professionals'
import { getPlans } from '@/services/plans'
import { getProfessionalCosts } from '@/services/professional_costs'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import { Edit2 } from 'lucide-react'
import { CustoForm } from './CustoForm'

export function CustosList() {
  const [profissionais, setProfissionais] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [costs, setCosts] = useState<any[]>([])
  const [selectedProfId, setSelectedProfId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [loadingCosts, setLoadingCosts] = useState(false)

  const [editItem, setEditItem] = useState<{ plan: any; cost: any } | null>(null)

  const loadInitialData = async () => {
    try {
      const [profs, plns] = await Promise.all([getProfessionals(), getPlans()])
      setProfissionais(profs)
      setPlans(plns)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadCosts = useCallback(async (profId: string) => {
    if (!profId) return
    try {
      setLoadingCosts(true)
      const res = await getProfessionalCosts(profId)
      setCosts(res)
    } finally {
      setLoadingCosts(false)
    }
  }, [])

  useEffect(() => {
    if (selectedProfId) loadCosts(selectedProfId)
  }, [selectedProfId, loadCosts])

  useRealtime('professional_costs', () => {
    if (selectedProfId) loadCosts(selectedProfId)
  })
  useRealtime('plans', loadInitialData)
  useRealtime('professionals', loadInitialData)

  const isMobile = useIsMobile()

  const mergedData = useMemo(() => {
    return plans.map((plan) => {
      const costRecord = costs.find((c) => c.plan_id === plan.id)
      return { plan, costRecord }
    })
  }, [plans, costs])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  if (loading) return <Skeleton className="h-[200px] w-full rounded-xl" />

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="max-w-md">
        <label className="text-sm font-medium mb-2 block">Selecione o Profissional</label>
        <Select value={selectedProfId} onValueChange={setSelectedProfId}>
          <SelectTrigger>
            <SelectValue placeholder="Escolha um profissional..." />
          </SelectTrigger>
          <SelectContent>
            {profissionais.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedProfId ? (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <p>Selecione um profissional acima para visualizar e editar seus custos por plano.</p>
          </CardContent>
        </Card>
      ) : loadingCosts ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : isMobile ? (
        <div className="grid grid-cols-1 gap-4">
          {mergedData.map(({ plan, costRecord }) => (
            <Card key={plan.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="text-2xl font-bold mt-2 text-primary">
                    {costRecord ? formatCurrency(costRecord.cost_per_month) : 'R$ 0,00'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditItem({ plan, cost: costRecord })}
                >
                  <Edit2 className="size-4 text-muted-foreground" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plano</TableHead>
                <TableHead>Custo Mensal</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mergedData.map(({ plan, costRecord }) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell className="font-semibold">
                    {costRecord ? (
                      formatCurrency(costRecord.cost_per_month)
                    ) : (
                      <span className="text-muted-foreground">Não definido</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditItem({ plan, cost: costRecord })}
                    >
                      <Edit2 className="size-4 mr-2" />
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {editItem && (
        <CustoForm
          open={!!editItem}
          onOpenChange={(v) => !v && setEditItem(null)}
          plan={editItem.plan}
          costRecord={editItem.cost}
          professionalId={selectedProfId}
        />
      )}
    </div>
  )
}
