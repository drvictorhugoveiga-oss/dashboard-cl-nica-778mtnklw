import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

const routePermissions: Record<string, string> = {
  '/': 'view_dashboard',
  '/pacientes': 'manage_patients',
  '/planos': 'edit_plans',
  '/profissionais': 'view_professionals',
  '/notas-clinicas': 'manage_patients',
  '/lembretes': 'manage_reminders',
  '/relatorios-financeiros': 'view_financial_reports',
  '/configuracoes': 'access_settings',
}

export function ProtectedRoute() {
  const { user, loading, hasPermission } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/20" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const baseRoute = location.pathname === '/' ? '/' : '/' + location.pathname.split('/')[1]
  const requiredPerm = routePermissions[baseRoute]

  if (requiredPerm && !hasPermission(requiredPerm)) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <h2 className="text-2xl font-bold">Acesso Negado</h2>
        <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
      </div>
    )
  }

  return <Outlet />
}
