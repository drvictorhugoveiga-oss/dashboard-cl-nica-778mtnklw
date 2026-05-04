migrate(
  (app) => {
    const collection = new Collection({
      name: 'reminders',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'patient_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('patients').id,
          maxSelect: 1,
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['follow_up', 'renewal_warning', 'contract_end', 'birthday'],
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'scheduled_date', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'completed', 'cancelled'],
          maxSelect: 1,
        },
        {
          name: 'created_by',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_reminders_date ON reminders (scheduled_date)',
        'CREATE INDEX idx_reminders_status ON reminders (status)',
        'CREATE INDEX idx_reminders_patient ON reminders (patient_id)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('reminders')
    app.delete(collection)
  },
)
