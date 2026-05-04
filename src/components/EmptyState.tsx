import { FileQuestion } from 'lucide-react'

interface Props {
  title?: string
  description?: string
}

export function EmptyState({
  title = 'Nenhum dado encontrado',
  description = 'Ainda não há informações para exibir nesta seção.',
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
      <div className="flex size-20 items-center justify-center rounded-full bg-muted/50 mb-5">
        <FileQuestion className="size-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">{description}</p>
    </div>
  )
}
