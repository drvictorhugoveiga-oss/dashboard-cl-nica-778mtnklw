import { useState } from 'react'
import { ProfissionaisList } from './profissionais/ProfissionaisList'
import { CustosList } from './profissionais/CustosList'

export default function Profissionais() {
  const [selectedProfId, setSelectedProfId] = useState<string>('')

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profissionais e Custos</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie a equipe clínica e defina os custos de atendimento por plano.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Profissionais</h2>
          <ProfissionaisList selectedProfId={selectedProfId} onSelectProf={setSelectedProfId} />
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Custos por Plano</h2>
          <CustosList selectedProfId={selectedProfId} onSelectProf={setSelectedProfId} />
        </div>
      </div>
    </div>
  )
}
