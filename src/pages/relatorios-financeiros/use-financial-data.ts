import { useState, useEffect, useMemo, useCallback } from 'react'
import { startOfMonth, endOfMonth, subMonths, eachMonthOfInterval } from 'date-fns'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'

export type Period = 'this_month' | 'last_3' | 'last_6' | 'last_12' | 'custom'
export type ViewType = 'general' | 'monthly'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function useFinancialData(period: Period, customStart?: string, customEnd?: string) {
  const [data, setData] = useState<{
    patients: any[]
    costs: any[]
    opCosts: any[]
    revenue: any[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await pb.send('/backend/v1/financial-reports', { method: 'GET' })
      setData({
        patients: res.patients || [],
        costs: res.professional_costs || [],
        opCosts: res.operational_costs || [],
        revenue: res.revenue || [],
      })
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useRealtime('revenue', fetchData)
  useRealtime('operational_costs', fetchData)
  useRealtime('professional_costs', fetchData)
  useRealtime('patients', fetchData)

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

    // General View Logic
    const patientDetails = data.patients
      .map((p) => {
        const plan = p.expand?.plan_id
        const pStart = p.contract_start ? new Date(p.contract_start.replace(' ', 'T')) : null
        const pEnd = p.contract_end ? new Date(p.contract_end.replace(' ', 'T')) : null

        let activeMonths = 0
        months.forEach((m) => {
          const mStart = startOfMonth(m)
          const mEnd = endOfMonth(m)
          if (p.status !== 'inactive' && (!pStart || pStart <= mEnd) && (!pEnd || pEnd >= mStart)) {
            activeMonths++
          }
        })

        const gain = (plan?.price || 0) * activeMonths
        const monthlyProfCost = data.costs
          .filter((c) => c.plan_id === plan?.id)
          .reduce((sum, c) => sum + c.cost_per_month, 0)
        const loss = monthlyProfCost * activeMonths

        return {
          id: p.id,
          patientName: p.name,
          planName: plan?.name || 'Sem Plano',
          activeMonths,
          gain,
          loss,
          netProfit: gain - loss,
        }
      })
      .filter((p) => p.activeMonths > 0)
      .sort((a, b) => b.netProfit - a.netProfit)

    const profitPerPlanMap = new Map<string, number>()
    patientDetails.forEach((p) => {
      if (p.planName !== 'Sem Plano') {
        profitPerPlanMap.set(p.planName, (profitPerPlanMap.get(p.planName) || 0) + p.netProfit)
      }
    })

    const colors = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#eab308']
    const profitPerPlan = Array.from(profitPerPlanMap.entries()).map(([name, value], i) => ({
      name,
      value: Math.max(0, value),
      fill: colors[i % colors.length],
    }))

    const filteredOpCosts = data.opCosts.filter((c) => {
      if (!c.date) return false
      const d = new Date(c.date.replace(' ', 'T'))
      return d >= start && d <= end
    })

    const filteredProfCosts = data.costs.filter((c) => {
      if (!c.date) return false
      const d = new Date(c.date.replace(' ', 'T'))
      return d >= start && d <= end
    })

    const filteredRevenue = data.revenue.filter((r) => {
      if (!r.date) return false
      const d = new Date(r.date.replace(' ', 'T'))
      return d >= start && d <= end
    })

    const totalGainsCalc = patientDetails.reduce((sum, p) => sum + p.gain, 0)
    const totalRevenueManual = filteredRevenue.reduce((sum, r) => sum + r.value, 0)

    // Ensures manual entries correctly aggregate.
    const totalGains = totalRevenueManual > 0 ? totalRevenueManual : totalGainsCalc

    const totalProfLosses =
      filteredProfCosts.length > 0
        ? filteredProfCosts.reduce((sum, c) => sum + c.cost_per_month, 0)
        : patientDetails.reduce((sum, p) => sum + p.loss, 0)

    const totalOpLosses = filteredOpCosts.reduce((sum, c) => sum + c.cost_value, 0)
    const totalLosses = totalProfLosses + totalOpLosses

    const gainsVsLosses = [
      { name: 'Ganhos', value: totalGains, fill: '#22c55e' },
      { name: 'Perdas', value: totalLosses, fill: '#ef4444' },
    ]

    const general = {
      patientDetails,
      profitPerPlan,
      gainsVsLosses,
      totalRevenue: totalGains,
      totalCost: totalLosses,
      netMargin: totalGains > 0 ? ((totalGains - totalLosses) / totalGains) * 100 : 0,
      netProfit: totalGains - totalLosses,
    }

    // Monthly View Logic
    const monthlyData = months.map((m) => {
      const mStart = startOfMonth(m)
      const mEnd = endOfMonth(m)

      const mRevenue = data.revenue
        .filter((r) => {
          if (!r.date) return false
          const d = new Date(r.date.replace(' ', 'T'))
          return d >= mStart && d <= mEnd
        })
        .reduce((sum, r) => sum + r.value, 0)

      const mOpCosts = data.opCosts
        .filter((c) => {
          if (!c.date) return false
          const d = new Date(c.date.replace(' ', 'T'))
          return d >= mStart && d <= mEnd
        })
        .reduce((sum, c) => sum + c.cost_value, 0)

      const mProfCosts = data.costs
        .filter((c) => {
          if (!c.date) return false
          const d = new Date(c.date.replace(' ', 'T'))
          return d >= mStart && d <= mEnd
        })
        .reduce((sum, c) => sum + c.cost_per_month, 0)

      const mTotalCosts = mOpCosts + mProfCosts

      return {
        monthLabel: `${MONTHS[m.getMonth()]}/${m.getFullYear()}`,
        revenue: mRevenue,
        costs: mTotalCosts,
        net: mRevenue - mTotalCosts,
      }
    })

    const monthlyTotals = monthlyData.reduce(
      (acc, curr) => ({
        revenue: acc.revenue + curr.revenue,
        costs: acc.costs + curr.costs,
        net: acc.net + curr.net,
      }),
      { revenue: 0, costs: 0, net: 0 },
    )

    const monthly = {
      details: monthlyData,
      totalRevenue: monthlyTotals.revenue,
      totalCost: monthlyTotals.costs,
      netMargin: monthlyTotals.revenue > 0 ? (monthlyTotals.net / monthlyTotals.revenue) * 100 : 0,
      netProfit: monthlyTotals.net,
    }

    return {
      general,
      monthly,
      startDate: start,
      endDate: end,
    }
  }, [data, period, customStart, customEnd])

  return { computed, loading, error, refetch: fetchData }
}
