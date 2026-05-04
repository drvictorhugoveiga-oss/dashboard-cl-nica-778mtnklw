import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, DollarSign, Percent, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  isLoading: boolean
}

const data = [
  {
    title: 'Receita Bruta Mensal',
    value: 'R$ 179.000,00',
    icon: TrendingUp,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    title: 'Custo Total Profissionais',
    value: 'R$ 0,00',
    icon: DollarSign,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    title: 'Margem Líquida',
    value: '0%',
    icon: Percent,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
  },
  {
    title: 'Lucro Líquido',
    value: 'R$ 0,00',
    icon: BarChart3,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
  },
]

export function FinancialSummary({ isLoading }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((item, i) => (
        <Card
          key={i}
          className="transition-all duration-300 hover:scale-[1.02] hover:shadow-md animate-fade-in-up border-border/50"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
            <div className={cn('flex size-8 items-center justify-center rounded-md', item.bg)}>
              <item.icon className={cn('size-4', item.color)} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[120px] mt-1" />
            ) : (
              <div className="text-2xl font-bold tracking-tight text-foreground">{item.value}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
