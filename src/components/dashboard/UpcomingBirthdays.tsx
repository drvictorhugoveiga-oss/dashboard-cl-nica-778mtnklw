import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Gift } from 'lucide-react'

const data = [
  { name: 'Ana Silva', date: '15/04', plan: 'VIVA 1', initials: 'AS', gender: 'female', seed: 1 },
  {
    name: 'Carlos Oliveira',
    date: '22/04',
    plan: 'VIVA 2',
    initials: 'CO',
    gender: 'male',
    seed: 2,
  },
]

export function UpcomingBirthdays({ isLoading }: { isLoading: boolean }) {
  return (
    <Card
      className="lg:col-span-1 transition-all duration-300 hover:shadow-md animate-fade-in-up border-border/50"
      style={{ animationDelay: '500ms' }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Aniversariantes do Mês</CardTitle>
        <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Gift className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-5 mt-4">
          {isLoading
            ? [1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))
            : data.map((person) => (
                <div key={person.name} className="flex items-center gap-4 group">
                  <Avatar className="size-10 border transition-transform duration-300 group-hover:scale-110">
                    <AvatarImage
                      src={`https://img.usecurling.com/ppl/thumbnail?gender=${person.gender}&seed=${person.seed}`}
                    />
                    <AvatarFallback>{person.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{person.name}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {person.date} •{' '}
                      <span className="font-medium text-foreground">{person.plan}</span>
                    </span>
                  </div>
                </div>
              ))}
          {!isLoading && data.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">
              Nenhum aniversariante este mês.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
