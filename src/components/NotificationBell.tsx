import { useState, useEffect, useMemo } from 'react'
import { Bell, Clock, FileText, Gift, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import { format, parseISO, addDays, startOfDay, isBefore, isAfter, setYear } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function NotificationBell() {
  const [reminders, setReminders] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  const loadData = async () => {
    try {
      const [rem, pat, prof] = await Promise.all([
        pb
          .collection('reminders')
          .getFullList({ filter: "status = 'pending'", expand: 'patient_id' }),
        pb.collection('patients').getFullList({ filter: "status = 'active' || status = 'paused'" }),
        pb.collection('professionals').getFullList({ filter: "status = 'active'" }),
      ])
      setReminders(rem)
      setPatients(pat)
      setProfessionals(prof)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('reminders', loadData)
  useRealtime('patients', loadData)
  useRealtime('professionals', loadData)

  const today = startOfDay(new Date())

  const birthdays = useMemo(() => {
    const next7Days = addDays(today, 7)
    const checkBirthday = (person: any, type: string) => {
      if (!person.birth_date) return null
      let bDate = parseISO(person.birth_date.split('T')[0])
      bDate = setYear(bDate, today.getFullYear())
      if (isBefore(bDate, today)) {
        bDate = setYear(bDate, today.getFullYear() + 1)
      }
      if (!isBefore(bDate, today) && !isAfter(bDate, next7Days)) {
        return { ...person, _type: type, _bDate: bDate }
      }
      return null
    }

    const patB = patients.map((p) => checkBirthday(p, 'Paciente')).filter(Boolean)
    const profB = professionals.map((p) => checkBirthday(p, 'Profissional')).filter(Boolean)

    return [...patB, ...profB].sort((a, b) => a._bDate.getTime() - b._bDate.getTime())
  }, [patients, professionals, today])

  const contracts = useMemo(() => {
    const next30Days = addDays(today, 30)
    return patients
      .filter((p) => {
        if (!p.contract_end) return false
        const cDate = parseISO(p.contract_end.split('T')[0])
        return !isBefore(cDate, today) && !isAfter(cDate, next30Days)
      })
      .sort((a, b) => parseISO(a.contract_end).getTime() - parseISO(b.contract_end).getTime())
  }, [patients, today])

  const totalNotifications = reminders.length + birthdays.length + contracts.length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="size-5" />
          {totalNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-destructive"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Tabs defaultValue="reminders" className="w-full">
          <div className="border-b px-4 py-3 flex items-center justify-between bg-muted/30">
            <h4 className="font-semibold">Notificações</h4>
            <Badge variant="secondary">{totalNotifications}</Badge>
          </div>
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="reminders"
              className="relative rounded-none border-b-2 border-transparent px-3 pb-3 pt-3 font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs"
            >
              Lembretes {reminders.length > 0 && `(${reminders.length})`}
            </TabsTrigger>
            <TabsTrigger
              value="birthdays"
              className="relative rounded-none border-b-2 border-transparent px-3 pb-3 pt-3 font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs"
            >
              Aniversários {birthdays.length > 0 && `(${birthdays.length})`}
            </TabsTrigger>
            <TabsTrigger
              value="contracts"
              className="relative rounded-none border-b-2 border-transparent px-3 pb-3 pt-3 font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs"
            >
              Contratos {contracts.length > 0 && `(${contracts.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reminders" className="m-0 max-h-[300px] overflow-y-auto">
            {reminders.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhum lembrete pendente.
              </div>
            ) : (
              <div className="flex flex-col">
                {reminders.map((r) => (
                  <Link
                    key={r.id}
                    to="/lembretes"
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 border-b p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">
                      <Clock className="size-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium leading-none">{r.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {r.expand?.patient_id?.name || 'Geral'}
                      </span>
                      <span className="text-xs text-primary/80 mt-1">
                        {format(parseISO(r.scheduled_date), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="birthdays" className="m-0 max-h-[300px] overflow-y-auto">
            {birthdays.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhum aniversário nos próximos 7 dias.
              </div>
            ) : (
              <div className="flex flex-col">
                {birthdays.map((b) => (
                  <Link
                    key={b.id}
                    to={b._type === 'Paciente' ? '/pacientes' : '/profissionais'}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 border-b p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="mt-0.5 rounded-full bg-pink-500/10 p-1.5 text-pink-600">
                      <Gift className="size-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium leading-none">{b.name}</span>
                      <span className="text-xs text-muted-foreground">{b._type}</span>
                      <span className="text-xs font-semibold text-pink-600/80 mt-1">
                        {format(b._bDate, "dd 'de' MMMM", { locale: ptBR })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="contracts" className="m-0 max-h-[300px] overflow-y-auto">
            {contracts.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhum contrato vencendo em breve.
              </div>
            ) : (
              <div className="flex flex-col">
                {contracts.map((c) => (
                  <Link
                    key={c.id}
                    to="/pacientes"
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 border-b p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="mt-0.5 rounded-full bg-orange-500/10 p-1.5 text-orange-600">
                      <FileText className="size-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium leading-none">{c.name}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        Vencimento: {format(parseISO(c.contract_end), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
