migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('professionals')
    col.fields.add(
      new SelectField({
        name: 'specialty',
        required: true,
        maxSelect: 1,
        values: [
          'nutrição',
          'psicologia',
          'fisioterapia',
          'fonoaudiologia',
          'enfermagem',
          'médico',
        ],
      }),
    )
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('professionals')
    col.fields.add(
      new SelectField({
        name: 'specialty',
        required: true,
        maxSelect: 1,
        values: ['nutrição', 'psicologia', 'fisioterapia', 'fonoaudiologia', 'enfermagem'],
      }),
    )
    app.save(col)
  },
)
