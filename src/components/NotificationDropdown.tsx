import { useState, useEffect } from 'react'
import { Bell, Calendar, User, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { format, isBefore, addDays, subDays, isWithinInterval, parseISO, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function NotificationDropdown() {
  const [alerts, setAlerts] = useState<any[]>([])

  const loadData = async () => {
    try {
      const [reminders, patients, professionals] = await Promise.all([
        pb.collection('reminders').getFullList({ filter: "status = 'pending'" }),
        pb.collection('patients').getFullList({ filter: "status != 'inactive'" }),
        pb.collection('professionals').getFullList({ filter: "status = 'active'" }),
      ])

      const newAlerts = []
      const today = new Date()
      const next7Days = addDays(today, 7)
      const past30 = subDays(today, 30)
      const next30 = addDays(today, 30)

      const isBirthdaySoon = (dateString?: string) => {
        if (!dateString) return false
        const date = parseISO(dateString)
        const thisYearBday = new Date(today.getFullYear(), date.getMonth(), date.getDate())
        if (isBefore(thisYearBday, today) && !isSameDay(thisYearBday, today)) {
          thisYearBday.setFullYear(today.getFullYear() + 1)
        }
        return isWithinInterval(thisYearBday, { start: today, end: next7Days })
      }

      reminders.forEach((r) => {
        newAlerts.push({
          id: `rem-${r.id}`,
          type: 'reminder',
          title: r.title,
          subtitle: format(parseISO(r.scheduled_date), "dd 'de' MMMM", { locale: ptBR }),
          icon: Calendar,
          link: '/lembretes',
        })
      })

      patients.forEach((p) => {
        if (isBirthdaySoon(p.birth_date)) {
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
          isWithinInterval(parseISO(p.contract_end), { start: past30, end: next30 })
        ) {
          newAlerts.push({
            id: `pat-ce-${p.id}`,
            type: 'contract',
            title: `Contrato: ${p.name}`,
            subtitle: `Vence(u) em ${format(parseISO(p.contract_end), 'dd/MM/yyyy')}`,
            icon: FileText,
            link: '/pacientes',
          })
        }
      })

      professionals.forEach((p) => {
        if (isBirthdaySoon(p.birth_date)) {
          newAlerts.push({
            id: `prof-bd-${p.id}`,
            type: 'birthday',
            title: `Aniversário: ${p.name} (Profissional)`,
            subtitle: format(parseISO(p.birth_date), 'dd/MM'),
            icon: User,
            link: '/profissionais',
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
  }, [])

  useRealtime('reminders', loadData)
  useRealtime('patients', loadData)
  useRealtime('professionals', loadData)

  return (
    <Popover>
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
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold">Notificações</h4>
          <Badge variant="secondary">{alerts.length}</Badge>
        </div>
        <ScrollArea className="h-80">
          {alerts.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma notificação no momento.
            </div>
          ) : (
            <div className="flex flex-col">
              {alerts.map((alert) => (
                <Link
                  key={alert.id}
                  to={alert.link}
                  className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors border-b last:border-0"
                >
                  <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
                    <alert.icon className="size-4" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium leading-none">{alert.title}</span>
                    <span className="text-xs text-muted-foreground">{alert.subtitle}</span>
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
