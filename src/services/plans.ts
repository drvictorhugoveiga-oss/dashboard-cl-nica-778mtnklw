import pb from '@/lib/pocketbase/client'

export interface Plan {
  id: string
  name: string
  duration_months: number
  price: number
  description?: string
  created: string
  updated: string
}

export type PlanFormData = Omit<Plan, 'id' | 'created' | 'updated'>

export const getPlans = () => {
  return pb.collection('plans').getFullList<Plan>({ sort: 'name' })
}

export const createPlan = (data: PlanFormData) => {
  return pb.collection('plans').create<Plan>(data)
}

export const updatePlan = (id: string, data: Partial<PlanFormData>) => {
  return pb.collection('plans').update<Plan>(id, data)
}

export const deletePlan = (id: string) => {
  return pb.collection('plans').delete(id)
}
