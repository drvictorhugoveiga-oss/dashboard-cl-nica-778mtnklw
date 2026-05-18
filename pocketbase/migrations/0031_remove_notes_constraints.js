migrate(
  (app) => {
    const patientNotes = app.findCollectionByNameOrId('patient_notes')
    if (patientNotes) {
      const contentField = patientNotes.fields.getByName('content')
      if (contentField) {
        contentField.max = 0
        contentField.min = 0
      }
      app.save(patientNotes)
    }

    const noteTemplates = app.findCollectionByNameOrId('note_templates')
    if (noteTemplates) {
      const templateContentField = noteTemplates.fields.getByName('content')
      if (templateContentField) {
        templateContentField.maxSize = 0
      }
      app.save(noteTemplates)
    }
  },
  (app) => {
    // Cannot reliably restore the previous max limits automatically
  },
)
