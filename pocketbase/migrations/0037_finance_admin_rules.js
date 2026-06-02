migrate(
  (app) => {
    const opCol = app.findCollectionByNameOrId('operational_costs')
    opCol.listRule = "@request.auth.role = 'admin'"
    opCol.viewRule = "@request.auth.role = 'admin'"
    app.save(opCol)

    const profCol = app.findCollectionByNameOrId('professional_costs')
    profCol.listRule = "@request.auth.role = 'admin'"
    profCol.viewRule = "@request.auth.role = 'admin'"
    profCol.createRule = "@request.auth.role = 'admin'"
    profCol.updateRule = "@request.auth.role = 'admin'"
    profCol.deleteRule = "@request.auth.role = 'admin'"
    app.save(profCol)
  },
  (app) => {
    const opCol = app.findCollectionByNameOrId('operational_costs')
    opCol.listRule = "@request.auth.id != ''"
    opCol.viewRule = "@request.auth.id != ''"
    app.save(opCol)

    const profCol = app.findCollectionByNameOrId('professional_costs')
    profCol.listRule = "@request.auth.id != ''"
    profCol.viewRule = "@request.auth.id != ''"
    profCol.createRule = "@request.auth.id != ''"
    profCol.updateRule = "@request.auth.id != ''"
    profCol.deleteRule = "@request.auth.id != ''"
    app.save(profCol)
  },
)
