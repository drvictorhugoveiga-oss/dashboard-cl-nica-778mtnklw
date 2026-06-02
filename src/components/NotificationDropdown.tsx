import { useState, useEffect } from 'react'
import { Bell, Calendar, User, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { format, addDays, subDays, isWithinInterval, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuth } from '@/hooks/use-auth'

export function NotificationDropdown() {
  const { usuario, user } = useAuth()
  const currentUser = usuario || user
  const [alerts, setAlerts] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  const loadData = async () => {
    if (!currentUser) return
    try {
      const [reminders, patients] = await Promise.all([
        pb.collection('reminders').getFullList({ filter: "status = 'pending'" }),
        pb.collection('patients').getFullList({ filter: "status != 'inactive'" }),
      ])

      const newAlerts: any[] = []
      const today = new Date()
      const past30 = subDays(today, 30)
      const next30 = addDays(today, 30)

      const isBirthdayLast30Days = (dateString?: string) => {
        if (!dateString) return false
        const date = parseISO(dateString)
        const thisYearBday = new Date(today.getFullYear(), date.getMonth(), date.getDate())
        if (thisYearBday > today) {
          thisYearBday.setFullYear(today.getFullYear() - 1)
        }
        return isWithinInterval(thisYearBday, { start: past30, end: today })
      }

      reminders.forEach((r) => {
        if (r.created_by === currentUser.id || !r.created_by) {
          newAlerts.push({
            id: `rem-${r.id}`,
            type: 'reminder',
            title: r.title,
            subtitle: format(parseISO(r.scheduled_date), "dd 'de' MMMM", { locale: ptBR }),
            icon: Calendar,
            link: '/lembretes',
          })
        }
      })

      patients.forEach((p) => {
        if (isBirthdayLast30Days(p.birth_date)) {
          newAlerts.push({
            id: `pat-bd-${p.id}`,
            type: 'birthday',
            title: `Aniversário: ${p.name}`,
            subtitle: format(parseISO(p.birth_date), 'dd/MM'),
            icon: User,
            link: '/pacientes',
          })
        }
        if (
          p.contract_end &&
          isWithinInterval(parseISO(p.contract_end), { start: today, end: next30 })
        ) {
          newAlerts.push({
            id: `pat-ce-${p.id}`,
            type: 'contract',
            title: `Contrato: ${p.name}`,
            subtitle: `Vence em ${format(parseISO(p.contract_end), 'dd/MM/yyyy')}`,
            icon: FileText,
            link: '/pacientes',
          })
        }
      })

      setAlerts(newAlerts)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentUser])

  useRealtime('reminders', loadData)
  useRealtime('patients', loadData)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bell className="size-5" />
          {alerts.length > 0 && (
            <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 shadow-elevation rounded-[8px]" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <h4 className="font-semibold text-sm">Notificações</h4>
          <Badge variant="secondary" className="rounded-[4px]">
            {alerts.length}
          </Badge>
        </div>
        <ScrollArea className="h-[320px]">
          {alerts.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full text-muted-foreground">
              <Bell className="size-8 opacity-20 mb-2" />
              <p className="text-sm">Nenhuma notificação no momento.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {alerts.map((alert) => (
                <Link
                  key={alert.id}
                  to={alert.link}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors border-b last:border-0"
                >
                  <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary shrink-0">
                    <alert.icon className="size-4" />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-sm font-medium leading-none truncate">{alert.title}</span>
                    <span className="text-xs text-muted-foreground truncate">{alert.subtitle}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
