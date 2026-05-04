import { Patient } from '@/services/patients'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit2, Eye, Trash2, UserX, Plus, Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

type Props = {
  patients: Patient[]
  loading: boolean
  onCreate: () => void
  onEdit: (p: Patient) => void
  onView: (p: Patient) => void
  onDelete: (p: Patient) => void
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-success text-success-foreground border-success hover:bg-success/90">
          Ativo
        </Badge>
      )
    case 'inactive':
      return (
        <Badge className="bg-muted text-muted-foreground border-muted-foreground/20 hover:bg-muted">
          Inativo
        </Badge>
      )
    case 'paused':
      return (
        <Badge className="bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600">
          Pausado
        </Badge>
      )
    default:
      return <Badge>Desconhecido</Badge>
  }
}

export function PatientTable({ patients, loading, onCreate, onEdit, onView, onDelete }: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-[8px]" />
        ))}
      </div>
    )
  }

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card">
        <UserX className="size-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Nenhum paciente cadastrado</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Ajuste os filtros ou adicione um novo paciente.
        </p>
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" /> Novo Paciente
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Mobile Card Layout (<480px) */}
      <div className="grid min-[480px]:hidden gap-4">
        {patients.map((p) => (
          <div
            key={p.id}
            className="bg-card rounded-[8px] p-4 border border-border shadow-subtle flex flex-col gap-3"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-base">{p.name}</h3>
              {getStatusBadge(p.status)}
            </div>

            <div className="text-sm text-muted-foreground flex flex-col gap-1">
              <div>
                <span className="font-medium text-foreground">Email:</span> {p.email || '-'}
              </div>
              <div>
                <span className="font-medium text-foreground">Tel:</span> {p.phone || '-'}
              </div>
              <div>
                <span className="font-medium text-foreground">Plano:</span>{' '}
                {p.expand?.plan_id?.name || '-'}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="size-3" />
                <span className="font-medium text-foreground">Vencimento:</span>
                {p.contract_end
                  ? new Date(p.contract_end).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                  : '-'}
              </div>
            </div>

            <div className="h-px bg-border w-full my-1"></div>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => onView(p)}
              >
                <Eye className="size-4 mr-1" /> Detalhes
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => onEdit(p)}
              >
                <Edit2 className="size-4 mr-1" /> Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(p)}
              >
                <Trash2 className="size-4 mr-1" /> Deletar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop/Tablet Table Layout (>=480px) */}
      <div className="hidden min-[480px]:block rounded-[8px] border border-border bg-card overflow-hidden shadow-subtle">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-muted/50 border-b-border">
              <TableHead className="font-semibold">Nome</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Telefone</TableHead>
              <TableHead className="font-semibold">Plano</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Vencimento</TableHead>
              <TableHead className="text-right font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((p) => (
              <TableRow
                key={p.id}
                className="even:bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer border-b-border"
                onClick={() => onView(p)}
              >
                <TableCell className="font-medium text-left">{p.name}</TableCell>
                <TableCell className="text-left">{p.email || '-'}</TableCell>
                <TableCell className="text-left">{p.phone || '-'}</TableCell>
                <TableCell className="text-left">{p.expand?.plan_id?.name || '-'}</TableCell>
                <TableCell className="text-left">{getStatusBadge(p.status)}</TableCell>
                <TableCell className="text-left">
                  {p.contract_end
                    ? new Date(p.contract_end).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                    : '-'}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => onView(p)}
                      title="Ver Detalhes"
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => onEdit(p)}
                      title="Editar"
                    >
                      <Edit2 className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(p)}
                      title="Deletar"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
