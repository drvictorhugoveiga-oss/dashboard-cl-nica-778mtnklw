import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfissionaisList } from './profissionais/ProfissionaisList'
import { CustosList } from './profissionais/CustosList'

export default function Profissionais() {
  const [activeTab, setActiveTab] = useState('profissionais')

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profissionais e Custos</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie a equipe clínica e defina os custos de atendimento por plano.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profissionais">Profissionais</TabsTrigger>
          <TabsTrigger value="custos">Custos por Plano</TabsTrigger>
        </TabsList>
        <TabsContent value="profissionais" className="mt-0 outline-none">
          <ProfissionaisList />
        </TabsContent>
        <TabsContent value="custos" className="mt-0 outline-none">
          <CustosList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
