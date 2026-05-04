import { Outlet, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Layout() {
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
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell className="size-5" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-muted border ml-2">
              <User className="size-5" />
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
