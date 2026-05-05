migrate(
  (app) => {
    const roles = new Collection({
      name: 'roles',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'is_system_role', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_roles_name ON roles (name)'],
    })
    app.save(roles)

    const permissions = new Collection({
      name: 'permissions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'resource', type: 'text' },
        { name: 'action', type: 'text' },
        { name: 'is_system_permission', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_perms_name ON permissions (name)'],
    })
    app.save(permissions)

    const role_permissions = new Collection({
      name: 'role_permissions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        {
          name: 'role_id',
          type: 'relation',
          required: true,
          collectionId: roles.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'permission_id',
          type: 'relation',
          required: true,
          collectionId: permissions.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_role_perms ON role_permissions (role_id, permission_id)'],
    })
    app.save(role_permissions)

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.add(
      new RelationField({
        name: 'role_id',
        collectionId: roles.id,
        cascadeDelete: true,
        maxSelect: 1,
      }),
    )
    users.fields.add(
      new SelectField({
        name: 'status',
        values: ['active', 'inactive', 'suspended'],
        maxSelect: 1,
      }),
    )
    users.fields.add(new DateField({ name: 'last_login' }))
    users.fields.add(
      new RelationField({ name: 'created_by', collectionId: '_pb_users_auth_', maxSelect: 1 }),
    )
    users.listRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    users.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    users.createRule = "@request.auth.role = 'admin'"
    users.updateRule = "@request.auth.role = 'admin'"
    users.deleteRule = "@request.auth.role = 'admin'"
    app.save(users)

    const audit_log = new Collection({
      name: 'audit_log',
      type: 'base',
      listRule: "@request.auth.role = 'admin'",
      viewRule: "@request.auth.role = 'admin'",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'action', type: 'text' },
        { name: 'resource', type: 'text' },
        { name: 'resource_id', type: 'text' },
        { name: 'status', type: 'select', values: ['success', 'denied'], maxSelect: 1 },
        { name: 'ip_address', type: 'text' },
        { name: 'user_agent', type: 'text' },
        { name: 'details', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(audit_log)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.removeByName('role_id')
    users.fields.removeByName('status')
    users.fields.removeByName('last_login')
    users.fields.removeByName('created_by')
    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.createRule = ''
    users.updateRule = 'id = @request.auth.id'
    users.deleteRule = 'id = @request.auth.id'
    app.save(users)

    const role_permissions = app.findCollectionByNameOrId('role_permissions')
    app.delete(role_permissions)
    const permissions = app.findCollectionByNameOrId('permissions')
    app.delete(permissions)
    const roles = app.findCollectionByNameOrId('roles')
    app.delete(roles)
    const audit_log = app.findCollectionByNameOrId('audit_log')
    app.delete(audit_log)
  },
)
