import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { useAuth } from '@/hooks/use-auth'
import {
  differenceInYears,
  format,
  startOfMonth,
  subMonths,
  eachMonthOfInterval,
  endOfMonth,
} from 'date-fns'

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

export interface Reminder {
  id: string
  title: string
  scheduled_date: string
  type: string
  patient_name?: string
}

export interface DashboardData {
  grossRevenue: number
  professionalCosts: number
  operationalCosts: number
  netMargin: number
  netProfit: number
  totalPatients: number
  patientsByPlan: PlanStats[]
  birthdays: Birthday[]
  expiring: ExpiringContract[]
  pendingReminders: Reminder[]
  genderDistribution: { name: string; value: number; fill: string }[]
  ageDistribution: { name: string; count: number; fill: string }[]
  financialTimeline: { month: string; revenue: number; costs: number }[]
  monthlyConsultations: number
  consultationsByProfessional: { name: string; count: number }[]
}

export function useDashboardData() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.role === 'admin' || usuario?.role_name === 'admin'
  const [data, setData] = useState<DashboardData>({
    grossRevenue: 0,
    professionalCosts: 0,
    operationalCosts: 0,
    netMargin: 0,
    netProfit: 0,
    totalPatients: 0,
    patientsByPlan: [],
    birthdays: [],
    expiring: [],
    pendingReminders: [],
    genderDistribution: [],
    ageDistribution: [],
    financialTimeline: [],
    monthlyConsultations: 0,
    consultationsByProfessional: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      let costsPromise = Promise.resolve<any[]>([])
      let opCostsPromise = Promise.resolve<any[]>([])

      if (isAdmin) {
        costsPromise = pb
          .collection('professional_costs')
          .getFullList({ expand: 'professional_id,plan_id' })
        opCostsPromise = pb.collection('operational_costs').getFullList()
      }

      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)
      const thisMonthStr = thisMonth.toISOString().replace('T', ' ')

      const [patients, costs, plans, opCosts, reminders, notes] = await Promise.all([
        pb.collection('patients').getFullList({ expand: 'plan_id', sort: '-created' }),
        costsPromise,
        pb.collection('plans').getFullList(),
        opCostsPromise,
        pb.collection('reminders').getFullList({
          filter: 'status = "pending"',
          expand: 'patient_id',
          sort: 'scheduled_date',
        }),
        pb.collection('patient_notes').getFullList({
          filter: `created >= "${thisMonthStr}"`,
          expand: 'professional_id',
        }),
      ])

      const activePatients = patients.filter((p) => p.status !== 'inactive')
      const grossRevenue = activePatients.reduce(
        (sum, p) => sum + (p.expand?.plan_id?.price || 0),
        0,
      )

      const professionalCosts = activePatients.reduce((sum, p) => {
        const pCosts = costs
          .filter((c) => c.plan_id === p.plan_id)
          .reduce((s, c) => s + c.cost_per_month, 0)
        return sum + pCosts
      }, 0)

      const today = new Date()
      const thisMonthOpCosts = opCosts
        .filter((c) => {
          const d = new Date(c.date)
          return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
        })
        .reduce((sum, c) => sum + c.cost_value, 0)

      const netProfit = grossRevenue - professionalCosts - thisMonthOpCosts
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

      const genderCounts = { male: 0, female: 0, other: 0 }
      activePatients.forEach((p) => {
        if (p.gender === 'male') genderCounts.male++
        else if (p.gender === 'female') genderCounts.female++
        else if (p.gender === 'other') genderCounts.other++
      })
      const genderDistribution = [
        { name: 'Masculino', value: genderCounts.male, fill: '#3b82f6' },
        { name: 'Feminino', value: genderCounts.female, fill: '#ec4899' },
        { name: 'Outros', value: genderCounts.other, fill: '#a855f7' },
      ].filter((x) => x.value > 0)

      const ageGroups = { '0-18': 0, '19-35': 0, '36-50': 0, '51+': 0 }
      activePatients.forEach((p) => {
        if (p.birth_date) {
          const age = differenceInYears(new Date(), new Date(p.birth_date))
          if (age <= 18) ageGroups['0-18']++
          else if (age <= 35) ageGroups['19-35']++
          else if (age <= 50) ageGroups['36-50']++
          else ageGroups['51+']++
        }
      })
      const ageDistribution = Object.entries(ageGroups).map(([name, count]) => ({
        name,
        count,
        fill: '#8b5cf6',
      }))

      const start = startOfMonth(subMonths(new Date(), 5))
      const end = endOfMonth(new Date())
      const months = eachMonthOfInterval({ start, end })
      const financialTimeline = months.map((m) => {
        const mStart = startOfMonth(m)
        const mEnd = endOfMonth(m)
        let mRev = 0
        let mProfCost = 0
        patients.forEach((p) => {
          const plan = p.expand?.plan_id
          if (!plan) return
          const pStart = p.contract_start ? new Date(p.contract_start.replace(' ', 'T')) : null
          const pEnd = p.contract_end ? new Date(p.contract_end.replace(' ', 'T')) : null
          if (p.status !== 'inactive' && (!pStart || pStart <= mEnd) && (!pEnd || pEnd >= mStart)) {
            mRev += plan.price
            mProfCost += costs
              .filter((c) => c.plan_id === plan.id)
              .reduce((s, c) => s + c.cost_per_month, 0)
          }
        })
        const mOpCost = opCosts
          .filter((c) => {
            const d = new Date(c.date)
            return d >= mStart && d <= mEnd
          })
          .reduce((s, c) => s + c.cost_value, 0)

        return {
          month: format(m, 'MMM/yy'),
          revenue: mRev,
          costs: mProfCost + mOpCost,
        }
      })

      const currentMonth = new Date().getMonth()
      const todayZero = new Date()
      todayZero.setHours(0, 0, 0, 0)
      const in30Days = new Date(todayZero)
      in30Days.setDate(todayZero.getDate() + 30)

      const birthdays = patients
        .filter((p) => {
          if (!p.birth_date) return false
          const [year, month, day] = p.birth_date.split(' ')[0].split('-')
          return parseInt(month, 10) - 1 === currentMonth
        })
        .map((p) => {
          const [year, month, day] = p.birth_date!.split(' ')[0].split('-')
          const d = new Date(todayZero.getFullYear(), parseInt(month, 10) - 1, parseInt(day, 10))
          return {
            id: p.id,
            name: p.name,
            date: format(d, 'dd/MM'),
            plan: p.expand?.plan_id?.name || 'Sem plano',
            isCurrentMonth: true,
            day: d.getDate(),
          }
        })
        .sort((a, b) => a.day - b.day)

      const expiring = activePatients
        .filter((p) => {
          if (!p.contract_end) return false
          const end = new Date(p.contract_end)
          return end <= in30Days
        })
        .map((p) => {
          const end = new Date(p.contract_end)
          const diffDays = Math.ceil((end.getTime() - todayZero.getTime()) / (1000 * 60 * 60 * 24))
          return {
            id: p.id,
            name: p.name,
            days: Math.abs(diffDays),
            planId: p.plan_id,
            endDate: format(end, 'dd/MM/yyyy'),
            status: diffDays < 0 ? ('overdue' as const) : ('expiring' as const),
            rawDays: diffDays,
          }
        })
        .sort((a, b) => a.rawDays - b.rawDays)

      const pendingReminders = reminders.map((r) => ({
        id: r.id,
        title: r.title,
        scheduled_date: r.scheduled_date,
        type: r.type,
        patient_name: r.expand?.patient_id?.name,
      }))

      const monthlyConsultations = notes.length
      const professionalCounts: Record<string, number> = {}
      const professionalNames: Record<string, string> = {}

      notes.forEach((note) => {
        const profId = note.professional_id
        professionalCounts[profId] = (professionalCounts[profId] || 0) + 1
        if (note.expand?.professional_id) {
          professionalNames[profId] = note.expand.professional_id.name
        }
      })

      const consultationsByProfessional = Object.keys(professionalCounts)
        .map((profId) => ({
          name: professionalNames[profId] || 'Desconhecido',
          count: professionalCounts[profId],
        }))
        .sort((a, b) => b.count - a.count)

      setData({
        grossRevenue,
        professionalCosts,
        operationalCosts: thisMonthOpCosts,
        netMargin,
        netProfit,
        totalPatients: activePatients.length,
        patientsByPlan: planStats,
        birthdays,
        expiring,
        pendingReminders,
        genderDistribution,
        ageDistribution,
        financialTimeline,
        monthlyConsultations,
        consultationsByProfessional,
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
  }, [toast, isAdmin])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useRealtime('patients', fetchData)
  useRealtime('reminders', fetchData)
  useRealtime('patient_notes', fetchData)
  useRealtime('plans', fetchData)
  useRealtime('professional_costs', fetchData, isAdmin)
  useRealtime('operational_costs', fetchData, isAdmin)

  const handleRenew = async (patientId: string, planId: string) => {
    try {
      const plan = await pb.collection('plans').getOne(planId)
      const patient = await pb.collection('patients').getOne(patientId)

      let startDate = new Date()
      if (patient.contract_end) {
        const end = new Date(patient.contract_end)
        if (end > startDate) startDate = end
      }

      const newEnd = new Date(startDate)
      newEnd.setMonth(newEnd.getMonth() + (plan.duration_months || 1))

      await pb.collection('patients').update(patientId, {
        contract_end: newEnd.toISOString(),
      })

      toast({ title: 'Contrato Renovado', description: 'A renovação foi aplicada com sucesso.' })
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
