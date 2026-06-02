import pb from '@/lib/pocketbase/client'
import { logFrontendAudit } from './audit'

export interface ProfessionalCost {
  id: string
  professional_id: string
  plan_id: string
  cost_per_month: number
  cost_per_session?: number
  expand?: {
    professional_id?: any
    plan_id?: any
  }
}

export const getProfessionalCosts = (professionalId?: string) => {
  const filter = professionalId ? `professional_id = '${professionalId}'` : ''
  return pb.collection('professional_costs').getFullList<ProfessionalCost>({
    filter,
    expand: 'professional_id,plan_id',
  })
}

export const createProfessionalCost = async (data: any) => {
  try {
    const res = await pb.collection('professional_costs').create(data)
    await logFrontendAudit('create', 'professional_costs', res.id, 'success')
    return res
  } catch (e) {
    await logFrontendAudit('create', 'professional_costs', '', 'denied')
    throw e
  }
}

export const updateProfessionalCost = async (id: string, data: any) => {
  try {
    const res = await pb.collection('professional_costs').update(id, data)
    await logFrontendAudit('update', 'professional_costs', id, 'success')
    return res
  } catch (e) {
    await logFrontendAudit('update', 'professional_costs', id, 'denied')
    throw e
  }
}

export const deleteProfessionalCost = async (id: string) => {
  try {
    const res = await pb.collection('professional_costs').delete(id)
    await logFrontendAudit('delete', 'professional_costs', id, 'success')
    return res
  } catch (e) {
    await logFrontendAudit('delete', 'professional_costs', id, 'denied')
    throw e
  }
}
