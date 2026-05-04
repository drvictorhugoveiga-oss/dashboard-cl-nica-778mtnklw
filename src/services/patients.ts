import pb from '@/lib/pocketbase/client'

export interface Patient {
  id: string
  name: string
  status: 'active' | 'inactive' | 'paused'
}

export const getPatients = async () => {
  return pb.collection('patients').getFullList<Patient>({
    sort: 'name',
    fields: 'id,name',
  })
}
