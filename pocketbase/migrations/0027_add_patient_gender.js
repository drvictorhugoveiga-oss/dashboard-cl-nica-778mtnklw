migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('patients')
    if (!col.fields.getByName('gender')) {
      col.fields.add(
        new SelectField({
          name: 'gender',
          values: ['male', 'female', 'other'],
          required: false,
        }),
      )
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('patients')
    if (col.fields.getByName('gender')) {
      col.fields.removeByName('gender')
      app.save(col)
    }
  },
)
