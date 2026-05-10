migrate(
  (app) => {
    const patientNotes = app.findCollectionByNameOrId('patient_notes')
    const pnContent = patientNotes.fields.getByName('content')

    if (pnContent) {
      pnContent.max = 0 // 0 means no limit
      app.save(patientNotes)
    }

    const noteTemplates = app.findCollectionByNameOrId('note_templates')
    const ntContent = noteTemplates.fields.getByName('content')

    if (ntContent) {
      ntContent.maxSize = 0 // 0 means no limit
      app.save(noteTemplates)
    }
  },
  (app) => {
    // Revert not applicable
  },
)
