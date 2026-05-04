migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    try {
      app.findAuthRecordByEmail('users', 'drvictorhugoveiga@gmail.com')
      return // already seeded
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('drvictorhugoveiga@gmail.com')
    record.setPassword('Geriatria@6d')
    record.setVerified(true)
    record.set('role', 'admin')
    record.set('name', 'Victor Hugo Veiga')

    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'drvictorhugoveiga@gmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
