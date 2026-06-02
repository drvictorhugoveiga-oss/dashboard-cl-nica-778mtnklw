import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { addDays, isWithinInterval, startOfDay } from 'date-fns'

export interface NotificationItem {
  id: string
  title: string
  description: string
  link: string
  date: Date
  type: 'reminder' | 'birthday' | 'contract'
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const fetchNotifications = useCallback(async () => {
    try {
      const today = startOfDay(new Date())
      const in7Days = addDays(today, 7)
      const in30Days = addDays(today, 30)

      const [reminders, patients] = await Promise.all([
        pb
          .collection('reminders')
          .getFullList({ filter: 'status = "pending"', sort: 'scheduled_date' }),
        pb.collection('patients').getFullList({ filter: 'status = "active"' }),
      ])

      const items: NotificationItem[] = []

      reminders.forEach((r) => {
        items.push({
          id: r.id,
          title: r.title,
          description: r.description || 'Lembrete pendente',
          link: '/lembretes',
          date: new Date(r.scheduled_date),
          type: 'reminder',
        })
      })

      patients.forEach((p) => {
        if (p.birth_date) {
          const bdate = new Date(p.birth_date)
          const currentYearBday = new Date(today.getFullYear(), bdate.getMonth(), bdate.getDate())
          if (currentYearBday < today) {
            currentYearBday.setFullYear(today.getFullYear() + 1)
          }
          if (isWithinInterval(currentYearBday, { start: today, end: in7Days })) {
            items.push({
              id: `bday-${p.id}`,
              title: `Aniversário: ${p.name}`,
              description: `Faz aniversário em ${currentYearBday.toLocaleDateString('pt-BR')}`,
              link: '/pacientes',
              date: currentYearBday,
              type: 'birthday',
            })
          }
        }

        if (p.contract_end) {
          const cdate = new Date(p.contract_end)
          if (isWithinInterval(cdate, { start: today, end: in30Days }) || cdate < today) {
            items.push({
              id: `contract-${p.id}`,
              title: `Contrato: ${p.name}`,
              description:
                cdate < today
                  ? 'Contrato expirado'
                  : `Expira em ${cdate.toLocaleDateString('pt-BR')}`,
              link: '/pacientes',
              date: cdate,
              type: 'contract',
            })
          }
        }
      })

      items.sort((a, b) => a.date.getTime() - b.date.getTime())
      setNotifications(items)
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useRealtime('reminders', fetchNotifications)
  useRealtime('patients', fetchNotifications)

  return {
    notifications,
    unreadCount: notifications.length,
  }
}
