import pb from '@/lib/pocketbase/client'

export interface OperationalCost {
  id: string
  name: string
  cost_value: number
  date: string
  description?: string
  category?:
    | 'Aluguel'
    | 'Utilidades'
    | 'Materiais'
    | 'Manutenção'
    | 'Pessoal'
    | 'Marketing'
    | 'Outros'
  created: string
  updated: string
}

export const getOperationalCosts = () =>
  pb.collection('operational_costs').getFullList<OperationalCost>({ sort: '-date' })
export const createOperationalCost = (data: Omit<OperationalCost, 'id' | 'created' | 'updated'>) =>
  pb.collection('operational_costs').create<OperationalCost>(data)
export const updateOperationalCost = (id: string, data: Partial<OperationalCost>) =>
  pb.collection('operational_costs').update<OperationalCost>(id, data)
export const deleteOperationalCost = (id: string) => pb.collection('operational_costs').delete(id)
