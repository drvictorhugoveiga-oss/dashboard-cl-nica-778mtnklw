import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import { ClientResponseError } from 'pocketbase'
import { getErrorMessage } from '@/lib/pocketbase/errors'

interface Usuario {
  id: string
  email: string
  role_id: string
  role_name?: string
  role?: string
  name?: string
}

interface AuthContextType {
  usuario: Usuario | null
  carregando: boolean
  erro: string | null
  temPermissao: (resource: string, action: string) => boolean
  login: (email: string, password: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<any[]>([])

  const loadPermissions = async (roleId: string) => {
    if (!roleId) return
    try {
      const perms = await pb.collection('role_permissions').getFullList({
        filter: `role_id = '${roleId}'`,
        expand: 'permission_id,role_id',
      })
      setPermissions(perms)
    } catch (e) {
      console.error('Falha ao carregar permissões', e)
      setPermissions([])
    }
  }

  const loadRoleAndPermissions = async (record: any) => {
    let roleName = ''
    if (record?.role_id) {
      try {
        const roleRecord = await pb.collection('roles').getOne(record.role_id)
        roleName = roleRecord.name
      } catch (e) {
        console.error('Falha ao carregar role', e)
      }
      await loadPermissions(record.role_id)
    }
    return roleName
  }

  useEffect(() => {
    const init = async () => {
      if (pb.authStore.isValid) {
        try {
          const authData = await pb.collection('users').authRefresh()
          const record = authData.record
          const roleName = await loadRoleAndPermissions(record)

          setUsuario({
            id: record.id,
            email: record.email,
            role_id: record.role_id || '',
            role_name: roleName,
            role: record.role || '',
            name: record.name || '',
          })
        } catch (e) {
          console.warn('Sessão expirada. Limpando credenciais.', e)
          pb.authStore.clear()
          setUsuario(null)
          setPermissions([])
        }
      } else {
        pb.authStore.clear()
        setUsuario(null)
        setPermissions([])
      }
      setCarregando(false)
    }

    init()

    // Silent Token Refresh periodically (every 15 minutes)
    const refreshTokenInterval = setInterval(
      async () => {
        if (pb.authStore.isValid) {
          try {
            await pb.collection('users').authRefresh()
          } catch (e) {
            console.warn('Falha no refresh silencioso', e)
          }
        }
      },
      15 * 60 * 1000,
    )

    const unsubscribe = pb.authStore.onChange(async (_token, record) => {
      if (record) {
        const roleName = await loadRoleAndPermissions(record)

        setUsuario({
          id: record.id,
          email: record.email,
          role_id: record.role_id || '',
          role_name: roleName,
          role: record.role || '',
          name: record.name || '',
        })
      } else {
        setUsuario(null)
        setPermissions([])
      }
    })

    const handleAuthError = () => {
      pb.authStore.clear()
      setUsuario(null)
      setPermissions([])
      window.location.href = '/login'
    }

    window.addEventListener('pb-auth-error', handleAuthError)

    return () => {
      window.removeEventListener('pb-auth-error', handleAuthError)
      unsubscribe()
      clearInterval(refreshTokenInterval)
    }
  }, [])

  const temPermissao = (resource: string, action: string) => {
    if (!usuario) return false

    if (usuario.role === 'admin' || usuario.role_name === 'admin') return true

    const isAdmin = permissions.some(
      (p) => p.expand?.role_id?.name === 'admin' || p.expand?.permission_id?.name === 'admin',
    )
    if (isAdmin) return true

    if (usuario.role === 'staff' || usuario.role_name === 'staff') {
      if (
        resource === 'plans' ||
        resource === 'professionals' ||
        resource === 'financial_reports'
      ) {
        return false
      }
      return true
    }

    return permissions.some((p) => {
      const perm = p.expand?.permission_id
      if (!perm) return false
      return (
        (perm.resource === resource && perm.action === action) ||
        perm.name === `${action}_${resource}`
      )
    })
  }

  const login = async (email: string, password: string) => {
    try {
      setCarregando(true)
      setErro(null)

      const authData = await pb.collection('users').authWithPassword(email, password)
      const record = authData.record
      const currentUserId = record.id

      if (currentUserId) {
        pb.collection('audit_log')
          .create({
            user_id: currentUserId,
            action: 'login',
            status: 'success',
            resource: 'auth',
          })
          .catch((e) => console.error('Falha ao registrar log de auditoria', e))
      }

      const roleName = await loadRoleAndPermissions(record)

      setUsuario({
        id: currentUserId,
        email: record.email,
        role_id: record.role_id || '',
        role_name: roleName,
        role: record.role || '',
        name: record.name || '',
      })

      setCarregando(false)
      return { error: null }
    } catch (error: unknown) {
      setCarregando(false)
      let msg = getErrorMessage(error)

      if (!msg || msg === 'An unexpected error occurred.') {
        msg = 'Email ou senha incorretos'
      }

      if (error instanceof ClientResponseError && error.status === 400) {
        msg = 'Credenciais inválidas. Tente novamente.'
      }

      setErro(msg)
      return { error: msg }
    }
  }

  const logout = async () => {
    try {
      if (pb.authStore.isValid) {
        const currentUserId = pb.authStore.record?.id
        if (currentUserId) {
          pb.collection('audit_log')
            .create({
              user_id: currentUserId,
              action: 'logout',
              status: 'success',
              resource: 'auth',
            })
            .catch(() => {})
        }
        await pb.send('/backend/v1/auth/logout', { method: 'POST' }).catch(() => {})
      }
    } catch {
      /* ignored */
    }
    pb.authStore.clear()
    setUsuario(null)
    setPermissions([])
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, erro, temPermissao, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
