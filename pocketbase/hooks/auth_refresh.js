routerAdd('POST', '/backend/v1/auth/refresh-token', (e) => {
  const body = e.requestInfo().body || {}
  const { refresh_token } = body
  if (!refresh_token) return e.badRequestError('Token não fornecido')

  try {
    const payload = $security.parseJWT(
      refresh_token,
      $secrets.get('PB_SUPERUSER_TOKEN') || 'refresh-secret',
    )
    const record = $app.findRecordById('users', payload.user_id)

    return $apis.recordAuthResponse(e, record)
  } catch (err) {
    return e.json(401, { erro: 'Token inválido ou expirado' })
  }
})
