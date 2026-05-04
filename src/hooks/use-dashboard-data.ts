import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export interface PlanStats {
  plan: string
  count: number
  revenue: number
}

export interface Birthday {
  id: string
  name: string
  date: string
  plan: string
  isCurrentMonth: boolean
  day: number
}

export interface ExpiringContract {
  id: string
  name: string
  days: number
  planId: string
  endDate: string
  status: 'overdue' | 'expiring'
  rawDays: number
}

export interface DashboardData {
  grossRevenue: number
  professionalCosts: number
  netMargin: number
  netProfit: number
  totalPatients: number
  patientsByPlan: PlanStats[]
  birthdays: Birthday[]
  expiring: ExpiringContract[]
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    grossRevenue: 0,
    professionalCosts: 0,
    netMargin: 0,
    netProfit: 0,
    totalPatients: 0,
    patientsByPlan: [],
    birthdays: [],
    expiring: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      const [patients, costs, plans] = await Promise.all([
        pb.collection('patients').getFullList({ expand: 'plan_id', sort: '-created' }),
        pb.collection('professional_costs').getFullList({ expand: 'professional_id' }),
        pb.collection('plans').getFullList(),
      ])

      const activePatients = patients.filter((p) => p.status === 'active')
      const grossRevenue = activePatients.reduce(
        (sum, p) => sum + (p.expand?.plan_id?.price || 0),
        0,
      )

      const activeCosts = costs.filter((c) => c.expand?.professional_id?.status === 'active')
      const professionalCosts = activeCosts.reduce((sum, c) => sum + (c.cost_per_month || 0), 0)

      const netProfit = grossRevenue - professionalCosts
      const netMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0

      const planStats = plans
        .map((plan) => {
          const planPatients = activePatients.filter((p) => p.plan_id === plan.id)
          return {
            plan: plan.name,
            count: planPatients.length,
            revenue: planPatients.length * (plan.price || 0),
          }
        })
        .filter((p) => p.count > 0)
        .sort((a, b) => b.revenue - a.revenue)

      const currentMonth = new Date().getMonth()
      const birthdays = patients
        .filter((p) => {
          if (!p.birth_date) return false
          const parts = p.birth_date.split(' ')[0].split('-')
          if (parts.length === 3) {
            return parseInt(parts[1], 10) - 1 === currentMonth
          }
          return new Date(p.birth_date).getMonth() === currentMonth
        })
        .map((p) => {
          let dateStr = ''
          let day = 0
          const parts = p.birth_date.split(' ')[0].split('-')
          if (parts.length === 3) {
            const d = new Date(
              parseInt(parts[0], 10),
              parseInt(parts[1], 10) - 1,
              parseInt(parts[2], 10),
            )
            day = d.getDate()
            dateStr = `${day.toString().padStart(2, '0')} de ${d.toLocaleString('pt-BR', { month: 'long' })}`
          } else {
            const d = new Date(p.birth_date)
            day = d.getDate()
            dateStr = `${day.toString().padStart(2, '0')} de ${d.toLocaleString('pt-BR', { month: 'long' })}`
          }
          return {
            id: p.id,
            name: p.name,
            date: dateStr,
            plan: p.expand?.plan_id?.name || 'Sem plano',
            isCurrentMonth: true,
            day,
          }
        })
        .sort((a, b) => a.day - b.day)

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const in7Days = new Date(today)
      in7Days.setDate(today.getDate() + 7)

      const expiring = activePatients
        .filter((p) => {
          if (!p.contract_end) return false
          const endParts = p.contract_end.split(' ')[0].split('-')
          const end = new Date(
            parseInt(endParts[0]),
            parseInt(endParts[1]) - 1,
            parseInt(endParts[2]),
          )
          return end <= in7Days
        })
        .map((p) => {
          const endParts = p.contract_end.split(' ')[0].split('-')
          const end = new Date(
            parseInt(endParts[0]),
            parseInt(endParts[1]) - 1,
            parseInt(endParts[2]),
          )
          const diffTime = end.getTime() - today.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          return {
            id: p.id,
            name: p.name,
            days: Math.abs(diffDays),
            planId: p.plan_id,
            endDate: `${end.getDate().toString().padStart(2, '0')}/${(end.getMonth() + 1).toString().padStart(2, '0')}/${end.getFullYear()}`,
            status: diffDays < 0 ? ('overdue' as const) : ('expiring' as const),
            rawDays: diffDays,
          }
        })
        .sort((a, b) => a.rawDays - b.rawDays)

      setData({
        grossRevenue,
        professionalCosts,
        netMargin,
        netProfit,
        totalPatients: activePatients.length,
        patientsByPlan: planStats,
        birthdays,
        expiring,
      })
    } catch (err) {
      console.error(err)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao carregar dados do dashboard',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useRealtime('patients', fetchData)
  useRealtime('professional_costs', fetchData)
  useRealtime('plans', fetchData)

  const handleRenew = async (patientId: string, planId: string) => {
    try {
      const plan = await pb.collection('plans').getOne(planId)
      const patient = await pb.collection('patients').getOne(patientId)

      let startDate = new Date()
      if (patient.contract_end) {
        const endParts = patient.contract_end.split(' ')[0].split('-')
        const end = new Date(
          parseInt(endParts[0]),
          parseInt(endParts[1]) - 1,
          parseInt(endParts[2]),
        )
        if (end > startDate) startDate = end
      }

      const newEnd = new Date(startDate)
      newEnd.setMonth(newEnd.getMonth() + (plan.duration_months || 1))

      const finalDateStr = newEnd.toISOString().split('T')[0] + ' 12:00:00.000Z'

      await pb.collection('patients').update(patientId, {
        contract_end: finalDateStr,
      })

      toast({
        title: 'Contrato Renovado',
        description: 'A renovação foi aplicada com sucesso.',
        duration: 3000,
      })

      fetchData()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro na renovação',
        description: getErrorMessage(error),
      })
    }
  }

  return { data, isLoading, handleRenew }
}
