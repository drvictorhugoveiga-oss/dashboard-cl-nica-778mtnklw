migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('patient_notes')
    if (col) {
      let field = col.fields.getByName('content')
      if (!field) {
        col.fields.add(
          new EditorField({
            name: 'content',
            required: true,
            maxSize: 0,
          }),
        )
      } else {
        if (field.type === 'editor') {
          field.maxSize = 0
        } else if (field.type === 'text') {
          field.max = null
        }
      }
      app.save(col)
    }
  },
  (app) => {
    // Downgrade not strictly necessary for this context as removal is permanent requirement
  },
)
