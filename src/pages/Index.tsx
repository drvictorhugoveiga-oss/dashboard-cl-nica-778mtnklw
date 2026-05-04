import { FinancialSummary } from '@/components/dashboard/FinancialSummary'
import { PatientsByPlan } from '@/components/dashboard/PatientsByPlan'
import { UpcomingBirthdays } from '@/components/dashboard/UpcomingBirthdays'
import { ExpiringContracts } from '@/components/dashboard/ExpiringContracts'
import { useDashboardData } from '@/hooks/use-dashboard-data'

export default function Index() {
  const { data, isLoading, handleRenew } = useDashboardData()

  return (
    <div className="flex flex-col gap-6">
      <FinancialSummary isLoading={isLoading} data={data} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <PatientsByPlan
          isLoading={isLoading}
          data={data.patientsByPlan}
          totalCount={data.totalPatients}
          totalRevenue={data.grossRevenue}
        />
        <UpcomingBirthdays isLoading={isLoading} data={data.birthdays} />
        <ExpiringContracts isLoading={isLoading} data={data.expiring} onRenew={handleRenew} />
      </div>
    </div>
  )
}
