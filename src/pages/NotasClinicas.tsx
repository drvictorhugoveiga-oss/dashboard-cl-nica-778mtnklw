import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { FileText, Plus, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

import {
  getPatientNotes,
  getPatientsForSelector,
  getProfessionalsForSelector,
} from '@/services/patient_notes'
import { PatientSelector } from '@/components/notas-clinicas/PatientSelector'
import { NoteList } from '@/components/notas-clinicas/NoteList'
import { NoteFormDialog } from '@/components/notas-clinicas/NoteFormDialog'
import { NoteViewDialog } from '@/components/notas-clinicas/NoteViewDialog'
import { NoteDeleteDialog } from '@/components/notas-clinicas/NoteDeleteDialog'

export default function NotasClinicas() {
  const [patients, setPatients] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { toast } = useToast()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const [pts, profs] = await Promise.all([
          getPatientsForSelector(),
          getProfessionalsForSelector(),
        ])
        setPatients(pts)
        setProfessionals(profs)
      } catch (err) {
        toast({ title: 'Erro ao carregar dados iniciais', variant: 'destructive' })
      }
    }
    init()
  }, [toast])

  const loadNotes = async (patientId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const records = await getPatientNotes(patientId)
      setNotes(records)
    } catch (err) {
      setError('Erro ao carregar as notas. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedPatientId) loadNotes(selectedPatientId)
    else setNotes([])
  }, [selectedPatientId])

  useRealtime(
    'patient_notes',
    () => {
      if (selectedPatientId) loadNotes(selectedPatientId)
    },
    !!selectedPatientId,
  )

  const selectedPatientName = patients.find((p) => p.id === selectedPatientId)?.name || ''

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Notas Clínicas</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <PatientSelector
            patients={patients}
            selectedId={selectedPatientId}
            onSelect={setSelectedPatientId}
          />
          {selectedPatientId && (
            <Button
              onClick={() => {
                setSelectedNote(null)
                setIsFormOpen(true)
              }}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" /> Nova Nota
            </Button>
          )}
        </div>
      </div>

      {!selectedPatientId ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/30">
          <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-medium text-foreground">Selecione um Paciente</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Busque e selecione um paciente acima para visualizar ou adicionar notas clínicas.
          </p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 w-full animate-pulse bg-muted rounded-md" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-destructive/5">
          <AlertCircle className="h-10 w-10 text-destructive mb-4" />
          <p className="text-destructive font-medium mb-4">{error}</p>
          <Button variant="outline" onClick={() => loadNotes(selectedPatientId)}>
            Tentar novamente
          </Button>
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/30">
          <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium text-foreground">Nenhuma nota cadastrada</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-md mx-auto">
            Este paciente ainda não possui nenhuma observação clínica registrada.
          </p>
          <Button
            onClick={() => {
              setSelectedNote(null)
              setIsFormOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Nova Nota
          </Button>
        </div>
      ) : (
        <NoteList
          notes={notes}
          onEdit={(n: any) => {
            setSelectedNote(n)
            setIsFormOpen(true)
          }}
          onView={(n: any) => {
            setSelectedNote(n)
            setIsViewOpen(true)
          }}
          onDelete={(n: any) => {
            setSelectedNote(n)
            setIsDeleteOpen(true)
          }}
        />
      )}

      <NoteFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        note={selectedNote}
        patientId={selectedPatientId}
        patientName={selectedPatientName}
        professionals={professionals}
        onSuccess={() => loadNotes(selectedPatientId)}
      />
      <NoteViewDialog open={isViewOpen} onOpenChange={setIsViewOpen} note={selectedNote} />
      <NoteDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        note={selectedNote}
        onSuccess={() => loadNotes(selectedPatientId)}
      />
    </div>
  )
}
