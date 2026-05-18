migrate(
  (app) => {
    const patientNotes = app.findCollectionByNameOrId('patient_notes')
    patientNotes.fields.add(
      new TextField({
        name: 'content',
        required: true,
        max: 0,
      }),
    )
    app.save(patientNotes)

    const noteTemplates = app.findCollectionByNameOrId('note_templates')
    noteTemplates.fields.add(
      new EditorField({
        name: 'content',
        required: true,
        maxSize: 0,
      }),
    )
    app.save(noteTemplates)
  },
  (app) => {
    const patientNotes = app.findCollectionByNameOrId('patient_notes')
    patientNotes.fields.add(
      new TextField({
        name: 'content',
        required: true,
      }),
    )
    app.save(patientNotes)

    const noteTemplates = app.findCollectionByNameOrId('note_templates')
    noteTemplates.fields.add(
      new EditorField({
        name: 'content',
        required: true,
      }),
    )
    app.save(noteTemplates)
  },
)
