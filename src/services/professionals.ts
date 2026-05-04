import pb from '@/lib/pocketbase/client'

export const getProfessionals = (specialtyFilter?: string) => {
  return pb.collection('professionals').getFullList({
    filter: specialtyFilter ? `specialty = '${specialtyFilter}'` : '',
    sort: '-created',
  })
}

export const createProfessional = (data: any) => pb.collection('professionals').create(data)

export const updateProfessional = (id: string, data: any) =>
  pb.collection('professionals').update(id, data)

export const deleteProfessional = (id: string) => pb.collection('professionals').delete(id)
