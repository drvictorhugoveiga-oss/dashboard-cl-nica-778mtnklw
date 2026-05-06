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

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('auth_token') || pb.authStore.token
      const refreshToken = localStorage.getItem('refresh_token')

      if (token) {
        try {
          const res = await pb.send('/backend/v1/auth/refresh-token', {
            method: 'POST',
            body: JSON.stringify({ refresh_token: refreshToken || token }),
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          })

          if (res.token) {
            localStorage.setItem('auth_token', res.token)
            if (res.refresh_token) localStorage.setItem('refresh_token', res.refresh_token)
            localStorage.setItem('user_id', res.user_id || res.record?.id)
            localStorage.setItem('user_role', res.role_id || res.record?.role_id)
            pb.authStore.save(res.token, res.record || { id: res.user_id, role_id: res.role_id })
          }

          const currentUser = res.record || pb.authStore.record
          const finalRoleId = currentUser?.role_id || res.role_id || ''

          let roleName = ''
          if (finalRoleId) {
            try {
              const roleRecord = await pb.collection('roles').getOne(finalRoleId)
              roleName = roleRecord.name
            } catch (e) {
              console.error('Falha ao carregar role', e)
            }
            await loadPermissions(finalRoleId)
          }

          setUsuario({
            id: currentUser?.id || res.user_id || '',
            email: currentUser?.email || '',
            role_id: finalRoleId,
            role_name: roleName,
            role: currentUser?.role || '',
            name: currentUser?.name || '',
          })
        } catch (e) {
          if (e instanceof ClientResponseError && e.status === 401) {
            console.warn('Sessão expirada. Limpando credenciais de acesso.')
          } else {
            console.error('Falha ao validar ou renovar token', e)
          }
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user_id')
          localStorage.removeItem('user_role')
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

    const unsubscribe = pb.authStore.onChange(async (_token, record) => {
      if (record) {
        let roleName = ''
        if (record.role_id) {
          try {
            const roleRecord = await pb.collection('roles').getOne(record.role_id)
            roleName = roleRecord.name
          } catch {
            /* intentionally ignored */
          }
          loadPermissions(record.role_id)
        }

        setUsuario({
          id: record.id,
          email: record.email,
          role_id: record.role_id,
          role_name: roleName,
          role: record.role || '',
          name: record.name,
        })
      } else {
        setUsuario(null)
        setPermissions([])
      }
    })

    return () => {
      unsubscribe()
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
      if (resource === 'settings') return false
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

      const res = await pb.send('/backend/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
      })

      localStorage.setItem('auth_token', res.token)
      localStorage.setItem('user_id', res.user_id || res.record?.id)
      localStorage.setItem('user_role', res.role_id || res.record?.role_id)
      if (res.refresh_token) {
        localStorage.setItem('refresh_token', res.refresh_token)
      }

      pb.authStore.save(res.token, res.record || { id: res.user_id, email, role_id: res.role_id })

      try {
        await pb.collection('audit_log').create({
          user_id: res.user_id || res.record?.id,
          action: 'login',
          status: 'success',
          resource: 'auth',
        })
      } catch (e) {
        console.error('Falha ao registrar log de auditoria', e)
      }

      const currentUser = res.record || pb.authStore.record
      const finalRoleId = currentUser?.role_id || res.role_id || ''

      let roleName = ''
      if (finalRoleId) {
        try {
          const roleRecord = await pb.collection('roles').getOne(finalRoleId)
          roleName = roleRecord.name
        } catch (e) {
          console.error('Falha ao carregar role no login', e)
        }
        await loadPermissions(finalRoleId)
      }

      setUsuario({
        id: currentUser?.id || res.user_id || '',
        email: currentUser?.email || email || '',
        role_id: finalRoleId,
        role_name: roleName,
        role: currentUser?.role || '',
        name: currentUser?.name || '',
      })

      setCarregando(false)
      return { error: null }
    } catch (error: unknown) {
      setCarregando(false)
      let msg = getErrorMessage(error)
      if (!msg || msg === 'An unexpected error occurred.') {
        msg = 'Email ou senha incorretos'
      }

      if (error instanceof ClientResponseError && error.response?.erro) {
        msg = error.response.erro
      } else if (error instanceof ClientResponseError && error.response?.message) {
        msg = error.response.message
      }

      setErro(msg)
      return { error: msg }
    }
  }

  const logout = async () => {
    try {
      if (pb.authStore.isValid || localStorage.getItem('auth_token')) {
        await pb.send('/backend/v1/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token') || pb.authStore.token}`,
          },
        })
      }
    } catch {
      /* intentionally ignored */
    }
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_role')
    localStorage.removeItem('refresh_token')
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
