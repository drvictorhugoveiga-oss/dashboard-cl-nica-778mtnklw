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
import { Edit2, User } from 'lucide-react'
import { CustoForm } from './CustoForm'

interface Props {
  selectedProfId: string
  onSelectProf: (id: string) => void
}

export function CustosList({ selectedProfId, onSelectProf }: Props) {
  const [profissionais, setProfissionais] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [costs, setCosts] = useState<any[]>([])
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

  if (loading)
    return <Skeleton className="h-[200px] w-full rounded-xl animate-pulse duration-1500" />

  return (
    <div className="space-y-4 animate-fade-in-up delay-75">
      <div className="w-full">
        <Select value={selectedProfId} onValueChange={onSelectProf}>
          <SelectTrigger className="w-full bg-white h-10">
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <SelectValue placeholder="Escolha um profissional..." />
            </div>
          </SelectTrigger>
          <SelectContent>
            {profissionais.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} -{' '}
                <span className="text-muted-foreground capitalize text-xs">{p.specialty}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedProfId ? (
        <Card className="bg-muted/30 border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <p>Selecione um profissional acima para visualizar e editar seus custos por plano.</p>
          </CardContent>
        </Card>
      ) : loadingCosts ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg animate-pulse duration-1500" />
          ))}
        </div>
      ) : isMobile ? (
        <div className="grid grid-cols-1 gap-4">
          {mergedData.map(({ plan, costRecord }) => (
            <Card key={plan.id} className="p-4 shadow-subtle border border-border">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-foreground">{plan.name}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="text-muted-foreground mr-2">Mensal:</span>
                      <span className="font-semibold text-primary">
                        {costRecord ? formatCurrency(costRecord.cost_per_month) : 'R$ 0,00'}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground mr-2">Sessão:</span>
                      <span className="font-semibold text-primary">
                        {costRecord ? formatCurrency(costRecord.cost_per_session || 0) : 'R$ 0,00'}
                      </span>
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:text-primary/80 hover:bg-primary/10"
                  onClick={() => setEditItem({ plan, cost: costRecord })}
                >
                  <Edit2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden shadow-subtle">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead>Plano</TableHead>
                <TableHead>Custo Mensal</TableHead>
                <TableHead>Custo por Sessão</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mergedData.map(({ plan, costRecord }) => (
                <TableRow
                  key={plan.id}
                  className="even:bg-slate-50/40 hover:bg-slate-50 transition-colors"
                >
                  <TableCell className="font-medium whitespace-nowrap">{plan.name}</TableCell>
                  <TableCell className="font-semibold text-primary">
                    {costRecord ? (
                      formatCurrency(costRecord.cost_per_month)
                    ) : (
                      <span className="text-muted-foreground font-normal">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {costRecord ? (
                      formatCurrency(costRecord.cost_per_session || 0)
                    ) : (
                      <span className="text-muted-foreground font-normal">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80 hover:bg-primary/10 h-8"
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
