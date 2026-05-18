import pb from '@/lib/pocketbase/client'

const withAuthRefresh = async <T>(request: () => Promise<T>): Promise<T> => {
  try {
    return await request()
  } catch (error: any) {
    if (error?.status === 401 && pb.authStore.isValid) {
      try {
        await pb.collection('users').authRefresh()
        return await request()
      } catch (refreshError) {
        throw error // Throw original error if refresh fails
      }
    }
    throw error
  }
}

export const getAllPatientNotes = () =>
  withAuthRefresh(() =>
    pb.collection('patient_notes').getFullList({
      sort: '-created',
      expand: 'professional_id,created_by,patient_id',
    }),
  )

export const createPatientNote = (data: any) =>
  withAuthRefresh(() => pb.collection('patient_notes').create(data))

export const updatePatientNote = (id: string, data: any) =>
  withAuthRefresh(() => pb.collection('patient_notes').update(id, data))

export const deletePatientNote = (id: string) =>
  withAuthRefresh(() => pb.collection('patient_notes').delete(id))

export const getPatientsForSelector = () =>
  withAuthRefresh(() => pb.collection('patients').getFullList({ sort: 'name' }))

export const getProfessionalsForSelector = () =>
  withAuthRefresh(() => pb.collection('professionals').getFullList({ sort: 'name' }))
