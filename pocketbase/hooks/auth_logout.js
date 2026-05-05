routerAdd(
  'POST',
  '/backend/v1/auth/logout',
  (e) => {
    const auth = e.auth
    if (!auth) return e.unauthorizedError('Não autorizado')

    const auditCol = $app.findCollectionByNameOrId('audit_log')
    const audit = new Record(auditCol)
    audit.set('user_id', auth.id)
    audit.set('action', 'logout')
    audit.set('resource', 'auth')
    audit.set('status', 'success')
    audit.set('ip_address', e.request.remoteAddr)
    audit.set('user_agent', e.request.header.get('User-Agent') || '')
    $app.saveNoValidate(audit)

    return e.json(200, { mensagem: 'Logout realizado com sucesso' })
  },
  $apis.requireAuth(),
)
