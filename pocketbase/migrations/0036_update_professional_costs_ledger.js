migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('professional_costs')

    const planIdField = col.fields.getByName('plan_id')
    if (planIdField) {
      planIdField.required = false
    }

    if (!col.fields.getByName('date')) {
      col.fields.add(new DateField({ name: 'date' })) // added as optional first
    }
    if (!col.fields.getByName('description')) {
      col.fields.add(new TextField({ name: 'description' }))
    }
    if (!col.fields.getByName('paid_status')) {
      col.fields.add(new BoolField({ name: 'paid_status' }))
    }
    app.save(col)

    // Populate date for existing records to prevent constraint failures
    const records = app.findRecordsByFilter('professional_costs', '1=1', '', 10000, 0)
    const now = new Date().toISOString().replace('T', ' ')
    for (let record of records) {
      if (!record.get('date')) {
        record.set('date', now)
        app.saveNoValidate(record)
      }
    }

    // Make date required
    const updatedCol = app.findCollectionByNameOrId('professional_costs')
    const dateField = updatedCol.fields.getByName('date')
    if (dateField) {
      dateField.required = true
    }
    app.save(updatedCol)

    // Add paid_status to operational_costs
    const opCol = app.findCollectionByNameOrId('operational_costs')
    if (!opCol.fields.getByName('paid_status')) {
      opCol.fields.add(new BoolField({ name: 'paid_status' }))
      app.save(opCol)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('professional_costs')
    const planIdField = col.fields.getByName('plan_id')
    if (planIdField) planIdField.required = true
    col.fields.removeByName('date')
    col.fields.removeByName('description')
    col.fields.removeByName('paid_status')
    app.save(col)

    const opCol = app.findCollectionByNameOrId('operational_costs')
    opCol.fields.removeByName('paid_status')
    app.save(opCol)
  },
)
