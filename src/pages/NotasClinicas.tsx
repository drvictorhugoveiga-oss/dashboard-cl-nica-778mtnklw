import { useState, useEffect, useMemo } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { FileText, Plus, AlertCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import pb from '@/lib/pocketbase/client'
import {
  getAllPatientNotes,
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
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { toast } = useToast()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<any>(null)

  const loadInitialData = async () => {
    if (!pb.authStore.isValid) return
    try {
      const [pts, profs] = await Promise.all([
        getPatientsForSelector(),
        getProfessionalsForSelector(),
      ])
      setPatients(pts)
      setProfessionals(profs)
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        toast({
          title: 'Erro de comunicação - Usuário não autenticado',
          variant: 'destructive',
          duration: 3000,
        })
      } else {
        toast({ title: 'Erro ao carregar dados iniciais', variant: 'destructive', duration: 3000 })
      }
    }
  }

  const loadNotes = async () => {
    if (!pb.authStore.isValid) {
      setError('Erro de comunicação - Usuário não autenticado')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const records = await getAllPatientNotes()
      setNotes(records)
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        setError('Erro de comunicação - Usuário não autenticado')
      } else {
        setError('Erro ao carregar as notas. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInitialData()
    loadNotes()
  }, [toast])

  useRealtime('patient_notes', () => {
    loadNotes()
  })

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      let match = true
      if (selectedPatientId) {
        match = match && n.patient_id === selectedPatientId
      }
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase()
        const contentMatch = n.content?.toLowerCase().includes(lowerSearch)
        const patientMatch = n.expand?.patient_id?.name?.toLowerCase().includes(lowerSearch)
        match = match && (contentMatch || patientMatch)
      }
      return match
    })
  }, [notes, selectedPatientId, searchTerm])

  const selectedPatientName = patients.find((p) => p.id === selectedPatientId)?.name || ''

  const showEmptyState = !selectedPatientId && !searchTerm

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl animate-in fade-in duration-200 ease-out">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground whitespace-nowrap">
          Notas Clínicas
        </h1>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar notas ou paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white border-gray-200 rounded-lg shadow-sm"
            />
          </div>

          <PatientSelector
            patients={patients}
            selectedId={selectedPatientId}
            onSelect={setSelectedPatientId}
          />

          <Button
            onClick={() => {
              setSelectedNote(null)
              setIsFormOpen(true)
            }}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-subtle transition-all duration-200 ease-out rounded-lg whitespace-nowrap"
          >
            <Plus className="mr-2 h-4 w-4" /> Nova Nota
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 w-full bg-gray-100 rounded-lg border border-gray-200"
              style={{ animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-8 border border-destructive/20 rounded-lg bg-destructive/5 shadow-subtle transition-all duration-200 ease-out">
          <AlertCircle className="h-10 w-10 text-destructive mb-4" />
          <p className="text-destructive font-medium mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={loadNotes}
            className="rounded-lg transition-colors duration-200"
          >
            Tentar novamente
          </Button>
        </div>
      ) : showEmptyState ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-gray-200 rounded-lg bg-white shadow-subtle transition-all duration-200 ease-out">
          <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold text-foreground">Selecione um Paciente ou Busque</h3>
          <p className="text-base text-muted-foreground mt-2 max-w-sm">
            Busque por palavras-chave, nome do paciente ou selecione um paciente acima para
            visualizar as notas.
          </p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-gray-200 rounded-lg bg-white shadow-subtle transition-all duration-200 ease-out">
          <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-bold text-foreground">Nenhuma nota encontrada</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-md mx-auto">
            {searchTerm
              ? 'Nenhum resultado corresponde à sua busca.'
              : 'Este paciente ainda não possui nenhuma observação clínica registrada.'}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => {
                setSelectedNote(null)
                setIsFormOpen(true)
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors duration-200 ease-out shadow-subtle"
            >
              <Plus className="mr-2 h-4 w-4" /> Nova Nota
            </Button>
          )}
        </div>
      ) : (
        <NoteList
          notes={filteredNotes}
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
        patientId={selectedNote ? selectedNote.patient_id : selectedPatientId}
        patients={patients}
        professionals={professionals}
        onSuccess={() => loadNotes()}
      />
      <NoteViewDialog open={isViewOpen} onOpenChange={setIsViewOpen} note={selectedNote} />
      <NoteDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        note={selectedNote}
        onSuccess={() => loadNotes()}
      />
    </div>
  )
}
