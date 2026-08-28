import pb from '@/lib/pocketbase/client'

export type OperationalCostCategory =
  | 'Aluguel'
  | 'Utilidades'
  | 'Materiais'
  | 'Manutenção'
  | 'Pessoal'
  | 'Marketing'
  | 'Impostos'
  | 'Outros'

export interface OperationalCost {
  id: string
  name: string
  cost_value: number
  date: string
  category: OperationalCostCategory
  paid_status?: boolean
  description?: string
  created: string
  updated: string
}

export const getOperationalCosts = async () =>
  pb.collection('operational_costs').getFullList<OperationalCost>({ sort: '-date' })

export const createOperationalCost = (data: Partial<OperationalCost>) =>
  pb.collection('operational_costs').create<OperationalCost>(data)

export const updateOperationalCost = (id: string, data: Partial<OperationalCost>) =>
  pb.collection('operational_costs').update<OperationalCost>(id, data)

export const deleteOperationalCost = (id: string) => pb.collection('operational_costs').delete(id)
