import pb from '@/lib/pocketbase/client'

export interface SystemConfig {
  id: string
  key: string
  value_number: number
  value_text: string
  created: string
  updated: string
}

export const getSystemConfig = async (key: string) => {
  return pb.collection('system_config').getFirstListItem<SystemConfig>(`key='${key}'`)
}

export const updateSystemConfig = async (id: string, data: Partial<SystemConfig>) => {
  return pb.collection('system_config').update<SystemConfig>(id, data)
}
