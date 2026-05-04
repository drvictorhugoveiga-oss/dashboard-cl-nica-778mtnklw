import { EmptyState } from '@/components/EmptyState'
import { Card, CardContent } from '@/components/ui/card'

export default function Lembretes() {
  return (
    <div className="space-y-6">
      <Card className="animate-fade-in-up border-border/50">
        <CardContent className="p-0">
          <EmptyState
            title="Tudo limpo por aqui"
            description="Você não possui lembretes ou notificações pendentes no momento."
          />
        </CardContent>
      </Card>
    </div>
  )
}
