import { useState, useEffect } from 'react'
import { FinancialSummary } from '@/components/dashboard/FinancialSummary'
import { PatientsByPlan } from '@/components/dashboard/PatientsByPlan'
import { UpcomingBirthdays } from '@/components/dashboard/UpcomingBirthdays'
import { ExpiringContracts } from '@/components/dashboard/ExpiringContracts'

export default function Index() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <FinancialSummary isLoading={isLoading} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <PatientsByPlan isLoading={isLoading} />
        <UpcomingBirthdays isLoading={isLoading} />
        <ExpiringContracts isLoading={isLoading} />
      </div>
    </div>
  )
}
