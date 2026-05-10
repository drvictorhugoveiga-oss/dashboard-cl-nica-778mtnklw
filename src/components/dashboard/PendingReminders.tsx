import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell } from 'lucide-react'
import type { Reminder } from '@/hooks/use-dashboard-data'
import { format, parseISO } from 'date-fns'

export function PendingReminders({
  isLoading,
  data = [],
}: {
  isLoading: boolean
  data?: Reminder[]
}) {
  return (
    <Card className="transition-all duration-200 ease-out hover:shadow-subtle border-border rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 border-b border-border/50">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          Lembretes Pendentes
        </CardTitle>
        <div className="flex size-8 items-center justify-center rounded-md bg-orange-500/10 text-orange-500">
          <Bell className="size-4" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col">
          {isLoading
            ? [1, 2].map((i) => (
                <div key={i} className="flex flex-col gap-2 p-4 border-b border-border/50">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            : data.map((rem) => (
                <div
                  key={rem.id}
                  className="flex flex-col gap-1 p-4 border-b border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm">{rem.title}</span>
                    <Badge variant="outline" className="text-[10px] py-0">
                      {format(parseISO(rem.scheduled_date), 'dd/MM/yyyy')}
                    </Badge>
                  </div>
                  {rem.patient_name && (
                    <span className="text-xs text-muted-foreground">
                      Paciente: {rem.patient_name}
                    </span>
                  )}
                </div>
              ))}
          {!isLoading && data.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-6">
              Nenhum lembrete pendente
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
