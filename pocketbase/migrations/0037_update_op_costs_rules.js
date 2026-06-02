migrate(
  (app) => {
    const opCosts = app.findCollectionByNameOrId('operational_costs')
    opCosts.listRule = "@request.auth.role = 'admin'"
    opCosts.viewRule = "@request.auth.role = 'admin'"
    app.save(opCosts)

    const rev = app.findCollectionByNameOrId('revenue')
    rev.listRule = "@request.auth.role = 'admin'"
    rev.viewRule = "@request.auth.role = 'admin'"
    app.save(rev)
  },
  (app) => {
    const opCosts = app.findCollectionByNameOrId('operational_costs')
    opCosts.listRule = "@request.auth.id != ''"
    opCosts.viewRule = "@request.auth.id != ''"
    app.save(opCosts)
  },
)
