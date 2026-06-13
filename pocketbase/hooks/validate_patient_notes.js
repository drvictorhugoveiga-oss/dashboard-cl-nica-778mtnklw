onRecordCreateRequest((e) => {
  const body = e.requestInfo().body
  if (body && body.patient_id) {
    try {
      const patient = $app.findRecordById('patients', body.patient_id)
      if (patient.getString('status') === 'inactive') {
        return e.badRequestError('Não é possível adicionar notas para um paciente inativo.')
      }
    } catch (err) {
      // Ignore if patient doesn't exist, let normal collection validation handle it
    }
  }
  e.next()
}, 'patient_notes')
