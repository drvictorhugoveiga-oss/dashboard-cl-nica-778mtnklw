import pb from '@/lib/pocketbase/client'

export const getProfessionalCosts = (professionalId: string) => {
  return pb.collection('professional_costs').getFullList({
    filter: `professional_id = '${professionalId}'`,
  })
}

export const createProfessionalCost = (data: any) => {
  return pb.collection('professional_costs').create(data)
}

export const updateProfessionalCost = (id: string, data: any) => {
  return pb.collection('professional_costs').update(id, data)
}
