migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('patients')
    if (!col.fields.getByName('death_date')) {
      col.fields.add(new DateField({ name: 'death_date', required: false }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('patients')
    col.fields.removeByName('death_date')
    app.save(col)
  },
)
