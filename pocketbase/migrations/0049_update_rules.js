migrate(
  (app) => {
    const revenue = app.findCollectionByNameOrId('revenue')
    revenue.updateRule = "@request.auth.id != ''"
    revenue.deleteRule = "@request.auth.id != ''"
    app.save(revenue)

    const opCosts = app.findCollectionByNameOrId('operational_costs')
    opCosts.updateRule = "@request.auth.id != ''"
    opCosts.deleteRule = "@request.auth.id != ''"
    app.save(opCosts)

    const sysConfig = app.findCollectionByNameOrId('system_config')
    sysConfig.listRule = "@request.auth.id != ''"
    sysConfig.viewRule = "@request.auth.id != ''"
    app.save(sysConfig)

    const roles = app.findCollectionByNameOrId('roles')
    roles.listRule = "@request.auth.id != ''"
    roles.viewRule = "@request.auth.id != ''"
    app.save(roles)
  },
  (app) => {
    const revenue = app.findCollectionByNameOrId('revenue')
    revenue.updateRule = "@request.auth.role = 'admin'"
    revenue.deleteRule = "@request.auth.role = 'admin'"
    app.save(revenue)

    const opCosts = app.findCollectionByNameOrId('operational_costs')
    opCosts.updateRule = "@request.auth.role = 'admin'"
    opCosts.deleteRule = "@request.auth.role = 'admin'"
    app.save(opCosts)

    const sysConfig = app.findCollectionByNameOrId('system_config')
    sysConfig.listRule = "@request.auth.id != '' && @request.auth.role = 'admin'"
    sysConfig.viewRule = "@request.auth.id != '' && @request.auth.role = 'admin'"
    app.save(sysConfig)

    const roles = app.findCollectionByNameOrId('roles')
    roles.listRule = "@request.auth.id != ''"
    roles.viewRule = "@request.auth.id != ''"
    app.save(roles)
  },
)
