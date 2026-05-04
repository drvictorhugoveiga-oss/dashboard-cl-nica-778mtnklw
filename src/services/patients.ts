import pb from '@/lib/pocketbase/client'
import { Plan } from './plans'

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
  contract_start: string
  contract_end?: string
}

export const getPatients = async () => {
  return pb.collection('patients').getFullList<Patient>({
    sort: 'name',
    expand: 'plan_id',
  })
}

export const createPatient = (data: PatientFormData) =>
  pb.collection('patients').create<Patient>(data)

export const updatePatient = (id: string, data: Partial<PatientFormData>) =>
  pb.collection('patients').update<Patient>(id, data)

export const deletePatient = (id: string) => pb.collection('patients').delete(id)
