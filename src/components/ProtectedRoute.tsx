import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

const routePermissions: Record<string, { resource: string; action: string }> = {
  '/': { resource: 'dashboard', action: 'view' },
  '/dashboard': { resource: 'dashboard', action: 'view' },
  '/pacientes': { resource: 'patients', action: 'manage' },
  '/planos': { resource: 'plans', action: 'edit' },
  '/profissionais': { resource: 'professionals', action: 'view' },
  '/notas-clinicas': { resource: 'patients', action: 'manage' },
  '/lembretes': { resource: 'reminders', action: 'manage' },
  '/relatorios-financeiros': { resource: 'financial_reports', action: 'view' },
  '/configuracoes': { resource: 'settings', action: 'access' },
}

export function ProtectedRoute() {
  const { usuario, carregando, temPermissao } = useAuth()
  const location = useLocation()

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/20" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const baseRoute = location.pathname === '/' ? '/' : '/' + location.pathname.split('/')[1]
  const requiredPerm = routePermissions[baseRoute]

  if (requiredPerm && !temPermissao(requiredPerm.resource, requiredPerm.action)) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <h2 className="text-2xl font-bold">Acesso Negado</h2>
        <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
      </div>
    )
  }

  return <Outlet />
}
