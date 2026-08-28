import { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  TrendingDown,
  AlertTriangle,
  Receipt,
  Check,
  Percent,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { PieChart, Pie, Cell } from 'recharts'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { getSystemConfig, updateSystemConfig, SystemConfig } from '@/services/system_config'

import { OperationalCostsDialog } from './OperationalCostsDialog'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

export function OperationalCostsList({ isAdmin, period }: { isAdmin?: boolean; period?: string }) {
  const [data, setData] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Impostos' | string>('all')

  // Tax estimate / budget limit state
  const [taxConfigRecord, setTaxConfigRecord] = useState<SystemConfig | null>(null)
  const [taxEstimate, setTaxEstimate] = useState<number>(5000)
  const [isEditingEstimate, setIsEditingEstimate] = useState(false)
  const [tempEstimate, setTempEstimate] = useState<string>('5000')
  const [savingEstimate, setSavingEstimate] = useState(false)

  const { toast } = useToast()

  const loadData = async () => {
    try {
      const res = await pb.collection('operational_costs').getFullList({ sort: '-date,-created' })
      setData(res)
    } catch (e) {
      console.error(e)
    }
  }

  const loadTaxConfig = async () => {
    try {
      const config = await getSystemConfig('tax_monthly_estimate')
      setTaxConfigRecord(config)
      setTaxEstimate(config.value_number ?? 0)
      setTempEstimate((config.value_number ?? 0).toString())
    } catch (e) {
      // If config doesn't exist yet, fallback to 5000
      setTaxEstimate(5000)
      setTempEstimate('5000')
    }
  }

  useEffect(() => {
    loadData()
    loadTaxConfig()
  }, [])

  useRealtime('operational_costs', loadData)
  useRealtime('system_config', loadTaxConfig)

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este registro?')) return
    try {
      await pb.collection('operational_costs').delete(id)
      toast({ title: 'Excluído com sucesso' })
    } catch (e) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  const handleSaveTaxEstimate = async () => {
    const val = parseFloat(tempEstimate)
    if (isNaN(val) || val < 0) {
      toast({
        title: 'Valor inválido',
        description: 'A estimativa deve ser um número maior ou igual a zero.',
        variant: 'destructive',
      })
      return
    }

    setSavingEstimate(true)
    try {
      if (taxConfigRecord) {
        const updated = await updateSystemConfig(taxConfigRecord.id, { value_number: val })
        setTaxConfigRecord(updated)
        setTaxEstimate(updated.value_number)
      } else {
        const created = await pb.collection('system_config').create({
          key: 'tax_monthly_estimate',
          value_number: val,
          value_text: 'Estimativa planejada de impostos mensais',
        })
        setTaxConfigRecord(created as any)
        setTaxEstimate(val)
      }
      setIsEditingEstimate(false)
      toast({ title: 'Estimativa de impostos atualizada com sucesso!' })
    } catch (e: any) {
      toast({
        title: 'Erro ao salvar estimativa',
        description: e.message,
        variant: 'destructive',
      })
    } finally {
      setSavingEstimate(false)
    }
  }

  // Month-filtered operational costs
  const monthCosts = useMemo(() => {
    return data.filter((item) => !period || (item.date && item.date.startsWith(period)))
  }, [data, period])

  const totalCosts = useMemo(() => {
    return monthCosts.reduce((sum, item) => sum + (item.cost_value || 0), 0)
  }, [monthCosts])

  // Taxes specifically
  const taxCosts = useMemo(() => {
    return monthCosts
      .filter((item) => item.category === 'Impostos')
      .reduce((sum, item) => sum + (item.cost_value || 0), 0)
  }, [monthCosts])

  const otherCosts = Math.max(0, totalCosts - taxCosts)
  const taxPercentage = totalCosts > 0 ? (taxCosts / totalCosts) * 100 : 0
  const isTaxExceeded = taxEstimate > 0 && taxCosts > taxEstimate
  const taxExcessAmount = taxCosts - taxEstimate

  // Chart data for distribution
  const chartData = useMemo(() => {
    if (totalCosts === 0) return []
    return [
      {
        name: 'Impostos',
        value: taxCosts,
        fill: '#f59e0b', // Amber / warm warning
        percentage: taxPercentage,
      },
      {
        name: 'Demais Custos Operacionais',
        value: otherCosts,
        fill: '#3b82f6', // Blue primary
        percentage: 100 - taxPercentage,
      },
    ].filter((item) => item.value > 0)
  }, [taxCosts, otherCosts, totalCosts, taxPercentage])

  const chartConfig = {
    Impostos: { label: 'Impostos', color: '#f59e0b' },
    'Demais Custos Operacionais': { label: 'Demais Custos Operacionais', color: '#3b82f6' },
  }

  // Table data with category filter
  const displayedTableData = useMemo(() => {
    if (categoryFilter === 'all') return monthCosts
    return monthCosts.filter((item) => item.category === categoryFilter)
  }, [monthCosts, categoryFilter])

  const handleToggleStatus = async (item: any) => {
    try {
      await pb.collection('operational_costs').update(item.id, { paid_status: !item.paid_status })
    } catch (e) {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Alerta de Custo se ultrapassar a meta */}
      {isTaxExceeded && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-800 dark:text-amber-200 shadow-sm animate-pulse"
        >
          <div className="p-2 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle className="size-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              Alerta de Custo: Estimativa de Impostos Excedida
            </h4>
            <p className="text-sm mt-1 text-amber-900/80 dark:text-amber-200/90">
              O total de <strong>Impostos</strong> no mês selecionado ({formatCurrency(taxCosts)})
              ultrapassou a meta planejada de {formatCurrency(taxEstimate)} por{' '}
              <strong className="text-destructive font-bold">
                {formatCurrency(taxExcessAmount)}
              </strong>
              .
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Custos Operacionais */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-destructive/20 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-destructive/10">
                <TrendingDown className="size-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Custos Operacionais
                </p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(totalCosts)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total de Impostos e % */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-amber-500/20 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-500/10">
                  <Receipt className="size-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Total em Impostos
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {formatCurrency(taxCosts)}
                    </p>
                    {isTaxExceeded && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        <AlertTriangle className="size-3 mr-1" /> Acima da meta
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="font-semibold text-xs border-amber-500/40">
                  <Percent className="size-3 mr-1 text-amber-500" />
                  {taxPercentage.toFixed(1)}% do total
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estimativa Planejada de Impostos (Editável) */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Estimativa Mensal de Impostos
                </p>
                {isEditingEstimate ? (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        R$
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="h-8 w-32 pl-8 text-sm"
                        value={tempEstimate}
                        onChange={(e) => setTempEstimate(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <Button
                      size="sm"
                      className="h-8 px-2"
                      onClick={handleSaveTaxEstimate}
                      disabled={savingEstimate}
                    >
                      <Check className="size-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2"
                      onClick={() => {
                        setTempEstimate(taxEstimate.toString())
                        setIsEditingEstimate(false)
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{formatCurrency(taxEstimate)}</p>
                    {isAdmin !== false && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setTempEstimate(taxEstimate.toString())
                          setIsEditingEstimate(true)
                        }}
                        title="Editar estimativa de impostos"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Meta de teto para emissão do alerta visual no mês.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Distribuição dos Custos (Impostos vs Outros) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <span>Distribuição de Impostos</span>
              <Badge variant="outline" className="font-normal text-xs">
                Competência {period || 'Geral'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Porcentagem de Impostos em relação ao custo operacional total do mês.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {chartData.length > 0 ? (
              <div className="space-y-4">
                <ChartContainer config={chartConfig} className="h-[230px] w-full">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(v: number, name: any) => {
                            const pct = totalCosts > 0 ? ((v / totalCosts) * 100).toFixed(1) : '0'
                            return (
                              <span className="flex items-center gap-2">
                                <strong>{formatCurrency(v)}</strong>
                                <span className="text-xs text-muted-foreground">({pct}%)</span>
                              </span>
                            )
                          }}
                        />
                      }
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                    <p className="text-muted-foreground">Impostos</p>
                    <p className="font-bold text-amber-600 dark:text-amber-400">
                      {taxPercentage.toFixed(1)}%
                    </p>
                    <p className="text-[11px] text-muted-foreground">{formatCurrency(taxCosts)}</p>
                  </div>
                  <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
                    <p className="text-muted-foreground">Outros Custos</p>
                    <p className="font-bold text-blue-600 dark:text-blue-400">
                      {(100 - taxPercentage).toFixed(1)}%
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatCurrency(otherCosts)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[230px] flex flex-col items-center justify-center text-muted-foreground text-sm">
                <Receipt className="size-8 mb-2 opacity-40" />
                Nenhum custo registrado para este mês
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabela de Lançamentos com Filtro Rápido por Categoria */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">Gastos Operacionais</CardTitle>
              <CardDescription>
                {categoryFilter === 'Impostos'
                  ? 'Visualizando apenas lançamentos da categoria Impostos'
                  : 'Lançamentos detalhados do período'}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Filtro Rápido */}
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-md border text-xs">
                <Filter className="size-3.5 text-muted-foreground ml-1.5" />
                <Button
                  size="sm"
                  variant={categoryFilter === 'all' ? 'default' : 'ghost'}
                  className="h-7 text-xs px-2.5"
                  onClick={() => setCategoryFilter('all')}
                >
                  Todos ({monthCosts.length})
                </Button>
                <Button
                  size="sm"
                  variant={categoryFilter === 'Impostos' ? 'default' : 'ghost'}
                  className="h-7 text-xs px-2.5 bg-amber-500 text-white hover:bg-amber-600 data-[state=active]:bg-amber-600"
                  onClick={() => setCategoryFilter('Impostos')}
                >
                  <Receipt className="size-3 mr-1" />
                  Apenas Impostos ({monthCosts.filter((c) => c.category === 'Impostos').length})
                </Button>
              </div>

              {isAdmin !== false && (
                <Button
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    setEditingItem(null)
                    setDialogOpen(true)
                  }}
                >
                  <Plus className="size-4 mr-1.5" /> Novo Gasto
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedTableData.map((item) => (
                    <TableRow
                      key={item.id}
                      className={item.category === 'Impostos' ? 'bg-amber-500/5' : ''}
                    >
                      <TableCell>
                        {item.date
                          ? item.date.substring(0, 10).split('-').reverse().join('/')
                          : '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {item.name}
                          {item.category === 'Impostos' && (
                            <Receipt className="size-3.5 text-amber-500 shrink-0" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.category === 'Impostos' ? 'default' : 'outline'}
                          className={
                            item.category === 'Impostos'
                              ? 'bg-amber-500 text-white hover:bg-amber-600'
                              : ''
                          }
                        >
                          {item.category || 'Outros'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(item.cost_value || 0)}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className="flex items-center gap-1 hover:opacity-80"
                        >
                          {item.paid_status ? (
                            <Badge className="bg-emerald-500 hover:bg-emerald-600">
                              <CheckCircle2 className="size-3 mr-1" /> Pago
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Circle className="size-3 mr-1" /> Pendente
                            </Badge>
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {isAdmin !== false && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => {
                                setEditingItem(item)
                                setDialogOpen(true)
                              }}
                            >
                              <Edit2 className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {displayedTableData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {categoryFilter === 'Impostos'
                          ? 'Nenhum lançamento de Impostos encontrado para o período selecionado.'
                          : 'Nenhum registro de custo operacional encontrado.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <OperationalCostsDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            item={editingItem}
          />
        </Card>
      </div>
    </div>
  )
}
