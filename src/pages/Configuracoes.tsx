import { EmptyState } from '@/components/EmptyState'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { Navigate } from 'react-router-dom'

export default function Configuracoes() {
  const { user } = useAuth()

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="space-y-6">
      <Card className="animate-fade-in-up border-border/50">
        <CardContent className="p-0">
          <EmptyState
            title="Configurações Indisponíveis"
            description="As configurações globais do sistema estão em manutenção no momento."
          />
        </CardContent>
      </Card>
    </div>
  )
}
