import { Outlet, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationDropdown } from './NotificationDropdown'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'

export default function Layout() {
  const { usuario, user } = useAuth()
  const currentUser = usuario || user
  const location = useLocation()

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Resumo Financeiro'
      case '/planos':
        return 'Gestão de Planos'
      case '/profissionais':
        return 'Profissionais Clínicos'
      case '/lembretes':
        return 'Central de Lembretes'
      case '/configuracoes':
        return 'Configurações do Sistema'
      default:
        return 'Dashboard'
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-card px-4 md:px-8 shadow-sm">
          <SidebarTrigger className="-ml-2" />
          <div className="flex flex-1 items-center">
            <h1 className="text-xl font-bold tracking-tight text-foreground">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <Button variant="ghost" size="icon" className="rounded-full ml-2 relative" asChild>
              <Avatar className="size-8 cursor-pointer border border-border/50">
                <AvatarImage
                  src={currentUser?.avatar ? pb.files.getURL(currentUser, currentUser.avatar) : ''}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
          <div className="mx-auto w-full max-w-7xl flex flex-col gap-6">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
