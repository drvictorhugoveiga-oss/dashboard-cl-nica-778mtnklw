migrate(
  (app) => {
    const profCosts = app.findCollectionByNameOrId('professional_costs')

    const planIdField = profCosts.fields.getByName('plan_id')
    if (planIdField) {
      profCosts.fields.add(
        new RelationField({
          name: 'plan_id',
          collectionId: app.findCollectionByNameOrId('plans').id,
          cascadeDelete: false,
          maxSelect: 1,
          required: false,
        }),
      )
    }

    profCosts.fields.add(new DateField({ name: 'date', required: false }))
    profCosts.fields.add(new TextField({ name: 'description', required: false }))
    profCosts.fields.add(new BoolField({ name: 'paid_status', required: false }))

    app.save(profCosts)

    const opCosts = app.findCollectionByNameOrId('operational_costs')
    opCosts.fields.add(new BoolField({ name: 'paid_status', required: false }))
    app.save(opCosts)

    app
      .db()
      .newQuery(
        "UPDATE professional_costs SET date = '2026-05-01 12:00:00.000Z' WHERE date = '' OR date IS NULL",
      )
      .execute()
  },
  (app) => {
    const profCosts = app.findCollectionByNameOrId('professional_costs')
    profCosts.fields.removeByName('date')
    profCosts.fields.removeByName('description')
    profCosts.fields.removeByName('paid_status')
    app.save(profCosts)

    const opCosts = app.findCollectionByNameOrId('operational_costs')
    opCosts.fields.removeByName('paid_status')
    app.save(opCosts)
  },
)
