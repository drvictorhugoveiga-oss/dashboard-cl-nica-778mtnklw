migrate(
  (app) => {
    const roles = app.findCollectionByNameOrId('roles')
    const permissions = app.findCollectionByNameOrId('permissions')
    const role_permissions = app.findCollectionByNameOrId('role_permissions')

    // Create roles
    const rolesData = [
      { name: 'admin', is_system_role: true },
      { name: 'staff', is_system_role: true },
      { name: 'patient', is_system_role: true },
    ]
    const roleIds = {}
    for (const r of rolesData) {
      try {
        const rec = app.findFirstRecordByData('roles', 'name', r.name)
        roleIds[r.name] = rec.id
      } catch (_) {
        const rec = new Record(roles)
        rec.set('name', r.name)
        rec.set('is_system_role', r.is_system_role)
        app.save(rec)
        roleIds[r.name] = rec.id
      }
    }

    // Create permissions
    const permsData = [
      { name: 'view_dashboard', resource: 'dashboard', action: 'view' },
      { name: 'view_financial_reports', resource: 'financial_reports', action: 'view' },
      { name: 'edit_financial_reports', resource: 'financial_reports', action: 'edit' },
      { name: 'edit_plans', resource: 'plans', action: 'edit' },
      { name: 'edit_professional_costs', resource: 'professional_costs', action: 'edit' },
      { name: 'edit_operational_costs', resource: 'operational_costs', action: 'edit' },
      { name: 'manage_patients', resource: 'patients', action: 'manage' },
      { name: 'manage_professionals', resource: 'professionals', action: 'manage' },
      { name: 'manage_reminders', resource: 'reminders', action: 'manage' },
      { name: 'manage_users', resource: 'users', action: 'manage' },
      { name: 'view_audit_log', resource: 'audit_log', action: 'view' },
      { name: 'access_settings', resource: 'settings', action: 'access' },
      { name: 'view_professionals', resource: 'professionals', action: 'view' },
    ]

    const permIds = {}
    for (const p of permsData) {
      try {
        const rec = app.findFirstRecordByData('permissions', 'name', p.name)
        permIds[p.name] = rec.id
      } catch (_) {
        const rec = new Record(permissions)
        rec.set('name', p.name)
        rec.set('resource', p.resource)
        rec.set('action', p.action)
        rec.set('is_system_permission', true)
        app.save(rec)
        permIds[p.name] = rec.id
      }
    }

    // Assign permissions to roles
    const assign = (roleName, permNames) => {
      const rId = roleIds[roleName]
      for (const pName of permNames) {
        const pId = permIds[pName]
        try {
          app.findFirstRecordByFilter(
            'role_permissions',
            `role_id = '${rId}' && permission_id = '${pId}'`,
          )
        } catch (_) {
          const rp = new Record(role_permissions)
          rp.set('role_id', rId)
          rp.set('permission_id', pId)
          app.save(rp)
        }
      }
    }

    assign(
      'admin',
      permsData.map((p) => p.name),
    )
    assign('staff', ['view_dashboard', 'manage_patients', 'view_professionals', 'manage_reminders'])

    // Update or Create vhvj12@gmail.com
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      const adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'vhvj12@gmail.com')
      adminUser.set('role_id', roleIds['admin'])
      adminUser.set('status', 'active')
      adminUser.setPassword('Skip@Pass')
      app.save(adminUser)
    } catch (_) {
      const rec = new Record(users)
      rec.setEmail('vhvj12@gmail.com')
      rec.setPassword('Skip@Pass')
      rec.setVerified(true)
      rec.set('name', 'Admin')
      rec.set('role_id', roleIds['admin'])
      rec.set('status', 'active')
      rec.set('role', 'admin')
      app.save(rec)
    }
  },
  (app) => {
    // down logic is not strictly needed for seeds
  },
)
