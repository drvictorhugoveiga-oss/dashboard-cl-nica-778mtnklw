import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, Clock } from 'lucide-react'

const data = [{ name: 'Mariana Santos', date: '30/04', days: 26, status: 'Alerta' }]

export function ExpiringContracts({ isLoading }: { isLoading: boolean }) {
  return (
    <Card
      className="lg:col-span-1 border-destructive/20 shadow-sm transition-all duration-300 hover:shadow-md animate-fade-in-up"
      style={{ animationDelay: '600ms' }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg text-destructive flex items-center gap-2">
          <AlertTriangle className="size-5" />
          Contratos Vencendo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-4">
          {isLoading ? (
            <Skeleton className="h-24 w-full rounded-lg" />
          ) : (
            data.map((contract) => (
              <Alert
                key={contract.name}
                variant="destructive"
                className="bg-destructive/5 transition-all hover:bg-destructive/10 border-destructive/30"
              >
                <Clock className="size-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{contract.name}</span>
                  <Badge variant="destructive" className="ml-2 font-semibold shadow-none">
                    {contract.status}
                  </Badge>
                </AlertTitle>
                <AlertDescription className="mt-3 text-xs flex flex-col gap-1.5 opacity-90">
                  <span className="flex justify-between">
                    Vencimento: <span className="font-medium">{contract.date}</span>
                  </span>
                  <span className="flex justify-between">
                    Restam: <span className="font-bold">{contract.days} dias</span>
                  </span>
                </AlertDescription>
              </Alert>
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
