import { useState, useEffect, useMemo, useCallback } from 'react'
import { startOfMonth, endOfMonth, subMonths, eachMonthOfInterval } from 'date-fns'
import pb from '@/lib/pocketbase/client'
import type { Patient } from '@/services/patients'
import type { ProfessionalCost } from '@/services/professional_costs'

export type Period = 'this_month' | 'last_3' | 'last_6' | 'last_12' | 'custom'

export function useFinancialData(period: Period, customStart?: string, customEnd?: string) {
  const [data, setData] = useState<{ patients: Patient[]; costs: ProfessionalCost[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [patientsRes, costsRes] = await Promise.all([
        pb.collection('patients').getFullList<Patient>({ expand: 'plan_id' }),
        pb
          .collection('professional_costs')
          .getFullList<ProfessionalCost>({ expand: 'professional_id,plan_id' }),
      ])
      setData({ patients: patientsRes, costs: costsRes })
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const computed = useMemo(() => {
    if (!data) return null

    let start = startOfMonth(new Date())
    let end = endOfMonth(new Date())

    if (period === 'last_3') start = startOfMonth(subMonths(new Date(), 2))
    if (period === 'last_6') start = startOfMonth(subMonths(new Date(), 5))
    if (period === 'last_12') start = startOfMonth(subMonths(new Date(), 11))
    if (period === 'custom' && customStart && customEnd) {
      start = startOfMonth(new Date(`${customStart}T00:00:00`))
      end = endOfMonth(new Date(`${customEnd}T23:59:59`))
    }

    const months = eachMonthOfInterval({ start, end })
    const numMonths = Math.max(months.length, 1)

    let totalRevenue = 0
    let totalCost = 0
    const timeline: any[] = []
    const plansMap = new Map<string, any>()
    const profsMap = new Map<string, any>()

    months.forEach((m) => {
      const mStart = startOfMonth(m)
      const mEnd = endOfMonth(m)
      let mRev = 0
      let mCost = 0

      data.patients.forEach((p) => {
        const plan = p.expand?.plan_id
        if (!plan) return
        const pStart = p.contract_start ? new Date(p.contract_start.replace(' ', 'T')) : null
        const pEnd = p.contract_end ? new Date(p.contract_end.replace(' ', 'T')) : null
        if (p.status !== 'inactive' && (!pStart || pStart <= mEnd) && (!pEnd || pEnd >= mStart)) {
          mRev += plan.price
          const ps = plansMap.get(plan.id) || {
            name: plan.name,
            quantity: 0,
            monthlyRev: 0,
            totalRev: 0,
          }
          ps.totalRev += plan.price
          plansMap.set(plan.id, ps)
        }
      })

      data.costs.forEach((c) => {
        mCost += c.cost_per_month
      })

      const label = `${['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][m.getMonth()]}/${m.getFullYear().toString().slice(2)}`
      timeline.push({ month: label, revenue: mRev, costs: mCost })
      totalRevenue += mRev
      totalCost += mCost
    })

    data.costs.forEach((c) => {
      const prof = c.expand?.professional_id
      if (prof) {
        const ps = profsMap.get(prof.id) || {
          name: prof.name,
          specialty: prof.specialty,
          monthlyCost: 0,
          totalCost: 0,
        }
        ps.monthlyCost += c.cost_per_month
        ps.totalCost += c.cost_per_month * numMonths
        profsMap.set(prof.id, ps)
      }
    })

    const lastMonthStart = startOfMonth(months[months.length - 1])
    const lastMonthEnd = endOfMonth(months[months.length - 1])
    const currentCounts = new Map<string, number>()

    data.patients.forEach((p) => {
      const plan = p.expand?.plan_id
      if (!plan) return
      const pStart = p.contract_start ? new Date(p.contract_start.replace(' ', 'T')) : null
      const pEnd = p.contract_end ? new Date(p.contract_end.replace(' ', 'T')) : null
      if (
        p.status !== 'inactive' &&
        (!pStart || pStart <= lastMonthEnd) &&
        (!pEnd || pEnd >= lastMonthStart)
      ) {
        currentCounts.set(plan.id, (currentCounts.get(plan.id) || 0) + 1)
      }
    })

    const plans = Array.from(plansMap.entries())
      .map(([id, ps]) => ({
        ...ps,
        quantity: currentCounts.get(id) || 0,
        monthlyRev: ps.totalRev / numMonths,
      }))
      .sort((a, b) => b.totalRev - a.totalRev)

    const colors = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899']
    return {
      totalRevenue,
      totalCost,
      netMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
      netProfit: totalRevenue - totalCost,
      timeline,
      plans,
      professionals: Array.from(profsMap.values()).sort((a, b) => b.totalCost - a.totalCost),
      pieData: plans.map((p, i) => ({
        name: p.name,
        value: p.totalRev,
        fill: colors[i % colors.length],
      })),
    }
  }, [data, period, customStart, customEnd])

  return { computed, loading, error, refetch: fetchData }
}
