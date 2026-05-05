import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

interface Usuario {
  id: string
  email: string
  role_id: string
  name?: string
}

interface AuthContextType {
  usuario: Usuario | null
  carregando: boolean
  erro: string | null
  temPermissao: (resource: string, action: string) => boolean
  login: (email: string, password: string) => Promise<{ error: any }>
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
      const token = localStorage.getItem('auth_token')
      const userId = localStorage.getItem('user_id')
      const roleId = localStorage.getItem('user_role')

      if (token && pb.authStore.isValid) {
        setUsuario({
          id: pb.authStore.record?.id || userId || '',
          email: pb.authStore.record?.email || '',
          role_id: pb.authStore.record?.role_id || roleId || '',
          name: pb.authStore.record?.name || '',
        })
        if (pb.authStore.record?.role_id) {
          await loadPermissions(pb.authStore.record.role_id)
        }
      }
      setCarregando(false)
    }
    init()

    const unsubscribe = pb.authStore.onChange((_token, record) => {
      if (record) {
        setUsuario({
          id: record.id,
          email: record.email,
          role_id: record.role_id,
          name: record.name,
        })
        if (record.role_id) {
          loadPermissions(record.role_id)
        }
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

    // Admin tem todas as permissões
    const isAdmin = permissions.some(
      (p) => p.expand?.role_id?.name === 'admin' || p.expand?.permission_id?.name === 'admin',
    )
    if (isAdmin) return true

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
      localStorage.setItem('user_id', res.user_id)
      localStorage.setItem('user_role', res.role_id)
      if (res.refresh_token) {
        localStorage.setItem('refresh_token', res.refresh_token)
      }

      pb.authStore.save(res.token, res.record || { id: res.user_id, email, role_id: res.role_id })

      setCarregando(false)
      return { error: null }
    } catch (error: any) {
      setCarregando(false)
      const msg = error.response?.erro || 'Email ou senha incorretos'
      setErro(msg)
      return { error: msg }
    }
  }

  const logout = async () => {
    try {
      if (pb.authStore.isValid) {
        await pb.send('/backend/v1/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, erro, temPermissao, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
