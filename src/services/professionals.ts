import pb from '@/lib/pocketbase/client'

export interface Professional {
  id: string
  name: string
  specialty: string
  email?: string
  phone?: string
  status: 'active' | 'inactive'
  user_id?: string
  created: string
  updated: string
}

export const getProfessionals = () => {
  return pb.collection('professionals').getFullList<Professional>({
    sort: 'name',
  })
}

export const createProfessional = (data: Partial<Professional>) => {
  return pb.collection('professionals').create<Professional>(data)
}

export const updateProfessional = (id: string, data: Partial<Professional>) => {
  return pb.collection('professionals').update<Professional>(id, data)
}

export const deleteProfessional = (id: string) => {
  return pb.collection('professionals').delete(id)
}
