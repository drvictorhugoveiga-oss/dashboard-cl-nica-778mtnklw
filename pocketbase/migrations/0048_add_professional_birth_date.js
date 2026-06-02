migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('professionals')
    col.fields.add(new DateField({ name: 'birth_date' }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('professionals')
    col.fields.removeByName('birth_date')
    app.save(col)
  },
)
