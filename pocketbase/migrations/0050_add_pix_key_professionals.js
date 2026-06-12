migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('professionals')
    if (!col.fields.getByName('pix_key')) {
      col.fields.add(new TextField({ name: 'pix_key' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('professionals')
    col.fields.removeByName('pix_key')
    app.save(col)
  },
)
