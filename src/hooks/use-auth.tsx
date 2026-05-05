import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

interface AuthContextType {
  user: any
  permissions: string[]
  hasPermission: (perm: string) => boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(pb.authStore.record)
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const loadPermissions = async (roleId: string) => {
    try {
      const perms = await pb.collection('role_permissions').getFullList({
        filter: `role_id = '${roleId}'`,
        expand: 'permission_id',
      })
      setPermissions(perms.map((p) => p.expand?.permission_id?.name).filter(Boolean))
    } catch (e) {
      console.error('Failed to load permissions', e)
      setPermissions([])
    }
  }

  useEffect(() => {
    const init = async () => {
      if (pb.authStore.record?.role_id) {
        await loadPermissions(pb.authStore.record.role_id)
      }
      setLoading(false)
    }
    init()

    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(record)
      if (record?.role_id) {
        loadPermissions(record.role_id)
      } else {
        setPermissions([])
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const hasPermission = (perm: string) => {
    return permissions.includes(perm)
  }

  const logAudit = async (action: string, status: string, email?: string) => {
    try {
      await pb.send('/backend/v1/audit', {
        method: 'POST',
        body: JSON.stringify({
          action,
          resource: 'auth',
          status,
          email,
          user_id: pb.authStore.record?.id,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (e) {
      // ignore audit failures
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      await pb.collection('users').create({ email, password, passwordConfirm: password })
      await pb.collection('users').authWithPassword(email, password)
      await logAudit('signup', 'success', email)
      return { error: null }
    } catch (error) {
      await logAudit('signup', 'denied', email)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      if (authData.record.id) {
        try {
          await pb.collection('users').update(authData.record.id, {
            last_login: new Date().toISOString(),
          })
        } catch (e) {
          // ignore
        }
      }
      await logAudit('login', 'success', email)
      return { error: null }
    } catch (error) {
      await logAudit('login', 'denied', email)
      return { error }
    }
  }

  const signOut = async () => {
    await logAudit('logout', 'success')
    pb.authStore.clear()
  }

  return (
    <AuthContext.Provider
      value={{ user, permissions, hasPermission, signUp, signIn, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}
