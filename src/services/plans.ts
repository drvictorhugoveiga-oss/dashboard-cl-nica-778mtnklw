import pb from '@/lib/pocketbase/client'
import { logFrontendAudit } from './audit'

export interface Plan {
  id: string
  name: string
  duration_months: number
  price: number
  description?: string
  created: string
  updated: string
}

export interface PlanFormData {
  name: string
  duration_months: number
  price: number
  description?: string
}

export const getPlans = () => {
  return pb.collection('plans').getFullList({
    sort: 'price',
  })
}

export const createPlan = async (data: any) => {
  try {
    const res = await pb.collection('plans').create(data)
    await logFrontendAudit('create', 'plans', res.id, 'success')
    return res
  } catch (e) {
    await logFrontendAudit('create', 'plans', '', 'denied')
    throw e
  }
}

export const updatePlan = async (id: string, data: any) => {
  try {
    const res = await pb.collection('plans').update(id, data)
    await logFrontendAudit('update', 'plans', id, 'success')
    return res
  } catch (e) {
    await logFrontendAudit('update', 'plans', id, 'denied')
    throw e
  }
}

export const deletePlan = async (id: string) => {
  try {
    await pb.collection('plans').delete(id)
    await logFrontendAudit('delete', 'plans', id, 'success')
  } catch (e) {
    await logFrontendAudit('delete', 'plans', id, 'denied')
    throw e
  }
}
