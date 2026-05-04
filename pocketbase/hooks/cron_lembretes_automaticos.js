// @deps date-fns@4.1.0
cronAdd('enviar-lembretes-automaticos', '0 11 * * *', () => {
  const { format, addDays } = require('date-fns')

  let remindersCreated = 0
  let statusUpdated = 0

  let adminId = ''
  try {
    const admin = $app.findFirstRecordByFilter('users', "role = 'admin'")
    adminId = admin.id
  } catch (_) {
    try {
      const firstUser = $app.findFirstRecordByFilter('users', '')
      adminId = firstUser.id
    } catch (_) {}
  }

  const nowUtc = new Date()
  // America/Sao_Paulo (BRT) is UTC-3
  const nowBrt = new Date(nowUtc.getTime() - 3 * 3600 * 1000)

  const todayStr = format(nowBrt, 'yyyy-MM-dd')
  const in7Days = addDays(nowBrt, 7)
  const in7DaysStr = format(in7Days, 'yyyy-MM-dd')

  let patients
  try {
    patients = $app.findRecordsByFilter('patients', "status != 'inactive'", '', 10000, 0)
  } catch (_) {
    patients = []
  }

  for (const patient of patients) {
    let planName = 'Sem plano'
    try {
      $app.expandRecord(patient, ['plan_id'])
      const plan = patient.expandedOne('plan_id')
      if (plan) {
        planName = plan.getString('name')
      }
    } catch (_) {}

    const patientName = patient.getString('name')
    const patientId = patient.id
    const status = patient.getString('status')

    // 1. Renewal Warning (7 days)
    const contractEndStr = patient.getString('contract_end')
    if (contractEndStr && status === 'active') {
      const contractEndPrefix = contractEndStr.substring(0, 10)
      if (contractEndPrefix === in7DaysStr) {
        const type = 'renewal_warning'
        const title = 'Renovação de contrato em 7 dias'
        const desc = `Paciente ${patientName} tem contrato vencendo em 7 dias. Plano: ${planName}`

        try {
          $app.findFirstRecordByFilter(
            'reminders',
            `patient_id = '${patientId}' && type = '${type}' && scheduled_date >= '${in7DaysStr} 00:00:00.000Z' && scheduled_date <= '${in7DaysStr} 23:59:59.999Z'`,
          )
        } catch (_) {
          try {
            const remindersCol = $app.findCollectionByNameOrId('reminders')
            const r = new Record(remindersCol)
            r.set('patient_id', patientId)
            r.set('type', type)
            r.set('title', title)
            r.set('description', desc)
            r.set('scheduled_date', in7DaysStr + ' 12:00:00.000Z')
            r.set('status', 'pending')
            if (adminId) r.set('created_by', adminId)
            $app.save(r)
            remindersCreated++
          } catch (err) {
            $app.logger().error('Erro ao criar reminder renewal_warning', 'error', err.message)
          }
        }
      }
    }

    // 2. Birthday
    const birthDateStr = patient.getString('birth_date')
    if (birthDateStr) {
      const birthDatePrefix = birthDateStr.substring(5, 10)
      const todayMMDD = todayStr.substring(5, 10)
      if (birthDatePrefix === todayMMDD) {
        const type = 'birthday'
        const title = `Aniversário de ${patientName}`
        const desc = `Paciente ${patientName} faz aniversário hoje. Plano: ${planName}`

        try {
          $app.findFirstRecordByFilter(
            'reminders',
            `patient_id = '${patientId}' && type = '${type}' && scheduled_date >= '${todayStr} 00:00:00.000Z' && scheduled_date <= '${todayStr} 23:59:59.999Z'`,
          )
        } catch (_) {
          try {
            const remindersCol = $app.findCollectionByNameOrId('reminders')
            const r = new Record(remindersCol)
            r.set('patient_id', patientId)
            r.set('type', type)
            r.set('title', title)
            r.set('description', desc)
            r.set('scheduled_date', todayStr + ' 12:00:00.000Z')
            r.set('status', 'pending')
            if (adminId) r.set('created_by', adminId)
            $app.save(r)
            remindersCreated++
          } catch (err) {
            $app.logger().error('Erro ao criar reminder birthday', 'error', err.message)
          }
        }
      }
    }

    // 3. Expired Contract
    if (contractEndStr && status === 'active') {
      const contractEndPrefix = contractEndStr.substring(0, 10)
      if (contractEndPrefix < todayStr) {
        try {
          patient.set('status', 'paused')
          $app.save(patient)
          statusUpdated++
        } catch (err) {
          $app.logger().error('Erro ao atualizar status do paciente', 'error', err.message)
        }

        const type = 'contract_end'
        const title = 'Contrato vencido'
        const parts = contractEndPrefix.split('-')
        const formattedDate =
          parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : contractEndPrefix
        const desc = `Paciente ${patientName} tem contrato vencido desde ${formattedDate}. Plano: ${planName}`

        try {
          $app.findFirstRecordByFilter(
            'reminders',
            `patient_id = '${patientId}' && type = '${type}' && scheduled_date >= '${todayStr} 00:00:00.000Z' && scheduled_date <= '${todayStr} 23:59:59.999Z'`,
          )
        } catch (_) {
          try {
            const remindersCol = $app.findCollectionByNameOrId('reminders')
            const r = new Record(remindersCol)
            r.set('patient_id', patientId)
            r.set('type', type)
            r.set('title', title)
            r.set('description', desc)
            r.set('scheduled_date', todayStr + ' 12:00:00.000Z')
            r.set('status', 'pending')
            if (adminId) r.set('created_by', adminId)
            $app.save(r)
            remindersCreated++
          } catch (err) {
            $app.logger().error('Erro ao criar reminder contract_end', 'error', err.message)
          }
        }
      }
    }
  }

  const result = { remindersCreated, statusUpdated }
  $app.logger().info('Lembretes automáticos processados via cron', 'result', JSON.stringify(result))
  return result
})
