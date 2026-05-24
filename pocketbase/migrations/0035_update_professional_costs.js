migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('professional_costs')
    if (!col.fields.getByName('cost_per_session')) {
      col.fields.add(new NumberField({ name: 'cost_per_session' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('professional_costs')
    if (col.fields.getByName('cost_per_session')) {
      col.fields.removeByName('cost_per_session')
    }
    app.save(col)
  },
)
