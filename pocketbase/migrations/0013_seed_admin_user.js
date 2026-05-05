migrate(
  (app) => {
    // 1. Find or create admin role
    let roleId = ''
    try {
      const role = app.findFirstRecordByData('roles', 'name', 'admin')
      roleId = role.id
    } catch (_) {
      const rolesCol = app.findCollectionByNameOrId('roles')
      const newRole = new Record(rolesCol)
      newRole.set('name', 'admin')
      newRole.set('description', 'Administrador do Sistema')
      newRole.set('is_system_role', true)
      app.save(newRole)
      roleId = newRole.id
    }

    // 2. Find or create admin user
    try {
      app.findAuthRecordByEmail('users', 'admin@clinica.com')
    } catch (_) {
      const usersCol = app.findCollectionByNameOrId('users')
      const adminUser = new Record(usersCol)
      adminUser.setEmail('admin@clinica.com')
      adminUser.setPassword('senha123456')
      adminUser.setVerified(true)
      adminUser.set('name', 'Administrador')
      adminUser.set('role', 'admin')
      adminUser.set('role_id', roleId)
      adminUser.set('status', 'active')
      app.save(adminUser)
    }
  },
  (app) => {
    try {
      const admin = app.findAuthRecordByEmail('users', 'admin@clinica.com')
      app.delete(admin)
    } catch (_) {}
  },
)
