onRecordCreate((e) => {
  if (e.record.getString('death_date')) {
    e.record.set('status', 'inactive')
  }
  e.next()
}, 'patients')
