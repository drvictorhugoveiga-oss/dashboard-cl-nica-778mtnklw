import pb from '@/lib/pocketbase/client'
import { Plan } from './plans'
import { logFrontendAudit } from './audit'

export interface Patient {
  id: string
  name: string
  email?: string
  phone?: string
  birth_date?: string
  plan_id?: string
  status: 'active' | 'inactive' | 'paused'
  contract_start?: string
  contract_end?: string
  gender?: 'male' | 'female' | 'other'
  user_id?: string
  created: string
  updated: string
  expand?: {
    plan_id?: Plan
  }
}

export type PatientFormData = {
  name: string
  email?: string
  phone: string
  birth_date: string
  plan_id: string
  status: 'active' | 'inactive' | 'paused'
  gender?: 'male' | 'female' | 'other'
  contract_start: string
  contract_end?: string
}

export const getPatients = async () => {
  return pb.collection('patients').getFullList<Patient>({
    sort: 'name',
    expand: 'plan_id',
  })
}

export const createPatient = async (data: PatientFormData) => {
  try {
    const res = await pb.collection('patients').create<Patient>(data)
    await logFrontendAudit('create', 'patients', res.id, 'success')
    return res
  } catch (e) {
    await logFrontendAudit('create', 'patients', '', 'denied')
    throw e
  }
}

export const updatePatient = async (id: string, data: Partial<PatientFormData>) => {
  try {
    const res = await pb.collection('patients').update<Patient>(id, data)
    await logFrontendAudit('update', 'patients', id, 'success')
    return res
  } catch (e) {
    await logFrontendAudit('update', 'patients', id, 'denied')
    throw e
  }
}

export const deletePatient = async (id: string) => {
  try {
    const [notes, reminders] = await Promise.all([
      pb.collection('patient_notes').getList(1, 1, { filter: `patient_id = "${id}"` }),
      pb.collection('reminders').getList(1, 1, { filter: `patient_id = "${id}"` }),
    ])

    if (notes.totalItems > 0) {
      throw new Error('Não é possível excluir o paciente pois existem notas clínicas vinculadas.')
    }
    if (reminders.totalItems > 0) {
      throw new Error('Não é possível excluir o paciente pois existem lembretes vinculados.')
    }

    await pb.collection('patients').delete(id)
    await logFrontendAudit('delete', 'patients', id, 'success')
  } catch (e) {
    await logFrontendAudit('delete', 'patients', id, 'denied')
    throw e
  }
}
