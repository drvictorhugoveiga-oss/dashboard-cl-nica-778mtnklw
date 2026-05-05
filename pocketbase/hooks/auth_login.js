routerAdd('POST', '/backend/v1/auth/login', (e) => {
  const body = e.requestInfo().body || {}
  const { email, password } = body
  if (!email || !password) return e.badRequestError('Email e senha obrigatórios')

  try {
    const record = $app.findAuthRecordByEmail('users', email)
    if (!record.validatePassword(password)) {
      throw new Error('Invalid pass')
    }

    let token = ''
    let returnedRecord = record

    try {
      const authRes = $http.send({
        url: 'http://127.0.0.1:8090/api/collections/users/auth-with-password',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email, password: password }),
      })
      if (authRes.statusCode === 200) {
        token = authRes.json.token
        returnedRecord = authRes.json.record
      } else {
        throw new Error('Loopback failed')
      }
    } catch (loopbackErr) {
      token = $security.createJWT(
        { id: record.id, collectionId: record.collectionId },
        'fallback-secret',
        900,
      )
    }

    record.set('last_login', new Date().toISOString())
    $app.saveNoValidate(record)

    const auditCol = $app.findCollectionByNameOrId('audit_log')
    const audit = new Record(auditCol)
    audit.set('user_id', record.id)
    audit.set('action', 'login')
    audit.set('resource', 'auth')
    audit.set('status', 'success')
    audit.set('ip_address', e.request.remoteAddr)
    audit.set('user_agent', e.request.header.get('User-Agent') || '')
    $app.saveNoValidate(audit)

    const refreshToken = $security.createJWT(
      { user_id: record.id },
      $secrets.get('PB_SUPERUSER_TOKEN') || 'refresh-secret',
      7 * 24 * 60 * 60,
    )

    return e.json(200, {
      token: token,
      refresh_token: refreshToken,
      user_id: record.id,
      role_id: record.getString('role_id'),
      email: record.email,
      record: returnedRecord,
    })
  } catch (err) {
    try {
      if (email) {
        const record = $app.findAuthRecordByEmail('users', email)
        const auditCol = $app.findCollectionByNameOrId('audit_log')
        const audit = new Record(auditCol)
        audit.set('user_id', record.id)
        audit.set('action', 'login')
        audit.set('resource', 'auth')
        audit.set('status', 'denied')
        audit.set('ip_address', e.request.remoteAddr)
        audit.set('user_agent', e.request.header.get('User-Agent') || '')
        $app.saveNoValidate(audit)
      }
    } catch (ignore) {}
    return e.json(401, { erro: 'Email ou senha incorretos' })
  }
})
