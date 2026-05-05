migrate(
  (app) => {
    let adminRole
    try {
      adminRole = app.findFirstRecordByData('roles', 'name', 'admin')
    } catch (_) {
      const rolesCol = app.findCollectionByNameOrId('roles')
      adminRole = new Record(rolesCol)
      adminRole.set('name', 'admin')
      adminRole.set('description', 'Administrator')
      adminRole.set('is_system_role', true)
      app.save(adminRole)
    }

    try {
      app.findAuthRecordByEmail('users', 'admin@clinica.com')
    } catch (_) {
      const usersCol = app.findCollectionByNameOrId('users')
      const adminUser = new Record(usersCol)
      adminUser.setEmail('admin@clinica.com')
      adminUser.setPassword('senha123456')
      adminUser.set('name', 'Admin Test')
      adminUser.set('role_id', adminRole.id)
      adminUser.set('role', 'admin')
      adminUser.set('status', 'active')
      adminUser.setVerified(true)
      app.save(adminUser)
    }
  },
  (app) => {
    try {
      const adminUser = app.findAuthRecordByEmail('users', 'admin@clinica.com')
      app.delete(adminUser)
    } catch (_) {}
  },
)
