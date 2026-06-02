routerAdd('POST', '/backend/v1/request-access', (e) => {
  const body = e.requestInfo().body || {}

  if (!body.email || !body.password || !body.name) {
    return e.badRequestError('Name, email and password are required')
  }

  try {
    const users = $app.findCollectionByNameOrId('users')
    const record = new Record(users)
    record.set('name', body.name)
    record.setEmail(body.email)
    record.setPassword(body.password)
    record.set('phone', body.phone || '')
    record.set('status', 'inactive')
    record.set('role', '')
    record.set('role_id', '')

    $app.save(record)

    return e.json(200, { success: true })
  } catch (err) {
    return e.badRequestError(err.message)
  }
})
