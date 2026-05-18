import PocketBase, { ClientResponseError } from 'pocketbase'

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL)
pb.autoCancellation(false)

const originalSend = pb.send.bind(pb)
pb.send = async (path, options) => {
  try {
    return await originalSend(path, options)
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 401) {
      pb.authStore.clear()
      window.dispatchEvent(new CustomEvent('pb-auth-error'))
    }
    throw error
  }
}

export default pb
