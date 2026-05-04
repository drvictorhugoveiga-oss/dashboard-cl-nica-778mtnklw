import pb from '@/lib/pocketbase/client'

export const getPlans = () => {
  return pb.collection('plans').getFullList({
    sort: 'price',
  })
}
