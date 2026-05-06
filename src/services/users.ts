import pb from '@/lib/pocketbase/client'

export interface User {
  id: string
  name: string
  email: string
  role?: string
}

export const getUsers = () => {
  return pb.collection('users').getFullList<User>({
    sort: 'name',
  })
}
