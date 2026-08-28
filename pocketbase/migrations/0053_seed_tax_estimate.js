migrate(
  (app) => {
    const configCol = app.findCollectionByNameOrId('system_config')
    try {
      app.findFirstRecordByData('system_config', 'key', 'tax_monthly_estimate')
    } catch (_) {
      const record = new Record(configCol)
      record.set('key', 'tax_monthly_estimate')
      record.set('value_number', 5000)
      record.set('value_text', 'Estimativa planejada de impostos mensais')
      app.save(record)
    }
  },
  (app) => {
    try {
      const record = app.findFirstRecordByData('system_config', 'key', 'tax_monthly_estimate')
      app.delete(record)
    } catch (_) {}
  },
)
