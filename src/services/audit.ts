import pb from '@/lib/pocketbase/client'

export const logFrontendAudit = async (
  action: string,
  resource: string,
  resource_id: string,
  status: 'success' | 'denied',
  details: any = {},
) => {
  try {
    await pb.send('/backend/v1/audit', {
      method: 'POST',
      body: JSON.stringify({ action, resource, resource_id, status, details }),
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('Audit log failed', e)
  }
}
