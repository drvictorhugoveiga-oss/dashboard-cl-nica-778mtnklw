import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ShieldPlus,
  Users,
  Bell,
  Settings,
  HeartPulse,
  LogOut,
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
  { name: 'Planos', href: '/planos', icon: ShieldPlus },
  { name: 'Profissionais', href: '/profissionais', icon: Users },
  { name: 'Lembretes', href: '/lembretes', icon: Bell },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()
  const { user, signOut } = useAuth()

  const filteredNav = navigation.filter(
    (item) => item.name !== 'Configurações' || user?.role === 'admin',
  )

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
            {user?.name?.[0] || user?.email?.[0] || 'U'}
          </div>
          <div className="flex flex-col flex-1 truncate mr-2">
            <span className="text-sm font-medium leading-none truncate">
              {user?.name || 'Usuário'}
            </span>
            <span className="text-xs text-sidebar-foreground/60 mt-1 truncate">{user?.email}</span>
          </div>
          <button
            onClick={signOut}
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
