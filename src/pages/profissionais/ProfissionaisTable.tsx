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
import { Edit2, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Card } from '@/components/ui/card'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface Props {
  data: any[]
  onEdit: (item: any) => void
  onDelete: (id: string) => void
  selectedProfId?: string
  onSelectProf?: (id: string) => void
}

export function ProfissionaisTable({
  data,
  onEdit,
  onDelete,
  selectedProfId,
  onSelectProf,
}: Props) {
  const isMobile = useIsMobile()

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-success text-success-foreground hover:bg-success/90">Ativo</Badge>
    ) : (
      <Badge variant="secondary">Inativo</Badge>
    )
  }

  const getSpecialtyBadge = (spec: string) => {
    return (
      <Badge variant="outline" className="capitalize">
        {spec}
      </Badge>
    )
  }

  const Actions = ({ item }: { item: any }) => (
    <div className="flex gap-1 justify-end">
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation()
          onEdit(item)
        }}
        className="text-primary hover:text-primary/80 hover:bg-primary/10 size-8"
      >
        <Edit2 className="size-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 size-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="size-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja deletar este profissional?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso removerá permanentemente o profissional do
              sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation()
                onDelete(item.id)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )

  if (isMobile) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {data.map((item) => (
          <Card
            key={item.id}
            className={cn(
              'p-4 cursor-pointer transition-all border shadow-subtle hover:shadow-elevation',
              item.id === selectedProfId ? 'bg-blue-50/50 border-blue-200' : 'bg-card',
            )}
            onClick={() => onSelectProf?.(item.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <div className="mt-1">{getSpecialtyBadge(item.specialty)}</div>
              </div>
              {getStatusBadge(item.status)}
            </div>
            <div className="text-sm text-muted-foreground space-y-1 mb-4">
              <p>{item.email}</p>
              <p>{item.phone}</p>
              {item.pix_key && <p>Pix: {item.pix_key}</p>}
            </div>
            <Actions item={item} />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card overflow-x-auto shadow-subtle">
      <Table className="min-w-[600px]">
        <TableHeader className="bg-slate-50/80">
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Especialidade</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Chave Pix</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              className={cn(
                'transition-all hover:shadow-subtle cursor-pointer',
                item.id === selectedProfId
                  ? 'bg-blue-50 hover:bg-blue-50/80'
                  : 'even:bg-slate-50/40 hover:bg-slate-50',
              )}
              onClick={() => onSelectProf?.(item.id)}
            >
              <TableCell className="font-medium whitespace-nowrap">{item.name}</TableCell>
              <TableCell>{getSpecialtyBadge(item.specialty)}</TableCell>
              <TableCell className="whitespace-nowrap">{item.email}</TableCell>
              <TableCell className="whitespace-nowrap">{item.phone}</TableCell>
              <TableCell className="whitespace-nowrap">{item.pix_key || '-'}</TableCell>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
              <TableCell className="text-right">
                <Actions item={item} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
