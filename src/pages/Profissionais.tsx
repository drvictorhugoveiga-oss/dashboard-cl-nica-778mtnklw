import { EmptyState } from '@/components/EmptyState'
import { Card, CardContent } from '@/components/ui/card'

export default function Profissionais() {
  return (
    <div className="space-y-6">
      <Card className="animate-fade-in-up border-border/50">
        <CardContent className="p-0">
          <EmptyState
            title="Nenhum Profissional Encontrado"
            description="Adicione profissionais clínicos à sua equipe para gerenciar repasses e atendimentos."
          />
        </CardContent>
      </Card>
    </div>
  )
}
