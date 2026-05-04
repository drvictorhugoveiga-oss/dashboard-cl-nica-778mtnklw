migrate(
  (app) => {
    const collection = new Collection({
      name: 'system_config',
      type: 'base',
      listRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      viewRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      createRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        { name: 'key', type: 'text', required: true },
        { name: 'value_number', type: 'number' },
        { name: 'value_text', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_system_config_key ON system_config (key)'],
    })
    app.save(collection)

    const record = new Record(collection)
    record.set('key', 'fixed_operational_cost')
    record.set('value_number', 0)
    record.set('value_text', 'Custos operacionais fixos mensais')
    app.save(record)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('system_config')
    app.delete(collection)
  },
)
