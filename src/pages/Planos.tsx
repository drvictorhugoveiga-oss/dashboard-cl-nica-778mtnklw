import { EmptyState } from '@/components/EmptyState'
import { Card, CardContent } from '@/components/ui/card'

export default function Planos() {
  return (
    <div className="space-y-6">
      <Card className="animate-fade-in-up border-border/50">
        <CardContent className="p-0">
          <EmptyState
            title="Gestão de Planos Vazia"
            description="Cadastre novos planos para começar a visualizar os dados e gerenciar pacientes."
          />
        </CardContent>
      </Card>
    </div>
  )
}
