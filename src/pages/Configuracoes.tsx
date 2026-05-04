import { EmptyState } from '@/components/EmptyState'
import { Card, CardContent } from '@/components/ui/card'

export default function Configuracoes() {
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
