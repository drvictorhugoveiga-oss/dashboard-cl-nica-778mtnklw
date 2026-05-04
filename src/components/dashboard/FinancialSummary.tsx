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
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
  {
    title: 'Margem Líquida',
    value: '0%',
    icon: Percent,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    title: 'Lucro Líquido',
    value: 'R$ 0,00',
    icon: BarChart3,
    color: 'text-success',
    bg: 'bg-success/10',
  },
]

export function FinancialSummary({ isLoading }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {data.map((item, i) => (
        <Card
          key={i}
          className="cursor-pointer bg-card transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-subtle animate-fade-in border-border rounded-lg"
          style={{ animationDelay: `${i * 75}ms` }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-regular text-muted-foreground uppercase tracking-wider">
              {item.title}
            </CardTitle>
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', item.bg)}>
              <item.icon className={cn('size-5', item.color)} />
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4">
            {isLoading ? (
              <Skeleton className="h-8 w-[120px] mt-1" />
            ) : (
              <div className="text-3xl font-bold tracking-tight text-foreground">{item.value}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
