migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('patient_notes')

    col.fields.add(
      new TextField({
        name: 'content',
        required: true,
        max: 0,
      }),
    )

    app.save(col)
  },
  (app) => {},
)
