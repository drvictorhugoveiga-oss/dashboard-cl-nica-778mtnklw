routerAdd(
  'GET',
  '/backend/v1/financial-reports',
  (e) => {
    const patients = $app.findRecordsByFilter('patients', '', '', 10000, 0)
    $apis.enrichRecords(e, patients, 'plan_id')
    const profCosts = $app.findRecordsByFilter('professional_costs', '', '', 10000, 0)
    $apis.enrichRecords(e, profCosts, 'professional_id', 'plan_id')
    const opCosts = $app.findRecordsByFilter('operational_costs', '', '', 10000, 0)

    return e.json(200, {
      patients,
      professional_costs: profCosts,
      operational_costs: opCosts,
    })
  },
  $apis.requireAuth(),
)
