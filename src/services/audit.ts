import pb from '@/lib/pocketbase/client'

export const logFrontendAudit = async (
  action: string,
  resource: string,
  resource_id: string,
  status: 'success' | 'denied',
  details: any = {},
) => {
  try {
    const userId = pb.authStore.record?.id
    if (!userId) return

    await pb.collection('audit_log').create({
      user_id: userId,
      action,
      resource,
      resource_id,
      status,
      details,
    })
  } catch (e) {
    console.error('Audit log failed', e)
  }
}
