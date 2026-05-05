routerAdd('POST', '/backend/v1/audit', (e) => {
  const body = e.requestInfo().body
  if (!body) return e.badRequestError('body required')

  const col = $app.findCollectionByNameOrId('audit_log')
  const log = new Record(col)

  let userId = body.user_id || (e.auth ? e.auth.id : null)

  if (!userId && body.email) {
    try {
      const u = $app.findAuthRecordByEmail('_pb_users_auth_', body.email)
      userId = u.id
    } catch (_) {}
  }

  if (!userId) {
    return e.json(200, { skipped: true, reason: 'no user_id' })
  }

  log.set('user_id', userId)
  log.set('action', body.action || 'unknown')
  log.set('resource', body.resource || 'system')
  if (body.resource_id) log.set('resource_id', String(body.resource_id))
  log.set('status', body.status || 'success')
  log.set('ip_address', e.request.remoteAddr)
  log.set('user_agent', e.request.header.get('User-Agent') || '')

  if (body.details) {
    const sanitizedDetails = { ...body.details }
    delete sanitizedDetails.password
    delete sanitizedDetails.passwordConfirm
    log.set('details', sanitizedDetails)
  }

  $app.save(log)

  return e.json(200, { success: true })
})
