import pb from '@/lib/pocketbase/client'

export interface Revenue {
  id: string
  description: string
  value: number
  date: string
  category: 'Consultas' | 'Planos' | 'Particulares' | 'Outros'
  received_status: boolean
  created: string
  updated: string
}

export const getRevenues = async () => {
  return pb.collection('revenue').getFullList<Revenue>({
    sort: '-date',
  })
}

export const createRevenue = async (data: Partial<Revenue>) => {
  return pb.collection('revenue').create<Revenue>(data)
}

export const updateRevenue = async (id: string, data: Partial<Revenue>) => {
  return pb.collection('revenue').update<Revenue>(id, data)
}

export const deleteRevenue = async (id: string) => {
  return pb.collection('revenue').delete(id)
}
