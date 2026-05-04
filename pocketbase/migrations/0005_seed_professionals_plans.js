migrate(
  (app) => {
    const plansCol = app.findCollectionByNameOrId('plans')
    const plansData = [
      { name: 'VIVA 1', duration_months: 1, price: 100, description: 'Plano básico mensal' },
      {
        name: 'VIVA 2',
        duration_months: 2,
        price: 190,
        description: 'Plano bimestral com desconto',
      },
      { name: 'VIVA 3', duration_months: 3, price: 270, description: 'Plano trimestral' },
      { name: 'VIVA ANUAL', duration_months: 12, price: 1000, description: 'Plano anual completo' },
    ]

    plansData.forEach((p) => {
      try {
        app.findFirstRecordByData('plans', 'name', p.name)
      } catch (_) {
        const record = new Record(plansCol)
        record.set('name', p.name)
        record.set('duration_months', p.duration_months)
        record.set('price', p.price)
        record.set('description', p.description)
        app.save(record)
      }
    })

    const profCol = app.findCollectionByNameOrId('professionals')
    const profsData = [
      {
        name: 'Dra. Ana Silva',
        specialty: 'nutrição',
        email: 'ana@clinicaviva.com',
        phone: '(11) 99999-1234',
        status: 'active',
      },
      {
        name: 'Dr. Carlos Mendes',
        specialty: 'psicologia',
        email: 'carlos@clinicaviva.com',
        phone: '(11) 98888-5678',
        status: 'active',
      },
      {
        name: 'Dra. Juliana Costa',
        specialty: 'fisioterapia',
        email: 'juliana@clinicaviva.com',
        phone: '(11) 97777-9012',
        status: 'active',
      },
    ]

    profsData.forEach((p) => {
      try {
        app.findFirstRecordByData('professionals', 'email', p.email)
      } catch (_) {
        const record = new Record(profCol)
        record.set('name', p.name)
        record.set('specialty', p.specialty)
        record.set('email', p.email)
        record.set('phone', p.phone)
        record.set('status', p.status)
        app.save(record)
      }
    })
  },
  (app) => {},
)
