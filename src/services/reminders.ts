import pb from '@/lib/pocketbase/client'

export interface Reminder {
  id: string
  patient_id: string
  type: 'follow_up' | 'renewal_warning' | 'contract_end' | 'birthday'
  title: string
  description?: string
  scheduled_date: string
  status: 'pending' | 'completed' | 'cancelled'
  created_by: string
  expand?: {
    patient_id?: { name: string }
    created_by?: { name: string }
  }
}

export const getReminders = async (status?: string, type?: string) => {
  const filterParts = []
  if (status && status !== 'all') filterParts.push(`status = '${status}'`)
  if (type && type !== 'all') filterParts.push(`type = '${type}'`)

  return pb.collection('reminders').getFullList<Reminder>({
    sort: 'scheduled_date',
    filter: filterParts.length > 0 ? filterParts.join(' && ') : '',
    expand: 'patient_id,created_by',
  })
}

export const createReminder = async (data: Partial<Reminder>) => {
  return pb.collection('reminders').create(data)
}

export const updateReminder = async (id: string, data: Partial<Reminder>) => {
  return pb.collection('reminders').update(id, data)
}

export const deleteReminder = async (id: string) => {
  return pb.collection('reminders').delete(id)
}
