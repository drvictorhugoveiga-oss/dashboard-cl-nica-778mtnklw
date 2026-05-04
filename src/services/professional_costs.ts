import pb from '@/lib/pocketbase/client'

export interface ProfessionalCost {
  id: string
  professional_id: string
  plan_id: string
  cost_per_month: number
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

export const createProfessionalCost = (data: any) => {
  return pb.collection('professional_costs').create(data)
}

export const updateProfessionalCost = (id: string, data: any) => {
  return pb.collection('professional_costs').update(id, data)
}
