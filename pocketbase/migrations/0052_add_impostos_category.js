migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('operational_costs')
    col.fields.add(
      new SelectField({
        name: 'category',
        required: false,
        maxSelect: 1,
        values: [
          'Aluguel',
          'Utilidades',
          'Materiais',
          'Manutenção',
          'Pessoal',
          'Marketing',
          'Impostos',
          'Outros',
        ],
      }),
    )
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('operational_costs')
    col.fields.add(
      new SelectField({
        name: 'category',
        required: false,
        maxSelect: 1,
        values: [
          'Aluguel',
          'Utilidades',
          'Materiais',
          'Manutenção',
          'Pessoal',
          'Marketing',
          'Outros',
        ],
      }),
    )
    app.save(col)
  },
)
