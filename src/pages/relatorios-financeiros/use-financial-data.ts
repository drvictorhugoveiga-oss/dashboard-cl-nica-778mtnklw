import { useState, useEffect, useMemo, useCallback } from 'react'
import { startOfMonth, endOfMonth, subMonths, eachMonthOfInterval } from 'date-fns'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'

export type ViewType = 'general' | 'monthly'

export const MONTHS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

export function useFinancialData(month: number, year: number) {
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

    const start = startOfMonth(new Date(year, month))
    const end = endOfMonth(new Date(year, month))

    const chartStart = startOfMonth(subMonths(new Date(year, month), 5))
    const months = eachMonthOfInterval({ start: chartStart, end })

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
      return d >= start && d <= end && r.received_status === true
    })

    // General View Logic
    const patientDetails = data.patients
      .map((p) => {
        const plan = p.expand?.plan_id
        const pStart = p.contract_start ? new Date(p.contract_start.replace(' ', 'T')) : null

        let isNewContractInPeriod = false
        if (pStart && pStart >= start && pStart <= end) {
          isNewContractInPeriod = true
        }

        const gain = isNewContractInPeriod ? plan?.price || 0 : 0
        const loss = filteredProfCosts
          .filter((c) => c.plan_id === plan?.id)
          .reduce((sum, c) => sum + (c.cost_per_month || c.cost_per_session || 0), 0)

        // Count as active if they have contract starting or ending in period, or overlapping
        const pEnd = p.contract_end ? new Date(p.contract_end.replace(' ', 'T')) : null
        const isActiveInPeriod =
          p.status !== 'inactive' && (!pStart || pStart <= end) && (!pEnd || pEnd >= start)
        const activeMonths = isActiveInPeriod ? 1 : 0

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

    const revenueByCategoryMap = new Map<string, number>()
    filteredRevenue.forEach((r) => {
      const cat = r.category || 'Outros'
      revenueByCategoryMap.set(cat, (revenueByCategoryMap.get(cat) || 0) + r.value)
    })

    const colors = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#eab308']
    const profitPerPlan = Array.from(revenueByCategoryMap.entries()).map(([name, value], i) => ({
      name,
      value: Math.max(0, value),
      fill: colors[i % colors.length],
    }))

    const totalGains = filteredRevenue.reduce((sum, r) => sum + r.value, 0)
    const totalProfLosses = filteredProfCosts.reduce(
      (sum, c) => sum + (c.cost_per_month || c.cost_per_session || 0),
      0,
    )
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
          return d >= mStart && d <= mEnd && r.received_status === true
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
        .reduce((sum, c) => sum + (c.cost_per_month || c.cost_per_session || 0), 0)

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
  }, [data, month, year])

  return { computed, loading, error, refetch: fetchData }
}
