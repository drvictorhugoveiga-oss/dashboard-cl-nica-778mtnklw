import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ExpiringContract } from '@/hooks/use-dashboard-data'

interface Props {
  isLoading: boolean
  data?: ExpiringContract[]
  onRenew: (patientId: string, planId: string) => void
}

export function ExpiringContracts({ isLoading, data = [], onRenew }: Props) {
  return (
    <Card
      className="lg:col-span-1 transition-all duration-200 ease-out hover:shadow-subtle animate-fade-in border-border rounded-lg"
      style={{ animationDelay: '400ms' }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 border-b border-border/50">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          Contratos Vencendo
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-20 w-full rounded-lg" />
          ) : (
            data.map((contract) => (
              <div
                key={contract.id}
                className="flex flex-col gap-3 p-4 rounded-lg border border-destructive/20 bg-destructive/5 transition-colors hover:bg-destructive/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                    <AlertCircle className="size-4" />
                    <span>{contract.name}</span>
                  </div>
                  <Badge
                    variant="destructive"
                    className="font-bold shadow-none rounded-md px-2 py-0.5"
                  >
                    {contract.days} dias
                  </Badge>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 text-xs font-bold w-full sm:w-auto transition-colors"
                    onClick={() => onRenew(contract.id, contract.planId)}
                  >
                    Renovar
                  </Button>
                </div>
              </div>
            ))
          )}
          {!isLoading && data.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">
              Nenhum contrato próximo ao vencimento.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
