migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'vhvj12@gmail.com')
      admin.set('role', 'admin')
      app.save(admin)
    } catch (_) {
      admin = new Record(users)
      admin.setEmail('vhvj12@gmail.com')
      admin.setPassword('Skip@Pass')
      admin.setVerified(true)
      admin.set('name', 'Admin')
      admin.set('role', 'admin')
      app.save(admin)
    }

    const plansCol = app.findCollectionByNameOrId('plans')
    const plansData = [
      { name: 'VIVA 1', duration_months: 3, price: 9040 },
      { name: 'VIVA 2', duration_months: 4, price: 15000 },
      { name: 'VIVA 3', duration_months: 6, price: 22400 },
      { name: 'VIVA ANUAL', duration_months: 12, price: 44000 },
    ]

    const createdPlans = {}
    for (const p of plansData) {
      try {
        const rec = app.findFirstRecordByData('plans', 'name', p.name)
        createdPlans[p.name] = rec
      } catch (_) {
        const rec = new Record(plansCol)
        rec.set('name', p.name)
        rec.set('duration_months', p.duration_months)
        rec.set('price', p.price)
        app.save(rec)
        createdPlans[p.name] = rec
      }
    }

    const profsCol = app.findCollectionByNameOrId('professionals')
    let prof
    try {
      prof = app.findFirstRecordByData('professionals', 'email', 'joao@clinicaviva.com')
    } catch (_) {
      prof = new Record(profsCol)
      prof.set('name', 'João Silva')
      prof.set('specialty', 'fisioterapia')
      prof.set('email', 'joao@clinicaviva.com')
      prof.set('phone', '11999999999')
      prof.set('status', 'active')
      app.save(prof)
    }

    const costsCol = app.findCollectionByNameOrId('professional_costs')
    try {
      app.findFirstRecordByData('professional_costs', 'cost_per_month', 1500)
    } catch (_) {
      const cost = new Record(costsCol)
      cost.set('professional_id', prof.id)
      cost.set('plan_id', createdPlans['VIVA 1'].id)
      cost.set('cost_per_month', 1500)
      app.save(cost)
    }

    const patientsCol = app.findCollectionByNameOrId('patients')
    try {
      app.findFirstRecordByData('patients', 'email', 'maria@exemplo.com')
    } catch (_) {
      const pat = new Record(patientsCol)
      pat.set('name', 'Maria Oliveira')
      pat.set('email', 'maria@exemplo.com')
      pat.set('phone', '11988888888')

      const birthDate = new Date()
      birthDate.setHours(12, 0, 0, 0)
      pat.set('birth_date', birthDate.toISOString().replace('T', ' '))

      pat.set('plan_id', createdPlans['VIVA 1'].id)
      pat.set('status', 'active')

      const end = new Date()
      end.setDate(end.getDate() + 3)
      end.setHours(12, 0, 0, 0)
      pat.set('contract_end', end.toISOString().replace('T', ' '))

      app.save(pat)
    }
  },
  (app) => {
    // empty rollback for seed
  },
)
