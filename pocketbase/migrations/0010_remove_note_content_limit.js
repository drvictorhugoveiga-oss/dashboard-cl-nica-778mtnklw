migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('patient_notes')
    const field = col.fields.getByName('content')
    if (field) {
      field.max = 0
      app.save(col)
    }
  },
  (app) => {
    // Revert is not practical as we don't know the exact prior limit here, leaving empty.
  },
)
