import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Planos from './pages/Planos'
import Profissionais from './pages/Profissionais'
import Pacientes from './pages/Pacientes'
import Lembretes from './pages/Lembretes'
import NotasClinicas from './pages/NotasClinicas'
import Configuracoes from './pages/Configuracoes'
import { RelatoriosFinanceiros } from './pages/relatorios-financeiros/RelatoriosFinanceiros'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import Login from './pages/Login'
import { AuthProvider } from './hooks/use-auth'
import { ProtectedRoute } from './components/ProtectedRoute'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/planos" element={<Planos />} />
              <Route path="/pacientes" element={<Pacientes />} />
              <Route path="/profissionais" element={<Profissionais />} />
              <Route path="/lembretes" element={<Lembretes />} />
              <Route path="/notas-clinicas" element={<NotasClinicas />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/relatorios-financeiros" element={<RelatoriosFinanceiros />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
