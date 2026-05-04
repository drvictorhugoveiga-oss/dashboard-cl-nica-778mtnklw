import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Cake } from 'lucide-react'
import { cn } from '@/lib/utils'

const data = [
  { name: 'Ana Silva', date: '15 de abril', plan: 'VIVA 1', isCurrentMonth: true },
  { name: 'Carlos Oliveira', date: '22 de abril', plan: 'VIVA 2', isCurrentMonth: true },
  { name: 'João Santos', date: '05 de maio', plan: 'VIVA 3', isCurrentMonth: false },
]

export function UpcomingBirthdays({ isLoading }: { isLoading: boolean }) {
  return (
    <Card
      className="lg:col-span-1 transition-all duration-200 ease-out hover:shadow-subtle animate-fade-in border-border rounded-lg"
      style={{ animationDelay: '300ms' }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 border-b border-border/50">
        <CardTitle className="text-lg font-bold">Aniversariantes</CardTitle>
        <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Cake className="size-4" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col">
          {isLoading
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border-b border-border/50 last:border-0"
                >
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            : data.map((person, index) => (
                <div key={person.name} className="flex flex-col">
                  <div
                    className={cn(
                      'flex items-center gap-4 p-4 transition-colors duration-200 ease-out',
                      person.isCurrentMonth
                        ? 'bg-primary/5 hover:bg-primary/10'
                        : 'hover:bg-muted/50',
                    )}
                  >
                    <div className="flex flex-col flex-1 gap-1">
                      <span
                        className={cn(
                          'text-sm font-bold',
                          person.isCurrentMonth ? 'text-primary' : 'text-foreground',
                        )}
                      >
                        {person.name}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-2">
                        {person.date}
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="font-regular">{person.plan}</span>
                      </span>
                    </div>
                  </div>
                  {index < data.length - 1 && <Separator />}
                </div>
              ))}
          {!isLoading && data.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-6">
              Nenhum aniversariante.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
