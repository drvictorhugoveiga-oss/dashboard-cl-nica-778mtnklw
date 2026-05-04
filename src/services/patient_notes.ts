import pb from '@/lib/pocketbase/client'

export const getPatientNotes = (patientId: string) =>
  pb.collection('patient_notes').getFullList({
    filter: `patient_id = "${patientId}"`,
    sort: '-created',
    expand: 'professional_id,created_by',
  })

export const createPatientNote = (data: any) => pb.collection('patient_notes').create(data)

export const updatePatientNote = (id: string, data: any) =>
  pb.collection('patient_notes').update(id, data)

export const deletePatientNote = (id: string) => pb.collection('patient_notes').delete(id)

export const getPatientsForSelector = () => pb.collection('patients').getFullList({ sort: 'name' })

export const getProfessionalsForSelector = () =>
  pb.collection('professionals').getFullList({ sort: 'name' })
