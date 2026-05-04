migrate(
  (app) => {
    const collection = new Collection({
      name: 'patient_notes',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (created_by = @request.auth.id || @request.auth.role = 'admin')",
      viewRule:
        "@request.auth.id != '' && (created_by = @request.auth.id || @request.auth.role = 'admin')",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (created_by = @request.auth.id || @request.auth.role = 'admin')",
      deleteRule:
        "@request.auth.id != '' && (created_by = @request.auth.id || @request.auth.role = 'admin')",
      fields: [
        {
          name: 'patient_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('patients').id,
          maxSelect: 1,
        },
        {
          name: 'professional_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('professionals').id,
          maxSelect: 1,
        },
        { name: 'content', type: 'text', required: true },
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
        'CREATE INDEX idx_patient_notes_patient ON patient_notes (patient_id)',
        'CREATE INDEX idx_patient_notes_professional ON patient_notes (professional_id)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('patient_notes')
    app.delete(collection)
  },
)
