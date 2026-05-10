onRecordDeleteRequest((e) => {
  if (!e.hasSuperuserAuth() && (!e.auth || e.auth.getString('role') !== 'admin')) {
    throw new ForbiddenError('Apenas administradores podem deletar profissionais.')
  }

  const profId = e.record.id

  let hasNotes = false
  try {
    $app.findFirstRecordByData('patient_notes', 'professional_id', profId)
    hasNotes = true
  } catch (err) {
    // no notes found, safe to proceed
  }

  if (hasNotes) {
    throw new BadRequestError('Falha na exclusão', {
      id: 'Não é possível deletar este profissional pois ele possui notas clínicas vinculadas. Considere alterar o status para Inativo.',
    })
  }

  try {
    // Clean up associated professional costs to prevent foreign key violation
    const costs = $app.findRecordsByFilter(
      'professional_costs',
      `professional_id = '${profId}'`,
      '',
      1000,
      0,
    )
    for (let i = 0; i < costs.length; i++) {
      $app.delete(costs[i])
    }
  } catch (err) {
    // ignore if none found
  }

  e.next()
}, 'professionals')
