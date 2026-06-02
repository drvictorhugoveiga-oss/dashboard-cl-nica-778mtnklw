import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ShieldPlus,
  Users,
  Bell,
  Settings,
  HeartPulse,
  LogOut,
  UserRound,
  FileText,
  PieChart,
  CircleDollarSign,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Pacientes', href: '/pacientes', icon: UserRound },
  { name: 'Planos', href: '/planos', icon: ShieldPlus },
  { name: 'Profissionais', href: '/profissionais', icon: Users },
  { name: 'Notas Clínicas', href: '/notas-clinicas', icon: FileText },
  { name: 'Lembretes', href: '/lembretes', icon: Bell },
  { name: 'Finanças', href: '/financas', icon: CircleDollarSign },
  { name: 'Relatórios Financeiros', href: '/relatorios-financeiros', icon: PieChart },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()
  const { usuario, logout, temPermissao } = useAuth()

  const permissionsMap: Record<string, { resource: string; action: string }> = {
    Dashboard: { resource: 'dashboard', action: 'view' },
    Pacientes: { resource: 'patients', action: 'manage' },
    Planos: { resource: 'plans', action: 'edit' },
    Profissionais: { resource: 'professionals', action: 'view' },
    'Notas Clínicas': { resource: 'patients', action: 'manage' },
    Lembretes: { resource: 'reminders', action: 'manage' },
    Finanças: { resource: 'finance', action: 'view' },
    'Relatórios Financeiros': { resource: 'financial_reports', action: 'view' },
    Configurações: { resource: 'settings', action: 'access' },
  }

  const filteredNav = navigation.filter((item) => {
    const req = permissionsMap[item.name]
    return req ? temPermissao(req.resource, req.action) : true
  })

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4 bg-sidebar">
        <div className="flex items-center gap-3">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <HeartPulse className="size-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Clínica Viva</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.name}
                  className={
                    isActive
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                      : ''
                  }
                >
                  <Link to={item.href} className="flex items-center gap-3">
                    <item.icon className="size-4" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4 bg-sidebar">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-medium uppercase shrink-0">
            {usuario?.name?.[0] || usuario?.email?.[0] || 'U'}
          </div>
          <div className="flex flex-col flex-1 truncate mr-2">
            <span className="text-sm font-medium leading-none truncate">
              {usuario?.name || usuario?.email?.split('@')[0] || 'Usuário'}
            </span>
            <span className="text-xs text-sidebar-foreground/60 mt-1 truncate">
              {usuario?.email}
            </span>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-sidebar-accent rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors shrink-0"
            title="Sair"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
