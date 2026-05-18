import { FinancialSummary } from '@/components/dashboard/FinancialSummary'
import { PatientsByPlan } from '@/components/dashboard/PatientsByPlan'
import { UpcomingBirthdays } from '@/components/dashboard/UpcomingBirthdays'
import { ExpiringContracts } from '@/components/dashboard/ExpiringContracts'
import { PendingReminders } from '@/components/dashboard/PendingReminders'
import { DashboardDemographics } from '@/components/dashboard/DashboardDemographics'
import { DashboardFinancial } from '@/components/dashboard/DashboardFinancial'
import { DashboardConsultations } from '@/components/dashboard/DashboardConsultations'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { useAuth } from '@/hooks/use-auth'

export default function Index() {
  const { data, isLoading, handleRenew } = useDashboardData()
  const { usuario } = useAuth()
  const isAdmin = usuario?.role === 'admin' || usuario?.role_name === 'admin'

  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UpcomingBirthdays isLoading={isLoading} data={data.birthdays} />
          <PendingReminders isLoading={isLoading} data={data.pendingReminders} />
          <ExpiringContracts isLoading={isLoading} data={data.expiring} onRenew={handleRenew} />
        </div>
        <div className="space-y-6">
          <DashboardDemographics isLoading={isLoading} data={data} />
          <DashboardConsultations isLoading={isLoading} data={data} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <FinancialSummary isLoading={isLoading} data={data} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DashboardFinancial isLoading={isLoading} data={data} />
          <DashboardDemographics isLoading={isLoading} data={data} />
          <PatientsByPlan
            isLoading={isLoading}
            data={data.patientsByPlan}
            totalCount={data.totalPatients}
            totalRevenue={data.grossRevenue}
          />
        </div>

        <div className="space-y-6">
          <UpcomingBirthdays isLoading={isLoading} data={data.birthdays} />
          <PendingReminders isLoading={isLoading} data={data.pendingReminders} />
          <ExpiringContracts isLoading={isLoading} data={data.expiring} onRenew={handleRenew} />
        </div>
      </div>
    </div>
  )
}
