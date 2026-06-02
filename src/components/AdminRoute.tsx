import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { ReactNode } from 'react'

export function AdminRoute({ children }: { children: ReactNode }) {
  const { usuario, loading } = useAuth()

  if (loading) return null

  const isAdmin = usuario?.role === 'admin' || usuario?.role_name === 'admin'

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
