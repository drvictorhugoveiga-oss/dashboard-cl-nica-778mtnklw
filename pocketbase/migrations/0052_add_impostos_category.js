migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('operational_costs')
    const field = col.fields.getByName('category')
    if (field) {
      field.options.values = [
        'Aluguel',
        'Utilidades',
        'Materiais',
        'Manutenção',
        'Pessoal',
        'Marketing',
        'Impostos',
        'Outros',
      ]
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('operational_costs')
    const field = col.fields.getByName('category')
    if (field) {
      field.options.values = [
        'Aluguel',
        'Utilidades',
        'Materiais',
        'Manutenção',
        'Pessoal',
        'Marketing',
        'Outros',
      ]
    }
    app.save(col)
  },
)
