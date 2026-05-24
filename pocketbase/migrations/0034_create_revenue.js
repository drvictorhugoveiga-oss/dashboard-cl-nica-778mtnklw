migrate(
  (app) => {
    const collection = new Collection({
      name: 'revenue',
      type: 'base',
      listRule: "@request.auth.role = 'admin'",
      viewRule: "@request.auth.role = 'admin'",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'description', type: 'text', required: true },
        { name: 'value', type: 'number', required: true },
        { name: 'date', type: 'date', required: true },
        {
          name: 'category',
          type: 'select',
          values: ['Consultas', 'Planos', 'Particulares', 'Outros'],
          maxSelect: 1,
          required: true,
        },
        { name: 'received_status', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_revenue_date ON revenue (date)'],
    })
    app.save(collection)

    // Seed data
    try {
      const record1 = new Record(collection)
      record1.set('description', 'Consulta particular Maria')
      record1.set('value', 150.0)
      record1.set('date', new Date().toISOString().replace('T', ' '))
      record1.set('category', 'Particulares')
      record1.set('received_status', true)
      app.save(record1)

      const record2 = new Record(collection)
      record2.set('description', 'Repasse Plano Saúde X')
      record2.set('value', 1200.0)
      record2.set('date', new Date().toISOString().replace('T', ' '))
      record2.set('category', 'Planos')
      record2.set('received_status', false)
      app.save(record2)

      const record3 = new Record(collection)
      record3.set('description', 'Sessão de Terapia João')
      record3.set('value', 200.0)
      record3.set('date', new Date().toISOString().replace('T', ' '))
      record3.set('category', 'Consultas')
      record3.set('received_status', true)
      app.save(record3)
    } catch (e) {
      console.log(e)
    }
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('revenue')
      app.delete(collection)
    } catch (e) {}
  },
)
