import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RevenueList } from './RevenueList'
import { OperationalCostsList } from '../configuracoes/OperationalCostsList'
import { CustosList } from '../profissionais/CustosList'
import { Card, CardContent } from '@/components/ui/card'

export default function FinancasPage() {
  const { usuario } = useAuth()
  const isAdmin = usuario?.role === 'admin'
  const [selectedProfId, setSelectedProfId] = useState<string>('')

  if (usuario && usuario.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finanças</h1>
        <p className="text-muted-foreground mt-1">
          Gestão centralizada de ganhos e custos da clínica.
        </p>
      </div>

      <Tabs defaultValue="ganhos" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto overflow-y-hidden hide-scrollbar">
          <TabsTrigger
            value="ganhos"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Ganhos
          </TabsTrigger>
          <TabsTrigger
            value="custos-operacionais"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Custos Operacionais
          </TabsTrigger>
          <TabsTrigger
            value="custos-profissionais"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Custos de Profissionais
          </TabsTrigger>
        </TabsList>

        <div className="pt-6">
          <TabsContent value="ganhos" className="m-0 focus-visible:outline-none">
            <RevenueList isAdmin={isAdmin} />
          </TabsContent>
          <TabsContent value="custos-operacionais" className="m-0 focus-visible:outline-none">
            <OperationalCostsList isAdmin={isAdmin} />
          </TabsContent>
          <TabsContent
            value="custos-profissionais"
            className="m-0 focus-visible:outline-none space-y-4"
          >
            <Card className="bg-primary/5 shadow-none border-dashed mb-4 max-w-lg">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-1 text-primary">Custos de Profissionais</h3>
                <p className="text-xs text-muted-foreground">
                  Selecione o profissional abaixo para visualizar e editar os custos mensais e por
                  sessão associados a cada plano.
                </p>
              </CardContent>
            </Card>
            <CustosList selectedProfId={selectedProfId} onSelectProf={setSelectedProfId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
