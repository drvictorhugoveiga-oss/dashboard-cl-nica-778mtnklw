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
    // Revert is a no-op as we do not know the previous constraint values
  },
)
