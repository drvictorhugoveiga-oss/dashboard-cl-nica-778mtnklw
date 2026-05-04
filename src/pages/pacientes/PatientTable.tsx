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
import { Edit2, Eye, Trash2, UserX, Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

type Props = {
  patients: Patient[]
  loading: boolean
  onCreate: () => void
  onEdit: (p: Patient) => void
  onView: (p: Patient) => void
  onDelete: (p: Patient) => void
}

const statusMap = {
  active: { label: 'Ativo', variant: 'default' as const },
  inactive: { label: 'Inativo', variant: 'destructive' as const },
  paused: { label: 'Pausado', variant: 'secondary' as const },
}

export function PatientTable({ patients, loading, onCreate, onEdit, onView, onDelete }: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
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
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((p) => {
            const statusInfo = statusMap[p.status]
            return (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.email || '-'}</TableCell>
                <TableCell>{p.phone || '-'}</TableCell>
                <TableCell>{p.expand?.plan_id?.name || '-'}</TableCell>
                <TableCell>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </TableCell>
                <TableCell>
                  {p.contract_end ? new Date(p.contract_end).toLocaleDateString('pt-BR') : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(p)}
                      title="Ver Detalhes"
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(p)} title="Editar">
                      <Edit2 className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(p)}
                      title="Deletar"
                      className="text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
