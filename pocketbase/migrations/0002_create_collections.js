migrate(
  (app) => {
    const plans = new Collection({
      name: 'plans',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'duration_months', type: 'number', required: true },
        { name: 'price', type: 'number', required: true },
        { name: 'description', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(plans)

    const professionals = new Collection({
      name: 'professionals',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'specialty',
          type: 'select',
          values: ['nutrição', 'psicologia', 'fisioterapia', 'fonoaudiologia', 'enfermagem'],
          maxSelect: 1,
          required: true,
        },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['active', 'inactive'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(professionals)

    const usersId = '_pb_users_auth_'

    const patients = new Collection({
      name: 'patients',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
        { name: 'birth_date', type: 'date' },
        { name: 'plan_id', type: 'relation', collectionId: plans.id, maxSelect: 1 },
        {
          name: 'status',
          type: 'select',
          values: ['active', 'inactive', 'paused'],
          maxSelect: 1,
          required: true,
        },
        { name: 'contract_start', type: 'date' },
        { name: 'contract_end', type: 'date' },
        { name: 'user_id', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(patients)

    const professional_costs = new Collection({
      name: 'professional_costs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'professional_id',
          type: 'relation',
          collectionId: professionals.id,
          maxSelect: 1,
          required: true,
        },
        { name: 'plan_id', type: 'relation', collectionId: plans.id, maxSelect: 1, required: true },
        { name: 'cost_per_month', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(professional_costs)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('professional_costs'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('patients'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('professionals'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('plans'))
    } catch (_) {}
  },
)
