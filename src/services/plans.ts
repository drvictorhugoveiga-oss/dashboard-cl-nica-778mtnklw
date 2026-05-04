import pb from '@/lib/pocketbase/client'

export const getPlans = () => {
  return pb.collection('plans').getFullList({
    sort: 'price',
  })
}

export const createPlan = (data: any) => pb.collection('plans').create(data)

export const updatePlan = (id: string, data: any) => pb.collection('plans').update(id, data)

export const deletePlan = (id: string) => pb.collection('plans').delete(id)
