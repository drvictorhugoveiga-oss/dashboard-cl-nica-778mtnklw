import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ShieldPlus, Users, Bell, Settings, HeartPulse } from 'lucide-react'
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
          {navigation.map((item) => {
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
          <div className="size-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-medium">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">Admin User</span>
            <span className="text-xs text-sidebar-foreground/60 mt-1">admin@clinicaviva.com</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
